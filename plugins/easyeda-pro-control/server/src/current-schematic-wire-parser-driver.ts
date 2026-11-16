/** One unmounted parser event driver, with exact owned breakpoint ACKs,
 * consumed requests, original pause/resume packets and retained settlement.
 * Its transport is not a native issuer; no writer or Save authority is issued. */
/* oxlint-disable import/max-dependencies -- Compose the closed controls, original source/caller profiles, descriptor readers and Promise/event cleanup in one unmounted driver. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CurrentSchematicWireParserCursor } from "./current-schematic-wire-parser-cursor.ts";
import type { CurrentSchematicWireParserData, CurrentSchematicWireParserInput } from "./current-schematic-wire-parser-cursor.ts";
import { CurrentSchematicWireParserHelperCursor } from "./current-schematic-wire-parser-helper-cursor.ts";
import {
  CURRENT_SCHEMATIC_WIRE_PARSER_CALLS as CALLS,
  CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS as FLAGS,
  validateCurrentSchematicWireParserCommand as validateReader,
} from "./current-schematic-wire-parser-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_PARSER_FRAMES as FRAMES } from "./current-schematic-wire-parser-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as COMPLETION } from "./current-schematic-wire-completion-source.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentSchematicWireParserCommand } from "./current-schematic-wire-parser-protocol.ts";
import { validateCurrentSchematicWireParserHelperCommand as validateHelper } from "./current-schematic-wire-parser-helper-protocol.ts";
import type { CurrentSchematicWireParserHelperCommand } from "./current-schematic-wire-parser-helper-protocol.ts";
import {
  CURRENT_SCHEMATIC_WIRE_PARSER_POINTS as POINTS,
  decodeCurrentSchematicWireParserPause as decodePause,
  qualifyCurrentSchematicWireParserSource as qualifySource,
} from "./current-schematic-wire-parser-source.ts";
import type { CurrentSchematicWireParserRole as Role } from "./current-schematic-wire-parser-source.ts";
import {
  CURRENT_SCHEMATIC_WIRE_PARSER_DRIVER_REQUESTS as LIMIT,
  CURRENT_SCHEMATIC_WIRE_PARSER_DRIVER_ORDER as ORDER,
  validateCurrentSchematicWireParserDriverControl as validateControl,
} from "./current-schematic-wire-parser-driver-protocol.ts";
import type { CurrentSchematicWireParserDriverControl } from "./current-schematic-wire-parser-driver-protocol.ts";

export type CurrentSchematicWireParserDriverCommand =
  CurrentSchematicWireParserDriverControl | CurrentSchematicWireParserCommand | CurrentSchematicWireParserHelperCommand;
export interface CurrentSchematicWireParserDriverTransport {
  readonly request: (command: CurrentSchematicWireParserDriverCommand) => Promise<unknown>;
  readonly assertCurrent: () => void;
  readonly assertOriginalExit: () => void;
  readonly fail: (cause: unknown) => void;
}
interface Input {
  readonly sessionId: string; readonly scriptId: string; readonly holder: string; readonly native: string;
  readonly variant: 0 | 1;
  /** Whole installed source data is qualified here. Its original native
   * getScriptSource request must be joined by the eventual full factory. */
  readonly source: unknown;
}
type Stage = "entry" | "returned";
interface Point { readonly role: Role; readonly stage: Stage; readonly id: string; removeAttempted: boolean; removed: boolean }
interface Pause { readonly role: Role; readonly stage: Stage; readonly frame: string; readonly caller: string | null; readonly promise: string | null; readonly raw: unknown }
interface Attempt { readonly reserved: CurrentSchematicWireParserDriverCommand; readonly command: CurrentSchematicWireParserDriverCommand; readonly cleanup: boolean; pending?: Promise<unknown>; raw?: unknown; cause?: unknown }
interface Resume { readonly signal: PromiseWithResolvers<null>; eventObserved: boolean; ackObserved: boolean }
interface SourceCall { readonly program: string; readonly scripts: string[] }
export interface CurrentSchematicWireParserDriverData {
  readonly schema: "private.schematic-wire-parser-event-comparison.v1";
  readonly sourceVariant: 0 | 1; readonly allTwelveOwnedPausesCompared: true;
  readonly allTwelveOwnedResumesCompared: true; readonly allTwentyTwoGeneratedSourcesCompared: true;
  readonly allAllocatedBreakpointsRemoved: true; readonly objectGroupReleased: false;
  readonly normalRequests: number; readonly cleanupRequests: number;
  readonly parser: CurrentSchematicWireParserData;
  readonly suppliedTransportOnly: true; readonly originalNativeOwnerJoined: false;
  readonly originalWholeScriptOriginJoined: false; readonly childRpcJoined: false;
  readonly selectedTreeChildJoined: false; readonly parserCompleted: false; readonly saveAuthorized: false;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const allocated = z.strictObject({ breakpointId: handle, actualLocation: location });
const empty = z.strictObject({});
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
const event = z.strictObject({
  sessionId: handle, method: z.enum(["Debugger.paused", "Debugger.resumed", "Debugger.scriptParsed"]), params: z.unknown(),
});
const heldFrame = z.object({ callFrameId: handle, location: location.optional(), functionLocation: location.optional() });
const pausedHead = z.object({
  hitBreakpoints: z.array(handle).length(1),
  callFrames: z.array(heldFrame).min(1).max(64),
});
const script = z.object({ scriptId: handle, url: z.string(), length: z.number().int().nonnegative() });
const source = z.strictObject({ scriptSource: z.string().max(32_768) });
const issued = new WeakMap<CurrentSchematicWireParserDriverData, CurrentSchematicWireParserDriver>();
const spent = new WeakSet<CurrentSchematicWireParserDriverData>();
/** One exact packet can join a future full owner. This comparison does not
 * authenticate that owner, its source request or its native event allocation. */
export function consumeCurrentSchematicWireParserDriverData(data: CurrentSchematicWireParserDriverData, driver: CurrentSchematicWireParserDriver): CurrentSchematicWireParserData {
  need(issued.get(data) === driver && !spent.has(data)); spent.add(data); return driver.requireLiveComparison(data);
}
function need(value: boolean): asserts value { if (!value) { throw new Error("WIRE_PARSER_DRIVER"); } }
async function settled(task: Promise<unknown> | null): Promise<void> {
  try { await task; }
  catch {
    // The original failure remains attached to the original task and journal.
  }
}
function methods(transport: CurrentSchematicWireParserDriverTransport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) &&
    Reflect.ownKeys(transport).length === 4);
  return ["request", "assertCurrent", "assertOriginalExit", "fail"].map(key => {
    const own = Object.getOwnPropertyDescriptor(transport, key);
    need(own !== undefined && Object.hasOwn(own, "value") && typeof own.value === "function");
    return own.value as unknown;
  });
}
function validated(input: CurrentSchematicWireParserDriverCommand): CurrentSchematicWireParserDriverCommand {
  if (input.phase.startsWith("wire-parser-driver-")) { return validateControl(input); }
  if (input.phase === "wire-parser-helper-frame") { return validateHelper(input); }
  return validateReader(input);
}
export class CurrentSchematicWireParserDriver {
  readonly #input: Input;
  readonly #transport: CurrentSchematicWireParserDriverTransport;
  readonly #methods: readonly unknown[];
  readonly #points: Point[] = [];
  readonly #attempts: Attempt[] = [];
  readonly #events: unknown[] = [];
  readonly #done = Promise.withResolvers<null>();
  #armTask: Promise<void> | null = null;
  #runTask: Promise<CurrentSchematicWireParserDriverData> | null = null;
  #cleanupTask: Promise<void> | null = null;
  #removalTask: Promise<void> | null = null;
  #releaseTask: Promise<void> | null = null;
  #finishTask: Promise<void> | null = null;
  #retirementTask: Promise<void> | null = null;
  #tail: Promise<void> = Promise.resolve();
  #sourceCall: SourceCall | null = null;
  #resume: Resume | null = null;
  #activeCursor: CurrentSchematicWireParserCursor | CurrentSchematicWireParserHelperCursor | null = null;
  #data: CurrentSchematicWireParserData | null = null;
  #packet: CurrentSchematicWireParserDriverData | null = null;
  #failure: Readonly<{ cause: unknown }> | null = null;
  #notificationFailure: Readonly<{ cause: unknown }> | null = null;
  #normal = 0; #cleanup = 0; #received = 0; #completed = 0; #resumes = 0; #sources = 0;
   #allocationUncertain = false;
  #armed = false; #closing = false; #settled = false; #finishSettled = false; #releaseAttempted = false; #released = false;

  public constructor(input: Input, transport: CurrentSchematicWireParserDriverTransport) {
    for (const value of [input.sessionId, input.scriptId, input.holder, input.native]) { handle.parse(value); }
    need((input.variant === 0 || input.variant === 1) && !Object.is(input.variant, -0));
    need(qualifySource(input.source) === input.variant);
    this.#input = Object.freeze({ ...input }); this.#transport = transport; this.#methods = methods(transport);
    // A refusal can precede run(). Retain the same rejected Promise.
    void settled(this.#done.promise);
    this.#current(); Object.freeze(this);
  }
  #current(cleanup = false): void {
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]));
    if (!cleanup) { need(!this.#closing && this.#failure === null); this.#transport.assertCurrent(); }
  }
  #fail(cause: unknown): void {
    if (this.#failure !== null) { return; }
    this.#failure = Object.freeze({ cause }); this.#activeCursor?.fail();
    this.#done.reject(cause); this.#resume?.signal.reject(cause);
    try { this.#transport.fail(cause); } catch (error) { this.#notificationFailure = Object.freeze({ cause: error }); }
  }
  async #send(input: CurrentSchematicWireParserDriverCommand, cleanup = false): Promise<unknown> {
    this.#current(cleanup); const command = validated(input);
    if (cleanup) { need(this.#cleanup < LIMIT.cleanup); this.#cleanup += 1; }
    else { need(this.#normal < LIMIT.normal); this.#normal += 1; }
    const attempt: Attempt = { reserved: input, command, cleanup }; this.#attempts.push(attempt);
    let generated: SourceCall | null = null;
    if (command.method === "Runtime.callFunctionOn") {
      need(this.#sourceCall === null);
      generated = { program: command.params.functionDeclaration, scripts: [] }; this.#sourceCall = generated;
    }
    try {
      const pending = this.#transport.request(command); need(types.isPromise(pending)); attempt.pending = pending;
      const raw = await pending; attempt.raw = raw;
      if (command.method === "Debugger.setBreakpoint") {
        const ack = allocated.parse(capture(raw).value); need(!this.#points.some(point => point.id === ack.breakpointId));
        this.#points.push({ role: command.role, stage: command.stage, id: ack.breakpointId, removeAttempted: false, removed: false });
        const expected = command.params.location; need(ack.actualLocation.scriptId === expected.scriptId && ack.actualLocation.lineNumber === expected.lineNumber && ack.actualLocation.columnNumber === expected.columnNumber); this.#allocationUncertain = false;
      }
      this.#current(cleanup);
      if (generated !== null) {
        need(this.#sourceCall === generated && generated.scripts.length === 1); this.#sourceCall = null;
        const scriptId = generated.scripts[0]; need(scriptId !== undefined);
        const packet = source.parse(capture(await this.#send({
          phase: "wire-parser-driver-source", method: "Debugger.getScriptSource", params: { scriptId },
        })).value);
        need(packet.scriptSource === `(${generated.program})`); this.#sources += 1;
      }
      return raw;
    } catch (error) { attempt.cause = error; throw error; }
    finally { if (this.#sourceCall === generated) { this.#sourceCall = null; } }
  }
  /** One retained arm attempt includes partial allocation and refusal. */
  public arm(): Promise<void> {
    if (this.#armTask !== null) { return this.#armTask; } this.#current();
    const task = (async (): Promise<void> => {
      try {
        for (const [role, stage] of ORDER) {
          const point = POINTS[this.#input.variant].points[role][stage];
          this.#allocationUncertain = true;
          const raw = await this.#send({ phase: "wire-parser-driver-arm", role, stage, variant: this.#input.variant,
            method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#input.scriptId, ...point } } });
          const ack = allocated.parse(capture(raw).value);
          need(ack.actualLocation.scriptId === this.#input.scriptId &&
            ack.actualLocation.lineNumber === point.lineNumber && ack.actualLocation.columnNumber === point.columnNumber);
        }
        this.#armed = true;
      } catch (error) { this.#fail(error); throw error; }
    })(); this.#armTask = task; return task;
  }
  /** Source events are accepted only for this session. Another owner's point
   * in this session must be routed by its original subscriber before this call. */
  public observe(input: unknown): boolean {
    if (this.#closing || this.#packet !== null) { return false; }
    let retained = false;
    try {
      this.#current(); const packet = event.parse(capture(input).value);
      if (packet.sessionId !== this.#input.sessionId) { return false; }
      if (packet.method === "Debugger.scriptParsed") {
        const parsed = script.parse(packet.params); const active = this.#sourceCall;
        if (active === null || parsed.url !== "" || parsed.length !== active.program.length + 2) { return false; }
        need(!active.scripts.includes(parsed.scriptId)); active.scripts.push(parsed.scriptId); need(active.scripts.length === 1);
        this.#events.push(input); retained = true; return true;
      }
      this.#events.push(input); retained = true;
      if (packet.method === "Debugger.resumed") {
        empty.parse(packet.params); const pending = this.#resume;
        need(pending !== null && !pending.eventObserved); pending.eventObserved = true; pending.signal.resolve(null); return true;
      }
      need(this.#armed && this.#received < ORDER.length && (this.#received === this.#completed || this.#resume?.eventObserved === true));
      const head = pausedHead.parse(packet.params); const id = head.hitBreakpoints[0];
      const point = this.#points.find(row => row.id === id); const expected = ORDER[this.#received];
      need(point !== undefined && expected !== undefined && point.role === expected[0] && point.stage === expected[1] && id !== undefined);
      const held = decodePause(packet.params, this.#input.variant, point.role, point.stage, this.#input.scriptId, id);
      if (point.stage === "entry") {
        let parent: Role;
        if (point.role === "docParse") { parent = "shapeDidTransact"; }
        else if (point.role === "sheetParse") { parent = "docParse"; }
        else if (point.role === "sheetAst" || point.role === "astUpdate") { parent = "sheetParse"; }
        else { parent = "astUpdate"; }
        const caller = head.callFrames[1]; const profile = COMPLETION[this.#input.variant].rows[parent];
        const end = POINTS[this.#input.variant].points[parent].returned;
        need(caller?.functionLocation?.scriptId === this.#input.scriptId && caller.functionLocation.lineNumber === profile.lineNumber &&
          caller.functionLocation.columnNumber === profile.columnNumber && caller.location?.scriptId === this.#input.scriptId &&
          caller.location.lineNumber === profile.lineNumber && caller.location.columnNumber >= profile.columnNumber &&
          caller.location.columnNumber <= end.columnNumber);
      }
      const row: Pause = Object.freeze({ role: point.role, stage: point.stage, frame: held.frame,
        caller: head.callFrames[1]?.callFrameId ?? null, promise: held.promise, raw: input });
      this.#received += 1;
      const tail = this.#tail;
      this.#tail = (async (): Promise<void> => {
        try { await tail; this.#current(); await this.#process(row); }
        catch (error) { this.#fail(error); }
      })();
      return true;
    } catch (error) { if (!retained) { this.#events.push(input); } this.#fail(error); return true; }
  }
  async #read(input: CurrentSchematicWireParserInput): Promise<void> {
    const cursor = new CurrentSchematicWireParserCursor(input); this.#activeCursor = cursor;
    for (let command = cursor.next(); command !== null; command = cursor.next()) {
      cursor.reserve(command); cursor.accept(command, await this.#send(command));
    }
    this.#data = cursor.requireCompleted(); this.#activeCursor = null;
  }
  async #guardEntry(point: Pause): Promise<void> {
    const previous = this.#data; need(previous !== null && previous.sheet !== null);
    const role = point.role === "astPassSchematic" ? "passSchematicReturned" : "passContentReturned";
    const captured = tuple(await this.#send({ phase: "wire-parser-frame", variant: this.#input.variant, role,
      method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: point.frame, expression: FRAMES[this.#input.variant][role],
        returnByValue: false, includeCommandLineAPI: false } }), 3);
    array(await this.#send({ phase: "wire-parser-properties", method: "Runtime.getProperties",
      params: { objectId: captured, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), 3);
    const row = CALLS[role];
    const raw = await this.#send({ phase: "wire-parser-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS,
      objectId: captured, functionDeclaration: row.program, arguments: [this.#input.native, this.#input.holder, previous.context, previous.sheet].map(objectId => ({ objectId })),
      returnByValue: true, awaitPromise: false, userGesture: false } });
    truth.parse(capture(raw).value);
  }
  async #process(point: Pause): Promise<void> {
    const previous = this.#data;
    if (point.role === "docParse" && point.stage === "entry") {
      need(point.caller !== null); await this.#read({ stage: "context", frame: point.frame, callerFrame: point.caller, holder: this.#input.holder, native: this.#input.native, scriptId: this.#input.scriptId, variant: this.#input.variant });
    } else if (point.role === "sheetParse" && point.stage === "entry") {
      need(previous !== null); await this.#read({ stage: "sheet", frame: point.frame, previous });
    } else if (point.role === "sheetAst" && point.stage === "entry") {
      need(previous !== null);
      const cursor = new CurrentSchematicWireParserHelperCursor({ frame: point.frame, scriptId: this.#input.scriptId, variant: this.#input.variant });
      this.#activeCursor = cursor;
      for (let command = cursor.next(); command !== null; command = cursor.next()) {
        cursor.reserve(command); cursor.accept(command, await this.#send(command));
      }
      const helpers = cursor.requireCompleted(); this.#activeCursor = null;
      await this.#read({ stage: "astEntry", frame: point.frame, helpers, previous });
    } else if (point.role === "astUpdate" && point.stage === "entry") {
      need(previous !== null && point.caller !== null);
      await this.#read({ stage: "published", frame: point.frame, callerFrame: point.caller, previous });
    } else if (point.stage === "entry" && (point.role === "astPassSchematic" || point.role === "astPassContent")) {
      await this.#guardEntry(point);
    } else if (point.stage === "returned" && point.role !== "shapeDidTransact") {
      need(previous !== null && point.promise !== null);
      await this.#read({ stage: "returned", role: point.role, frame: point.frame, promise: point.promise, previous });
    }
    if (point.role === "docParse" && point.stage === "returned") {
      need(this.#data !== null); await this.#read({ stage: "settled", previous: this.#data });
    }
    need(this.#resume === null);
    const resume: Resume = { signal: Promise.withResolvers<null>(), eventObserved: false, ackObserved: false };
    void settled(resume.signal.promise); this.#resume = resume;
    empty.parse(capture(await this.#send({ phase: "wire-parser-driver-resume", method: "Debugger.resume", params: {} })).value);
    resume.ackObserved = true; await resume.signal.promise; this.#current();
    need(this.#resume === resume && resume.eventObserved && resume.ackObserved); this.#resume = null; this.#resumes += 1;
    this.#completed += 1;
    if (this.#completed === ORDER.length) { this.#done.resolve(null); }
  }
  #removePointsOnce(): Promise<void> {
    if (this.#removalTask !== null) { return this.#removalTask; }
    const task = (async (): Promise<void> => {
      let failure: Readonly<{ cause: unknown }> | null = null;
      for (const point of this.#points) {
        need(!point.removeAttempted); point.removeAttempted = true;
        try {
          empty.parse(capture(await this.#send({ phase: "wire-parser-driver-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)).value);
          point.removed = true;
        } catch (error) { failure ??= Object.freeze({ cause: error }); }
      }
      if (failure !== null) { throw failure.cause; }
    })(); this.#removalTask = task; return task;
  }
  #releaseOnce(): Promise<void> {
    if (this.#releaseTask !== null) { return this.#releaseTask; }
    const task = (async (): Promise<void> => {
      need(!this.#releaseAttempted); this.#releaseAttempted = true;
      empty.parse(capture(await this.#send({ phase: "wire-parser-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: FLAGS.objectGroup } }, true)).value);
      this.#released = true;
    })(); this.#releaseTask = task; return task;
  }
  #cleanupOnce(): Promise<void> {
    if (this.#cleanupTask !== null) { return this.#cleanupTask; }
    const task = (async (): Promise<void> => {
      let failure: Readonly<{ cause: unknown }> | null = null;
      try { await this.#removePointsOnce(); } catch (error) { failure = Object.freeze({ cause: error }); }
      try { await this.#releaseOnce(); } catch (error) { failure ??= Object.freeze({ cause: error }); }
      if (failure !== null) { throw failure.cause; }
    })(); this.#cleanupTask = task; return task;
  }
  /** Keep parser snapshots alive while the full owner joins the separate RPC
   * and ignored tree child. Finishing is consumed once and never issues Save. */
  public finish(): Promise<void> {
    if (this.#finishTask !== null) { return this.#finishTask; } this.#current();
    const task = (async (): Promise<void> => {
      try { await this.run(); this.#current(); await this.#releaseOnce(); this.#current(); }
      catch (error) {
        this.#fail(error); await this.#tail;
        try { await this.#cleanupOnce(); } catch (cleanupError) { this.#notificationFailure ??= Object.freeze({ cause: cleanupError }); }
        need(this.#failure !== null); throw this.#failure.cause;
      } finally { this.#finishSettled = true; }
    })(); this.#finishTask = task; return task;
  }
  /** The same settlement Promise is returned on overlap and after refusal.
   * The driver does not invoke the producer; its original caller does so. */
  public run(): Promise<CurrentSchematicWireParserDriverData> {
    if (this.#runTask !== null) { return this.#runTask; }
    this.#current();
    const task = (async (): Promise<CurrentSchematicWireParserDriverData> => {
      try {
        await this.arm(); await this.#done.promise; await this.#tail; this.#current();
        need(this.#received === 12 && this.#completed === 12 && this.#resumes === 12 && this.#sources === 22 && this.#data?.stage === "settled");
        await this.#removePointsOnce(); this.#current();
        need(this.#points.length === 12 && this.#points.every(point => point.removed) && !this.#released);
        const packet: CurrentSchematicWireParserDriverData = Object.freeze({
          schema: "private.schematic-wire-parser-event-comparison.v1", sourceVariant: this.#input.variant,
          allTwelveOwnedPausesCompared: true, allTwelveOwnedResumesCompared: true, allTwentyTwoGeneratedSourcesCompared: true,
          allAllocatedBreakpointsRemoved: true, objectGroupReleased: false, normalRequests: this.#normal, cleanupRequests: this.#cleanup,
          parser: this.#data, suppliedTransportOnly: true, originalNativeOwnerJoined: false, originalWholeScriptOriginJoined: false,
          childRpcJoined: false, selectedTreeChildJoined: false, parserCompleted: false, saveAuthorized: false,
        });
        issued.set(packet, this); this.#packet = packet; return packet;
      } catch (error) {
        this.#fail(error); await this.#tail;
        try { await this.#cleanupOnce(); } catch (cleanupError) { this.#notificationFailure ??= Object.freeze({ cause: cleanupError }); }
        need(this.#failure !== null); throw this.#failure.cause;
      } finally { this.#settled = true; }
    })(); this.#runTask = task; return task;
  }
  /** Original owner exit must first close native waiters. Join the retained
   * arm, event/read/resume tail, run and cleanup Promises before journal release.
   * A failed held invocation is never resumed by this retirement path. */
  public retireAfterOriginalExit(): Promise<void> {
    if (this.#retirementTask !== null) { return this.#retirementTask; }
    this.#current(true); this.#transport.assertOriginalExit(); this.#closing = true;
    if (!this.#settled || this.#packet === null || this.#finishTask !== null && !this.#finishSettled) { this.#fail(new Error("WIRE_PARSER_DRIVER_ORIGINAL_EXIT")); }
    const task = (async (): Promise<void> => {
      await settled(this.#armTask); await this.#tail;
      await settled(this.#runTask); await settled(this.#finishTask);
      if (this.#armTask !== null) {
        try { await this.#cleanupOnce(); } catch (cleanupError) { this.#notificationFailure ??= Object.freeze({ cause: cleanupError }); }
      }
      await settled(this.#cleanupTask);
      await settled(this.#removalTask); await settled(this.#releaseTask);
      for (const attempt of this.#attempts) { await settled(attempt.pending ?? null); }
      this.#current(true); this.#transport.assertOriginalExit();
    })(); this.#retirementTask = task; return task;
  }
  /** A local comparison can be consumed only while its original inspector
   * references and transport remain current. This issues no native ownership. */
  public requireLiveComparison(data: CurrentSchematicWireParserDriverData): CurrentSchematicWireParserData {
    this.#current(); need(this.#packet === data && !this.#released); return data.parser;
  }
  public inspect(): Readonly<{ armed: boolean; settled: boolean; finishSettled: boolean; failed: boolean; pauses: number; resumes: number;
    normalRequests: number; cleanupRequests: number; objectGroupReleased: boolean; allocationUncertain: boolean; allocatedBreakpoints: number; nativeOwnerJoined: false; parserCompleted: false; saveAuthorized: false }> {
    this.#current(true); return Object.freeze({ armed: this.#armed, settled: this.#settled, finishSettled: this.#finishSettled, failed: this.#failure !== null,
      pauses: this.#received, resumes: this.#resumes, normalRequests: this.#normal, cleanupRequests: this.#cleanup, objectGroupReleased: this.#released,
      allocationUncertain: this.#allocationUncertain, allocatedBreakpoints: this.#points.length, nativeOwnerJoined: false, parserCompleted: false, saveAuthorized: false });
  }
  public retained(): Readonly<{ attempts: readonly Readonly<Attempt>[]; events: readonly unknown[];
    firstFailure: Readonly<{ cause: unknown }> | null; notificationFailure: Readonly<{ cause: unknown }> | null }> {
    this.#current(true); return Object.freeze({ attempts: Object.freeze(this.#attempts.map(row => Object.freeze({ ...row }))),
      events: Object.freeze([...this.#events]), firstFailure: this.#failure, notificationFailure: this.#notificationFailure });
  }
}
Object.freeze(CurrentSchematicWireParserDriver.prototype); Object.freeze(CurrentSchematicWireParserDriver);
