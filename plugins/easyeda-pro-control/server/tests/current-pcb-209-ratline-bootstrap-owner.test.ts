/* oxlint-disable import/max-dependencies -- This focused integration test loads the actual owner and dispatcher, real V8 creation fixture, native grammar and synthetic source-only module loader together. */
import assert from "node:assert/strict";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as budgetProfile } from "../src/current-pcb-209-ratline-budget.ts";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { setTimeout as delay, setImmediate as immediate } from "node:timers/promises";
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
interface Counts { readonly requests: number; readonly resumes: number; readonly removals: number; readonly sourceReads: number; readonly childStarts: number; readonly firstObservations: number }
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
  syntheticFullChain?: boolean; refuseFirstObservation?: boolean; slowChildProof?: boolean; refuseAllocationProof?: boolean; suppressFirstPause?: boolean;
  copyAsyncOrigin?: "matched" | "foreign" | "missing-bootstrap" | "extra-stack" | "newline-id" | "newline-debugger" }> = {}): Promise<Fixture> {
  const allocation = Promise.withResolvers<unknown>(), inspector = await ratlineCreationInspector(context, "pcb"), removed = Promise.withResolvers<null>();
  let events: Events | null = null, firstObservations = 0, nestedAbort: Promise<void> | null = null, removals = 0, requests = 0, resumes = 0, sourceReads = 0;
  const holder: { owner: CurrentPcb209RatlineBootstrapOwner | null; packet: CurrentPcb209RatlineCreationPacket | null } = { owner: null, packet: null };
  let breakpoints = 0, childProofs = 0, roleIndex = 0, starting = false;
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
    const originalAsyncId = { id: options.copyAsyncOrigin === "newline-id" ? "1\n" : "1",
      debuggerId: options.copyAsyncOrigin === "newline-debugger" ? "parent-debugger\n" : "parent-debugger" };
    const stackTrace = caller === null ? {} : { stackTrace: {
      callFrames: [{ ...creator, scriptId: "preload", url: CURRENT_PCB_209_WORKER_PRELOAD_URL }],
      ...(options.copyAsyncOrigin === undefined ? {} : { parentId: {
        ...originalAsyncId, ...(options.copyAsyncOrigin === "foreign" ? { debuggerId: "foreign-debugger" } : {}),
      } }),
      ...(options.copyAsyncOrigin === "extra-stack" ? { parent: { callFrames: [] } } : {}),
    } };
    emit("Debugger.scriptParsed", { scriptId, url, executionContextId: 1, hasSourceURL: false, isLiveEdit: false, ...stackTrace });
    const callFrames = caller === null ? [{ location: { scriptId } }] : [
      { functionName: "", location: { scriptId, lineNumber: 0, columnNumber: 0 } },
      { functionName: creator.functionName, location: { scriptId: "preload", lineNumber: creator.lineNumber, columnNumber: creator.columnNumber } },
      { functionName: "", location: { scriptId: "preload", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber } },
    ];
    emit("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: [], callFrames,
      ...(options.copyAsyncOrigin === undefined || options.copyAsyncOrigin === "missing-bootstrap" ? {} : { asyncStackTraceId: originalAsyncId }) });
  };
  const creation = new CurrentPcb209RatlinePcbCreation({ ...inspector.transport, request: async (command): Promise<unknown> => {
    if (starting && command.method === "Runtime.runIfWaitingForDebugger") {
      assert.ok(holder.owner !== null && holder.packet !== null);
      await holder.owner.requireOriginalChildStartReady(creation, holder.packet);
      holder.owner.assertOriginalChildStartStillReady(creation, holder.packet);
    }
    const reply = await inspector.transport.request(command);
    if (starting && command.method === "Runtime.runIfWaitingForDebugger" && options.suppressFirstPause !== true) {
      if (options.syntheticFullChain === true) { fullPause(); } else { pause("bootstrap", targetUrl); }
    }
    return reply;
  } });
  const pending = creation.capture(); await creation.whenArmed(); const running = inspector.run(); const packet = await pending; holder.packet = packet;
  const dependency: CurrentPcb209RatlineBootstrapDependency = {
    assertOriginalChild: async (original, result): Promise<void> => {
      assert.equal(original, creation); assert.equal(result, packet); childProofs += 1;
      if (options.refuseAllocationProof === true && childProofs === 10) { throw new Error("Synthetic pre-allocation proof refused"); }
      // Model the concrete callback's serial creation/native proofs. Neither
      // Individual segment consumes more than the unchanged ordinary deadline.
      if (options.slowChildProof === true && childProofs === 1) { await delay(1500); }
      await creation.requireOriginal(result);
      if (options.slowChildProof === true && childProofs === 1) { await delay(1500); }
    },
    observeOriginalFirstScript: async (original, result, owner): Promise<void> => {
      firstObservations += 1; assert.equal(resumes, 0); assert.equal(original, creation); assert.equal(result, packet);
      const first = await owner.requireOriginalFirstScript(original, result);
      assert.equal(first.debuggerId, "child-debugger"); assert.equal(first.uniqueContextId, "child-context");
      assert.equal(first.scriptId, "bootstrap");
      await assert.rejects(owner.requireOriginalFirstScript(original, { ...result }), /FIRST_SCRIPT_OWNER/u);
      const constructor = await creation.requireOriginalConstructor(result); assert.equal(constructor.parentSessionId, "parent-session");
      assert.equal(constructor.scriptId, inspector.transport.scriptId);
      await assert.rejects(creation.requireOriginalConstructor({ ...result }), /ORIGINAL_PACKET/u);
      if (options.refuseFirstObservation === true) { throw new Error("Original origin observer failed"); }
    },
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
        case "Debugger.setAsyncCallStackDepth": { assert.equal(command.params.maxDepth, 1); return Promise.resolve({}); }
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
    start: async (): Promise<void> => { await creation.continueOriginalParent(packet); starting = true; await creation.startOriginalChild(packet); },
    counts: (): Counts => ({ requests, resumes, removals, sourceReads, childStarts: inspector.counts().childStarts, firstObservations }) };
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

void test("ratline preload copies bind their async parent to the retained original bootstrap pause", async context => {
  const f = await fixture(context, { syntheticFullChain: true, copyAsyncOrigin: "matched" });
  await f.owner.armOriginalChildBootstrap(f.creation, f.packet); await f.start();
  const packet = await f.owner.whenSourceQualified();
  assert.equal(f.counts().sourceReads, 7); assert.equal(f.counts().resumes, 6);
  assert.equal(packet.nativeWorkerTargetIdentityVerified, false);
  assert.equal(f.owner.status()["firstRejectedEvent"], null); await f.finish();
});

void test("ratline preload rejects foreign or unproved async ancestry and retains its first complete event", async context => {
  for (const copyAsyncOrigin of ["foreign", "missing-bootstrap", "extra-stack", "newline-id", "newline-debugger"] as const) {
    await context.test(copyAsyncOrigin, async child => {
      const f = await fixture(child, { syntheticFullChain: true, copyAsyncOrigin });
      await f.owner.armOriginalChildBootstrap(f.creation, f.packet); await f.start();
      await assert.rejects(f.owner.whenSourceQualified());
      assert.equal(f.counts().sourceReads, 2); assert.equal(f.counts().resumes, 2);
      const failure = f.owner.status()["firstFailure"], retained = f.owner.status()["firstRejectedEvent"];
      assert.ok(failure !== null && typeof failure === "object");
      assert.equal(Reflect.get(failure, "step"), "copy-creator-metadata");
      assert.equal(Reflect.get(failure, "stage"), "preload-copy-1");
      assert.ok(retained !== null && typeof retained === "object"); assert.equal(Reflect.get(retained, "status"), "captured");
      const event: unknown = Reflect.get(retained, "value"); assert.ok(event !== null && typeof event === "object");
      assert.equal(Reflect.get(event, "method"), "Debugger.scriptParsed"); assert.ok(Object.isFrozen(event));
      const text = JSON.stringify(event); assert.equal(Reflect.get(retained, "bytes"), Buffer.byteLength(text));
      assert.equal(Reflect.get(retained, "sha256"), createHash("sha256").update(text).digest("hex"));
      f.emit("Runtime.exceptionThrown", { laterCleanup: true });
      assert.equal(f.owner.status()["firstRejectedEvent"], retained); assert.equal(f.owner.status()["firstFailure"], failure);
      await f.finish(); assert.equal(f.counts().sourceReads, 2); assert.equal(f.counts().resumes, 2);
    });
  }
});

void test("first child pause allowance begins at original start after delayed permission and retains immediate pause", async context => {
  const f = await fixture(context, { syntheticFullChain: true });
  await f.owner.armOriginalChildBootstrap(f.creation, f.packet);
  await f.owner.requireOriginalChildStartReady(f.creation, f.packet);
  assert.equal(f.owner.status()["firstPauseWindowStarted"], false);
  await delay(budgetProfile.elapsed.ordinaryRequestMilliseconds + 50);
  assert.equal(f.owner.status()["failed"], false); assert.equal(f.counts().childStarts, 0);
  await f.start(); const packet = await f.owner.whenSourceQualified();
  assert.equal(packet.importedSourceHeldBeforeExecution, true);
  assert.equal(f.owner.status()["firstPauseWindowStarted"], true); assert.equal(f.owner.status()["firstFailure"], null);
  assert.equal(f.counts().childStarts, 1); assert.equal(f.counts().firstObservations, 1); await f.finish();
});

void test("first child missing its post-dispatch pause still fails the original finite allowance", async context => {
  const f = await fixture(context, { suppressFirstPause: true });
  await f.owner.armOriginalChildBootstrap(f.creation, f.packet);
  const rejected = assert.rejects(f.owner.whenSourceQualified(), /FAILED/u);
  await f.start(); await rejected;
  assert.equal(f.counts().childStarts, 1); assert.equal(f.counts().sourceReads, 0);
  const failure = f.owner.status()["firstFailure"]; assert.ok(failure !== null && typeof failure === "object");
  assert.equal(Reflect.get(failure, "reason"), "PCB209_RATLINE_BOOTSTRAP_DEADLINE");
  await f.finish(); assert.equal(f.owner.status()["firstFailure"], failure); assert.equal(f.counts().childStarts, 1);
});

void test("changed bootstrap source refuses before its first continuation", async context => {
  const f = await fixture(context, { badBootstrap: true });
  await f.owner.armOriginalChildBootstrap(f.creation, f.packet); await f.start(); await assert.rejects(f.owner.whenSourceQualified());
  assert.equal(f.counts().resumes, 0); assert.equal(f.counts().sourceReads, 1); await f.finish();
});

void test("foreign child event poisons original source owner and changed methods cannot revive it", async context => {
  const f = await fixture(context); await f.owner.armOriginalChildBootstrap(f.creation, f.packet);
  f.emit("Debugger.resumed", {}, "foreign-session"); await assert.rejects(f.owner.whenSourceQualified());
  const failure = f.owner.status()["firstFailure"]; assert.ok(failure !== null && typeof failure === "object");
  assert.equal(Reflect.get(failure, "reason"), "PCB209_RATLINE_BOOTSTRAP_EVENT_SESSION");
  assert.equal(Reflect.get(failure, "lastEvent"), "Debugger.resumed");
  assert.equal(f.counts().resumes, 0); await f.finish(); assert.equal(f.owner.status()["firstFailure"], failure);
});

void test("first child accepts serial creation/native proof windows and refuses pre-dispatch allocation loss without ambiguity", async context => {
  const slow = await fixture(context, { slowChildProof: true });
  await slow.owner.armOriginalChildBootstrap(slow.creation, slow.packet);
  assert.equal(slow.owner.status()["armed"], true); assert.equal(slow.owner.status()["firstFailure"], null); await slow.finish();
  const refused = await fixture(context, { refuseAllocationProof: true });
  await assert.rejects(refused.owner.armOriginalChildBootstrap(refused.creation, refused.packet), /pre-allocation/u);
  assert.equal(refused.counts().requests, 4); assert.equal(refused.owner.status()["unresolvedInstrumentation"], false); await refused.finish();
});

void test("late instrumentation acknowledgement is retained and removed once after arming deadline", async context => {
  const f = await fixture(context, { delayedAllocation: true });
  await assert.rejects(f.owner.armOriginalChildBootstrap(f.creation, f.packet), /DEADLINE/u);
  assert.equal(f.owner.status()["unresolvedInstrumentation"], true);
  await assert.rejects(f.owner.abort(), /UNRESOLVED_ALLOCATION/u);
  await assert.rejects(f.owner.settleOriginalInstrumentationAfterAbort(f.creation, { ...f.packet }), /CLEANUP_OWNER/u);
  let settled = false;
  const cleanup = (async (): Promise<void> => { await f.owner.settleOriginalInstrumentationAfterAbort(f.creation, f.packet); settled = true; })();
  await immediate(); assert.equal(settled, false); assert.equal(f.counts().removals, 0);
  f.acknowledge(); await cleanup; await f.whenRemoved();
  await assert.rejects(f.owner.requireOriginalChildStartReady(f.creation, f.packet));
  await f.finish(); assert.equal(f.counts().removals, 1); assert.equal(f.counts().resumes, 0);
});

void test("synthetic full source chain hands original worker realm to actual dispatcher before one source continuation", async context => {
  const deadlines: number[] = [], originalSetTimeout = globalThis.setTimeout;
  context.mock.method(globalThis, "setTimeout", (...args: Parameters<typeof setTimeout>): ReturnType<typeof setTimeout> => {
    if (typeof args[1] === "number") { deadlines.push(args[1]); } return originalSetTimeout(...args);
  });
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
  for (const slot of budgetProfile.sources.child) { assert.ok(deadlines.includes(slot.deadlineMilliseconds), `Missing source deadline for ${slot.stage}`); }
  assert.ok(deadlines.includes(budgetProfile.elapsed.ordinaryRequestMilliseconds));
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

void test("original first-script observer runs before any import resume and refuses copied owners without replay", async context => {
  const f = await fixture(context, { refuseFirstObservation: true }); await f.owner.armOriginalChildBootstrap(f.creation, f.packet);
  await f.start(); await assert.rejects(f.owner.whenSourceQualified());
  assert.equal(f.counts().firstObservations, 1); assert.equal(f.counts().sourceReads, 1); assert.equal(f.counts().resumes, 0);
  assert.equal(f.counts().childStarts, 1); await f.finish(); assert.equal(f.counts().resumes, 0);
});
