import assert from "node:assert/strict";
import { after, test } from "node:test";
import fsPromises, { writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this exact worker-local prerequisite mock before loading the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Consumer imports follow the synthetic prerequisite hook; issuer modules stay unchanged.
const { assertOriginalClosedSymbolWrite } = await import("../src/closed-symbol-write.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load the actual stage fixture after its worker-local prerequisite mock.
const { writeFixture } = await import("./helpers/closed-symbol-write-fixture.ts");

void test("actual original witness and prepared SQL plan bind exactly one tracked synthetic write", async (context) => {
  const fixture = await writeFixture(context), result = await fixture.writer.write(fixture.writeInput);
  assert.strictEqual(assertOriginalClosedSymbolWrite(result, fixture.engine, fixture.journal.operationId), result);
  assert.strictEqual(fixture.writer.originalReturn(fixture.journal.operationId), fixture.writeState.raw);
  assert.equal(fixture.writeState.calls, 1); assert.equal(result.completionProved, false); assert.equal(result.saved, false); assert.equal(result.reopened, false);
  assert.equal(result.preparedSqlPlanSha256, fixture.preparation.preparedSqlPlanSha256);
  const retained = await loadClosedSymbolJournal(fixture.journal.operationId);
  assert.equal(retained.events.at(-1)?.step, "edit-write"); assert.equal(retained.events.at(-1)?.kind, "result");
  assert.equal(retained.journal.mutationMayHaveOccurred, true); assert.equal(retained.journal.orphanedCallPossible, false);
  assert.throws(() => assertOriginalClosedSymbolWrite(structuredClone(result), fixture.engine, fixture.journal.operationId), /not the unchanged original/u);
  await assert.rejects(fixture.writer.write(fixture.writeInput), /already consumed/u); assert.equal(fixture.writeState.calls, 1);
});

for (const changed of ["witness-copy", "preparation-copy", "missing-clock", "partial-clock", "runtime", "session"] as const) {
  void test(`predispatch ${changed} refuses before the synthetic writer call`, async (context) => {
    const fixture = await writeFixture(context);
    let input = fixture.writeInput;
    if (changed === "witness-copy") { input = { ...input, witnessResult: structuredClone(fixture.witness) }; }
    if (changed === "preparation-copy") { input = { ...input, preparation: structuredClone(fixture.preparation) }; }
    if (changed === "missing-clock") { await fsPromises.rename(fixture.witness.clockArtifact.path, `${fixture.witness.clockArtifact.path}.retained`); }
    if (changed === "partial-clock") { await writeFile(fixture.witness.clockArtifact.path, "{}\n"); }
    if (changed === "runtime") { fixture.state.generation = "synthetic-different-runtime-0003"; }
    if (changed === "session") { fixture.state.sequence += 1; }
    await assert.rejects(fixture.writer.write(input));
    assert.equal(fixture.writeState.calls, 0); assert.equal(fixture.writer.originalReturn(fixture.journal.operationId), undefined);
    await assert.rejects(fixture.writer.write(fixture.writeInput), /already consumed/u);
  });
}

for (const changed of ["uncertain", "malformed", "scope", "session", "caller-id", "caller-saved", "runtime"] as const) {
  void test(`postdispatch ${changed} retains any settled reply and never grants replay`, async (context) => {
    const fixture = await writeFixture(context), operationId = fixture.journal.operationId;
    fixture.writeState.fail = changed === "uncertain"; fixture.writeState.malformed = changed === "malformed";
    fixture.writeState.after = (): void => {
      if (changed === "scope") { fixture.state.scope = false; }
      if (changed === "session") { fixture.state.sequence += 1; }
      if (changed === "caller-id") { fixture.journal.operationId = "easyeda-20261012t000000z-12345678"; }
      if (changed === "caller-saved") { fixture.journal.saved = true; }
      if (changed === "runtime") { fixture.state.generation = "synthetic-different-runtime-0003"; }
    };
    await assert.rejects(fixture.writer.write(fixture.writeInput)); assert.equal(fixture.writeState.calls, 1);
    if (changed !== "uncertain") { assert.strictEqual(fixture.writer.originalReturn(operationId), fixture.writeState.raw); }
    assert.throws(() => assertOriginalClosedSymbolWrite(fixture.writer.originalReturn(operationId), fixture.engine, operationId), /not the unchanged original|missing/u);
    const retained = await loadClosedSymbolJournal(operationId);
    assert.equal(retained.events.at(-1)?.kind, changed === "uncertain" ? "intent" : "result");
    assert.equal(retained.journal.mutationMayHaveOccurred, true);
    Object.assign(fixture.journal, retained.journal);
    await assert.rejects(fixture.writer.write(fixture.writeInput), /already consumed/u); assert.equal(fixture.writeState.calls, 1);
  });
}

for (const boundary of ["artifact", "journal-before", "journal-after"] as const) {
  void test(`write ${boundary} publication failure retains original reply and quarantine`, async (context) => {
    const fixture = await writeFixture(context), operationId = fixture.journal.operationId;
    const method = boundary === "artifact" ? "link" : "rename", original = fsPromises[method];
    let injected = false;
    const spy = context.mock.method(fsPromises, method, async (...args: Parameters<typeof original>): Promise<void> => {
      const name = basename(String(args[1]));
      const match = fixture.writeState.calls === 1 && name === (boundary === "artifact" ? "22-edit-write-result.json" : `${operationId}.json`);
      if (!injected && match) {
        injected = true;
        if (boundary === "journal-after") { await original(args[0], args[1]); }
        throw new Error("synthetic write evidence publication failure");
      }
      await original(args[0], args[1]);
    });
    syncBuiltinESMExports();
    try { await assert.rejects(fixture.writer.write(fixture.writeInput)); }
    finally { spy.mock.restore(); syncBuiltinESMExports(); }
    assert.equal(injected, true); assert.equal(fixture.writeState.calls, 1);
    assert.strictEqual(fixture.writer.originalReturn(operationId), fixture.writeState.raw);
    assert.throws(() => assertOriginalClosedSymbolWrite(fixture.writeState.raw, fixture.engine, operationId), /not the unchanged original/u);
    if (boundary === "journal-before") { await assert.rejects(loadClosedSymbolJournal(operationId), /Unreferenced/u); }
    else {
      const retained = await loadClosedSymbolJournal(operationId);
      assert.equal(retained.journal.orphanedCallPossible, true); assert.equal(retained.journal.mutationMayHaveOccurred, true);
      assert.equal(retained.events.at(-1)?.kind, boundary === "journal-after" ? "result" : "intent");
    }
    await assert.rejects(fixture.writer.write(fixture.writeInput), /already consumed/u); assert.equal(fixture.writeState.calls, 1);
  });
}
