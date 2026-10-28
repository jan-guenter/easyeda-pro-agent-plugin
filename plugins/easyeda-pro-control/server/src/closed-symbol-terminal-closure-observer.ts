/** Bounded private byte/identity observation; never an admission cache or authority issuer. */
/* oxlint-disable import/max-dependencies -- Explicit scan-owner borrowing joins the existing fixed evidence/runtime boundaries; hiding either dependency would obscure ownership. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentProcessSqlRuntime, openVerifiedMachineNode } from "./machine-profile.ts";
import type { VerifiedMachineNode } from "./machine-profile.ts";
import { assertCurrentProcessSqlRuntimeLease } from "./current-process-sql-runtime-lease.ts";
import type { CurrentProcessSqlRuntimeLease } from "./current-process-sql-runtime-lease.ts";
import { CLOSURE_LIMITS, ClosureEvidenceChangedError, ClosureIneligibleError, deriveClosedSymbolTerminalClosure, ownBoundedData, requireEvidence } from "./closed-symbol-terminal-closure-plan.ts";
import type { ClosurePlan, ClosureRole } from "./closed-symbol-terminal-closure-plan.ts";
import type { AgedClosurePlan } from "./closed-symbol-aged-terminal-closure-plan.ts";

type Identity = Readonly<Record<string, string>>;
interface RetainedDirectory { readonly path: string; readonly handle: FileHandle; readonly identity: Identity; readonly managed: boolean }
interface RetainedFile { readonly handle: FileHandle; readonly role: ClosureRole; readonly bound: string; readonly identity: Identity }
export interface ClosureObservation {
  readonly profile: "private.closed-terminal-closure-observation.v1"; readonly plan: ClosurePlan | AgedClosurePlan;
  readonly root: Identity; readonly directories: readonly Readonly<{ path: string; identity: Identity }>[];
  readonly files: readonly Readonly<{ path: string; identity: Identity; sha256: string; roles: readonly string[] }>[];
  readonly absentSidecars: readonly Readonly<{ role: string; path: string }>[]; readonly observedBytes: number;
  readonly semanticValidationPerformed: false; readonly executionAuthorized: false; readonly completionProved: false;
}
type ClosureProfile = "locked" | "aged";
interface IssuedClosure {
  readonly profile: ClosureProfile; readonly rootPath: string; readonly observation: ClosureObservation;
}
// Original successful observations retain only their immutable derived roles
// And bounded metadata. No serialized observation or caller-supplied plan can
// Enter the compact revalidation route. Handles and admission are never retained.
const issuedClosures = new WeakMap<object, IssuedClosure>();
function identity(value: BigIntStats): Identity {
  return Object.freeze({ device: value.dev.toString(), inode: value.ino.toString(), size: value.size.toString(), mtimeNs: value.mtimeNs.toString(),
    ctimeNs: value.ctimeNs.toString(), birthtimeNs: value.birthtimeNs.toString(), mode: value.mode.toString(), uid: value.uid.toString(), gid: value.gid.toString(), links: value.nlink.toString() });
}
function directoryIdentity(value: BigIntStats): Identity {
  return Object.freeze({ device: value.dev.toString(), inode: value.ino.toString(), mode: value.mode.toString(), uid: value.uid.toString(), gid: value.gid.toString() });
}
function same(actual: unknown, expected: unknown, label: string): void { requireEvidence(canonicalJson(actual) === canonicalJson(expected), `closure-${label}-changed`); }
// Each entry retains only two fixed-length digests. Every observer freshly hashes
// All bytes and checks paths, identities, sidecars, runtime and cleanup. Keeping
// Residents when full avoids eviction churn during repeated sorted scans.
const MAX_JSON_DIGEST_ENTRIES = 512;
const jsonDigests = new Map<string, string>();
function jsonDigest(bytes: Buffer, bytesSha256: string): string {
  const previous = jsonDigests.get(bytesSha256);
  if (previous !== undefined) { return previous; }
  let digest: string;
  try { digest = sha256Json(JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes)) as unknown); }
  catch { throw new ClosureEvidenceChangedError("closure-replayed-json-invalid"); }
  if (jsonDigests.size < MAX_JSON_DIGEST_ENTRIES) { jsonDigests.set(bytesSha256, digest); }
  return digest;
}
async function absent(path: string): Promise<void> {
  try { await lstat(path); }
  catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { return; } throw error; }
  requireEvidence(false, "closure-sidecar-present");
}
function recorded(info: Identity, role: ClosureRole): void {
  if (role.recordedIdentity === null) { return; }
  const expected = role.recordedIdentity;
  for (const [key, value] of Object.entries(expected)) {
    let field = key;
    if (key === "dev") { field = "device"; } else if (key === "ino") { field = "inode"; }
    requireEvidence(info[field] === value, "closure-recorded-identity-changed");
  }
}
function boundedFile(info: BigIntStats, role: ClosureRole): void {
  if (role.managed) {
    requireEvidence(info.isFile() && !info.isSymbolicLink() && info.nlink === 1n && typeof process.getuid === "function" &&
      info.uid === BigInt(process.getuid()), "closure-file-type-owner");
  } else if (!info.isFile() || info.isSymbolicLink()) { throw new ClosureIneligibleError("closure-manifest-file-kind"); }
  if (role.bytes !== null) { requireEvidence(info.size === BigInt(role.bytes), "closure-file-length-changed"); }
  recorded(identity(info), role);
  if (role.database) { requireEvidence(info.mode % 512n === 0o600n, "closure-database-mode-changed"); }
  else if (role.managed && info.mode % 512n !== 0o600n) { throw new ClosureIneligibleError("closure-private-file-mode"); }
  if (info.size <= 0n || info.size > BigInt(role.maximumBytes)) { throw new ClosureIneligibleError("closure-file-size"); }
}
function manifestEligible(info: Identity): void {
  // These are cache-only requirements. Check exact descriptor bytes first so
  // A known contradiction cannot be hidden by a stricter enrollment refusal.
  if (info["links"] !== "1" || typeof process.getuid !== "function" ||
      info["uid"] !== String(process.getuid()) && info["uid"] !== "0") {
    throw new ClosureIneligibleError("closure-manifest-owner-or-links");
  }
}
async function manifestDirectory(parent: string): Promise<RetainedDirectory> {
  if (await realpath(parent) !== parent) { throw new ClosureIneligibleError("closure-manifest-parent-alias"); }
  // oxlint-disable-next-line eslint/no-bitwise -- Fixed manifest parent only; do not follow a replaced directory symlink.
  const handle = await open(parent, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  try { return { path: parent, handle, identity: directoryIdentity(await handle.stat({ bigint: true })), managed: false }; }
  catch (error) { await handle.close(); throw error; }
}

async function observe(input: unknown, profile: ClosureProfile = "locked", lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> {
  const started = performance.now();
  const rootPath = resolve(controlDataDirectory());
  let plan: ClosurePlan | AgedClosurePlan;
  if (profile === "aged") {
    // Keep aged compiler/shape imports out of locked and ordinary admission.
    // Only the fixed internal entry below selects this derivation.
    const { deriveClosedSymbolAgedTerminalClosure } = await import("./closed-symbol-aged-terminal-closure-plan.ts");
    plan = deriveClosedSymbolAgedTerminalClosure(input);
  } else { plan = deriveClosedSymbolTerminalClosure(input); }
  const result = await observePlan(plan, lease, started);
  requireEvidence(resolve(controlDataDirectory()) === rootPath, "closure-issued-root-changed");
  issuedClosures.set(result, Object.freeze({ profile, rootPath, observation: result }));
  return result;
}
async function observePlan(plan: ClosurePlan | AgedClosurePlan, lease: CurrentProcessSqlRuntimeLease | undefined,
  started = performance.now()): Promise<ClosureObservation> {
  const deadline = (): void => { if (performance.now() - started > CLOSURE_LIMITS.deadlineMs) { throw new ClosureIneligibleError("closure-elapsed-deadline"); } };
  deadline();
  let node: VerifiedMachineNode | undefined;
  if (lease === undefined) {
    const runtime = await currentProcessSqlRuntime(); deadline(); same(runtime, plan.runtime, "current-runtime");
    node = await openVerifiedMachineNode(runtime);
  } else {
    await assertCurrentProcessSqlRuntimeLease(lease); deadline(); same(lease.runtime, plan.runtime, "current-runtime");
  }
  const directories: RetainedDirectory[] = [], files: RetainedFile[] = [];
  let failed = false;
  let originalFailure: unknown;
  try {
    deadline(); const root = await controlRootCapability(false); deadline();
    const rootIdentity = directoryIdentity(await root.handle.stat({ bigint: true }));
    const grouped = new Map<string, ClosureRole[]>();
    for (const role of plan.roles) { const values = grouped.get(role.path); if (values === undefined) { grouped.set(role.path, [role]); } else { values.push(role); } }
    let observedBytes = 0;
    const fileMetadata: { path: string; identity: Identity; sha256: string; roles: readonly string[] }[] = [];
    const absentSidecars: { role: string; path: string }[] = [];
    for (const values of grouped.values()) {
      deadline(); const role = values[0]; requireEvidence(role !== undefined, "closure-role-empty");
      const parent = dirname(role.path);
      let directory = directories.find((entry) => entry.path === parent);
      if (directory === undefined) {
        if (role.managed) {
          const opened = await root.openDirectory(parent, false);
          directory = { path: parent, handle: opened.handle, identity: directoryIdentity(opened.info), managed: true };
        } else {
          directory = await manifestDirectory(parent);
        }
        directories.push(directory);
      }
      deadline();
      const bound = `/proc/self/fd/${directory.handle.fd}/${basename(role.path)}`;
      if (role.database) {
        for (const suffix of ["-wal", "-shm", "-journal"]) {
          await absent(`${bound}${suffix}`); await absent(`${role.path}${suffix}`); deadline();
          absentSidecars.push(...values.map((alias) => ({ role: `${alias.role}${suffix}`, path: `${role.path}${suffix}` })));
        }
      }
      const before = await lstat(bound, { bigint: true }); boundedFile(before, role); deadline();
      const fileIdentity = identity(before);
      same(identity(await lstat(role.path, { bigint: true })), fileIdentity, "named-file");
      observedBytes += Number(before.size);
      if (observedBytes > CLOSURE_LIMITS.aggregateBytes) { throw new ClosureIneligibleError("closure-aggregate-budget"); }
      // oxlint-disable-next-line eslint/no-bitwise -- Reject symlinks and avoid a blocking FIFO substitution before the retained regular-file identity check.
      const handle = await open(bound, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
      files.push({ handle, role, bound, identity: fileIdentity }); deadline();
      same(identity(await handle.stat({ bigint: true })), fileIdentity, "opened-file");
      const hash = createHash("sha256");
      const chunk = Buffer.alloc(Math.min(CLOSURE_LIMITS.chunkBytes, Number(before.size)));
      const jsonChunks: Buffer[] = [];
      const expectedJson = values.map((entry) => entry.jsonSha256).filter((entry) => entry !== null);
      const retainedJsonDigest = expectedJson.length > 0 ? jsonDigests.get(role.sha256) : undefined;
      let position = 0;
      while (position < Number(before.size)) {
        deadline(); const count = Math.min(chunk.length, Number(before.size) - position);
        const result = await handle.read(chunk, 0, count, position); deadline();
        requireEvidence(result.bytesRead > 0 && result.bytesRead <= count, "closure-read-length");
        const bytes = chunk.subarray(0, result.bytesRead); hash.update(bytes);
        if (expectedJson.length > 0 && retainedJsonDigest === undefined) { jsonChunks.push(Buffer.from(bytes)); }
        position += result.bytesRead;
      }
      const digest = hash.digest("hex");
      requireEvidence(digest === role.sha256, "closure-expected-bytes-changed");
      if (expectedJson.length > 0) {
        // A prior parse is usable only after the complete fresh byte digest
        // Matches. It grants no historical result or current-file authority.
        const parsedDigest = retainedJsonDigest ?? jsonDigest(Buffer.concat(jsonChunks), digest);
        for (const expected of expectedJson) { requireEvidence(parsedDigest === expected, "closure-replayed-json-changed"); }
      }
      if (!role.managed) { manifestEligible(fileIdentity); }
      same(identity(await handle.stat({ bigint: true })), fileIdentity, "hashed-file");
      same(identity(await lstat(bound, { bigint: true })), fileIdentity, "bound-file");
      same(identity(await lstat(role.path, { bigint: true })), fileIdentity, "named-file");
      fileMetadata.push({ path: role.path, identity: fileIdentity, sha256: digest, roles: Object.freeze(values.map((entry) => entry.role)) }); deadline();
    }
    // All observations are sequential, not an atomic snapshot. Retained handles
    // And final identity checks detect observed drift without restoring readers.
    for (const file of files) {
      deadline(); same(identity(await file.handle.stat({ bigint: true })), file.identity, "final-descriptor");
      same(identity(await lstat(file.bound, { bigint: true })), file.identity, "final-bound");
      same(identity(await lstat(file.role.path, { bigint: true })), file.identity, "final-named");
      if (file.role.database) { for (const suffix of ["-wal", "-shm", "-journal"]) { await absent(`${file.bound}${suffix}`); await absent(`${file.role.path}${suffix}`); } }
    }
    for (const directory of directories) {
      deadline(); same(directoryIdentity(await directory.handle.stat({ bigint: true })), directory.identity, "directory-descriptor");
      same(directoryIdentity(await lstat(directory.path, { bigint: true })), directory.identity, "directory-named");
      if (directory.managed) {
        const current = await root.openDirectory(directory.path, false);
        try { same(directoryIdentity(current.info), directory.identity, "directory-lineage"); } finally { await current.handle.close(); }
      } else { requireEvidence(await realpath(directory.path) === directory.path, "closure-manifest-parent-changed"); }
    }
    await root.assertCurrent(); same(directoryIdentity(await root.handle.stat({ bigint: true })), rootIdentity, "root");
    if (lease === undefined) { requireEvidence(node !== undefined, "closure-node-owner-missing"); await node.assertCurrent(); }
    else { await assertCurrentProcessSqlRuntimeLease(lease); }
    deadline();
    const result = { profile: "private.closed-terminal-closure-observation.v1" as const, plan, root: rootIdentity,
      directories: Object.freeze(directories.map((entry) => Object.freeze({ path: entry.path, identity: entry.identity }))),
      files: Object.freeze(fileMetadata.map((entry) => Object.freeze(entry))), absentSidecars: Object.freeze(absentSidecars.map((entry) => Object.freeze(entry))), observedBytes,
      semanticValidationPerformed: false as const, executionAuthorized: false as const, completionProved: false as const };
    if (Buffer.byteLength(JSON.stringify(result)) > CLOSURE_LIMITS.metadataBytes) { throw new ClosureIneligibleError("closure-metadata-budget"); }
    return Object.freeze(result);
  } catch (error) { failed = true; originalFailure = error; throw error; }
  finally {
    // Attempt every close, retaining any already-observed refusal unchanged.
    const results = await Promise.allSettled([...files.map((entry) => entry.handle.close()), ...directories.map((entry) => entry.handle.close()),
      ...(node === undefined ? [] : [node.close()])]);
    const failures = results.filter((entry) => entry.status === "rejected").map((entry) => entry.reason as unknown);
    // oxlint-disable-next-line eslint/no-unsafe-finally -- A failed close is not a cache-eligibility condition; preserve both failures without overriding a known evidence contradiction.
    if (failures.length > 0 && originalFailure instanceof ClosureIneligibleError) { throw new AggregateError([originalFailure, ...failures], "closure-ineligible-cleanup"); }
    if (!failed) {
      // oxlint-disable-next-line eslint/no-unsafe-finally -- Otherwise-successful observation still requires all closes and deadline completion.
      if (failures.length > 0) { throw new AggregateError(failures, "closure-cleanup-failed"); }
      deadline();
    }
  }
}
export function observeClosedSymbolTerminalClosure(input: unknown, lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> { return observe(input, "locked", lease); }
export async function revalidateClosedSymbolTerminalClosure(input: unknown, previous: unknown, lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> {
  const retained = ownBoundedData(previous);
  const current = await observe(input, "locked", lease);
  same(current, retained, "previous-observation"); return current;
}
export function observeClosedSymbolAgedTerminalClosure(input: unknown, lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> { return observe(input, "aged", lease); }
export async function revalidateClosedSymbolAgedTerminalClosure(input: unknown, previous: unknown, lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> {
  const retained = ownBoundedData(previous);
  const current = await observe(input, "aged", lease);
  same(current, retained, "previous-observation"); return current;
}
async function revalidateIssued(previous: unknown, profile: ClosureProfile, lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> {
  const held = previous !== null && typeof previous === "object" ? issuedClosures.get(previous) : undefined;
  requireEvidence(held !== undefined && held.profile === profile, "closure-original-observation-required");
  requireEvidence(resolve(controlDataDirectory()) === held.rootPath, "closure-issued-root-changed");
  const current = await observePlan(held.observation.plan, lease);
  requireEvidence(resolve(controlDataDirectory()) === held.rootPath, "closure-issued-root-changed");
  same(current, held.observation, "previous-observation");
  return current;
}
/** Private historical-computation reuse. Every role is freshly descriptor-read,
 * hashed and identity/sidecar/runtime-checked by the unchanged observer. The
 * original plan omits the large raw journal/events/fingerprint input graph. */
export function revalidateObservedClosedSymbolTerminalClosure(previous: unknown, lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> {
  return revalidateIssued(previous, "locked", lease);
}
export function revalidateObservedClosedSymbolAgedTerminalClosure(previous: unknown, lease?: CurrentProcessSqlRuntimeLease): Promise<ClosureObservation> {
  return revalidateIssued(previous, "aged", lease);
}
