# Plan de pruebas — SCE

| Campo | Valor |
|---|---|
| Código | PP-SCE-001 |
| Versión | 1.0 — borrador para aceptación |
| Fecha | 22 de octubre de 2026 |
| Manual de referencia | SCE-MC-001 v2.0, secciones 10, 19, 21 a 28 y Anexo H |
| Norma | ISO/IEC/IEEE 29119-3:2021 (estructura del plan) y 29119-4:2021 (técnicas) |
| Autor | FJMP |
| Acepta | SJOM, como QA del sprint en que se integra |
| Issue | [#16](https://github.com/fjmp-dev/sce-control-escolar/issues/16) |

Este plan aterriza la estrategia de la sección 21 del manual: qué se prueba en cada fase, con qué herramienta, en qué ambiente, quién lo ejecuta y dónde queda la evidencia. No repite el manual; donde el manual ya decide, se cita.

---

## 1. Alcance

**Elementos de prueba:** la API NestJS (`api/`), el esquema y las migraciones de PostgreSQL (`api/prisma/`), la configuración de auditoría de la base (`db/pgaudit.sql`) y, desde la fase 2, la presentación en Next.js.

**Requisitos cubiertos:** los veinte del catálogo (`docs/calidad/catalogo-requisitos.md`), con la trazabilidad de `docs/calidad/matriz-trazabilidad.md`.

**Por fase:**

| Fase | Qué entra a prueba | Qué no, y por qué |
|---|---|---|
| 1 | Autenticación, autorización por los seis roles, catálogos institucionales, migraciones, integridad de la base, bitácora inmutable | Flujos de negocio: corresponden a fases 2 a 4 |
| 2 | Expediente único, inscripción con requisitos y adeudos | — |
| 3 | Horarios y choques, calificaciones, historial | Rendimiento: aún sin staging |
| 4 | Pagos con idempotencia, trámites, bitácora de operaciones sensibles | — |
| 5 | Rendimiento, usabilidad, accesibilidad y compatibilidad en staging; aceptación en piloto | — |

---

## 2. Enfoque basado en riesgo

El orden y la profundidad de la prueba siguen la matriz de riesgos (sección 17.2). Los riesgos de nivel Alto tienen casos automatizados antes de que su módulo se integre a `main`.

| Riesgo | Nivel | Casos que lo cubren | Fase |
|---|---|---|---|
| RK-01 Duplicación de expediente | Alto | CF-EXP-01, CD-DAT-01 | 1 (CD-DAT-01) y 2 |
| RK-02 Pago duplicado o no reflejado | Alto | CF-PAG-01, CI-PAG-01, CD-DAT-03 | 4 |
| RK-03 Acceso cruzado entre roles | Alto | CS-SEG-01 a 04, CI-AUTH-01, CF-ROL-01 | 1 a 4 |
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
| Base efímera para integración | Servicio PostgreSQL 16 de GitHub Actions | Testcontainers 10 | — | **En uso**. Cambio registrado en CC-006 |
| Migraciones | Prisma Migrate | — | Prisma 6 | **En uso** (CI-MIG-01) |
| Secretos | Gitleaks | 8 | gitleaks-action v2 | **En uso** en CI |
| Secretos en el envío | Escaneo de secretos de GitHub con protección de envío | — | — | **Activo** |
| Auditoría de base de datos | pgAudit | — | 18.0 | **Activo**. CC-005 |
| Calidad de datos | Consultas SQL de verificación | — | — | **En uso** (CD-DAT-01, 04) |
| Contratos de API | Postman y Newman | Newman 6 | — | Fase 2 |
| Extremo a extremo | Cypress | 13 | — | Fase 2 |
| Compatibilidad | Playwright | 1.4x | — | Fase 5 |
| Rendimiento | JMeter y k6 | 5.6 / 0.5x | — | Fase 5, en staging |
| Calidad de código | ESLint, Prettier, SonarQube | SonarQube 10 | — | Fase 1, sprint S4 |
| Seguridad de aplicación | OWASP ZAP | 2.15 | — | Fase 3, en staging |
| Dependencias | npm audit y Dependabot | Integrado | — | **Activo** (alertas de Dependabot) |
| Accesibilidad | axe y Lighthouse | 4 / 11 | — | Fase 2, con la interfaz |
| Casos y defectos | GitHub Issues | Integrado | — | **En uso** (etiquetas `defecto` y `sev-*`) |

---

## 5. Ambientes y datos de prueba

| Ambiente | Base de datos | Datos | Uso |
|---|---|---|---|
| Local | PostgreSQL 18 con pgAudit | Seed sintético (`api/prisma/seed.mts`) | Desarrollo y ejecución previa al pull request |
| CI | PostgreSQL 16 efímero por ejecución | Seed sintético | Ejecución obligatoria en cada pull request |
| Staging | A definir en la fase 3 | Sintéticos o anonimizados | Humo, rendimiento, ZAP, usabilidad |
| Piloto | A definir en la fase 5 | Reales | Solo validación tras la puerta de promoción |

Regla de datos (sección 20.2 y RK-09): ningún ambiente distinto del piloto contiene datos personales reales. El seed usa nombres y matrículas ficticios y correos `@sce.test`.

---

## 6. Casos de la fase 1 y su estado

Fuente: `api/test/seguridad.spec.ts`. Se ejecutan con `npm test` en local y en cada pull request.

| Caso | Requisito | Qué verifica | Técnica | Estado |
|---|---|---|---|---|
| CS-SEG-04 | RF-008, RNF-SEG-001 | Sin token, token alterado o expirado reciben 401; un usuario desactivado pierde el acceso aunque su token siga vigente | Particiones de equivalencia | **Automatizado, en verde** |
| CI-AUTH-01 | RF-008 | El token de un rol no autoriza un endpoint de otro rol: cinco roles reciben 403 al dar de alta catálogos | Particiones de equivalencia | **Automatizado, en verde** |
| CF-ROL-01 | RF-008 | Cada rol ve solo su parte. En fase 1: todos leen catálogos y solo coordinación los da de alta | Particiones de equivalencia | **Parcial**: catálogos. Se completa con cada módulo |
| CS-SEG-06 | RNF-SEG-001 | La base rechaza UPDATE, DELETE y TRUNCATE sobre la bitácora | Basada en riesgo | **Automatizado, en verde** |
| CI-MIG-01 | RNF-MAN-001 | Las migraciones se aplican sobre una base limpia | — | **Parcial**: base limpia en CI. Falta base con datos (fase 2) |
| CD-DAT-01 | RNF-DAT-001 | Cero matrículas duplicadas | — | **Automatizado, en verde** |
| CD-DAT-04 | RNF-DAT-001 | Cero calificaciones sin grupo, periodo o profesor | — | **Automatizado, en verde** |
| — | RF-008 | Credenciales inválidas: mismo 401 exista o no la cuenta; entrada inválida 400; duplicado 409 | Valores límite | **Automatizado, en verde** |
| CS-SEG-01 a 03 | RF-008 | 403 en captura de calificaciones, caja, control escolar e historial | — | Pendiente: los endpoints se construyen en fases 2 a 4 (#21) |
| CS-SEG-08 | RNF-SEG-002 | Sin secretos en el repositorio | — | **Automatizado**: Gitleaks en CI. La parte de logs se cubre al existir flujos con datos personales |

El catálogo completo de casos de todas las fases, con requisito y fase, está en `docs/calidad/matriz-trazabilidad.md`, sección 3.

---

## 7. Numeración de casos: correspondencia con el manual

El manual define los casos de seguridad de cuatro formas distintas (solicitud de cambio [CC-002](https://github.com/fjmp-dev/sce-control-escolar/issues/24)). Este plan usa **la numeración del catálogo del repositorio**. Correspondencia con la Tabla 49:

| Tabla 49 del manual | Equivale en el catálogo |
|---|---|
| CS-SEG-01 Alumno no captura calificaciones | CS-SEG-01 |
| CS-SEG-02 Caja no modifica el historial | CS-SEG-02 y 03 (403 en operaciones ajenas al rol) |
| CS-SEG-03 Alumno no accede al expediente de otro | CS-SEG-07 |
| CS-SEG-04 Endpoint Must sin token responde 401 | CS-SEG-04 |
| CS-SEG-05 Entrada malformada no corrompe ni expone trazas | Sin equivalente; se propone añadirlo como CS-SEG-09 |
| CS-SEG-06 Todo cambio sensible deja registro en bitácora | CS-SEG-05 |
| CS-SEG-07 La sesión expira y el token revocado no se reutiliza | CS-SEG-04 |
| CS-SEG-08 Sin secretos en repositorio, registros ni respuestas | CS-SEG-08 |

Casos que el manual define en las tablas 39, 43 y 45 y que el catálogo no recogía, y que se incorporan: CF-ROL-01, CI-API-01, CI-CAL-01, CI-AUTH-01, CI-MIG-01, CD-DAT-03 a CD-DAT-06.

---

## 8. Criterios

**Entrada** (sección 21.4): la rama compila, el seed se aplica, el caso está escrito con su requisito y el ambiente existe.

**Salida de un pull request:** CI en verde (build, migraciones, pruebas y Gitleaks) y aprobación de quien no lo escribió. Lo hace cumplir la protección de la rama `main`.

**Salida de una fase:** todos los casos Must de la fase en verde, cero defectos críticos abiertos y acta firmada por PO y QA (sección 10.1).

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

| Fase | Pruebas que se agregan | Cierre previsto |
|---|---|---|
| 1 | Las de la sección 6, más ESLint, Prettier y SonarQube en CI | 11 de diciembre de 2026 |
| 2 | CF-EXP-01, CF-INS-01 y 02, CD-DAT-05, Newman, Cypress, axe | 26 de febrero de 2027 |
| 3 | CF-HOR-01, CF-CAL-01, CI-CAL-01, CD-DAT-02, ZAP en staging | 16 de abril de 2027 |
| 4 | CF-PAG-01, CI-PAG-01, CF-TRA-01 y 02, CS-SEG-05, CD-DAT-03 y 06 | 28 de mayo de 2027 |
| 5 | CR-REN-01 a 05, CO-FIA-01 y 02, usabilidad, compatibilidad, aceptación | Cierre del semestre piloto |

---

## 11. Aprobación

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Autor | Francisco Javier Martínez Peñas | | |
| QA (acepta) | Samuel Jezoar Ortiz Martínez | | |
