-- Restricciones de integridad que el esquema de Prisma no expresa de forma
-- nativa y que se aplican en la primera migracion.
-- Fuente: SCE-MC-001 v2.0, seccion 13.6. Riesgos RK-01, RK-02 y RK-03.
-- Estado: linea base de fase 0, pendiente de aprobacion por PO y QA.

-- ---------------------------------------------------------------------
-- RF-001 / RK-01: no existen dos expedientes activos para la misma
-- matricula. La matricula es clave primaria, de modo que la unicidad del
-- registro ya esta garantizada; este indice parcial impide ademas que un
-- proceso de cambio de plantel deje dos filas activas si en el futuro se
-- versiona el expediente.
-- ---------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS ux_alumno_activo
  ON alumno (matricula)
  WHERE estatus = 'activo';

-- ---------------------------------------------------------------------
-- RF-006 / RK-02: un pago confirmado produce un solo movimiento neto.
-- La clave de idempotencia ya es UNIQUE en la tabla pago; esta
-- restriccion cierra el otro extremo.
-- ---------------------------------------------------------------------
ALTER TABLE movimiento
  ADD CONSTRAINT ux_movimiento_pago UNIQUE (pago_id);

ALTER TABLE pago
  ADD CONSTRAINT ck_pago_estado
  CHECK (estado IN ('pendiente', 'aplicado', 'rechazado', 'cancelado'));

ALTER TABLE pago
  ADD CONSTRAINT ck_pago_importe CHECK (importe > 0);

-- ---------------------------------------------------------------------
-- RF-003 / RK-05: ningun grupo rebasa su cupo.
-- ---------------------------------------------------------------------
ALTER TABLE grupo
  ADD CONSTRAINT ck_grupo_cupo CHECK (ocupacion >= 0 AND ocupacion <= cupo);

-- ---------------------------------------------------------------------
-- RF-003: un horario no puede terminar antes de empezar.
-- La deteccion de traslape entre grupos de una misma carga se resuelve en
-- el dominio (CF-HOR-01); aqui solo se garantiza el rango valido.
-- ---------------------------------------------------------------------
ALTER TABLE horario
  ADD CONSTRAINT ck_horario_rango CHECK (hora_fin > hora_inicio);

ALTER TABLE horario
  ADD CONSTRAINT ck_horario_dia CHECK (dia BETWEEN 1 AND 6);

-- ---------------------------------------------------------------------
-- RNF-USU-001: toda inscripcion rechazada declara su causa, y ninguna
-- inscripcion confirmada arrastra un motivo de rechazo.
-- ---------------------------------------------------------------------
ALTER TABLE inscripcion
  ADD CONSTRAINT ck_inscripcion_estado
  CHECK (estado IN ('borrador','en_validacion','rechazada','confirmada','ajustada','cerrada'));

ALTER TABLE inscripcion
  ADD CONSTRAINT ck_inscripcion_motivo
  CHECK (
    (estado = 'rechazada' AND motivo_rechazo IN ('adeudo','prerrequisito','choque','cupo'))
    OR (estado <> 'rechazada' AND motivo_rechazo IS NULL)
  );

-- ---------------------------------------------------------------------
-- RF-004: la calificacion vive en el rango institucional.
-- ---------------------------------------------------------------------
ALTER TABLE calificacion
  ADD CONSTRAINT ck_calificacion_valor CHECK (valor >= 0 AND valor <= 10);

ALTER TABLE calificacion
  ADD CONSTRAINT ck_calificacion_parcial CHECK (parcial BETWEEN 1 AND 4);

-- ---------------------------------------------------------------------
-- RNF-SEG-001 / RK-03: la bitacora es inmutable. Se revoca la escritura
-- posterior y se bloquea con disparador, de modo que ni un rol con
-- permisos amplios pueda alterar el historial de operaciones sensibles.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_bitacora_inmutable()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'La bitacora es inmutable: no se permite % sobre bitacora', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_bitacora_no_update ON bitacora;
CREATE TRIGGER tg_bitacora_no_update
  BEFORE UPDATE OR DELETE ON bitacora
  FOR EACH ROW EXECUTE FUNCTION fn_bitacora_inmutable();

-- El rol de aplicacion solo inserta y lee.
REVOKE UPDATE, DELETE ON bitacora FROM PUBLIC;

-- ---------------------------------------------------------------------
-- RNF-DAT-001: consulta de verificacion de duplicados. Debe devolver cero
-- filas. Es la consulta que reejecutara el auditor en el criterio AU-21.
-- ---------------------------------------------------------------------
-- SELECT matricula, count(*)
--   FROM alumno
--  WHERE estatus = 'activo'
--  GROUP BY matricula
-- HAVING count(*) > 1;

-- ---------------------------------------------------------------------
-- RF-006: conciliacion. Todo pago aplicado tiene exactamente un
-- movimiento asociado. Debe devolver cero filas.
-- ---------------------------------------------------------------------
-- SELECT p.id, p.clave_idempotencia, count(m.id) AS movimientos
--   FROM pago p
--   LEFT JOIN movimiento m ON m.pago_id = p.id
--  WHERE p.estado = 'aplicado'
--  GROUP BY p.id, p.clave_idempotencia
-- HAVING count(m.id) <> 1;
