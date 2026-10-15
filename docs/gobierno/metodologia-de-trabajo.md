# Metodología de trabajo — SCE

**Documento de referencia:** SCE-MC-001 v2.0, secciones 5, 10, 11, 12, 15, 16 y 29.
**Vigente desde:** 15 de octubre de 2026.
**Equipo:** Francisco Javier Martínez Peñas (FJMP) · Samuel Jezoar Ortiz Martínez (SJOM).

Este documento aterriza la metodología de la sección 11 del manual a un equipo de dos personas con entre cinco y diez horas semanales. Lo que el manual declara en abstracto, aquí se vuelve una regla que se puede verificar.

---

## 1. El problema que resuelve

El manual declara seis roles de entrega: Product Owner, Desarrollo, QA, Seguridad, DevOps y Administrador del sistema. Somos dos. Hay dos maneras de resolverlo y solo una sobrevive a una auditoría:

| Opción | Consecuencia |
|---|---|
| Repartirnos los roles de forma fija | Cada quien se vuelve cuello de botella de su área. Con dos personas y diez horas, el proyecto se detiene cada vez que uno no puede. |
| Que los dos hagamos de todo, sin más | Incumple la RACI del manual y el criterio AU-04 de la auditoría: quien desarrolla acabaría aceptando su propia entrega. |
| **Trabajo compartido, rendición de cuentas alternada** | **La que adoptamos.** Ambos podemos tocar cualquier parte del sistema, pero para cada entregable hay un autor y un aceptante distintos, y el aceptante nunca es quien lo escribió. |

La regla, en una línea: **cualquiera de los dos hace cualquier cosa; nadie aprueba lo que él mismo escribió.**

---

## 2. Roles y rendición de cuentas

Los seis roles del manual no se asignan a una persona de forma permanente. Se asignan **por sprint**, y el reparto se invierte en el siguiente.

| Rol del manual | Sprint impar (S1, S3, S5…) | Sprint par (S2, S4, S6…) |
|---|---|---|
| Product Owner | FJMP | SJOM |
| QA | FJMP | SJOM |
| Desarrollo | SJOM | FJMP |
| DevOps | SJOM | FJMP |
| Seguridad | Quien **no** haya escrito el código que se revisa | Quien **no** haya escrito el código que se revisa |
| Administrador del sistema | SJOM | FJMP |

Esto significa que en un sprint dado, quien ocupa Product Owner y QA es el que acepta, y quien ocupa Desarrollo y DevOps es el que produce. Al sprint siguiente se invierte, de modo que ninguno acumula poder de aceptación sobre su propio trabajo a lo largo del proyecto.

**Excepción que no se negocia:** si por razones de tiempo uno de los dos escribe algo que le tocaría aceptar a él mismo, ese entregable espera al otro. No se aprueba nada en solitario. Si el otro no puede en toda la semana, se registra como impedimento en el acta del sprint y el entregable no cuenta como terminado.

### 2.1 Matriz RACI operativa

R = ejecuta · A = aprueba y rinde cuentas · C = consultado.
"Autor" y "Revisor" se resuelven según la tabla anterior en cada sprint.

| Actividad | Autor | Revisor |
|---|---|---|
| Definir y cambiar alcance | R | A |
| Priorizar el backlog del sprint | R | A |
| Escribir código de dominio y reglas de negocio | R | A |
| Escribir pruebas automatizadas | R | A |
| Revisar y aprobar un pull request | — | A |
| Controles de acceso y bitácora | R | A |
| Pruebas de seguridad | R | A |
| Ambientes, despliegue y respaldos | R | A |
| Aceptar el incremento y cerrar el sprint | R | A |
| Cerrar un defecto | R | A |
| Actualizar el manual y los documentos de calidad | R | A |

---

## 3. Cadencia

**Sprints de dos semanas.** Con cinco a diez horas semanales entre los dos, un sprint de una semana no alcanza a producir un incremento aceptable, y uno de tres pierde el hilo.

| Ceremonia | Cuándo | Duración | Qué produce |
|---|---|---|---|
| Planeación | Lunes de inicio del sprint | 30 min | Backlog del sprint con responsable por elemento |
| Punto de control | Lunes intermedio | 15 min | Ajuste de alcance si algo se atoró |
| Revisión y cierre | Viernes de fin del sprint | 45 min | Acta de sprint firmada por ambos |
| Retrospectiva | En la misma sesión de cierre | 15 min | Una acción de mejora, registrada |

No hay reunión diaria. Con dos personas y esta carga sería teatro, y el manual no la exige: su sección 11.3 pide rituales y artefactos, no una frecuencia concreta.

**Comunicación entre ceremonias:** por escrito en los issues de GitHub, no en chat. Lo que se decide en chat y no queda en un issue, no existe para efectos de trazabilidad.

---

## 4. Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Código, documentación, modelos y matrices | Este repositorio |
| Backlog, sprint y seguimiento | GitHub Projects, tablero único del repositorio |
| Defectos | Issues de GitHub con etiqueta `defecto` y severidad |
| Riesgos | `docs/calidad/matriz-riesgos.md`, más issues con etiqueta `riesgo` |
| Actas de sprint y de fase | `docs/gobierno/actas/` |
| Evidencias de la auditoría en curso | `docs/gobierno/auditoria/` |
| Decisiones de arquitectura | `docs/arquitectura/` |

Regla única: **si no está en el repositorio, no es evidencia.** Un archivo en el escritorio de alguno de los dos no cuenta.

### 4.1 Etiquetas de los issues

| Etiqueta | Para qué |
|---|---|
| `fase-0` … `fase-5` | A qué fase del plan de desarrollo pertenece |
| `RF-00X` / `RNF-XXX-00X` | Qué requisito satisface. Todo issue de producto lleva una. |
| `defecto` | Error encontrado, con `sev-1` a `sev-4` |
| `riesgo` | Acción de mitigación de un riesgo RK |
| `auditoria` | Acción derivada de un hallazgo o solicitud del auditor |
| `documental` | Cambio al manual o a los documentos de calidad |

Un issue sin etiqueta de requisito o sin etiqueta de riesgo, auditoría o documental, no entra al sprint. Esa es la forma práctica de mantener viva la trazabilidad que exige la sección 12.3.

---

## 5. Definición de terminado

Tres niveles, tomados de la sección 10 del manual.

### 5.1 Un issue está terminado cuando

- El código está fusionado a `main` por pull request aprobado por el otro integrante.
- Tiene prueba automatizada si toca una regla de negocio Must.
- No introduce secretos ni datos personales reales.
- El issue quedó cerrado con referencia al commit o al pull request.
- Si tocó un requisito, la matriz de trazabilidad quedó actualizada.

### 5.2 Un sprint está terminado cuando

- Todos sus issues están cerrados o devueltos al backlog con motivo escrito.
- La integración continua está en verde sobre `main`.
- Existe acta de sprint firmada por ambos, con lo entregado, lo pendiente y la acción de mejora.
- La matriz de riesgos se revisó y se actualizó el estado de los que cambiaron.

### 5.3 Una fase está terminada cuando

- Se cumplen los criterios de la sección 10.3 del manual.
- Todo requisito Must de la fase tiene evidencia de prueba con resultado favorable.
- Existe acta de aceptación de fase, firmada por quien ocupa Product Owner y por quien ocupa QA en ese sprint, que deben ser personas distintas.
- Los riesgos de nivel Alto abiertos están mitigados o aceptados por escrito con plan fechado.

---

## 6. Control de versiones

| Elemento | Convención |
|---|---|
| Rama principal | `main`, protegida. Sin envío directo. |
| Ramas de trabajo | `feat/`, `fix/`, `docs/`, `chore/` más una descripción corta |
| Mensajes de commit | Prefijo semántico: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:` |
| Versión del sistema | Versionado semántico, etiqueta por línea base de fase |
| Versión del manual | `mayor.menor` según la sección 1.3 del manual |
| Migraciones de base de datos | Versionadas y nunca aplicadas a mano |

**Ningún pull request se fusiona sin:** aprobación del otro integrante, integración continua en verde y la descripción indicando qué issue cierra.

---

## 7. Control de cambios

Todo cambio que afecte un requisito Must, la política de calidad o el alcance de la primera versión genera **una nueva versión del manual** (sección 12.4). El flujo es corto:

1. Se abre un issue con etiqueta `documental` describiendo el cambio y su motivo.
2. Se evalúa el impacto en alcance, esfuerzo, seguridad y datos.
3. Lo aprueba quien ocupe Product Owner ese sprint, que no puede ser quien lo propuso si además lo escribió.
4. Se implementa en una rama `docs/` y se fusiona por pull request.
5. Se actualiza el historial de la sección 1.3 del manual.

No se implementan cambios informales. Sin registro no hay trazabilidad ni aceptación.

---

## 8. Durante la auditoría

Mientras la auditoría PA-SCE-001 esté en curso, se añaden tres reglas temporales:

- **Toda respuesta al equipo auditor se da por escrito**, aunque la pregunta llegue por chat. El chat sirve para avisar que ya se respondió, no para responder.
- **Todo lo que no existe se declara**, en lugar de dejar la solicitud sin respuesta. Lo declarado por escrito se registra como *No aplica por fase* o *No verificable*; lo omitido se registra como incumplimiento.
- **Ningún hallazgo se discute en solitario.** La respuesta a un hallazgo la redacta uno y la revisa el otro antes de enviarse, igual que un pull request.

---

## 9. Qué hacer cuando no alcanza el tiempo

Con cinco a diez horas semanales, los sprints se van a quedar cortos. El orden de sacrificio, de lo primero que se recorta a lo último:

1. Funcionalidad de prioridad Could.
2. Funcionalidad de prioridad Should.
3. Refinamiento de interfaz.
4. **Nunca:** las pruebas de una regla Must, el acta de cierre, la actualización de la trazabilidad ni la revisión cruzada del pull request.

Recortar alcance es legítimo y se registra. Recortar la verificación es lo que convierte un proyecto atrasado en un proyecto no auditable.
