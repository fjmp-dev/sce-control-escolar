# Plan de trabajo — SCE

**Vigente desde:** 15 de octubre de 2026.
**Equipo:** Francisco Javier Martínez Peñas (FJMP) · Samuel Jezoar Ortiz Martínez (SJOM).
**Capacidad:** entre cinco y diez horas semanales entre ambos. Sprints de dos semanas.
**Restricción dominante:** la auditoría PA-SCE-001 corre del 8 de octubre al 1 de diciembre de 2026. Su etapa documental cierra el 23 de octubre y su verificación en campo va del 2 al 10 de noviembre.

El semestre debe terminar con el proyecto completo. Este plan cubre lo inmediato: cerrar lo que hace falta y empezar a avanzar. El backlog de las fases 2 a 5 se detalla al cierre de cada fase, no ahora.

---

## 1. Calendario por fases

El manual no incluía calendario con fechas, y esa ausencia es uno de los puntos que la auditoría señaló. Este es el calendario propuesto, anclado a los hitos de la sección 39.1 del manual.

| Fase | Entregable principal | Inicio | Cierre previsto |
|---|---|---|---|
| 0 | Alcance validado | 1 de agosto de 2026 | **19 de octubre de 2026** |
| 1 | Núcleo institucional | 20 de octubre de 2026 | 11 de diciembre de 2026 |
| 2 | Expediente e inscripción | 12 de enero de 2027 | 26 de febrero de 2027 |
| 3 | Académico: horarios, calificaciones e historial | 1 de marzo de 2027 | 16 de abril de 2027 |
| 4 | Pagos y trámites | 19 de abril de 2027 | 28 de mayo de 2027 |
| 5 | Piloto de una facultad | 31 de mayo de 2027 | Cierre del semestre piloto |

Las fechas de las fases 2 a 5 son estimación a validar al cierre de la fase 1. Las de la fase 0 y 1 son firmes.

---

## 2. Sprints del periodo inmediato

| Sprint | Fechas | Acepta (PO y QA) | Produce (Dev y DevOps) | Meta |
|---|---|---|---|---|
| S1 | 15 al 19 de octubre (corto) | SJOM | FJMP | Cerrar la fase 0 y los faltantes de gobierno antes de que termine la etapa documental de la auditoría |
| S2 | 20 de octubre al 30 de octubre | FJMP | SJOM | Correcciones al manual y plan de pruebas, antes de la verificación en campo |
| S3 | 2 al 13 de noviembre | SJOM | FJMP | Atender la auditoría en campo y arrancar la fase 1 |
| S4 | 16 al 27 de noviembre | FJMP | SJOM | Fase 1: núcleo institucional, primera mitad |
| S5 | 30 de noviembre al 11 de diciembre | SJOM | FJMP | Fase 1: núcleo institucional, cierre |

S1 es corto a propósito: son los cinco días que quedan antes de que cierre la etapa 1 de la auditoría.

---

## 3. Backlog priorizado

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

- **Fases 2 a 5.** Se planean al cierre de la fase 1, no antes.
- **Ambientes de staging y piloto.** Corresponden a la fase 3; montarlos antes sería infraestructura sin nada que desplegar.
- **Pruebas de carga y de seguridad ejecutadas.** Los casos ya están definidos; ejecutarlos exige sistema desplegado.
- **Integración con Mercado Pago.** Fase 4.

Todo lo anterior está declarado ante el equipo auditor como *No aplica por fase*, no omitido.

---

## 5. Seguimiento

Este plan se revisa en la sesión de cierre de cada sprint. Los elementos cumplidos se marcan en el acta correspondiente; los que se recorren cambian de fecha con motivo escrito.

Un elemento P0 o P1 que se recorra dos sprints seguidos se convierte en riesgo y pasa a `docs/calidad/matriz-riesgos.md`.
