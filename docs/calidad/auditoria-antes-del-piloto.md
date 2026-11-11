# Auditoría interna "Antes del piloto" — Autoauditoría por reejecución

**Fuente:** SCE-MC-001 v2.0, sección 39 (Tabla 60) y Anexo F; ISO 19011:2018. Exigibilidad de criterios: PA-SCE-001, apartado 3. `plan-de-sistema.md` (13.6) la llama "Antes de la liberación".
**Fecha:** 11 de noviembre de 2026 (sub-batch 13.6, #76). **Objeto:** `v1.0.0-rc.1` (`8e26059`), el commit que se etiqueta como `v1.0.0`. **Evidencia:** `auditoria-antes-del-piloto-evidencia.md`.

> **No es una auditoría independiente (NC-013).** La hace FJMP, que desarrolla y opera el producto, con un asistente de IA que es coautor. La sección 39.1 pide un auditor que no desarrolle ni opere el producto. Esta autoauditoría no cierra NC-013: deja la reejecución lista para que un auditor la repita.

## 1. Programa

| Momento | Alcance | Criterios | Batch | Auditor | Fecha real |
|---|---|---|---|---|---|
| Antes del piloto (Tabla 60) | Sistema completo y ambientes | Todas las secciones del manual, con énfasis en las puertas de promoción y los riesgos de nivel Alto | 13 (sub-batch 13.6) | FJMP, autoauditoría (NC-013) | 11 de noviembre de 2026 |

Los cierres de las fases 2 y 4 se auditaron en `auditoria-fase-2.md` y `auditoria-fase-4.md`. El cierre del semestre piloto no se realiza: no hay semestre piloto (manual v3.0, apartado 2.3). Su lista queda preparada en el Batch 14.

## 2. Plan previo

- **Objetivo y alcance:** verificar que el sistema completo y sus ambientes cumplen el manual antes de liberar `v1.0.0` al piloto de ensayo (CC-022), sobre `8e26059`.
- **Criterios:**
  - Tabla 60: todas las secciones del manual, con énfasis en las seis puertas de 20.1 (AU-33) y en los riesgos de nivel Alto (AU-37).
  - PA-SCE-001, apartado 3: AU-01 a AU-43. Antes del piloto todos son exigibles; AU-31 a AU-35 son los de la fase 5.
- **Auditor y declaración de imparcialidad:** FJMP. **No es imparcial:** audita su propio trabajo (NC-012 y NC-013). El asistente de IA tampoco es independiente.
- **Fechas y duración:** 11 de noviembre de 2026, una jornada.
- **Métodos:** revisión documental, inspección técnica y reejecución en GitHub Actions. No hay entrevista ni observación: no hay a quién entrevistar ni usuarios que observar.
- **Muestra:**
  - CI de `release/1.0.0` sobre `8e26059` (corrida 43022020442, etapas 1 a 7) y sus 12 reportes copiados a `docs/evidencias/v1.0.0/`.
  - Etapa 8 de `v1.0.0-rc.1` en staging (corrida 43027397938).
  - Continuidad (43014009079 y 43014050248) y seguridad operativa (43014013011).
  - Corridas CR-REN-01 a 05 sobre `v1.0.0-rc.1` (`informe-rendimiento.md`, apartado 4).
  - Los PR del sprint desde `v0.4.0`: #100, #101, #102, #105 y #106.
  - El registro de NC (NC-001 a NC-018), la matriz de riesgos (nueve riesgos de nivel Alto) y los dos defectos registrados (#69 y #82).

## 3. Lista de verificación

Resultados con la escala de PA-SCE-001. "CI" es la corrida 43022020442 sobre `8e26059`; "staging" es la 43027397938.

### 3.1 Gobierno y documentación

| Criterio | Pregunta o verificación | Resultado | Evidencia encontrada |
|---|---|---|---|
| AU-01 | ¿El manual vigente tiene versión, aprobación y control de cambios? | NC menor, ya registrada | Rige la v2.0 con las desviaciones aprobadas. La v3.0 (`manual-v3.0.md`) está preparada y sin firma: rige cuando se firme (su apartado 9). Sin registro de aprobación de la v2.0 (NC-003) |
| AU-02 y AU-03 | ¿El manual es consistente y cita ediciones vigentes de las normas? | NC menor, ya registrada | La lista de contradicciones de B0 y las ediciones de normas se resuelven en la v3.0, sin firma. Los elementos P1 #7 a #15 siguen vencidos (NC-004) |
| AU-04 | ¿Hay separación de funciones? | NC mayor, ya registrada | FJMP produce, aprueba, verifica y firma (NC-012) |
| AU-05 | ¿Cada requisito tiene casos y trazabilidad? | Conforme | `matriz-trazabilidad.md` con los 22 requisitos (20 del manual y 2 de CC-021). CO-MAN-01: 24 de 24 reglas Must con prueba (`reglas-must.zip`) |
| AU-06 | ¿Se aprobaron los cambios antes de fusionar? | NC mayor, ya registrada | CC-021 y CC-022 aprobados el 11 de noviembre de 2026, el mismo día de su código, por FJMP solo. CC-001 a CC-009 sin decisión; acta de cambios mayores sin firma (NC-008) |
| AU-07 | ¿Hay acta de cada fase con la Tabla 23? | NC mayor, ya registrada | Las actas de las fases 0 a 4 están listas para firma, ninguna firmada (NC-002, NC-009 a NC-011). La de la fase 4 es la puerta 4 (apartado 3.5) |
| AU-41 | ¿El producto entrega el alcance de la Tabla 4, sin adornos? | Conforme, con reservas declaradas | Los diez RF de la Tabla 4 en verde en CI. El pago es simulado (CC-020) y el piloto es de ensayo (CC-022), ambos con CC aprobado |
| AU-43 | ¿Se sigue la metodología: sprints, estimación y actas? | **NC menor (H-03)**, con observación OB-03 | #75 y #76 sin puntos antes de su primer commit (MJ-005); valen 21 cada uno y no se dividieron (MJ-007). NC-016 se reabre |

### 3.2 Diseño, código y configuración

| Criterio | Pregunta o verificación | Resultado | Evidencia encontrada |
|---|---|---|---|
| AU-08 | ¿Los modelos coinciden con el código y el esquema? | Conforme | Figuras redibujadas en 13.1. En `8e26059` ninguna dibuja a Mercado Pago (NC-014, eficaz). La Fig. 8 tiene `fecha_confirmacion` (CC-011). CI-MIG-01 en la etapa 4 |
| AU-09 | ¿Ramas protegidas, etiquetas SemVer y línea base? | Conforme, con NC menor ya registrada | `develop` y `main` piden los 7 checks y no permiten forzar ni borrar. Rulesets `release/**` y `v*`. Etiquetas `v0.4.0` y `v1.0.0-rc.1`. Correcciones en `feature/` en lugar de `fix/` (NC-015) |
| AU-10 | ¿TypeScript estricto, sin `any` en el dominio y reglas en el dominio? | Conforme | Etapa 2 en verde. 0 usos de `any` en `api/src/*/dominio/`. CO-MAN-02 detecta 8 de 8 violaciones de la Fig. 2 |
| AU-11 | ¿Revisó y aprobó cada PR otra persona? | NC mayor, ya registrada | #100 a #106 sin revisión de otro integrante (NC-001 y NC-012). Puerta de SonarQube aprobada |
| AU-12 | ¿Ocho etapas, piloto solo con etiqueta y acta, sin despliegues locales? | Conforme | Etapas 1 a 7 en CI y la 8 en staging. `staging.yml` lleva `vX.Y.Z` al environment `piloto` solo si el commit trae `acta-liberacion-<tag>.md` y si encuentra por API las puertas 1 y 2 |
| AU-29 | ¿Cada caso tiene requisito, ambiente, resultado y evidencia? | Conforme, con observación OB-05 | Matriz de trazabilidad, actas de promoción y `docs/evidencias/v1.0.0/`. `plan-de-pruebas.md`, apartado 6, sigue con los casos de la fase 1 (MJ-008) |
| AU-30 | ¿Dominio con 80 % o más y reglas Must al 100 %? | Conforme, con observación OB-04 | Dominio 289 de 289 líneas (100 %, `cobertura-unitarias.zip`). Reglas Must 24 de 24. Pirámide por caso: 38.2 % unitarias, 57.4 % integración y 4.5 % extremo a extremo, contra 70/20/10 |

### 3.3 Seguridad y datos personales

| Criterio | Pregunta o verificación | Resultado | Evidencia encontrada |
|---|---|---|---|
| AU-13 | ¿Hay secretos en el repositorio o en registros? ¿Están separados por ambiente? | Conforme | Gitleaks sobre todo el historial: 0 hallazgos. Staging genera sus secretos en cada corrida. El piloto tiene los suyos y su CA, y la etapa 8 solo publica su huella |
| AU-14 | ¿JWT con expiración, sin endpoint Must anónimo, con renovación y revocación? | Conforme | CS-SEG-07 y CI-AUTH-01 dentro de las 565 pruebas de integración, 0 fallas. Newman: todo endpoint protegido responde 401 sin token |
| AU-15 | ¿Cada endpoint autoriza por rol, con denegación por omisión? | Conforme | CF-ROL-01 en CI. Newman: 177 peticiones y 384 aserciones, 0 fallas (`newman.zip`). ZAP de acceso cruzado entre roles en la etapa 7 |
| AU-16 | ¿Bitácora completa e inmutable? | Conforme | CS-SEG-06 en los cuatro tipos con 0 filas (Great Expectations, 33 de 33). R-22: UPDATE, DELETE y TRUNCATE rechazados. Seguridad operativa muestreó 51 asientos |
| AU-17 | ¿TLS 1.2 o superior y base protegida? | Conforme, con observación OB-06 | Staging rechaza TLS 1.1. La base rechaza conexiones sin TLS y de superusuario por red. Respaldos cifrados con age (13.2). El volumen de la base no se cifra en reposo |
| AU-18 | ¿Minimización, visibilidad por rol, incidentes y datos personales? | Conforme en lo que toca al equipo, con observación OB-07 | Modelos de la Parte B (12.6) marcados "no emitido por la institución". Ensayo de mesa de vulneraciones con acta. RK-11 y RK-14 en mitigación |
| AU-19 | ¿Staging y pruebas sin datos reales? | Conforme | `sin-datos-reales.sql` en la etapa 8. Semilla sintética. El piloto corre con `SEMILLA=0` |
| AU-20 | ¿Cero vulnerabilidades altas o críticas sin plan? | Conforme, con observación OB-01 | npm audit: 0 altas o críticas; hay 39 moderadas y 1 baja. Trivy: 0 en la imagen, el portal y el repositorio. ZAP: 0 altas y 0 medias, 1 baja |

### 3.4 Requisitos funcionales y de datos

| Criterio | Pregunta o verificación | Resultado | Evidencia encontrada |
|---|---|---|---|
| AU-21 y AU-22 | ¿Expediente único, sin huérfanos ni inscripciones incompletas? | Conforme | CD-DAT-01, 04 y 05 con 0 filas. CF-EXP-01 en CI |
| AU-23 | ¿Promedio y créditos con una sola función de redondeo? | Conforme | CD-DAT-02 y CI-CAL-01 en CI |
| AU-24 | ¿Pago único, sin duplicar, pendiente ante fallo, conciliado y reflejado en menos de un minuto? | Conforme con pasarela simulada | CF-PAG-01 y CI-PAG-01 en verde. CD-DAT-03 y 06 con 0 filas y con su prueba de detección (NC-018, eficaz). La interoperabilidad con una pasarela real no se puede verificar (NC-019) |
| AU-25 a AU-28 | ¿Inscripción, calificaciones, trámites y reportes según sus figuras? | Conforme | CF-INS-01 y 02, CF-HOR-01, CI-API-01, CF-CAL-01, CI-CAL-01, CF-TRA-01 y 02 y CF-REP-01 en verde. Cypress 44 de 44 |

### 3.5 Liberación, operación y calidad del producto

| Criterio | Pregunta o verificación | Resultado | Evidencia encontrada |
|---|---|---|---|
| AU-31 | ¿p95 y concurrencia medidos fuera de la máquina de desarrollo? | Conforme, con observación OB-08 | `informe-rendimiento.md`, apartado 4.1: corridas en el runner de GitHub Actions con la topología de la Fig. 9. CR-REN-01 cumple, con una mediana del p95 de 66 ms en inscripción, 44 ms en pago y 26 ms en consultas. CR-REN-02 cumple: 2 277 ms, sin pérdida ni duplicación |
| AU-32 | ¿SUS, WCAG 2.2 AA y matriz de navegadores? | **NC mayor (H-02)** | Matriz de la Tabla 50: 7 de 7 combinaciones en verde. Lighthouse de accesibilidad en 100 en 21 páginas. axe sin violaciones serias ni críticas. **No hay SUS ni revisión con lector de pantalla (CO-ACC-03)** |
| AU-33 | ¿Seis puertas de 20.1, inventario al día y rollback ensayado? | **NC mayor (H-01 y H-04)** | Ver el apartado 3.6 |
| AU-34 | ¿Respaldo diario, restauración probada, RPO menor a 24 h y RTO menor a 4 h? | Conforme, con observación OB-02 | Restauración del respaldo anterior en 20 s, con conteos iguales (359 filas), CD-DAT y humo. RPO medido contra el respaldo anterior. Acta `2026-11-11-restauracion-y-rollback.md` |
| AU-35 | ¿Healthchecks, p95, alertas y bitácora de seguridad? | Conforme, con observación OB-02 | `infra/monitoreo/` con Prometheus, Grafana, blackbox y alertas. Ensayo con alerta ante una caída (`2026-11-11-monitoreo-y-alertas.md`). Muestreo de bitácora mensual |
| AU-36 | ¿Severidad, plazos y cierre por otra persona? | NC mayor, ya registrada | #69 (crítica) y #82 (alta) corregidos y cerrados el mismo día por quien los corrigió (NC-012) |
| AU-37 | ¿Matriz al día y riesgos Alto mitigados o aceptados por escrito? | Conforme, con reservas | Matriz revisada el 11 de noviembre de 2026, antes de la promoción a piloto. De los nueve riesgos de nivel Alto, RK-01, 02, 03 y 07 están mitigados y RK-09 vigente sin exposición. RK-04, RK-11, RK-14 y RK-15 están aceptados por escrito para el piloto de ensayo sin usuarios. Aceptó FJMP, que también produce (NC-012) |
| AU-38 | ¿Fichas de proveedores? | Conforme, con observación OB-09 | GitHub, npm, Mercado Pago (retirado por CC-020), staging, GHCR, Sigstore, Docker Hub y Cloudflare. Su decisión: "Aprobar, pendiente de firma del Product Owner" |
| AU-39 | ¿Tablero con las metas del piloto? | Conforme, con observación OB-10 | `informe-fase-4.md` con las 10 métricas de la Tabla 59. Sin piloto no hay metas que medir (manual v3.0, Tabla 59). MJ-010 sigue abierta |
| AU-40 | ¿Auditor independiente? | NC mayor, ya registrada | NC-013 |
| AU-42 | ¿Las matrices y el Anexo A cubren las subcaracterísticas de prioridad Alta? | **NC mayor (H-02)** | Anexo A actualizado con el resultado del candidato. Capacidad de interacción y Accesibilidad siguen "Parcial" |

### 3.6 Puertas de promoción a piloto (20.1)

| # | Puerta | Resultado | Evidencia |
|---|---|---|---|
| 1 | CI en verde sobre el tag candidato | Cumple | Corrida 43022020442: etapas 1 a 7 en verde, al primer intento |
| 2 | Despliegue y humo en staging | Cumple | Corrida 43027397938 y `acta-promocion-v1.0.0-rc.1.md` |
| 3 | Rendimiento dentro de las metas de RNF-REN | Cumple: CR-REN-01, 02 y 05 cumplen; CR-REN-03 y 04 son informativos (`informe-rendimiento.md`, apartado 4.1) | CR-REN-01 a 05 sobre `v1.0.0-rc.1`, en el runner (manual v3.0, 2.2) |
| 4 | Acta de aceptación de la fase firmada por PO y QA | **No cumple (H-04)** | `acta-aceptacion-fase-4.md` (ACT-F4-001) está lista para firma, sin firmar. Antes deben firmarse ACT-F0-001 a ACT-F3-001 |
| 5 | Riesgos Alto mitigados o aceptados por escrito | Cumple, con la aceptación de quien produce (NC-012) | AU-37 |
| 6 | Inventario actualizado y rollback verificado | **Cumple en parte (NC-022).** El inventario se actualiza con el despliegue de `v1.0.0`. El rollback solo se ensayó en local (25 s): rc.2 no se etiquetó y no hubo ensayo en staging | `2026-11-11-restauracion-y-rollback.md`; `acta-promocion-v1.0.0-rc.2.md`, estado; `inventario-de-ambientes.md`, apartado 8 |

El criterio 7 de 36.1 (credenciales de pago del piloto) no se cumple: es H-01.

## 4. Registro de hallazgos

| ID | Tipo | Criterio | Evidencia | Descripción | NC trasladada |
|---|---|---|---|---|---|
| H-01 | Mayor | AU-24, AU-33 | `acta-liberacion-v1.0.0.md`, criterio 7; CC-020 | No hay credenciales de pago del piloto: la pasarela es simulada | NC-019 |
| H-02 | Mayor | AU-32, AU-42 | `anexo-a.md`; catálogo, RNF-USU-001 y 002 | Sin SUS ni revisión con lector de pantalla, que piden dos requisitos Must | NC-020 |
| H-03 | Menor | AU-39, AU-43 | Issues #75 y #76; `mejora-continua.md`, MJ-005 y MJ-007 | La acción preventiva de NC-016 no fue eficaz | NC-016, reabierta |
| H-04 | Mayor | AU-07, AU-33 | `acta-aceptacion-fase-4.md` | La puerta 4 no se cumple: el acta de la fase 4 no está firmada | NC-021 |
| OB-01 | Observación | AU-20 | `calidad.zip` (npm audit); PR de Dependabot #86 a #99 | 39 vulnerabilidades moderadas y 1 baja de npm, sin plan escrito. Los 14 PR de Dependabot siguen abiertos sin revisar. GitHub reporta 3 en `main` (2 moderadas y 1 baja) | — |
| OB-02 | Observación | AU-34, AU-35, AU-39 | `continuidad.yml` y `seguridad-operativa.yml` (`schedule`) | GitHub solo programa los flujos de la rama principal, y `main` sigue en `v0.4.0`. El respaldo cada 12 h y la revisión mensual de accesos empiezan a operar al fusionar `release/1.0.0` a `main` (14.1). Sin ventana de operación, CO-FIA-01 (disponibilidad) no se mide | — |
| OB-03 | Observación | AU-43 | `plan-de-trabajo.md`, sprints S4 y S5; `acta-sprint-S3.md`, apartado 5 | Los batches 12 a 14, planeados para S4 y S5, se entregaron el 10 y 11 de noviembre, dentro de S3. El calendario no se reprogramó, y el apartado 5 del acta de S3 sigue vacío hasta el cierre del 13 de noviembre | — |
| OB-04 | Observación | AU-30 | Pirámide de la etapa 7 | La pirámide sigue lejos de 70/20/10. Solo informa; no hay acción con fecha para acercarla | — |
| OB-05 | Observación | AU-29 | `plan-de-pruebas.md`, apartado 6 | El apartado sigue con los casos de la fase 1 | MJ-008 |
| OB-06 | Observación | AU-17 | `stride.md`, fila "Protección en reposo" | El volumen de la base no se cifra en reposo. La fila de STRIDE decía que no había respaldo cifrado, aunque desde 13.2 sí lo hay; se corrigió en esta auditoría (`stride.md` v1.8) | — |
| OB-07 | Observación | AU-18 | `docs/gobierno/datos-personales/`; RK-12 | El aviso de privacidad, la base de licitud y el documento de seguridad son modelos. Los emite la institución | — |
| OB-08 | Observación | AU-31 | `informe-rendimiento.md`, apartado 4.2 | Las herramientas de CR-REN se corrigieron durante la medición: Lighthouse saturaba el núcleo del generador, y `metas.sh` contaba mal los usuarios y no veía la CPU en el punto de quiebre. Lo medido es `v1.0.0-rc.1`. El workflow vino de ramas de corrección, y los guiones, de la etiqueta. Por eso el arreglo de `metas.sh` no aplicó (`informe-rendimiento.md`, 4.2, hallazgo 2) | — |
| OB-09 | Observación | AU-38 | `fichas-de-proveedores.md` | Las fichas están aprobadas "pendiente de firma del Product Owner". La de iCloud, que el plan prevé para las grabaciones de la Tabla 62, no existe: todavía no hay grabaciones | — |
| OB-10 | Observación | AU-39 | `mejora-continua.md`, MJ-010 | No hay informe de liberación con la densidad separada de los fallos previos al PR. Pasa a `informe-cierre-piloto.md` (14.2) | MJ-010 |

Las NC mayores vigentes que este alcance confirma (NC-001, NC-002, NC-008, NC-009 a NC-013) no se duplican.

## 5. Dictamen y seguimiento

- **Conclusión y dictamen:** **no conforme para un piloto con usuarios; conforme con reservas para el piloto de ensayo sin usuarios. La auditoría no es independiente.**
  - La reejecución confirma los criterios funcionales, de datos y de seguridad: CI en verde al primer intento, 565 de 565 pruebas de integración, Cypress 44 de 44, Newman sin fallas, Great Expectations 33 de 33, cero vulnerabilidades altas o críticas y la matriz de compatibilidad completa.
  - Hay tres NC mayores nuevas (NC-019, NC-020 y NC-021), una menor reabierta (NC-016) y diez observaciones.
  - Según la Tabla 61, una NC mayor bloquea la liberación hasta cerrarse o aceptarse con plan fechado. FJMP, como Product Owner, las aceptó con plan fechado solo para el piloto de ensayo, sin usuarios ni datos (NC-012).
  - Para un piloto con usuarios reales, NC-019, NC-020 y NC-021 tienen que estar cerradas.
- **Plan de seguimiento:**

| Qué | Responsable | Fecha |
|---|---|---|
| Firmar ACT-F0-001 a ACT-F4-001, en ese orden (NC-021, NC-002, NC-009 a NC-011) | FJMP | 20 de noviembre de 2026 |
| Revisión con VoiceOver firmada (CO-ACC-03) y solicitud de participantes para SUS (NC-020) | FJMP | 20 de noviembre de 2026 |
| Pedir por escrito un auditor independiente que repita esta lista (NC-013) | FJMP | 20 de noviembre de 2026 |
| Solicitar a la institución el convenio y las credenciales de una pasarela (NC-019) | FJMP | 11 de diciembre de 2026 |
| OB-01: revisar los PR de Dependabot y escribir el plan de las moderadas | FJMP | 11 de diciembre de 2026 |
| OB-02: comprobar que el flujo de continuidad corre solo desde `main` después de 14.1 | FJMP | Primera corrida programada después de la fusión |
| OB-03: llenar el apartado 5 del acta de S3 y reprogramar S4 y S5 | FJMP | 13 de noviembre de 2026 |
| OB-06: decidir el cifrado del volumen de la base | FJMP | Antes de un piloto con usuarios |

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Auditor (autoauditoría, NC-013) | Francisco Javier Martínez Peñas | | |
| Product Owner (desviación, NC-012) | Francisco Javier Martínez Peñas | | |
