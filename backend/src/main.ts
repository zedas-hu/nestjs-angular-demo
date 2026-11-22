import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { AppModule } from './app.module.js';
import { parseTrustedProxies } from './common/trusted-proxies.js';

async function bootstrap() {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET is required (set it in backend/.env), at least 32 characters long');
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: parseTrustedProxies(process.env.TRUSTED_PROXIES) }),
  );
  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: sessionSecret,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto' },
  });
  app.setGlobalPrefix('api');
  // Fastify binds to localhost by default; 0.0.0.0 is needed so the Docker frontend container can reach it.
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}
await bootstrap();
