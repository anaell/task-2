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
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user: JwtPayload = req['user'];

    const user_status = await this.authRepository.GetUser_IsActive_Status(
      user.id,
    );
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
