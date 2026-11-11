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

**Tabla 3, fila nueva:**

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| 3.0 | 10-nov-2026 | Equipo SCE | Revisión mayor: alcance acotado a las fases 0 a 4 con pago simulado y sin piloto; rol técnico de administrador; versiones con soporte del stack; correcciones #7 a #14; cambios CC-001 a CC-019; contradicciones X-01 a X-25 resueltas; normas actualizadas. |

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
| Tablas 23 y 25 | Fases 0 a 5 | Fases 0 a 4. La fase 5 (piloto) queda fuera. Orden: académico antes que pagos y trámites (X-01, D-4) |

### 2.2 Requisitos que siguen en el catálogo pero no se verifican

Siguen siendo requisitos del producto, pero su criterio exige el ambiente piloto o una operación de un semestre. En esta versión **no se verifican, y así se declara**:

| Requisito | Por qué no se verifica | Qué sí hay |
|---|---|---|
| RNF-REN-001 (percentil 95) | Sin pruebas de carga | Nada medido bajo carga |
| RNF-REN-002 (300 concurrentes) | Sin pruebas de carga | Pruebas de integración con avisos de pago y solicitudes de cupo simultáneos: sin duplicados ni pérdida |
| RNF-FIA-001 (disponibilidad) | Sin operación continua ni monitoreo | `/salud` de la API y del portal, revisado en cada despliegue |
| RNF-FIA-002 (respaldo y RTO) | Sin ambiente con datos reales | Nada ensayado |

### 2.3 Secciones que no aplican en esta versión

- **Pruebas que exigen piloto, terceros o participantes:** 24 (rendimiento), 26 (usabilidad con participantes y SUS) y 27 (compatibilidad con Playwright).
- **Operación que exige un ambiente productivo:** 34 (continuidad), 35 (monitoreo), 36 (liberación a producción) y 37 (operación).
- **Objetivos que se miden con el piloto en marcha:** de la Tabla 13 aplican Defectos, Seguridad, Calidad de datos, Capacidad de interacción, Mantenibilidad y Accesibilidad. Disponibilidad, Rendimiento, Capacidad y Recuperación no se miden.
- **Evaluación con ISO/IEC 25040 (8.4, Tabla 17):** no hay dictamen de idoneidad del piloto. La evaluación de esta versión es de conformidad con los requisitos, con cada RF y RNF contra su caso.
- **Accesibilidad (28):** sí aplica, con axe en Cypress. La revisión con NVDA queda fuera.
- **Puerta de promoción a piloto (20.1):** no aplica, porque no hay promoción a piloto. Su corrección de redacción (#13) se hace de todos modos (apartado 4).

---

## 3. Organización, stack y ambientes

| Dónde | Cambio | Registro |
|---|---|---|
| Tabla 7 | Next.js 16 y React 19; NestJS 12 sobre Node.js 24; Prisma 6; PostgreSQL 16; Jest 30 y Supertest 7. Node 20 perdió soporte el 30 de abril de 2026 (X-19) | D-1, CC-006 |
| Tabla 7, Pagos | Mercado Pago → pasarela simulada | Apartado 2 |
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
| #11 | Tabla 27 | Pasa de 10 a 20 requisitos. La matriz completa es `matriz-trazabilidad.md`, sección 2 (CC-001). Se añaden los casos `CO-*` de operación (X-20): CO-FIA-01, CO-FIA-02, CO-MAN-01 y CO-FLE-01, con el prefijo `CO` en la Tabla 31 |
| #12 | RNF-FIA-002 | Debe decir: "…con pérdida máxima de datos menor a 24 horas **y tiempo de restauración menor a 4 horas**, demostrado al menos una vez por periodo". Es el RTO que ya fija la sección 34 |
| #13 | 20.1 | Debe decir: "Prueba de rendimiento **en staging** sobre el tag candidato…". El rendimiento en el servidor del piloto se mide después de promover, como dice la 24.2 |
| #14 | 4.1, Tabla 8 | Ver apartado 7 |

---

## 5. Modelo de datos, figuras y flujos (CC-001 a CC-019)

Los cambios aprobados se incorporan tal como están registrados en `docs/gobierno/registro-de-cambios.md`, con su solicitud en `docs/gobierno/cambios/`. **Las figuras de la v3.0 son las de `docs/arquitectura/`** (fuente PlantUML y render PNG), que ya incorporan esos cambios.

Resumen de lo que cambia en el texto del manual:

- **Modelo de datos (Tabla 29, Fig. 8):**
  - `periodo` (CC-003) y `periodo.oferta_publicada_en` (CC-012);
  - `documento.contenido` (CC-008) y `tramite.motivo_rechazo` (CC-009);
  - `usuario.sesion_version` (CC-010) y `pago.fecha_confirmacion` (CC-011);
  - integridad en las migraciones (CC-004).
- **Seguridad (18, Tabla 38):** pgAudit y SCRAM en staging (CC-005); usuario técnico sin rol que firma operaciones automáticas y accesos fallidos (CC-015).
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
- **Reglas de negocio D-5 a D-17** (`docs/calidad/reglas-de-negocio.md`): son las "reglas publicadas del periodo" que exige la Tabla 16. Rigen como provisionales mientras el PO no las ratifique con las reglas reales de la universidad.

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

**Autor:** Francisco Javier Martínez Peñas, con asistente de IA declarado en `roles-y-raci.md`.
**Revisor (QA y Seguridad) y aprobador (Product Owner):** Samuel Jezoar Ortiz Martínez. Separación de funciones: quien produce no acepta (`metodologia-de-trabajo.md`, sección 1).

| Rol | Persona | Medio | Firma | Fecha |
|---|---|---|---|---|
| Revisor: QA | Samuel Jezoar Ortiz Martínez | Aprobación del pull request y firma manuscrita | | |
| Revisor: Seguridad | Samuel Jezoar Ortiz Martínez | Firma manuscrita | | |
| Aprobador: Product Owner | Samuel Jezoar Ortiz Martínez | Firma manuscrita | | |
| Autor | Francisco Javier Martínez Peñas | Firma manuscrita | | |

Hasta que se firme, la v3.0 es un borrador y rige la v2.0 con las decisiones registradas en `plan-de-sistema.md` y en el registro de cambios.
