import { Controller, Get } from '@nestjs/common';
import { Track } from './tracks.entity.js';
import { TracksService } from './tracks.service.js';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  getAllTracks(): Promise<Track[]> {
    return this.tracksService.findAll();
  }

  @Get(':id')
  getTrackById(id: number): Promise<Track | null> {
    return this.tracksService.findOne(id);
  }
}
