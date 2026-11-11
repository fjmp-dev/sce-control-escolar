const FECHA = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' });

/** Las fechas del catálogo son días, sin hora: se muestran en UTC para que no se recorran un día. */
export const fechaLegible = (iso: string) => FECHA.format(new Date(iso));

export const ETIQUETA_ESTATUS: Record<string, string> = {
  activo: 'Activo',
  baja: 'Baja',
  egresado: 'Egresado',
};

export const ETIQUETA_ESTADO_PERIODO: Record<string, string> = {
  abierto: 'Abierto',
  en_curso: 'En curso',
  cerrado: 'Cerrado',
};

export const ETIQUETA_ESTADO_INSCRIPCION: Record<string, string> = {
  borrador: 'Borrador',
  en_validacion: 'En validación',
  rechazada: 'Rechazada',
  confirmada: 'Confirmada',
  ajustada: 'Ajustada',
  cerrada: 'Cerrada',
};

/** RNF-USU-001 y Fig. 6: cada motivo de rechazo tiene su propio estado y su corrección, sin diccionario técnico. */
export const RECHAZO: Record<string, { estado: string; correccion: string }> = {
  prerrequisito: {
    estado: 'Rechazada por prerrequisito faltante',
    correccion: 'Quita de tu carga la materia cuyo prerrequisito no has acreditado y vuelve a enviarla.',
  },
  adeudo: {
    estado: 'Rechazada por adeudo',
    correccion: 'Liquida tu adeudo en caja y vuelve a enviar tu carga.',
  },
  choque: {
    estado: 'Rechazada por choque de horario',
    correccion: 'Cambia uno de los grupos que se traslapan y vuelve a enviar tu carga.',
  },
  cupo: {
    estado: 'Rechazada por grupo sin cupo',
    correccion: 'Elige otro grupo de esa materia y vuelve a enviar tu carga.',
  },
};

export const estadoDeInscripcion = (estado: string, motivo: string | null) =>
  (motivo && RECHAZO[motivo]?.estado) ?? ETIQUETA_ESTADO_INSCRIPCION[estado] ?? estado;

/** `horario.dia` va de 1, lunes, a 6, sábado (Fig. 8). */
export const DIAS_DE_LA_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const horarioLegible = (h: { dia: number; horaInicio: string; horaFin: string; aula: string }) =>
  `${DIAS_DE_LA_SEMANA[h.dia - 1]} de ${h.horaInicio} a ${h.horaFin}, aula\u00a0${h.aula}`;

const FECHA_Y_HORA = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Mexico_City',
});

/** Un momento, no un día: se muestra en la hora del centro de México. «p.m.» no se separa de su hora. */
export const momentoLegible = (iso: string) =>
  FECHA_Y_HORA.format(new Date(iso)).replace(/\s(?=[ap]\.\s?m\.)/, '\u00a0');

const PESOS = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
export const pesos = (importe: number) => PESOS.format(importe);

/** La fecha de hoy en la Ciudad de México, como AAAA-MM-DD. */
export const hoyEnMexico = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date());

export const ETIQUETA_TIPO_TRAMITE: Record<string, string> = {
  constancia: 'Constancia de estudios',
  no_adeudo: 'Constancia de no adeudo',
  historial: 'Historial académico',
};

export const ETIQUETA_ESTADO_TRAMITE: Record<string, string> = {
  recibida: 'Recibida',
  en_proceso: 'En proceso',
  lista: 'Lista para descargar',
  entregada: 'Entregada',
  rechazada: 'Rechazada',
};

/** Fig. 6: el rechazo se muestra con su motivo. */
export const estadoDeTramite = (t: { estado: string; motivoRechazo?: string | null }) =>
  t.estado === 'rechazada' ? `Rechazada: ${t.motivoRechazo}` : (ETIQUETA_ESTADO_TRAMITE[t.estado] ?? t.estado);

export const ETIQUETA_ESTADO_PAGO: Record<string, string> = {
  pendiente: 'Pendiente',
  aplicado: 'Pagado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
};

export const ETIQUETA_MOVIMIENTO: Record<string, string> = {
  cargo: 'Cargo',
  abono: 'Pago',
  ajuste: 'Ajuste',
  beca: 'Beca',
};
