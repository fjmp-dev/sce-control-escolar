# Informe de la fase 1 — Núcleo institucional

**Fuente:** SCE-MC-001 v2.0, secciones 7, 10, 11.3 y 38 (Tabla 59). **Criterio de auditoría:** AU-39.
**Estado: borrador,** con datos al 6 de noviembre de 2026, en la rama del Batch 3. Se actualiza a la etiqueta `v0.1.0` antes de firmar ACT-F1-001.

## 1. Qué se entregó

Lo describen `docs/gobierno/notas-version/v0.1.0.md` y la condición de la Tabla 23 en el acta. Batches 0 a 3: PR #55, #56, #57 y el del Batch 3, apilados sobre el #30. **Nada de esto está integrado todavía en `develop`.**

## 2. Tablero de indicadores (Tabla 59)

| Métrica | Meta | Valor en la fase 1 | Fuente |
|---|---|---|---|
| Densidad de defectos | Tendencia decreciente entre fases | **Sin dato:** cero defectos registrados, y los issues no llevan puntos de historia. No se puede calcular todavía | GitHub Issues |
| Defectos críticos abiertos | Cero en piloto | 0 | GitHub Issues, etiqueta `defecto` |
| Cobertura de pruebas del dominio | Al menos 80 % | 100 % (48 de 48 líneas) | Artefacto `cobertura-unitarias` |
| Cobertura de reglas Must | 100 % antes del piloto | 4 de 24 completas y 1 parcial, sin integrar | `reglas-de-negocio.md` |
| Vulnerabilidades altas abiertas | Cero antes de cada promoción | 0 en npm audit y en Trivy | Artefactos `calidad` y `trivy` |
| Disponibilidad, percentil 95, inconsistencias de datos, tasa de conclusión | Piloto | No aplica en esta fase | Batches 5, 9 y 13 |
| Tiempo medio de corrección de defectos altos | Hasta 5 días hábiles | Sin dato: ningún defecto alto registrado | GitHub Issues |

**Lectura honesta del cero:** los fallos encontrados durante los batches se corrigieron antes de abrir el pull request, y no se registraron como defectos, porque aún no había entrega. A partir de la primera aceptación, un fallo se registra como issue `defecto` (30.2).

## 3. Desviaciones

- **Calendario:** la fase inició sin acta de fase 0 firmada (NC-002). El código se escribió antes de aprobarse los CC (NC-008), sin fusionarse. _(Corregido el 10 de noviembre de 2026: ese día el código se fusionó en `develop` con el PR #30, sin aprobación de los CC; NC-008.)_
- **Separación de funciones:** SJOM aceptó la invitación al repositorio el 10 de noviembre de 2026 y tiene permiso _write_, pero no revisó ni aprobó estos batches (NC-001, NC-012). Nadie distinto del autor los ha revisado. _(Corregido el 10 de noviembre de 2026: decía que SJOM no había aceptado la invitación.)_
- **Auditor interno y manual v2.1:** pendientes. Ver el acta, apartado 9.

## 4. Lista de verificación de QA

La llena QA con la corrida de la etiqueta, no el autor.

| Verificación | Resultado | Evidencia |
|---|---|---|
| Condición de la Tabla 23 demostrada por rol en el ambiente de pruebas | | |
| Casos Must de la fase en verde sobre la etiqueta | | |
| Muestreo de bitácora con `muestreo-bitacora.sql` | | |
| Matriz rol por endpoint repetida | | |
| Imágenes firmadas: `cosign verify` sobre los digests de la etiqueta | | |
| Lo desplegado corresponde a la etiqueta (15.3) | | |
