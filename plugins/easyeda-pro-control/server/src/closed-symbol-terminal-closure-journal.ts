/** Fixed pre-cold journal byte observation; no replay result or authority issuer. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { performance } from "node:perf_hooks";
import { controlRootCapability, operationPath } from "./artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { CLOSURE_LIMITS, ClosureEvidenceChangedError, ClosureIneligibleError, ownBoundedData, requireEvidence } from "./closed-symbol-terminal-closure-plan.ts";

export interface CapturedClosureJournal {
  readonly profile: "private.closed-terminal-journal-bytes.v1";
  readonly operationId: string;
  readonly journalSemanticSha256: string;
  readonly artifact: Readonly<{ path: string; bytes: number; sha256: string }>;
}
function identity(info: BigIntStats): string {
  return canonicalJson([info.dev, info.ino, info.size, info.mtimeNs, info.ctimeNs, info.birthtimeNs, info.mode, info.uid, info.gid, info.nlink].map(String));
}
function file(info: BigIntStats): void {
  requireEvidence(info.isFile() && !info.isSymbolicLink() && info.nlink === 1n && typeof process.getuid === "function" && info.uid === BigInt(process.getuid()), "closure-journal-file-authority");
  if (info.mode % 512n !== 0o600n) { throw new ClosureIneligibleError("closure-journal-mode"); }
  if (info.size <= 0n || info.size > BigInt(CLOSURE_LIMITS.inputBytes)) { throw new ClosureIneligibleError("closure-journal-size"); }
}
export async function captureClosedSymbolJournalBytes(input: unknown): Promise<CapturedClosureJournal> {
  const started = performance.now();
  const journal = ownBoundedData(input);
  requireEvidence(isRecord(journal) && typeof journal["operationId"] === "string" && journal["state"] === "closed-session-completed", "closure-journal-input");
  const operationId = journal["operationId"];
  const path = operationPath(operationId);
  const journalSemanticSha256 = sha256Json(journal);
  const deadline = (): void => { if (performance.now() - started > CLOSURE_LIMITS.deadlineMs) { throw new ClosureIneligibleError("closure-journal-deadline"); } };
  const root = await controlRootCapability(false); deadline();
  const directory = await root.openDirectory(dirname(path), false);
  let handle: FileHandle | undefined;
  let failed = false;
  let originalFailure: unknown;
  try {
    deadline();
    const bound = `/proc/self/fd/${directory.handle.fd}/${basename(path)}`;
    const before = await lstat(bound, { bigint: true }); file(before); deadline();
    const retained = identity(before);
    requireEvidence(identity(await lstat(path, { bigint: true })) === retained, "closure-journal-named-identity");
    // oxlint-disable-next-line eslint/no-bitwise -- Reject symlinks and avoid a blocking FIFO substitution before the retained regular-file identity check.
    handle = await open(bound, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    requireEvidence(identity(await handle.stat({ bigint: true })) === retained, "closure-journal-opened-identity");
    const bytes = Buffer.alloc(Number(before.size));
    let position = 0;
    while (position < bytes.length) {
      deadline();
      const count = Math.min(CLOSURE_LIMITS.chunkBytes, bytes.length - position);
      const read = await handle.read(bytes, position, count, position); deadline();
      requireEvidence(read.bytesRead > 0 && read.bytesRead <= count, "closure-journal-read-length"); position += read.bytesRead;
    }
    let raw: unknown;
    let text: string;
    try { text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); raw = JSON.parse(text) as unknown; }
    catch { throw new ClosureEvidenceChangedError("closure-journal-json-invalid"); }
    requireEvidence(isRecord(raw), "closure-journal-json-object");
    const descriptors = raw["artifacts"];
    requireEvidence(Array.isArray(descriptors) && descriptors.length === 44, "closure-journal-artifacts");
    // The maintained loader reorders these three fields and drops extras.
    // Refuse extras as cache eligibility; never erase them from the hash proof.
    for (const descriptor of descriptors) {
      requireEvidence(isRecord(descriptor), "closure-journal-artifact-object");
      if (canonicalJson(Object.keys(descriptor).toSorted()) !== canonicalJson(["bytes", "path", "sha256"])) {
        throw new ClosureIneligibleError("closure-journal-artifact-profile");
      }
    }
    requireEvidence(sha256Json(raw) === journalSemanticSha256, "closure-journal-semantic-changed");
    // Eligibility uses the RAW object's order, not the loader's projection.
    if (text !== `${JSON.stringify(raw, null, 2)}\n`) { throw new ClosureIneligibleError("closure-journal-producer-encoding"); }
    requireEvidence(identity(await handle.stat({ bigint: true })) === retained && identity(await lstat(bound, { bigint: true })) === retained &&
      identity(await lstat(path, { bigint: true })) === retained, "closure-journal-final-identity");
    const current = await root.openDirectory(dirname(path), false);
    try { requireEvidence(current.info.dev === directory.info.dev && current.info.ino === directory.info.ino && current.info.mode === directory.info.mode && current.info.uid === directory.info.uid && current.info.gid === directory.info.gid,
      "closure-journal-parent-changed"); } finally { await current.handle.close(); }
    await root.assertCurrent(); deadline();
    return Object.freeze({ profile: "private.closed-terminal-journal-bytes.v1", operationId, journalSemanticSha256,
      artifact: Object.freeze({ path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") }) });
  } catch (error) { failed = true; originalFailure = error; throw error; }
  finally {
    const results = await Promise.allSettled([handle?.close(), directory.handle.close()]);
    const failures = results.filter((result) => result.status === "rejected").map((result) => result.reason as unknown);
    // An eligibility-only refusal must not conceal a failed owned close.
    // oxlint-disable-next-line eslint/no-unsafe-finally -- Aggregate both failures into a non-ineligible refusal; known evidence contradictions retain precedence below.
    if (failures.length > 0 && originalFailure instanceof ClosureIneligibleError) { throw new AggregateError([originalFailure, ...failures], "closure-journal-ineligible-cleanup"); }
    // Preserve the original refusal, especially an observed contradiction.
    // A later cleanup deadline must never relabel it as cache ineligibility.
    if (!failed) {
      // oxlint-disable-next-line eslint/no-unsafe-finally -- Otherwise-successful observation still requires every owned close to succeed.
      if (failures.length > 0) { throw new AggregateError(failures, "closure-journal-cleanup"); }
      deadline();
    }
  }
}
