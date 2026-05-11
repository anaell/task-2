import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseRepository } from './app.repository';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Req_Res_LoggingInterceptor } from './common/interceptors/req_res_logging.interceptor';
import { LoggingExceptionFilter } from './common/filters/exception_logging.filter';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ProfileGuard } from './common/guard/profile.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JWTParserMiddleware } from './common/middleware/auth_middleware';
import { JwtTokenUtilityFunction } from './auth/auth.jwt.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({ global: true }),
    CacheModule.register({ isGlobal: true }),
    AuthModule,
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'rate_limit',
    //     ttl: 60000,
    //     limit: 60,
    //   },
    // ]),
    // You can use the method above or the one below, but you can't combine both
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'rate_limit',
          limit: 60,
          ttl: 60000 /**ttl is in milliseconds */,
        },
      ],
      errorMessage: 'Too Many Requests',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseRepository,
    ProfileGuard,
    JWTParserMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: Req_Res_LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: LoggingExceptionFilter,
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JWTParserMiddleware).exclude('auth');
  }
}
