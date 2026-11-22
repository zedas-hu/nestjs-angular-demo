import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import type { MediaTypeRecord } from '@demo/shared';
import { MediaTypesService } from './media-types.service.js';

@Controller('media-types')
export class MediaTypesController {
  constructor(private readonly mediaTypesService: MediaTypesService) { }

  @Get()
  getAllMediaTypes(): Promise<MediaTypeRecord[]> {
    return this.mediaTypesService.findAll();
  }

  @Get(':id')
  getMediaTypeById(@Param('id', ParseIntPipe) id: number): Promise<MediaTypeRecord> {
    return this.mediaTypesService.findById(id);
  }
}
