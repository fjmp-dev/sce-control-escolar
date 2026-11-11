-- Muestreo de bitacora (Tabla 57, AU-16): ultimos 25 asientos por accion. Lo ejecuta Seguridad en cada PR y cierre.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/muestreo-bitacora.sql
SELECT accion, autor, entidad, valor_anterior, fecha
  FROM (SELECT *, row_number() OVER (PARTITION BY accion ORDER BY fecha DESC) AS n FROM bitacora) b
 WHERE n <= 25
 ORDER BY accion, fecha DESC;
