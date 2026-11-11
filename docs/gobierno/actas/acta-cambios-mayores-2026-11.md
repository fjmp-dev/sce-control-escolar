# Acta de aprobación de cambios mayores — noviembre de 2026

**Manual de referencia:** SCE-MC-001 v2.0, secciones 12.4 y 16 (Tabla 34).
**Fecha de preparación:** 5 de noviembre de 2026.
**Estado:** para firma. **Actualizada:** 10 de noviembre de 2026, con las decisiones de FJMP (sub-batch 11.0). Las decisiones de CC-010, CC-011, CC-013, CC-015, CC-019 y CC-020 están registradas, pero falta la firma de FJMP en esta acta, que es la evidencia de la sección 16. Firma y decisión de CC-004 a CC-009: sub-batch 11.3, a más tardar el 20 de noviembre de 2026 (NC-008).

La evidencia auditable de la sección 16 incluye actas de aprobación de cambios mayores. Esta acta reúne los que tocan inscripción, pagos, roles, bitácora o documentos oficiales.

| Cambio | Asunto | Aprobación que exige | Decisión (aprobado o rechazado) | Observaciones |
|---|---|---|---|---|
| CC-004 | Restricciones de integridad al pasar a migraciones. **Ya implementado** (NC-008) | PO, QA y Seguridad | | |
| CC-005 | pgAudit y SCRAM. **Ya implementado solo en local**; se activa en staging o se retira | PO, QA y Seguridad | | |
| CC-007 | Rol técnico `administrador` | PO, QA y Seguridad | | |
| CC-008 | Contenido inmutable del documento | PO y QA | | |
| CC-009 | Motivo de rechazo del trámite | PO y QA | | |
| CC-010 | Revocación de sesión | PO, QA y Seguridad | Aprobado por FJMP, 10 de noviembre de 2026 | Aprobado después de fusionarse (NC-008) |
| CC-011 | Fecha de confirmación del pago | PO y QA | Aprobado por FJMP, 10 de noviembre de 2026 | Se implementa en el sub-batch 12.1 |
| CC-013 | Persistir el rechazo de la inscripción | PO y QA | Aprobado por FJMP, 10 de noviembre de 2026 | Aprobado después de fusionarse (NC-008) |
| CC-015 | Usuario técnico sin rol | PO, QA y Seguridad | Aprobado por FJMP, 10 de noviembre de 2026 | Aprobado después de fusionarse (NC-008) |
| CC-019 | Inicio del curso del periodo y cierre en la calle de coordinación | PO y QA | Aprobado por FJMP, 10 de noviembre de 2026 | Aprobado después de fusionarse (NC-008) |
| CC-020 | Cambio de proveedor crítico: de Mercado Pago a pasarela simulada | PO, QA y Seguridad | Aprobado por FJMP, 10 de noviembre de 2026 | Aprobado después de fusionarse (NC-008). Acota RF-006 |

Lo que se rechace no se implementa, y si ya está implementado se revierte. Quien aprueba no es quien solicitó el cambio.

| Rol para esta acta | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner, QA y Seguridad | Samuel Jezoar Ortiz Martínez | | |
| Solicitante | Francisco Javier Martínez Peñas | | |
| Product Owner, QA y Seguridad desde el 10 de noviembre de 2026: CC-010, CC-011, CC-013, CC-015, CC-019 y CC-020 | Francisco Javier Martínez Peñas | | |

> Una sola persona ocupa los tres roles de aprobación. Es la limitación declarada en `docs/gobierno/roles-y-raci.md`, apartado 6.
>
> **Desviación desde el 10 de noviembre de 2026:** FJMP aprueba los cambios que él mismo solicitó (NC-012). CC-004, CC-005, CC-007, CC-008 y CC-009 siguen sin decisión, y el código de CC-007 a CC-009 ya está en `develop` (NC-008).
