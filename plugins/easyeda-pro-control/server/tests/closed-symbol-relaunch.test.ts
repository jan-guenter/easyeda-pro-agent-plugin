import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { copyFixture } from "./helpers/closed-symbol-copy-fixture.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { assertClosedSessionCopyAuthority } from "../src/windows-authority.ts";
import { ClosedSymbolRelaunchStage } from "../src/closed-symbol-relaunch.ts";

type CopyFixture = Awaited<ReturnType<typeof copyFixture>>;
type RelaunchInput = Parameters<ClosedSymbolRelaunchStage["launch"]>[0];
type RelaunchFixture = Omit<CopyFixture, "stage" | "input"> & {
  readonly result: Awaited<ReturnType<CopyFixture["copyStage"]["copy"]>>;
  readonly stage: ClosedSymbolRelaunchStage;
  readonly input: { -readonly [Key in keyof RelaunchInput]: RelaunchInput[Key] };
};
async function fixture(): Promise<RelaunchFixture> {
  const f = await copyFixture();
  const result = await f.copyStage.copy(f.journal, "baseline-copy", f.generation, f.proof);
  const stage = new ClosedSymbolRelaunchStage(f.engine, f.runtime);
  const input = { journal: f.journal, phase: "edit-launch" as const, proof: f.proof, copy: result.copy, checkpoint: result.checkpoint };
  return { ...f, result, stage, input };
}

void test("same owned runtime launches next generation once and invalidates only old copy authority", async () => {
  const f = await fixture();
  try {
    const result = await f.stage.launch(f.input);
    assert.equal(result.generation.ordinal, 1);
    assert.notEqual(result.generation.jobId, f.generation.jobId);
    assert.equal(result.generation.helperInstance, f.generation.helperInstance);
    assert.equal(f.calls("launch"), 2);
    assert.equal(f.stage.originalLaunch(f.operationId, "edit-launch"), result.launch);
    assert.equal(result.admissionProved, false); assert.equal(result.executionAuthorized, false);
    const loaded = await loadClosedSymbolJournal(f.operationId);
    assert.equal(loaded.events.at(-1)?.step, "edit-launch"); assert.equal(loaded.events.at(-1)?.kind, "result");
    await assert.rejects(assertClosedSessionCopyAuthority(f.proof));
    await assert.rejects(f.stage.launch(f.input), /already consumed/u);
    await assert.rejects(new ClosedSymbolRelaunchStage(f.engine, f.runtime).launch(f.input), /already consumed/u);
    assert.equal(f.calls("launch"), 2);
  } finally { await f.dispose(); }
});
for (const change of ["copy-clone", "proof-clone", "source-change", "scope"] as const) {
  void test(`${change} refuses before a second launch`, async () => {
    const f = await fixture();
    try {
      if (change === "copy-clone") { f.input.copy = structuredClone(f.input.copy); }
      if (change === "proof-clone") { f.input.proof = structuredClone(f.input.proof); }
      if (change === "source-change") { const database = new DatabaseSync(f.source); database.exec("UPDATE synthetic SET value='changed'"); database.close(); }
      if (change === "scope") { f.state.scope = true; }
      await assert.rejects(f.stage.launch(f.input));
      assert.equal(f.calls("launch"), 1);
      const loaded = await loadClosedSymbolJournal(f.operationId);
      assert.equal(loaded.events.at(-1)?.step, "baseline-copy");
    } finally { await f.dispose(); }
  });
}

void test("uncertain native launch retains its intent and never gains retry", async () => {
  const f = await fixture();
  try {
    f.owner.behavior.errorAction = "launch";
    await assert.rejects(f.stage.launch(f.input), /synthetic helper request refused/u);
    const loaded = await loadClosedSymbolJournal(f.operationId);
    assert.equal(loaded.events.at(-1)?.step, "edit-launch"); assert.equal(loaded.events.at(-1)?.kind, "intent");
    assert.equal(f.stage.originalLaunch(f.operationId, "edit-launch"), undefined);
    f.owner.behavior.errorAction = undefined;
    await assert.rejects(f.stage.launch(f.input), /already consumed/u);
    assert.equal(f.calls("launch"), 2);
  } finally { await f.dispose(); }
});
