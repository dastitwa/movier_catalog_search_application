import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import {
  Request,
  Response,
} from 'express';

@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter
{
  private readonly logger =
    new Logger(
      GlobalExceptionFilter.name,
    );

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx =
      host.switchToHttp();

    const response =
      ctx.getResponse<Response>();

    const request =
      ctx.getRequest<Request>();

    const status =
      exception instanceof
      HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof
      HttpException
        ? exception.message
        : 'Internal server error';

    const requestId =
      request['requestId'] ??
      'unknown';

    const errorLog = {
      timestamp:
        new Date().toISOString(),

      requestId,

      method:
        request.method,

      path:
        request.originalUrl,

      statusCode:
        status,

      error:
        message,
    };

    this.logger.error(
      JSON.stringify(errorLog),
      exception instanceof Error
        ? exception.stack
        : undefined,
    );

    response.status(status).json({
      statusCode: status,

      timestamp:
        new Date().toISOString(),

      requestId,

      path:
        request.originalUrl,

      message,
    });
  }
}