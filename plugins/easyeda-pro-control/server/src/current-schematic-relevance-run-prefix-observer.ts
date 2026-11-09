/** Actual original-owner collection only. This observer offers no action,
 * callback, setter or resume method. */
import { requireOriginalCurrentSchematicRelevanceRunPrefixOrigin } from "./current-schematic-relevance-display-write-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { CurrentSchematicRelevanceRunPrefixBindings, CurrentSchematicRelevanceRunPrefixOrigin } from "./current-schematic-relevance-run-prefix-origin.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND as BOUND } from "./current-schematic-relevance-run-prefix-protocol.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";

export interface CurrentSchematicRelevanceRunPrefixObservation {
  readonly profile: "private.current-schematic-relevance-run-prefix-observation.v1";
  readonly originalRunStillHeld: true; readonly originalRequests: number;
  readonly sourceFunctions: 34; readonly originalQueueFunctions: 17; readonly nativeFunctions: 34;
  readonly callbackReceiversVerified: false; readonly continuationAuthorized: false; readonly persistenceVerified: false;
}
const packets = new WeakMap<CurrentSchematicRelevanceRunPrefixObservation, CurrentSchematicRelevanceRunPrefixObserver>();
export class CurrentSchematicRelevanceRunPrefixObserver {
  readonly #origin: CurrentSchematicRelevanceRunPrefixOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #arguments: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly #bindings: CurrentSchematicRelevanceRunPrefixBindings;
  #attempted = false; #failed = false; #packet: CurrentSchematicRelevanceRunPrefixObservation | null = null;
  public constructor(origin: CurrentSchematicRelevanceRunPrefixOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#arguments = argumentsValue; this.#bindings = requireOriginalCurrentSchematicRelevanceRunPrefixOrigin(origin, owner, argumentsValue); Object.freeze(this);
  }
  #original(): void { if (this.#failed || requireOriginalCurrentSchematicRelevanceRunPrefixOrigin(this.#origin, this.#owner, this.#arguments) !== this.#bindings) { throw new Error("SCHEMATIC_RUN_PREFIX_ORIGINAL_OWNER"); } }
  public async observe(): Promise<CurrentSchematicRelevanceRunPrefixObservation> {
    this.#original(); if (this.#attempted) { throw new Error("SCHEMATIC_RUN_PREFIX_OBSERVATION_CONSUMED"); } this.#attempted = true;
    try {
      for (let count = 0; count < BOUND; count += 1) {
        this.#original(); const command = this.#bindings.nextCommand(); if (command === null) { break; }
        await this.#bindings.request(command); this.#original();
      }
      if (this.#bindings.nextCommand() !== null) { throw new Error("SCHEMATIC_RUN_PREFIX_REQUEST_BOUND"); }
      await this.#bindings.complete(); this.#original(); const capture = this.#bindings.requireCapture();
      const packet: CurrentSchematicRelevanceRunPrefixObservation = Object.freeze({ profile: "private.current-schematic-relevance-run-prefix-observation.v1", originalRunStillHeld: true, originalRequests: capture.originalRequests, sourceFunctions: 34, originalQueueFunctions: 17, nativeFunctions: 34, callbackReceiversVerified: false, continuationAuthorized: false, persistenceVerified: false });
      this.#packet = packet; packets.set(packet, this); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; }
  }
  public requireData(packet: CurrentSchematicRelevanceRunPrefixObservation, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): void {
    if (packets.get(packet) !== this || this.#packet !== packet || owner !== this.#owner || argumentsValue !== this.#arguments) { throw new Error("SCHEMATIC_RUN_PREFIX_ORIGINAL_PACKET"); } this.#original(); this.#bindings.requireCapture();
  }
}
