import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/HttpExceptionFilter.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger: Logger = new Logger('NestApplication');
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(3000);
  logger.log('Server connected: http://localhost:3000');
}
bootstrap();
