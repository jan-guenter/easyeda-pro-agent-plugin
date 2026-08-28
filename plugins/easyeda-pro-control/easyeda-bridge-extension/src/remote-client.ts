import type { RuntimeTimerHandle, RuntimeTimers } from './runtime-timers.js';

export type RemoteRelayMode = 'disabled' | 'hosted' | 'self_hosted';
export type RemoteRelayState = 'disconnected' | 'connecting' | 'connected' | 'paired';

export interface RemoteActiveProject {
  projectId?: string;
  projectName?: string;
  documentType: 'schematic' | 'pcb' | 'unknown';
  url?: string;
}

export interface RemoteRelayStatus {
  mode: RemoteRelayMode;
  state: RemoteRelayState;
  relayUrl?: string | undefined;
  sessionId?: string | undefined;
  pairingCode?: string | undefined;
  activeProject?: RemoteActiveProject | undefined;
  lastError?: string | undefined;
  lastConnectedAt?: string | undefined;
  lastHeartbeatAt?: string | undefined;
  reconnectAttempts?: number | undefined;
  nextReconnectDelayMs?: number | undefined;
}

export type RemoteApprovalDecision = 'approved' | 'rejected' | 'timeout';

export interface RemoteApprovalPrompt {
  approvalId: string;
  toolName: string;
  riskLevel: string;
  actionSummary: string;
  inputHash: string;
  activeProject?: RemoteActiveProject | undefined;
  expiresAt: string;
}

interface RemoteRelayClientOptions {
  extensionVersion: string;
  log: (message: string, data?: unknown) => void;
  showToast: (message: string) => void;
  readActiveProject: () => RemoteActiveProject | undefined;
  executeToolRequest?: (toolName: string, input: unknown) => Promise<unknown>;
  requestApproval?: (request: RemoteApprovalPrompt) => Promise<RemoteApprovalDecision>;
  timers: RuntimeTimers;
  createWebSocket: (url: string) => RelayWebSocket;
}

interface RelayWebSocket {
  readyState: number;
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: (() => void) | null;
  onclose: (() => void) | null;
  close(): void;
  send(data: string): void;
}

interface RemoteRelayConnectInput {
  mode: Exclude<RemoteRelayMode, 'disabled'>;
  relayUrl?: string;
  pairingCode?: string;
}

interface RemoteEnvelope {
  protocolVersion: string;
  messageId: string;
  type: string;
  sessionId?: string;
  timestamp: string;
  [key: string]: unknown;
}

const PROTOCOL_VERSION = '2026-07-remote-relay-v1';
const DEFAULT_HOSTED_RELAY_URL = 'wss://relay.easyeda-mcp-pro.local/session';
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;
const HEARTBEAT_LIVENESS_MS = 45_000;
const HEARTBEAT_SWEEP_MS = 15_000;

function makeMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {return crypto.randomUUID();}
  return `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function parseRemoteActiveProject(value: unknown): RemoteActiveProject | undefined {
  if (!isRecord(value)) {return undefined;}
  const documentType = value.documentType;
  if (documentType !== 'schematic' && documentType !== 'pcb' && documentType !== 'unknown') {
    return undefined;
  }
  const projectId = optionalString(value, 'projectId');
  const projectName = optionalString(value, 'projectName');
  const url = optionalString(value, 'url');
  return {
    documentType,
    ...(projectId === undefined ? {} : { projectId }),
    ...(projectName === undefined ? {} : { projectName }),
    ...(url === undefined ? {} : { url }),
  };
}

function parseRemoteEnvelope(value: unknown): RemoteEnvelope | undefined {
  if (!isRecord(value)) {return undefined;}
  const protocolVersion = value.protocolVersion;
  const messageId = value.messageId;
  const type = value.type;
  const timestamp = value.timestamp;
  const sessionId = value.sessionId;
  if (
    typeof protocolVersion !== 'string' ||
    typeof messageId !== 'string' ||
    typeof type !== 'string' ||
    typeof timestamp !== 'string' ||
    (sessionId !== undefined && typeof sessionId !== 'string')
  ) {
    return undefined;
  }
  return {
    ...value,
    messageId,
    protocolVersion,
    ...(typeof sessionId === 'string' ? { sessionId } : {}),
    timestamp,
    type,
  };
}

function errorToRelayError(error: unknown): { code: string; message: string; suggestion?: string } {
  const record = isRecord(error) ? error : {};
  let message = String(error);
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof record.message === 'string') {
    message = record.message;
  }
  return {
    code: typeof record.code === 'string' ? record.code : 'EASYEDA_API_ERROR',
    message,
    suggestion:
      typeof record.suggestion === 'string'
        ? record.suggestion
        : 'Check EasyEDA Pro and extension logs.',
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

export class RemoteRelayClient {
  private readonly options: RemoteRelayClientOptions;
  private socket: RelayWebSocket | null = null;
  private status: RemoteRelayStatus = { mode: 'disabled', state: 'disconnected' };
  private desiredConnection: RemoteRelayConnectInput | null = null;
  private reconnectTimer: RuntimeTimerHandle | null = null;
  private heartbeatTimer: RuntimeTimerHandle | null = null;
  private readonly pendingApprovalIds = new Set<string>();

  public constructor(options: RemoteRelayClientOptions) {
    this.options = options;
  }

  public connect(input: RemoteRelayConnectInput): void {
    this.disconnect('replaced');
    const relayUrl = input.relayUrl ?? DEFAULT_HOSTED_RELAY_URL;
    this.desiredConnection = { ...input, relayUrl };
    this.status = {
      mode: input.mode,
      state: 'connecting',
      relayUrl,
      pairingCode: input.pairingCode,
      activeProject: this.options.readActiveProject(),
      reconnectAttempts: 0,
    };
    this.options.showToast(`Remote Relay connecting: ${input.mode}`);
    this.openSocket(this.desiredConnection);
  }

  public disconnect(reason: 'user_disabled' | 'replaced' | 'disconnected' = 'user_disabled'): void {
    this.desiredConnection = null;
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();

    const socket = this.socket;
    this.socket = null;
    if (socket) {
      try {
        this.sendOnSocket(socket, { type: 'session_closed', reason });
        socket.close();
      } catch (error) {
        this.options.log('Remote Relay close failed', error);
      }
    }
    this.status = {
      ...this.status,
      state: 'disconnected',
      sessionId: undefined,
      nextReconnectDelayMs: undefined,
    };
  }

  public getStatus(): RemoteRelayStatus {
    return {
      ...this.status,
      activeProject: this.options.readActiveProject() ?? this.status.activeProject,
    };
  }

  private openSocket(input: RemoteRelayConnectInput): void {
    if (input.relayUrl === undefined || input.relayUrl.length === 0) {return;}
    this.clearReconnectTimer();

    try {
      const socket = this.options.createWebSocket(input.relayUrl);
      this.socket = socket;
      socket.onopen = () =>{  this.handleOpen(socket, input.pairingCode); };
      socket.onmessage = (event) =>{  this.handleMessage(socket, event.data); };
      socket.onerror = () =>{  this.handleSocketError(socket, 'Remote Relay socket error'); };
      socket.onclose = () =>{  this.handleClose(socket); };
    } catch (error) {
      this.socket = null;
      this.scheduleReconnect(`Remote Relay failed to start: ${String(error)}`);
    }
  }

  private handleOpen(socket: RelayWebSocket, pairingCode?: string): void {
    if (socket !== this.socket) {return;}
    const timestamp = nowIso();
    this.status = {
      ...this.status,
      state: pairingCode !== undefined && pairingCode.length > 0 ? 'paired' : 'connected',
      lastConnectedAt: timestamp,
      lastHeartbeatAt: timestamp,
      nextReconnectDelayMs: undefined,
      lastError: undefined,
    };
    this.startHeartbeatTimer();
    this.send({
      type: 'register_session',
      extensionVersion: this.options.extensionVersion,
      mode: this.status.mode,
      pairingCode,
      activeProject: this.options.readActiveProject(),
      capabilities: ['local_bridge_proxy'],
    });
    this.options.showToast(
      pairingCode !== undefined && pairingCode.length > 0
        ? 'Remote Relay connected and pairing code sent'
        : 'Remote Relay connected',
    );
  }

  private handleMessage(socket: RelayWebSocket, data: unknown): void {
    if (socket !== this.socket) {return;}
    const text = typeof data === 'string' ? data : '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      this.options.log('Remote Relay ignored non-JSON message');
      return;
    }
    const message = parseRemoteEnvelope(parsed);
    if (message === undefined) {
      this.options.log('Remote Relay ignored malformed message envelope');
      return;
    }
    if (message.protocolVersion !== PROTOCOL_VERSION) {
      this.send({
        type: 'error',
        code: 'RELAY_VERSION_UNSUPPORTED',
        message: 'Unsupported relay protocol version',
      });
      return;
    }
    if (message.type === 'session_registered') {
      this.status = {
        ...this.status,
        state: message.paired === true ? 'paired' : 'connected',
        sessionId:
          typeof message.sessionId === 'string' ? message.sessionId : this.status.sessionId,
      };
      return;
    }
    if (message.type === 'heartbeat') {
      this.status = { ...this.status, lastHeartbeatAt: nowIso() };
      this.send({ type: 'heartbeat' });
      return;
    }
    if (message.type === 'approval_request') {
      void this.handleApprovalRequest(socket, message);
      return;
    }
    if (message.type === 'tool_request') {
      void this.handleToolRequest(socket, message);
    }
  }

  private async handleApprovalRequest(
    socket: RelayWebSocket,
    message: RemoteEnvelope,
  ): Promise<void> {
    const approvalId = typeof message.approvalId === 'string' ? message.approvalId : '';
    const toolName = typeof message.toolName === 'string' ? message.toolName : '';
    let actionSummary = toolName.length > 0 ? toolName : 'Remote action';
    if (typeof message.actionSummary === 'string') {
      actionSummary = message.actionSummary;
    }
    const expiresAt = typeof message.expiresAt === 'string' ? message.expiresAt : nowIso();
    if (!approvalId || !toolName || this.pendingApprovalIds.has(approvalId)) {return;}

    this.pendingApprovalIds.add(approvalId);
    let result: RemoteApprovalDecision = 'rejected';
    try {
      const requestApproval = this.options.requestApproval;
      if (requestApproval) {
        result = await requestApproval({
          approvalId,
          toolName,
          riskLevel: typeof message.riskLevel === 'string' ? message.riskLevel : 'write',
          actionSummary,
          inputHash: typeof message.inputHash === 'string' ? message.inputHash : '',
          activeProject: parseRemoteActiveProject(message.activeProject),
          expiresAt,
        });
      } else {
        this.options.showToast('Remote approval UI is unavailable; request rejected.');
      }
    } catch (error) {
      this.options.log('Remote approval prompt failed', error);
      result = 'rejected';
    } finally {
      this.pendingApprovalIds.delete(approvalId);
    }

    this.sendForSocket(socket, {
      type: 'approval_result',
      approvalId,
      result,
    });
  }

  private async handleToolRequest(socket: RelayWebSocket, message: RemoteEnvelope): Promise<void> {
    const startedAt = Date.now();
    const toolName = typeof message.toolName === 'string' ? message.toolName : '';
    if (!toolName) {
      this.sendForSocket(socket, {
        type: 'tool_response',
        requestMessageId: message.messageId,
        ok: false,
        error: {
          code: 'REMOTE_TOOL_NAME_MISSING',
          message: 'Remote tool request did not include a tool name.',
          suggestion: 'Retry with a valid EasyEDA bridge method name.',
        },
        durationMs: Date.now() - startedAt,
      });
      return;
    }
    if (!this.options.executeToolRequest) {
      this.sendForSocket(socket, {
        type: 'tool_response',
        requestMessageId: message.messageId,
        ok: false,
        error: {
          code: 'REMOTE_EXECUTION_NOT_ENABLED',
          message: 'Remote command dispatch is not enabled in this extension build yet.',
          suggestion: 'Use local bridge mode or enable the Remote Relay dispatch integration.',
        },
        durationMs: Date.now() - startedAt,
      });
      return;
    }

    try {
      const result = await this.options.executeToolRequest(toolName, message.input);
      this.sendForSocket(socket, {
        type: 'tool_response',
        requestMessageId: message.messageId,
        ok: true,
        result,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      this.sendForSocket(socket, {
        type: 'tool_response',
        requestMessageId: message.messageId,
        ok: false,
        error: errorToRelayError(error),
        durationMs: Date.now() - startedAt,
      });
    }
  }

  private handleSocketError(socket: RelayWebSocket, message: string): void {
    if (socket !== this.socket) {return;}
    this.status = { ...this.status, lastError: message };
    this.options.log(message);
  }

  private handleClose(socket: RelayWebSocket): void {
    if (socket !== this.socket) {return;}
    this.socket = null;
    this.clearHeartbeatTimer();
    if (!this.desiredConnection) {
      if (this.status.state !== 'disconnected') {
        this.status = { ...this.status, state: 'disconnected', sessionId: undefined };
        this.options.showToast('Remote Relay disconnected');
      }
      return;
    }
    this.scheduleReconnect('Remote Relay disconnected');
  }

  private scheduleReconnect(message: string): void {
    const desired = this.desiredConnection;
    if (!desired) {return;}
    this.clearHeartbeatTimer();
    this.clearReconnectTimer();
    const nextAttempt = (this.status.reconnectAttempts ?? 0) + 1;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** (nextAttempt - 1), RECONNECT_MAX_MS);
    this.status = {
      ...this.status,
      state: 'connecting',
      sessionId: undefined,
      lastError: message,
      reconnectAttempts: nextAttempt,
      nextReconnectDelayMs: delay,
    };
    this.options.log('Remote Relay reconnect scheduled', { attempt: nextAttempt, delayMs: delay });
    this.reconnectTimer = this.options.timers.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.desiredConnection) {this.openSocket(desired);}
    }, delay);
  }

  private startHeartbeatTimer(): void {
    this.clearHeartbeatTimer();
    this.heartbeatTimer = this.options.timers.setInterval(
      () =>{  this.checkHeartbeatLiveness(); },
      HEARTBEAT_SWEEP_MS,
    );
  }

  private checkHeartbeatLiveness(): void {
    if (!this.socket || this.socket.readyState !== 1) {return;}
    const lastHeartbeat = this.status.lastHeartbeatAt !== undefined
      ? Date.parse(this.status.lastHeartbeatAt)
      : undefined;
    if (lastHeartbeat === undefined || Number.isNaN(lastHeartbeat)) {return;}
    if (Date.now() - lastHeartbeat <= HEARTBEAT_LIVENESS_MS) {return;}
    this.options.log('Remote Relay heartbeat stale; closing socket to reconnect');
    try {
      this.socket.close();
    } catch (error) {
      this.options.log('Remote Relay stale socket close failed', error);
      this.scheduleReconnect('Remote Relay heartbeat stale');
    }
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {return;}
    this.options.timers.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private clearHeartbeatTimer(): void {
    if (!this.heartbeatTimer) {return;}
    this.options.timers.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private send(payload: Record<string, unknown>): void {
    if (!this.socket) {return;}
    this.sendOnSocket(this.socket, payload);
  }

  private sendForSocket(socket: RelayWebSocket, payload: Record<string, unknown>): void {
    if (socket !== this.socket) {return;}
    this.sendOnSocket(socket, payload);
  }

  private sendOnSocket(socket: RelayWebSocket, payload: Record<string, unknown>): void {
    if (socket.readyState !== 1) {return;}
    const sessionId = this.status.sessionId;
    const envelope: RemoteEnvelope = {
      ...payload,
      protocolVersion: PROTOCOL_VERSION,
      messageId: makeMessageId(),
      ...(sessionId === undefined ? {} : { sessionId }),
      timestamp: new Date().toISOString(),
      type: typeof payload.type === 'string' ? payload.type : 'unknown',
    };
    socket.send(JSON.stringify(envelope));
  }
}
