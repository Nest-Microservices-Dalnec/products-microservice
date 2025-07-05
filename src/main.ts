import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Main');

  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      // host: envs.host,
      port: envs.port,
    },

    // app.setGlobalPrefix('api');
    // app.useGlobalPipes(
    //   new ValidationPipe({
    //     whitelist: true,
    //     forbidNonWhitelisted: true,
    //   }),
    // );
  });

  // await app.listen(envs.port);
  // logger.log(`Application is running on: ${envs.port}`);
  logger.log(`Products Microservice running on: ${envs.port}`);
}
bootstrap();
