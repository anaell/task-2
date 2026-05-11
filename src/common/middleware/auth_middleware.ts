import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtTokenUtilityFunction } from 'src/auth/auth.jwt.service';

@Injectable()
export class JWTParserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtTokenUtilityFunction) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // The middleware is only for adding the user which was gotten from the verified jwt to the request object. It does not throw any error if the token is invalid or missing. The guards will handle that.

    req['user'] = undefined; // Explicitly wipe any potential pollution

    const authHeader = req.headers['authorization'];

    if (authHeader?.startsWith('Bearer ')) {
      // Split "Bearer <token>"
      const [type, token] = authHeader.split(' ');

      if (type === 'Bearer' && token) {
        try {
          const parsed_token =
            await this.jwtService.Parse_VerifyAccessToken(token);

          req['user'] = parsed_token;
        } catch (error) {
          req['user'] = undefined;
        }
      }
    }
    next();
  }
}
