# Auditoría interna de cierre de fase 2 — Autoauditoría por reejecución

**Fuente:** SCE-MC-001 v2.0, sección 39 (Tabla 60) y Anexo F; ISO 19011:2018. Exigibilidad de criterios: PA-SCE-001, apartado 3.
**Fecha:** 10 de noviembre de 2026 (sub-batch 11.3). **Evidencia:** `auditoria-fase-2-evidencia.md`, preparado el 8 de noviembre.

> **Se hace tarde y no es independiente (NC-013).** La Tabla 60 la pide al cierre de la fase 2, con un auditor que no desarrolle ni opere el producto. No hubo auditor. El manual v3.0 (Tabla 60) dice que se hace igual, como autoauditoría, en 11.3. La hace FJMP, que construyó la fase, con un asistente de IA que es coautor. No cierra NC-013.
>
> **Se audita `d4cce7d`, no `v0.2.0`.** La etiqueta `v0.2.0` es retroactiva y se crea en 11.4 (NC-015). La evidencia de la fase son las corridas de sus PR; la reejecución de hoy es sobre `develop`, que ya incluye las fases 3 y 4.

## 1. Programa

| Momento | Alcance | Criterios | Batch | Auditor | Fecha real |
|---|---|---|---|---|---|
| Cierre de fase 2 | Expediente e inscripción | SCE-MC-001 vigente, RF-001, RF-002 y RNF-DAT-001 | Debió ser al cierre del Batch 6; se hace en 11.3 | FJMP, autoauditoría (NC-013) | 10 de noviembre de 2026 |

## 2. Plan previo

- **Objetivo y alcance:** verificar que el expediente y la inscripción cumplen el manual, con la evidencia de la fase y su reejecución.
- **Criterios:**
  - Tabla 60: SCE-MC-001 vigente, RF-001, RF-002 y RNF-DAT-001.
  - PA-SCE-001, apartado 3: AU-08, AU-17, AU-18, AU-19, AU-21, AU-22 y AU-25, exigibles desde la fase 2.
  - Los criterios de fases anteriores que tocan este alcance: AU-04, 06, 07, 09, 11, 30, 36, 37, 39 y 40.
- **Auditor y declaración de imparcialidad:** FJMP. **No es imparcial:** audita su propio trabajo (NC-012 y NC-013). El asistente de IA tampoco es independiente.
- **Fechas y duración:** 10 de noviembre de 2026, junto con la de la fase 4.
- **Métodos:** revisión documental, inspección técnica y reejecución. No hay entrevista ni observación: AU-18 y AU-25 las piden, y no hay a quién entrevistar ni usuarios que observar.
- **Muestra:**
  - Evidencia de la fase: PR #59, #60 y #61, con sus corridas 42443090034, 42533743035 y 42899026804, las tres en verde.
  - Reejecución local del 10 de noviembre sobre `d4cce7d`, con base efímera: CD-DAT-01, 04 y 05, ocupación de grupos, CS-SEG-06 en plantel y `sin-datos-reales.sql`.
  - Suites `expediente.spec.ts`, `inscripcion.spec.ts` y `datos.spec.ts`, dentro de las 560 pruebas de integración.
  - Corrida 42966111975 sobre `d4cce7d`: Cypress, Great Expectations y staging efímero.

## 3. Lista de verificación

Resultados con la escala de PA-SCE-001. "Local" es la reejecución del 10 de noviembre sobre `d4cce7d` (`informe-fase-4.md`, apartado 5).

| Criterio | Pregunta o verificación | Evidencia esperada | Resultado | Evidencia encontrada |
|---|---|---|---|---|
| RF-001 y AU-21 | ¿Hay un solo expediente por matrícula? ¿Lo impide el esquema? | CD-DAT-01; restricción de unicidad | Conforme | Local: `cd-dat-01.sql`, 0 filas. `matricula` es la clave primaria de `alumno` (`api/prisma/schema.prisma`). CF-EXP-01 en `expediente.spec.ts` (local) y `expediente.cy.ts`, 2 de 2 (corrida 42966111975). La muestra es el 100 % de una tabla sintética |
| RF-002 y AU-25 | ¿La inscripción rechaza por adeudo, prerrequisito, choque y cupo, con estado explícito? | CF-INS-01 y 02, CF-HOR-01, tabla de decisión | Conforme | `inscripcion.spec.ts` (local); Jest con las ocho combinaciones del orden de la Fig. 4; `inscripcion.cy.ts`, 3 de 3, con los cuatro motivos (corrida 42966111975). Corrida de la fase: 42533743035 (#60). Sin observación de usuarios |
| RNF-DAT-001 y AU-22 | ¿Cero huérfanos e inscripciones incompletas? | CD-DAT-04 y 05; Great Expectations | Conforme | Local: `cd-dat-04.sql`, `cd-dat-05.sql` y `ocupacion-de-grupos.sql`, 0 filas. Great Expectations: 22 de 22 (corrida 42966111975). `datos.spec.ts` comprueba que cada consulta detecta el dato alterado |
| AU-08 | ¿Los modelos coinciden con el código y con el esquema desplegado? | Figuras, esquema Prisma, base de staging | Conforme | Las 21 tablas de la Fig. 8 son las 21 de la base migrada (local). Staging aplica las 5 migraciones (corrida 42966111975). Figuras de CC-013, CC-016 y CC-017 actualizadas (`registro-de-cambios.md`). NC-014 es de pagos, fuera de este alcance |
| AU-17 | ¿HTTPS con TLS 1.2 o superior? ¿Acceso a la base restringido? ¿Respaldo cifrado? | Escaneo TLS, configuración de la base | Conforme en staging, con observación OB-01 | testssl en staging: solo TLS 1.2 y 1.3. Base: `sin_tls=0`, `sin_scram=0`; rechaza otra dirección, conexión sin TLS, TLS 1.1 y superusuario por red (corrida 42966111975, artefacto de staging). Respaldo antes de cada despliegue sin cifrar (OB-01) |
| AU-18 | ¿Visibilidad por rol, respuesta a incidentes y tratamiento conforme a la ley? | Respuestas de la API por rol | Conforme en visibilidad, con observación OB-02 | CF-ROL-01 en `roles.spec.ts` (local); CS-SEG-03: el alumno solo llega a `/alumnos/actual` y un folio ajeno responde 404. `respuesta-a-incidentes.md` existe. Aviso de privacidad, ARCO e inventario: 12.6 (OB-02) |
| AU-19 | ¿Staging y pruebas solo con datos sintéticos? | Muestra de tablas de staging | Conforme | `sin-datos-reales.sql`: 0 filas en local y en staging (corrida 42966111975) |
| SCE-MC-001 vigente | ¿Se hizo la revisión programada del manual al cierre de la fase 2 (Tabla 1)? | Manual revisado y aprobado | Conforme con reservas, con observación OB-03 | `manual-v3.0.md`, del 10 de noviembre: revisión mayor con contradicciones y cambios. Se hizo tarde y no está firmada (su apartado 9) |
| AU-04 y AU-11 | ¿Revisó y aprobó cada PR alguien distinto del autor? | Historial de PR | NC mayor, ya registrada | #59, #60 y #61 fusionados el 10 de noviembre con 0 revisiones (`gh pr list`). NC-001 y NC-012 |
| AU-06 | ¿Se aprobaron los cambios antes de fusionar? | Registro de cambios | NC mayor, ya registrada | CC-013 (Mayor), CC-016, CC-017 y CC-018, aprobados el 10 de noviembre, después de fusionarse. NC-008 |
| AU-07 | ¿Hay acta de la fase firmada antes de abrir la siguiente? | ACT-F2-001 | NC mayor, ya registrada | `acta-aceptacion-fase-2.md` sin firma; la fase 3 abrió sin ella. NC-010 |
| AU-09 | ¿Hay `release/0.2.0`, fusión a `main` y etiqueta? | Ramas y etiquetas | NC menor, ya registrada | Sin `release/0.2.0` ni `v0.2.0`; la etiqueta es retroactiva en 11.4. NC-015 |
| AU-30 | ¿Dominio con 80 % o más? ¿Reglas Must? | lcov | Conforme | Al cierre de la fase: dominio 171/171 (100 %), corrida 42533743035. Hoy: 289/289. Reglas Must: 13 de 24 en la fase; hoy 24 de 24 (`scripts/reglas-must.sh`) |
| AU-36 | ¿Los defectos tienen severidad y cierre por otra persona? | Issues `defecto` | Conforme, con observación OB-04 | Ningún defecto registrado en la fase. Seis fallos se corrigieron antes de abrir el PR y solo constan en el cuerpo del PR (`informe-fase-4.md`, apartado 3) |
| AU-37 | ¿Se hizo el AMFE de inscripción antes del código? ¿Se trataron RK-05 y RK-09? | AMFE, matriz | Conforme, con observación OB-05 | `amfe-inscripcion.md` v1.0, 8 de noviembre, al inicio del Batch 5. RK-05 mitigado en la inscripción; RK-09 se verifica en cada despliegue a staging. Sin revisión de QA (OB-05) |
| AU-39 | ¿Hay tablero de la fase con su recálculo? | `informe-fase-2.md` | NC menor, ya registrada | Tablero presente, pero la densidad no se calculó al cierre: no había puntos (NC-016). La lista de verificación de QA del informe quedó en blanco |
| AU-40 | ¿Hubo auditoría con auditor independiente al cierre? | Programa | NC mayor, ya registrada | Esta se hace tarde y sin independencia. NC-013 |

## 4. Registro de hallazgos

No hay NC nuevas: cada incumplimiento ya tiene la suya (NC-001, NC-008, NC-010, NC-012, NC-013, NC-015 y NC-016).

| ID | Tipo | Criterio | Evidencia | Descripción | NC trasladada |
|---|---|---|---|---|---|
| OB-01 | Observación | AU-17 | `inventario-de-ambientes.md`, apartado 7 | El respaldo previo al despliegue es `pg_dump` sin cifrar. Staging es efímero y con datos sintéticos; el respaldo cifrado se ensaya en el Batch 13 | — |
| OB-02 | Observación | AU-18 | `plan-de-sistema.md`, 12.6 | El tratamiento conforme a la ley (aviso, ARCO, inventario, documento de seguridad) llega en 12.6. Sin entrevista | — |
| OB-03 | Observación | SCE-MC-001 | `manual-v3.0.md` | La revisión programada al cierre de la fase 2 se hizo como v3.0 el 10 de noviembre, tarde y sin firma | — |
| OB-04 | Observación | AU-36 | `informe-fase-4.md`, apartado 3 | Los fallos encontrados antes del PR no se registraron como defecto, así que la densidad de la fase es 0 por construcción | MJ-010 |
| OB-05 | Observación | AU-37 | `amfe-inscripcion.md`, apartado 4 | El AMFE nombra a SJOM como revisor; nunca lo revisó (NC-012). Tampoco se revisó al cierre de la fase, como dice su versión. Su siguiente revisión es en el Batch 12 | — |

## 5. Dictamen y seguimiento

- **Conclusión y dictamen:** **conforme con reservas, tarde y no independiente.** La reejecución confirma RF-001, RF-002 y RNF-DAT-001: consultas en cero, suites en verde y Cypress de expediente e inscripción en verde. Los incumplimientos son de proceso (revisión, cambios, actas, ramas y auditor). Todos tienen NC abierta, aceptada con plan fechado por FJMP como Product Owner.
- **Plan de seguimiento:**

| Qué | Responsable | Fecha |
|---|---|---|
| Pedir por escrito un auditor independiente que repita esta lista (NC-013, acción 1) | FJMP | 20 de noviembre de 2026 |
| Firmar ACT-F2-001, después de ACT-F1-001 | FJMP | 20 de noviembre de 2026 (NC-010) |
| Etiquetar `v0.2.0` retroactiva y llenar la lista de QA de `informe-fase-2.md` | FJMP | 11.4 |
| OB-02: Parte B de datos personales | FJMP | 12.6 |
| OB-01: respaldo cifrado y restauración | FJMP | Batch 13 |

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Auditor (autoauditoría, NC-013) | Francisco Javier Martínez Peñas | | |
| Product Owner (desviación, NC-012) | Francisco Javier Martínez Peñas | | |
