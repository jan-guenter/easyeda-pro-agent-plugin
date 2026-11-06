import { createHash } from "node:crypto";
import { canonicalJson } from "./core.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

export interface ManagedSchematicRelevanceFixtureOpeningSource {
  readonly schema: "private.generated-schematic-relevance-fixture-opening-source.v1";
  readonly projectUuid: string; readonly originalSourceSha256: string;
}
type Runtime = Pick<WindowsControlRuntime, "status">;
const issued = new WeakMap<ManagedSchematicRelevanceFixtureOpeningSource, Readonly<{ text: string; qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget; archive: Buffer;
  origin: Readonly<{ kind: "import"; importingRuntime: Runtime; importingLaunchText: string }> | Readonly<{ kind: "fresh-closed-data" }> }>>();
const transferred = new WeakSet<QualifiedGeneratedSchematicRelevanceFixtureTarget>();
/** Same-facade data staging only. No existing PCB owner can consume this token,
 * and it grants no native birth, path registration or page-open authority. */
export function stageManagedSchematicRelevanceFixtureOpeningSource(input: Readonly<{ qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget; archive: Buffer; importingRuntime: Runtime }>): ManagedSchematicRelevanceFixtureOpeningSource {
  const qualification = input.qualification; const archive = Buffer.from(input.archive); assertOriginalGeneratedSchematicRelevanceFixtureTarget(qualification);
  const importingRuntime = input.importingRuntime; const importing = importingRuntime.status();
  if (importing.state !== "owned" || importing.launch === null) { throw new Error("Original importing runtime must remain retained while staging schematic data."); }
  if (createHash("sha256").update(archive).digest("hex") !== qualification.archiveSha256 || transferred.has(qualification)) { throw new Error("Original schematic source archive changed or its staging was already consumed."); }
  const source = Object.freeze({ schema: "private.generated-schematic-relevance-fixture-opening-source.v1" as const, projectUuid: qualification.target.projectUuid,
    originalSourceSha256: qualification.target.expectedSourceSha256 });
  issued.set(source, { text: canonicalJson(source), qualification, archive, origin: { kind: "import", importingRuntime, importingLaunchText: canonicalJson(importing.launch) } }); transferred.add(qualification); return source;
}
export function consumeManagedSchematicRelevanceFixtureOpeningSource(source: ManagedSchematicRelevanceFixtureOpeningSource, freshRuntime: Runtime): Readonly<{ qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget; archive: Buffer }> {
  const original = issued.get(source);
  if (original === undefined || original.text !== canonicalJson(source)) { throw new Error("Original unconsumed schematic data source is required."); }
  const current = freshRuntime.status();
  if (current.state !== "owned" || current.launch === null || original.origin.kind === "import" && (freshRuntime === original.origin.importingRuntime || canonicalJson(current.launch) === original.origin.importingLaunchText)) { throw new Error("Generated schematic opening requires a different fresh original ordinary runtime and launch."); }
  assertOriginalGeneratedSchematicRelevanceFixtureTarget(original.qualification); issued.delete(source);
  return Object.freeze({ qualification: original.qualification, archive: Buffer.from(original.archive) });
}

/** Data-only once transfer before a fresh native birth/checkpoint preparation.
 * This supplies no runtime status or caller authority callback. The distinct
 * native factory must independently own its new no-existing-app process/Job;
 * an ordinary importing/reader runtime cannot be upgraded through this token. */
export function consumeManagedSchematicRelevanceFixtureSourceForFreshNativePreparation(source: ManagedSchematicRelevanceFixtureOpeningSource): Readonly<{ qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget; archive: Buffer }> {
  const original = issued.get(source);
  if (original === undefined || original.text !== canonicalJson(source)) { throw new Error("Original unconsumed schematic data source is required for native preparation."); }
  assertOriginalGeneratedSchematicRelevanceFixtureTarget(original.qualification); issued.delete(source);
  return Object.freeze({ qualification: original.qualification, archive: Buffer.from(original.archive) });
}
