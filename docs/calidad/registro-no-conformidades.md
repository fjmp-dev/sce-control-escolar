# Registro de no conformidades y acciones correctivas — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 40 (clasificación en la Tabla 61; ciclo en la 40.2).
**Vigente desde:** 5 de noviembre de 2026.

Cada no conformidad (NC) tiene identificador, fuente, descripción, severidad, evidencia, causa, acción correctiva, acción preventiva, responsable, fecha, verificación y cierre. Las que se listan aquí las **detectó el propio equipo** al preparar la respuesta a la solicitud F-01-SCE-002 de la auditoría PA-SCE-001 y al contrastar el repositorio contra el manual completo. Se registran antes del informe preliminar para que ninguna quede abierta sin plan fechado (manual 8.4 y 40.1).

La verificación de eficacia la hace quien ocupe QA en el sprint de cierre, que nunca es quien ejecutó la acción, o el equipo auditor.

---

## Resumen

| ID | Severidad | Descripción breve | Criterio de auditoría | Responsable | Fecha comprometida | Estado |
|---|---|---|---|---|---|---|
| NC-001 | Mayor | Pull request #29 fusionado sin aprobación de otro integrante | AU-04, AU-11 | SJOM (revisión) · FJMP (acceso) | 7 de noviembre de 2026 | Abierta con plan |
| NC-002 | Mayor | Fase 1 iniciada sin acta de aceptación de la fase 0 firmada | AU-07 | SJOM | 6 de noviembre de 2026 | Abierta con plan |
| NC-003 | Menor | Sin registro de aprobación de la versión 2.0 del manual | AU-01 | SJOM | 6 de noviembre de 2026 | Abierta con plan |
| NC-004 | Menor | Elementos P1 del plan de trabajo (#7 a #15) vencidos sin reprogramación escrita | AU-02, AU-43 | FJMP | 27 de noviembre de 2026 | Abierta con plan |
| NC-005 | Menor | Tablas de roles por sprint contradictorias entre documentos de gobierno | AU-04 | FJMP | 5 de noviembre de 2026 | Corregida; pendiente de verificación |
| NC-006 | Mayor | No existe el acta de levantamiento que la Tabla 23 exige para la fase 0 | AU-07, AU-43 | Ambos | 27 de noviembre de 2026, a confirmar por el equipo | Abierta con plan |
| NC-007 | Menor | El catálogo de casos CS-SEG del repositorio divergió de la Tabla 49 del manual | AU-02, AU-05, AU-29 | FJMP | 5 de noviembre de 2026 | Corregida; pendiente de verificación |
| NC-008 | Menor | Cambios CC-001 a CC-006 implementados sin aprobación registrada | AU-06 | SJOM | 7 de noviembre de 2026 | Abierta con plan |
| NC-009 | Mayor | Batch 4 (fase 2) iniciado sin el acta de la fase 1 firmada, por decisión de FJMP | AU-07 | FJMP · SJOM | Al firmar ACT-F1-001 | Abierta con plan |

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

## NC-002 — Acta de la fase 0 sin firmar

- **Fuente:** autoevaluación; elemento 6 de F-01-SCE-002.
- **Descripción:** el acta ACT-F0-001 debía firmarse el 19 de octubre de 2026 y sigue en borrador. Aun así, la fase 1 arrancó el 20 de octubre. La sección 10.1 del manual dice que, sin acta firmada por Product Owner y QA, no hay aceptación auditable.
- **Severidad:** Mayor. Incumple el registro obligatorio de aceptación de fase.
- **Evidencia:** `docs/gobierno/actas/acta-aceptacion-fase-0.md` e issue #1 abierto.
- **Causa:** la firma se dejó para una sesión presencial que no ocurrió. Ninguna regla impedía iniciar la fase siguiente sin el acta firmada.
- **Acción correctiva:** SJOM firma el acta como Product Owner y QA, ya con la evaluación de la Tabla 23 y la salvedad por NC-006. El acta conserva su fecha de cierre de fase y registra que la firma es extemporánea. Responsable: SJOM. Fecha: 6 de noviembre de 2026.
- **Acción preventiva:** no se abre ninguna fase sin el acta de la anterior firmada. Se incorpora a la definición de terminado de la fase.
- **Verificación de eficacia:** el equipo auditor revisa el acta firmada. Al cierre de la fase 1 se verifica que el acta exista antes del inicio de la fase 2.

## NC-003 — Sin registro de aprobación del manual v2.0

- **Fuente:** autoevaluación; issue #3.
- **Descripción:** la sección 1.2 del manual exige registrar la aprobación con fecha, versión y medio. La versión 2.0 se emitió el 16 de septiembre de 2026 sin ese registro.
- **Severidad:** Menor. Es una práctica documentada; no hay riesgo inmediato sobre el producto.
- **Evidencia:** issue #3 abierto.
- **Acción correctiva:** firmar `docs/gobierno/registro-aprobacion-manual-v2.0.md`. Responsable: SJOM, como Product Owner del sprint S3. Fecha: 6 de noviembre de 2026.
- **Acción preventiva:** la versión 2.1 no se publica sin su registro de aprobación (issue #15).
- **Verificación de eficacia:** QA del sprint S4 comprueba que el registro esté firmado y vinculado al issue #3.

## NC-004 — Elementos P1 vencidos sin reprogramación

- **Fuente:** autoevaluación contra `docs/gobierno/plan-de-trabajo.md`, sección 5.
- **Descripción:** las correcciones al manual (#7 a #14) y la emisión de la versión 2.1 (#15) vencían el 30 de octubre de 2026. No se cumplieron, y tampoco se registró su nueva fecha con motivo escrito, como exige la sección 5 del plan de trabajo.
- **Severidad:** Menor. Las correcciones ya están hechas en el repositorio (`docs/calidad/`, `registro-de-cambios.md`); falta llevarlas al manual.
- **Causa:** el sprint S2 priorizó el arranque técnico de la fase 1 sobre las correcciones documentales.
- **Acción correctiva:** reprogramar los elementos #7 a #15 al sprint S4 y emitir el manual v2.1 a más tardar el 27 de noviembre de 2026. Responsable: FJMP. Acepta: SJOM.
- **Acción preventiva:** si los elementos se recorren de nuevo, pasan a la matriz de riesgos, como indica la sección 5 del plan de trabajo.
- **Verificación de eficacia:** el equipo auditor, en el seguimiento, revisa el manual v2.1 y su registro de aprobación.

## NC-005 — Tablas de roles contradictorias

- **Fuente:** autoevaluación.
- **Descripción:** `metodologia-de-trabajo.md` y `roles-y-raci.md` asignaban Product Owner y QA de los sprints impares a FJMP, y `plan-de-trabajo.md` los asignaba a SJOM.
- **Severidad:** Menor.
- **Acción correctiva:** se alinearon los tres documentos con el plan de trabajo el 5 de noviembre de 2026. Responsable: FJMP.
- **Verificación de eficacia:** QA del sprint (SJOM) revisa la corrección en el PR #30.

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

## NC-007 — Catálogo CS-SEG distinto de la Tabla 49

- **Fuente:** contraste de `matriz-trazabilidad.md` con la Tabla 49 y con PA-SCE-001, 5 de noviembre de 2026.
- **Descripción:** el repositorio definió CS-SEG-02 a 08 con significados propios, y CC-002 fijó esa numeración. La Tabla 49 los define de otra manera, y el plan de auditoría usa la del manual (AU-14 cita CS-SEG-04 y 07; AU-15, 01 a 03; AU-16, 06). Como consecuencia, la prueba llamada CS-SEG-06 verificaba la inmutabilidad de la bitácora, no lo que la Tabla 49 pide, y la respuesta F-01 v1.1 citó esas etiquetas.
- **Severidad:** Menor. Ningún control se perdió; el defecto está en la identificación de los casos.
- **Evidencia:** Tabla 49; `plan-de-pruebas.md` v1.0, sección 7.
- **Causa:** se reconciliaron los rangos que el manual menciona sin tomar la Tabla 49 como definición de cada caso.
- **Acción correctiva:** catálogo, plan de pruebas y nombres de pruebas alineados con la Tabla 49; CC-002 corregido; respuesta F-01 v1.2. Responsable: FJMP. Fecha: 5 de noviembre de 2026.
- **Acción preventiva:** el catálogo cita la tabla del manual de la que sale cada caso.
- **Verificación de eficacia:** QA revisa la corrección en el pull request del Batch 0.

## NC-008 — Cambios implementados sin aprobación registrada

- **Fuente:** revisión de `registro-de-cambios.md`, 5 de noviembre de 2026.
- **Descripción:** CC-001 a CC-006 se implementaron y CC-003 a CC-006 entraron en el PR #29, pero su tabla de aprobaciones sigue vacía. La sección 16.2 pone la aprobación antes de la implementación, y CC-004 y CC-005 son de tipo Mayor.
- **Severidad:** Menor. Es una práctica documentada, sin riesgo inmediato sobre datos; los cambios refuerzan controles.
- **Evidencia:** `docs/gobierno/registro-de-cambios.md`; issues #23 a #28.
- **Causa:** comparte causa con NC-001: el segundo integrante no tenía acceso para aprobar.
- **Acción correctiva:** SJOM aprueba o rechaza cada cambio con fecha y responsable. Lo rechazado se revierte. Responsable: SJOM. Fecha: 7 de noviembre de 2026.
- **Acción preventiva:** ningún código de un cambio Mayor se fusiona sin su CC aprobado (`plan-de-sistema.md`, regla 5).
- **Verificación de eficacia:** el equipo auditor revisa el registro de aprobaciones.

## NC-009 — Fase 2 iniciada sin el acta de la fase 1

- **Fuente:** autodeclaración, 7 de noviembre de 2026.
- **Descripción:** el Batch 4 abre la fase 2 (expediente). La regla 4 de `plan-de-sistema.md` y la acción preventiva de NC-002 dicen que una fase no se abre sin el acta de la anterior firmada. ACT-F1-001 está en borrador y su apartado 9 lista lo que falta. FJMP decidió continuar el desarrollo para no detenerlo mientras el segundo integrante no tiene acceso al repositorio.
- **Severidad:** Mayor. Repite la desviación de NC-002, ahora con la regla ya escrita.
- **Evidencia:** PR del Batch 4, apilado sobre #58, y la decisión registrada en esta entrada.
- **Causa:** la aceptación depende de una sola persona sin acceso (NC-001), y el calendario de la fase 1 cierra el 11 de diciembre de 2026.
- **Contención:** el código de la fase 2 **no se fusiona** a `develop` antes de firmarse ACT-F1-001. Se mantiene la regla "ninguna fase cierra sin fusión".
- **Acción correctiva:** firmar ACT-F1-001 y fusionar la fase 1 antes de revisar el Batch 4. Responsables: SJOM firma; FJMP prepara. Fecha: al firmarse ACT-F1-001.
- **Acción preventiva:** si vuelve a ocurrir, la decisión se registra como esta, antes de empezar el batch.
- **Verificación de eficacia:** QA comprueba que la fusión de la fase 2 ocurre después de la firma de ACT-F1-001.
