# Revisión manual de CS-SEG-08 — SCE

**Caso (Tabla 49):** no existen secretos en el repositorio, en los registros ni en las respuestas de la API. **Herramienta:** Gitleaks y revisión manual.
**Primera pasada:** FJMP con asistente de IA, 6 de noviembre de 2026, Batch 2. **Quien produce no acepta:** la revisión de Seguridad (SJOM) queda pendiente abajo.

| Superficie | Qué se revisó | Cómo | Resultado |
|---|---|---|---|
| Repositorio | Todas las ramas y todo el historial | `scripts/gitleaks-historial.sh`, en cada corrida de CI | Sin coincidencias, salvo las dos excepciones de `.gitleaksignore`, justificadas en `plan-de-pruebas.md`, 4.2 |
| Repositorio | Contraseñas y secretos en archivos versionados | `git grep -nIE 'password\|secret\|sce-dev-2026\|JWT_SECRET'` | Solo valores sintéticos: `sce-dev-2026` (seed, README, CI y scripts), secreto de `docker-compose.yml` para el ambiente local, y `.env.example` como plantilla |
| Registros de la API | Texto completo tras Newman y ZAP | `scripts/zap.sh` busca contraseñas, tokens, hashes y cadenas de conexión en `registros-api.txt`, en cada corrida de CI | Sin coincidencias. **Hallazgo corregido en esta revisión:** el seed imprimía la contraseña sintética al arrancar |
| Registros de la API | Campos que se registran | Lectura de `peticiones.middleware.ts` y `errores.filter.ts`; `gateway.spec.ts` | Ni cuerpo, ni cabeceras, ni URL real. En un 5xx, solo nombre del error, código y marcos de pila, porque el mensaje de Prisma incluye valores |
| Respuestas de la API | Hash y versión de sesión | `usuarios.spec.ts`; la colección de Newman rechaza propiedades no declaradas (`additionalProperties: false`) | No aparecen |
| Respuestas de la API | Trazas ante errores | `gateway.spec.ts`; ZAP, regla 90022 "Application Error Disclosure" | No aparecen |
| Bitácora | Valor anterior | `usuarios.spec.ts`; `api/prisma/verificacion/muestreo-bitacora.sql` | Id, correo, estado y roles. El cambio de contraseña no guarda valores |

**Límites de esta revisión.** Cubre el ambiente Compose con datos sintéticos. Los secretos de staging y piloto (Tabla 38) se revisan en los batches 6 y 13. Se repite en el Batch 12 sobre todos los módulos.

## Revisión de Seguridad

| Rol | Nombre | Resultado | Firma | Fecha |
|---|---|---|---|---|
| Seguridad | Samuel Jezoar Ortiz Martínez | | | |
