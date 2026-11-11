-- Restricciones de integridad que el esquema de Prisma no expresa de forma
-- nativa. Se aplican justo despues de la migracion init.
-- Fuente: SCE-MC-001 v2.0, seccion 13.6. Riesgos RK-01, RK-02 y RK-03.
--
-- Ya cubiertas por el esquema, por eso no se repiten aqui:
--   RF-001 / RK-01  matricula es clave primaria de alumno: un expediente
--                   por matricula (un indice parcial adicional seria
--                   redundante y Prisma lo marcaria como drift).
--   RF-006 / RK-02  movimiento.pago_id y pago.clave_idempotencia son UNIQUE.

ALTER TABLE alumno
  ADD CONSTRAINT ck_alumno_estatus CHECK (estatus IN ('activo', 'baja', 'egresado'));

ALTER TABLE periodo
  ADD CONSTRAINT ck_periodo_estado CHECK (estado IN ('abierto', 'en_curso', 'cerrado'));

ALTER TABLE periodo
  ADD CONSTRAINT ck_periodo_rango CHECK (fecha_fin > fecha_inicio);

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

CREATE TRIGGER tg_bitacora_no_update
  BEFORE UPDATE OR DELETE ON bitacora
  FOR EACH ROW EXECUTE FUNCTION fn_bitacora_inmutable();

-- TRUNCATE no dispara triggers por fila; sin este, el dueno de la tabla
-- podria vaciarla.
CREATE TRIGGER tg_bitacora_no_truncate
  BEFORE TRUNCATE ON bitacora
  FOR EACH STATEMENT EXECUTE FUNCTION fn_bitacora_inmutable();

-- El rol de aplicacion solo inserta y lee.
REVOKE UPDATE, DELETE, TRUNCATE ON bitacora FROM PUBLIC;

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
