# Roles y RACI con personas asignadas — SCE

**Documento de referencia:** SCE-MC-001 v2.0, secciones 1.2, 5.1, 5.2 y 5.3.
**Vigente desde:** 15 de octubre de 2026.

Este documento resuelve lo que el manual deja abierto: las tablas 2, 11 y 12 nombran roles e instancias, pero no personas. El criterio AU-04 de la auditoría verifica que cada rol tenga persona asignada y que quien desarrolla no acepte su propia entrega.

---

## 1. Integrantes

| Clave | Nombre | Correo institucional |
|---|---|---|
| FJMP | Francisco Javier Martínez Peñas | *por completar* |
| SJOM | Samuel Jezoar Ortiz Martínez | *por completar* |

---

## 2. Asignación de los seis roles de entrega

Los roles **no son permanentes**. Se asignan por sprint y se invierten en el siguiente, de modo que ninguno de los dos acumule poder de aceptación sobre su propio trabajo. La regla completa está en `metodologia-de-trabajo.md`, apartado 2.

| Rol (Tabla 11 del manual) | Sprint impar | Sprint par |
|---|---|---|
| Product Owner | SJOM | FJMP |
| Desarrollo | FJMP | SJOM |
| QA | SJOM | FJMP |
| Seguridad | Quien no escribió el código que se revisa | Quien no escribió el código que se revisa |
| DevOps | FJMP | SJOM |
| Administrador del sistema | FJMP | SJOM |

**La regla prevalece por entregable** (vigente desde el 5 de noviembre de 2026). La tabla es la asignación por omisión y coincide con la columna «Acepta» de `plan-de-trabajo.md`, sección 2. Pero quien produce un entregable nunca lo acepta: **mientras FJMP produzca, SJOM ocupa Product Owner, QA y Seguridad para ese entregable y aprueba el pull request**, sin importar el sprint. Si SJOM produce una parte, la acepta FJMP.

**Sprint vigente:** S3, del 2 al 13 de noviembre de 2026.

> **Correcciones del 5 de noviembre de 2026.** La tabla tenía las columnas invertidas respecto al plan de trabajo y trataba el sprint S1 como excepción (NC-005). Se corrigió para que los tres documentos de gobierno digan lo mismo. Las desviaciones que ocurrieron en S2 se tratan en `docs/calidad/registro-no-conformidades.md`.

---

## 3. Responsables de elaboración, revisión y aprobación del manual

Completa la Tabla 2 del manual, que deja tres filas como instancia y no como persona.

| Rol | Persona | Función | Responsabilidad |
|---|---|---|---|
| Autor | Francisco Javier Martínez Peñas | Planteamiento y diseño | Contenido técnico y de alcance |
| Autor | Samuel Jezoar Ortiz Martínez | Planteamiento y diseño | Contenido técnico y de alcance |
| Revisor — QA | Quien ocupe QA en el sprint de la revisión | Aseguramiento de calidad | Completitud, trazabilidad y evidencias |
| Revisor — Seguridad | Quien no haya redactado la sección revisada | Seguridad de la información | Controles de acceso, bitácora y datos personales |
| Aprobador — Product Owner | Quien ocupe Product Owner en el sprint de la aprobación | Gobierno del producto | Autoriza la vigencia del manual |
| Aprobador — Dirección de facultad piloto | *Sin asignar. Rol institucional externo al equipo.* | Patrocinio institucional | Autoriza la aplicación en el piloto |

> La fila de Dirección de facultad piloto queda sin persona de forma deliberada: es un rol institucional que no corresponde a ningún integrante del equipo. Mientras no exista facultad piloto designada, se declara como no aplicable a la fase actual. Esta declaración es preferible a dejar la fila vacía sin explicación.

---

## 4. Matriz RACI con personas

R = ejecuta · A = aprueba y rinde cuentas · C = consultado · I = informado.
"Autor" y "Revisor" se resuelven según el apartado 2 en cada sprint.

| Actividad | Autor | Revisor |
|---|---|---|
| Definir y cambiar alcance | R | A |
| Priorizar las fases 0 a 5 | R | A |
| Reglas de inscripción, créditos y promedio | R | A |
| Diseño e implementación de módulos | R | A |
| Controles de acceso y bitácora | R | A |
| Pruebas funcionales y de integración | R | A |
| Pruebas de seguridad y datos personales | R | A |
| Pruebas de rendimiento | R | A |
| Ambientes, despliegue y respaldos | R | A |
| Altas de usuarios y catálogos del piloto | R | A |
| Aceptación del incremento y del piloto | R | A |
| Auditoría de evidencias de calidad | R | A |
| Gestión de defectos | R | A |
| Actualización del manual y documentos de calidad | R | A |

Se conserva la regla del manual: **ninguna actividad de aceptación o auditoría tiene a quien desarrolla como responsable de rendir cuentas.**

---

## 5. Organigrama funcional

Sección 5.2 del manual.

| Nivel | Roles | Personas |
|---|---|---|
| 1 | Product Owner y Dirección de la facultad piloto | Según el apartado 2. Dirección: sin asignar |
| 2 | Desarrollo, QA y Seguridad | Según el apartado 2 |
| 3 | DevOps y Administrador del sistema | Según el apartado 2 |
| 4 | Usuarios del piloto | Sin asignar: no hay facultad piloto |
| Línea independiente | Auditor, que no reporta al equipo de desarrollo | PA-SCE-001: equipo Aerial Forge. Auditorías de la Tabla 60: pendiente de designar |

---

## 6. Limitación declarada

Un equipo de dos personas no permite separación plena de funciones. En un sprint dado, la misma persona ocupa Product Owner y QA, que en una organización mayor serían distintas.

Lo que sí se garantiza, y es lo que exige el criterio de separación de funciones:

1. Quien produce un entregable **nunca** es quien lo acepta.
2. Quien abre un pull request **nunca** es quien lo aprueba.
3. Quien introduce un defecto **nunca** es quien verifica su corrección.
4. La asignación se invierte cada sprint, de modo que la concentración no es permanente.

Esta limitación se declara de forma expresa ante el equipo auditor, en lugar de presentarse como una separación de funciones que el tamaño del equipo no permite.

**También se declara:**

- Una sola persona puede firmar como Product Owner, QA y Seguridad en un mismo entregable. El manual pide firma de PO y QA, y no exige que sean personas distintas; un documento anterior del equipo sí lo decía, y se corrigió.
- Si se aprueba CC-007, FJMP suma Desarrollo y Administrador del sistema en sus sprints. Las acciones del administrador quedan en bitácora.
- **FJMP trabaja con un asistente de IA (Claude Code)**. Se declara en cada commit con `Co-Authored-By`. El asistente no aprueba ni acepta nada, y FJMP rinde cuentas por el código que entrega.

**Cambio del 10 de noviembre de 2026: el proyecto sigue sin SJOM.** SJOM no aceptó la invitación al repositorio ni revisó los entregables, y FJMP decidió continuar sin él. Desde esa fecha, FJMP produce y también aprueba: fusiona sus pull requests, firma el manual v3.0 y las actas, y verifica sus propios defectos. Por eso **las garantías 1 a 3 de arriba dejan de cumplirse**. No se presenta como separación de funciones: es una desviación de las secciones 1.2, 10.4 y 29 del manual, y se declara aquí ante el equipo auditor. Lo que queda como control independiente es automático: CI en verde, puerta de calidad, Gitleaks, Trivy, Newman y la matriz rol × endpoint ejecutable.

## 7. Aprobación

Sección 5.3 del manual: organigrama funcional y RACI aprobados por el Product Owner.

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| Product Owner | Samuel Jezoar Ortiz Martínez | | | |
