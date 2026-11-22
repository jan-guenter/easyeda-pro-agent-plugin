/** Read the original selected page roots before its first baseWatch call. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import type { CurrentSchematicWireEventRecord } from "./current-schematic-wire-event-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_BIRTH_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_NET_BIRTH_HELPER as HELPER, CURRENT_SCHEMATIC_WIRE_NET_BIRTH_REQUESTS as LIMIT, currentSchematicWireNetBirthHandle as handle, currentSchematicWireNetBirthPage as pageUuid, currentSchematicWireNetBirthProject as projectUuid, validateCurrentSchematicWireNetBirthCommand as validate } from "./current-schematic-wire-net-birth-protocol.ts";
import type { CurrentSchematicWireNetBirthCommand as Command } from "./current-schematic-wire-net-birth-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_BIRTH_SOURCE as SOURCE, currentSchematicWireNetBirthSite, qualifyCurrentSchematicWireNetBirthSource as qualify } from "./current-schematic-wire-net-birth-source.ts";
import type { CurrentSchematicWireNetWatchDriver } from "./current-schematic-wire-net-watch-driver.ts";
import { netWatchArray as array, netWatchObject as object, netWatchArrayCapture as tuple } from "./current-schematic-wire-net-watch-replies.ts";

const site = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const breakpointId = z.string().max(256);
const pausedFrame = z.strictObject({ callFrameId: handle, location: site, functionLocation: site });
const pause = z.strictObject({ sessionId: handle, method: z.literal("Debugger.paused"), params: z.strictObject({
  reason: z.literal("other"), hitBreakpoints: z.tuple([breakpointId]), callFrames: z.tuple([pausedFrame, pausedFrame]),
}) });
const helperSource = z.strictObject({ scriptSource: z.string().max(16_384) });

type Variant = 0 | 1;
type WatchInput = ConstructorParameters<typeof CurrentSchematicWireNetWatchDriver>[0];
export interface CurrentSchematicWireNetBirthTarget { readonly projectUuid: string; readonly pageUuid: string }
interface SourceBinding { readonly sessionId: string; readonly scriptId: string; readonly variant: Variant }
interface Input {
  readonly event: CurrentSchematicWireEventRecord;
  readonly target: CurrentSchematicWireNetBirthTarget;
  readonly source: unknown;
  readonly scriptId: string;
  readonly sessionId: string;
  readonly native: string;
  readonly breakpoint: string;
}
export interface CurrentSchematicWireNetBirthTransport {
  readonly request: (command: Command) => Promise<unknown>;
  /** Reprove the only current event and its acknowledged original arm. The
   * owner also proves the startup navigation still holds the original target. */
  readonly assertOriginalHeldBirth: (event: CurrentSchematicWireEventRecord, breakpoint: string, target: CurrentSchematicWireNetBirthTarget) => void;
  readonly assertOriginalSourceReceipt: (receipt: unknown, binding: SourceBinding) => void;
  /** Select the sole original scriptParsed row bound to this exact request. */
  readonly requireOriginalHelperScript: (command: Command, reply: unknown) => string;
}
export interface CurrentSchematicWireNetBirthResult {
  readonly schema: "private.schematic-wire-net-birth-read.v1";
  readonly originalPageFrameAndCallerCompared: true;
  readonly selectedPageAndProjectCompared: true;
  readonly emptyOriginalBboxUpdateRosterCompared: true;
  readonly originalNativeOwnerJoined: false;
  readonly originalWatchRegistrationObserved: false;
  readonly modifyAuthorized: false;
  readonly saveAuthorized: false;
}
interface Attempt { readonly command: Command; pending?: Promise<unknown>; reply?: unknown }
const claimed = new WeakSet<CurrentSchematicWireEventRecord>();
function need(value: boolean): asserts value { if (!value) { throw new Error("WIRE_NET_BIRTH"); } }
function equalSite(a: z.infer<typeof site>, scriptId: string, line: number, column: number): boolean {
  return a.scriptId === scriptId && a.lineNumber === line && a.columnNumber === column;
}

/** Compare the fixed initializer and suspended consistency caller on an
 * owner-qualified held event. This comparison grants no event custody. */
export function qualifyCurrentSchematicWireNetBirthPause(
  event: CurrentSchematicWireEventRecord, breakpoint: string, binding: SourceBinding,
): readonly [string, string] {
  const data = pause.parse(capture(event.event).value);
  const { scriptId, sessionId, variant } = binding;
  const [page, caller] = data.params.callFrames;
  const source = SOURCE[variant];
  need(data.sessionId === sessionId && data.params.hitBreakpoints[0] === breakpoint && page.callFrameId !== caller.callFrameId);
  need(equalSite(page.location, scriptId, source.page.lineNumber, source.page.held) &&
    equalSite(page.functionLocation, scriptId, source.page.lineNumber, source.page.columnNumber) &&
    equalSite(caller.location, scriptId, source.caller.lineNumber, source.caller.held) &&
    equalSite(caller.functionLocation, scriptId, source.caller.lineNumber, source.caller.columnNumber));
  return Object.freeze([page.callFrameId, caller.callFrameId]);
}

export class CurrentSchematicWireNetBirthReader {
  readonly #input: Readonly<Input>;
  readonly #bound: SourceBinding;
  readonly #transport: CurrentSchematicWireNetBirthTransport;
  readonly #attempts: Attempt[] = [];
  readonly #targetIds: CurrentSchematicWireNetBirthTarget;
  #frames: readonly [string, string] | null = null;
  #watch: WatchInput | null = null;
  #result: CurrentSchematicWireNetBirthResult | null = null;
  #pending: Promise<CurrentSchematicWireNetBirthResult> | null = null;

  public constructor(input: Input, transport: CurrentSchematicWireNetBirthTransport) {
    const source = input.source;
    need(!types.isProxy(input.target) && Object.isFrozen(input.target));
    need(source !== null && typeof source === "object" && !types.isProxy(source) && Object.isFrozen(source));
    const variant = qualify(source);
    const breakpoint = input.breakpoint === currentSchematicWireNetBirthSite(variant).breakpointId ?
      input.breakpoint : handle.parse(input.breakpoint);
    this.#input = Object.freeze({ ...input, native: handle.parse(input.native), breakpoint });
    this.#targetIds = Object.freeze({ projectUuid: projectUuid.parse(input.target.projectUuid), pageUuid: pageUuid.parse(input.target.pageUuid) });
    this.#transport = transport;
    this.#bound = Object.freeze({ scriptId: handle.parse(input.scriptId), sessionId: handle.parse(input.sessionId), variant });
    Object.freeze(this);
  }

  #current(): void {
    const { source, event, target, breakpoint } = this.#input;
    this.#transport.assertOriginalHeldBirth(event, breakpoint, target);
    this.#transport.assertOriginalSourceReceipt(source, this.#bound);
    need(target.pageUuid === this.#targetIds.pageUuid && target.projectUuid === this.#targetIds.projectUuid);
  }


  public readOriginal(): Promise<CurrentSchematicWireNetBirthResult> {
    if (this.#pending !== null) { return this.#pending; }
    this.#current();
    const { event } = this.#input;
    need(!claimed.has(event));
    this.#frames = qualifyCurrentSchematicWireNetBirthPause(event, this.#input.breakpoint, this.#bound);
    claimed.add(event);
    const pending = Promise.withResolvers<CurrentSchematicWireNetBirthResult>();
    this.#pending = pending.promise;
    void (async (): Promise<void> => {
      try { pending.resolve(await this.#read()); } catch (error) { pending.reject(error); }
    })();
    return pending.promise;
  }

  async #send(command: Command): Promise<unknown> {
    this.#current();
    need(this.#attempts.length < LIMIT.total);
    const attempt: Attempt = { command };
    this.#attempts.push(attempt);
    const task = this.#transport.request(command);
    need(types.isPromise(task));
    attempt.pending = task;
    const raw = await task;
    attempt.reply = raw;
    this.#current();
    return raw;
  }

  async #frame(role: "page" | "caller", callFrameId: string): Promise<string> {
    const command = validate({
      phase: "wire-net-birth-frame", role, method: "Debugger.evaluateOnCallFrame",
      params: { ...FLAGS, callFrameId, expression: "[this]", returnByValue: false, includeCommandLineAPI: false },
    });
    return tuple(await this.#send(command), 1);
  }

  async #read(): Promise<CurrentSchematicWireNetBirthResult> {
    const frames = this.#frames;
    need(frames !== null);
    const page = await this.#frame("page", frames[0]);
    const caller = await this.#frame("caller", frames[1]);
    const { native, source } = this.#input;
    const target = this.#targetIds;
    const command = validate({
      phase: "wire-net-birth-helper", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: page, functionDeclaration: HELPER, arguments: [
          { objectId: native }, { objectId: caller }, { value: target.projectUuid }, { value: target.pageUuid },
        ], returnByValue: false, awaitPromise: false, userGesture: false,
      },
    });
    const result = await this.#send(command);
    const helperId = handle.parse(this.#transport.requireOriginalHelperScript(command, result));
    need(helperId !== this.#bound.scriptId);
    const sourceReply = await this.#send(validate({ phase: "wire-net-birth-helper-source", method: "Debugger.getScriptSource", params: { scriptId: helperId } }));
    need(helperSource.parse(capture(sourceReply).value).scriptSource === `(${HELPER})`);
    const roots = tuple(result, 5);
    const props = validate({
      phase: "wire-net-birth-properties", method: "Runtime.getProperties",
      params: { objectId: roots, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false },
    });
    const values = array(await this.#send(props), 5);
    object(values.get("3"));
    object(values.get("4"));
    need(this.#attempts.length === LIMIT.total);
    this.#watch = Object.freeze({ ...this.#bound, source, native, page: object(values.get("0")), shapes: object(values.get("1")), net: object(values.get("2")) });
    const receipt: CurrentSchematicWireNetBirthResult = Object.freeze({
      schema: "private.schematic-wire-net-birth-read.v1", originalPageFrameAndCallerCompared: true, selectedPageAndProjectCompared: true,
      emptyOriginalBboxUpdateRosterCompared: true, originalNativeOwnerJoined: false, originalWatchRegistrationObserved: false,
      modifyAuthorized: false, saveAuthorized: false,
    });
    this.#result = receipt;
    return receipt;
  }

  /** Retain the three original startup handles before releasing the hold. */
  public requireOriginalWatchInput(packet: CurrentSchematicWireNetBirthResult): WatchInput {
    this.#current();
    need(this.#result === packet && this.#watch !== null);
    return this.#watch;
  }
}
Object.freeze(CurrentSchematicWireNetBirthReader.prototype);
Object.freeze(CurrentSchematicWireNetBirthReader);
