/** Original navigation-side initializer arm and cleanup for a separate native
 * allocation. Its transport must be issued by that allocation's event owner. */
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource } from "./current-schematic-display-accessor-replies.ts";
import type { CurrentSchematicWireEventRecord } from "./current-schematic-wire-event-observer.ts";
import { qualifyCurrentSchematicWireNetBirthPause } from "./current-schematic-wire-net-birth-reader.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_BIRTH_SOURCE as SOURCE, qualifyCurrentSchematicWireNetBirthSource, currentSchematicWireNetBirthSite as siteFor } from "./current-schematic-wire-net-birth-source.ts";

type Variant = 0 | 1;
type Request =
  | Readonly<{ phase: "arm"; variant: Variant }>
  | Readonly<{ phase: "source"; variant: Variant; scriptId: string }>
  | Readonly<{ phase: "remove"; variant: Variant; breakpointId: string }>
  | Readonly<{ phase: "resume"; variant: Variant; scriptId: string }>;
export type CurrentSchematicWireV5EarlyInitRequest = Request;

export const CURRENT_SCHEMATIC_WIRE_V5_EARLY_INIT_PROFILE = Object.freeze({
  action: "schematic-wire-v5-early-init",
  renderer: Object.freeze({ arm: SOURCE.length, source: 1, remove: SOURCE.length, resume: 1 }),
  polling: Object.freeze({ ordinaryMilliseconds: 5000, sourceMilliseconds: 30_000, emptyMilliseconds: 20 }),
});

export interface CurrentSchematicWireV5EarlyInitHeld {
  readonly script: CurrentSchematicWireEventRecord;
  readonly variant: Variant;
  readonly pause: CurrentSchematicWireEventRecord;
  readonly resolution: DiagnosticEvent | null;
}
export interface CurrentSchematicWireV5EarlyInitHold {
  readonly event: CurrentSchematicWireEventRecord;
  readonly source: Readonly<{ scriptSource: string }>;
  readonly sessionId: string;
  readonly scriptId: string;
  readonly variant: Variant;
  readonly breakpoint: string;
}
export interface CurrentSchematicWireV5EarlyInitTransport {
  /** Configure only the lifetime of the original owned, attached editor. */
  readonly assertCurrent: () => void;
  readonly assertBeforeNavigation: () => void;
  /** Reprove the original pending navigation and the same still-held pause.
   * A prior script event requires custody from the original debugger enable. */
  readonly requireOriginalHeld: () => CurrentSchematicWireV5EarlyInitHeld;
  /** Return the reply correlated to this request on the original allocation.
   * A missing or invalid arm acknowledgement leaves its installation unknown. */
  readonly request: (command: Request) => Promise<unknown>;
  readonly waitForOriginalResumed: (held: CurrentSchematicWireV5EarlyInitHeld) => Promise<void>;
}

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const acknowledgement = z.strictObject({ breakpointId: z.string().max(256), locations: z.array(location).max(1) });
const resolved = z.strictObject({ breakpointId: z.string().max(256), location });
const scriptParsed = z.strictObject({ scriptId: handle, url: z.string(), length: z.number().int().positive() });
const empty = z.strictObject({});
const variants = [0, 1] as const;
interface Arm {
  readonly variant: Variant;
  breakpointId: string | null;
  scriptId: string | null;
  removalAttempted: boolean;
  removed: boolean;
}
function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("WIRE_V5_EARLY_INIT_CUSTODY"); }
}

export class CurrentSchematicWireV5EarlyInit {
  readonly #session: string;
  readonly #transport: Readonly<CurrentSchematicWireV5EarlyInitTransport>;
  readonly #arms = new Map<Variant, Arm>();
  #armAttempted = false;
  #arming = false;
  #hold: Readonly<{ held: CurrentSchematicWireV5EarlyInitHeld; receipt: CurrentSchematicWireV5EarlyInitHold }> | null = null;
  #readAttempted = false;
  #reading = false;
  #releaseAttempted = false;
  #releasing = false;
  #retirement: Promise<void> | null = null;
  #removalFailure: Readonly<{ cause: unknown }> | null = null;
  #armComplete = false;

  public constructor(session: string, transport: CurrentSchematicWireV5EarlyInitTransport) {
    this.#session = handle.parse(session);
    this.#transport = Object.freeze({ ...transport });
  }

  public async arm(): Promise<void> {
    need(!this.#armAttempted && this.#retirement === null);
    this.#transport.assertBeforeNavigation();
    this.#armAttempted = true;
    this.#arming = true;
    try {
      for (const variant of variants) {
        const site = siteFor(variant);
        this.#transport.assertBeforeNavigation();
        const arm: Arm = { variant, breakpointId: null, scriptId: null, removalAttempted: false, removed: false };
        this.#arms.set(variant, arm);
        const raw = capture(await this.#transport.request(Object.freeze({ phase: "arm", variant }))).value;
        const installed = acknowledgement.parse(raw);
        need(installed.breakpointId === site.breakpointId);
        arm.breakpointId = installed.breakpointId;
        this.#transport.assertBeforeNavigation();
        const [reported] = installed.locations;
        if (reported !== undefined) {
          need(reported.lineNumber === site.lineNumber && reported.columnNumber === site.columnNumber);
          arm.scriptId = reported.scriptId;
        }
      }
      this.#armComplete = true;
    } finally { this.#arming = false; }
  }

  #sameHeld(held: CurrentSchematicWireV5EarlyInitHeld): void {
    this.#transport.assertCurrent();
    need(this.#transport.requireOriginalHeld() === held);
  }

  #script(held: CurrentSchematicWireV5EarlyInitHeld): Readonly<{ scriptId: string; length: number }> {
    const { script, variant, pause, resolution } = held;
    const arm = this.#arms.get(variant);
    need(arm !== undefined && arm.breakpointId !== null && script.transportBytesRetained && pause.transportBytesRetained &&
      script.event.method === "Debugger.scriptParsed" && script.event.sessionId === this.#session);
    const parsed = scriptParsed.parse(capture(script.event.params).value);
    const site = siteFor(variant);
    need(parsed.url === site.url);
    if (arm.scriptId === null) {
      need(resolution !== null && resolution.method === "Debugger.breakpointResolved" && resolution.sessionId === this.#session);
      const row = resolved.parse(capture(resolution.params).value);
      need(row.breakpointId === arm.breakpointId && row.location.scriptId === parsed.scriptId &&
        row.location.lineNumber === site.lineNumber && row.location.columnNumber === site.columnNumber);
    } else { need(arm.scriptId === parsed.scriptId && resolution === null); }
    qualifyCurrentSchematicWireNetBirthPause(pause, arm.breakpointId, { sessionId: this.#session, scriptId: parsed.scriptId, variant });
    return parsed;
  }

  /** Keep the actual initializer paused so the existing birth reader and
   * watch registration driver can take custody before any resume. */
  public async readOriginalHold(): Promise<CurrentSchematicWireV5EarlyInitHold> {
    need(this.#armComplete && !this.#arming && !this.#readAttempted && this.#retirement === null);
    this.#readAttempted = true;
    this.#reading = true;
    try {
      const held = this.#transport.requireOriginalHeld();
      this.#sameHeld(held);
      const { scriptId, length } = this.#script(held);
      const { variant } = held;
      const raw = await this.#transport.request(Object.freeze({ phase: "source", variant, scriptId }));
      this.#sameHeld(held);
      const source = captureCurrentSchematicDisplayAccessorSource(raw);
      need(source.scriptSource.length === length && qualifyCurrentSchematicWireNetBirthSource(source) === variant);
      const receipt = Object.freeze({ event: held.pause, source, sessionId: this.#session, scriptId, variant,
        breakpoint: siteFor(variant).breakpointId });
      this.#hold = Object.freeze({ held, receipt });
      return receipt;
    } finally { this.#reading = false; }
  }

  public requireOriginalHold(receipt: CurrentSchematicWireV5EarlyInitHold): void {
    const original = this.#hold;
    need(original !== null && original.receipt === receipt && !this.#releaseAttempted && this.#retirement === null);
    this.#sameHeld(original.held);
  }

  public async releaseOriginal(receipt: CurrentSchematicWireV5EarlyInitHold): Promise<void> {
    this.requireOriginalHold(receipt);
    const original = this.#hold;
    need(original !== null);
    const { held } = original;
    const { variant, scriptId } = receipt;
    this.#releaseAttempted = true;
    this.#releasing = true;
    try {
      await this.#remove(() => { this.#sameHeld(held); });
      this.#sameHeld(held);
      const raw = await this.#transport.request(Object.freeze({ phase: "resume", variant, scriptId }));
      empty.parse(capture(raw).value);
      this.#transport.assertCurrent();
      await this.#transport.waitForOriginalResumed(held);
      this.#transport.assertCurrent();
    } finally { this.#releasing = false; }
  }

  /** Remove each acknowledged arm once while retaining unresolved attempts
   * for the enclosing allocation's original owner closure. */
  public retireArms(): Promise<void> {
    if (this.#retirement !== null) { return this.#retirement; }
    need(!this.#arming && !this.#reading && !this.#releasing);
    this.#retirement = this.#remove(this.#transport.assertCurrent);
    return this.#retirement;
  }

  async #remove(current: () => void): Promise<void> {
    for (const arm of this.#arms.values()) {
      const { breakpointId } = arm;
      if (breakpointId !== null && !arm.removalAttempted) {
        current();
        arm.removalAttempted = true;
        try {
          const raw = await this.#transport.request(Object.freeze({
            phase: "remove", variant: arm.variant, breakpointId,
          }));
          empty.parse(capture(raw).value);
          arm.removed = true;
        } catch (error) { this.#removalFailure ??= Object.freeze({ cause: error }); }
        if (arm.removed) { current(); }
      }
    }
    if (this.#removalFailure !== null) { throw this.#removalFailure.cause; }
    const arms = [...this.#arms.values()];
    if (arms.some(arm => arm.breakpointId === null)) { throw new Error("WIRE_V5_EARLY_INIT_ARM_ACK_UNRESOLVED"); }
    need(arms.every(arm => arm.removed));
  }
}
