import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import cookie from '@fastify/cookie';
import {randomBytes} from 'crypto';
import {ConfigService} from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const configService = app.get(ConfigService);
  app.enableCors({
    credentials: true,
    origin: configService.getOrThrow<string>('app.origin'),
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-csrf-token',
    optionsSuccessStatus: 200,
    methods: '*',
    maxAge: 1000 * 60 * 60 * 24 * 14,
  });
  app.useGlobalPipes(new ValidationPipe());
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  await app.register(cookie, {
    secret: randomBytes(32).toString('base64'),
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  await app.register(fastifyHelmet);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  await app.register(fastifyCsrfProtection);
  await app.listen(configService.getOrThrow<number>('app.port'));
}

bootstrap().then();
