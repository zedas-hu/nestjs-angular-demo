import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Album } from './albums.entity.js';
import { AlbumsService } from './albums.service.js';
import { AlbumPostDto } from './dto/album-post.dto.js';
import { Artist } from '../artists/artists.entity.js';
import { Genre } from '../genres/genres.entity.js';
import { MediaType } from '../media-types/media-types.entity.js';
import { Track } from '../tracks/tracks.entity.js';
import { TracksService } from '../tracks/tracks.service.js';

const post = (overrides: Partial<AlbumPostDto> = {}): AlbumPostDto => ({
  artistName: 'Metallica',
  artistId: null,
  title: 'Master of Puppets',
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

describe('AlbumsService', () => {
  let dataSource: DataSource;
  let service: AlbumsService;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [Album, Artist, Track, Genre, MediaType],
    });
    await dataSource.initialize();
    for (const statement of [
      'CREATE TABLE artists (ArtistId INTEGER PRIMARY KEY, Name NVARCHAR(120))',
      'CREATE TABLE albums (AlbumId INTEGER PRIMARY KEY, Title NVARCHAR(160) NOT NULL, ArtistId INTEGER NOT NULL)',
      'CREATE TABLE genres (GenreId INTEGER PRIMARY KEY, Name NVARCHAR(120))',
      'CREATE TABLE media_types (MediaTypeId INTEGER PRIMARY KEY, Name NVARCHAR(120))',
      'CREATE TABLE tracks (TrackId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Name NVARCHAR(200) NOT NULL, AlbumId INTEGER, MediaTypeId INTEGER NOT NULL, GenreId INTEGER, Composer NVARCHAR(220), Milliseconds INTEGER NOT NULL, Bytes INTEGER, UnitPrice NUMERIC(10,2) NOT NULL)',
      'CREATE TABLE invoice_items (InvoiceLineId INTEGER PRIMARY KEY, TrackId INTEGER NOT NULL)',
      'CREATE TABLE playlist_track (PlaylistId INTEGER NOT NULL, TrackId INTEGER NOT NULL, PRIMARY KEY (PlaylistId, TrackId))',
    ]) {
      await dataSource.query(statement);
    }
    await dataSource.query('INSERT INTO artists (ArtistId, Name) VALUES (1, ?), (2, ?)', ['U2', 'Miles Davis']);
    await dataSource.query('INSERT INTO albums (AlbumId, Title, ArtistId) VALUES (1, ?, 1), (2, ?, 2)', ['War', 'Kind of Blue']);
    await dataSource.query('INSERT INTO genres (GenreId, Name) VALUES (1, ?)', ['Rock']);
    await dataSource.query('INSERT INTO media_types (MediaTypeId, Name) VALUES (1, ?)', ['MPEG audio file']);
    const tracks: [number, string, number][] = [
      [1, 'Sunday Bloody Sunday', 1],
      [2, 'New Year’s Day', 1],
      [3, 'So What', 2],
    ];
    for (const [id, name, albumId] of tracks) {
      await dataSource.query(
        'INSERT INTO tracks (TrackId, Name, AlbumId, MediaTypeId, GenreId, Composer, Milliseconds, Bytes, UnitPrice) VALUES (?, ?, ?, 1, 1, NULL, 200000, 1000, 0.99)',
        [id, name, albumId],
      );
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumsService,
        TracksService,
        { provide: getRepositoryToken(Album), useValue: dataSource.getRepository(Album) },
        { provide: getRepositoryToken(Artist), useValue: dataSource.getRepository(Artist) },
        { provide: getRepositoryToken(Track), useValue: dataSource.getRepository(Track) },
        { provide: getRepositoryToken(Genre), useValue: dataSource.getRepository(Genre) },
        { provide: getRepositoryToken(MediaType), useValue: dataSource.getRepository(MediaType) },
      ],
    }).compile();

    service = module.get<AlbumsService>(AlbumsService);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('returns albums with their artist and tracks ordered by track id', async () => {
    const albums = await service.findAll();

    expect(albums.map((album) => album.albumId)).toEqual([1, 2]);
    expect(albums[0]).toMatchObject({ title: 'War', artistId: 1, artistName: 'U2' });
    expect(albums[0].tracks.map((track) => track.trackId)).toEqual([1, 2]);
    expect(albums[1].tracks.map((track) => track.trackId)).toEqual([3]);
  });

  it('returns 404 for an unknown album', async () => {
    await expectProblem(service.findById(999), 404, 'ALBUM_NOT_FOUND');
  });

  it('creates an artist and the album when no artistId is given', async () => {
    const created = await service.create(post());

    expect(created).toMatchObject({ title: 'Master of Puppets', artistName: 'Metallica', tracks: [] });
    const artists = await dataSource.query<{ Name: string }[]>('SELECT Name FROM artists WHERE ArtistId = ?', [created.artistId]);
    expect(artists).toEqual([{ Name: 'Metallica' }]);
  });

  it('rejects a duplicate title with 409 and an unknown artistId with 400', async () => {
    await expectProblem(service.create(post({ title: 'War' })), 409, 'TITLE_DUPLICATION');
    await expectProblem(service.create(post({ artistId: 999 })), 400, 'ARTIST_NOT_FOUND');
  });

  it('refuses to delete an album whose tracks are on an invoice', async () => {
    await dataSource.query('INSERT INTO invoice_items (InvoiceLineId, TrackId) VALUES (1, 3)');

    await expectProblem(service.remove(2), 409, 'ALBUM_DELETE_REFERENCED');
    expect(await service.findKeys()).toHaveLength(2);
  });

  it('deletes an album together with its tracks and playlist references', async () => {
    await dataSource.query('INSERT INTO playlist_track (PlaylistId, TrackId) VALUES (1, 1), (1, 3)');

    await service.remove(1);

    expect(await service.findKeys()).toEqual([{ key: 2, value: 'Kind of Blue' }]);
    expect(await dataSource.query('SELECT TrackId FROM tracks ORDER BY TrackId')).toEqual([{ TrackId: 3 }]);
    expect(await dataSource.query('SELECT TrackId FROM playlist_track')).toEqual([{ TrackId: 3 }]);
  });
});
