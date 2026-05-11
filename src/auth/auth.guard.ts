import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtTokenUtilityFunction } from './auth.jwt.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtTokenUtilityFunction) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user = req['user'];

    if (!user) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Please login/register again',
      });
    }

    return true;
  }
}
