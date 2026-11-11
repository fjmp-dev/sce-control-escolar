# Acta de promoción a staging — `v0.4.0-rc.1`

**Formato:** Anexo D, sección 1 (humo en staging, puerta 2 de 20.1). Las secciones 2 y 3 del Anexo D son de la promoción a piloto y se llenan en 13.6 y 14.1.

**Etiqueta:** `v0.4.0-rc.1` · **Rama:** `release/0.4.0` · **Ambiente:** staging efímero en GitHub Actions (CC-018) · **Fecha:** 10 de noviembre de 2026 · **Responsable de DevOps:** FJMP

**Qué se promueve:** la fase 4, con pagos simulados, trámites, documentos y reportes. Notas: `docs/gobierno/notas-version/v0.4.0.md`.

## 1. Condiciones previas

| Condición | Resultado | Evidencia |
|---|---|---|
| CI en verde sobre el commit etiquetado, etapas 1 a 7 | Pendiente | Corrida de `release/0.4.0` |
| Imágenes `sce-api` y `sce-portal` firmadas por la etapa 6 para el commit | Pendiente | `cosign verify` en la etapa 8 |
| Cero defectos críticos abiertos (Tabla 40) | Cumple: #69 corregido en #71 | `registro-no-conformidades.md`, issues |
| Revisor del ambiente `staging` | FJMP, con autoaprobación (NC-012) | `inventario-de-ambientes.md` §3 |

## 2. Humo en staging

| Verificación | Resultado | Evidencia |
|---|---|---|
| Inicio de sesión de cada rol: alumno, profesor, control escolar, coordinación, caja, dirección y administrador | Pendiente | `scripts/humo.sh` |
| Inscripción: una confirmada y un rechazo por cada motivo | Pendiente | Newman, carpeta Contratos |
| Consulta de horario y de calificaciones | Pendiente | Newman |
| Pago con doble notificación que no duplica | Pendiente. **Pasarela simulada, no sandbox** (CC-020) | Newman, carpeta "Pagos, trámites y reportes" (CI-PAG-01) |
| `/salud` de la API y de la web | Pendiente | `scripts/humo.sh` |
| HTTPS con TLS 1.2 o superior | Pendiente | testssl.sh y ZAP pasivo |
| Sin matrículas reales del piloto (18.2, RK-09) | Pendiente | `sin-datos-reales.sql` |
| Accesos revisados y sin cuentas obsoletas | Pendiente | `accesos.sql`, revisado por FJMP en el papel de Seguridad |

## 3. Desviaciones declaradas

- **NC-012:** FJMP lanza, aprueba y firma solo, sin revisión independiente.
- **NC-014:** las figuras de CC-020 siguen pendientes y se actualizan en 13.1.
- **NC-015:** las fases 1 a 3 no pasaron por `release/x.y.z` ni por `main`. Sus etiquetas `v0.1.0` a `v0.3.0` son retroactivas, creadas el 10 de noviembre de 2026. Esta es la primera versión que sigue la Tabla 31.

## 4. Resultado

Corrida de la etapa 8: pendiente · Artefacto `despliegue-staging-v0.4.0-rc.1`: pendiente

## 5. Decisión

| Papel | Nombre | Decisión | Fecha |
|---|---|---|---|
| Product Owner, QA y DevOps | FJMP (NC-012) | Pendiente | |
