import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe,
  Post, Put, Query, Res } from '@nestjs/common';
import type { PagedModel, TrackRecord } from '@demo/shared';
import type { FastifyReply } from 'fastify';
import { createValidationPipe } from '../common/problem.js';
import { TrackListQueryDto } from './dto/track-list-query.dto.js';
import { TrackPostDto } from './dto/track-post.dto.js';
import { TracksService } from './tracks.service.js';

const trackBodyPipe = createValidationPipe('INVALID_TRACK_DATA');
const trackQueryPipe = createValidationPipe('INVALID_TRACK_QUERY');

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) { }

  @Get()
  getAllTracks(@Query(trackQueryPipe) query: TrackListQueryDto): Promise<PagedModel<TrackRecord>> {
    return this.tracksService.findAll(query);
  }

  @Get(':id')
  getTrackById(@Param('id', ParseIntPipe) id: number): Promise<TrackRecord> {
    return this.tracksService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTrack(
    @Body(trackBodyPipe) body: TrackPostDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<TrackRecord> {
    const track = await this.tracksService.create(body);
    res.header('Location', `/api/tracks/${track.trackId}`);
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
