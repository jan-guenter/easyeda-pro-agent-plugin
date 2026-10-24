import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as immediate } from "node:timers/promises";
import { CurrentPcb209RatlineWorkerStartup } from "../src/current-pcb-209-ratline-startup-session.ts";
import { CurrentPcb209RatlineBootstrapOwner } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineStartupDependency } from "../src/current-pcb-209-ratline-startup-session.ts";
import type { CurrentPcb209RatlineRealmDependency } from "../src/current-pcb-209-ratline-event-dispatcher.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES } from "../src/current-pcb-209-ratline-creation-profile.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES } from "../src/current-pcb-209-ratline-capture-profile.ts";

type Events = Parameters<CurrentPcb209RatlineRealmDependency["subscribe"]>[0];
void test("composite failure resumes original parent after late cleanup but keeps the unarmed child held", async () => {
  const allocation = Promise.withResolvers<unknown>(), removedCreation = Promise.withResolvers<null>(), waiting = Promise.withResolvers<null>();
  let delayedLocation: unknown = null, events: Events | null = null, removals = 0, resumes = 0, sourceStarts = 0, starts = 0;
  let sourceCurrent = true, terminated = false;
  const points = CURRENT_PCB_209_RATLINE_CREATION_PROFILES.worker;
  const realm: CurrentPcb209RatlineRealmDependency = {
    scriptId: "script", parentTargetId: "parent", parentSessionId: "parent-session",
    assertOriginalPinnedParentAndAutoAttach: (): Promise<void> => sourceCurrent ? Promise.resolve() : Promise.reject(new Error("Lost original source")),
    assertOriginalTermination: (): Promise<void> => terminated ? Promise.resolve() : Promise.reject(new Error("Not terminated")),
    subscribe: value => { events = value; return (): void => { events = null; }; },
    request: command => {
      if (command.method === "Debugger.setBreakpoint") {
        const point = command.params.location;
        if (point.lineNumber === CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES.worker.sites.bridge.lineNumber) {
          delayedLocation = point; waiting.resolve(null); return allocation.promise;
        }
        assert.equal(point.lineNumber, points.before.lineNumber);
        return Promise.resolve({ breakpointId: point.columnNumber === points.before.columnNumber ? "before" : "after", actualLocation: point });
      }
      if (command.method === "Debugger.removeBreakpoint") {
        removals += 1; if (removals === 2) { removedCreation.resolve(null); } return Promise.resolve({});
      }
      if (command.method === "Debugger.resume") { resumes += 1; events?.resumed(); return Promise.resolve({}); }
      if (command.method === "Runtime.runIfWaitingForDebugger") { starts += 1; return Promise.resolve({}); }
      throw new Error(`Unexpected ${command.method}`);
    },
  };
  const dependency: CurrentPcb209RatlineStartupDependency = {
    realm, releaseOriginalPinnedSource: (): Promise<void> => { sourceStarts += 1; return Promise.resolve(); },
    childBootstrapOwner: new CurrentPcb209RatlineBootstrapOwner({
      assertOriginalChild: (): Promise<void> => Promise.reject(new Error("No child instrumentation after failure")),
      assertOriginalTermination: realm.assertOriginalTermination,
      request: (): Promise<unknown> => Promise.reject(new Error("No child request after failure")),
      subscribe: () => (): void => {
        // No child bootstrap was armed.
      },
    }),
  };
  const session = new CurrentPcb209RatlineWorkerStartup(dependency); const pending = session.capture(), rejected = assert.rejects(pending);
  await waiting.promise;
  // Let the separately acknowledged creation allocations reach their owner.
  await immediate(); assert.ok(events !== null);
  const originalEvents: Events = events;
  originalEvents.paused({ reason: "other", hitBreakpoints: ["before"], callFrames: [{ callFrameId: "frame", functionName: "addWorker",
    location: { scriptId: "script", lineNumber: points.before.lineNumber, columnNumber: points.before.columnNumber } }] });
  // The unbracketed child is deliberately hostile. Parent cleanup waits for
  // Both stage allocations; child execution remains blocked until termination.
  originalEvents.attached({ sessionId: "parent-session", params: { sessionId: "child-session", waitingForDebugger: true,
    targetInfo: { targetId: "child", type: "worker", title: "pcb-ratline-worker", url: "https://client/editor?entry=pcb-ratline-worker.js", attached: true } } });
  sourceCurrent = false; originalEvents.lost(); await removedCreation.promise;
  assert.equal(removals, 2); assert.equal(resumes, 0); assert.equal(starts, 0); assert.equal(sourceStarts, 0);
  allocation.resolve({ breakpointId: "bridge", actualLocation: delayedLocation }); await rejected;
  await assert.rejects(session.abort()); assert.equal(removals, 3); assert.equal(resumes, 1); assert.equal(starts, 0); assert.equal(sourceStarts, 0);
  terminated = true; await session.releaseAfterTermination(); assert.equal(events, null);
});
