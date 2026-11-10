# Plan de trabajo — SCE

**Vigente desde:** 15 de octubre de 2026.
**Equipo:** Francisco Javier Martínez Peñas (FJMP) · Samuel Jezoar Ortiz Martínez (SJOM).
**Capacidad:** entre cinco y diez horas semanales entre ambos. Sprints de dos semanas.
**Restricción dominante:** la auditoría PA-SCE-001 v1.1. Según su sección 7, la verificación en campo fue del 3 al 5 de noviembre, el informe preliminar es el 6 y la réplica el 7.

El semestre debe terminar con el proyecto completo. Este plan fija el calendario y los sprints. **El orden de construcción por batches está en `plan-de-sistema.md`, aprobado por FJMP el 5 de noviembre de 2026**; ese documento también recoge los cambios a este plan (apartado 6).

---

## 1. Calendario por fases

El manual no incluía calendario con fechas, y esa ausencia es uno de los puntos que la auditoría señaló. Este es el calendario propuesto, anclado a los hitos de la sección 39.1 del manual.

| Fase | Entregable principal | Batches | Construcción (fechas reales) | Estabilización | Cierre límite |
|---|---|---|---|---|---|
| 0 | Alcance validado | 0 | 1 de agosto al 19 de octubre de 2026 | 15 al 19 de octubre de 2026 | **19 de octubre de 2026** |
| 1 | Núcleo institucional | 1, 2 y 3 | 5 al 7 de noviembre de 2026 | 16 de noviembre al 11 de diciembre de 2026 | 11 de diciembre de 2026 |
| 2 | Expediente e inscripción | 4, 5 y 6 | 7 al 8 de noviembre de 2026 | 16 de noviembre al 11 de diciembre de 2026 | 11 de diciembre de 2026 |
| 3 | Académico: horarios, calificaciones e historial | 7 y 8 | 10 de noviembre de 2026 | 16 de noviembre al 11 de diciembre de 2026 | 11 de diciembre de 2026 |
| 4 | Pagos simulados, trámites y reportes | 9 y 10 | 10 al 13 de noviembre de 2026 | 16 de noviembre al 11 de diciembre de 2026 | 11 de diciembre de 2026 |
| 5 | Piloto de una facultad | — | Fuera del alcance del proyecto escolar (cambio del 10 de noviembre, apartado 6) | — | — |

**Estabilización** es el tramo final, después de construir. En ese tramo no entra funcionalidad nueva: solo se corrigen defectos, se ejecutan las pruebas de aceptación y se firman las actas. Como la construcción terminó antes de lo previsto, las fases 1 a 4 comparten la estabilización de los sprints S4 y S5.

Las fechas de cierre son **límite**: cada fase se cierra con acta de fecha real. Las fases 2, 3 y 4 empezaron sin el acta firmada de la anterior (NC-009 y NC-010); las actas se firman en la estabilización.

---

## 2. Sprints del periodo inmediato

| Sprint | Fechas | Acepta (PO y QA) | Produce (Dev y DevOps) | Meta |
|---|---|---|---|---|
| S1 | 15 al 19 de octubre (corto) | SJOM | FJMP | Cerrar la fase 0 y los faltantes de gobierno antes de que termine la etapa documental de la auditoría |
| S2 | 20 de octubre al 30 de octubre | FJMP | SJOM | Correcciones al manual y plan de pruebas, antes de la verificación en campo |
| S3 | 2 al 13 de noviembre | SJOM | FJMP | Atender la auditoría en campo y construir las fases 1 a 4 (batches 0 a 10) |
| S4 | 16 al 27 de noviembre | FJMP | SJOM | Revisar y aprobar los PR, pruebas de aceptación y manual v2.1 (27 de noviembre) |
| S5 | 30 de noviembre al 11 de diciembre | SJOM | FJMP | Firmar las actas de las fases 1 a 4, fusionar, etiquetar y entregar |

S1 es corto a propósito: son los cinco días que quedan antes de que cierre la etapa 1 de la auditoría.

---

## 3. Backlog priorizado

Cada elemento es un issue de GitHub con el mismo número (#1 a #22), su sprint como hito y etiquetas de prioridad y fase. El estado vivo está en los issues; esta tabla es la línea base del 15 de octubre.

### P0 — Antes del 19 de octubre

Son los faltantes que la auditoría ya tiene criterio para encontrar y que se cierran con horas de escritorio, no de desarrollo.

| # | Qué falta | Por qué urge | Responsable | Acepta |
|---|---|---|---|---|
| 1 | Firmar el acta de aceptación de la fase 0 | Cierra el riesgo RK-10, hoy abierto y declarado. El criterio AU-07 verifica actas por fase firmadas por PO y QA. | FJMP redacta | SJOM firma como PO |
| 2 | Asignar persona a cada uno de los seis roles y publicar la RACI con nombres | AU-04 verifica que los roles existan con personas asignadas y que quien desarrolla no acepte su propia entrega. La Tabla 2 del manual deja Revisor y Aprobador como instancia, no como persona. | Ambos, en sesión | Ambos |
| 3 | Registrar la aprobación de la versión 2.0 del manual con fecha, versión y medio | Lo exige la propia sección 1.2 del manual: sin ese registro, la versión no es auditable. AU-01 lo verifica. | SJOM | FJMP |
| 4 | Proteger la rama `main` y activar el escaneo de secretos con protección de envío | AU-09 verifica protección de ramas y ausencia de envío directo a `main`. RK-07 es de nivel Alto y hoy está abierto. | FJMP | SJOM |
| 5 | Publicar este calendario por fases | La auditoría registró que el manual no lo tiene. Mientras no exista, el cronograma de la auditoría queda al aire. | FJMP | SJOM |
| 6 | Crear el tablero en GitHub Projects y cargar este backlog como issues | AU-43 verifica la metodología en operación, no declarada. Sin tablero, el sprint no deja rastro. | SJOM | FJMP |

### P1 — Antes del 30 de octubre

Correcciones al manual que la auditoría va a encontrar en su revisión documental. Cerrarlas antes convierte seis hallazgos probables en cero.

| # | Qué falta | Por qué urge | Responsable | Acepta |
|---|---|---|---|---|
| 7 | Unificar el conjunto de casos CS-SEG, que el manual nombra con tres alcances distintos: 01 a 04, 01 a 06 y 01 a 08 | AU-02 revisa consistencia interna. La reconciliación ya está propuesta en `docs/calidad/matriz-trazabilidad.md`, sección 4; falta llevarla al manual. | SJOM | FJMP |
| 8 | Definir los casos CR-REN-02 a CR-REN-05, declarados en el Anexo A pero inexistentes en el manual | Mismo criterio AU-02. Ya están propuestos en el catálogo de casos; falta aprobarlos. | SJOM | FJMP |
| 9 | Unificar las dos escalas de dictamen: la sección 8.4 usa prioridad alta, media y baja, y la 40.1 usa mayor, menor y observación, sin mapeo declarado | De esto depende si una no conformidad mayor con plan fechado bloquea o no la aceptación. Es el punto que más puede mover el dictamen final. | FJMP | SJOM |
| 10 | Añadir la entidad `periodo` a la Tabla 29, que enumera veinte entidades cuando la sección 13.6 declara veintiuna | AU-08 compara los modelos contra el esquema. | SJOM | FJMP |
| 11 | Llevar la matriz de trazabilidad completa al manual: la Tabla 27 cubre diez de los veinte requisitos | AU-05 verifica que los veinte tengan caso, módulo y fase. Es el hallazgo mayor más probable de toda la auditoría. | FJMP | SJOM |
| 12 | Añadir el RTO al criterio de verificación de RNF-FIA-002, que hoy solo fija la pérdida máxima de datos | La propia Parte B del plan de auditoría ya lo señaló. | SJOM | FJMP |
| 13 | Precisar en la sección 20.1 que la puerta de rendimiento se cumple con la ejecución en staging, para que no contradiga a la 24.2 | AU-02. | FJMP | SJOM |
| 14 | Verificar la edición vigente de la NMX-I-059-NYCE y de la legislación de datos personales que cita el manual, y añadir la normativa estatal si aplica | AU-03 revisa el cien por ciento de las normas citadas. El plan del auditor anunció además que revisará la norma estatal del Estado de México. | FJMP | SJOM |
| 15 | Emitir el manual en versión 2.1 con los puntos 7 a 14 y actualizar el historial de la sección 1.3 | Sin nueva versión, las correcciones no son trazables. | FJMP | SJOM |
| 16 | Redactar el plan de pruebas conforme al Anexo H, con la plantilla de ISO/IEC/IEEE 29119-3 | AU-29 verifica plan de pruebas con casos, requisito, ambiente, resultado y evidencia. Está declarado pendiente ante el auditor. | SJOM | FJMP |

### P2 — A partir del 2 de noviembre

Arranque real de la fase 1. Ya es desarrollo, no documentación.

| # | Qué falta | Responsable | Acepta |
|---|---|---|---|
| 17 | Integración continua mínima: build, pruebas y análisis estático en cada pull request | SJOM | FJMP |
| 18 | Esqueleto del proyecto: Next.js en presentación, NestJS en API, PostgreSQL con Prisma, todo en Docker Compose | Ambos | Cruzado |
| 19 | Primera migración con los catálogos institucionales: facultad, plan de estudios, materia, prerrequisito y periodo | FJMP | SJOM |
| 20 | Autenticación con JWT y los seis roles, con guards por endpoint — satisface RF-008 | SJOM | FJMP |
| 21 | Casos CS-SEG-01 a CS-SEG-04 automatizados | FJMP | SJOM |
| 22 | Alta de usuarios y catálogos institucionales desde el panel de administración | SJOM | FJMP |

---

## 4. Lo que no se hace ahora

Para que el recorte sea una decisión y no un olvido:

- **Piloto real.** Depende de una facultad, de la Dirección y de un semestre completo.
- **Ambiente de piloto.** Se monta en el Batch 13. **Staging** se monta antes de cerrar la fase 2 (Batch 6), porque AU-08, AU-17 y AU-19 lo piden desde esa fase.
- **Pruebas de carga.** Exigen staging (Batch 13). **OWASP ZAP** corre desde el Batch 2 en el ambiente de pruebas, como dice la Tabla 30.
- **Integración con Mercado Pago.** Fase 4 (Batch 9).

Todo lo anterior está declarado ante el equipo auditor como *No aplica por fase*, no omitido (`docs/auditoria/respuesta-F-01-SCE-002.md`).

---

## 5. Seguimiento

Este plan se revisa en la sesión de cierre de cada sprint. Los elementos cumplidos se marcan en el acta correspondiente; los que se recorren cambian de fecha con motivo escrito.

Un elemento P0 o P1 que se recorra dos sprints seguidos se convierte en riesgo y pasa a `docs/calidad/matriz-riesgos.md`.

---

## 6. Cambios a este plan

Motivo escrito, conforme al apartado 5.

| Fecha | Cambio | Motivo |
|---|---|---|
| 5 nov 2026 | Se adopta `plan-de-sistema.md`: batches 0 a 14, por fases (Tablas 23, 25 y 27) | El equipo decidió construir el sistema completo, y al contrastar el repositorio con el manual completo se encontraron desviaciones |
| 5 nov 2026 | Los batches pueden adelantar las fechas de fase | Las fechas de cierre pasan a ser límite; cada fase conserva su acta y sus condiciones |
| 5 nov 2026 | Staging se adelanta de la fase 3 a antes de cerrar la fase 2 | PA-SCE-001 exige evidencia de staging desde la fase 2 |
| 5 nov 2026 | OWASP ZAP se adelanta de la fase 3 al ambiente de pruebas, desde el Batch 2 | La Tabla 30 lo ubica en pruebas e integración |
| 5 nov 2026 | Elementos P1 #7 a #15 pasan al sprint S4, con el manual v2.1 a más tardar el 27 de noviembre de 2026 | Vencieron el 30 de octubre sin reprogramación (NC-004). El sprint S2 priorizó el arranque técnico |
| 5 nov 2026 | La columna «Acepta» del apartado 2 cede ante la regla por entregable | Si FJMP produce el entregable de un sprint par, lo acepta SJOM. Ver `roles-y-raci.md`, apartado 2 |
| 10 nov 2026 | Calendario del apartado 1 con las fechas reales de construcción; las fases 1 a 4 cierran a más tardar el 11 de diciembre de 2026 | Los batches 0 a 8 se construyeron del 5 al 10 de noviembre, antes de las fechas estimadas de 2027 |
| 10 nov 2026 | Los batches 9 a 14 se compactan en dos: 9, pagos simulados y trámites; 10, reportes y revisión final. Sin Mercado Pago real, piloto, monitoreo, pruebas de carga ni usabilidad con participantes | Es un proyecto escolar: basta con que el sistema funcione bien de punta a punta. Ver `plan-de-sistema.md`, apartado 6.1 |

