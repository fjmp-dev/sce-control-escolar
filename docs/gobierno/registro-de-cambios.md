# Registro de cambios — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 16 (gestión de cambios) y 12.4 (control de cambios a requisitos).
**Vigente desde:** 22 de octubre de 2026. **Actualizado:** 11 de noviembre de 2026 (sub-batch 12.1).

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
| CC-007 | [#32](https://github.com/fjmp-dev/sce-control-escolar/issues/32) | Rol técnico `administrador` | Mayor o Must | PO, QA y Seguridad | Batches 2 y 3 | Implementado en los batches 2 y 3 y fusionado en `develop` el 10 de noviembre de 2026; **sigue pendiente de aprobación** (NC-008). Figuras ya actualizadas |
| CC-008 | [#33](https://github.com/fjmp-dev/sce-control-escolar/issues/33) | `documento.contenido`, contenido inmutable del documento | Mayor o Must | PO y QA | Batch 9 | Implementado en el Batch 9 (migración `20261110140000_tramites`) y fusionado en `develop` el 10 de noviembre de 2026; **sigue pendiente de aprobación** (NC-008). Figuras ya actualizadas |
| CC-009 | [#34](https://github.com/fjmp-dev/sce-control-escolar/issues/34) | `tramite.motivo_rechazo` | Mayor o Must | PO y QA | Batch 9 | Implementado en el Batch 9 (migración `20261110140000_tramites`) y fusionado en `develop` el 10 de noviembre de 2026; **sigue pendiente de aprobación** (NC-008). Figuras ya actualizadas |
| CC-010 | [#35](https://github.com/fjmp-dev/sce-control-escolar/issues/35) | `usuario.sesion_version`, revocación de sesión | Mayor o Must | PO, QA y Seguridad | Batch 2 | Implementado en el Batch 2; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008). Figuras ya actualizadas |
| CC-011 | [#36](https://github.com/fjmp-dev/sce-control-escolar/issues/36) | `pago.fecha_confirmacion` | Mayor o Must | PO y QA | Sub-batch 12.1 | Aprobado por FJMP el 10 de noviembre de 2026; implementado después, en el sub-batch 12.1 (migración `20261110160000_fecha_confirmacion`). Figuras ya actualizadas |
| CC-012 | [#37](https://github.com/fjmp-dev/sce-control-escolar/issues/37) | `periodo.oferta_publicada_en`, publicar oferta | Normal | PO y QA | Batches 5 y 7 | Implementado en el Batch 7 (migración `20261110120000_oferta_publicada`); aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008). Figuras ya actualizadas |
| CC-013 | [#38](https://github.com/fjmp-dev/sce-control-escolar/issues/38) | Persistir el rechazo de la inscripción | Mayor o Must | PO y QA | Batch 5 | Implementado en el Batch 5; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008). Figuras ya actualizadas |
| CC-014 | [#39](https://github.com/fjmp-dev/sce-control-escolar/issues/39) | Dependencias en las Figuras 2 y 9 | Documental | PO y QA | Batch 0 | Figuras actualizadas y ampliadas en los batches 2, 4 y 7; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008) |
| CC-015 | [#40](https://github.com/fjmp-dev/sce-control-escolar/issues/40) | Usuario técnico sin rol | Mayor o Must | PO, QA y Seguridad | Batch 2 | Implementado en el Batch 2; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008). Figuras ya actualizadas |
| CC-016 | Sin issue: `cambios/CC-016.md` | Operación `cambiarEstatus` del alumno en la Fig. 3 | Documental | PO y QA | Batch 4 | Figura actualizada; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008) |
| CC-017 | Sin issue: `cambios/CC-017.md` | Operaciones de la Fig. 6 en la clase `Inscripcion` de la Fig. 3 | Documental | PO y QA | Batch 5 | Figura actualizada; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008) |
| CC-018 | Sin issue: `cambios/CC-018.md` | Staging efímero en GitHub Actions, sin servidores rentados; túnel gratuito solo cuando haga falta URL pública | Normal | PO y QA | Batch 6 | Implementado en el Batch 6; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008) |
| CC-019 | Sin issue: `cambios/CC-019.md` | Inicio del curso del periodo, de abierto a en curso (X-25); cierre en la calle de coordinación (X-09) | Mayor o Must | PO y QA | Batch 8 | Implementado en el Batch 8; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008). Figuras 3 y 7 ya actualizadas |
| CC-020 | Sin issue: `cambios/CC-020.md` | Cambio de proveedor crítico: de Mercado Pago a pasarela simulada (Tabla 55); acota el alcance de RF-006 | Mayor o Must | PO, QA y Seguridad | Batch 9; pruebas en 11.1 y figuras en 13.1 | Implementado en el Batch 9; aprobado por FJMP el 10 de noviembre de 2026, después de fusionarse (NC-008). Figuras 1, 2, 3, 5, 9 y 10 pendientes (13.1) |

Estos cambios se integran al manual en la versión 3.0 (issue [#15](https://github.com/fjmp-dev/sce-control-escolar/issues/15), `manual-v3.0.md`). CC-001 a CC-019 no modifican por sí mismos un requisito RF o RNF, la política de calidad ni el alcance. CC-020 sí acota el alcance de RF-006: es el cambio de alcance de la compactación del 10 de noviembre de 2026, que impone el número mayor.

**Enmiendas del 5 de noviembre de 2026:** CC-002 pasa a la numeración de la Tabla 49 (`cambios/CC-002-enmienda.md`). CC-006 se amplía con Next.js 16 y React 19, y retira la sustitución de Testcontainers y PostgreSQL 18 local (`cambios/CC-006-enmienda.md`). El retiro se implementó en el Batch 1 ([#41](https://github.com/fjmp-dev/sce-control-escolar/issues/41)): las pruebas usan Testcontainers y Compose usa PostgreSQL 16. Versiones adoptadas: `plan-de-pruebas.md`, sección 4.

**Implementación del 6 de noviembre de 2026 (Batch 2, [#42](https://github.com/fjmp-dev/sce-control-escolar/issues/42)):** CC-007, CC-010 y CC-015, en la migración `20261106120000_identidad_y_bitacora` y los módulos `identidad/`, `bitacora/` y `academico/`. **Su código no se fusiona sin la aprobación de la tabla de abajo.** CC-014 y CC-015 se ampliaron: la Fig. 2 dibuja la dependencia del gateway hacia persistencia para `/salud`, y el usuario técnico también firma los accesos fallidos.

**Implementación del 6 de noviembre de 2026 (Batch 3, [#43](https://github.com/fjmp-dev/sce-control-escolar/issues/43)):** Next.js 16 y React 19 (CC-006) en `web/`, y la conexión del servidor Next.js a la API (CC-014). Versiones adoptadas: `plan-de-pruebas.md`, sección 4. Prerrequisitos en la API y regla de no circularidad: no cambia el modelo de datos.

**Implementación del 7 de noviembre de 2026 (Batch 4, [#44](https://github.com/fjmp-dev/sce-control-escolar/issues/44)):** expediente único (RF-001) sin cambios al modelo de datos. CC-014 se amplía con la dependencia del expediente hacia identidad, y CC-016 añade `cambiarEstatus` a la Fig. 3. **El batch abre la fase 2 sin el acta de la fase 1 firmada:** NC-009.

**Implementación del 8 de noviembre de 2026 (Batch 5, [#45](https://github.com/fjmp-dev/sce-control-escolar/issues/45)):** inscripción (RF-002, RNF-USU-001) sin cambios al modelo de datos. CC-013 se implementa: el rechazo se guarda con su motivo y su carga en una transacción aparte. CC-017 añade a la Fig. 3 las transiciones de la Fig. 6. De CC-012 solo se usa la oferta mínima en consulta: `oferta_publicada_en` y la publicación llegan en el Batch 7, así que por ahora el alumno ve todos los grupos del periodo abierto. **El código de CC-013, Mayor, no se fusiona sin su aprobación,** y el batch sigue en la fase 2 sin el acta de la fase 1 (NC-009).

**Implementación del 8 de noviembre de 2026 (Batch 6, [#46](https://github.com/fjmp-dev/sce-control-escolar/issues/46)):** staging con la topología de la Fig. 9, sin cambios al modelo de datos ni a las figuras. CC-005 se activa en staging: pgAudit, SCRAM y conexiones solo por TLS. `db/pgaudit.sql` fallaba en PostgreSQL 16 y se corrigió. El 10 de noviembre de 2026, FJMP decidió no rentar servidores (CC-018): la Tabla 30 no los exige para staging, que pasa a armarse en GitHub Actions en cada despliegue, con la misma topología y la misma verificación.

**Implementación del 10 de noviembre de 2026 (Batch 7, [#47](https://github.com/fjmp-dev/sce-control-escolar/issues/47)):** oferta y horarios (RF-003). CC-012 se implementa con la migración `20261110120000_oferta_publicada`, una columna opcional: el periodo se abre sin oferta, coordinación define los grupos y la publica, y solo entonces el alumno la ve y se inscribe. CC-014 se amplía con la dependencia de académico hacia identidad para el profesor del grupo (Fig. 2). D-13 se aplica como provisional. `Periodo.cerrar()` de la Fig. 3 llega con el cierre del Batch 8, que es su único uso. **El batch abre la fase 3 sin las actas de las fases 1 y 2 firmadas:** NC-010.

**Implementación del 10 de noviembre de 2026 (Batch 8, [#48](https://github.com/fjmp-dev/sce-control-escolar/issues/48)):** calificaciones e historial (RF-004 y RF-005), sin cambios al modelo de datos. CC-019 añade `Periodo.iniciarCurso()` a la Fig. 3 y, en la Fig. 7, "Iniciar el curso" y el cierre en la calle de coordinación (X-09, X-25). Reglas provisionales nuevas: D-16 (cierre con parciales completos) y D-17 (corrección posterior al cierre). **El código de CC-019, Mayor, no se fusiona sin su aprobación.** El seed pasa a un calendario al 10 de noviembre de 2026: 2026A cerrado, 2026B en curso y 2027A abierto.

**Retoma del 10 de noviembre de 2026 (sub-batch 11.0, `plan-de-sistema.md`, 6.2):** FJMP aprueba CC-010 a CC-019 y CC-020. CC-020 registra el cambio de proveedor de pagos que la compactación decidió sin CC: de Mercado Pago a pasarela simulada (sección 33). CC-001 a CC-009 siguen pendientes de aprobación.

**Implementación del 11 de noviembre de 2026 (sub-batch 12.1, [#75](https://github.com/fjmp-dev/sce-control-escolar/issues/75)):** CC-011 se implementa con la migración `20261110160000_fecha_confirmacion`, una columna opcional que `PagosService.simular()` llena con la hora de la base antes de escribir el abono. La migración da a los pagos aplicados que ya existían la fecha de su abono. Con ella se miden CD-DAT-06 y, sin cambios al modelo, CD-DAT-03 (`api/prisma/verificacion/`). El campo no se expone en la API.

**Desviaciones registradas:**

- CC-001 a CC-006 se implementaron antes de aprobarse (NC-008).
- El 10 de noviembre de 2026, el PR #30 (`1d2b48d`) fusionó en `develop` el código y las figuras de CC-007 a CC-010 y CC-012 a CC-019, y el código de CC-020, sin aprobación previa. CC-007, CC-008, CC-009, CC-010, CC-013, CC-015, CC-019 y CC-020 son Mayor, así que se incumplió la regla 5 del plan. Las aprobaciones de CC-010 y CC-012 a CC-020 son posteriores a la fusión; CC-011 se aprobó antes de implementarse. CC-007 a CC-009 siguen sin aprobar (ampliación de NC-008).
- Las figuras de CC-020 se redibujan en 13.1, después de fusionar su código (Tabla 54 y regla 5; NC-014).
- CC-016 a CC-020 no tienen issue con la etiqueta `cambio`: la solicitud solo está en `docs/gobierno/cambios/`. Los issues se abren en 11.3 (NC-008).
- Desde el 10 de noviembre de 2026, quien aprueba es el mismo que solicita: FJMP ocupa todos los roles (`roles-y-raci.md`, apartado 6; NC-012).

---

## Aprobaciones

Se llena al aprobar cada cambio. Quien aprueba no es quien solicitó el cambio (`docs/gobierno/metodologia-de-trabajo.md`, sección 1). **Desde el 10 de noviembre de 2026 no se cumple:** FJMP solicita y aprueba (`roles-y-raci.md`, apartado 6; NC-012). Las decisiones de los CC Mayor de esta tabla quedan pendientes de la firma de FJMP en `actas/acta-cambios-mayores-2026-11.md` (11.3).

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
| CC-010 | Aprobado | FJMP | FJMP | FJMP | 10 de noviembre de 2026 |
| CC-011 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-012 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-013 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-014 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-015 | Aprobado | FJMP | FJMP | FJMP | 10 de noviembre de 2026 |
| CC-016 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-017 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-018 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-019 | Aprobado | FJMP | FJMP | No aplica | 10 de noviembre de 2026 |
| CC-020 | Aprobado | FJMP | FJMP | FJMP | 10 de noviembre de 2026 |
