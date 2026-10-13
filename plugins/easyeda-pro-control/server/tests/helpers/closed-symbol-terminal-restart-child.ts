/** Synthetic fresh process. No preloaded issuer registry or native transport. */
import assert from "node:assert/strict";
import { lstat, realpath } from "node:fs/promises";
import { basename, join } from "node:path";
import type { assertOriginalClosedSymbolCompletion as CompletionAssertion } from "../../src/closed-symbol-terminal.ts";

async function main(): Promise<void> {
  assert.equal(process.version, "v24.18.0");
  const root = process.argv[2];
  const operationId = process.argv[3];
  const encoded = process.argv[4];
  assert.ok(root !== undefined && operationId !== undefined && encoded !== undefined);
  assert.match(basename(root), /^easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u);
  assert.equal(await realpath(root), root);
  const information = await lstat(root);
  assert.ok(information.isDirectory() && information.mode % 512 === 0o700 && information.uid === process.getuid?.());
  process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
  process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(root, "bridge-token");
  process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(root, "upstream");
  const { assertOriginalClosedSymbolCompletion, inspectClosedSymbolTerminal } = await import("../../src/closed-symbol-terminal.ts");
  const assertCompletion: typeof CompletionAssertion = assertOriginalClosedSymbolCompletion;
  const { syntheticSqlRuntime } = await import("./sqlite-inventory-fixture.ts");
  const { loadClosedSymbolHistoricalPhaseJournal } = await import("../../src/closed-symbol-journal.ts");
  const { sha256Json } = await import("../../src/core.ts");
  const { EasyedaControlEngine } = await import("../../src/engine.ts");
  const { UpstreamEasyedaClient } = await import("../../src/upstream.ts");
  const loaded = await loadClosedSymbolHistoricalPhaseJournal(operationId);
  await assert.rejects(lstat(loaded.journal.plan.projectPath), { code: "ENOENT" });
  const engine = new EasyedaControlEngine(new UpstreamEasyedaClient());
  await engine.controlFingerprintPromise;
  const serialized: unknown = JSON.parse(encoded);
  assert.throws(() => { assertCompletion(serialized, engine, operationId); }, /original/iu);
  const historical = await inspectClosedSymbolTerminal(operationId, await syntheticSqlRuntime());
  assert.equal(historical.storedJournalSha256, loaded.journal["journalSha256"]);
  assert.equal(historical.entireStoredJournalSha256, sha256Json(loaded.journal));
  await assert.rejects(lstat(loaded.journal.plan.projectPath), { code: "ENOENT" });
  process.stdout.write(`${JSON.stringify({ childPid: process.pid, sourceAbsent: true, copiedCompletionRejected: true, historical })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- This standalone synthetic child must finish before exit; it is not a require(esm) module.
await main();
