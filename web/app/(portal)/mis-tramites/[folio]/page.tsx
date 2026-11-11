import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Hoja } from '@/app/(portal)/tramites/piezas';
import { BotonImprimir } from '@/componentes/imprimir';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';

export const metadata = { title: 'Documento' };

/** Fig. 6: abrir el documento es descargarlo; la primera vez el trámite queda Entregado. */
export default async function PaginaDocumento({ params }: Readonly<{ params: Promise<{ folio: string }> }>) {
  const { folio } = await params;
  let documento: Esquemas['DocumentoRespuesta'];
  try {
    documento = await consultar(`/tramites/${encodeURIComponent(folio)}/documento`);
  } catch (error) {
    if (error instanceof ErrorApi && [400, 404, 409].includes(error.estado)) notFound();
    throw error;
  }
  return (
    <>
      <h1 className="no-imprimir">Documento {documento.folio}</h1>
      <p className="entrada no-imprimir">
        Para guardarlo, imprímelo o elige Guardar como PDF. Con su folio y su huella, control escolar comprueba que no
        ha cambiado.
      </p>
      <Hoja documento={documento} />
      <BotonImprimir etiqueta="Imprimir documento" />
      <p className="no-imprimir">
        <Link href="/mis-tramites" className="boton boton-secundario">
          Volver a mis trámites
        </Link>
      </p>
    </>
  );
}
