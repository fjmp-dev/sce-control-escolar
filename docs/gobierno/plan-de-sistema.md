# Plan de sistema del SCE, por batches

**Fuente única de verdad:** Manual SCE-MC-001 v2.0, sus figuras 1 a 10 (`docs/arquitectura/*.puml`) y el plan de auditoría PA-SCE-001 v1.1.
**Regla de lectura:** si este plan y el manual difieren, gana el manual, salvo las desviaciones aprobadas de la sección 3.
**Destino:** al aprobarse, este archivo se versiona como `docs/gobierno/plan-de-sistema.md` (Batch 0).
**Revisión:** contrastado de forma independiente contra las 43 secciones del manual, las 10 figuras y PA-SCE-001 el 5 de noviembre de 2026.

---

## 1. Contexto

El equipo debe construir el SCE completo, con interfaz, conforme al manual. La rama de integración `Desarrollo` solo tiene la fase 1 parcial: base de datos, autenticación y catálogos. El PR #30 agrega altas de usuarios, CI ampliado y la respuesta F-01; sigue sin aprobar, y la invitación de `samuel0rtiz` al repositorio sigue pendiente.

Antes de este plan se escribió una API completa en la rama local `feature/sce-modulos` (commit `8c5ad1b`, sin subir). Al leer el manual completo se comprobó que **ese código no cumple la letra del manual** (sección 4). Por eso:

- `8c5ad1b` no se fusiona. Queda como referencia, y se reutiliza lo que coincida con el manual: promedio en enteros, `traslapan`, `jsonCanonico`, seed e intención de las pruebas.
- `web/` (sin versionar; lo dejó un comando interrumpido, con el puerto equivocado) se descarta y se rehace en el Batch 3.

**Lo que no se puede construir con código** está en la sección 8. El piloto real, por ejemplo, depende de una facultad y de un semestre completo.

---

## 2. Reglas de trabajo

1. **Un batch a la vez.** Cada batch termina con PR a `develop` y un reporte: qué se hizo, evidencia y qué falta. El siguiente empieza solo con el OK de FJMP. **Con un defecto crítico abierto no se inicia funcionalidad nueva** (6.3, Tabla 40).
2. **Ramas y commits:** `feature/<issue>-<descripcion>` (Tabla 31) y commits convencionales con identificador de requisito, por ejemplo `feat(expediente): RF-001 cambio de plantel`.
3. **Separación de funciones** (10.4, 29.1, 30.2):
   - Quien produce no acepta. Mientras FJMP produzca, **SJOM ocupa PO, QA y Seguridad para ese entregable** y aprueba el PR. Si SJOM produce una parte, la acepta FJMP.
   - QA no solo firma: ejecuta el conjunto Must en cada incremento y la regresión en cada candidato, clasifica y verifica defectos, y publica el tablero.
   - Un defecto no lo cierra quien lo corrigió.
   - Los cambios Must que tocan pagos, calificaciones o seguridad llevan revisor explícito de dominio o seguridad.
   - FJMP trabaja con un asistente de IA. Queda declarado en `Co-Authored-By` y en `roles-y-raci.md`; FJMP rinde cuentas por ese código.
4. **Apilado:** un PR que espera revisión puede tener batches apilados **solo dentro de la misma fase**. Los batches que abren fase (4, 7, 9 y 14) esperan el acta firmada de la fase anterior, como ya se declaró en NC-002. **Ninguna fase cierra sin fusión.**
5. **Diseño antes de código** (6.2-9, Tabla 54): un cambio de arquitectura o de modelo de datos primero lleva CC (Anexo C) y figuras actualizadas. El código de un cambio Mayor no se fusiona sin su CC aprobado.
6. **Seguridad y accesibilidad en cada incremento** (6.2-10). En cada batch se repiten los casos de rol y de identificadores ajenos sobre los endpoints nuevos.
7. **Definición de terminado de cada batch** (Tabla 24, 14.1-10, 29.1):
   - PR con identificador de requisito, CI en verde y puerta de calidad aprobada (Tabla 51).
   - **Desplegado en pruebas con humo en verde**, a partir del Batch 3.
   - Reglas Must con prueba automatizada; casos con el ID y la herramienta del manual.
   - Bitácora en toda operación sensible que toque el batch.
   - Matriz de trazabilidad, registro de cambios, matriz rol × endpoint y riesgos al día.
   - README, OpenAPI y figuras al día. Sin secretos ni datos personales reales.
8. **Cierre de fase** (10.3, 10.4, 11.3, 15.3, 32): lista de QA completa, plan e informe de fase, acta Anexo B firmada, matriz de riesgos revisada, tablero de indicadores, cobertura de subcaracterísticas Alta anexa, `release/x.y.z` fusionada a `main`, etiqueta `vX.Y.Z`, notas de versión, línea base y copia de reportes al repositorio de evidencias (Tabla 62; los artefactos de CI caducan).
9. **Sprints** (Tabla 24, 11.3): los sprints del calendario siguen vigentes. Cada uno cierra con revisión, acta de sprint, retrospectiva y acción de mejora (sec. 41), y lista los batches entregados.
10. **Sin adornos.** Nada fuera de la Tabla 4 sin cambio aprobado (10.1-5, RK-06).

---

## 3. Decisiones

### 3.1 Aprobadas por FJMP el 5 de noviembre de 2026

| # | Decisión | Fundamento | Registro y consecuencias |
|---|---|---|---|
| D-1 | **Versiones con soporte:** Next 16, React 19, Node 24, NestJS 12, Prisma 6, Jest 30, Supertest 7; demás herramientas en versión vigente | Node 20 sin soporte desde el 30-abr-2026; 14.5 pide cero vulnerabilidades altas | CC-006 se amplía; Tablas 7 y 42 en manual v2.1, **emitido antes de cerrar la fase 1** |
| D-2 | **Rol técnico `administrador`** (rol de entrega, Tablas 11 y 12) con panel web para altas de usuarios y catálogos institucionales. Los seis roles de uso de RF-008 no cambian | Tablas 11 y 12 frente a RF-008 y Figura 1 | CC tipo Mayor; Figuras 1 y 2, Tabla 5; humo de CI y muestra de AU-14. **El código no se fusiona sin CC aprobado.** FJMP sumaría Desarrollo y Administrador: se declara en `roles-y-raci.md` |
| D-3 | **Colima + Docker CLI** en el Mac y **Testcontainers** en integración | Tablas 30, 42, 45 y 53 | Se retira de CC-006 esa sustitución y PostgreSQL 18 local |
| D-4 | **Orden por fases** (Tablas 23, 25 y 27): Académico antes que Pagos y trámites | Exigibilidad de PA-SCE-001 sec. 3.3 y Tabla 60 | Contradicción con Tabla 24 y sec. 3.4 anotada para v2.1 |

### 3.2 Provisionales: el manual no fija el dato

El PO las ratifica en `docs/calidad/reglas-de-negocio.md`, porque el manual exige "reglas publicadas del periodo" (Tabla 16).

| # | Regla provisional | Bloquea |
|---|---|---|
| D-5 | Mínima aprobatoria 6.00; final = promedio de parciales; promedio general = promedio de finales; recursada cuenta el último intento; redondeo half-up a dos decimales | Batches 5 y 8 |
| D-6 | Plazo de ajuste (Fig. 6) = periodo `abierto`; ventana de captura (Tabla 15) = periodo `en_curso` | Batches 5 y 8 |
| D-7 | Caja indica el importe al generar los cargos del periodo (Fig. 7); no hay tarifa en código ni catálogo de cuotas | Batch 9 |
| D-8 | Créditos del plan: los del plan de las materias cursadas, porque la Fig. 8 no liga alumno con plan | Batch 8 |
| D-9 | `evento.id` de la Fig. 5 = `external_reference` = `clave_idempotencia`, generada al crear el intento | Batch 9 |
| D-10 | Adeudo vigente = saldo mayor que cero; hasta 4 parciales | Batches 5 y 8 |
| D-11 | Formatos institucionales: matrícula, clave de materia y periodo (Tabla 16, Conformidad) | Batch 3 |
| D-12 | El intento de pago "sobre un movimiento" (Fig. 5) se liga por `referencia`, sin columna nueva | Batch 9 |
| D-13 | Aula y profesor sin traslape al definir grupos; la Tabla 29 solo dice "cupo y traslape" | Batch 7 |
| D-14 | Control escolar consulta inscripciones; la Tabla 5 dice "administra": el PO define el alcance | Batch 5 |

### 3.3 Interpretaciones que se resuelven con CC en Batch 0

| Tema | Conflicto | Propuesta |
|---|---|---|
| Persistir el rechazo | Fig. 4 no inserta al rechazar; RF-002, Fig. 6 y la tasa de conclusión lo necesitan | Se persiste con motivo en transacción aparte; se actualiza la Fig. 4 |
| Dependencias | Fig. 2 dibuja dominios hacia expediente; Fig. 4 dibuja desde expediente; trámites necesita saldo para no adeudo; identidad no llega a bitácora | Se actualiza la Fig. 2 antes del Batch 5 |
| Portal a API | Fig. 9 no dibuja la conexión del servidor Next a Nest | Se añade a la Fig. 9 |
| Número de versión | El mayor cambia si se altera el alcance (1.3, 3.6) | El CC de D-2 decide entre v2.1 y v3.0 |
| Usuario técnico sin rol | Autor de bitácora en operaciones automáticas; la Fig. 3 pide `1..*` roles | Se anota la excepción; sin acceso |

---

## 4. Desviaciones del código actual que este plan corrige

| Código actual | Qué dice el manual | Batch |
|---|---|---|
| Valida adeudo → prerrequisito → choque; un comentario cita mal la Fig. 4 | Fig. 4, "orden fijo": **prerrequisitos → adeudos → choques**; el cupo se resuelve en la transacción | 5 |
| Rechazo responde 201; sin bitácora | Fig. 4: rechazo **409** con estado y motivo; confirmación **201** con folio y comprobante; bitácora en ambos | 5 |
| La inscripción crea el cargo; cuota fija de $1,850 inventada | Fig. 7: **Caja genera los cargos**; la transacción de la Fig. 4 no incluye movimientos | 5 y 9 |
| Control escolar cierra el periodo | Fig. 1: **Coordinación académica** (UC06); Fig. 3: `Periodo.cerrar()` | 8 |
| Rutas `/pagos/notificacion`, `/yo/estado-cuenta`, `POST /pagos` | Fig. 5: `GET /cuenta/{matricula}`, `POST /pagos/intento`, `POST /webhooks/pagos` | 9 |
| Webhook sin bitácora en firma inválida o duplicado; sin Mercado Pago real | Fig. 5: bitácora en ambos casos; preferencia y checkout en sandbox | 9 |
| Trámite permite recibida → rechazada; control escolar marca entregada; sin motivo | Fig. 6: rechazo solo desde EnProceso, **con motivo visible**; Entregada cuando **el solicitante descarga** | 10 |
| Verificación pública de documento con nombre del alumno | Tabla 38: ningún endpoint Must anónimo; la Parte B no es requisito | 10 |
| Dirección consulta la bitácora | Tabla 16: dirección ve reportes agregados; 6.2-5: mínimo privilegio | 11 |
| Controladores llaman a Prisma; dominios leen tablas ajenas | 14.3: capas y **patrón repositorio**; Fig. 2: comunicación por servicios | 2 |
| Funciones sueltas en `reglas.ts` | Fig. 3: clases con operaciones; AU-08 las compara | 2, 4–10 |
| Numeración CS-SEG propia (CC-002) | **Tabla 49**, la que usa PA-SCE-001 (AU-14 cita 04 y 07; AU-15, 01 a 03; AU-16, 06) | 0 |
| API en 3000 y web en 3001; sin `/salud` | Fig. 9: Next **3000**, NestJS **3001**, `/salud` | 2 y 3 |
| Sin renovación, cierre ni revocación de sesión | Tabla 38 y CS-SEG-07 | 2 |
| Sin recibos ni exportación de historial | Tabla 4, 22.1, Tabla 16 | 8 y 9 |
| Falta OpenAPI, Prettier, Husky, lint-staged, Commitlint, SonarQube, Vitest, Cypress, Newman, Testcontainers, Great Expectations | 14.4, 14.5, Tablas 42 y 53 | 1, 2, 3, 4 |
| Altas de usuarios en control escolar (PR #30) | Tablas 11 y 12 (D-2) | 2 |
| Rama `Desarrollo`; `feat/` en metodología; fusión "a main" como terminado | 15.2, Tabla 31: `develop`, `feature/id-descripción`; Tabla 24: rama integrada | 0 |
| `documento.contenido` añadido sin CC ni figura | Tablas 34 y 54 | 0 |

---

## 5. Arquitectura objetivo (Figuras 2, 3 y 9; 14.1 y 14.3)

```
api/src/
  gateway/       main, ValidationPipe, errores con códigos de negocio, OpenAPI, /salud, logs JSON
  identidad/     Usuario.autenticar, Rol, sesiones, guards, altas de usuarios
  expediente/    Alumno, Historial, Inscripcion (validar*, confirmar) + servicios, repositorios, controladores
  academico/     Facultad, PlanEstudios, Materia, Prerequisito, Periodo, Grupo, Horario, Calificacion
  pagos/         CuentaAlumno.tieneAdeudo, Movimiento, Pago.aplicarUnaVez, pasarela Mercado Pago, conciliación
  tramites/      Tramite, Documento, emisión y verificación
  bitacora/      Bitacora, BitacoraService, BitacoraRepository
  reportes/      ReportesService (lee por persistencia, Fig. 2)
  persistencia/  PrismaService; transacción compartida con AsyncLocalStorage (stdlib)
web/             Next.js: interfaces por rol; nunca toca la base de datos
```

- **Dominio puro y sin `any`:** sin Nest ni Prisma; se prueba sin base de datos (14.1-8 y 9). Meta ≥ 80 % de líneas (Tabla 59).
- **Sufijos** Service, Controller, Repository y Guard (Tabla 31). DTO con validación declarativa (14.3).
- **Toda escritura en más de una tabla va en transacción** (14.1-6), con la bitácora dentro.
- **Rutas:** las figuras mandan donde fijan una ruta; en lo demás, sustantivos en plural. La convención se fija en el Batch 2 y queda en OpenAPI (Tabla 31).
- **Sesión web:** JWT en cookie `httpOnly`; el navegador nunca lo lee; Next llama a la API desde el servidor.

---

## 6. Batches

### 6.1 Compactación del 10 de noviembre de 2026 (vigente)

FJMP decidió que el pago sea **simulado**, sin Mercado Pago, y que el resto se compacte: es un proyecto escolar y basta con que funcione bien de punta a punta. Los batches 0 a 8 se construyeron del 5 al 10 de noviembre de 2026. Lo que sigue sustituye a los batches 9 a 14 de abajo, que quedan como referencia:

| Batch | Contenido | Construcción |
|---|---|---|
| 9 | Pagos simulados (estado de cuenta, cargos del periodo, becas, intento y pasarela simulada con aplicación única, recibo y corte del día) y trámites (Fig. 6, constancia, no adeudo e historial con folio y hash SHA-256) | 10 al 12 de noviembre de 2026 |
| 10 | Reportes de dirección (inscripción, avance y cobranza por facultad, sin bitácora) y revisión final | 12 al 13 de noviembre de 2026 |

- **Fuera de alcance:** Mercado Pago real y su webhook, Playwright, NVDA, monitoreo, pruebas de carga, usabilidad con participantes, ambiente piloto y fase 5.
- **Se conserva:** un PR por batch, CI en verde, pruebas de las reglas clave, matriz rol × endpoint y Newman.
- **Sin papeleo nuevo:** sin actas, CC ni NC adicionales.
- **Otros documentos:** donde citan los batches 11 a 14, el 11 se lee como el 10, y los batches 12 a 14 quedan fuera de alcance.
- **Fechas:** el calendario real está en `plan-de-trabajo.md`, apartado 1. Las fases 1 a 4 cierran a más tardar el 11 de diciembre de 2026.

### Batch 0 — Base documental y reconciliación (sin código de producto)
**Fuente:** sec. 1, 5, 11, 12, 16, 17, 33, 40–43; Tabla 49; PA-SCE-001 sec. 3.3, 7 y 11.
**Entrega:** se apila sobre el PR #30, porque `registro-no-conformidades.md` solo existe ahí. Lo marcado con ⏰ debe estar listo para la **réplica del 7 de noviembre**; lo demás puede seguir después.

- ⏰ **Adenda al acta de fase 0 antes de firmar.** El acta dice "Cumple" con criterios que no son los de la Tabla 23. Debe recoger la salvedad por el acta de levantamiento faltante. El PDF para firma se regenera.
- ⏰ **NC nuevas, con severidad y plan fechado:** NC-006, falta el acta de levantamiento de la fase 0 (Mayor, misma clase que NC-002; fecha propuesta: 27 de noviembre de 2026, a confirmar por el equipo); NC-007, el catálogo CS-SEG divergió de la Tabla 49 (Menor; se corrige en este batch).
- ⏰ **Adenda a F-01:** corrige las etiquetas CS-SEG citadas, y las fechas de staging y ZAP según este plan. Si la v1.1 aún no se envió, se reemplaza por v1.2.
- **Reconciliar CS-SEG con la Tabla 49:** `matriz-trazabilidad.md`, `plan-de-pruebas.md`, CC-002 y nombres de pruebas. La prueba hoy llamada CS-SEG-06 (bitácora inmutable) se conserva como control de RK-03 con otro nombre.
- **Solicitudes de cambio con análisis de impacto y figuras** (numeración desde CC-007): rol `administrador`; `documento.contenido`; `tramite.motivo_rechazo`; `usuario.sesion_version`; `pago.fecha_confirmacion` (CD-DAT-06); `periodo.oferta_publicada_en` (Fig. 7, "Publicar oferta"); y las interpretaciones de la sección 3.3. Ampliación y recorte de CC-006. Acta de cambio mayor (sec. 16).
- `docs/calidad/reglas-de-negocio.md` con D-5 a D-14, **inventario de reglas Must** (Tabla 59) y formato de historia (12.1).
- **Lista de contradicciones del manual** para la nueva versión: Tabla 24 y 3.4 vs. 25; defecto crítico 7.2 vs. Tabla 52; "nueve diagramas" vs. diez figuras; tres motivos de rechazo vs. cuatro; Fig. 4 vs. Fig. 6 en el rechazo; Fig. 3 vs. Fig. 4 en `validar*`; Fig. 2 vs. Fig. 4; Fig. 5 (`/cuenta`) vs. Tabla 31; Fig. 7 "Sistema" vs. Fig. 1 en el cierre; prefijos de Tabla 31 vs. `CO-*`; índice parcial vs. PK en matrícula; 15 minutos vs. primera hora en la carga; RF-009 facultad vs. Tabla 5 universidad; staging "anonimizados" vs. ausencia de datos reales; inscripción de fase 2 que necesita oferta de fase 3; herramientas sin etapa en la Tabla 53.
- **Roles:** corregir `plan-de-trabajo.md`, `metodologia-de-trabajo.md` y el requisito de "personas distintas" que contradice al acta; registrar la limitación de dos personas y el uso del asistente de IA en `roles-y-raci.md`. El PO aprueba organigrama y RACI (5.2, 5.3).
- `plan-de-trabajo.md` y `plan-de-pruebas.md`: nuevo orden, staging antes de cerrar la fase 2, ZAP en pruebas (Tabla 30); motivo escrito (su sec. 5).
- Renombrar `Desarrollo` → `develop`; protecciones, CI, README y metodología. Resolver las ramas `Documentos` y `Rodolfo`, fuera del modelo de 15.2, **con el auditor al tanto**.
- **Plantillas:** Anexos B a H; GitHub Issues para defecto (severidad de Tabla 52), caso de prueba y cambio, con requisito, subcaracterística y puntos de historia; plantilla de PR con requisito y revisor explícito.
- **Evidencias y gobierno:** versionar manual y fuentes, y planteamiento inicial (15.1); definir repositorio de evidencias; matriz de retención (Tabla 62); fichas de GitHub y npm (Tabla 55); clasificar los 20 requisitos en subcaracterísticas (8.4); bitácora de lecciones y registro de mejoras (sec. 41); revisar defectos e incidentes; regularizar S1 y S2 con fecha real; issues por batch.

**AU:** 01, 02, 03, 04, 05, 06, 07, 09, 11, 29, 36, 37, 38, 40, 41, 42, 43.

### Batch 1 — Estándares y pipeline de calidad
**Fuente:** 14.5, 15, 19.1, 29, Tablas 42, 51 y 53.

- **Prerrequisito D-3:** instalar Colima y Docker CLI; verificar `docker compose up` local.
- Regenerar los render PNG de las figuras cambiadas en el Batch 0, con PlantUML en contenedor.
- Prettier, ESLint + plugin TS, Husky + lint-staged, Commitlint, TypeScript estricto. `.github/dependabot.yml`.
- **SonarQube Community** con la puerta de la Tabla 51. **Hay que comprobarlo primero:** Community podría no analizar PR ni conservar línea base de "código nuevo" en un contenedor efímero. Si no mide, se usa un servidor persistente o una alternativa con CC.
- **Testcontainers** con PostgreSQL 16. **CI-MIG-01** completo: base limpia y base con datos.
- Pipeline en las etapas de la Tabla 53 (1 a 5), con reportes como artefactos. Asignar etapa a Newman, Cypress, ZAP y k6, que la Tabla 53 no menciona.
- Consultas SQL de verificación versionadas junto a las migraciones.

**Casos:** CI-MIG-01, CD-DAT-01, CD-DAT-04, CS-SEG-08 (Gitleaks). **AU:** 09, 10, 11, 12, 13, 20, 21, 29, 30.

### Batch 2 — Arquitectura por capas, identidad y bitácora
**Fuente:** 13.2, 14.1, 14.3, 14.4, 18, Tablas 28, 38 y 57; Fig. 2 y 9.

- Reestructurar `auth`, `catalogos` y `usuarios` a los módulos de la sección 5, con repositorios.
- **Gateway:** códigos de error de negocio, OpenAPI desde decoradores, `/salud`, logs JSON sin datos sensibles, API en 3001.
- **Identidad:** JWT con expiración, renovación controlada, cierre y revocación con `sesion_version`; política de contraseñas y bloqueo por intentos sin columna nueva (Tabla 15, Resistencia; si requiere columna, va en el CC); control adicional para roles privilegiados (Parte B).
- **Rol `administrador`:** usuarios, facultades y planes. **Coordinación** conserva materias, periodos y oferta (Tabla 5, Fig. 7).
- **BitacoraService:** autor, acción, valor anterior y fecha; también accesos fallidos, cambios de rol y acciones del administrador (Parte B).
- **Matriz rol × endpoint**, que crece con cada batch (AU-15). STRIDE por componente, que también se actualiza por batch.
- **Newman** con contratos en CI; **ZAP** API scan contra compose usando el OpenAPI (Tabla 30).

**Casos:** CS-SEG-04 (Newman); CS-SEG-07, CI-AUTH-01, CF-ROL-01 (Supertest); CS-SEG-05 (ZAP); CS-SEG-08 (Gitleaks y revisión manual). **AU:** 08, 10, 14, 15, 16, 20. **Riesgos:** RK-03, RK-07.

### Batch 3 — Portal base, despliegue a pruebas y cierre de fase 1
**Fuente:** 27, 28, 31, Tablas 23, 30 y 53; Fig. 9.

- **Next.js** en `web/`, puerto 3000. Login, cierre de sesión y navegación por rol. Salud de la web (Tabla 57).
- **Accesibilidad desde el inicio (28.1):** teclado y foco visible, etiqueta en cada campo, errores con causa y corrección, contraste ≥ 4.5:1, estados con texto o icono, zoom 200 %, objetivo táctil WCAG 2.2, sin desborde en 1366×768, 1920×1080 y 390×844. Páginas ligeras para conectividad limitada (Tabla 15) y etiquetas legibles sin diccionario técnico (Tabla 16).
- Pantallas de catálogos: administrador (usuarios, facultades, planes) y coordinación (materias, prerrequisitos, periodos).
- `docker-compose.yml` con Next, Nest y PostgreSQL.
- **Vitest + React Testing Library**; **Cypress** con video y capturas; **axe** y **Lighthouse** en los flujos existentes.
- **Etapas 6 y 7:** imágenes `sce-portal` y `sce-api` firmadas y registradas; despliegue automático a pruebas al fusionar en `develop`, en Actions con base efímera y humo.
- **Cierre de fase 1** (Tabla 23: catálogos y autenticación de los seis roles): `v0.1.0`, con **manual v2.1 emitido**. Demostración por rol en ambiente de pruebas.

**Casos:** interfaz Next-Nest (Tabla 44), CF-ROL-01, CS-SEG-04. **AU:** 07, 09, 12, 32, 39, 41, 42.

### Batch 4 — Fase 2a: Expediente único (RF-001, RNF-DAT-001)
**Fuente:** 13.6, 18, 19, Tablas 19, 29 y 43; Fig. 3.

- Dominio `Alumno` (`cambiarFacultad`, `avanceCarrera`) y `Historial`.
- API: alta, consulta, cambio de plantel sobre el mismo registro y estatus, incluido **egreso**. Bitácora con valor anterior.
- **Portales:** control escolar (búsqueda, alta, expediente, cambio de plantel) y alumno (mi expediente).
- Visibilidad por rol y minimización de datos. **Procedimiento de respuesta a incidentes** (Tabla 38).
- Seed sintético ampliado. **Great Expectations** en CI con las consultas CD-DAT existentes (AU-22).

**Casos:** CF-EXP-01 (Jest y Supertest); CS-SEG-03 (ZAP y Supertest); CS-SEG-02 sobre historial (Supertest); CS-SEG-06 en plantel (SQL); CD-DAT-01 y 04; CF-ROL-01. **AU:** 16, 18, 19, 21, 22. **Riesgos:** RK-01, RK-09.

### Batch 5 — Fase 2b: Inscripción (RF-002, RNF-USU-001)
**Fuente:** 13.4, 13.5, Tablas 43 y 45; Fig. 4 y 6. **Al inicio:** AMFE de inscripción (Tabla 37).

- **Fig. 4 tal cual:** `POST /inscripciones`; orden fijo por servicios (prerrequisitos en académico, adeudos en pagos, choques en académico); rechazo 409 con motivo y bitácora; transacción con reserva de cupo y `UPDATE … ocupacion + 1`; cupo agotado revierte y termina rechazada; confirmación 201 con folio y comprobante.
- **Fig. 6:** Borrador → EnValidacion → rechazo → Borrador; Confirmada ↔ Ajustada dentro del plazo; Cerrada. Los cuatro estados de rechazo de la figura se representan con `estado` + `motivo_rechazo` (Fig. 3). `Inscripcion.validar*` y `confirmar` en dominio.
- `Horario.traslapaCon` y `Grupo.hayCupo` nacen aquí, porque inscripción los usa.
- `tieneAdeudo` lee `cuenta_alumno`; los cargos reales llegan en el Batch 9 y el seed cubre los casos.
- **Oferta mínima** en API (grupos y horarios); su interfaz es del Batch 7. Queda en la lista de contradicciones.
- **Portal del alumno:** oferta, armado de carga, **aviso de choque antes de confirmar**, estado con mensaje y corrección por motivo, comprobante. Control escolar según D-14.

**Casos:** CF-INS-01 y 02 (Cypress), incluido cupo; CF-HOR-01 (Jest); CI-API-01 (Supertest y Testcontainers); CD-DAT-05; CS-SEG-03; CF-ROL-01; tablas de decisión y valores límite (Tabla 40). **AU:** 08, 16, 25. **Riesgo:** RK-05.

### Batch 6 — Staging y cierre de fase 2
**Prerrequisito de FJMP:** proveedor de infraestructura (sección 8). Resuelto el 10 de noviembre de 2026 con CC-018: staging efímero en GitHub Actions, sin costo.
**Fuente:** 3.5, 13.7, 20, 31, Tablas 23, 30, 38 y 60. **Por qué aquí:** AU-08, AU-17 y AU-19 son exigibles desde la fase 2 y piden staging; además, Mercado Pago necesita una URL pública para el webhook en el Batch 9.

- **Staging:** mismo tag candidato, datos sintéticos o anonimizados, HTTPS con TLS 1.2+, secretos propios por ambiente, acceso a la base restringido, migraciones con registro, registro de despliegues.
- **Etapa 8:** despliegue manual con etiqueta SemVer (`v0.2.0-rc.N`), acta de promoción y aprobación de PO y QA.
- Activar **pgAudit y SCRAM** en staging, o retirar CC-005, porque hoy se declara "Activo" y compose no lo activa.
- Escaneo TLS; verificar que no haya matrículas reales; ZAP contra staging; lista de humo del Anexo D.
- **Cierre de fase 2:** acta, `v0.2.0`, **auditoría interna de la Tabla 60** con auditor independiente, revisión programada del manual (Tabla 1).

**AU:** 07, 08, 12, 13, 17, 19, 20, 33, 38. **Riesgos:** RK-04, RK-09.

### Batch 7 — Fase 3a: Oferta y horarios (RF-003)
**Fuente:** 3.4, Tablas 4 y 29; Fig. 3 y 7. **Requiere:** acta de fase 2 firmada.

- Dominio `Periodo` (`abrir`, `cerrar`). Traslape de aula y profesor (D-13).
- **Coordinación:** abrir periodo, definir grupos, profesores, aulas y horarios, **publicar oferta**.
- **Consulta diferenciada por rol** (Tabla 4).

**Casos:** CF-HOR-01 (Cypress); CS-SEG-03; CF-ROL-01. **AU:** 25. **Riesgo:** RK-05.

### Batch 8 — Fase 3b: Calificaciones, cierre e historial (RF-004, RF-005)
**Fuente:** 6.3, 8.3, Tablas 16, 39 y 45; Fig. 1, 3 y 7.

- Captura por parcial solo en grupos asignados y en ventana de captura; bitácora con valor anterior; consulta inmediata.
- **Cierre por coordinación:** `Historial.recalcular()` con una sola función de redondeo.
- Corrección posterior al cierre con autorizador y evidencia (6.2-6; Parte B).
- Kardex y **exportación tabular del historial**.
- **Portales:** profesor (grupos y captura), alumno (calificaciones y avance), coordinación (cierre).
- **Cierre de fase 3:** acta y `v0.3.0`.

**Casos:** CF-CAL-01 (Cypress); CI-CAL-01 (Supertest); CD-DAT-02 (30 expedientes); CS-SEG-01 y 02 (Supertest); CS-SEG-06 en calificación; CF-ROL-01; valores límite. **AU:** 07, 16, 23, 26, 39.

### Batch 9 — Fase 4a: Pagos (RF-006)
**Prerrequisito de FJMP:** credenciales sandbox de Mercado Pago. **Requiere:** acta de fase 3 firmada.
**Fuente:** 13.4, 19, 23, Tablas 4, 15, 55 y 56; Fig. 5 y 7. **Al inicio:** AMFE de pagos.

- **Fig. 5 tal cual:** `GET /cuenta/{matricula}`, `POST /pagos/intento`, preferencia y checkout, `POST /webhooks/pagos` con verificación de firma; firma inválida 401 con bitácora; duplicado 200 sin efecto con bitácora; primer evento en transacción con `Pago.aplicarUnaVez()`, un movimiento, saldo y bitácora; aviso a la interfaz.
- Fallo de pasarela: pendiente, nunca confirmado; reintentos controlados. **Sin almacenar datos de tarjeta.**
- **Caja:** generar cargos del periodo, becas, corte y **conciliación diaria**. Caja no toca el historial.
- **Recibos** y referencias.
- **Portales:** alumno (estado de cuenta, pago, recibo) y caja.
- **Pasarela sustituta solo en local, en pruebas automáticas y en carga** (PA-SCE-001 excluye el estrés contra terceros). CI-PAG-01 corre contra el sandbox real, con webhook en staging. El simulador no se habilita para usuarios en staging ni en piloto.

**Casos:** CF-PAG-01 (Newman y Cypress); CI-PAG-01 (Newman); CD-DAT-03 y 06; CS-SEG-02, 03 y 06 (pago); CF-ROL-01; basadas en riesgo y valores límite. **AU:** 16, 24, 38. **Riesgos:** RK-02, RK-08.

### Batch 10 — Fase 4b: Trámites y documentos (RF-007, RF-010)
**Fuente:** 13.5, 23, Tablas 16 y 44; Fig. 6 y 7.

- **Fig. 6 tal cual:** Recibida → EnProceso → Rechazada (motivo visible) o Lista (folio y hash) → Entregada cuando el solicitante descarga.
- Constancia, no adeudo e historial. No hay constancia sin historial. Los trámites no alteran calificaciones.
- Contenido emitido inmutable con hash SHA-256. **Verificación de folio con sesión de control escolar;** la versión pública solo con CC Mayor aprobado.
- **Portales:** alumno (solicitar, estado con marca de tiempo, descargar) y control escolar (cola, revisar, emitir, rechazar con motivo).

**Casos:** CF-TRA-01 y 02 (Cypress); CS-SEG-06 en constancia y completo (SQL); CS-SEG-03; CF-ROL-01; transición de estados. **AU:** 16, 27.

### Batch 11 — Reportes, métricas y cierre de fase 4 (RF-009, RNF-FLE-001)
**Fuente:** 7.2, Tablas 16, 28, 59 y 60; Fig. 7.

- `ReportesService`: agregados de inscripción, avance y cobranza por facultad o universidad. Solo lectura.
- Portal de dirección. **Sin acceso a la bitácora.**
- Tablero de indicadores con los puntos de historia e inventario de reglas de B0.
- Preparar la prueba de segunda facultad; se ejecuta en staging en el Batch 13.
- **Cierre de fase 4:** acta, `v0.4.0`, **auditoría interna de la Tabla 60** con auditor independiente.

**Casos:** CF-REP-01 (Supertest), CF-ROL-01. **AU:** 07, 28, 39. La matriz del repo pasa RF-009 a fase 4, por AU-28.

### Batch 12 — Calidad transversal completa
**Fuente:** 8, 18, 19, 21, 25, 27, 28; Tablas 37, 50 y 63; PA-SCE-001 Parte B.

- **Playwright:** matriz de la Tabla 50 en Chromium, Firefox y WebKit, con las tres resoluciones.
- **Accesibilidad:** axe y Lighthouse en todos los flujos Must; teclado; NVDA (requiere Windows).
- **Great Expectations** con CD-DAT-01 a 06. Pirámide 70/20/10 verificada (Tabla 40).
- **ZAP** completo con reporte; CS-SEG-03, 05 y 08. STRIDE y AMFE actualizados.
- Anexo A (Tabla 63), matrices 25010 y 25012, y **tabla de subcaracterísticas de prioridad Alta cubiertas por aceptación** (8.4).
- **Parte B, como observaciones:** aviso de privacidad, consentimiento y ARCO, inventario de datos, documento de seguridad, notificación de vulneraciones, retención del expediente; requisito y casos de accesibilidad y compatibilidad; riesgos de privacidad y autenticación.

**AU:** 18, 20, 32, 37, 40, 42.

### Batch 13 — Candidato a release: ambiente piloto, continuidad, monitoreo y rendimiento
**Fuente:** 20, 24, 26, 34, 35, 36, 39; Tablas 46, 47, 48, 55, 56, 57 y 62; Fig. 9.

- `release/1.0.0` y etiquetas `v1.0.0-rc.N`; acta de promoción.
- **Piloto (Fig. 9):** servidores de aplicación y base separados, nginx con TLS 1.2+, PostgreSQL con TLS, secretos propios, `sce-portal` y `sce-api`.
- **Continuidad:** `pg_dump` diario cifrado, retención, restauración cronometrada con `pg_restore` (RPO < 24 h, RTO < 4 h), rollback ensayado, contingencia de pasarela, acta. **Parte B:** cifrado en reposo y claves, respaldo fuera del sitio, contingencia de ventanilla.
- **Monitoreo:** Prometheus y Grafana, monitor externo, alertas a DevOps y al PO, percentil 95, errores 5xx y de negocio, pgBadger.
- **Seguridad operativa:** revisión periódica de accesos, acceso directo a la base, retención de bitácora, muestreo de bitácora por consulta SQL versionada a cargo de Seguridad.
- **Rendimiento en staging,** con registro de herramienta, perfil, fecha, etiqueta y percentiles; pasarela sustituida:

| Caso | Tipo | Herramienta y escenario | Meta |
|---|---|---|---|
| CR-REN-01 | Carga | JMeter, 300 usuarios, 15 min; perfil de lectura intensiva | p95 ≤ 3 s inscripción y pago; ≤ 2 s consultas; 5xx < 1 %; CPU < 80 %; pool bajo el límite |
| CR-REN-02 | Concurrencia | k6, 300 usuarios; 100 alumnos por 5 lugares | Sin pérdida ni duplicación; enviadas vs. persistidas |
| CR-REN-03 | Estrés | JMeter, hasta 800 usuarios | Punto de quiebre y forma de degradar |
| CR-REN-04 | Pico | JMeter, de 50 a 400 en un minuto | Reacción ante la subida |
| CR-REN-05 | Resistencia | JMeter, carga media 4 h | Sin fugas ni degradación |

  Además: k6 con umbrales en el pipeline (Tabla 48) y Lighthouse de rendimiento percibido.

- **CO-FLE-01:** alta de segunda facultad en staging sin migración estructural.
- **Usabilidad en staging, antes de promover:** guiones de alumno, profesor, control escolar y caja (Anexo G); cinco participantes por rol; hojas de observación; grabación con consentimiento; SUS ≥ 70; hallazgos clasificados; inducción breve.
- Inventario de ambientes, fichas (Tabla 55), retención (Tabla 62).
- **Auditoría interna "Antes del piloto"** (Tabla 60) con auditor independiente.

**Casos:** CR-REN-01 a 05, CO-FIA-01, CO-FIA-02, CO-FLE-01, CS-SEG-03. **AU:** 12, 17, 31, 32, 33, 34, 35, 38. **Riesgos:** RK-04, RK-08.

### Batch 14 — Fase 5: Piloto
**Fuente:** 3.5, 7, 8.4, 20.1, 36, 37, 38, 39; Tabla 60. **Requiere:** acta de fase 4, las seis puertas de 20.1 y los siete criterios de 36.1.

- `v1.0.0`, acta de liberación, credenciales de piloto distintas de sandbox.
- Plan de evaluación del piloto; prohibición de controles paralelos (Tabla 10).
- **Rendimiento en el servidor del piloto,** tras la puerta de promoción (24.2).
- **Operación recurrente durante un semestre:** CD-DAT-03 diario, CD-DAT-05 semanal en inscripción, CD-DAT-06 continuo, CD-DAT-02 por periodo; restauración por periodo; ventanas de mantenimiento con 48 h; emergencias documentadas en 24 h; causa raíz de incidentes recurrentes; disponibilidad mensual (CO-FIA-01).
- Informe de cierre, **auditoría de cierre del semestre** (Tabla 60), dictamen ISO/IEC 25040.

**AU:** 31 a 35, 39, 40. **Nota:** esto no termina con un PR; depende de una facultad real y un semestre completo.

### Trabajo paralelo A — Manual v2.1 (compromiso NC-004: 27 de noviembre de 2026)
Issues #7 a #15, lista de contradicciones de B0 y cambios D-1 a D-4: Tablas 2, 5, 7, 27, 29, 38 y 42; Figuras 1, 2, 3, 4, 8 y 9; secciones 8.4 y 40.1; RTO en RNF-FIA-002; ediciones de normas (NMX-I-059-NYCE y norma estatal). El `.docx` fuente es `Manual_de_Calidad.docx` (63 tablas y 10 figuras, del 16 de septiembre de 2026); `Documento de calidad (1).docx` es de otro equipo y no se usa. Lleva registro de aprobación.

### Trabajo paralelo B — Auditoría PA-SCE-001 (fechas de su sección 7)

| Fecha | Compromiso | Responsable |
|---|---|---|
| 6 nov | Recibir informe preliminar; pasar hallazgos al registro de NC (39.1, 40) | FJMP |
| 7 nov | Réplica: aclaraciones, descargo y tratamiento propuesto | FJMP, revisa SJOM |
| 8 nov | Reunión de cierre (acta F-02) | Ambos |
| 9 nov | Plan de acciones correctivas | FJMP, acepta SJOM |
| 10 nov | Seguimiento documental y cierre del expediente | Ambos con el auditor |

El equipo ya pidió aclarar qué fechas rigen, porque las secciones 7 y 12 del plan de auditoría no coinciden.

---

## 7. Cobertura

### 7.1 Requisitos (20 de 20)

| Requisito | Batch | Requisito | Batch |
|---|---|---|---|
| RF-001 | 4 | RNF-REN-001 y 002 | 13 y 14 |
| RF-002 | 5 | RNF-FIA-001 y 002 | 13 y 14 |
| RF-003 | 5 y 7 | RNF-SEG-001 | 2, 4–10 |
| RF-004 | 8 | RNF-SEG-002 | 2, 4, 12 |
| RF-005 | 8 y 14 | RNF-DAT-001 | 1, 4, 8, 12, 14 |
| RF-006 | 9 | RNF-USU-001 | 5 |
| RF-007 y RF-010 | 10 | RNF-MAN-001 | 1 y cada módulo |
| RF-008 | 2, 3 y cada módulo | RNF-FLE-001 | 11 y 13 |
| RF-009 | 11 | | |

### 7.2 Casos de prueba, con la herramienta del manual

| Caso | Batch | Herramienta | Caso | Batch | Herramienta |
|---|---|---|---|---|---|
| CF-EXP-01 | 4 | Jest, Supertest | CS-SEG-01 | 8 | Supertest |
| CF-INS-01, 02 | 5 | Cypress | CS-SEG-02 | 4, 8, 9 | Supertest |
| CF-HOR-01 | 5, 7 | Jest, Cypress | CS-SEG-03 | 4 y siguientes | ZAP, Supertest |
| CF-CAL-01 | 8 | Cypress | CS-SEG-04 | 2 y siguientes | Newman |
| CF-PAG-01 | 9 | Newman, Cypress | CS-SEG-05 | 2, 12 | ZAP |
| CF-TRA-01, 02 | 10 | Cypress | CS-SEG-06 | 4, 8, 9, 10 | SQL |
| CF-ROL-01 | 2 y siguientes | Supertest | CS-SEG-07 | 2 | Supertest |
| CF-REP-01 | 11 | Supertest | CS-SEG-08 | 1, 2, 12 | Gitleaks, revisión manual |
| CI-API-01 | 5 | Supertest, Testcontainers | CD-DAT-01, 04 | 1 | SQL, Great Expectations |
| CI-PAG-01 | 9 | Newman | CD-DAT-02 | 8, 14 | SQL, Great Expectations |
| CI-CAL-01 | 8 | Supertest | CD-DAT-03, 06 | 9, 14 | SQL, Great Expectations |
| CI-AUTH-01 | 2 | Supertest | CD-DAT-05 | 5, 14 | SQL, Great Expectations |
| CI-MIG-01 | 1 | Prisma, Testcontainers | CR-REN-01 a 05 | 13 | JMeter, k6 |

Los casos `CO-*` son propuestos por el repo y se aprueban en la nueva versión del manual: CO-FIA-01 y 02 (13, 14), CO-MAN-01 (1), CO-FLE-01 (13).

### 7.3 Criterios de auditoría AU-01 a AU-43

| AU | Batch | AU | Batch | AU | Batch |
|---|---|---|---|---|---|
| 01 | 0, A | 16 | 2, 4, 5, 8, 9, 10 | 31 | 13, 14 |
| 02 | 0, A | 17 | 6, 13 | 32 | 3, 12, 13 |
| 03 | 0, A | 18 | 4, 12 | 33 | 6, 13, 14 |
| 04 | 0 | 19 | 4, 6 | 34 | 13, 14 |
| 05 | 0 y cada batch | 20 | 1, 2, 6, 12 | 35 | 13, 14 |
| 06 | 0 y cada batch | 21 | 1, 4 | 36 | 0, regla 3, 14 |
| 07 | 0 y cada cierre | 22 | 4 | 37 | 0, cierres, 12 |
| 08 | 0, 2, 5, 6 | 23 | 8 | 38 | 0, 6, 9, 13 |
| 09 | 0, 1, cierres | 24 | 9 | 39 | 3, cierres, 11, 14 |
| 10 | 1, 2 | 25 | 5, 7 | 40 | 0, 12, 14 |
| 11 | 0, 1 | 26 | 8 | 41 | 0, regla 10, 3 |
| 12 | 1, 3, 6 | 27 | 10 | 42 | 0, 12 |
| 13 | 1, 6 | 28 | 11 | 43 | 0, regla 9 |
| 14 | 2 | 29 | 0, 1 | | |
| 15 | 2 y siguientes | 30 | 1 | | |

### 7.4 Secciones del manual

| Sección | Batch | Sección | Batch |
|---|---|---|---|
| 1 | 0, A | 22 | 2, 4–11 |
| 2, 3, 6 | 0 y regla 10 | 23 | 1, 2, 5, 8, 9, 10 |
| 4 | A | 24 | 13, 14 |
| 5 | 0 | 25 | 2, 4, 8, 9, 10, 12 |
| 7, 38 | 3, cierres, 11, 14 | 26 | 13 |
| 8, 9 | 0, 12 | 27, 28 | 3, 12 |
| 10 | 0 y cierres | 29 | 0, 1 |
| 11 | 0 y regla 9 | 30 | 0, regla 3, 14 |
| 12, 13, 16 | 0 y cada batch | 31 | 1, 3, 6 |
| 14 | 1, 2 | 32 | 0 y cierres |
| 15 | 0, 1 y cierres | 33 | 0, 6, 9, 13 |
| 17 | 0, cierres, 5, 9, 12, 13 | 34, 35 | 3, 13, 14 |
| 18 | 2, 4, 6, 12, 13 | 36, 37 | 13, 14 |
| 19 | 1, 4, 5, 8, 9, 12, 14 | 39 | 6, 11, 13, 14, B |
| 20 | 3, 6, 13 | 40 | 0, A, B |
| 21 | 0, 1, 3 | 41, 42, 43 | 0, regla 9, 12, 13 |

---

## 8. Lo que depende de personas o de terceros

| Qué | Quién | Bloquea |
|---|---|---|
| **Aceptar la invitación al repositorio** | SJOM | Todas las aprobaciones y fusiones |
| Firmar el acta de fase 0 **ya con su adenda** y el registro de aprobación del manual v2.0; aprobar PR #30; revisar PR #29 | SJOM | Compromisos ante Rodolfo (NC-001, 002, 003) |
| Aprobar CC-001 a CC-006 y los nuevos, con fecha y responsable | SJOM | Fusión de cambios Mayor |
| Aprobar cada PR, ejecutar QA y firmar actas | SJOM | Cada batch y cada fase |
| Ratificar D-5 a D-14 con reglas reales de la UAEM | PO | Batches 3, 5, 7, 8 y 9 |
| **Acta de levantamiento** con control escolar, coordinación y caja. No se puede redactar sin que esas entrevistas ocurran | Ambos | Conformidad de fase 0 (NC-006) |
| **Auditor interno independiente** para los cuatro momentos de la Tabla 60 (no desarrolla ni opera) | Profesora o equipo auditor | Batches 6, 11, 13 y 14 |
| ~~Proveedor de staging y su costo~~: resuelto con CC-018, staging efímero en GitHub Actions sin costo | FJMP | Batch 6 |
| Cuenta y credenciales sandbox de Mercado Pago | FJMP | Batch 9 |
| Revisión con NVDA en un equipo Windows | Ambos | Batch 12 |
| Cinco participantes por rol para SUS | Ambos | Batch 13 |
| Infraestructura de piloto, facultad piloto, Dirección y convenio con Mercado Pago | Institución | Batch 14 |

---

## 9. Verificación

**Por batch:** pruebas, lint, tipos, build y pipeline completo en CI; casos del batch; demostración por rol en el **ambiente de pruebas** (Tabla 22), además de la revisión local con compose; capturas revisadas en las tres resoluciones cuando haya interfaz.

**Comprobaciones de letra, en cada PR:**
- Contrastar rutas, estados, orden y roles contra la figura del flujo.
- Revisar que cada caso use el ID y la herramienta de la sección 7.2.
- Muestreo de bitácora con consulta SQL y repetición de la matriz rol × endpoint.
- `npm audit`, Trivy, Gitleaks y puerta de calidad en verde.

**Antes de cerrar una fase:** un revisor independiente contrasta el batch contra el manual, sin ver el razonamiento del autor, y se comprueban los criterios AU de esa fase con la tabla de exigibilidad de PA-SCE-001 sec. 3.3.
