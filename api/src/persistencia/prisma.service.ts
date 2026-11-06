import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly enCurso = new AsyncLocalStorage<Prisma.TransactionClient>();

  /** Cliente que usan los repositorios: el de la transacción en curso, si la hay. */
  cliente(): Prisma.TransactionClient {
    return this.enCurso.getStore() ?? this;
  }

  /**
   * 14.1-6: toda escritura en más de una tabla va en transacción. Los repositorios se unen sin recibir
   * el cliente por parámetro, y así un dominio y la bitácora comparten transacción a través de servicios (Fig. 2).
   */
  transaccion<T>(operacion: () => Promise<T>): Promise<T> {
    if (this.enCurso.getStore()) return operacion();
    return this.$transaction((tx) => this.enCurso.run(tx, operacion));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
