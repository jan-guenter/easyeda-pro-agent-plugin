import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { CurrentPcb209RatlinePcbStartup, CurrentPcb209RatlineWorkerStartup } from "../src/current-pcb-209-ratline-startup-session.ts";
import type { CurrentPcb209RatlineStartupDependency } from "../src/current-pcb-209-ratline-startup-session.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES } from "../src/current-pcb-209-ratline-creation-profile.ts";
import { currentPcb209RatlineNativeWire } from "../src/current-pcb-209-ratline-native-wire.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

for (const [role, synchronousResume] of [["pcb", false], ["worker", false], ["pcb", true]] as const) {
  void test(`fixed209 ${role} joins V8 construction and capture with one synthetic child start, synchronous resume ${String(synchronousResume)}`, async context => {
    const fixture = await ratlineCaptureInspector(context, role);
    const parent = { targetId: "parent", type: role === "pcb" ? "page" : "worker", title: "parent", url: "https://client/editor", attached: true };
    const child = { targetId: "child", type: "worker", title: "pcb-ratline-worker", attached: true,
      url: `https://client/editor?entry=pcb-ratline-worker.js${role === "pcb" ? "&cll=0" : ""}` };
    let armedChild = false, childStarts = 0, constructed = false, sourceStarts = 0;
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
        request: input => {
          // Actual V8 runner commands pass the finite dormant native grammar;
          // Target attachments and child starts remain synthetic in this test.
          const command = currentPcb209RatlineNativeWire(role, input, originalRequestId).command; originalRequestId += 1;
          if (command.method === "Target.getTargets") { return Promise.resolve({ targetInfos: constructed ? [parent, child] : [parent] }); }
          if (command.method === "Runtime.runIfWaitingForDebugger") {
            assert.equal(command.sessionId, "child-session"); assert.ok(armedChild); childStarts += 1; return Promise.resolve({});
          }
          assert.equal(command.sessionId, "parent-session");
          if (synchronousResume && command.method === "Debugger.resume") {
            // Deliver a synthetic immediate acknowledgment before the actual
            // V8 reply; suppress only its later corresponding resumed event.
            syntheticResumes += 1; assert.ok(resumeCallback !== null); resumeCallback();
          }
          return fixture.request(command.method, command.params);
        },
      },
      releaseOriginalPinnedSource: (): Promise<void> => { sourceStarts += 1; assert.ok(resumeCallback !== null); resumeCallback(); running.push(fixture.run()); return Promise.resolve(); },
      armOriginalChildBootstrap: async (creation, packet): Promise<void> => {
        assert.equal(armedChild, false); assert.equal(packet.role, role); assert.equal(packet.childSessionId, "child-session");
        await creation.requireOriginal(packet); armedChild = true;
      },
    };
    const session = role === "pcb" ? new CurrentPcb209RatlinePcbStartup(dependency) : new CurrentPcb209RatlineWorkerStartup(dependency);
    const packet = await session.capture(); await Promise.all(running);
    assert.equal(packet.capture.pauses, role === "pcb" ? 5 : 9); assert.equal(packet.originalConstructionAndBridgeWorkerMatch, true);
    assert.equal(packet.originalConstructionAndRegistryMatch, true); assert.equal(packet.nativePreexecutionSourceOwnershipVerified, false);
    assert.equal(packet.nativeWorkerTargetIdentityVerified, false); assert.equal(packet.childSourceQualified, false);
    assert.equal(packet.callbackReturnCompletionVerified, false); assert.equal(packet.executionAuthorized, false);
    assert.equal(fixture.counts().pauses, role === "pcb" ? 7 : 11); assert.equal(fixture.counts().resumes, fixture.counts().pauses);
    assert.equal(sourceStarts, 1); assert.equal(childStarts, 1); assert.equal(fixture.counts().subscribers, 1);
    await session.requireOriginal(packet); await assert.rejects(session.requireOriginal(structuredClone(packet)), /ORIGINAL_PACKET/u);
    await assert.rejects(session.capture(), /CONSUMED/u); await session.abort(); assert.equal(childStarts, 1); assert.equal(sourceStarts, 1);
    await fixture.terminate(); await session.releaseAfterTermination(); assert.equal(fixture.counts().subscribers, 0);
  });
}
