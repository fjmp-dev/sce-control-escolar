# Anexo G. Guiones de tarea por rol

**Fuente:** SCE-MC-001 v2.0, sección 26 (criterios de 26.1 y método de 26.2); Anexo G, `anexo-G-usabilidad-y-sus.md`.
**Ambiente:** staging con la etiqueta candidata (`v1.0.0-rc.N`) y datos sintéticos. No se usa ninguna cuenta ni dato real (RK-09).
**Estado:** preparado, sin ejecutar. Hacen falta cinco participantes por rol, que el equipo no tiene (`plan-de-sistema.md`, 6.2, "Lo que exige personas").

## Reglas de la sesión

1. Antes de empezar se lee y se firma el consentimiento (`consentimiento.md`). Si el participante no acepta la grabación de pantalla, solo se toman notas.
2. El observador lee la consigna tal como está escrita y no ayuda. Si el participante se atora, se anota el error y se pasa a la siguiente tarea al llegar al tiempo máximo.
3. Control escolar y caja reciben antes la inducción breve (`induccion.md`, 10 minutos como máximo). El alumno y el profesor no reciben ninguna.
4. Cada tarea va a la hoja del rol (`hoja-<rol>.csv`) y, al final, el SUS a `sus-<rol>.csv`. El puntaje lo calcula `scripts/usabilidad/sus.py`.
5. Al terminar las sesiones de un rol, cada hallazgo se abre como issue con la plantilla "Hallazgo de usabilidad" y su clase Must, Should o Could.

## Alumno (dispositivo: teléfono 390×844 en tres participantes y escritorio 1366×768 en dos)

| # | Consigna | Datos sintéticos | Criterio de éxito | Tiempo máximo |
|---|---|---|---|---|
| A1 | "Entra al sistema con la cuenta que te damos." | `alumno@sce.test` y la contraseña de la semilla de staging | Llega a Inicio | 1 min |
| A2 | "Sin buscar en el menú más de una vez, dinos dónde verías tu inscripción, tus pagos, tu horario, tus calificaciones y tus trámites." | — | Señala los cinco desde Inicio (26.1, criterio 1) | 2 min |
| A3 | "Arma tu carga de 2027A con dos materias que no choquen y confírmala." | Oferta de 2027A | Inscripción confirmada con folio | 5 min |
| A4 | "Agrega ISW-201-A y después ISW-701-A. ¿Por qué no te deja y qué harías?" | ISW-701-A choca con ISW-201-A (semilla) | Explica el choque con el aviso en pantalla (26.1, criterio 2) | 2 min |
| A5 | "Con la cuenta del segundo alumno, intenta inscribirte. ¿Qué pasa?" | `alumno.dos@sce.test`, con adeudo | Identifica el adeudo y dónde pagarlo | 2 min |
| A6 | "Paga tu adeudo y guarda el recibo." | Pasarela simulada (CC-020) | Recibo descargado | 4 min |
| A7 | "Pide una constancia de estudios y, cuando esté lista, descárgala." | Control escolar la emite durante la sesión | Constancia descargada | 4 min |

**Tasa de conclusión de inscripción (26.1, criterio 3):** A3 concluida ÷ A3 iniciada ≥ 90 %. Si no concluyó, se anota si el estado en pantalla explicaba por qué.

## Profesor (escritorio 1366×768)

| # | Consigna | Datos sintéticos | Criterio de éxito | Tiempo máximo |
|---|---|---|---|---|
| P1 | "Entra y dinos qué grupos tienes este periodo." | `profesor@sce.test` | Nombra sus grupos | 2 min |
| P2 | "Captura el siguiente parcial de tu grupo del periodo en curso con los valores de la hoja." | Grupo de 2026B (en curso); hoja impresa con los valores | Valores guardados y visibles | 5 min |
| P3 | "Te equivocaste en uno: corrígelo." | Un valor de P2 | Corrección guardada | 2 min |

## Control escolar (escritorio, después de la inducción)

| # | Consigna | Datos sintéticos | Criterio de éxito | Tiempo máximo |
|---|---|---|---|---|
| C1 | "Busca el expediente de la matrícula que te damos y dinos su estatus y su avance." | Matrícula de la semilla | Lee estatus y avance | 2 min |
| C2 | "Atiende la solicitud de constancia que llegó y emítela." | Solicitud de A7 | Documento con folio | 4 min |
| C3 | "Rechaza la otra solicitud; el motivo es que falta el historial." | Solicitud de no adeudo | Rechazo con motivo visible para el alumno | 3 min |

## Caja (escritorio, después de la inducción)

| # | Consigna | Datos sintéticos | Criterio de éxito | Tiempo máximo |
|---|---|---|---|---|
| J1 | "Genera los cargos de inscripción de 2027A, de 1 850 pesos." | Periodo 2027A | Cargos generados, con el número de alumnos | 3 min |
| J2 | "Registra una beca de 500 pesos a la matrícula que te damos." | Matrícula de la semilla | Beca aplicada al saldo | 3 min |
| J3 | "Haz el corte del día y dinos cuánto entró." | Pagos de A6 | Total del corte igual a la suma de abonos del día (CD-DAT-03) | 4 min |

## Qué se entrega (evidencia de 26.2)

Guiones (este archivo), hojas de observación (`hoja-*.csv`), puntajes SUS (`sus-*.csv` y la salida de `sus.py`), grabaciones con consentimiento fuera del repositorio (datos personales, Tabla 62) y lista de hallazgos con clase (issues). El informe es `docs/calidad/informe-usabilidad.md`.
