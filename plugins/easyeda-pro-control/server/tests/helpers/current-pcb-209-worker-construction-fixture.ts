import { workerConstructionFixtureSource } from "./current-pcb-worker-construction-fixture.ts";

/** Inert unchanged vendor excerpts at the separately reviewed209 positions.
 * The changed production text is not executed: padding moves the later spans
 * and newline positions, including the actual line108 serial breakpoint. */
export function worker209ConstructionFixtureSource(publisherMethods = false): string {
  const legacy = workerConstructionFixtureSource(publisherMethods);
  return `${legacy.slice(0, 1_800_000)}${" ".repeat(24)}${legacy.slice(1_800_000)}`;
}
