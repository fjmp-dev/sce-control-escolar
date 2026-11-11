-- Tasa de conclusión de inscripción (Tabla 59, Capacidad de interacción) y R-08 (RNF-USU-001, Fig. 6). Una sola fila.
-- Iniciadas: toda inscripción guardada; la rechazada también se guarda, con su motivo (CC-013). Concluidas:
-- confirmadas, ajustadas o cerradas. En estado explícito: las concluidas y las rechazadas con su motivo. Sin estado: las
-- demás, es decir, un borrador o una validación que se quedó así (un estado fuera de la Fig. 6 y un rechazo sin motivo
-- ya los impiden ck_inscripcion_estado y ck_inscripcion_motivo, y aquí se cuentan igual). Meta: cero sin estado.
-- La meta de la tasa (90 % o más) se mide en el piloto, no en una base de pruebas.
-- Reejecutar: psql "$DATABASE_URL" -f prisma/verificacion/tasa-conclusion.sql
WITH inscripciones AS (
  SELECT estado IN ('confirmada', 'ajustada', 'cerrada') AS concluida,
         estado IN ('confirmada', 'ajustada', 'cerrada')
           OR (estado = 'rechazada' AND motivo_rechazo IS NOT NULL) AS explicita
    FROM inscripcion
)
SELECT count(*) AS iniciadas,
       count(*) FILTER (WHERE concluida) AS concluidas,
       count(*) FILTER (WHERE explicita) AS en_estado_explicito,
       count(*) FILTER (WHERE explicita IS NOT TRUE) AS sin_estado,
       round(100.0 * count(*) FILTER (WHERE concluida) / nullif(count(*), 0), 2) AS tasa_conclusion
  FROM inscripciones;
