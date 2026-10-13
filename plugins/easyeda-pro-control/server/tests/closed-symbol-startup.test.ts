import assert from "node:assert/strict";
import { createSyntheticCompletedPeer } from "./helpers/synthetic-journal-retirement.ts";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { operationPath } from "../src/artifacts.ts";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { appendClosedSymbolEvent, inspectClosedSymbolRestart, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { ClosedSymbolStartupStage } from "../src/closed-symbol-startup.ts";
import { prepared } from "./helpers/closed-symbol-startup-fixture.ts";

for (const phase of ["baseline-marker-create", "edit-marker-read", "verify-marker-read"] as const) {
  void test(`${phase}: actual guarded dispatch records intent and settled return before release`, async () => {
    const { value, browser, stage, calls } = await prepared(phase);
    try {
      const before = value.journal.sequence, captures = value.captures();
      assert.equal(stage.originalReturn(value.operationId, phase), undefined);
      const result = await stage.observe(value.journal, phase);
      assert.equal(stage.originalReturn(value.operationId, phase), calls.returned);
      assert.equal(calls.count, 1); assert.equal(value.captures(), captures + 1);
      assert.equal(value.journal.sequence, before + 2); assert.equal(value.journal.orphanedCallPossible, false);
      for (const field of ["executionAuthorized", "startupQualified", "completionProved", "saved", "reopened"]) { assert.equal(result[field], false); }
      const retained = await loadClosedSymbolJournal(value.operationId); const event = retained.events.at(-1);
      assert.equal(event?.kind, "result"); assert.equal(event.step, phase);
      assert.equal(canonicalJson(retained.journal), canonicalJson(value.journal));
      assert.ok(event.data !== null && typeof event.data === "object" && !Array.isArray(event.data)); assert.ok("rawReturn" in event.data);
      assert.equal(browser.state.calls.filter((entry) => entry.kind === "put").length, Number(phase === "baseline-marker-create"));
      for (const candidate of [stage, new ClosedSymbolStartupStage(value.engine, value.runtime, value.stage)]) {
        await assert.rejects(candidate.observe(value.journal, phase), /consumed/u);
      }
      assert.equal(calls.count, 1);
    } finally { await value.dispose(); }
  });
}

for (const failure of ["service-worker", "queue", "marker-put", "missing-marker"] as const) {
  void test(`${failure}: settled failure remains durable and cannot be retried`, async () => {
    const phase = failure === "missing-marker" ? "edit-marker-read" : "baseline-marker-create";
    const { value, browser, stage, calls } = await prepared(phase);
    try {
      if (failure === "service-worker") { browser.registrations.value = [{}]; }
      else if (failure === "queue") { browser.rpc.value = { message: true }; }
      else if (failure === "missing-marker") { browser.state.exists = false; }
      else { browser.state.onCall = (call): void => { if (call.kind === "put") { throw new Error("ambiguous synthetic put"); } }; }
      await assert.rejects(stage.observe(value.journal, phase), /never replay|reported failure/u);
      const retained = await loadClosedSymbolJournal(value.operationId);
      assert.equal(retained.events.at(-1)?.kind, "result"); assert.equal(retained.journal.orphanedCallPossible, false);
      assert.equal(calls.count, 1); assert.equal(retained.journal.saved, false);
      await assert.rejects(stage.observe(value.journal, phase), /consumed/u);
      assert.equal(browser.state.calls.filter((entry) => entry.kind === "put").length, Number(failure === "marker-put"));
    } finally { await value.dispose(); }
  });
}

void test("settled raw return survives actual native capture-release failure", async () => {
  const { value, stage, calls } = await prepared();
  try {
    calls.after = (): void => { value.owner.behavior.errorAction = "release-capture"; };
    await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /synthetic helper request refused/u);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.events.at(-1)?.kind, "result"); assert.equal(retained.journal.orphanedCallPossible, false);
    assert.equal(calls.count, 1); await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /consumed/u);
  } finally { await value.dispose(); }
});

void test("uncertain transport leaves intent and quarantine without a made-up settled result", async () => {
  const { value, stage, calls } = await prepared();
  try {
    calls.failed = true; await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /uncertain/u);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.events.at(-1)?.kind, "intent"); assert.equal(retained.journal.orphanedCallPossible, true);
    assert.equal(stage.originalReturn(value.operationId, "baseline-marker-create"), undefined);
    assert.equal(calls.count, 1); const inspected = await inspectClosedSymbolRestart(value.operationId); assert.equal(inspected["authorityRestored"], false);
    await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /consumed/u);
  } finally { await value.dispose(); }
});

for (const timing of ["before-dispatch", "after-return"] as const) {
  for (const change of ["session", "scope", "scope-observer", "runtime"] as const) {
    void test(`${timing} ${change} drift never yields successful startup`, async () => {
      const { value, stage, calls } = await prepared();
      try {
        const mutate = (): void => {
          if (change === "session") { value.state.sequence += 1; }
          else if (change === "scope") { value.state.scope = false; }
          else if (change === "scope-observer") { value.upstream.currentAuthenticatedBridgeDispatchBinding = (): undefined => undefined; }
          else { value.state.generation = "synthetic-runtime-drift"; }
        };
        if (timing === "before-dispatch") { value.state.afterRead = (count): void => { if (count === 4) { mutate(); } }; }
        else { calls.after = mutate; }
        await assert.rejects(stage.observe(value.journal, "baseline-marker-create"));
        assert.equal(calls.count, Number(timing === "after-return"));
        const retained = await loadClosedSymbolJournal(value.operationId);
        assert.equal(retained.events.at(-1)?.kind, timing === "after-return" ? "result" : "intent");
        assert.equal(stage.originalReturn(value.operationId, "baseline-marker-create"), calls.returned);
      } finally { await value.dispose(); }
    });
  }
}

for (const timing of ["capture", "return"] as const) {
  for (const change of ["operationId", "saved", "plan"] as const) {
    void test(`${timing} caller ${change} mutation cannot redirect private working journal or corrupt peer`, async () => {
      const { value, stage, calls } = await prepared(), peer = await createSyntheticCompletedPeer();
      try {
        const peerBefore = await readFile(operationPath(peer.operationId));
        const mutate = (): void => {
          if (change === "operationId") { value.journal.operationId = peer.operationId; }
          else if (change === "saved") { value.journal.saved = true; }
          else { value.journal.plan = { ...value.journal.plan, ownerUuid: "f".repeat(32) }; }
        };
        if (timing === "capture") { value.state.afterRead = (count): void => { if (count === 4) { mutate(); } }; }
        else { calls.after = mutate; }
        await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /caller journal changed/u);
        assert.deepEqual(await readFile(operationPath(peer.operationId)), peerBefore);
        const retained = await loadClosedSymbolJournal(value.operationId);
        assert.equal(retained.journal.saved, false); assert.equal(retained.journal.plan.ownerUuid, "e".repeat(32));
        assert.equal(retained.events.at(-1)?.kind, timing === "return" ? "result" : "intent");
        assert.equal(calls.count, Number(timing === "return"));
      } finally { await value.dispose(); }
    });
  }
}

void test("final runtime await concurrent durable advance refuses stale success and preserves next event", async () => {
  const { value, stage, calls } = await prepared();
  try {
    value.state.afterRead = async (count): Promise<void> => {
      if (count !== 7) { return; }
      const retained = await loadClosedSymbolJournal(value.operationId); const generation = retained.events.at(-1)?.generation;
      assert.ok(generation !== null && generation !== undefined);
      await appendClosedSymbolEvent(retained.journal, { step: "baseline-close", kind: "intent", generation, requestSha256: sha256Json({ synthetic: "concurrent" }), data: { syntheticOnly: true } });
    };
    await assert.rejects(stage.observe(value.journal, "baseline-marker-create"), /durable journal changed/u);
    const retained = await loadClosedSymbolJournal(value.operationId);
    assert.equal(retained.events.at(-1)?.step, "baseline-close"); assert.equal(retained.events.at(-1)?.kind, "intent");
    assert.equal(value.journal.sequence, 4); assert.equal(calls.count, 1);
  } finally { await value.dispose(); }
});
