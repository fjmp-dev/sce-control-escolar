# AMFE de pagos — SCE

**Fuente:** SCE-MC-001 v2.0, Tabla 37 ("Análisis modal de fallos y efectos: módulos críticos, inscripción y pagos; tabla de modos de fallo con número de prioridad de riesgo"), sección 13.4 (Fig. 5), Tabla 29 y CC-020 (pasarela simulada).
**Versión:** 1.0, 10 de noviembre de 2026 (sub-batch 11.3).
**Elabora:** FJMP, con asistente de IA. **Revisa:** FJMP como QA (desviación, NC-012).

> **Desviación: hecho después de construir.** La matriz de riesgos (apartado 5) y `amfe-inscripcion.md` pedían este AMFE al inicio del Batch 9, antes del código. No se hizo. El defecto #69 (cobro doble) lo encontró una revisión de código, no una prueba ni este análisis. Se registra como NC-017. Por eso el modo 2 se califica dos veces: antes y después de la corrección.

## 1. Escalas

Las mismas de `amfe-inscripcion.md`. Cada modo recibe tres calificaciones de 1 a 10. El número de prioridad de riesgo (NPR) es su producto.

| Calificación | 1 | 4 | 7 | 10 |
|---|---|---|---|---|
| **Severidad (S)** | Sin efecto para el alumno | Molestia; el alumno corrige y repite | Saldo o pago incorrectos; requiere corrección manual | Daño a la cobranza que nadie detecta |
| **Ocurrencia (O)** | Casi imposible con los controles | Ocasional en el periodo de pagos | Frecuente con concurrencia o datos reales | Casi seguro |
| **Detección (D)** | La prueba automatizada lo detecta en cada PR | Lo detecta una prueba o consulta periódica | Solo lo ve una revisión manual | Nadie lo detecta antes del alumno |

**Umbral:** un NPR de 100 o más exige una acción con responsable y batch. Una severidad de 9 o más exige un control preventivo aunque el NPR sea bajo.

## 2. Modos de fallo

Ordenados por NPR, salvo el cobro doble, que va segundo porque es el defecto #69. Con los controles vigentes al 10 de noviembre de 2026 en `d4cce7d`. Las pruebas citadas pasaron ese día (`informe-fase-4.md`, apartado 5).

| # | Función | Modo de fallo | Efecto | Causa posible | Control preventivo | Control de detección | S | O | D | NPR |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Autorizar el cobro | El alumno aprueba su propio pago en la pasarela simulada | Adeudo dado por pagado sin dinero (RK-15) | Diseño de CC-020: la pasarela es una pantalla del propio SCE | Solo datos sintéticos; un piloto con cobro real exige CC Mayor nuevo | `sin-datos-reales.sql` en cada despliegue a staging | 10 | 10 | 10 | **1000** |
| 2 | Aplicar el pago | **Cobro doble:** dos intentos por el mismo adeudo, aprobados los dos | Saldo negativo; el alumno paga dos veces (RK-02, #69) | Cada intento tiene su propia clave de idempotencia; la aprobación no miraba el saldo vigente | Importe contra saldo vigente con la cuenta bloqueada (`CuentaAlumno.admiteAbono`); el intento que rebasa se rechaza sin cobrarse (PR #71) | CI-PAG-01: dos intentos seguidos, simultáneos y tras una beca (`pagos.spec.ts`); Newman "el segundo intento ya no cabe en el saldo"; Jest de `admiteAbono` y `Pago.aprobar` | 9 | 2 | 1 | 18 |
| 3 | Conciliar | El corte o el saldo no cuadran con los movimientos | Caja entrega un corte erróneo; diferencia no explicada (Tabla 59, fila 8) | Un cambio de saldo fuera de `movimiento()`; día UTC en lugar del local | `movimiento()` escribe el movimiento y el saldo juntos; el corte usa el día de la Ciudad de México (UTC-6) | Prueba "Corte de caja" con Supertest. **No hay conciliación automática:** CD-DAT-03 llega en 12.1 | 7 | 3 | 7 | **147** |
| 4 | Reflejar el pago | El pago aprobado no se refleja, o tarda, en el estado de cuenta | El alumno pagó y sigue con adeudo; la inscripción lo rechaza (R-04) | Abono fuera de la transacción de la aprobación | Aprobación, abono, saldo y bitácora en una transacción | Newman "estado de cuenta con un solo abono"; CI-PAG-01. CD-DAT-06 llega en 12.1 | 7 | 2 | 2 | 28 |
| 5 | Generar cargos | Caja repite los cargos del periodo y el alumno queda con doble cargo | Adeudo inflado | Repetir la operación | Un cargo por alumno y concepto, con la cuenta bloqueada (D-7) | Supertest "genera el cargo a cada inscrito una sola vez, aunque caja lo repita"; Newman "repetir los cargos no los duplica" | 7 | 4 | 1 | 28 |
| 6 | Calcular importes | Diferencias de centavos en el saldo o en el corte | Saldo o total con centavos de más o de menos | Coma flotante | Comparación y total en centavos enteros; `Decimal(12,2)` en la base | Jest de `admiteAbono` con `0.1 + 0.2` | 5 | 2 | 2 | 20 |
| 7 | Aplicar el pago | Aviso repetido o empalmado de la pasarela aplica el pago dos veces | Doble abono | Dos simulaciones del mismo pago | Bloqueo de la fila del pago; `Pago.aplicarUnaVez()`; `movimiento.pago_id` único | CI-PAG-01 R-14, avisos seguidos y empalmados; Newman "la pasarela repite el aviso" | 9 | 2 | 1 | 18 |
| 8 | Proteger el pago ajeno | Un alumno simula, ve o descarga el recibo de un pago de otro | Pago ajeno aplicado o datos expuestos | Id tomado de la petición | El pago se busca con la matrícula de la sesión; uno ajeno responde 404 | CS-SEG-03 con Supertest (R-23) | 9 | 2 | 1 | 18 |
| 9 | Aplicar el pago | Falla la bitácora o la base a mitad de la aplicación | Pago aplicado sin abono o sin traza | Escrituras fuera de una transacción | Una transacción; el error de negocio se lanza después del COMMIT | R-15, al aplicar y al rechazar (`pagos.spec.ts`) | 8 | 2 | 1 | 16 |
| 10 | Emitir el recibo | Recibo de un pago no aplicado | Comprobante de un pago que no ocurrió | Recibo sin revisar el estado | Solo hay recibo de un pago aplicado (`PAGO_NO_APLICADO`) | R-21 con Supertest; Newman "El pago rechazado no tiene recibo" | 8 | 2 | 1 | 16 |
| 11 | Dejar traza | Pago aplicado o rechazado sin asiento | Repudio del pago (RNF-SEG-001) | Bitácora fuera de la transacción | Bitácora en la misma transacción, firmada por el usuario técnico (CC-015) | CS-SEG-06 en pago, con SQL y Great Expectations en cada PR | 8 | 2 | 1 | 16 |
| 12 | Registrar la beca | La beca deja saldo a favor | Saldo negativo | Beca mayor que el saldo | `admiteAbono` antes de registrar | Supertest "la beca no deja saldo a favor" | 6 | 2 | 1 | 12 |
| 13 | Validar el importe | Pago por cero, negativo o por más del adeudo | Saldo a favor o pago vacío | Entrada sin validar | DTO; `CHECK ck_pago_importe` (importe > 0); `admiteAbono` | Supertest "sin adeudo no hay pago, ni por mas del saldo" | 6 | 2 | 1 | 12 |
| 14 | Separar funciones | Caja modifica el historial académico | Historial alterado por un rol ajeno (CS-SEG-02) | Endpoint de caja con alcance de más | Caja no tiene rutas académicas; guard por rol | R-24 con Supertest | 8 | 1 | 1 | 8 |

## 3. El cobro doble, antes y después

| Momento | Controles | S | O | D | NPR |
|---|---|---|---|---|---|
| Antes de #71 (Batch 9) | Clave de idempotencia por intento. Nada comparaba el importe con el saldo vigente. Ninguna prueba aprobaba dos intentos | 9 | 6 | 7 | **378** |
| Después de #71 (11.1) | Saldo vigente con la cuenta bloqueada; rechazo sin cobro; CI-PAG-01 con tres escenarios y Newman | 9 | 2 | 1 | 18 |

- **Antes, O = 6:** basta que el alumno inicie dos pagos, por ejemplo si el primero parece atorado.
- **Antes, D = 7:** lo encontró una revisión manual, no una prueba.
- **Después, O = 2 y no 1:** la base no impide un saldo negativo. Un camino nuevo que cambie el saldo sin `admiteAbono` repetiría el fallo (acción 1).

## 4. Acciones

| Modo | Acción | Responsable | Batch | Estado |
|---|---|---|---|---|
| 2 | Revalidar el saldo con la cuenta bloqueada; CI-PAG-01 con dos intentos | FJMP | 11.1 (#71) | Hecha. En verde el 10 de noviembre de 2026 |
| 2 y 3 | **Acción 1:** evaluar `CHECK (saldo >= 0)` en `cuenta_alumno`, para que la base impida el saldo negativo por cualquier camino. Cambia el esquema: requiere CC | FJMP | 12.1 | Abierta |
| 3 | CD-DAT-03 interna: saldo contra movimientos, pago contra abono y corte contra abonos del día UTC-6, con Great Expectations que no pase en vacío | FJMP | 12.1 | Abierta (NC-018) |
| 4 | CD-DAT-06 con `pago.fecha_confirmacion` (CC-011) | FJMP | 12.1 | Abierta (NC-018) |
| 1 | No desplegar la pasarela simulada con usuarios reales | Product Owner (FJMP) | — | Aceptado como RK-15 en CC-020 |
| 8 | ZAP con acceso cruzado sobre pagos | FJMP como Seguridad | 12 | Abierta |

Los modos 2, 7 y 8 tienen severidad 9 y control preventivo. El modo 1 tiene severidad 10: su control es que la pasarela simulada no llegue a usuarios reales.

## 5. Revisión

| Rol | Nombre | Decisión | Firma | Fecha |
|---|---|---|---|---|
| QA (desviación, NC-012) | Francisco Javier Martínez Peñas | | | |
