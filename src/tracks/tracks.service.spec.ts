import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TracksService } from './tracks.service.js';
import { Track } from './tracks.entity.js';

describe('TracksService', () => {
  let service: TracksService;
  const tracksRepository = {
    find: vi.fn(),
  };

  beforeEach(async () => {
    tracksRepository.find.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksService,
        { provide: getRepositoryToken(Track), useValue: tracksRepository },
      ],
    }).compile();

    service = module.get<TracksService>(TracksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('loads all track records from the repository', async () => {
    const tracks = [{ TrackId: 1, Name: 'Track 1' }];
    tracksRepository.find.mockResolvedValue(tracks);

    await expect(service.findAll()).resolves.toBe(tracks);
    expect(tracksRepository.find).toHaveBeenCalledOnce();
  });
});
