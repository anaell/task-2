import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { JwtTokenUtilityFunction } from 'src/auth/auth.jwt.service';
import { CacheRepository } from './auth.cache.repository';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  providers: [
    AuthService,
    AuthGuard,
    AuthRepository,
    JwtTokenUtilityFunction,
    CacheRepository,
  ],
  controllers: [AuthController],
  exports: [JwtTokenUtilityFunction, AuthGuard],
})
export class AuthModule {}
