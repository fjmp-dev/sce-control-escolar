-- Datos de CI-MIG-01, sinteticos y fijados al esquema de la migracion 20261023001637_init (no a la ultima):
-- asi la prueba siempre simula una base con datos que recibe todas las migraciones posteriores.
-- Cubre las 21 tablas. Las columnas nuevas de migraciones futuras no se tocan aqui.
INSERT INTO usuario (id, correo, hash_contrasena, activo, creado_en) VALUES
  ('00000000-0000-4000-8000-000000000001', 'alumno.mig@sce.test', 'sin-hash', true, '2026-01-01T00:00:00Z'),
  ('00000000-0000-4000-8000-000000000002', 'profesor.mig@sce.test', 'sin-hash', true, '2026-01-01T00:00:00Z');
INSERT INTO rol (id, clave, nombre) VALUES (1, 'alumno', 'Alumno'), (2, 'profesor', 'Profesor');
INSERT INTO usuario_rol (usuario_id, rol_id, asignado_en) VALUES
  ('00000000-0000-4000-8000-000000000001', 1, '2026-01-01T00:00:00Z'),
  ('00000000-0000-4000-8000-000000000002', 2, '2026-01-01T00:00:00Z');
INSERT INTO facultad (clave, nombre) VALUES ('MIG', 'Facultad sintetica');
INSERT INTO plan_estudios (clave, facultad_clave, creditos_totales, vigente_desde) VALUES ('MIG-2024', 'MIG', 300, '2024-08-01');
INSERT INTO materia (clave, plan_clave, nombre, creditos) VALUES
  ('MIG-101', 'MIG-2024', 'Materia uno', 6),
  ('MIG-102', 'MIG-2024', 'Materia dos', 6);
INSERT INTO prerequisito (materia_clave, requiere_clave, obligatorio) VALUES ('MIG-102', 'MIG-101', true);
INSERT INTO periodo (clave, fecha_inicio, fecha_fin, estado) VALUES ('2026B', '2026-08-01', '2026-12-15', 'en_curso');
INSERT INTO alumno (matricula, nombre, facultad_clave, usuario_id, fecha_ingreso, estatus) VALUES
  ('9000001', 'Alumno Sintetico', 'MIG', '00000000-0000-4000-8000-000000000001', '2024-08-01', 'activo');
INSERT INTO historial (matricula, promedio, creditos_acumulados, avance, actualizado_en) VALUES
  ('9000001', 8.75, 120, 40.00, '2026-06-30T00:00:00Z');
INSERT INTO grupo (id, clave, materia_clave, periodo_clave, profesor_id, cupo, ocupacion) VALUES
  (1, 'G-1', 'MIG-102', '2026B', '00000000-0000-4000-8000-000000000002', 30, 1);
INSERT INTO horario (id, grupo_id, dia, hora_inicio, hora_fin, aula) VALUES (1, 1, 1, '08:00', '10:00', 'A-1');
INSERT INTO inscripcion (folio, matricula, periodo_clave, estado, motivo_rechazo, fecha) VALUES
  ('INS-MIG-1', '9000001', '2026B', 'confirmada', NULL, '2026-08-01T00:00:00Z');
INSERT INTO inscripcion_grupo (folio, grupo_id, fecha_alta) VALUES ('INS-MIG-1', 1, '2026-08-01T00:00:00Z');
INSERT INTO calificacion (id, folio, grupo_id, profesor_id, periodo_clave, parcial, valor, fecha_captura) VALUES
  (1, 'INS-MIG-1', 1, '00000000-0000-4000-8000-000000000002', '2026B', 1, 9.50, '2026-09-01T00:00:00Z');
INSERT INTO cuenta_alumno (matricula, saldo, actualizado_en) VALUES ('9000001', 0, '2026-08-02T00:00:00Z');
INSERT INTO pago (id, matricula, clave_idempotencia, referencia, importe, estado, fecha) VALUES
  (1, '9000001', 'idem-mig-1', 'ref-mig-1', 100.00, 'aplicado', '2026-08-02T00:00:00Z');
INSERT INTO movimiento (id, matricula, pago_id, concepto, importe, tipo, fecha) VALUES
  (1, '9000001', 1, 'Pago sintetico', 100.00, 'abono', '2026-08-02T00:00:00Z');
INSERT INTO tramite (folio, matricula, tipo, estado, fecha_solicitud, fecha_actualizacion) VALUES
  ('TRA-MIG-1', '9000001', 'constancia', 'lista', '2026-09-01T00:00:00Z', '2026-09-02T00:00:00Z');
INSERT INTO documento (folio, tramite_folio, tipo, hash, fecha_emision) VALUES
  ('DOC-MIG-1', 'TRA-MIG-1', 'constancia', 'hash-sintetico', '2026-09-02T00:00:00Z');
INSERT INTO bitacora (id, autor, accion, entidad, valor_anterior, fecha) VALUES
  (1, '00000000-0000-4000-8000-000000000002', 'captura', 'calificacion:1', '{"valor": 9.00}', '2026-09-01T00:00:00Z');
