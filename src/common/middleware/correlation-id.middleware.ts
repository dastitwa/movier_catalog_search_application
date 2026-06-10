import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import {
  Request,
  Response,
  NextFunction,
} from 'express';

import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware
  implements NestMiddleware
{
  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const requestId =
      req.header('x-request-id') ??
      randomUUID();

    req['requestId'] = requestId;

    res.setHeader(
      'x-request-id',
      requestId,
    );

    next();
  }
}