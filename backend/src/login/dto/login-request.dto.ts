import type { LoginRequest } from '@demo/shared';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

const trimmed = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class LoginRequestDto implements LoginRequest {
  @Transform(trimmed)
  @IsEmail({}, { message: 'EMAIL_INVALID' })
  @IsNotEmpty({ message: 'EMAIL_REQUIRED' })
  email: string;
}
