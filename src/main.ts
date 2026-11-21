import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT ?? 8080);
}
await bootstrap();
