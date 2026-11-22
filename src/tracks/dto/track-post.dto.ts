import type { TrackCreateRequest } from '@demo/shared';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';
import { Digits } from '../../common/validators.js';

const trimmed = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const blankToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? (value.trim() || null) : value;

export class TrackPostDto implements TrackCreateRequest {
  @Transform(trimmed)
  @MaxLength(200, { message: 'TRACK_NAME_TOO_LONG' })
  @IsNotEmpty({ message: 'TRACK_NAME_REQUIRED' })
  @IsString({ message: 'TRACK_NAME_REQUIRED' })
  name: string;

  @IsPositive({ message: 'ALBUM_REQUIRED' })
  @IsInt({ message: 'ALBUM_REQUIRED' })
  albumId: number;

  @IsPositive({ message: 'GENRE_REQUIRED' })
  @IsInt({ message: 'GENRE_REQUIRED' })
  genreId: number;

  @IsPositive({ message: 'MEDIA_TYPE_REQUIRED' })
  @IsInt({ message: 'MEDIA_TYPE_REQUIRED' })
  mediaTypeId: number;

  @Transform(blankToNull)
  @IsOptional()
  @MaxLength(220, { message: 'COMPOSER_TOO_LONG' })
  composer: string | null;

  @Min(1000, { message: 'DURATION_RANGE' })
  @IsInt({ message: 'DURATION_REQUIRED' })
  milliseconds: number;

  @Digits(8, 2, { message: 'UNIT_PRICE_INVALID' })
  @Min(0, { message: 'UNIT_PRICE_INVALID' })
  @IsNumber({}, { message: 'UNIT_PRICE_INVALID' })
  unitPrice: number;
}
