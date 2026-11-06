# Plan de pruebas — SCE

| Campo | Valor |
|---|---|
| Código | PP-SCE-001 |
| Versión | 1.1 — borrador para aceptación |
| Fecha | 5 de noviembre de 2026 (v1.0: 22 de octubre de 2026) |
| Manual de referencia | SCE-MC-001 v2.0, secciones 10, 19, 21 a 28 y Anexo H |
| Norma | ISO/IEC/IEEE 29119-3:2021 (estructura del plan) y 29119-4:2021 (técnicas) |
| Autor | FJMP |
| Acepta | SJOM, como QA del sprint en que se integra |
| Issue | [#16](https://github.com/fjmp-dev/sce-control-escolar/issues/16) |

Este plan aterriza la estrategia de la sección 21 del manual: qué se prueba en cada fase, con qué herramienta, en qué ambiente, quién lo ejecuta y dónde queda la evidencia. No repite el manual; donde el manual ya decide, se cita.

---

## 1. Alcance

**Elementos de prueba:** la API NestJS (`api/`), el esquema y las migraciones de PostgreSQL (`api/prisma/`), la configuración de auditoría de la base (`db/pgaudit.sql`) y, desde el Batch 3, la presentación en Next.js.

**Requisitos cubiertos:** los veinte del catálogo (`docs/calidad/catalogo-requisitos.md`), con la trazabilidad de `docs/calidad/matriz-trazabilidad.md`.

**Por fase:**

| Fase | Qué entra a prueba | Qué no, y por qué |
|---|---|---|
| 1 | Autenticación, autorización por los seis roles, catálogos institucionales, migraciones, integridad de la base, bitácora inmutable | Flujos de negocio: corresponden a fases 2 a 4 |
| 2 | Expediente único, inscripción con requisitos y adeudos | — |
| 3 | Horarios y choques, calificaciones, historial | Rendimiento: se mide en el Batch 13 |
| 4 | Pagos con idempotencia, trámites, bitácora de operaciones sensibles | — |
| 5 | Rendimiento, usabilidad, accesibilidad y compatibilidad en staging; aceptación en piloto | — |

---

## 2. Enfoque basado en riesgo

El orden y la profundidad de la prueba siguen la matriz de riesgos (sección 17.2). Los riesgos de nivel Alto tienen casos automatizados antes de que su módulo se integre a `main`.

| Riesgo | Nivel | Casos que lo cubren | Fase |
|---|---|---|---|
| RK-01 Duplicación de expediente | Alto | CF-EXP-01, CD-DAT-01 | 1 (CD-DAT-01) y 2 |
| RK-02 Pago duplicado o no reflejado | Alto | CF-PAG-01, CI-PAG-01, CD-DAT-03 | 4 |
| RK-03 Acceso cruzado entre roles | Alto | CS-SEG-01 a 03, CS-SEG-06, CI-AUTH-01, CF-ROL-01 e inmutabilidad de la bitácora | 1 a 4 |
| RK-04 Caída en semana de inscripción | Alto | CR-REN-01 a 05, CO-FIA-01 | 5 |
| RK-05 Choques de horario no detectados | Medio | CF-HOR-01 | 3 |
| RK-07 Secretos expuestos | Alto | CS-SEG-08, Gitleaks en CI | 1 |
| RK-09 Datos personales reales fuera de piloto | Alto | Revisión del seed y de los datos de staging | 1 a 5 |

---

## 3. Niveles, técnicas y responsables

**Niveles:** los de la Tabla 41 del manual. Con dos integrantes, "Desarrollo" y "QA" se resuelven por sprint según `docs/gobierno/metodologia-de-trabajo.md`: quien produce escribe las pruebas de su código y quien acepta las revisa en el pull request. Nadie acepta pruebas que escribió.

**Técnicas (29119-4), asignadas a reglas concretas:**

| Técnica | Dónde se aplica |
|---|---|
| Particiones de equivalencia | Roles autorizados frente a no autorizados en cada endpoint; tokens válidos, alterados, expirados y de usuario desactivado |
| Valores límite | Calificación 0 y 10; créditos 0 y 1; cupo lleno y cupo menos uno; parcial 1 a 4 |
| Tablas de decisión | Inscripción: prerrequisito × adeudo × choque × cupo → estado y motivo de rechazo |
| Transición de estados | Inscripción y trámite, según la figura 6 |
| Basada en riesgo | Pagos: doble notificación, reintento y caída de la pasarela |

**Distribución objetivo:** 70 % unitarias, 20 % integración, 10 % extremo a extremo (Tabla 40). En la fase 1 casi todo es integración, porque lo que existe es la frontera API–base de datos.

---

## 4. Herramientas

| Tipo | Herramienta | Versión del manual (Tabla 42) | Versión adoptada | Estado |
|---|---|---|---|---|
| Unitarias e integración de API | Jest con ts-jest y Supertest | Jest 29, Supertest 6 | Jest 30, Supertest 7 | **En uso** |
| Base efímera para integración | Testcontainers con PostgreSQL 16 | Testcontainers 10 | Vigente | **Batch 1**. Hoy se usa el servicio PostgreSQL 16 de GitHub Actions; CC-006 se corrige para retirar esa sustitución |
| Migraciones | Prisma Migrate | — | Prisma 6 | **En uso** (CI-MIG-01) |
| Secretos | Gitleaks | 8 | gitleaks-action v2 | **En uso** en CI |
| Secretos en el envío | Escaneo de secretos de GitHub con protección de envío | — | — | **Activo** |
| Auditoría de base de datos | pgAudit | — | 18.0 | Solo en el ambiente local donde se corrió `db/pgaudit.sql`. Compose y CI no lo activan. **Batch 6:** se activa en staging, o se retira CC-005 |
| Calidad de datos | Consultas SQL de verificación y Great Expectations | 0.18 | Vigente | SQL **en uso** (CD-DAT-01, 04); Great Expectations en el Batch 4 |
| Contratos de API | Postman y Newman | Newman 6 | Vigente | Batch 2 |
| Extremo a extremo | Cypress | 13 | Vigente | Batch 3 |
| Unitarias de frontend | Vitest y React Testing Library | Vitest 1.x | Vigente | Batch 3 |
| Compatibilidad | Playwright | 1.4x | Vigente | Batch 12 |
| Rendimiento | JMeter y k6 | 5.6 / 0.5x | Vigente | Batch 13, en staging; después en el servidor del piloto |
| Calidad de código | ESLint, Prettier, Husky, lint-staged, Commitlint, SonarQube | SonarQube 10 | ESLint **en uso** | Batch 1 |
| Seguridad de imágenes | Trivy | 0.5x | Vigente | **En uso** en CI |
| Seguridad de aplicación | OWASP ZAP | 2.15 | Vigente | Batch 2, en el ambiente de pruebas (Tabla 30); Batch 6, también en staging |
| Dependencias | npm audit y Dependabot | Integrado | — | **Activo** (alertas de Dependabot) |
| Accesibilidad | axe y Lighthouse | 4 / 11 | Vigente | Batch 3, con la interfaz |
| Casos y defectos | GitHub Issues | Integrado | — | **En uso** (etiquetas `defecto` y `sev-*`) |

---

## 5. Ambientes y datos de prueba

| Ambiente | Base de datos | Datos | Uso |
|---|---|---|---|
| Local | Docker Compose con Next.js, NestJS y PostgreSQL 16 (Tabla 30). Hoy, PostgreSQL 18 instalado hasta completar el Batch 1 | Seed sintético (`api/prisma/seed.mts`) | Desarrollo y ejecución previa al pull request |
| Pruebas / integración | GitHub Actions con PostgreSQL 16 efímero por ejecución | Seed sintético | Ejecución obligatoria en cada pull request; despliegue automático al fusionar en `develop`, desde el Batch 3 |
| Staging | Se monta en el Batch 6, antes de cerrar la fase 2. Proveedor por definir | Sintéticos o anonimizados | Humo, rendimiento, ZAP, usabilidad, webhook de Mercado Pago sandbox |
| Piloto | Batch 13 y 14 | Reales | Solo validación tras la puerta de promoción |

Regla de datos (sección 20.2 y RK-09): ningún ambiente distinto del piloto contiene datos personales reales. El seed usa nombres y matrículas ficticios y correos `@sce.test`.

---

## 6. Casos de la fase 1 y su estado

Fuente: `api/test/seguridad.spec.ts`. Se ejecutan con `npm test` en local y en cada pull request.

| Caso | Requisito | Qué verifica | Técnica | Estado |
|---|---|---|---|---|
| CS-SEG-04 | RF-008, RNF-SEG-001 | Sin token, o con token alterado, responde 401 | Particiones de equivalencia | **Automatizado con Supertest, en verde.** La herramienta del manual es Newman: Batch 2 |
| CS-SEG-07 | RF-008, RNF-SEG-001 | Token expirado responde 401; un usuario desactivado pierde el acceso aunque su token siga vigente | Particiones de equivalencia | **Parcial.** Falta la revocación por cierre de sesión: Batch 2 |
| CI-AUTH-01 | RF-008 | El token de un rol no autoriza un endpoint de otro rol: cinco roles reciben 403 al dar de alta catálogos | Particiones de equivalencia | **Automatizado, en verde** |
| CF-ROL-01 | RF-008 | Cada rol ve solo su parte. En fase 1: todos leen catálogos y solo coordinación los da de alta | Particiones de equivalencia | **Parcial**: catálogos. Se completa con cada módulo |
| Control de RK-03 | RNF-SEG-001 | La base rechaza UPDATE, DELETE y TRUNCATE sobre la bitácora | Basada en riesgo | **Automatizado, en verde** |
| CI-MIG-01 | RNF-MAN-001 | Las migraciones se aplican sobre una base limpia | — | **Parcial**: base limpia en CI. Falta base con datos (fase 2) |
| CD-DAT-01 | RNF-DAT-001 | Cero matrículas duplicadas | — | **Automatizado, en verde** |
| CD-DAT-04 | RNF-DAT-001 | Cero calificaciones sin grupo, periodo o profesor | — | **Automatizado, en verde** |
| — | RF-008 | Credenciales inválidas: mismo 401 exista o no la cuenta; entrada inválida 400; duplicado 409 | Valores límite | **Automatizado, en verde** |
| CS-SEG-01 a 03 | RF-008 | El alumno no captura ni altera calificaciones; caja no modifica el historial; un alumno no accede al expediente de otro | — | Pendiente: los endpoints se construyen en los batches 4 y 8 (#21) |
| CS-SEG-05 | RNF-SEG-002 | Una entrada malformada no corrompe la base ni expone trazas con secretos | — | Pendiente: OWASP ZAP en el Batch 2 |
| CS-SEG-06 | RNF-SEG-001 | Todo cambio de calificación, pago o constancia deja registro en bitácora | — | Pendiente: consulta SQL en los batches 4, 8, 9 y 10 |
| CS-SEG-08 | RNF-SEG-002 | Sin secretos en el repositorio, en los registros ni en las respuestas de la API | — | **Parcial**: Gitleaks en CI. La revisión manual de registros y respuestas se hace en el Batch 2 |

El catálogo completo de casos de todas las fases, con requisito y fase, está en `docs/calidad/matriz-trazabilidad.md`, sección 3.

---

## 7. Numeración de casos

Rige la numeración del manual: la definición de cada caso CS-SEG es la de la **Tabla 49**, la misma que usa PA-SCE-001. La versión 1.0 de este plan adoptaba una numeración propia; fue un error, registrado como NC-007 y corregido en `docs/calidad/matriz-trazabilidad.md`, sección 4.

Los casos que el manual no identifica se proponen en esa misma matriz: la correspondencia de CR-REN-01 a 05 con la Tabla 47 y la familia `CO-*`.

---

## 8. Criterios

**Entrada** (sección 21.4): la rama compila, el seed se aplica, el caso está escrito con su requisito y el ambiente existe.

**Salida de un pull request:** CI en verde (build, análisis estático, migraciones, pruebas, cobertura, npm audit, Trivy y Gitleaks) y aprobación de quien no lo escribió. Lo hace cumplir la protección de `main` y `develop`.

**Salida de una fase:** condición de la Tabla 23 cumplida, todos los casos Must de la fase en verde, cero defectos críticos abiertos y acta firmada por PO y QA (sección 10).

**Suspensión:** se suspende la ejecución si falla la migración sobre base limpia o si aparece un secreto en el historial. Se reanuda cuando el defecto se corrige y la ejecución completa vuelve a pasar.

---

## 9. Evidencia y reporte

| Evidencia | Dónde queda | Retención |
|---|---|---|
| Ejecución de cada pull request | Pestaña Checks del pull request en GitHub Actions | 90 días en GitHub; por eso, al cierre de cada sprint se copia el resumen al acta |
| Resultado por caso | Salida de Jest en el registro de la ejecución | Igual que la anterior |
| Defectos | Issues con etiqueta `defecto` y severidad `sev-critica`, `sev-alta`, `sev-media` o `sev-baja` (Tabla 52) | Dos años (Tabla 62) |
| Registro de auditoría de base de datos | Log de PostgreSQL, líneas `AUDIT:` | Semestre más uno en piloto (Tabla 62) |

### 9.1 Plantilla de caso (Anexo H)

| Campo | Contenido |
|---|---|
| Identificador | CF, CI, CS, CD, CR o CO + módulo + número |
| Requisito | RF o RNF vinculado |
| Objetivo | Qué se demuestra |
| Precondiciones | Estado de la base y usuario con el que se ejecuta |
| Datos | Entradas, incluidas las de borde |
| Pasos | Acciones numeradas |
| Resultado esperado | Código HTTP, estado o fila esperada |
| Resultado obtenido | Pasa o falla, con el valor observado |
| Ambiente y etiqueta | Local, CI, staging o piloto, y el commit o etiqueta |
| Evidencia | Enlace a la ejecución de CI o captura |
| Ejecutó y fecha | Persona y fecha |

### 9.2 Defectos

Un caso Must que falla abre un issue `defecto` con su severidad, el caso y el enlace a la ejecución. Lo corrige quien produjo el código y lo cierra quien lo verificó, que no puede ser la misma persona (sección 30.2).

---

## 10. Calendario

El orden lo fija `docs/gobierno/plan-de-sistema.md`. Cada caso sale de su batch en `docs/calidad/matriz-trazabilidad.md`, sección 3.

| Fase | Batches | Pruebas que se agregan | Cierre límite |
|---|---|---|---|
| 1 | 1, 2 y 3 | CI-MIG-01 completo, Newman, ZAP, CS-SEG-04, 05, 07 y 08, CI-AUTH-01, Vitest, Cypress, axe, Lighthouse | 11 de diciembre de 2026 |
| 2 | 4, 5 y 6 | CF-EXP-01, CF-INS-01 y 02, CI-API-01, CF-HOR-01 con Jest, CD-DAT-05, CS-SEG-02, 03 y 06, Great Expectations, ZAP en staging | 26 de febrero de 2027 |
| 3 | 7 y 8 | CF-HOR-01 con Cypress, CF-CAL-01, CI-CAL-01, CD-DAT-02, CS-SEG-01 | 16 de abril de 2027 |
| 4 | 9, 10 y 11 | CF-PAG-01, CI-PAG-01, CF-TRA-01 y 02, CF-REP-01, CD-DAT-03 y 06 | 28 de mayo de 2027 |
| Previo a 5 | 12 y 13 | Playwright, accesibilidad completa, CR-REN-01 a 05, CO-FIA-01 y 02, CO-FLE-01, usabilidad | Antes del piloto |
| 5 | 14 | Rendimiento en el servidor del piloto, operación recurrente y aceptación | Cierre del semestre piloto |

---

## 11. Aprobación

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Autor | Francisco Javier Martínez Peñas | | |
| QA (acepta) | Samuel Jezoar Ortiz Martínez | | |
