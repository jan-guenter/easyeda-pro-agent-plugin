import assert from "node:assert/strict";
import fsPromises, { mkdir, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";
import type { CheckpointAccessPolicy, CheckpointReceipt } from "../src/checkpoint.ts";
import { openControlRootCapability } from "../src/control-root.ts";
import type { ControlRootCapability } from "../src/control-root.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

interface Fixture {
  readonly directory: string;
  readonly source: string;
  readonly artifactRoot: string;
  readonly policy: CheckpointAccessPolicy;
  readonly receipt: CheckpointReceipt;
}
async function fixture(context: TestContext): Promise<Fixture> {
  const directory = await createTestTemporaryDirectory("checkpoint-artifact-scratch-");
  const state: { controlRoot?: ControlRootCapability } = {};
  // This exact directory is created by this test invocation, never a shared
  // Control/evidence root. Register before setup so early failures also close it.
  context.after(async () => { await state.controlRoot?.close(); await rm(directory, { recursive: true, force: true }); });
  const root = join(directory, "control"), source = join(directory, "synthetic.eprj2");
  const artifactRoot = join(root, "checkpoints");
  const database = new DatabaseSync(source);
  try { database.exec("CREATE TABLE synthetic(value TEXT); INSERT INTO synthetic VALUES('synthetic checkpoint');"); }
  finally { database.close(); }
  await mkdir(root, { mode: 0o700 });
  const controlRoot = await openControlRootCapability(root); state.controlRoot = controlRoot;
  const policy = { expectedSource: source, artifactRoots: [artifactRoot], controlRoot };
  const receipt = await createCheckpoint({ source, outputDir: artifactRoot, label: "synthetic" }, policy);
  return { directory, source, artifactRoot, policy, receipt };
}
function restoreTemporaryEnvironment(previous: string | undefined): void {
  if (previous === undefined) { Reflect.deleteProperty(process.env, "TMPDIR"); }
  else { process.env["TMPDIR"] = previous; }
}
function isScratchPath(path: unknown): path is string {
  return typeof path === "string" && /^\.easyeda-checkpoint-target-[a-f0-9-]+\.tmp$/u.test(basename(path));
}
function restoreMocks(context: TestContext): void { context.mock.restoreAll(); syncBuiltinESMExports(); }

void test("checkpoint verification uses admitted artifact scratch even when ambient TMPDIR is not a directory", async context => {
  const value = await fixture(context);
  const before = await readFile(value.source);
  const entries = await readdir(value.artifactRoot), originalOpen = fsPromises.open;
  const inaccessibleTemporary = join(value.directory, "not-a-directory");
  await writeFile(inaccessibleTemporary, "ambient temporary filesystem must not be used");
  const previous = process.env["TMPDIR"]; process.env["TMPDIR"] = inaccessibleTemporary;
  let scratches = 0;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
    const opened = await originalOpen(...args);
    if (isScratchPath(args[0])) {
      scratches += 1;
      assert.equal(await realpath(dirname(args[0])), value.artifactRoot);
      const information = await opened.stat();
      assert.equal(information.mode % 512, 0o600); assert.equal(information.nlink, 1);
      assert.equal(information.uid, process.getuid?.());
    }
    return opened;
  }); syncBuiltinESMExports();
  try {
    const result = await verifyCheckpoint(value.receipt.receiptPath, value.policy);
    assert.equal(result.ok, true); assert.equal(scratches, 1);
    assert.deepEqual(await readdir(value.artifactRoot), entries);
    assert.deepEqual(await readFile(value.source), before);
    assert.equal(await readFile(inaccessibleTemporary, "utf8"), "ambient temporary filesystem must not be used");
  } finally { restoreMocks(context); restoreTemporaryEnvironment(previous); }
});

void test("checkpoint scratch refuses artifact-directory replacement and never cleans the replacement", async context => {
  const value = await fixture(context);
  const entries = await readdir(value.artifactRoot), originalOpen = fsPromises.open;
  const displaced = join(value.directory, "displaced-checkpoints"); let swapped = false;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
    if (!swapped && isScratchPath(args[0])) {
      swapped = true;
      await rename(value.artifactRoot, displaced);
      await mkdir(value.artifactRoot, { mode: 0o700 });
      await writeFile(join(value.artifactRoot, "replacement-marker"), "replacement survives");
    }
    return originalOpen(...args);
  }); syncBuiltinESMExports();
  try {
    await assert.rejects(verifyCheckpoint(value.receipt.receiptPath, value.policy), /Checkpoint directory path changed/u);
    assert.equal(swapped, true);
    assert.deepEqual(await readdir(value.artifactRoot), ["replacement-marker"]);
    assert.equal(await readFile(join(value.artifactRoot, "replacement-marker"), "utf8"), "replacement survives");
    assert.deepEqual(await readdir(displaced), entries);
  } finally { restoreMocks(context); }
});

void test("checkpoint verification retains detached snapshot identity and leaves a replacement filename intact", async context => {
  const originalOpen = fsPromises.open, value = await fixture(context); let scratchName: string | undefined;
  context.mock.method(fsPromises, "open", (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
    if (isScratchPath(args[0])) { scratchName = basename(args[0]); }
    return originalOpen(...args);
  }); syncBuiltinESMExports();
  try {
    const result = await verifyCheckpoint(value.receipt.receiptPath, value.policy, async () => {
      assert.notEqual(scratchName, undefined);
      assert.equal(typeof scratchName, "string");
      assert.ok(scratchName !== undefined);
      const path = join(value.artifactRoot, scratchName);
      await assert.rejects(stat(path), { code: "ENOENT" });
      await writeFile(path, "replacement filename survives", { flag: "wx", mode: 0o600 });
    });
    assert.equal(result.ok, true); assert.ok(scratchName !== undefined);
    assert.equal(await readFile(join(value.artifactRoot, scratchName), "utf8"), "replacement filename survives");
  } finally { restoreMocks(context); }
});

void test("checkpoint verification preserves source and artifacts when admitted scratch allocation fails", async context => {
  const value = await fixture(context);
  const entries = await readdir(value.artifactRoot), originalOpen = fsPromises.open;
  const originalBytes = await readFile(value.source);
  const failure = Object.assign(new Error("synthetic artifact filesystem full"), { code: "ENOSPC" }); let attempted = false;
  context.mock.method(fsPromises, "open", (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
    if (isScratchPath(args[0])) { attempted = true; throw failure; }
    return originalOpen(...args);
  }); syncBuiltinESMExports();
  try {
    await assert.rejects(verifyCheckpoint(value.receipt.receiptPath, value.policy), error => error === failure);
    assert.equal(attempted, true); assert.deepEqual(await readdir(value.artifactRoot), entries);
    assert.deepEqual(await readFile(value.source), originalBytes);
  } finally { restoreMocks(context); }
});

void test("checkpoint verification needs artifact-directory write scope, not just two authorized file paths", async context => {
  const value = await fixture(context);
  const entries = await readdir(value.artifactRoot);
  const fileOnlyPolicy = { ...value.policy, artifactRoots: [value.receipt.checkpoint, value.receipt.receiptPath] };
  await assert.rejects(verifyCheckpoint(value.receipt.receiptPath, fileOnlyPolicy), /snapshot directory is outside the authorized checkpoint roots/u);
  assert.deepEqual(await readdir(value.artifactRoot), entries);
});

for (const mutation of ["replacement", "rewrite"] as const) {
  void test(`checkpoint verification refuses receipt ${mutation} after its initial stable read`, async context => {
    const value = await fixture(context);
    const original = await readFile(value.receipt.receiptPath);
    let changed = false;
    await assert.rejects(verifyCheckpoint(value.receipt.receiptPath, value.policy, async () => {
      changed = true;
      if (mutation === "replacement") { await rename(value.receipt.receiptPath, `${value.receipt.receiptPath}.original`); }
      await writeFile(value.receipt.receiptPath, Buffer.concat([original, Buffer.from(" ")]), { mode: 0o600 });
    }), /Checkpoint receipt (?:path identity changed|changed while it was being read)/u);
    assert.equal(changed, true);
    assert.deepEqual(await readFile(value.receipt.receiptPath), Buffer.concat([original, Buffer.from(" ")]));
    const entries = await readdir(value.artifactRoot);
    assert.equal(entries.some(name => name.startsWith(".easyeda-checkpoint-target-")), false);
  });
}
