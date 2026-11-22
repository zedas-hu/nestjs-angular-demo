import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsController } from './artists.controller.js';
import { ArtistsService } from './artists.service.js';
import { Artist } from './artists.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Artist])],
  providers: [ArtistsService],
  controllers: [ArtistsController],
})
export class ArtistsModule {}
