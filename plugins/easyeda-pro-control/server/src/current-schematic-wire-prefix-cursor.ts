/** The model-independent readonly prefix algorithm runs on Wire's original
 * eight-model fixture. This adapter grants no historical Relevance origin or
 * native sender. Only the original Wire event owner may use its data. */
import { CurrentSchematicRelevanceRunPrefixCursor } from "./current-schematic-relevance-run-prefix-cursor.ts";
import type { CurrentSchematicRelevanceRunPrefixCapture } from "./current-schematic-relevance-run-prefix-cursor.ts";
import type { CurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import type { CurrentSchematicWireRawCapture } from "./current-schematic-wire-raw-cursor.ts";
import { currentSchematicWirePrefixDataCommand } from "./current-schematic-wire-prefix-protocol.ts";
import type { CurrentSchematicWirePrefixCommand } from "./current-schematic-wire-prefix-protocol.ts";

export interface CurrentSchematicWireRunData {
  readonly callFrameId: string; readonly tupleObjectId: string; readonly callbackObjectId: string; readonly callbackScriptId: string;
}
export interface CurrentSchematicWirePrefixData extends Omit<CurrentSchematicRelevanceRunPrefixCapture, "originalRunStillHeld"> {
  readonly profile: "private.current-schematic-wire-run-prefix-data.v1"; readonly runFrameDataMatched: true;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_PREFIX_CURSOR"); } }
export class CurrentSchematicWirePrefixCursor {
  readonly #data: CurrentSchematicRelevanceRunPrefixCursor;
  #shared: CurrentSchematicRelevanceRunPrefixCommand | null = null; #pending: CurrentSchematicWirePrefixCommand | null = null;
  #reserved = false; #failed = false; #completed: CurrentSchematicWirePrefixData | null = null;
  /** Retain source selectors only; construction grants no original ownership. */
  public constructor(run: CurrentSchematicWireRunData, raw: CurrentSchematicWireRawCapture, idle: string, variant: 0 | 1, scriptId: string) {
    this.#data = new CurrentSchematicRelevanceRunPrefixCursor(run, raw, idle, variant, scriptId); Object.freeze(this);
  }
  /** Return this same pending command until its original reply is accepted. */
  public next(): CurrentSchematicWirePrefixCommand | null {
    need(!this.#failed && !this.#reserved); if (this.#pending !== null) { return this.#pending; } if (this.#completed !== null) { return null; }
    try {
      const actual = this.#data.next(); this.#shared = actual;
      if (actual === null) {
        const { originalRunStillHeld, ...data } = this.#data.requireCompleted(); need(originalRunStillHeld);
        this.#completed = Object.freeze({ ...data, profile: "private.current-schematic-wire-run-prefix-data.v1", runFrameDataMatched: true }); return null;
      }
      this.#pending = currentSchematicWirePrefixDataCommand(actual); return this.#pending;
    } catch (error) { this.#failed = true; this.#data.fail(); throw error; }
  }
  /** Consume the exact pending command object before native dispatch. */
  public reserve(command: CurrentSchematicWirePrefixCommand): void {
    need(!this.#failed && !this.#reserved && command === this.#pending && this.#shared !== null); this.#data.reserve(this.#shared); this.#reserved = true;
  }
  /** Match the one reserved command; rejected evidence consumes the cursor. */
  public accept(command: CurrentSchematicWirePrefixCommand, raw: unknown): void {
    need(!this.#failed && this.#reserved && command === this.#pending && this.#shared !== null);
    try { this.#data.accept(this.#shared, raw); this.#reserved = false; this.#pending = null; this.#shared = null; }
    catch (error) { this.#failed = true; this.#data.fail(); throw error; }
  }
  /** Return complete readonly data, without continuation or writer authority. */
  public requireCompleted(): CurrentSchematicWirePrefixData { need(!this.#failed && !this.#reserved && this.#pending === null); this.next(); need(this.#completed !== null); return this.#completed; }
  /** Permanently reject further commands after the original owner fails. */
  public fail(): void { this.#failed = true; this.#data.fail(); }
}
