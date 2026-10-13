/** Test-only preservation of finished case data, never production recovery. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { controlDataDirectory, createOperation, operationPath } from "../../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId } from "../../src/core.ts";

interface Retired { readonly path: string; readonly sha256: string; readonly inode: bigint; readonly device: bigint }
const retired = new Map<string, Retired>();
// Static imports run after the isolation preload and before fixture TMPDIR changes.
const initialTemporaryDirectory = tmpdir();
const initialTestRoot = controlDataDirectory();
function testRoot(): string {
  const root = controlDataDirectory();
  assert.equal(root, initialTestRoot, "Synthetic retirement requires the original test worker root");
  assert.equal(dirname(root), initialTemporaryDirectory, "Synthetic retirement requires the test worker root");
  assert.ok(basename(root).startsWith(`easyeda-test-control-${String(process.pid)}-`));
  assert.equal(process.env["EASYEDA_CONTROL_DATA_DIR"], root);
  assert.equal(process.env["EASYEDA_BRIDGE_TOKEN_FILE"], join(root, "bridge-token"));
  return root;
}
async function exactFile(path: string): Promise<Retired> {
  const info = await lstat(path, { bigint: true });
  assert.ok(info.isFile() && !info.isSymbolicLink() && info.nlink === 1n && info.size <= 16_777_216n);
  return { path, sha256: createHash("sha256").update(await readFile(path)).digest("hex"), inode: info.ino, device: info.dev };
}
export async function retireSyntheticJournal(operationId: string): Promise<void> {
  const root = testRoot();
  const previous = retired.get(operationId), source = operationPath(operationId);
  if (previous !== undefined) {
    await assert.rejects(lstat(source), { code: "ENOENT" });
    assert.deepEqual(await exactFile(previous.path), previous);
    return;
  }
  const directory = join(root, "retired-test-journals");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const directoryInfo = await lstat(directory);
  assert.ok(directoryInfo.isDirectory() && !directoryInfo.isSymbolicLink());
  const destination = join(directory, basename(source));
  await assert.rejects(lstat(destination), { code: "ENOENT" });
  const before = await exactFile(source);
  await rename(source, destination);
  const preserved = await exactFile(destination);
  assert.deepEqual(preserved, { ...before, path: destination });
  retired.set(operationId, Object.freeze(preserved));
}

/** An ordinary unrelated completed journal, not a closed-session completion. */
export async function createSyntheticCompletedPeer(): Promise<Readonly<{ operationId: string; journalPath: string }>> {
  testRoot();
  const operationId = newOperationId(), plan = { profile: "test.unrelated-completed-peer.v1" };
  await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan),
    state: "completed", artifacts: [], orphanedCallPossible: false });
  return Object.freeze({ operationId, journalPath: operationPath(operationId) });
}
