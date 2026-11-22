import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { MediaTypeRecord } from '@demo/shared';
import { Repository } from 'typeorm';
import { problem } from '../common/problem.js';
import { MediaType } from './media-types.entity.js';

@Injectable()
export class MediaTypesService {
  constructor(
    @InjectRepository(MediaType)
    private readonly mediaTypesRepository: Repository<MediaType>,
  ) {}

  async findAll(): Promise<MediaTypeRecord[]> {
    const mediaTypes = await this.mediaTypesRepository.find({ order: { MediaTypeId: 'ASC' } });
    return mediaTypes.map((mediaType) => this.toRecord(mediaType));
  }

  async findById(id: number): Promise<MediaTypeRecord> {
    const mediaType = await this.mediaTypesRepository.findOneBy({ MediaTypeId: id });
    if (!mediaType) {
      throw problem(HttpStatus.NOT_FOUND, 'MEDIA_TYPE_NOT_FOUND');
    }
    return this.toRecord(mediaType);
  }

  private toRecord(mediaType: MediaType): MediaTypeRecord {
    return { mediaTypeId: mediaType.MediaTypeId, name: mediaType.Name };
  }
}
