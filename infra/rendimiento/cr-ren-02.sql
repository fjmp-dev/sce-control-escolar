-- CR-REN-02 (Tablas 46 y 47, RNF-REN-002): concurrencia sin perdida ni duplicacion, enviadas contra persistidas.
-- Despues de cr-ren-02.js: cada solicitud enviada deja exactamente una inscripcion (confirmada o rechazada con motivo,
-- Fig. 4); CARGA-5 termina llena y sin sobrecupo; la ocupacion de cada grupo es la de sus inscritos. Meta: cero filas.
-- Uso: psql -v ON_ERROR_STOP=1 -v enviadas=<n> -At -f infra/rendimiento/cr-ren-02.sql
WITH carga AS (
  SELECT i.* FROM inscripcion i JOIN alumno a ON a.matricula = i.matricula
   WHERE a.nombre LIKE 'Alumno de carga %' AND i.periodo_clave = '2027A'
), grupos AS (
  SELECT g.clave, g.cupo, g.ocupacion,
         (SELECT count(*) FROM inscripcion_grupo ig JOIN inscripcion i ON i.folio = ig.folio
           WHERE ig.grupo_id = g.id AND i.estado IN ('confirmada', 'ajustada', 'cerrada')) AS inscritos
    FROM grupo g WHERE g.clave LIKE 'CARGA-%'
)
SELECT 'perdida o duplicacion' AS problema, format('%s enviadas, %s persistidas', :enviadas, count(*)) AS detalle
  FROM carga HAVING count(*) <> :enviadas
UNION ALL
SELECT 'ocupacion distinta de los inscritos', format('%s: ocupacion %s, inscritos %s', clave, ocupacion, inscritos)
  FROM grupos WHERE ocupacion <> inscritos
UNION ALL
SELECT 'sobrecupo o lugares sin asignar', format('%s: cupo %s, inscritos %s', clave, cupo, inscritos)
  FROM grupos WHERE clave = 'CARGA-5' AND inscritos <> cupo
UNION ALL
SELECT 'rechazo sin motivo', folio FROM carga WHERE estado = 'rechazada' AND motivo_rechazo IS NULL;
