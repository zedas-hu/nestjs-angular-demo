import type { CurrentUser } from '@demo/shared';

declare module 'fastify' {
  interface Session {
    currentUser?: CurrentUser;
  }
}
