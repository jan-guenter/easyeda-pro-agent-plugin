import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { ClosedSymbolRelaunchStage } from "../src/closed-symbol-relaunch.ts";
import { copyFixture } from "./helpers/closed-symbol-copy-fixture.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { assertClosedSessionCopyAuthority } from "../src/windows-authority.ts";

async function fixture(): Promise<{
  value: Awaited<ReturnType<typeof copyFixture>>;
  stage: ClosedSymbolRelaunchStage;
  input: { -readonly [Key in keyof Parameters<ClosedSymbolRelaunchStage["launch"]>[0]]: Parameters<ClosedSymbolRelaunchStage["launch"]>[0][Key] };
}> {
  const value = await copyFixture();
  const copied = await value.copyStage.copy(value.journal, "baseline-copy", value.generation, value.proof);
  return { value, stage: new ClosedSymbolRelaunchStage(value.engine, value.runtime), input: {
    journal: value.journal, phase: "edit-launch", proof: value.proof, copy: copied.copy, checkpoint: copied.checkpoint,
  } };
}

void test("concurrent relaunch attempt cannot dispatch twice and prior copy authority becomes obsolete", async () => {
  const { input, stage, value } = await fixture();
  try {
    const first = stage.launch(input);
    await assert.rejects(stage.launch(input), /consumed/u);
    const result = await first;
    assert.equal(value.calls("launch"), 2); assert.equal(result.generation.ordinal, 1);
    assert.equal(result.launch, stage.originalLaunch(value.operationId, "edit-launch"));
    assert.equal(result.executionAuthorized, false); assert.equal(result.admissionProved, false); assert.equal(result.completionProved, false);
    await assert.rejects(assertClosedSessionCopyAuthority(value.proof), /lacks its retained operation/u);
    await assert.rejects(new ClosedSymbolRelaunchStage(value.engine, value.runtime).launch(input), /consumed/u);
    assert.equal(value.calls("launch"), 2);
  } finally { await value.dispose(); }
});

for (const boundary of ["intent", "returned"] as const) {
  for (const mutation of ["caller", "scope", "proof-reference", "copy-reference"] as const) {
    void test(`${mutation} at relaunch ${boundary} preserves correct one-shot journal and settled result`, async (context) => {
      const { input, stage, value } = await fixture(); const link = fsPromises.link; let changed = false;
      const mutate = (): void => {
        changed = true;
        if (mutation === "caller") { input.journal.saved = true; }
        if (mutation === "scope") { value.state.scope = true; }
        if (mutation === "proof-reference") { input.proof = structuredClone(input.proof); }
        if (mutation === "copy-reference") { input.copy = structuredClone(input.copy); }
      };
      if (boundary === "intent") {
        context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
          await link(...args); if (basename(String(args[1])) === "11-edit-launch-intent.json") { mutate(); }
        }); syncBuiltinESMExports();
      } else { value.owner.behavior.afterRequest = (action): void => { if (action === "launch") { mutate(); } }; }
      try {
        await assert.rejects(stage.launch(input), /caller changed|authenticated scope/u); assert.equal(changed, true);
        assert.equal(value.calls("launch"), boundary === "intent" ? 1 : 2);
        assert.equal(stage.originalLaunch(value.operationId, "edit-launch") !== undefined, boundary === "returned");
        const loaded = await loadClosedSymbolJournal(value.operationId);
        assert.equal(loaded.journal.saved, false); assert.equal(loaded.journal.reopened, false);
        assert.equal(loaded.events.at(-1)?.kind, boundary === "intent" ? "intent" : "result");
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
    });
  }
}

for (const boundary of ["artifact", "journal-before", "journal-after"] as const) {
  void test(`relaunch result ${boundary} publication failure retains actual original launch without replay`, async (context) => {
    const { input, stage, value } = await fixture(); const link = fsPromises.link, rename = fsPromises.rename; let updates = 0;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      if (boundary === "artifact" && basename(String(args[1])) === "12-edit-launch-result.json") { throw new Error("Synthetic relaunch publication failed"); }
      await link(...args);
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof rename>): Promise<void> => {
      if (basename(String(args[1])) === `${value.operationId}.json`) { updates += 1; }
      if (updates === 2 && boundary === "journal-before") { throw new Error("Synthetic relaunch publication failed"); }
      await rename(...args);
      if (updates === 2 && boundary === "journal-after") { throw new Error("Synthetic relaunch publication failed"); }
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(stage.launch(input), /publication/u);
      assert.ok(stage.originalLaunch(value.operationId, "edit-launch") !== undefined);
      assert.equal(value.calls("launch"), 2);
      await assert.rejects(stage.launch(input), /consumed/u);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}
for (const mutation of ["caller", "scope", "owner", "original-launch"] as const) {
  void test(`${mutation} drift during final relaunch journal read refuses stale admission`, async (context) => {
    const { input, stage, value } = await fixture();
    const link = fsPromises.link, open = fsPromises.open, status = value.runtime.status.bind(value.runtime);
    let armed = false, changed = false, published = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args); if (basename(String(args[1])) === "12-edit-launch-result.json") { published = true; }
    });
    context.mock.method(value.runtime, "status", (): ReturnType<typeof status> => {
      const actual = status(); if (published) { armed = true; } return actual;
    });
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const file = await open(...args);
      if (armed && !changed && basename(String(args[0])) === `${value.operationId}.json`) {
        changed = true;
        if (mutation === "caller") { input.journal.saved = true; }
        if (mutation === "scope") { value.state.scope = true; }
        if (mutation === "owner") { await value.runtime.release(); }
        if (mutation === "original-launch") { const original = stage.originalLaunch(value.operationId, "edit-launch"); assert.ok(original !== undefined); Reflect.set(original.root, "pid", 999); }
      }
      return file;
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(stage.launch(input), /caller changed|authenticated scope|current owner/u);
      assert.equal(changed, true); assert.equal(value.calls("launch"), 2);
      assert.ok(stage.originalLaunch(value.operationId, "edit-launch") !== undefined);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}
