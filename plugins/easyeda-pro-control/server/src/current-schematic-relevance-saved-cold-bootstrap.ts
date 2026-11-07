/** Source-only seven-stage runner reused as inert syntax. The containing new
 * schematic owner must retain its own actual pair and request/event cursor;
 * this runner issues no native origin, cache, parser or opening permission. */
import { CurrentPcbViaSavedLoadBootstrap } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadBootstrapBindings, CurrentPcbViaSavedLoadBootstrapResult } from "./current-pcb-via-saved-load-bootstrap.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_BOOTSTRAP_REQUESTS as REQUESTS } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_COLD_REQUESTS = Object.freeze({ normal: REQUESTS.normal, continuations: REQUESTS.initialContinuations, total: REQUESTS.totalUntilProjectHeld });
export type CurrentSchematicRelevanceSavedColdBindings = CurrentPcbViaSavedLoadBootstrapBindings;
export type CurrentSchematicRelevanceSavedColdResult = Omit<CurrentPcbViaSavedLoadBootstrapResult, "schema"> & Readonly<{
  schema: "private.current-schematic-relevance-saved-cold-held.v1";
}>;
export class CurrentSchematicRelevanceSavedColdBootstrap {
  readonly #runner: CurrentPcbViaSavedLoadBootstrap;
  #pending: Promise<CurrentSchematicRelevanceSavedColdResult> | null = null;
  public constructor(bindings: CurrentSchematicRelevanceSavedColdBindings) { this.#runner = new CurrentPcbViaSavedLoadBootstrap(bindings); Object.freeze(this); }
  public observe(): Promise<CurrentSchematicRelevanceSavedColdResult> {
    this.#pending ??= (async (): Promise<CurrentSchematicRelevanceSavedColdResult> => {
      const result = await this.#runner.observe(); return Object.freeze({ ...result, schema: "private.current-schematic-relevance-saved-cold-held.v1" });
    })(); return this.#pending;
  }
}
