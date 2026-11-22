import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('genres')
export class GenresController {
  @Get()
  getAllGenres() {
    // TODO: implement
  }

  @Get(':id')
  getGenreById(@Param('id', ParseIntPipe) id: number) {
    // TODO: implement
  }
}
