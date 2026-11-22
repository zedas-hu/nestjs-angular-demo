import { Controller, Get } from '@nestjs/common';

@Controller('artists')
export class ArtistsController {
  @Get('keys')
  getAllArtistKeys() {
    // TODO: implement
  }
}
