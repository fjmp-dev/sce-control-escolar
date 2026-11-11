'use client';
import { useId } from 'react';
import { useEstadoDelFormulario } from '@/componentes/formulario';

/** Una calificación con etiqueta propia; conserva lo escrito y marca el error si la API la rechaza (28.1). */
export function CampoDeCalificacion({
  nombre,
  etiqueta,
  valor,
}: Readonly<{ nombre: string; etiqueta: string; valor?: number }>) {
  const id = useId();
  const { campos, valores } = useEstadoDelFormulario();
  const invalido = campos?.includes(nombre) ?? false;
  const escrito = valores?.[nombre];
  return (
    <div className="campo academico-calificacion">
      <label htmlFor={id}>{etiqueta}</label>
      {invalido && (
        <p id={`${id}-error`} className="error-campo">
          <strong>Error:</strong> Escribe un número de 0 a 10, con dos decimales a lo más.
        </p>
      )}
      <input
        id={id}
        name={nombre}
        type="number"
        inputMode="decimal"
        min={0}
        max={10}
        step={0.01}
        aria-invalid={invalido || undefined}
        aria-describedby={invalido ? `${id}-error` : undefined}
        defaultValue={typeof escrito === 'string' ? escrito : valor}
      />
    </div>
  );
}
