/* oxlint-disable import/max-dependencies -- This focused integration test loads the actual owner and dispatcher, real V8 creation fixture, native grammar and synthetic source-only module loader together. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentPcb209RatlineBootstrapOwner } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineBootstrapDependency } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import { CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES, CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES, CURRENT_PCB_209_RATLINE_WORKER_URL,
  currentPcb209RatlineBootstrapRoleUrl, qualifyCurrentPcb209RatlineBootstrapSource,
  qualifyCurrentPcb209RatlineBootstrapUrl } from "../src/current-pcb-209-ratline-bootstrap-profile.ts";
import { CURRENT_PCB_209_PRELOAD_COPY_SOURCE, CURRENT_PCB_209_WORKER_PRELOAD_LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL,
  currentPcb209PreloadCopyCaller } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import { CurrentPcb209RatlinePcbCreation } from "../src/current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCreationPacket } from "../src/current-pcb-209-ratline-creation-runner.ts";
import { currentPcb209RatlineNativeWire } from "../src/current-pcb-209-ratline-native-wire.ts";
import { ratlineCreationInspector } from "./helpers/current-pcb-209-ratline-creation-inspector.ts";
import { CurrentPcb209RatlineEventDispatcher } from "../src/current-pcb-209-ratline-event-dispatcher.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES } from "../src/current-pcb-209-ratline-creation-profile.ts";

type Events = Parameters<CurrentPcb209RatlineBootstrapDependency["subscribe"]>[0];
const targetUrl = "https://client/editor?entry=pcb-ratline-worker.js&cll=0";
const bootstrap = CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES[0]; assert.ok(bootstrap !== undefined);
const profile = Object.freeze({ CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES, CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES,
  CURRENT_PCB_209_RATLINE_WORKER_URL, currentPcb209RatlineBootstrapRoleUrl, qualifyCurrentPcb209RatlineBootstrapSource, qualifyCurrentPcb209RatlineBootstrapUrl });
interface Counts { readonly requests: number; readonly resumes: number; readonly removals: number; readonly sourceReads: number; readonly childStarts: number }
interface Fixture {
  readonly owner: CurrentPcb209RatlineBootstrapOwner;
  readonly creation: CurrentPcb209RatlinePcbCreation;
  readonly packet: CurrentPcb209RatlineCreationPacket;
  readonly dependency: CurrentPcb209RatlineBootstrapDependency;
  readonly emit: (method: string, params: Readonly<Record<string, unknown>>, sessionId?: string) => void;
  readonly finish: () => Promise<void>;
  readonly acknowledge: () => void;
  readonly whenRemoved: () => Promise<void>;
  readonly start: () => Promise<void>;
  readonly counts: () => Counts;
}
/** Same actual owner module with one test-only import substitution for large
 * vendor source replies. This proves lifecycle logic, not source admission. */
async function syntheticSourceOwner(): Promise<typeof CurrentPcb209RatlineBootstrapOwner> {
  const path = new URL("../src/current-pcb-209-ratline-bootstrap-owner.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const actualRequire = createRequire(path), transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`); assert.ok(typeof evaluate === "function");
  const load = (specifier: string): unknown => specifier === "./current-pcb-209-ratline-bootstrap-profile.ts" ? {
    ...profile, qualifyCurrentPcb209RatlineBootstrapSource: (role: string, raw: unknown): void => {
      if (role === "bootstrap") { profile.qualifyCurrentPcb209RatlineBootstrapSource(role, raw); }
      else { assert.deepEqual(raw, { scriptSource: `fixture:${role}` }); }
    },
  } : actualRequire(specifier) as unknown;
  Reflect.apply(evaluate, undefined, [load, loaded, loaded.exports]); const Constructor = loaded.exports["CurrentPcb209RatlineBootstrapOwner"];
  assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The exact owner module is loaded with only its declared source qualifier substituted for labeled synthetic lifecycle tests.
  return Constructor as typeof CurrentPcb209RatlineBootstrapOwner;
}

/** Real V8 parent constructor owner, synthetic CDP child/source replies. The
 * preload intentionally fails whole installed-source qualification. */
async function fixture(context: TestContext, options: Readonly<{ badBootstrap?: boolean; reentrantRemoval?: boolean; delayedAllocation?: boolean;
  syntheticFullChain?: boolean }> = {}): Promise<Fixture> {
  const allocation = Promise.withResolvers<unknown>(), inspector = await ratlineCreationInspector(context, "pcb"), removed = Promise.withResolvers<null>();
  let events: Events | null = null, nestedAbort: Promise<void> | null = null, removals = 0, requests = 0, resumes = 0, sourceReads = 0;
  const holder: { owner: CurrentPcb209RatlineBootstrapOwner | null } = { owner: null };
  let breakpoints = 0, roleIndex = 0;
  const emit = (method: string, params: Readonly<Record<string, unknown>>, sessionId = "child-session"): void => { events?.event({ method, params, sessionId }); };
  const pause = (scriptId: string, url: string): void => {
    emit("Debugger.scriptParsed", { scriptId, executionContextId: 1, url, hasSourceURL: false, isLiveEdit: false });
    emit("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: ["instrument"],
      callFrames: [{ location: { scriptId, lineNumber: 0, columnNumber: 0 } }] });
  };
  const fullPause = (): void => {
    const role = profile.CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES[roleIndex]; if (role === undefined) { return; }
    const scriptId = role, url = profile.currentPcb209RatlineBootstrapRoleUrl(role, targetUrl);
    if (roleIndex === 6) {
      const log = CURRENT_PCB_209_WORKER_PRELOAD_LOG;
      emit("Runtime.consoleAPICalled", { type: "log", args: [{ type: "string", value: log.message }], executionContextId: 1, timestamp: 1,
        stackTrace: { callFrames: [{ scriptId: "preload", url: CURRENT_PCB_209_WORKER_PRELOAD_URL, functionName: log.functionName,
          lineNumber: log.lineNumber, columnNumber: log.columnNumber }] } });
    }
    const caller = role === "worker" ? null : currentPcb209PreloadCopyCaller(role), creator = CURRENT_PCB_209_PRELOAD_COPY_SOURCE.creator;
    const stackTrace = caller === null ? {} : { stackTrace: { callFrames: [{ ...creator, scriptId: "preload", url: CURRENT_PCB_209_WORKER_PRELOAD_URL }] } };
    emit("Debugger.scriptParsed", { scriptId, url, executionContextId: 1, hasSourceURL: false, isLiveEdit: false, ...stackTrace });
    const callFrames = caller === null ? [{ location: { scriptId } }] : [
      { functionName: "", location: { scriptId, lineNumber: 0, columnNumber: 0 } },
      { functionName: creator.functionName, location: { scriptId: "preload", lineNumber: creator.lineNumber, columnNumber: creator.columnNumber } },
      { functionName: "", location: { scriptId: "preload", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber } },
    ];
    emit("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: [], callFrames });
  };
  const creation = new CurrentPcb209RatlinePcbCreation({ ...inspector.transport, request: async (command): Promise<unknown> => {
    const reply = await inspector.transport.request(command);
    if (command.method === "Runtime.runIfWaitingForDebugger") {
      if (options.syntheticFullChain === true) { fullPause(); } else { pause("bootstrap", targetUrl); }
    }
    return reply;
  } });
  const pending = creation.capture(); await creation.whenArmed(); const running = inspector.run(); const packet = await pending;
  const dependency: CurrentPcb209RatlineBootstrapDependency = {
    assertOriginalChild: async (original, result): Promise<void> => { assert.equal(original, creation); assert.equal(result, packet); await creation.requireOriginal(result); },
    assertOriginalTermination: inspector.transport.assertOriginalTermination,
    request: command => {
      requests += 1;
      if (command.method !== "Target.getTargets") { assert.ok(command.sessionId === "child-session" || command.sessionId === "subordinate-session"); }
      assert.equal(currentPcb209RatlineNativeWire(options.syntheticFullChain === true ? "worker" : "pcb", command, requests).command.method, command.method);
      switch (command.method) {
        case "Runtime.enable": {
          emit("Runtime.executionContextCreated", { context: { id: 1, uniqueId: "child-context", name: "pcb-ratline-worker", origin: targetUrl } });
          return Promise.resolve({});
        }
        case "Debugger.enable": { return Promise.resolve({ debuggerId: "child-debugger" }); }
        case "Debugger.setInstrumentationBreakpoint": { return options.delayedAllocation === true ? allocation.promise : Promise.resolve({ breakpointId: "instrument" }); }
        case "Debugger.getScriptSource": {
          sourceReads += 1;
          if (options.syntheticFullChain === true) { return Promise.resolve({ scriptSource: roleIndex === 0 ? bootstrap : `fixture:${String(profile.CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES[roleIndex])}` }); }
          return Promise.resolve({ scriptSource: command.params.scriptId === "bootstrap" ? `${bootstrap}${options.badBootstrap === true ? "\n" : ""}` : "unqualified preload" });
        }
        case "Debugger.resume": {
          resumes += 1; emit("Debugger.resumed", {});
          if (options.syntheticFullChain === true) { roleIndex += 1; fullPause(); } else { pause("preload", CURRENT_PCB_209_WORKER_PRELOAD_URL); }
          return Promise.resolve({});
        }
        case "Debugger.removeBreakpoint": {
          removals += 1; if (options.reentrantRemoval === true) { assert.ok(holder.owner !== null); nestedAbort = holder.owner.abort(); }
          removed.resolve(null); return Promise.resolve({});
        }
        case "Target.setAutoAttach": { return Promise.resolve({}); }
        case "Debugger.setBreakpoint": { breakpoints += 1; return Promise.resolve({ breakpointId: `worker-fixed-${String(breakpoints)}`, actualLocation: command.params.location }); }
        case "Runtime.runIfWaitingForDebugger": { return Promise.resolve({}); }
        case "Debugger.evaluateOnCallFrame": case "Runtime.callFunctionOn": case "Target.getTargets": { throw new Error("Unexpected realm command"); }
        default: { throw new Error("Unexpected source command"); }
      }
    },
    subscribe: value => { events = value; return (): void => { events = null; }; },
  };
  const Constructor = options.syntheticFullChain === true ? await syntheticSourceOwner() : CurrentPcb209RatlineBootstrapOwner;
  const owner = new Constructor(dependency); holder.owner = owner;
  const finish = async (): Promise<void> => {
    await owner.abort(); await nestedAbort; await creation.abort(); await running; await inspector.terminate();
    await owner.releaseAfterTermination(); await creation.releaseAfterTermination();
  };
  return { owner, creation, packet, dependency, emit, finish,
    acknowledge: (): void => { allocation.resolve({ breakpointId: "instrument" }); },
    whenRemoved: async (): Promise<void> => { await removed.promise; },
    start: async (): Promise<void> => { await creation.continueOriginalParent(packet); await creation.startOriginalChild(packet); },
    counts: (): Counts => ({ requests, resumes, removals, sourceReads, childStarts: inspector.counts().childStarts }) };
}

void test("fixed ratline bootstrap derives exact imports and refuses altered source, hostile replies and URL aliases", () => {
  for (const source of CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES) {
    assert.ok(source.endsWith("importScripts('https://modules.lceda.cn/pro-pcb/3.2.195.6b67774e/js/ratlineworker.js');"));
    assert.doesNotThrow(() => { qualifyCurrentPcb209RatlineBootstrapSource("bootstrap", { scriptSource: source }); });
    assert.throws(() => { qualifyCurrentPcb209RatlineBootstrapSource("bootstrap", { scriptSource: `${source}\n` }); });
  }
  let getters = 0;
  const accessor = Object.defineProperty({}, "scriptSource", { get(): string { getters += 1; return bootstrap; } });
  for (const bad of [accessor, new Proxy({ scriptSource: bootstrap }, {}), { scriptSource: bootstrap, extra: "" }, { scriptSource: "\uD800" }]) {
    assert.throws(() => { qualifyCurrentPcb209RatlineBootstrapSource("bootstrap", bad); });
  }
  assert.equal(getters, 0);
  const hash = createHash("sha256").update(targetUrl.slice("https://client/".length)).digest("hex");
  assert.doesNotThrow(() => { qualifyCurrentPcb209RatlineBootstrapUrl("pcb", targetUrl, hash); });
  for (const bad of [targetUrl.replace("client/", "client:443/"), `${targetUrl}#x`, `${targetUrl}&other=1`, targetUrl.replace("&cll=0", "&cll=%30")]) {
    assert.throws(() => { qualifyCurrentPcb209RatlineBootstrapUrl("pcb", bad, hash); });
  }
  assert.throws(() => { qualifyCurrentPcb209RatlineBootstrapUrl("worker", targetUrl, hash); });
});

void test("original child source owner rejects copied creation packet before child commands", async context => {
  const f = await fixture(context);
  await assert.rejects(f.owner.armOriginalChildBootstrap(f.creation, { ...f.packet }), /ORIGINAL_PACKET/u);
  assert.equal(f.counts().requests, 0); await f.finish();
});

void test("source owner arms before sole creation start, then holds unqualified preload without a second resume", async context => {
  const f = await fixture(context, { reentrantRemoval: true });
  await f.owner.armOriginalChildBootstrap(f.creation, f.packet); assert.equal(f.counts().childStarts, 0);
  await assert.rejects(f.owner.armOriginalChildBootstrap(f.creation, f.packet), /ARM_CONSUMED/u);
  await f.start(); await assert.rejects(f.owner.whenSourceQualified());
  assert.equal(f.counts().resumes, 1); assert.equal(f.counts().sourceReads, 2); assert.equal(f.counts().childStarts, 1);
  await f.finish(); assert.equal(f.counts().removals, 1); assert.equal(f.counts().resumes, 1); assert.equal(f.counts().childStarts, 1);
});

void test("changed bootstrap source refuses before its first continuation", async context => {
  const f = await fixture(context, { badBootstrap: true });
  await f.owner.armOriginalChildBootstrap(f.creation, f.packet); await f.start(); await assert.rejects(f.owner.whenSourceQualified());
  assert.equal(f.counts().resumes, 0); assert.equal(f.counts().sourceReads, 1); await f.finish();
});

void test("foreign child event poisons original source owner and changed methods cannot revive it", async context => {
  const f = await fixture(context); await f.owner.armOriginalChildBootstrap(f.creation, f.packet);
  f.emit("Debugger.resumed", {}, "foreign-session"); await assert.rejects(f.owner.whenSourceQualified());
  assert.equal(f.counts().resumes, 0); await f.finish();
});

void test("late instrumentation acknowledgement is retained and removed once after arming deadline", async context => {
  const f = await fixture(context, { delayedAllocation: true });
  await assert.rejects(f.owner.armOriginalChildBootstrap(f.creation, f.packet), /DEADLINE/u);
  assert.equal(f.owner.status()["unresolvedInstrumentation"], true);
  await assert.rejects(f.owner.abort(), /UNRESOLVED_ALLOCATION/u); f.acknowledge();
  await f.whenRemoved();
  await f.finish(); assert.equal(f.counts().removals, 1); assert.equal(f.counts().resumes, 0);
});

void test("synthetic full source chain hands original worker realm to actual dispatcher before one source continuation", async context => {
  const f = await fixture(context, { syntheticFullChain: true }); await f.owner.armOriginalChildBootstrap(f.creation, f.packet);
  await f.owner.requireOriginalChildStartReady(f.creation, f.packet); await f.start(); const packet = await f.owner.whenSourceQualified();
  assert.equal(f.counts().sourceReads, 7); assert.equal(f.counts().resumes, 6); assert.equal(packet.nativeWorkerTargetIdentityVerified, false);
  const realm = await f.owner.claimOriginalWorkerRealm(packet); await assert.rejects(f.owner.claimOriginalWorkerRealm(packet), /CLAIM_CONSUMED/u);
  const beforeSourceResume = f.counts().requests;
  await assert.rejects(realm.request({ method: "Debugger.resume", sessionId: packet.childSessionId, params: {} }), /REALM_SOURCE_HELD/u);
  assert.equal(f.counts().requests, beforeSourceResume);
  const dispatcher = new CurrentPcb209RatlineEventDispatcher("worker", realm); dispatcher.claimOriginalStages();
  await dispatcher.continueOriginalSource(() => f.owner.releaseOriginalPinnedSource(packet)); assert.equal(f.counts().resumes, 7);
  await assert.rejects(f.owner.releaseOriginalPinnedSource(packet), /CONTINUATION_CONSUMED/u);
  const before = f.counts().requests;
  const refused: unknown = Reflect.apply(realm.request, realm, [{ method: "Runtime.enable", params: {}, sessionId: packet.childSessionId }]);
  assert.ok(refused instanceof Promise); await assert.rejects(refused, /REALM_COMMAND/u);
  const point = CURRENT_PCB_209_RATLINE_CREATION_PROFILES.worker.before;
  await assert.rejects(realm.request({ method: "Debugger.setBreakpoint", sessionId: packet.childSessionId,
    params: { location: { scriptId: "foreign-script", lineNumber: point.lineNumber, columnNumber: point.columnNumber } } }), /REALM_SCRIPT/u);
  await assert.rejects(realm.request({ method: "Runtime.runIfWaitingForDebugger", sessionId: "unobserved-session", params: {} }), /REALM_CHILD_START/u);
  assert.equal(f.counts().requests, before);
  await f.finish(); await dispatcher.releaseAfterTermination();
});

void test("ratline loaded notification leaves actual capture pending and refuses early, malformed, duplicate and foreign events", async context => {
  const cases = ["accepted", "early", "malformed", "duplicate", "foreign"] as const;
  for (const sample of cases) {
    await context.test(sample, async childContext => {
      const f = await fixture(childContext, { syntheticFullChain: true }); await f.owner.armOriginalChildBootstrap(f.creation, f.packet);
      await f.start(); const packet = await f.owner.whenSourceQualified(), realm = await f.owner.claimOriginalWorkerRealm(packet);
      const dispatcher = new CurrentPcb209RatlineEventDispatcher("worker", realm), stages = dispatcher.claimOriginalStages();
      const capture = stages.capture.capture(), rejectedCapture = assert.rejects(capture);
      await stages.capture.whenArmed();
      if (sample !== "early") { await dispatcher.continueOriginalSource(() => f.owner.releaseOriginalPinnedSource(packet)); }
      const before = f.counts().requests;
      f.emit("Inspector.workerScriptLoaded", sample === "malformed" ? { success: true } : {}, sample === "foreign" ? "foreign-session" : packet.childSessionId);
      if (sample === "duplicate") { f.emit("Inspector.workerScriptLoaded", {}); }
      const observed = sample === "accepted" || sample === "duplicate";
      assert.equal(f.owner.status()["workerScriptLoadedObserved"], observed);
      assert.equal(f.owner.status()["failed"], sample !== "accepted");
      if (sample === "accepted") {
        await dispatcher.requireOriginal();
        assert.equal(stages.capture.status()["settled"], false); assert.equal(stages.capture.status()["events"], 0);
        assert.equal(stages.capture.status()["failed"], false); assert.equal(f.counts().requests, before);
      } else { await assert.rejects(dispatcher.requireOriginal()); }
      await stages.capture.abort(); await rejectedCapture; await f.finish();
      await stages.capture.releaseAfterTermination(); await dispatcher.releaseAfterTermination();
    });
  }
});
