import { canonicalJson } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";

export interface GeneratedFixtureVacuumProjection {
  readonly sourceLogicalSha256: string; readonly checkpointLogicalSha256: string;
  readonly sourceSchemaVersion: number; readonly checkpointSchemaVersion: number; readonly onlySchemaVersionIncremented: true;
}
/** Exact full-data VACUUM projection. It creates no target, accepts no JSON
 * inventory and changes no generic SQLite/checkpoint qualification policy. */
export function qualifyGeneratedFixtureVacuumProjection(source: NativeSqlInventory, checkpoint: NativeSqlInventory): GeneratedFixtureVacuumProjection {
  readerCompletion(source); readerCompletion(checkpoint);
  const sourceVersion = source.properties["schema_version"]; const checkpointVersion = checkpoint.properties["schema_version"];
  const sourceProjection = { schema: source.schema, schemaSha256: source.schemaSha256, tables: source.tables, properties: source.properties };
  const checkpointProjection = { schema: checkpoint.schema, schemaSha256: checkpoint.schemaSha256, tables: checkpoint.tables,
    properties: { ...checkpoint.properties, schema_version: sourceVersion } };
  if (typeof sourceVersion !== "number" || !Number.isSafeInteger(sourceVersion) || sourceVersion < 0 || sourceVersion >= 2_147_483_647 ||
      checkpointVersion !== sourceVersion + 1 || canonicalJson(sourceProjection) !== canonicalJson(checkpointProjection)) {
    throw new Error("Generated fixture VACUUM checkpoint differs beyond one exact schema_version increment.");
  }
  return Object.freeze({ sourceLogicalSha256: source.logicalSha256, checkpointLogicalSha256: checkpoint.logicalSha256,
    sourceSchemaVersion: sourceVersion, checkpointSchemaVersion: checkpointVersion, onlySchemaVersionIncremented: true });
}
