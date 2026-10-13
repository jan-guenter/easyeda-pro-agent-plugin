import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { closeFixture } from "./helpers/closed-symbol-pending-close-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";

void test("actual runtime and close stage poll pending then ready without another close", async (context) => {
  const f = await closeFixture(context), result = await f.stage.close(f.input);
  f.owner.state.code = "authority-prior-job-not-empty"; f.owner.state.remaining = 2;
  const first = await f.stage.probe(result), second = await f.stage.probe(result);
  assert.equal(first.status, "pending"); assert.equal(second.status, "pending");
  const ready = await f.stage.probe(result); assert.equal(ready.status, "terminated");
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 3);
  const journal = await loadClosedSymbolJournal(f.operationId); assert.equal(journal.journal.sequence, 8);
});

for (const drift of ["scope", "result", "released", "runtime-method"] as const) {
  void test(`pending close stage refuses late ${drift} after its final journal read`, async (context) => {
    const f = await closeFixture(context), result = await f.stage.close(f.input);
    f.owner.state.code = "authority-prior-job-not-empty";
    let changed = false, reads = 0, release: Promise<void> | undefined;
    const open = fsPromises.open, status = f.runtime.status.bind(f.runtime);
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const handle = await open(...args);
      if (basename(String(args[0])) === `${f.operationId}.json`) {
        reads += 1;
        if (reads === 2) {
          changed = true;
          if (drift === "scope") { f.state.scope = true; }
          if (drift === "result") { Object.assign(result.generation, { rootPid: 999 }); }
          if (drift === "released") { release = f.runtime.release(); }
          if (drift === "runtime-method") { context.mock.method(f.runtime, "status", (): ReturnType<typeof f.runtime.status> => ({ ...status(), state: "released" })); }
        }
      }
      return handle;
    }); syncBuiltinESMExports();
    try { await assert.rejects(f.stage.probe(result)); assert.equal(changed, true); await release; }
    finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
    assert.equal(f.calls("normal-close"), 1);
  });
}

void test("journal advance during native pending response refuses after the actual durable reread", async (context) => {
  const f = await closeFixture(context), result = await f.stage.close(f.input);
  f.owner.state.code = "authority-prior-job-not-empty";
  let advanced = false;
  const probe = f.runtime.probeClosedSessionTermination.bind(f.runtime);
  context.mock.method(f.runtime, "probeClosedSessionTermination", async (...args: Parameters<typeof probe>): ReturnType<typeof probe> => {
    const observation = await probe(...args);
    const loaded = await loadClosedSymbolJournal(f.operationId);
    await appendClosedSymbolEvent(loaded.journal, { step: "baseline-copy", kind: "intent", generation: f.generation,
      requestSha256: "a".repeat(64), data: { synthetic: "journal advance, no copy or proof" } });
    advanced = true; return observation;
  });
  await assert.rejects(f.stage.probe(result), /journal advanced/u); assert.equal(advanced, true);
  assert.equal(f.calls("normal-close"), 1);
});

for (const drift of ["capture", "capture-release"] as const) {
  void test(`final pending journal read cannot return a stale ${drift} epoch`, async (context) => {
    const f = await closeFixture(context), result = await f.stage.close(f.input);
    f.owner.state.code = "authority-prior-job-not-empty";
    const open = fsPromises.open; let changed = false, reads = 0;
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const handle = await open(...args);
      if (basename(String(args[0])) === `${f.operationId}.json`) {
        reads += 1;
        if (reads === 2) {
          changed = true;
          await (drift === "capture" ? f.owner.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 2 }) :
            f.owner.supervisor.releaseCapture(f.capture.executionAuthority));
        }
      }
      return handle;
    }); syncBuiltinESMExports();
    try { await assert.rejects(f.stage.probe(result)); assert.equal(changed, true); }
    finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
    assert.equal(f.calls("normal-close"), 1);
  });
}

void test("close stage rejects cloned results and concurrent probes without another dispatch", async (context) => {
  const f = await closeFixture(context), result = await f.stage.close(f.input);
  f.owner.state.code = "authority-prior-job-not-empty";
  await assert.rejects(f.stage.probe(structuredClone(result)), /original/u);
  const first = f.stage.probe(result);
  await assert.rejects(f.stage.probe(result), /original/u);
  const pending = await first; assert.equal(pending.status, "pending");
  assert.equal(f.calls("clocked-prove-terminated"), 1); assert.equal(f.calls("normal-close"), 1);
});
