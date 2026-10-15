# sce-control-escolar

Sistema de Control Escolar Universitario (SCE). Centro Universitario UAEM Tianguistenco, Ingeniería de Software.

| Campo | Valor |
|---|---|
| Manual de calidad | SCE-MC-001 v2.0, 16 de septiembre de 2026 |
| Fase actual | **0 — Alcance validado** |
| Autores | Francisco Javier Martínez Peñas · Samuel Jezoar Ortiz Martínez |
| Auditoría en curso | PA-SCE-001 v1.0, equipo Aerial Forge |

---

## Estado del repositorio

Fase 0 según la sección 11.2 del manual: el entregable es el **alcance validado**, no código. Lo que vive aquí es la línea base documental del proyecto —modelos, esquema de datos y matrices de calidad— sobre la que se construirán las fases 1 a 5.

No hay aplicación, pipeline ni ambientes desplegados.

---

## Estructura

```
docs/
  arquitectura/     Las diez figuras de la sección 13 del manual, en PlantUML
    fig01-casos-de-uso.puml
    fig02-componentes.puml
    fig03-clases-dominio.puml
    fig04-secuencia-inscripcion.puml
    fig05-secuencia-pago.puml
    fig06-estados.puml
    fig07-actividad-semestre.puml
    fig08-entidad-relacion.puml
    fig09-despliegue.puml
    fig10-infraestructura-ambientes.puml
  datos/
    schema.prisma         Veintiuna entidades (sección 13.6, Tabla 29)
    restricciones.sql     Restricciones que Prisma no expresa de forma nativa
  calidad/
    catalogo-requisitos.md    Los 20 requisitos RF y RNF (sección 9)
    matriz-trazabilidad.md    Trazabilidad completa y catálogo de casos (sección 12.3)
    matriz-riesgos.md         Los 10 riesgos RK (sección 17.2)
  gobierno/
    metodologia-de-trabajo.md Cómo trabajamos: cadencia, roles y definición de terminado
    plan-de-trabajo.md        Calendario por fases y backlog priorizado
    roles-y-raci.md           Los seis roles con personas asignadas
    actas/                    Actas de aceptación de fase y de sprint
```

---

## Cómo leer los diagramas

Los archivos `.puml` son la **fuente** de las figuras 1 a 10 del manual, en texto plano y versionable. Se renderizan con cualquiera de estas vías:

```bash
# Local, con PlantUML instalado
plantuml -tsvg docs/arquitectura/*.puml

# Sin instalar nada: pegar el contenido en
# https://www.plantuml.com/plantuml
```

En Visual Studio Code, la extensión *PlantUML* los previsualiza con `Alt+D`.

---

## Trazabilidad con el manual

| Carpeta o archivo | Sección del manual | Evidencia auditable que satisface |
|---|---|---|
| `docs/arquitectura/*.puml` | 13.1 a 13.7 | Documentos de arquitectura: diagramas UML y de datos, tablas de componentes, entidades e infraestructura. |
| `docs/datos/schema.prisma` | 13.6 | Modelo lógico de datos de veintiuna entidades. |
| `docs/datos/restricciones.sql` | 13.6, 17.2 | Reglas de integridad declaradas: expediente único, movimiento neto único, bitácora inmutable. |
| `docs/calidad/catalogo-requisitos.md` | 9 | Especificación de requisitos: catálogos RF y RNF. |
| `docs/calidad/matriz-trazabilidad.md` | 12.3 | Matriz de trazabilidad y resultados de prueba asociados. |
| `docs/calidad/matriz-riesgos.md` | 17.2 | Matriz de riesgos actualizada por fase y registro de tratamiento. |
| `docs/gobierno/metodologia-de-trabajo.md` | 11, 15, 16, 29 | Ciclo de vida, rituales y artefactos por fase. |
| `docs/gobierno/plan-de-trabajo.md` | 11.2, 39.1 | Plan de desarrollo por fase con calendario. |
| `docs/gobierno/roles-y-raci.md` | 1.2, 5.1, 5.3 | Organigrama funcional y matriz RACI con personas. |
| `docs/gobierno/actas/` | 10.4 | Actas de aceptación por fase, firmadas por Product Owner y QA. |

---

## Diferencias respecto del manual v2.0

Tres puntos en los que este repositorio va más allá del manual publicado. Ninguno cambia un requisito; los tres quedan sujetos al control de cambios de la sección 12.4 y pendientes de aprobación por Product Owner y QA.

1. **La matriz de trazabilidad se completó de 10 a 20 filas.** La Tabla 27 del manual cubre la mitad de los requisitos del catálogo. Las filas añadidas usan el criterio de verificación que el propio manual ya fija en las tablas 19 y 20.
2. **Se reconcilió el conjunto CS-SEG**, que el manual nombra con tres alcances distintos (01 a 04, 01 a 06 y 01 a 08). La reconciliación está explicada en `matriz-trazabilidad.md`, sección 4.
3. **Se incorporó la entidad `periodo`** al modelo de datos. La sección 13.6 declara veintiuna entidades y la Tabla 29 enumera veinte; `periodo` es la que falta, y es necesaria porque grupo, horario, inscripción y calificación dependen de ella.

---

## Convenciones

- Rama `main` protegida; ninguna fusión sin revisión de otro integrante (manual, sección 29).
- Commits con mensaje descriptivo; etiquetas SemVer por línea base de fase (secciones 15 y 32).
- Ningún secreto en el repositorio (sección 14.1 y riesgo RK-07).
- Ningún dato personal real fuera del ambiente piloto (sección 20.2 y riesgo RK-09).
