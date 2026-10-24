import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlinePcbCreation } from "../src/current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCreationCommand, CurrentPcb209RatlineCreationTransport } from "../src/current-pcb-209-ratline-creation-runner.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES as PROFILES } from "../src/current-pcb-209-ratline-creation-profile.ts";

type Events = Parameters<CurrentPcb209RatlineCreationTransport["subscribe"]>[0];
function syntheticOwner(delaySecondAllocation = false): Readonly<{
  transport: CurrentPcb209RatlineCreationTransport; begin: () => void; abortEvents: () => void;
  secondAllocation: Promise<void>; acknowledge: () => void; counts: () => Readonly<{ starts: number; resumes: number; removals: number }>;
}> {
  const delayed = Promise.withResolvers<unknown>(), second = Promise.withResolvers<undefined>();
  let allocations = 0, events: Events | null = null, pauseIndex = 0, removals = 0, resumes = 0, starts = 0;
  let delayedCommand: Extract<CurrentPcb209RatlineCreationCommand, { method: "Debugger.setBreakpoint" }> | null = null;
  const child = { targetId: "child", type: "worker", title: "pcb-ratline-worker", url: "https://client/editor?entry=pcb-ratline-worker.js&cll=0", attached: true };
  const parent = { targetId: "parent", type: "page", title: "parent", url: "https://client/editor", attached: true };
  const paused = (name: "before" | "after"): void => {
    pauseIndex += 1; const point = PROFILES.pcb[name];
    events?.paused({ reason: "other", hitBreakpoints: [name], callFrames: [{ callFrameId: name, functionName: "addWorker",
      location: { scriptId: "script", lineNumber: point.lineNumber, columnNumber: point.columnNumber } }] });
  };
  const attached = (): void => { events?.attached({ sessionId: "parent-session", params: { sessionId: "child-session", targetInfo: child, waitingForDebugger: true } }); };
  const transport: CurrentPcb209RatlineCreationTransport = {
    scriptId: "script", parentTargetId: "parent", parentSessionId: "parent-session",
    assertOriginalPinnedParentAndAutoAttach: (): Promise<void> => Promise.resolve(),
    assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    subscribe: value => { events = value; return (): void => { events = null; }; },
    request: command => {
      switch (command.method) {
        case "Debugger.setBreakpoint": {
          allocations += 1;
          if (allocations === 2) {
            // oxlint-disable-next-line unicorn/no-useless-undefined -- The strict resolver requires its undefined value argument.
            second.resolve(undefined);
            if (delaySecondAllocation) { delayedCommand = command; return delayed.promise; }
          }
          return Promise.resolve({ breakpointId: allocations === 1 ? "before" : "after", actualLocation: command.params.location });
        }
        case "Debugger.removeBreakpoint": { removals += 1; return Promise.resolve({}); }
        case "Debugger.resume": {
          resumes += 1; events?.resumed();
          if (!delaySecondAllocation && pauseIndex === 1) { attached(); paused("after"); }
          return Promise.resolve({});
        }
        case "Runtime.runIfWaitingForDebugger": { starts += 1; return Promise.resolve({}); }
        case "Target.getTargets": { return Promise.resolve({ targetInfos: pauseIndex < 2 ? [parent] : [parent, child] }); }
        case "Debugger.evaluateOnCallFrame": {
          if (command.params.expression === "s") { return Promise.resolve({ result: { type: "string", value: "editor?entry=pcb-ratline-worker.js&cll=0" } }); }
          if (command.params.expression === "i") { return Promise.resolve({ result: { type: "string", value: "pcb-ratline-worker" } }); }
          return Promise.resolve({ result: { type: "object", objectId: command.params.expression === "this" ? "manager" : "worker" } });
        }
        default: { throw new Error("Unexpected fixed command"); }
      }
    },
  };
  return { transport, secondAllocation: second.promise, begin: (): void => { paused("before"); },
    abortEvents: (): void => { paused("before"); attached(); },
    acknowledge: (): void => { assert.ok(delayedCommand !== null); delayed.resolve({ breakpointId: "after", actualLocation: delayedCommand.params.location }); },
    counts: (): Readonly<{ starts: number; resumes: number; removals: number }> => ({ starts, resumes, removals }) };
}

void test("fixed209 creation consumes resume before a synchronous native callback and following pause", async () => {
  const fixture = syntheticOwner(), runner = new CurrentPcb209RatlinePcbCreation(fixture.transport);
  const pending = runner.capture(); await runner.whenArmed(); fixture.begin(); const packet = await pending;
  assert.equal(runner.status()["failed"], false); assert.deepEqual(fixture.counts(), { starts: 0, resumes: 1, removals: 2 });
  const starting = runner.startOriginalChild(packet);
  await assert.rejects(runner.startOriginalChild(packet), /CHILD_START_CONSUMED/u); await starting;
  await runner.continueOriginalParent(packet); await runner.abort();
  assert.deepEqual(fixture.counts(), { starts: 1, resumes: 2, removals: 2 }); await runner.releaseAfterTermination();
});

void test("fixed209 creation retains pause and child until a late original breakpoint allocation is removed", async () => {
  const fixture = syntheticOwner(true), runner = new CurrentPcb209RatlinePcbCreation(fixture.transport);
  const pending = runner.capture(), refused = assert.rejects(pending); await fixture.secondAllocation; fixture.abortEvents();
  await assert.rejects(runner.abort(), /UNRESOLVED_BREAKPOINTS/u);
  assert.deepEqual(fixture.counts(), { starts: 0, resumes: 0, removals: 1 }); assert.equal(runner.status()["unresolvedBreakpoints"], true);
  fixture.acknowledge(); await refused; await runner.abort();
  assert.deepEqual(fixture.counts(), { starts: 1, resumes: 1, removals: 2 }); assert.equal(runner.status()["unresolvedBreakpoints"], false);
  await runner.releaseAfterTermination();
});
