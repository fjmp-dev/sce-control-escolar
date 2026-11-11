# Derechos ARCO en el SCE

**Fuente:** SCE-MC-001 v2.0, sección 18 y Tabla 38; PA-SCE-001, Parte B (AU-18). **Ley:** ver `aviso-de-privacidad.md`, apartado 1.
**Versión:** 1.0, 10 de noviembre de 2026 (sub-batch 12.6, issue #75). **Elaboró y aprobó:** FJMP (NC-012).

> **No es un procedimiento oficial.** La vía, los formatos y los plazos los fija la universidad, que es la responsable. Este documento dice qué permite el SCE para atender cada derecho, quién lo ejecuta y qué falta.

---

## 1. Flujo

1. **Recepción.** La solicitud llega a la Unidad de Transparencia de la universidad. El SCE no recibe solicitudes: no tiene formulario para eso.
2. **Identidad.** La Unidad acredita al titular o a su representante. Si el alumno es menor de edad, actúa quien lo represente.
3. **Turno.** La Unidad turna al área que tiene el dato (apartado 7).
4. **Ejecución.** El área atiende en el portal. Si el SCE no lo permite, lo dice en la respuesta, y la brecha queda en el plan de trabajo de `documento-de-seguridad.md`.
5. **Respuesta.** Referencia interna mientras no se coteje la ley vigente: 20 días hábiles para responder y 15 para hacer efectivo el derecho. Son los plazos de la LGPDPPSO de 2017.
6. **Registro.** La Unidad lleva el registro de solicitudes. El SCE no guarda solicitudes; lo que cambia por una rectificación queda en la bitácora, con autor y valor anterior.

---

## 2. Acceso

La mayor parte la consulta el propio titular, con su sesión. Para una solicitud formal, el área la extrae.

| Dato | El titular lo ve en | Para una solicitud, lo extrae | Cómo |
|---|---|---|---|
| Expediente: matrícula, nombre, facultad, ingreso, estatus, correo, historial y trayectoria de planteles | Mi expediente | Control escolar | Expedientes, por matrícula |
| Inscripciones, carga y horario | Inscripción, Mi horario | Control escolar | Expediente, inscripciones |
| Calificaciones e historial | Mis calificaciones, con CSV | Control escolar | Expediente, con CSV |
| Estado de cuenta, pagos y recibos | Mi cuenta | Caja | Caja, por matrícula |
| Trámites y documentos | Mis trámites | Control escolar | Trámites |
| Cuenta: correo, roles y estado | Cabecera del portal | Administrador | Usuarios |
| Grupos asignados a un profesor | Mis grupos | Coordinación | Oferta del periodo |
| Calificaciones que capturó un profesor | Mis grupos | Seguridad | Bitácora, por autor (`captura_calificacion`) |
| Bitácora: operaciones sobre el titular o hechas por él | No: no tiene ruta en la API (mínimo privilegio) | Seguridad | `api/prisma/verificacion/muestreo-bitacora.sql`, filtrado por la matrícula y los folios (entidad) o por la cuenta (autor) |

No se entrega la huella de la contraseña: no es legible. Se informa que existe.

---

## 3. Rectificación

| Dato | ¿El SCE lo permite? | Quién | Cómo y rastro |
|---|---|---|---|
| Facultad (plantel) | Sí | Control escolar | Expediente, cambio de plantel. Bitácora `cambio_plantel` |
| Estatus | Sí | Control escolar | Expediente, cambio de estatus. Bitácora `cambio_estatus` |
| Cuenta vinculada al expediente | Sí | Control escolar | Vincular otra cuenta. Bitácora `vinculo_cuenta` |
| Roles y estado de una cuenta | Sí | Administrador | Usuarios. Bitácora `cambio_usuario` |
| Calificación, periodo en curso | Sí | Profesor del grupo | Captura de nuevo. Bitácora `captura_calificacion`, con el valor anterior |
| Calificación, periodo cerrado | Sí | Coordinación | Corrección con motivo y evidencia (D-17). Bitácora `correccion_calificacion`; el historial se recalcula |
| Historial | Indirecto | — | Se recalcula al corregir una calificación |
| Carga de la inscripción | Sí, en el plazo | El alumno | Ajuste (D-6, D-15). Control escolar solo consulta (D-14) |
| **Nombre** | **No** | — | Ninguna ruta lo cambia. Brecha |
| **Fecha de ingreso** | **No** | — | Ninguna ruta la cambia. Brecha |
| **Correo de una cuenta** | **No directo** | Administrador y control escolar | Alta de una cuenta con el correo correcto, vínculo al expediente y baja de la anterior. Bitácora `alta_usuario`, `vinculo_cuenta` y `cambio_usuario` |
| **Cargo erróneo** | **No** | — | Caja solo abona becas. El tipo `ajuste` existe en `movimiento`, pero no tiene ruta. Brecha |
| Matrícula | No | — | Es la clave del expediente (RF-001). Corregirla sería otro expediente |
| Pago | No | — | Su estado lo fija la pasarela |
| Documento emitido | No | Control escolar | No cambia (CC-008): se emite otro con un trámite nuevo, y el anterior sigue verificable |

Rectificar con una consulta directa a la base no deja asiento en la bitácora. Solo pgAudit lo registra, en staging (CC-005). Por eso las brechas no se resuelven así: necesitan una ruta, con su CC.

---

## 4. Cancelación

**La limita la conservación del expediente.** El expediente, las calificaciones y los documentos emitidos sustentan constancias y certificados. No se cancelan mientras dure su plazo de conservación (D-18, por ratificar). La negativa se fundamenta en esa obligación; el artículo se cita al cotejar la ley.

**Lo que el SCE hace hoy:**

- **Cuenta:** el administrador la da de baja. Se revocan sus sesiones al instante (CC-010). La fila sigue, porque la bitácora la referencia.
- **Expediente:** control escolar cambia el estatus a baja. La fila sigue.

**Lo que el SCE no hace:**

- No suprime ni bloquea nada. Ninguna ruta borra.
- La bitácora rechaza UPDATE, DELETE y TRUNCATE. Guarda correos, matrículas en folios y valores anteriores.
- Los respaldos conservan copia hasta que rotan: semestre en curso más uno (Tabla 56).

Al vencer la conservación habría que bloquear y luego suprimir. Eso choca con la bitácora inmutable. La propuesta es seudonimizar el expediente y conservar la bitácora con el plazo del expediente; se decide al ratificar D-18 y necesita un CC.

---

## 5. Oposición

**No hay finalidades a las que oponerse sin dejar el servicio.** Las siete finalidades son necesarias para el servicio escolar, y no hay transferencias (`aviso-de-privacidad.md`, apartado 3). Una oposición procede solo por una causa legítima y concreta, y la resuelve el Product Owner con la Unidad de Transparencia.

**Estadística (F7).** El reporte de dirección es agregado. Un alumno no se puede quitar del conteo sin alterar los indicadores. En una facultad con muy pocos alumnos el agregado sí identifica (`inventario.md`, observación 2).

**Decisión automatizada.** La inscripción se rechaza sola por prerrequisito, adeudo, choque o cupo (Fig. 4). El alumno ve el motivo exacto (CC-013). El SCE no tiene una vía para que una persona revise y anule un rechazo: esa revisión la hace coordinación o control escolar fuera del sistema. Brecha.

---

## 6. Portabilidad

El alumno descarga su historial en CSV desde Mis calificaciones, y control escolar lo exporta desde el expediente (Tabla 16, Portabilidad). El expediente, la cuenta y los trámites solo se ven en pantalla o impresos: no hay formato estructurado.

---

## 7. Quién hace qué

| Rol | Qué atiende |
|---|---|
| Unidad de Transparencia (universidad) | Recibe, acredita la identidad, turna y responde |
| Control escolar | Acceso y rectificación del expediente; trámites; extracción para una solicitud |
| Profesor | Rectificación de una calificación en el periodo en curso |
| Coordinación | Rectificación después del cierre (D-17); grupos de un profesor |
| Caja | Acceso al estado de cuenta y a los pagos |
| Administrador | Cuentas: roles, estado y baja |
| Seguridad | Extracción de la bitácora por SQL |
| Product Owner | Cancelaciones y oposiciones sin regla; ratificación de D-18 |

En este proyecto todos los roles del SCE los ocupa FJMP (NC-012), y no hay Unidad de Transparencia: no hay titulares reales.
