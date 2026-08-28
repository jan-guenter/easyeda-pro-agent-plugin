export const PRIMARY_CONNECT_TIMEOUT_MS = 8000;
export const REGISTER_OPEN_CALLBACK_TIMEOUT_MS = 600;
export const RECONNECT_BASE_MS = 500;
export const RECONNECT_MAX_MS = 5000;
export const HEARTBEAT_INTERVAL_MS = 15_000;
export const HEARTBEAT_LIVENESS_MULTIPLIER = 3;
export const HEARTBEAT_TIMEOUT_MS = HEARTBEAT_INTERVAL_MS * HEARTBEAT_LIVENESS_MULTIPLIER;

export function reconnectDelayMs(attempt: number): number {
  const safeAttempt = Math.max(1, Math.trunc(attempt));
  return Math.min(RECONNECT_BASE_MS * 2 ** (safeAttempt - 1), RECONNECT_MAX_MS);
}

export interface SocketFailureReconnectInput {
  wasConnected: boolean;
  manualDisconnectRequested: boolean;
  autoConnectEnabled: boolean;
}

export function shouldReconnectAfterSocketFailure({
  wasConnected,
  manualDisconnectRequested,
  autoConnectEnabled,
}: SocketFailureReconnectInput): boolean {
  return wasConnected && autoConnectEnabled && !manualDisconnectRequested;
}

export function hasHeartbeatTimedOut(
  lastServerActivityMs: number,
  nowMs: number,
  timeoutMs = HEARTBEAT_TIMEOUT_MS,
): boolean {
  if (!Number.isFinite(lastServerActivityMs) || lastServerActivityMs <= 0) {return false;}
  if (!Number.isFinite(nowMs) || nowMs < lastServerActivityMs) {return false;}
  return nowMs - lastServerActivityMs > timeoutMs;
}

export type HeartbeatSource = 'server' | 'extension' | undefined;

/**
 * EasyEDA SYS_WebSocket may reflect an outbound frame back through the local
 * message callback. Only valid inbound hello/request frames and server/legacy
 * heartbeats prove server activity; reflected extension responses, handshakes,
 * and ignored frames must not keep a dead connection alive.
 */
export function isServerActivityMessage(
  messageType: string | undefined,
  heartbeatSource?: HeartbeatSource,
): boolean {
  if (messageType === 'heartbeat') {return heartbeatSource !== 'extension';}
  return messageType === 'hello' || messageType === 'request';
}
