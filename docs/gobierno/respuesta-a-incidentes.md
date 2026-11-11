# Procedimiento de respuesta a incidentes — SCE

**Fuente:** SCE-MC-001 v2.0, Tabla 38 (respuesta a incidentes: clasificación, contención, comunicación al Product Owner y registro como no conformidad), Tabla 52 y sección 40. **Criterio de auditoría:** AU-18.
**Versión:** 1.2, 11 de noviembre de 2026 (sub-batch 14.2: plantilla `incidente.yml` y §6, problemas). v1.1: 10 de noviembre de 2026 (12.6: §4.1). v1.0: 7 de noviembre de 2026 (Batch 4). **Responsable del procedimiento:** Seguridad.

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
2. Si el incidente tocó datos personales, se sigue la §4.1.
3. Lo cierra quien no lo atendió, al verificar la eficacia de la acción correctiva (sección 40).

### 4.1 Notificación de vulneraciones

**Fuente:** PA-SCE-001, Parte B (AU-18). **Ley:** `docs/gobierno/datos-personales/aviso-de-privacidad.md`, apartado 1. Los artículos y el plazo legal se citan al cotejar la ley vigente; mientras tanto rige la meta interna de abajo.

**Qué es una vulneración.** Cualquiera de estas, sobre datos personales: pérdida o destrucción no autorizada; robo, extravío o copia no autorizada; uso, acceso o tratamiento no autorizado; daño, alteración o modificación no autorizada. Así las enumeraba la LGPDPPSO de 2017.

| Paso | Qué se hace | Quién |
|---|---|---|
| 1. Confirmar | Con la evidencia del apartado 3, se confirma si hubo datos personales y cuáles, con `docs/gobierno/datos-personales/inventario.md`. Se acota a qué titulares afecta. Si no se puede acotar, se toman todos los que la cuenta o el componente podían ver | Seguridad |
| 2. Valorar | Se decide si afecta de forma significativa los derechos patrimoniales (saldo, pagos, becas) o morales (calificaciones, estatus, identidad) de los titulares. Pesan el tipo de dato, cuántos titulares, si el dato salió del control del responsable (copia) o solo se vio, y si el titular puede hacer algo para protegerse. La decisión y su motivo van a la NC | Product Owner |
| 3. Notificar | Si afecta de forma significativa: a los titulares y a la autoridad garante que fije la ley estatal vigente. El SCE no envía correos: notifica la universidad por sus medios. **Meta interna: 72 horas desde la confirmación**, sin esperar a cerrar el análisis completo | Product Owner, con la Unidad de Transparencia |
| 4. Registrar | La NC del apartado 4 sirve de bitácora de vulneraciones: fecha, qué pasó, datos y titulares afectados, acciones correctivas, si se notificó, a quién y cuándo. Si se decidió no notificar, también el porqué | Seguridad |
| 5. Revisar | Se revisan el análisis de riesgos de `documento-de-seguridad.md` y la matriz de riesgos (RK-11) | Seguridad |

**Contenido mínimo de la notificación al titular.** Es el que pedía la LGPDPPSO de 2017:

1. Qué pasó y cuándo.
2. Qué datos suyos se comprometieron.
3. Qué puede hacer para protegerse; por ejemplo, cambiar su contraseña.
4. Qué se hizo de inmediato para contenerlo.
5. Dónde pedir más información.

**Modelo de texto.** "El [fecha] detectamos [qué pasó]. Se vieron afectados estos datos tuyos: [datos]. Ya [acciones de contención]. Te recomendamos [medidas]. Para más información, escribe a [medio de la Unidad de Transparencia]."

**Ensayo.** Ensayo de mesa del 10 de noviembre de 2026: `docs/evidencias/ensayos/2026-11-10-vulneracion-datos-personales.md`.

## 5. Prueba del procedimiento

Antes del piloto se ensaya la contención de una cuenta comprometida y la rotación de `JWT_SECRET` en staging, con acta (Batch 13).

La notificación de vulneraciones (§4.1) se ensayó en mesa el 10 de noviembre de 2026, con un escenario sintético. El acta está en `docs/evidencias/ensayos/`.

## 6. Problemas (sección 37)

Un problema es la causa común de incidentes que se repiten. La sección 37 pide buscar su causa raíz y abrir una acción correctiva.

- **Cuándo hay un problema:** un incidente con la misma causa o en el mismo componente que otro del mismo semestre. Lo marca quien lo registra, en el campo "Causa y recurrencia" de `incidente.yml`.
- **Qué se hace:** una NC en `docs/calidad/registro-no-conformidades.md`, con los cinco porqués y la acción correctiva y preventiva. Enlaza todos los incidentes que comparten la causa.
- **Cuándo se cierra:** cuando el auditor, o QA si no es quien corrigió, verifica que no hubo otro incidente con esa causa en el periodo siguiente.

Los incidentes se registran con la plantilla `.github/ISSUE_TEMPLATE/incidente.yml` y la etiqueta `incidente`. Un cambio para corregirlos que no pueda esperar el flujo normal es de emergencia (Tabla 34) y se documenta en 24 horas en `cambio.yml`.
