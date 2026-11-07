import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  agregarPrerrequisito,
  altaUsuario,
  cambiarContrasena,
  cambiarUsuario,
  cerrarSesion,
  crearFacultad,
  crearMateria,
  crearPeriodo,
  crearPlan,
  iniciarSesion,
  quitarPrerrequisito,
} from '@/lib/acciones';

const m = vi.hoisted(() => ({ fijar: vi.fn(), borrar: vi.fn(), revalidar: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'tok' }), set: m.fijar, delete: m.borrar }),
}));
vi.mock('next/cache', () => ({ revalidatePath: m.revalidar }));
vi.mock('next/navigation', () => ({
  redirect: (destino: string) => {
    throw new Error(`REDIRECCION:${destino}`);
  },
}));

const formulario = (datos: Record<string, string | string[]>) => {
  const d = new FormData();
  for (const [campo, valor] of Object.entries(datos)) for (const v of [valor].flat()) d.append(campo, v);
  return d;
};
const responder = (estado: number, cuerpo?: unknown) => {
  const espia = vi.fn(
    async () => new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status: estado }),
  );
  vi.stubGlobal('fetch', espia);
  return espia;
};
const enviado = (espia: ReturnType<typeof responder>) => {
  const [url, opciones] = espia.mock.calls[0] as unknown as [string, RequestInit];
  return {
    ruta: url.replace('http://localhost:3001', ''),
    metodo: opciones.method,
    cuerpo: opciones.body && JSON.parse(opciones.body as string),
  };
};

beforeEach(() => vi.clearAllMocks());

describe('iniciarSesion', () => {
  it('guarda el token en cookie httpOnly y lleva al inicio', async () => {
    const espia = responder(201, { token: 'nuevo', expiraEn: '2030-01-01T00:00:00.000Z' });
    await expect(iniciarSesion({}, formulario({ correo: ' a@b.mx ', contrasena: ' con espacios ' }))).rejects.toThrow(
      'REDIRECCION:/',
    );
    expect(enviado(espia).cuerpo).toEqual({ correo: 'a@b.mx', contrasena: ' con espacios ' });
    expect(m.fijar).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'sce_sesion', value: 'nuevo', httpOnly: true }),
    );
  });

  it('credenciales invalidas: muestra el mensaje de la API y conserva el correo, nunca la contrasena', async () => {
    responder(401, { codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'Correo o contraseña incorrectos' });
    const estado = await iniciarSesion({}, formulario({ correo: 'a@b.mx', contrasena: 'mala' }));
    expect(estado).toEqual({ error: 'Correo o contraseña incorrectos', campos: [], valores: { correo: 'a@b.mx' } });
    expect(m.fijar).not.toHaveBeenCalled();
  });

  it('API caida: explica la causa y que hacer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const estado = await iniciarSesion({}, formulario({ correo: 'a@b.mx' }));
    expect(estado.error).toContain('No pudimos conectar');
  });
});

describe('cerrarSesion', () => {
  it('revoca en la API, borra la cookie y lleva a ingresar', async () => {
    const espia = responder(204);
    await expect(cerrarSesion()).rejects.toThrow('REDIRECCION:/ingresar');
    expect(enviado(espia)).toMatchObject({ ruta: '/sesiones/actual', metodo: 'DELETE' });
    expect(m.borrar).toHaveBeenCalledWith('sce_sesion');
  });

  it('si la API no contesta, la sesion de este navegador termina igual', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(cerrarSesion()).rejects.toThrow('REDIRECCION:/ingresar');
    expect(m.borrar).toHaveBeenCalledWith('sce_sesion');
  });
});

describe('cambiarContrasena', () => {
  it('al cambiarla termina la sesion y lo explica', async () => {
    const espia = responder(204);
    await expect(cambiarContrasena({}, formulario({ actual: 'a', nueva: 'b' }))).rejects.toThrow(
      'REDIRECCION:/ingresar?motivo=contrasena',
    );
    expect(enviado(espia).cuerpo).toEqual({ actual: 'a', nueva: 'b' });
    expect(m.borrar).toHaveBeenCalledWith('sce_sesion');
  });

  it('una politica incumplida se muestra y no toca la cookie', async () => {
    responder(400, { codigo: 'CONTRASENA_DEBIL', mensaje: 'Al menos 12 caracteres' });
    expect(await cambiarContrasena({}, formulario({ actual: 'a', nueva: 'b' }))).toEqual({
      error: 'Al menos 12 caracteres',
      campos: [],
      valores: undefined,
    });
    expect(m.borrar).not.toHaveBeenCalled();
  });
});

describe('altas de catalogos (contrato de la API)', () => {
  it.each([
    [
      'facultad',
      crearFacultad,
      { clave: 'F1', nombre: 'Uno' },
      { ruta: '/facultades', metodo: 'POST', cuerpo: { clave: 'F1', nombre: 'Uno' } },
      'Facultad F1 creada.',
    ],
    [
      'plan',
      crearPlan,
      { clave: 'P1', facultadClave: 'F1', creditosTotales: '300', vigenteDesde: '2030-01-01' },
      {
        ruta: '/planes',
        metodo: 'POST',
        cuerpo: { clave: 'P1', facultadClave: 'F1', creditosTotales: 300, vigenteDesde: '2030-01-01' },
      },
      'Plan P1 creado.',
    ],
    [
      'materia',
      crearMateria,
      { clave: 'M1', planClave: 'P1', nombre: 'Uno', creditos: '6' },
      { ruta: '/materias', metodo: 'POST', cuerpo: { clave: 'M1', planClave: 'P1', nombre: 'Uno', creditos: 6 } },
      'Materia M1 creada.',
    ],
    [
      'periodo',
      crearPeriodo,
      { clave: '2030A', fechaInicio: '2030-01-01', fechaFin: '2030-06-01', estado: 'abierto' },
      {
        ruta: '/periodos',
        metodo: 'POST',
        cuerpo: { clave: '2030A', fechaInicio: '2030-01-01', fechaFin: '2030-06-01', estado: 'abierto' },
      },
      'Periodo 2030A creado.',
    ],
    [
      'usuario',
      altaUsuario,
      { confirmacion: 'c', correo: 'a@b.mx', contrasena: 'x', roles: ['caja', 'profesor'] },
      {
        ruta: '/usuarios',
        metodo: 'POST',
        cuerpo: { confirmacion: 'c', correo: 'a@b.mx', contrasena: 'x', roles: ['caja', 'profesor'] },
      },
      'Usuario a@b.mx creado.',
    ],
    [
      'prerrequisito',
      agregarPrerrequisito,
      { materia: 'B', requiereClave: 'A', obligatorio: 'on' },
      { ruta: '/materias/B/prerrequisitos', metodo: 'POST', cuerpo: { requiereClave: 'A', obligatorio: true } },
      'B ahora requiere A.',
    ],
    [
      'baja de usuario',
      cambiarUsuario,
      { id: 'u1', confirmacion: 'c', roles: ['caja'] },
      { ruta: '/usuarios/u1', metodo: 'PATCH', cuerpo: { confirmacion: 'c', activo: false, roles: ['caja'] } },
      'Acceso actualizado.',
    ],
  ])('%s', async (_, accion, datos, esperado, mensaje) => {
    const espia = responder(201, {});
    const estado = await accion({}, formulario(datos));
    expect(enviado(espia)).toEqual(esperado);
    expect(estado).toEqual({ exito: mensaje });
    expect(m.revalidar).toHaveBeenCalledOnce();
  });

  it('marca los campos que la API rechazo y conserva lo escrito', async () => {
    responder(400, { codigo: 'ENTRADA_INVALIDA', mensaje: 'Revisa estos campos: clave.', campos: ['clave'] });
    expect(await crearFacultad({}, formulario({ clave: 'mal/clave', nombre: 'Uno' }))).toEqual({
      error: 'Revisa los campos marcados.',
      campos: ['clave'],
      valores: { clave: 'mal/clave', nombre: 'Uno' },
    });
    expect(m.revalidar).not.toHaveBeenCalled();
  });

  it('una sesion vencida lleva a ingresar', async () => {
    responder(401, { codigo: 'NO_AUTENTICADO', mensaje: 'x' });
    await expect(crearFacultad({}, formulario({ clave: 'A', nombre: 'B' }))).rejects.toThrow(
      'REDIRECCION:/ingresar?motivo=sesion',
    );
  });

  it('marca activo y escapa identificadores en la ruta', async () => {
    const espia = responder(200, {});
    await cambiarUsuario({}, formulario({ id: 'a/b', confirmacion: 'c', activo: 'on', roles: ['caja'] }));
    expect(enviado(espia)).toMatchObject({ ruta: '/usuarios/a%2Fb', cuerpo: { activo: true } });
  });
});

describe('quitarPrerrequisito', () => {
  it('toma materia y requisito de la opcion elegida', async () => {
    const espia = responder(204);
    expect(await quitarPrerrequisito({}, formulario({ prerrequisito: 'B|A' }))).toEqual({
      exito: 'B ya no requiere A.',
    });
    expect(enviado(espia)).toMatchObject({ ruta: '/materias/B/prerrequisitos/A', metodo: 'DELETE' });
  });

  it('sin opcion elegida marca el campo y no llama a la API', async () => {
    const espia = responder(204);
    expect(await quitarPrerrequisito({}, formulario({}))).toEqual({
      error: 'Revisa los campos marcados.',
      campos: ['prerrequisito'],
    });
    expect(espia).not.toHaveBeenCalled();
  });
});
