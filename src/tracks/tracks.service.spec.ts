import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Album } from '../albums/albums.entity.js';
import { Genre } from '../genres/genres.entity.js';
import { MediaType } from '../media-types/media-types.entity.js';
import { TrackListQueryDto } from './dto/track-list-query.dto.js';
import { TrackPostDto } from './dto/track-post.dto.js';
import { Track } from './tracks.entity.js';
import { TracksService } from './tracks.service.js';

const query = (overrides: Partial<TrackListQueryDto> = {}): TrackListQueryDto => ({
  filter: undefined,
  page: 0,
  size: 20,
  sort: [],
  ...overrides,
});

const post = (overrides: Partial<TrackPostDto> = {}): TrackPostDto => ({
  name: 'New Song',
  albumId: 1,
  genreId: 1,
  mediaTypeId: 1,
  composer: null,
  milliseconds: 200000,
  unitPrice: 0.99,
  ...overrides,
});

const expectProblem = async (promise: Promise<unknown>, status: number, detail: string) => {
  const error = await promise.then(
    () => {
      throw new Error('expected the promise to reject');
    },
    (reason: unknown) => reason,
  );
  expect(error).toBeInstanceOf(HttpException);
  expect((error as HttpException).getStatus()).toBe(status);
  expect((error as HttpException).getResponse()).toMatchObject({ detail });
};

describe('TracksService', () => {
  let dataSource: DataSource;
  let service: TracksService;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [Track, Album, Genre, MediaType],
    });
    await dataSource.initialize();
    for (const statement of [
      'CREATE TABLE artists (ArtistId INTEGER PRIMARY KEY, Name NVARCHAR(120))',
      'CREATE TABLE albums (AlbumId INTEGER PRIMARY KEY, Title NVARCHAR(160) NOT NULL, ArtistId INTEGER NOT NULL)',
      'CREATE TABLE genres (GenreId INTEGER PRIMARY KEY, Name NVARCHAR(120))',
      'CREATE TABLE media_types (MediaTypeId INTEGER PRIMARY KEY, Name NVARCHAR(120))',
      'CREATE TABLE tracks (TrackId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Name NVARCHAR(200) NOT NULL, AlbumId INTEGER, MediaTypeId INTEGER NOT NULL, GenreId INTEGER, Composer NVARCHAR(220), Milliseconds INTEGER NOT NULL, Bytes INTEGER, UnitPrice NUMERIC(10,2) NOT NULL)',
    ]) {
      await dataSource.query(statement);
    }
    await dataSource.query('CREATE TABLE invoice_items (InvoiceLineId INTEGER PRIMARY KEY, TrackId INTEGER NOT NULL)');
    await dataSource.query('CREATE TABLE playlist_track (PlaylistId INTEGER NOT NULL, TrackId INTEGER NOT NULL, PRIMARY KEY (PlaylistId, TrackId))');
    await dataSource.query('INSERT INTO artists (ArtistId, Name) VALUES (1, ?), (2, ?), (3, ?)', ['U2', 'Miles Davis', 'Metallica']);
    await dataSource.query('INSERT INTO albums (AlbumId, Title, ArtistId) VALUES (1, ?, 1), (2, ?, 2), (3, ?, 3)', ['War', 'The Essential Miles Davis', "Kill 'Em All"]);
    await dataSource.query('INSERT INTO genres (GenreId, Name) VALUES (1, ?), (2, ?), (3, ?)', ['Rock', 'Jazz', 'Metal']);
    await dataSource.query('INSERT INTO media_types (MediaTypeId, Name) VALUES (1, ?)', ['MPEG audio file']);
    const tracks: [number, string, number, number, string, number][] = [
      [1, 'Sunday Bloody Sunday', 1, 1, 'U2', 460000],
      [2, "'Round Midnight", 2, 2, 'Miles Davis', 357459],
      [3, '(Anesthesia) Pulling Teeth', 3, 3, 'Cliff Burton', 254955],
    ];
    for (const [id, name, albumId, genreId, composer, milliseconds] of tracks) {
      await dataSource.query(
        'INSERT INTO tracks (TrackId, Name, AlbumId, MediaTypeId, GenreId, Composer, Milliseconds, Bytes, UnitPrice) VALUES (?, ?, ?, 1, ?, ?, ?, 1000, 0.99)',
        [id, name, albumId, genreId, composer, milliseconds],
      );
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TracksService,
        { provide: getRepositoryToken(Track), useValue: dataSource.getRepository(Track) },
        { provide: getRepositoryToken(Album), useValue: dataSource.getRepository(Album) },
        { provide: getRepositoryToken(Genre), useValue: dataSource.getRepository(Genre) },
        { provide: getRepositoryToken(MediaType), useValue: dataSource.getRepository(MediaType) },
      ],
    }).compile();

    service = module.get<TracksService>(TracksService);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('pages results with name sorting by default and returns the paging metadata', async () => {
    const first = await service.findAll(query({ size: 2 }));

    expect(first.page).toEqual({ size: 2, number: 0, totalElements: 3, totalPages: 2 });
    expect(first.content.map((track) => track.name)).toEqual(["'Round Midnight", '(Anesthesia) Pulling Teeth']);
    expect(first.content[0]).toEqual({
      trackId: 2,
      name: "'Round Midnight",
      albumId: 2,
      albumTitle: 'The Essential Miles Davis',
      artistName: 'Miles Davis',
      genreId: 2,
      genreName: 'Jazz',
      mediaTypeId: 1,
      mediaTypeName: 'MPEG audio file',
      composer: 'Miles Davis',
      milliseconds: 357459,
      bytes: 1000,
      unitPrice: 0.99,
    });

    const second = await service.findAll(query({ size: 2, page: 1 }));
    expect(second.content.map((track) => track.trackId)).toEqual([1]);
  });

  it('filters case-insensitively by track, album or artist name and treats wildcards literally', async () => {
    const byArtist = await service.findAll(query({ filter: ' u2 ' }));
    expect(byArtist.content.map((track) => track.trackId)).toEqual([1]);

    const byAlbum = await service.findAll(query({ filter: 'ESSENTIAL' }));
    expect(byAlbum.content.map((track) => track.trackId)).toEqual([2]);

    const byName = await service.findAll(query({ filter: 'teeth' }));
    expect(byName.content.map((track) => track.trackId)).toEqual([3]);

    const shortFilterIgnored = await service.findAll(query({ filter: 'a' }));
    expect(shortFilterIgnored.page.totalElements).toBe(3);

    const literalWildcard = await service.findAll(query({ filter: '%%' }));
    expect(literalWildcard.page.totalElements).toBe(0);
  });

  it('sorts by allowed properties and rejects unknown ones', async () => {
    const result = await service.findAll(query({ sort: ['albumArtistName,desc'] }));
    expect(result.content.map((track) => track.trackId)).toEqual([1, 2, 3]);

    await expectProblem(service.findAll(query({ sort: ['constructor'] })), 400, 'INVALID_TRACK_QUERY');
    await expectProblem(service.findAll(query({ sort: ['name,asc,whatever'] })), 400, 'INVALID_TRACK_QUERY');
  });

  it('rejects unsafe pagination values and offsets as a bad query', async () => {
    await expectProblem(service.findAll(query({ page: Number.MAX_SAFE_INTEGER, size: 2 })), 400, 'INVALID_TRACK_QUERY');
    await expectProblem(service.findAll(query({ size: Number.MAX_SAFE_INTEGER + 1 })), 400, 'INVALID_TRACK_QUERY');
  });

  it('creates a track and returns it in the list response shape', async () => {
    const created = await service.create(post({ composer: null }));

    expect(created).toMatchObject({
      trackId: 4,
      name: 'New Song',
      albumTitle: 'War',
      artistName: 'U2',
      genreName: 'Rock',
      composer: null,
      milliseconds: 200000,
      unitPrice: 0.99,
    });
  });

  it('finds a track by id in the list response shape', async () => {
    await expect(service.findById(1)).resolves.toMatchObject({
      trackId: 1,
      albumTitle: 'War',
      artistName: 'U2',
      bytes: expect.any(Number),
    });
  });

  it('returns 404 when a track id does not exist', async () => {
    await expectProblem(service.findById(999), 404, 'TRACK_NOT_FOUND');
  });

  it('rejects a duplicate name within the same album ignoring case', async () => {
    await expectProblem(service.create(post({ name: 'sunday BLOODY sunday' })), 409, 'TRACK_NAME_DUPLICATION');
  });

  it('rejects an unknown album on create', async () => {
    await expectProblem(service.create(post({ albumId: 999 })), 400, 'ALBUM_NOT_FOUND');
  });

  it('updates a track while keeping its own unchanged name even when another track shares it', async () => {
    await dataSource.query(
      'INSERT INTO tracks (TrackId, Name, AlbumId, MediaTypeId, GenreId, Composer, Milliseconds, Bytes, UnitPrice) VALUES (4, ?, 1, 1, 1, NULL, 300000, NULL, 0.99)',
      ['Sunday Bloody Sunday'],
    );

    const updated = await service.update(1, post({ name: 'Sunday Bloody Sunday', milliseconds: 250000 }));
    expect(updated).toMatchObject({ trackId: 1, name: 'Sunday Bloody Sunday', milliseconds: 250000 });
  });

  it('rejects renaming a track to a name already used in the same album', async () => {
    await expectProblem(service.update(2, post({ name: 'sunday bloody sunday', albumId: 1 })), 409, 'TRACK_NAME_DUPLICATION');
  });

  it('returns 404 when updating a missing track', async () => {
    await expectProblem(service.update(999, post()), 404, 'TRACK_NOT_FOUND');
  });

  it('deletes a track together with its playlist references', async () => {
    await dataSource.query('INSERT INTO playlist_track (PlaylistId, TrackId) VALUES (1, 3)');

    await service.remove(3);

    expect(await dataSource.query('SELECT TrackId FROM tracks WHERE TrackId = 3')).toEqual([]);
    expect(await dataSource.query('SELECT TrackId FROM playlist_track WHERE TrackId = 3')).toEqual([]);
  });

  it('refuses to delete a track that is referenced by an invoice item', async () => {
    await dataSource.query('INSERT INTO invoice_items (InvoiceLineId, TrackId) VALUES (1, 3)');

    await expectProblem(service.remove(3), 409, 'TRACK_DELETE_REFERENCED');
    expect(await dataSource.query('SELECT TrackId FROM tracks WHERE TrackId = 3')).toHaveLength(1);
  });
});
