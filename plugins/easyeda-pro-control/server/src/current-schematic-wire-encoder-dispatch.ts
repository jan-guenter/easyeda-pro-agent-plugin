/** Retained encoder dispatch. Its native port is issued only by the original
 * V5 read owner after the encoder-specific native action is available. */
import { DIAGNOSTIC_SOURCE_FRAME_BYTES } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS } from "./current-pcb-diagnostic-transport-limits.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type {
  CurrentSchematicWireEncoderBeforeGraphCommand, CurrentSchematicWireEncoderBeforeGraphHelper,
  CurrentSchematicWireEncoderBeforeGraphTransport,
} from "./current-schematic-wire-encoder-before-graph.ts";
import { currentSchematicWireEncoderFixedDispatch } from "./current-schematic-wire-encoder-dispatch-protocol.ts";
import type {
  CurrentSchematicWireEncoderDispatchCommand, CurrentSchematicWireEncoderFixedDispatch,
} from "./current-schematic-wire-encoder-dispatch-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_ENCODER_NATIVE_BUDGET as CODEBOOK } from "./current-schematic-wire-encoder-native.ts";
import { currentSchematicWireEncoderScriptId as handle } from "./current-schematic-wire-encoder-source.ts";

const NORMAL_POLLS = 250;
/** A complete 32 MiB frame at 64 KiB per poll, plus the ordinary bounded
 * retry window. A wall clock limit also applies to short or empty chunks. */
const SOURCE_POLLS = NORMAL_POLLS + Math.ceil(DIAGNOSTIC_SOURCE_FRAME_BYTES / CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS.maximumNativePollBytes);
const SOURCE_MS = 30_000;
const ROWS = Object.freeze([
  "wire-encoder-before-graph", "wire-encoder-before-graph-properties", "wire-encoder-source",
  ...Array.from({ length: CODEBOOK.metadata }, () => "wire-encoder-metadata" as const), "wire-encoder-compare",
] as const);
export const CURRENT_SCHEMATIC_WIRE_ENCODER_DISPATCH_BUDGET = Object.freeze({
  requests: ROWS.length + 2, helperEvents: 2,
  normalPolls: NORMAL_POLLS, sourcePolls: SOURCE_POLLS,
  polls: (ROWS.length + 1) * NORMAL_POLLS + SOURCE_POLLS,
});

interface OriginalPort {
  readonly pipe: object;
  readonly sessionId: string;
  readonly contextId: number;
  readonly scriptId: string;
  readonly holder: string;
  readonly native: string;
  readonly status: () => Readonly<{ requestCount: number; pendingRequestId: number | null }>;
  readonly assertCurrent: () => void;
  readonly assertOriginalEvent: (event: EncoderEvent) => void;
  readonly post: (fixed: CurrentSchematicWireEncoderFixedDispatch) => Readonly<{ written: Promise<void>; reply: Promise<unknown> }>;
  readonly poll: () => Promise<void>;
}

interface EncoderEvent {
  readonly method: string;
  readonly sessionId?: string;
  readonly params: Readonly<Record<string, unknown>>;
}
interface Helper {
  readonly command: CurrentSchematicWireEncoderBeforeGraphHelper;
  readonly program: string;
  readonly id: number;
  scriptId: string | null;
  reply: unknown;
}
interface Active {
  readonly fixed: CurrentSchematicWireEncoderFixedDispatch;
  readonly frame: Buffer;
  forwarded: boolean;
}
function need(condition: boolean, code: string): asserts condition {
  if (!condition) { throw new Error(`WIRE_ENCODER_DISPATCH_${code}`); }
}

/** A source-only reservation for one late encoder cursor. The selected owner
 * supplies the original pipe, verified write, poll and delivered-event hooks. */
export class CurrentSchematicWireEncoderDispatch {
  readonly #original: OriginalPort;
  readonly #scripts = new Set<string>();
  readonly #transport: CurrentSchematicWireEncoderBeforeGraphTransport;
  #active: Active | null = null;
  #helper: Helper | null = null;
  #lastId: number | null = null;
  #issued = 0;
  #failed = false;

  public constructor(original: OriginalPort) {
    this.#original = Object.freeze({ ...original });
    const { pipe, holder, native, scriptId, sessionId, contextId } = this.#original;
    for (const token of [holder, native, scriptId, sessionId]) { handle.parse(token); }
    need(Number.isSafeInteger(contextId) && contextId > 0, "CONTEXT");
    this.#original.assertCurrent();
    this.#transport = Object.freeze({
      pipe, request: (command: CurrentSchematicWireEncoderBeforeGraphCommand): Promise<unknown> => this.#request(command),
      qualifyHelper: (command: CurrentSchematicWireEncoderBeforeGraphHelper, reply: unknown): Promise<void> => this.#qualifyHelper(command, reply),
    });
    Object.freeze(this);
  }

  public get transport(): CurrentSchematicWireEncoderBeforeGraphTransport { return this.#transport; }

  #current(): void {
    need(!this.#failed, "FAILED");
    this.#original.assertCurrent();
  }

  /** The owner consumes the exact pipe write once, immediately before routing
   * its closed selectors to the dedicated native action. */
  public forwardOriginalFrame(frame: Buffer): CurrentSchematicWireEncoderFixedDispatch["native"] {
    this.#current();
    const active = this.#active;
    need(active !== null && !active.forwarded && this.#original.status().pendingRequestId === active.fixed.wire.id &&
      frame.equals(active.frame), "ORIGINAL_FRAME");
    active.forwarded = true;
    return active.fixed.native;
  }

  /** Admit only a delivered event in the reserved generated call. The candidate
   * remains provisional until the original same-session full source reply. */
  public observeOriginalEvent(event: EncoderEvent): boolean {
    const helper = this.#helper;
    if (helper === null || this.#active?.fixed.wire.id !== helper.id ||
        event.method !== "Debugger.scriptParsed" || event.sessionId !== this.#original.sessionId) { return false; }
    const params = event.params;
    const url = params["url"];
    if (params["executionContextId"] !== this.#original.contextId || params["length"] !== helper.program.length ||
        !(url === "" || typeof url === "string" && /^debugger:\/\/VM\d+$/u.test(url))) { return false; }
    try {
      this.#current();
      this.#original.assertOriginalEvent(event);
      need(this.#active.forwarded && this.#original.status().pendingRequestId === helper.id &&
        params["hasSourceURL"] !== true && params["isLiveEdit"] !== true, "ORIGINAL_HELPER_EVENT");
      const scriptId = handle.parse(params["scriptId"]);
      need(helper.scriptId === null && scriptId !== this.#original.scriptId && !this.#scripts.has(scriptId) &&
        this.#scripts.size < CURRENT_SCHEMATIC_WIRE_ENCODER_DISPATCH_BUDGET.helperEvents, "HELPER_ID");
      this.#scripts.add(scriptId);
      helper.scriptId = scriptId;
      return true;
    } catch (caughtError) {
      this.#failed = true;
      throw caughtError;
    }
  }

  async #send(command: CurrentSchematicWireEncoderDispatchCommand, id: number): Promise<unknown> {
    this.#current();
    const prior = this.#original.status();
    need(this.#active === null && prior.pendingRequestId === null && id === prior.requestCount + 1 &&
      (this.#lastId === null || id === this.#lastId + 1), "ORIGINAL_REQUEST_SLOT");
    const fixed = currentSchematicWireEncoderFixedDispatch(command, id, this.#original.sessionId);
    const frame = Buffer.from(`${JSON.stringify(fixed.wire)}\0`);
    need(frame.length <= 16_384, "FRAME_BOUND");
    const active = { fixed, frame, forwarded: false };
    this.#active = active;
    this.#lastId = id;
    try {
      const deadline = performance.now() + SOURCE_MS;
      const task = this.#original.post(fixed);
      const outcome = (async (): Promise<{ value: unknown } | { cause: unknown }> => {
        try { return { value: await task.reply }; } catch (caughtError) { return { cause: caughtError }; }
      })();
      await task.written;
      this.#current();
      need(active.forwarded && this.#original.status().requestCount === id, "ORIGINAL_WRITE");
      const polls = command.phase === "wire-encoder-source" ? SOURCE_POLLS : NORMAL_POLLS;
      for (let remaining = polls; this.#original.status().pendingRequestId !== null; remaining -= 1) {
        const status = this.#original.status();
        need(remaining > 0 && performance.now() < deadline &&
          status.requestCount === id && status.pendingRequestId === id, "ORIGINAL_POLL_BOUND");
        await this.#original.poll();
        this.#current();
      }
      const raw = await outcome;
      this.#current();
      const status = this.#original.status();
      need(status.requestCount === id && status.pendingRequestId === null && performance.now() < deadline, "ORIGINAL_REPLY");
      if ("cause" in raw) { throw raw.cause; }
      return raw.value;
    } finally { this.#active = null; }
  }

  async #request(command: CurrentSchematicWireEncoderBeforeGraphCommand): Promise<unknown> {
    try {
      this.#current();
      need(this.#helper === null && this.#active === null && command.phase === ROWS[this.#issued] &&
        (command.phase !== "wire-encoder-source" || command.params.scriptId === this.#original.scriptId), "ORDER");
      if (command.phase === "wire-encoder-before-graph") {
        need(command.params.objectId === this.#original.holder &&
          command.params.arguments[0].objectId === this.#original.native, "ORIGINAL_GRAPH");
      }
      const id = this.#original.status().requestCount + 1;
      this.#issued += 1;
      const helper = command.method === "Runtime.callFunctionOn" ?
        { command, id, program: `(${command.params.functionDeclaration})`, scriptId: null, reply: null } : null;
      this.#helper = helper;
      const raw = await this.#send(command, id);
      if (helper !== null) {
        need(this.#helper === helper && helper.scriptId !== null, "HELPER_EVENT_MISSING");
        this.#helper.reply = raw;
      }
      return raw;
    } catch (caughtError) {
      this.#failed = true;
      throw caughtError;
    }
  }

  async #qualifyHelper(command: CurrentSchematicWireEncoderBeforeGraphHelper, reply: unknown): Promise<void> {
    try {
      this.#current();
      const helper = this.#helper;
      need(this.#active === null && helper !== null && helper.command === command &&
        helper.reply === reply && helper.scriptId !== null, "ORIGINAL_HELPER_REPLY");
      const raw = captureCurrentPcbStringClockReply(await this.#send({
        phase: "wire-encoder-helper-source", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId },
      }, helper.id + 1)).value;
      need(this.#helper === helper && raw !== null && typeof raw === "object" &&
        Reflect.ownKeys(raw).length === 1 && Object.getOwnPropertyDescriptor(raw, "scriptSource")?.value === helper.program, "HELPER_SOURCE");
      this.#helper = null;
    } catch (caughtError) {
      this.#failed = true;
      throw caughtError;
    }
  }
}
