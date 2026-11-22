import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaTypesController } from './media-types.controller.js';
import { MediaTypesService } from './media-types.service.js';
import { MediaType } from './media-types.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MediaType])],
  providers: [MediaTypesService],
  controllers: [MediaTypesController],
})
export class MediaTypesModule {}
