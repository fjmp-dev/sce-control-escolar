import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  agregarPrerrequisito,
  altaExpediente,
  cambiarEstatusDeExpediente,
  cambiarPlantel,
  vincularCuenta,
  altaUsuario,
  cambiarContrasena,
  cambiarUsuario,
  cerrarSesion,
  enviarCarga,
  crearFacultad,
  crearMateria,
  abrirPeriodo,
  capturarParcial,
  cerrarPeriodo,
  corregirCalificacion,
  iniciarCurso,
  definirGrupo,
  publicarOferta,
  crearPlan,
  iniciarSesion,
  quitarPrerrequisito,
  generarCargos,
  iniciarPago,
  emitirTramite,
  rechazarTramite,
  registrarBeca,
  simularPago,
  solicitarTramite,
  tomarTramite,
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
      abrirPeriodo,
      { clave: '2030A', fechaInicio: '2030-01-01', fechaFin: '2030-06-01' },
      {
        ruta: '/periodos',
        metodo: 'POST',
        cuerpo: { clave: '2030A', fechaInicio: '2030-01-01', fechaFin: '2030-06-01' },
      },
      'Periodo 2030A abierto. Define sus grupos y publica la oferta en la página Oferta.',
    ],
    [
      'correccion posterior al cierre',
      corregirCalificacion,
      { matricula: '2420001', calificacion: '7', valor: '9,5', motivo: 'Error de captura', evidencia: 'Oficio 1' },
      {
        ruta: '/calificaciones/7/correccion',
        metodo: 'PUT',
        cuerpo: { valor: 9.5, motivo: 'Error de captura', evidencia: 'Oficio 1' },
      },
      'Calificación corregida y el historial de 2420001 recalculado.',
    ],
    [
      'publicacion de la oferta',
      publicarOferta,
      { periodoClave: '2030A' },
      { ruta: '/periodos/2030A/publicacion', metodo: 'POST', cuerpo: undefined },
      'Oferta de 2030A publicada. Los alumnos ya la ven y pueden inscribirse.',
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

describe('entradas inesperadas', () => {
  it('un archivo enviado donde se espera texto cuenta como vacio', async () => {
    const espia = responder(400, { codigo: 'ENTRADA_INVALIDA', mensaje: 'x', campos: ['clave'] });
    const datos = formulario({ nombre: 'Uno' });
    datos.append('clave', new File(['contenido'], 'a.txt'));
    await crearFacultad({}, datos);
    expect(enviado(espia).cuerpo).toEqual({ clave: '', nombre: 'Uno' });
  });
});

describe('expediente (RF-001, contrato de la API)', () => {
  const ALTA = { matricula: '2420011', nombre: 'Ana', facultadClave: 'CUTG', fechaIngreso: '2025-08-04' };
  it.each([
    [
      'alta sin cuenta',
      altaExpediente,
      { ...ALTA, correo: '' },
      { ruta: '/alumnos', metodo: 'POST', cuerpo: ALTA },
      'Expediente 2420011 creado.',
    ],
    [
      'alta con cuenta',
      altaExpediente,
      { ...ALTA, correo: 'a@b.mx' },
      { ruta: '/alumnos', metodo: 'POST', cuerpo: { ...ALTA, correo: 'a@b.mx' } },
      'Expediente 2420011 creado.',
    ],
    [
      'cambio de plantel',
      cambiarPlantel,
      { matricula: '2420001', facultadClave: 'FSD' },
      { ruta: '/alumnos/2420001/facultad', metodo: 'PUT', cuerpo: { facultadClave: 'FSD' } },
      'Cambio de plantel a FSD registrado.',
    ],
    [
      'estatus',
      cambiarEstatusDeExpediente,
      { matricula: '2420001', estatus: 'egresado' },
      { ruta: '/alumnos/2420001/estatus', metodo: 'PUT', cuerpo: { estatus: 'egresado' } },
      'Estatus actualizado.',
    ],
    [
      'vinculo de cuenta',
      vincularCuenta,
      { matricula: '2420001', correo: 'a@b.mx' },
      { ruta: '/alumnos/2420001/cuenta', metodo: 'PUT', cuerpo: { correo: 'a@b.mx' } },
      'Cuenta a@b.mx vinculada.',
    ],
  ])('%s', async (_, accion, datos, esperado, mensaje) => {
    const espia = responder(200, {});
    expect(await accion({}, formulario(datos))).toEqual({ exito: mensaje });
    expect(enviado(espia)).toEqual(esperado);
    expect(m.revalidar).toHaveBeenCalledWith(esperado.ruta === '/alumnos' ? '/expedientes' : '/expedientes/2420001');
  });

  it('una regla de negocio rechazada se muestra con su causa', async () => {
    responder(409, { codigo: 'EXPEDIENTE_NO_ACTIVO', mensaje: 'Solo un alumno activo cambia de plantel.' });
    expect(await cambiarPlantel({}, formulario({ matricula: '2420001', facultadClave: 'FSD' }))).toEqual({
      error: 'Solo un alumno activo cambia de plantel.',
      campos: [],
      valores: undefined,
    });
  });
});

describe('enviarCarga (RF-002, contrato de la API)', () => {
  it('sin folio inscribe con el periodo y los grupos como numeros, y vuelve a leer la pagina', async () => {
    const espia = responder(201, { folio: 'INS-2027A-2420001' });
    const estado = await enviarCarga({}, formulario({ periodoClave: '2027A', grupos: ['2', '5'] }));
    expect(enviado(espia)).toEqual({
      ruta: '/inscripciones',
      metodo: 'POST',
      cuerpo: { periodoClave: '2027A', grupos: [2, 5] },
    });
    expect(estado.exito).toContain('Inscripción confirmada');
    expect(m.revalidar).toHaveBeenCalledWith('/inscripcion');
  });

  it('con folio ajusta la carga con PUT y escapa el folio', async () => {
    const espia = responder(200, {});
    const estado = await enviarCarga({}, formulario({ folio: 'INS 1', grupos: ['5'] }));
    expect(enviado(espia)).toEqual({ ruta: '/inscripciones/INS%201/grupos', metodo: 'PUT', cuerpo: { grupos: [5] } });
    expect(estado.exito).toContain('ajustada');
  });

  it('un rechazo muestra la causa de la API, conserva lo elegido y vuelve a leer la pagina (CC-013)', async () => {
    responder(409, {
      codigo: 'INSCRIPCION_RECHAZADA',
      mensaje: 'Tienes un adeudo vigente. Consulta tu estado de cuenta en caja.',
      folio: 'F',
      estado: 'rechazada',
      motivo: 'adeudo',
    });
    const estado = await enviarCarga({}, formulario({ periodoClave: '2027A', grupos: ['2'] }));
    expect(estado).toEqual({
      error: 'Tienes un adeudo vigente. Consulta tu estado de cuenta en caja.',
      campos: [],
      valores: { grupos: ['2'] },
    });
    expect(m.revalidar).toHaveBeenCalledWith('/inscripcion');
  });

  it('revisar choques no inscribe: consulta la revision y avisa con el detalle', async () => {
    const espia = responder(200, [
      { grupos: [2, 4], dia: 1, desde: '08:00', hasta: '09:00', descripcion: 'A y B se traslapan el lunes' },
    ]);
    const estado = await enviarCarga(
      {},
      formulario({ intencion: 'revisar', periodoClave: '2027A', grupos: ['2', '4'] }),
    );
    expect(enviado(espia)).toMatchObject({ ruta: '/grupos/choques?grupos=2&grupos=4', metodo: 'GET' });
    expect(estado.aviso).toBe(
      'Tu carga tiene choques de horario: A y B se traslapan el lunes. Si la envías así, se rechazará.',
    );
    expect(estado.valores).toEqual({ grupos: ['2', '4'] });
    expect(m.revalidar).not.toHaveBeenCalled();
  });

  it('revisar sin choques confirma que se puede enviar; sin grupos marca el campo y no llama a la API', async () => {
    responder(200, []);
    expect((await enviarCarga({}, formulario({ intencion: 'revisar', grupos: '7' }))).exito).toContain(
      'no tiene choques',
    );
    const espia = responder(200, []);
    expect(await enviarCarga({}, formulario({ intencion: 'revisar' }))).toMatchObject({ campos: ['grupos'] });
    expect(espia).not.toHaveBeenCalled();
  });

  it('si la API no contesta al revisar, lo explica', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('sin red'))),
    );
    expect((await enviarCarga({}, formulario({ intencion: 'revisar', grupos: '7' }))).error).toContain(
      'No pudimos conectar',
    );
  });
});

describe('definirGrupo (RF-003, contrato de la API)', () => {
  const grupo = {
    periodoClave: '2030A',
    materiaClave: 'ISW-101',
    clave: ' G-1 ',
    profesor: 'profesor@sce.test',
    cupo: '25',
    dia1: '1',
    inicio1: '07:00',
    fin1: '09:00',
    aula1: 'A1',
    dia2: '3',
    inicio2: '07:00',
    fin2: '09:00',
    aula2: 'A1',
  };

  it('envia las sesiones llenas, en numeros donde la API los pide, e ignora las vacias', async () => {
    const espia = responder(201, {});
    const estado = await definirGrupo({}, formulario({ ...grupo, dia3: '', inicio3: '', fin3: '', aula3: '' }));
    expect(enviado(espia)).toEqual({
      ruta: '/grupos',
      metodo: 'POST',
      cuerpo: {
        periodoClave: '2030A',
        materiaClave: 'ISW-101',
        clave: 'G-1',
        profesor: 'profesor@sce.test',
        cupo: 25,
        horarios: [
          { dia: 1, horaInicio: '07:00', horaFin: '09:00', aula: 'A1' },
          { dia: 3, horaInicio: '07:00', horaFin: '09:00', aula: 'A1' },
        ],
      },
    });
    expect(estado).toEqual({ exito: 'Grupo G-1 definido en 2030A.' });
    expect(m.revalidar).toHaveBeenCalledWith('/oferta');
  });

  it('una sesion a medias se marca sin llamar a la API; la primera siempre es obligatoria', async () => {
    const espia = responder(201, {});
    const estado = await definirGrupo({}, formulario({ ...grupo, dia1: '', aula2: '' }));
    expect(estado).toMatchObject({ error: 'Revisa los campos marcados.', campos: ['dia1', 'aula2'] });
    expect(estado.valores).toMatchObject({ clave: 'G-1', inicio1: '07:00' });
    expect(espia).not.toHaveBeenCalled();
  });

  it('si la API rechaza los horarios, marca los campos de las sesiones enviadas', async () => {
    responder(400, { codigo: 'ENTRADA_INVALIDA', mensaje: 'x', campos: ['horarios', 'cupo'] });
    const estado = await definirGrupo({}, formulario(grupo));
    expect(estado.campos).toEqual(['dia1', 'inicio1', 'fin1', 'aula1', 'dia2', 'inicio2', 'fin2', 'aula2', 'cupo']);
  });

  it('D-13: el traslape llega con su causa y su correccion, y se conserva lo escrito', async () => {
    const mensaje =
      'El aula A1 ya está ocupada el lunes de 07:00 a 09:00 por el grupo G-0. Elige otra aula u otro horario.';
    responder(409, { codigo: 'TRASLAPE_DE_AULA', mensaje });
    const estado = await definirGrupo({}, formulario(grupo));
    expect(estado).toMatchObject({ error: mensaje, campos: [] });
    expect(estado.valores).toMatchObject({ aula1: 'A1', profesor: 'profesor@sce.test' });
    expect(m.revalidar).not.toHaveBeenCalled();
  });
});

describe('capturarParcial (RF-004, contrato de la API)', () => {
  it('envia solo las casillas escritas, con el folio de cada alumno y el valor como numero', async () => {
    const espia = responder(200, {});
    const estado = await capturarParcial(
      {},
      formulario({ grupo: '12', parcial: '2', 'valor:INS-1': '8.5', 'valor:INS-2': '', 'valor:INS-3': ' 10 ' }),
    );
    expect(enviado(espia)).toEqual({
      ruta: '/grupos/12/calificaciones',
      metodo: 'PUT',
      cuerpo: {
        parcial: 2,
        calificaciones: [
          { folio: 'INS-1', valor: 8.5 },
          { folio: 'INS-3', valor: 10 },
        ],
      },
    });
    expect(estado).toEqual({ exito: 'Parcial 2 guardado: 2 calificaciones. Los alumnos ya pueden consultarlas.' });
    expect(m.revalidar).toHaveBeenCalledWith('/mis-grupos/12');
  });

  it('sin calificaciones no llama a la API; fuera de rango marca la casilla y conserva lo escrito', async () => {
    const espia = responder(200, {});
    expect((await capturarParcial({}, formulario({ grupo: '1', parcial: '1', 'valor:A': '' }))).error).toMatch(
      /al menos una calificación/,
    );
    const estado = await capturarParcial({}, formulario({ grupo: '1', parcial: '1', 'valor:A': '11', 'valor:B': '9' }));
    expect(estado).toEqual({
      error: 'Revisa los campos marcados.',
      campos: ['valor:A'],
      valores: { 'valor:A': '11', 'valor:B': '9' },
    });
    expect(espia).not.toHaveBeenCalled();
  });

  it('el rechazo de la API llega con su causa, como un grupo ajeno o la ventana cerrada', async () => {
    responder(409, { codigo: 'FUERA_DE_VENTANA', mensaje: 'El periodo 2026A ya cerró.' });
    expect(await capturarParcial({}, formulario({ grupo: '1', parcial: '1', 'valor:A': '9' }))).toMatchObject({
      error: 'El periodo 2026A ya cerró.',
      valores: { 'valor:A': '9' },
    });
  });
});

describe('iniciarCurso y cerrarPeriodo (CC-019, RF-005)', () => {
  it.each([
    ['inicio', iniciarCurso],
    ['cierre', cerrarPeriodo],
  ] as const)('%s: llama a la API y vuelve a Periodos con lo que se hizo', async (hecho, accion) => {
    const espia = responder(200, {});
    await expect(accion({}, formulario({ periodoClave: '2026B' }))).rejects.toThrow(
      `REDIRECCION:/periodos?hecho=${hecho}&periodo=2026B`,
    );
    expect(enviado(espia)).toEqual({ ruta: `/periodos/2026B/${hecho}`, metodo: 'POST', cuerpo: undefined });
    expect(m.revalidar).toHaveBeenCalledWith('/periodos');
  });

  it('D-16: el rechazo del cierre se queda en el formulario con su causa', async () => {
    responder(409, { codigo: 'CIERRE_INCOMPLETO', mensaje: 'No se puede cerrar 2026B: faltan calificaciones.' });
    expect(await cerrarPeriodo({}, formulario({ periodoClave: '2026B' }))).toEqual({
      error: 'No se puede cerrar 2026B: faltan calificaciones.',
      campos: [],
    });
    expect(m.revalidar).not.toHaveBeenCalled();
  });
});

describe('Pagos simulados y tramites (RF-006, RF-007)', () => {
  it('el pago se inicia con el importe como numero y lleva a la pasarela', async () => {
    const espia = responder(201, { id: 7 });
    await expect(iniciarPago({}, formulario({ importe: '1850,50' }))).rejects.toThrow('REDIRECCION:/mi-cuenta/pagos/7');
    expect(enviado(espia)).toEqual({ ruta: '/pagos', metodo: 'POST', cuerpo: { importe: 1850.5 } });
  });

  it('la pasarela aprueba con el boton principal y rechaza con el alterno', async () => {
    const espia = responder(200, {});
    await expect(simularPago({}, formulario({ id: '7' }))).rejects.toThrow('REDIRECCION:/mi-cuenta/pagos/7');
    await expect(simularPago({}, formulario({ id: '7', intencion: 'rechazado' }))).rejects.toThrow('REDIRECCION');
    const cuerpos = espia.mock.calls.map((c) => JSON.parse((c as unknown as [string, RequestInit])[1].body as string));
    expect(cuerpos).toEqual([{ resultado: 'aprobado' }, { resultado: 'rechazado' }]);
  });

  it('los cargos dicen cuantos son nuevos y cuantos ya existian', async () => {
    responder(200, { periodoClave: '2027A', concepto: 'Inscripción 2027A', generados: 3, yaExistian: 1 });
    const estado = await generarCargos(
      {},
      formulario({ periodoClave: '2027A', concepto: 'Inscripción 2027A', importe: '1850' }),
    );
    expect(estado.exito).toBe('Inscripción 2027A: cargos nuevos, 3; ya lo tenían, 1.');
  });

  it('si la API rechaza el pago o la pasarela, el error se queda en el formulario con lo escrito', async () => {
    responder(409, { codigo: 'SIN_ADEUDO', mensaje: 'No tienes adeudo.', campos: [] });
    expect(await iniciarPago({}, formulario({ importe: '10' }))).toMatchObject({
      error: 'No tienes adeudo.',
      valores: { importe: '10' },
    });
    responder(409, { codigo: 'PAGO_NO_APLICABLE', mensaje: 'Ya no se aplica.', campos: [] });
    expect((await simularPago({}, formulario({ id: '7' }))).error).toBe('Ya no se aplica.');
    responder(400, { codigo: 'DATOS_INVALIDOS', mensaje: 'x', campos: ['importe'] });
    expect(await generarCargos({}, formulario({ periodoClave: '2027A', concepto: 'C', importe: '-1' }))).toMatchObject({
      campos: ['importe'],
      valores: { importe: '-1' },
    });
  });

  it('beca y solicitud llegan a su ruta con el cuerpo del contrato', async () => {
    let espia = responder(201, {});
    expect(
      (await registrarBeca({}, formulario({ matricula: '2420002', concepto: 'Beca', importe: '500' }))).exito,
    ).toBe('Beca registrada a 2420002.');
    expect(enviado(espia)).toEqual({
      ruta: '/alumnos/2420002/becas',
      metodo: 'POST',
      cuerpo: { concepto: 'Beca', importe: 500 },
    });
    espia = responder(201, {});
    await solicitarTramite({}, formulario({ tipo: 'no_adeudo' }));
    expect(enviado(espia)).toEqual({ ruta: '/tramites', metodo: 'POST', cuerpo: { tipo: 'no_adeudo' } });
  });

  it('tomar y emitir llevan a la cola con el resultado para confirmarlo contra la API', async () => {
    const espia = responder(200, {});
    await expect(tomarTramite({}, formulario({ folio: 'TRA-1' }))).rejects.toThrow(
      'REDIRECCION:/tramites?hecho=proceso&folio=TRA-1',
    );
    await expect(emitirTramite({}, formulario({ folio: 'TRA-1' }))).rejects.toThrow('hecho=emision');
    expect(enviado(espia)).toMatchObject({ ruta: '/tramites/TRA-1/proceso', metodo: 'POST' });
  });

  it('el rechazo de un tramite fuera de lugar se queda en el formulario con su causa y el motivo escrito', async () => {
    responder(409, { codigo: 'TRAMITE_TRANSICION_INVALIDA', mensaje: 'Solo se rechaza en proceso.', campos: [] });
    const estado = await rechazarTramite({}, formulario({ folio: 'TRA-1', motivo: 'Faltan datos' }));
    expect(estado).toMatchObject({ error: 'Solo se rechaza en proceso.', valores: { motivo: 'Faltan datos' } });
  });
});
