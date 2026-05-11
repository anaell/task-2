import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const user = req['user'];

    // Example: role-based check
    if (user.role !== 'admin') {
      throw new UnauthorizedException({
        status: 'error',
        message: 'You do not have access to this resource',
      });
    }

    return true;
  }
}
