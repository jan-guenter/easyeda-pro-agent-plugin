/** Captured methods of the two original opening classes. Shared core methods
 * retain their private receiver and packet checks; this dispatcher grants no
 * execution purpose and cannot turn a preparation opening into a copy owner. */
import { types } from "node:util";
import { CurrentFootprintCopyStartupOpening, CurrentPcb209WorkerStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyOpeningOwner } from "./current-pcb-209-worker-startup-opening.ts";

const preparation: CurrentFootprintCopyOpeningOwner = CurrentPcb209WorkerStartupOpening.prototype;
const execution: CurrentFootprintCopyOpeningOwner = CurrentFootprintCopyStartupOpening.prototype;
const keys = ["requireFootprintSource", "requireFootprintState", "originalActorObservation",
  "observeFootprintProducers", "requireFootprintProducers"] as const;
// oxlint-disable typescript/unbound-method -- These immutable original class methods are invoked with their retained private-field opening by the preparation issuers.
const methods = Object.freeze({ requireFootprintSource: preparation.requireFootprintSource,
  requireFootprintState: preparation.requireFootprintState, originalActorObservation: preparation.originalActorObservation,
  observeFootprintProducers: preparation.observeFootprintProducers, requireFootprintProducers: preparation.requireFootprintProducers });
// oxlint-enable typescript/unbound-method

export function currentFootprintCopyPreparationOpeningMethods(opening: CurrentFootprintCopyOpeningOwner): typeof methods {
  if (opening === null || typeof opening !== "object" || types.isProxy(opening)) {
    throw new Error("CURRENT_FOOTPRINT_COPY_PREPARATION: original opening object required");
  }
  const prototype: unknown = Object.getPrototypeOf(opening);
  if (prototype !== preparation && prototype !== execution ||
    keys.some(key => preparation[key] !== methods[key] || execution[key] !== methods[key])) {
    throw new Error("CURRENT_FOOTPRINT_COPY_PREPARATION: original opening class methods changed");
  }
  return methods;
}
