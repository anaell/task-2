import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { JwtTokenUtilityFunction } from 'src/auth/auth.jwt.service';
import { CacheRepository } from './auth.cache.repository';

@Module({
  imports: [],
  providers: [
    AuthService,
    AuthRepository,
    JwtTokenUtilityFunction,
    CacheRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
