'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ErrorApi, llamar } from './api';
import type { Esquemas, Rol } from './contrato';
import { COOKIE_SESION, cookieDeSesion } from './cookie-sesion';
import type { EstadoDeFormulario } from './estado';

const texto = (datos: FormData, campo: string) => String(datos.get(campo) ?? '').trim();
const contrasena = (datos: FormData, campo: string) => String(datos.get(campo) ?? ''); // sin recortar
const roles = (datos: FormData) => datos.getAll('roles').map(String) as Rol[];

function aEstado(error: unknown, valores?: EstadoDeFormulario['valores']): EstadoDeFormulario {
  if (!(error instanceof ErrorApi)) {
    return { error: 'No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.', valores };
  }
  if (error.estado === 401 && error.codigo !== 'CREDENCIALES_INVALIDAS') redirect('/ingresar?motivo=sesion');
  const campos = error.campos;
  return { error: campos.length > 0 ? 'Revisa los campos marcados.' : error.message, campos, valores };
}

async function enviar(
  metodo: string,
  ruta: string,
  cuerpo: unknown,
  pagina: string,
  exito: string,
  valores?: EstadoDeFormulario['valores'],
): Promise<EstadoDeFormulario> {
  try {
    await llamar(metodo, ruta, cuerpo);
  } catch (error) {
    return aEstado(error, valores);
  }
  revalidatePath(pagina);
  return { exito };
}

export async function iniciarSesion(_: EstadoDeFormulario, datos: FormData): Promise<EstadoDeFormulario> {
  const correo = texto(datos, 'correo');
  const cuerpo: Esquemas['CredencialesDto'] = { correo, contrasena: contrasena(datos, 'contrasena') };
  try {
    const { token, expiraEn } = await llamar<Esquemas['TokenRespuesta']>('POST', '/sesiones', cuerpo);
    (await cookies()).set(cookieDeSesion(token, expiraEn));
  } catch (error) {
    return aEstado(error, { correo });
  }
  redirect('/');
}

export async function cerrarSesion(): Promise<void> {
  try {
    await llamar('DELETE', '/sesiones/actual');
  } catch {
    // Si la API no contesta o el token ya no vale, la sesión de este navegador termina igual.
  }
  (await cookies()).delete(COOKIE_SESION);
  redirect('/ingresar');
}

export async function cambiarContrasena(_: EstadoDeFormulario, datos: FormData): Promise<EstadoDeFormulario> {
  const cuerpo: Esquemas['CambioContrasenaDto'] = {
    actual: contrasena(datos, 'actual'),
    nueva: contrasena(datos, 'nueva'),
  };
  try {
    await llamar('PUT', '/usuarios/actual/contrasena', cuerpo);
  } catch (error) {
    return aEstado(error);
  }
  // La API revocó las sesiones de la cuenta (CC-010).
  (await cookies()).delete(COOKIE_SESION);
  redirect('/ingresar?motivo=contrasena');
}

export async function crearFacultad(_: EstadoDeFormulario, datos: FormData) {
  const cuerpo: Esquemas['FacultadDto'] = { clave: texto(datos, 'clave'), nombre: texto(datos, 'nombre') };
  return enviar('POST', '/facultades', cuerpo, '/facultades', `Facultad ${cuerpo.clave} creada.`, { ...cuerpo });
}

export async function crearPlan(_: EstadoDeFormulario, datos: FormData) {
  const valores = {
    clave: texto(datos, 'clave'),
    facultadClave: texto(datos, 'facultadClave'),
    creditosTotales: texto(datos, 'creditosTotales'),
    vigenteDesde: texto(datos, 'vigenteDesde'),
  };
  const cuerpo: Esquemas['PlanDto'] = { ...valores, creditosTotales: Number(valores.creditosTotales) };
  return enviar('POST', '/planes', cuerpo, '/planes', `Plan ${valores.clave} creado.`, valores);
}

export async function crearMateria(_: EstadoDeFormulario, datos: FormData) {
  const valores = {
    clave: texto(datos, 'clave'),
    planClave: texto(datos, 'planClave'),
    nombre: texto(datos, 'nombre'),
    creditos: texto(datos, 'creditos'),
  };
  const cuerpo: Esquemas['MateriaDto'] = { ...valores, creditos: Number(valores.creditos) };
  return enviar('POST', '/materias', cuerpo, '/materias', `Materia ${valores.clave} creada.`, valores);
}

export async function agregarPrerrequisito(_: EstadoDeFormulario, datos: FormData) {
  const materia = texto(datos, 'materia');
  const requiereClave = texto(datos, 'requiereClave');
  const cuerpo: Esquemas['PrerrequisitoDto'] = { requiereClave, obligatorio: datos.get('obligatorio') === 'on' };
  return enviar(
    'POST',
    `/materias/${encodeURIComponent(materia)}/prerrequisitos`,
    cuerpo,
    '/materias',
    `${materia} ahora requiere ${requiereClave}.`,
    { materia, requiereClave },
  );
}

export async function quitarPrerrequisito(_: EstadoDeFormulario, datos: FormData) {
  const [materia, requiere] = texto(datos, 'prerrequisito').split('|');
  if (!materia || !requiere) return { error: 'Revisa los campos marcados.', campos: ['prerrequisito'] };
  return enviar(
    'DELETE',
    `/materias/${encodeURIComponent(materia)}/prerrequisitos/${encodeURIComponent(requiere)}`,
    undefined,
    '/materias',
    `${materia} ya no requiere ${requiere}.`,
  );
}

export async function crearPeriodo(_: EstadoDeFormulario, datos: FormData) {
  const cuerpo: Esquemas['PeriodoDto'] = {
    clave: texto(datos, 'clave'),
    fechaInicio: texto(datos, 'fechaInicio'),
    fechaFin: texto(datos, 'fechaFin'),
    estado: texto(datos, 'estado') as Esquemas['PeriodoDto']['estado'],
  };
  return enviar('POST', '/periodos', cuerpo, '/periodos', `Periodo ${cuerpo.clave} creado.`, { ...cuerpo });
}

export async function altaUsuario(_: EstadoDeFormulario, datos: FormData) {
  const correo = texto(datos, 'correo');
  const elegidos = roles(datos);
  const cuerpo: Esquemas['AltaUsuarioDto'] = {
    confirmacion: contrasena(datos, 'confirmacion'),
    correo,
    contrasena: contrasena(datos, 'contrasena'),
    roles: elegidos,
  };
  return enviar('POST', '/usuarios', cuerpo, '/usuarios', `Usuario ${correo} creado.`, { correo, roles: elegidos });
}

export async function cambiarUsuario(_: EstadoDeFormulario, datos: FormData) {
  const id = texto(datos, 'id');
  const elegidos = roles(datos);
  const cuerpo: Esquemas['CambioUsuarioDto'] = {
    confirmacion: contrasena(datos, 'confirmacion'),
    activo: datos.get('activo') === 'on',
    roles: elegidos,
  };
  return enviar('PATCH', `/usuarios/${encodeURIComponent(id)}`, cuerpo, '/usuarios', 'Acceso actualizado.', {
    roles: elegidos,
  });
}
