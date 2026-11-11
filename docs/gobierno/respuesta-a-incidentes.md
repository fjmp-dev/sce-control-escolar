# Procedimiento de respuesta a incidentes — SCE

**Fuente:** SCE-MC-001 v2.0, Tabla 38 (respuesta a incidentes: clasificación, contención, comunicación al Product Owner y registro como no conformidad), Tabla 52 y sección 40. **Criterio de auditoría:** AU-18.
**Versión:** 1.0, 7 de noviembre de 2026 (Batch 4). **Responsable del procedimiento:** Seguridad.

Un incidente es cualquier evento que comprometa o pueda comprometer la confidencialidad, integridad o disponibilidad del expediente, las calificaciones, los pagos o las cuentas. Por ejemplo: acceso de un rol a datos que no le tocan, secreto expuesto, cuenta usada por un tercero, bitácora alterada o datos reales fuera del piloto.

## 1. Clasificación

Con la severidad de la Tabla 52, en la primera hora desde que se detecta.

| Severidad | Ejemplos | Comunicación al Product Owner |
|---|---|---|
| Crítica | Datos de un alumno expuestos a otro rol o a otro alumno; secreto de producción o piloto expuesto; bitácora alterada | De inmediato |
| Alta | Cuenta privilegiada comprometida sin evidencia de acceso a datos; bloqueo masivo de cuentas | El mismo día hábil |
| Media o baja | Intento fallido detectado en la bitácora, sin acceso | En el siguiente reporte de sprint |

## 2. Contención

Se aplica lo que corresponda, en este orden, y se anota la hora de cada paso.

| Situación | Acción | Efecto |
|---|---|---|
| Cuenta comprometida | El administrador la da de baja en el portal (Usuarios, "Cuenta activa") | Revoca todas sus sesiones al instante (CC-010) |
| Administrador comprometido | Otro administrador lo da de baja; si no hay otro, se rota `JWT_SECRET` | Rotar el secreto invalida todos los tokens del ambiente |
| Secreto expuesto en el repositorio o en registros | Rotarlo en el gestor de secretos del ambiente y reiniciar el servicio; retirarlo del historial solo con autorización de Seguridad | El secreto anterior deja de servir |
| Acceso directo indebido a la base | Revocar la credencial de base del ambiente y crear otra | Corta la conexión |
| Defecto que expone datos | Retirar el despliegue a la etiqueta anterior (rollback, sección 20) | Detiene la exposición |

## 3. Evidencia

Antes de corregir, se conserva:

- Asientos de bitácora de la entidad y del periodo: `api/prisma/verificacion/muestreo-bitacora.sql`, filtrado por entidad o autor.
- Registros JSON de la API del periodo. No contienen contraseñas, tokens ni datos personales (CS-SEG-08), así que pueden adjuntarse.
- Etiqueta y digest de la imagen desplegada.

## 4. Registro y cierre

1. Se abre una no conformidad con la plantilla del Anexo E en `docs/calidad/registro-no-conformidades.md`, con la causa raíz por cinco porqués (Tabla 37).
2. Si el incidente expuso datos personales, el Product Owner valora la notificación a los titulares y a la autoridad que exige la ley de protección de datos que cita el manual (sección 18). El procedimiento de notificación detallado se elabora en el Batch 12 (Parte B de PA-SCE-001).
3. Lo cierra quien no lo atendió, al verificar la eficacia de la acción correctiva (sección 40).

## 5. Prueba del procedimiento

Antes del piloto se ensaya la contención de una cuenta comprometida y la rotación de `JWT_SECRET` en staging, con acta (Batch 13).
