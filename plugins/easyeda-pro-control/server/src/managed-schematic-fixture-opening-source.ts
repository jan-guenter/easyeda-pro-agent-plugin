import { createHash } from "node:crypto";
import { canonicalJson } from "./core.ts";
import { assertOriginalGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";

export interface ManagedSchematicFixtureOpeningSource {
  readonly schema: "private.generated-schematic-fixture-opening-source.v1";
  readonly projectUuid: string; readonly originalSourceSha256: string;
}
type Runtime = Pick<WindowsControlRuntime, "status">;
const issued = new WeakMap<ManagedSchematicFixtureOpeningSource, Readonly<{ text: string; qualification: QualifiedGeneratedSchematicFixtureTarget; archive: Buffer;
  importingRuntime: Runtime; importingLaunchText: string }>>();
const transferred = new WeakSet<QualifiedGeneratedSchematicFixtureTarget>();
/** Same-facade data staging only. No existing PCB owner can consume this token,
 * and it grants no native birth, path registration or page-open authority. */
export function stageManagedSchematicFixtureOpeningSource(input: Readonly<{ qualification: QualifiedGeneratedSchematicFixtureTarget; archive: Buffer; importingRuntime: Runtime }>): ManagedSchematicFixtureOpeningSource {
  const qualification = input.qualification; const archive = Buffer.from(input.archive); assertOriginalGeneratedSchematicFixtureTarget(qualification);
  const importingRuntime = input.importingRuntime; const importing = importingRuntime.status();
  if (importing.state !== "owned" || importing.launch === null) { throw new Error("Original importing runtime must remain retained while staging schematic data."); }
  if (createHash("sha256").update(archive).digest("hex") !== qualification.archiveSha256 || transferred.has(qualification)) { throw new Error("Original schematic source archive changed or its staging was already consumed."); }
  const source = Object.freeze({ schema: "private.generated-schematic-fixture-opening-source.v1" as const, projectUuid: qualification.target.projectUuid,
    originalSourceSha256: qualification.target.expectedSourceSha256 });
  issued.set(source, { text: canonicalJson(source), qualification, archive, importingRuntime, importingLaunchText: canonicalJson(importing.launch) }); transferred.add(qualification); return source;
}
export function consumeManagedSchematicFixtureOpeningSource(source: ManagedSchematicFixtureOpeningSource, freshRuntime: Runtime): Readonly<{ qualification: QualifiedGeneratedSchematicFixtureTarget; archive: Buffer }> {
  const original = issued.get(source);
  if (original === undefined || original.text !== canonicalJson(source)) { throw new Error("Original unconsumed schematic data source is required."); }
  const current = freshRuntime.status();
  if (freshRuntime === original.importingRuntime || current.state !== "owned" || current.launch === null || canonicalJson(current.launch) === original.importingLaunchText) { throw new Error("Generated schematic opening requires a different fresh original ordinary runtime and launch."); }
  assertOriginalGeneratedSchematicFixtureTarget(original.qualification); issued.delete(source);
  return Object.freeze({ qualification: original.qualification, archive: Buffer.from(original.archive) });
}
