/** Distinct initial data brands join only the read-only ordinary SCH route. */
import { consumeManagedSchematicFixtureOpeningSource } from "./managed-schematic-fixture-opening-source.ts";
import type { ManagedSchematicFixtureOpeningSource } from "./managed-schematic-fixture-opening-source.ts";
import { consumeManagedSchematicRelevanceFixtureOpeningSource } from "./managed-schematic-relevance-fixture-opening-source.ts";
import type { ManagedSchematicRelevanceFixtureOpeningSource } from "./managed-schematic-relevance-fixture-opening-source.ts";
import { prepareGeneratedSchematicFixtureOpenCheckpoint, verifyGeneratedSchematicFixtureOpenCheckpoint, verifyHistoricalGeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import { prepareGeneratedSchematicRelevanceFixtureOpenCheckpoint, verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint, verifyHistoricalGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { QualifiedGeneratedSchematicReadTarget } from "./managed-schematic-fixture-read-target.ts";

export type ManagedSchematicReadOpeningSource = ManagedSchematicFixtureOpeningSource | ManagedSchematicRelevanceFixtureOpeningSource;
export type GeneratedSchematicReadOpenCheckpoint = GeneratedSchematicFixtureOpenCheckpoint | GeneratedSchematicRelevanceFixtureOpenCheckpoint;
export function consumeManagedSchematicReadOpeningSource(source: ManagedSchematicReadOpeningSource, runtime: Parameters<typeof consumeManagedSchematicFixtureOpeningSource>[1]): Readonly<{ qualification: QualifiedGeneratedSchematicReadTarget; archive: Buffer }> {
  return source.schema === "private.generated-schematic-relevance-fixture-opening-source.v1" ? consumeManagedSchematicRelevanceFixtureOpeningSource(source, runtime) : consumeManagedSchematicFixtureOpeningSource(source, runtime);
}
export function prepareGeneratedSchematicReadOpenCheckpoint(source: Readonly<{ qualification: QualifiedGeneratedSchematicReadTarget; archive: Buffer }>): Promise<GeneratedSchematicReadOpenCheckpoint> {
  return source.qualification.schema === "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1" ?
    prepareGeneratedSchematicRelevanceFixtureOpenCheckpoint({ qualification: source.qualification, archive: source.archive }) :
    prepareGeneratedSchematicFixtureOpenCheckpoint({ qualification: source.qualification, archive: source.archive });
}
export function verifyGeneratedSchematicReadOpenCheckpoint(prepared: GeneratedSchematicReadOpenCheckpoint): Promise<void> {
  return prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1" ? verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared) : verifyGeneratedSchematicFixtureOpenCheckpoint(prepared);
}
export function verifyHistoricalGeneratedSchematicReadOpenCheckpoint(prepared: GeneratedSchematicReadOpenCheckpoint): Promise<void> {
  return prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1" ? verifyHistoricalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared) : verifyHistoricalGeneratedSchematicFixtureOpenCheckpoint(prepared);
}
