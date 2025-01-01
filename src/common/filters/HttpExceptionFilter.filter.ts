import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = '';

    if (exception instanceof BadRequestException) {
      const errorRespons = exception.getResponse();
      if (errorRespons['message'] && Array.isArray(errorRespons['message'])) {
        message = {
          message: errorRespons['message'][0],
          error: errorRespons['error'],
          statusCode: errorRespons['statusCode'],
        };
      } else {
        message = exception.getResponse();
      }
    } else if (
      exception instanceof HttpException &&
      !(exception instanceof BadRequestException)
    ) {
      message = exception.getResponse();
    } else {
      message = 'Internal Server Error';
    }

    this.logger.error(
      `HTTP ${status} Error: ${JSON.stringify(message)}`,
      exception.stack,
      `Path: ${request.url} - Method: ${request.method}`,
    );
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
