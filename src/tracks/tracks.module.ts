import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from '../albums/albums.entity.js';
import { Genre } from '../genres/genres.entity.js';
import { MediaType } from '../media-types/media-types.entity.js';
import { TracksService } from './tracks.service.js';
import { TracksController } from './tracks.controller.js';
import { Track } from './tracks.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Track, Album, Genre, MediaType])],
  providers: [TracksService],
  controllers: [TracksController],
})
export class TracksModule {}