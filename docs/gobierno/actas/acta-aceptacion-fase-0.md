# Acta de aceptación de fase — Fase 0

**Proyecto:** Sistema de Control Escolar Universitario (SCE)
**Manual de referencia:** SCE-MC-001 v2.0, secciones 10.3, 10.4 y 11.2
**Fase:** 0 — Alcance validado
**Periodo cubierto:** 1 de agosto de 2026 al 19 de octubre de 2026
**Acta número:** ACT-F0-001

> **Estado: borrador pendiente de firma.** Esta acta se cierra en la sesión del 19 de octubre de 2026. Las dos firmas deben corresponder a personas distintas, conforme a la sección 10.1 del manual.

---

## 1. Entregable comprometido

Según la Tabla 25 del manual, el entregable de la fase 0 es el **alcance validado**, con las actividades clave de entrevistas, revisión de documentos reales y matriz de lo que entra y lo que no.

---

## 2. Entregables producidos

| # | Entregable | Ubicación | Estado |
|---|---|---|---|
| 1 | Manual de calidad SCE-MC-001 v2.0, con alcance, política, objetivos, modelo de calidad y requisitos | Repositorio documental | Emitido el 16 de septiembre de 2026 |
| 2 | Catálogo de los veinte requisitos funcionales y no funcionales | `docs/calidad/catalogo-requisitos.md` | Completo |
| 3 | Matriz de trazabilidad de los veinte requisitos y catálogo de veintinueve casos de prueba | `docs/calidad/matriz-trazabilidad.md` | Completa |
| 4 | Matriz de los diez riesgos con nivel, tratamiento, responsable y estado | `docs/calidad/matriz-riesgos.md` | Completa |
| 5 | Diez diagramas de arquitectura en formato fuente, con render | `docs/arquitectura/` | Completos |
| 6 | Modelo de datos de veintiuna entidades y restricciones de integridad | `docs/datos/` | Completo |
| 7 | Metodología de trabajo y plan de trabajo con calendario por fases | `docs/gobierno/` | Completos |
| 8 | Repositorio de código establecido | github.com/fjmp-dev/sce-control-escolar | Operativo |

---

## 3. Verificación de los criterios de aceptación de fase

Criterios de la sección 10.3 del manual, aplicados a una fase cuyo entregable es documental.

| Criterio | Resultado | Evidencia |
|---|---|---|
| El alcance de la primera versión está delimitado, con lo que entra y lo que queda fuera | Cumple | Manual, sección 3 |
| Los requisitos están especificados y son verificables | Cumple | Catálogo de requisitos; los veinte tienen criterio de verificación |
| Existe trazabilidad entre requisito, módulo, caso de prueba y fase | Cumple | Matriz de trazabilidad, veinte de veinte |
| La arquitectura está descrita en vistas, conforme a ISO/IEC/IEEE 42010 | Cumple | Diez diagramas en `docs/arquitectura/` |
| Los riesgos están identificados, evaluados y con tratamiento asignado | Cumple | Matriz de riesgos, diez riesgos |
| No queda abierto ningún requisito Must sin criterio de prueba definido | Cumple | Catálogo de casos, veintinueve casos |
| Los riesgos de nivel Alto están mitigados o aceptados por escrito | **Cumple con salvedad** | Ver apartado 4 |

---

## 4. Salvedades y riesgos aceptados

| Riesgo | Nivel | Situación al cierre | Decisión |
|---|---|---|---|
| RK-04 — Caída o lentitud durante la semana de inscripción | Alto | Abierto. No existe ambiente piloto donde medirlo; los casos CR-REN-01 a 05 están definidos pero no son ejecutables en esta fase. | **Aceptado con plan fechado.** Se verifica en la fase 5, conforme a la puerta 3 de la sección 20.1. |
| RK-07 — Secretos expuestos en el repositorio o en registros | Alto | El repositorio existe desde el 14 de octubre de 2026. El escaneo de secretos queda configurado como elemento P0 del plan de trabajo. | **Mitigación comprometida al 19 de octubre de 2026.** |

Los riesgos RK-01, RK-02, RK-03 y RK-09, también de nivel Alto, quedan en estado **diseñado**: su control está definido en el modelo de datos y en los diagramas, y se implementa en la fase que corresponda. No hay exposición, porque no existe sistema en operación.

---

## 5. Elementos declarados como no aplicables a esta fase

Conforme a la sección 3.3 del plan de auditoría PA-SCE-001, se declara que los siguientes elementos no existen porque su fase de origen no se ha alcanzado, y no por omisión:

- Pipeline de integración y despliegue continuos, y sus ejecuciones.
- Ambientes de desarrollo compartido, pruebas, staging y piloto.
- Backlog y tablero de sprint operando con issues reales.
- Reportes de ejecución de pruebas, cobertura y escaneos.
- Registro de defectos.
- Inventario de ambientes, registros de despliegue y actas de restauración.

---

## 6. Pendientes que se trasladan a la fase 1

| # | Pendiente | Fecha comprometida |
|---|---|---|
| 1 | Registro de aprobación de la versión 2.0 del manual, con fecha, versión y medio | 19 de octubre de 2026 |
| 2 | Protección de la rama `main` y escaneo de secretos con protección de envío | 19 de octubre de 2026 |
| 3 | Tablero de sprint operando en GitHub Projects | 19 de octubre de 2026 |
| 4 | Manual en versión 2.1, con las correcciones de consistencia identificadas | 30 de octubre de 2026 |
| 5 | Plan de pruebas conforme al Anexo H | 30 de octubre de 2026 |

---

## 7. Dictamen de la fase

**La fase 0 se acepta**, con las salvedades del apartado 4 y los pendientes del apartado 6, que quedan con responsable y fecha comprometida.

Se autoriza el inicio de la fase 1, Núcleo institucional, a partir del 20 de octubre de 2026.

---

## 8. Firmas

Conforme a la sección 10.1 del manual, sin acta firmada por quien ocupa Product Owner y por quien ocupa QA no hay aceptación auditable. Ambas firmas deben corresponder a personas distintas.

| Rol en el sprint S1 | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner | Samuel Jezoar Ortiz Martínez | | |
| QA | Samuel Jezoar Ortiz Martínez | | |
| Autor del entregable | Francisco Javier Martínez Peñas | | |

> **Nota sobre las firmas.** En el sprint S1, conforme a la tabla de roles de `docs/gobierno/metodologia-de-trabajo.md`, SJOM ocupa Product Owner y QA, y FJMP es el autor. Que una sola persona ocupe los dos roles de aceptación es una limitación de un equipo de dos y debe quedar registrada como tal. Lo que sí se cumple, y es lo que verifica el criterio AU-04, es que **quien acepta no es quien produjo el entregable**. A partir del sprint S2 los roles se invierten.
