/** Private reuse of historical SQL digests, never an admission or reader capability. */
/* oxlint-disable import/max-dependencies -- Bind the existing historical copy/SQL readers to fresh managed-file and pinned-runtime observations. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { performance } from "node:perf_hooks";
import { controlDataDirectory, controlRootCapability, operationPath } from "./artifacts.ts";
import type { loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import { inspectRecordedClosedCopy } from "./closed-symbol-recorded-copy.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { openVerifiedMachineNode } from "./machine-profile.ts";
import type { MachineProfile, VerifiedMachineNode } from "./machine-profile.ts";
import { SQLITE_INVENTORY_PROGRAM } from "./sqlite-inventory-program.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";

type Prefix = Awaited<ReturnType<typeof loadClosedSymbolJournal>>;
type Root = Awaited<ReturnType<typeof controlRootCapability>>;
type Directory = Awaited<ReturnType<Root["openDirectory"]>>;
type Digests = Readonly<{ sourceSha256: string; schemaSha256: string; logicalSha256: string }>;
interface FilePlan { readonly path: string; readonly sha256: string; readonly recordedIdentity?: unknown }
interface FileObservation { readonly plan: FilePlan; readonly directory: Directory; readonly file: FileHandle;
  readonly bound: string; readonly identity: string }
interface Entry { readonly key: string; readonly result: Digests; readonly enrolledAt: number }
const LIFETIME_MS = 600_000, MAX_BYTES = 268_435_456n, MAX_ENTRIES = 4;
const entries = new Map<string, Entry>();
const readerProgramSha256 = sha256Json(SQLITE_INVENTORY_PROGRAM);

function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(`Historical abandonment SQL ${message}.`); } }
function bag(value: unknown): Record<string, unknown> { need(isRecord(value), "input is not an object"); return value; }
function hash(value: unknown): string { need(typeof value === "string" && /^[a-f0-9]{64}$/u.test(value), "digest is invalid"); return value; }
function identity(value: BigIntStats): Record<string, string> {
  return { device: String(value.dev), inode: String(value.ino), size: String(value.size), mtimeNs: String(value.mtimeNs),
    ctimeNs: String(value.ctimeNs), birthtimeNs: String(value.birthtimeNs), mode: String(value.mode), uid: String(value.uid),
    gid: String(value.gid), links: String(value.nlink) };
}
async function noSidecars(path: string): Promise<void> {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    let absent = false;
    try { await lstat(`${path}${suffix}`); }
    catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") { absent = true; }
      else { throw error; }
    }
    need(absent, "database has a sidecar");
  }
}
function plans(loaded: Prefix, checkpoint: Readonly<Record<string, unknown>>): readonly FilePlan[] {
  const checkpointPath = checkpoint["checkpoint"], raw = bag(bag(loaded.events[9]?.data)["copyReceipt"]), rawPath = raw["artifact"];
  need(typeof rawPath === "string" && dirname(rawPath) === operationPath(loaded.journal.operationId).slice(0, -5) &&
    /^closed-copy-[a-f0-9-]{36}\.eprj2$/u.test(basename(rawPath)), "raw copy path escaped its operation");
  need(typeof checkpointPath === "string" && dirname(checkpointPath) === join(controlDataDirectory(), "checkpoints") &&
    checkpointPath.endsWith(".eprj2"), "checkpoint path escaped managed storage");
  return [{ path: rawPath, sha256: hash(raw["sha256"]), recordedIdentity: raw["artifactIdentity"] },
    { path: checkpointPath, sha256: hash(checkpoint["checkpointSha256"]) }];
}
async function retain(root: Root, plan: FilePlan): Promise<FileObservation> {
  need(await realpath(plan.path) === plan.path, "path contains a symlink");
  const directory = await root.openDirectory(dirname(plan.path), false);
  let file: FileHandle | undefined;
  try {
    const bound = `/proc/self/fd/${directory.handle.fd}/${basename(plan.path)}`;
    await noSidecars(bound); await noSidecars(plan.path);
    // oxlint-disable-next-line eslint/no-bitwise -- Reject symlinks and avoid blocking on substituted special files before fstat.
    file = await open(bound, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const stat = await file.stat({ bigint: true });
    need(stat.isFile() && stat.nlink === 1n && stat.size > 0n && stat.size <= MAX_BYTES, "file kind or bound changed");
    const currentIdentity = canonicalJson(identity(stat));
    if (plan.recordedIdentity !== undefined) {
      need(currentIdentity === canonicalJson(plan.recordedIdentity) && stat.mode % 512n === 0o600n &&
        typeof process.getuid === "function" && stat.uid === BigInt(process.getuid()), "recorded copy identity changed");
    }
    return { plan, directory, file, bound, identity: currentIdentity };
  } catch (error) {
    const closed = await Promise.allSettled([directory.handle.close(), ...(file === undefined ? [] : [file.close()])]);
    const failures = closed.filter(result => result.status === "rejected").map(result => result.reason as unknown);
    if (failures.length > 0) { throw new AggregateError([error, ...failures], "Historical abandonment SQL partial cleanup failed.", { cause: error }); }
    throw error;
  }
}
async function unchanged(root: Root, item: FileObservation): Promise<void> {
  for (const value of [await item.file.stat({ bigint: true }), await lstat(item.bound, { bigint: true }), await lstat(item.plan.path, { bigint: true })]) {
    need(value.isFile() && !value.isSymbolicLink() && canonicalJson(identity(value)) === item.identity, "file identity changed");
  }
  need(await realpath(item.plan.path) === item.plan.path, "path changed");
  await noSidecars(item.bound); await noSidecars(item.plan.path);
  const named = await root.openDirectory(item.directory.absolute, false);
  try { need(named.info.dev === item.directory.info.dev && named.info.ino === item.directory.info.ino, "directory changed"); }
  finally { await named.handle.close(); }
  await root.assertCurrent();
}
async function observe(root: Root, files: readonly FileObservation[]): Promise<void> {
  const buffer = Buffer.alloc(1_048_576);
  for (const item of files) {
    await unchanged(root, item);
    const stat = await item.file.stat();
    const bytes = stat.size, digest = createHash("sha256");
    let offset = 0;
    while (offset < bytes) {
      const count = Math.min(buffer.length, bytes - offset), read = await item.file.read(buffer, 0, count, offset);
      need(read.bytesRead > 0 && read.bytesRead <= count, "read length changed"); digest.update(buffer.subarray(0, read.bytesRead)); offset += read.bytesRead;
    }
    need(digest.digest("hex") === item.plan.sha256, "bytes changed");
    await unchanged(root, item);
  }
}
async function cold(loaded: Prefix, checkpoint: Readonly<Record<string, unknown>>, runtime: MachineProfile["runtime"], checkpointPlan: FilePlan): Promise<Digests> {
  const recorded = await inspectRecordedClosedCopy({ operationId: loaded.journal.operationId, phase: "baseline-copy", runtime });
  const { inventory } = recorded, completion = readerCompletion(inventory);
  need(recorded.evidence["closedPlanSha256"] === loaded.journal.closedPlanSha256 &&
    recorded.evidence["phaseDataSha256"] === loaded.events[9]?.dataSha256, "cold reader consumed another journal prefix");
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
    checkpoint["sourceSha256"] === inventory.checkpointSha256 && checkpoint["sourceDumpSha256"] === checkpoint["checkpointDumpSha256"],
  "complete baseline proof differs");
  const vacuum = await readExactSqlInventory({ checkpointPath: checkpointPlan.path, expectedSha256: checkpointPlan.sha256, runtime });
  const vacuumCompletion = readerCompletion(vacuum);
  need(vacuumCompletion.observedChildClose && vacuumCompletion.exitCode === 0 && vacuumCompletion.exitSignal === null, "checkpoint reader did not finish");
  // No inventory, completion, process observation or owner capability survives.
  return Object.freeze({ sourceSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 });
}

/** The caller still validates the complete sidecar/claim/journal/phase closure
 * before and after this function. Only deterministic SQL work is reused. Every
 * invocation rehashes both databases twice and freshly admits the pinned Node.
 * A miss or failure never grants admission; no caller verifier or cache API exists.
 */
export async function inspectHistoricalAbandonmentSql(loaded: Prefix, checkpoint: Readonly<Record<string, unknown>>,
  runtime: MachineProfile["runtime"]): Promise<Digests> {
  const root = await controlRootCapability(false);
  const filePlans = plans(loaded, checkpoint);
  const checkpointPlan = filePlans[1];
  need(checkpointPlan !== undefined, "checkpoint plan is missing");
  const slot = canonicalJson([root.path, loaded.journal.operationId]);
  const inputText = canonicalJson({ loaded, checkpoint, runtime, readerProgramSha256 });
  const files: FileObservation[] = [];
  let node: VerifiedMachineNode | undefined;
  let failed = false, originalFailure: unknown;
  let pending: Entry | undefined;
  let result: Digests | undefined;
  try {
    node = await openVerifiedMachineNode(runtime);
    for (const plan of filePlans) { files.push(await retain(root, plan)); }
    await observe(root, files);
    const key = sha256Json({ inputText, root: { path: root.path, device: String(root.device), inode: String(root.inode) },
      files: files.map(item => ({ path: item.plan.path, identity: item.identity, sha256: item.plan.sha256 })) });
    const now = performance.now();
    for (const [name, entry] of entries) { if (now < entry.enrolledAt || now - entry.enrolledAt >= LIFETIME_MS) { entries.delete(name); } }
    const previous = entries.get(slot);
    if (previous !== undefined && previous.key !== key) { entries.delete(slot); }
    const selected = entries.get(slot);
    result = selected?.result ?? await cold(loaded, checkpoint, runtime, checkpointPlan);
    await observe(root, files);
    await node.assertCurrent();
    for (const item of files) { await unchanged(root, item); }
    need(canonicalJson({ loaded, checkpoint, runtime, readerProgramSha256 }) === inputText, "inputs changed during inspection");
    const ended = performance.now();
    if (selected === undefined) { pending = Object.freeze({ key, result, enrolledAt: ended }); }
    else if ((ended < selected.enrolledAt || ended - selected.enrolledAt >= LIFETIME_MS) && entries.get(slot) === selected) {
      // TTL bounds retention, not the validity of freshly rehashed pure digests.
      // Evict without renewal; no ownership lease or runtime admission is cached.
      entries.delete(slot);
    }
  } catch (error) { failed = true; originalFailure = error; entries.delete(slot); throw error; }
  finally {
    const closed = await Promise.allSettled([...files.flatMap(item => [item.file.close(), item.directory.handle.close()]), ...(node === undefined ? [] : [node.close()])]);
    const failures = closed.filter(value => value.status === "rejected").map(value => value.reason as unknown);
    if (failures.length > 0) {
      entries.delete(slot);
      // oxlint-disable-next-line eslint/no-unsafe-finally -- Cleanup failure refuses success and preserves an existing primary error as the cause and first aggregate member.
      throw new AggregateError([...(failed ? [originalFailure] : []), ...failures], "Historical abandonment SQL cleanup failed.", { cause: failed ? originalFailure : failures[0] });
    }
  }
  need(result !== undefined, "result is missing");
  // Preserve resident entries when full; a miss never evicts its next scan peer.
  if (pending !== undefined && !entries.has(slot) && entries.size < MAX_ENTRIES) { entries.set(slot, pending); }
  return result;
}
