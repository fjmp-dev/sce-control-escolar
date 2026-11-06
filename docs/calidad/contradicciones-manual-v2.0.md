# Contradicciones y vacíos del manual SCE-MC-001 v2.0

**Propósito:** lista de trabajo para la siguiente versión del manual (issue #15) y evidencia para el criterio AU-02 de PA-SCE-001.
**Fecha:** 5 de noviembre de 2026.

Una contradicción no se resuelve en silencio: mientras el manual no se corrija, aplica la "Decisión vigente", registrada en su solicitud de cambio o en `docs/gobierno/plan-de-sistema.md`.

---

## 1. Contradicciones internas

| ID | Dónde | Contradicción | Decisión vigente | Destino |
|---|---|---|---|---|
| X-01 | Tabla 24 y sección 3.4 frente a Tablas 23, 25 y 27 | La Tabla 24 y la sección 3.4 ordenan: catálogos y expediente, trámites, pagos y horarios. Las fases ponen académico (horarios y calificaciones) antes de pagos y trámites | Orden por fases (D-4). Coincide con PA-SCE-001 sec. 3.3 y Tabla 60 | Manual |
| X-02 | Sección 7.2 frente a Tabla 52 | Defecto crítico: 7.2 dice "permite alterar una calificación sin autorización"; la Tabla 52 dice "permite acceso indebido" | Se usa la unión de ambas definiciones | Manual. AU-02 lo revisa expresamente |
| X-03 | Sección 13 frente a figuras | La evidencia auditable habla de "nueve diagramas" y hay diez figuras | Son diez | Manual |
| X-04 | RNF-USU-001, CF-INS-02, Fig. 3 y Fig. 4 frente a Fig. 6 | Tres motivos de rechazo (adeudo, prerrequisito, choque) frente a cuatro (también cupo) | Cuatro motivos; CF-INS-02 prueba también cupo | Manual |
| X-05 | Fig. 4 frente a RF-002, Fig. 6 y Tabla 59 | Al rechazar, la Fig. 4 solo escribe bitácora; RF-002 y la Fig. 6 piden estado explícito, y la tasa de conclusión necesita contar lo iniciado | Se persiste el estado (CC-013) | Fig. 4 |
| X-06 | Fig. 3 frente a Fig. 4 | La Fig. 3 pone `validarPrerrequisitos`, `validarAdeudos` y `validarChoques` en Inscripción; la Fig. 4 los pone en los dominios académico y de pagos | Los servicios de cada dominio obtienen los datos; la clase `Inscripcion` decide sobre ellos | Manual |
| X-07 | Fig. 2 frente a Fig. 4 | La Fig. 2 dibuja a académico y pagos dependiendo de expediente; la Fig. 4 muestra a expediente llamándolos | Se actualiza la Fig. 2 (CC-014) | Fig. 2 |
| X-08 | Fig. 5 frente a Tabla 31 | `GET /cuenta/{matricula}` en singular; la Tabla 31 pide sustantivos en plural | Mandan las rutas de la figura; en lo demás, plural | Manual |
| X-09 | Fig. 7 frente a Fig. 1 | El cierre del periodo está en la calle "Sistema" en la Fig. 7, y en Coordinación académica en la Fig. 1 | Coordinación lo ejecuta; el sistema recalcula | Fig. 7 |
| X-10 | Fig. 8 frente a Tabla 29 | Índice único parcial sobre matrícula frente a matrícula como clave primaria | Clave primaria (CC-004). Se corrige la nota de la Fig. 8 | Fig. 8 |
| X-11 | Tabla 46 frente a Tabla 47 | Carga de 300 usuarios durante 15 minutos frente a durante la primera hora | 15 minutos para la meta; la primera hora se describe como escenario | Manual |
| X-12 | RF-009 frente a Tabla 5 | Reportes "de la facultad" frente a "de su facultad o de la universidad" | Filtro por facultad o universidad | Manual |
| X-13 | Tabla 30 frente a secciones 3.5 y 20.2 | Staging con "datos anonimizados" frente a "sintéticos o anonimizados". Antes del piloto no hay datos reales que anonimizar | Sintéticos o anonimizados | Manual |
| X-14 | Tabla 25 frente a RF-002 | La fase 2 incluye inscripción, que verifica choques y necesita oferta; la oferta es de la fase 3 | Oferta mínima en API en la fase 2; interfaz en la fase 3 | Manual |
| X-15 | Tabla 53 frente a Tablas 30, 42 y 48 | Newman, Cypress, ZAP y k6 están en el pipeline según unas tablas y no aparecen en las etapas de la Tabla 53 | Se les asigna etapa en el Batch 1 | Manual |
| X-16 | Tablas 11 y 12 frente a RF-008 y Fig. 1 | El Administrador del sistema hace altas de usuarios y catálogos, pero no es uno de los seis roles de uso ni tiene caso de uso | Rol técnico `administrador` (D-2, CC-007) | Manual y Fig. 1 |
| X-17 | Fig. 3 frente a Tabla 29 | Usuario y Rol con multiplicidad `1` a `1..*` en la Fig. 3 frente a relación muchos a muchos en la Tabla 29 | Muchos a muchos | Fig. 3 |
| X-18 | CF-TRA-01 frente a Fig. 6 | Cuatro estados en el caso (recibida, en proceso, lista, rechazada) frente a cinco en la figura (también entregada) | Cinco estados | Manual |
| X-19 | Tabla 7 frente a soporte vigente | React 18, Next.js 14 y Node 20; Node 20 perdió soporte el 30 de abril de 2026 y 14.5 pide cero vulnerabilidades altas | Versiones con soporte (D-1, CC-006) | Tablas 7 y 42 |

---

## 2. Datos que el manual no define

Están en `docs/calidad/reglas-de-negocio.md`, sección 1 (D-5 a D-14).

---

## 3. Casos sin identificador en el manual

| ID | Dónde | Vacío | Decisión vigente |
|---|---|---|---|
| X-20 | Tabla 20 frente a Tabla 31 | RNF-FIA-001, RNF-FIA-002, RNF-MAN-001 y RNF-FLE-001 tienen criterio de verificación, pero no caso. La Tabla 31 no prevé el prefijo `CO` que usa el repositorio | Casos `CO-*` propuestos | 
| X-21 | Anexo A frente a Tabla 47 | El Anexo A nombra CR-REN-01 a 05 y la Tabla 47 define cinco tipos, sin correspondencia | Correspondencia propuesta en `matriz-trazabilidad.md`, sección 3.5 (#8) |

---

## 4. Ya registradas en issues

| Issue | Tema |
|---|---|
| #7 | Alcances de CS-SEG en Tablas 20 y 27 y en el Anexo A. La definición de cada caso es la de la Tabla 49 |
| #8 | Casos CR-REN-02 a 05 |
| #9 | Escalas de dictamen de las secciones 8.4 y 40.1 |
| #10 | Entidad `periodo` en la Tabla 29 |
| #11 | Tabla 27 con 10 de 20 requisitos |
| #12 | RTO en RNF-FIA-002 |
| #13 | Puerta de rendimiento en 20.1 frente a 24.2 |
| #14 | Ediciones de NMX-I-059-NYCE y normativa estatal de datos personales |
