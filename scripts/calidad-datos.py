"""Calidad de datos del expediente con Great Expectations (Tabla 39, Tabla 42 y AU-22).

Valida la base del ambiente con las consultas SQL versionadas de api/prisma/verificacion (CD-DAT-01 y 04, y CS-SEG-06
en plantel) y con expectativas de unicidad, completitud y formato. Escribe Data Docs en HTML y un resumen en JSON.
Falla si alguna expectativa no se cumple, si no evaluo nada o si la tabla alumno esta vacia (una tabla vacia lo aprueba todo).
Uso: python calidad-datos.py <url-postgres> <dir-de-consultas> <dir-de-salida>
"""

import json
import sys
from pathlib import Path

import great_expectations as gx
import great_expectations.expectations as gxe

url, consultas, salida = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
contexto = gx.get_context(mode="file", project_root_dir=str(salida))
fuente = contexto.data_sources.add_postgres("sce", connection_string=url)


def consulta(archivo: str) -> str:
    # Solo la sentencia: GX la envuelve, y los comentarios con punto y coma o el punto y coma final la romperian.
    lineas = [l for l in (consultas / archivo).read_text().splitlines() if not l.strip().startswith("--")]
    return "\n".join(lineas).strip().rstrip(";")


def suite(nombre: str, tabla: str, expectativas: list) -> gx.ValidationDefinition:
    lote = fuente.add_table_asset(tabla, table_name=tabla).add_batch_definition_whole_table(f"{tabla}-completa")
    conjunto = contexto.suites.add(gx.ExpectationSuite(name=nombre, expectations=expectativas))
    return contexto.validation_definitions.add(gx.ValidationDefinition(name=nombre, data=lote, suite=conjunto))


validaciones = [
    suite(
        "expediente",
        "alumno",
        [
            gxe.ExpectTableRowCountToBeBetween(min_value=1),
            gxe.ExpectColumnValuesToBeUnique(column="matricula"),  # CD-DAT-01, RF-001
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cd-dat-01.sql"), description="CD-DAT-01: matriculas duplicadas"
            ),
            *[
                gxe.ExpectColumnValuesToNotBeNull(column=c)
                for c in ["nombre", "facultad_clave", "fecha_ingreso", "estatus"]
            ],
            gxe.ExpectColumnValuesToBeInSet(column="estatus", value_set=["activo", "baja", "egresado"]),
            # D-11, provisional hasta ratificarla con el catalogo institucional (Tabla 16, Conformidad).
            gxe.ExpectColumnValuesToMatchRegex(column="matricula", regex=r"^[0-9]{7,10}$"),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=(
                    "SELECT a.matricula FROM alumno a "
                    "LEFT JOIN historial h ON h.matricula = a.matricula "
                    "LEFT JOIN cuenta_alumno c ON c.matricula = a.matricula "
                    "WHERE h.matricula IS NULL OR c.matricula IS NULL"
                ),
                description="Completitud (Tabla 16): todo expediente tiene historial y cuenta",
            ),
        ],
    ),
    suite(
        "integridad",
        "calificacion",
        [
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cd-dat-04.sql"),
                description="CD-DAT-04: calificaciones sin grupo, periodo o profesor",
            )
        ],
    ),
    suite(
        "bitacora-plantel",
        "bitacora",
        [
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cs-seg-06-plantel.sql"),
                description="CS-SEG-06: cambios de plantel con asiento completo y coherente",
            )
        ],
    ),
]

punto = contexto.checkpoints.add(gx.Checkpoint(name="calidad-de-datos", validation_definitions=validaciones))
resultado = punto.run()
contexto.build_data_docs()

resumen = []
for corrida in resultado.run_results.values():
    for r in corrida.results:
        config = r.expectation_config
        resumen.append(
            {
                "expectativa": config.type,
                "columna": config.kwargs.get("column"),
                "descripcion": config.description,
                "exito": r.success,
                "observado": r.result.get("observed_value", r.result.get("unexpected_count")),
            }
        )
(salida / "resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=2, default=str))

evaluadas = len(resumen)
fallidas = [r for r in resumen if not r["exito"]]
print(f"Great Expectations: {evaluadas} expectativas, {len(fallidas)} incumplidas")
for r in fallidas:
    print(f"  INCUMPLIDA: {r['descripcion'] or r['expectativa']} {r['columna'] or ''} -> {r['observado']}")
sys.exit(0 if resultado.success and evaluadas >= 10 and not fallidas else 1)
