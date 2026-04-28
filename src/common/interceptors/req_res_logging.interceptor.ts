import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { uuidv4 } from 'uuidv7';
import { Request, Response } from 'express';

@Injectable()
export class Req_Res_LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();
    const req_id = uuidv4();
    request['id'] = req_id;

    return next.handle().pipe(
      tap(() => {
        const executionTime = Date.now() - startTime;
        const request_method = request.method;
        const request_endpoint = request.url;
        const request_status = response.statusCode;

        console.log({
          req_id,
          request_method,
          request_endpoint,
          request_status,
          executionTime,
        });
      }),
    );
  }
}
