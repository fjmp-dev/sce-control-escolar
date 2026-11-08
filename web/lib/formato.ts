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

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const horarioLegible = (h: { dia: number; horaInicio: string; horaFin: string; aula: string }) =>
  `${DIAS[h.dia - 1]} de ${h.horaInicio} a ${h.horaFin}, aula ${h.aula}`;

const FECHA_Y_HORA = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Mexico_City',
});

/** Un momento, no un día: se muestra en la hora del centro de México. */
export const momentoLegible = (iso: string) => FECHA_Y_HORA.format(new Date(iso));
