import type { ProblemDetail } from '@demo/shared';
import type { ValidationError } from 'class-validator';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

export function problem(status: HttpStatus, detail: string, fieldErrors?: Record<string, string>): HttpException {
  const body: ProblemDetail = fieldErrors ? { detail, fieldErrors } : { detail };
  return new HttpException(body, status);
}

export function businessError(field: string, code: string, status = HttpStatus.CONFLICT): HttpException {
  return problem(status, code, { [field]: code });
}

export function createValidationPipe(detail: string): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    exceptionFactory: (errors: ValidationError[]) =>
      problem(HttpStatus.BAD_REQUEST, detail, toFieldErrors(errors)),
  });
}

function toFieldErrors(errors: ValidationError[]): Record<string, string> {
  return Object.fromEntries(
    errors.map((error) => [error.property, Object.values(error.constraints ?? {})[0] ?? '']),
  );
}
