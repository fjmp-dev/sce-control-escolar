# Acta de ensayo de monitoreo y alertas — 11 de noviembre de 2026

**Fuente:** SCE-MC-001 v2.0, sección 35, Tabla 57, RNF-FIA-001 y CO-FIA-01; PA-SCE-001, Parte B (acceso directo a la base y revisión de accesos).
**Modalidad:** ejecutado. Staging efímero local con la topología de la Fig. 9 (`scripts/staging.sh`, etiqueta de ensayo `v9.9.9-rc.3`, imágenes `sce-api:b13` y `sce-portal:b13`) en el Mac de FJMP sobre Colima, con `infra/monitoreo/` encima. **Sub-batch:** 13.3, issue #76.
**Participantes:** FJMP (DevOps). El asistente de IA declarado en `roles-y-raci.md` corrió los scripts y redactó el acta. No hubo observador independiente (NC-012).
**Estado:** para firma de FJMP.

## 1. Resultados

| Prueba | Cómo | Resultado |
|---|---|---|
| Staging con la verificación completa | `scripts/staging.sh`: humo del Anexo D, Newman, TLS, ZAP pasivo, rechazos de la base, pgAudit y Great Expectations | **Aprobado.** Great Expectations: 33 expectativas, 0 incumplidas |
| Los seis destinos de Prometheus leen | `scripts/monitoreo.sh arriba` | **Aprobado:** API, base, nodo, contenedores y los dos sondeos de salud, todos `up` |
| Métricas de la Tabla 57 | `scripts/monitoreo.sh consulta` | `pg_up` = 1. 258 peticiones medidas, p95 de 48 ms. 3 conexiones a la base. Certificado vigente 2 días (el autofirmado del ensayo). 33 series de contenedores |
| Alerta y correo | Se detuvo `sce-api` a las 07:06:47 UTC | `SaludCaida` llegó por correo a **devops@sce.test y po@sce.test** a las 07:08:34, **1 min 47 s** después |
| Resolución | Se arrancó `sce-api` | Correo `[RESOLVED] SaludCaida` a los mismos destinatarios a las 07:13:34 |
| Disponibilidad con la caída | `scripts/monitoreo.sh salud 3600` y `scripts/disponibilidad.py`, con la hora del ensayo marcada como corte | 2 muestras caídas de 10: **80,000 %, "NO cumple"** la meta de 99,0 %, y el script sale con 1. Es lo esperado |
| Tablero | API de Grafana | "SCE — Tabla 57" aprovisionado, con 12 paneles y Prometheus como fuente |
| pgBadger | `scripts/pgbadger.sh` | Informe generado; 0 sentencias de más de 250 ms con los datos del ensayo |
| `/metricas` no sale | `curl https://localhost/api/metricas` | 404 en el proxy |
| Roles con `LOGIN` | `roles-login.sql` | 0 filas: solo `postgres`, `sce_app` y `sce_monitor` |

**Defectos que encontró el ensayo y se corrigieron antes de este acta:** `infra/monitoreo/compose.yml` usaba mapas en línea (`{ … }`) con `${VARIABLE:?}`, que el analizador de YAML de Compose rechaza. Se pasaron a bloques.

## 2. Pendientes

- **Piloto:** el monitor externo debe sondear desde fuera del servidor del piloto, y las direcciones de correo deben ser las institucionales (`docs/gobierno/monitoreo.md`, apartado 4). Depende del Batch 14.
- **Primera disponibilidad mensual real:** sale del piloto. En staging, el ambiente vive lo que dura la corrida.

## 3. Firma

| Rol | Persona | Firma | Fecha |
|---|---|---|---|
| DevOps | Francisco Javier Martínez Peñas | | |
