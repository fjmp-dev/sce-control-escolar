-- CO-FLE-01 (RNF-FLE-001, Batch 13): las facultades que dio de alta la prueba de flexibilidad (clave F3-...), con su
-- cadena completa hecha solo con datos: plan, materia del plan, grupo de esa materia, alumno de la facultad e
-- inscripción confirmada a ese grupo. La materia se liga a la facultad por su plan (Fig. 8: materia -> plan_estudios ->
-- facultad). Staging exige al menos una fila y ninguna incompleta (verificar-staging.sh); la integración, la suya.
SELECT f.clave AS facultad,
       EXISTS (
         SELECT 1
           FROM plan_estudios p
           JOIN materia m ON m.plan_clave = p.clave
           JOIN grupo g ON g.materia_clave = m.clave
           JOIN inscripcion_grupo ig ON ig.grupo_id = g.id
           JOIN inscripcion i ON i.folio = ig.folio AND i.estado IN ('confirmada', 'ajustada')
           JOIN alumno a ON a.matricula = i.matricula AND a.facultad_clave = f.clave
          WHERE p.facultad_clave = f.clave
       ) AS completa
  FROM facultad f
 WHERE f.clave LIKE 'F3-%'
 ORDER BY f.clave;
