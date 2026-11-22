import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { KeyResponse } from '@demo/shared';
import { Repository } from 'typeorm';
import { Artist } from './artists.entity.js';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistsRepository: Repository<Artist>,
  ) {}

  async findKeys(): Promise<KeyResponse[]> {
    const artists = await this.artistsRepository.find({
      select: { ArtistId: true, Name: true },
      order: { ArtistId: 'ASC' },
    });
    return artists.map((artist) => ({ key: artist.ArtistId, value: artist.Name }));
  }
}
