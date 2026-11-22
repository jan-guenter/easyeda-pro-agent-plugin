/** Core-issued native dependency observation from the same original Wire
 * holder and idle intent. No setter, action, worker or Save is dispatched. */
import { z } from "zod";
import { requireOriginalCurrentSchematicWireDependencyOrigin } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentSchematicWireEditOwner } from "./current-schematic-wire-edit-owner.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_FLAGS as FLAGS, validateCurrentSchematicWireDependencyCommand } from "./current-schematic-wire-dependencies-protocol.ts";
import type { CurrentSchematicWireDependencyCommand } from "./current-schematic-wire-dependencies-protocol.ts";
import { CurrentSchematicWireDependencyCursor } from "./current-schematic-wire-dependencies-cursor.ts";
import type { CurrentSchematicWireDependencyValues } from "./current-schematic-wire-dependencies-cursor.ts";

export interface CurrentSchematicWireDependencyOrigin { readonly profile: "private.current-schematic-wire-dependency-origin.v1" }
export interface CurrentSchematicWireDependencyBindings {
  readonly holderObjectId: string; readonly targetJson: string; readonly operationJson: string; readonly sourceSha256: string;
  readonly request: (command: CurrentSchematicWireDependencyCommand, cleanup: boolean) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>; readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
export interface CurrentSchematicWireDependencyObservation {
  readonly schema: "private.current-schematic-wire-dependency-observation.v1"; readonly sourceSha256: string; readonly nativeFunctions: 19;
  readonly originalIdleIntentJoined: true; readonly originalNativeDependenciesJoined: true; readonly originalSetIteratorPrototypeJoined: true;
  readonly originalSetLinesInvocationJoined: false; readonly bboxCompletionVerified: false; readonly workerCompletionVerified: false;
  readonly executionAuthorized: false; readonly saveAuthorized: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
const issued = new WeakMap<CurrentSchematicWireDependencyObservation, CurrentSchematicWireDependencyObserver>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_DEPENDENCY_ORIGINAL_OBSERVATION"); } }
export class CurrentSchematicWireDependencyObserver {
  readonly #origin: CurrentSchematicWireDependencyOrigin; readonly #owner: CurrentSchematicWireEditOwner; readonly #args: GeneratedSchematicWireEditNativeArguments;
  readonly #bindings: CurrentSchematicWireDependencyBindings; readonly #cursor: CurrentSchematicWireDependencyCursor;
  #task: Promise<CurrentSchematicWireDependencyObservation> | null = null; #settled = false; #failed = false; #retired = false; #released = false;
  #releaseTask: Promise<void> | null = null; #packet: CurrentSchematicWireDependencyObservation | null = null;
  public constructor(origin: CurrentSchematicWireDependencyOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments) {
    this.#bindings = requireOriginalCurrentSchematicWireDependencyOrigin(origin, owner, args); this.#origin = origin; this.#owner = owner; this.#args = args;
    this.#cursor = new CurrentSchematicWireDependencyCursor(this.#bindings.holderObjectId, this.#bindings.targetJson, this.#bindings.operationJson); Object.freeze(this);
  }
  async #current(): Promise<void> {
    need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireDependencyOrigin(this.#origin, this.#owner, this.#args) === this.#bindings);
    await this.#bindings.assertCurrent(); need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireDependencyOrigin(this.#origin, this.#owner, this.#args) === this.#bindings);
  }
  /** Retain one original Promise including rejection; a timeout cannot retry. */
  public observe(): Promise<CurrentSchematicWireDependencyObservation> {
    if (this.#task !== null) { return this.#task; }
    const pending = (async (): Promise<CurrentSchematicWireDependencyObservation> => {
      try {
        await this.#current();
        for (let command = this.#cursor.next(); command !== null; command = this.#cursor.next()) {
          await this.#current(); this.#cursor.reserve(command); const raw = captureCurrentPcbStringClockReply(await this.#bindings.request(command, false)).value;
          await this.#current(); this.#cursor.accept(command, raw);
        }
        this.#cursor.requireCompleted(); await this.#current();
        const packet: CurrentSchematicWireDependencyObservation = Object.freeze({ schema: "private.current-schematic-wire-dependency-observation.v1", sourceSha256: this.#bindings.sourceSha256, nativeFunctions: 19,
          originalIdleIntentJoined: true, originalNativeDependenciesJoined: true, originalSetIteratorPrototypeJoined: true, originalSetLinesInvocationJoined: false,
          bboxCompletionVerified: false, workerCompletionVerified: false, executionAuthorized: false, saveAuthorized: false, selectedSqlAuthorized: false, persistenceVerified: false });
        this.#packet = packet; issued.set(packet, this); return packet;
      } catch (error) { this.#failed = true; this.#cursor.fail(); this.#bindings.fail(); throw error; } finally { this.#settled = true; }
    })(); this.#task = pending; return pending;
  }
  public requireOriginal(packet: CurrentSchematicWireDependencyObservation, origin: CurrentSchematicWireDependencyOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireDependencyValues {
    need(issued.get(packet) === this && packet === this.#packet && origin === this.#origin && owner === this.#owner && args === this.#args && this.#settled && !this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireDependencyOrigin(origin, owner, args) === this.#bindings); return this.#cursor.requireCompleted();
  }
  /** Cleanup is consumed before dispatch and keeps its original rejection. */
  public release(): Promise<void> {
    if (this.#releaseTask !== null) { return this.#releaseTask; }
    const pending = (async (): Promise<void> => {
      try { await this.#current(); need(this.#settled && this.#packet !== null);
        const command = validateCurrentSchematicWireDependencyCommand({ phase: "wire-dependency-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: FLAGS.objectGroup } });
        z.strictObject({}).parse(captureCurrentPcbStringClockReply(await this.#bindings.request(command, true)).value); await this.#current(); this.#released = true;
      } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; }
    })(); this.#releaseTask = pending; return pending;
  }
  public async retireAfterOriginalExit(): Promise<void> {
    need(this.#settled && !this.#retired && requireOriginalCurrentSchematicWireDependencyOrigin(this.#origin, this.#owner, this.#args) === this.#bindings);
    await this.#bindings.assertOriginalGenerationExited(); need(requireOriginalCurrentSchematicWireDependencyOrigin(this.#origin, this.#owner, this.#args) === this.#bindings); this.#retired = true;
  }
}
export function requireOriginalCurrentSchematicWireDependencyObservation(packet: CurrentSchematicWireDependencyObservation, origin: CurrentSchematicWireDependencyOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireDependencyValues {
  const observer = issued.get(packet); need(observer !== undefined); return observer.requireOriginal(packet, origin, owner, args);
}
