# Mejora continua — SCE

**Fuente:** SCE-MC-001 v2.0, sección 41. **Vigente desde:** 5 de noviembre de 2026.

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

## 2. Registro de acciones de mejora

| ID | Descripción | Fuente | Responsable | Fecha objetivo | Estado |
|---|---|---|---|---|---|
| MJ-001 | Lista de verificación de inicio de fase: ambos integrantes con acceso de escritura y condición de la Tabla 23 revisada | NC-001, NC-006 | FJMP | 13 de noviembre de 2026 | Hecha en parte: Anexo B. Falta aplicarla al abrir la fase 2 |
| MJ-002 | Revisor independiente que contrasta cada cierre de fase contra el manual | Revisión del plan de sistema | FJMP | Primer cierre: fase 1 | Abierta. Sin revisor al 10 de noviembre de 2026 (NC-012 y NC-013); se retoma en el sub-batch 11.3 |
| MJ-003 | Integrar cada sub-batch a `develop` en cuanto su CI está en verde, sin apilar más de una fase. Después de cada fusión, comprobar que el pipeline de `develop` termina en verde, con las etapas 6 y 7 | Acta del sprint S3 | FJMP | 20 de noviembre de 2026 | Abierta |
| MJ-004 | Al cerrar cada sprint, cerrar los issues entregados y mover los pendientes al hito siguiente. Cada issue de batch lleva hito | Acta del sprint S3 (AU-43) | FJMP | 13 de noviembre de 2026 | Abierta |
