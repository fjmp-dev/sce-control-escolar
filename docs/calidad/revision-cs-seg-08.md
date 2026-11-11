# Revisión manual de CS-SEG-08 — SCE

**Caso (Tabla 49):** no existen secretos en el repositorio, en los registros ni en las respuestas de la API. **Herramienta:** Gitleaks y revisión manual.
**Versión 2:** FJMP con asistente de IA, 11 de noviembre de 2026, sub-batch 12.2. Amplía la v1 a pagos, trámites y reportes, al portal, a staging y a los artefactos de CI, y busca datos personales además de secretos. **Versión 1:** 6 de noviembre de 2026, Batch 2.
**Quien produce no acepta:** la revisión de Seguridad queda pendiente abajo. SJOM no participa desde el 10 de noviembre de 2026 y FJMP produce y acepta (NC-012).

## 1. Qué se buscó

En registros y artefactos se buscaron dos familias de patrones. Sobre los registros, la búsqueda se hizo con `grep -E` después de toda la verificación local de 12.2.

| Familia | Patrón |
|---|---|
| Secretos | La contraseña de la semilla y la de la cuenta desechable de ZAP; tokens JWT (`eyJ…`); hashes bcrypt (`$2a$`, `$2b$`, `$2y$`); cadenas de conexión (`postgres://`, `postgresql://`) |
| Datos personales | Correos (`@sce.test`); nombres de la semilla (`Sintétic`); matrículas (`24` y cinco dígitos); folios de trámite, que llevan la matrícula (`TRA-<matrícula>-…`); y los campos `correo`, `nombre`, `matricula`, `contrasena`, `token`, `importe` y `motivo` |

La verificación local de 12.2 corrió contra un ambiente propio de Compose con la semilla sintética. Incluyó Playwright con los proyectos de la Tabla 50, ZAP sobre la API con los siete roles, ZAP de acceso cruzado y ZAP completo sobre el portal con cada rol.

## 2. Resultado por superficie

| Superficie | Qué se revisó | Cómo | Resultado |
|---|---|---|---|
| Repositorio | Todas las ramas y todo el historial | `scripts/gitleaks-historial.sh`, en cada corrida de CI | Sin coincidencias, salvo las dos excepciones de `.gitleaksignore`, justificadas en `plan-de-pruebas.md`, 4.2 |
| Repositorio | Contraseñas y secretos en archivos versionados | `git grep -nIE 'password\|secret\|sce-dev-2026\|JWT_SECRET'` | Solo valores sintéticos: `sce-dev-2026` (seed, README, `ACCESO-Y-AUDITORIA.txt`, CI y scripts), secreto de `docker-compose.yml` para el ambiente local, y `.env.example` como plantilla. La contraseña de la cuenta desechable de ZAP vive solo en `scripts/zap.sh` y vale para una cuenta de Compose |
| Registros de la API | Texto completo tras Playwright y los escaneos de ZAP: 70292 líneas, 70175 de ellas del registro de peticiones | Los patrones del apartado 1; `scripts/zap.sh` repite los de secretos en cada corrida de CI | **Cero coincidencias.** Fuera del arranque, cada línea es método, plantilla de ruta, estado, duración, id de usuario y código. Como se registra la plantilla (`/alumnos/:matricula`), ni la matrícula ni el folio llegan al registro. No hubo ningún error 5xx, así que tampoco pilas |
| Registros del portal | Salida del contenedor de Next.js: 6475 líneas tras los mismos escaneos, de los tres contenedores del portal que hubo en la verificación. **Cierra la acción 14 del documento de seguridad** | Los patrones del apartado 1 | **Cero coincidencias.** Solo hay errores de Next.js con marcos de pila de los paquetes compilados: el método `TRACE`, que Next.js no admite y responde con 500 sin eco; las acciones de servidor inexistentes o malformadas que mandó ZAP; el origen ajeno que rechazó la prueba anti-CSRF; y, antes de la corrección de `informe-zap.md` (regla 30002), los rechazos de la API que el portal no manejaba, que registran el nombre del campo, no su valor. Next.js copia en el mensaje los valores de las cabeceras `Origin` y `x-forwarded-host`: son nombres de host, no datos personales. El portal no registra peticiones, cookies ni respuestas de la API |
| Respuestas de la API | Hash, versión de sesión y trazas, ahora también en pagos, trámites y reportes | `usuarios.spec.ts`; Newman con esquemas cerrados (`additionalProperties: false`), también en la carpeta Pagos, trámites y reportes; ZAP, regla 90022 "Application Error Disclosure", en los nueve escaneos de la API y en los del portal | No aparecen |
| Respuestas de la API | Datos de un alumno entregados a otro | CS-SEG-03 con Supertest y con ZAP (`zap-acceso-cruzado.sh`): 1345 peticiones del alumno B sobre 17 operaciones con identificadores de A | Ningún 2xx. El reporte de dirección no lleva matrículas ni nombres (`reportes.spec.ts`) |
| Bitácora | Valor anterior | `usuarios.spec.ts`; `api/prisma/verificacion/muestreo-bitacora.sql` | Usuarios: id, correo, estado y roles. Cargos y becas: el saldo. Pagos: estado y saldo. Trámites: estado. La entidad de un cargo o una beca es `cuenta:<matrícula>`: identifica al alumno, que es lo que la bitácora debe hacer. El cambio de contraseña no guarda valores |
| Staging | Secretos del ambiente y registro del despliegue | Lectura de `scripts/staging.sh`, `scripts/verificar-staging.sh` y `staging.yml` | Las claves de la base, la firma de tokens y la contraseña de la semilla se generan en cada corrida, la contraseña va enmascarada en el registro de Actions, y todo muere con la corrida (CC-018). La base solo contiene datos sintéticos: `sin-datos-reales.sql` lo comprueba |
| Artefactos de CI | Lo que se publica en Actions y lo que se copió a `docs/evidencias/` | Los patrones del apartado 1 sobre los reportes de ZAP de 12.2 y sobre los nueve `.zip` de `docs/evidencias/fase-4/reportes/` | ZAP: cero tokens y cero contraseñas. Los scripts no usan `-d`, que imprimiría el token. Newman: hallazgo H-1, abajo |

## 3. Hallazgos

**H-1. El reporte JSON de Newman lleva credenciales de la semilla.** `newman.json` guarda cada petición con sus cabeceras y su cuerpo, así que lleva el token de cada rol y la contraseña de `POST /sesiones`. Aparece en tres lugares, y el repositorio es público:
- en el artefacto `newman` de la etapa 4;
- en el artefacto `despliegue-staging-<etiqueta>`;
- en `docs/evidencias/fase-4/reportes/newman.zip`, con 7 tokens y 11 líneas con la contraseña.

**Riesgo hoy: ninguno.**
- En CI, los tokens están firmados con el secreto público de `docker-compose.yml` y ya vencieron (duran 60 minutos).
- La contraseña es la sintética que publica el README.
- En staging, la contraseña y el secreto de firma son de la corrida y mueren con ella.

**Decisión:** se acepta para Compose y staging. La evidencia de `docs/evidencias/` no se modifica (regla del repositorio de evidencias).

**Acción para el piloto (Batch 13):** Newman y Playwright no publicarán peticiones con credenciales reales. Contra el piloto, Newman corre sin el reporte JSON o lo publica sin cabeceras ni cuerpos, y Playwright corre sin trazas.

**H-2. Trazas de Playwright.** En una prueba fallida, Playwright guarda la traza, y la traza incluye la cookie `sce_sesion`. Es el mismo caso que H-1, con la misma decisión y la misma acción para el piloto: token sintético, vencido y firmado con un secreto del ambiente.

**Corregido en la v1:** el seed imprimía la contraseña sintética al arrancar. Hoy imprime "Seed listo. Las cuentas sinteticas estan en el README.".

## 4. Límites

- Cubre Compose y staging, con datos sintéticos. El piloto, con datos y secretos reales, se revisa en el Batch 13.
- La revisión de registros es de una verificación local. En CI, `zap.sh` repite la búsqueda de secretos en cada corrida, pero no la de datos personales ni la del portal.
- No se revisaron los registros de nginx ni de PostgreSQL en staging.
  - pgAudit tiene `log_parameter = off`: registra sentencias sin los valores que Prisma pasa como parámetros.
  - nginx registra la ruta de cada página, y algunas llevan un identificador del alumno, como `/expedientes/<matrícula>` y `/mis-tramites/<folio>`.
  - Su retención se decide con D-18 (documento de seguridad, acción 6).

## Revisión de Seguridad

| Rol | Nombre | Resultado | Firma | Fecha |
|---|---|---|---|---|
| Seguridad | Samuel Jezoar Ortiz Martínez | | | |
| Seguridad, v2 (NC-012) | Francisco Javier Martínez Peñas | | | |
