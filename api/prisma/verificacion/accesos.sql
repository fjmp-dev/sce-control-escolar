-- Revision de accesos (sec. 18, Anexo D): cuentas por rol, activas o no, para que Seguridad confirme que no hay cuentas
-- obsoletas. No es una consulta de cero filas: su salida va al registro del despliegue.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/accesos.sql
SELECT r.clave AS rol,
       count(*) FILTER (WHERE u.activo) AS activas,
       count(*) FILTER (WHERE NOT u.activo) AS inactivas
  FROM usuario u
  JOIN usuario_rol ur ON ur.usuario_id = u.id
  JOIN rol r ON r.id = ur.rol_id
 GROUP BY r.clave
 ORDER BY r.clave;
