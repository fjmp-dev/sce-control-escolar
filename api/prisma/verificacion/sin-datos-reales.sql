-- Sec. 18.2 y RK-09: staging y pruebas no contienen datos personales reales. Meta: cero filas.
-- Todo dato sintetico va marcado: las cuentas usan el dominio reservado .test (RFC 2606), que no puede ser de nadie,
-- y los nombres de alumno empiezan con "Alumno" o "Alumna". Una fila es un dato que no sigue la convencion. La unica
-- excepcion es el usuario tecnico, sin rol ni acceso, que firma la bitacora de las operaciones automaticas.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/sin-datos-reales.sql
SELECT 'usuario' AS tabla, correo AS valor
  FROM usuario
 WHERE correo NOT LIKE '%@sce.test'
   AND correo <> 'sistema@sce.interno'
UNION ALL
SELECT 'alumno', matricula
  FROM alumno
 WHERE nombre !~ '^Alumn[oa] ';
