# Documento de seguridad de datos personales — SCE

**Fuente:** SCE-MC-001 v2.0, sección 18 (Tablas 38 y 37) y sección 17; PA-SCE-001, Parte B (AU-18, AU-14, AU-17 y AU-37).
**Versión:** 1.0, 10 de noviembre de 2026 (sub-batch 12.6, issue #75). **Elaboró y aprobó:** FJMP como Seguridad y Product Owner (NC-012). No hay revisión independiente.

> **Alcance.** Es el documento de seguridad del SCE como sistema. El de la universidad, como responsable, lo emite ella. Todo dato del SCE es sintético (RK-09).

Sigue los apartados que la ley general pide al documento de seguridad: inventario, funciones, análisis de riesgos, análisis de brecha, plan de trabajo, monitoreo y revisión, y capacitación.

---

## 1. Inventario y sistemas de tratamiento

**Datos:** `inventario.md`, columna por columna, con categoría, finalidad, roles y copias.

**Sistemas:**

| Sistema | Qué guarda o por dónde pasa el dato | Ambiente | Referencia |
|---|---|---|---|
| Base PostgreSQL 16 | Las 21 entidades; las de datos personales están en el inventario | Todos | `api/prisma/schema.prisma` |
| API NestJS | Lee y escribe; autoriza por rol en cada petición | Todos | `matriz-rol-endpoint.md` |
| Portal Next.js | Muestra; guarda solo la cookie de sesión `httpOnly`; no recibe el token en el navegador | Todos | CC-014 |
| Registros JSON de la API | Id de la cuenta y plantilla de ruta, sin cuerpo | Todos | CS-SEG-08 |
| pgAudit | Tabla escrita y usuario de base, sin valores | Staging | CC-005, `db/pgaudit.sql` |
| Respaldos | Copia completa de la base, cifrada | Se construye en 13.2 | Tabla 56 |
| Evidencias de CI | Capturas, videos y reportes de Cypress, Newman, ZAP y axe | GitHub Actions, 90 días; `docs/evidencias/` | Solo datos sintéticos |

Los ambientes están en `docs/gobierno/inventario-de-ambientes.md`. El piloto con datos reales no se ejecuta (`plan-de-sistema.md`, 6.2).

---

## 2. Funciones y obligaciones

| Función | Obligaciones sobre datos personales | En este proyecto |
|---|---|---|
| Product Owner | Decide finalidades y conservación (D-18); decide si se notifica una vulneración (`respuesta-a-incidentes.md`, §4.1); acepta riesgos | FJMP |
| Seguridad | Mantiene este documento y el inventario; revisa accesos (`accesos.sql`) y muestrea la bitácora; extrae datos para solicitudes ARCO | FJMP |
| Desarrollo | Minimización en cada respuesta; matriz rol × endpoint al día; ningún dato personal en registros | FJMP, con asistente de IA declarado |
| DevOps | Secretos por ambiente; respaldos cifrados; acceso a la base restringido; datos sintéticos fuera del piloto | FJMP |
| Administrador del sistema | Altas, cambios de rol y bajas de cuentas, con bitácora | FJMP |
| QA | Verifica controles con los casos CS-SEG y las pruebas de la matriz | FJMP |
| Usuarios del SCE | No comparten su cuenta; no extraen datos fuera de su función; avisan de un incidente | Cuentas sintéticas |
| Unidad de Transparencia (universidad) | Recibe y responde solicitudes ARCO; emite el aviso; notifica vulneraciones con el Product Owner | No existe en el proyecto |

Una sola persona ocupa todas las funciones del equipo (NC-012). Lo que queda como control independiente es automático: CI, la matriz ejecutable, Gitleaks y Trivy.

---

## 3. Análisis de riesgos

**Valor de los datos.** Alto: el expediente sustenta constancias, certificados y la situación de pago de cada alumno. Un error o una fuga afecta derechos académicos y patrimoniales. No hay datos sensibles.

| Activo | Amenaza | Control actual | Riesgo que queda | RK |
|---|---|---|---|---|
| Expediente y calificaciones | Acceso cruzado entre roles o entre alumnos | Guard con denegación por omisión; matriz ejecutable; la matrícula del alumno sale de su sesión (CS-SEG-03) | ZAP no prueba acceso cruzado (12.2) | RK-03 |
| Expediente y calificaciones | Vulneración no detectada o no notificada | Procedimiento de incidentes con §4.1 y ensayo de mesa; bitácora inmutable | Los registros no dicen qué expediente se leyó, y nada alerta por volumen (hallazgos H-1 y H-2 del ensayo) | RK-11 |
| Todos | Tratamiento sin aviso emitido, sin ARCO o con ley mal identificada | Modelos de aviso y ARCO; inventario | El aviso no está emitido y la ley estatal no está cotejada | RK-12 |
| Expediente, bitácora y respaldos | Conservación sin plazo; cancelación imposible | Matriz de retención; D-18 propuesta | Nada se suprime; la bitácora es inmutable | RK-13 |
| Cuentas, sobre todo la del administrador | Toma de cuenta | bcrypt; contraseña de 12 caracteres con letras y números; bloqueo tras 5 fallos; sesión corta y confirmación de contraseña para el administrador; revocación | Sin segundo factor; la contraseña inicial la conoce el administrador; sin límite por origen hasta nginx (13) | RK-14 |
| Secretos | Exposición | Gitleaks, secret scanning, secretos por ambiente; staging sin secretos (CC-018) | El piloto sí los tendría | RK-07 |
| Datos reales | Uso fuera del piloto | Seed sintético; `sin-datos-reales.sql` en cada despliegue | — | RK-09 |
| Respaldos | Robo de la copia | Cifrado con age (13.2) | Hoy no hay respaldos | RK-11 |
| Base en reposo | Lectura del disco | Ninguno en el SCE; FileVault en el equipo (13.2) | Sin cifrado de la base (AU-17) | RK-11 |
| Reporte de dirección | Reidentificación en grupos pequeños | Solo agregados por facultad | Sin umbral mínimo (`inventario.md`, observación 2) | RK-12 |

Los niveles están en `docs/calidad/matriz-riesgos.md`, y las amenazas por componente en `docs/calidad/stride.md`.

---

## 4. Brecha contra la Tabla 38

| Control (Tabla 38) | Lo que hay | Brecha | Acción |
|---|---|---|---|
| Autenticación | Credenciales y JWT con expiración; solo `/salud` y `POST /sesiones` son anónimos | Contra la tabla, ninguna. Parte B: sin segundo factor para el administrador | Decisión abierta en `stride.md`; acción 9 |
| Autorización | Guard global por rol, con denegación por omisión; matriz ejecutable (CF-ROL-01) | Ninguna | — |
| Gestión de sesiones | Renovación controlada en el portal, cierre y revocación con `sesion_version` (CC-010) | Ninguna | — |
| Cifrado en tránsito | Staging con TLS 1.2 y 1.3 y HSTS; base por TLS verificado | Compose local sin HTTPS, con datos sintéticos. Certificado autofirmado en staging (CC-018) | Ninguna para esta versión |
| Protección en reposo | Secretos fuera del código; base restringida al servidor de aplicación en staging | Sin cifrado de la base ni de respaldos (AU-17). `sce_app` también migra | Acciones 3 y 4 |
| Bitácora | Autor, acción, valor anterior y fecha; inmutable; accesos fallidos | No registra lecturas. Retención sin decidir | Acciones 6 y 8 |
| Gestión de secretos | Secretos de GitHub y por ambiente; staging sin secretos | El piloto no existe | — |
| Vulnerabilidades | Lockfile, Trivy, `npm audit`, Gitleaks; registros sin datos sensibles | Ninguna | — |
| Datos personales | Minimización por rol; datos reales solo en piloto; visibilidad por rol | Faltaban aviso, ARCO, inventario y este documento: hoy existen como modelo. El aviso no está emitido | Acciones 1 y 2 |
| Respuesta a incidentes | Clasificación, contención, comunicación al PO y registro como NC | Faltaba la notificación de vulneraciones: hoy es la §4.1, ensayada en mesa. Falta el ensayo técnico en staging | Acción 10 |

`manual-v3.0.md` incorpora la fila "Datos personales" ampliada (apartado 5).

---

## 5. Plan de trabajo

| # | Acción | Responsable | Cuándo |
|---|---|---|---|
| 1 | Cotejar la ley estatal en la Gaceta y la LGPDPPSO de 2025; citar artículos en el aviso, ARCO y §4.1 | FJMP | Antes de firmar `manual-v3.0.md` |
| 2 | Emitir el aviso de privacidad | Universidad | Fuera del alcance |
| 3 | Respaldos cifrados con age y copia fuera del sitio | DevOps | 13.2 |
| 4 | Cifrado en reposo y claves (`cifrado-y-claves.md`) | DevOps | 13.2 |
| 5 | Ratificar D-18 y decidir la supresión por seudonimización (necesita CC) | Product Owner | Antes de 13.6 |
| 6 | Retención de registros JSON, pgAudit y bitácora | DevOps y Seguridad | 13.2, con D-18 |
| 7 | Rutas para rectificar nombre, fecha de ingreso y un cargo erróneo (`arco.md`, apartado 3) | Product Owner decide; necesita CC | Por decidir |
| 8 | Bitácora de lecturas del expediente, para acotar una vulneración (hallazgo H-1) | Seguridad decide | Por decidir |
| 9 | Segundo factor para el administrador y cambio obligatorio de la contraseña inicial | Seguridad decide; necesita CC | Por decidir |
| 10 | Ensayo técnico de contención y rotación de `JWT_SECRET` en staging, con acta | Seguridad | 13 |
| 11 | Límite de peticiones por origen en nginx | DevOps | 13 |
| 12 | Umbral mínimo de alumnos por fila en el reporte de dirección | Product Owner decide | Por decidir |
| 13 | Revisión del texto libre de `tramite.motivo_rechazo`: aviso al capturar que no lleve datos sensibles | Desarrollo | Por decidir |
| 14 | Revisar los registros del portal: los errores de Next.js van a la salida del contenedor y no se ha comprobado que no lleven datos | Seguridad | CS-SEG-08 v2 (12.2) |
| 15 | Alerta por un volumen anormal de consultas de expedientes de una sola cuenta (hallazgo H-2 del ensayo) | DevOps | Monitoreo del Batch 13 |

---

## 6. Monitoreo y revisión

- **Continuo, en CI:** la matriz rol × endpoint, CS-SEG-03, 06 y 08, Gitleaks y Trivy en cada pull request; `sin-datos-reales.sql` en cada despliegue a staging.
- **Por cierre de fase:** Seguridad revisa accesos (`accesos.sql`), muestrea la bitácora y revisa este documento, el inventario y la matriz de riesgos.
- **Por cambio:** un pull request que agregue una columna o una respuesta con datos personales actualiza el inventario y, si cambia una finalidad, el aviso.
- **Por incidente:** después de cada vulneración se revisa el análisis de riesgos y el plan.

---

## 7. Capacitación

Antes de dar acceso a un usuario real, la inducción de 13.5 incluye tres reglas: no compartir la cuenta, no extraer datos fuera de la función del rol y avisar de inmediato de un incidente. En este proyecto no hay usuarios reales que capacitar.
