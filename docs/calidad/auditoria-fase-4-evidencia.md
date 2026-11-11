# Auditoría interna de cierre de fase 4 — Índice de evidencia

**Fuente:** SCE-MC-001 v2.0, sección 39 (Tabla 60) y Anexo F. **Estado:** preparado por el auditado el 10 de noviembre de 2026 (sub-batch 11.3).

**Programa (Tabla 60):**
- **Alcance:** pagos, trámites y bitácora.
- **Criterios:** RF-006, RF-007, RNF-SEG-001 y controles de ISO/IEC 27001:2022.

Este índice dice dónde está la evidencia, para que cualquier auditor elija su muestra. La autoauditoría que lo usa está en `auditoria-fase-4.md`; no es independiente (NC-013).

**Commit auditado:** `d4cce7d`, cabeza del PR #78, fusionado en `develop` el 10 de noviembre de 2026. La etiqueta `v0.4.0` se crea en 11.4.

| Criterio | Qué pide | Dónde está la evidencia |
|---|---|---|
| RF-006 | Pago reflejado una sola vez, sin comprobante en papel; pendiente ante fallo | `api/src/pagos/`; `api/test/integracion/pagos.spec.ts` (CI-PAG-01, R-14, R-15, R-21, R-23, R-24, corte); `api/test/unitarias/pagos-tramites.spec.ts`; `web/cypress/e2e/pagos-tramites.cy.ts` (CF-PAG-01); Newman, carpeta "Pagos, trámites y reportes"; PR #64 y #71; defecto #69 |
| CC-020 | Pasarela simulada y su riesgo aceptado | `docs/gobierno/cambios/CC-020.md`; RK-15 en `matriz-riesgos.md` |
| RF-007 y RF-010 | Trámites con estado y fecha visibles; constancia, no adeudo e historial; documento inmutable | `api/src/tramites/`; `api/test/integracion/tramites.spec.ts` (CF-TRA-01 y 02, R-16, R-17, verificación del hash); `pagos-tramites.cy.ts`; Newman |
| RF-009 | Reportes de dirección, solo lectura | `api/src/reportes/`; `api/test/integracion/reportes.spec.ts` (CF-REP-01); `web/cypress/e2e/reportes.cy.ts`; `docs/calidad/matriz-rol-endpoint.md` (dirección) |
| RNF-SEG-001 | Bitácora con autor, acción, valor anterior y fecha en calificación, pago, constancia y plantel; inmutable | `api/src/bitacora/`; disparador `fn_bitacora_inmutable` en `api/prisma/migrations/20261023001700_restricciones/`; `api/prisma/verificacion/cs-seg-06-*.sql`; `seguridad.spec.ts` (R-22); `datos.spec.ts`; Great Expectations en el artefacto `calidad-datos` |
| ISO/IEC 27001:2022 | Controles de la Tabla 38 | `docs/calidad/stride.md`, apartado "Controles de ISO/IEC 27001:2022 y OWASP Top 10 2021" |
| Riesgos (17) | RK-02, RK-03, RK-08 y RK-15; AMFE de pagos | `docs/calidad/matriz-riesgos.md`; `docs/calidad/amfe-pagos.md` |
| Métricas (38) | Tablero de la Tabla 59 con su recálculo | `docs/calidad/informe-fase-4.md` |
| Aceptación (10) | Acta con la Tabla 23, fila 4 | `docs/gobierno/actas/acta-aceptacion-fase-4.md` |
| Cambios (16) | CC de la fase aprobados | `docs/gobierno/registro-de-cambios.md` (CC-011, CC-015 y CC-020; CC-008 y CC-009 sin decisión) |
| No conformidades (40) | NC con plan | `docs/calidad/registro-no-conformidades.md` |

## Corridas

| Corrida | Commit | Qué tiene |
|---|---|---|
| Local, 10-nov | `d4cce7d` | Jest `unitarias` 187/187; Jest `integracion` 560/560; Vitest 181/181; `scripts/reglas-must.sh` 24/24; consultas SQL sobre base efímera; bitácora inmutable reejecutada |
| CI 42966111975 | `d4cce7d` | Etapas 1 a 5 y 7 en verde. Artefactos `newman`, `calidad-datos`, `reglas-must`, `trivy`, `zap`, `gitleaks`, `calidad`, `cobertura-*` y `despliegue-pruebas` (Cypress 41/41, Lighthouse, humo de staging) |
| CI 42963020677 | `fdaae09` (develop) | Etapa 6: imágenes firmadas con cosign; artefacto `imagenes` con digests. `fdaae09` es ancestro de `d4cce7d` |

Cómo recalcular cada cifra: `informe-fase-4.md`, apartado 5.
