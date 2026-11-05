# Respuesta del auditado a la solicitud F-01-SCE-002

**Auditoría:** PA-SCE-001 v1.1 (Aerial Forge)
**Solicitud:** F-01-SCE-002, emitida el 1 de noviembre de 2026 por Rodolfo Ruíz Vaca
**Responde:** Francisco Javier Martínez Peñas, por el equipo SCE
**Fecha de respuesta:** 5 de noviembre de 2026

> El plazo de la solicitud venció el 3 de noviembre a las 18:00. Esta respuesta se entrega fuera de ese plazo y se pone a disposición del equipo auditor como evidencia de descargo para la réplica del 7 de noviembre (PA-SCE-001, sección 7).

**Medio de entrega:** el repositorio público `github.com/fjmp-dev/sce-control-escolar`. El código de la fase 1 vive en la rama **`Desarrollo`**. `main` solo recibe líneas base liberadas (sección 15.2 del manual), así que hoy contiene únicamente la línea base documental de la fase 0. Si la revisión se hizo sobre `main`, eso explica que el elemento 3 se haya visto como parcial.

---

## 1. Estado por elemento

| No. | Elemento | Estado declarado | Dónde está la evidencia |
|---|---|---|---|
| 1 | Acceso de solo lectura al repositorio, workflows y ejecuciones | Entregado | Repositorio público. Workflow `.github/workflows/ci.yml`; ejecuciones en la pestaña *Actions*. |
| 2 | Ambiente de pruebas o staging con cuentas de los seis roles | **No existe todavía** (staging) · Entregado (ambiente reproducible) | Staging corresponde a la fase 3 (`docs/gobierno/plan-de-trabajo.md`, sección 4). Para verificar autenticación y autorización por rol, el ambiente de desarrollo se levanta con los pasos del `README.md` y el seed crea una cuenta sintética por rol: `alumno@`, `profesor@`, `control.escolar@`, `coordinacion@`, `caja@` y `direccion@sce.test`. Son datos sintéticos (RK-09). El mismo ambiente se reconstruye desde cero en cada ejecución de CI. |
| 3 | Fuentes de diagramas, `schema.prisma` y migraciones versionadas | Entregado | Diagramas: `docs/arquitectura/*.puml`. Esquema: `api/prisma/schema.prisma` (rama `Desarrollo`). Migraciones: `api/prisma/migrations/20261023001637_init` y `20261023001700_restricciones`. El job de CI aplica las migraciones sobre una base limpia (caso CI-MIG-01). |
| 4 | Catálogo de requisitos, matriz de trazabilidad y backlog | Entregado | Sin cambios respecto a la recepción del 22 de octubre. |
| 5 | Plan de pruebas, casos y reportes de ejecución, cobertura y escaneos | **Parcial** | Plan: `docs/calidad/plan-de-pruebas.md`. Reportes de ejecución: cada corrida de CI. Cobertura lcov: artefacto `cobertura-lcov` de cada corrida, a partir de la integración de la rama `feature/fase1-usuarios-cobertura`. Dependencias: paso `npm audit --audit-level=high` en CI, hoy sin vulnerabilidades altas ni críticas. Secretos: job Gitleaks. Cypress, OWASP ZAP y Trivy: ver apartado 2. |
| 6 | Actas de aceptación de las fases 0 y 1 | **Parcial** | Fase 0: `docs/gobierno/actas/acta-aceptacion-fase-0.md`. **Sigue en borrador, sin firma** (issue #1 abierto). Fase 1: en curso, con cierre previsto para el 11 de diciembre de 2026; ver apartado 2. |
| 7 | Matriz de riesgos con tratamiento de los riesgos Altos | Entregado | Sin cambios respecto a la recepción del 22 de octubre. |
| 8 | Calendario oficial por fase | Entregado | `docs/gobierno/plan-de-trabajo.md`, sección 1, publicado en `main` desde el commit `12feb3a`. Se entrega con fecha de inicio y de cierre por fase. Las fechas de estabilización se fijan al planear cada fase. |

---

## 2. Elementos que aún no existen

Se suman a los cuatro que el F-01 ya registra (rendimiento, restauración, compatibilidad y accesibilidad, y fichas de proveedores). El auditado ratifica esos cuatro como *No aplica por fase*.

| Elemento | Motivo | Fecha estimada |
|---|---|---|
| Ambiente de staging y sus credenciales | Se monta en la fase 3, cuando haya módulos que desplegar | Fase 3 (desde el 1 de marzo de 2027) |
| Acta de aceptación de la fase 1 | La fase 1 no ha cerrado | 11 de diciembre de 2026 |
| Pruebas funcionales con Cypress | Todavía no existe la capa de presentación en Next.js (issue #18) | Fase 1, sprint S4 o S5 |
| Escaneo con OWASP ZAP | Exige la aplicación desplegada en un ambiente de pruebas | Fase 3 (staging) |
| Escaneo de contenedores con Trivy | Todavía no hay imágenes de contenedor (Docker Compose, issue #18) | Fase 1, sprint S4 o S5 |
| SonarQube y ESLint en CI | Programados en el plan de pruebas | 11 de diciembre de 2026 |

---

## 3. Autorización para la reejecución

El equipo SCE autoriza al equipo auditor a reejecutar las pruebas del repositorio y a usar las cuentas sintéticas del seed en su propia copia local del ambiente. Aplican las condiciones del F-01, apartado 4: solo lectura sobre el repositorio, solo datos sintéticos y ninguna credencial en el expediente.

---

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Responsable del auditado | Francisco Javier Martínez Peñas | | |
