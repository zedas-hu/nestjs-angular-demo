import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from '../artists/artists.entity.js';
import { TracksModule } from '../tracks/tracks.module.js';
import { AlbumsController } from './albums.controller.js';
import { AlbumsService } from './albums.service.js';
import { Album } from './albums.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Album, Artist]), TracksModule],
  providers: [AlbumsService],
  controllers: [AlbumsController],
})
export class AlbumsModule {}
