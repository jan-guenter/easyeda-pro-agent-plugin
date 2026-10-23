/** Synthetic original-callback choreography. No Windows process, EasyEDA
 * admission or connected project opening is supplied by these comparisons. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import type { CurrentDisposableOpenSealedTarget } from "../src/current-disposable-open.ts";
import type { CurrentPcbWorkerStartupOpeningBinding } from "../src/current-pcb-diagnostic-owner.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticOpeningPhase } from "../src/current-pcb-diagnostic-opening.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "../src/current-pcb-worker-startup-contract.ts";
import { CurrentPcbWorkerStartupOpening } from "../src/current-pcb-worker-startup-opening.ts";

const rawWindowsPath = String.raw`C:\disposable\startup.eprj2`;
const target: CurrentDisposableOpenSealedTarget = Object.freeze({ rawWindowsPath,
  projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
  branchUuid: "a".repeat(32), documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) });
function reply(phase: CurrentPcbDiagnosticOpeningPhase, refused: boolean, windowTabId = "window"): unknown {
  const dispatched = phase === "open-project";
  let status = dispatched ? "opened-prefix-observed" : "ready";
  if (refused) { status = "refused"; }
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-opening.v1",
    phase, projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    ok: !refused, status,
    failure: refused ? { stage: "dispatch", code: "GUARD" } : null,
    cleanupFailure: null, dispatchAttempted: dispatched, publicResult: dispatched && !refused ? true : null,
    prefixObserved: dispatched && !refused, nativeWorkMayRemain: dispatched,
    observation: refused ? null : { projectPresent: dispatched, branchUuid: dispatched ? target.branchUuid : null, windowTabId, containerCount: 1,
      tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA - V3.2.84", expectedOpenedTitle: "EasyEDA - V3.2.84",
      documentTitle: "EasyEDA - V3.2.84" } }) } };
}
function fixture(preflightRefused = false, openedWindow?: string): Readonly<{
  coordinator: CurrentPcbWorkerStartupOpening;
  calls: string[];
  state: { terminated: boolean; unsubscribed: boolean };
}> {
  const calls: string[] = [], state = { terminated: false, unsubscribed: false };
  const opening: CurrentPcbWorkerStartupOpeningBinding = Object.freeze({
    context: () => ({ sessionId: "parent-session", uniqueContextId: "original-context" }),
    reprove: (): Promise<void> => Promise.resolve(),
    begin: (selected: CurrentDisposableOpenSealedTarget, title: Readonly<{ initialTitle: string; expectedOpenedTitle: string }>) => {
      assert.deepEqual(selected, target); assert.equal(title.initialTitle, title.expectedOpenedTitle); calls.push("begin");
      return { sessionId: "parent-session", uniqueContextId: "original-context" };
    },
    finish: (): void => { calls.push("finish"); },
    observeParent: (): void => { calls.push("parent-proof"); },
    ancillaryFrame: (): null => null,
    observeAncillary: (): void => { assert.fail("No ancillary frame was observed"); },
    ancillaryObservation: (): null => null,
  });
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentSessionId: "parent-session", parentTargetId: "parent-target",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(),
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.terminated, true); return Promise.resolve(); },
    subscribe: (): (() => void) => {
      calls.push("subscribe"); return (): void => { state.unsubscribed = true; };
    },
    request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => {
      if (command.method === "Runtime.callFunctionOn" && "uniqueContextId" in command.params &&
          command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION && command.params.arguments.length === 2) {
        const phase = command.params.arguments[1].value; calls.push(phase);
        const refused = phase === "open-project" ? openedWindow === undefined : preflightRefused;
        return Promise.resolve(reply(phase, refused, phase === "open-project" ? openedWindow : undefined));
      }
      calls.push(command.method); return Promise.resolve({});
    },
  });
  return { coordinator: new CurrentPcbWorkerStartupOpening({ dependency, opening }), calls, state };
}

void test("startup opener refuses preflight before checkpoint callback or auto-attach and consumes the attempt", async () => {
  const value = fixture(true); let checkpoints = 0;
  const reverify = (): Promise<void> => { checkpoints += 1; return Promise.resolve(); };
  await assert.rejects(value.coordinator.open(target, reverify), /PREFLIGHT_REFUSED/u);
  assert.equal(checkpoints, 0); assert.equal(value.calls.includes("Target.setAutoAttach"), false);
  assert.equal(value.calls.includes("begin"), false); assert.equal(value.coordinator.status().openingAttempted, false);
  assert.equal(value.coordinator.retainedOpeningResult()?.ok, false);
  await assert.rejects(value.coordinator.open(target, reverify), /CONSUMED/u);
  await assert.rejects(value.coordinator.releaseAfterTermination());
  value.state.terminated = true; await value.coordinator.releaseAfterTermination();
  assert.equal(value.state.unsubscribed, false);
  await assert.rejects(value.coordinator.releaseAfterTermination(), /RELEASE_STATE/u);
});

void test("startup opener requires its original checkpoint callback before arming any worker", async () => {
  const value = fixture();
  await assert.rejects(value.coordinator.open(target, (): Promise<void> => Promise.reject(new Error("Checkpoint changed"))), /Checkpoint changed/u);
  assert.equal(value.calls.filter(call => call === "preflight").length, 1);
  assert.equal(value.calls.includes("Target.setAutoAttach"), false); assert.equal(value.calls.includes("open-project"), false);
  assert.equal(value.coordinator.status().settled, true);
});

void test("startup opener arms capture before its one dispatch and retains refused opening through original termination", async () => {
  const value = fixture();
  await assert.rejects(value.coordinator.open(target, (): Promise<void> => { value.calls.push("checkpoint"); return Promise.resolve(); }), /OPEN_REFUSED/u);
  const calls = value.calls;
  assert.ok(calls.indexOf("preflight") < calls.indexOf("checkpoint"));
  assert.ok(calls.indexOf("checkpoint") < calls.indexOf("subscribe"));
  assert.ok(calls.indexOf("subscribe") < calls.indexOf("Target.setAutoAttach"));
  assert.ok(calls.indexOf("Target.setAutoAttach") < calls.indexOf("begin"));
  assert.ok(calls.indexOf("begin") < calls.indexOf("open-project"));
  assert.equal(calls.filter(call => call === "open-project").length, 1); assert.equal(calls.includes("finish"), false);
  assert.equal(value.coordinator.retainedOpeningResult()?.nativeWorkMayRemain, true);
  assert.equal(value.coordinator.status().completed, false); assert.equal(value.state.unsubscribed, false);
  await assert.rejects(value.coordinator.releaseAfterTermination()); assert.equal(value.state.unsubscribed, false);
  value.state.terminated = true; await value.coordinator.releaseAfterTermination(); assert.equal(value.state.unsubscribed, true);
});

void test("startup opener rejects changed UI window identity without accepting a construction packet", async () => {
  const value = fixture(false, "foreign-window");
  await assert.rejects(value.coordinator.open(target, (): Promise<void> => Promise.resolve()), /OPEN_REFUSED/u);
  assert.equal(value.coordinator.retainedOpeningResult()?.ok, true);
  assert.equal(value.coordinator.retainedOpeningResult()?.observation?.windowTabId, "foreign-window");
  assert.equal(value.coordinator.status().completed, false); assert.equal(value.calls.includes("finish"), false);
  value.state.terminated = true; await value.coordinator.releaseAfterTermination();
});
