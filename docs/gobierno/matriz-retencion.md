# Matriz de retención documental — SCE

**Fuente:** SCE-MC-001 v2.0, sección 42 (Tabla 62). **Vigente desde:** 5 de noviembre de 2026.

Las columnas Documento, Responsable y Retención son las de la Tabla 62. La columna Ubicación precisa dónde se cumple en este proyecto.

| Documento | Responsable | Retención | Ubicación concreta |
|---|---|---|---|
| Manual SCE-MC-001 | Product Owner y QA | Versión vigente más dos anteriores | Pendiente de decidir, porque el manual es de "uso interno académico" y este repositorio es público. Mientras tanto, archivo identificado por su SHA-256 en `registro-aprobacion-manual-v2.0.md` |
| Actas de aceptación | Product Owner | Tres años | `docs/gobierno/actas/` y copia firmada en `docs/evidencias/` |
| Requisitos y trazabilidad | QA | Vigente más dos años | `docs/calidad/` |
| Modelos UML y modelo de datos | Desarrollo | Vigente más dos años | `docs/arquitectura/` y `api/prisma/` |
| Informes de prueba | QA | Dos años | GitHub Actions (90 días) y `docs/evidencias/` en cada cierre de fase |
| Tickets y acciones correctivas | QA | Dos años | GitHub Issues y `docs/calidad/registro-no-conformidades.md` |
| Informes de auditoría | Auditor | Tres años | Repositorio del auditor; las respuestas del auditado, en `docs/auditoria/` |
| Registros y bitácora del piloto | DevOps | Semestre más uno | Registros de `sce-db` (pgAudit), `sce-api`, `sce-portal` y `sce-proxy`, cifrados con age junto a cada respaldo (`*.registros.gz.age`, `scripts/respaldo.sh`); misma ubicación y retención que los respaldos. Rotación local: 10 archivos de 50 MB por contenedor |
| Respaldos de base de datos | DevOps | Según objetivos de continuidad: semestre en curso más uno anterior (Tabla 56) | Cifrados con age (`cifrado-y-claves.md`): artefacto `respaldo` de `continuidad.yml` (35 días) y release `respaldos` semanal fuera del sitio (un año). Detalle en `inventario-de-ambientes.md`, apartado 7 |

**Expediente académico (fuera de la Tabla 62; D-18, por ratificar).** Son datos personales, no documentos del proyecto. El plazo real lo fija el catálogo de disposición documental de la universidad; mientras no se tenga, rige la propuesta de D-18 en `docs/calidad/reglas-de-negocio.md`. Hoy el SCE no borra nada.

| Dato | Responsable | Retención propuesta (D-18) | Ubicación concreta |
|---|---|---|---|
| Expediente: alumno, historial, inscripciones y calificaciones | Control escolar | Todo, mientras el alumno esté activo. Tras la baja o el egreso, sin supresión: sustenta constancias, certificados y revalidaciones | Tablas `alumno`, `historial`, `inscripcion`, `inscripcion_grupo` y `calificacion` |
| Trámites y documentos emitidos | Control escolar | Como el expediente | Tablas `tramite` y `documento` |
| Estado de cuenta, movimientos y pagos | Caja | Cinco años desde el último movimiento | Tablas `cuenta_alumno`, `movimiento` y `pago` |
| Cuentas de usuario | Administrador del sistema | Baja al egreso, a la baja del alumno o al fin de la relación laboral. La fila se conserva mientras la bitácora la referencie | Tablas `usuario` y `usuario_rol` |
| Bitácora del SCE | Seguridad | Como el dato que respalda. La fila "Registros y bitácora del piloto" queda para los registros JSON y pgAudit | Tabla `bitacora`, inmutable |
| Copias fuera del SCE: CSV, documentos e impresiones | Quien descarga | Fuera del control del SCE | Equipo de quien descarga (`docs/gobierno/datos-personales/inventario.md`) |

**Revisión:** en cada cierre de fase, QA comprueba que la retención se cumpla.

**Fuera de la Tabla 62:** la retención del expediente académico no está definida en el manual. PA-SCE-001 lo señala en su Parte B (AU-40). Se atiende con las filas de arriba y D-18, en el sub-batch 12.6 (10 de noviembre de 2026).
