import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseRepository } from './app.repository';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DatabaseRepository],
})
export class AppModule {}
