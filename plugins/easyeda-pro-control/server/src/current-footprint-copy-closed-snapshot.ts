/** Footprint-only retained root/Job closure to complete SQL. No symbol or PCB
 * lifecycle token, supplied filename, termination JSON or verifier is admitted. */
import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, readArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, isRecord } from "./core.ts";
import type { Inventory } from "./closed-sql-equality.ts";
/* oxlint-disable import/no-cycle -- Original native guards and the owner's snapshot reader resolve their private references only after construction; module initialization issues no authority. */
import { assertOriginalCurrentFootprintCopyNativeOwner, assertOriginalCurrentFootprintCopyNativeTermination, assertOriginalCurrentFootprintForwardExecutionNativeOwner, assertOriginalCurrentFootprintForwardExecutionNativeTermination, assertOriginalCurrentFootprintInverseNativeOwner,
  assertOriginalCurrentFootprintInverseTermination, originalCurrentFootprintCopyNativeTarget,
  originalCurrentFootprintForwardExecutionNativeTarget, originalCurrentFootprintInverseNativeSource } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyGenerationOwner, CurrentFootprintForwardExecutionNativeOwner, CurrentFootprintInverseNativeOwner } from "./current-pcb-diagnostic-owner.ts";
/* oxlint-enable import/no-cycle */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";

export interface CurrentFootprintCopyClosedSourceIdentity {
  readonly device: string; readonly inode: string; readonly size: string;
  readonly mtimeNs: string; readonly ctimeNs: string; readonly birthtimeNs: string;
  readonly mode: string; readonly uid: string; readonly gid: string; readonly links: string;
}
export interface CurrentFootprintCopyClosedSnapshot {
  readonly checkpoint: CheckpointReceipt;
  readonly sourceIdentity: CurrentFootprintCopyClosedSourceIdentity;
  readonly inventory: Inventory;
}
type OriginalOwner = Readonly<{ kind: "inverse"; owner: CurrentFootprintInverseNativeOwner }> | Readonly<{ kind: "copy"; owner: CurrentFootprintCopyGenerationOwner }> |
  Readonly<{ kind: "forward-execution"; owner: CurrentFootprintForwardExecutionNativeOwner }>;
interface Retained {
  readonly binding: OriginalOwner;
  readonly termination: object;
  readonly origin: ReturnType<typeof originalCurrentFootprintCopyNativeTarget>;
  readonly originText: string;
  readonly snapshot: CurrentFootprintCopyClosedSnapshot;
  readonly snapshotText: string;
  readonly completion: ReturnType<typeof readerCompletion>;
}
const attempted = new WeakSet<object>(), snapshots = new WeakMap<Inventory, Retained>();
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`FOOTPRINT_COPY_CLOSED_SNAPSHOT_${detail}`); }
}
function assertOwner(binding: OriginalOwner): void {
  if (binding.kind === "copy") { assertOriginalCurrentFootprintCopyNativeOwner(binding.owner); }
  else if (binding.kind === "inverse") { assertOriginalCurrentFootprintInverseNativeOwner(binding.owner); }
  else { assertOriginalCurrentFootprintForwardExecutionNativeOwner(binding.owner); }
}
function originalTarget(binding: OriginalOwner): ReturnType<typeof originalCurrentFootprintCopyNativeTarget> {
  if (binding.kind === "inverse") { return originalCurrentFootprintInverseNativeSource(binding.owner); }
  if (binding.kind === "copy") {
    assertOriginalCurrentFootprintCopyNativeOwner(binding.owner); return originalCurrentFootprintCopyNativeTarget(binding.owner);
  }
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(binding.owner); return originalCurrentFootprintForwardExecutionNativeTarget(binding.owner);
}
function requireTermination(binding: OriginalOwner, original: object): void {
  if (binding.kind === "copy") { assertOriginalCurrentFootprintCopyNativeTermination(binding.owner, original); }
  else if (binding.kind === "inverse") { assertOriginalCurrentFootprintInverseTermination(binding.owner, original); }
  else { assertOriginalCurrentFootprintForwardExecutionNativeTermination(binding.owner, original); }
}
/** Historical retrieval preserves original reference identity after release.
 * It does not reissue a live owner or permit another application launch. */
export function requireCurrentFootprintCopyClosedSnapshot(owner: CurrentFootprintCopyGenerationOwner,
  inventory: Inventory): CurrentFootprintCopyClosedSnapshot {
  return requireSnapshot({ kind: "copy", owner }, inventory);
}
/** Retrieve only the new factory's own closed snapshot. Historical v1 owners
 * and snapshots retain their original entry points and cannot be promoted. */
export function requireCurrentFootprintForwardExecutionClosedSnapshot(owner: CurrentFootprintForwardExecutionNativeOwner,
  inventory: Inventory): CurrentFootprintCopyClosedSnapshot {
  return requireSnapshot({ kind: "forward-execution", owner }, inventory);
}
export function requireCurrentFootprintInverseClosedSnapshot(owner: CurrentFootprintInverseNativeOwner, inventory: Inventory): CurrentFootprintCopyClosedSnapshot {
  return requireSnapshot({ kind: "inverse", owner }, inventory);
}
function requireSnapshot(binding: OriginalOwner, inventory: Inventory): CurrentFootprintCopyClosedSnapshot {
  const held = snapshots.get(inventory);
  need(held !== undefined && held.binding.kind === binding.kind && held.binding.owner === binding.owner &&
    held.snapshot.inventory === inventory, "ORIGINAL_SNAPSHOT");
  assertOwner(binding);
  requireTermination(binding, held.termination);
  need(originalTarget(binding) === held.origin && canonicalJson({ ...held.origin, before: undefined }) === held.originText &&
    readerCompletion(inventory) === held.completion && canonicalJson({ checkpoint: held.snapshot.checkpoint, sourceIdentity: held.snapshot.sourceIdentity }) === held.snapshotText, "ORIGINAL_BINDING");
  return held.snapshot;
}
/** Capture once after the actual retained root and whole Job have exited. The
 * checkpoint reader scans every SQL table; its child must finish before issue. */
export function captureCurrentFootprintCopyClosedSnapshot(owner: CurrentFootprintCopyGenerationOwner,
  termination: object): Promise<Inventory> {
  return captureSnapshot({ kind: "copy", owner }, termination);
}
/** Scan complete SQL only after this new writer's original root and entire
 * Job have exited. No source path, supplied verifier or termination JSON can
 * replace the factory-issued owner and its retained termination reference. */
export function captureCurrentFootprintForwardExecutionClosedSnapshot(owner: CurrentFootprintForwardExecutionNativeOwner,
  termination: object): Promise<Inventory> {
  return captureSnapshot({ kind: "forward-execution", owner }, termination);
}
/** Inverse-only entry: the original new birth selects its copied target and
 * source. Old copy/forward entry points cannot accept this owner. */
export function captureCurrentFootprintInverseClosedSnapshot(owner: CurrentFootprintInverseNativeOwner, termination: object): Promise<Inventory> {
  return captureSnapshot({ kind: "inverse", owner }, termination);
}
async function captureSnapshot(binding: OriginalOwner, termination: object): Promise<Inventory> {
  assertOwner(binding);
  requireTermination(binding, termination);
  need(!attempted.has(binding.owner), "ATTEMPT_CONSUMED"); attempted.add(binding.owner);
  const origin = originalTarget(binding);
  const originText = canonicalJson({ ...origin, before: undefined });
  const current = (): void => {
    assertOwner(binding);
    requireTermination(binding, termination);
    need(originalTarget(binding) === origin && canonicalJson({ ...origin, before: undefined }) === originText, "ORIGINAL_TARGET");
  };
  current(); const root = await controlRootCapability(); current();
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const policy = { expectedSource: origin.source, artifactRoots: [outputDir], controlRoot: root, maximumSourceBytes: 268_435_456 };
  const checkpoint = freezeDeep(await createCheckpoint({ source: origin.source, outputDir,
    label: `footprint-closed-${origin.operationId.slice(-16)}` }, policy)); current();
  const baseline = origin.checkpoint.sourceIdentity, observed = checkpoint.sourceIdentity;
  need(checkpoint.source === origin.source && origin.checkpoint.source === origin.source && observed.dev === baseline.dev &&
    observed.ino === baseline.ino && observed.birthtimeNs === baseline.birthtimeNs, "SOURCE_REPLACED");
  const inventory = await readExactSqlInventory({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, runtime: origin.runtime }); current();
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
    inventory.checkpointSha256 === checkpoint.checkpointSha256, "COMPLETE_READER");
  const receipt = await readArtifact(checkpoint.receiptPath, 0, 65_536); current();
  need(receipt.eof && canonicalJson(JSON.parse(receipt.text) as unknown) === canonicalJson(checkpoint), "RECEIPT_CHANGED");
  const verified = await verifyCheckpoint(checkpoint.receiptPath, policy); current();
  need(verified.ok && !verified.sourceChanged && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt &&
    verified.sourceEqualsCheckpoint && verified.sourceSha256 === checkpoint.sourceSha256 &&
    verified.checkpointSha256 === checkpoint.checkpointSha256 && verified.sourceDumpSha256 === checkpoint.sourceDumpSha256 &&
    verified.checkpointDumpSha256 === checkpoint.checkpointDumpSha256, "CHECKPOINT_CHANGED");
  const stat = await lstat(origin.source, { bigint: true }); current();
  const recorded = checkpoint["sourceStatAfter"];
  need(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1n && isRecord(recorded) &&
    stat.dev.toString() === observed.dev && stat.ino.toString() === observed.ino && stat.birthtimeNs.toString() === observed.birthtimeNs &&
    stat.ctimeNs.toString() === observed.ctimeNs && stat.ctimeNs.toString() === recorded["ctimeNs"] &&
    stat.mtimeNs.toString() === recorded["mtimeNs"] && stat.size.toString() === recorded["size"], "SOURCE_IDENTITY_CHANGED");
  const sourceIdentity = Object.freeze({ device: stat.dev.toString(), inode: stat.ino.toString(), size: stat.size.toString(),
    mtimeNs: stat.mtimeNs.toString(), ctimeNs: stat.ctimeNs.toString(), birthtimeNs: stat.birthtimeNs.toString(),
    mode: stat.mode.toString(), uid: stat.uid.toString(), gid: stat.gid.toString(), links: stat.nlink.toString() });
  const snapshot = Object.freeze({ checkpoint, sourceIdentity, inventory });
  snapshots.set(inventory, { binding, termination, origin, originText, snapshot, snapshotText: canonicalJson({ checkpoint, sourceIdentity }), completion });
  requireSnapshot(binding, inventory); return inventory;
}
