# Plantilla de aviso de mantenimiento — SCE

**Fuente:** SCE-MC-001 v2.0, RNF-FIA-001 (sección 7 y 35): se excluyen de la disponibilidad solo las ventanas de mantenimiento **anunciadas con al menos 48 horas** y **fuera de la semana de inscripción**. **Sub-batch:** 13.3, issue #76. **Responsable:** DevOps redacta; el Product Owner aprueba y envía por el medio institucional.

Una ventana que no cumpla las dos condiciones cuenta como caída. `scripts/disponibilidad.py` lo aplica con el calendario del apartado 2.

## 1. Aviso

> **Asunto:** Mantenimiento del Sistema de Control Escolar el {día} de {mes}, de {hora de inicio} a {hora de fin}
>
> El {día} de {mes} de {año}, de {hora de inicio} a {hora de fin} (hora de la Ciudad de México), el Sistema de Control Escolar no estará disponible por mantenimiento.
>
> **Qué no se podrá hacer:** {inscripciones, consulta de calificaciones, pagos, trámites…}.
> **Motivo:** {actualización a la versión vX.Y.Z / mantenimiento de la base / …}.
> **Plazos:** ningún plazo vence durante la ventana. {Si alguno vence, cuál se extiende y hasta cuándo.}
>
> Si al terminar la ventana algo no funciona, repórtelo a {contacto institucional}.

**Antes de enviarlo, comprobar:**

- [ ] Faltan al menos 48 horas para el inicio.
- [ ] La ventana no cae en la semana de inscripción del periodo.
- [ ] Ningún cierre de captura, de pagos ni de inscripción cae en la ventana; si cae, Coordinación o Dirección decidieron qué se extiende.
- [ ] Hay plan de rollback y un respaldo previo (`inventario-de-ambientes.md`, apartados 6 y 7).

## 2. Calendario para la disponibilidad

Cada aviso enviado, y cada semana de inscripción y corte de evaluación del periodo, agrega una fila al calendario que lee `scripts/disponibilidad.py`. Fechas ISO 8601 en UTC.

```csv
tipo,inicio,fin,anunciado
inscripcion,2027-01-04T06:00Z,2027-01-11T06:00Z,
corte,2027-02-22T06:00Z,2027-02-27T06:00Z,
mantenimiento,2027-01-20T08:00Z,2027-01-20T10:00Z,2027-01-17T18:00Z
```

`anunciado` es la hora en que salió el aviso. Se toma del correo enviado, no de la fecha de redacción.

## 3. Emergencias

Un mantenimiento sin 48 horas de aviso es una emergencia: cuenta como caída, se registra como incidente (`respuesta-a-incidentes.md`) y se documenta en las 24 horas siguientes.
