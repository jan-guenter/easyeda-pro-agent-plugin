/** Explicit read-only join of distinct initial data profiles. The original
 * Via writer and its old checkpoint brand do not accept a Pad checkpoint. */
import type { QualifiedGeneratedPcbReadTarget } from "./managed-pcb-fixture-read-target.ts";
import { consumeManagedFixtureOpeningSource } from "./managed-fixture-opening-source.ts";
import type { ManagedFixtureOpeningSource } from "./managed-fixture-opening-source.ts";
import { consumeManagedPadFixtureOpeningSource } from "./managed-pad-fixture-opening-source.ts";
import type { ManagedPadFixtureOpeningSource } from "./managed-pad-fixture-opening-source.ts";
import { generatedFixtureDiagnosticCheckpoint, prepareGeneratedFixtureOpenCheckpoint, verifyGeneratedFixtureOpenCheckpoint,
  verifyHistoricalGeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { GeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import { generatedPadFixtureDiagnosticCheckpoint, prepareGeneratedPadFixtureOpenCheckpoint, verifyGeneratedPadFixtureOpenCheckpoint,
  verifyHistoricalGeneratedPadFixtureOpenCheckpoint } from "./managed-pad-fixture-generated-open-checkpoint.ts";
import type { GeneratedPadFixtureOpenCheckpoint } from "./managed-pad-fixture-generated-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";

export type ManagedPcbFixtureReadOpeningSource = ManagedFixtureOpeningSource | ManagedPadFixtureOpeningSource;
export type GeneratedPcbReadOpenCheckpoint = GeneratedFixtureOpenCheckpoint | GeneratedPadFixtureOpenCheckpoint;
export function consumeManagedPcbReadOpeningSource(source: ManagedPcbFixtureReadOpeningSource): Readonly<{ qualification: QualifiedGeneratedPcbReadTarget; archive: Buffer }> {
  return source.schema === "private.generated-pad-fixture-opening-source.v1" ? consumeManagedPadFixtureOpeningSource(source) : consumeManagedFixtureOpeningSource(source);
}
export function prepareGeneratedPcbReadOpenCheckpoint(source: Readonly<{ qualification: QualifiedGeneratedPcbReadTarget; archive: Buffer }>): Promise<GeneratedPcbReadOpenCheckpoint> {
  return source.qualification.schema === "easyeda-pro-control.qualified-generated-pad-fixture-target.v1" ?
    prepareGeneratedPadFixtureOpenCheckpoint({ qualification: source.qualification, archive: source.archive }) :
    prepareGeneratedFixtureOpenCheckpoint({ qualification: source.qualification, archive: source.archive });
}
export function generatedPcbReadDiagnosticCheckpoint(prepared: GeneratedPcbReadOpenCheckpoint): CurrentDisposableOpenCheckpoint {
  return prepared.profile === "easyeda-pro-control.generated-pad-fixture-open-checkpoint.v1" ? generatedPadFixtureDiagnosticCheckpoint(prepared) : generatedFixtureDiagnosticCheckpoint(prepared);
}
export function verifyGeneratedPcbReadOpenCheckpoint(prepared: GeneratedPcbReadOpenCheckpoint): Promise<void> {
  return prepared.profile === "easyeda-pro-control.generated-pad-fixture-open-checkpoint.v1" ? verifyGeneratedPadFixtureOpenCheckpoint(prepared) : verifyGeneratedFixtureOpenCheckpoint(prepared);
}
export function verifyHistoricalGeneratedPcbReadOpenCheckpoint(prepared: GeneratedPcbReadOpenCheckpoint): Promise<void> {
  return prepared.profile === "easyeda-pro-control.generated-pad-fixture-open-checkpoint.v1" ? verifyHistoricalGeneratedPadFixtureOpenCheckpoint(prepared) : verifyHistoricalGeneratedFixtureOpenCheckpoint(prepared);
}
