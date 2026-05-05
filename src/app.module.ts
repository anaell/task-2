import { ExecutionContext, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseRepository } from './app.repository';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Req_Res_LoggingInterceptor } from './common/interceptors/req_res_logging.interceptor';
import { LoggingExceptionFilter } from './common/filters/exception_logging.filter';
import { AuthModule } from './auth/auth.module';
import {
  ThrottlerGuard,
  ThrottlerLimitDetail,
  ThrottlerModule,
} from '@nestjs/throttler';
import { ProfileGuard } from './common/guard/profile.guard';

@Module({
  imports: [
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
export class AppModule {}
