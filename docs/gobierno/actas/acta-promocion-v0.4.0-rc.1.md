# Acta de promoción a staging — `v0.4.0-rc.1`

**Formato:** Anexo D, sección 1 (humo en staging, puerta 2 de 20.1). Las secciones 2 y 3 del Anexo D son de la promoción a piloto y se llenan en 13.6 y 14.1.

**Etiqueta:** `v0.4.0-rc.1` · **Rama:** `release/0.4.0` · **Ambiente:** staging efímero en GitHub Actions (CC-018) · **Fecha:** 11 de noviembre de 2026 (acta preparada el 10) · **Responsable de DevOps:** FJMP

**Qué se promueve:** la fase 4, con pagos simulados, trámites, documentos y reportes. Notas: `docs/gobierno/notas-version/v0.4.0.md`.

## 1. Condiciones previas

| Condición | Resultado | Evidencia |
|---|---|---|
| CI en verde sobre el commit etiquetado, etapas 1 a 7 | Cumple: las siete etapas, y la 6 publicó y firmó las imágenes | Corrida [42976743183](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42976743183) sobre `b420d4d` |
| Imágenes `sce-api` y `sce-portal` firmadas por la etapa 6 para el commit | Cumple: firma verificada y etiqueta `v0.4.0-rc.1` añadida a los dos digests | `cosign verify` en la etapa 8 |
| Cero defectos críticos abiertos (Tabla 40) | Cumple: #69 corregido en #71 | `registro-no-conformidades.md`, issues |
| Revisor del ambiente `staging` | FJMP, con autoaprobación (NC-012) | `inventario-de-ambientes.md` §3 |

## 2. Humo en staging

| Verificación | Resultado | Evidencia |
|---|---|---|
| Inicio de sesión de cada rol: alumno, profesor, control escolar, coordinación, caja, dirección y administrador | Cumple: los siete roles entran en la API y en el portal | `scripts/humo.sh` |
| Inscripción: una confirmada y un rechazo por cada motivo | Cumple: Newman, 163 peticiones y 368 comprobaciones, 0 fallos | Newman, carpeta Contratos |
| Consulta de horario y de calificaciones | Cumple, en la misma corrida de Newman | Newman |
| Pago con doble notificación que no duplica | Cumple con **pasarela simulada, no sandbox** (CC-020) | Newman, carpeta "Pagos, trámites y reportes" (CI-PAG-01) |
| `/salud` de la API y de la web | Cumple | `scripts/humo.sh` |
| HTTPS con TLS 1.2 o superior | Cumple: solo TLS 1.2 y 1.3; HTTP redirige a HTTPS con HSTS. ZAP pasivo: 0 alertas altas y 6 avisos | testssl.sh y ZAP pasivo |
| Sin matrículas reales del piloto (18.2, RK-09) | Cumple | `sin-datos-reales.sql` |
| Accesos revisados y sin cuentas obsoletas | Cumple: 10 cuentas activas en los siete roles y 1 inactiva de profesor, todas sintéticas del seed | `accesos.sql`, revisado por FJMP en el papel de Seguridad |

## 3. Desviaciones declaradas

- **NC-012:** FJMP lanza, aprueba y firma solo, sin revisión independiente.
- **NC-014:** las figuras de CC-020 siguen pendientes y se actualizan en 13.1.
- **NC-015:** las fases 1 a 3 no pasaron por `release/x.y.z` ni por `main`. Sus etiquetas `v0.1.0` a `v0.3.0` son retroactivas, creadas el 10 de noviembre de 2026. Esta es la primera versión que sigue la Tabla 31.

## 4. Resultado

Corrida de la etapa 8: [42979816446](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/42979816446), en verde. FJMP la aprobó el 11 de noviembre de 2026 a la 01:30 (CST) y el trabajo duró 2 min 40 s.

El artefacto `despliegue-staging-v0.4.0-rc.1` guarda un respaldo previo (`antes-de-v0.4.0-rc.1-20261111T073054Z.dump`) y 5 migraciones aplicadas. También guarda la verificación de la base: SCRAM, TLS y pgAudit con el DDL registrado. La base rechazó conexiones desde otra dirección, sin TLS, con TLS 1.1 y como superusuario por red. El artefacto se copia a `docs/evidencias/fase-4/` al cerrar la fase.

## 5. Decisión

| Papel | Nombre | Decisión | Fecha |
|---|---|---|---|
| Product Owner, QA y DevOps | FJMP (NC-012) | Promovido a staging. Pasa a `main` como `v0.4.0` | 11 de noviembre de 2026 |
