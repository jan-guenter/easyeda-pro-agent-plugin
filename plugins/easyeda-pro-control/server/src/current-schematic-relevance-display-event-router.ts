/** Inert finite seven-record startup routing. This class resumes no realm and
 * cannot issue an original native, timer or design-write capability. */
import { CurrentSchematicDisplayEventRouter } from "./current-schematic-display-event-router.ts";
import type { CurrentSchematicDisplayEventLane } from "./current-schematic-display-event-router.ts";

export class CurrentSchematicRelevanceDisplayEventRouter extends CurrentSchematicDisplayEventRouter {
  protected override acceptsLane(lane: CurrentSchematicDisplayEventLane): boolean { return lane === "quiesce" || lane === "library" || super.acceptsLane(lane); }
  // oxlint-disable-next-line eslint/class-methods-use-this -- This protected virtual policy keeps the original owner limits fixed while the dedicated seven-record subclass supplies its separate finite policy.
  protected override maximumRegisteredPoints(): number { return 59 + 2 + 7; }
}
