# Matriz de rol por endpoint — SCE

**Fuente:** SCE-MC-001 v2.0, sección 18 y Tablas 5, 11, 12 y 38; CC-007. **Criterio de auditoría:** AU-15.
**Versión:** 1.0, 6 de noviembre de 2026 (Batch 2). Crece con cada batch.

Esta tabla es ejecutable: `api/test/integracion/roles.spec.ts` la lee y prueba **cada token contra cada endpoint** (CF-ROL-01, CI-AUTH-01). Otra prueba exige que sus filas sean exactamente las operaciones de `docs/api/openapi.json`, así que un endpoint nuevo no se integra sin decidir quién lo usa. Toda ruta sin rol declarado se deniega (14.1-7).

| Método | Ruta | Alumno | Profesor | Control escolar | Coordinación | Caja | Dirección | Administrador |
|---|---|---|---|---|---|---|---|---|
| GET | `/salud` | Público | Público | Público | Público | Público | Público | Público |
| POST | `/sesiones` | Público | Público | Público | Público | Público | Público | Público |
| GET | `/sesiones/actual` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/sesiones/actual/renovacion` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| DELETE | `/sesiones/actual` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| PUT | `/usuarios/actual/contrasena` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| GET | `/usuarios` | No | No | No | No | No | No | Sí |
| POST | `/usuarios` | No | No | No | No | No | No | Sí |
| PATCH | `/usuarios/{id}` | No | No | No | No | No | No | Sí |
| GET | `/facultades` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/facultades` | No | No | No | No | No | No | Sí |
| GET | `/planes` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/planes` | No | No | No | No | No | No | Sí |
| GET | `/materias` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/materias` | No | No | No | Sí | No | No | No |
| GET | `/periodos` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/periodos` | No | No | No | Sí | No | No | No |

## Decisiones

- **Los dos anónimos:** `POST /sesiones` porque es la autenticación misma; `GET /salud` porque lo sondea un monitor externo (Tabla 57) y no devuelve datos. Ninguno es una operación Must de negocio (Tabla 38).
- **El administrador no da de alta materias ni periodos:** son de coordinación (Tabla 5, Fig. 7). Mínimo privilegio (6.2-5).
- **Administrador y coordinación son roles separados:** una cuenta puede tener varios, pero las cuentas del seed tienen uno cada una.
