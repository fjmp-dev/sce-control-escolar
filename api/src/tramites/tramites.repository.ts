import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistencia/prisma.service';

const TRAMITE = {
  folio: true,
  matricula: true,
  tipo: true,
  estado: true,
  motivoRechazo: true,
  fechaSolicitud: true,
  fechaActualizacion: true,
  documento: { select: { folio: true } },
} as const;

const DOCUMENTO = {
  folio: true,
  tramiteFolio: true,
  tipo: true,
  contenido: true,
  hash: true,
  fechaEmision: true,
  tramite: { select: { matricula: true } },
} as const;

/** 14.3: aísla Prisma de los trámites y documentos (RF-007, RF-010). */
@Injectable()
export class TramitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  crear(data: { folio: string; matricula: string; tipo: string }) {
    return this.prisma.cliente().tramite.create({ data: { ...data, estado: 'recibida' }, select: TRAMITE });
  }

  deAlumno(matricula: string) {
    return this.prisma
      .cliente()
      .tramite.findMany({ where: { matricula }, select: TRAMITE, orderBy: { fechaSolicitud: 'desc' } });
  }

  cola(estado?: string) {
    return this.prisma
      .cliente()
      .tramite.findMany({ where: { estado }, select: TRAMITE, orderBy: { fechaSolicitud: 'asc' } });
  }

  async bloquear(folio: string) {
    await this.prisma.cliente().$queryRaw`SELECT folio FROM tramite WHERE folio = ${folio} FOR UPDATE`;
    return this.prisma.cliente().tramite.findUnique({ where: { folio }, select: TRAMITE });
  }

  actualizar(folio: string, estado: string, motivoRechazo: string | null) {
    return this.prisma.cliente().tramite.update({ where: { folio }, data: { estado, motivoRechazo }, select: TRAMITE });
  }

  async tieneHistorial(matricula: string) {
    return (await this.prisma.cliente().historial.count({ where: { matricula } })) > 0;
  }

  crearDocumento(data: { folio: string; tramiteFolio: string; tipo: string; hash: string; contenido: string }) {
    return this.prisma.cliente().documento.create({ data, select: DOCUMENTO });
  }

  documento(folio: string) {
    return this.prisma.cliente().documento.findUnique({ where: { folio }, select: DOCUMENTO });
  }

  documentoDeTramite(tramiteFolio: string) {
    return this.prisma.cliente().documento.findUnique({ where: { tramiteFolio }, select: DOCUMENTO });
  }
}
