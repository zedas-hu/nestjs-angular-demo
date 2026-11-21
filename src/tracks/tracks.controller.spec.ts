import { Test, TestingModule } from '@nestjs/testing';
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

  it('returns the records provided by the tracks service', async () => {
    const tracks = [{ TrackId: 1, Name: 'Track 1' }];
    tracksService.findAll.mockResolvedValue(tracks);

    await expect(controller.getAllTracks()).resolves.toBe(tracks);
    expect(tracksService.findAll).toHaveBeenCalledOnce();
  });
});
