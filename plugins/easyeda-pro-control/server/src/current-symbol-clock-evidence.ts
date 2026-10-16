import { opendir } from "node:fs/promises";
import { join } from "node:path";
import { controlRootCapability, operationPath, readArtifact, readExactUtf8Artifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { isRecord, sha256Json, sha256Text } from "./core.ts";

const EVIDENCE_NAMES = new Set(["00-current-aged-reference-intent.json", "00-current-aged-reference-result.json",
  "00-current-aged-renderer-intent.json", "00-current-aged-renderer-result.json",
  "00-coordinator-reference-refused.json", "00-coordinator-observation-refused.json"]);
const MAX_ARTIFACT_BYTES = 196_608;
function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current symbol clock sidecar inspection refused."); }
}

/** Independent append-only sidecar, never an operation journal or generation.
 * Keeping these files outside the baseline directory preserves its exact
 * historical phase inventory. No caller-selected path is accepted.
 */
export function currentSymbolClockEvidenceId(operationId: string): string {
  if (!/^[A-Za-z0-9._:-]{1,160}$/u.test(operationId)) { throw new Error("Current symbol clock evidence operation refused."); }
  return `current-clock-${sha256Json({ operationId })}`;
}

/** Read-only bounded historical inventory, including after the owner is lost.
 * Descriptors attest current managed bytes only, never stage completion, an
 * original token, a valid clock relation, or permission to retry or continue.
 */
export async function inspectCurrentSymbolClockEvidence(operationId: string): Promise<Readonly<Record<string, unknown>>> {
  const evidenceId = currentSymbolClockEvidenceId(operationId);
  const result = { profile: "private.current-symbol-clock-sidecar-inspection.v1", operationId, evidenceId,
    semanticValidationPerformed: false, originalAuthorityReconstructed: false, continuationAuthorized: false,
    replayAllowed: false, executionAuthorized: false } as const;
  const root = await controlRootCapability(false);
  let directory: Awaited<ReturnType<typeof root.openDirectory>>;
  try { directory = await root.openDirectory(operationPath(evidenceId).slice(0, -5), false); }
  catch (error) {
    if (isRecord(error) && error["code"] === "ENOENT") { await root.assertCurrent(); return Object.freeze({ ...result, status: "absent", artifacts: [] }); }
    throw error;
  }
  try {
    const names = new Set<string>();
    const entries = await opendir(`/proc/self/fd/${directory.handle.fd}`);
    for await (const entry of entries) {
      need(entry.isFile() && EVIDENCE_NAMES.has(entry.name) && !names.has(entry.name) && names.size < EVIDENCE_NAMES.size);
      names.add(entry.name);
    }
    const artifacts: Readonly<ArtifactDescriptor>[] = [];
    for (const name of [...names].toSorted()) {
      const page = await readArtifact(join(directory.absolute, name), 0, MAX_ARTIFACT_BYTES);
      need(page.eof && page.size > 0 && page.size <= MAX_ARTIFACT_BYTES && page.bytesRead === page.size);
      const descriptor = Object.freeze({ path: page.path, bytes: page.size, sha256: sha256Text(page.text) });
      const exact = await readExactUtf8Artifact(descriptor);
      need(isRecord(JSON.parse(exact.text) as unknown));
      artifacts.push(descriptor);
    }
    const after = await directory.handle.stat({ bigint: true });
    const same = (current: typeof after): boolean => current.dev === directory.info.dev && current.ino === directory.info.ino &&
      current.ctimeNs === directory.info.ctimeNs && current.mtimeNs === directory.info.mtimeNs;
    need(same(after));
    const named = await root.openDirectory(directory.absolute, false);
    try { need(same(named.info)); } finally { await named.handle.close(); }
    await root.assertCurrent();
    return Object.freeze({ ...result, status: "retained-bytes-only", artifacts: Object.freeze(artifacts) });
  } finally { await directory.handle.close(); }
}
