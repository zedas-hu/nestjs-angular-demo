import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const parseInteger = ({ value }: { value: unknown }) =>
  typeof value === 'string' && /^-?\d+$/.test(value) ? Number(value) : value;

const asArray = ({ value }: { value: unknown }) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

export class TrackListQueryDto {
  @IsOptional()
  @IsString({ message: 'FILTER_INVALID' })
  filter: string | undefined;

  @Transform(parseInteger)
  @Max(Number.MAX_SAFE_INTEGER, { message: 'PAGE_INVALID' })
  @Min(0, { message: 'PAGE_INVALID' })
  @IsInt({ message: 'PAGE_INVALID' })
  page = 0;

  @Transform(parseInteger)
  @Max(1000, { message: 'SIZE_INVALID' })
  @Min(1, { message: 'SIZE_INVALID' })
  @IsInt({ message: 'SIZE_INVALID' })
  size = 20;

  @Transform(asArray)
  @IsArray({ message: 'SORT_INVALID' })
  @IsString({ each: true, message: 'SORT_INVALID' })
  sort: string[] = [];
}
