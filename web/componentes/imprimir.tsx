'use client';

export function BotonImprimir() {
  return (
    <button type="button" className="boton boton-secundario no-imprimir" onClick={() => window.print()}>
      Imprimir comprobante
    </button>
  );
}
