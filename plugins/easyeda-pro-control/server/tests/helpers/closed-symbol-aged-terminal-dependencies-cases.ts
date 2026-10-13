/* oxlint-disable import/max-dependencies -- Actual managed mutations require the fixed graph, descriptor parser and phase loader together. */
import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { agedCoordinatorFixture } from "./closed-symbol-aged-coordinator-fixture.ts";
import { assertOriginalAgedClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { ClosedSymbolAgedTerminalStage, inspectClosedSymbolAgedTerminal } from "../../src/closed-symbol-aged-terminal.ts";
import { loadClosedSymbolHistoricalPhaseJournal } from "../../src/closed-symbol-journal.ts";
import { operationPath } from "../../src/artifacts.ts";
import { sha256Json, sha256Text } from "../../src/core.ts";
import { parseClosedSymbolAgedTerminalEnvelope } from "../../src/closed-symbol-aged-terminal-shape.ts";

void test("v2 replay rechecks both reference files and rejects a self-resealed wrong result digest", async (context) => {
  const f = await agedCoordinatorFixture(context), full = await f.stage.recordAgedFullEvidence(f.plan);
  const original = assertOriginalAgedClosedSymbolFullEvidence(full, f.engine, full.operationId);
  const stage = new ClosedSymbolAgedTerminalStage(f.engine, f.machine);
  const result = await stage.complete(full);
  const before = [...f.events], references = f.transport.calls, rendererCalls = f.transport.rendererCalls;
  for (const descriptor of [original.mainReference.intentArtifact, original.mainReference.resultArtifact]) {
    await context.test(`late ${basename(descriptor.path)} mutation refuses after initial successful reads`, async (subcontext) => {
      const bytes = await fsPromises.readFile(descriptor.path), open = fsPromises.open;
      let changed = false;
      subcontext.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
        const handle = await open(...args);
        if (!changed && basename(String(args[0])) === "38-verify-content-read-raw.json") {
          changed = true; await fsPromises.writeFile(descriptor.path, "{}\n");
        }
        return handle;
      }); syncBuiltinESMExports();
      try { await assert.rejects(inspectClosedSymbolAgedTerminal(full.operationId, f.machine), /byte length|SHA-256|identity|changed/u); assert.equal(changed, true); }
      finally { subcontext.mock.restoreAll(); syncBuiltinESMExports(); await fsPromises.writeFile(descriptor.path, bytes); }
    });
  }
  await context.test("structurally valid wrong reference result commitment cannot count as semantic completion", async () => {
    const journalPath = operationPath(full.operationId);
    const journalBytes = await fsPromises.readFile(journalPath);
    const terminalBytes = await fsPromises.readFile(result.terminalArtifact.path);
    const loaded = await loadClosedSymbolHistoricalPhaseJournal(full.operationId);
    const raw: unknown = JSON.parse(terminalBytes.toString("utf8"));
    const envelope = parseClosedSymbolAgedTerminalEnvelope(raw);
    const body = { ...envelope.body, results: { ...envelope.body.results, mainReferenceResultSha256: "a".repeat(64) } };
    assert.notEqual(body.results.mainReferenceResultSha256, envelope.body.results.mainReferenceResultSha256);
    const altered = parseClosedSymbolAgedTerminalEnvelope({ ...envelope, body, bodySha256: sha256Json(body) });
    const text = `${JSON.stringify(altered)}\n`;
    const descriptor = { ...result.terminalArtifact, bytes: Buffer.byteLength(text), sha256: sha256Text(text) };
    const journal: Record<string, unknown> = { ...loaded.journal, terminalArtifact: descriptor };
    const { journalSha256: oldSeal, ...unsealed } = journal; assert.equal(typeof oldSeal, "string");
    const resealed = { ...unsealed, journalSha256: sha256Json(unsealed) };
    try {
      await fsPromises.writeFile(result.terminalArtifact.path, text);
      await fsPromises.writeFile(journalPath, `${JSON.stringify(resealed)}\n`);
      const phaseOnly = await loadClosedSymbolHistoricalPhaseJournal(full.operationId);
      assert.equal(phaseOnly.terminalOutcomeVerified, false);
      await assert.rejects(inspectClosedSymbolAgedTerminal(full.operationId, f.machine), /historical semantic envelope/u);
    } finally {
      await fsPromises.writeFile(result.terminalArtifact.path, terminalBytes);
      await fsPromises.writeFile(journalPath, journalBytes);
    }
  });
  const final = await inspectClosedSymbolAgedTerminal(full.operationId, f.machine);
  assert.equal(final.historicalCompletionRecorded, true);
  assert.deepEqual(f.events, before); assert.equal(f.transport.calls, references); assert.equal(f.transport.rendererCalls, rendererCalls);
});
