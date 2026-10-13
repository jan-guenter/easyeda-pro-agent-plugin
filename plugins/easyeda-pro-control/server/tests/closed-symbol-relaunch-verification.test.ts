import assert from "node:assert/strict";
import { test } from "node:test";
import { ClosedSymbolRelaunchStage } from "../src/closed-symbol-relaunch.ts";
import { copyFixture } from "./helpers/closed-symbol-copy-fixture.ts";
import { ClosedSymbolAdmissionStage } from "../src/closed-symbol-admission.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import type { Generation } from "../src/closed-symbol-journal.ts";
import { assertClosedSessionCopyAuthority } from "../src/windows-authority.ts";

type Input = Parameters<ClosedSymbolRelaunchStage["launch"]>[0];
async function prepareVerification(): Promise<{
  value: Awaited<ReturnType<typeof copyFixture>>; stage: ClosedSymbolRelaunchStage; input: Input; edit: Generation;
}> {
  const value = await copyFixture();
  try {
    const baselineCopy = await value.copyStage.copy(value.journal, "baseline-copy", value.generation, value.proof);
    const stage = new ClosedSymbolRelaunchStage(value.engine, value.runtime);
    await stage.launch({ journal: value.journal, phase: "edit-launch", proof: value.proof,
      copy: baselineCopy.copy, checkpoint: baselineCopy.checkpoint });
    // A fresh synthetic authenticated generation, not a fabricated admission receipt.
    // Actual maintained admission captures and verifies it through the real runtime.
    value.upstream.callTool = (name): ReturnType<typeof value.upstream.callTool> => {
      assert.equal(name, "easyeda_execute"); value.state.runtimeReads += 1;
      return Promise.resolve({ content: [{ type: "text", text: JSON.stringify({ kind: "runtime-identity",
        generation: "synthetic-runtime-generation-0002", timeOrigin: 2000, processId: 101 }) }] });
    };
    value.upstream.bridgeSessionLifecycle = (): ReturnType<typeof value.upstream.bridgeSessionLifecycle> => ({
      schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43),
      activeSession: { sessionId: "t".repeat(43), sequence: 2, authenticationReceiptSha256: "3".repeat(64), authenticatedAtEpochMs: 2000 },
      publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [],
    });
    value.upstream.currentAuthenticatedBridgeDispatchBinding = (): ReturnType<NonNullable<typeof value.upstream.currentAuthenticatedBridgeDispatchBinding>> => value.state.scope ? {
      schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "t".repeat(43), sessionSequence: 2,
      begunAtEpochMs: 2001, leaseId: "m".repeat(43), bindingReceipt: "c".repeat(43),
    } : undefined;
    value.state.scope = true;
    const admission = await new ClosedSymbolAdmissionStage(value.engine, value.runtime).admit(value.journal, "edit-admission");
    assert.equal(admission.generation.ordinal, 1);
    assert.notEqual(admission.generation.sessionSha256, value.generation.sessionSha256);
    assert.notEqual(admission.generation.runtimeSha256, value.generation.runtimeSha256);
    assert.equal(admission.capture.bridgeSession.sequence, 2);
    assert.equal(admission.capture.runtimeIdentity.generation, "synthetic-runtime-generation-0002");
    // Launch-only test prerequisites. These do NOT claim actual cache access,
    // Project navigation, metadata write, witness qualification or SQL acceptance.
    for (const step of ["edit-marker-read", "edit-open", "edit-witness", "edit-write"] as const) {
      for (const kind of ["intent", "result"] as const) {
        await appendClosedSymbolEvent(value.journal, { step, kind, generation: admission.generation,
          requestSha256: "a".repeat(64), data: { synthetic: `launch-only ${step} prerequisite; no operation executed` } });
      }
    }
    value.state.scope = false;
    const closed = await value.stage.close({ journal: value.journal, phase: "edit-close", generation: admission.generation,
      capture: admission.capture, windowHandle: "12345" });
    const proof = await value.stage.prove(closed);
    const copied = await value.copyStage.copy(value.journal, "edit-copy", admission.generation, proof);
    for (const kind of ["intent", "result"] as const) {
      await appendClosedSymbolEvent(value.journal, { step: "edit-sql-compare", kind, generation: admission.generation,
        requestSha256: "a".repeat(64), data: { synthetic: "launch-only SQL prerequisite; not metadata effect acceptance" } });
    }
    assert.equal(value.calls("launch"), 2); assert.equal(value.calls("normal-close"), 2); assert.equal(value.calls("prove-terminated"), 2);
    return { value, stage, edit: admission.generation, input: { journal: value.journal, phase: "verify-launch", proof, copy: copied.copy, checkpoint: copied.checkpoint } };
  } catch (error) { await value.dispose(); throw error; }
}

void test("genuine edit admission/close/copy reaches distinct ordinal2 launch without restoring edit copy authority", async () => {
  const { edit, input, stage, value } = await prepareVerification();
  try {
    const result = await stage.launch(input);
    assert.equal(result.generation.ordinal, 2);
    assert.notEqual(result.generation.jobId, edit.jobId); assert.notEqual(result.generation.jobId, value.generation.jobId);
    assert.notEqual(result.generation.rootStartIdentity, edit.rootStartIdentity);
    assert.equal(value.calls("launch"), 3); assert.equal(value.calls("normal-close"), 2);
    await assert.rejects(assertClosedSessionCopyAuthority(input.proof), /lacks its retained operation/u);
    assert.equal(result.launch, stage.originalLaunch(value.operationId, "verify-launch"));
    assert.equal(result.executionAuthorized, false); assert.equal(result.admissionProved, false); assert.equal(result.completionProved, false);
    const loaded = await loadClosedSymbolJournal(value.operationId);
    assert.equal(loaded.events.length, 30); assert.equal(loaded.events.at(-1)?.step, "verify-launch");
    assert.equal(loaded.events.at(-1)?.kind, "result"); assert.equal(loaded.journal.saved, false); assert.equal(loaded.journal.reopened, false);
    await assert.rejects(stage.launch(input), /consumed/u); assert.equal(value.calls("launch"), 3);
  } finally { await value.dispose(); }
});

void test("original baseline proof cannot authorize verify-launch after genuine edit close/copy", async () => {
  const { input, stage, value } = await prepareVerification();
  try {
    await assert.rejects(stage.launch({ ...input, proof: value.proof }), /copy intent differs/u);
    assert.equal(value.calls("launch"), 2); assert.equal(stage.originalLaunch(value.operationId, "verify-launch"), undefined);
    const loaded = await loadClosedSymbolJournal(value.operationId);
    assert.equal(loaded.events.length, 28); assert.equal(loaded.events.at(-1)?.step, "edit-sql-compare");
    await assert.rejects(stage.launch(input), /consumed/u); assert.equal(value.calls("launch"), 2);
  } finally { await value.dispose(); }
});
