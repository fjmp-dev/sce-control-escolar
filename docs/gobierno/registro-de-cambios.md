# Registro de cambios — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 16 (gestión de cambios) y 12.4 (control de cambios a requisitos).
**Vigente desde:** 22 de octubre de 2026.

Cada cambio tiene un issue en GitHub con la etiqueta `cambio`: ahí viven la solicitud, el análisis de impacto y la aprobación con fecha y responsable. Este archivo es el índice que se versiona junto con el código, para que el auditor lo encuentre sin entrar al tablero.

Ciclo (sección 16.2): solicitud → análisis de impacto → aprobación → implementación en rama con pull request y CI en verde → cierre con trazabilidad actualizada.

---

## Cambios registrados

| ID | Issue | Cambio | Tipo (Tabla 34) | Aprobación mínima | Implementado en | Estado |
|---|---|---|---|---|---|---|
| CC-001 | [#23](https://github.com/fjmp-dev/sce-control-escolar/issues/23) | Matriz de trazabilidad de 10 a 20 requisitos | Documental | PO y QA | `ab5c786` | Implementado en repositorio; pendiente de aprobación y de pasar al manual (#11) |
| CC-002 | [#24](https://github.com/fjmp-dev/sce-control-escolar/issues/24) | Reconciliación de los casos CS-SEG y casos del manual que faltaban en el catálogo | Documental | PO y QA | `ab5c786`, PR de fase 1 | Implementado en repositorio; pendiente de aprobación y de pasar al manual (#7) |
| CC-003 | [#25](https://github.com/fjmp-dev/sce-control-escolar/issues/25) | Entidad `periodo` en el modelo de datos | Normal | PO y QA | `ab5c786`, PR de fase 1 | Implementado; pendiente de aprobación y de pasar al manual (#10) |
| CC-004 | [#26](https://github.com/fjmp-dev/sce-control-escolar/issues/26) | Ajuste de restricciones de integridad al pasar a migraciones | Mayor o Must | PO, QA y Seguridad | PR de fase 1 | En revisión |
| CC-005 | [#27](https://github.com/fjmp-dev/sce-control-escolar/issues/27) | Auditoría de base de datos con pgAudit y autenticación SCRAM | Mayor o Must | PO, QA y Seguridad | PR de fase 1 | En revisión; requiere fila nueva en la Tabla 38 |
| CC-006 | [#28](https://github.com/fjmp-dev/sce-control-escolar/issues/28) | Versiones del stack y ambiente de pruebas | Normal | PO y QA | PR de fase 1 | En revisión; requiere actualizar tablas 7 y 42 |

Los seis cambios se integran al manual en la versión 2.1 (issue [#15](https://github.com/fjmp-dev/sce-control-escolar/issues/15)). Ninguno modifica un requisito RF o RNF, la política de calidad ni el alcance de la primera versión.

---

## Aprobaciones

Se llena al aprobar cada cambio. Quien aprueba no es quien solicitó el cambio (`docs/gobierno/metodologia-de-trabajo.md`, sección 1).

| ID | Decisión | Aprobó (PO) | Aprobó (QA) | Aprobó (Seguridad, si aplica) | Fecha |
|---|---|---|---|---|---|
| CC-001 | | | | No aplica | |
| CC-002 | | | | No aplica | |
| CC-003 | | | | No aplica | |
| CC-004 | | | | | |
| CC-005 | | | | | |
| CC-006 | | | | No aplica | |
