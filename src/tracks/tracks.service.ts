import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PagedModel, TrackRecord } from '@demo/shared';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Album } from '../albums/albums.entity.js';
import { businessError, problem } from '../common/problem.js';
import { Genre } from '../genres/genres.entity.js';
import { MediaType } from '../media-types/media-types.entity.js';
import { TrackListQueryDto } from './dto/track-list-query.dto.js';
import { TrackPostDto } from './dto/track-post.dto.js';
import { Track } from './tracks.entity.js';

type SortDirection = 'ASC' | 'DESC';

const SORT_COLUMNS = new Map<string, string>([
  ['name', 'track.Name'],
  ['composer', 'track.Composer'],
  ['milliseconds', 'track.Milliseconds'],
  ['unitPrice', 'track.UnitPrice'],
  ['albumTitle', 'album.Title'],
  ['genreName', 'genre.Name'],
  ['mediaTypeName', 'mediaType.Name'],
  ['albumArtistName', 'artist.Name'],
]);

const RESULT_COLUMNS: [column: string, alias: string][] = [
  ['track.TrackId', 'trackId'],
  ['track.Name', 'name'],
  ['album.AlbumId', 'albumId'],
  ['album.Title', 'albumTitle'],
  ['artist.Name', 'artistName'],
  ['genre.GenreId', 'genreId'],
  ['genre.Name', 'genreName'],
  ['mediaType.MediaTypeId', 'mediaTypeId'],
  ['mediaType.Name', 'mediaTypeName'],
  ['track.Composer', 'composer'],
  ['track.Milliseconds', 'milliseconds'],
  ['track.Bytes', 'bytes'],
  ['track.UnitPrice', 'unitPrice'],
];

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
    @InjectRepository(Album)
    private albumsRepository: Repository<Album>,
    @InjectRepository(Genre)
    private genresRepository: Repository<Genre>,
    @InjectRepository(MediaType)
    private mediaTypesRepository: Repository<MediaType>,
  ) {}

  async findAll(query: TrackListQueryDto): Promise<PagedModel<TrackRecord>> {
    if (!Number.isSafeInteger(query.page) || query.page < 0) {
      throw problem(HttpStatus.BAD_REQUEST, 'INVALID_TRACK_QUERY', { page: 'PAGE_INVALID' });
    }
    if (!Number.isSafeInteger(query.size) || query.size < 1) {
      throw problem(HttpStatus.BAD_REQUEST, 'INVALID_TRACK_QUERY', { size: 'SIZE_INVALID' });
    }
    if (!Number.isSafeInteger(query.page * query.size)) {
      throw problem(HttpStatus.BAD_REQUEST, 'INVALID_TRACK_QUERY', { page: 'PAGE_INVALID' });
    }
    if (query.filter !== undefined && typeof query.filter !== 'string') {
      throw problem(HttpStatus.BAD_REQUEST, 'INVALID_TRACK_QUERY', { filter: 'FILTER_INVALID' });
    }

    const [[firstColumn, firstDirection], ...restOrders] = this.parseSort(query.sort);
    const qb = this.createTrackQuery();
    this.applyFilter(qb, query.filter);

    const totalElements = await qb.getCount();
    qb.orderBy(firstColumn, firstDirection);
    for (const [column, direction] of restOrders) {
      qb.addOrderBy(column, direction);
    }
    qb.addOrderBy('track.TrackId', 'ASC')
      .offset(query.page * query.size)
      .limit(query.size);

    return {
      content: await qb.getRawMany<TrackRecord>(),
      page: {
        size: query.size,
        number: query.page,
        totalElements,
        totalPages: Math.ceil(totalElements / query.size),
      },
    };
  }

  findById(id: number): Promise<TrackRecord> {
    return this.findResponse(id);
  }

  async findByAlbumIds(albumIds: number[]): Promise<TrackRecord[]> {
    if (albumIds.length === 0) {
      return [];
    }
    return this.createTrackQuery()
      .where('track.AlbumId IN (:...albumIds)', { albumIds })
      .orderBy('track.TrackId', 'ASC')
      .getRawMany<TrackRecord>();
  }

  private createTrackQuery(): SelectQueryBuilder<Track> {
    const [[firstColumn, firstAlias], ...restColumns] = RESULT_COLUMNS;
    const qb = this.tracksRepository
      .createQueryBuilder('track')
      .select(firstColumn, firstAlias)
      .leftJoin('albums', 'album', 'album.AlbumId = track.AlbumId')
      .leftJoin('artists', 'artist', 'artist.ArtistId = album.ArtistId')
      .leftJoin('genres', 'genre', 'genre.GenreId = track.GenreId')
      .leftJoin('media_types', 'mediaType', 'mediaType.MediaTypeId = track.MediaTypeId');
    for (const [column, alias] of restColumns) {
      qb.addSelect(column, alias);
    }
    return qb;
  }

  private applyFilter(qb: SelectQueryBuilder<Track>, filter: string | undefined): void {
    const term = filter?.trim() ?? '';
    if (term.length < 2) {
      return;
    }
    const pattern = `%${term.normalize('NFC').toLowerCase().replace(/[\\%_]/g, '\\$&')}%`;
    qb.andWhere(
      new Brackets((where) =>
        where
          .where("unicode_lower(track.Name) LIKE :pattern ESCAPE '\\'", { pattern })
          .orWhere("unicode_lower(album.Title) LIKE :pattern ESCAPE '\\'")
          .orWhere("unicode_lower(artist.Name) LIKE :pattern ESCAPE '\\'"),
      ),
    );
  }

  private parseSort(sort: string[]): [string, SortDirection][] {
    const clauses = sort.length > 0 ? sort : ['name,asc'];
    return clauses.map((clause) => {
      const parts = clause.split(',').map((part) => part.trim());
      const [property, rawDirection = 'asc'] = parts;
      const column = SORT_COLUMNS.get(property);
      const dir = rawDirection.toLowerCase();
      if (parts.length > 2 || !column || (dir !== 'asc' && dir !== 'desc')) {
        throw problem(HttpStatus.BAD_REQUEST, 'INVALID_TRACK_QUERY', { sort: 'SORT_INVALID' });
      }
      return [column, dir.toUpperCase() as SortDirection];
    });
  }

  async create(dto: TrackPostDto): Promise<TrackRecord> {
    await this.ensureAlbumExists(dto.albumId);
    await this.ensureNameAvailable(dto, null);
    await this.ensureGenreAndMediaTypeExist(dto);

    const saved = await this.tracksRepository.save(this.tracksRepository.create(this.toTrackFields(dto)));
    return this.findResponse(saved.TrackId);
  }

  async update(id: number, dto: TrackPostDto): Promise<TrackRecord> {
    const track = await this.tracksRepository.findOneBy({ TrackId: id });
    if (!track) {
      throw problem(HttpStatus.NOT_FOUND, 'TRACK_NOT_FOUND');
    }

    await this.ensureAlbumExists(dto.albumId);
    // An unchanged name and album stay editable even if they duplicate another track.
    const unchanged = track.AlbumId === dto.albumId && track.Name === dto.name;
    if (!unchanged) {
      await this.ensureNameAvailable(dto, id);
    }
    await this.ensureGenreAndMediaTypeExist(dto);

    await this.tracksRepository.update(id, this.toTrackFields(dto));
    return this.findResponse(id);
  }

  async remove(id: number): Promise<void> {
    await this.tracksRepository.manager.transaction(async (manager) => {
      if (!(await manager.existsBy(Track, { TrackId: id }))) {
        throw problem(HttpStatus.NOT_FOUND, 'TRACK_NOT_FOUND');
      }
      const [{ count }] = await manager.query<{ count: number }[]>(
        'SELECT COUNT(*) AS count FROM invoice_items WHERE TrackId = ?',
        [id],
      );
      if (Number(count) > 0) {
        throw businessError('trackId', 'TRACK_DELETE_REFERENCED');
      }

      await manager.query('DELETE FROM playlist_track WHERE TrackId = ?', [id]);
      await manager.delete(Track, id);
    });
  }

  private async ensureAlbumExists(albumId: number): Promise<void> {
    if (!(await this.albumsRepository.existsBy({ AlbumId: albumId }))) {
      throw businessError('albumId', 'ALBUM_NOT_FOUND', HttpStatus.BAD_REQUEST);
    }
  }

  private async ensureGenreAndMediaTypeExist(dto: TrackPostDto): Promise<void> {
    if (!(await this.genresRepository.existsBy({ GenreId: dto.genreId }))) {
      throw businessError('genreId', 'GENRE_NOT_FOUND', HttpStatus.BAD_REQUEST);
    }
    if (!(await this.mediaTypesRepository.existsBy({ MediaTypeId: dto.mediaTypeId }))) {
      throw businessError('mediaTypeId', 'MEDIA_TYPE_NOT_FOUND', HttpStatus.BAD_REQUEST);
    }
  }

  private async ensureNameAvailable(dto: TrackPostDto, excludeTrackId: number | null): Promise<void> {
    const qb = this.tracksRepository
      .createQueryBuilder('track')
      .where('track.AlbumId = :albumId', { albumId: dto.albumId })
      .andWhere('unicode_lower(track.Name) = unicode_lower(:name)', { name: dto.name });
    if (excludeTrackId !== null) {
      qb.andWhere('track.TrackId <> :excludeTrackId', { excludeTrackId });
    }
    if (await qb.getExists()) {
      throw businessError('name', 'TRACK_NAME_DUPLICATION');
    }
  }

  private toTrackFields(dto: TrackPostDto): Partial<Track> {
    return {
      Name: dto.name,
      AlbumId: dto.albumId,
      GenreId: dto.genreId,
      MediaTypeId: dto.mediaTypeId,
      Composer: dto.composer,
      Milliseconds: dto.milliseconds,
      UnitPrice: dto.unitPrice,
    };
  }

  private async findResponse(id: number): Promise<TrackRecord> {
    const track = await this.createTrackQuery().where('track.TrackId = :id', { id }).getRawOne<TrackRecord>();
    if (!track) {
      throw problem(HttpStatus.NOT_FOUND, 'TRACK_NOT_FOUND');
    }
    return track;
  }

}
