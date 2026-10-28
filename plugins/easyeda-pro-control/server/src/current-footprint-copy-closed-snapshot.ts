/** Footprint-only retained root/Job closure to complete SQL. No symbol or PCB
 * lifecycle token, supplied filename, termination JSON or verifier is admitted. */
import { lstat } from "node:fs/promises";
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, readArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, isRecord } from "./core.ts";
import type { Inventory } from "./closed-sql-equality.ts";
// oxlint-disable-next-line import/no-cycle -- Snapshot issuance requires the actual original native owner; the owner later consumes this same registry entry.
import { assertOriginalCurrentFootprintCopyNativeOwner, assertOriginalCurrentFootprintCopyNativeTermination, originalCurrentFootprintCopyNativeTarget } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyGenerationOwner } from "./current-pcb-diagnostic-owner.ts";
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
interface Retained {
  readonly owner: CurrentFootprintCopyGenerationOwner;
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
/** Historical retrieval preserves original reference identity after release.
 * It does not reissue a live owner or permit another application launch. */
export function requireCurrentFootprintCopyClosedSnapshot(owner: CurrentFootprintCopyGenerationOwner,
  inventory: Inventory): CurrentFootprintCopyClosedSnapshot {
  const held = snapshots.get(inventory);
  need(held !== undefined && held.owner === owner && held.snapshot.inventory === inventory, "ORIGINAL_SNAPSHOT");
  assertOriginalCurrentFootprintCopyNativeOwner(owner);
  assertOriginalCurrentFootprintCopyNativeTermination(owner, held.termination);
  need(originalCurrentFootprintCopyNativeTarget(owner) === held.origin && canonicalJson({ ...held.origin, before: undefined }) === held.originText &&
    readerCompletion(inventory) === held.completion && canonicalJson({ checkpoint: held.snapshot.checkpoint, sourceIdentity: held.snapshot.sourceIdentity }) === held.snapshotText, "ORIGINAL_BINDING");
  return held.snapshot;
}
/** Capture once after the actual retained root and whole Job have exited. The
 * checkpoint reader scans every SQL table; its child must finish before issue. */
export async function captureCurrentFootprintCopyClosedSnapshot(owner: CurrentFootprintCopyGenerationOwner,
  termination: object): Promise<Inventory> {
  assertOriginalCurrentFootprintCopyNativeOwner(owner);
  assertOriginalCurrentFootprintCopyNativeTermination(owner, termination);
  need(!attempted.has(owner), "ATTEMPT_CONSUMED"); attempted.add(owner);
  const origin = originalCurrentFootprintCopyNativeTarget(owner), originText = canonicalJson({ ...origin, before: undefined });
  const current = (): void => {
    assertOriginalCurrentFootprintCopyNativeOwner(owner);
    assertOriginalCurrentFootprintCopyNativeTermination(owner, termination);
    need(originalCurrentFootprintCopyNativeTarget(owner) === origin && canonicalJson({ ...origin, before: undefined }) === originText, "ORIGINAL_TARGET");
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
  snapshots.set(inventory, { owner, termination, origin, originText, snapshot, snapshotText: canonicalJson({ checkpoint, sourceIdentity }), completion });
  requireCurrentFootprintCopyClosedSnapshot(owner, inventory); return inventory;
}
