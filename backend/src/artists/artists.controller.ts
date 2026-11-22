import { Controller, Get } from '@nestjs/common';
import type { KeyResponse } from '@demo/shared';
import { ArtistsService } from './artists.service.js';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) { }

  @Get('keys')
  getAllArtistKeys(): Promise<KeyResponse[]> {
    return this.artistsService.findKeys();
  }
}
