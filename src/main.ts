import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/HttpExceptionFilter.filter';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger: Logger = new Logger('NestApplication');
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(3000);
  logger.log('Server connected: http://localhost:3000');
}
bootstrap();
