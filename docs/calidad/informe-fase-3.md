# Informe de fase — Fase 3, Académico

**Estado: borrador del autor al terminar el Batch 8.** Lo completa y lo firma QA con la corrida de la etiqueta `v0.3.0` (sección 10.4, Tabla 59). El 10 de noviembre de 2026 (11.3) se llenaron la cobertura del dominio, la densidad y las vulnerabilidades.

## 1. Alcance entregado

- **RF-003 (Batch 7):** oferta por periodo, con grupos sin traslape de aula ni de profesor (D-13), publicación (CC-012) y consulta diferenciada por rol.
- **RF-004 (Batch 8):** captura por parcial solo en grupos asignados y en la ventana de captura (D-6, CC-019), con el valor anterior en bitácora; consulta inmediata del alumno.
- **RF-005 (Batch 8):** cierre por coordinación con recálculo del historial (D-5, D-8 y D-16), kárdex, exportación tabular y corrección posterior al cierre (D-17).

## 2. Tablero de indicadores (Tabla 59)

| Indicador | Meta | Valor en la rama | Fuente |
|---|---|---|---|
| Cobertura de pruebas del dominio | Al menos 80 % | 100 % (245 de 245 líneas, en 10 archivos de `dominio/`) | Artefacto `cobertura-unitarias` de la corrida 42908827649, cabeza del PR #63 |
| Densidad de defectos | Tendencia decreciente entre fases | 0 defectos entre 21 puntos = 0. _(Actualizado el 10 de noviembre de 2026, sub-batch 11.3: puntos de historia estimados después de construir, NC-016; criterio en `informe-fase-4.md`, apartado 2.)_ | GitHub Issues: etiquetas `defecto` y `fase-3`; puntos en #47 y #48 |
| Vulnerabilidades altas abiertas | Cero antes de cada promoción | 0 en npm audit y en Trivy | Artefactos `calidad` y `trivy` de la corrida 42908827649 |
| Cobertura de reglas Must | 100 % antes del piloto | 18 de 24 completas y 2 parciales | `reglas-de-negocio.md`, sección 2 |
| Defectos críticos abiertos | 0 | 0 | GitHub Issues |
| Recálculo del historial correcto | 100 % de cierres (Tabla 13) | 100 % sobre 30 expedientes | CD-DAT-02 |
| Operaciones sensibles con bitácora | 100 % | Captura, cierre, recálculo y corrección | CS-SEG-06 en calificación |

## 3. Desviaciones

- **Calendario:** la fase abrió sin las actas de las fases 1 y 2 firmadas (NC-010).
- **Reglas provisionales:** D-5, D-6, D-8, D-13, D-16 y D-17 las propone el equipo; el manual no fija cuántos parciales hay ni cómo se cierra con parciales faltantes.
- **Cambios sin aprobar:** CC-019 es Mayor; su código no se fusiona hasta que se apruebe. _(Corregido el 10 de noviembre de 2026: ese día el código se fusionó en `develop` con el PR #30, antes de aprobarse CC-019; NC-008.)_
- **Corrección posterior al cierre:** el motivo y la evidencia quedan en la bitácora, junto al valor anterior, sin una entidad propia; una entidad nueva requeriría otro CC.

## 4. Lista de verificación de QA

Pendiente de QA: casos del apartado 3 del acta, tablero, riesgos, línea base y evidencias copiadas. **Nota del 10 de noviembre de 2026 (11.3):** la etiqueta `v0.3.0` es retroactiva y se crea en 11.4 (NC-015). La lista consolidada de las fases 1 a 4, llenada por FJMP como QA (NC-012), está en `informe-fase-4.md`, apartado 9.
