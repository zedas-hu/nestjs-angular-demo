import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenresController } from './genres.controller.js';
import { GenresService } from './genres.service.js';
import { Genre } from './genres.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Genre])],
  providers: [GenresService],
  controllers: [GenresController],
})
export class GenresModule {}
