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
| Registros y bitácora del piloto | DevOps | Semestre más uno | Almacenamiento con acceso restringido; se define en el Batch 13 |
| Respaldos de base de datos | DevOps | Según objetivos de continuidad: semestre en curso más uno anterior (Tabla 56) | Respaldo cifrado; se define en el Batch 13 |

**Revisión:** en cada cierre de fase, QA comprueba que la retención se cumpla.

**Fuera de la Tabla 62:** la retención del expediente académico como tal no está definida en el manual. PA-SCE-001 lo señala en su Parte B y se atiende en el Batch 12.
