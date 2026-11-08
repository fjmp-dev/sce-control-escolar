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
