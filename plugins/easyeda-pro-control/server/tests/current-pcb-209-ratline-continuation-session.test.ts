/* oxlint-disable import/max-dependencies -- One composed fixture exercises actual V8 PCB/worker captures and all three actual source owners with explicitly synthetic source replies and target ancestry. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { CurrentPcbDiagnosticContext } from "../src/current-pcb-diagnostic-context.ts";
import type { CurrentPcbWorkerStartupEvent } from "../src/current-pcb-worker-startup-contract.ts";
import type { CurrentPcb209RatlineContinuationDependency, CurrentPcb209RatlineContinuationSession } from "../src/current-pcb-209-ratline-continuation-session.ts";
import { currentPcb209RatlinePcbBootstrapRoleUrl, CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES as pcbRoles } from "../src/current-pcb-209-ratline-pcb-bootstrap-profile.ts";
import { CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES as childRoles, currentPcb209RatlineBootstrapRoleUrl } from "../src/current-pcb-209-ratline-bootstrap-profile.ts";
import { CURRENT_PCB_209_PRELOAD_COPY_SOURCE, CURRENT_PCB_209_WORKER_PRELOAD_LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL, currentPcb209PreloadCopyCaller } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES } from "../src/current-pcb-209-ratline-capture-profile.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS } from "../src/current-pcb-209-ratline-capture-program.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES } from "../src/current-pcb-209-ratline-creation-profile.ts";
import { currentPcb209RatlineContinuationNativeWire } from "../src/current-pcb-209-ratline-continuation-native-wire.ts";
import { currentPcb209RatlineContinuationNativePacketSchema } from "../src/current-pcb-209-ratline-continuation-packet-schema.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE as nativeProfile } from "../src/current-pcb-209-ratline-continuation-budget.ts";
import { ratlineContinuationModules } from "./helpers/current-pcb-209-ratline-continuation-modules.ts";

const base = "https://client/editor?cll=warn", rawWindowsPath = String.raw`C:\Disposable\Continuation.eprj2`, uiSource = "const retainedUi = true;";
const documentUuid = "d".repeat(16), projectUuid = createHash("sha256").update(rawWindowsPath).digest("hex");
const projectUrl = `${base}#id=${projectUuid}`;
const tab = `${documentUuid}@${projectUuid}`;
const openedUrl = `${projectUrl},tab=*${tab}`, pcbUrl = "https://client/editor?entry=pcb";
const target = { rawWindowsPath, projectUuid, documentUuid, branchUuid: "b".repeat(32), expectedSourceSha256: "c".repeat(64) };
const root = { id: "root", loaderId: "root-loader", url: base, securityOrigin: "https://client", urlFragment: "#" };
const parentTarget = { targetId: "parent", type: "page", title: "retained", url: `${base}#`, attached: false };
const uiContext = { id: 1, uniqueId: "ui-context", origin: "https://client", name: "", auxData: { frameId: "root", isDefault: true, type: "default" } };
const uiScript = { scriptId: "ui-script", executionContextId: 1, url: "https://client/pro-ui/fixture/js/ui.js", hasSourceURL: false };
const pcbFrame = { id: "pcb-frame", parentId: "root", loaderId: "pcb-loader", url: pcbUrl, securityOrigin: "https://client" };
const pcbContext = { id: 3, uniqueId: "pcb-context", origin: "https://client", name: "", auxData: { frameId: "pcb-frame", isDefault: true, type: "default" } };
const row = z.record(z.string(), z.unknown()), stopLocation = z.looseObject({ lineNumber: z.number(), columnNumber: z.number() });
const stopFrame = z.looseObject({ location: stopLocation });
const pauseFrame = z.looseObject({ callFrames: z.array(stopFrame).min(1) });
function event(method: string, params: Readonly<Record<string, unknown>>, sessionId = "parent-session"): CurrentPcbWorkerStartupEvent { return { method, params, sessionId }; }
function originalContext(): CurrentPcbDiagnosticContext {
  const context = new CurrentPcbDiagnosticContext("parent"); context.selectTarget({ targetInfos: [parentTarget] }); context.bindSession("parent-session");
  context.observeFrames({ frameTree: { frame: root } }); context.selectFrame("root", { family: "ui", relativePath: "pro-ui/fixture/js/ui.js",
    scriptBytes: Buffer.byteLength(uiSource), scriptSha256: createHash("sha256").update(uiSource).digest("hex") });
  context.observeEvent(event("Runtime.executionContextCreated", { context: uiContext })); context.observeEvent(event("Debugger.scriptParsed", uiScript));
  context.finish({ scriptSource: uiSource }, { targetInfos: [{ ...parentTarget, attached: true }] }, { frameTree: { frame: root } });
  context.beginOpeningTransition(projectUuid); context.observeEvent(event("Page.navigatedWithinDocument", { frameId: "root", url: projectUrl, navigationType: "fragment" }));
  context.finishOpeningTransition({ targetInfos: [{ ...parentTarget, attached: true, url: projectUrl }] }, { frameTree: { frame: { ...root, urlFragment: `#id=${projectUuid}` } } }); return context;
}

const observe = async (work: Promise<unknown>): Promise<void> => { try { await work; } catch {
    // The original fixture and session retain failures.
  } };

const frameProof = (method: string): unknown => {
    if (method === "Target.getTargets") { return { targetInfos: [{ ...parentTarget, attached: true, url: openedUrl }] }; }
    if (method === "Page.getFrameTree") { return { frameTree: { frame: { ...root, urlFragment: openedUrl.slice(base.length) }, childFrames: [{ frame: pcbFrame }] } }; }
    if (method === "DOM.getFrameOwner") { return { backendNodeId: 17 }; }
    if (method === "DOM.describeNode") { return { node: { backendNodeId: 17, nodeType: 1, nodeName: "IFRAME", localName: "iframe", frameId: "pcb-frame",
      attributes: ["id", `frame_${tab}`, "c_dbid", tab, "c_doctype", "3", "src", "editor?entry=pcb", "pcb-canvas", "true", "class", "editframe"] } }; }
    throw new Error("Unexpected frame proof");
  };

for (const rejectReply of [false, true]) {
void test(`fresh continuation orders actual V8 captures and retains original rejected replies: ${String(rejectReply)}`, { timeout: 60_000 }, async context => {
  const modules = await ratlineContinuationModules();
  const signals: { terminate: (role: "worker" | "subordinate") => void; publication: () => void } = {
    terminate: (): never => { throw new Error("Fixture termination before original routing"); }, publication: (): never => { throw new Error("Fixture publication before original routing"); },
  };
  const pcb = await modules.inspector(context, "pcb", 0, false, false, { holdPcbResult: true, onWorkerTermination: (): void => { signals.terminate("worker"); } });
  const worker = await modules.inspector(context, "worker", 0, false, false, { world: { documentUuid, projectUuid, tabId: tab, windowTabId: "window" },
    onWorkerTermination: (): void => { signals.terminate("subordinate"); }, onPublication: (): void => { signals.publication(); } });
  const subordinate = await modules.inspector(context, "worker");
  await worker.request("Runtime.evaluate", { expression: "globalThis.fixtureRpc = () => globalThis.fixtureRpcPromise; globalThis.fixtureRpcPromise = new Promise(resolve => { globalThis.releaseFixtureRpc=resolve; });", returnByValue: true });
  type Role = "pcb" | "worker" | "subordinate";
  let listener: Parameters<CurrentPcb209RatlineContinuationDependency["subscribe"]>[0] | null = null;
  let cleanup = false, navigation = 0, parentProofs = 0, parentRequests = 0, subscriptions = 0, terminated = false, unsubscriptions = 0;
  let firstArmedProof: number | null = null, subordinateArmed = false, subordinateWaitProofs = 0;
  const holder: { session: CurrentPcb209RatlineContinuationSession | null } = { session: null };
  const progress = { pcb: 0, worker: 0, subordinate: 0 }, resumes = { pcb: 0, worker: 0, subordinate: 0 }, sources = { pcb: 0, worker: 0, subordinate: 0 };
  const constructed = { pcb: false, worker: false }, started = { worker: false, subordinate: false };
  const sessions = { pcb: "parent-session", worker: "worker-session", subordinate: "subordinate-session" };
  const scripts = { pcb: pcb.transport.scriptId, worker: worker.transport.scriptId, subordinate: "subordinate-source" };
  const urls = { worker: "https://client/editor?entry=pcb-ratline-worker.js&cll=0", subordinate: "https://client/editor?entry=pcb-ratline-worker.js" };
  const workerTarget = { targetId: "worker", type: "worker", title: "pcb-ratline-worker", attached: true, url: urls.worker };
  const subordinateTarget = { ...workerTarget, targetId: "subordinate", url: urls.subordinate };
  const running: Promise<unknown>[] = [];
  const refusedReply = { result: { type: "undefined" }, exceptionDetails: { text: "Synthetic fixed empty-array refusal", lineNumber: 4 } };
  const refusedText = JSON.stringify(refusedReply); let replyRefused = false;
  const childExited = { worker: false, subordinate: false }, revoked = { worker: false, subordinate: false };
  const disposeFixture = new Map<string, () => void>();
  let pcbReceivedDuringWorkerPause = false, workerTerminalPaused = false;
  const received = Promise.withResolvers<null>(), workerReturned = Promise.withResolvers<null>();
  const deferredResumes = new Map<"pcb" | "worker", () => void>();
  let detachBeforeParentResume = 0;
  const boundaryResumed = { pcb: false, worker: false };
  const transcript: { role: Role; phase: string }[] = [];
  let sourcePause: Readonly<Record<string, unknown>> | null = null;
  const sourceOwnership = new Set<string>();
  const emit = (role: Role, method: string, params: Readonly<Record<string, unknown>>): void => { listener?.event(event(method, params, sessions[role])); };
  const pauseSource = (role: Role): void => {
    const index = progress[role], selectedChild = role === "pcb" ? undefined : childRoles[index], selectedPcb = role === "pcb" ? pcbRoles[index] : undefined;
    const stage = selectedChild ?? selectedPcb; if (stage === undefined) { return; }
    const scriptId = stage === "pcb" || stage === "worker" ? scripts[role] : `${role}-${stage}`;
    const url = selectedPcb === undefined ? currentPcb209RatlineBootstrapRoleUrl(z.enum(childRoles).parse(selectedChild), role === "pcb" ? "" : urls[role]) : currentPcb209RatlinePcbBootstrapRoleUrl(selectedPcb, pcbUrl);
    const caller = selectedChild === undefined || selectedChild === "worker" ? null : currentPcb209PreloadCopyCaller(selectedChild);
    const creator = CURRENT_PCB_209_PRELOAD_COPY_SOURCE.creator, preloadId = `${role}-preload`;
    if (role !== "pcb" && index === 6) {
      const log = CURRENT_PCB_209_WORKER_PRELOAD_LOG;
      emit(role, "Runtime.consoleAPICalled", { type: "log", args: [{ type: "string", value: log.message }], executionContextId: 1, timestamp: 1,
        stackTrace: { callFrames: [{ scriptId: preloadId, url: CURRENT_PCB_209_WORKER_PRELOAD_URL, functionName: log.functionName, lineNumber: log.lineNumber, columnNumber: log.columnNumber }] } });
    }
    emit(role, "Debugger.scriptParsed", { scriptId, executionContextId: role === "pcb" ? 3 : 1, url, hasSourceURL: false, isLiveEdit: false, startLine: 0, startColumn: 0,
      ...(caller === null ? {} : { stackTrace: { callFrames: [{ ...creator, scriptId: preloadId, url: CURRENT_PCB_209_WORKER_PRELOAD_URL }] } }) });
    const callFrames = caller === null ? [{ functionName: "", url, functionLocation: { scriptId, lineNumber: 0, columnNumber: 0 },
      location: { scriptId, lineNumber: 0, columnNumber: 0 } }] : [{ functionName: "", location: { scriptId, lineNumber: 0, columnNumber: 0 } },
      { functionName: creator.functionName, location: { scriptId: preloadId, lineNumber: creator.lineNumber, columnNumber: creator.columnNumber } },
      { functionName: "", location: { scriptId: preloadId, lineNumber: caller.lineNumber, columnNumber: caller.columnNumber } }];
    const pause = { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: [], callFrames };
    if (role === "pcb") { sourcePause = pause; }
    emit(role, "Debugger.paused", pause);
  };
  const originalParent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: 301 });
  const originalTermination = (): Promise<void> => { assert.ok(terminated); return Promise.resolve(); };
  const run = (role: "pcb" | "worker"): void => { const work = (role === "pcb" ? pcb : worker).run(); running.push(work); void observe(work); };
  signals.terminate = (role): void => {
    if (replyRefused) { return; }
    assert.equal(revoked[role], true); assert.equal(childExited[role], false);
    disposeFixture.get(role)?.();
    const work = (async (): Promise<void> => {
      await (role === "worker" ? worker : subordinate).terminate(); childExited[role] = true;
      emit(role, "Runtime.executionContextDestroyed", { executionContextId: 1, executionContextUniqueId: `${role}-context` });
      const parentRole = role === "worker" ? "pcb" : "worker";
      if (!boundaryResumed[parentRole]) { detachBeforeParentResume += 1; }
      emit(parentRole, "Target.detachedFromTarget", { sessionId: sessions[role], targetId: role });
      const resumed = deferredResumes.get(parentRole); if (resumed !== undefined) { deferredResumes.delete(parentRole); resumed(); }
    })(); running.push(work); void observe(work);
  };
  signals.publication = (): void => {
    if (replyRefused) { return; }
    const work = (async (): Promise<unknown> => { await workerReturned.promise;
      return pcb.request("Runtime.evaluate", { expression: "A.callback(JSON.stringify({ratlineRes:[],workerName:0}))", returnByValue: true }); })();
    running.push(work); void observe(work);
  };
  const publishResult = (): Promise<unknown> => worker.request("Runtime.evaluate", { expression: "globalThis.releaseFixtureRpc({message:[]})", returnByValue: true });
  const subscribeFixture = (role: "pcb" | "worker"): void => {
    const fixture = role === "pcb" ? pcb : worker;
    disposeFixture.set(role, fixture.transport.subscribe({ lost: (): void => { listener?.lost(); }, resumed: (): void => {
      const child = role === "pcb" ? "worker" : "subordinate";
      if (role === "worker" && revoked[child] && !childExited[child]) { assert.equal(deferredResumes.has(role), false); deferredResumes.set(role, (): void => { boundaryResumed[role] = true; emit(role, "Debugger.resumed", {}); }); }
      else { if (revoked[child]) { boundaryResumed[role] = true; } emit(role, "Debugger.resumed", {}); }
    },
      paused: input => {
        const top = pauseFrame.parse(input).callFrames[0], value = row.parse(input);
        const point = CURRENT_PCB_209_RATLINE_CREATION_PROFILES[role].after;
        if (top?.location.lineNumber === point.lineNumber && top.location.columnNumber === point.columnNumber) {
          assert.equal(constructed[role], false); constructed[role] = true;
          emit(role, "Target.attachedToTarget", { sessionId: role === "pcb" ? sessions.worker : sessions.subordinate,
            targetInfo: role === "pcb" ? workerTarget : subordinateTarget, waitingForDebugger: true });
        }
        if (role === "worker" && top?.location.lineNumber === CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES.worker.sites.returned.lineNumber && top.location.columnNumber === CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES.worker.sites.returned.columnNumber) { workerTerminalPaused = true; workerReturned.resolve(null); }
        if (role === "pcb" && top?.location.lineNumber === CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES.pcb.sites.received.lineNumber && top.location.columnNumber === CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES.pcb.sites.received.columnNumber) {
          pcbReceivedDuringWorkerPause = workerTerminalPaused; received.resolve(null);
        }
        emit(role, "Debugger.paused", value);
      },
    }));
  };
  subscribeFixture("pcb"); subscribeFixture("worker");
  const dependency: CurrentPcb209RatlineContinuationDependency = Object.freeze<CurrentPcb209RatlineContinuationDependency>({
    requireOriginalParent: async (): Promise<typeof originalParent> => {
      parentProofs += 1; assert.equal(terminated, false);
      if (replyRefused) { refusedReply.exceptionDetails.text = "Changed during subsequent owner reproof"; }
      if (subordinateArmed && !started.subordinate && holder.session !== null && row.parse(holder.session.status()["subordinateSource"])["armed"] === true) {
        firstArmedProof ??= performance.now(); subordinateWaitProofs += 1; await delay(250);
        if (!started.subordinate) { assert.equal(sources.subordinate, 0); }
      }
      return originalParent;
    }, assertOriginalTermination: originalTermination,
    retireOriginalRealm: (role, sessionId): void => { assert.equal(sessionId, sessions[role]); assert.equal(revoked[role], false); revoked[role] = true; },
    assertOriginalBeforeNavigation: (): Promise<void> => { assert.equal(navigation, 0); return Promise.resolve(); },
    beginOriginalPcbNavigation: (): Promise<void> => {
      navigation += 1; assert.equal(navigation, 1); emit("pcb", "Page.navigatedWithinDocument", { frameId: "root", url: openedUrl, navigationType: "fragment" });
      emit("pcb", "Page.frameAttached", { frameId: "pcb-frame", parentFrameId: "root" });
      emit("pcb", "Page.frameNavigated", { frame: pcbFrame, type: "Navigation" }); emit("pcb", "Runtime.executionContextCreated", { context: pcbContext }); pauseSource("pcb"); return Promise.resolve();
    },
    subscribe: events => { subscriptions += 1; assert.equal(subscriptions, 1); listener = events; events.event(event("Runtime.consoleAPICalled", { executionContextId: 1, type: "log", args: [], timestamp: 1 }));
      return (): void => { unsubscriptions += 1; listener = null; }; },
    beginCleanup: (): Promise<void> => { cleanup = true; return Promise.resolve(); },
    requestParent: (command): Promise<unknown> => { parentRequests += 1; return Promise.resolve(frameProof(command.method)); },
    request: (role, command): Promise<unknown> => {
      assert.equal(role === "pcb" ? false : revoked[role], false);
      const wire = currentPcb209RatlineContinuationNativeWire(role, command, transcript.length + 1);
      transcript.push({ role, phase: z.string().parse(wire.request["phase"]) });
      if ("ownershipPhase" in command) {
        assert.equal(role, "pcb"); const breakpointId = `owned-${command.ownershipStage}`;
        if (command.ownershipPhase === "arm") {
          assert.equal(sourceOwnership.has(breakpointId), false); sourceOwnership.add(breakpointId);
          return Promise.resolve({ breakpointId, actualLocation: command.params.location });
        }
        assert.equal(sourceOwnership.has(breakpointId), true);
        if (command.ownershipPhase === "remove") { assert.equal(command.params.breakpointId, breakpointId); sourceOwnership.delete(breakpointId); return Promise.resolve({}); }
        assert.ok(sourcePause !== null); emit(role, "Debugger.resumed", {});
        emit(role, "Debugger.paused", { ...sourcePause, reason: "other", hitBreakpoints: [breakpointId] }); return Promise.resolve({});
      }
      if (command.method === "Target.getTargets") {
        const parent = role === "pcb" ? { ...parentTarget, attached: true, url: openedUrl } : workerTarget;
        const child = role === "pcb" ? workerTarget : subordinateTarget;
        assert.ok(role !== "subordinate"); return Promise.resolve({ targetInfos: constructed[role] ? [parent, child] : [parent] });
      }
      if (command.method === "Runtime.runIfWaitingForDebugger") {
        const child = role === "pcb" ? "worker" : "subordinate"; assert.equal(started[child], false);
        if (child === "subordinate") { assert.ok(firstArmedProof !== null && performance.now() - firstArmedProof >= 2500); }
        started[child] = true;
        assert.equal(command.sessionId, sessions[child]); pauseSource(child); return Promise.resolve({});
      }
      assert.equal(command.sessionId, sessions[role]);
      if (command.method === "Target.setAutoAttach" || command.method === "Debugger.setAsyncCallStackDepth") { return Promise.resolve({}); }
      if (command.method === "Runtime.enable") {
        emit(role, "Runtime.executionContextCreated", { context: role === "pcb" ? uiContext : { id: 1, uniqueId: `${role}-context`, name: "pcb-ratline-worker", origin: urls[role] } }); return Promise.resolve({});
      }
      if (command.method === "Debugger.enable") { if (role === "pcb") { emit(role, "Debugger.scriptParsed", uiScript); } return Promise.resolve({ debuggerId: `${role}-debugger` }); }
      if (command.method === "Debugger.setInstrumentationBreakpoint") {
        if (role === "subordinate") { subordinateArmed = true; }
        return Promise.resolve({ breakpointId: `${role}-instrument` });
      }
      if (command.method === "Debugger.getScriptSource") {
        sources[role] += 1; return Promise.resolve({ scriptSource: `synthetic:${String(role === "pcb" ? pcbRoles[progress[role]] : childRoles[progress[role]])}` });
      }
      if (command.method === "Debugger.removeBreakpoint" && command.params.breakpointId === `${role}-instrument`) { return Promise.resolve({}); }
      if (command.method === "Debugger.resume" && progress[role] < (role === "pcb" ? pcbRoles.length : childRoles.length)) {
        resumes[role] += 1; emit(role, "Debugger.resumed", {}); progress[role] += 1;
        if (progress[role] === (role === "pcb" ? pcbRoles.length : childRoles.length)) {
          if (role === "subordinate") { const work = publishResult(); running.push(work); void observe(work); } else { run(role); }
        } else { pauseSource(role); }
        return Promise.resolve({});
      }
      assert.notEqual(role, "subordinate");
      if (rejectReply && role === "worker" && command.method === "Runtime.callFunctionOn" &&
          command.params.functionDeclaration === CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS.empty) {
        assert.equal(replyRefused, false); replyRefused = true; return Promise.resolve(refusedReply);
      }
      if (role === "worker" && workerTerminalPaused && command.method === "Debugger.evaluateOnCallFrame") {
        return (async (): Promise<unknown> => { await received.promise; return worker.request(command.method, command.params); })();
      }
      return (role === "pcb" ? pcb : worker).request(command.method, command.params);
    },
  });
  const localTarget = { ...target }, session = new modules.Session(originalContext(), localTarget, dependency); holder.session = session;
  try {
  let packet; const capture = session.capture(); localTarget.documentUuid = "e".repeat(16);
  if (rejectReply) {
    await assert.rejects(capture); assert.ok(replyRefused);
    const evidence = session.retainedRejectedCaptureReplyEvidence().worker;
    assert.ok(evidence !== null && evidence.reply.status === "captured");
    assert.equal(evidence.role, "worker"); assert.equal(evidence.site, "initialized"); assert.equal(evidence.pauseIndex, 6);
    assert.equal(evidence.command, "Runtime.callFunctionOn"); assert.equal(evidence.program, "empty");
    assert.equal(evidence.requestNumber, 45); assert.equal(evidence.executionAuthorized, false);
    assert.equal(JSON.stringify(evidence.reply.value), refusedText);
    assert.equal(evidence.reply.sha256, createHash("sha256").update(refusedText).digest("hex"));
    assert.ok(Object.isFrozen(evidence) && Object.isFrozen(evidence.reply.value));
    const workerStatus = row.parse(session.status()["worker"]);
    const captureStatus = row.parse(workerStatus["capture"]);
    const failure = row.parse(captureStatus["firstFailure"]);
    assert.equal(failure["step"], "reply-validation"); assert.equal(failure["reason"], "SCHEMA");
    assert.equal(session.retainedRejectedCaptureReplyEvidence().pcb, null);
    await assert.rejects(session.capture());
    assert.equal(session.retainedRejectedCaptureReplyEvidence().worker, evidence);
    return;
  }
  try { packet = await capture; } catch (error) { context.diagnostic(JSON.stringify(session.status())); context.diagnostic(String(error)); throw error; }
  const captureParentProofs = parentProofs;
  assert.deepEqual(childExited, { worker: true, subordinate: true }); assert.deepEqual(revoked, childExited); assert.ok(pcbReceivedDuringWorkerPause); assert.equal(detachBeforeParentResume, 1);
  assert.equal(session.status()["transitionStarted"], true); assert.ok(subordinateWaitProofs >= 10);
  assert.equal(packet.pcb.role, "pcb"); assert.equal(packet.worker.role, "worker"); assert.equal(packet.subordinate.sourceResumeObserved, true);
  assert.deepEqual(sources, { pcb: 29, worker: 7, subordinate: 7 }); assert.deepEqual(resumes, { pcb: 29, worker: 7, subordinate: 7 });
  assert.equal(sourceOwnership.size, 0);
  assert.deepEqual(started, { worker: true, subordinate: true }); assert.equal(packet.nativeWorkerTargetIdentityVerified, false);
  assert.equal(packet.callbackReturnCompletionVerified, false); assert.equal(packet.executionAuthorized, false); assert.equal(packet.completeLiveBaselineVerified, false);
  const native = { profile: "private.pcb209-ratline-native-continuation.v1", targetSha256: "a".repeat(64), originalProjectConstructionSha256: "b".repeat(64),
    continuation: packet, pcbNavigationAcknowledged: true, nativeWorkerTargetIdentityVerified: false, callbackReturnCompletionVerified: false,
    completeStartupVerified: false, completeLiveBaselineVerified: false, executionAuthorized: false, saveAuthorized: false };
  assert.deepEqual(currentPcb209RatlineContinuationNativePacketSchema.parse(native), native);
  assert.equal(currentPcb209RatlineContinuationNativePacketSchema.safeParse({ ...native, executionAuthorized: true }).success, false);
  assert.equal(currentPcb209RatlineContinuationNativePacketSchema.safeParse({ ...native, continuation: { ...packet,
    subordinateSource: { ...packet.subordinateSource, childSessionId: packet.workerSource.childSessionId } } }).success, false);
  const counts = new Map<string, number>(); for (const item of transcript) { const key = `${item.role}:${item.phase}`; counts.set(key, (counts.get(key) ?? 0) + 1); }
  context.diagnostic(JSON.stringify(Object.fromEntries(counts)));
  await session.requireOriginal(packet);
  context.diagnostic(JSON.stringify({ helperControlAccounting: { captureParentProofs, recheckParentProofs: parentProofs - captureParentProofs,
    parentRequests, continuationCommands: transcript.length, finalParentProofs: parentProofs } }));
  assert.ok(captureParentProofs <= nativeProfile.helperControlDerivation.captureParentProofs);
  assert.ok(parentProofs - captureParentProofs <= nativeProfile.helperControlDerivation.packetRecheckParentProofs);
  await assert.rejects(session.requireOriginal({ ...packet }), /ORIGINAL_PACKET/u);
  } finally {
    received.resolve(null); workerReturned.resolve(null); await session.abort(); assert.ok(cleanup);
    await Promise.all([pcb.terminate(), worker.terminate(), subordinate.terminate()]); terminated = true;
    await Promise.allSettled(running); await session.releaseAfterTermination();
    assert.equal(session.status()["phase"], "released"); assert.equal(unsubscriptions, 1);
  }
});
}

void test("failed native cleanup admission still settles local source waits and never dispatches cleanup commands", async () => {
  const modules = await ratlineContinuationModules(), parent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: 301 });
  let cleanupCalls = 0, commands = 0, terminated = false, unsubscribed = false;
  let listener: Parameters<CurrentPcb209RatlineContinuationDependency["subscribe"]>[0] | null = null;
  const dependency: CurrentPcb209RatlineContinuationDependency = Object.freeze<CurrentPcb209RatlineContinuationDependency>({
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    retireOriginalRealm: (): never => { throw new Error("No retirement expected"); },
    assertOriginalTermination: (): Promise<void> => { assert.ok(terminated); return Promise.resolve(); },
    subscribe: events => { listener = events; return (): void => { unsubscribed = true; }; },
    assertOriginalBeforeNavigation: (): Promise<void> => Promise.resolve(),
    beginOriginalPcbNavigation: (): Promise<void> => { listener?.lost(); return Promise.resolve(); },
    beginCleanup: (): Promise<void> => { cleanupCalls += 1; return Promise.reject(new Error("original native cleanup admission refused")); },
    requestParent: (): Promise<unknown> => Promise.reject(new Error("No frame proof expected")),
    request: (_role, command): Promise<unknown> => {
      commands += 1;
      switch (command.method) {
        case "Target.setAutoAttach": case "Debugger.setAsyncCallStackDepth": { return Promise.resolve({}); }
        case "Runtime.enable": { listener?.event(event("Runtime.executionContextCreated", { context: uiContext })); return Promise.resolve({}); }
        case "Debugger.enable": { listener?.event(event("Debugger.scriptParsed", uiScript)); return Promise.resolve({ debuggerId: "original" }); }
        case "Debugger.setInstrumentationBreakpoint": { return Promise.resolve({ breakpointId: "original-instrumentation" }); }
        case "Debugger.evaluateOnCallFrame": case "Debugger.getScriptSource": case "Debugger.getStackTrace": case "Debugger.removeBreakpoint":
        case "Debugger.resume": case "Debugger.setBreakpoint": case "Runtime.callFunctionOn": case "Runtime.runIfWaitingForDebugger": case "Target.getTargets": { throw new Error("Native command after refused cleanup admission"); }
        default: { throw new Error("Unknown synthetic command"); }
      }
    },
  });
  const session = new modules.Session(originalContext(), target, dependency);
  await assert.rejects(session.capture(), /FAILED_CLEANUP/u); assert.equal(cleanupCalls, 1); assert.equal(commands, 5);
  await assert.rejects(session.releaseAfterTermination()); terminated = true;
  await session.releaseAfterTermination(); assert.ok(unsubscribed); assert.equal(session.status()["phase"], "released"); assert.equal(commands, 5);
});
