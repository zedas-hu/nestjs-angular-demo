import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { GenreRecord } from '@demo/shared';
import { Repository } from 'typeorm';
import { problem } from '../common/problem.js';
import { Genre } from './genres.entity.js';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,
  ) {}

  async findAll(): Promise<GenreRecord[]> {
    const genres = await this.genresRepository.find({ order: { GenreId: 'ASC' } });
    return genres.map((genre) => this.toRecord(genre));
  }

  async findById(id: number): Promise<GenreRecord> {
    const genre = await this.genresRepository.findOneBy({ GenreId: id });
    if (!genre) {
      throw problem(HttpStatus.NOT_FOUND, 'GENRE_NOT_FOUND');
    }
    return this.toRecord(genre);
  }

  private toRecord(genre: Genre): GenreRecord {
    return { genreId: genre.GenreId, name: genre.Name };
  }
}
