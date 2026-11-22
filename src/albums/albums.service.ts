import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { AlbumRecord, KeyResponse, TrackRecord } from '@demo/shared';
import { EntityManager, Repository } from 'typeorm';
import { Artist } from '../artists/artists.entity.js';
import { businessError, problem } from '../common/problem.js';
import { Track } from '../tracks/tracks.entity.js';
import { TracksService } from '../tracks/tracks.service.js';
import { Album } from './albums.entity.js';
import { AlbumPostDto } from './dto/album-post.dto.js';

interface AlbumRow {
  albumId: number;
  title: string;
  artistId: number;
  artistName: string | null;
}

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album)
    private readonly albumsRepository: Repository<Album>,
    private readonly tracksService: TracksService,
  ) {}

  async findAll(): Promise<AlbumRecord[]> {
    return this.withTracks(await this.findRows());
  }

  async findKeys(): Promise<KeyResponse[]> {
    const albums = await this.albumsRepository.find({
      select: { AlbumId: true, Title: true },
      order: { AlbumId: 'ASC' },
    });
    return albums.map((album) => ({ key: album.AlbumId, value: album.Title }));
  }

  async findById(id: number): Promise<AlbumRecord> {
    const rows = await this.findRows(id);
    if (rows.length === 0) {
      throw problem(HttpStatus.NOT_FOUND, 'ALBUM_NOT_FOUND');
    }
    const [album] = await this.withTracks(rows);
    return album;
  }

  async create(dto: AlbumPostDto): Promise<AlbumRecord> {
    const albumId = await this.albumsRepository.manager.transaction(async (manager) => {
      if (await manager.existsBy(Album, { Title: dto.title })) {
        throw businessError('title', 'TITLE_DUPLICATION');
      }
      const artistId = await this.resolveArtistId(manager, dto);
      const album = await manager.save(manager.create(Album, { Title: dto.title, ArtistId: artistId }));
      return album.AlbumId;
    });
    return this.findById(albumId);
  }

  async remove(id: number): Promise<void> {
    await this.albumsRepository.manager.transaction(async (manager) => {
      if (!(await manager.existsBy(Album, { AlbumId: id }))) {
        throw problem(HttpStatus.NOT_FOUND, 'ALBUM_NOT_FOUND');
      }
      const [{ count }] = await manager.query<{ count: number }[]>(
        'SELECT COUNT(*) AS count FROM invoice_items i JOIN tracks t ON t.TrackId = i.TrackId WHERE t.AlbumId = ?',
        [id],
      );
      if (Number(count) > 0) {
        throw businessError('albumId', 'ALBUM_DELETE_REFERENCED');
      }

      await manager.query(
        'DELETE FROM playlist_track WHERE TrackId IN (SELECT TrackId FROM tracks WHERE AlbumId = ?)',
        [id],
      );
      await manager.delete(Track, { AlbumId: id });
      await manager.delete(Album, id);
    });
  }

  private async resolveArtistId(manager: EntityManager, dto: AlbumPostDto): Promise<number> {
    if (dto.artistId == null) {
      const artist = await manager.save(manager.create(Artist, { Name: dto.artistName }));
      return artist.ArtistId;
    }
    if (!(await manager.existsBy(Artist, { ArtistId: dto.artistId }))) {
      throw businessError('artistId', 'ARTIST_NOT_FOUND', HttpStatus.BAD_REQUEST);
    }
    return dto.artistId;
  }

  private findRows(albumId?: number): Promise<AlbumRow[]> {
    const qb = this.albumsRepository
      .createQueryBuilder('album')
      .select('album.AlbumId', 'albumId')
      .addSelect('album.Title', 'title')
      .addSelect('artist.ArtistId', 'artistId')
      .addSelect('artist.Name', 'artistName')
      .innerJoin('artists', 'artist', 'artist.ArtistId = album.ArtistId')
      .orderBy('album.AlbumId', 'ASC');
    if (albumId !== undefined) {
      qb.where('album.AlbumId = :albumId', { albumId });
    }
    return qb.getRawMany<AlbumRow>();
  }

  private async withTracks(rows: AlbumRow[]): Promise<AlbumRecord[]> {
    const tracks = await this.tracksService.findByAlbumIds(rows.map((row) => row.albumId));
    const tracksByAlbum = new Map<number, TrackRecord[]>();
    for (const track of tracks) {
      if (track.albumId !== null) {
        tracksByAlbum.set(track.albumId, [...(tracksByAlbum.get(track.albumId) ?? []), track]);
      }
    }
    return rows.map((row) => ({ ...row, tracks: tracksByAlbum.get(row.albumId) ?? [] }));
  }
}
