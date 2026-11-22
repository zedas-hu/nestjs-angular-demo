import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { CurrentUser } from '@demo/shared';
import { Public } from './public.decorator.js';
import { SessionAuthGuard } from './session-auth.guard.js';

class TestController {
  @Public()
  publicMutation() { }

  mutation() { }

  read() { }
}

const loggedInUser: CurrentUser = { employeeId: 1, firstName: 'Jane', lastName: 'Peacock', email: 'jane@example.com' };

function contextFor(handler: () => void, method: string, currentUser?: CurrentUser): ExecutionContext {
  const request = { method, session: { currentUser } };
  return {
    getHandler: () => handler,
    getClass: () => TestController,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('SessionAuthGuard', () => {
  const guard = new SessionAuthGuard(new Reflector());
  const controller = new TestController();

  it('lets read requests through without a session', () => {
    expect(guard.canActivate(contextFor(controller.read, 'GET'))).toBe(true);
  });

  it('lets @Public() mutations through without a session', () => {
    expect(guard.canActivate(contextFor(controller.publicMutation, 'POST'))).toBe(true);
  });

  it('rejects a mutation without a session with 401', () => {
    try {
      guard.canActivate(contextFor(controller.mutation, 'POST'));
      expect.unreachable();
    } catch (error) {
      expect((error as HttpException).getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect((error as HttpException).getResponse()).toEqual({ detail: 'UNAUTHORIZED' });
    }
  });

  it('allows a mutation with a logged-in session', () => {
    expect(guard.canActivate(contextFor(controller.mutation, 'DELETE', loggedInUser))).toBe(true);
  });
});
