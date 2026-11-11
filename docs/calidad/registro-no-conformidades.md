# Registro de no conformidades y acciones correctivas — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 40 (clasificación en la Tabla 61; ciclo en la 40.2).
**Vigente desde:** 5 de noviembre de 2026. **Actualizado:** 10 de noviembre de 2026 (sub-batch 11.3: NC-016 a NC-018, de la autoauditoría del cierre de la fase 4).

Cada no conformidad (NC) tiene identificador, fuente, descripción, severidad, evidencia, causa, acción correctiva, acción preventiva, responsable, fecha, verificación y cierre. Las que se listan aquí las **detectó el propio equipo** al preparar la respuesta a la solicitud F-01-SCE-002 de la auditoría PA-SCE-001 y al contrastar el repositorio contra el manual completo. Se registran antes del informe preliminar para que ninguna quede abierta sin plan fechado (manual 8.4 y 40.1).

La verificación de eficacia la hace quien ocupe QA en el sprint de cierre, que nunca es quien ejecutó la acción, o el equipo auditor. **Desde el 10 de noviembre de 2026 no se cumple:** QA es FJMP, que también ejecuta las acciones. Su verificación se registra como autoverificación (NC-012) y se ofrece al equipo auditor.

---

## Resumen

| ID | Severidad | Descripción breve | Criterio de auditoría | Responsable | Fecha comprometida | Estado | Aceptación con plan fechado (Tabla 61) |
|---|---|---|---|---|---|---|---|
| NC-001 | Mayor | Pull request #29 fusionado sin aprobación de otro integrante | AU-04, AU-11 | FJMP (antes SJOM y FJMP) | 11 de diciembre de 2026 | Abierta. SJOM aceptó la invitación el 10 de noviembre, pero no revisó el #29 ni aprobó el #30 | FJMP (PO), 10 de noviembre de 2026 |
| NC-002 | Mayor | Fase 1 iniciada sin acta de aceptación de la fase 0 firmada | AU-07 | FJMP (antes SJOM) | 20 de noviembre de 2026 | Abierta con plan; venció el 6 de noviembre | FJMP (PO), 10 de noviembre de 2026 |
| NC-003 | Menor | Sin registro de aprobación de la versión 2.0 del manual | AU-01 | FJMP (antes SJOM) | 20 de noviembre de 2026 | Abierta con plan; venció el 6 de noviembre | No aplica: Menor |
| NC-004 | Menor | Elementos P1 del plan de trabajo (#7 a #15) vencidos sin reprogramación escrita | AU-02, AU-43 | FJMP | 27 de noviembre de 2026 | Abierta con plan | No aplica: Menor |
| NC-005 | Menor | Tablas de roles por sprint contradictorias entre documentos de gobierno | AU-04 | FJMP | 5 de noviembre de 2026 | Corregida; pendiente de verificación | No aplica: Menor |
| NC-006 | Mayor | No existe el acta de levantamiento que la Tabla 23 exige para la fase 0 | AU-07, AU-43 | FJMP (antes ambos) | 27 de noviembre de 2026 | Abierta con plan | FJMP (PO), 10 de noviembre de 2026 |
| NC-007 | Menor | El catálogo de casos CS-SEG del repositorio divergió de la Tabla 49 del manual | AU-02, AU-05, AU-29 | FJMP | 5 de noviembre de 2026 | Corregida; pendiente de verificación | No aplica: Menor |
| NC-008 | Mayor (antes Menor) | Cambios implementados y fusionados sin aprobación registrada: CC-001 a CC-006 y, desde el 10 de noviembre, CC-007 a CC-010 y CC-012 a CC-020 | AU-06 | FJMP (antes SJOM) | 20 de noviembre de 2026 | Abierta. CC-010 y CC-012 a CC-020 aprobados el 10 de noviembre, después de fusionarse; CC-011, antes de implementarse. Falta la firma del acta de cambios mayores. CC-001 a CC-009 sin decisión | FJMP (PO), 10 de noviembre de 2026 |
| NC-009 | Mayor | Batch 4 (fase 2) iniciado sin el acta de la fase 1 firmada, por decisión de FJMP | AU-07 | FJMP (antes FJMP y SJOM) | 20 de noviembre de 2026 | Abierta; la contención no se cumplió | FJMP (PO), 10 de noviembre de 2026 |
| NC-010 | Mayor | Batch 7 (fase 3) iniciado sin el acta de la fase 2 firmada, por decisión de FJMP | AU-07 | FJMP (antes FJMP y SJOM) | 20 de noviembre de 2026 | Abierta; la contención no se cumplió | FJMP (PO), 10 de noviembre de 2026 |
| NC-011 | Mayor | Batch 9 (fase 4) iniciado sin el acta de la fase 3 firmada y sin registrar antes la decisión | AU-07 | FJMP | 20 de noviembre de 2026 | Abierta con plan | FJMP (PO), 10 de noviembre de 2026 |
| NC-012 | Mayor | Sin separación de funciones desde el 10 de noviembre: FJMP produce, aprueba, verifica y firma | AU-04, AU-11, AU-36 | FJMP | 11 de diciembre de 2026 | Abierta; no se cierra sin una segunda persona | FJMP (PO), 10 de noviembre de 2026 |
| NC-013 | Mayor | Auditorías internas de la Tabla 60 sin auditor independiente | AU-40 | FJMP | 11 de diciembre de 2026 | Abierta con plan | FJMP (PO), 10 de noviembre de 2026 |
| NC-014 | Menor | Código de CC-020 (cambio de arquitectura Must) fusionado sin actualizar antes las figuras | AU-06, AU-08 | FJMP | Sub-batch 13.1, antes del corte de `release/1.0.0` | Abierta con plan | No aplica: Menor |
| NC-015 | Menor | Ramas y etiquetas fuera de la Tabla 31 y de 15.2: fases 1 a 3 sin `release/x.y.z` ni fusión a `main`, y correcciones en `feature/` | AU-09 | FJMP | No se corrige: se declara en cada acta | Abierta; desviación declarada | No aplica: Menor |
| NC-016 | Menor | Issues de batch sin puntos de historia: la densidad de defectos no se pudo calcular al cerrar las fases 1 a 3 | AU-39, AU-43 | FJMP | Antes del sub-batch 12.1 | Corregida en 11.3, con estimación posterior a la construcción; falta la acción preventiva | No aplica: Menor |
| NC-017 | Menor | Análisis de riesgos de la fase 4 fuera de tiempo: AMFE de pagos hecho después de construir y STRIDE sin pagos, caja, trámites ni reportes | AU-37 | FJMP | Sub-batch 12.2 | Abierta con plan. AMFE hecho en 11.3 | No aplica: Menor |
| NC-018 | Menor | Sin conciliación de pagos (CD-DAT-03) ni medición del reflejo (CD-DAT-06) al cierre de la fase 4 | AU-24, AU-39 | FJMP | Sub-batch 12.1 | Abierta con plan | No aplica: Menor |

**Aceptación con plan fechado.** Según la Tabla 61, una NC Mayor bloquea la liberación hasta que se cierra o hasta que se acepta formalmente con plan fechado. La aceptación la da el Product Owner, que desde el 10 de noviembre de 2026 es FJMP, el mismo que ejecuta las acciones (NC-012). Aceptar no cierra la NC: la deja abierta con su plan. Si la fecha vence sin cumplirse, la NC vuelve a bloquear y se registra un seguimiento.

**Reasignación del 10 de noviembre de 2026.** Las NC a cargo de SJOM (NC-001, NC-002, NC-003 y NC-008) o de ambos (NC-006, NC-009 y NC-010) pasan a FJMP, y también la verificación de NC-005. SJOM aceptó la invitación al repositorio ese día, pero no revisó ni aprobó ningún entregable, y FJMP decidió continuar sin él (`docs/gobierno/roles-y-raci.md`, apartado 6). Es una desviación: quien ejecuta la acción también la verifica (NC-012).

---

## NC-001 — Pull request fusionado sin revisión

- **Fuente:** autoevaluación previa al informe preliminar de PA-SCE-001.
- **Descripción:** el pull request #29 (*Fase 1: base de datos PostgreSQL, pgAudit, API con roles, plan de pruebas y CI*) se fusionó a `Desarrollo` el 22 de octubre de 2026 con cero revisiones. Lo abrió y lo fusionó la misma persona. El cambio toca autenticación y autorización, así que la sección 29 exige revisión de otro integrante.
- **Severidad:** Mayor. Afecta un control de seguridad: separación de funciones en cambios de seguridad.
- **Evidencia:** `github.com/fjmp-dev/sce-control-escolar/pull/29`, pestaña de revisiones vacía.
- **Causa (cinco porqués):**
  1. ¿Por qué no hubo revisión? Porque el segundo integrante no podía aprobar en el repositorio.
  2. ¿Por qué no podía? Porque su invitación como colaborador (`samuel0rtiz`) seguía sin aceptarse. Así sigue al 5 de noviembre.
  3. ¿Por qué no se detectó? Porque la lista de verificación de inicio de fase no incluía comprobar que ambos integrantes tuvieran acceso de escritura.
  4. ¿Por qué se fusionó de todos modos? Para no bloquear la integración continua antes de la verificación en campo.
  5. Causa raíz: el control de revisión dependía de un acceso que nunca se verificó, y la presión de calendario se resolvió saltándose el control en lugar de registrar un impedimento, como pide `metodologia-de-trabajo.md`, sección 2.
- **Acción correctiva:**
  1. SJOM acepta la invitación al repositorio. Responsable: SJOM. Fecha: 6 de noviembre de 2026.
  2. SJOM revisa a posteriori el PR #29 y deja una revisión registrada en GitHub. Cada defecto que encuentre se abre como issue. Responsable: SJOM. Fecha: 7 de noviembre de 2026.
  3. El PR #30 se integra solo con la aprobación de SJOM. Responsable: SJOM. Fecha: 7 de noviembre de 2026.
- **Acción preventiva:** las ramas `main` y `Desarrollo` exigen una aprobación y los checks de CI, y la regla aplica también a administradores. Se verificó en la configuración el 5 de noviembre de 2026. Con esto, la plataforma ya no permite fusionar sin revisión.
- **Verificación de eficacia:** QA del sprint S4 (FJMP) o el equipo auditor comprueban que el PR #29 tenga revisión registrada y que todos los PR posteriores al 7 de noviembre tengan aprobación de alguien distinto al autor.
- **Seguimiento, 8 de noviembre de 2026:** la acción 1 venció sin cumplirse, y no podía cumplirse. La invitación del 23 de octubre caducó el 30 de octubre, porque GitHub vence las invitaciones a los 7 días; la API la reporta como `expired`. Nadie lo detectó en dos semanas porque el repositorio la seguía mostrando como pendiente. **Nueva acción:** FJMP reenvía la invitación y SJOM la acepta antes de que venza. Fecha: a confirmar por FJMP.
- **Seguimiento, 10 de noviembre de 2026:** FJMP reenvió la invitación con permiso de escritura; la caducada se borró. La nueva vence el 17 de noviembre de 2026, que pasa a ser la fecha de la acción. Si vuelve a caducar, se reenvía el mismo día y se avisa a SJOM por otro medio.
- **Seguimiento, 10 de noviembre de 2026, noche:** `samuel0rtiz` aceptó la invitación a las 20:24 (evento `MemberEvent` del 11 de noviembre a las 02:24 UTC) y es colaborador con permiso _write_. La acción 1 se cumplió cuatro días después de la fecha original (6 de noviembre) y antes de la fecha reprogramada (17 de noviembre). Las acciones 2 y 3 no se cumplieron: SJOM no revisó el #29, y el #30 se fusionó a las 21:21 sin su aprobación, igual que #55 a #66 y #68, todos con cero revisiones. La acción preventiva se retiró ese día: la protección de `develop` y `main` exige cero aprobaciones (`plan-de-trabajo.md`, apartado 6).
  - **Responsable:** FJMP (reasignación).
  - **Plan fechado:** (1) ofrecer la revisión a posteriori del #29 y de la pila #30 y #55 a #66 a un revisor externo al equipo (la profesora o el equipo de PA-SCE-001), con el paquete del sub-batch 11.3, a más tardar el 20 de noviembre de 2026. (2) Si nadie la hace antes del 11 de diciembre de 2026, la NC sigue abierta y se declara en el acta de liberación (sub-batch 14.1).
  - **Verificación de eficacia (sustituye a la de arriba, que ya no se puede cumplir):** el revisor externo deja registrada su revisión del #29 y de la pila #30 y #55 a #66, y cada defecto que encuentre queda como issue. La aprobación de los PR posteriores por otra persona se sigue en NC-012. FJMP no puede verificar esta NC.
  - **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-002 — Acta de la fase 0 sin firmar

- **Fuente:** autoevaluación; elemento 6 de F-01-SCE-002.
- **Descripción:** el acta ACT-F0-001 debía firmarse el 19 de octubre de 2026 y sigue en borrador. Aun así, la fase 1 arrancó el 20 de octubre. La sección 10.1 del manual dice que, sin acta firmada por Product Owner y QA, no hay aceptación auditable.
- **Severidad:** Mayor. Incumple el registro obligatorio de aceptación de fase.
- **Evidencia:** `docs/gobierno/actas/acta-aceptacion-fase-0.md` e issue #1 abierto.
- **Causa:** la firma se dejó para una sesión presencial que no ocurrió. Ninguna regla impedía iniciar la fase siguiente sin el acta firmada.
- **Acción correctiva:** SJOM firma el acta como Product Owner y QA, ya con la evaluación de la Tabla 23 y la salvedad por NC-006. El acta conserva su fecha de cierre de fase y registra que la firma es extemporánea. Responsable: SJOM. Fecha: 6 de noviembre de 2026.
- **Acción preventiva:** no se abre ninguna fase sin el acta de la anterior firmada. Se incorpora a la definición de terminado de la fase.
- **Verificación de eficacia:** el equipo auditor revisa el acta firmada. Al cierre de la fase 1 se verifica que el acta exista antes del inicio de la fase 2.
- **Seguimiento, 10 de noviembre de 2026:** la acción venció el 6 de noviembre sin cumplirse. **Responsable:** FJMP (reasignación). **Nueva acción:** FJMP firma ACT-F0-001 como Product Owner y QA, con la salvedad de NC-006 y la desviación de NC-012, antes que las actas de las fases 1 a 3 (sub-batch 11.3). **Fecha:** 20 de noviembre de 2026. **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-003 — Sin registro de aprobación del manual v2.0

- **Fuente:** autoevaluación; issue #3.
- **Descripción:** la sección 1.2 del manual exige registrar la aprobación con fecha, versión y medio. La versión 2.0 se emitió el 16 de septiembre de 2026 sin ese registro.
- **Severidad:** Menor. Es una práctica documentada; no hay riesgo inmediato sobre el producto.
- **Evidencia:** issue #3 abierto.
- **Acción correctiva:** firmar `docs/gobierno/registro-aprobacion-manual-v2.0.md`. Responsable: SJOM, como Product Owner del sprint S3. Fecha: 6 de noviembre de 2026.
- **Acción preventiva:** la versión 2.1 no se publica sin su registro de aprobación (issue #15).
- **Verificación de eficacia:** QA del sprint S4 comprueba que el registro esté firmado y vinculado al issue #3.
- **Seguimiento, 10 de noviembre de 2026:** la acción venció el 6 de noviembre sin cumplirse. **Responsable:** FJMP (reasignación). FJMP firma el registro como Product Owner, con la desviación de NC-012, en el sub-batch 11.3. **Fecha:** 20 de noviembre de 2026.

## NC-004 — Elementos P1 vencidos sin reprogramación

- **Fuente:** autoevaluación contra `docs/gobierno/plan-de-trabajo.md`, sección 5.
- **Descripción:** las correcciones al manual (#7 a #14) y la emisión de la versión 2.1 (#15) vencían el 30 de octubre de 2026. No se cumplieron, y tampoco se registró su nueva fecha con motivo escrito, como exige la sección 5 del plan de trabajo.
- **Severidad:** Menor. Las correcciones ya están hechas en el repositorio (`docs/calidad/`, `registro-de-cambios.md`); falta llevarlas al manual.
- **Causa:** el sprint S2 priorizó el arranque técnico de la fase 1 sobre las correcciones documentales.
- **Acción correctiva:** reprogramar los elementos #7 a #15 al sprint S4 y emitir el manual v2.1 a más tardar el 27 de noviembre de 2026. Responsable: FJMP. Acepta: SJOM (desde el 10 de noviembre de 2026, FJMP; NC-012).
- **Acción preventiva:** si los elementos se recorren de nuevo, pasan a la matriz de riesgos, como indica la sección 5 del plan de trabajo.
- **Verificación de eficacia:** el equipo auditor, en el seguimiento, revisa el manual v2.1 y su registro de aprobación.
- **Seguimiento, 10 de noviembre de 2026:** el manual se emite como v3.0 en lugar de v2.1, porque el alcance cambió y la sección 1.3 lo exige así. Integra #7 a #14 y su registro de aprobación (`docs/gobierno/manual-v3.0.md`, apartado 9). Queda pendiente la firma de SJOM. _(Corregido el 10 de noviembre de 2026: la firma pendiente es la de FJMP como autor, revisor y aprobador, con la desviación de NC-012.)_

## NC-005 — Tablas de roles contradictorias

- **Fuente:** autoevaluación.
- **Descripción:** `metodologia-de-trabajo.md` y `roles-y-raci.md` asignaban Product Owner y QA de los sprints impares a FJMP, y `plan-de-trabajo.md` los asignaba a SJOM.
- **Severidad:** Menor.
- **Acción correctiva:** se alinearon los tres documentos con el plan de trabajo el 5 de noviembre de 2026. Responsable: FJMP.
- **Verificación de eficacia:** QA del sprint (SJOM) revisa la corrección en el PR #30.
- **Seguimiento, 10 de noviembre de 2026:** la verificación pasa a FJMP (reasignación). Es autoverificación (NC-012).

## NC-006 — Falta el acta de levantamiento de la fase 0

- **Fuente:** contraste del acta ACT-F0-001 con la Tabla 23 del manual, 5 de noviembre de 2026.
- **Descripción:** la condición mínima de aceptación de la fase 0 es "acta de levantamiento con control escolar, coordinación y caja, y lista explícita de qué entra y qué no". La lista existe (manual, sección 3.2). El acta de levantamiento no está en el repositorio. Además, la versión 1.0 del acta de fase evaluaba criterios propios del equipo y los presentaba como los de la sección 10.3.
- **Severidad:** Mayor. Es la condición de aceptación de una fase, de la misma clase que NC-002.
- **Evidencia:** Tabla 23 del manual; `docs/gobierno/actas/acta-aceptacion-fase-0.md`; ausencia del acta en el repositorio.
- **Causa preliminar (cinco porqués; la confirma el equipo):**
  1. ¿Por qué no hay acta? Porque el levantamiento no quedó documentado en el repositorio.
  2. ¿Por qué no se notó al redactar el acta de fase? Porque se usaron criterios propios y no se contrastaron con la Tabla 23.
  3. ¿Por qué se usaron criterios propios? Porque el entregable de la fase se interpretó solo como documental.
  4. ¿Por qué nadie lo detectó en revisión? Porque el acta no se había revisado ni firmado.
  5. Causa raíz: no existía una lista de verificación de fase que partiera de la Tabla 23.
- **Acción correctiva:** si las entrevistas se hicieron, se documentan con fechas, participantes y notas reales; si no se hicieron, se realizan con control escolar, coordinación y caja de la facultad de referencia. **No se redacta un acta sobre entrevistas que no ocurrieron.** Responsable: FJMP y SJOM. Fecha: 27 de noviembre de 2026, a confirmar por el equipo.
- **Acción preventiva:** la plantilla de acta (Anexo B) parte de la condición de la Tabla 23 para cada fase.
- **Verificación de eficacia:** el equipo auditor revisa el acta de levantamiento. En cada cierre de fase, QA comprueba la condición de la Tabla 23.
- **Seguimiento, 10 de noviembre de 2026:** **Responsable:** FJMP (antes ambos). Se confirma la fecha del 27 de noviembre de 2026. Si para entonces no hay acceso a control escolar, coordinación y caja de una facultad, no se redacta el acta, como dice la acción correctiva. En ese caso, la fase 0 queda aceptada con salvedad, y la NC sigue abierta y se declara en el acta de liberación (sub-batch 14.1). **Orden con NC-002:** ACT-F0-001 se firma antes, a más tardar el 20 de noviembre de 2026, con esta NC abierta como salvedad. Si el acta de levantamiento llega después, se anexa a ACT-F0-001 como adenda. **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-007 — Catálogo CS-SEG distinto de la Tabla 49

- **Fuente:** contraste de `matriz-trazabilidad.md` con la Tabla 49 y con PA-SCE-001, 5 de noviembre de 2026.
- **Descripción:** el repositorio definió CS-SEG-02 a 08 con significados propios, y CC-002 fijó esa numeración. La Tabla 49 los define de otra manera, y el plan de auditoría usa la del manual (AU-14 cita CS-SEG-04 y 07; AU-15, 01 a 03; AU-16, 06). Como consecuencia, la prueba llamada CS-SEG-06 verificaba la inmutabilidad de la bitácora, no lo que la Tabla 49 pide, y la respuesta F-01 v1.1 citó esas etiquetas.
- **Severidad:** Menor. Ningún control se perdió; el defecto está en la identificación de los casos.
- **Evidencia:** Tabla 49; `plan-de-pruebas.md` v1.0, sección 7.
- **Causa:** se reconciliaron los rangos que el manual menciona sin tomar la Tabla 49 como definición de cada caso.
- **Acción correctiva:** catálogo, plan de pruebas y nombres de pruebas alineados con la Tabla 49; CC-002 corregido; respuesta F-01 v1.2. Responsable: FJMP. Fecha: 5 de noviembre de 2026.
- **Acción preventiva:** el catálogo cita la tabla del manual de la que sale cada caso.
- **Verificación de eficacia:** QA revisa la corrección en el pull request del Batch 0. El 10 de noviembre de 2026 (sub-batch 11.2) aún quedaban tres pruebas con una etiqueta distinta de la Tabla 49. Dos, en `api/test/integracion/pagos.spec.ts` y `tramites.spec.ts`, se llamaban CS-SEG-02, pero verificaban que un alumno no ve el pago ni el documento de otro alumno, que es CS-SEG-03; se renombraron a CS-SEG-03 (R-23). La tercera, en `oferta.spec.ts`, se llamaba CS-SEG-03, pero verifica que una entrada fuera de rango o con campos de más da 400 sin tocar la base, que es CS-SEG-05; se renombró a CS-SEG-05, también en `stride.md`. La verificación sigue pendiente.

## NC-008 — Cambios implementados sin aprobación registrada

- **Fuente:** revisión de `registro-de-cambios.md`, 5 de noviembre de 2026.
- **Descripción:** CC-001 a CC-006 se implementaron y CC-003 a CC-006 entraron en el PR #29, pero su tabla de aprobaciones sigue vacía. La sección 16.2 pone la aprobación antes de la implementación, y CC-004 y CC-005 son de tipo Mayor.
- **Severidad:** Menor. Es una práctica documentada, sin riesgo inmediato sobre datos; los cambios refuerzan controles. **Mayor desde el 10 de noviembre de 2026** (ver la reclasificación en el seguimiento).
- **Evidencia:** `docs/gobierno/registro-de-cambios.md`; issues #23 a #28.
- **Causa:** comparte causa con NC-001: el segundo integrante no tenía acceso para aprobar.
- **Acción correctiva:** SJOM aprueba o rechaza cada cambio con fecha y responsable. Lo rechazado se revierte. Responsable: SJOM. Fecha: 7 de noviembre de 2026.
- **Acción preventiva:** ningún código de un cambio Mayor se fusiona sin su CC aprobado (`plan-de-sistema.md`, regla 5).
- **Verificación de eficacia:** el equipo auditor revisa el registro de aprobaciones.
- **Seguimiento, 10 de noviembre de 2026:** la acción venció el 7 de noviembre sin cumplirse.
  - **Ampliación:** el PR #30 (`1d2b48d`) fusionó en `develop` el código y las figuras de CC-007 a CC-010 y CC-012 a CC-019, y el código de CC-020, sin aprobación previa. Las figuras de CC-020 siguen pendientes (NC-014). CC-011 no está implementado. Ocho son Mayor (CC-007, CC-008, CC-009, CC-010, CC-013, CC-015, CC-019 y CC-020), así que también se incumplió la acción preventiva: la regla 5 del plan. CC-020 ni siquiera existía: la compactación cambió el proveedor de pagos sin CC.
  - **Lo hecho:** FJMP aprobó ese mismo día CC-010 y CC-012 a CC-020, después de la fusión, y CC-011, antes de implementarse (`registro-de-cambios.md`). La decisión de los CC Mayor no está firmada: `acta-cambios-mayores-2026-11.md` sigue para firma. CC-001 a CC-009 siguen sin decisión. CC-016 a CC-020 no tienen issue con la etiqueta `cambio`, aunque la sección 16.2 pide ticket: la solicitud solo está en `docs/gobierno/cambios/`.
  - **Reclasificación a Mayor:** cambios que tocan seguridad (CC-007, CC-010 y CC-015) y pagos (CC-020) se fusionaron sin la aprobación de Seguridad que exige la Tabla 34. Eso incumple un control de seguridad, el control de cambios (Tabla 61).
  - **Responsable:** FJMP (reasignación).
  - **Plan fechado:** a más tardar el 20 de noviembre de 2026 (sub-batch 11.3), FJMP aprueba o rechaza CC-001 a CC-009 con fecha, firma el acta de cambios mayores y abre los issues de CC-016 a CC-020. Lo rechazado se revierte. Desde la retoma, un CC Mayor se aprueba antes de abrir el PR que lo implementa (CC-021 en 12.5 y CC-022 en 13.1).
  - **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-009 — Fase 2 iniciada sin el acta de la fase 1

- **Fuente:** autodeclaración, 7 de noviembre de 2026.
- **Descripción:** el Batch 4 abre la fase 2 (expediente). La regla 4 de `plan-de-sistema.md` y la acción preventiva de NC-002 dicen que una fase no se abre sin el acta de la anterior firmada. ACT-F1-001 está en borrador y su apartado 9 lista lo que falta. FJMP decidió continuar el desarrollo para no detenerlo mientras el segundo integrante no tiene acceso al repositorio.
- **Severidad:** Mayor. Repite la desviación de NC-002, ahora con la regla ya escrita.
- **Evidencia:** PR del Batch 4, apilado sobre #58, y la decisión registrada en esta entrada.
- **Causa:** la aceptación depende de una sola persona sin acceso (NC-001), y el calendario de la fase 1 cierra el 11 de diciembre de 2026. _(Corregido el 10 de noviembre de 2026: SJOM aceptó la invitación ese día y tiene permiso write, pero no revisó ni aprobó; NC-012.)_
- **Contención:** el código de la fase 2 **no se fusiona** a `develop` antes de firmarse ACT-F1-001. Se mantiene la regla "ninguna fase cierra sin fusión".
- **Acción correctiva:** firmar ACT-F1-001 y fusionar la fase 1 antes de revisar el Batch 4. Responsables: SJOM firma; FJMP prepara. Fecha: al firmarse ACT-F1-001.
- **Acción preventiva:** si vuelve a ocurrir, la decisión se registra como esta, antes de empezar el batch.
- **Verificación de eficacia:** QA comprueba que la fusión de la fase 2 ocurre después de la firma de ACT-F1-001.
- **Seguimiento, 10 de noviembre de 2026:** la contención no se cumplió. El código de la fase 2 (#59, #60 y #61) se fusionó en `develop` el 10 de noviembre con el PR #30, sin ACT-F1-001 firmada. **Responsable:** FJMP (reasignación). **Plan fechado:** FJMP firma ACT-F1-001 en el sub-batch 11.3, con la desviación de NC-012. La etiqueta retroactiva `v0.1.0` (11.4) va después de esa firma. **Fecha:** 20 de noviembre de 2026. **Verificación de eficacia (sustituye a la de arriba, que ya no se puede cumplir):** la firma de ACT-F1-001 es anterior a la etiqueta `v0.1.0`. **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-010 — Fase 3 iniciada sin el acta de la fase 2

- **Fuente:** autodeclaración, 10 de noviembre de 2026, antes de empezar el Batch 7, como pide la acción preventiva de NC-009.
- **Descripción:** el Batch 7 abre la fase 3 (oferta y horarios, RF-003). La regla 4 de `plan-de-sistema.md` pide antes el acta de la fase 2 firmada. ACT-F2-001 está en borrador y su apartado 9 lista lo que falta; ACT-F1-001 tampoco está firmada (NC-009). FJMP decidió continuar el desarrollo.
- **Severidad:** Mayor. Es la tercera vez que una fase se abre sin el acta de la anterior (NC-002, NC-009).
- **Evidencia:** PR del Batch 7, apilado sobre #61, y la decisión registrada en esta entrada antes del primer commit del batch.
- **Causa:** la misma de NC-009. Sin acceso de SJOM (NC-001) nadie puede aprobar, fusionar ni firmar, y el calendario sigue corriendo. _(Corregido el 10 de noviembre de 2026: SJOM aceptó la invitación ese día y tiene permiso write, pero no revisó ni aprobó; NC-012.)_
- **Contención:** el código de la fase 3 **no se fusiona** a `develop` antes de firmarse ACT-F1-001 y ACT-F2-001, en ese orden. La pila de PR se revisa de abajo hacia arriba.
- **Acción correctiva:** cerrar las fases 1 y 2 (firmas, fusiones, despliegue de `v0.2.0-rc.1` en staging y auditoría de la Tabla 60) antes de revisar el Batch 7. Responsables: SJOM firma; FJMP prepara. Fecha: al firmarse ACT-F2-001.
- **Acción preventiva:** el Batch 9 abre la fase 4. No se empieza sin el acta de la fase 3 salvo una nueva decisión registrada como esta.
- **Verificación de eficacia:** QA comprueba que la fusión de la fase 3 ocurre después de las firmas de ACT-F1-001 y ACT-F2-001.
- **Seguimiento, 10 de noviembre de 2026:** la contención no se cumplió. El código de la fase 3 (#62 y #63) se fusionó en `develop` el 10 de noviembre con el PR #30, sin ACT-F1-001 ni ACT-F2-001 firmadas. La acción preventiva tampoco se cumplió: el Batch 9 se empezó sin registrar antes la decisión (NC-011). **Responsable:** FJMP (reasignación). **Plan fechado:** FJMP firma ACT-F2-001 en el sub-batch 11.3, después de ACT-F1-001, con la desviación de NC-012. La etiqueta retroactiva `v0.2.0` (11.4) va después de esa firma. **Fecha:** 20 de noviembre de 2026. **Verificación de eficacia (sustituye a la de arriba, que ya no se puede cumplir):** la firma de ACT-F2-001 es posterior a la de ACT-F1-001 y anterior a la etiqueta `v0.2.0`. **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-011 — Fase 4 iniciada sin el acta de la fase 3

- **Fuente:** autodeclaración extemporánea, 10 de noviembre de 2026 (sub-batch 11.0, `plan-de-sistema.md`, 6.2).
- **Descripción:** el Batch 9 abrió la fase 4 (pagos y trámites: RF-006, RF-007 y RF-010) el 10 de noviembre de 2026. La regla 4 de `plan-de-sistema.md` dice que los batches que abren fase (4, 7, 9 y 14) esperan el acta firmada de la fase anterior. ACT-F3-001 está en borrador, y ACT-F1-001 y ACT-F2-001 tampoco están firmadas. Además, la acción preventiva de NC-010 pedía registrar la decisión antes de empezar el Batch 9, y no se registró.
- **Severidad:** Mayor. Es la cuarta vez que una fase se abre sin el acta de la anterior (NC-002, NC-009 y NC-010).
- **Evidencia:** PR #64 (Batch 9), abierto el 10 de noviembre a las 17:05 y fusionado en la pila; `docs/gobierno/actas/acta-aceptacion-fase-3.md` ("Fecha real de la decisión: pendiente"); `plan-de-sistema.md`, 6.1 ("sin papeleo nuevo: sin actas, CC ni NC adicionales").
- **Causa (cinco porqués):**
  1. ¿Por qué se abrió la fase sin acta? Porque FJMP decidió seguir construyendo.
  2. ¿Por qué el acta no estaba firmada? Porque la firma esperaba a SJOM, que no participó.
  3. ¿Por qué no se registró la NC antes de empezar? Porque la compactación de 6.1 suspendió el papeleo nuevo ese mismo día.
  4. ¿Por qué la compactación pudo suspenderlo? Porque ninguna regla impedía que una decisión de alcance dejara sin efecto las acciones preventivas de NC abiertas.
  5. Causa raíz: las acciones preventivas dependían de la disciplina de una sola persona, sin un control que las haga cumplir.
- **Contención:** el código de la fase 4 ya está en `develop`, porque el PR #30 se fusionó el 10 de noviembre a las 21:21. No se etiqueta `v0.4.0` ni se fusiona a `main` antes de firmar ACT-F1-001 a ACT-F4-001, en orden.
- **Acción correctiva:** FJMP firma ACT-F3-001 después de ACT-F1-001 y ACT-F2-001, con la desviación de NC-012 (sub-batch 11.3). **Responsable:** FJMP. **Fecha:** 20 de noviembre de 2026.
- **Acción preventiva:** el acta de promoción de cada etiqueta (sub-batches 11.4 y 14.1) comprueba que el acta de la fase anterior esté firmada antes de etiquetar. Una decisión de alcance no deja sin efecto las acciones de una NC abierta; si lo pretende, se registra como NC.
- **Verificación de eficacia:** el equipo auditor, o FJMP como autoverificación (NC-012), comprueba que las firmas de ACT-F1-001 a ACT-F3-001 sean anteriores a la etiqueta `v0.4.0`.
- **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-012 — Sin separación de funciones desde el 10 de noviembre de 2026

- **Fuente:** decisión de FJMP del 10 de noviembre de 2026 (`docs/gobierno/roles-y-raci.md`, apartado 6) y verificación con `gh` del mismo día.
- **Descripción:** desde el 10 de noviembre de 2026, FJMP produce, acepta, aprueba los CC, verifica sus propios defectos y NC, firma las actas y audita. Las garantías 1 a 4 de `roles-y-raci.md`, apartado 6, dejan de cumplirse, y también la regla 3 de `plan-de-sistema.md`. `samuel0rtiz` aceptó la invitación ese día a las 20:24 y tiene permiso _write_. Pero no revisó ni aprobó ninguno de los PR #30, #55 a #66 y #68, que se fusionaron entre las 20:38 y las 21:46. La protección de `develop` y `main` dejó de exigir la aprobación de otra persona. No existe ningún environment, y el `staging` que se crea en 11.4 tendrá a FJMP como revisor, con la autoaprobación permitida. Incumple las secciones 1.2, 10.4, 29.1 y 30.2 del manual.
- **Severidad:** Mayor. Afecta un control de seguridad: la separación de funciones en cambios que tocan pagos, calificaciones y seguridad (sección 29), como NC-001.
- **Evidencia:** `gh api repos/fjmp-dev/sce-control-escolar/collaborators` (`samuel0rtiz`, _write_); evento `MemberEvent` del 11 de noviembre a las 02:24 UTC; `gh search prs --reviewed-by samuel0rtiz`, sin resultados; `gh pr view` de #30, #55 a #66 y #68 (cero revisiones, fusionados por `fjmp-dev`); protección de ramas con cero aprobaciones.
- **Causa:** en la práctica, el equipo es una sola persona. SJOM no participa, y FJMP decidió continuar sin él para terminar el semestre.
- **Contención:**
  - Los controles independientes que quedan son automáticos: CI en verde, puerta de calidad, Gitleaks, Trivy, Newman y la matriz rol × endpoint ejecutable.
  - El asistente de IA está declarado en cada commit, pero no es independiente: es coautor.
  - Cada acta, CC y PR cita esta NC.
- **Acción correctiva:** no se puede cerrar sin una segunda persona. **Plan fechado:**
  1. Ofrecer la revisión independiente de la pila y del cierre de la fase 4 a la profesora o al equipo de PA-SCE-001, con el paquete del sub-batch 11.3. Fecha: 20 de noviembre de 2026.
  2. Si SJOM revisa o aprueba algo, se registra en el entregable y aquí.
  3. En el sub-batch 13.3 se decide si `samuel0rtiz` conserva el permiso _write_ (revisión de accesos). Fecha: 11 de diciembre de 2026.
  4. Si al 11 de diciembre de 2026 no hubo revisión independiente, la NC sigue abierta y se declara en el acta de liberación (sub-batch 14.1).
- **Acción preventiva:** en un proyecto futuro, el acceso de cada integrante se comprueba al iniciar (MJ-001), y la protección de ramas no se relaja sin registrar antes la NC.
- **Verificación de eficacia:** solo el equipo auditor o un revisor externo. FJMP no puede verificarla.
- **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026. Que acepte quien produce es parte de la misma desviación.

## NC-013 — Auditorías internas sin auditor independiente

- **Fuente:** contraste de la Tabla 60 y la sección 39.1 con el estado del proyecto, 10 de noviembre de 2026.
- **Descripción:** la Tabla 60 programa auditorías internas en el cierre de la fase 2, el cierre de la fase 4, antes del piloto y al cierre del semestre piloto. La sección 39.1 pide un auditor que no desarrolle ni opere el producto. Al 10 de noviembre no hay auditor designado:
  - La auditoría del cierre de la fase 2 no se hizo. Solo existe el índice de evidencia, que preparó el auditado (`docs/calidad/auditoria-fase-2-evidencia.md`). Se hace como autoauditoría en el sub-batch 11.3.
  - Las del cierre de la fase 4 y "antes de la liberación" se harán como autoauditoría por reejecución (sub-batches 11.3 y 13.6), que no es independiente. El asistente de IA tampoco lo es.
  - La del cierre del semestre no se realiza, porque no hay piloto (`plan-de-sistema.md`, 6.2).
- **Severidad:** Mayor. La auditoría es condición de cierre de las fases 2 y 4 (Tabla 60), de la misma clase que NC-002. Sin ella, nadie independiente verifica los controles de seguridad de la fase 4 (RNF-SEG-001 e ISO/IEC 27001:2022).
- **Evidencia:** `docs/calidad/auditoria-fase-2-evidencia.md` ("el auditor está por designar"); `plan-de-sistema.md`, apartado 8; `roles-y-raci.md`, apartado 5 ("Auditorías de la Tabla 60: pendiente de designar").
- **Causa:** el plan dejó la designación a "la profesora o el equipo auditor", sin fecha ni solicitud registrada. Nadie la pidió.
- **Acción correctiva:**
  1. FJMP pide por escrito a la profesora o al equipo de PA-SCE-001 que audite el cierre de la fase 4, con el paquete del sub-batch 11.3. Fecha: 20 de noviembre de 2026.
  2. Las auditorías del cierre de las fases 2 y 4 se hacen como autoauditoría por reejecución (Anexo F), marcadas como no independientes, en el sub-batch 11.3. Fecha: 20 de noviembre de 2026, antes de firmar ACT-F2-001 y ACT-F4-001 y de etiquetar `v0.4.0`. La solicitud de la acción 1 sigue en paralelo: si un auditor acepta antes del 11 de diciembre de 2026, audita esos cierres a posteriori y su informe se anexa a las actas.
  3. La auditoría "antes de la liberación" sigue el mismo criterio en el sub-batch 13.6. Fecha: 11 de diciembre de 2026.
- **Acción preventiva:** el auditor se designa al planear, con fecha, y la solicitud queda registrada.
- **Verificación de eficacia:** el auditor que se designe. Si no hay ninguno, la NC sigue abierta y se declara en el acta de liberación (sub-batch 14.1).
- **Aceptación (Tabla 61):** FJMP, como Product Owner, acepta este plan el 10 de noviembre de 2026.

## NC-014 — Código de CC-020 fusionado sin actualizar antes las figuras

- **Fuente:** revisión del sub-batch 11.0, 10 de noviembre de 2026.
- **Descripción:** CC-020 cambia la arquitectura: quita a Mercado Pago como sistema externo. Su código entró en `develop` el 10 de noviembre con el PR #30 (Batch 9, PR #64). Las figuras 1, 2, 3, 5, 9 y 10 siguen mostrando el checkout, el webhook y el sandbox, y se redibujan en el sub-batch 13.1. La Tabla 54 dice que "un cambio arquitectónico Must exige actualizar el diagrama antes de fusionar", y la regla 5 de `plan-de-sistema.md` pide CC y figuras antes del código.
- **Severidad:** Menor. Incumple una práctica documentada. No hay riesgo inmediato: las figuras describen un proveedor que el código ya no usa, y CC-020 documenta el cambio.
- **Evidencia:** `docs/gobierno/cambios/CC-020.md` ("Faltan las figuras (13.1)"); `docs/gobierno/registro-de-cambios.md`, fila CC-020; `docs/arquitectura/*.puml`.
- **Causa:** la compactación de 6.1 cambió el proveedor sin CC, y el CC llegó después del código (NC-008). Las figuras se agruparon con CC-022 para redibujarlas una sola vez.
- **Contención:** el manual v3.0 (apartado 5 y Tabla 3) y las notas de `v0.4.0` (11.4) declaran que esas figuras todavía muestran Mercado Pago.
- **Acción correctiva:** redibujar las figuras 1, 2, 3, 5, 9 y 10 con la pasarela simulada en el sub-batch 13.1, antes del corte de `release/1.0.0` (13.6). Responsable: FJMP.
- **Acción preventiva:** el PR de un CC que cambia la arquitectura incluye sus figuras; si no, no se fusiona (regla 5).
- **Verificación de eficacia:** el auditor, o FJMP como autoverificación (NC-012), comprueba que ninguna figura de `release/1.0.0` muestre a Mercado Pago.

## NC-015 — Ramas y etiquetas fuera de la Tabla 31 y de la sección 15.2

- **Fuente:** revisión del sub-batch 11.0, 10 de noviembre de 2026.
- **Descripción:** la retoma (`plan-de-sistema.md`, 6.2) se aparta de dos convenciones:
  - Las fases 1 a 3 se cierran con etiquetas retroactivas `v0.1.0` a `v0.3.0` sobre commits de `develop`, sin `release/x.y.z` ni fusión a `main`. La regla 8 del plan pide `release/x.y.z` fusionada a `main` en cada cierre de fase, y la sección 15.2 define `release/x.y.z` como la estabilización previa a la etiqueta. El apartado 9 de las actas de las fases 1 a 3 pide crear `release/0.x.0`.
  - El defecto #69 y las correcciones de `release/1.0.0` van en ramas `feature/<issue>-<descripción>`. La Tabla 31 y la sección 15.2 prevén `fix/id` para corregir defectos.
- **Severidad:** Menor. Incumple prácticas documentadas, sin riesgo inmediato: las etiquetas se anotan como retroactivas, `main` recibe las fases 1 a 4 juntas con `release/0.4.0`, y el issue de cada corrección lleva la etiqueta `defecto`.
- **Evidencia:** `plan-de-sistema.md`, 6.2 (Sub-batches y Versiones); apartado 9 de `acta-aceptacion-fase-1.md`, `acta-aceptacion-fase-2.md` y `acta-aceptacion-fase-3.md`.
- **Causa:** las fases 1 a 3 se integraron en `develop` hasta el 10 de noviembre, de golpe y sin actas (NC-009 a NC-011). Abrir ahora tres ramas de release sobre commits viejos no estabiliza nada.
- **Acción correctiva:** no se corrige. Se declara en las actas de las fases 1 a 3 (11.3) y en el acta de promoción de `v0.4.0` (11.4).
- **Acción preventiva:** desde `v0.4.0`, cada versión sale de su `release/x.y.z` fusionada a `main`.
- **Verificación de eficacia:** el auditor, o FJMP como autoverificación (NC-012), comprueba que `v0.4.0` y `v1.0.0` salgan de su rama de release fusionada a `main`.

## NC-016 — Issues de batch sin puntos de historia

- **Fuente:** autoauditoría del cierre de la fase 4 (`auditoria-fase-4.md`, hallazgo H-01), 10 de noviembre de 2026.
- **Descripción:** la Tabla 59 calcula la densidad de defectos como "defectos válidos entre puntos de historia entregados por fase". `.github/ISSUE_TEMPLATE/historia.yml` pide el campo "Puntos de historia" como su base. Los 12 issues de batch (#31 y #41 a #51) se abrieron sin puntos. Los informes de las fases 1 y 2 dijeron "Sin dato" y el de la fase 3 no dio la métrica, pero nadie abrió una NC. Los puntos se estimaron el 10 de noviembre de 2026, después de construir, y quien estimó ya conocía el tamaño real de cada PR.
- **Severidad:** Menor. Incumple una práctica documentada (plantilla y Tabla 59), sin riesgo inmediato para el producto.
- **Evidencia:** cuerpo de los issues antes del 10 de noviembre (`gh issue view <n> --json body`), sin la línea "Puntos de historia"; `informe-fase-1.md` e `informe-fase-2.md`, versión anterior a 11.3; `historia.yml`.
- **Causa (cinco porqués):**
  1. ¿Por qué no había densidad? Los issues no tenían puntos.
  2. ¿Por qué? Los issues de batch salieron del plan de sistema ("Del plan de sistema"), no de la plantilla de historia.
  3. ¿Por qué? Se trataron como paquetes de trabajo, no como historias.
  4. ¿Por qué no se corrigió al verlo? Los informes lo declararon, pero un "Sin dato" no disparaba una NC.
  5. ¿Por qué? No hubo revisor que exigiera la métrica (NC-012).
- **Contención:** puntos estimados con criterio escrito (`informe-fase-4.md`, apartado 2) y marcados en cada issue como "estimado después de construir". La tendencia F1→F4 se declara no comparable.
- **Acción correctiva:** hecha en 11.3.
- **Acción preventiva:** #75, #76 y #77 llevan sus puntos antes del primer commit de su trabajo (MJ-005). Un "Sin dato" en el tablero abre una NC o una acción con fecha.
- **Verificación de eficacia:** el auditor, o FJMP como autoverificación (NC-012), comprueba que #75 a #77 tengan la línea antes del primer commit de 12.1.

## NC-017 — Análisis de riesgos de la fase 4 fuera de tiempo

- **Fuente:** autoauditoría del cierre de la fase 4 (`auditoria-fase-4.md`, hallazgo H-02), 10 de noviembre de 2026.
- **Descripción:** dos herramientas de la Tabla 37 no se aplicaron cuando el plan lo pedía.
  - **AMFE de pagos:** `matriz-riesgos.md` (apartado 5) y `amfe-inscripcion.md` lo piden al inicio del Batch 9, antes del código. Se hizo el 10 de noviembre de 2026 en 11.3 (`amfe-pagos.md`). El cobro doble (#69, Crítica) lo encontró una revisión de código, no una prueba ni un análisis previo.
  - **STRIDE:** `stride.md` se actualiza "en cada batch que agrega un componente: pagos (9), trámites (10) y reportes (11)". Su tabla no tiene esos componentes al cierre de la fase 4.
- **Severidad:** Menor. Incumple una práctica documentada. El riesgo que se materializó (#69) ya está corregido (#71) y probado (CI-PAG-01).
- **Evidencia:** `amfe-pagos.md` (fecha y advertencia); `stride.md` v1.6, sin filas de pagos, caja, trámites ni reportes; issue #69, apartado "Caso y ejecución que lo detectó" ("Revisión de código del inventario de la retoma (sub-batch 11.1)… No lo cubre ningún caso").
- **Causa (cinco porqués):**
  1. ¿Por qué #69 llegó a `develop`? Ninguna prueba aprobaba dos intentos por el mismo adeudo.
  2. ¿Por qué? Nadie analizó los modos de fallo del pago antes del código.
  3. ¿Por qué? El AMFE del inicio del Batch 9 no se hizo.
  4. ¿Por qué? Los batches 9 a 11 se construyeron el 10 de noviembre de 2026, con el plan compactado (6.1), sin revisar los análisis de inicio de batch.
  5. ¿Por qué no se notó? No hay lista de inicio de batch ni revisor (MJ-001, NC-012).
- **Contención:** AMFE de pagos con el NPR del cobro doble antes y después (378 y 18), y con sus acciones fechadas.
- **Acción correctiva:** STRIDE v1.7 con pagos, caja, trámites y reportes (sub-batch 12.2, como ya lo prevé el plan). Acciones del AMFE en 12.1.
- **Acción preventiva:** el PR de un batch que toque dinero, cupos o calificaciones enlaza su AMFE y sus filas STRIDE; si no, no se fusiona (MJ-006).
- **Verificación de eficacia:** el auditor, o FJMP como autoverificación (NC-012), revisa el PR de 12.2.

## NC-018 — Sin conciliación de pagos ni medición del reflejo al cierre de la fase 4

- **Fuente:** autoauditoría del cierre de la fase 4 (`auditoria-fase-4.md`, hallazgo H-03), 10 de noviembre de 2026.
- **Descripción:** AU-24 pide "conciliación diaria y reflejo en menos de un minuto" (CD-DAT-03 y CD-DAT-06). `matriz-trazabilidad.md` asigna ambos casos a los batches 9 y 14. Al 10 de noviembre no existen `cd-dat-03.sql` ni `cd-dat-06.sql`. CC-020 los replanteó como conciliación interna y los movió a 12.1, después del cierre de la fase. La métrica 8 de la Tabla 59 ("diferencias detectadas en la conciliación diaria") no se puede calcular.
- **Severidad:** Menor. RF-006 tiene casos satisfactorios (CF-PAG-01 y CI-PAG-01); el pago es simulado y los datos sintéticos; el movimiento y el saldo se escriben en la misma transacción. **El auditor puede reclasificarla como Mayor:** CD-DAT-03 es un caso de RNF-DAT-001, que es Must.
- **Evidencia:** `ls api/prisma/verificacion/` (sin `cd-dat-03.sql` ni `cd-dat-06.sql`); `matriz-trazabilidad.md`, filas CD-DAT-03 y 06; `cambios/CC-020.md`, fila AU-24; `plan-de-sistema.md`, 12.1.
- **Causa (cinco porqués):**
  1. ¿Por qué no hay conciliación? No existe la consulta.
  2. ¿Por qué? Estaba pensada contra Mercado Pago, y con la pasarela simulada no hay proveedor contra quien conciliar.
  3. ¿Por qué no se replanteó en el Batch 9? CC-020 llegó después del código (NC-008).
  4. ¿Por qué quedó después del cierre? La retoma (6.2) puso antes el defecto #69 y las reglas Must.
  5. ¿Por qué no bloqueó el cierre? La lista de QA del cierre no revisaba los CD-DAT de la fase.
- **Contención:** `movimiento.pago_id` único, `movimiento()` con saldo y movimiento juntos, y la prueba del corte del día (`pagos.spec.ts`).
- **Acción correctiva:** en 12.1, `cd-dat-03.sql` (saldo contra movimientos, pago contra abono y corte contra abonos del día UTC-6) y `cd-dat-06.sql` con CC-011, con Great Expectations que no pase en vacío y su prueba de detección. Responsable: FJMP.
- **Acción preventiva:** la lista de QA del cierre de fase revisa que existan los CD-DAT de la fase (`informe-fase-4.md`, apartado 9).
- **Verificación de eficacia:** el auditor, o FJMP como autoverificación (NC-012), corre las dos consultas en la etapa 4 de la corrida de `release/1.0.0` y comprueba que detectan una diferencia sembrada.
