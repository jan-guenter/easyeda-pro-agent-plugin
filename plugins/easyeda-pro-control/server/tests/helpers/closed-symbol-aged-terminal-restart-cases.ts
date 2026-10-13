import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { agedCoordinatorFixture } from "./closed-symbol-aged-coordinator-fixture.ts";
import { ClosedSymbolAgedTerminalStage } from "../../src/closed-symbol-aged-terminal.ts";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";
import { isRecord } from "../../src/core.ts";

async function snapshot(root: string): Promise<readonly Readonly<{ path: string; sha256: string; bytes: number }>[]> {
  const entries = await readdir(root, { recursive: true });
  const paths = entries.toSorted();
  assert.ok(paths.length < 2048);
  const records = [];
  for (const path of paths) {
    const full = join(root, path), information = await lstat(full);
    assert.equal(information.isSymbolicLink(), false);
    if (!information.isDirectory()) {
      assert.ok(information.isFile() && information.size <= 33_554_432);
      const bytes = await readFile(full);
      records.push({ path, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length });
    }
  }
  return records;
}

void test("fresh process proves aged v2 history with source absent and no evidence writes or restored authority", async (context) => {
  const f = await agedCoordinatorFixture(context);
  const full = await f.stage.recordAgedFullEvidence(f.plan);
  const completion = await new ClosedSymbolAgedTerminalStage(f.engine, f.machine).complete(full);
  const beforeCalls = [...f.events], referenceCalls = f.transport.calls, rendererCalls = f.transport.rendererCalls;
  const root = syntheticSqlRoot();
  const before = await snapshot(root);
  const hidden = `${f.source}.aged-terminal-restart-retained`;
  await assert.rejects(lstat(hidden), { code: "ENOENT" });
  await rename(f.source, hidden);
  try {
    const hiddenBefore = await snapshot(root);
    const { promise, resolve, reject } = Promise.withResolvers<{ stdout: string; stderr: string }>();
    execFile(process.execPath, [join(import.meta.dirname, "closed-symbol-aged-terminal-restart-child.ts"), root, full.operationId, JSON.stringify(completion)],
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Await the bounded real child callback without inheriting native/profile environment.
    { env: { NODE_NO_WARNINGS: "1" }, maxBuffer: 32_768, timeout: 60_000 }, (error, stdout, stderr) => {
      if (error === null) { resolve({ stdout, stderr }); }
      else { reject(new Error(`Synthetic aged restart child refused: ${stderr}`, { cause: error })); }
    });
    const result = await promise;
    assert.equal(result.stderr, "");
    const data: unknown = JSON.parse(result.stdout);
    assert.ok(isRecord(data) && isRecord(data["historical"]));
    assert.notEqual(data["childPid"], process.pid);
    assert.equal(data["sourceAbsent"], true);
    assert.equal(data["copiedCompletionRejected"], true);
    assert.equal(data["lockedInspectorRejected"], true);
    const historical = data["historical"];
    assert.equal(historical["profile"], "private.closed-symbol-historical-terminal.v2");
    assert.equal(historical["classification"], "historical-completion-verified");
    assert.equal(historical["historicalCompletionRecorded"], true);
    assert.equal(historical["terminalOutcomeVerified"], true);
    assert.equal(historical["bodySha256"], completion.bodySha256);
    assert.deepEqual(historical["terminalArtifact"], completion.terminalArtifact);
    for (const field of ["liveOriginalCompletionProved", "currentSourceChecked", "currentOwnershipChecked", "authorityRestored", "executionAuthorized", "replayAllowed"]) {
      assert.equal(historical[field], false, field);
    }
    assert.deepEqual(await snapshot(root), hiddenBefore);
    assert.deepEqual(f.events, beforeCalls);
    assert.equal(f.transport.calls, referenceCalls); assert.equal(f.transport.rendererCalls, rendererCalls);
  } finally { await rename(hidden, f.source); }
  assert.deepEqual(await snapshot(root), before);
});
