import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ExecutionTimeInterceptor
  implements NestInterceptor
{
  private readonly logger =
    new Logger(
      ExecutionTimeInterceptor.name,
    );

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const start = Date.now();

    const request =
      context
        .switchToHttp()
        .getRequest();

    const response =
      context
        .switchToHttp()
        .getResponse();

    const requestId =
      request.requestId ??
      'unknown';

    return next.handle().pipe(
      tap(() => {
        const log = {
          timestamp:
            new Date().toISOString(),

          requestId,

          method:
            request.method,

          path:
            request.originalUrl,

          statusCode:
            response.statusCode,

          durationMs:
            Date.now() - start,
        };

        this.logger.log(
          JSON.stringify(log),
        );
      }),
    );
  }
}