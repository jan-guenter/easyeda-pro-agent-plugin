export const BRIDGE_AUTHENTICATION_PROTOCOL =
  'easyeda-pro-control.bridge-auth.v1' as const;

const NONCE_BYTES = 32;
const NONCE_BASE64URL_LENGTH = 43;
const BASE64URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

type AuthenticationRole = 'server-challenge' | 'client-proof' | 'server-accepted';
type AuthenticationState =
  | 'idle'
  | 'awaiting-server-challenge'
  | 'awaiting-server-acceptance'
  | 'authenticated'
  | 'failed';

export interface ClientAuthenticationHello {
  clientNonce: string;
  protocol: typeof BRIDGE_AUTHENTICATION_PROTOCOL;
  type: 'auth.client_hello';
}

export interface ClientAuthenticationProof {
  clientNonce: string;
  clientProof: string;
  protocol: typeof BRIDGE_AUTHENTICATION_PROTOCOL;
  serverNonce: string;
  type: 'auth.client_proof';
}

export interface AuthenticationProgress {
  authenticatedSessionId?: string;
  outbound?: ClientAuthenticationProof;
}

interface ServerChallenge {
  clientNonce: string;
  protocol: typeof BRIDGE_AUTHENTICATION_PROTOCOL;
  serverNonce: string;
  serverProof: string;
  type: 'auth.server_challenge';
}

interface ServerAcceptance {
  clientNonce: string;
  clientProof: string;
  protocol: typeof BRIDGE_AUTHENTICATION_PROTOCOL;
  serverNonce: string;
  serverReceipt: string;
  sessionId: string;
  type: 'auth.accepted';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(record: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(record).sort();
  return JSON.stringify(actual) === JSON.stringify([...expected].sort());
}

function validNonce(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length === NONCE_BASE64URL_LENGTH &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

function parseServerChallenge(value: unknown): ServerChallenge {
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      'clientNonce',
      'protocol',
      'serverNonce',
      'serverProof',
      'type',
    ]) ||
    value.type !== 'auth.server_challenge' ||
    value.protocol !== BRIDGE_AUTHENTICATION_PROTOCOL ||
    !validNonce(value.clientNonce) ||
    !validNonce(value.serverNonce) ||
    !validNonce(value.serverProof)
  ) {
    throw new Error('The bridge server challenge is malformed.');
  }
  return {
    clientNonce: value.clientNonce,
    protocol: value.protocol,
    serverNonce: value.serverNonce,
    serverProof: value.serverProof,
    type: value.type,
  };
}

function parseServerAcceptance(value: unknown): ServerAcceptance {
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      'clientNonce',
      'clientProof',
      'protocol',
      'serverNonce',
      'serverReceipt',
      'sessionId',
      'type',
    ]) ||
    value.type !== 'auth.accepted' ||
    value.protocol !== BRIDGE_AUTHENTICATION_PROTOCOL ||
    !validNonce(value.clientNonce) ||
    !validNonce(value.serverNonce) ||
    !validNonce(value.clientProof) ||
    !validNonce(value.serverReceipt) ||
    !validNonce(value.sessionId)
  ) {
    throw new Error('The bridge server acceptance is malformed.');
  }
  return {
    clientNonce: value.clientNonce,
    clientProof: value.clientProof,
    protocol: value.protocol,
    serverNonce: value.serverNonce,
    serverReceipt: value.serverReceipt,
    sessionId: value.sessionId,
    type: value.type,
  };
}

function authenticationTranscript(
  role: AuthenticationRole,
  clientNonce: string,
  serverNonce: string,
  sessionId = '',
  clientProof = '',
): string {
  return JSON.stringify([
    BRIDGE_AUTHENTICATION_PROTOCOL,
    role,
    clientNonce,
    serverNonce,
    sessionId,
    clientProof,
  ]);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let accumulator = 0;
  let availableBits = 0;
  let output = '';
  for (const byte of bytes) {
    accumulator = accumulator * 256 + byte;
    availableBits += 8;
    while (availableBits >= 6) {
      availableBits -= 6;
      const index = Math.floor(accumulator / 2 ** availableBits) % 64;
      output += BASE64URL_ALPHABET[index] ?? '';
      accumulator %= 2 ** availableBits;
    }
  }
  if (availableBits > 0) {
    const index = (accumulator * 2 ** (6 - availableBits)) % 64;
    output += BASE64URL_ALPHABET[index] ?? '';
  }
  return output;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(Math.floor((value.length * 6) / 8));
  let accumulator = 0;
  let availableBits = 0;
  let outputIndex = 0;
  for (const character of value) {
    const index = BASE64URL_ALPHABET.indexOf(character);
    if (index === -1) {
      throw new Error('The bridge authentication proof is not base64url.');
    }
    accumulator = accumulator * 64 + index;
    availableBits += 6;
    while (availableBits >= 8) {
      availableBits -= 8;
      bytes[outputIndex] = Math.floor(accumulator / 2 ** availableBits) % 256;
      outputIndex += 1;
      accumulator %= 2 ** availableBits;
    }
  }
  return bytes;
}

function runtimeCrypto(): Crypto {
  const runtime = globalThis.crypto;
  if (
    runtime === undefined ||
    typeof runtime.getRandomValues !== 'function' ||
    typeof runtime.subtle.sign !== 'function' ||
    typeof runtime.subtle.verify !== 'function'
  ) {
    throw new TypeError('Secure Web Crypto is required for bridge authentication.');
  }
  return runtime;
}

async function importAuthenticationKey(authenticationKey: string): Promise<CryptoKey> {
  if (
    new TextEncoder().encode(authenticationKey).byteLength < 32 ||
    new TextEncoder().encode(authenticationKey).byteLength > 256 ||
    !/^[A-Za-z0-9_-]+$/.test(authenticationKey)
  ) {
    throw new Error('The embedded bridge authentication key is invalid.');
  }
  return runtimeCrypto().subtle.importKey(
    'raw',
    new TextEncoder().encode(authenticationKey),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(
  key: CryptoKey,
  role: AuthenticationRole,
  clientNonce: string,
  serverNonce: string,
  sessionId = '',
  clientProof = '',
): Promise<string> {
  const signature = await runtimeCrypto().subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(
      authenticationTranscript(role, clientNonce, serverNonce, sessionId, clientProof),
    ),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verify(
  key: CryptoKey,
  signature: string,
  role: AuthenticationRole,
  clientNonce: string,
  serverNonce: string,
  sessionId = '',
  clientProof = '',
): Promise<boolean> {
  return runtimeCrypto().subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(
      authenticationTranscript(role, clientNonce, serverNonce, sessionId, clientProof),
    ),
  );
}

export class BridgeMutualAuthenticator {
  private readonly key: Promise<CryptoKey>;
  private state: AuthenticationState = 'idle';
  private clientNonce = '';
  private serverNonce = '';
  private clientProof = '';

  public constructor(authenticationKey: string) {
    this.key = importAuthenticationKey(authenticationKey);
  }

  public begin(): ClientAuthenticationHello {
    if (this.state !== 'idle') {
      this.state = 'failed';
      throw new Error('Bridge authentication was started more than once.');
    }
    const nonce = new Uint8Array(NONCE_BYTES);
    runtimeCrypto().getRandomValues(nonce);
    this.clientNonce = bytesToBase64Url(nonce);
    this.state = 'awaiting-server-challenge';
    return {
      clientNonce: this.clientNonce,
      protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
      type: 'auth.client_hello',
    };
  }

  public async receive(value: unknown): Promise<AuthenticationProgress> {
    try {
      if (this.state === 'awaiting-server-challenge') {
        const challenge = parseServerChallenge(value);
        if (challenge.clientNonce !== this.clientNonce) {
          throw new Error('The bridge server challenge is not bound to this connection.');
        }
        const key = await this.key;
        if (
          !(await verify(
            key,
            challenge.serverProof,
            'server-challenge',
            this.clientNonce,
            challenge.serverNonce,
          ))
        ) {
          throw new Error('The bridge server proof is invalid.');
        }
        this.serverNonce = challenge.serverNonce;
        this.clientProof = await sign(
          key,
          'client-proof',
          this.clientNonce,
          this.serverNonce,
        );
        this.state = 'awaiting-server-acceptance';
        return {
          outbound: {
            clientNonce: this.clientNonce,
            clientProof: this.clientProof,
            protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
            serverNonce: this.serverNonce,
            type: 'auth.client_proof',
          },
        };
      }
      if (this.state === 'awaiting-server-acceptance') {
        const acceptance = parseServerAcceptance(value);
        if (
          acceptance.clientNonce !== this.clientNonce ||
          acceptance.serverNonce !== this.serverNonce ||
          acceptance.clientProof !== this.clientProof
        ) {
          throw new Error('The bridge acceptance is not bound to this connection.');
        }
        const key = await this.key;
        if (
          !(await verify(
            key,
            acceptance.serverReceipt,
            'server-accepted',
            this.clientNonce,
            this.serverNonce,
            acceptance.sessionId,
            this.clientProof,
          ))
        ) {
          throw new Error('The bridge server acceptance proof is invalid.');
        }
        this.state = 'authenticated';
        return { authenticatedSessionId: acceptance.sessionId };
      }
      throw new Error('The bridge sent a frame outside the authentication state machine.');
    } catch (error) {
      this.state = 'failed';
      throw error;
    }
  }

  public isAuthenticated(): boolean {
    return this.state === 'authenticated';
  }
}
