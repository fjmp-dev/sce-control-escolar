import { Injectable, NotFoundException } from '@nestjs/common';
import { BitacoraService } from '../bitacora/bitacora.service';
import { ErrorDeNegocio } from '../dominio/error-de-negocio';
import { UsuariosService } from '../identidad/usuarios.service';
import { PrismaService } from '../persistencia/prisma.service';
import { AlumnoRepository, FilaDeExpediente } from './alumno.repository';
import { Alumno, Estatus } from './dominio/alumno';

const entidad = (matricula: string) => `alumno:${matricula}`;

/** RF-001: expediente único, cambio de plantel y estatus, con bitácora en la misma transacción (Tabla 38). */
@Injectable()
export class ExpedienteService {
  constructor(
    private readonly alumnos: AlumnoRepository,
    private readonly usuarios: UsuariosService,
    private readonly bitacora: BitacoraService,
    private readonly prisma: PrismaService,
  ) {}

  buscar(texto?: string) {
    return this.alumnos.buscar(texto);
  }

  async consultar(matricula: string) {
    return this.conTrayectoria(await this.existente(matricula));
  }

  /** El alumno solo llega a su propio expediente: la matrícula sale de su sesión, no de la petición (CS-SEG-03). */
  async delUsuario(usuarioId: string) {
    const fila = await this.alumnos.porUsuario(usuarioId);
    if (!fila) {
      throw new ErrorDeNegocio(
        'SIN_EXPEDIENTE',
        'Tu cuenta no está vinculada a un expediente. Acude a control escolar.',
      );
    }
    return this.conTrayectoria(fila);
  }

  async alta(
    autor: string,
    datos: { matricula: string; nombre: string; facultadClave: string; fechaIngreso: Date; correo?: string },
  ) {
    const { correo, ...expediente } = datos;
    const usuarioId = correo ? await this.usuarios.cuentaDeAlumno(correo) : undefined;
    return this.prisma.transaccion(async () => {
      const creado = await this.alumnos.crear({ ...expediente, usuarioId });
      await this.bitacora.registrar({ autor, accion: 'alta_alumno', entidad: entidad(creado.matricula) });
      return this.conTrayectoria(creado);
    });
  }

  async cambiarFacultad(autor: string, matricula: string, destino: string) {
    const antes = await this.existente(matricula);
    const despues = this.dominio(antes).cambiarFacultad(destino);
    await this.prisma.transaccion(async () => {
      await this.alumnos.actualizar(matricula, { facultadClave: despues.facultadClave });
      await this.bitacora.registrar({
        autor,
        accion: 'cambio_plantel',
        entidad: entidad(matricula),
        valorAnterior: { facultadClave: antes.facultadClave },
      });
    });
    return this.consultar(matricula);
  }

  async cambiarEstatus(autor: string, matricula: string, nuevo: Estatus) {
    const antes = await this.existente(matricula);
    this.dominio(antes).cambiarEstatus(nuevo);
    await this.prisma.transaccion(async () => {
      await this.alumnos.actualizar(matricula, { estatus: nuevo });
      await this.bitacora.registrar({
        autor,
        accion: 'cambio_estatus',
        entidad: entidad(matricula),
        valorAnterior: { estatus: antes.estatus },
      });
    });
    return this.consultar(matricula);
  }

  async vincularCuenta(autor: string, matricula: string, correo: string) {
    const antes = await this.existente(matricula);
    const usuarioId = await this.usuarios.cuentaDeAlumno(correo);
    await this.prisma.transaccion(async () => {
      await this.alumnos.actualizar(matricula, { usuarioId });
      await this.bitacora.registrar({
        autor,
        accion: 'vinculo_cuenta',
        entidad: entidad(matricula),
        valorAnterior: { correo: antes.usuario?.correo ?? null },
      });
    });
    return this.consultar(matricula);
  }

  private async existente(matricula: string) {
    const fila = await this.alumnos.porMatricula(matricula);
    if (!fila) throw new NotFoundException();
    return fila;
  }

  private dominio(fila: FilaDeExpediente) {
    return new Alumno(fila.matricula, fila.facultadClave, fila.estatus as Estatus);
  }

  /** La trayectoria de planteles se reconstruye de la bitácora: el valor anterior de cada cambio y la facultad actual. */
  private async conTrayectoria(fila: FilaDeExpediente) {
    const cambios = await this.bitacora.asientos(entidad(fila.matricula), 'cambio_plantel');
    const anteriores = cambios.map((c) => (c.valorAnterior as { facultadClave: string }).facultadClave);
    const { usuario, facultad, historial, ...datos } = fila;
    return {
      ...datos,
      facultadNombre: facultad.nombre,
      correo: usuario?.correo ?? null,
      historial: {
        promedio: Number(historial?.promedio ?? 0),
        creditosAcumulados: historial?.creditosAcumulados ?? 0,
        avance: Number(historial?.avance ?? 0),
      },
      trayectoria: cambios.map((c, i) => ({
        de: anteriores[i],
        a: anteriores[i + 1] ?? fila.facultadClave,
        fecha: c.fecha,
      })),
    };
  }
}
