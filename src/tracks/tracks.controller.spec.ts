import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createValidationPipe } from '../common/problem.js';
import { TrackPostDto } from './dto/track-post.dto.js';
import { TracksController } from './tracks.controller.js';
import { TracksService } from './tracks.service.js';

describe('TracksController', () => {
  let controller: TracksController;
  const tracksService = {
    findAll: vi.fn(),
  };

  beforeEach(async () => {
    tracksService.findAll.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksController],
      providers: [{ provide: TracksService, useValue: tracksService }],
    }).compile();

    controller = module.get<TracksController>(TracksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('normalises a single sort parameter into an array and forwards the query', async () => {
    const paged = { content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } };
    tracksService.findAll.mockResolvedValue(paged);

    await expect(controller.getAllTracks('rock', 1, 5, 'name,desc')).resolves.toBe(paged);
    expect(tracksService.findAll).toHaveBeenCalledWith({
      filter: 'rock',
      page: 1,
      size: 5,
      sort: ['name,desc'],
    });
  });

  it('passes an empty sort list when no sort parameter is given', async () => {
    tracksService.findAll.mockResolvedValue({ content: [], page: {} });

    await controller.getAllTracks(undefined, 0, 20, undefined);
    expect(tracksService.findAll).toHaveBeenCalledWith({
      filter: undefined,
      page: 0,
      size: 20,
      sort: [],
    });
  });
});

describe('track body validation', () => {
  const pipe = createValidationPipe('INVALID_TRACK_DATA');
  const validBody = {
    name: '  New Song ',
    albumId: 1,
    genreId: 1,
    mediaTypeId: 1,
    composer: '   ',
    milliseconds: 200000,
    unitPrice: 0.99,
  };
  const transformBody = (body: unknown) => pipe.transform(body, { type: 'body', metatype: TrackPostDto });

  it('trims the name and turns a blank composer into null', async () => {
    await expect(transformBody(validBody)).resolves.toMatchObject({ name: 'New Song', composer: null });
  });

  it('reports the Spring-style detail and the first message per invalid field', async () => {
    const error = await transformBody({ ...validBody, name: '  ', albumId: 0, milliseconds: 500, unitPrice: 1.123 }).catch(
      (reason: HttpException) => reason,
    );

    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toEqual({
      detail: 'INVALID_TRACK_DATA',
      fieldErrors: {
        name: 'TRACK_NAME_REQUIRED',
        albumId: 'ALBUM_REQUIRED',
        milliseconds: 'DURATION_RANGE',
        unitPrice: 'UNIT_PRICE_INVALID',
      },
    });
  });

  it('reports the required message for missing name and duration', async () => {
    const error = await transformBody({ ...validBody, name: undefined, milliseconds: undefined }).catch(
      (reason: HttpException) => reason,
    );

    expect(error.getResponse()).toMatchObject({
      fieldErrors: { name: 'TRACK_NAME_REQUIRED', milliseconds: 'DURATION_REQUIRED' },
    });
  });
});
