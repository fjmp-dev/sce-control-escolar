# Registro de cambios — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 16 (gestión de cambios) y 12.4 (control de cambios a requisitos).
**Vigente desde:** 22 de octubre de 2026. **Actualizado:** 5 de noviembre de 2026.

Cada cambio tiene un issue en GitHub con la etiqueta `cambio`, con la solicitud, el análisis de impacto y la aprobación con fecha y responsable. Desde CC-007, la solicitud también está versionada en `docs/gobierno/cambios/`. Este archivo es el índice que se versiona junto con el código, para que el auditor lo encuentre sin entrar al tablero.

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
| CC-007 | [#32](https://github.com/fjmp-dev/sce-control-escolar/issues/32) | Rol técnico `administrador` | Mayor o Must | PO, QA y Seguridad | Batches 2 y 3 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-008 | [#33](https://github.com/fjmp-dev/sce-control-escolar/issues/33) | `documento.contenido`, contenido inmutable del documento | Mayor o Must | PO y QA | Batch 10 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-009 | [#34](https://github.com/fjmp-dev/sce-control-escolar/issues/34) | `tramite.motivo_rechazo` | Mayor o Must | PO y QA | Batch 10 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-010 | [#35](https://github.com/fjmp-dev/sce-control-escolar/issues/35) | `usuario.sesion_version`, revocación de sesión | Mayor o Must | PO, QA y Seguridad | Batch 2 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-011 | [#36](https://github.com/fjmp-dev/sce-control-escolar/issues/36) | `pago.fecha_confirmacion` | Mayor o Must | PO y QA | Batch 9 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-012 | [#37](https://github.com/fjmp-dev/sce-control-escolar/issues/37) | `periodo.oferta_publicada_en`, publicar oferta | Normal | PO y QA | Batches 5 y 7 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-013 | [#38](https://github.com/fjmp-dev/sce-control-escolar/issues/38) | Persistir el rechazo de la inscripción | Mayor o Must | PO y QA | Batch 5 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-014 | [#39](https://github.com/fjmp-dev/sce-control-escolar/issues/39) | Dependencias en las Figuras 2 y 9 | Documental | PO y QA | Batch 0 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-015 | [#40](https://github.com/fjmp-dev/sce-control-escolar/issues/40) | Usuario técnico sin rol | Mayor o Must | PO, QA y Seguridad | Batch 2 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |

Estos cambios se integran al manual en la versión 2.1 (issue [#15](https://github.com/fjmp-dev/sce-control-escolar/issues/15)). Ninguno modifica un requisito RF o RNF, la política de calidad ni el alcance de la primera versión.

**Enmiendas del 5 de noviembre de 2026:** CC-002 pasa a la numeración de la Tabla 49 (`cambios/CC-002-enmienda.md`). CC-006 se amplía con Next.js 16 y React 19, y retira la sustitución de Testcontainers y PostgreSQL 18 local (`cambios/CC-006-enmienda.md`).

**Desviación registrada:** CC-001 a CC-006 se implementaron antes de aprobarse (NC-008).

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
| CC-007 | | | | | |
| CC-008 | | | | No aplica | |
| CC-009 | | | | No aplica | |
| CC-010 | | | | | |
| CC-011 | | | | No aplica | |
| CC-012 | | | | No aplica | |
| CC-013 | | | | No aplica | |
| CC-014 | | | | No aplica | |
| CC-015 | | | | | |
