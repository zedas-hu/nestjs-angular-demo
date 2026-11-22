import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('media-types')
export class MediaTypesController {
  @Get()
  getAllMediaTypes() {
    // TODO: implement
  }

  @Get(':id')
  getMediaTypeById(@Param('id', ParseIntPipe) id: number) {
    // TODO: implement
  }
}
