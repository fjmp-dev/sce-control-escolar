# Matriz de rol por endpoint — SCE

**Fuente:** SCE-MC-001 v2.0, sección 18 y Tablas 5, 11, 12 y 38; CC-007. **Criterio de auditoría:** AU-15.
**Versión:** 1.8, 11 de noviembre de 2026 (Batch 13: nota de `/metricas`). Crece con cada batch.

Esta tabla es ejecutable: `api/test/integracion/roles.spec.ts` la lee y prueba **cada token contra cada endpoint** (CF-ROL-01, CI-AUTH-01). Otra prueba exige que sus filas sean exactamente las operaciones de `docs/api/openapi.json`, así que un endpoint nuevo no se integra sin decidir quién lo usa. Toda ruta sin rol declarado se deniega (14.1-7). El portal solo presenta lo que esta matriz permite, y `web/test/roles.test.ts` lo comprueba; quien autoriza siempre es la API.

| Método | Ruta | Alumno | Profesor | Control escolar | Coordinación | Caja | Dirección | Administrador |
|---|---|---|---|---|---|---|---|---|
| GET | `/salud` | Público | Público | Público | Público | Público | Público | Público |
| POST | `/sesiones` | Público | Público | Público | Público | Público | Público | Público |
| GET | `/sesiones/actual` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/sesiones/actual/renovacion` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| DELETE | `/sesiones/actual` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| PUT | `/usuarios/actual/contrasena` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| GET | `/usuarios` | No | No | No | No | No | No | Sí |
| POST | `/usuarios` | No | No | No | No | No | No | Sí |
| PATCH | `/usuarios/{id}` | No | No | No | No | No | No | Sí |
| GET | `/facultades` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/facultades` | No | No | No | No | No | No | Sí |
| GET | `/planes` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/planes` | No | No | No | No | No | No | Sí |
| GET | `/materias` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/materias` | No | No | No | Sí | No | No | No |
| POST | `/materias/{clave}/prerrequisitos` | No | No | No | Sí | No | No | No |
| DELETE | `/materias/{clave}/prerrequisitos/{requiere}` | No | No | No | Sí | No | No | No |
| GET | `/alumnos` | No | No | Sí | No | No | No | No |
| POST | `/alumnos` | No | No | Sí | No | No | No | No |
| GET | `/alumnos/actual` | Sí | No | No | No | No | No | No |
| GET | `/alumnos/{matricula}` | No | No | Sí | No | No | No | No |
| PUT | `/alumnos/{matricula}/facultad` | No | No | Sí | No | No | No | No |
| PUT | `/alumnos/{matricula}/estatus` | No | No | Sí | No | No | No | No |
| PUT | `/alumnos/{matricula}/cuenta` | No | No | Sí | No | No | No | No |
| GET | `/alumnos/actual/inscripciones` | Sí | No | No | No | No | No | No |
| GET | `/alumnos/{matricula}/inscripciones` | No | No | Sí | No | No | No | No |
| GET | `/alumnos/actual/calificaciones` | Sí | No | No | No | No | No | No |
| GET | `/alumnos/{matricula}/calificaciones` | No | No | Sí | Sí | No | No | No |
| GET | `/grupos` | Sí | No | No | No | No | No | No |
| POST | `/grupos` | No | No | No | Sí | No | No | No |
| GET | `/grupos/choques` | Sí | No | No | No | No | No | No |
| GET | `/profesores/actual/grupos` | No | Sí | No | No | No | No | No |
| GET | `/grupos/{id}/calificaciones` | No | Sí | No | No | No | No | No |
| PUT | `/grupos/{id}/calificaciones` | No | Sí | No | No | No | No | No |
| PUT | `/calificaciones/{id}/correccion` | No | No | No | Sí | No | No | No |
| POST | `/inscripciones` | Sí | No | No | No | No | No | No |
| PUT | `/inscripciones/{folio}/grupos` | Sí | No | No | No | No | No | No |
| GET | `/periodos` | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| POST | `/periodos` | No | No | No | Sí | No | No | No |
| GET | `/periodos/{clave}/grupos` | No | No | No | Sí | No | No | No |
| POST | `/periodos/{clave}/publicacion` | No | No | No | Sí | No | No | No |
| POST | `/periodos/{clave}/inicio` | No | No | No | Sí | No | No | No |
| POST | `/periodos/{clave}/cierre` | No | No | No | Sí | No | No | No |
| GET | `/periodos/{clave}/reporte` | No | No | No | No | No | Sí | No |
| GET | `/alumnos/actual/cuenta` | Sí | No | No | No | No | No | No |
| GET | `/alumnos/{matricula}/cuenta` | No | No | No | No | Sí | No | No |
| POST | `/alumnos/{matricula}/becas` | No | No | No | No | Sí | No | No |
| POST | `/periodos/{clave}/cargos` | No | No | No | No | Sí | No | No |
| POST | `/pagos` | Sí | No | No | No | No | No | No |
| POST | `/pagos/{id}/simulacion` | Sí | No | No | No | No | No | No |
| GET | `/pagos/{id}` | Sí | No | No | No | Sí | No | No |
| GET | `/pagos` | No | No | No | No | Sí | No | No |
| POST | `/tramites` | Sí | No | No | No | No | No | No |
| GET | `/alumnos/actual/tramites` | Sí | No | No | No | No | No | No |
| GET | `/tramites` | No | No | Sí | No | No | No | No |
| POST | `/tramites/{folio}/proceso` | No | No | Sí | No | No | No | No |
| POST | `/tramites/{folio}/emision` | No | No | Sí | No | No | No | No |
| POST | `/tramites/{folio}/rechazo` | No | No | Sí | No | No | No | No |
| GET | `/tramites/{folio}/documento` | Sí | No | No | No | No | No | No |
| GET | `/documentos/{folio}` | No | No | Sí | No | No | No | No |

## Decisiones

- **Los dos anónimos:** `POST /sesiones` porque es la autenticación misma; `GET /salud` porque lo sondea un monitor externo (Tabla 57) y no devuelve datos. Ninguno es una operación Must de negocio (Tabla 38).
- **`GET /metricas` no está en la matriz ni en el contrato (13.3):** es la lectura de Prometheus (Tabla 57), sin sesión y sin datos personales: duraciones por ruta, errores por código de negocio y métricas del proceso. Solo se alcanza dentro de la red privada de la aplicación. El proxy no la publica, y `scripts/verificar-staging.sh` comprueba que `/api/metricas` responde 404 desde fuera. `gateway.spec.ts` comprueba que no lleva matrículas, correos ni tokens.
- **El administrador no da de alta materias ni periodos:** son de coordinación (Tabla 5, Fig. 7). Mínimo privilegio (6.2-5).
- **El alumno consulta su expediente solo por `/alumnos/actual`:** la matrícula sale de su sesión, nunca de la petición. Ninguna ruta acepta una matrícula de un alumno (CS-SEG-03).
- **El alumno se inscribe y ajusta solo con su sesión:** `POST /inscripciones` no acepta matrícula y rechaza cualquier campo de más; un folio ajeno en `PUT /inscripciones/{folio}/grupos` responde 404, igual que uno inexistente (CS-SEG-03).
- **Control escolar consulta las inscripciones, no las cambia:** D-14, provisional hasta que el Product Owner decida si también las ajusta. La Tabla 5 dice que las "administra" y la Fig. 1 no le da caso de uso de inscripción.
- **Oferta, consulta diferenciada por rol (Tabla 4, Batch 7):** coordinación abre el periodo, define los grupos y publica la oferta (Fig. 7), y la consulta completa, publicada o no, con el profesor de cada grupo, en `/periodos/{clave}/grupos`. El alumno solo ve la oferta publicada en `/grupos` (CC-012), sin el profesor, y su horario sale de su inscripción. El profesor ve únicamente sus grupos, con la cuenta de su sesión. Caja, dirección y control escolar no la necesitan.
- **El profesor de un grupo se indica por correo:** académico pregunta a identidad si la cuenta existe, está activa y es de profesor (CC-014). Ninguna respuesta expone el identificador interno de la cuenta.
- **Calificaciones (RF-004, RF-005; Batch 8):**
  - **Captura:** solo el profesor, y solo en los grupos que tiene asignados; un grupo ajeno responde 403 `GRUPO_NO_ASIGNADO` (CF-CAL-01). El alumno nunca captura (CS-SEG-01).
  - **Consulta:** el alumno consulta las suyas con su sesión. Control escolar y coordinación consultan las de una matrícula: control escolar administra el expediente, y coordinación las necesita para autorizar correcciones.
  - **Ciclo del periodo:** iniciar el curso (CC-019), cerrar el periodo (UC06) y corregir después del cierre (D-17) son de coordinación.
  - **Caja y dirección:** no tocan el historial (CS-SEG-02).
- **Pagos y trámites (Batch 9):** la pasarela es simulada. El alumno ve su cuenta, paga y descarga sus documentos con su sesión; un pago o un trámite ajeno responde 404. Caja genera cargos, registra becas y hace el corte, y ve cualquier recibo. Control escolar procesa los trámites y verifica documentos. Caja no toca el historial ni los trámites (CS-SEG-02).
- **Dirección no consulta expedientes individuales:** ve reportes agregados por facultad y de la universidad, sin matrículas ni nombres (Tabla 16, Accesibilidad; Batch 10). No hay ruta de bitácora para ningún rol de uso (6.2-5, mínimo privilegio).
- **Administrador y coordinación son roles separados:** una cuenta puede tener varios, pero las cuentas del seed tienen uno cada una.
