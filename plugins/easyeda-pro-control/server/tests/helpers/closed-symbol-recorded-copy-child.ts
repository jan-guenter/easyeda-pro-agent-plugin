/** Synthetic restart process. No production root or authority dependency. */
import assert from "node:assert/strict";
import { lstat, realpath } from "node:fs/promises";
import { basename, join } from "node:path";

async function main(): Promise<void> {
  assert.equal(process.version, "v24.18.0");
  const root = process.argv[2]; const operationId = process.argv[3];
  assert.ok(root !== undefined && operationId !== undefined);
  assert.match(basename(root), /^easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u);
  assert.equal(await realpath(root), root);
  const info = await lstat(root);
  assert.ok(info.isDirectory() && info.mode % 512 === 0o700 && info.uid === process.getuid?.());
  process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
  process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = join(root, "bridge-token");
  process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(root, "upstream");
  const { inspectRecordedClosedCopy } = await import("../../src/closed-symbol-recorded-copy.ts");
  const { syntheticSqlRuntime } = await import("./sqlite-inventory-fixture.ts");
  const { loadClosedSymbolJournal } = await import("../../src/closed-symbol-journal.ts");
  const { assertIssuedClosedFileCopy } = await import("../../src/closed-file-copy.ts");
  const { isRecord } = await import("../../src/core.ts");
  const { events } = await loadClosedSymbolJournal(operationId);
  const copy = events.find((entry) => entry.step === "baseline-copy" && entry.kind === "result")?.data;
  assert.ok(isRecord(copy));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately present serialized data to the unchanged opaque-brand refusal.
  assert.throws(() => { assertIssuedClosedFileCopy(copy["copyReceipt"] as unknown as Parameters<typeof assertIssuedClosedFileCopy>[0]); }, /not issued/u);
  const result = await inspectRecordedClosedCopy({ operationId, phase: "baseline-copy", runtime: await syntheticSqlRuntime() });
  process.stdout.write(`${JSON.stringify({ evidence: result.evidence, copyBrandRejected: true, childPid: process.pid })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- This standalone synthetic child must finish before process exit; it is not a require(esm) module.
await main();
