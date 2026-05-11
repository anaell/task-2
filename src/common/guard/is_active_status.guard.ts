import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthRepository } from 'src/auth/auth.repository';
import { JwtPayload } from 'src/auth/auth.types';

@Injectable()
export class IsActiveStatusGuard implements CanActivate {
  constructor(private readonly authRepository: AuthRepository) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user: JwtPayload = req['user'];

    const user_status = this.authRepository.GetUser_IsActive_Status(user.id);
    if (!user_status) {
      throw new ForbiddenException({
        status: 'error',
        message:
          'Your account is not active. Please contact the administrator.',
      });
    }

    return true;
  }
}
