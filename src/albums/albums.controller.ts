import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import type { AlbumRecord, KeyResponse } from '@demo/shared';
import type { FastifyReply } from 'fastify';
import { createValidationPipe } from '../common/problem.js';
import { AlbumPostDto } from './dto/album-post.dto.js';
import { AlbumsService } from './albums.service.js';

const albumBodyPipe = createValidationPipe('INVALID_ALBUM_DATA');

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) { }

  @Get()
  getAllAlbums(): Promise<AlbumRecord[]> {
    return this.albumsService.findAll();
  }

  @Get('keys')
  getAllAlbumKeys(): Promise<KeyResponse[]> {
    return this.albumsService.findKeys();
  }

  @Get(':id')
  getAlbumById(@Param('id', ParseIntPipe) id: number): Promise<AlbumRecord> {
    return this.albumsService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAlbum(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.albumsService.remove(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAlbum(
    @Body(albumBodyPipe) body: AlbumPostDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<AlbumRecord> {
    const album = await this.albumsService.create(body);
    res.header('Location', `/api/albums/${album.albumId}`);
    return album;
  }
}
