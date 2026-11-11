'use client';

export function BotonImprimir({ etiqueta = 'Imprimir comprobante' }: Readonly<{ etiqueta?: string }>) {
  return (
    <button type="button" className="boton boton-secundario no-imprimir" onClick={() => window.print()}>
      {etiqueta}
    </button>
  );
}
