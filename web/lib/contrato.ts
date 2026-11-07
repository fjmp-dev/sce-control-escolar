import type { components } from './tipos-api';

/** Tipos del contrato, generados de docs/api/openapi.json: si la API cambia, el portal deja de compilar (Tabla 44). */
export type Esquemas = components['schemas'];
export type Rol = Esquemas['SesionRespuesta']['roles'][number];
