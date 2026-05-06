import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { uuidv4 } from 'uuidv7';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    console.error({
      req_id: request['id'] ? request['id'] : uuidv4(),
      request_method: request.method,
      request_endpoint: request.url,
      request_status: status,
    });

    const message: any =
      exception instanceof HttpException
        ? exception.getResponse() //exception.message
        : 'Internal server error';

    const messageBody =
      typeof message === 'string' ? { message: message } : message;

    response.status(status).json({
      status: 'error',
      ...messageBody,
    });
  }
}
