# Registro de no conformidades y acciones correctivas — SCE

**Documento de referencia:** SCE-MC-001 v2.0, sección 40 (clasificación en la Tabla 61; ciclo en la 40.2).
**Vigente desde:** 5 de noviembre de 2026.

Cada no conformidad (NC) tiene identificador, fuente, descripción, severidad, evidencia, causa, acción correctiva, acción preventiva, responsable, fecha, verificación y cierre. Las que se listan aquí las **detectó el propio equipo** al preparar la respuesta a la solicitud F-01-SCE-002 de la auditoría PA-SCE-001. Se registran antes del informe preliminar para que ninguna quede abierta sin plan fechado (manual 8.4 y 40.1).

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

---

## NC-001 — Pull request fusionado sin revisión

- **Fuente:** autoevaluación previa al informe preliminar de PA-SCE-001.
- **Descripción:** el pull request #29 (*Fase 1: base de datos PostgreSQL, pgAudit, API con roles, plan de pruebas y CI*) se fusionó a `Desarrollo` el 23 de octubre de 2026 con cero revisiones. Lo abrió y lo fusionó la misma persona. El cambio toca autenticación y autorización, así que la sección 29 exige revisión de otro integrante.
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
- **Acción correctiva:** SJOM firma el acta como Product Owner y QA del sprint de aceptación. El acta conserva su fecha de cierre de fase y registra que la firma es extemporánea. Responsable: SJOM. Fecha: 6 de noviembre de 2026.
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
