import { createHash } from "node:crypto";
import { canonicalJson } from "./core.ts";
import { assertOriginalGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";

export interface ManagedSchematicFixtureOpeningSource {
  readonly schema: "private.generated-schematic-fixture-opening-source.v1";
  readonly projectUuid: string; readonly originalSourceSha256: string;
}
const issued = new WeakMap<ManagedSchematicFixtureOpeningSource, Readonly<{ text: string; qualification: QualifiedGeneratedSchematicFixtureTarget; archive: Buffer }>>();
const transferred = new WeakSet<QualifiedGeneratedSchematicFixtureTarget>();
/** Same-facade data staging only. No existing PCB owner can consume this token,
 * and it grants no native birth, path registration or page-open authority. */
export function stageManagedSchematicFixtureOpeningSource(input: Readonly<{ qualification: QualifiedGeneratedSchematicFixtureTarget; archive: Buffer }>): ManagedSchematicFixtureOpeningSource {
  const qualification = input.qualification; const archive = Buffer.from(input.archive); assertOriginalGeneratedSchematicFixtureTarget(qualification);
  if (createHash("sha256").update(archive).digest("hex") !== qualification.archiveSha256 || transferred.has(qualification)) { throw new Error("Original schematic source archive changed or its staging was already consumed."); }
  const source = Object.freeze({ schema: "private.generated-schematic-fixture-opening-source.v1" as const, projectUuid: qualification.target.projectUuid,
    originalSourceSha256: qualification.target.expectedSourceSha256 });
  issued.set(source, { text: canonicalJson(source), qualification, archive }); transferred.add(qualification); return source;
}
export function consumeManagedSchematicFixtureOpeningSource(source: ManagedSchematicFixtureOpeningSource): Readonly<{ qualification: QualifiedGeneratedSchematicFixtureTarget; archive: Buffer }> {
  const original = issued.get(source);
  if (original === undefined || original.text !== canonicalJson(source)) { throw new Error("Original unconsumed schematic data source is required."); }
  assertOriginalGeneratedSchematicFixtureTarget(original.qualification); issued.delete(source);
  return Object.freeze({ qualification: original.qualification, archive: Buffer.from(original.archive) });
}
