// Don't use this. I did too much for this middleware and it was not necessary. I just needed to add the user to the request object and let the guards handle the rest. I will keep this file for reference but I will not use it in the app.module.ts
import {
  Headers,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtTokenUtilityFunction } from 'src/auth/auth.jwt.service';

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtTokenUtilityFunction) {}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'No authorization header found',
        });
      }
      // Split "Bearer <token>"
      const [type, token] = authHeader.split(' ');

      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException({
          status: 'error',
          message: 'Invalid token format',
        });
      }
      const parsed_token = await this.jwtService.Parse_VerifyAccessToken(token);

      req['user'] = parsed_token;

      next();

      // return token; // Now you can pass this to your utility function
    } catch (error) {
      if (error instanceof HttpException) {
        return next(error);
      }

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong try again later.',
      });
    }
  }
}
