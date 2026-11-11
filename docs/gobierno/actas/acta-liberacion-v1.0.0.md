# Acta de liberación — `v1.0.0` al piloto de ensayo

**Formato:** Anexo D, secciones 2 (puertas de 20.1), 3 (criterios de 36.1) y 4 (decisión).

**Etiqueta:** `v1.0.0` · **Rama:** `release/1.0.0` · **Ambiente:** piloto de ensayo (environment `piloto`, CC-022) · **Fecha:** 11 de noviembre de 2026, de 17:50 a 17:55 UTC · **Responsable de DevOps:** FJMP

**Qué se libera:** el mismo commit que `v1.0.0-rc.1` (`8e26059`), ya promovido a staging (acta `acta-promocion-v1.0.0-rc.1.md`) y medido con CR-REN-01 a 05. Es el que se probó. `v1.0.0-rc.2` no se etiquetó: el Product Owner decidió liberar sin ella (`acta-promocion-v1.0.0-rc.2.md`, NC-022). La etapa 8 del piloto no despliega un commit que no haya pasado staging: consulta por API las puertas 1 y 2 antes de empezar.

**Alcance del piloto de ensayo:** no hay servidor de piloto ni facultad piloto (manual v3.0, 2.2). El piloto de ensayo usa las mismas imágenes firmadas, con los secretos y la CA del environment `piloto`, sin usuarios ni datos (`SEMILLA=0`). No sustituye a la fase 5 del manual, que pide una facultad real durante un semestre.

Esta acta se escribe antes de etiquetar, porque `v1.0.0` debe caer en el commit que ya pasó staging, y ese commit tiene que traer su acta. La copia de `8e26059` decía que ese commit sería el de rc.2; se cambió cuando CR-REN se corrió sobre rc.1. Los resultados se llenaron después del despliegue, en el pull request de resultados del sub-batch 14.1.

## 1. Puertas de promoción a piloto (sección 20.1), en orden

| # | Condición | Resultado | Evidencia |
|---|---|---|---|
| 1 | Integración continua en verde sobre el tag candidato, con pruebas unitarias, de integración y de seguridad básica | Cumple: la etapa 8 encontró las etapas 1 a 7 en verde sobre `8e26059` | Paso "Puertas 1 y 2" de la etapa 8: etapas 1 a 7 en verde sobre el commit |
| 2 | Despliegue y prueba de humo en staging | Cumple: corrida de staging [43027397938](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027397938) | `acta-promocion-v1.0.0-rc.1.md` y el mismo paso, que encuentra la corrida de staging del commit |
| 3 | Prueba de rendimiento sobre el tag candidato con resultado dentro de las metas de RNF-REN | Cumple: CR-REN-01, 02 y 05 cumplen; 03 y 04 son informativos. Medido en el runner, no en un servidor de piloto (24.2) | `informe-rendimiento.md`, apartado 4, sobre `v1.0.0-rc.1` |
| 4 | Acta de aceptación de la fase firmada por Product Owner y QA | **No cumple (NC-021):** ACT-F4-001 está lista para firma, sin firmar | `acta-aceptacion-fase-4.md` (ACT-F4-001), a firmar por FJMP en ambos papeles (NC-012) |
| 5 | Riesgos de nivel Alto mitigados o aceptados por escrito | Cumple, con la aceptación de quien produce (NC-012) | `docs/calidad/matriz-riesgos.md` |
| 6 | Inventario actualizado con tag, fecha, responsable de DevOps y dirección del piloto, y rollback verificado | **Cumple en parte (NC-022):** el inventario está al día. El rollback solo se ensayó en local (25 s), no en staging | `inventario-de-ambientes.md` §8; `docs/evidencias/ensayos/2026-11-11-restauracion-y-rollback.md` |

## 2. Criterios de liberación (sección 36.1)

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
| 1 | Etiqueta SemVer creada y notas de versión publicadas | Cumple: etiqueta anotada sobre `8e26059` | Etiqueta `v1.0.0` y `docs/gobierno/notas-version/v1.0.0.md` |
| 2 | Pruebas Must en verde y prueba de humo en staging satisfactoria | Cumple: reglas Must 24 de 24 | Etapas 3 a 5 y 7; humo del Anexo D en `acta-promocion-v1.0.0-rc.1.md` |
| 3 | Prueba de rendimiento dentro de las metas de RNF-REN | Cumple | Puerta 3 |
| 4 | Cero defectos críticos y riesgos de nivel Alto mitigados o aceptados por escrito | Cumple: ningún defecto crítico abierto. Queda abierto #107 (Media), cuya severidad confirma QA | Issues con severidad crítica; puerta 5 |
| 5 | Acta de aceptación de la fase firmada por Product Owner y QA | **No cumple (NC-021)** | Puerta 4 |
| 6 | Inventario de ambiente actualizado y procedimiento de rollback verificado | **Cumple en parte (NC-022)** | Puerta 6 |
| 7 | Credenciales de pago del piloto configuradas y verificadas, distintas de las de sandbox | **No cumple (NC-019).** No se puede cumplir con la pasarela simulada (CC-020): no hay credenciales de pago. La etapa 8 sí verificó los secretos propios del piloto: longitud mínima, que no aparecen en el repositorio, que la contraseña no es la del README y que la CA es válida. Registró su huella, no su valor: JWT `974cad2d1fe7a193` y semilla `7d93cea4bf0a01d5` | Paso "Secretos propios del piloto" de la etapa 8 |

No se despliega a piloto desde una máquina local (sección 31.2): la etapa 8 corre en GitHub Actions con el environment `piloto`.

## 3. Despliegue al piloto de ensayo

Corrida [43071987661](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43071987661), lanzada por la etiqueta `v1.0.0` y aprobada en el environment `piloto`. Terminó en verde de 17:50 a 17:54 UTC. Artefacto `despliegue-piloto-v1.0.0` (SHA-256 en `docs/evidencias/v1.0.0/corridas.md`).

| Qué | Resultado |
|---|---|
| Imágenes | Firmadas con cosign y verificadas antes de desplegar. `sce-api@sha256:44963d08…` y `sce-portal@sha256:3a1f2c3f…`, las mismas de staging |
| Respaldo previo | `antes-de-v1.0.0-20261111T175133Z.dump` |
| Migraciones | 6 aplicadas, con registro; `SEMILLA=0` |
| Anexo D, apartado 1 | `/salud` de API y web, HTTPS con TLS 1.2 y 1.3, redirección a HTTPS con HSTS, sin datos reales y accesos revisados: Cumple. Inicio de sesión, inscripción, consulta y pago: no aplican, porque el piloto no tiene usuarios |
| Base | Rechaza otras direcciones, conexiones sin TLS, TLS 1.1 y al superusuario por red. Roles con `LOGIN`: `postgres` (solo por socket), `sce_app` y `sce_monitor`. pgAudit registra el DDL. `/api/metricas` no sale por el proxy |
| ZAP pasivo | 0 fallos, 5 avisos, 63 reglas en verde |
| Humo k6 | p95 de 22.2 ms, 0 fallos, 100 % de comprobaciones |
| Playwright | No corre en piloto: necesita usuarios |

**Dirección:** `https://localhost` dentro del runner. El piloto de ensayo es efímero y dura lo que dura la corrida.

## 4. Desviaciones declaradas

- **NC-012:** FJMP lanza, aprueba y firma solo, sin revisión independiente.
- **NC-013:** la auditoría interna "Antes del piloto" (Tabla 60) no tiene auditor independiente.
- **CC-020 y NC-019:** el pago es simulado. El criterio 7 no se cumple.
- **NC-021:** la puerta 4 no se cumple; el acta de la fase 4 no está firmada.
- **NC-022:** la puerta 6 se cumple en parte; el rollback no se ensayó en staging.
- **Anexo A con salvedades (NC-020):** faltan SUS con participantes y la revisión con VoiceOver (CO-ACC-03).
- **Fase 5 sin facultad real:** el piloto de ensayo no tiene usuarios. La operación de un semestre, su auditoría de cierre y el dictamen final quedan preparados, no ejecutados.

## 5. Decisión

Se libera `v1.0.0` al piloto de ensayo, sin usuarios ni datos. Dos puertas no se cumplen del todo (4 y 6) y el criterio 7 no se cumple; cada caso tiene su NC con plan fechado. **No se libera a un piloto con usuarios** mientras sigan abiertas NC-019, NC-020, NC-021 y NC-022 (`dictamen-25040.md`, apartado 5).

El despliegue lo ordenó FJMP el 11 de noviembre de 2026 ("ya entreguemos el sistema"). El asistente de IA lanzó y aprobó la corrida con esa autorización. Las firmas quedan pendientes.

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| Product Owner | FJMP (NC-012) | Liberar al piloto de ensayo, con NC-019 a NC-022 | | |
| QA | FJMP (NC-012) | Liberar al piloto de ensayo, con NC-019 a NC-022 | | |
| DevOps | FJMP | Desplegado en la corrida 43071987661 | | |
