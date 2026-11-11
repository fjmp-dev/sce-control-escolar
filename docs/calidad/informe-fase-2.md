# Informe de la fase 2 — Alumnos

**Fuente:** SCE-MC-001 v2.0, secciones 7, 10, 11.3 y 38 (Tabla 59). **Criterio de auditoría:** AU-39.
**Estado: borrador,** con datos al 8 de noviembre de 2026, en la rama del Batch 6. Se actualiza a la etiqueta `v0.2.0` antes de firmar ACT-F2-001. El 10 de noviembre de 2026 (11.3) se llenaron la densidad de defectos y las líneas del dominio.

## 1. Qué se entregó

Lo describen `docs/gobierno/notas-version/v0.2.0.md` y la condición de la Tabla 23 en el acta. Son los Batches 4 a 6: PR #59, #60 y el del Batch 6, apilados sobre los de la fase 1. **Nada de esto está integrado todavía en `develop`.**

## 2. Tablero de indicadores (Tabla 59)

| Métrica | Meta | Valor en la fase 2 | Fuente |
|---|---|---|---|
| Densidad de defectos | Tendencia decreciente entre fases | 0 defectos entre 29 puntos = 0. _(Actualizado el 10 de noviembre de 2026, sub-batch 11.3: puntos de historia estimados después de construir, NC-016; criterio en `informe-fase-4.md`, apartado 2.)_ | GitHub Issues: etiquetas `defecto` y `fase-2`; puntos en #44, #45 y #46 |
| Defectos críticos abiertos | Cero en piloto | 0 | GitHub Issues, etiqueta `defecto` |
| Cobertura de pruebas del dominio | Al menos 80 % | 100 % de líneas (171 de 171, en 8 archivos de `dominio/`), con 99 pruebas unitarias | Artefacto `cobertura-unitarias`, corrida 42533743035 |
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

- **Calendario:** la fase abrió sin el acta de la fase 1 firmada (NC-009). CC-013, que es Mayor, se implementó sin aprobar, y su código no se fusiona hasta que se apruebe. _(Corregido el 10 de noviembre de 2026: ese día el código se fusionó en `develop` con el PR #30, antes de aprobarse CC-013; NC-008.)_
- **Separación de funciones:** la primera invitación de SJOM al repositorio caducó sin aceptarse. La segunda la aceptó el 10 de noviembre de 2026, con permiso _write_, pero SJOM no revisó ni aprobó ningún batch (NC-012). Nadie distinto del autor ha revisado los batches de la fase.
- **Staging efímero (CC-018):** no se rentan servidores; staging se arma en GitHub Actions con la topología de la Fig. 9 y corre el humo del Anexo D en cada pull request. Falta la corrida de la etapa 8 con `v0.2.0-rc.1`, que necesita las fusiones.
- **Auditoría interna y revisión del manual:** pendientes. Ver el acta, apartado 9.

## 4. Lista de verificación de QA

La llena QA con la corrida de la etiqueta, no el autor. **Nota del 10 de noviembre de 2026 (11.3):** la etiqueta `v0.2.0` es retroactiva y se crea en 11.4 (NC-015). La lista consolidada de las fases 1 a 4, llenada por FJMP como QA (NC-012), está en `informe-fase-4.md`, apartado 9. La auditoría de cierre de esta fase está en `auditoria-fase-2.md`.

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
