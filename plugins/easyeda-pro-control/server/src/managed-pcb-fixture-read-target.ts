/** Both original data brands admit only generated PCB readers. */
import { assertOriginalGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { assertOriginalGeneratedPadFixtureTarget } from "./managed-pad-fixture-initial-sql.ts";
import type { QualifiedGeneratedPadFixtureTarget } from "./managed-pad-fixture-initial-sql.ts";

export type QualifiedGeneratedPcbReadTarget = QualifiedGeneratedFixtureTarget | QualifiedGeneratedPadFixtureTarget;
export function assertOriginalGeneratedPcbReadTarget(value: QualifiedGeneratedPcbReadTarget): void {
  if (value.schema === "easyeda-pro-control.qualified-generated-pad-fixture-target.v1") { assertOriginalGeneratedPadFixtureTarget(value); }
  else { assertOriginalGeneratedFixtureTarget(value); }
}
