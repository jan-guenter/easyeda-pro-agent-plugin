import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { ClosedSymbolTerminalStage } from "../../src/closed-symbol-terminal.ts";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";
import { isRecord } from "../../src/core.ts";

async function snapshot(root: string): Promise<readonly Readonly<{ path: string; sha256: string; bytes: number }>[]> {
  const entries = await readdir(root, { recursive: true });
  const paths = entries.toSorted();
  assert.ok(paths.length < 2048);
  const records = [];
  for (const path of paths) {
    const full = join(root, path);
    const information = await lstat(full);
    assert.equal(information.isSymbolicLink(), false);
    if (!information.isDirectory()) {
      assert.ok(information.isFile() && information.size <= 33_554_432);
      const bytes = await readFile(full);
      records.push({ path, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length });
    }
  }
  return records;
}

void test("fresh process proves historical completion with the synthetic source absent and no evidence writes", async (context) => {
  const f = await fixture(context);
  const full = await f.stage.recordFullEvidence(f.plan);
  const completion = await new ClosedSymbolTerminalStage(f.engine, f.machine).complete(full);
  const beforeCalls = [...f.events];
  const root = syntheticSqlRoot();
  const before = await snapshot(root);
  const hidden = `${f.source}.terminal-restart-retained`;
  await assert.rejects(lstat(hidden), { code: "ENOENT" });
  await rename(f.source, hidden);
  try {
    const hiddenBefore = await snapshot(root);
    const { promise, resolve, reject } = Promise.withResolvers<{ stdout: string; stderr: string }>();
    execFile(process.execPath, [join(import.meta.dirname, "closed-symbol-terminal-restart-child.ts"), root, full.operationId, JSON.stringify(completion)],
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Await the bounded real Node child callback, with no inherited native or profile environment.
      { env: { NODE_NO_WARNINGS: "1" }, maxBuffer: 32_768, timeout: 60_000 }, (error, stdout, stderr) => {
        if (error === null) { resolve({ stdout, stderr }); }
        else { reject(new Error(`Synthetic restart child refused: ${stderr}`, { cause: error })); }
      });
    const result = await promise;
    assert.equal(result.stderr, "");
    const data: unknown = JSON.parse(result.stdout);
    assert.ok(isRecord(data) && isRecord(data["historical"]));
    assert.notEqual(data["childPid"], process.pid);
    assert.equal(data["sourceAbsent"], true);
    assert.equal(data["copiedCompletionRejected"], true);
    const historical = data["historical"];
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
  } finally { await rename(hidden, f.source); }
  assert.deepEqual(await snapshot(root), before);
});
