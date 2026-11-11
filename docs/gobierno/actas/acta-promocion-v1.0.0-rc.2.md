# Acta de promoción a staging — `v1.0.0-rc.2`

**Formato:** Anexo D, sección 1 (humo en staging, puerta 2 de 20.1). La sección 2 del Anexo D, promoción a piloto, va en el acta de liberación de `v1.0.0` (14.1).

**Etiqueta:** `v1.0.0-rc.2` (no se creó) · **Rama:** `release/1.0.0` · **Ambiente:** staging efímero en GitHub Actions (CC-018) · **Fecha:** no aplica · **Responsable de DevOps:** FJMP

> **Estado: no se ejecutó (11 de noviembre de 2026).**
> - El PR #106, que preparaba esta candidata, se fusionó a `release/1.0.0` a las 17:37 UTC (`5a304fb`).
> - Antes, su etapa 7 falló cinco veces desde las 13:30 UTC: el DNS de los runners de GitHub no resolvía los servidores de Ubuntu, y la instalación de navegadores de Playwright se colgaba o fallaba. GitHub no reportaba incidente. El arreglo es `scripts/navegadores.sh`.
> - A las 17:30 UTC el Product Owner decidió entregar sin esta candidata: `v1.0.0` va sobre el commit de rc.1, que ya había pasado staging.
>
> El rollback hacia rc.1 no se ensayó en staging. Queda el ensayo local del 11 de noviembre (`docs/evidencias/ensayos/2026-11-11-restauracion-y-rollback.md`), y la desviación es NC-022. Las tablas siguientes quedan sin resultados.

**Qué se promueve:** el segundo candidato de `v1.0.0`. Sobre `v1.0.0-rc.1` agrega los resultados de su promoción y dos correcciones de flujos: la etiqueta SemVer de las imágenes como copia exacta del manifiesto firmado, y `rendimiento.yml` resuelto por ese manifiesto. No cambia la aplicación. Su función es ensayar el rollback hacia rc.1 (puerta 6). `v1.0.0` va sobre el commit de rc.1, que es el que se midió con CR-REN.

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

## 3. Rollback ensayado (sec. 20.2; puerta 6 de 20.1)

La etapa 8 despliega `v1.0.0-rc.1`, luego esta candidata, vuelve a `v1.0.0-rc.1` con `scripts/rollback.sh` y el respaldo previo, y despliega esta otra vez. `rollback.md` del artefacto lleva los tiempos.

| Paso | Resultado | Evidencia |
|---|---|---|
| Respaldo antes de desplegar la nueva candidata | Pendiente | `rollback.md` |
| Vuelta a `v1.0.0-rc.1` con su humo en verde | Pendiente | `rollback.md` |
| Tiempo de rollback contra RTO < 4 h (RNF-FIA-002) | Pendiente | `rollback.md` |
| Esta candidata otra vez, con humo en verde | Pendiente | `anexo-d.md` |

## 4. Rendimiento sobre esta candidata (sec. 24, 13.6)

CR-REN-01 a 05 corren después de la promoción con `rendimiento.yml`, sobre las imágenes de esta etiqueta. Sus registros van a `docs/calidad/informe-rendimiento.md`, apartado 4.

| Caso | Resultado | Corrida |
|---|---|---|
| CR-REN-01, mediana de tres | Pendiente | |
| CR-REN-02, mediana de tres | Pendiente | |
| CR-REN-03 | Pendiente (informativo) | |
| CR-REN-04 | Pendiente (informativo) | |
| CR-REN-05 | Pendiente | |

## 5. Desviaciones declaradas

- **NC-012:** FJMP lanza, aprueba y firma solo, sin revisión independiente.
- **NC-001:** ningún pull request de esta versión tiene la aprobación de otro integrante.
- **CC-020:** el pago es simulado. El piloto no puede cobrar así.
- **Anexo A incompleto para `v1.0.0` (8.4-2):** faltan SUS con participantes y la revisión con VoiceOver (CO-ACC-03). Rendimiento y continuidad se miden con esta candidata.

## 6. Resultado

Corrida de la etapa 8: pendiente · Artefacto `despliegue-staging-v1.0.0-rc.2`: pendiente

## 7. Decisión

| Papel | Nombre | Decisión | Fecha |
|---|---|---|---|
| Product Owner, QA y DevOps | FJMP (NC-012) | No se promueve: la candidata no se etiquetó. Decisión registrada por el asistente de IA con la instrucción de FJMP de entregar sin rc.2; FJMP la confirma al firmar el acta de liberación | 11 de noviembre de 2026 |
