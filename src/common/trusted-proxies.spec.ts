import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { parseTrustedProxies } from './trusted-proxies.js';

describe('parseTrustedProxies', () => {
  it('does not trust forwarded headers when no proxy is configured', () => {
    expect(parseTrustedProxies(undefined)).toBe(false);
    expect(parseTrustedProxies('  ')).toBe(false);
  });

  it('parses an explicit list of proxy addresses and CIDRs', () => {
    expect(parseTrustedProxies('127.0.0.1, 10.0.0.0/24')).toEqual(['127.0.0.1', '10.0.0.0/24']);
  });

  it.each(['*', 'all', '0.0.0.0/0', '10.0.0.0/00', '::/0', '127.0.0.1,', 'not-an-ip', '10.0.0.0/33'])(
    'rejects unsafe or malformed proxy configuration: %s',
    (value) => {
      expect(() => parseTrustedProxies(value)).toThrow();
    },
  );
});

describe('session cookie proxy trust', () => {
  it('sets Secure only when HTTPS is forwarded by a configured proxy', async () => {
    const app = Fastify({ trustProxy: parseTrustedProxies('127.0.0.1') });
    await app.register(fastifyCookie);
    await app.register(fastifySession, {
      secret: 'test-secret-that-is-long-enough-for-session',
      saveUninitialized: false,
      cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto' },
    });
    app.get('/', (request) => {
      request.session.currentUser = { employeeId: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' };
      return { ok: true };
    });
    await app.ready();

    try {
      const trustedResponse = await app.inject({
        method: 'GET',
        url: '/',
        remoteAddress: '127.0.0.1',
        headers: { 'x-forwarded-proto': 'https' },
      });
      const untrustedResponse = await app.inject({
        method: 'GET',
        url: '/',
        remoteAddress: '203.0.113.10',
        headers: { 'x-forwarded-proto': 'https' },
      });

      expect(trustedResponse.headers['set-cookie']).toMatch(/;\s*Secure(?:;|$)/i);
      expect(untrustedResponse.headers['set-cookie']).not.toMatch(/;\s*Secure(?:;|$)/i);
    } finally {
      await app.close();
    }
  });
});
