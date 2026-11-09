/** A newly constructed readonly cursor/observer pair for this purpose. Only
 * inert seven-source/loading algorithms are reused; no old origin, worker,
 * checkpoint, native flag or owner is accepted by these data-only wrappers. */
import { types } from "node:util";
import { CurrentPcbViaSavedLoadController } from "./current-pcb-via-saved-load-controller.ts";
import type { CurrentPcbViaSavedLoadControllerBindings, CurrentPcbViaSavedLoadWorkerPair } from "./current-pcb-via-saved-load-controller.ts";
import type { CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadRole } from "./current-pcb-via-saved-load-source.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentSchematicRelevanceSavedColdResult } from "./current-schematic-relevance-saved-cold-bootstrap.ts";

export interface CurrentSchematicRelevanceSavedColdControllerBindings extends Omit<CurrentPcbViaSavedLoadControllerBindings, "projectSourceHeld"> {
  readonly projectSourceHeld: (source: CurrentPcbViaSavedLoadProjectSourceHeld, controller: CurrentSchematicRelevanceSavedColdController) => Promise<void>;
}
export class CurrentSchematicRelevanceSavedColdController {
  readonly #cursor: CurrentPcbViaSavedLoadController;
  #work: Promise<CurrentSchematicRelevanceSavedColdResult> | null = null;
  public constructor(bindings: CurrentSchematicRelevanceSavedColdControllerBindings) {
    if (bindings === null || typeof bindings !== "object" || types.isProxy(bindings) || Object.getPrototypeOf(bindings) !== Object.prototype || !Object.isFrozen(bindings)) { throw new Error("SCHEMATIC_SAVED_COLD_BINDINGS"); }
    for (const key of Reflect.ownKeys(bindings)) { const descriptor = Object.getOwnPropertyDescriptor(bindings, key); if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("SCHEMATIC_SAVED_COLD_BINDING_DESCRIPTOR"); } }
    this.#cursor = new CurrentPcbViaSavedLoadController(Object.freeze({ ...bindings, projectSourceHeld: async (source: CurrentPcbViaSavedLoadProjectSourceHeld, cursor: CurrentPcbViaSavedLoadController): Promise<void> => {
      if (cursor !== this.#cursor) { throw new Error("SCHEMATIC_SAVED_COLD_ORIGINAL_CURSOR"); } await bindings.projectSourceHeld(source, this);
    } })); Object.freeze(this);
  }
  public fail(): void { this.#cursor.fail(); }
  public observeEvent(event: DiagnosticEvent): void { this.#cursor.observeEvent(event); }
  public expectHelper(source: string): void { this.#cursor.expectHelper(source); }
  public consumeHelper(source: string): Promise<void> { return this.#cursor.consumeHelper(source); }
  public registerPoint(role: CurrentPcbViaSavedLoadRole, id: string): void { this.#cursor.registerPoint(role, id); }
  public reserveResume(role: CurrentPcbViaSavedLoadRole): void { this.#cursor.reserveResume(role); }
  public startProjectSource(): Promise<void> { return this.#cursor.startProjectSource(); }
  public whenProjectStarted(): Promise<void> { return this.#cursor.whenProjectStarted(); }
  public nextObservationEvent(): Promise<DiagnosticEvent> { return this.#cursor.nextObservationEvent(); }
  public requireHeld(source: CurrentPcbViaSavedLoadProjectSourceHeld): CurrentPcbViaSavedLoadWorkerPair { return this.#cursor.requireHeld(source); }
  public status(): ReturnType<CurrentPcbViaSavedLoadController["status"]> { return this.#cursor.status(); }
  public observeProjectSourceHeld(): Promise<CurrentSchematicRelevanceSavedColdResult> {
    this.#work ??= (async (): Promise<CurrentSchematicRelevanceSavedColdResult> => { const result = await this.#cursor.observeProjectSourceHeld(); return Object.freeze({ ...result, schema: "private.current-schematic-relevance-saved-cold-held.v1" }); })(); return this.#work;
  }
}
