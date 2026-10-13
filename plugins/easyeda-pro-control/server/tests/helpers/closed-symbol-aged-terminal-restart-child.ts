/** Fresh synthetic process, without preloaded original-result or native owners. */
import assert from "node:assert/strict";
import { lstat, realpath } from "node:fs/promises";
import { basename, join } from "node:path";
import type { assertOriginalAgedClosedSymbolCompletion as CompletionAssertion } from "../../src/closed-symbol-aged-terminal.ts";

async function main(): Promise<void> {
  assert.equal(process.version, "v24.18.0");
  const encoded = process.argv[4], operationId = process.argv[3], root = process.argv[2];
  assert.ok(root !== undefined && operationId !== undefined && encoded !== undefined);
  assert.match(basename(root), /^easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u);
  assert.equal(await realpath(root), root);
  const information = await lstat(root);
  assert.ok(information.isDirectory() && information.mode % 512 === 0o700 && information.uid === process.getuid?.());
  process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
  process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(root, "bridge-token");
  process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(root, "upstream");
  const { assertOriginalAgedClosedSymbolCompletion, inspectClosedSymbolAgedTerminal } = await import("../../src/closed-symbol-aged-terminal.ts");
  const assertCompletion: typeof CompletionAssertion = assertOriginalAgedClosedSymbolCompletion;
  const { syntheticSqlRuntime } = await import("./sqlite-inventory-fixture.ts");
  const { loadClosedSymbolHistoricalPhaseJournal } = await import("../../src/closed-symbol-journal.ts");
  const { inspectClosedSymbolTerminal } = await import("../../src/closed-symbol-terminal.ts");
  const { sha256Json } = await import("../../src/core.ts");
  const { EasyedaControlEngine } = await import("../../src/engine.ts");
  const { UpstreamEasyedaClient } = await import("../../src/upstream.ts");
  const loaded = await loadClosedSymbolHistoricalPhaseJournal(operationId);
  await assert.rejects(lstat(loaded.journal.plan.projectPath), { code: "ENOENT" });
  const engine = new EasyedaControlEngine(new UpstreamEasyedaClient());
  await engine.controlFingerprintPromise;
  const serialized: unknown = JSON.parse(encoded);
  assert.throws(() => { assertCompletion(serialized, engine, operationId); }, /original/iu);
  const runtime = await syntheticSqlRuntime();
  await assert.rejects(inspectClosedSymbolTerminal(operationId, runtime), /Terminal profile refused/u);
  const historical = await inspectClosedSymbolAgedTerminal(operationId, runtime);
  assert.equal(historical.storedJournalSha256, loaded.journal["journalSha256"]);
  assert.equal(historical.entireStoredJournalSha256, sha256Json(loaded.journal));
  await assert.rejects(lstat(loaded.journal.plan.projectPath), { code: "ENOENT" });
  process.stdout.write(`${JSON.stringify({ childPid: process.pid, sourceAbsent: true, copiedCompletionRejected: true,
    lockedInspectorRejected: true, historical })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- The standalone synthetic child must finish before exiting.
await main();
