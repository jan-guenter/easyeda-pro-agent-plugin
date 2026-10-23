/** Synthetic callback failures only. No native process or project is opened. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import type { CurrentDisposableOpenSealedTarget } from "../src/current-disposable-open.ts";
import type { CurrentPcbWorkerStartupOpeningBinding } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "../src/current-pcb-worker-startup-contract.ts";
import { CurrentPcbWorkerStartupOpening } from "../src/current-pcb-worker-startup-opening.ts";

const rawWindowsPath = String.raw`C:\disposable\startup-diagnostics.eprj2`;
const target: CurrentDisposableOpenSealedTarget = Object.freeze({ rawWindowsPath,
  projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
  branchUuid: "a".repeat(32), documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) });
function reject(): never { throw new Error("private fixture path/source must not be copied"); }
function fixture(failed: "opening-owner" | "native-owner" | "targets" | "frames" | "preflight" | "targets-deadline"): Readonly<{
  opening: CurrentPcbWorkerStartupOpening; sent: string[];
}> {
  const sent: string[] = [];
  const binding: CurrentPcbWorkerStartupOpeningBinding = Object.freeze({
    context: () => ({ sessionId: "parent-session", uniqueContextId: "original-context" }),
    reprove: (): Promise<void> => { if (failed === "opening-owner") { reject(); } return Promise.resolve(); },
    begin: (): never => assert.fail("No opening is permitted after the injected failure"),
    finish: (): never => assert.fail("No opening is permitted after the injected failure"),
    observeParent: (): void => undefined,
    ancillaryFrame: (): null => null,
    observeAncillary: (): never => assert.fail("No ancillary frame was observed"),
    ancillaryObservation: (): null => null,
  });
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentSessionId: "parent-session", parentTargetId: "parent-target",
    assertOriginalOwner: (): Promise<void> => { if (failed === "native-owner") { reject(); } return Promise.resolve(); },
    assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    subscribe: (): never => assert.fail("Capture must not be armed after the injected failure"),
    request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => {
      sent.push(command.method);
      if (command.method === "Target.getTargets" && failed === "targets-deadline") { return Promise.withResolvers<unknown>().promise; }
      if (command.method === "Target.getTargets" && failed === "targets" ||
          command.method === "Page.getFrameTree" && failed === "frames" ||
          command.method === "Runtime.callFunctionOn" && failed === "preflight") { reject(); }
      return Promise.resolve({});
    },
  });
  return { opening: new CurrentPcbWorkerStartupOpening({ dependency, opening: binding }), sent };
}

for (const [failure, stage, step, requests] of [
  ["opening-owner", "parent-before-preflight", "opening-owner-reproof", 0],
  ["native-owner", "parent-before-preflight", "native-owner-reproof", 0],
  ["targets", "parent-before-preflight", "browser-targets", 1],
  ["frames", "parent-before-preflight", "parent-frames", 2],
  ["preflight", "preflight", "preflight-request", 3],
] as const) {
  void test(`startup opening diagnostics retain exact ${failure} refusal without exposing its raw exception`, async () => {
    const value = fixture(failure);
    await assert.rejects(value.opening.open(target, (): never => assert.fail("Checkpoint callback must not run")));
    const status = value.opening.status();
    assert.deepEqual(status.diagnostics, { stage, step, failure: { stage, step, kind: "refused" } });
    assert.equal(status.consumed, true); assert.equal(status.settled, true);
    assert.equal(status.openingAttempted, false); assert.equal(status.openingResultRetained, false);
    assert.equal(value.sent.length, requests);
    assert.equal(JSON.stringify(status).includes("private fixture"), false);
    assert.equal(Object.isFrozen(status.diagnostics), true); assert.equal(Object.isFrozen(status.diagnostics.failure), true);
    await assert.rejects(value.opening.open(target, (): Promise<void> => Promise.resolve()), /CONSUMED/u);
    await value.opening.releaseAfterTermination();
    assert.deepEqual(value.opening.status().diagnostics, status.diagnostics);
  });
}

void test("startup opening diagnostics distinguish an original target-request deadline without retry or timeout relaxation", async () => {
  const value = fixture("targets-deadline");
  await assert.rejects(value.opening.open(target, (): never => assert.fail("Checkpoint callback must not run")), /OPENING_DEADLINE/u);
  const status = value.opening.status();
  assert.deepEqual(status.diagnostics.failure, { stage: "parent-before-preflight", step: "browser-targets", kind: "deadline" });
  assert.equal(value.sent.length, 1); assert.equal(status.openingAttempted, false);
  await value.opening.releaseAfterTermination();
  assert.deepEqual(value.opening.status().diagnostics, status.diagnostics);
});
