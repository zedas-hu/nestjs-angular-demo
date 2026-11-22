import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { problem } from '../common/problem.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Mirrors the Spring SessionAuthenticationInterceptor: every state-changing request needs a logged-in session,
// unless the handler is marked @Public().
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (SAFE_METHODS.has(request.method) || request.session.currentUser) {
      return true;
    }

    throw problem(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}
