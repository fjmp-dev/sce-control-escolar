# Acta de liberación — `v1.0.0` al piloto de ensayo

**Formato:** Anexo D, secciones 2 (puertas de 20.1), 3 (criterios de 36.1) y 4 (decisión).

**Etiqueta:** `v1.0.0` · **Rama:** `release/1.0.0` · **Ambiente:** piloto de ensayo (environment `piloto`, CC-022) · **Fecha:** pendiente · **Responsable de DevOps:** FJMP

**Qué se libera:** el mismo commit que `v1.0.0-rc.2`, ya promovido a staging (acta `acta-promocion-v1.0.0-rc.2.md`). La etapa 8 del piloto no despliega un commit que no haya pasado staging: consulta por API las puertas 1 y 2 antes de empezar.

**Alcance del piloto de ensayo:** no hay servidor de piloto ni facultad piloto (manual v3.0, 2.2). El piloto de ensayo usa las mismas imágenes firmadas, con los secretos y la CA del environment `piloto`, sin usuarios ni datos (`SEMILLA=0`). No sustituye a la fase 5 del manual, que pide una facultad real durante un semestre.

Esta acta se escribe antes de etiquetar, porque `v1.0.0` debe caer en el commit que ya pasó staging, y ese commit tiene que traer su acta. Los resultados se llenan en el pull request de resultados del Batch 14.

## 1. Puertas de promoción a piloto (sección 20.1), en orden

| # | Condición | Resultado | Evidencia |
|---|---|---|---|
| 1 | Integración continua en verde sobre el tag candidato, con pruebas unitarias, de integración y de seguridad básica | Pendiente | Paso "Puertas 1 y 2" de la etapa 8: etapas 1 a 7 en verde sobre el commit |
| 2 | Despliegue y prueba de humo en staging | Pendiente | `acta-promocion-v1.0.0-rc.2.md` y el mismo paso, que encuentra la corrida de staging del commit |
| 3 | Prueba de rendimiento sobre el tag candidato con resultado dentro de las metas de RNF-REN | Pendiente | `informe-rendimiento.md`, apartado 4, sobre `v1.0.0-rc.2` |
| 4 | Acta de aceptación de la fase firmada por Product Owner y QA | Pendiente | `acta-aceptacion-fase-4.md` (ACT-F4-001), firmada por FJMP en ambos papeles (NC-012) |
| 5 | Riesgos de nivel Alto mitigados o aceptados por escrito | Pendiente | `docs/calidad/matriz-riesgos.md` |
| 6 | Inventario actualizado con tag, fecha, responsable de DevOps y dirección del piloto, y rollback verificado | Pendiente | `inventario-de-ambientes.md` §8 y rollback de `acta-promocion-v1.0.0-rc.2.md` |

## 2. Criterios de liberación (sección 36.1)

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
| 1 | Etiqueta SemVer creada y notas de versión publicadas | Pendiente | Etiqueta `v1.0.0` y `docs/gobierno/notas-version/v1.0.0.md` |
| 2 | Pruebas Must en verde y prueba de humo en staging satisfactoria | Pendiente | Etapas 3 a 5 y 7; humo del Anexo D en `acta-promocion-v1.0.0-rc.2.md` |
| 3 | Prueba de rendimiento dentro de las metas de RNF-REN | Pendiente | Puerta 3 |
| 4 | Cero defectos críticos y riesgos de nivel Alto mitigados o aceptados por escrito | Pendiente | Issues con severidad crítica; puerta 5 |
| 5 | Acta de aceptación de la fase firmada por Product Owner y QA | Pendiente | Puerta 4 |
| 6 | Inventario de ambiente actualizado y procedimiento de rollback verificado | Pendiente | Puerta 6 |
| 7 | Credenciales de pago del piloto configuradas y verificadas, distintas de las de sandbox | Pendiente. **No se puede cumplir con la pasarela simulada (CC-020):** no hay credenciales de pago. La etapa 8 verifica los secretos propios del piloto (JWT, semilla y CA), no los de una pasarela | Paso "Secretos propios del piloto" de la etapa 8 |

No se despliega a piloto desde una máquina local (sección 31.2): la etapa 8 corre en GitHub Actions con el environment `piloto`.

## 3. Desviaciones declaradas

- **NC-012:** FJMP lanza, aprueba y firma solo, sin revisión independiente.
- **NC-013:** la auditoría interna "Antes del piloto" (Tabla 60) no tiene auditor independiente.
- **CC-020:** el pago es simulado. El criterio 7 no se cumple; se registra como no conformidad al llenar esta acta.
- **Anexo A incompleto (8.4-2):** faltan SUS con participantes y la revisión con VoiceOver (CO-ACC-03).
- **Fase 5 sin facultad real:** el piloto de ensayo no tiene usuarios. La operación de un semestre, su auditoría de cierre y el dictamen final quedan preparados, no ejecutados.

## 4. Decisión

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| Product Owner | FJMP (NC-012) | Pendiente | | |
| QA | FJMP (NC-012) | Pendiente | | |
| DevOps | FJMP | Pendiente | | |
