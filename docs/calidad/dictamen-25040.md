# Dictamen de evaluación ISO/IEC 25040:2024 — `v1.0.0`

**Fuente:** SCE-MC-001 v2.0, sección 8.4 y Tabla 17; manual v3.0, apartado 2.3 (8.4 y Tabla 17: se dictaminan la conformidad y la calificación; la idoneidad queda "no evaluada"). **Sub-batch:** 14.1, issue #77.
**Objeto:** `v1.0.0`, el commit `8e26059` de `v1.0.0-rc.1`. Imágenes `sce-api@sha256:44963d08…` y `sce-portal@sha256:3a1f2c3f…`.
**Fecha:** 11 de noviembre de 2026.
**Evaluó:** QA (FJMP; NC-012), con asistente de IA declarado. No es una evaluación independiente (NC-013).

## 1. Tipos de evaluación (Tabla 17)

| Tipo | Cómo lo aplica el SCE (Tabla 17) | Dictamen |
|---|---|---|
| Idoneidad para un uso específico | Dictamen de aceptación del piloto de una facultad durante un semestre | **No evaluada.** No hay facultad ni semestre piloto, y el piloto de ensayo no tiene usuarios. Se evalúa al cierre del piloto, con `informe-cierre-piloto.md` y la auditoría de cierre del semestre (`plan-de-evaluacion-piloto.md`, apartado 5) |
| Conformidad con los requisitos | Cada requisito de la sección 9 contra su caso de prueba | **Conforme con salvedades** (apartado 2) |
| Calificación frente a un estándar de calidad | La matriz de 8.2 contra las características de ISO/IEC 25010:2023 | **Calificada con salvedades** (apartado 3) |
| Idoneidad para el mercado | Fuera de alcance en la primera versión | No aplica |

## 2. Conformidad con los requisitos

Los 22 requisitos de `catalogo-requisitos.md`: los 20 del manual y los 2 de CC-021. Cada uno se contrasta con su caso de `matriz-trazabilidad.md`, sobre el commit evaluado.

- **CI** es la corrida [43022020442](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43022020442).
- **Staging** es la corrida [43027397938](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43027397938).
- **CR-REN** es el apartado 4 de `informe-rendimiento.md`.
- **Piloto de ensayo** es la corrida [43071987661](https://github.com/fjmp-dev/sce-control-escolar/actions/runs/43071987661), sin usuarios.

| Requisito | Caso | Resultado sobre `v1.0.0` | Dictamen |
|---|---|---|---|
| RF-001 Expediente | CF-EXP-01 | En verde en las etapas 3, 4 y 7 del CI | Conforme |
| RF-002 Inscripción | CF-INS-01 y 02, CI-API-01 | En verde en el CI; en staging, una inscripción confirmada y un rechazo por cada motivo | Conforme |
| RF-003 Horarios | CF-HOR-01 | En verde en el CI | Conforme |
| RF-004 Calificaciones | CF-CAL-01, CI-CAL-01 | En verde en el CI | Conforme |
| RF-005 Historial | CD-DAT-02 | Great Expectations, 33 de 33 expectativas en verde. El recálculo de un periodo real se mide en el piloto | Conforme |
| RF-006 Pagos | CF-PAG-01, CI-PAG-01 | En verde en el CI y en staging, con un doble aviso que no duplica. **Con pasarela simulada** (CC-020) | Conforme con salvedad: sin credenciales del piloto (NC-019) |
| RF-007 Trámites | CF-TRA-01 | En verde en el CI | Conforme |
| RF-008 Seguridad y acceso | CS-SEG-01 a 04, CF-ROL-01, CI-AUTH-01 | En verde en el CI. Newman: 177 peticiones y 384 aserciones, incluida la matriz rol × endpoint | Conforme. Defecto #107 (Media) abierto en el panel del administrador |
| RF-009 Reportes | CF-REP-01 | En verde en el CI | Conforme |
| RF-010 Documentos | CF-TRA-02 | En verde en el CI | Conforme |
| RNF-REN-001 | CR-REN-01 | Mediana del p95 de 66 ms en inscripción, 44 ms en pago y 26 ms en consultas, con 300 usuarios y 0 % de 5xx | Conforme, medido en el runner. Falta el servidor del piloto (24.2) |
| RNF-REN-002 | CR-REN-02 | Mediana del p95 de 2 277 ms con 300 a la vez, sin pérdida ni duplicación | Conforme, medido en el runner |
| RNF-FIA-001 | CO-FIA-01 | Healthchecks, Prometheus y alertas ensayados el 11 de noviembre. No hay un mes de operación que medir | Parcial: la disponibilidad mensual exige el piloto |
| RNF-FIA-002 | CO-FIA-02 | Restauración del respaldo cifrado en 20 s (`continuidad.yml`). Rollback ensayado solo en local, en 25 s: no hubo `rc.2` ni ensayo en staging | Conforme con salvedad: rollback sin ensayo en staging (NC-022) |
| RNF-SEG-001 | CS-SEG-01 a 06 | En verde en el CI. Bitácora muestreada (51 asientos) | Conforme |
| RNF-SEG-002 | CS-SEG-03, 05 y 08 | ZAP sin alertas altas ni medias; Gitleaks y Trivy sin hallazgos | Conforme en lo automático. Falta la revisión manual de CS-SEG-08 |
| RNF-DAT-001 | CD-DAT-01 a 06 | 33 de 33 expectativas; cero duplicados | Conforme |
| RNF-USU-001 | CF-INS-02 | En verde: cada rechazo muestra su estado y su corrección. SUS sin aplicar | Parcial (NC-020) |
| RNF-MAN-001 | CO-MAN-01 | 24 de 24 reglas Must con prueba; cobertura del dominio de 289 de 289 líneas; puerta de SonarQube aprobada | Conforme |
| RNF-FLE-001 | CO-FLE-01 | En verde en la etapa 4 y en staging: segunda facultad sin migración estructural | Conforme |
| RNF-USU-002 | CO-ACC-01 a 03 | axe en verde. Lighthouse de accesibilidad de 100 en 21 páginas. Revisión con VoiceOver pendiente | Parcial (NC-020) |
| RNF-FLE-002 | CO-COM-01 | Matriz de la Tabla 50: 7 de 7 combinaciones en verde | Conforme |

**Resultado:** 19 conformes, dos de ellos con salvedad (RF-006 y RNF-FIA-002); 3 parciales; ninguno no conforme.

- **Parciales:** RNF-FIA-001, RNF-USU-001 y RNF-USU-002.
- **Por qué:** necesitan personas o un periodo de operación.

## 3. Calificación frente a ISO/IEC 25010:2023

El Anexo A (`anexo-a.md`, versión 1.2) aplica la matriz de 8.2 a las once características: las nueve de 25010:2023, Accesibilidad (CC-021) y Seguridad física.

| Característica | Estado en el Anexo A |
|---|---|
| Adecuación funcional | Cumple con pasarela simulada |
| Eficiencia de desempeño | Cumple en el runner. Falta el servidor del piloto (24.2) |
| Compatibilidad | Cumple con pasarela simulada |
| Capacidad de interacción | Parcial: SUS preparado, no ejecutado (NC-020) |
| Accesibilidad (CC-021) | Parcial: cumple lo automatizado; falta la revisión con VoiceOver (NC-020) |
| Fiabilidad | Parcial: la restauración cumple; faltan la disponibilidad mensual y el rollback en staging (NC-022) |
| Seguridad | Cumple. CS-SEG-08 espera la revisión manual de Seguridad |
| Mantenibilidad | Cumple |
| Flexibilidad | Cumple, en staging, con el candidato |
| Calidad de datos | Cumple con pasarela simulada |
| Seguridad física (Tabla 14) | Cumple |

**Resultado:** ocho características cumplen y tres cumplen en parte. Ninguna incumple.

**Regla 8.4-2: las pruebas de aceptación cubren las subcaracterísticas de prioridad Alta.** Las 17 están cubiertas (`matriz-25010.md`, apartado 2). Las cuatro que faltaban se cubrieron sobre el candidato, en 13.6:
- Comportamiento temporal (CR-REN-01).
- Capacidad (CR-REN-02).
- Recuperabilidad (CO-FIA-02), con la salvedad de NC-022: el rollback solo se ensayó en local.
- Disponibilidad, por ensayo y sin meta mensual (CO-FIA-01).

## 4. No conformidades abiertas (8.4-3 y 40.1)

La regla 8.4-3 dice que "el dictamen de cierre del piloto es aceptable solo si no queda abierta ninguna no conformidad de prioridad alta". La 40.1 admite la promoción con una NC Mayor si el Product Owner acepta por escrito su plan fechado.

Al 11 de noviembre de 2026 hay **12 NC Mayor abiertas, todas aceptadas por escrito con plan fechado** (`registro-no-conformidades.md`):

| NC | Tema |
|---|---|
| NC-001, NC-008 y NC-012 | Revisión y separación de funciones |
| NC-002, NC-006, NC-009, NC-010, NC-011 y NC-021 | Actas sin firmar |
| NC-013 | Auditor independiente |
| NC-019 | Pasarela real |
| NC-020 | SUS y lector de pantalla |

Además sigue abierta **NC-022 (Menor)**, de esta versión: el rollback no se ensayó en staging. Las demás NC Menor abiertas son de gobierno y de proceso.

Con esas NC abiertas, el dictamen de cierre de un piloto real no sería aceptable.

## 5. Dictamen

**`v1.0.0` es conforme, con salvedades, con sus requisitos, y queda calificada, con salvedades, frente a ISO/IEC 25010:2023, para el piloto de ensayo sin usuarios ni datos.**

**No es apta para un piloto con usuarios** mientras sigan abiertas:
- NC-019, porque el pago es simulado;
- NC-020, porque no hay SUS ni revisión con lector de pantalla;
- NC-021, porque el acta de la fase 4 no está firmada;
- NC-022, porque el rollback no se ha ensayado en staging;
- las NC Mayor de gobierno.

**La idoneidad para un uso específico no se evalúa.** Esta versión no tiene periodo de uso ni facultad.

El dictamen se repite al cierre del semestre piloto con los datos de operación, y entonces agrega la idoneidad (`plan-de-evaluacion-piloto.md`, apartado 5).

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| QA, evaluó (NC-012) | Francisco Javier Martínez Peñas | | |
| Product Owner, recibe | Francisco Javier Martínez Peñas | | |

> El asistente de IA es coautor y no firma.
