'use client';
import { useId } from 'react';
import { useEstadoDelFormulario } from '@/componentes/formulario';
import { Insignia } from '@/componentes/insignia';
import type { Esquemas } from '@/lib/contrato';
import { horarioLegible } from '@/lib/formato';

type Grupo = Esquemas['GrupoRespuesta'];

/**
 * La oferta en tarjetas seleccionables (.opcion), con la casilla visible. Como <Casillas>, tras un error conserva lo
 * elegido y marca el campo. El texto de cada tarjeta se lee como una frase y es el nombre accesible de su casilla:
 * materia, grupo, cada sesión con su aula y los lugares. Se ve por renglones: la puntuación de la frase es solo para
 * el lector de pantalla.
 */
export function OfertaDeGrupos({
  periodo,
  oferta,
  marcadas,
}: Readonly<{ periodo: string; oferta: Grupo[]; marcadas: readonly string[] }>) {
  const id = useId();
  const { campos, valores } = useEstadoDelFormulario();
  const invalido = campos?.includes('grupos') ?? false;
  const elegidas = Array.isArray(valores?.grupos) ? valores.grupos : marcadas;
  return (
    <fieldset className="campo" aria-describedby={invalido ? `${id}-error` : undefined}>
      <legend>Oferta de {periodo}</legend>
      {invalido && (
        <p id={`${id}-error`} className="error-campo">
          <strong>Error:</strong> Elige al menos un grupo, solo uno por materia.
        </p>
      )}
      <div className="opciones">
        {oferta.map((g) => {
          const lugares = g.cupo - g.ocupacion;
          const ultima = g.horarios.length - 1;
          return (
            <label key={g.id} className="opcion">
              <input
                type="checkbox"
                name="grupos"
                value={String(g.id)}
                defaultChecked={elegidas.includes(String(g.id))}
              />
              <span className="inscripcion-grupo">
                <strong>
                  {g.materiaClave} {g.materiaNombre}
                </strong>
                <span className="inscripcion-clave">
                  <span className="solo-lector">, </span>grupo <span className="sin-corte">{g.clave}</span>
                  <span className="solo-lector">: </span>
                </span>
                {g.horarios.map((h, i) => (
                  <span key={`${h.dia}-${h.horaInicio}`} className="inscripcion-sesion">
                    {horarioLegible(h)}
                    <span className="solo-lector">{i === ultima ? '. ' : '; '}</span>
                  </span>
                ))}
                <Insignia tono={lugares > 0 ? 'exito' : 'advertencia'}>
                  {lugares > 0 ? `${lugares} ${lugares === 1 ? 'lugar' : 'lugares'}` : 'Sin lugares'}
                </Insignia>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
