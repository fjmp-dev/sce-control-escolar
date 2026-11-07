import type { ReactNode } from 'react';

export interface Columna<F> {
  titulo: string;
  celda: (fila: F) => ReactNode;
}

/**
 * Tabla 50: sin desbordes en 390x844. En pantallas angostas cada fila se apila con CSS.
 * Los roles son explícitos porque `display: block` les quita la semántica de tabla a los lectores de pantalla.
 */
export function Tabla<F>({
  titulo,
  columnas,
  filas,
  clave,
}: {
  titulo: string;
  columnas: Columna<F>[];
  filas: F[];
  clave: (fila: F) => string;
}) {
  if (filas.length === 0) return <p>Todavía no hay registros.</p>;
  return (
    <table role="table" className="tabla">
      <caption className="solo-lector">{titulo}</caption>
      <thead role="rowgroup">
        <tr role="row">
          {columnas.map((columna) => (
            <th key={columna.titulo} role="columnheader" scope="col">
              {columna.titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup">
        {filas.map((fila) => (
          <tr key={clave(fila)} role="row">
            {columnas.map((columna) => (
              <td key={columna.titulo} role="cell" data-etiqueta={columna.titulo}>
                {columna.celda(fila)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
