import { assertOriginalGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";

export type QualifiedGeneratedSchematicReadTarget = QualifiedGeneratedSchematicFixtureTarget | QualifiedGeneratedSchematicRelevanceFixtureTarget;
export function assertOriginalGeneratedSchematicReadTarget(value: QualifiedGeneratedSchematicReadTarget): void {
  if (value.schema === "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1") { assertOriginalGeneratedSchematicRelevanceFixtureTarget(value); }
  else { assertOriginalGeneratedSchematicFixtureTarget(value); }
}
