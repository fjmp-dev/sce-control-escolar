import 'reflect-metadata';
import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tabla 57: registro estructurado en formato JSON.
  const app = await NestFactory.create(AppModule, { logger: new ConsoleLogger({ json: true }) });
  await app.listen(process.env.PORT ?? 3001); // Fig. 9
}
void bootstrap();
