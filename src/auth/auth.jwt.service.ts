import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorHandler } from '@nestjs/common/interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenUtilityFunction {
  constructor(private readonly jwtService: JwtService) {}
  async CreateAccessToken(user) {
    return await this.jwtService.signAsync(
      { id: user.id, role: user.role },
      { secret: process.env.ACCESS_JWT_SECRET, expiresIn: '3m' },
    );
  }

  async CreateRefreshToken(user) {
    return await this.jwtService.signAsync(
      { id: user.id, role: user.role },
      { secret: process.env.REFRESH_JWT_SECRET, expiresIn: '5m' },
    );
  }

  async Parse_VerifyAccessToken(access_token: string) {
    try {
      return await this.jwtService.verifyAsync(access_token, {
        secret: process.env.ACCESS_JWT_SECRET,
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        // Specific message for expired tokens
        throw new UnauthorizedException('Token has expired');
      }
      // General message for tampered/invalid tokens
      throw new UnauthorizedException('Invalid token');
    }
  }

  async Parse_VerifyRefreshToken(refresh_token: string) {
    try {
      return await this.jwtService.verifyAsync(refresh_token, {
        secret: process.env.REFRESH_JWT_SECRET,
      });
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        // Specific message for expired tokens
        throw new UnauthorizedException('Token has expired');
      }
      // General message for tampered/invalid tokens
      throw new UnauthorizedException('Invalid token');
    }
  }
}
