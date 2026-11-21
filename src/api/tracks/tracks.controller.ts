import { Controller, Get } from '@nestjs/common';

@Controller('tracks')
export class TracksController {
    @Get()
    getAllTracks() {
        return ["Track 1", "Track 2"];
    }
}
