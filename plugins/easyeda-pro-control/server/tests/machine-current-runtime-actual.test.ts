import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, realpath } from "node:fs/promises";
import { test } from "node:test";
import { currentProcessSqlRuntime, openVerifiedMachineNode } from "../src/machine-profile.ts";

void test("actual pinned current Node derives a reusable SQL runtime without app or profile inputs", async () => {
  const before = await readdir("/proc/self/fd");
  const runtime = await currentProcessSqlRuntime();
  assert.equal(runtime.nodeExecutable, await realpath("/proc/self/exe"));
  assert.equal(runtime.nodeVersion, process.versions.node);
  assert.equal(runtime.nodeSha256, createHash("sha256").update(await readFile("/proc/self/exe")).digest("hex"));
  const node = await openVerifiedMachineNode(runtime);
  try { await node.assertCurrent(); }
  finally { await node.close(); }
  const after = await readdir("/proc/self/fd");
  assert.deepEqual(after.toSorted(), before.toSorted());
});
