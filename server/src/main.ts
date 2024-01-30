import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: 'http://localhost:5173',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    optionsSuccessStatus: 200,
    methods: '*',
    maxAge: 1000 * 60 * 60 * 24 * 14,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap().then();
