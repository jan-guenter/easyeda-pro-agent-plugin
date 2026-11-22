/** Source-only continuation of the existing nonempty watch proof. The calle
 * owns the original arms, paused thread, action and all releases. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import type { CurrentSchematicWireEventRecord } from "./current-schematic-wire-event-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_FRAMES as FRAMES, currentSchematicWireNetGeometryCall as call, currentSchematicWireNetGeometryFrame as frame, currentSchematicWireNetGeometryHandle as handle, validateCurrentSchematicWireNetGeometryCommand as validate } from "./current-schematic-wire-net-geometry-protocol.ts";
import type { CurrentSchematicWireNetGeometryCommand as Command } from "./current-schematic-wire-net-geometry-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_ORDER as ORDER, CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PINS as PINS, qualifyCurrentSchematicWireNetGeometrySource as qualify, currentSchematicWireNetGeometryFrames as sourceFrames } from "./current-schematic-wire-net-geometry-source.ts";
import type { CurrentSchematicWireNetGeometryStep as Step } from "./current-schematic-wire-net-geometry-source.ts";
import { CurrentSchematicWireNetWatchDriver as Watch } from "./current-schematic-wire-net-watch-driver.ts";
import { netWatchArray as array, netWatchObject as object, netWatchTrue as truth, netWatchArrayCapture as tuple } from "./current-schematic-wire-net-watch-replies.ts";

const REQUESTS = 46;
const site = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const pausedFrame = z.object({ callFrameId: handle, location: site, functionLocation: site.optional() });
const pause = z.object({ sessionId: handle, method: z.literal("Debugger.paused"), params: z.object({
  reason: z.literal("other"), hitBreakpoints: z.array(handle).length(1), callFrames: z.array(pausedFrame).min(5).max(64),
}) });
type Pause = z.infer<typeof pause>;
type Preflight = Parameters<Watch["requireOriginalGeometryBinding"]>[0];
type FrameRole = keyof typeof FRAMES;
type Binding = ReturnType<Watch["requireOriginalGeometryBinding"]>;
type Helper = Parameters<typeof call>[0];

export interface CurrentSchematicWireNetGeometryTransport {
  readonly request: (command: Command) => Promise<unknown>;
  /** Reprove the original owner's still-held event and the acknowledged arm.
   * This also verifies the original writer action and source/session custody. */
  readonly assertOriginalGeometryPause: (event: CurrentSchematicWireEventRecord, step: Step, action: string, breakpoint: string) => void;
  /** The owner joins the sole original scriptParsed event correlated with this
   * exact helper execution, before this reader fetches its complete source. */
  readonly requireOriginalHelperScript: (command: Command, response: unknown) => string;
  readonly fail: (cause: unknown) => void;
}
export interface CurrentSchematicWireNetGeometryResult {
  readonly schema: "private.schematic-wire-original-net-geometry.v1";
  readonly originalRegisteredDeliveryCompared: true;
  readonly originalRefreshAndActionCompared: true;
  readonly originalMarkerConstructorAndReflectResultCompared: true;
  readonly originalMarkerParentIdMapAndRtreeCompared: true;
  readonly originalMarkerBirths: 2;
  readonly originalHeldPauses: 8;
  readonly originalNativeOwnerJoined: false;
  readonly sourceSerializationObserved: false;
  readonly modifyAuthorized: false;
  readonly saveAuthorized: false;
}
interface Attempt { readonly command: Command; pending?: Promise<unknown>; reply?: unknown }

function need(value: boolean): asserts value {
  if (!value) { throw new Error("WIRE_NET_GEOMETRY"); }
}

export class CurrentSchematicWireNetGeometryDriver {
  readonly #watch: Watch;
  readonly #preflight: Preflight;
  readonly #transport: CurrentSchematicWireNetGeometryTransport;
  readonly #action: string;
  readonly #binding: Binding;
  readonly #attempts: Attempt[] = [];
  readonly #events: CurrentSchematicWireEventRecord[] = [];
  readonly #constructed: string[] = [];
  readonly #helperScripts = new Set<string>();
  #step = 0;
  #failure: Readonly<{ cause: unknown }> | null = null;
  #pending = false;
  #before: string | null = null;
  #after: string | null = null;
  #completed: CurrentSchematicWireNetGeometryResult | null = null;

  public constructor(watch: Watch, preflight: Preflight, originalAction: string, transport: CurrentSchematicWireNetGeometryTransport) {
    need(!types.isProxy(watch) && Object.getPrototypeOf(watch) === Watch.prototype);
    this.#watch = watch;
    this.#preflight = preflight;
    this.#binding = watch.requireOriginalGeometryBinding(preflight);
    this.#action = handle.parse(originalAction);
    this.#transport = transport;
    need(qualify(this.#binding.source) === this.#binding.variant);
    Object.freeze(this);
  }

  #current(event: CurrentSchematicWireEventRecord, step: Step, breakpoint: string): void {
    if (this.#failure !== null) { throw this.#failure.cause; }
    const binding = this.#watch.requireOriginalGeometryBinding(this.#preflight);
    need(Object.is(binding.source, this.#binding.source) && binding.sessionId === this.#binding.sessionId &&
      binding.scriptId === this.#binding.scriptId && binding.native === this.#binding.native && binding.holder === this.#binding.holder &&
      binding.event === this.#binding.event && binding.register === this.#binding.register);
    this.#transport.assertOriginalGeometryPause(event, step, this.#action, breakpoint);
  }

  #frames(step: Step, data: Pause): readonly string[] {
    const { variant, scriptId, sessionId } = this.#binding;
    need(data.sessionId === sessionId);
    const selected = sourceFrames(variant, step).map(([role, column], index) => {
      const actual = data.params.callFrames[index];
      const source = PINS[variant][role];
      need(actual !== undefined && actual.location.scriptId === scriptId && actual.location.lineNumber === source.lineNumber &&
        actual.location.columnNumber === column && actual.functionLocation?.scriptId === scriptId &&
        actual.functionLocation.lineNumber === source.lineNumber && actual.functionLocation.columnNumber === source.columnNumber);
      return actual.callFrameId;
    });
    need(new Set(selected).size === selected.length);
    return selected;
  }

  /**
   * Consume one already-held original pause. The original owner decides
   * whether any resume is admissible after this Promise settles.
   */
  public async observeHeld(event: CurrentSchematicWireEventRecord): Promise<CurrentSchematicWireNetGeometryResult | null> {
    try {
      need(!this.#pending && !this.#events.includes(event));
      const step = ORDER[this.#step];
      need(step !== undefined && this.#completed === null && this.#failure === null);
      const original = pause.parse(event.original);
      const breakpoint = original.params.hitBreakpoints[0];
      need(breakpoint !== undefined);
      this.#current(event, step, breakpoint);
      this.#events.push(event);
      const frames = this.#frames(step, original);
      this.#pending = true;
      const current = (): void => { this.#current(event, step, breakpoint); };
      await this.#compare(step, frames, current);
      current();
      this.#step += 1;
      if (step === "returned") {
        need(this.#step === ORDER.length && this.#constructed.length === 2 && this.#helperScripts.size === ORDER.length && this.#attempts.length === REQUESTS);
        this.#completed = Object.freeze({
          schema: "private.schematic-wire-original-net-geometry.v1", originalRegisteredDeliveryCompared: true,
          originalRefreshAndActionCompared: true, originalMarkerConstructorAndReflectResultCompared: true,
          originalMarkerParentIdMapAndRtreeCompared: true, originalMarkerBirths: 2, originalHeldPauses: 8,
          originalNativeOwnerJoined: false, sourceSerializationObserved: false, modifyAuthorized: false, saveAuthorized: false,
        });
      }
      return this.#completed;
    } catch (error) {
      if (this.#failure === null) {
        this.#failure = Object.freeze({ cause: error });
        this.#transport.fail(error);
      }
      throw this.#failure.cause;
    } finally { this.#pending = false; }
  }

  async #send(command: Command, current: () => void): Promise<unknown> {
    current();
    need(this.#attempts.length < REQUESTS);
    const attempt: Attempt = { command };
    this.#attempts.push(attempt);
    const pending = this.#transport.request(command);
    need(types.isPromise(pending));
    attempt.pending = pending;
    const raw = await pending;
    attempt.reply = raw;
    current();
    return raw;
  }

  #properties(id: string, current: () => void): Promise<unknown> {
    return this.#send(validate({ phase: "wire-net-geometry-properties", method: "Runtime.getProperties",
      params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false },
    }), current);
  }

  async #helper(role: Helper, receiver: string, refs: readonly string[], current: () => void): Promise<unknown> {
    const command = call(role, receiver, [this.#binding.native, this.#binding.holder, this.#action, ...refs]);
    need(command.method === "Runtime.callFunctionOn");
    const result = await this.#send(command, current);
    const scriptId = handle.parse(this.#transport.requireOriginalHelperScript(command, result));
    need(scriptId !== this.#binding.scriptId && !this.#helperScripts.has(scriptId));
    const raw = await this.#send(validate({ phase: "wire-net-geometry-source", method: "Debugger.getScriptSource", params: { scriptId } }), current);
    const body = z.strictObject({ scriptSource: z.string().max(16_384) }).parse(capture(raw).value);
    need(body.scriptSource === `(${command.params.functionDeclaration})`);
    this.#helperScripts.add(scriptId);
    return result;
  }

  async #projections(frames: readonly string[], roles: readonly FrameRole[], current: () => void): Promise<readonly string[]> {
    const handles: string[] = [];
    for (const [index, role] of roles.entries()) {
      const id = frames[index];
      need(id !== undefined);
      const raw = await this.#send(frame(role, id), current);
      handles.push(tuple(raw, FRAMES[role].slots));
    }
    return handles;
  }

  async #delivery(step: "entry" | "returned", frames: readonly string[], current: () => void): Promise<void> {
    const [receiver, ...delivery] = await this.#projections(frames, ["refresh", "listener", "deliver", "dispatch", "bbox"], current);
    need(receiver !== undefined);
    const args = [this.#binding.event, this.#binding.register, ...delivery];
    if (step === "entry") {
      need(this.#before === null);
      this.#before = tuple(await this.#helper(step, receiver, args, current), 8);
    } else {
      const [first, second] = this.#constructed;
      need(this.#before !== null && first !== undefined && second !== undefined);
      this.#after = tuple(await this.#helper(step, receiver, [...args, this.#before, first, second], current), 7);
    }
  }

  async #consumeConstruction(receiver: string, refs: readonly string[], current: () => void): Promise<void> {
    const observed = tuple(await this.#helper("constructor", receiver, refs, current), 6);
    const fields = array(await this.#properties(observed, current), 6);
    const cls = fields.get("2");
    const ctor = fields.get("3");
    const pin = PINS[this.#binding.variant].markerClass;
    need(cls?.type === "function" && cls.className === "Function" && cls.subtype === undefined && cls.description !== undefined &&
      Buffer.byteLength(cls.description) === pin.bytes && createHash("sha256").update(cls.description).digest("hex") === pin.sha256);
    need(ctor?.type === "function" && ctor.subtype === undefined && ctor.className === "Function" &&
      ctor.description === "function construct() { [native code] }");
    decodeCurrentNativeFunctionMetadata(await this.#properties(object(ctor, "function"), current), { name: "construct", arity: 2, constructor: false });
    this.#constructed.push(observed);
  }

  async #compare(step: Step, frames: readonly string[], current: () => void): Promise<void> {
    if (step === "entry" || step === "returned") { await this.#delivery(step, frames, current); return; }
    const before = this.#before;
    need(before !== null);
    const variant = this.#binding.variant;
    if (step === "constructor") {
      const [receiver, ...refs] = await this.#projections(frames, [`ctor${variant}`, `reflect${variant}`, `factory${variant}`, "point"], current);
      need(receiver !== undefined);
      await this.#consumeConstruction(receiver, [before, ...refs], current);
      return;
    }
    const previous = this.#constructed.at(-1);
    need(previous !== undefined);
    const roles = step === "create" ? [`create${variant}`, `factory${variant}`, "point"] as const : ["birth"] as const;
    const [receiver, ...refs] = await this.#projections(frames, roles, current);
    need(receiver !== undefined);
    truth(await this.#helper(step, receiver, [before, previous, ...refs], current));
  }

  /** This result cannot be reconstructed from its public comparison fields. */
  public requireCompleted(packet: CurrentSchematicWireNetGeometryResult): Readonly<{ holder: string; before: string; after: string }> {
    need(this.#failure === null && !this.#pending && this.#completed === packet && this.#before !== null && this.#after !== null);
    return Object.freeze({ holder: this.#binding.holder, before: this.#before, after: this.#after });
  }
}
Object.freeze(CurrentSchematicWireNetGeometryDriver.prototype);
Object.freeze(CurrentSchematicWireNetGeometryDriver);
