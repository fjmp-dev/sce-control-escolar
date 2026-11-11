# Informe de fase — Fase 3, Académico

**Estado: borrador del autor al terminar el Batch 8.** Lo completa y lo firma QA con la corrida de la etiqueta `v0.3.0` (sección 10.4, Tabla 59).

## 1. Alcance entregado

- **RF-003 (Batch 7):** oferta por periodo, con grupos sin traslape de aula ni de profesor (D-13), publicación (CC-012) y consulta diferenciada por rol.
- **RF-004 (Batch 8):** captura por parcial solo en grupos asignados y en la ventana de captura (D-6, CC-019), con el valor anterior en bitácora; consulta inmediata del alumno.
- **RF-005 (Batch 8):** cierre por coordinación con recálculo del historial (D-5, D-8 y D-16), kárdex, exportación tabular y corrección posterior al cierre (D-17).

## 2. Tablero de indicadores (Tabla 59)

| Indicador | Meta | Valor en la rama | Fuente |
|---|---|---|---|
| Cobertura de pruebas del dominio | Al menos 80 % | Umbral de la etapa 3 en verde | Artefacto `cobertura-unitarias` |
| Cobertura de reglas Must | 100 % antes del piloto | 18 de 24 completas y 2 parciales | `reglas-de-negocio.md`, sección 2 |
| Defectos críticos abiertos | 0 | 0 | GitHub Issues |
| Recálculo del historial correcto | 100 % de cierres (Tabla 13) | 100 % sobre 30 expedientes | CD-DAT-02 |
| Operaciones sensibles con bitácora | 100 % | Captura, cierre, recálculo y corrección | CS-SEG-06 en calificación |

## 3. Desviaciones

- **Calendario:** la fase abrió sin las actas de las fases 1 y 2 firmadas (NC-010).
- **Reglas provisionales:** D-5, D-6, D-8, D-13, D-16 y D-17 las propone el equipo; el manual no fija cuántos parciales hay ni cómo se cierra con parciales faltantes.
- **Cambios sin aprobar:** CC-019 es Mayor; su código no se fusiona hasta que se apruebe.
- **Corrección posterior al cierre:** el motivo y la evidencia quedan en la bitácora, junto al valor anterior, sin una entidad propia; una entidad nueva requeriría otro CC.

## 4. Lista de verificación de QA

Pendiente de QA: casos del apartado 3 del acta, tablero, riesgos, línea base y evidencias copiadas.
