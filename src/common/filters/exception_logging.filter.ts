import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    console.error({
      req_id: request['id'],
      request_method: request.method,
      request_endpoint: request.url,
      request_status: status,
    });

    response.status(status).json({
      status: 'error',
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
    });
  }
}
