# Mejora continua — SCE

**Fuente:** SCE-MC-001 v2.0, sección 41. **Vigente desde:** 5 de noviembre de 2026. **Actualizado:** 10 de noviembre de 2026 (sub-batch 11.3: lecciones de la fase 4, MJ-002 reformulada y MJ-005 a MJ-010).

Al cierre de cada sprint, de cada fase y del semestre piloto se capturan lecciones y acciones de mejora, bajo el ciclo planificar, hacer, verificar y actuar. Las mejoras que cambien un requisito Must o la política de calidad obligan a actualizar el manual.

## 1. Bitácora de lecciones aprendidas

| Fecha | Origen | Lección |
|---|---|---|
| 5 nov 2026 | Autoevaluación ante PA-SCE-001 | Un control que depende de un acceso no verificado no es un control: el PR #29 se fusionó sin revisión porque el segundo integrante nunca tuvo acceso (NC-001) |
| 5 nov 2026 | Autoevaluación ante PA-SCE-001 | Las actas deben partir de la condición textual de la Tabla 23, no de criterios propios (NC-006) |
| 5 nov 2026 | Contraste contra el manual completo | Se construyó parte de la API habiendo leído solo fragmentos del manual, y no cumplía la letra. Antes de cada módulo se releen su sección y sus figuras (`plan-de-sistema.md`) |
| 5 nov 2026 | Respuesta a F-01 | Citar una figura o tabla sin leerla es peor que no citarla: un comentario atribuía a la Figura 4 un orden que no es el suyo |
| 10 nov 2026 | Retrospectiva del sprint S3 | Una pila de PR que espera revisión aleja la rama de integración: `develop` no recibió nada del 22 de octubre al 10 de noviembre, y al fusionar todo de golpe el pipeline falló por una regla que ningún PR había probado (el mensaje del merge commit) |
| 10 nov 2026 | Retrospectiva del sprint S3 | Una decisión de alcance que suspende el papeleo deja sin efecto las acciones preventivas de las NC abiertas. Así se abrió la fase 4 sin acta y sin registro previo (NC-011) |
| 10 nov 2026 | Retrospectiva del sprint S3 | Las notas de versión se escriben después de crear la etiqueta, no antes: las de v1.0.0 describen una etiqueta y una release que no existen |
| 10 nov 2026 | Cierre de la fase 4 (11.3) | Se confirmó la lección anterior. El push de la fusión del #30 a `develop` falló en commitlint por el mensaje "Merge #30: …" (corrida 42952266697): commitlint solo ignora los mensajes de fusión que redacta GitHub. Lo corrigió el #68 (corrida 42954928046, en verde). Una forma nueva de fusionar se prueba contra la etapa 2 antes de usarla |
| 10 nov 2026 | Cierre de la fase 4 (11.3) | El cobro doble (#69, crítico) lo encontró una revisión de código en 11.1, no una prueba. Las pruebas de pago probaban un solo intento por adeudo. El AMFE de pagos, que debía hacerse antes del código, se hizo después (NC-017). Un modo de fallo que nadie escribe no tiene prueba |
| 10 nov 2026 | Cierre de la fase 4 (11.3) | Para ahorrar un ciclo de CI, el #78 (11.2) incluyó el #74 (semilla, #73). Ahorra minutos, pero un PR queda con dos alcances y la trazabilidad cita un PR para dos issues |
| 10 nov 2026 | Autoauditorías de 11.3 | Los puntos de historia estimados después de construir permiten calcular la densidad, pero no la hacen comparable: las fases 1 a 3 no registraron sus fallos y dan 0 por construcción (NC-016) |

## 2. Registro de acciones de mejora

| ID | Descripción | Fuente | Responsable | Fecha objetivo | Estado |
|---|---|---|---|---|---|
| MJ-001 | Lista de verificación de inicio de fase: ambos integrantes con acceso de escritura y condición de la Tabla 23 revisada | NC-001, NC-006 | FJMP | 13 de noviembre de 2026 | Hecha en parte: Anexo B. Falta aplicarla al abrir la fase 2 |
| MJ-002 | Pedir por escrito un auditor o revisor independiente que repita las autoauditorías de las fases 2 y 4 y revise cada cierre de fase contra el manual | Revisión del plan de sistema; NC-012 y NC-013 | FJMP | 20 de noviembre de 2026 | Abierta. Las autoauditorías de 11.3 (`auditoria-fase-2.md` y `auditoria-fase-4.md`) dejan la reejecución lista, pero no son independientes. Sin revisor al 10 de noviembre de 2026 |
| MJ-003 | Integrar cada sub-batch a `develop` en cuanto su CI está en verde, sin apilar más de una fase. Después de cada fusión, comprobar que el pipeline de `develop` termina en verde, con las etapas 6 y 7 | Acta del sprint S3 | FJMP | 20 de noviembre de 2026 | Abierta |
| MJ-004 | Al cerrar cada sprint, cerrar los issues entregados y mover los pendientes al hito siguiente. Cada issue de batch lleva hito | Acta del sprint S3 (AU-43) | FJMP | 13 de noviembre de 2026 | Abierta |
| MJ-005 | Estimar los puntos de historia en el issue antes de empezar su trabajo. Primero #75, #76 y #77 | NC-016 | FJMP | Antes del sub-batch 12.1 | Abierta |
| MJ-006 | Todo PR que toque dinero, cupos o calificaciones cita su modo del AMFE y su fila de STRIDE, y cada modo de severidad 9 o más tiene una prueba antes de fusionar | NC-017; #69 | FJMP | Sub-batch 12.2 | En vigor desde 12.2: casilla en `.github/pull_request_template.md`. Falta comprobarla en el primer PR de esa clase |
| MJ-007 | Dividir todo issue estimado en más de 13 puntos antes de empezarlo | `auditoria-fase-4.md`, OB-06 (#51, 21 puntos) | FJMP | Antes del sub-batch 12.1 | Abierta |
| MJ-008 | Al cerrar cada fase, agregar sus casos con estado y corrida a `plan-de-pruebas.md`, apartado 6. Primero los de la fase 4 | `auditoria-fase-4.md`, OB-08 | FJMP | Sub-batch 12.1 | Abierta |
| MJ-009 | Un PR por issue: no juntar alcances para ahorrar CI | Lección del #78 | FJMP | Desde el sub-batch 12.1 | Abierta |
| MJ-010 | El informe de fase cuenta aparte los fallos corregidos antes del PR y los defectos registrados. La densidad se compara solo desde la fase 4 | `auditoria-fase-2.md`, OB-04; `auditoria-fase-4.md`, OB-05 | FJMP | Informe de liberación, 13.6 | Abierta |

Las demás observaciones de las autoauditorías de 11.3 no abren MJ: ya tienen sub-batch en `plan-de-sistema.md` (12.1, 12.2, 12.6 y Batch 13), una acción del AMFE de pagos o una NC.
