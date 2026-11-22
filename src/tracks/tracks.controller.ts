import { Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe,
  Post, Put, Query, Res } from '@nestjs/common';
import type { PagedModel, TrackRecord } from '@demo/shared';
import type { Response } from 'express';
import { createValidationPipe } from '../common/problem.js';
import { TrackPostDto } from './dto/track-post.dto.js';
import { TracksService } from './tracks.service.js';

const trackBodyPipe = createValidationPipe('INVALID_TRACK_DATA');

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) { }

  @Get()
  getAllTracks(
    @Query('filter') filter: string | undefined,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(20), ParseIntPipe) size: number,
    @Query('sort') sort: string | string[] | undefined,
  ): Promise<PagedModel<TrackRecord>> {
    return this.tracksService.findAll({
      filter,
      page,
      size,
      sort: [sort ?? []].flat(),
    });
  }

  @Get(':id')
  getTrackById(@Param('id', ParseIntPipe) id: number): Promise<TrackRecord> {
    return this.tracksService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrack(
    @Body(trackBodyPipe) body: TrackPostDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TrackRecord> {
    const track = await this.tracksService.create(body);
    res.location(`/api/tracks/${track.trackId}`);
    return track;
  }

  @Put(':id')
  updateTrack(
    @Param('id', ParseIntPipe) id: number,
    @Body(trackBodyPipe) body: TrackPostDto,
  ): Promise<TrackRecord> {
    return this.tracksService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTrack(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tracksService.remove(id);
  }
}
