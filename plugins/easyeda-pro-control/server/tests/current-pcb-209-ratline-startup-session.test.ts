import { currentPcb209RatlineCompositeDiagnosticsSchema } from "../src/current-pcb-209-ratline-diagnostics.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as delay, setImmediate as immediate } from "node:timers/promises";
import { z } from "zod";
import { CurrentPcb209RatlinePcbHeldStartup, CurrentPcb209RatlinePcbStartup, CurrentPcb209RatlineWorkerStartup } from "../src/current-pcb-209-ratline-startup-session.ts";
import { CurrentPcb209RatlineBootstrapOwner } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineBootstrapDependency } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineHeldStartupPacket, CurrentPcb209RatlineStartupDependency, CurrentPcb209RatlineStartupPacket } from "../src/current-pcb-209-ratline-startup-session.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES } from "../src/current-pcb-209-ratline-creation-profile.ts";
import { currentPcb209RatlineNativeWire } from "../src/current-pcb-209-ratline-native-wire.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

function finalGateRefusal(value: unknown): boolean {
  if (value instanceof AggregateError) { return value.errors.some(finalGateRefusal); }
  return value instanceof Error && /assertOriginalChildStartStillReady[^\n]+\n\s+at #request \(file:[^\n]*ratline-child-start-gate\.ts/u.test(value.stack ?? "");
}
async function rejectedCapture(work: Promise<unknown>, requireFinalGate: boolean): Promise<void> {
  try { await work; } catch (error) {
    if (requireFinalGate) { assert.ok(finalGateRefusal(error), error instanceof Error ? error : new Error("Expected final gate refusal.")); }
    return;
  }
  assert.fail("The original composite must refuse this failed child.");
}
async function requireOriginalSession(session: CurrentPcb209RatlinePcbStartup | CurrentPcb209RatlineWorkerStartup | CurrentPcb209RatlinePcbHeldStartup,
  packet: CurrentPcb209RatlineStartupPacket | CurrentPcb209RatlineHeldStartupPacket): Promise<void> {
  if (session instanceof CurrentPcb209RatlinePcbHeldStartup) {
    assert.equal(packet.profile, "private.current-pcb209-ratline-held-prefix-composite.v2");
    await session.requireOriginal(packet); return;
  }
  assert.equal(packet.profile, "private.current-pcb209-ratline-composite.v1"); await session.requireOriginal(packet);
}

for (const [role, synchronousResume, failure, slowRequest, heldPrefix] of [["pcb", false, null], ["worker", false, null], ["pcb", true, null],
  ["pcb", false, "late-allocation"], ["worker", false, "child-lost"], ["pcb", false, "failed-removal"], ["pcb", false, "await-gap"], ["pcb", false, null, true],
  ["pcb", false, null, false, true], ["pcb", true, null, false, true], ["pcb", false, "late-allocation", false, true],
  ["pcb", false, "failed-removal", false, true], ["pcb", false, "await-gap", false, true], ["pcb", false, "construction-mismatch", false, true]] as const) {
  void test(`fixed209 ${role} actual composite child gate, synchronous resume ${String(synchronousResume)}, failure ${String(failure)}, delayed proofs ${String(slowRequest === true)}, held prefix ${String(heldPrefix === true)}`, async context => {
    const fixture = await ratlineCaptureInspector(context, role, 0, false, false, { holdPcbResult: heldPrefix === true });
    const parent = { targetId: "parent", type: role === "pcb" ? "page" : "worker", title: "parent", url: "https://client/editor", attached: true };
    const child = { targetId: "child", type: "worker", title: "pcb-ratline-worker", attached: true,
      url: `https://client/editor?entry=pcb-ratline-worker.js${role === "pcb" ? "&cll=0" : ""}` };
    let armedChild = false, childStarts = 0, constructed = false, sourceStarts = 0;
    let childRemovals = 0;
    let captureProofDelay = false, creationProofDelay = false;
    let childProofsAfterAllocation = 0, scheduledLossDelivered = false;
    const parentCallbacks: { lost: (() => void) | null } = { lost: null };
    let childEvents: Parameters<CurrentPcb209RatlineBootstrapDependency["subscribe"]>[0] | null = null;
    const allocating = Promise.withResolvers<null>(), allocation = Promise.withResolvers<unknown>();
    let originalRequestId = 301;
    const running: Promise<unknown>[] = [];
    let resumeCallback: (() => void) | null = null, syntheticResumes = 0;
    const frame = z.looseObject({ location: z.looseObject({ lineNumber: z.number(), columnNumber: z.number() }) });
    const pause = z.looseObject({ callFrames: z.array(frame).min(1) });
    const dependency: CurrentPcb209RatlineStartupDependency = {
      realm: {
        scriptId: fixture.transport.scriptId, parentTargetId: "parent", parentSessionId: "parent-session",
        assertOriginalPinnedParentAndAutoAttach: fixture.transport.assertOriginalPinnedRealm,
        assertOriginalTermination: fixture.transport.assertOriginalTermination,
        subscribe: events => {
          resumeCallback = events.resumed;
          parentCallbacks.lost = events.lost;
          return fixture.transport.subscribe({
          paused: input => {
            const event = pause.parse(input);
            const point = CURRENT_PCB_209_RATLINE_CREATION_PROFILES[role].after, top = event.callFrames[0];
            if (top?.location.lineNumber === point.lineNumber && top.location.columnNumber === point.columnNumber) {
              assert.equal(constructed, false); constructed = true;
              events.attached({ sessionId: "parent-session", params: { sessionId: "child-session", targetInfo: child, waitingForDebugger: true } });
            }
            events.paused(input);
          }, resumed: (): void => { if (syntheticResumes > 0) { syntheticResumes -= 1; } else { events.resumed(); } }, lost: events.lost,
          });
        },
        request: async input => {
          // Actual V8 runner commands pass the finite dormant native grammar;
          // Target attachments and child starts remain synthetic in this test.
          const wire = currentPcb209RatlineNativeWire(role, input, originalRequestId); const command = wire.command; originalRequestId += 1;
          if (heldPrefix === true && command.method === "Runtime.callFunctionOn") {
            assert.notEqual(command.params.functionDeclaration, 'function(other){"use strict";return this===other;}');
          }
          if (slowRequest === true && (command.method === "Target.getTargets" && !creationProofDelay || command.method === "Runtime.callFunctionOn" && !captureProofDelay)) {
            if (command.method === "Target.getTargets") { creationProofDelay = true; } else { captureProofDelay = true; }
            // Synthetic owner-before/owner-after latency around an immediate
            // Native reply, exercising both actual dispatcher-created runners.
            await delay(1500); await delay(1500);
          }
          if (command.method === "Target.getTargets") { return { targetInfos: constructed ? [parent, child] : [parent] }; }
          if (command.method === "Runtime.runIfWaitingForDebugger") {
            assert.equal(command.sessionId, "child-session"); assert.ok(armedChild); childStarts += 1; return {};
          }
          assert.equal(command.sessionId, "parent-session");
          if (failure === "construction-mismatch" && command.method === "Runtime.callFunctionOn" &&
              wire.request["phase"] === "relation-construction") {
            // The actual V8 comparison must reject a different object for the
            // Manager pair, independently of the synthetic native transcript.
            const argumentsWithWrongManager = command.params.arguments.map((argument, index) => index === 2 ? { objectId: command.params.objectId } : argument);
            return fixture.request(command.method, { ...command.params, arguments: argumentsWithWrongManager });
          }
          if (command.method === "Debugger.resume" && armedChild && (failure === "child-lost" || failure === "failed-removal")) { childEvents?.lost(); }
          if (synchronousResume && command.method === "Debugger.resume") {
            // Deliver a synthetic immediate acknowledgment before the actual
            // V8 reply; suppress only its later corresponding resumed event.
            syntheticResumes += 1; assert.ok(resumeCallback !== null); resumeCallback();
          }
          return fixture.request(command.method, command.params);
        },
      },
      releaseOriginalPinnedSource: (): Promise<void> => { sourceStarts += 1; assert.ok(resumeCallback !== null); resumeCallback(); running.push(fixture.run()); return Promise.resolve(); },
      childBootstrapOwner: new CurrentPcb209RatlineBootstrapOwner({
        assertOriginalChild: async (creation, packet): Promise<void> => {
          assert.equal(packet.role, role); assert.equal(packet.childSessionId, "child-session"); await creation.requireOriginal(packet);
          if (armedChild) { childProofsAfterAllocation += 1; }
          if (failure === "await-gap" && childProofsAfterAllocation === 2) {
            // The pinned Node promise chain reaches the gate after the owner's
            // Bounded proof and its async readiness return. Loss in that gap
            // Must still fail the synchronous final private-state assertion.
            const loss = (remaining: number): void => { queueMicrotask(() => {
              if (remaining > 1) { loss(remaining - 1); } else { scheduledLossDelivered = true; childEvents?.lost(); }
            }); }; loss(5);
          }
        },
        observeOriginalFirstScript: (): Promise<void> => Promise.resolve(),
        assertOriginalTermination: fixture.transport.assertOriginalTermination,
        subscribe: events => { childEvents = events; return (): void => { childEvents = null; }; },
        request: command => {
          assert.ok("sessionId" in command);
          assert.equal(command.sessionId, "child-session");
          switch (command.method) {
            case "Target.setAutoAttach": case "Runtime.enable": { return Promise.resolve({}); }
            case "Debugger.removeBreakpoint": { childRemovals += 1; return failure === "failed-removal" ? Promise.reject(new Error("Original removal failed")) : Promise.resolve({}); }
            case "Debugger.setAsyncCallStackDepth": { assert.equal(command.params.maxDepth, 1); return Promise.resolve({}); }
        case "Debugger.enable": { return Promise.resolve({ debuggerId: "child-debugger" }); }
            case "Debugger.setInstrumentationBreakpoint": {
              assert.equal(armedChild, false); armedChild = true; allocating.resolve(null);
              return failure === "late-allocation" ? allocation.promise : Promise.resolve({ breakpointId: "child-instrument" });
            }
            case "Debugger.evaluateOnCallFrame": case "Debugger.getScriptSource": case "Debugger.resume": case "Debugger.setBreakpoint":
            case "Runtime.callFunctionOn": case "Runtime.runIfWaitingForDebugger": { return Promise.reject(new Error("Unexpected synthetic child command.")); }
            default: { throw new Error("Unexpected synthetic child command."); }
          }
        },
      }),
    };
    const FullSession = role === "pcb" ? CurrentPcb209RatlinePcbStartup : CurrentPcb209RatlineWorkerStartup;
    const session = heldPrefix === true ? new CurrentPcb209RatlinePcbHeldStartup(dependency) : new FullSession(dependency);
    const pending = session.capture();
    if (failure !== null) {
      const rejected = rejectedCapture(pending, failure === "await-gap");
      if (failure === "late-allocation") {
        await allocating.promise; assert.ok(parentCallbacks.lost !== null); parentCallbacks.lost(); await immediate();
        assert.equal(childStarts, 0); assert.equal(childRemovals, 0);
        allocation.resolve({ breakpointId: "child-instrument" });
      }
      await rejected; await Promise.allSettled(running);
      const diagnostic = currentPcb209RatlineCompositeDiagnosticsSchema.parse(session.status()); assert.ok(diagnostic.firstFailure !== null);
      if (failure === "await-gap") { assert.equal(scheduledLossDelivered, true); }
      const expectedStarts = failure === "construction-mismatch" ? 1 : 0;
      assert.equal(childStarts, expectedStarts); assert.equal(childRemovals, 1);
      assert.equal(dependency.childBootstrapOwner.status()["unresolvedInstrumentation"], failure === "failed-removal");
      await (failure === "construction-mismatch" ? session.abort() : assert.rejects(session.abort()));
      assert.equal(childStarts, expectedStarts); assert.equal(childRemovals, 1);
      await fixture.terminate(); await session.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0); assert.equal(childEvents, null);
      assert.deepEqual(currentPcb209RatlineCompositeDiagnosticsSchema.parse(session.status()).firstFailure, diagnostic.firstFailure);
      return;
    }
    const packet = await pending; await Promise.all(running);
    const diagnostic = currentPcb209RatlineCompositeDiagnosticsSchema.parse(session.status());
    assert.equal(diagnostic.firstFailure, null); assert.equal(diagnostic.creation.firstFailure, null); assert.equal(diagnostic.capture.firstFailure, null); assert.equal(diagnostic.dispatcher.firstFailure, null);
    if (slowRequest === true) { assert.equal(creationProofDelay, true); assert.equal(captureProofDelay, true); }
    assert.equal(diagnostic.scope, heldPrefix === true ? "pcb-held-prefix" : "full");
    assert.equal(diagnostic.capture.scope, diagnostic.scope); assert.equal(diagnostic.dispatcher.scope, diagnostic.scope);
    const fullPauses = role === "pcb" ? 5 : 9;
    const expectedPauses = heldPrefix === true ? 2 : fullPauses;
    assert.equal(packet.capture.pauses, expectedPauses); assert.equal(packet.originalConstructionAndBridgeWorkerMatch, true);
    assert.equal(packet.originalConstructionAndRegistryMatch, true); assert.equal(packet.nativePreexecutionSourceOwnershipVerified, false);
    assert.equal(packet.nativeWorkerTargetIdentityVerified, false); assert.equal(packet.childSourceQualified, false);
    assert.equal(packet.callbackReturnCompletionVerified, false); assert.equal(packet.executionAuthorized, false);
    assert.equal(fixture.counts().pauses, expectedPauses + 2); assert.equal(fixture.counts().resumes, fixture.counts().pauses);
    assert.equal(sourceStarts, 1); assert.equal(childStarts, 1); assert.equal(fixture.counts().subscribers, 1);
    await requireOriginalSession(session, packet); await assert.rejects(requireOriginalSession(session, structuredClone(packet)), /ORIGINAL_PACKET/u);
    await assert.rejects(session.capture(), /CONSUMED/u); await session.abort(); assert.equal(childStarts, 1); assert.equal(sourceStarts, 1);
    assert.equal(childRemovals, 1);
    await fixture.terminate(); await session.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0);
  });
}
