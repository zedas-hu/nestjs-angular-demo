import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';

@Controller('albums')
export class AlbumsController {
  @Get()
  getAllAlbums() {
    // TODO: implement
  }

  @Get('keys')
  getAllAlbumKeys() {
    // TODO: implement
  }

  @Get(':id')
  getAlbumById(@Param('id', ParseIntPipe) id: number) {
    // TODO: implement
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAlbum(@Param('id', ParseIntPipe) id: number) {
    // TODO: implement
  }

  @Post()
  createAlbum(@Body() request: unknown) {
    // TODO: implement
  }
}
