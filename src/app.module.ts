import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseRepository } from './app.repository';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Req_Res_LoggingInterceptor } from './common/interceptors/req_res_logging.interceptor';
import { LoggingExceptionFilter } from './common/filters/exception_logging.filter';

@Module({
  imports: [],
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
  ],
})
export class AppModule {}
