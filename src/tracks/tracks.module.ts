import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksService } from './tracks.service.js';
import { TracksController } from './tracks.controller.js';
import { Track } from './tracks.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Track])],
  providers: [TracksService],
  controllers: [TracksController],
})
export class TracksModule {}