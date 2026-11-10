'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ErrorApi, llamar } from './api';
import type { Esquemas, Rol } from './contrato';
import { COOKIE_SESION, cookieDeSesion } from './cookie-sesion';
import { type EstadoDeFormulario, SESIONES_DEL_FORMULARIO } from './estado';

// Un archivo enviado donde se espera texto cuenta como vacío.
function contrasena(datos: FormData, campo: string) {
  const valor = datos.get(campo);
  return typeof valor === 'string' ? valor : ''; // sin recortar: un espacio puede ser parte de la contraseña
}
const texto = (datos: FormData, campo: string) => contrasena(datos, campo).trim();
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

/** Fig. 7: el periodo se abre sin oferta; los grupos se definen y la oferta se publica en la página Oferta. */
export async function abrirPeriodo(_: EstadoDeFormulario, datos: FormData) {
  const cuerpo: Esquemas['PeriodoDto'] = {
    clave: texto(datos, 'clave'),
    fechaInicio: texto(datos, 'fechaInicio'),
    fechaFin: texto(datos, 'fechaFin'),
  };
  return enviar(
    'POST',
    '/periodos',
    cuerpo,
    '/periodos',
    `Periodo ${cuerpo.clave} abierto. Define sus grupos y publica la oferta en la página Oferta.`,
    { ...cuerpo },
  );
}

const CAMPOS_DE_SESION = ['dia', 'inicio', 'fin', 'aula'] as const;

export async function definirGrupo(_: EstadoDeFormulario, datos: FormData): Promise<EstadoDeFormulario> {
  const valores: Record<string, string> = Object.fromEntries(
    ['periodoClave', 'materiaClave', 'clave', 'profesor', 'cupo'].map((campo) => [campo, texto(datos, campo)]),
  );
  const llenas: number[] = [];
  const faltantes: string[] = [];
  for (let s = 1; s <= SESIONES_DEL_FORMULARIO; s += 1) {
    const campos = CAMPOS_DE_SESION.map((c) => `${c}${s}`);
    for (const campo of campos) valores[campo] = texto(datos, campo);
    if (s > 1 && campos.every((campo) => !valores[campo])) continue;
    llenas.push(s);
    faltantes.push(...campos.filter((campo) => !valores[campo]));
  }
  if (faltantes.length > 0) return { error: 'Revisa los campos marcados.', campos: faltantes, valores };
  const cuerpo: Esquemas['GrupoDto'] = {
    periodoClave: valores.periodoClave,
    materiaClave: valores.materiaClave,
    clave: valores.clave,
    profesor: valores.profesor,
    cupo: Number(valores.cupo),
    horarios: llenas.map((s) => ({
      dia: Number(valores[`dia${s}`]),
      horaInicio: valores[`inicio${s}`],
      horaFin: valores[`fin${s}`],
      aula: valores[`aula${s}`],
    })),
  };
  try {
    await llamar('POST', '/grupos', cuerpo);
  } catch (error) {
    const estado = aEstado(error, valores);
    // La API señala `horarios` completo: se marcan los campos de las sesiones enviadas.
    const campos = (estado.campos ?? []).flatMap((c) =>
      c === 'horarios' ? llenas.flatMap((s) => CAMPOS_DE_SESION.map((x) => `${x}${s}`)) : [c],
    );
    return { ...estado, campos };
  }
  revalidatePath('/oferta');
  return { exito: `Grupo ${cuerpo.clave} definido en ${cuerpo.periodoClave}.` };
}

export async function publicarOferta(_: EstadoDeFormulario, datos: FormData) {
  const clave = texto(datos, 'periodoClave');
  return enviar(
    'POST',
    `/periodos/${encodeURIComponent(clave)}/publicacion`,
    undefined,
    '/oferta',
    `Oferta de ${clave} publicada. Los alumnos ya la ven y pueden inscribirse.`,
  );
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

export async function altaExpediente(_: EstadoDeFormulario, datos: FormData) {
  const valores = {
    matricula: texto(datos, 'matricula'),
    nombre: texto(datos, 'nombre'),
    facultadClave: texto(datos, 'facultadClave'),
    fechaIngreso: texto(datos, 'fechaIngreso'),
    correo: texto(datos, 'correo'),
  };
  const { correo, ...resto } = valores;
  const cuerpo: Esquemas['AltaAlumnoDto'] = correo ? { ...resto, correo } : resto;
  return enviar('POST', '/alumnos', cuerpo, '/expedientes', `Expediente ${valores.matricula} creado.`, valores);
}

const rutaDeExpediente = (datos: FormData) => `/alumnos/${encodeURIComponent(texto(datos, 'matricula'))}`;
const paginaDeExpediente = (datos: FormData) => `/expedientes/${encodeURIComponent(texto(datos, 'matricula'))}`;

export async function cambiarPlantel(_: EstadoDeFormulario, datos: FormData) {
  const cuerpo: Esquemas['CambioDePlantelDto'] = { facultadClave: texto(datos, 'facultadClave') };
  return enviar(
    'PUT',
    `${rutaDeExpediente(datos)}/facultad`,
    cuerpo,
    paginaDeExpediente(datos),
    `Cambio de plantel a ${cuerpo.facultadClave} registrado.`,
  );
}

export async function cambiarEstatusDeExpediente(_: EstadoDeFormulario, datos: FormData) {
  const cuerpo: Esquemas['CambioDeEstatusDto'] = {
    estatus: texto(datos, 'estatus') as Esquemas['CambioDeEstatusDto']['estatus'],
  };
  return enviar('PUT', `${rutaDeExpediente(datos)}/estatus`, cuerpo, paginaDeExpediente(datos), 'Estatus actualizado.');
}

export async function vincularCuenta(_: EstadoDeFormulario, datos: FormData) {
  const correo = texto(datos, 'correo');
  const cuerpo: Esquemas['VinculoDeCuentaDto'] = { correo };
  return enviar(
    'PUT',
    `${rutaDeExpediente(datos)}/cuenta`,
    cuerpo,
    paginaDeExpediente(datos),
    `Cuenta ${correo} vinculada.`,
    { correo },
  );
}

async function revisarChoques(grupos: number[], valores: EstadoDeFormulario['valores']): Promise<EstadoDeFormulario> {
  if (grupos.length === 0) return { error: 'Revisa los campos marcados.', campos: ['grupos'], valores };
  try {
    const consulta = grupos.map((id) => `grupos=${encodeURIComponent(id)}`).join('&');
    const choques = await llamar<Esquemas['ChoqueRespuesta'][]>('GET', `/grupos/choques?${consulta}`);
    if (choques.length === 0) return { exito: 'Tu carga no tiene choques de horario. Ya puedes enviarla.', valores };
    const lista = choques.map((choque) => choque.descripcion).join('; ');
    return { aviso: `Tu carga tiene choques de horario: ${lista}. Si la envías así, se rechazará.`, valores };
  } catch (error) {
    return aEstado(error, valores);
  }
}

/**
 * RF-002 (Fig. 4 y 6). "Revisar choques" avisa antes de enviar (CF-HOR-01). Al enviar, un rechazo también queda
 * guardado en la API (CC-013), así que la página se vuelve a leer aunque la respuesta sea un error.
 */
export async function enviarCarga(_: EstadoDeFormulario, datos: FormData): Promise<EstadoDeFormulario> {
  const elegidos = datos.getAll('grupos').map(String);
  const grupos = elegidos.map(Number);
  const valores = { grupos: elegidos };
  if (datos.get('intencion') === 'revisar') return revisarChoques(grupos, valores);
  const folio = texto(datos, 'folio');
  try {
    if (folio) {
      const cuerpo: Esquemas['CargaDto'] = { grupos };
      await llamar('PUT', `/inscripciones/${encodeURIComponent(folio)}/grupos`, cuerpo);
    } else {
      const cuerpo: Esquemas['InscripcionDto'] = { periodoClave: texto(datos, 'periodoClave'), grupos };
      await llamar('POST', '/inscripciones', cuerpo);
    }
  } catch (error) {
    revalidatePath('/inscripcion');
    return aEstado(error, valores);
  }
  revalidatePath('/inscripcion');
  return {
    exito: folio ? 'Carga ajustada y validada de nuevo.' : 'Inscripción confirmada. Ya puedes imprimir tu comprobante.',
  };
}

/**
 * CC-019 y RF-005: el formulario desaparece cuando el periodo cambia de estado, así que el resultado lo muestra la
 * página: se vuelve a /periodos con lo que se hizo, y la página lo confirma solo si el periodo quedó en ese estado.
 */
async function cambiarCicloDelPeriodo(datos: FormData, hecho: 'inicio' | 'cierre'): Promise<EstadoDeFormulario> {
  const clave = texto(datos, 'periodoClave');
  try {
    await llamar('POST', `/periodos/${encodeURIComponent(clave)}/${hecho}`);
  } catch (error) {
    return aEstado(error);
  }
  revalidatePath('/periodos');
  redirect(`/periodos?hecho=${hecho}&periodo=${encodeURIComponent(clave)}`);
}

/** CC-019: termina la inscripción del periodo y empieza la captura de calificaciones. */
export async function iniciarCurso(_: EstadoDeFormulario, datos: FormData) {
  return cambiarCicloDelPeriodo(datos, 'inicio');
}

/** RF-005: cierre del periodo con recálculo del historial; si faltan parciales, la API dice cuáles (D-16). */
export async function cerrarPeriodo(_: EstadoDeFormulario, datos: FormData) {
  return cambiarCicloDelPeriodo(datos, 'cierre');
}

/** RF-004: un parcial de los alumnos del grupo. Las casillas vacías no se envían. */
export async function capturarParcial(_: EstadoDeFormulario, datos: FormData): Promise<EstadoDeFormulario> {
  const grupo = texto(datos, 'grupo');
  const parcial = Number(texto(datos, 'parcial'));
  const valores: Record<string, string> = {};
  const calificaciones: Esquemas['CapturaDto'][] = [];
  for (const [campo, valor] of datos.entries()) {
    if (!campo.startsWith('valor:') || typeof valor !== 'string' || valor.trim() === '') continue;
    valores[campo] = valor.trim();
    calificaciones.push({ folio: campo.slice('valor:'.length), valor: Number(valor.trim().replace(',', '.')) });
  }
  if (calificaciones.length === 0) {
    return { error: 'Escribe al menos una calificación antes de guardar.', valores };
  }
  const invalidas = calificaciones.filter((c) => !(c.valor >= 0 && c.valor <= 10)).map((c) => `valor:${c.folio}`);
  if (invalidas.length > 0) return { error: 'Revisa los campos marcados.', campos: invalidas, valores };
  const cuerpo: Esquemas['CapturaDeParcialDto'] = { parcial, calificaciones };
  return enviar(
    'PUT',
    `/grupos/${encodeURIComponent(grupo)}/calificaciones`,
    cuerpo,
    `/mis-grupos/${grupo}`,
    `Parcial ${parcial} guardado: ${calificaciones.length} ${calificaciones.length === 1 ? 'calificación' : 'calificaciones'}. Los alumnos ya pueden consultarlas.`,
    valores,
  );
}

/** D-17: corrección posterior al cierre, autorizada por coordinación, con motivo y evidencia. */
export async function corregirCalificacion(_: EstadoDeFormulario, datos: FormData) {
  const valores = {
    matricula: texto(datos, 'matricula'),
    calificacion: texto(datos, 'calificacion'),
    valor: texto(datos, 'valor'),
    motivo: texto(datos, 'motivo'),
    evidencia: texto(datos, 'evidencia'),
  };
  const cuerpo: Esquemas['CorreccionDto'] = {
    valor: Number(valores.valor.replace(',', '.')),
    motivo: valores.motivo,
    evidencia: valores.evidencia,
  };
  return enviar(
    'PUT',
    `/calificaciones/${encodeURIComponent(valores.calificacion)}/correccion`,
    cuerpo,
    '/correcciones',
    `Calificación corregida y el historial de ${valores.matricula} recalculado.`,
    valores,
  );
}
