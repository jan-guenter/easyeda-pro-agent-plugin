import assert from "node:assert/strict";
import { lstat, readFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { createSyntheticCompletedPeer, retireSyntheticJournal } from "./helpers/synthetic-journal-retirement.ts";

function restoreEnvironment(key: string, value: string | undefined): void {
  if (value === undefined) { Reflect.deleteProperty(process.env, key); }
  else { process.env[key] = value; }
}

void test("retirement retains preload root identity when a fixture changes TMPDIR to that root", async () => {
  const root = controlDataDirectory();
  const peer = await createSyntheticCompletedPeer();
  const before = await readFile(peer.journalPath);
  const identity = await lstat(peer.journalPath, { bigint: true });
  assert.equal(dirname(root), await realpath(tmpdir()));
  const temporaryDirectory = process.env["TMPDIR"];
  process.env["TMPDIR"] = root;
  try {
    assert.equal(tmpdir(), root);
    await retireSyntheticJournal(peer.operationId);
    await assert.rejects(lstat(peer.journalPath), { code: "ENOENT" });
    const destination = join(root, "retired-test-journals", basename(peer.journalPath));
    assert.deepEqual(await readFile(destination), before);
    const preserved = await lstat(destination, { bigint: true });
    assert.equal(preserved.ino, identity.ino);
    assert.equal(preserved.dev, identity.dev);
    await retireSyntheticJournal(peer.operationId);
  } finally {
    restoreEnvironment("TMPDIR", temporaryDirectory);
  }
});

void test("completed peer creation also retains the initial worker root during a valid TMPDIR change", async () => {
  const root = controlDataDirectory();
  const temporaryDirectory = process.env["TMPDIR"];
  process.env["TMPDIR"] = root;
  try {
    const peer = await createSyntheticCompletedPeer();
    assert.equal(dirname(dirname(peer.journalPath)), root);
    await retireSyntheticJournal(peer.operationId);
  } finally {
    restoreEnvironment("TMPDIR", temporaryDirectory);
  }
});

void test("a matching-prefix foreign root is still refused without touching the original peer", async () => {
  const root = controlDataDirectory();
  const peer = await createSyntheticCompletedPeer();
  const before = await readFile(peer.journalPath);
  process.env["EASYEDA_CONTROL_DATA_DIR"] = join(dirname(root), `easyeda-test-control-${String(process.pid)}-foreign`);
  try {
    await assert.rejects(retireSyntheticJournal(peer.operationId));
    await assert.rejects(createSyntheticCompletedPeer());
    assert.deepEqual(await readFile(peer.journalPath), before);
  } finally {
    process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
  }
  await retireSyntheticJournal(peer.operationId);
});

void test("a foreign bridge-token path remains refused during a valid TMPDIR change", async () => {
  const root = controlDataDirectory();
  const peer = await createSyntheticCompletedPeer();
  const before = await readFile(peer.journalPath);
  const token = process.env["EASYEDA_BRIDGE_TOKEN_FILE"];
  const temporaryDirectory = process.env["TMPDIR"];
  process.env["TMPDIR"] = root;
  process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(root, "foreign-token");
  try {
    await assert.rejects(retireSyntheticJournal(peer.operationId));
    await assert.rejects(createSyntheticCompletedPeer());
    assert.deepEqual(await readFile(peer.journalPath), before);
  } finally {
    restoreEnvironment("TMPDIR", temporaryDirectory);
    restoreEnvironment("EASYEDA_BRIDGE_TOKEN_FILE", token);
  }
  await retireSyntheticJournal(peer.operationId);
});

void test("traversal remains refused during a valid TMPDIR change", async () => {
  const temporaryDirectory = process.env["TMPDIR"];
  process.env["TMPDIR"] = controlDataDirectory();
  try { await assert.rejects(retireSyntheticJournal("../unrelated")); }
  finally { restoreEnvironment("TMPDIR", temporaryDirectory); }
});

void test("two fixture cleanup hooks may restore TMPDIR to the current root without redirecting retirement", async (context) => {
  const root = controlDataDirectory();
  const originalTemp = process.env["TMPDIR"];
  const peers = [await createSyntheticCompletedPeer(), await createSyntheticCompletedPeer()];
  const bytes = await Promise.all(peers.map((peer) => readFile(peer.journalPath)));
  const retirements: string[] = [];
  for (const [index, peer] of peers.entries()) {
    const oldTemp = process.env["TMPDIR"];
    process.env["TMPDIR"] = root;
    context.after((): void => { restoreEnvironment("TMPDIR", oldTemp); });
    context.after(async (): Promise<void> => {
      await retireSyntheticJournal(peer.operationId);
      const destination = join(root, "retired-test-journals", basename(peer.journalPath));
      assert.deepEqual(await readFile(destination), bytes[index]);
      await assert.rejects(lstat(peer.journalPath), { code: "ENOENT" });
      retirements.push(peer.operationId);
    });
  }
  context.after((): void => {
    restoreEnvironment("TMPDIR", originalTemp);
    assert.deepEqual(retirements, peers.map((peer) => peer.operationId));
  });
});
