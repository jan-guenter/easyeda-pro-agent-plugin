import { describe, expect, it } from 'vitest';
import {
  HEARTBEAT_TIMEOUT_MS,
  hasHeartbeatTimedOut,
  isServerActivityMessage,
  reconnectDelayMs,
  shouldReconnectAfterSocketFailure,
} from '../src/connection-policy.js';

describe('local bridge connection policy', () => {
  it('caps reconnect backoff at five seconds', () => {
    expect(reconnectDelayMs(1)).toBe(500);
    expect(reconnectDelayMs(2)).toBe(1000);
    expect(reconnectDelayMs(20)).toBe(5000);
  });

  it('marks a silent established socket as stale after the heartbeat deadline', () => {
    expect(hasHeartbeatTimedOut(1000, 1000 + HEARTBEAT_TIMEOUT_MS)).toBe(false);
    expect(hasHeartbeatTimedOut(1000, 1001 + HEARTBEAT_TIMEOUT_MS)).toBe(true);
    expect(hasHeartbeatTimedOut(0, 100_000)).toBe(false);
  });

  it('reconnects only after an established auto-connected socket fails', () => {
    expect(
      shouldReconnectAfterSocketFailure({
        wasConnected: true,
        manualDisconnectRequested: false,
        autoConnectEnabled: true,
      }),
    ).toBe(true);
    expect(
      shouldReconnectAfterSocketFailure({
        wasConnected: false,
        manualDisconnectRequested: false,
        autoConnectEnabled: true,
      }),
    ).toBe(false);
    expect(
      shouldReconnectAfterSocketFailure({
        wasConnected: true,
        manualDisconnectRequested: true,
        autoConnectEnabled: true,
      }),
    ).toBe(false);
    expect(
      shouldReconnectAfterSocketFailure({
        wasConnected: true,
        manualDisconnectRequested: false,
        autoConnectEnabled: false,
      }),
    ).toBe(false);
  });

  it('does not treat an echoed extension heartbeat as server activity', () => {
    expect(isServerActivityMessage('heartbeat', 'extension')).toBe(false);
    expect(isServerActivityMessage('heartbeat', 'server')).toBe(true);
    expect(isServerActivityMessage('heartbeat')).toBe(true);
    expect(isServerActivityMessage('request')).toBe(true);
    expect(isServerActivityMessage('hello')).toBe(true);
    expect(isServerActivityMessage('response')).toBe(false);
    expect(isServerActivityMessage('handshake')).toBe(false);
    expect(isServerActivityMessage('ignored-garbage')).toBe(false);
  });
});
