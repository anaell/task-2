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
      errorMessage: 'Too many requests',
      // errorMessage can be a function that receives context and limit detail
      // The below is a way to dynamically generate the custom errorMessage depending on which rule was broken
      // errorMessage: (
      //   context: ExecutionContext,
      //   detail: ThrottlerLimitDetail,
      // ) => {
      //   const name = detail?.key ?? 'default';
      //   if (name === 'short')
      //     return 'Too many requests in a short burst. Slow down.';
      //   if (name === 'medium')
      //     return 'Too many requests in a short period. Try again later.';
      //   if (name === 'long')
      //     return 'You are making too many requests overall. Wait a minute.';
      //   return 'Too many requests';
      // },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseRepository,
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
