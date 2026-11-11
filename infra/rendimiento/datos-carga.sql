-- Datos de carga de CR-REN-01 a 05 (sec. 24, Tabla 47), sobre la semilla de staging. Solo staging: sinteticos y marcados
-- como manda sin-datos-reales.sql (correo .test y nombre "Alumno "), con la contrasena de alumno@sce.test, que es la de
-- la semilla de la corrida (CONTRASENA_SEMILLA).
-- - 1 000 alumnos, carga0001@sce.test a carga1000@sce.test, matriculas 2490001 a 2491000. Los impares deben la cuota de
--   2027A (perfil de pago); los pares no deben nada (perfil de inscripcion). Cada uno con historial y cuenta, y el saldo
--   igual a sus movimientos (CD-DAT-03).
-- - Materia CAR-101 sin prerrequisitos y dos grupos de 2027A: CARGA-A con lugar para todos y CARGA-5 con 5 lugares
--   (CR-REN-02: 100 alumnos por 5 lugares). Sabado, sin traslape de aula ni de profesor.
-- Como la semilla, escribe directo y sin bitacora: no es una operacion de usuario.
-- Uso: psql -v ON_ERROR_STOP=1 -f infra/rendimiento/datos-carga.sql   (rendimiento.yml)
BEGIN;

INSERT INTO usuario (id, correo, hash_contrasena)
SELECT gen_random_uuid(), format('carga%s@sce.test', lpad(n::text, 4, '0')),
       (SELECT hash_contrasena FROM usuario WHERE correo = 'alumno@sce.test')
  FROM generate_series(1, 1000) n;

INSERT INTO usuario_rol (usuario_id, rol_id)
SELECT u.id, (SELECT id FROM rol WHERE clave = 'alumno')
  FROM usuario u
 WHERE u.correo LIKE 'carga%@sce.test';

INSERT INTO alumno (matricula, nombre, facultad_clave, usuario_id, fecha_ingreso, estatus)
SELECT (2490000 + n)::text, format('Alumno de carga %s', lpad(n::text, 4, '0')), 'CUTG', u.id, DATE '2024-08-01', 'activo'
  FROM generate_series(1, 1000) n
  JOIN usuario u ON u.correo = format('carga%s@sce.test', lpad(n::text, 4, '0'));

INSERT INTO historial (matricula, actualizado_en)
SELECT (2490000 + n)::text, now() FROM generate_series(1, 1000) n;

INSERT INTO cuenta_alumno (matricula, saldo, actualizado_en)
SELECT (2490000 + n)::text, CASE WHEN n % 2 = 1 THEN 1850 ELSE 0 END, now() FROM generate_series(1, 1000) n;

INSERT INTO movimiento (matricula, concepto, importe, tipo)
SELECT (2490000 + n)::text, 'Cuota de inscripcion 2027A (carga)', 1850, 'cargo'
  FROM generate_series(1, 1000) n
 WHERE n % 2 = 1;

INSERT INTO materia (clave, plan_clave, nombre, creditos) VALUES ('CAR-101', 'ISW-2024', 'Materia de carga', 4);

INSERT INTO grupo (clave, materia_clave, periodo_clave, profesor_id, cupo)
SELECT g.clave, 'CAR-101', '2027A', (SELECT id FROM usuario WHERE correo = 'profesor@sce.test'), g.cupo
  FROM (VALUES ('CARGA-A', 1000), ('CARGA-5', 5)) g (clave, cupo);

INSERT INTO horario (grupo_id, dia, hora_inicio, hora_fin, aula)
SELECT g.id, 6, h.inicio, h.fin, h.aula
  FROM (VALUES ('CARGA-A', TIME '07:00', TIME '09:00', 'CARGA-1'), ('CARGA-5', TIME '10:00', TIME '12:00', 'CARGA-2'))
       h (clave, inicio, fin, aula)
  JOIN grupo g ON g.clave = h.clave AND g.periodo_clave = '2027A';

COMMIT;

SELECT clave, id FROM grupo WHERE clave LIKE 'CARGA-%' ORDER BY clave;
