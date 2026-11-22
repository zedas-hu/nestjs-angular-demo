import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MAX_TRACK_DURATION_MILLISECONDS } from '@demo/shared';
import { createValidationPipe } from '../common/problem.js';
import { TrackListQueryDto } from './dto/track-list-query.dto.js';
import { TrackPostDto } from './dto/track-post.dto.js';
import { TracksController } from './tracks.controller.js';
import { TracksService } from './tracks.service.js';

describe('TracksController', () => {
  let controller: TracksController;
  const queryPipe = createValidationPipe('INVALID_TRACK_QUERY');
  const tracksService = {
    findAll: vi.fn(),
  };
  const transformQuery = (query: unknown) =>
    queryPipe.transform(query, { type: 'query', metatype: TrackListQueryDto });

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

  it('transforms and forwards a valid query with a single sort parameter', async () => {
    const paged = { content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } };
    tracksService.findAll.mockResolvedValue(paged);

    const query = await transformQuery({ filter: 'rock', page: '1', size: '5', sort: 'name,desc' });
    await expect(controller.getAllTracks(query)).resolves.toBe(paged);
    expect(tracksService.findAll).toHaveBeenCalledWith({
      filter: 'rock',
      page: 1,
      size: 5,
      sort: ['name,desc'],
    });
  });

  it('applies defaults when no query parameters are given', async () => {
    tracksService.findAll.mockResolvedValue({ content: [], page: {} });

    const query = await transformQuery({});
    await controller.getAllTracks(query);
    expect(tracksService.findAll).toHaveBeenCalledWith({
      filter: undefined,
      page: 0,
      size: 20,
      sort: [],
    });
  });

  it.each([
    [{ filter: ['x', 'y'] }, 'filter', 'FILTER_INVALID'],
    [{ page: ['1', '2'] }, 'page', 'PAGE_INVALID'],
    [{ page: '9007199254740992' }, 'page', 'PAGE_INVALID'],
    [{ page: '' }, 'page', 'PAGE_INVALID'],
    [{ size: '9007199254740992' }, 'size', 'SIZE_INVALID'],
    [{ size: '0' }, 'size', 'SIZE_INVALID'],
  ])('rejects malformed or unsafe query values: %s', async (query, field, message) => {
    const error = await transformQuery(query).catch((reason: HttpException) => reason);

    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(400);
    expect(error.getResponse()).toEqual({
      detail: 'INVALID_TRACK_QUERY',
      fieldErrors: { [field]: message },
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

  it('accepts a duration of exactly 100 hours', async () => {
    await expect(transformBody({ ...validBody, milliseconds: MAX_TRACK_DURATION_MILLISECONDS }))
      .resolves.toMatchObject({ milliseconds: MAX_TRACK_DURATION_MILLISECONDS });
  });

  it.each([MAX_TRACK_DURATION_MILLISECONDS + 1, 1e21])(
    'rejects durations above 100 hours (%s) with a 400 validation problem',
    async (milliseconds) => {
      const error = await transformBody({ ...validBody, milliseconds }).catch(
        (reason: HttpException) => reason,
      );

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(400);
      expect(error.getResponse()).toEqual({
        detail: 'INVALID_TRACK_DATA',
        fieldErrors: { milliseconds: 'DURATION_RANGE' },
      });
    },
  );
});
