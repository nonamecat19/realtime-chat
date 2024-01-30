import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

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
  await app.listen(3000);
}

bootstrap().then();
