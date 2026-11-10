import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BotonImprimir } from '@/componentes/imprimir';
import { consultar, ErrorApi } from '@/lib/api';
import type { Esquemas } from '@/lib/contrato';
import { momentoLegible } from '@/lib/formato';

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
      <pre className="documento">{documento.contenido}</pre>
      <p>
        Emitido el {momentoLegible(documento.fechaEmision)}. Huella SHA-256: <code>{documento.hash}</code>
      </p>
      <BotonImprimir etiqueta="Imprimir documento" />
      <p className="no-imprimir">
        <Link href="/mis-tramites">Volver a mis trámites</Link>
      </p>
    </>
  );
}
