# Acta de ensayo de mesa — vulneración de datos personales

**Procedimiento ensayado:** `docs/gobierno/respuesta-a-incidentes.md` v1.1, apartados 1 a 4 y §4.1 (notificación de vulneraciones).
**Fuente:** SCE-MC-001 v2.0, Tabla 38 (respuesta a incidentes); PA-SCE-001, Parte B (AU-18).
**Fecha:** 10 de noviembre de 2026. **Modalidad:** de mesa. No se ejecutó nada en ningún ambiente: las pantallas y consultas se citan, no se corrieron.
**Estado:** para firma de FJMP. **Sub-batch:** 12.6, issue #75.

**Participantes:** FJMP, en todos los roles: Product Owner, Seguridad, Administrador del sistema y DevOps. No hubo observador independiente (NC-012). El asistente de IA declarado en `roles-y-raci.md` preparó el guion y la redacción; no decide ni firma.

**Escenario sintético.** Ningún dato es real. Las horas son simuladas.

> En la operación de un piloto, la titular de la cuenta `control.escolar@sce.test` avisa a las 09:00 que alguien entró con su cuenta de madrugada: le llegó un aviso del equipo de cómputo y ella no estuvo conectada. Los registros JSON de la API muestran que, entre las 02:00 y las 02:20, esa cuenta hizo 140 consultas `GET /alumnos/:matricula` y 35 `GET /alumnos/:matricula/calificaciones`. No hay escrituras. El registro no distingue si el historial se mostró o se descargó en CSV: se supone que se descargó.

---

## 1. Cronología

| Hora | Paso | Qué se hizo | Resultado |
|---|---|---|---|
| 09:00 | Detección | Seguridad recibe el aviso y abre el incidente | Inicio del reloj |
| 09:10 | Clasificación (apartado 1) | Datos de alumnos vistos por un tercero | **Crítica.** Comunicación inmediata al Product Owner |
| 09:15 | Contención (apartado 2) | El administrador da de baja la cuenta en Usuarios, "Cuenta activa" | Revoca sus sesiones al instante (CC-010) |
| 09:20 | Evidencia (apartado 3) | Registros JSON de 02:00 a 02:20. `muestreo-bitacora.sql` filtrado por autor = la cuenta | La bitácora no tiene asientos de esa cuenta en esa ventana: solo hubo lecturas, y las lecturas no se registran |
| 09:40 | §4.1, paso 1: confirmar | Con `inventario.md`: control escolar ve matrícula, nombre, facultad, ingreso, estatus, correo, historial, inscripciones, calificaciones y trámites | Hay datos personales. **No se puede saber qué expedientes se consultaron:** el registro guarda la plantilla de la ruta, sin matrícula (H-1). Se toman todos los alumnos que control escolar podía ver |
| 10:00 | §4.1, paso 2: valorar | Datos académicos y de identificación de todos los alumnos; 35 historiales salieron del sistema en CSV | **Afectación significativa:** derechos morales. No hay datos patrimoniales: control escolar no consulta cuentas |
| 10:30 | §4.1, paso 3: notificar | Texto con el modelo de §4.1. Destinatarios: todos los alumnos y la autoridad garante | Texto listo en 90 minutos, dentro de la meta de 72 horas. La autoridad garante no se identificó con certeza (H-3). El SCE no tiene canal de envío: notifica la universidad (H-4) |
| 10:40 | §4.1, paso 4: registrar | Se redacta la NC con los campos de la bitácora de vulneraciones | Es de ensayo: no se agrega al registro de no conformidades |
| 10:50 | §4.1, paso 5: revisar | Se revisan RK-11 y el análisis de riesgos | Se agregan las acciones 8 y 15 al plan de `documento-de-seguridad.md` |
| 11:00 | Recuperación | ¿Cómo vuelve a trabajar la titular? | Reactivar la cuenta devuelve el acceso a quien conozca la contraseña, y el administrador no puede restablecerla. Hay que dar de alta otra cuenta (H-5) |

**Texto de notificación ensayado:**

> El 10 de noviembre de 2026 detectamos que una persona ajena entró al Sistema de Control Escolar con la cuenta de una empleada de control escolar, entre las 2:00 y las 2:20. Pudo ver tu matrícula, nombre, facultad, estatus, calificaciones e historial; en algunos casos descargó el historial. No pudo ver tu estado de cuenta ni cambiar nada. Ya cancelamos esa cuenta y sus sesiones. Te recomendamos estar atento a mensajes que usen tus datos escolares para pedirte información o pagos. Para más información, escribe a [medio de la Unidad de Transparencia].

---

## 2. Hallazgos

| ID | Hallazgo | Acción |
|---|---|---|
| H-1 | Los registros JSON no dicen qué expediente se leyó, por diseño (CS-SEG-08), y la bitácora solo registra escrituras. No se puede acotar la vulneración y se notifica a todos | Acción 8 de `documento-de-seguridad.md`: valorar una bitácora de lecturas del expediente. Decide Seguridad; necesita CC |
| H-2 | La detección dependió del aviso de una persona. Nada alerta por un volumen anormal de consultas de una cuenta | Acción 15 de `documento-de-seguridad.md`: regla de alerta en el monitoreo del Batch 13 |
| H-3 | No se sabe con certeza cuál es la autoridad garante ni el plazo legal: la ley estatal no está cotejada en la Gaceta y el Infoem se extinguió | Acción 1 de `documento-de-seguridad.md` |
| H-4 | El SCE no tiene canal para avisar a los titulares | Se acepta: notifica la universidad, que es la responsable |
| H-5 | Una cuenta comprometida no se puede recuperar: no hay restablecimiento de contraseña por el administrador | Ligado a la acción 9 y a la decisión abierta "Recuperación de contraseña" de `stride.md` |
| H-6 | Los CSV descargados quedan fuera del SCE y no se pueden recuperar | La notificación lo dice. Sin acción en el sistema |

## 3. Conclusión

El procedimiento se pudo seguir completo en mesa, y la notificación quedó lista dentro de la meta interna. El ensayo dejó en §4.1 una regla: si la vulneración no se puede acotar, se notifica a todos los titulares que la cuenta o el componente podían ver. Queda pendiente el ensayo técnico de contención en staging (apartado 5 del procedimiento, Batch 13).

**Limitación:** quien escribió el procedimiento también lo ensayó y lo evalúa (NC-012). El acta se ofrece al equipo auditor.

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Product Owner y Seguridad | Francisco Javier Martínez Peñas | | |
