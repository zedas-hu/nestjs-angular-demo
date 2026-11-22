import type { AlbumCreateRequest } from '@demo/shared';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const trimmed = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class AlbumPostDto implements AlbumCreateRequest {
  @Transform(trimmed)
  @MaxLength(120, { message: 'ARTIST_NAME_TOO_LONG' })
  @IsNotEmpty({ message: 'ARTIST_NAME_REQUIRED' })
  @IsString({ message: 'ARTIST_NAME_REQUIRED' })
  artistName: string;

  @IsOptional()
  @IsInt({ message: 'ARTIST_NOT_FOUND' })
  artistId: number | null;

  @Transform(trimmed)
  @MaxLength(160, { message: 'TITLE_TOO_LONG' })
  @IsNotEmpty({ message: 'TITLE_REQUIRED' })
  @IsString({ message: 'TITLE_REQUIRED' })
  title: string;
}
