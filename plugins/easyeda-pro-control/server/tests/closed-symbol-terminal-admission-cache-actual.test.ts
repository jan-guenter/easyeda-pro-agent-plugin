/** Actual maintained stages on a synthetic fixture. No EasyEDA access. */
/* oxlint-disable import/max-dependencies -- Fixed real coordinator, storage and inspection graph with a passive child observer. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, mkdtemp, open, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";
import { operationPath, readExactUtf8Artifact } from "../src/artifacts.ts";
import { canonicalJson, reviewedCompatibilityManifestPath, sha256Json } from "../src/core.ts";
import { SQLITE_INVENTORY_PROGRAM } from "../src/sqlite-inventory-program.ts";

// oxlint-disable-next-line node/no-top-level-await -- Fixed synthetic native profile prerequisites precede the real issuer graph.
await installClosedSymbolTestProfiles();
// oxlint-disable-next-line node/no-top-level-await -- No original-result registry or stage is replaced.
const { fixture } = await import("./helpers/closed-symbol-coordinator-fixture.ts");
// oxlint-disable-next-line node/no-top-level-await -- The genuine maintained terminal publisher creates the retained graph.
const { ClosedSymbolTerminalStage } = await import("../src/closed-symbol-terminal.ts");
// oxlint-disable-next-line node/no-top-level-await -- Use the actual fixed journal parser.
const { FAMILY, loadClosedSymbolHistoricalPhaseJournal } = await import("../src/closed-symbol-journal.ts");
// oxlint-disable-next-line node/no-top-level-await -- This qualifies the actual running Node, not a caller-supplied runtime.
const { currentProcessSqlRuntime } = await import("../src/machine-profile.ts");
// oxlint-disable-next-line node/no-top-level-await -- Same strict maintained terminal interpretation used by the wrapper.
const { TERMINAL_STATE, parseClosedSymbolTerminalArtifact, parseClosedSymbolTerminalEnvelope } = await import("../src/closed-symbol-terminal-shape.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load the maintained fixed pre-cold byte capture after the synthetic profile prerequisites.
const { captureClosedSymbolJournalBytes } = await import("../src/closed-symbol-terminal-closure-journal.ts");
// oxlint-disable-next-line node/no-top-level-await -- Derive only the file roles for independent test snapshots; no success callback.
const { deriveClosedSymbolTerminalClosure } = await import("../src/closed-symbol-terminal-closure-plan.ts");
// oxlint-disable-next-line node/no-top-level-await -- This exact class, not its name, must classify a changed warm dependency.
const { ClosureEvidenceChangedError } = await import("../src/closed-symbol-terminal-closure-evidence-error.ts");
// oxlint-disable-next-line node/no-top-level-await -- Actual wrapper with its fixed maintained inspector, no unit dependency hooks.
const { inspectLockedTerminalForAdmission } = await import("../src/closed-symbol-terminal-admission-cache.ts");

interface SpawnTarget { spawn: (...args: unknown[]) => unknown }
function assertSpawnTarget(value: unknown): asserts value is SpawnTarget {
  assert.ok(value !== null && typeof value === "object" && typeof Reflect.get(value, "spawn") === "function");
}
function digest(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
interface Snapshot { readonly path: string; readonly bytes: number; readonly sha256: string; readonly identity: Readonly<Record<string, string>> }
function fileIdentity(info: BigIntStats): Readonly<Record<string, string>> {
  return { device: String(info.dev), inode: String(info.ino), mode: String(info.mode), uid: String(info.uid), gid: String(info.gid),
    links: String(info.nlink), mtimeNs: String(info.mtimeNs), ctimeNs: String(info.ctimeNs), birthtimeNs: String(info.birthtimeNs), size: String(info.size) };
}
async function snapshot(paths: readonly string[]): Promise<readonly Snapshot[]> {
  const result: Snapshot[] = []; let total = 0;
  for (const path of paths) {
    const before = await lstat(path, { bigint: true });
    assert.ok(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n);
    assert.ok(before.size > 0n && before.size <= 8_388_608n);
    total += Number(before.size); assert.ok(total <= 33_554_432);
    const bytes = await readFile(path);
    const after = await lstat(path, { bigint: true });
    assert.deepEqual(fileIdentity(after), fileIdentity(before)); assert.equal(bytes.length, Number(before.size));
    result.push({ path, bytes: bytes.length, sha256: digest(bytes), identity: fileIdentity(before) });
  }
  return result;
}
function compareAfterMutation(before: readonly Snapshot[], after: readonly Snapshot[], changedPath: string): void {
  assert.equal(after.length, before.length);
  for (let index = 0; index < before.length; index += 1) {
    const current = after[index], old = before[index]; assert.ok(old !== undefined && current !== undefined);
    if (old.path === changedPath) {
      assert.equal(current.path, old.path); assert.equal(current.bytes, old.bytes); assert.equal(current.sha256, old.sha256);
      // A deliberate same-inode write changes mtime/ctime. Do not claim those stayed unchanged.
      for (const key of ["device", "inode", "mode", "uid", "gid", "links", "birthtimeNs", "size"]) { assert.equal(current.identity[key], old.identity[key]); }
    } else { assert.deepEqual(current, old); }
  }
}

void test("actual locked wrapper enrolls, revalidates, refuses changed evidence and evicts without cold retry", async (context) => {
  const isolated = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolated !== undefined && /^easyeda-test-control-[0-9]+-/u.test(basename(isolated)));
  const rootInfo = await lstat(isolated);
  assert.ok(rootInfo.isDirectory() && !rootInfo.isSymbolicLink());
  assert.equal(rootInfo.mode % 512, 0o700); assert.equal(rootInfo.uid, process.getuid?.());
  const manifestPath = reviewedCompatibilityManifestPath();
  const [manifestBefore] = await snapshot([manifestPath]); assert.ok(manifestBefore !== undefined);
  const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
  await new ClosedSymbolTerminalStage(f.engine, f.machine).complete(full);
  const loaded = await loadClosedSymbolHistoricalPhaseJournal(full.operationId);
  const descriptor = parseClosedSymbolTerminalArtifact(loaded.journal["terminalArtifact"], full.operationId);
  const terminalFile = await readExactUtf8Artifact(descriptor);
  const envelope = parseClosedSymbolTerminalEnvelope(JSON.parse(terminalFile.text) as unknown);
  const fingerprintFile = await readExactUtf8Artifact(envelope.body.evidence.fingerprint);
  const fingerprint: unknown = JSON.parse(fingerprintFile.text);
  const runtime = await currentProcessSqlRuntime(); assert.equal(canonicalJson(runtime), canonicalJson(f.machine));
  const journalBytes = await captureClosedSymbolJournalBytes(loaded.journal);
  const plan = deriveClosedSymbolTerminalClosure({ journal: loaded.journal, journalBytes, events: loaded.events, envelope, fingerprint, runtime });
  assert.equal(plan.roles.length, 64);
  const manifestRole = plan.roles.find((role) => role.role === "manifest"); assert.ok(manifestRole !== undefined);
  assert.equal(manifestRole.path, manifestPath); assert.equal(manifestRole.bytes, manifestBefore.bytes); assert.equal(manifestRole.sha256, manifestBefore.sha256);
  const paths = [...new Set(plan.roles.map((role) => role.path))].toSorted(); assert.equal(paths.length, 62);
  const before = await snapshot(paths), eventsBefore = [...f.events];
  assert.deepEqual(before.find((file) => file.path === manifestPath), manifestBefore);
  const nativeBefore = { writes: f.state.writes, opens: f.state.opens, reads: f.state.reads, sessionSequence: f.state.sessionSequence };
  const candidate = Object.freeze({ operationId: full.operationId, state: TERMINAL_STATE, family: FAMILY,
    storedJournalSha256: loaded.journal["journalSha256"], entireStoredJournalSha256: sha256Json(loaded.journal), terminalArtifact: descriptor });
  const spawnTarget: unknown = childProcess.ChildProcess.prototype; assertSpawnTarget(spawnTarget);
  // The spy delegates unchanged and observes actual SQL/version child creation only.
  const spawn = context.mock.method(spawnTarget, "spawn");
  const metrics: { label: string; elapsedMs: number; sqlChildren: number; versionChildren: number; otherChildren: number; timerTicks: number; largestGapMs: number; fulfilled: boolean }[] = [];
  async function measure<T>(label: string, fixedAction: () => Promise<T>): Promise<T> {
    const firstCall = spawn.mock.calls.length, start = performance.now();
    let fulfilled = false, largestGapMs = 0, last = start, timerTicks = 0;
    const timer = setInterval(() => { const now = performance.now(); largestGapMs = Math.max(largestGapMs, now - last); last = now; timerTicks += 1; }, 2);
    try { const value = await fixedAction(); fulfilled = true; return value; }
    finally {
      clearInterval(timer);
      let otherChildren = 0, sqlChildren = 0, versionChildren = 0;
      for (const call of spawn.mock.calls.slice(firstCall)) {
        const options = call.arguments[0]; assert.ok(options !== null && typeof options === "object");
        const args: unknown = Reflect.get(options, "args"); assert.ok(Array.isArray(args));
        if (args.includes(SQLITE_INVENTORY_PROGRAM)) { sqlChildren += 1; }
        else if (args.length === 2 && args[1] === "--version") { versionChildren += 1; }
        else { otherChildren += 1; }
      }
      const metric = { label, elapsedMs: performance.now() - start, sqlChildren, versionChildren, otherChildren, timerTicks, largestGapMs, fulfilled };
      metrics.push(metric); context.diagnostic(JSON.stringify(metric));
    }
  }
  const cold = await measure("wrapper-cold-enrollment", () => inspectLockedTerminalForAdmission(candidate, runtime));
  assert.equal(cold.classification, "historical-completion-verified"); assert.equal(cold.bodySha256, envelope.bodySha256);
  assert.equal(cold.storedJournalSha256, candidate.storedJournalSha256); assert.equal(cold.entireStoredJournalSha256, candidate.entireStoredJournalSha256);
  assert.deepEqual(cold.terminalArtifact, descriptor);
  for (const key of ["liveOriginalCompletionProved", "currentSourceChecked", "currentOwnershipChecked", "authorityRestored", "executionAuthorized", "replayAllowed"] as const) { assert.equal(cold[key], false); }
  const warm = await measure("wrapper-warm-revalidation", () => inspectLockedTerminalForAdmission(candidate, runtime));
  assert.deepEqual(warm, cold); assert.deepEqual(await snapshot(paths), before); assert.deepEqual(f.events, eventsBefore);

  const target = envelope.body.evidence.witnessQualification;
  assert.equal(dirname(target.path), operationPath(full.operationId).slice(0, -5)); assert.ok(paths.includes(target.path));
  const original = await readFile(target.path); assert.equal(original.length, target.bytes); assert.equal(digest(original), target.sha256);
  assert.equal(original.at(-1), 10);
  const mutated = Buffer.from(original); mutated[mutated.length - 1] = 32;
  // Retain both byte variants in a separate owned diagnostic directory, never in the evidence graph.
  const diagnostics = await mkdtemp(join(isolated, "cache-wrapper-controls-"));
  await writeFile(join(diagnostics, "original.bin"), original, { flag: "wx", mode: 0o600 });
  await writeFile(join(diagnostics, "mutated.bin"), mutated, { flag: "wx", mode: 0o600 });
  await writeFile(join(diagnostics, "before.json"), `${JSON.stringify({ files: before, events: eventsBefore, native: nativeBefore }, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  // oxlint-disable-next-line eslint/no-bitwise -- Fixed read/write, no-follow and nonblocking descriptor flags for the exact owned synthetic file.
  const owned = await open(target.path, constants.O_RDWR | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const named = await lstat(target.path, { bigint: true }), retained = await owned.stat({ bigint: true });
    assert.deepEqual(fileIdentity(retained), fileIdentity(named)); assert.ok(retained.isFile() && retained.nlink === 1n && retained.uid === BigInt(process.getuid?.() ?? -1));
    assert.equal(retained.mode % 512n, 0o600n); assert.equal(retained.size, BigInt(original.length));
    try {
      const written = await owned.write(mutated, mutated.length - 1, 1, mutated.length - 1);
      assert.equal(written.bytesWritten, 1); await owned.sync();
      assert.deepEqual(await readFile(target.path), mutated);
      await assert.rejects(measure("wrapper-warm-changed-evidence-refusal", () => inspectLockedTerminalForAdmission(candidate, runtime)), ClosureEvidenceChangedError);
    } finally {
      const sameName = await lstat(target.path, { bigint: true });
      assert.equal(sameName.dev, retained.dev); assert.equal(sameName.ino, retained.ino); assert.equal(sameName.nlink, 1n);
      assert.equal(sameName.mode, retained.mode); assert.equal(sameName.uid, retained.uid); assert.equal(sameName.size, retained.size);
      const restored = await owned.write(original, original.length - 1, 1, original.length - 1);
      assert.equal(restored.bytesWritten, 1); await owned.sync();
    }
  } finally { await owned.close(); }
  compareAfterMutation(before, await snapshot(paths), target.path); assert.deepEqual(f.events, eventsBefore);
  // A retained stale slot would reject changed ctime. A fresh 18-SQL cold replay proves eviction.
  const reenrolled = await measure("wrapper-cold-after-selected-eviction", () => inspectLockedTerminalForAdmission(candidate, runtime));
  assert.deepEqual(reenrolled, cold);
  const rewarmed = await measure("wrapper-warm-after-reenrollment", () => inspectLockedTerminalForAdmission(candidate, runtime));
  assert.deepEqual(rewarmed, cold);
  assert.deepEqual(metrics.map((entry) => entry.sqlChildren), [18, 0, 0, 18, 0]);
  assert.deepEqual(metrics.map((entry) => entry.fulfilled), [true, true, false, true, true]);
  assert.ok(metrics.every((entry) => entry.otherChildren === 0 && entry.versionChildren > 0 && entry.timerTicks > 0));
  assert.deepEqual(f.events, eventsBefore);
  assert.deepEqual({ writes: f.state.writes, opens: f.state.opens, reads: f.state.reads, sessionSequence: f.state.sessionSequence }, nativeBefore);
  const finalSnapshot = await snapshot(paths);
  compareAfterMutation(before, finalSnapshot, target.path);
  assert.deepEqual(finalSnapshot.find((file) => file.path === manifestPath), manifestBefore);
  await writeFile(join(diagnostics, "after.json"), `${JSON.stringify({ files: finalSnapshot, events: f.events, native: nativeBefore, metrics }, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  context.diagnostic(JSON.stringify({ closureRoles: plan.roles.length, distinctFiles: paths.length,
    originalArtifactSha256: digest(original), deliberatelyMutatedSha256: digest(mutated), retainedBytesRestored: true,
    targetMtimeCtimeUnchangedClaimed: false, nativeCallsUnchanged: true, actualEasyedaAccess: false, isolatedSyntheticControlRoot: true }));
});
