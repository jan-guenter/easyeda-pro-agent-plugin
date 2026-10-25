/* oxlint-disable import/max-dependencies -- This source-owner integration test joins the actual finite dispatcher, inert V8 capture fixture and one labeled source-qualifier substitution. */
import assert from "node:assert/strict";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as budgetProfile } from "../src/current-pcb-209-ratline-budget.ts";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { z } from "zod";
import type { CurrentPcb209RatlinePcbBootstrapDependency, CurrentPcb209RatlinePcbBootstrapOwner } from "../src/current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES, currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl } from "../src/current-pcb-209-ratline-pcb-bootstrap-profile.ts";
import { CurrentPcb209RatlineBootstrapOwner } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import { CurrentPcb209RatlinePcbStartup } from "../src/current-pcb-209-ratline-startup-session.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES } from "../src/current-pcb-209-ratline-creation-profile.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "../src/current-pcb-209-ratline-source.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

type Events = Parameters<CurrentPcb209RatlinePcbBootstrapDependency["subscribe"]>[0];
interface Counts { readonly requests: number; readonly navigation: number; readonly resumes: number; readonly removals: number;
  readonly childStarts: number; readonly sourceReads: number }
const roles = CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES;
const sourceProfile = { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES, currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl };
const frameUrl = "https://client/editor?entry=pcb";
/** Actual owner module. Only large source/creator qualification is replaced
 * for synthetic source events; the profile's separate tests qualify real bytes. */
async function syntheticSourceOwner(): Promise<typeof CurrentPcb209RatlinePcbBootstrapOwner> {
  const path = new URL("../src/current-pcb-209-ratline-pcb-bootstrap-owner.ts", import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`); assert.ok(typeof evaluate === "function");
  const load = (specifier: string): unknown => specifier === "./current-pcb-209-ratline-pcb-bootstrap-profile.ts" ? {
    ...sourceProfile,
    qualifyCurrentPcb209RatlinePcbBootstrapSource: (role: string, raw: unknown): void => { assert.deepEqual(raw, { scriptSource: `fixture:${role}` }); },
    qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator: (_role: string, parent: string): void => { assert.ok(["preload", "api", "engine"].includes(parent)); },
    qualifyCurrentPcb209RatlinePcbBootstrapCopyPause: (_role: string, _script: string, parent: string): void => { assert.ok(["preload", "api", "engine"].includes(parent)); },
  } : actualRequire(specifier) as unknown;
  Reflect.apply(evaluate, undefined, [load, loaded, loaded.exports]); const Constructor = loaded.exports["CurrentPcb209RatlinePcbBootstrapOwner"];
  assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Load the actual module with only its declared source qualifier import substituted for labeled synthetic lifecycle checks.
  return Constructor as typeof CurrentPcb209RatlinePcbBootstrapOwner;
}

async function fixture(context: TestContext, options: Readonly<{ realCapture?: boolean; badSource?: boolean; delayedAllocation?: boolean;
  prematureContext?: boolean }> = {}): Promise<Readonly<{
  owner: CurrentPcb209RatlinePcbBootstrapOwner;
  dependency: CurrentPcb209RatlinePcbBootstrapDependency;
  counts: () => Counts;
  acknowledge: () => void;
  whenRemoved: () => Promise<void>;
  settleNavigation: () => void;
  terminate: () => Promise<void>;
  armChild: () => void;
  v8Counts: () => Readonly<{ pauses: number; resumes: number }>;
}>> {
  const native = options.realCapture === true ? await ratlineCaptureInspector(context, "pcb") : null;
  const allocation = Promise.withResolvers<unknown>(), navigation = Promise.withResolvers<null>(), removed = Promise.withResolvers<null>();
  let events: Events | null = null;
  let armedChild = false, childStarts = 0, constructed = false, index = 0, navigationCalls = 0, preflights = 0, removals = 0, requests = 0, resumes = 0, sourceReads = 0, terminated = false;
  const parent = { targetId: "parent", type: "page", title: "parent", url: "https://client/editor", attached: true };
  const child = { targetId: "child", type: "worker", title: "pcb-ratline-worker", attached: true, url: "https://client/editor?entry=pcb-ratline-worker.js&cll=0" };
  const pcbScriptId = native?.transport.scriptId ?? "pcb";
  const emit = (method: string, params: Readonly<Record<string, unknown>>): void => { events?.event({ sessionId: "parent-session", method, params }); };
  const pause = (): void => {
    const role = roles[index]; if (role === undefined) { return; }
    const scriptId = role === "pcb" ? pcbScriptId : role, url = sourceProfile.currentPcb209RatlinePcbBootstrapRoleUrl(role, frameUrl);
    emit("Debugger.scriptParsed", { scriptId, url, executionContextId: 10, hasSourceURL: false, isLiveEdit: false });
    emit("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: ["original-instrument"], callFrames: [{ location: { scriptId } }] });
  };
  const frameLocation = z.looseObject({ lineNumber: z.number(), columnNumber: z.number() });
  const frame = z.looseObject({ location: frameLocation }), shape = z.looseObject({ callFrames: z.array(frame).min(1) });
  const unsubscribeNative = native?.transport.subscribe({
    paused: raw => { const parsed = shape.parse(raw), point = CURRENT_PCB_209_RATLINE_CREATION_PROFILES.pcb.after, top = parsed.callFrames[0]?.location;
      if (top?.lineNumber === point.lineNumber && top.columnNumber === point.columnNumber) { assert.equal(constructed, false); constructed = true;
        emit("Target.attachedToTarget", { sessionId: "child-session", waitingForDebugger: true, targetInfo: child }); }
      assert.ok(raw !== null && typeof raw === "object"); emit("Debugger.paused", z.record(z.string(), z.unknown()).parse(raw));
    }, resumed: (): void => { emit("Debugger.resumed", {}); }, lost: (): void => { events?.lost(); },
  });
  const dependency: CurrentPcb209RatlinePcbBootstrapDependency = {
    parentTargetId: "parent", parentSessionId: "parent-session",
    assertOriginalOwner: async (): Promise<void> => { assert.equal(terminated, false); await native?.transport.assertOriginalPinnedRealm(CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.pcb); },
    assertOriginalBeforeNavigation: (): Promise<void> => {
      assert.equal(navigationCalls, 0); preflights += 1;
      if (options.prematureContext === true && preflights === 2) {
        emit("Runtime.executionContextCreated", { context: { id: 10, uniqueId: "pcb-context", name: "", origin: "https://client",
          auxData: { frameId: "pcb-frame", isDefault: true, type: "default" } } });
      }
      return Promise.resolve();
    },
    assertOriginalPcbContext: (observation): Promise<void> => {
      assert.deepEqual(observation, { sessionId: "parent-session", parentTargetId: "parent", frameId: "pcb-frame", contextId: 10,
        uniqueContextId: "pcb-context", origin: "https://client", frameUrl: observation.frameUrl === null ? null : frameUrl }); return Promise.resolve();
    },
    beginOriginalPcbNavigation: (): Promise<void> => {
      assert.equal(navigationCalls, 0); navigationCalls += 1;
      emit("Runtime.executionContextCreated", { context: { id: 10, uniqueId: "pcb-context", name: "", origin: "https://client",
        auxData: { frameId: "pcb-frame", isDefault: true, type: "default" } } }); pause();
      return (async (): Promise<void> => { await navigation.promise; })();
    },
    assertOriginalTermination: async (): Promise<void> => { assert.ok(terminated); await native?.transport.assertOriginalTermination(); },
    subscribe: value => { events = value; return (): void => { events = null; }; },
    request: command => {
      requests += 1;
      if (command.method === "Target.getTargets") { return Promise.resolve({ targetInfos: constructed ? [parent, child] : [parent] }); }
      if (command.method === "Runtime.runIfWaitingForDebugger") { assert.ok(armedChild); assert.equal(command.sessionId, "child-session"); childStarts += 1; return Promise.resolve({}); }
      assert.equal(command.sessionId, "parent-session");
      if (command.method === "Debugger.setBreakpoint" || command.method === "Debugger.removeBreakpoint" && command.params.breakpointId !== "original-instrument") {
        assert.ok(native !== null); return native.request(command.method, command.params);
      }
      if (index >= roles.length) { assert.ok(native !== null); return native.request(command.method, command.params); }
      switch (command.method) {
        case "Target.setAutoAttach": case "Runtime.enable": { return Promise.resolve({}); }
        case "Debugger.setAsyncCallStackDepth": { assert.equal(command.params.maxDepth, 1); return Promise.resolve({}); }
        case "Debugger.enable": { return Promise.resolve({ debuggerId: "original-debugger" }); }
        case "Debugger.setInstrumentationBreakpoint": { return options.delayedAllocation === true ? allocation.promise : Promise.resolve({ breakpointId: "original-instrument" }); }
        case "Debugger.getScriptSource": { sourceReads += 1; return Promise.resolve({ scriptSource: options.badSource === true ? "bad-source" : `fixture:${String(roles[index])}` }); }
        case "Debugger.removeBreakpoint": { assert.equal(command.params.breakpointId, "original-instrument"); removals += 1; removed.resolve(null); return Promise.resolve({}); }
        case "Debugger.resume": {
          resumes += 1; emit("Debugger.resumed", {}); index += 1;
          if (index < roles.length) { pause(); }
          else if (native !== null) { void (async (): Promise<void> => { try { await native.run(); navigation.resolve(null); } catch (error) { navigation.reject(error); } })(); }
          return Promise.resolve({});
        }
        case "Debugger.evaluateOnCallFrame": case "Runtime.callFunctionOn": { throw new Error("Unexpected source-phase command"); }
        default: { throw new Error("Unexpected command"); }
      }
    },
  };
  const Constructor = await syntheticSourceOwner(), owner = new Constructor(dependency);
  return { owner, dependency,
    counts: (): Counts => ({ requests, navigation: navigationCalls, resumes, removals, childStarts, sourceReads }),
    acknowledge: (): void => { allocation.resolve({ breakpointId: "original-instrument" }); },
    whenRemoved: async (): Promise<void> => { await removed.promise; }, settleNavigation: (): void => { navigation.resolve(null); },
    terminate: async (): Promise<void> => { unsubscribeNative?.(); await native?.terminate(); terminated = true; await owner.releaseAfterTermination(); },
    armChild: (): void => { assert.equal(armedChild, false); armedChild = true; },
    v8Counts: (): Readonly<{ pauses: number; resumes: number }> => native?.counts() ?? { pauses: 0, resumes: 0 },
  };
}

void test("PCB source owner arms before one opening, hands retained realm to actual V8 composite and settles original navigation", async context => {
  const deadlines: number[] = [], originalSetTimeout = globalThis.setTimeout;
  context.mock.method(globalThis, "setTimeout", (...args: Parameters<typeof setTimeout>): ReturnType<typeof setTimeout> => {
    if (typeof args[1] === "number") { deadlines.push(args[1]); } return originalSetTimeout(...args);
  });
  const f = await fixture(context, { realCapture: true }); await f.owner.armBeforeNavigation(); assert.equal(f.counts().navigation, 0);
  await f.owner.startOriginalNavigation(); const packet = await f.owner.whenSourceQualified();
  assert.equal(f.counts().sourceReads, 29); assert.equal(f.counts().resumes, 28); assert.equal(f.owner.status()["navigationSettled"], false);
  assert.equal(packet.nativeFrameAncestryVerified, false); assert.equal(packet.nativeWorkerTargetIdentityVerified, false);
  await assert.rejects(f.owner.requireOriginal({ ...packet }), /ORIGINAL_PACKET/u);
  const realm = await f.owner.claimOriginalPcbRealm(packet); const before = f.counts().requests;
  await assert.rejects(realm.request({ method: "Debugger.resume", sessionId: packet.sessionId, params: {} }), /REALM_SOURCE_HELD/u);
  assert.equal(f.counts().requests, before);
  const childBootstrapOwner = new CurrentPcb209RatlineBootstrapOwner({
    assertOriginalChild: async (creation, child): Promise<void> => { await creation.requireOriginal(child); },
    observeOriginalFirstScript: (): Promise<void> => Promise.resolve(),
    assertOriginalTermination: f.dependency.assertOriginalTermination,
    subscribe: (): (() => void) => (): void => {
      // This fixture holds the synthetic waiting child without source events.
    },
    request: (command): Promise<unknown> => {
      assert.ok("sessionId" in command); assert.equal(command.sessionId, "child-session");
      switch (command.method) {
        case "Target.setAutoAttach": case "Runtime.enable": case "Debugger.removeBreakpoint": { return Promise.resolve({}); }
        case "Debugger.setAsyncCallStackDepth": { assert.equal(command.params.maxDepth, 1); return Promise.resolve({}); }
        case "Debugger.enable": { return Promise.resolve({ debuggerId: "child-debugger" }); }
        case "Debugger.setInstrumentationBreakpoint": { f.armChild(); return Promise.resolve({ breakpointId: "child-instrument" }); }
        case "Debugger.evaluateOnCallFrame": case "Debugger.getScriptSource": case "Debugger.resume": case "Debugger.setBreakpoint":
        case "Runtime.callFunctionOn": case "Runtime.runIfWaitingForDebugger": { return Promise.reject(new Error("Unexpected child source command")); }
        default: { return Promise.reject(new Error("Unexpected command")); }
      }
    },
  });
  const session = new CurrentPcb209RatlinePcbStartup({ realm, releaseOriginalPinnedSource: (): Promise<void> => f.owner.releaseOriginalPinnedSource(packet), childBootstrapOwner });
  const result = await session.capture(); await f.owner.whenOriginalNavigationSettled();
  assert.equal(result.capture.pauses, 5); assert.equal(result.nativeWorkerTargetIdentityVerified, false);
  assert.deepEqual(f.v8Counts(), { pauses: 7, resumes: 7, subscribers: 1 });
  assert.equal(f.counts().navigation, 1); assert.equal(f.counts().resumes, 29); assert.equal(f.counts().childStarts, 1);
  await assert.rejects(f.owner.startOriginalNavigation(), /NAVIGATION_CONSUMED/u);
  await assert.rejects(f.owner.releaseOriginalPinnedSource(packet), /CONTINUATION_CONSUMED/u);
  for (const slot of budgetProfile.sources.pcb) { assert.ok(deadlines.includes(slot.deadlineMilliseconds), `Missing source deadline for ${slot.stage}`); }
  for (const milliseconds of [budgetProfile.elapsed.ordinaryRequestMilliseconds, budgetProfile.elapsed.ancestryProofMilliseconds,
    budgetProfile.elapsed.sourceReleaseMilliseconds, budgetProfile.elapsed.childArmMilliseconds, budgetProfile.elapsed.creationContinuationMilliseconds,
    budgetProfile.elapsed.capturePauseMilliseconds, budgetProfile.elapsed.captureWaitMilliseconds]) { assert.ok(deadlines.includes(milliseconds)); }
  await session.abort(); await f.owner.abort(); await f.terminate(); await session.releaseAfterTermination();
});

void test("source failure keeps PCB paused and a late opening completion cannot revive or replay it", async context => {
  const f = await fixture(context, { badSource: true }); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation();
  await assert.rejects(f.owner.whenSourceQualified()); assert.equal(f.counts().navigation, 1); assert.equal(f.counts().resumes, 0);
  await f.owner.abort(); assert.equal(f.counts().removals, 1); f.settleNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled(), /NOT_CURRENT/u);
  assert.equal(f.owner.status()["navigationSettled"], true); assert.equal(f.owner.status()["failed"], true);
  await assert.rejects(f.owner.startOriginalNavigation(), /NAVIGATION_CONSUMED/u); assert.equal(f.counts().navigation, 1); await f.terminate();
});

void test("late PCB instrumentation allocation is retained and removed once without navigation or source resume", async context => {
  const f = await fixture(context, { delayedAllocation: true }); await assert.rejects(f.owner.armBeforeNavigation(), /DEADLINE/u);
  await assert.rejects(f.owner.abort(), /UNRESOLVED_ALLOCATION/u); await assert.rejects(f.owner.startOriginalNavigation(), /NOT_ARMED/u);
  f.acknowledge(); await f.whenRemoved(); await f.owner.abort(); assert.equal(f.counts().navigation, 0); assert.equal(f.counts().resumes, 0);
  assert.equal(f.counts().removals, 1); await f.terminate();
});

void test("selected PCB events during pre-navigation reproof refuse before the original opener dispatches", async context => {
  const f = await fixture(context, { prematureContext: true }); await f.owner.armBeforeNavigation();
  await assert.rejects(f.owner.startOriginalNavigation(), /NOT_CURRENT/u);
  assert.equal(f.owner.status()["navigationConsumed"], true); assert.equal(f.owner.status()["navigationDispatched"], false);
  assert.equal(f.counts().navigation, 0); assert.equal(f.counts().sourceReads, 0); assert.equal(f.counts().resumes, 0);
  await f.owner.abort(); await f.terminate();
});
