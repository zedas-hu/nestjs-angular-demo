import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TracksController } from './api/tracks/tracks.controller.js';

@Module({
  imports: [],
  controllers: [AppController, TracksController],
  providers: [AppService],
})
export class AppModule {}
