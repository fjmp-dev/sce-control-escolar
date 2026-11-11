# Acta de ensayo de mesa — contingencias de pasarela y de ventanilla

**Procedimiento ensayado:** `docs/gobierno/contingencias.md` v1.0, apartados 1 y 2.
**Fuente:** SCE-MC-001 v2.0, sección 34 (Tabla 56) y Tabla 10; PA-SCE-001, Parte B.
**Fecha:** 11 de noviembre de 2026. **Modalidad:** de mesa. Las pruebas que se citan corren en CI; el resto no se ejecutó en ningún ambiente.
**Estado:** para firma de FJMP. **Sub-batch:** 13.2, issue #76.

**Participantes:** FJMP, en todos los roles: Product Owner, DevOps, Seguridad, Caja y Control escolar. No hubo observador independiente (NC-012). El asistente de IA declarado en `roles-y-raci.md` preparó el guion y la redacción; no decide ni firma.

**Escenario sintético.** Ningún dato es real. Las horas son simuladas.

> **A. Pasarela.** Último día de pagos del periodo `2027A`. A las 12:00 la pasarela deja de responder. Hay 40 intentos en curso, y la pasarela repite dos avisos de pagos que ya se habían aplicado.
>
> **B. Ventanilla.** El mismo día, a las 15:00, el servidor de base se queda sin disco y la API responde 503. Hay 12 alumnos formados en control escolar y 6 en caja.

## 1. Cronología

| Hora | Paso | Qué se hizo | Resultado |
|---|---|---|---|
| 12:00 | A, detección | Caja ve intentos `pendiente` que no avanzan | Los 40 quedan pendientes, sin abono ni recibo: R-15, cubierto por `pagos.spec.ts` |
| 12:05 | A, avisos repetidos | La pasarela reenvía dos avisos ya aplicados | Sin efecto y con asiento en bitácora: R-14, cubierto por `pagos.spec.ts` |
| 13:00 | A, procedimiento 1.2 | Más de una hora caída: incidente Mayor; el Product Owner redacta el aviso a alumnos | Aviso listo. El SCE no tiene canal de envío: lo manda la universidad (H-4 del ensayo del 10-nov) |
| 13:10 | A, procedimiento 1.4 | El corte vence hoy | Dirección extiende un día; la decisión va al acta del incidente |
| 15:00 | B, detección | `/api/salud` no responde; `/salud` del portal sí | El monitoreo de 13.3 lo detectaría; hoy lo detecta quien atiende |
| 15:05 | B, clasificación | Periodo de pagos | Mayor |
| 15:10 | B, procedimiento 2.4 | Turnos de regreso: matrícula, trámite, fecha y hora | 18 turnos. Caja no cobra en efectivo fuera del SCE (Tabla 10) |
| 15:20 | B, recuperación | Liberar disco o restaurar el último respaldo | Si se restaura, se pierde lo posterior al respaldo. Con respaldo diario, hasta 24 h (RPO); con el ensayo de 12 h, hasta 12 h |
| 15:50 | B, cierre | Humo del Anexo D y CD-DAT | Tiempo fuera de servicio, 50 min, para la disponibilidad mensual |

## 2. Hallazgos

| ID | Hallazgo | Acción |
|---|---|---|
| C-1 | Si se restaura un respaldo, se pierden los pagos aplicados después de él, aunque la pasarela ya cobró | Tras restaurar, caja concilia contra el reporte de la pasarela del intervalo perdido. En la simulada no aplica; se anota para un proveedor real (CC-020) |
| C-2 | Nada avisa que el disco del servidor de base se está llenando | Alerta de disco en 13.3 (node-exporter) |
| C-3 | La lista de turnos tiene datos personales (matrícula) fuera del SCE | Se destruye al atender el último turno; queda en `contingencias.md` 2.4 |
| C-4 | La extensión de plazos no tiene un lugar en el SCE: hoy es un cambio de fechas del periodo por Coordinación | Suficiente para el alcance; la decisión queda en el acta del incidente |

## 3. Firma

| Rol | Persona | Firma | Fecha |
|---|---|---|---|
| Product Owner y DevOps | Francisco Javier Martínez Peñas | | |
