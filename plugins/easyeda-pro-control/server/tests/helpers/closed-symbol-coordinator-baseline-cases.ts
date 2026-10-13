/* oxlint-disable import/max-dependencies -- Verify actual stage, filesystem and original proof boundaries together. */
import assert from "node:assert/strict";
import fsPromises, { open as openFile, readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";
import { fixture } from "./closed-symbol-coordinator-baseline-fixture.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { assertClosedSessionCopyAuthority } from "../../src/windows-authority.ts";
import { assertIssuedClosedFileCopy } from "../../src/closed-file-copy.ts";
import { isRecord, sha256Text } from "../../src/core.ts";

void test("baseline uses real ten-event stages, one scope, one close and exact issued copy", async (context) => {
  const value = await fixture(context);
  const before = await readFile(value.source);
  const result = await value.stage.recordBaseline(value.plan);
  assert.equal(result.sequence, 10); assert.equal(result.completionProved, false); assert.equal(result.saved, false);
  assertIssuedClosedFileCopy(result.copy.copy);
  const retained = value.stage.retained(); assert.ok(isRecord(retained["originals"]));
  const proof = retained["originals"]["proof"]; assert.equal(await assertClosedSessionCopyAuthority(proof), proof);
  assert.equal(retained["originals"]["copy"], result.copy);
  assert.deepEqual(await readFile(value.source), before);
  const journal = await loadClosedSymbolJournal(result.operationId);
  assert.equal(journal.events.length, 10); assert.equal(journal.journal.saved, false); assert.equal(journal.journal.reopened, false);
  assert.equal(value.events.filter((event) => event === "launch").length, 1);
  assert.equal(value.events.filter((event) => event === "normal-close").length, 1);
  assert.ok(value.events.indexOf("scope-exit") < value.events.indexOf("windows"));
  assert.ok(value.events.indexOf("windows") < value.events.indexOf("normal-close"));
  assert.equal(value.events.filter((event) => event === "startup").length, 1);
  assert.equal(value.browser.state.calls.filter((call) => call.kind === "put").length, 1);
  const restarted = await value.stage.inspectRestart(); assert.equal(restarted["authorityRestored"], false);
  await assert.rejects(value.stage.recordBaseline(value.plan), /consumed/u);
  await assert.rejects(new ClosedSymbolCoordinator(value.engine, value.upstream, value.runtime, value.ui, value.machine, value.identity).recordBaseline(value.plan), /consumed/u);
});

for (const failure of ["startup", "settled-startup", "scope", "window", "close", "proof"] as const) {
  void test(`${failure} refusal retains prior success and never automatically closes or launches again`, async (context) => {
    const value = await fixture(context);
    if (failure === "startup") { value.state.startupFailure = true; }
    if (failure === "settled-startup") { value.browser.registrations.value = [{}]; }
    if (failure === "scope") { value.state.scopeFailure = true; }
    if (failure === "window") { value.state.windows = []; }
    if (failure === "close") { value.owner.behavior.errorAction = "normal-close"; }
    if (failure === "proof") { value.owner.behavior.termination["jobEmpty"] = false; }
    await assert.rejects(value.stage.recordBaseline(value.plan));
    const retained = value.stage.retained(); assert.ok(isRecord(retained["originals"])); assert.ok(retained["originals"]["launch"] !== undefined);
    const operationId = retained["operationId"]; assert.equal(typeof operationId, "string"); assert.ok(typeof operationId === "string");
    const journal = await loadClosedSymbolJournal(operationId);
    assert.ok(journal.journal.sequence < 10);
    assert.equal(value.events.filter((event) => event === "launch").length, 1);
    assert.equal(value.owner.requests.filter((request) => request["action"] === "normal-close").length, Number(failure === "close" || failure === "proof"));
    assert.equal(retained["copyReceipt"], undefined);
    await assert.rejects(value.stage.recordBaseline(value.plan), /consumed/u);
    if (failure === "proof") {
      assert.ok(retained["originals"]["close"] !== undefined);
      value.owner.behavior.termination["jobEmpty"] = true;
      const proof = await value.stage.inspectRetainedBaselineExit(); assert.equal(proof.jobEmpty, true);
      assert.equal(value.owner.requests.filter((request) => request["action"] === "normal-close").length, 1);
      const after = await loadClosedSymbolJournal(operationId); assert.equal(after.journal.sequence, 8);
      assert.equal(value.stage.retained()["copyReceipt"], undefined);
    }
  });
}

void test("preexisting authenticated session refuses before launch", async (context) => {
  const value = await fixture(context); value.state.preexisting = true;
  await assert.rejects(value.stage.recordBaseline(value.plan), /previous authenticated/u);
  assert.equal(value.events.includes("launch"), false); assert.equal(value.events.includes("scope-enter"), false);
});

void test("delayed authentication waits for two coherent observations without another launch", async (context) => {
  const value = await fixture(context); value.state.authAfter = 4;
  await value.stage.recordBaseline(value.plan);
  assert.ok(value.state.authReads >= 5); assert.equal(value.events.filter((event) => event === "launch").length, 1);
});

for (const failure of ["timeout", "session-change", "session-disappears", "caller-change"] as const) {
  void test(`authentication ${failure} stops before scope entry and preserves the launch`, async (context) => {
    const value = await fixture(context);
    if (failure === "timeout") {
      value.state.authAfter = 1000;
      const now = performance.now.bind(performance); let calls = 0;
      context.mock.method(performance, "now", (): number => { const offset = calls > 0 ? 70_000 : 0; calls += 1; return now() + offset; });
    }
    value.state.onAuth = (): void => {
      if (value.state.authReads !== 2) { return; }
      if (failure === "session-change") { value.state.sessionSequence += 1; }
      if (failure === "session-disappears") { value.state.authAfter = 1000; }
      if (failure === "caller-change") { value.plan["targetUuid"] = "0".repeat(32); }
    };
    await assert.rejects(value.stage.recordBaseline(value.plan));
    assert.equal(value.events.includes("scope-enter"), false); assert.equal(value.events.includes("normal-close"), false);
    assert.equal(value.events.filter((event) => event === "launch").length, 1);
    assert.equal(value.stage.retained()["lastSuccessfulStage"], "baseline-launch");
  });
}

void test("concurrent coordinator refuses while the original call owns the engine", async (context) => {
  const value = await fixture(context);
  const entered = Promise.withResolvers<null>(), gate = Promise.withResolvers<null>();
  value.state.onStartup = async (): Promise<void> => { entered.resolve(null); await gate.promise; };
  const pending = value.stage.recordBaseline(value.plan); await entered.promise;
  await assert.rejects(new ClosedSymbolCoordinator(value.engine, value.upstream, value.runtime, value.ui, value.machine, value.identity).recordBaseline(value.plan), /active|consumed/u);
  gate.resolve(null); await pending;
  assert.equal(value.events.filter((event) => event === "launch").length, 1);
});

void test("lost helper after successful close leaves the close acknowledgement and no copy grant", async (context) => {
  const value = await fixture(context);
  const original = value.owner.behavior.afterRequest;
  value.owner.behavior.afterRequest = (action): void => {
    original?.(action);
    if (action === "prove-terminated") { value.owner.behavior.helperLost = true; }
  };
  await assert.rejects(value.stage.recordBaseline(value.plan));
  assert.equal(value.events.filter((event) => event === "normal-close").length, 1);
  assert.equal(value.stage.retained()["copyReceipt"], undefined);
});

void test("retained fingerprint artifact contains the full bound expected fingerprint", async (context) => {
  const value = await fixture(context); value.state.startupFailure = true;
  await assert.rejects(value.stage.recordBaseline(value.plan));
  const artifact = value.stage.retained()["fingerprintArtifact"]; assert.ok(isRecord(artifact));
  assert.equal(typeof artifact["path"], "string"); assert.ok(typeof artifact["path"] === "string");
  const file = await openFile(artifact["path"], "r");
  try { const bytes = await file.readFile(); assert.equal(sha256Text(bytes.toString("utf8")), artifact["sha256"]); assert.deepEqual(JSON.parse(bytes.toString("utf8")), value.identity); }
  finally { await file.close(); }
});

for (const phase of ["02-baseline-launch-result.json", "06-baseline-marker-create-result.json", "10-baseline-copy-result.json"] as const) {
  void test(`${phase} publication failure retains earlier success without advancing`, async (context) => {
    const value = await fixture(context);
    const link = fsPromises.link;
    let refused = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      if (basename(String(args[1])) === phase) { refused = true; throw new Error("synthetic publication failure"); }
      await link(...args);
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(value.stage.recordBaseline(value.plan), /publication/u); assert.equal(refused, true);
      const retained = value.stage.retained(); assert.ok(isRecord(retained["originals"]));
      assert.equal(value.events.filter((event) => event === "launch").length, 1);
      if (phase.startsWith("02")) {
        assert.equal(retained["originals"]["launch"], undefined);
        assert.ok(retained["launchReceipt"] !== undefined);
        assert.equal(value.runtime.status().state, "owned");
        assert.equal(value.events.includes("scope-enter"), false);
      } else {
        assert.ok(retained["originals"]["launch"] !== undefined);
        assert.ok(retained["admissionCapture"] !== undefined);
        assert.ok(retained["startupRaw"] !== undefined);
      }
      if (phase.startsWith("10")) {
        assert.ok(retained["originals"]["proof"] !== undefined);
        assert.ok(retained["copyReceipt"] !== undefined);
        assert.equal(retained["originals"]["copy"], undefined);
        assert.equal(value.events.filter((event) => event === "normal-close").length, 1);
      } else { assert.equal(value.events.includes("normal-close"), false); }
      await assert.rejects(value.stage.recordBaseline(value.plan), /consumed/u);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  });
}

const applicationWindow = { handle: "12345", pid: 100, owner: "0", className: "Chrome_WidgetWin_1", minimized: false, title: "Synthetic", bounds: [0, 0, 1384, 736] };
for (const rows of [
  [applicationWindow, { ...applicationWindow, handle: "54321" }],
  [{ ...applicationWindow, handle: "0" }],
  [{ ...applicationWindow, pid: 101 }],
]) {
  void test(`owned-window selection refuses candidate rows ${JSON.stringify(rows)}`, async (context) => {
    const value = await fixture(context); value.state.windows = rows;
    await assert.rejects(value.stage.recordBaseline(value.plan), /window is ambiguous/u);
    assert.ok(value.stage.retained()["windowArtifact"] !== undefined);
    assert.equal(value.events.includes("normal-close"), false);
  });
}

void test("caller mutation during owned-window observation never reaches normal close", async (context) => {
  const value = await fixture(context);
  value.state.onUi = (): void => { value.plan["ownerUuid"] = "0".repeat(32); };
  await assert.rejects(value.stage.recordBaseline(value.plan), /caller plan changed/u);
  assert.equal(value.events.includes("normal-close"), false);
});

void test("invalid expected fingerprint binding refuses before gateway or native launch", async (context) => {
  const value = await fixture(context); value.plan["expectedFingerprintSha256"] = "0".repeat(64);
  await assert.rejects(value.stage.recordBaseline(value.plan), /fingerprint differs/u);
  assert.equal(value.events.includes("connect"), false); assert.equal(value.events.includes("launch"), false);
});
