import { NestFactory } from '@nestjs/core';
import {
  Logger,
  ValidationPipe,
} from '@nestjs/common';

import { AppModule } from './app.module';

import { GlobalExceptionFilter }
  from './common/filters/global-exception.filter';

import { ExecutionTimeInterceptor }
  from './common/interceptors/execution-time.interceptor';

let app: Awaited<
  ReturnType<typeof NestFactory.create>
>;

let isShutdownInitiated = false;

async function gracefulShutdown(
  signal: string,
): Promise<void> {
  if (isShutdownInitiated) {
    return;
  }

  isShutdownInitiated = true;

  const logger = new Logger('Shutdown');

  logger.log(
    `${signal} received. Starting graceful shutdown`,
  );

  try {
    logger.log(
      'Waiting 5 seconds for inflight requests to complete',
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 5000),
    );

    await app.close();

    logger.log(
      'Application shutdown completed',
    );
  } catch (error) {
    logger.error(
      'Graceful shutdown failed',
      error,
    );
  } finally {
    process.exit(0);
  }
}

async function bootstrap() {
  app = await NestFactory.create(
    AppModule,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(
    new GlobalExceptionFilter(),
  );

  app.useGlobalInterceptors(
    new ExecutionTimeInterceptor(),
  );

  app.enableCors({
    origin: '*',
  });

  app.setGlobalPrefix('api/v1');

  await app.listen(
    process.env.PORT ?? 3000,
  );

  const logger = new Logger('Bootstrap');

  logger.log(
    `Application listening on port ${
      process.env.PORT ?? 3000
    }`,
  );
}

process.on(
  'SIGINT',
  () => void gracefulShutdown('SIGINT'),
);

process.on(
  'SIGTERM',
  () => void gracefulShutdown('SIGTERM'),
);

bootstrap();