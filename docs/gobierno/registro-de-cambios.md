# Registro de cambios — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 16 (gestión de cambios) y 12.4 (control de cambios a requisitos).
**Vigente desde:** 22 de octubre de 2026. **Actualizado:** 10 de noviembre de 2026 (Batch 7 y CC-018).

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
| CC-005 | [#27](https://github.com/fjmp-dev/sce-control-escolar/issues/27) | Auditoría de base de datos con pgAudit y autenticación SCRAM | Mayor o Must | PO, QA y Seguridad | PR de fase 1; staging en el Batch 6 | En revisión; requiere fila nueva en la Tabla 38. Activo en la configuración de staging desde el Batch 6 |
| CC-006 | [#28](https://github.com/fjmp-dev/sce-control-escolar/issues/28) | Versiones del stack y ambiente de pruebas | Normal | PO y QA | PR de fase 1 | En revisión; requiere actualizar tablas 7 y 42 |
| CC-007 | [#32](https://github.com/fjmp-dev/sce-control-escolar/issues/32) | Rol técnico `administrador` | Mayor o Must | PO, QA y Seguridad | Batches 2 y 3 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-008 | [#33](https://github.com/fjmp-dev/sce-control-escolar/issues/33) | `documento.contenido`, contenido inmutable del documento | Mayor o Must | PO y QA | Batch 10 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-009 | [#34](https://github.com/fjmp-dev/sce-control-escolar/issues/34) | `tramite.motivo_rechazo` | Mayor o Must | PO y QA | Batch 10 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-010 | [#35](https://github.com/fjmp-dev/sce-control-escolar/issues/35) | `usuario.sesion_version`, revocación de sesión | Mayor o Must | PO, QA y Seguridad | Batch 2 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-011 | [#36](https://github.com/fjmp-dev/sce-control-escolar/issues/36) | `pago.fecha_confirmacion` | Mayor o Must | PO y QA | Batch 9 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-012 | [#37](https://github.com/fjmp-dev/sce-control-escolar/issues/37) | `periodo.oferta_publicada_en`, publicar oferta | Normal | PO y QA | Batches 5 y 7 | Implementado en el Batch 7 (migración `20261110120000_oferta_publicada`); pendiente de aprobación. Figuras ya actualizadas |
| CC-013 | [#38](https://github.com/fjmp-dev/sce-control-escolar/issues/38) | Persistir el rechazo de la inscripción | Mayor o Must | PO y QA | Batch 5 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-014 | [#39](https://github.com/fjmp-dev/sce-control-escolar/issues/39) | Dependencias en las Figuras 2 y 9 | Documental | PO y QA | Batch 0 | Solicitado; pendiente de aprobación. Figuras ya actualizadas; ampliado en los batches 2, 4 y 7 |
| CC-015 | [#40](https://github.com/fjmp-dev/sce-control-escolar/issues/40) | Usuario técnico sin rol | Mayor o Must | PO, QA y Seguridad | Batch 2 | Solicitado; pendiente de aprobación. Figuras ya actualizadas |
| CC-016 | Sin issue: `cambios/CC-016.md` | Operación `cambiarEstatus` del alumno en la Fig. 3 | Documental | PO y QA | Batch 4 | Solicitado; pendiente de aprobación. Figura ya actualizada |
| CC-017 | Sin issue: `cambios/CC-017.md` | Operaciones de la Fig. 6 en la clase `Inscripcion` de la Fig. 3 | Documental | PO y QA | Batch 5 | Solicitado; pendiente de aprobación. Figura ya actualizada |
| CC-018 | Sin issue: `cambios/CC-018.md` | Staging efímero en GitHub Actions, sin servidores rentados; túnel gratuito solo cuando haga falta URL pública | Normal | PO y QA | Batch 6 | Implementado en el Batch 6; pendiente de aprobación |

Estos cambios se integran al manual en la versión 2.1 (issue [#15](https://github.com/fjmp-dev/sce-control-escolar/issues/15)). Ninguno modifica un requisito RF o RNF, la política de calidad ni el alcance de la primera versión.

**Enmiendas del 5 de noviembre de 2026:** CC-002 pasa a la numeración de la Tabla 49 (`cambios/CC-002-enmienda.md`). CC-006 se amplía con Next.js 16 y React 19, y retira la sustitución de Testcontainers y PostgreSQL 18 local (`cambios/CC-006-enmienda.md`). El retiro se implementó en el Batch 1 ([#41](https://github.com/fjmp-dev/sce-control-escolar/issues/41)): las pruebas usan Testcontainers y Compose usa PostgreSQL 16. Versiones adoptadas: `plan-de-pruebas.md`, sección 4.

**Implementación del 6 de noviembre de 2026 (Batch 2, [#42](https://github.com/fjmp-dev/sce-control-escolar/issues/42)):** CC-007, CC-010 y CC-015, en la migración `20261106120000_identidad_y_bitacora` y los módulos `identidad/`, `bitacora/` y `academico/`. **Su código no se fusiona sin la aprobación de la tabla de abajo.** CC-014 y CC-015 se ampliaron: la Fig. 2 dibuja la dependencia del gateway hacia persistencia para `/salud`, y el usuario técnico también firma los accesos fallidos.

**Implementación del 6 de noviembre de 2026 (Batch 3, [#43](https://github.com/fjmp-dev/sce-control-escolar/issues/43)):** Next.js 16 y React 19 (CC-006) en `web/`, y la conexión del servidor Next.js a la API (CC-014). Versiones adoptadas: `plan-de-pruebas.md`, sección 4. Prerrequisitos en la API y regla de no circularidad: no cambia el modelo de datos.

**Implementación del 7 de noviembre de 2026 (Batch 4, [#44](https://github.com/fjmp-dev/sce-control-escolar/issues/44)):** expediente único (RF-001) sin cambios al modelo de datos. CC-014 se amplía con la dependencia del expediente hacia identidad, y CC-016 añade `cambiarEstatus` a la Fig. 3. **El batch abre la fase 2 sin el acta de la fase 1 firmada:** NC-009.

**Implementación del 8 de noviembre de 2026 (Batch 5, [#45](https://github.com/fjmp-dev/sce-control-escolar/issues/45)):** inscripción (RF-002, RNF-USU-001) sin cambios al modelo de datos. CC-013 se implementa: el rechazo se guarda con su motivo y su carga en una transacción aparte. CC-017 añade a la Fig. 3 las transiciones de la Fig. 6. De CC-012 solo se usa la oferta mínima en consulta: `oferta_publicada_en` y la publicación llegan en el Batch 7, así que por ahora el alumno ve todos los grupos del periodo abierto. **El código de CC-013, Mayor, no se fusiona sin su aprobación,** y el batch sigue en la fase 2 sin el acta de la fase 1 (NC-009).

**Implementación del 8 de noviembre de 2026 (Batch 6, [#46](https://github.com/fjmp-dev/sce-control-escolar/issues/46)):** staging con la topología de la Fig. 9, sin cambios al modelo de datos ni a las figuras. CC-005 se activa en staging: pgAudit, SCRAM y conexiones solo por TLS. `db/pgaudit.sql` fallaba en PostgreSQL 16 y se corrigió. El 10 de noviembre de 2026, FJMP decidió no rentar servidores (CC-018): la Tabla 30 no los exige para staging, que pasa a armarse en GitHub Actions en cada despliegue, con la misma topología y la misma verificación.

**Implementación del 10 de noviembre de 2026 (Batch 7, [#47](https://github.com/fjmp-dev/sce-control-escolar/issues/47)):** oferta y horarios (RF-003). CC-012 se implementa con la migración `20261110120000_oferta_publicada`, una columna opcional: el periodo se abre sin oferta, coordinación define los grupos y la publica, y solo entonces el alumno la ve y se inscribe. CC-014 se amplía con la dependencia de académico hacia identidad para el profesor del grupo (Fig. 2). D-13 se aplica como provisional. `Periodo.cerrar()` de la Fig. 3 llega con el cierre del Batch 8, que es su único uso. **El batch abre la fase 3 sin las actas de las fases 1 y 2 firmadas:** NC-010.

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
| CC-016 | | | | No aplica | |
| CC-017 | | | | No aplica | |
| CC-018 | | | | No aplica | |
