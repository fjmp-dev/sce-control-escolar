# Informe de la fase 2 — Alumnos

**Fuente:** SCE-MC-001 v2.0, secciones 7, 10, 11.3 y 38 (Tabla 59). **Criterio de auditoría:** AU-39.
**Estado: borrador,** con datos al 8 de noviembre de 2026, en la rama del Batch 6. Se actualiza a la etiqueta `v0.2.0` antes de firmar ACT-F2-001.

## 1. Qué se entregó

Lo describen `docs/gobierno/notas-version/v0.2.0.md` y la condición de la Tabla 23 en el acta. Son los Batches 4 a 6: PR #59, #60 y el del Batch 6, apilados sobre los de la fase 1. **Nada de esto está integrado todavía en `develop`.**

## 2. Tablero de indicadores (Tabla 59)

| Métrica | Meta | Valor en la fase 2 | Fuente |
|---|---|---|---|
| Densidad de defectos | Tendencia decreciente entre fases | **Sin dato:** cero defectos registrados, y los issues no llevan puntos de historia | GitHub Issues |
| Defectos críticos abiertos | Cero en piloto | 0 | GitHub Issues, etiqueta `defecto` |
| Cobertura de pruebas del dominio | Al menos 80 % | 100 % de líneas, con 99 pruebas unitarias | Artefacto `cobertura-unitarias`, corrida 42533743035 |
| Cobertura de reglas Must | 100 % antes del piloto | 13 de 24 completas, sin integrar | `reglas-de-negocio.md` |
| Vulnerabilidades altas abiertas | Cero antes de cada promoción | 0 en npm audit y en Trivy | Artefactos `calidad` y `trivy` |
| Inconsistencias de datos | Cero | 0 en CD-DAT-01, 04 y 05 y en la ocupación de grupos | Artefacto `calidad-datos` |
| Disponibilidad, percentil 95, tasa de conclusión | Piloto | No aplica en esta fase | Batches 13 y 14 |
| Tiempo medio de corrección de defectos altos | Hasta 5 días hábiles | Sin dato: ningún defecto alto registrado | GitHub Issues |

**Lectura del cero:** como en la fase 1, los fallos encontrados durante los batches se corrigieron antes de abrir el pull request y no se registraron como defectos. Hubo seis:
- dos DTO con el mismo nombre que Swagger fusionaba (#59);
- dos cargas simultáneas del mismo alumno que se pisaban (#60);
- un id que desbordaba la base (#60);
- el portal elegía mal el periodo con dos abiertos (#60);
- `db/pgaudit.sql` no corría en PostgreSQL 16 (Batch 6);
- una verificación del ensayo que no detectaba un rechazo (Batch 6).

Desde la primera aceptación, un fallo se registra como issue `defecto` (30.2).

## 3. Desviaciones

- **Calendario:** la fase abrió sin el acta de la fase 1 firmada (NC-009). CC-013, que es Mayor, se implementó sin aprobar, y su código no se fusiona hasta que se apruebe.
- **Separación de funciones:** la invitación de SJOM al repositorio caducó sin aceptarse. Nadie distinto del autor ha revisado los batches de la fase.
- **Staging sin servidores:** la configuración está ensayada, pero el humo del Anexo D sobre el ambiente real espera la decisión del proveedor.
- **Auditoría interna y revisión del manual:** pendientes. Ver el acta, apartado 9.

## 4. Lista de verificación de QA

La llena QA con la corrida de la etiqueta, no el autor.

| Verificación | Resultado | Evidencia |
|---|---|---|
| Condición de la Tabla 23 demostrada por rol en el ambiente de pruebas | | |
| Casos Must de la fase en verde sobre la etiqueta | | |
| Humo del Anexo D en staging sobre `v0.2.0-rc.N` | | |
| Muestreo de bitácora con `muestreo-bitacora.sql` | | |
| Matriz rol por endpoint repetida | | |
| Imágenes firmadas: `cosign verify` sobre los digests desplegados | | |
| Lo desplegado en staging corresponde a la etiqueta (15.3) | | |
| Sin datos reales en staging (`sin-datos-reales.sql`, RK-09) | | |
