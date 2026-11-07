import type { CurrentSchematicRelevanceUiPublicationReceipt } from "./current-schematic-relevance-ui-publication-cursor.ts";
/** Maintained original callback entry collector. Every read remains bound to
 * the original held callback and pending Modify; it has no resume method. */
import { requireOriginalCurrentSchematicRelevanceActionCallbackOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicRelevanceDisplayActionCallbackOrigin } from "./current-schematic-relevance-display-run-handoff.ts";
import type { CurrentSchematicRelevanceActionCallbackBindings } from "./current-schematic-relevance-action-callback-origin.ts";
import type { CurrentSchematicRelevanceActiveHistoryReceipt } from "./current-schematic-relevance-active-history-cursor.ts";
import type { CurrentSchematicRelevanceFirstSetterReceipt } from "./current-schematic-relevance-first-setter-cursor.ts";
import type { CurrentSchematicRelevanceSetAttributeReceipt, CurrentSchematicRelevanceUnderlineBridgeReceipt } from "./current-schematic-relevance-underline-bridge-cursor.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_CALLBACK_OBSERVER"); } }
export class CurrentSchematicRelevanceActionCallbackObserver {
  readonly #origin: CurrentSchematicRelevanceDisplayActionCallbackOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #args: GeneratedSchematicRelevanceDisplayNativeArguments; readonly #bindings: CurrentSchematicRelevanceActionCallbackBindings;
  #attempted = false; #firstSetterAttempted = false; #firstSetterReadAttempted = false; #busy = false; #failed = false; #entry: CurrentSchematicRelevanceActionCallbackEntry | null = null; #setter: CurrentSchematicRelevanceFirstSetterReceipt | null = null;
  #activeAttempted = false; #active: CurrentSchematicRelevanceActiveHistoryReceipt | null = null;
  #bridgeAttempted = false; #setAttributeAttempted = false; #setAttributeReadAttempted = false; #bridge: CurrentSchematicRelevanceUnderlineBridgeReceipt | null = null; #setAttribute: CurrentSchematicRelevanceSetAttributeReceipt | null = null;
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
  public async continueToFirstSetter(): Promise<void> {
    this.#current(); need(!this.#busy && !this.#firstSetterAttempted && this.#entry !== null); this.#firstSetterAttempted = true; this.#busy = true;
    try { need(this.#entry === this.#bindings.requireOriginalEntry()); await this.#bindings.continueToFirstSetter(); this.#current(); need(this.#entry === this.#bindings.requireOriginalEntry()); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeFirstSetter(): Promise<CurrentSchematicRelevanceFirstSetterReceipt> {
    this.#current(); need(!this.#busy && this.#firstSetterAttempted && !this.#firstSetterReadAttempted); this.#firstSetterReadAttempted = true; this.#busy = true;
    try { await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextFirstSetterCommand(); command !== null; command = this.#bindings.nextFirstSetterCommand()) { await this.#bindings.requestFirstSetter(command); this.#current(); } this.#setter = this.#bindings.requireOriginalFirstSetter(); await this.#bindings.assertCurrent(); this.#current(); need(this.#setter === this.#bindings.requireOriginalFirstSetter()); return this.#setter; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeUnderlineForwarding(): Promise<CurrentSchematicRelevanceUnderlineBridgeReceipt> {
    this.#current(); need(!this.#busy && this.#setter !== null && !this.#bridgeAttempted); this.#bridgeAttempted = true; this.#busy = true;
    try { need(this.#setter === this.#bindings.requireOriginalFirstSetter()); await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextUnderlineBridgeCommand(); command !== null; command = this.#bindings.nextUnderlineBridgeCommand()) { await this.#bindings.requestUnderlineBridge(command); this.#current(); } this.#bridge = this.#bindings.requireOriginalUnderlineBridge(); await this.#bindings.assertCurrent(); this.#current(); need(this.#bridge === this.#bindings.requireOriginalUnderlineBridge()); return this.#bridge; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async continueToSetAttribute(): Promise<void> {
    this.#current(); need(!this.#busy && this.#bridge !== null && !this.#setAttributeAttempted); this.#setAttributeAttempted = true; this.#busy = true;
    try { need(this.#bridge === this.#bindings.requireOriginalUnderlineBridge()); await this.#bindings.continueToSetAttribute(); this.#current(); need(this.#bridge === this.#bindings.requireOriginalUnderlineBridge()); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeSetAttribute(): Promise<CurrentSchematicRelevanceSetAttributeReceipt> {
    this.#current(); need(!this.#busy && this.#setAttributeAttempted && !this.#setAttributeReadAttempted); this.#setAttributeReadAttempted = true; this.#busy = true;
    try { await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextSetAttributeCommand(); command !== null; command = this.#bindings.nextSetAttributeCommand()) { await this.#bindings.requestSetAttribute(command); this.#current(); } this.#setAttribute = this.#bindings.requireOriginalSetAttribute(); await this.#bindings.assertCurrent(); this.#current(); need(this.#setAttribute === this.#bindings.requireOriginalSetAttribute()); return this.#setAttribute; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeActiveHistory(): Promise<CurrentSchematicRelevanceActiveHistoryReceipt> {
    this.#current(); need(!this.#busy && this.#setAttribute !== null && !this.#activeAttempted); this.#activeAttempted = true; this.#busy = true;
    try { need(this.#setAttribute === this.#bindings.requireOriginalSetAttribute()); await this.#bindings.assertCurrent(); this.#current(); for (let command = this.#bindings.nextActiveHistoryCommand(); command !== null; command = this.#bindings.nextActiveHistoryCommand()) { await this.#bindings.requestActiveHistory(command); this.#current(); } this.#active = this.#bindings.requireOriginalActiveHistory(); await this.#bindings.assertCurrent(); this.#current(); need(this.#active === this.#bindings.requireOriginalActiveHistory()); return this.#active; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeUiPublicationPristine(): Promise<CurrentSchematicRelevanceUiPublicationReceipt> {
    this.#current(); if (this.#busy) { throw new Error("SCHEMATIC_CALLBACK_OBSERVER_BUSY"); } this.#busy = true;
    try { for (;;) { const command = this.#bindings.nextUiPublicationCommand(); if (command === null) { break; } await this.#bindings.requestUiPublication(command); this.#current(); } return this.#bindings.requireOriginalUiPublication(); }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public requireOriginalEntry(): CurrentSchematicRelevanceActionCallbackEntry { this.#current(); need(!this.#busy && this.#entry !== null && this.#entry === this.#bindings.requireOriginalEntry()); return this.#entry; }
}
