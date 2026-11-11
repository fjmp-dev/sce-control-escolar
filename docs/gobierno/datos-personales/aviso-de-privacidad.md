# Aviso de privacidad del SCE — MODELO NO OFICIAL

> **MODELO NO OFICIAL. No emitido por la institución.** Lo redactó el equipo del proyecto SCE como ejemplo. No lo emitió la Universidad Autónoma del Estado de México (UAEM) y no la obliga. El responsable del tratamiento es la universidad: solo ella puede emitir un aviso y fijar plazos oficiales (`plan-de-sistema.md`, 6.2, "No factible"). El SCE solo tiene datos sintéticos.

**Fuente:** SCE-MC-001 v2.0, sección 18 y Tabla 38; PA-SCE-001, Parte B (AU-18); `manual-v3.0.md`, apartado 7.
**Versión:** 1.0, 10 de noviembre de 2026 (sub-batch 12.6, issue #75). **Elaboró y aprobó:** FJMP (NC-012).
**Relacionados:** `inventario.md`, `arco.md`, `documento-de-seguridad.md`.

---

## 1. Ley aplicable

**El manual cita la ley general.** La sección 18 y la Tabla 8 citan la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO) de 2017. El borrador `manual-v3.0.md` (apartado 7) corrige la cita: la LGPDPPSO vigente es la del DOF del 20 de marzo de 2025, que abroga la de 2017.

**Para la UAEM aplica la ley estatal.** La UAEM es una universidad pública autónoma del Estado de México. Es sujeto obligado del ámbito estatal. La ley general fija las bases para todo el país, y cada entidad las desarrolla en su ley. Por eso el tratamiento de la UAEM se rige por la ley de protección de datos personales en posesión de sujetos obligados del Estado de México, armonizada con la general.

**Qué ley estatal está vigente.** Según `manual-v3.0.md`, apartado 7:

- La de 2017 (Gaceta del Gobierno, 30 de mayo de 2017) fue sustituida por la que aprobó la Legislatura el 20 de agosto de 2026.
- El Infoem se extinguió el 1 de octubre de 2026. Lo sustituye Transparencia Mexiquense.

**Pendiente: cotejo con la Gaceta del Gobierno.** Esas fechas vienen de notas de prensa. El 10 de noviembre de 2026 no se pudo cotejar la publicación en la Gaceta. Una búsqueda ese día encontró avisos de privacidad de 2026, del Infoem y de municipios, que todavía citan la ley de 2017. Son fuentes secundarias y no deciden nada. Mientras no se coteje:

- este modelo no cita artículos, ni de la ley general ni de la estatal;
- no nombra a la autoridad garante ante la que se presenta un recurso;
- los plazos de `arco.md` son referencia interna, no plazos legales.

Al cotejarlo se corrigen este apartado, `arco.md`, `respuesta-a-incidentes.md` (§4.1) y la fila de `manual-v3.0.md`, apartado 7.

---

## 2. Datos que trata el SCE

El detalle, columna por columna, está en `inventario.md`. En resumen:

| Categoría | Datos | De quién |
|---|---|---|
| Identificación y contacto | Matrícula, nombre, correo institucional, identificador de la cuenta | Alumnos y personal |
| Autenticación | Huella de la contraseña (bcrypt) y versión de la sesión | Alumnos y personal |
| Académicos | Facultad, fecha de ingreso, estatus, inscripciones, carga y horario, calificaciones, promedio, créditos, avance, trámites y documentos emitidos | Alumnos |
| Patrimoniales | Saldo, cargos, becas, pagos y recibos | Alumnos |
| Laborales | Perfil (rol), grupos asignados y calificaciones capturadas | Personal |
| Actividad | Bitácora: quién hizo qué, cuándo y el valor anterior | Alumnos y personal |

**No trata datos sensibles.** Ni salud, ni origen étnico, ni creencias, ni datos biométricos.

**No guarda datos de tarjeta.** La pasarela de pago es simulada (CC-020).

---

## 3. Finalidades y base de licitud

Todas las finalidades son necesarias para el servicio escolar. No hay finalidades secundarias: ni publicidad, ni perfiles, ni encuestas.

| Clave | Finalidad | Base de licitud | ¿Requiere consentimiento? |
|---|---|---|---|
| F1 | Integrar y administrar el expediente: alta, plantel y estatus | Atribución legal: control escolar es función de la universidad según su ley y su estatuto | No: es atribución legal |
| F2 | Inscripción: oferta, carga y horario | Atribución legal y relación jurídica con el alumno | No |
| F3 | Evaluación: calificaciones e historial | Atribución legal | No |
| F4 | Cobranza: cargos, becas, pagos y recibos | Relación jurídica con el alumno (cuotas) y atribución legal | No |
| F5 | Trámites: constancias y su verificación | Solicitud del titular y atribución legal | No: el alumno la pide |
| F6 | Acceso y seguridad: cuentas, sesiones y bitácora | Deber de seguridad del responsable y relación con el personal | No |
| F7 | Estadística: reportes agregados por facultad | Atribución legal de planeación. Solo muestra agregados, sin nombres ni matrículas | No |
| — | Desarrollo y pruebas | No aplica: se hacen con datos sintéticos (RK-09) | — |

**Por cotejar:** el fundamento exacto de cada atribución (ley de la UAEM y estatuto universitario) y el artículo que exceptúa el consentimiento. La ley general de 2017 lo exceptuaba cuando el tratamiento es para ejercer atribuciones legales o deriva de una relación jurídica con el titular. Falta confirmar que la ley estatal vigente diga lo mismo.

**Si se agrega una finalidad que no sea atribución.** Por ejemplo, difusión o encuestas: requiere consentimiento y un medio para negarse antes de tratar los datos. El SCE no tiene ninguna.

---

## 4. Transferencias y remisiones

- **Transferencias:** el SCE no envía datos personales a terceros. Si una autoridad los pide conforme a la ley, la universidad los entrega fuera del SCE.
- **Remisiones a encargados:** en un despliegue real, el proveedor de infraestructura sería encargado y necesitaría contrato. Hoy no hay: staging es efímero en GitHub Actions y usa datos sintéticos (CC-018). No hay procesador de pagos (CC-020).

---

## 5. Versión integral (MODELO NO OFICIAL)

> **MODELO NO OFICIAL. No emitido por la institución.** Los textos entre corchetes los completa la universidad.

**Aviso de privacidad integral del Sistema de Control Escolar**

**Responsable.** La Universidad Autónoma del Estado de México, con domicilio en [domicilio], es la responsable del tratamiento de los datos personales que se recaban en el Sistema de Control Escolar (SCE).

**Datos que se tratan.** De alumnos: matrícula, nombre, correo institucional, facultad, fecha de ingreso, estatus, inscripciones, carga y horario, calificaciones, promedio, créditos, avance, trámites, documentos emitidos, saldo, cargos, becas y pagos. Del personal: correo institucional, perfil, grupos asignados y calificaciones capturadas. De todos: la huella de la contraseña y la bitácora de las operaciones que realizan. No se tratan datos sensibles ni datos de tarjeta.

**Fundamento.** [Ley de protección de datos personales en posesión de sujetos obligados del Estado de México vigente, con sus artículos], [ley de la universidad y estatuto universitario, con los artículos de control escolar].

**Finalidades.**

1. Integrar y administrar tu expediente académico.
2. Inscribirte y armar tu carga y tu horario.
3. Registrar tus calificaciones y calcular tu historial.
4. Cobrar cuotas, aplicar becas y emitir recibos.
5. Atender tus trámites y verificar las constancias emitidas.
6. Dar acceso seguro al sistema y registrar quién hace cada operación.
7. Elaborar estadísticas por facultad, sin nombres ni matrículas.

Todas son necesarias para el servicio escolar. No requieren tu consentimiento, porque son atribuciones de la universidad o derivan de tu inscripción. No hay finalidades secundarias.

**Transferencias.** No se transfieren tus datos a terceros, salvo a una autoridad que los requiera conforme a la ley.

**Derechos ARCO y portabilidad.** Puedes pedir acceso, rectificación, cancelación u oposición, y la portabilidad de tus datos, ante la Unidad de Transparencia de la universidad, en [domicilio y correo], o por [medio electrónico]. Debes acreditar tu identidad o la de tu representante. Parte de tu información la consultas tú mismo en el portal: expediente, calificaciones, horario, estado de cuenta y trámites. El historial se descarga en un archivo CSV.

**Conservación.** Tus datos académicos se conservan mientras seas alumno y después, por el plazo que fije el catálogo de disposición documental de la universidad, porque sustentan constancias y certificados. Por eso la cancelación tiene límites. La propuesta vigente es la decisión D-18, por ratificar.

**Seguridad.** El acceso es por rol y cada rol ve solo lo necesario. Las contraseñas se guardan como huella y no se pueden leer. Cada cambio sensible queda en una bitácora que no se puede alterar.

**Cambios a este aviso.** Se publican en la página "Aviso de privacidad" del portal, que no requiere iniciar sesión.

**Última actualización:** [fecha de emisión].

---

## 6. Versión simplificada (MODELO NO OFICIAL)

Es el texto de la página pública `/privacidad` (`web/app/privacidad/page.tsx`). Si cambia uno, cambia el otro.

> **Modelo no oficial.** Lo redactó el equipo del proyecto SCE como ejemplo. No lo emitió la Universidad Autónoma del Estado de México y no la obliga. El sistema solo tiene datos sintéticos.
>
> **Quién trata tus datos.** La Universidad Autónoma del Estado de México, por medio del Sistema de Control Escolar.
>
> **Para qué.**
>
> - Integrar tu expediente.
> - Inscribirte y armar tu horario.
> - Registrar tus calificaciones y tu historial.
> - Cobrar cuotas, aplicar becas y emitir recibos.
> - Atender tus trámites.
> - Darte acceso seguro y registrar quién hace cada operación.
> - Elaborar estadísticas por facultad, sin nombres ni matrículas.
>
> Todas son necesarias para el servicio escolar. No usamos tus datos para publicidad ni para otros fines.
>
> **Tu consentimiento.** Ninguna finalidad lo requiere, así que no hay nada a lo que debas negarte. Si eso cambia, este aviso dirá cómo negarte antes de usar tus datos.
>
> **Transferencias.** No compartimos tus datos con terceros. Solo se entregarían a una autoridad que los pida conforme a la ley.
>
> **Tus derechos.** Puedes pedir acceso, rectificación, cancelación u oposición ante la Unidad de Transparencia de la universidad. Tu expediente, calificaciones, horario, estado de cuenta y trámites los consultas tú en el portal.
>
> **Aviso integral.** Explica la ley aplicable, los datos y cuánto tiempo se conservan. Es parte del mismo modelo y está en el repositorio del proyecto: `docs/gobierno/datos-personales/aviso-de-privacidad.md`.
>
> **Última actualización:** 10 de noviembre de 2026.

---

## 7. Pendientes antes de que la universidad lo emita

| Pendiente | Quién | Bloquea |
|---|---|---|
| Cotejar la ley estatal vigente en la Gaceta del Gobierno y la LGPDPPSO de 2025 en el DOF; citar artículos | FJMP | La firma de `manual-v3.0.md` y la versión 1.1 de este modelo |
| Domicilio del responsable, datos de la Unidad de Transparencia y medio electrónico | Universidad | La emisión |
| Fundamento de cada atribución en la normativa universitaria | Universidad | La emisión |
| Ratificar la conservación (D-18) | Product Owner | La versión integral, apartado "Conservación" |
| Emitir el aviso y publicarlo | Universidad | Fuera del alcance del proyecto |
