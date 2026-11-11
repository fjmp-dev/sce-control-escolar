# Acta de promoción a staging — `v1.0.0-rc.1`

**Formato:** Anexo D, sección 1 (humo en staging, puerta 2 de 20.1). La sección 2 del Anexo D, promoción a piloto, va en el acta de liberación de `v1.0.0` (14.1).

**Etiqueta:** `v1.0.0-rc.1` · **Rama:** `release/1.0.0` · **Ambiente:** staging efímero en GitHub Actions (CC-018) · **Fecha:** 11 de noviembre de 2026, 13:15 a 13:25 UTC · **Responsable de DevOps:** FJMP

**Qué se promueve:** el primer candidato de `v1.0.0`, que reúne:

- las fases 1 a 4, con pagos simulados;
- la calidad transversal del Batch 12: compatibilidad, accesibilidad, ZAP completo y Parte B;
- el Batch 13: piloto de ensayo, continuidad, monitoreo, rendimiento y segunda facultad.

Es la primera candidata que pasa por las seis puertas de 20.1 antes de llegar al piloto de ensayo.

**Commit:** `8e26059`, la fusión del PR #105, que trae esta acta junto con la de rc.2 y la de liberación. `release/1.0.0` se cortó en `5385940`, pero su etapa 7 falló dos veces en Lighthouse con `NO_NAVSTART`, un error de traza que Lighthouse pide repetir. En `develop` el mismo commit pasó. La candidata va sobre el commit que reintenta la medición.

## 1. Condiciones previas

| Condición | Resultado | Evidencia |
|---|---|---|
| CI en verde sobre el commit etiquetado, etapas 1 a 7 | Cumple | Corrida [43022020442](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43022020442) de `release/1.0.0` |
| Imágenes `sce-api` y `sce-portal` firmadas por la etapa 6 para el commit | Cumple. API `sha256:44963d08…98574ba`, portal `sha256:3a1f2c3f…a305f200` | `cosign verify` en la etapa 8; `despliegue.md` |
| Cero defectos críticos abiertos (Tabla 40) | Cumple: 0 abiertos | Issues con la etiqueta `sev-critica` |
| Revisor del ambiente `staging` | FJMP, con autoaprobación (NC-012) | `inventario-de-ambientes.md` §3 |

## 2. Humo en staging

La tabla del Anexo D la escribe `scripts/verificar-staging.sh` en el resumen de la corrida (13.1). Aquí se copia su resultado.

| Verificación | Resultado | Evidencia |
|---|---|---|
| Inicio de sesión de cada rol: alumno, profesor, control escolar, coordinación, caja, dirección y administrador | Cumple: 7 roles, API y portal | `scripts/humo.sh` |
| Inscripción: una confirmada y un rechazo por cada motivo | Cumple: prerrequisito, adeudo, choque y cupo | Newman: 177 peticiones y 384 aserciones, sin fallas |
| Consulta de horario y de calificaciones | Cumple | Newman |
| Pago con doble notificación que no duplica | Cumple. **Pasarela simulada, no sandbox** (CC-020) | Newman, carpeta "Pagos, trámites y reportes" (CI-PAG-01) |
| Segunda facultad sin migración estructural (CO-FLE-01) | Cumple: F3 dada de alta y completa, con las 6 migraciones de siempre | `co-fle-01.sql` y Newman, carpeta CO-FLE-01 |
| `/salud` de la API y de la web | Cumple | `scripts/humo.sh` |
| HTTPS con TLS 1.2 o superior | Cumple: solo TLS 1.2 y 1.3; HTTP redirige a HTTPS con HSTS. ZAP pasivo: 0 fallas, 5 avisos, 63 reglas en verde | testssl.sh y ZAP pasivo |
| Sin matrículas reales del piloto (18.2, RK-09) | Cumple: 0 filas | `sin-datos-reales.sql` |
| Accesos revisados y sin cuentas obsoletas | Cumple. La base rechaza conexiones sin TLS, con TLS 1.1 y de superusuario por red; roles con LOGIN: `sce_app` y `sce_monitor`, sin atributos de más | `accesos.sql`, revisado por FJMP en el papel de Seguridad |
| Calidad de datos después del despliegue | Cumple: 33 de 33 expectativas | Great Expectations (CD-DAT-01 a 06) |
| Matriz de compatibilidad, proyectos Must (CO-COM-01) | Cumple: 5 de 5 Must con 13 pruebas cada uno, sin fallas; Firefox y Edge (Should), 12 de 12 | Playwright, `matriz-compatibilidad.md` del artefacto |
| Humo de rendimiento con los umbrales de la Tabla 46 | Cumple: p95 de 23 ms, 0 % de fallos, 100 % de verificaciones | k6, `reportes/staging/k6/humo.json` |

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

Corrida de la etapa 8: [43027397938](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027397938), en verde. Artefacto `despliegue-staging-v1.0.0-rc.1`, con 90 días de retención; la copia con SHA-256 está en `docs/evidencias/v1.0.0/corridas.md`.

**Hallazgo de la promoción:** al ponerle la etiqueta SemVer a las imágenes, `imagetools create` envolvió el manifiesto firmado en un índice nuevo, con otro digest y sin firma. El despliegue usó el digest firmado y no se vio afectado. Sí falló la primera tanda de CR-REN, que tomaba el digest de la etiqueta. Se corrige en rc.2.

## 6. Decisión

| Papel | Nombre | Decisión | Fecha |
|---|---|---|---|
| Product Owner, QA y DevOps | FJMP (NC-012) | Se promueve: el humo del Anexo D y la matriz Must están en verde. El rendimiento (§3) se informa aparte | 11 de noviembre de 2026 |
