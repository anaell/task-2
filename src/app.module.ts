import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { doubleCsrf } from 'csrf-csrf';

export const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.SECRET_CSRF_KEY as string,
  // Use the ID your middleware attached to req['user']
  getSessionIdentifier: (req) => {
    return req['user'].id || 'guest'; // Fallback to 'guest' for logged-out users
  },
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Using the csrf middleware globally
// app.use(doubleCsrfProtection);

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
    consumer
      .apply(JWTParserMiddleware)
      .exclude({
        path: 'auth/*path' /** (.*) is regex. It means to catch everything after 'auth/' */,
        method: RequestMethod.ALL,
      })
      .forRoutes('*');
    consumer
      .apply(doubleCsrfProtection)
      .exclude({ path: 'auth/csrf-token', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
