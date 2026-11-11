# Acta de promoción a staging — `v1.0.0-rc.1`

**Formato:** Anexo D, sección 1 (humo en staging, puerta 2 de 20.1). La sección 2 del Anexo D, promoción a piloto, va en el acta de liberación de `v1.0.0` (14.1).

**Etiqueta:** `v1.0.0-rc.1` · **Rama:** `release/1.0.0` · **Ambiente:** staging efímero en GitHub Actions (CC-018) · **Fecha:** pendiente · **Responsable de DevOps:** FJMP

**Qué se promueve:** el primer candidato de `v1.0.0`, que reúne:

- las fases 1 a 4, con pagos simulados;
- la calidad transversal del Batch 12: compatibilidad, accesibilidad, ZAP completo y Parte B;
- el Batch 13: piloto de ensayo, continuidad, monitoreo, rendimiento y segunda facultad.

Es la primera candidata que pasa por las seis puertas de 20.1 antes de llegar al piloto de ensayo.

**Commit:** el de la fusión del pull request que trae esta acta junto con la de rc.2 y la de liberación. `release/1.0.0` se cortó en `5385940`, pero su etapa 7 falló dos veces en Lighthouse con `NO_NAVSTART`, un error de traza que Lighthouse pide repetir. En `develop` el mismo commit pasó. La candidata va sobre el commit que reintenta la medición.

## 1. Condiciones previas

| Condición | Resultado | Evidencia |
|---|---|---|
| CI en verde sobre el commit etiquetado, etapas 1 a 7 | Pendiente | Corrida de `release/1.0.0` |
| Imágenes `sce-api` y `sce-portal` firmadas por la etapa 6 para el commit | Pendiente | `cosign verify` en la etapa 8 |
| Cero defectos críticos abiertos (Tabla 40) | Pendiente | Issues con etiqueta de severidad crítica |
| Revisor del ambiente `staging` | FJMP, con autoaprobación (NC-012) | `inventario-de-ambientes.md` §3 |

## 2. Humo en staging

La tabla del Anexo D la escribe `scripts/verificar-staging.sh` en el resumen de la corrida (13.1). Aquí se copia su resultado.

| Verificación | Resultado | Evidencia |
|---|---|---|
| Inicio de sesión de cada rol: alumno, profesor, control escolar, coordinación, caja, dirección y administrador | Pendiente | `scripts/humo.sh` |
| Inscripción: una confirmada y un rechazo por cada motivo | Pendiente | Newman, carpeta Contratos |
| Consulta de horario y de calificaciones | Pendiente | Newman |
| Pago con doble notificación que no duplica | Pendiente. **Pasarela simulada, no sandbox** (CC-020) | Newman, carpeta "Pagos, trámites y reportes" (CI-PAG-01) |
| Segunda facultad sin migración estructural (CO-FLE-01) | Pendiente | `co-fle-01.sql` y Newman, carpeta CO-FLE-01 |
| `/salud` de la API y de la web | Pendiente | `scripts/humo.sh` |
| HTTPS con TLS 1.2 o superior | Pendiente | testssl.sh y ZAP pasivo |
| Sin matrículas reales del piloto (18.2, RK-09) | Pendiente | `sin-datos-reales.sql` |
| Accesos revisados y sin cuentas obsoletas | Pendiente | `accesos.sql`, revisado por FJMP en el papel de Seguridad |
| Calidad de datos después del despliegue | Pendiente | Great Expectations (CD-DAT-01 a 06) |
| Matriz de compatibilidad, proyectos Must (CO-COM-01) | Pendiente | Playwright, `matriz-compatibilidad.md` del artefacto |
| Humo de rendimiento con los umbrales de la Tabla 46 | Pendiente | k6, `reportes/staging/k6/humo.json` |

## 3. Rendimiento sobre esta candidata (sec. 24, 13.6)

CR-REN-01 a 05 corren después de la promoción con `rendimiento.yml`, sobre las imágenes de esta etiqueta. Sus registros van a `docs/calidad/informe-rendimiento.md`, apartado 4.

| Caso | Resultado | Corrida |
|---|---|---|
| CR-REN-01, mediana de tres | Pendiente | |
| CR-REN-02, mediana de tres | Pendiente | |
| CR-REN-03 | Pendiente (informativo) | |
| CR-REN-04 | Pendiente (informativo) | |
| CR-REN-05 | Pendiente | |

## 4. Desviaciones declaradas

- **NC-012:** FJMP lanza, aprueba y firma solo, sin revisión independiente.
- **NC-001:** ningún pull request de esta versión tiene la aprobación de otro integrante.
- **CC-020:** el pago es simulado. El piloto no puede cobrar así.
- **Anexo A incompleto para `v1.0.0` (8.4-2):** faltan SUS con participantes y la revisión con VoiceOver (CO-ACC-03). Rendimiento y continuidad se aceptan con esta candidata y la siguiente.
- **Rollback:** no aplica a rc.1, porque no hay candidata anterior. Se ensaya en la etapa 8 de rc.2 (13.2).

## 5. Resultado

Corrida de la etapa 8: pendiente · Artefacto `despliegue-staging-v1.0.0-rc.1`: pendiente

## 6. Decisión

| Papel | Nombre | Decisión | Fecha |
|---|---|---|---|
| Product Owner, QA y DevOps | FJMP (NC-012) | Pendiente | |
