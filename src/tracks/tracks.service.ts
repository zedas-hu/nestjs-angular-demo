import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Track } from './tracks.entity.js';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
  ) {}

  findAll(): Promise<Track[]> {
    return this.tracksRepository.find();
  }

  findOne(id: number): Promise<Track | null> {
    return this.tracksRepository.findOneBy({ TrackId: id });
  }

  async remove(id: number): Promise<void> {
    await this.tracksRepository.delete(id);
  }

}