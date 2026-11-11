import type { ReactNode, Ref } from 'react';

/** 28.1: el estado no depende solo del color, lleva texto. */
const PREFIJO = { error: 'Error:', exito: 'Listo:', informacion: 'Aviso:' };

export function Aviso({
  tipo,
  children,
  ref,
}: {
  tipo: keyof typeof PREFIJO;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className={`aviso aviso-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'} tabIndex={-1}>
      <strong>{PREFIJO[tipo]}</strong> {children}
    </div>
  );
}
