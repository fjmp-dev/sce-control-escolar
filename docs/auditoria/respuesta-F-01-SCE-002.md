# Respuesta del auditado a la solicitud F-01-SCE-002

**Auditoría:** PA-SCE-001 v1.1 (equipo auditor Aerial Forge)
**Solicitud:** F-01-SCE-002, emitida el 1 de noviembre de 2026 por Rodolfo Ruíz Vaca, auditor líder
**Con copia a:** Pablo Avilés Santamaría y Ramón Emir Avilés Jaramillo
**Responde:** Francisco Javier Martínez Peñas, responsable del auditado, por el equipo SCE
**Fecha de respuesta:** 5 de noviembre de 2026 · **Versión:** 1.2
**Fuente versionada:** `docs/auditoria/respuesta-F-01-SCE-002.md` en `github.com/fjmp-dev/sce-control-escolar`

> **Entrega fuera de plazo.** El plazo de la solicitud venció el 3 de noviembre a las 18:00. El equipo SCE lo reconoce y entrega esta respuesta como evidencia de descargo para la réplica del 7 de noviembre (PA-SCE-001 v1.1, sección 7).
>
> **Rama que debe revisarse.** Según la sección 15.2 del manual, `main` solo recibe líneas base liberadas; hoy contiene la línea base documental de la fase 0. El código y las evidencias de la fase 1 están en la rama de integración `Desarrollo`, que se renombra a `develop` para cumplir la sección 15.2; GitHub redirige el nombre anterior. Lo entregado en esta respuesta está en el **pull request #30**, que espera la aprobación del segundo integrante, como exige la sección 29 del manual. Si la revisión del 22 de octubre se hizo sobre `main`, eso explica que el elemento 3 quedara como *Parcial*.
>
> **Corrida de CI de referencia:** *Actions* 42106331427, sobre el PR #30. Sus tres jobs están en verde y genera los artefactos `cobertura-lcov`, `trivy` y `gitleaks-results.sarif`.
>
> **Correcciones respecto a la versión 1.1.** Al contrastar el repositorio con el manual completo, el equipo encontró dos errores propios. Las etiquetas de casos de seguridad de la v1.1 no seguían la Tabla 49 (NC-007). El acta de fase 0 se había evaluado con criterios del equipo y no con la Tabla 23 (NC-006). Las fechas de staging y de OWASP ZAP también cambian. La sección 7 lista los cambios.

---

## 1. Estado de los elementos solicitados

| No. | Elemento | Criterios | Estado declarado | Evidencia y observaciones del auditado |
|---|---|---|---|---|
| 1 | Acceso de solo lectura al repositorio, workflows y ejecuciones de CI/CD | AU-09 a AU-13 | **Entregado** | El repositorio es público. Workflow: `.github/workflows/ci.yml`. Ejecuciones en la pestaña *Actions*. `main` y la rama de integración están protegidas: exigen pull request, los checks de CI y una aprobación, y la regla aplica también a administradores. Secret scanning con push protection activo. |
| 2 | Ambiente de pruebas con cuentas sintéticas de los seis roles | AU-14, 15, 17, 18, 25, 28 | **Entregado** (ambiente de pruebas) · Staging: **no existe todavía** | `docker compose up --build` levanta PostgreSQL 16 y la API, migrada y con seed, en `http://localhost:3000`. Hay una cuenta sintética por rol: `alumno@`, `profesor@`, `control.escolar@`, `coordinacion@`, `caja@` y `direccion@sce.test`; la contraseña de desarrollo está en el `README.md`. CI levanta este mismo ambiente en cada PR, hace login con los seis roles y verifica que cada cuenta tenga exactamente su rol (paso *Humo*). Staging se declara en la sección 2. |
| 3 | Fuentes de los diagramas UML, `schema.prisma` y migraciones versionadas | AU-02, 08, 09 | **Entregado** | Diagramas: `docs/arquitectura/fig01…fig10.puml`, con render. Esquema de 21 entidades: `api/prisma/schema.prisma`. Migraciones: `api/prisma/migrations/20261023001637_init` y `20261023001700_restricciones` (unicidad del expediente, movimiento neto único y bitácora inmutable). CI las aplica sobre una base limpia en cada corrida (CI-MIG-01, parcial: falta la corrida sobre base con datos). |
| 4 | Catálogo de requisitos, matriz de trazabilidad y backlog | AU-05, 06, 41, 43 | **Entregado** | Backlog: issues #1 a #22 por hito de sprint. Cambios: issues #23 a #28. La matriz de trazabilidad se corrige en el pull request del Batch 0 (NC-007). |
| 5 | Plan de pruebas, casos y reportes de ejecución, cobertura y escaneos | AU-20, 29, 30 | **Entregado en lo aplicable a la fase 1** | **Plan:** `docs/calidad/plan-de-pruebas.md` (Anexo H).<br>**Ejecución:** 20 pruebas automatizadas en verde. Con la numeración del manual cubren: CS-SEG-04 (sin token, hoy con Supertest; Newman llega después), CS-SEG-07 parcial (sesión expirada y usuario desactivado; falta la revocación por cierre de sesión), CI-AUTH-01, CF-ROL-01 parcial, CD-DAT-01, CD-DAT-04, inmutabilidad de la bitácora (control de RK-03) y altas y bajas de usuarios.<br>**Cobertura:** artefacto `cobertura-lcov`: 87 % de líneas sobre `api/src`. La meta de 80 % de RNF-MAN-001 aplica a la capa de dominio, que se construye en las fases 2 a 4.<br>**Análisis estático:** ESLint con `no-explicit-any` en CI (AU-10) y TypeScript `strict`.<br>**Dependencias:** `npm audit --audit-level=high` en CI: 0 altas o críticas.<br>**Contenedores y repositorio:** Trivy sobre la imagen de la API y sobre el repositorio (dependencias, secretos y configuración): 0 altas o críticas. Al activarlo, Trivy detectó 6 altas en el `npm` de la imagen base; se retiró de la imagen de ejecución.<br>**Secretos:** Gitleaks sobre el historial completo, con SARIF.<br>Cypress, OWASP ZAP y SonarQube se declaran en la sección 2. |
| 6 | Actas de aceptación de las fases 0 y 1 | AU-04, 07 | **Parcial** | **Fase 0:** ACT-F0-001 v1.1 para firma (`docs/gobierno/actas/acta-aceptacion-fase-0.md`; se adjunta en PDF). **Todavía no está firmada.** Evalúa la condición de la Tabla 23: la lista de qué entra y qué no existe; **el acta de levantamiento con control escolar, coordinación y caja no está en el repositorio** (NC-006). El dictamen propuesto es aceptación condicionada, y lo decide el Product Owner al firmar. La firma extemporánea está programada para el 6 de noviembre (NC-002).<br>**Fase 1:** en curso, con cierre el 11 de diciembre de 2026; ver la sección 2. |
| 7 | Matriz de riesgos con tratamiento de los riesgos Altos (RK-01 a RK-04, RK-07 y RK-09) | AU-37 | **Entregado** | `docs/calidad/matriz-riesgos.md`, con el estado actualizado en el Batch 0. RK-07 está mitigado con Gitleaks, Trivy, secret scanning con push protection y protección de ramas. RK-04 queda aceptado con plan fechado (ACT-F0-001, apartado 4). |
| 8 | Calendario oficial por fase, con inicio, estabilización y cierre | AU-43 | **Entregado** | `docs/gobierno/plan-de-trabajo.md`, sección 1: inicio, **estabilización** y cierre de las fases 0 a 5. La columna de estabilización se añadió en respuesta a esta solicitud. El orden detallado de construcción está en `docs/gobierno/plan-de-sistema.md`. |

---

## 2. Elementos que aún no existen (declaración del auditado)

El auditado **ratifica como *No aplica por fase*** los cuatro elementos que el F-01 ya registra: pruebas de carga y rendimiento (JMeter/k6), acta de restauración (pg_restore), matriz de compatibilidad y accesibilidad (Playwright/WCAG 2.2) y fichas de proveedores de Mercado Pago. Las fichas de GitHub y npm sí se entregan en el Batch 0. Declara además los siguientes:

| Elemento | Motivo | Fecha estimada | Resultado propuesto |
|---|---|---|---|
| Ambiente de staging y sus credenciales | La tabla de exigibilidad pide evidencia de staging desde la fase 2 (AU-08, AU-17, AU-19), así que se monta antes de cerrarla. Depende de definir proveedor. Mientras tanto se entrega el ambiente de pruebas del elemento 2 | Antes del cierre de la fase 2; a más tardar el 26 de febrero de 2027. **Adelanta** la fecha de la v1.1 (fase 3) | No aplica por fase |
| Acta de aceptación de la fase 1 | La fase 1 no ha cerrado | 11 de diciembre de 2026 | No aplica por fase |
| Pruebas funcionales con Cypress | Todavía no existe la capa de presentación en Next.js (issue #18) | Fase 1, sprints S4 y S5 | No aplica por fase |
| Escaneo dinámico con OWASP ZAP | La Tabla 30 lo ubica en el ambiente de pruebas. Se ejecutará contra el ambiente efímero de CI, con la API descrita en OpenAPI, y después contra staging | Fase 1, antes del 11 de diciembre de 2026. **Adelanta** la fecha de la v1.1 (fase 3) | No aplica por fase |
| SonarQube | Programado en el plan de pruebas | Fase 1, antes del 11 de diciembre de 2026 | No aplica por fase |

---

## 3. No conformidades autodeclaradas

El equipo detectó ocho desviaciones respecto a su propio manual. Las registró conforme a la sección 40, con causa, acción correctiva, responsable y fecha, para que ninguna quede abierta sin plan fechado (manual 8.4 y 40.1; PA-SCE-001, sección 11). El detalle completo está en `docs/calidad/registro-no-conformidades.md`.

| ID | Severidad | Descripción | Criterio | Plan fechado |
|---|---|---|---|---|
| NC-001 | Mayor | PR #29 fusionado sin aprobación de otro integrante. El segundo integrante no tenía acceso de escritura | AU-04, AU-11 | El segundo integrante acepta el acceso el 6 de noviembre y revisa el PR #29 a posteriori el 7 de noviembre. La protección de ramas ya impide fusionar sin aprobación |
| NC-002 | Mayor | Fase 1 iniciada sin el acta de la fase 0 firmada | AU-07 | Firma extemporánea el 6 de noviembre |
| NC-003 | Menor | Sin registro de aprobación del manual v2.0 (sección 1.2) | AU-01 | Registro preparado; se firma el 6 de noviembre (se adjunta) |
| NC-004 | Menor | Correcciones al manual (#7 a #15) vencidas el 30 de octubre sin reprogramación escrita | AU-02, AU-43 | Manual v2.1 a más tardar el 27 de noviembre de 2026 |
| NC-005 | Menor | Tablas de roles por sprint contradictorias entre documentos de gobierno | AU-04 | Corregida el 5 de noviembre; pendiente de verificación por QA |
| NC-006 | Mayor | No existe el acta de levantamiento que la Tabla 23 exige para la fase 0 | AU-07, AU-43 | 27 de noviembre de 2026, a confirmar por el equipo. No se redacta un acta sobre entrevistas que no ocurrieron |
| NC-007 | Menor | El catálogo CS-SEG del repositorio divergió de la Tabla 49 | AU-02, AU-05, AU-29 | Corregida el 5 de noviembre; pendiente de verificación por QA |
| NC-008 | Menor | Cambios CC-001 a CC-006 implementados sin aprobación registrada | AU-06 | Aprobación o rechazo a más tardar el 7 de noviembre |

---

## 4. Observaciones del auditado al plan v1.1 y al F-01

Se señalan para que el calendario y las referencias del expediente queden coherentes. Ninguna cuestiona el alcance ni los criterios.

- **Fechas del informe:** la sección 12 fija el informe preliminar el 2 de noviembre, la réplica desde el 3, el informe final el 5 y el plan de acciones correctivas el 7. El cronograma de la sección 7 fija 6, 7, 8 y 9 de noviembre. El auditado entiende que rige la sección 7 y pide confirmarlo.
- **Fecha límite de entrega:** la sección 10 conserva el 14 de octubre de 2026 de la versión 1.0, mientras que el F-01 v1.1 fija el 3 de noviembre.
- **Reunión de apertura:** la sección 3.3 dice que la apertura "aún no se realiza", pero la sección 7 la programa para el 2 de noviembre. El auditado pide el acta F-02 de esa apertura y la fase exigible que se fijó en ella. El auditado propone la fase 1, en curso, con los criterios de la fila "0 y 1" de la tabla de exigibilidad.
- **Versión del formato:** el pie de página del F-01 dice "Versión 1.0", pero su control del formato registra la 1.1.
- **Seguimiento:** la sección 12 fija la verificación de eficacia para el 1 de diciembre y la sección 7 cierra el expediente el 10 de noviembre. El auditado pide precisar cuál de las dos fechas aplica.

---

## 5. Autorización para la reejecución de pruebas

El equipo SCE autoriza al equipo auditor a reejecutar las pruebas automatizadas del repositorio y a levantar el ambiente de pruebas (`docker compose up`) con las cuentas sintéticas del seed en sus propios equipos. Aplican las condiciones del apartado 4 del F-01: acceso de solo lectura al repositorio, solo datos sintéticos y ninguna credencial en el expediente. No se autorizan pruebas intrusivas contra servicios de terceros.

## 6. Anexos

| Anexo | Documento |
|---|---|
| A | `SCE_Para_firma_Acta_F0_y_Aprobacion_Manual_v2.0_20261105_v1.1.pdf`: acta ACT-F0-001 v1.1 y registro de aprobación del manual v2.0, para firma |

## 7. Control de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | 5 de noviembre de 2026 | Primera respuesta |
| 1.1 | 5 de noviembre de 2026 | Ambiente de pruebas con Docker Compose verificado en CI; ESLint y Trivy; calendario con estabilización; acta de la fase 0 para firma; no conformidades autodeclaradas |
| 1.2 | 5 de noviembre de 2026 | Casos de seguridad con la numeración de la Tabla 49; acta de fase 0 evaluada con la Tabla 23; NC-006, NC-007 y NC-008; staging y ZAP adelantados; CI-MIG-01 y CF-ROL-01 declarados como parciales; corrida de referencia actualizada |

## 8. Firmas

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Responsable del auditado | Francisco Javier Martínez Peñas | | |
| Integrante del equipo SCE | Samuel Jezoar Ortiz Martínez | | |
| Recibe (auditor líder) | Rodolfo Ruíz Vaca | | |
