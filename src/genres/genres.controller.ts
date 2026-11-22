import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import type { GenreRecord } from '@demo/shared';
import { GenresService } from './genres.service.js';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) { }

  @Get()
  getAllGenres(): Promise<GenreRecord[]> {
    return this.genresService.findAll();
  }

  @Get(':id')
  getGenreById(@Param('id', ParseIntPipe) id: number): Promise<GenreRecord> {
    return this.genresService.findById(id);
  }
}
