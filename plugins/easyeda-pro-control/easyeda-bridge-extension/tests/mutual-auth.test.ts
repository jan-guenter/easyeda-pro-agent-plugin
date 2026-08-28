import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  BRIDGE_AUTHENTICATION_PROTOCOL,
  BridgeMutualAuthenticator,
} from '../src/mutual-auth.js';

const AUTHENTICATION_KEY = 'k'.repeat(64);

type AuthenticationRole = 'server-challenge' | 'client-proof' | 'server-accepted';

function mac(
  role: AuthenticationRole,
  clientNonce: string,
  serverNonce: string,
  sessionId = '',
  clientProof = '',
): string {
  return createHmac('sha256', AUTHENTICATION_KEY)
    .update(
      JSON.stringify([
        BRIDGE_AUTHENTICATION_PROTOCOL,
        role,
        clientNonce,
        serverNonce,
        sessionId,
        clientProof,
      ]),
      'utf8',
    )
    .digest('base64url');
}

describe('private bridge mutual authentication', () => {
  it('sends no bearer credential and completes only after reciprocal HMAC proofs', async () => {
    const authenticator = new BridgeMutualAuthenticator(AUTHENTICATION_KEY);
    const hello = authenticator.begin();
    expect(JSON.stringify(hello)).not.toContain(AUTHENTICATION_KEY);
    expect(JSON.stringify(hello)).not.toContain('sessionToken');
    const serverNonce = Buffer.alloc(32, 2).toString('base64url');
    const proofProgress = await authenticator.receive({
      clientNonce: hello.clientNonce,
      protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
      serverNonce,
      serverProof: mac('server-challenge', hello.clientNonce, serverNonce),
      type: 'auth.server_challenge',
    });
    expect(proofProgress.outbound).toBeDefined();
    expect(JSON.stringify(proofProgress.outbound)).not.toContain(AUTHENTICATION_KEY);
    expect(JSON.stringify(proofProgress.outbound)).not.toContain('sessionToken');
    const clientProof = proofProgress.outbound?.clientProof ?? '';
    const sessionId = Buffer.alloc(32, 3).toString('base64url');
    const accepted = await authenticator.receive({
      clientNonce: hello.clientNonce,
      clientProof,
      protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
      serverNonce,
      serverReceipt: mac(
        'server-accepted',
        hello.clientNonce,
        serverNonce,
        sessionId,
        clientProof,
      ),
      sessionId,
      type: 'auth.accepted',
    });
    expect(accepted).toEqual({ authenticatedSessionId: sessionId });
    expect(authenticator.isAuthenticated()).toBe(true);
  });

  it('rejects a fake hello before emitting a reusable client proof', async () => {
    const authenticator = new BridgeMutualAuthenticator(AUTHENTICATION_KEY);
    authenticator.begin();
    await expect(
      authenticator.receive({
        supportedProtocolVersions: ['1.0.0'],
        type: 'hello',
      }),
    ).rejects.toThrow(/challenge is malformed/i);
    expect(authenticator.isAuthenticated()).toBe(false);
  });

  it('rejects a bad server MAC and cannot resume the failed state machine', async () => {
    const authenticator = new BridgeMutualAuthenticator(AUTHENTICATION_KEY);
    const hello = authenticator.begin();
    const serverNonce = Buffer.alloc(32, 4).toString('base64url');
    await expect(
      authenticator.receive({
        clientNonce: hello.clientNonce,
        protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
        serverNonce,
        serverProof: Buffer.alloc(32, 5).toString('base64url'),
        type: 'auth.server_challenge',
      }),
    ).rejects.toThrow(/server proof is invalid/i);
    await expect(authenticator.receive({})).rejects.toThrow(/outside the authentication state/i);
  });
});
