# Matriz ISO/IEC 25010:2023 — SCE

**Fuente:** SCE-MC-001 v2.0, sección 8.2 (Tablas 14 y 15) y 8.4; manual v3.0 (`docs/gobierno/manual-v3.0.md`), apartado 2.2; CC-021. **Sub-batch:** 12.5, issue #75. **Versión:** 1.2, 11 de noviembre de 2026 (13.6, #76: resultados sobre `v1.0.0-rc.1`). La 1.1 era del Batch 13: rendimiento, continuidad, monitoreo y flexibilidad construidos. **Responsable:** QA (hoy FJMP; NC-012).

La Tabla 15 tiene 37 subcaracterísticas en nueve características. Esta matriz liga cada una con su requisito (sección 9 y CC-021), sus casos y la evidencia. La clasificación de cada requisito está en `catalogo-requisitos.md`, apartado 5. El resumen por característica es el Anexo A (`anexo-a.md`).

**Estados:**
- **Cumple:** el caso corre en CI o en staging y está en verde.
- **Cumple con pasarela simulada:** cumple contra la pasarela simulada de CC-020. Mercado Pago no se prueba.
- **Pendiente (13.x):** se construye en el Batch 13; el número es su sub-batch.
- **Construido, se mide en 13.6:** el caso existe desde el Batch 13 y se ejecuta sobre el candidato `v1.0.0-rc.N`. Lo que hay antes es un ensayo local o a escala de prueba, sin valor de referencia.
- **Preparado, no ejecutado:** depende de personas o de la institución (`plan-de-sistema.md`, apartado 8).
- **No aplica en esta versión:** el criterio pide el piloto, que la v3.0 deja fuera (apartado 2.1).

Las rutas de la evidencia son del repositorio. "Etapa N" es la etapa del pipeline (`plan-de-pruebas.md`, 4.1). Lo que corre en las etapas 7 y 8 queda como artefacto de la corrida, y al cerrar cada fase se copia a `docs/evidencias/`.

## 1. Matriz

| # | Característica | Subcaracterística | Prioridad | Requisito | Casos | Evidencia | Estado |
|---|---|---|---|---|---|---|---|
| 1 | Adecuación funcional | Completitud funcional | Alta | RF-001 a RF-010 | CF-EXP-01, CF-INS-01, CF-HOR-01, CF-CAL-01, CF-PAG-01, CF-TRA-01 | `web/cypress/e2e/` en la etapa 7, con video | Cumple con pasarela simulada |
| 2 | | Corrección funcional | Alta | RF-001, RF-002, RF-003, RF-005, RF-006, RNF-DAT-001 | CF-INS-01 y 02, CF-HOR-01, CI-API-01, CI-CAL-01, CI-PAG-01, CD-DAT-02 | `api/test/unitarias/` (dominio, etapa 3) y `api/test/integracion/` (etapa 4); GX en la etapa 4 | Cumple |
| 3 | | Pertinencia funcional | Alta | RF-008, RF-009, RF-010 | CF-ROL-01, CS-SEG-04, CF-REP-01, CF-TRA-02 | `roles.spec.ts` contra `matriz-rol-endpoint.md`; Newman en la etapa 4 | Cumple |
| 4 | Eficiencia de desempeño | Comportamiento temporal | Alta | RNF-REN-001 | CR-REN-01; Lighthouse (rendimiento percibido) | JMeter en staging; `scripts/lighthouse.sh` en la etapa 7 | Cumple en el runner de GitHub Actions: con 300 usuarios, mediana del p95 de 66 ms en inscripción, 44 ms en pago y 26 ms en consultas, y 0 % de 5xx (CR-REN-01 sobre `v1.0.0-rc.1`, `informe-rendimiento.md`, 4.1). Lighthouse al terminar la carga: 90 o más en 20 de 21 páginas; `administrador-usuarios` da 68 (defecto #107, Media). Falta medir en el servidor del piloto (24.2) |
| 5 | | Utilización de recursos | Media | RNF-REN-001 (CPU y _pool_) | CR-REN-01, CO-FIA-01 | Prometheus durante la carga | Cumple con 300 usuarios: CPU de la aplicación de 46.5 %, de la base de 41.9 % y 2 conexiones activas (mediana de CR-REN-01). Con 800 usuarios (CR-REN-03) la aplicación llega a 99.5 %; el margen se acaba entre 550 y 650 usuarios (RK-04). En 4 h con 150 usuarios (CR-REN-05), la memoria de la API bajó de 334 MiB a 198 MiB: no hay fuga |
| 6 | | Capacidad | Alta | RNF-REN-002 | CR-REN-02; CI-API-01 (cupo con peticiones simultáneas) | k6 en staging; `inscripcion.spec.ts` | Cumple en el runner: en tres corridas de CR-REN-02, 300 inscripciones simultáneas por 5 lugares dan 5 confirmadas, 95 rechazadas por cupo y cero filas en `cr-ren-02.sql`. CI-API-01 también cumple |
| 7 | Compatibilidad | Coexistencia | Baja | — | — | — | No aplica en esta versión: sin piloto no hay sistemas de la facultad con los que coexistir |
| 8 | | Interoperabilidad | Alta | RF-006, RNF-FLE-002 | CI-PAG-01, CF-PAG-01, CD-DAT-03, CO-COM-01 | `pagos.spec.ts`, Newman, suite `conciliacion` de GX; Playwright en las etapas 7 y 8 | Cumple con pasarela simulada |
| 9 | Capacidad de interacción | Reconocibilidad de adecuación | Media | RNF-USU-001 | Demostración por rol; sesiones de usabilidad (Anexo G) | `demostracion-por-rol.cy.ts` en la etapa 7 | Preparado, no ejecutado: falta SUS con participantes. La demostración por rol sí corre |
| 10 | | Aprendibilidad | Media | RNF-USU-001 | Sesiones de usabilidad con inducción breve (Anexo G) | — | Preparado, no ejecutado: sin participantes |
| 11 | | Operabilidad | Alta | RNF-USU-001, RNF-USU-002, RF-003, RF-010 | CF-INS-02, CF-TRA-01, CO-ACC-02 | `inscripcion.cy.ts` (estado, aviso de choque y bloqueo por adeudo); `web/playwright/fixtures.ts` (teclado, 28.1-1) | Cumple |
| 12 | | Protección contra errores de usuario | Alta | RF-002, RF-004, RF-006, RNF-USU-002 | CF-INS-01 y 02, CS-SEG-01, CI-PAG-01 | `inscripcion.cy.ts`, `calificaciones.spec.ts` (captura fuera del grupo), `pagos.spec.ts` (#69, pago que no se duplica) | Cumple |
| 13 | | Compromiso del usuario | Baja | RNF-FLE-002 | CO-COM-01 | Matriz de la Tabla 50 en escritorio y teléfono | Cumple |
| 14 | | Inclusividad | Media | RNF-USU-002 | CO-ACC-01, CO-ACC-02, CO-ACC-03 | axe y Lighthouse en la etapa 7 (`accesibilidad.md`); revisión manual WCAG 2.2 AA | Cumple con axe, Lighthouse y la revisión manual. VoiceOver pendiente; NVDA fuera de alcance |
| 15 | | Autodescripción | Media | RNF-USU-001 | CF-INS-02, CO-ACC-03 | Mensaje con causa y corrección por motivo de rechazo; lista manual de `accesibilidad.md` | Cumple |
| 16 | Fiabilidad | Ausencia de fallos | Media | — (indicador de la Tabla 59) | Densidad de defectos por fase | `informe-fase-4.md`, tablero de indicadores | Medido. La tendencia no baja (informe de fase 4) |
| 17 | | Disponibilidad | Alta | RNF-FIA-001 | CO-FIA-01 | Monitoreo y `scripts/disponibilidad.py` | Parcial: ensayada, sin meta mensual. Monitoreo y alertas ensayados en local el 11 de noviembre (`docs/evidencias/ensayos/2026-11-11-monitoreo-y-alertas.md`), y 4 h de CR-REN-05 sin un 5xx. Sin piloto, la disponibilidad mensual no se mide (manual v3.0, 2.2; OB-02) |
| 18 | | Tolerancia a fallos | Media | RF-006 | CI-PAG-01 (pasarela que falla), AMFE de pagos | `pagos.spec.ts`: el pago queda pendiente y el estado de cuenta no cambia | Cumple con pasarela simulada |
| 19 | | Recuperabilidad | Alta | RNF-FIA-002 | CO-FIA-02 | `pg_dump` cifrado y restauración cronometrada | Cumple con salvedad: `continuidad.yml` restauró el respaldo cifrado en 20 s en el runner. El rollback solo se ensayó en local (25 s): no hubo rc.2 en staging (NC-022). Ver `docs/evidencias/ensayos/2026-11-11-restauracion-y-rollback.md` |
| 20 | Seguridad | Confidencialidad | Alta | RF-008, RNF-SEG-002 | CS-SEG-02, CS-SEG-03, CS-SEG-05, CF-ROL-01 | Supertest (etapa 4); ZAP en la etapa 5 y `informe-zap.md` | Cumple |
| 21 | | Integridad | Alta | RNF-SEG-001 | CS-SEG-01, CS-SEG-06 | `cs-seg-06-*.sql` y GX (etapa 4) | Cumple |
| 22 | | No repudio | Alta | RF-007, RNF-SEG-001 | CS-SEG-06 en pago, calificación y constancia | Bitácora con autor; documento con hash SHA-256 (`tramites.spec.ts`) | Cumple |
| 23 | | Responsabilidad | Alta | RNF-SEG-001 | CS-SEG-06; muestreo de bitácora | `muestreo-bitacora.sql` en la etapa 4 | Cumple |
| 24 | | Autenticidad | Alta | RF-008, RNF-SEG-001 | CI-AUTH-01, CS-SEG-07 | `roles.spec.ts`, `sesiones.spec.ts`, `autenticacion.cy.ts` | Cumple |
| 25 | | Resistencia | Media | RNF-SEG-002 | CS-SEG-03 (identificadores ajenos); bloqueo por intentos | `scripts/zap-acceso-cruzado.sh`; `sesiones.spec.ts` | Cumple |
| 26 | Mantenibilidad | Modularidad | Alta | RNF-MAN-001 | CO-MAN-02 | `api/eslint.config.mjs` y `scripts/co-man-02.sh` en la etapa 2 | Cumple |
| 27 | | Reusabilidad | Baja | RNF-FLE-001 | CO-FLE-01 | Alta de una segunda facultad en staging | Cumple en la etapa 4 (`flexibilidad.spec.ts`); en staging, con `co-fle-01.sql` sobre el candidato |
| 28 | | Analizabilidad | Media | RNF-MAN-001 | CO-MAN-01 | `scripts/reglas-must.sh` (cada regla Must con su ID en una prueba), registros JSON con código de negocio | Cumple |
| 29 | | Modificabilidad | Media | RNF-MAN-001 | CF-HOR-01; oferta de 2027A (#73) | La oferta nueva se cargó como datos, sin tocar el expediente ni el esquema | Cumple |
| 30 | | Capacidad de ser probado | Alta | RNF-MAN-001 | CO-MAN-01; cobertura del dominio al 80 %; puerta de SonarQube | Etapas 2, 3 y 5 | Cumple |
| 31 | Flexibilidad | Adaptabilidad | Media | RNF-FLE-002 | CO-COM-01 | Playwright en 1366×768, 1920×1080 y 390×844 | Cumple |
| 32 | | Escalabilidad | Media | RNF-FLE-001 | CO-FLE-01 | Alta de una segunda facultad sin migración estructural | Cumple en la etapa 4 (`flexibilidad.spec.ts`: huella del esquema y `prisma migrate diff --exit-code`) |
| 33 | | Facilidad de instalación | Baja | — | Despliegue en las etapas 7 y 8 | `docker-compose.yml`, `scripts/staging.sh` | Cumple: el mismo despliegue en desarrollo, pruebas y staging |
| 34 | | Capacidad de ser reemplazado | Baja | — | — | — | No aplica en esta versión: sustituir el papel es tarea del piloto |
| 35 | Seguridad física | Identificación de riesgos | Baja | — | Matriz de riesgos y AMFE | `matriz-riesgos.md`, `amfe-inscripcion.md` | Cumple |
| 36 | | Comportamiento seguro ante fallo | Baja | RF-002, RF-006 | CI-PAG-01, CI-API-01 | Pasarela que falla deja el pago pendiente; cupo agotado revierte la transacción (Fig. 4) | Cumple |
| 37 | | Restricción operacional | Baja | RF-002, RF-004 | CF-CAL-01, CF-INS-01 | Captura solo en periodo en curso (D-6); inscripción solo con periodo abierto | Cumple |

**Conteo:** 37 subcaracterísticas.
- **31 cumplen.** De ellas, 3 con pasarela simulada, 3 medidas en el runner y no en el servidor del piloto (4, 5 y 6), y 1 con el rollback ensayado solo en local (19, NC-022).
- **1 es parcial:** Disponibilidad, ensayada y sin meta mensual.
- **2 están preparadas** sin ejecutar, y 2 no aplican en esta versión.

La 16, Ausencia de fallos, se mide pero no cumple su tendencia.

## 2. Subcaracterísticas Alta y pruebas de aceptación (8.4)

La sección 8.4 pide dos cosas: que cada historia se clasifique en al menos una subcaracterística, y que las pruebas de aceptación cubran todas las de prioridad Alta.

La primera se cumple en dos lugares. Cada requisito está clasificado en `catalogo-requisitos.md`, apartado 5. Cada historia de GitHub (los issues de batch y los que llevan etiqueta de requisito) tiene su etiqueta `25010:*` (apartado 3).

Para la segunda, en el SCE una prueba de aceptación es la que el PO y QA miran para firmar el acta de fase. Puede ser un extremo a extremo de Cypress o Playwright, la demostración por rol, o un caso Must de la Tabla 49 o 39 que el acta cita.

| Subcaracterística Alta | Prueba de aceptación | Acta donde se acepta | Estado |
|---|---|---|---|
| Completitud funcional | CF-EXP-01, CF-INS-01, CF-HOR-01, CF-CAL-01, CF-PAG-01, CF-TRA-01 (Cypress) | Fases 2, 3 y 4 | Cubierta |
| Corrección funcional | CF-INS-01 y 02, CF-HOR-01, CF-CAL-01 (Cypress); CD-DAT-02 | Fases 2 y 3 | Cubierta |
| Pertinencia funcional | Demostración por rol (`demostracion-por-rol.cy.ts`), CF-REP-01, CF-TRA-02 | Fases 1 y 4 | Cubierta |
| Comportamiento temporal | CR-REN-01 | Acta de promoción de `v1.0.0-rc.1`, apartado 3 | Cubierta en 13.6: CR-REN-01 cumple sobre `v1.0.0-rc.1`, en el runner |
| Capacidad | CR-REN-02 | Acta de promoción de `v1.0.0-rc.1`, apartado 3 | Cubierta en 13.6: CR-REN-02 cumple sobre `v1.0.0-rc.1`, en el runner |
| Interoperabilidad | CF-PAG-01 (Cypress), CO-COM-01 (Playwright) | Fase 4 y acta de promoción | Cubierta con pasarela simulada |
| Operabilidad | CF-INS-02 (Cypress), CO-ACC-02 (Playwright) | Fase 2; acta de promoción | Cubierta |
| Protección contra errores de usuario | CF-INS-01 y 02, CF-PAG-01 (Cypress) | Fases 2 y 4 | Cubierta |
| Disponibilidad | CO-FIA-01 | Acta de liberación de `v1.0.0` | Cubierta por ensayo: monitoreo y alertas en local, y 4 h de CR-REN-05 sin un 5xx. Sin meta mensual hasta el piloto |
| Recuperabilidad | CO-FIA-02 | `2026-11-11-restauracion-y-rollback.md`; acta de liberación de `v1.0.0` | Cubierta: restauración en 20 s en el runner (`continuidad.yml`). Rollback solo en local (NC-022) |
| Confidencialidad | CF-ROL-01 en la demostración por rol; CS-SEG-03 y 05 | Fases 1 a 4 | Cubierta |
| Integridad | CS-SEG-06; CF-CAL-01 (corrección con autorizador) | Fases 3 y 4 | Cubierta |
| No repudio | CF-TRA-01 (documento con folio y hash); CS-SEG-06 | Fase 4 | Cubierta |
| Responsabilidad | Muestreo de bitácora en la etapa 4 | Fase 4 | Cubierta |
| Autenticidad | `autenticacion.cy.ts` (Cypress), CI-AUTH-01 | Fase 1 | Cubierta |
| Modularidad | CO-MAN-02 | Acta de fase 4 o la de promoción, la primera que se firme después de 12.5 | Cubierta desde 12.5 |
| Capacidad de ser probado | CO-MAN-01 y puerta de calidad | Fases 1 a 4 | Cubierta |

**Resultado:** las 17 subcaracterísticas Alta están cubiertas en aceptación desde el 11 de noviembre de 2026 (13.6), y la regla 8.4-2 se cumple para el piloto de ensayo. Cuatro tienen salvedad:
- Comportamiento temporal y Capacidad se midieron en el runner, no en el servidor del piloto (24.2).
- Disponibilidad se cubrió por ensayo, sin meta mensual.
- Recuperabilidad tiene el rollback ensayado solo en local (NC-022).

## 3. Etiquetas `25010:*` en GitHub

Cada subcaracterística usada en la clasificación tiene una etiqueta `25010:<subcaracterística>`. Su descripción da la característica y la prioridad de la Tabla 15. Se aplicaron el 11 de noviembre de 2026:

- a los issues de batch #41 a #51 y #75 a #77, según los requisitos de cada batch;
- a los issues con etiqueta de requisito (#32 a #38, #40, #69, #73 y #84), según el apartado 5 del catálogo. #39 (CC-014) no tiene etiqueta de requisito.

Una historia nueva toma su etiqueta del campo "Subcaracterística" de `.github/ISSUE_TEMPLATE/historia.yml`.
