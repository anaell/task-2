import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ProfileGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    // header names are case-insensitive; 'Express/Node' lowercases them
    const apiVersion = req.header('x-api-version')?.toString().trim();

    if (!apiVersion) {
      throw new BadRequestException({
        status: 'error',
        message: 'API version header required',
      });
    }

    // To make clear that api-version "1" is the only supported one currently
    if (apiVersion !== '1') {
      throw new NotAcceptableException({
        status: 'error',
        message: 'Unsupported API version',
      });
    }

    return true;
  }
}
