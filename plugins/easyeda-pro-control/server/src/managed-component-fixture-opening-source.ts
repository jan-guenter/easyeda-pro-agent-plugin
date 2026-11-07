import { canonicalJson } from "./core.ts";
import { createHash } from "node:crypto";
import { assertOriginalGeneratedComponentFixtureTarget } from "./managed-component-fixture-initial-sql.ts";
import type { QualifiedGeneratedComponentFixtureTarget } from "./managed-component-fixture-initial-sql.ts";

export interface ManagedComponentFixtureOpeningSource {
  readonly schema: "private.generated-component-fixture-opening-source.v1";
  readonly projectUuid: string;
  readonly originalSourceSha256: string;
}
const issued = new WeakMap<ManagedComponentFixtureOpeningSource, Readonly<{ text: string; qualification: QualifiedGeneratedComponentFixtureTarget; archive: Buffer }>>();
const transferred = new WeakSet<QualifiedGeneratedComponentFixtureTarget>();
/** Called only by a released original import or fresh closed-data coordinator.
 * This is immutable
 * data custody across original launch generations in the same facade, never
 * native PID/handle/session transfer or authority reconstructed from JSON.
 */
export function stageManagedComponentFixtureOpeningSource(input: Readonly<{ qualification: QualifiedGeneratedComponentFixtureTarget; archive: Buffer }>): ManagedComponentFixtureOpeningSource {
  assertOriginalGeneratedComponentFixtureTarget(input.qualification);
  if (createHash("sha256").update(input.archive).digest("hex") !== input.qualification.archiveSha256) { throw new Error("Original generated source archive changed before staging."); }
  if (transferred.has(input.qualification)) { throw new Error("Original generated fixture source was already staged."); }
  const source = Object.freeze({ schema: "private.generated-component-fixture-opening-source.v1" as const, projectUuid: input.qualification.target.projectUuid,
    originalSourceSha256: input.qualification.target.expectedSourceSha256 });
  issued.set(source, { text: canonicalJson(source), qualification: input.qualification, archive: Buffer.from(input.archive) });
  transferred.add(input.qualification); return source;
}
/** Original source may be retained by only one new lifecycle object. A lost
 * construction/launch consumes this transfer; historical reports never retry it.
 */
export function consumeManagedComponentFixtureOpeningSource(source: ManagedComponentFixtureOpeningSource): Readonly<{ qualification: QualifiedGeneratedComponentFixtureTarget; archive: Buffer }> {
  const original = issued.get(source);
  if (original === undefined || original.text !== canonicalJson(source)) { throw new Error("Original unconsumed generated fixture opening source is required."); }
  assertOriginalGeneratedComponentFixtureTarget(original.qualification); issued.delete(source);
  return Object.freeze({ qualification: original.qualification, archive: Buffer.from(original.archive) });
}
