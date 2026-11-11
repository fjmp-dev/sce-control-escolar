# Manual de calidad SCE-MC-001 — versión 3.0

**Forma de esta versión:** la v3.0 es el manual v2.0 (`Manual_de_Calidad_SCE-MC-001_v2.0.pdf`, SHA-256 `37e35c2f0664db585167996e256654830e8b05a564ff2e33bb73f6938c394ea4`) **con los cambios de este documento**. Donde ambos difieren, rige este documento; lo que no se menciona aquí sigue igual.
**Issues que atiende:** #7 a #15. **No conformidad:** NC-004.
**Fecha de emisión:** 10 de noviembre de 2026. **Vigencia:** desde su aprobación (apartado 9).

---

## 1. Por qué es 3.0 y no 2.1

La sección 1.3 del manual fija la regla: *"El número mayor cambia cuando se altera el alcance, la política o el modelo de calidad; el menor, cuando se corrigen o precisan contenidos"*. La 3.6 añade que un cambio de tecnología que afecte los objetivos de la sección 7 es cambio de alcance.

Se había comprometido una v2.1 solo con correcciones (NC-004, issue #15). Pero el 10 de noviembre de 2026 FJMP decidió dos cosas (`plan-de-sistema.md`, 6.1):

- el pago es simulado, sin Mercado Pago;
- el piloto de un semestre queda fuera.

Las dos alteran el alcance. Por eso se emite la v3.0, que incluye todas las correcciones previstas para la v2.1 y cumple el compromiso del 27 de noviembre.

El mismo día FJMP retomó los batches 11 a 14 (`plan-de-sistema.md`, 6.2). La retoma mantiene las dos decisiones y registra el cambio de proveedor de pagos en CC-020. Lo que el piloto iba a verificar se verifica en staging, en el runner de GitHub Actions o como ensayo, y así se declara (apartados 2.2 y 2.3). La fase 4 se entrega como v0.4.0 y la liberación sin piloto es v1.0.0 (apartado 2.4).

**Tabla 3, fila nueva:**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| 3.0 | 10-nov-2026 | Equipo SCE | Revisión mayor: alcance acotado a las fases 0 a 4 con pago simulado (CC-020) y sin piloto; la fase 5 se prepara y no se ejecuta; lo que exigía el piloto se verifica en staging, en el runner o como ensayo; versiones v0.4.0 y v1.0.0; rol técnico de administrador; versiones con soporte del stack; correcciones #7 a #14; cambios CC-001 a CC-020 (las figuras de CC-020 se redibujan en 13.1, NC-014); contradicciones X-01 a X-25 resueltas; normas actualizadas. |

**Historial del borrador.** La v3.0 no está firmada (apartado 9). Por eso la retoma corrige el borrador y no abre una versión nueva:

| Fecha | Cambio en el borrador | Origen |
|---|---|---|
| 10-nov-2026 | Emisión: alcance acotado a las fases 0 a 4, pago simulado y sin piloto | Compactación (`plan-de-sistema.md`, 6.1); PR #66 |
| 10-nov-2026 | Retoma: apartado 1, fila de las Tablas 23 y 25 en 2.1, apartados 2.2 y 2.3, apartado 2.4 nuevo, fila de la Tabla 55 en el apartado 3, nota de figuras del apartado 5 y apartado 9 | `plan-de-sistema.md`, 6.2; sub-batch 11.0 |
| 10-nov-2026 | Apartado 5: fila "Datos personales" de la Tabla 38 y RK-11 a RK-14 en la Tabla 36. Apartado 6: D-18 | `plan-de-sistema.md`, 6.2; sub-batch 12.6 |
| 11-nov-2026 | Apartado 4, corrección #11: 22 requisitos y casos `CO-*` de CC-021. Anexo A sustituido por `docs/calidad/anexo-a.md` | CC-021; sub-batch 12.5 |

---

## 2. Alcance (secciones 2, 3 y 10)

### 2.1 Qué cambia

| Dónde | Dice (v2.0) | Debe decir (v3.0) |
|---|---|---|
| 2.1, 3.1 | La primera versión se prueba en una facultad piloto durante un semestre completo | La primera versión se construye y se verifica en las fases 0 a 4, en los ambientes de desarrollo, pruebas y staging, **con datos sintéticos**. El piloto con una facultad durante un semestre queda fuera de esta versión. |
| Tabla 4, Pagos | Pago en línea | Pago con **pasarela simulada**: el alumno aprueba o rechaza el cobro en una pantalla de prueba y no se mueve dinero. El pago se aplica una sola vez aunque el aviso se repita (R-14). |
| Tabla 4, Pagos | Conciliación de caja | Corte del día de caja: pagos aplicados y su total. Sin pasarela real no hay nada que conciliar. |
| Tabla 5, Dirección | Reportes "de su facultad o de la universidad" | Sin cambio. Se aclara frente a RF-009 (X-12): el reporte muestra cada facultad y el total de la universidad. |
| Tabla 6, Pruebas | Mercado Pago en modo sandbox | Pasarela simulada |
| Tabla 6, Staging | Ensayo previo al piloto | Se arma en GitHub Actions en cada despliegue, con la topología de la Fig. 9 (CC-018) |
| Tabla 6, Piloto y producción | Una facultad durante un semestre | Fuera de esta versión |
| Tablas 23 y 25 | Fases 0 a 5 | Fases 0 a 4. La fase 5 (piloto) no se ejecuta: se preparan su plan de evaluación, sus plantillas y un acta "preparada, no ejecutada" (`plan-de-sistema.md`, 6.2, sub-batch 14.2). Orden: académico antes que pagos y trámites (X-01, D-4) |

### 2.2 Requisitos que se verifican sin el piloto

Siguen en el catálogo con su texto. Su criterio pide el ambiente piloto, un semestre de operación o el staging previo al piloto. Como no hay piloto, se verifican como dice la tabla, y cada informe lo declara así. El resultado es evidencia de ensayo: no demuestra la meta del piloto (Tabla 13).

| Requisito | Qué pide su criterio (Tabla 20) | Cómo se verifica en esta versión | Sub-batch |
|---|---|---|---|
| RNF-REN-001 (percentil 95) | Prueba de carga con JMeter sobre el tag candidato, en el ambiente piloto | Medido en staging con dimensionamiento de referencia, no en el piloto: CR-REN-01, 03, 04 y 05 en el runner, sobre cada rc de v1.0.0 | 13.4 y 13.6 |
| RNF-REN-002 (300 concurrentes) | Prueba de carga y de concurrencia con k6 que cuenta solicitudes enviadas frente a persistidas, en el ambiente piloto | CR-REN-02 en el runner con dimensionamiento de referencia, no en el piloto, sobre cada rc de v1.0.0. Siguen las pruebas de integración con avisos de pago y solicitudes de cupo simultáneos, sin duplicados ni pérdida | 13.4 y 13.6 |
| RNF-FIA-001 (disponibilidad) | Registro de healthchecks y cálculo mensual de la disponibilidad del piloto | Cálculo ensayado sobre una ventana de observación, con alertas disparadas a propósito. No hay un mes de operación | 13.3 |
| RNF-FIA-002 (respaldo y RTO) | Acta de restauración con fecha, tag, base restaurada y resultado | Respaldo cifrado, restauración cronometrada y rollback ensayados en CI, con acta. El RTO es el de la corrección #12 (apartado 4) | 13.2 y 13.6 |
| RNF-FLE-001 (segunda facultad) | Alta de una facultad adicional en staging sin migración estructural | CO-FLE-01 en el staging de GitHub Actions (CC-018). Pasa a la fase 4, pero se verifica después de su cierre, sobre el candidato v1.0.0-rc | 13.5 y 13.6 |

### 2.3 Secciones que aplican con salvedades o no aplican

| Sección | Cómo aplica en esta versión | Sub-batch |
|---|---|---|
| 24 (rendimiento) | En staging, en el runner de GitHub Actions con dimensionamiento de referencia declarado. No en el servidor del piloto | 13.4 y 13.6 |
| 26 (usabilidad) | Se prepara el método de 26.2: guiones por rol, hojas de observación, consentimiento, inducción y cuestionario SUS. De 26.1 se verifican los criterios 1 a 3 (todo en un solo lugar, estados visibles y tasa de conclusión, sobre datos sintéticos). Los criterios 4 y 5 (inducción de control escolar y caja, y SUS ≥ 70) exigen participantes: no se verifican | 11.2 y 13.5 |
| 27 (compatibilidad) | Playwright con los navegadores y dispositivos de la Tabla 50, en CI y en staging. No hay inventario de navegadores de la facultad. Safari de iOS y Chrome de Android se revisan a mano en el simulador y el emulador | 12.3 y 12.4 |
| 28 (accesibilidad) | axe en Cypress y en Playwright, Lighthouse, y revisión manual de teclado y zoom. VoiceOver sustituye a NVDA porque no hay Windows | 12.3 y 12.4 |
| 34 (continuidad) | Respaldo, restauración y rollback ensayados en CI (apartado 2.2, RNF-FIA-002) | 13.2 |
| 35 (monitoreo) | Monitoreo y alertas ensayados en staging, sin operación continua | 13.3 |
| 36 y 20.1 (liberación y puertas) | Aplican con salvedades. La puerta 3 se mide en el runner. El criterio 7 de 36.1 se cumple con secretos propios del environment `piloto`, verificados por huella, porque el pago es simulado (CC-020). PO y QA son la misma persona (NC-012). La corrección de 20.1 (#13) se mantiene (apartado 4) | 14.1 |
| 37 (operación) | Solo plantillas: incidentes, cambios de emergencia y problemas | 14.2 |
| 8.4 y Tabla 17 (ISO/IEC 25040) | Se dictaminan la conformidad con los requisitos y la calificación frente a ISO/IEC 25010. La idoneidad para un uso específico exige el piloto: queda "no evaluada" | 14.1 |
| Tabla 60 (auditoría interna) | "Cierre de fase 4" y "Antes del piloto" (aquí, antes de liberar v1.0.0) se hacen como autoauditoría por reejecución, con NC por falta de independencia (NC-013). La de "Cierre de fase 2" no se hizo a tiempo: se hace igual, como autoauditoría, en 11.3 (NC-013). "Cierre del semestre piloto" no se realiza | 11.3 y 13.6 |
| Tabla 13 (objetivos) | Se miden Defectos, Seguridad, Calidad de datos, Capacidad de interacción, Mantenibilidad y Accesibilidad. Disponibilidad, Rendimiento, Capacidad y Recuperación se ensayan en staging o en el runner (apartado 2.2), pero no se declaran cumplidas: su meta es del piloto | 11.3 y 13.6 |

### 2.4 Versiones del producto (Tabla 54)

La regla de la Tabla 54 no cambia: versionado semántico con etiqueta de Git `vX.Y.Z`. Este apartado fija qué versión cierra cada parte del alcance:

| Versión | Qué contiene | Rama y etiqueta | Cuándo |
|---|---|---|---|
| v0.1.0 a v0.3.0 | Cierre de las fases 1 a 3 | Etiquetas retroactivas sobre el commit de cierre de cada fase en `develop`, con la fecha real de creación | Sub-batch 11.4 |
| v0.4.0 | Cierre de la fase 4: pagos simulados, trámites y reportes | `release/0.4.0`. `v0.4.0-rc.1` pasa por la etapa 8, y `v0.4.0` va sobre el mismo commit, fusionado a `main` | Sub-batch 11.4, a más tardar el 20 de noviembre de 2026 |
| v1.0.0-rc.N | Candidato con la calidad transversal de los batches 12 y 13 | `release/1.0.0`. Cada rc pasa por la etapa 8 con rollback | Sub-batch 13.6 |
| v1.0.0 | Liberación sin piloto | Mismo commit que el último rc, fusionado a `main` | Sub-batch 14.1, a más tardar el 11 de diciembre de 2026 |

- v1.0.0 es la "primera versión" de las secciones 2.1 y 3.1: construida y verificada en las fases 0 a 4, sin piloto. Si algún día hay piloto, su operación va en v1.x.
- `v0.4.0` se etiqueta solo con las actas de las fases 1 a 4 firmadas (NC-011).
- Las notas de cada versión se escriben después de crear su etiqueta, con lo que pide la Tabla 54: requisitos incluidos, defectos conocidos, ambiente destino y vínculo al acta.
- Al 10 de noviembre de 2026 el repositorio no tiene etiquetas ni releases.

---

## 3. Organización, stack y ambientes

| Dónde | Cambio | Registro |
|---|---|---|
| Tabla 7 | Next.js 16 y React 19; NestJS 12 sobre Node.js 24; Prisma 6; PostgreSQL 16; Jest 30 y Supertest 7. Node 20 perdió soporte el 30 de abril de 2026 (X-19) | D-1, CC-006 |
| Tabla 7, Pagos | Mercado Pago → pasarela simulada | Apartado 2 |
| Tabla 55, Mercado Pago | No se contrata: pasarela simulada. Sandbox, convenio y credenciales no aplican. Idempotencia con `Pago.aplicarUnaVez()` y una clave por intento; conciliación con el corte del día (Tabla 4). Riesgos RK-02 y RK-08 | CC-020 |
| Tabla 7, Contenedores | Docker y Docker Compose; en macOS, el motor es Colima. Las pruebas de integración usan Testcontainers con PostgreSQL 16 | D-3, CC-006 |
| Tabla 7, Monitoreo | Solo healthchecks (`/salud`) y registros JSON | Apartado 2 |
| Tablas 11 y 12, Fig. 1 | Rol técnico **`administrador`**: altas de usuarios, facultades y planes. No es uno de los seis roles de uso de RF-008 (X-16) | D-2, CC-007 |
| Tabla 42 | Versiones de herramientas: `plan-de-pruebas.md`, sección 4. Etapas del pipeline de Newman, ZAP, Cypress y k6 (X-15): `plan-de-pruebas.md`, 4.1 | CC-006 |
| Tabla 30 y 20.2 | Staging con datos **sintéticos o anonimizados** (X-13) | — |

---

## 4. Correcciones comprometidas para la v2.1 (#7 a #14)

| Issue | Dónde | Corrección |
|---|---|---|
| #7 | Tablas 20, 27 y Anexo A | Cada caso CS-SEG se define en la Tabla 49. Los rangos que citan las otras tablas (01–04, 01–06, 01–08) son subconjuntos de esa misma numeración y no definen casos propios (CC-002 y su enmienda) |
| #8 | Anexo A y Tabla 47 | CR-REN-01 carga; CR-REN-02 concurrencia; CR-REN-03 estrés; CR-REN-04 pico; CR-REN-05 resistencia. Escenarios y herramientas: `matriz-trazabilidad.md`, 3.5. Para la meta, la carga dura 15 minutos; "la primera hora" se describe como escenario (X-11). En esta versión no se ejecutan (apartado 2.2) |
| #9 | 8.4 y 40.1 | Una sola escala. NC **Mayor** = prioridad **alta**; **Menor** = **media**; **Observación** = **baja**. Una NC mayor bloquea la aceptación de la fase y la promoción hasta que se cierra o hasta que el PO acepta por escrito su plan fechado, como ya dice la 40.1. El dictamen de la 8.4 se lee igual |
| #10 | 13.6 y Tabla 29 | La Tabla 29 añade la entidad **`periodo`**: clave, fechas, estado y fecha de publicación de la oferta. Con ella son las 21 entidades de la 13.6 (CC-003, CC-012). Matrícula es clave primaria (X-10, CC-004) |
| #11 | Tabla 27, sección 9 y Anexo A | Pasa de 10 a 22 requisitos: los 20 del catálogo (CC-001) más RNF-USU-002 y RNF-FLE-002 (CC-021). La matriz completa es `matriz-trazabilidad.md`, sección 2. Se añaden los casos `CO-*` de operación (X-20): CO-FIA-01, CO-FIA-02, CO-MAN-01 y CO-FLE-01; y, con CC-021, CO-ACC-01 a 03, CO-COM-01 y CO-MAN-02. El prefijo `CO` entra a la Tabla 31. El Anexo A (Tabla 63) es `docs/calidad/anexo-a.md`, con columnas de resultado, evidencia y estado y filas de Accesibilidad y Seguridad física |
| #12 | RNF-FIA-002 | Debe decir: "…con pérdida máxima de datos menor a 24 horas **y tiempo de restauración menor a 4 horas**, demostrado al menos una vez por periodo". Es el RTO que ya fija la sección 34 |
| #13 | 20.1 | Debe decir: "Prueba de rendimiento **en staging** sobre el tag candidato…". El rendimiento en el servidor del piloto se mide después de promover, como dice la 24.2 |
| #14 | 4.1, Tabla 8 | Ver apartado 7 |

---

## 5. Modelo de datos, figuras y flujos (CC-001 a CC-019)

Los cambios aprobados se incorporan tal como están registrados en `docs/gobierno/registro-de-cambios.md`, con su solicitud en `docs/gobierno/cambios/`. **Las figuras de la v3.0 son las de `docs/arquitectura/`** (fuente PlantUML y render PNG), que ya incorporan esos cambios. CC-020 todavía no: las figuras 1, 2, 3, 5, 9 y 10 siguen mostrando Mercado Pago hasta el sub-batch 13.1 (NC-014).

Resumen de lo que cambia en el texto del manual:

- **Modelo de datos (Tabla 29, Fig. 8):**
  - `periodo` (CC-003) y `periodo.oferta_publicada_en` (CC-012);
  - `documento.contenido` (CC-008) y `tramite.motivo_rechazo` (CC-009);
  - `usuario.sesion_version` (CC-010) y `pago.fecha_confirmacion` (CC-011);
  - integridad en las migraciones (CC-004).
- **Seguridad (18, Tabla 38):**
  - pgAudit y SCRAM en staging (CC-005); usuario técnico sin rol que firma operaciones automáticas y accesos fallidos (CC-015).
  - La fila "Datos personales" dice: "Minimización, datos reales solo en piloto y visibilidad estrictamente por rol; inventario de datos, aviso de privacidad, procedimiento ARCO y documento de seguridad". Están en `docs/gobierno/datos-personales/`. El aviso es un modelo hasta que la universidad lo emita.
  - La fila "Respuesta a incidentes" añade la notificación de vulneraciones (`respuesta-a-incidentes.md`, §4.1).
- **Riesgos (17, Tabla 36):** se agregan RK-11 a RK-14, de privacidad y autenticación (`docs/calidad/matriz-riesgos.md`).
- **Inscripción (Fig. 3, 4 y 6):**
  - el rechazo se guarda con su motivo (CC-013, X-05);
  - hay cuatro motivos de rechazo, porque también cuenta el cupo (X-04);
  - `Inscripcion.validar*` decide con lo que entregan académico y pagos (CC-017, X-06, X-23);
  - el ajuste revalida todo (X-22, D-15);
  - la inscripción rechazada guarda la carga que se intentó, sin ocupar lugar (X-24).
- **Periodo (Fig. 3 y 7):** coordinación inicia el curso y cierra el periodo (CC-019, X-09, X-25).
- **Dependencias y despliegue (Fig. 2 y 9):** dependencias entre dominios y conexión del portal a la API (CC-014, X-07). `cambiarEstatus` del alumno (CC-016).
- **Trámites (CF-TRA-01):** tienen cinco estados; el quinto es *entregada* (X-18).

---

## 6. Contradicciones y reglas que el manual no definía

- **Contradicciones X-01 a X-25** (`docs/calidad/contradicciones-manual-v2.0.md`): en cada caso rige la columna "Decisión vigente". Las que cambian el texto ya están en los apartados 2 a 5. Las demás también se incorporan:
  - X-02: un defecto crítico es la unión de las definiciones de 7.2 y de la Tabla 52.
  - X-03: son diez figuras.
  - X-08: las rutas de las figuras mandan; en lo demás, sustantivos en plural.
  - X-14: la oferta mínima en API va en la fase 2.
  - X-17: Usuario y Rol se relacionan muchos a muchos.
- **Reglas de negocio D-5 a D-18** (`docs/calidad/reglas-de-negocio.md`): son las "reglas publicadas del periodo" que exige la Tabla 16. Rigen como provisionales mientras el PO no las ratifique con las reglas reales de la universidad. D-18 fija la conservación del expediente, que la Tabla 62 no cubre.

---

## 7. Referencias normativas (#14, Tabla 8)

| Referencia | Dice (v2.0) | Debe decir (v3.0) |
|---|---|---|
| NMX-I-059-NYCE | 2016, MoProSoft | **NMX-I-059-2-NYCE-2016**, parte 2, requisitos de procesos; sustituye a la /02 de 2011. Las partes 1, 3 y 4 son de 2005. Es un modelo de procesos, no de calidad del producto: se cita para procesos de desarrollo y gestión, como ya decía la tabla |
| LGPDPPSO | 2017 | **Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados, DOF 20-mar-2025.** Abroga la de 2017. El INAI desapareció y sus funciones federales pasaron a la Secretaría Anticorrupción y Buen Gobierno. Una universidad pública autónoma sigue siendo sujeto obligado |
| Normativa estatal (nueva fila) | — | **Ley de protección de datos personales en posesión de sujetos obligados del Estado de México.** La de 2017 (Gaceta del Gobierno, 30-may-2017) fue sustituida por la que aprobó la Legislatura el 20-ago-2026, junto con la de transparencia. El Infoem se extinguió el 1-oct-2026 y lo sustituye Transparencia Mexiquense, órgano de la Secretaría de la Contraloría. Los organismos autónomos atienden la materia con sus áreas internas de control |

**Por confirmar antes de firmar:** el nombre exacto de la ley estatal nueva y su fecha de publicación en la Gaceta del Gobierno. Las fuentes consultadas el 10-nov-2026 son notas de prensa y no la Gaceta. Si la Gaceta difiere, se corrige esta fila y la fecha de la revisión; no cambia el número de versión.

Fuentes:
- Catálogo Mexicano de Normas: [NMX-I-059-2-NYCE-2016](https://platiica.economia.gob.mx/normalizacion/?p=45152).
- Cámara de Diputados: [LGPDPPSO vigente](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGPDPPSO.pdf).
- SCJN: [LGPDPPSO, DOF 20-mar-2025](https://datos-personales.scjn.gob.mx/sites/default/files/normativa-materia/LGPDPPSO-DOF-20Mar2025.pdf).
- [IDC, 21-mar-2025](https://idconline.mx/corporativo/2025/03/21/publican-nuevas-leyes-sobre-acceso-a-informacion-publica-y-proteccion-de-datos-personales).
- [La Jornada, 20-ago-2026](https://www.jornada.com.mx/noticia/2026/08/20/estados/congreso-mexiquense-aprueba-nueva-ley-de-transparencia-y-desaparece-el-infoem).
- [Digital Mex, 1-oct-2026](https://digitalmex.mx/estado-de-mexico/story/71261/entra-vigor-nuevo-modelo-transparencia-edomex).

---

## 8. Lo que no cambia

- **Requisitos:** los requisitos funcionales RF-001 a RF-010 y su prioridad.
- **Política y modelo de calidad:** la política de calidad (sección 6) y el modelo de ISO/IEC 25010:2023, 25012:2008 y 25040:2024.
- **Seguridad:** seis roles de uso con mínimo privilegio, bitácora de toda operación sensible y ningún dato personal real fuera del piloto.
- **Gobierno:** la separación de funciones (quien produce no acepta) y las reglas de aceptación por fase.

---

## 9. Revisión y aprobación (sección 1.2)

**Autor, revisor y aprobador:** Francisco Javier Martínez Peñas, con asistente de IA declarado en `roles-y-raci.md`.

**Desviación declarada:** la sección 1.2 pide revisión de QA y de Seguridad y aprobación del Product Owner. Desde el 10 de noviembre de 2026 SJOM es colaborador del repositorio, pero no revisa ni aprueba (`roles-y-raci.md`, apartado 6; NC-012), así que el autor también revisa y aprueba. No hay revisión independiente de esta versión.

| Rol | Persona | Medio | Firma | Fecha |
|---|---|---|---|---|
| Autor | Francisco Javier Martínez Peñas | Firma manuscrita | | |
| Revisor: QA y Seguridad | Francisco Javier Martínez Peñas | Firma manuscrita | | |
| Aprobador: Product Owner | Francisco Javier Martínez Peñas | Firma manuscrita | | |

Hasta que se firme, la v3.0 es un borrador y rige la v2.0 con las decisiones registradas en `plan-de-sistema.md` y en el registro de cambios.
