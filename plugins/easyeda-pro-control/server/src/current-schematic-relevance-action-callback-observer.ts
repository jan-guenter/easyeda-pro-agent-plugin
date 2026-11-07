/** Maintained original callback entry collector. Every read remains bound to
 * the original held callback and pending Modify; it has no resume method. */
import { requireOriginalCurrentSchematicRelevanceActionCallbackOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicRelevanceDisplayActionCallbackOrigin } from "./current-schematic-relevance-display-run-handoff.ts";
import type { CurrentSchematicRelevanceActionCallbackBindings } from "./current-schematic-relevance-action-callback-origin.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_CALLBACK_OBSERVER"); } }
export class CurrentSchematicRelevanceActionCallbackObserver {
  readonly #origin: CurrentSchematicRelevanceDisplayActionCallbackOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #args: GeneratedSchematicRelevanceDisplayNativeArguments; readonly #bindings: CurrentSchematicRelevanceActionCallbackBindings;
  #attempted = false; #busy = false; #failed = false; #entry: CurrentSchematicRelevanceActionCallbackEntry | null = null;
  public constructor(origin: CurrentSchematicRelevanceDisplayActionCallbackOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, args: GeneratedSchematicRelevanceDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#args = args; this.#bindings = requireOriginalCurrentSchematicRelevanceActionCallbackOrigin(origin, owner, args); Object.freeze(this);
  }
  #current(): void { need(!this.#failed && requireOriginalCurrentSchematicRelevanceActionCallbackOrigin(this.#origin, this.#owner, this.#args) === this.#bindings); }
  public async observeEntry(): Promise<CurrentSchematicRelevanceActionCallbackEntry> {
    need(!this.#attempted && !this.#busy); this.#attempted = true; this.#busy = true;
    try {
      this.#current(); await this.#bindings.assertCurrent(); this.#current();
      for (let command = this.#bindings.nextEntryCommand(); command !== null; command = this.#bindings.nextEntryCommand()) { this.#current(); await this.#bindings.requestEntry(command); this.#current(); }
      this.#entry = this.#bindings.requireOriginalEntry(); await this.#bindings.assertCurrent(); this.#current(); need(this.#entry === this.#bindings.requireOriginalEntry()); return this.#entry;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public requireOriginalEntry(): CurrentSchematicRelevanceActionCallbackEntry { this.#current(); need(!this.#busy && this.#entry !== null && this.#entry === this.#bindings.requireOriginalEntry()); return this.#entry; }
}
