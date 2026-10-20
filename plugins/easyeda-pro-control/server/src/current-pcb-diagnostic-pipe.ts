/** Internal helper-owned Chromium diagnostic pipe for validation only.
 * Byte streams are not process/Job authority,
 * and discovery replies are not frame, worker, script or CAD admission.
 *
 * Electron 41.2.1 requests Browser::Quit on debugging-pipe disconnect. This
 * class therefore NEVER ends, destroys or closes either stream, even on error.
 * The original native owner must retain both pipe handles until its reviewed
 * application-closure policy permits release. No TCP endpoint is supported. */
import type { Readable, Writable } from "node:stream";
import { DIAGNOSTIC_SESSION_BYTES, DIAGNOSTIC_SOURCE_FRAME_BYTES, DIAGNOSTIC_WORKER_ATTACH_PARAMS,
  diagnosticExact, diagnosticToken, diagnosticWorkerEvaluationParams } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticCommand, DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";

export { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";

const MAX_FRAME_BYTES = 1024 * 1024;
const MAX_CHUNK_BYTES = MAX_FRAME_BYTES + 1;
const MAX_REQUESTS = 32;
const DEADLINE_MS = 5000;
type Reply = Readonly<Record<string, unknown>>;
type Failure = "attachment" | "input" | "output" | "eof" | "closed" | "framing" | "reply" | "remote-error" | "deadline" | "budget";
interface Pending {
  readonly id: number;
  readonly resolve: (value: Reply) => void;
  readonly reject: (error: Error) => void;
  readonly timer: ReturnType<typeof setTimeout>;
  readonly sessionId: string | null;
  readonly source: boolean;
  written: boolean;
  reply: Reply | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function failureError(code: Failure): Error { return new Error(`PCB_DIAGNOSTIC_PIPE_${code.toUpperCase()}`); }

/** Fixed browser discovery, one page attachment and bounded direct workers.
 * One immutable worker read is supported. There is no generic send or caller
 * JavaScript, pause, resume,
 * reconnect, retry or pipe-close method. Construction acquires nothing; the
 * caller retains this object before start attaches fallible event listeners. */
export class CurrentPcbDiagnosticPipe {
  readonly #input: Readable;
  readonly #output: Writable;
  #started = false;
  #failure: Failure | null = null;
  #pending: Pending | null = null;
  #nextId = 1;
  #receivedBytes = 0;
  #buffer = Buffer.alloc(4096);
  #used = 0;
  #inputEnded = false;
  #inputClosed = false;
  #outputClosed = false;
  #released = false;
  #sessionId: string | null = null;
  #event: ((event: DiagnosticEvent) => void) | null = null;
  #eventCount = 0;
  #eventBytes = 0;
  #workerEvent: ((event: DiagnosticEvent) => void) | null = null;
  readonly #workerSessions = new Map<string, string>();
  #workerDiscoverySettled = false;
  #selectedWorkerSession: string | null = null;

  public constructor(input: Readable, output: Writable) {
    this.#input = input; this.#output = output;
  }

  public start(): void {
    if (this.#started) { throw new Error("PCB_DIAGNOSTIC_PIPE_START_CONSUMED"); }
    this.#started = true;
    try {
      // Error handlers precede data delivery. A partial attachment failure is
      // Retained on this original object; it never triggers a disconnect.
      this.#input.on("error", this.#inputError);
      this.#output.on("error", this.#outputError);
      this.#input.on("end", this.#inputEnd);
      this.#input.on("close", this.#inputClose);
      this.#output.on("close", this.#outputClose);
      if (this.#input.destroyed || this.#input.readableEnded || this.#output.destroyed || this.#output.writableEnded) {
        throw new Error("PCB_DIAGNOSTIC_PIPE_ALREADY_ENDED");
      }
      this.#input.on("data", this.#data);
    } catch { this.#fail("attachment"); throw failureError("attachment"); }
  }

  public getVersion(): Promise<Reply> { return this.#request({ id: this.#nextId, method: "Browser.getVersion" }); }
  public getTargets(): Promise<Reply> { return this.#request({ id: this.#nextId, method: "Target.getTargets" }); }
  public async attachTarget(targetId: string, event: (value: DiagnosticEvent) => void): Promise<string> {
    if (this.#event !== null || !diagnosticToken(targetId)) { throw new Error("PCB_DIAGNOSTIC_PIPE_ATTACH_INPUT"); }
    this.#event = event;
    const reply = await this.#request({ id: this.#nextId, method: "Target.attachToTarget", params: { targetId, flatten: true } });
    if (!diagnosticExact(reply, ["sessionId"]) || !diagnosticToken(reply["sessionId"])) { this.#fail("reply"); throw failureError("reply"); }
    this.#sessionId = reply["sessionId"]; return this.#sessionId;
  }
  public enablePage(): Promise<Reply> { return this.#sessionRequest("Page.enable"); }
  public getFrameTree(): Promise<Reply> { return this.#sessionRequest("Page.getFrameTree"); }
  public enableRuntime(): Promise<Reply> { return this.#sessionRequest("Runtime.enable"); }
  public enableDebugger(): Promise<Reply> {
    if (this.#sessionId === null) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_NO_SESSION")); }
    return this.#request({ id: this.#nextId, method: "Debugger.enable", params: { maxScriptsCacheSize: DIAGNOSTIC_SOURCE_FRAME_BYTES }, sessionId: this.#sessionId });
  }
  public getScriptSource(scriptId: string): Promise<Reply> {
    if (this.#sessionId === null || !diagnosticToken(scriptId)) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_SCRIPT_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Debugger.getScriptSource", params: { scriptId }, sessionId: this.#sessionId });
  }
  /** One fixed direct-child discovery on the original page. No recursive
   * autoattachment, debugger waiting, detached adoption or caller target URL. */
  public async enableWorkerDiscovery(event: (value: DiagnosticEvent) => void): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null || this.#pending !== null) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_WORKER_DISCOVERY_INPUT");
    }
    this.#workerEvent = event;
    const reply = await this.#request({ id: this.#nextId, method: "Target.setAutoAttach",
      params: DIAGNOSTIC_WORKER_ATTACH_PARAMS, sessionId: this.#sessionId });
    if (!diagnosticExact(reply, [])) { this.#fail("reply"); throw failureError("reply"); }
    this.#workerDiscoverySettled = true; return reply;
  }
  public selectWorkerSession(sessionId: string): void {
    if (this.#failure !== null || !this.#workerDiscoverySettled || this.#selectedWorkerSession !== null ||
        !this.#workerSessions.has(sessionId) || this.#pending !== null) { throw new Error("PCB_DIAGNOSTIC_PIPE_WORKER_SELECTION"); }
    this.#selectedWorkerSession = sessionId;
  }
  public enableWorkerRuntime(): Promise<Reply> {
    return this.#request({ id: this.#nextId, method: "Runtime.enable", params: {}, sessionId: this.#workerSession() });
  }
  public enableWorkerDebugger(): Promise<Reply> {
    return this.#request({ id: this.#nextId, method: "Debugger.enable",
      params: { maxScriptsCacheSize: DIAGNOSTIC_SOURCE_FRAME_BYTES }, sessionId: this.#workerSession() });
  }
  public getWorkerScriptSource(scriptId: string): Promise<Reply> {
    if (!diagnosticToken(scriptId)) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_SCRIPT_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Debugger.getScriptSource", params: { scriptId }, sessionId: this.#workerSession() });
  }
  /** The caller must first admit the selected worker's complete source and
   * original context. This primitive never accepts an expression or options. */
  public observeWorkerState(uniqueContextId: string): Promise<Reply> {
    return this.#request({ id: this.#nextId, method: "Runtime.evaluate",
      params: diagnosticWorkerEvaluationParams(uniqueContextId), sessionId: this.#workerSession() });
  }
  #workerSession(): string {
    if (!this.#workerDiscoverySettled || this.#selectedWorkerSession === null ||
        !this.#workerSessions.has(this.#selectedWorkerSession)) { throw new Error("PCB_DIAGNOSTIC_PIPE_NO_WORKER"); }
    return this.#selectedWorkerSession;
  }
  #sessionRequest(method: "Page.enable" | "Page.getFrameTree" | "Runtime.enable"): Promise<Reply> {
    if (this.#sessionId === null) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_NO_SESSION")); }
    return this.#request({ id: this.#nextId, method, params: {}, sessionId: this.#sessionId });
  }

  public status(): Readonly<{ started: boolean; failure: Failure | null; pendingRequestId: number | null;
    requestCount: number; receivedBytes: number; inputEnded: boolean; inputClosed: boolean;
    outputClosed: boolean; listenersReleased: boolean; nativeOwnerVerified: false; executionAuthorized: false }> {
    return Object.freeze({ started: this.#started, failure: this.#failure, pendingRequestId: this.#pending?.id ?? null,
      requestCount: this.#nextId - 1, receivedBytes: this.#receivedBytes, inputEnded: this.#inputEnded,
      inputClosed: this.#inputClosed, outputClosed: this.#outputClosed, listenersReleased: this.#released,
      nativeOwnerVerified: false, executionAuthorized: false });
  }

  /** Remove this object's listeners only after BOTH streams have emitted close.
   * This observes transport closure, not original EasyEDA/Job termination.
   * It does not close a stream or authorize a fresh launch. */
  public releaseClosedListeners(): void {
    if (!this.#inputClosed || !this.#outputClosed || this.#pending !== null) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_RETAIN_ORIGINAL_STREAMS");
    }
    this.#input.removeListener("data", this.#data);
    this.#input.removeListener("error", this.#inputError);
    this.#input.removeListener("end", this.#inputEnd);
    this.#input.removeListener("close", this.#inputClose);
    this.#output.removeListener("error", this.#outputError);
    this.#output.removeListener("close", this.#outputClose);
    this.#released = true;
  }

  // oxlint-disable-next-line eslint/require-await -- Async converts pre-dispatch guards to rejected promises; native completion is callback-based.
  async #request(command: DiagnosticCommand): Promise<Reply> {
    if (!this.#started || this.#released) { throw new Error("PCB_DIAGNOSTIC_PIPE_NOT_STARTED"); }
    if (this.#failure !== null) { throw failureError(this.#failure); }
    if (this.#pending !== null) { throw new Error("PCB_DIAGNOSTIC_PIPE_REQUEST_PENDING"); }
    if (this.#nextId > MAX_REQUESTS) { this.#fail("budget"); throw failureError("budget"); }
    const id = this.#nextId; this.#nextId += 1;
    const deferred = Promise.withResolvers<Reply>();
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject,
      timer: setTimeout(() => { this.#fail("deadline"); }, command.method === "Debugger.getScriptSource" ? 30_000 : DEADLINE_MS), written: false, reply: null,
      sessionId: "sessionId" in command ? command.sessionId : null, source: command.method === "Debugger.getScriptSource" };
    this.#pending = pending;
    // Reserve before write, including synchronous throw and synchronous peer
    // Reply. A callback error still defeats an earlier received response.
    try {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable completion is callback-based; an ACK does not replace the write callback.
      this.#output.write(Buffer.from(`${JSON.stringify(command)}\0`), (error): void => {
        if (error !== null && error !== undefined) { this.#fail("output"); }
        else if (this.#pending === pending && this.#failure === null) { pending.written = true; this.#complete(); }
      });
    } catch { this.#fail("output"); }
    return deferred.promise;
  }

  #fail(code: Failure): void {
    this.#failure ??= code;
    this.#used = 0;
    const pending = this.#pending;
    this.#pending = null;
    if (pending !== null) { clearTimeout(pending.timer); pending.reject(failureError(this.#failure)); }
  }

  #complete(): void {
    const pending = this.#pending;
    if (this.#failure === null && pending !== null && pending.written && pending.reply !== null && this.#used === 0) {
      this.#pending = null; clearTimeout(pending.timer); pending.resolve(pending.reply);
    }
  }

  #frame(bytes: Buffer): void {
    const pending = this.#pending;
    if (bytes.length === 0) { this.#fail("reply"); return; }
    let decoded: unknown;
    try { decoded = decodeCurrentPcbDiagnosticJson(bytes); }
    catch { this.#fail("framing"); return; }
    if (!record(decoded)) { this.#fail("reply"); return; }
    if (Object.hasOwn(decoded, "method")) { this.#receiveEvent(decoded, bytes.length); return; }
    if (pending === null || pending.reply !== null || !Object.is(decoded["id"], pending.id)) { this.#fail("reply"); return; }
    const keys = Object.keys(decoded);
    const expectedKeys = pending.sessionId === null ? 2 : 3;
    if (keys.length !== expectedKeys || !keys.includes("id") || (keys.includes("result") === keys.includes("error")) ||
        (pending.sessionId === null ? keys.includes("sessionId") : decoded["sessionId"] !== pending.sessionId)) {
      this.#fail("reply"); return;
    }
    if (keys.includes("error")) { this.#fail("remote-error"); return; }
    const result = decoded["result"];
    if (!record(result)) { this.#fail("reply"); return; }
    // Keep the complete decoded result, including unknown fields. No target or
    // Script token is issued and no semantic completeness claim is made here.
    pending.reply = result;
  }

  #receiveEvent(value: Record<string, unknown>, bytes: number): void {
    const method = value["method"], params = value["params"], sessionId = value["sessionId"];
    this.#eventCount += 1; this.#eventBytes += bytes;
    if (this.#event === null || bytes > MAX_FRAME_BYTES || this.#eventCount > 4096 || this.#eventBytes > 8 * MAX_FRAME_BYTES ||
        typeof method !== "string" || !record(params) || !diagnosticExact(value, sessionId === undefined ? ["method", "params"] : ["method", "params", "sessionId"]) ||
        (sessionId !== undefined && (this.#sessionId === null ||
          sessionId !== this.#sessionId && (typeof sessionId !== "string" || !this.#workerSessions.has(sessionId))))) { this.#fail("reply"); return; }
    try {
      const event = sessionId === undefined ? { method, params } : { method, params, sessionId };
      if (sessionId === this.#sessionId && method === "Target.attachedToTarget") {
        const child = params["targetInfo"], childSession = params["sessionId"];
        if (this.#workerEvent === null || !diagnosticExact(params, ["sessionId", "targetInfo", "waitingForDebugger"]) ||
            !record(child) || child["type"] !== "worker" || child["attached"] !== true || !diagnosticToken(child["targetId"]) ||
            !diagnosticToken(childSession) || params["waitingForDebugger"] !== false || childSession === this.#sessionId ||
            this.#workerSessions.has(childSession) || [...this.#workerSessions.values()].includes(child["targetId"]) ||
            this.#workerSessions.size >= 16) { this.#fail("reply"); return; }
        this.#workerSessions.set(childSession, child["targetId"]);
        this.#workerEvent(event);
      } else if (typeof sessionId === "string" && this.#workerSessions.has(sessionId)) {
        if (this.#workerEvent === null) { this.#fail("reply"); return; }
        this.#workerEvent(event);
      } else if (sessionId === this.#sessionId && method === "Target.detachedFromTarget" && this.#workerEvent !== null) {
        this.#workerEvent(event);
      } else { this.#event(event); }
    }
    catch { this.#fail("reply"); }
  }

  readonly #data = (chunk: unknown): void => {
    if (this.#failure !== null) { return; }
    if (this.#pending === null && this.#event === null) { this.#fail("reply"); return; }
    if (!Buffer.isBuffer(chunk) || chunk.length === 0 || chunk.length > MAX_CHUNK_BYTES ||
      this.#receivedBytes + chunk.length > (this.#event === null ? 8 * MAX_FRAME_BYTES : DIAGNOSTIC_SESSION_BYTES)) { this.#fail("framing"); return; }
    this.#receivedBytes += chunk.length;
    let start = 0;
    while (start < chunk.length && this.#failure === null) {
      const delimiter = chunk.indexOf(0, start), end = delimiter === -1 ? chunk.length : delimiter;
      const size = end - start; const needed = this.#used + size;
      const frameLimit = this.#pending?.source === true ? DIAGNOSTIC_SOURCE_FRAME_BYTES : MAX_FRAME_BYTES;
      if (needed > frameLimit) { this.#fail("framing"); return; }
      if (needed > this.#buffer.length) {
        const replacement = Buffer.alloc(Math.min(frameLimit, Math.max(needed, this.#buffer.length * 2)));
        this.#buffer.copy(replacement, 0, 0, this.#used); this.#buffer = replacement;
      }
      chunk.copy(this.#buffer, this.#used, start, end); this.#used = needed;
      if (delimiter !== -1) { this.#frame(this.#buffer.subarray(0, this.#used)); this.#used = 0; }
      start = end + 1;
    }
    // Validate every coalesced frame before settling the matching response.
    if (this.#event === null && this.#pending?.reply !== null && this.#used > 0) { this.#fail("reply"); }
    this.#complete();
  };
  readonly #inputError = (): void => { this.#fail("input"); };
  readonly #outputError = (): void => { this.#fail("output"); };
  readonly #inputEnd = (): void => { this.#inputEnded = true; this.#fail(this.#used === 0 ? "eof" : "framing"); };
  readonly #inputClose = (): void => { this.#inputClosed = true; this.#fail("closed"); };
  readonly #outputClose = (): void => { this.#outputClosed = true; this.#fail("closed"); };
}
