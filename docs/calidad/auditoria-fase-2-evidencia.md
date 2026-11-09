# Auditoría interna de cierre de fase 2 — Índice de evidencia

**Fuente:** SCE-MC-001 v2.0, sección 39 (Tabla 60) y Anexo F. **Estado:** preparado por el auditado el 8 de noviembre de 2026 (Batch 6).

**Programa (Tabla 60):**
- **Alcance:** expediente e inscripción.
- **Criterios:** SCE-MC-001 vigente, RF-001 a RF-002 y RNF-DAT-001.

El plan previo, la lista de verificación, los hallazgos y el dictamen son del auditor, que no desarrolla ni opera el producto (sección 39.1). Este documento solo dice dónde está la evidencia, para que el auditor elija su muestra. **El auditor está por designar** (`plan-de-sistema.md`, sección 8).

| Criterio | Qué pide | Dónde está la evidencia |
|---|---|---|
| RF-001 | Expediente único con historial que no se duplica al cambiar de plantel | CF-EXP-01 en `api/test/integracion/expediente.spec.ts` y `web/cypress/e2e/expediente.cy.ts`; PR #59 y su corrida 42443090034 |
| RF-002 | Inscripción con validación de requisitos, adeudos y choques, y rechazo explícito | CF-INS-01 y 02, CI-API-01 y la tabla de decisión en `api/test/integracion/inscripcion.spec.ts`, `api/test/unitarias/inscripcion.spec.ts` y `web/cypress/e2e/inscripcion.cy.ts`; PR #60 y su corrida 42533743035 |
| RNF-DAT-001 | Cero duplicados y conciliación correcta | `api/prisma/verificacion/` (CD-DAT-01, 04 y 05 y ocupación); Great Expectations en el artefacto `calidad-datos`; pruebas de detección en `datos.spec.ts` |
| Figuras 3, 4 y 6 | Que el código siga la letra de las figuras | `docs/arquitectura/`, CC-013 y CC-017, y las contradicciones X-22 a X-24 |
| Bitácora (14.1-3) | Autor, fecha y valor anterior en plantel e inscripción | `muestreo-bitacora.sql`, `cs-seg-06-plantel.sql` |
| Seguridad (18) | Visibilidad por rol y folio ajeno | CS-SEG-03 y CF-ROL-01; `docs/calidad/matriz-rol-endpoint.md` v1.3 |
| Riesgos (17) | RK-05 y RK-09 tratados | `docs/calidad/matriz-riesgos.md` y `docs/calidad/amfe-inscripcion.md` |
| Ambientes (20 y 31) | Staging y etapa 8 | `docs/gobierno/inventario-de-ambientes.md`, `.github/workflows/staging.yml` y el ensayo de la etapa 7 |
| Cambios (16) | Cambios aprobados antes de fusionar | `docs/gobierno/registro-de-cambios.md`. CC-013, que es Mayor, sigue sin aprobar |
| No conformidades (40) | Tratamiento de NC-009 y anteriores | `docs/calidad/registro-no-conformidades.md` |

**Advertencia para el muestreo:** la evidencia corresponde a ramas de PR que aún no están integradas en `develop`. El auditor decide si audita sobre la etiqueta `v0.2.0-rc.N` o espera a ella.
