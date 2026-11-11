# Plan de pruebas — SCE

| Campo | Valor |
|---|---|
| Código | PP-SCE-001 |
| Versión | 1.9 — borrador para aceptación |
| Fecha | 10 de noviembre de 2026, Batch 8 (v1.8: Batch 7; v1.7: Batch 6; v1.6: Batch 5; v1.5: Batch 4; v1.4: Batch 3; v1.3: Batch 2; v1.2: Batch 1; v1.1: 5 de noviembre; v1.0: 22 de octubre de 2026) |
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
| Base efímera para integración | Testcontainers con PostgreSQL 16 | Testcontainers 10 | Testcontainers 12 | **En uso** |
| Migraciones | Prisma Migrate | — | Prisma 6 | **En uso** (CI-MIG-01 completo) |
| Secretos | Gitleaks | 8 | 8.30 | **En uso** en CI, sobre todas las ramas y todo el historial |
| Secretos en el envío | Escaneo de secretos de GitHub con protección de envío | — | — | **Activo** |
| Auditoría de base de datos | pgAudit | — | 16.1 (paquete `postgresql-16-pgaudit`) | **Activo en staging** (`infra/staging/db/`), con SCRAM y conexiones solo por TLS (CC-005). La etapa 7 lo ensaya en cada corrida y comprueba que registra el DDL de las migraciones. Compose de desarrollo no lo activa. `db/pgaudit.sql` solo había corrido en PostgreSQL 18: en la versión 16 del manual fallaba, y se corrigió |
| Calidad de datos | Consultas SQL de verificación y Great Expectations | 0.18 | Great Expectations 1.24 | **En uso** en la etapa 4, con Data Docs en HTML (`scripts/calidad-datos.sh`): CD-DAT-01 y 04, completitud y formato del expediente, y CS-SEG-06 en plantel |
| Contratos de API | Postman y Newman | Newman 6 | Newman 6.1.3 | **En uso** en la etapa 4, contra Compose, con reporte HTML (`scripts/newman.sh`) |
| Extremo a extremo | Cypress | 13 | Cypress 16 | **En uso** en la etapa 7, con video y capturas (`scripts/cypress.sh`) |
| Unitarias de frontend | Vitest y React Testing Library | Vitest 1.x | Vitest 5, React Testing Library 16 | **En uso** en la etapa 3 |
| Compatibilidad | Playwright | 1.4x | Vigente | Batch 12 |
| Rendimiento | JMeter y k6 | 5.6 / 0.5x | Vigente | Batch 13, en staging; después en el servidor del piloto |
| Calidad de código | ESLint con plugin de TypeScript, Prettier, Husky, lint-staged y Commitlint | — | ESLint 10, Prettier 3, Husky 9, lint-staged 17, Commitlint 21 | **En uso** |
| Calidad de código | SonarQube Community | SonarQube 10 | Community Build 26.11, perfil "Sonar way comprehensive" | **En uso**, ver 4.2 |
| Seguridad de imágenes | Trivy | 0.5x | Vigente | **En uso** en CI: imagen y repositorio, ambos bloquean |
| Seguridad de aplicación | OWASP ZAP | 2.15 | 2.17.0 | **En uso** en la etapa 5, contra Compose (Tabla 30), desde el OpenAPI (`scripts/zap.sh`). En staging, escaneo pasivo del portal sobre HTTPS en cada despliegue (`scripts/verificar-staging.sh`); el activo se queda en la etapa 5, sobre el mismo digest |
| Cifrado en tránsito | testssl.sh | — | 3.2 | **En uso** en cada staging, de la etapa 7 y de la 8: ningún protocolo anterior a TLS 1.2 (Tabla 38) |
| Dependencias | npm audit y Dependabot | Integrado | — | **En uso:** npm audit en CI; alertas activas y `.github/dependabot.yml` para npm, Docker y Actions |
| Accesibilidad | axe y Lighthouse | 4 / 11 | axe-core 4.14, Lighthouse 13.6 | **En uso** en la etapa 7 (`docs/calidad/accesibilidad.md`). NVDA: Batch 12 |
| Casos y defectos | GitHub Issues | Integrado | — | **En uso** (etiquetas `defecto` y `sev-*`) |

### 4.1 Etapas del pipeline

Etapas de la Tabla 53, en `.github/workflows/ci.yml`. Cada una es criterio de avance de la siguiente. Newman, ZAP, Cypress y k6 están en el pipeline según las Tablas 30, 42 y 48, pero la Tabla 53 no los nombra (contradicción X-15); aquí se les asigna etapa.

| Etapa | Contenido | Criterio de avance | Reporte como artefacto | Desde |
|---|---|---|---|---|
| 1 Construcción | Compilación de TypeScript de NestJS y Next.js; los tipos del portal deben coincidir con el OpenAPI | Sin errores | Registro de la ejecución | Batch 1; Next.js en el Batch 3 |
| 2 Análisis estático | ESLint en API y portal, Prettier, Commitlint y Gitleaks | Cero errores y cero secretos | `gitleaks` | Batch 1 |
| 3 Pruebas unitarias | Jest y Vitest con cobertura | Al menos 80 % de líneas en `src/**/dominio/**`; Jest falla si no se alcanza | `cobertura-unitarias`, `cobertura-portal` | Batch 2; Vitest en el Batch 3 |
| 4 Pruebas de integración | Supertest y Testcontainers; **Newman** (Tabla 30); **Great Expectations** sobre la base de Compose después de Newman (Tabla 42) | Casos CI Must en verde y cero expectativas incumplidas | `cobertura-integracion`, `newman`, `calidad-datos` | Batch 1; Newman en el Batch 2; Great Expectations en el Batch 4 |
| 5 Calidad y seguridad | SonarQube, npm audit y Trivy, con humo del ambiente Compose; **OWASP ZAP** (Tabla 30) | Puerta de calidad aprobada; cero alertas altas de ZAP, ningún 5xx y base intacta | `calidad`, `trivy`, `zap` | Batch 1; ZAP en el Batch 2 |
| 6 Empaquetado | Imágenes `sce-api` y `sce-portal`, registradas en GHCR y firmadas con cosign, sin llaves (`scripts/publicar-imagenes.sh`). **Solo al integrar;** en un pull request se omite | Firma verificada | `imagenes` | Batch 3 |
| 7 Despliegue a pruebas | Automático al fusionar en `develop`: verifica la firma, despliega las imágenes registradas sobre base efímera, y ejecuta humo, **Cypress**, axe y Lighthouse. Desde el Batch 6, también **staging efímero** con las mismas imágenes (`scripts/staging.sh`, CC-018). En un pull request, lo mismo con imágenes construidas ahí. **k6** con umbrales en el Batch 13 (Tabla 48) | Humo en verde | `despliegue-pruebas`: registro, video, capturas e informes | Batch 3 |
| 8 Staging y piloto | Manual (`.github/workflows/staging.yml`): solo con etiqueta SemVer integrada en `develop`, `main` o `release/*`, y un acta que la nombra. Arma staging efímero en el runner (CC-018), despliega por digest las imágenes firmadas por la etapa 6, corre el humo del Anexo D y lo destruye | Autorización de PO y QA: regla de revisores del ambiente `staging`, sin autoaprobación | `despliegue-staging-<etiqueta>` | Batch 6; piloto en el Batch 14 |

Los artefactos caducan a los 90 días; al cerrar cada fase se copian al repositorio de evidencias (Tabla 62).

### 4.2 Puerta de calidad sobre código nuevo

`scripts/sonar-puerta.sh`, también ejecutable en local. SonarQube Community analiza una sola rama y no analiza pull requests, así que en un contenedor efímero no tendría línea base. Se comprobó el 6 de noviembre de 2026 que se puede medir sin servidor persistente: el script arma un repositorio de dos commits, el árbol base y el árbol evaluado, y los analiza en orden. Lo nuevo es exactamente el diff entre ambos. Con código defectuoso de prueba, midió solo las líneas añadidas y rechazó por las cuatro condiciones que se violaron.

| Tabla 51 | Métrica de SonarQube | Condición de error | Efecto |
|---|---|---|---|
| Cobertura en código nuevo ≥ 80 % | `new_coverage` | < 80 | Rechaza |
| Errores bloqueantes o críticos: cero | `new_blocker_violations`, `new_critical_violations` | > 0 | Rechaza |
| Duplicidad en código nuevo < 3 % | `new_duplicated_lines_density` | > 2.99 | Rechaza |
| Vulnerabilidades altas o críticas: cero | `new_security_rating` | Peor que B | Rechaza |
| Deuda técnica introducida < un día | `new_technical_debt` | ≥ 480 minutos | **Avisa, no rechaza:** la Tabla 51 dice "se documenta y se agenda". Se anota en el pull request |

**Diferencia con lo que pide AU-30:** no hay "panel de SonarQube" permanente, porque el servidor vive lo que dura la ejecución. La evidencia es el artefacto `calidad` (`puerta.json`, `medidas.json`, `hallazgos.json`, `resumen.md`) y el auditor puede repetir la medición con el script. Si el auditor exige el panel, hará falta un servidor persistente.

**Excepciones de Gitleaks:** `.gitleaksignore` lista dos falsos positivos por huella (commit, archivo, regla y línea), con su justificación. Son la credencial pública por omisión de la imagen de SonarQube, en un commit de este batch; el código actual ya no tiene ese patrón. Una coincidencia nueva sigue fallando, comprobado. Toda excepción nueva requiere la aprobación de Seguridad en el pull request.

**Falla cerrada:** los scripts de `scripts/` fallan si la herramienta no llegó a medir. Es deliberado: durante la puesta a punto, SonarQube respondió `OK` sin análisis y Gitleaks respondió "no leaks found" con 0 commits.

### 4.3 Portal y ambiente de pruebas

**Contrato (Tabla 44).** `web/lib/tipos-api.ts` se genera de `docs/api/openapi.json`, y las acciones del portal lo usan: si la API cambia, el portal deja de compilar. La etapa 1 falla si el archivo no coincide.

**Ambiente de pruebas (Tabla 30).** Es GitHub Actions con base efímera: existe mientras dura la etapa 7. La demostración por rol que pide 11.3 queda en video y capturas (`demostracion-por-rol.cy.ts`).

**Imágenes.** Solo llevan dependencias de producción y no ejecutan el seed al arrancar: son las mismas que irán a staging y piloto. El seed sintético lo pide `docker-compose.yml` y, en staging, el servicio `tareas` con la contraseña propia del ambiente (RK-09, 20.2).

**Comprobado que fallan.** Cypress detectó un defecto real durante la puesta a punto. axe y el control de desborde fallaron con una página alterada a propósito.

### 4.4 Contratos y escaneo dinámico

**Newman.** `api/test/contratos/sce.postman_collection.json` tiene dos carpetas: CS-SEG-04 prueba sin token cada operación protegida, y Contratos valida códigos y esquemas de respuesta. `openapi.spec.ts` falla si una operación protegida del contrato no está en la primera carpeta.

**ZAP.** El escaneo usa una cuenta con los roles administrador y coordinación: con uno solo, los endpoints del otro responden 403 antes de validar la entrada, y esa validación quedaría sin probar. Se le quitan del OpenAPI el cierre de sesión y el cambio de contraseña, porque revocarían su propio token. Además de las alertas, `scripts/zap.sh` comprueba con los registros de la API que ZAP llegó autenticado, que no hubo ningún 5xx, que el token sigue vigente y que CD-DAT-01 y 04 siguen en cero filas.

### 4.5 Staging

Staging es efímero (CC-018): `scripts/staging.sh` lo arma en el runner con la topología de la Fig. 9, lo verifica y lo destruye. Configuración y procedimiento: `docs/gobierno/inventario-de-ambientes.md`. El humo de cada despliegue (`scripts/verificar-staging.sh`) cubre lo automatizable del Anexo D:
- salud e inicio de sesión por rol;
- Newman;
- TLS 1.2+, redirección a HTTPS, HSTS y ZAP pasivo;
- ausencia de datos reales;
- SCRAM, TLS y pgAudit en la base;
- revisión de accesos.

**Comprobado que fallan.** Con staging arriba, cada verificación nueva cayó con su propio mensaje ante un mutante: una cuenta `@gmail.com`, un rol con contraseña MD5, nginx sin HSTS y nginx con TLS 1.1. El de TLS 1.1 necesitó además un cifrado CBC, porque sin él OpenSSL no ofrece ese protocolo aunque se pida. Los rechazos de la base (otra dirección, sin TLS, TLS 1.1 y superusuario por red) son pruebas negativas del propio `staging.sh`.

---

## 5. Ambientes y datos de prueba

| Ambiente | Base de datos | Datos | Uso |
|---|---|---|---|
| Local | Docker Compose con NestJS y PostgreSQL 16 (Tabla 30), sobre Colima en macOS; Next.js desde el Batch 3. Las pruebas de integración levantan su propio PostgreSQL 16 con Testcontainers | Seed sintético (`api/prisma/seed.mts`) | Desarrollo y ejecución previa al pull request |
| Pruebas / integración | GitHub Actions con PostgreSQL 16 efímero por ejecución | Seed sintético | Ejecución obligatoria en cada pull request; despliegue automático al fusionar en `develop`, desde el Batch 3 |
| Staging | Dos servidores de la Fig. 9 (`docs/gobierno/inventario-de-ambientes.md`). Configurado y ensayado en el Batch 6; los servidores esperan la decisión del proveedor | Seed sintético, con contraseña propia | Humo del Anexo D, rendimiento, ZAP, usabilidad, webhook de Mercado Pago sandbox |
| Piloto | Batch 13 y 14 | Reales | Solo validación tras la puerta de promoción |

Regla de datos (sección 20.2 y RK-09): ningún ambiente distinto del piloto contiene datos personales reales. El seed usa nombres y matrículas ficticios y correos `@sce.test`. **Convención verificable desde el Batch 6:** toda cuenta usa el dominio reservado `.test` (RFC 2606), salvo el usuario técnico sin acceso, y todo nombre de alumno empieza con "Alumno" o "Alumna". `api/prisma/verificacion/sin-datos-reales.sql` lo comprueba en cada despliegue a staging (18.2).

---

## 6. Casos de la fase 1 y su estado

Fuente: `api/test/integracion/`. Se ejecutan con `npm run test:integracion` en local, con Docker, y en la etapa 4 de cada pull request. Las consultas CD-DAT están en `api/prisma/verificacion/`, junto a las migraciones (19.1).

| Caso | Requisito | Qué verifica | Técnica | Estado |
|---|---|---|---|---|
| CS-SEG-04 | RF-008, RNF-SEG-001 | Un endpoint sin token responde 401 | Particiones de equivalencia | **Automatizado con Newman, en verde:** todas las operaciones protegidas del contrato |
| CS-SEG-07 | RF-008, RNF-SEG-001 | La sesión expira en el tiempo configurado. El token revocado por cierre, cambio de contraseña, baja o cambio de roles no se reutiliza. Renovación sin rebasar la sesión máxima | Particiones de equivalencia y valores límite | **Automatizado con Supertest, en verde** |
| CI-AUTH-01 | RF-008 | El token de un rol no autoriza un endpoint de otro rol: cada token contra cada endpoint, desde `docs/calidad/matriz-rol-endpoint.md` | Particiones de equivalencia | **Automatizado, en verde** |
| CF-ROL-01 | RF-008 | Cada rol ve solo su parte: siete roles por 41 operaciones protegidas en la API; menú y altas por rol en el portal | Particiones de equivalencia | **Automatizado, en verde** sobre lo que existe. Crece con cada módulo |
| Control de RK-03 | RNF-SEG-001 | La base rechaza UPDATE, DELETE y TRUNCATE sobre la bitácora | Basada en riesgo | **Automatizado, en verde** |
| CI-MIG-01 | RNF-MAN-001 | Las migraciones se aplican sobre una base limpia y sobre una base con datos, sin pérdida. Comprueba que toda fila previa de las 21 tablas sigue igual; una migración puede agregar filas | Basada en riesgo | **Automatizado con Prisma y Testcontainers, en verde.** Comprobado con migraciones que alteran datos, borran filas y borran una columna: la prueba falla |
| CD-DAT-01 | RNF-DAT-001 | Cero matrículas duplicadas, y la base rechaza un segundo expediente con la misma matrícula | Basada en riesgo | **Automatizado, en verde.** Consulta versionada, también desde Great Expectations, desde el Batch 4. Antes, Great Expectations en el Batch 4 |
| CD-DAT-04 | RNF-DAT-001 | Cero calificaciones sin grupo, periodo o profesor, y la consulta detecta un huérfano provocado | Basada en riesgo | **Automatizado, en verde.** Consulta versionada, también desde Great Expectations, desde el Batch 4. Antes, Great Expectations en el Batch 4 |
| — | RF-008 | Credenciales inválidas: mismo 401 exista o no la cuenta; entrada inválida 400; duplicado 409 | Valores límite | **Automatizado, en verde** |
| Interfaz Next.js y NestJS (Tabla 44) | RF-008 | Autenticación JWT en cookie `httpOnly`, cierre y revocación, renovación, códigos de error de negocio visibles, contrato por tipos generados | Transición de estados | **Automatizado con Cypress y en la etapa 1, en verde** |
| CF-EXP-01 | RF-001 | Un solo expediente activo; tras el cambio de facultad, la consulta devuelve el mismo expediente con su historial, inscripciones y trayectoria | Transición de estados | **Automatizado con Jest y Supertest, en verde.** En el portal, también con Cypress |
| CS-SEG-02 | RNF-SEG-001 | Caja no modifica el historial académico | Particiones de equivalencia | **Supertest, en verde,** sobre lo que existe: caja y dirección reciben 403 al cerrar el periodo y al corregir calificaciones, y ninguna ruta de caja escribe el historial. Se completa con pagos en el Batch 9 |
| CS-SEG-03 | RNF-SEG-002 | El token de un alumno no accede al expediente de otro | Particiones de equivalencia | **Supertest, en verde:** el alumno solo llega a `/alumnos/actual`, y la matrícula sale de su sesión. Desde el Batch 5, también en la inscripción: un folio ajeno responde 404 sin cambiar nada y la petición no acepta matrícula; Newman lo repite. **Con ZAP, parcial:** el escaneo valida entradas, pero no prueba acceso cruzado entre cuentas; se completa en el Batch 12 |
| CS-SEG-06 en plantel | RNF-SEG-001 | Cada cambio de plantel deja asiento completo y coherente con la facultad actual | Basada en riesgo | **Consulta SQL, en verde,** también desde Great Expectations. Comprobado que detecta un asiento falso. No detecta un cambio hecho en la base sin pasar por la API: eso lo cubre pgAudit en el Batch 6 |
| CF-INS-01 | RF-002 | Una inscripción con adeudo o prerrequisito faltante queda en estado explícito y no confirma la carga. También: el prerrequisito cuenta solo si se acreditó en un periodo cerrado, con el último intento y el redondeo de D-5 | Tabla de decisión y valores límite | **Cypress, en verde,** con video y capturas. En la API, con Supertest y Newman |
| CF-INS-02 | RNF-USU-001 | Cada motivo de rechazo (prerrequisito, adeudo, choque y cupo) tiene estado y mensaje propios, con la corrección | Particiones de equivalencia | **Cypress, en verde,** los cuatro motivos. Vitest comprueba la etiqueta y la corrección de cada uno |
| CF-HOR-01 | RF-003 | El choque de horario se detecta y se comunica antes de confirmar | Valores límite | **Jest, en verde:** extremos que se tocan, un minuto de cruce, contención y días distintos. **Cypress, en verde:** "Revisar choques" avisa sin enviar, y enviar así se rechaza por choque. **Desde el Batch 7, también al definir la oferta (D-13):** Jest con la tabla de aula, profesor, sesiones propias y valores límite; Supertest con cada rechazo y con la concurrencia: una definición espera a la que está en curso en el mismo periodo, comprobado con un mutante sin el bloqueo, que la prueba detecta 3 de 3 veces. **Cypress:** coordinación recibe el traslape de aula con causa y corrección antes de guardar, corrige, publica la oferta y el profesor ve su grupo |
| Oferta publicada (CC-012) | RF-003 | El alumno no ve ni inscribe una oferta sin publicar. La oferta se publica una sola vez, solo con el periodo abierto, y queda en bitácora. Abrir el periodo y definir un grupo también | Tabla de decisión | **Jest y Supertest, en verde.** Newman y Cypress repiten el flujo |
| Consulta diferenciada por rol (Tabla 4) | RF-003 | Coordinación ve la oferta completa con el profesor de cada grupo; el alumno, solo la publicada y su horario; el profesor, solo sus grupos de periodos no cerrados | Particiones de equivalencia | **Supertest, Vitest y Cypress, en verde.** CF-ROL-01 cubre las rutas nuevas |
| CI-API-01 | RF-002 | La inscripción confirmada persiste la carga y deja traza; si falla la validación se revierte la transacción completa | Basada en riesgo y transición de estados | **Supertest y Testcontainers, en verde:** confirmación con carga, cupo y bitácora; cupo agotado que revierte la reserva de los demás grupos; cinco alumnos simultáneos por dos lugares; doble envío simultáneo; dos cargas distintas simultáneas del mismo alumno; ajuste que mueve el cupo y ajuste rechazado que conserva la carga |
| Orden fijo de la Fig. 4 | RF-002 | Con varios fallos, el motivo es el primero del orden prerrequisitos, adeudos, choques | Tabla de decisión | **Jest, en verde,** las ocho combinaciones. Supertest repite dos |
| CD-DAT-05 | RNF-DAT-001 | Cero inscripciones sin matrícula, periodo o carga | Basada en riesgo | **Consulta SQL y Great Expectations, en verde.** Comprobado que detecta una inscripción sin carga. El manual la pide semanal en inscripción; aquí corre en cada pull request |
| Ocupación de grupos | RF-002, RK-05 | La ocupación de cada grupo es igual a sus inscritos confirmados | Basada en riesgo | **Consulta SQL y Great Expectations, en verde.** Comprobado que detecta un lugar ocupado sin inscrito |
| — | Tabla 15, Resistencia; Parte B | Bloqueo tras 5 fallos en 15 minutos; política de contraseñas; confirmación de contraseña del administrador; bitácora de accesos fallidos, cambios de rol y acciones del administrador | Valores límite | **Automatizado, en verde** |
| CS-SEG-01 | RF-008 | El rol alumno no captura ni altera calificaciones | Particiones de equivalencia | **Supertest y Newman, en verde:** el alumno recibe 403 al capturar, también en su propio grupo, y no se guarda nada |
| CF-CAL-01 | RF-004 | El profesor captura solo en sus grupos; el alumno ve la calificación tras el commit | Particiones de equivalencia y transición de estados | **Cypress, en verde:** captura del parcial, consulta del alumno, grupo ajeno a sin permiso, cierre rechazado por D-16, cierre, kárdex, CSV y corrección. **Supertest:** un profesor ajeno recibe 403 aunque el folio no exista, para no revelar quién está inscrito |
| CI-CAL-01 | RF-004 | La captura y la consulta leen el mismo registro después del commit | Basada en riesgo | **Supertest, en verde:** la consulta del alumno devuelve el parcial recién guardado |
| CD-DAT-02 | RF-005, RNF-DAT-001 | Recálculo del historial sobre 30 expedientes, con 100 % de coincidencia | Basada en riesgo | **SQL independiente del dominio y Great Expectations, en verde:** 30 expedientes con reprobadas y recursadas; detecta un historial alterado. Una sola función de redondeo, con valores límite en Jest. El cierre espera a las capturas en curso: un mutante que lee antes de tomar el periodo cierra con parciales a medias, y la prueba lo detecta 3 de 3 veces |
| CS-SEG-05 | RNF-SEG-002 | Una entrada malformada no corrompe la base ni expone trazas con secretos | Basada en riesgo | **Automatizado con ZAP, en verde.** Los casos concretos también están en `gateway.spec.ts`. Se completa en el Batch 12 |
| CS-SEG-06 | RNF-SEG-001 | Todo cambio de calificación, pago o constancia deja registro en bitácora | Basada en riesgo | **En calificación, consulta SQL y Great Expectations, en verde:** cada calificación tiene asiento de captura del profesor del grupo, y cada corrección lleva autor, valor anterior, motivo y evidencia (D-17). Comprobado que detecta una calificación sin asiento y una captura firmada por otro. Pago y constancia en los batches 9 y 10 |
| CS-SEG-08 | RNF-SEG-002 | Sin secretos en el repositorio, en los registros ni en las respuestas de la API | Basada en riesgo | **Gitleaks y búsqueda en registros en cada corrida.** Revisión manual: primera pasada en `revision-cs-seg-08.md`, **falta la revisión de Seguridad** |

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

| Fase | Batches | Pruebas que se agregan | Construcción | Cierre límite |
|---|---|---|---|---|
| 1 | 1, 2 y 3 | CI-MIG-01 completo, Newman, ZAP, CS-SEG-04, 05, 07 y 08, CI-AUTH-01, Vitest, Cypress, axe, Lighthouse | 5 al 7 de noviembre de 2026 | 11 de diciembre de 2026 |
| 2 | 4, 5 y 6 | CF-EXP-01, CF-INS-01 y 02, CI-API-01, CF-HOR-01 con Jest, CD-DAT-05, CS-SEG-02, 03 y 06, Great Expectations, ZAP en staging | 7 al 8 de noviembre de 2026 | 11 de diciembre de 2026 |
| 3 | 7 y 8 | CF-HOR-01 con Cypress, CF-CAL-01, CI-CAL-01, CD-DAT-02, CS-SEG-01 | 10 de noviembre de 2026 | 11 de diciembre de 2026 |
| 4 | 9 y 10 | CF-PAG-01 y CF-TRA-01 y 02 con pago simulado, CF-REP-01, CS-SEG-02, 03 y 06 en pagos y trámites | 10 al 13 de noviembre de 2026 | 11 de diciembre de 2026 |

Fuera de alcance desde el 10 de noviembre de 2026 (`plan-de-sistema.md`, apartado 6.1): CI-PAG-01 contra el sandbox de Mercado Pago, Playwright, NVDA, CR-REN-01 a 05, CO-FIA-01 y 02, CO-FLE-01, usabilidad con participantes y la fase 5.

---

## 11. Aprobación

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Autor | Francisco Javier Martínez Peñas | | |
| QA (acepta) | Samuel Jezoar Ortiz Martínez | | |
