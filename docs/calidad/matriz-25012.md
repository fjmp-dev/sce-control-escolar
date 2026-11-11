# Matriz ISO/IEC 25012:2008 — expediente del alumno

**Fuente:** SCE-MC-001 v2.0, sección 8.3 (Tabla 16), Tabla 39 (CD-DAT-01 a 06) y Tabla 42 (Great Expectations); manual v3.0, apartado 2.2. **Sub-batch:** 12.5, issue #75. **Versión:** 1.1, 11 de noviembre de 2026 (Batch 13, #76). **Responsable:** QA (hoy FJMP; NC-012).

La Tabla 16 aplica al expediente los 15 atributos de la norma. Esta matriz liga cada atributo con su requisito, su verificación y la evidencia. La verificación de datos está en `api/prisma/verificacion/` (consultas SQL) y en `scripts/calidad-datos.py`, donde Great Expectations (GX) etiqueta cada expectativa con su atributo. GX corre en tres lugares: en la etapa 4 sobre la base de Compose después de Newman, en la etapa 5 después de ZAP, y en cada staging. Ninguna suite pasa con la tabla vacía.

Los estados son los de `matriz-25010.md`.

| # | Atributo | Punto de vista | Prioridad | Requisito | Verificación | Evidencia | Estado |
|---|---|---|---|---|---|---|---|
| 1 | Exactitud | Inherente | Alta | RF-005, RNF-DAT-001 | CD-DAT-02: recálculo de promedio y créditos sobre 30 expedientes; CI-CAL-01 | `cd-dat-02.sql`, suite `historial`; `calificaciones.spec.ts` | Cumple con las reglas provisionales D-5 y D-8, que el PO no ha ratificado |
| 2 | Completitud | Inherente | Alta | RF-002, RF-007 | CD-DAT-05: ninguna inscripción sin matrícula, periodo ni carga; R-17: ninguna constancia sin historial | `cd-dat-05.sql`, suite `inscripcion`; `tramites.spec.ts` | Cumple |
| 3 | Consistencia | Inherente | Alta | RF-001, RF-006 | CD-DAT-01: un solo expediente al cambiar de plantel; CD-DAT-03: caja y estado de cuenta sin saldos contradictorios | `cd-dat-01.sql`, suite `expediente`; `cd-dat-03.sql`, suite `conciliacion` | Cumple con pasarela simulada |
| 4 | Credibilidad | Inherente | Media | RF-004 | CS-SEG-06 en calificación: cada una tiene el asiento de captura del profesor del grupo; CS-SEG-01 | `cs-seg-06-calificacion.sql`, suite `integridad` | Cumple |
| 5 | Actualidad | Inherente | Alta | RF-004, RF-006 | CD-DAT-06: reflejo del pago en menos de 60 s (p95); CF-CAL-01: calificación consultable al capturar | `cd-dat-06.sql`, suite `actualidad`; `calificaciones.cy.ts` | Cumple con pasarela simulada: la demora se mide en milisegundos |
| 6 | Accesibilidad | Dependiente del sistema | Alta | RF-008, RF-009 | CS-SEG-02: el alumno solo ve su expediente; CF-REP-01: dirección ve agregados y no la bitácora | `expediente.spec.ts`, `reportes.spec.ts`, `matriz-rol-endpoint.md` | Cumple |
| 7 | Conformidad | Ambos | Media | RF-001, RF-003, RF-007 (D-11) | Formatos de matrícula, clave de materia y periodo; tipo de trámite del catálogo; hash SHA-256 | Suites `expediente`, `formato-materia`, `formato-periodo`, `tramites` y `documentos` | Cumple con los formatos provisionales D-11 |
| 8 | Confidencialidad | Ambos | Alta | RNF-SEG-002 | CS-SEG-02 y 03; CS-SEG-08 (sin secretos en registros ni respuestas); ningún dato real en staging | Supertest, `zap-acceso-cruzado.sh`, `sin-datos-reales.sql` | Cumple |
| 9 | Eficiencia | Dependiente del sistema | Media | RNF-REN-001 | Índices en matrícula, periodo y grupo; CR-REN-01; pgBadger | `api/prisma/schema.prisma` (`@@index` y `@@unique` sobre `matricula`, `periodoClave` y `grupoId`); `scripts/pgbadger.sh` | Índices en el esquema. Construido, se mide en 13.6: el p95 con carga sale de CR-REN-01 y pgBadger corre después de cada carga (`rendimiento.yml`) |
| 10 | Precisión | Inherente | Alta | RF-005 | Un solo redondeo, half-up a dos decimales (D-5); importes con dos decimales | `api/src/academico/dominio/calificacion.ts` y sus pruebas unitarias; suite `conciliacion` | Cumple |
| 11 | Trazabilidad | Ambos | Alta | RNF-SEG-001 | CS-SEG-06: autor, fecha y valor anterior en plantel, calificación, pago y constancia; muestreo de bitácora | `cs-seg-06-*.sql`, suites `bitacora-*`; `muestreo-bitacora.sql` | Cumple |
| 12 | Comprensibilidad | Ambos | Media | RNF-USU-001, RNF-USU-002, RF-010 | Estados y etiquetas sin diccionario técnico; mensaje con causa y corrección | `inscripcion.cy.ts` (CF-INS-02); lista manual de `accesibilidad.md` (CO-ACC-03) | Cumple |
| 13 | Disponibilidad | Dependiente del sistema | Alta | RNF-FIA-001 | CO-FIA-01 | Monitoreo y `scripts/disponibilidad.py` | Construido, se mide en 13.6; ensayo local (`docs/evidencias/ensayos/2026-11-11-monitoreo-y-alertas.md`). Sin piloto no hay horario de servicio que medir |
| 14 | Portabilidad | Dependiente del sistema | Baja | RF-005 | Exportación del historial en CSV | `calificaciones.cy.ts` (`/mis-calificaciones/historial.csv`) | Cumple |
| 15 | Recuperabilidad | Dependiente del sistema | Alta | RNF-FIA-002 | CO-FIA-02: restauración con pérdida menor a 24 h | `pg_dump` cifrado y `pg_restore` cronometrado | Construido, se mide en 13.6 con el rollback de rc.2; ensayo local: restauración en 12 s (`docs/evidencias/ensayos/2026-11-11-restauracion-y-rollback.md`) |

**Conteo:** 15 atributos. 12 cumplen; 2 de ellos con pasarela simulada y 2 con reglas provisionales. 3 están construidas en el Batch 13 y se miden sobre el candidato en 13.6; en Eficiencia los índices ya están en el esquema.

**Reglas provisionales.** Exactitud y Conformidad se miden contra reglas que el manual no fija y que el PO aún no ratifica (D-5, D-8 y D-11; `reglas-de-negocio.md`). La Tabla 16 pide "reglas publicadas del periodo". Mientras no haya ratificación, la conformidad es con la regla provisional y no con la institucional.
