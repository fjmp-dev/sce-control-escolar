# Auditoría interna "Antes del piloto" — Índice de evidencia

**Fuente:** SCE-MC-001 v2.0, sección 39 (Tabla 60) y Anexo F. **Estado:** preparado por el auditado el 11 de noviembre de 2026 (sub-batch 13.6, #76).

**Programa (Tabla 60):**
- **Alcance:** sistema completo y ambientes.
- **Criterios:** todas las secciones del manual, con énfasis en las puertas de promoción y los riesgos de nivel Alto.

Este índice dice dónde está la evidencia, para que cualquier auditor elija su muestra. La autoauditoría que lo usa está en `auditoria-antes-del-piloto.md`; no es independiente (NC-013).

**Commit auditado:** `8e26059`, fusión del PR #105 en `release/1.0.0`. Es `v1.0.0-rc.1` y será `v1.0.0` (`acta-liberacion-v1.0.0.md`).

| Criterio | Qué pide | Dónde está la evidencia |
|---|---|---|
| Puertas de 20.1 (AU-33) | Seis puertas, en orden | `docs/gobierno/actas/acta-liberacion-v1.0.0.md`; `acta-promocion-v1.0.0-rc.1.md` y `-rc.2.md`; `inventario-de-ambientes.md`, apartado 8; `.github/workflows/staging.yml`, paso "Puertas 1 y 2" |
| Criterios de 36.1 | Siete criterios de liberación | `acta-liberacion-v1.0.0.md`, apartado 2; `docs/gobierno/notas-version/v1.0.0.md` |
| Riesgos Alto (AU-37) | Mitigados o aceptados por escrito | `docs/calidad/matriz-riesgos.md` (revisión del 11 de noviembre de 2026, antes de la promoción a piloto) |
| Rendimiento (AU-31) | p95, concurrencia, estrés, pico y resistencia | `docs/calidad/informe-rendimiento.md`, apartado 4; `.github/workflows/rendimiento.yml`; `infra/rendimiento/` |
| Continuidad (AU-34) | Respaldo, restauración, RPO, RTO y rollback | `docs/evidencias/ensayos/2026-11-11-restauracion-y-rollback.md`; `.github/workflows/continuidad.yml`; `infra/respaldos/` |
| Monitoreo (AU-35) | Healthchecks, p95, alertas y bitácora de seguridad | `infra/monitoreo/`; `docs/evidencias/ensayos/2026-11-11-monitoreo-y-alertas.md`; `.github/workflows/seguridad-operativa.yml` |
| Usabilidad, accesibilidad y compatibilidad (AU-32) | SUS, WCAG 2.2 AA y matriz de navegadores | `docs/calidad/anexo-a.md`; `accesibilidad.md`; `compatibilidad-dispositivos.md`; `docs/anexos/anexo-G-usabilidad-y-sus.md`; reporte de la etapa 7 en `despliegue-pruebas.zip` (release `v1.0.0`) |
| Seguridad (AU-13 a AU-17, AU-20) | Secretos, sesión, roles, bitácora, TLS y vulnerabilidades | `docs/evidencias/v1.0.0/reportes/` (`gitleaks`, `newman`, `zap`, `trivy`, `calidad`); `docs/calidad/stride.md`; `informe-zap.md` |
| Datos (AU-21 a AU-24) | CD-DAT-01 a 06 | `api/prisma/verificacion/`; `api/test/integracion/datos.spec.ts`; `docs/evidencias/v1.0.0/reportes/calidad-datos.zip` |
| Datos personales (AU-18) | Parte B | `docs/gobierno/datos-personales/`; `respuesta-a-incidentes.md`; `docs/evidencias/ensayos/` |
| Modelo de calidad (AU-42) | Anexo A y matrices | `docs/calidad/anexo-a.md`; `matriz-25010.md`; `matriz-25012.md` |
| Proveedores (AU-38) | Fichas | `docs/gobierno/fichas-de-proveedores.md` |
| Gobierno (AU-01 a AU-07, AU-36, AU-40, AU-43) | Manual, roles, cambios, actas, defectos, auditoría y metodología | `docs/gobierno/manual-v3.0.md`; `roles-y-raci.md`; `registro-de-cambios.md`; `docs/gobierno/actas/`; issues con etiqueta `defecto` (#69, #82 y #107); `docs/calidad/registro-no-conformidades.md`; `docs/gobierno/mejora-continua.md`; `plan-de-trabajo.md` |

## Corridas

Todas en `docs/evidencias/v1.0.0/corridas.md`, con los SHA-256 de los reportes copiados.

| Corrida | Commit o etiqueta | Qué tiene |
|---|---|---|
| CI 43022020442 | `8e26059` | Etapas 1 a 7 en verde, al primer intento. Jest unitarias 187/187, integración 565/565, Vitest 189, Cypress 44/44, Newman 177 peticiones y 384 aserciones sin fallas, Great Expectations 33/33, reglas Must 24/24, Gitleaks 0, Trivy 0, ZAP sin altas ni medias, matriz de la Tabla 50 en verde y Lighthouse en 21 páginas |
| Staging 43027397938 | `v1.0.0-rc.1` | Etapa 8: humo del Anexo D, Newman, CO-FLE-01, TLS, matriz Must y humo k6 |
| Continuidad 43014009079 y 43014050248 | `5385940` (`release/1.0.0`) | Respaldo cifrado y su restauración en 20 s |
| Seguridad operativa 43014013011 | `5385940` | Revisión de accesos y muestreo de 51 asientos de bitácora |
| Rendimiento 43034376604, 43034382156, 43034388666 (CR-REN-01); 43027941665, 43027952315, 43027963171 (CR-REN-02); 43034639983 (03); 43034644974 (04); 43027876968 (05) | `v1.0.0-rc.1` | CR-REN-01 y 02 cumplen; 03 y 04 informativos; tabla, medianas y hallazgos en `informe-rendimiento.md`, apartado 4 |
| Staging de rc.2 | `v1.0.0-rc.2` | Rollback a rc.1: `acta-promocion-v1.0.0-rc.2.md` |

Cómo recalcular cada cifra: el resumen de cada artefacto (`resumen.json` de Great Expectations, `jest.json`, `newman.json`, `reglas-must.json`) y la regla de conteo de `plan-de-pruebas.md`, apartado 3.
