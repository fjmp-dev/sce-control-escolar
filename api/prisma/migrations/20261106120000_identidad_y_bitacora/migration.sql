-- Batch 2. CC-010: versión de sesión para revocar tokens (Tabla 38, CS-SEG-07).
ALTER TABLE usuario ADD COLUMN sesion_version INTEGER NOT NULL DEFAULT 0;

-- RF-008 y CC-007: los seis roles de uso y el rol técnico administrador. Viven en una migración,
-- no en el seed, porque todo ambiente los necesita y el seed es solo de datos sintéticos.
INSERT INTO rol (id, clave, nombre) VALUES
  (1, 'alumno', 'Alumno'),
  (2, 'profesor', 'Profesor'),
  (3, 'control_escolar', 'Control escolar'),
  (4, 'coordinacion', 'Coordinación académica'),
  (5, 'caja', 'Caja'),
  (6, 'direccion', 'Dirección'),
  (7, 'administrador', 'Administrador del sistema')
ON CONFLICT DO NOTHING;

-- CC-015: usuario técnico que firma en bitácora lo que no tiene autor humano. Inactivo, sin roles y con
-- un hash que ninguna contraseña satisface: no puede autenticarse.
INSERT INTO usuario (id, correo, hash_contrasena, activo) VALUES
  ('5ce00000-0000-4000-8000-000000000001', 'sistema@sce.interno', '!', false)
ON CONFLICT DO NOTHING;
