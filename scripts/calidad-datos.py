"""Calidad de datos del expediente y la inscripcion con Great Expectations (Tabla 39, Tabla 42 y AU-22).

Valida la base del ambiente con las consultas SQL versionadas de api/prisma/verificacion (CD-DAT-01 a 06, ocupación de
grupos, CS-SEG-06 en calificación, plantel, pago y constancia, y la tasa de conclusión de la Tabla 59) y con expectativas
de unicidad, completitud y formato de la Tabla 16, cada una con su atributo de ISO/IEC 25012. Escribe Data Docs en HTML y
un resumen en JSON. Falla si alguna expectativa no se cumple, si no evaluó nada o si alumno, inscripción o los pagos
aplicados están vacíos (una tabla vacía lo aprueba todo).
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


def iso(atributo: str, texto: str) -> dict:
    """Descripción y meta con el atributo de ISO/IEC 25012 (Tabla 16) que verifica la expectativa."""
    return {"description": f"{texto} (Tabla 16, {atributo})", "meta": {"iso25012": atributo}}


def suite(nombre: str, tabla: str, expectativas: list) -> gx.ValidationDefinition:
    # tabla: el nombre de una tabla o una consulta que la acota, para que el mínimo de filas cuente solo esas.
    activo = (
        fuente.add_query_asset(nombre, query=tabla)
        if tabla.startswith("SELECT")
        else fuente.add_table_asset(nombre, table_name=tabla)
    )
    lote = activo.add_batch_definition_whole_table(f"{nombre}-completa")
    conjunto = contexto.suites.add(gx.ExpectationSuite(name=nombre, expectations=expectativas))
    return contexto.validation_definitions.add(gx.ValidationDefinition(name=nombre, data=lote, suite=conjunto))


APLICADOS = "SELECT * FROM pago WHERE estado = 'aplicado'"
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
            ),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cs-seg-06-calificacion.sql"),
                description="CS-SEG-06: cada calificacion con su asiento, del profesor del grupo o de una correccion",
            ),
        ],
    ),
    suite(
        "historial",
        "historial",
        [
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cd-dat-02.sql"),
                description="CD-DAT-02: el historial coincide con el recalculo independiente de las calificaciones",
            ),
        ],
    ),
    suite(
        "inscripcion",
        "inscripcion",
        [
            gxe.ExpectTableRowCountToBeBetween(min_value=1),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cd-dat-05.sql"),
                description="CD-DAT-05: inscripciones sin matricula, periodo o carga",
            ),
            gxe.ExpectColumnValuesToBeInSet(
                column="estado",
                value_set=["borrador", "en_validacion", "rechazada", "confirmada", "ajustada", "cerrada"],
            ),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=(
                    "SELECT folio FROM inscripcion WHERE (estado = 'rechazada') <> (motivo_rechazo IS NOT NULL)"
                ),
                description="RNF-USU-001: toda inscripcion rechazada declara su motivo, y ninguna otra lo tiene",
            ),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=f"SELECT * FROM ({consulta('tasa-conclusion.sql')}) AS t WHERE sin_estado > 0",
                description="Tabla 59 y R-08: ninguna inscripción iniciada queda sin estado explícito",
            ),
        ],
    ),
    suite(
        "ocupacion",
        "grupo",
        [
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("ocupacion-de-grupos.sql"),
                description="RK-05: la ocupacion de cada grupo coincide con sus inscritos",
            ),
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
    suite(
        "bitacora-pago",
        "pago",
        [
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cs-seg-06-pago.sql"),
                description="CS-SEG-06: cada pago aplicado o rechazado con un solo asiento del usuario técnico",
            )
        ],
    ),
    suite(
        "conciliacion",
        APLICADOS,
        [
            # Sin pagos aplicados, CD-DAT-03 pasaría en vacío.
            gxe.ExpectTableRowCountToBeBetween(min_value=1, **iso("Completitud", "Hay pagos aplicados que conciliar")),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cd-dat-03.sql"),
                **iso("Consistencia", "CD-DAT-03: saldo contra movimientos, pago contra abono y corte contra abonos"),
            ),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=(
                    "SELECT 'pago ' || id FROM pago WHERE importe <= 0 OR importe <> round(importe, 2) UNION ALL "
                    "SELECT 'movimiento ' || id FROM movimiento WHERE importe <= 0 OR importe <> round(importe, 2)"
                ),
                **iso("Precisión", "Importes de pagos y movimientos mayores que cero y con dos decimales"),
            ),
        ],
    ),
    suite(
        "actualidad",
        APLICADOS,
        [
            gxe.ExpectTableRowCountToBeBetween(min_value=1, **iso("Completitud", "Hay pagos aplicados que medir")),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cd-dat-06.sql"),
                **iso("Actualidad", "CD-DAT-06: el reflejo del pago tarda menos de 60 s en el 95 % de los casos"),
            ),
        ],
    ),
    suite(
        "tramites",
        "tramite",
        [
            gxe.ExpectColumnValuesToBeInSet(
                column="tipo",
                value_set=["constancia", "no_adeudo", "historial"],
                **iso("Conformidad", "Tipo de trámite del catálogo de RF-007"),
            ),
            gxe.ExpectColumnValuesToBeInSet(
                column="estado",
                value_set=["recibida", "en_proceso", "lista", "entregada", "rechazada"],
                **iso("Consistencia", "Estado del trámite de la Fig. 6"),
            ),
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=(
                    "SELECT t.folio FROM tramite t LEFT JOIN documento d ON d.tramite_folio = t.folio "
                    "WHERE (d.folio IS NOT NULL) <> (t.estado IN ('lista', 'entregada'))"
                ),
                **iso("Consistencia", "Solo el trámite listo o entregado tiene documento, y siempre lo tiene"),
            ),
        ],
    ),
    suite(
        "documentos",
        "documento",
        [
            gxe.ExpectColumnValuesToMatchRegex(
                column="hash",
                regex=r"^[0-9a-f]{64}$",
                **iso("Conformidad", "El hash del documento es un SHA-256 en hexadecimal, de 64 caracteres"),
            ),
        ],
    ),
    # D-11, provisional hasta ratificarla con el catálogo institucional: los mismos patrones que valida la API.
    suite(
        "formato-materia",
        "materia",
        [
            gxe.ExpectColumnValuesToMatchRegex(
                column="clave",
                regex=r"^[A-Za-z0-9][A-Za-z0-9-]*$",
                **iso("Conformidad", "D-11: clave de materia alfanumérica con guion, como ISW-101"),
            ),
        ],
    ),
    suite(
        "formato-periodo",
        "periodo",
        [
            gxe.ExpectColumnValuesToMatchRegex(
                column="clave",
                regex=r"^[0-9]{4}[AB]$",
                **iso("Conformidad", "D-11: periodo con año de cuatro dígitos más A o B, como 2027A"),
            ),
        ],
    ),
    suite(
        "bitacora-constancia",
        "tramite",
        [
            gxe.UnexpectedRowsExpectation(
                unexpected_rows_query=consulta("cs-seg-06-constancia.sql"),
                description="CS-SEG-06: cada paso de un trámite con su asiento, en cadena y con su autor",
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
                "iso25012": (config.meta or {}).get("iso25012"),
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
