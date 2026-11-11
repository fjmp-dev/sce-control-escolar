# Árbol de accesibilidad de los flujos Must

**Para qué:** sustituto declarado de la lectura con VoiceOver mientras esa revisión queda pendiente (`docs/calidad/accesibilidad.md`, apartado 6). Es lo que el navegador entrega a un lector de pantalla: rol, nombre y estado de cada elemento, en orden de lectura. No dice cómo lo pronuncia VoiceOver.

**Cómo se obtuvo:** el 11 de noviembre de 2026, con `locator.ariaSnapshot()` de Playwright 1.65 sobre Chromium 1254, a 1366×768, contra el ambiente de Compose aislado de 12.4 con la semilla sintética. Cuentas `alumno.dos@sce.test` (inscripción y pago) y `alumno@sce.test` (consulta). Las referencias y fechas son de esa corrida.

**Cómo leerlo:** `[invalid]` es `aria-invalid`; `alert` y `status` son los avisos que el lector anuncia solo. Las descripciones (`aria-describedby`) no aparecen en este formato: se comprobaron aparte (`accesibilidad.md`, apartado 5, criterio 3.3.1).

## Inicio de sesión

```yaml
- link "Saltar al contenido":
  - /url: "#contenido"
- main:
  - paragraph: Sistema de Control Escolar
  - heading "Iniciar sesión" [level=1]
  - paragraph: Entra con tu correo institucional y tu contraseña.
  - text: Correo institucional
  - textbox "Correo institucional"
  - text: Contraseña
  - textbox "Contraseña"
  - button "Entrar"
  - paragraph:
    - link "Aviso de privacidad":
      - /url: /privacidad
- alert
```

## Inicio de sesión enviado vacío

```yaml
- main:
  - paragraph: Sistema de Control Escolar
  - heading "Iniciar sesión" [level=1]
  - paragraph: Entra con tu correo institucional y tu contraseña.
  - alert:
    - strong: "Error:"
    - text: Revisa los campos marcados.
  - text: Correo institucional
  - paragraph:
    - strong: "Error:"
    - text: Escribe un correo completo, como nombre@uaemex.mx.
  - textbox "Correo institucional" [invalid]
  - text: Contraseña
  - paragraph:
    - strong: "Error:"
    - text: Escribe tu contraseña.
  - textbox "Contraseña" [invalid]
  - button "Entrar"
  - paragraph:
    - link "Aviso de privacidad":
      - /url: /privacidad
```

## Inscripción

```yaml
- main:
  - heading "Inscripción 2027A" [level=1]
  - region "Arma tu carga":
    - heading "Arma tu carga" [level=2]
    - paragraph: Elige un grupo por materia y revisa si hay choques de horario. Al enviarla se validan, en este orden, los prerrequisitos, los adeudos y los choques.
    - group "Oferta de 2027A":
      - text: Oferta de 2027A
      - 'checkbox "ISW-102 Cálculo diferencial , grupo ISW-102-A : Lunes de 11:00 a 13:00, aula A1 ; Miércoles de 11:00 a 13:00, aula A1 . 30 lugares"'
      - strong: ISW-102 Cálculo diferencial
      - text: ", grupo ISW-102-A : Lunes de 11:00 a 13:00, aula A1 ; Miércoles de 11:00 a 13:00, aula A1 . 30 lugares"
      - 'checkbox "ISW-103 Matemáticas discretas , grupo ISW-103-A : Martes de 11:00 a 13:00, aula A1 ; Jueves de 11:00 a 13:00, aula A1 . 30 lugares"'
      - strong: ISW-103 Matemáticas discretas
      - text: ", grupo ISW-103-A : Martes de 11:00 a 13:00, aula A1 ; Jueves de 11:00 a 13:00, aula A1 . 30 lugares"
      - 'checkbox "ISW-201 Programación II , grupo ISW-201-A : Lunes de 07:00 a 09:00, aula A1 ; Miércoles de 07:00 a 09:00, aula A1 . 30 lugares"'
      - strong: ISW-201 Programación II
      - text: ", grupo ISW-201-A : Lunes de 07:00 a 09:00, aula A1 ; Miércoles de 07:00 a 09:00, aula A1 . 30 lugares"
      - 'checkbox "ISW-202 Álgebra lineal , grupo ISW-202-A : Lunes de 13:00 a 15:00, aula A1 ; Miércoles de 13:00 a 15:00, aula A1 . 30 lugares"'
      - strong: ISW-202 Álgebra lineal
      - text: ", grupo ISW-202-A : Lunes de 13:00 a 15:00, aula A1 ; Miércoles de 13:00 a 15:00, aula A1 . 30 lugares"
      - 'checkbox "ISW-203 Estructuras de datos , grupo ISW-203-A : Martes de 13:00 a 15:00, aula A2 ; Jueves de 13:00 a 15:00, aula A2 . 30 lugares"'
      - strong: ISW-203 Estructuras de datos
      - text: ", grupo ISW-203-A : Martes de 13:00 a 15:00, aula A2 ; Jueves de 13:00 a 15:00, aula A2 . 30 lugares"
      - 'checkbox "ISW-301 Bases de datos , grupo ISW-301-A : Martes de 07:00 a 09:00, aula A2 ; Jueves de 07:00 a 09:00, aula A2 . 30 lugares"'
      - strong: ISW-301 Bases de datos
      - text: ", grupo ISW-301-A : Martes de 07:00 a 09:00, aula A2 ; Jueves de 07:00 a 09:00, aula A2 . 30 lugares"
      - 'checkbox "ISW-302 Probabilidad y estadística , grupo ISW-302-A : Lunes de 11:00 a 13:00, aula A2 ; Miércoles de 11:00 a 13:00, aula A2 . 30 lugares"'
      - strong: ISW-302 Probabilidad y estadística
      - text: ", grupo ISW-302-A : Lunes de 11:00 a 13:00, aula A2 ; Miércoles de 11:00 a 13:00, aula A2 . 30 lugares"
      - 'checkbox "ISW-303 Ingeniería de requisitos , grupo ISW-303-A : Martes de 11:00 a 13:00, aula A3 ; Jueves de 11:00 a 13:00, aula A3 . 30 lugares"'
      - strong: ISW-303 Ingeniería de requisitos
      - text: ", grupo ISW-303-A : Martes de 11:00 a 13:00, aula A3 ; Jueves de 11:00 a 13:00, aula A3 . 30 lugares"
      - 'checkbox "ISW-401 Sistemas operativos , grupo ISW-401-A : Lunes de 15:00 a 17:00, aula A3 ; Miércoles de 15:00 a 17:00, aula A3 . 30 lugares"'
      - strong: ISW-401 Sistemas operativos
      - text: ", grupo ISW-401-A : Lunes de 15:00 a 17:00, aula A3 ; Miércoles de 15:00 a 17:00, aula A3 . 30 lugares"
      - 'checkbox "ISW-402 Desarrollo web , grupo ISW-402-A : Martes de 15:00 a 17:00, aula A4 ; Jueves de 15:00 a 17:00, aula A4 . 30 lugares"'
      - strong: ISW-402 Desarrollo web
      - text: ", grupo ISW-402-A : Martes de 15:00 a 17:00, aula A4 ; Jueves de 15:00 a 17:00, aula A4 . 30 lugares"
      - 'checkbox "ISW-502 Arquitectura de software , grupo ISW-502-A : Lunes de 13:00 a 15:00, aula A3 ; Miércoles de 13:00 a 15:00, aula A3 . 30 lugares"'
      - strong: ISW-502 Arquitectura de software
      - text: ", grupo ISW-502-A : Lunes de 13:00 a 15:00, aula A3 ; Miércoles de 13:00 a 15:00, aula A3 . 30 lugares"
      - 'checkbox "ISW-601 Pruebas de software , grupo ISW-601-A : Viernes de 11:00 a 14:00, aula A4 . 30 lugares"'
      - strong: ISW-601 Pruebas de software
      - text: ", grupo ISW-601-A : Viernes de 11:00 a 14:00, aula A4 . 30 lugares"
      - 'checkbox "ISW-701 Auditoría de sistemas , grupo ISW-701-A : Lunes de 08:00 a 10:00, aula A3 . 30 lugares"'
      - strong: ISW-701 Auditoría de sistemas
      - text: ", grupo ISW-701-A : Lunes de 08:00 a 10:00, aula A3 . 30 lugares"
      - 'checkbox "ISW-701 Auditoría de sistemas , grupo ISW-701-B : Viernes de 07:00 a 10:00, aula A3 . 30 lugares"'
      - strong: ISW-701 Auditoría de sistemas
      - text: ", grupo ISW-701-B : Viernes de 07:00 a 10:00, aula A3 . 30 lugares"
      - 'checkbox "ISW-702 Ética profesional , grupo ISW-702-A : Martes de 09:00 a 11:00, aula A2 . Sin lugares"'
      - strong: ISW-702 Ética profesional
      - text: ", grupo ISW-702-A : Martes de 09:00 a 11:00, aula A2 . Sin lugares"
      - 'checkbox "ISW-702 Ética profesional , grupo ISW-702-B : Lunes de 09:00 a 11:00, aula A4 . 30 lugares"'
      - strong: ISW-702 Ética profesional
      - text: ", grupo ISW-702-B : Lunes de 09:00 a 11:00, aula A4 . 30 lugares"
    - button "Revisar choques"
    - button "Enviar carga"
  - heading "Inscripciones anteriores" [level=2]
  - table "Inscripciones":
    - caption: Inscripciones
    - rowgroup:
      - row "Periodo Folio Estado Fecha Carga":
        - columnheader "Periodo"
        - columnheader "Folio"
        - columnheader "Estado"
        - columnheader "Fecha"
        - columnheader "Carga"
    - rowgroup:
      - row "2026B INS-2026B-2420002 Confirmada 11 nov 2026, 12:07 a.m. ISW-301 grupo ISW-301-B, ISW-701 grupo ISW-701-C":
        - cell "2026B"
        - cell "INS-2026B-2420002"
        - cell "Confirmada"
        - cell "11 nov 2026, 12:07 a.m."
        - cell "ISW-301 grupo ISW-301-B, ISW-701 grupo ISW-701-C"
```

## Pago: mi cuenta

```yaml
- main:
  - heading "Mi cuenta" [level=1]
  - paragraph: Tu saldo, tus movimientos y tus pagos en línea.
  - paragraph: "Adeudo : $1,800.00"
  - heading "Pagar" [level=2]
  - text: Importe a pagar, en pesos
  - paragraph: Hasta $1,800.00. Puedes pagar una parte.
  - spinbutton "Importe a pagar, en pesos"
  - button "Ir a pagar"
  - heading "Movimientos" [level=2]
  - table "Movimientos de la cuenta":
    - caption: Movimientos de la cuenta
    - rowgroup:
      - row "Fecha Concepto Tipo Importe":
        - columnheader "Fecha"
        - columnheader "Concepto"
        - columnheader "Tipo"
        - columnheader "Importe"
    - rowgroup:
      - row "11 nov 2026, 12:07 a.m. Pago en línea REF-D78311D6 Pago $50.00":
        - cell "11 nov 2026, 12:07 a.m."
        - cell "Pago en línea REF-D78311D6"
        - cell "Pago"
        - cell "$50.00"
      - row "11 nov 2026, 12:07 a.m. Cargo sintético de prueba Cargo $1,850.00":
        - cell "11 nov 2026, 12:07 a.m."
        - cell "Cargo sintético de prueba"
        - cell "Cargo"
        - cell "$1,850.00"
  - heading "Pagos en línea" [level=2]
  - table "Pagos en línea":
    - caption: Pagos en línea
    - rowgroup:
      - row "Referencia Fecha Importe Estado Detalle":
        - columnheader "Referencia"
        - columnheader "Fecha"
        - columnheader "Importe"
        - columnheader "Estado"
        - columnheader "Detalle"
    - rowgroup:
      - row "REF-D78311D6 11 nov 2026, 12:07 a.m. $50.00 Pagado Ver recibo REF-D78311D6":
        - cell "REF-D78311D6"
        - cell "11 nov 2026, 12:07 a.m."
        - cell "$50.00"
        - cell "Pagado"
        - cell "Ver recibo REF-D78311D6":
          - link "Ver recibo REF-D78311D6":
            - /url: /mi-cuenta/pagos/2
            - text: Ver recibo
      - row "REF-B215EAF8 11 nov 2026, 12:07 a.m. $100.00 Pendiente Continuar el pago REF-B215EAF8":
        - cell "REF-B215EAF8"
        - cell "11 nov 2026, 12:07 a.m."
        - cell "$100.00"
        - cell "Pendiente"
        - cell "Continuar el pago REF-B215EAF8":
          - link "Continuar el pago REF-B215EAF8":
            - /url: /mi-cuenta/pagos/1
            - text: Continuar el pago
```

## Pago: pasarela simulada

```yaml
- main:
  - heading "Pasarela de pago" [level=1]
  - term: Referencia
  - definition: REF-B215EAF8
  - term: Importe
  - definition: $100.00
  - status:
    - strong: "Aviso:"
    - text: "Este sistema no cobra con dinero real: aquí eliges la respuesta que daría el banco."
  - button "Rechazar el pago"
  - button "Aprobar el pago"
  - paragraph:
    - link "Volver a mi cuenta":
      - /url: /mi-cuenta
```

## Pago: recibo

```yaml
- main:
  - region "Recibo de pago":
    - paragraph: Sistema de Control Escolar
    - heading "Recibo de pago" [level=1]
    - term: Referencia
    - definition: REF-D78311D6
    - term: Matrícula
    - definition: "2420002"
    - term: Importe
    - definition: $50.00
    - term: Pagado el
    - definition: 11 nov 2026, 12:07 a.m.
    - term: Estado
    - definition: Pagado
    - term: Saldo después del pago
    - definition: $1,800.00
  - paragraph:
    - button "Imprimir recibo"
    - link "Volver a mi cuenta":
      - /url: /mi-cuenta
```

## Consulta: mi horario

```yaml
- main:
  - heading "Mi horario" [level=1]
  - paragraph: Tus sesiones de la semana, en orden de día y hora.
  - region "Periodo 2026B":
    - heading "Periodo 2026B" [level=2]
    - table "Mi horario de 2026B":
      - caption: Mi horario de 2026B
      - rowgroup:
        - row "Día Hora Materia Grupo Aula":
          - columnheader "Día"
          - columnheader "Hora"
          - columnheader "Materia"
          - columnheader "Grupo"
          - columnheader "Aula"
      - rowgroup:
        - row "Lunes 11:00 a 13:00 ISW-301 Bases de datos ISW-301-B B1":
          - cell "Lunes":
            - strong: Lunes
          - cell "11:00 a 13:00"
          - cell "ISW-301 Bases de datos"
          - cell "ISW-301-B"
          - cell "B1"
        - row "Miércoles 11:00 a 13:00 ISW-301 Bases de datos ISW-301-B B1":
          - cell "Miércoles":
            - strong: Miércoles
          - cell "11:00 a 13:00"
          - cell "ISW-301 Bases de datos"
          - cell "ISW-301-B"
          - cell "B1"
```

## Consulta: mis calificaciones

```yaml
- main:
  - heading "Mis calificaciones" [level=1]
  - heading "Historial" [level=2]
  - paragraph: Se recalcula cada vez que cierra un periodo.
  - term: Promedio
  - definition: "8.17"
  - term: Créditos acumulados
  - definition: "8"
  - term: Avance de carrera
  - definition: 2.00 %
  - heading "Periodo en curso" [level=2]
  - table "Calificaciones del periodo en curso":
    - caption: Calificaciones del periodo en curso
    - rowgroup:
      - row "Periodo Materia Grupo Parcial 1 Parcial 2 Parcial 3 Parcial 4":
        - columnheader "Periodo"
        - columnheader "Materia"
        - columnheader "Grupo"
        - columnheader "Parcial 1"
        - columnheader "Parcial 2"
        - columnheader "Parcial 3"
        - columnheader "Parcial 4"
    - rowgroup:
      - row "2026B, en curso ISW-301 Bases de datos ISW-301-B 9.00 — — —":
        - cell "2026B, en curso"
        - cell "ISW-301 Bases de datos"
        - cell "ISW-301-B"
        - cell "9.00"
        - cell "—"
        - cell "—"
        - cell "—"
  - heading "Kárdex" [level=2]
  - table "Kárdex":
    - caption: Kárdex
    - rowgroup:
      - row "Periodo Materia Créditos Final Resultado Cuenta para el promedio":
        - columnheader "Periodo"
        - columnheader "Materia"
        - columnheader "Créditos"
        - columnheader "Final"
        - columnheader "Resultado"
        - columnheader "Cuenta para el promedio"
    - rowgroup:
      - row "2026A ISW-101 Programación I 8 8.17 Acreditada Sí":
        - cell "2026A"
        - cell "ISW-101 Programación I"
        - cell "8"
        - cell "8.17":
          - strong: "8.17"
        - cell "Acreditada"
        - cell "Sí"
  - paragraph:
    - link "Descargar mi historial (CSV)":
      - /url: /mis-calificaciones/historial.csv
```
