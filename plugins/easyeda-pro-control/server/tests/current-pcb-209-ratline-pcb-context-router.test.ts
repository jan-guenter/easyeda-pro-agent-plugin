/* oxlint-disable import/max-dependencies -- Exercise the actual context observer, router and source owner; only large source/creator qualification is replaced for explicitly synthetic events. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentPcbDiagnosticContext } from "../src/current-pcb-diagnostic-context.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import type { CurrentPcb209RatlinePcbBootstrapOwner } from "../src/current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import type { CurrentPcb209RatlinePcbContextCommand, CurrentPcb209RatlinePcbContextDependency, CurrentPcb209RatlinePcbContextRouter } from "../src/current-pcb-209-ratline-pcb-context-router.ts";
import { currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl,
  CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES as roles } from "../src/current-pcb-209-ratline-pcb-bootstrap-profile.ts";

import { CURRENT_PCB_209_RATLINE_NAVIGATION_SOURCE as navigationSource } from "../src/current-pcb-209-ratline-navigation-pause.ts";
import { CURRENT_PCB_209_RATLINE_LOADER_SOURCE_SHA256 as loaderHash, CURRENT_PCB_209_RATLINE_LOADER_SOURCE as loaderSource } from "../src/current-pcb-209-ratline-loader-pause.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";

import { CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256 as windowHash } from "../src/current-pcb-209-ratline-window-pause.ts";

const source = "const retainedUi = true;";
const rawWindowsPath = String.raw`C:\Disposable\Router.eprj2`;
const documentUuid = "d".repeat(16), projectUuid = createHash("sha256").update(rawWindowsPath).digest("hex");
const base = "https://client/editor?cll=warn", projectUrl = `${base}#id=${projectUuid}`, tab = `${documentUuid}@${projectUuid}`;
const openedUrl = `${projectUrl},tab=*${tab}`, pcbUrl = "https://client/editor?entry=pcb";
const target = { rawWindowsPath, projectUuid, documentUuid, branchUuid: "b".repeat(32), expectedSourceSha256: "c".repeat(64) };
const parent = { targetId: "parent", type: "page", title: "retained", url: `${base}#`, attached: false };
const root = { id: "root", loaderId: "root-loader", url: base, securityOrigin: "https://client", urlFragment: "#" };
const uiContext = { id: 1, uniqueId: "ui-context", origin: "https://client", name: "", auxData: { frameId: "root", isDefault: true, type: "default" } };
const uiScript = { scriptId: "ui-script", executionContextId: 1, url: "https://client/pro-ui/fixture/js/ui.js", hasSourceURL: false };
const pcbFrame = { id: "pcb-frame", parentId: "root", loaderId: "pcb-loader", url: pcbUrl, securityOrigin: "https://client" };
const pcbContext = { id: 3, uniqueId: "pcb-context", origin: "https://client", name: "", auxData: { frameId: "pcb-frame", isDefault: true, type: "default" } };
function event(method: string, params: Record<string, unknown>): DiagnosticEvent { return { method, params, sessionId: "parent-session" }; }
function loaderFrame(functionName: string, scriptId: string, lineNumber: number, start: number, stopped: number): object {
  return { functionName, url: "", functionLocation: { scriptId, lineNumber, columnNumber: start }, location: { scriptId, lineNumber, columnNumber: stopped } };
}
function loaderObservations(): Readonly<{ script: DiagnosticEvent; paused: DiagnosticEvent }> {
  return { script: event("Debugger.scriptParsed", { scriptId: "loader", executionContextId: 1, url: "", hasSourceURL: false, isLiveEdit: false,
    isModule: false, startLine: 0, startColumn: 0, endLine: 3, endColumn: 2, length: 28, hash: loaderHash,
    scriptLanguage: "JavaScript", sourceMapURL: "", stackTrace: { callFrames: [{ functionName: "by", scriptId: "ui-script",
      url: `https://modules.lceda.cn/${CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath}`, lineNumber: 1923, columnNumber: 75_140 }] } }),
    paused: event("Debugger.paused", { reason: "instrumentation", data: { scriptId: "loader", url: "" }, hitBreakpoints: [],
      callFrames: [loaderFrame("", "loader", 0, 0, 0), loaderFrame("by", "ui-script", 1923, 75_126, 75_140), loaderFrame("", "ui-script", 1931, 3752, 4009)] }) };
}
function windowObservations(stage: "initial" | "document"): Readonly<{ script: DiagnosticEvent; paused: DiagnosticEvent }> {
  const scriptId = `window-${stage}`, top = loaderFrame("", scriptId, 0, 0, 0);
  const points = [["", 1931, 1315, 1931, 1320], ["n", 1923, 80_850, 1931, 91], ["create", 1923, 80_633, 1931, 1313],
    ["create", 1923, 80_386, 1923, 80_406], ["by", 1923, 75_126, 1923, 76_601]] as const;
  const callers = points.map(([functionName, line, column, stoppedLine, stoppedColumn]) => ({ functionName, url: "",
    functionLocation: { scriptId: "ui-script", lineNumber: line, columnNumber: column },
    location: { scriptId: "ui-script", lineNumber: stoppedLine, columnNumber: stoppedColumn } }));
  return { script: event("Debugger.scriptParsed", { scriptId, executionContextId: stage === "initial" ? 2 : 3, url: "", hasSourceURL: false,
    isLiveEdit: false, isModule: false, startLine: 0, startColumn: 0, endLine: 0, endColumn: 6, length: 6, hash: windowHash,
    scriptLanguage: "JavaScript", sourceMapURL: "", ...(stage === "initial" ? { stackTrace: { callFrames: [{ functionName: "", scriptId: "ui-script",
      url: `https://modules.lceda.cn/${CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath}`, lineNumber: 1931, columnNumber: 1320 }], parentId: { id: "3" } } } : {}) }),
    paused: event("Debugger.paused", { reason: "instrumentation", data: { scriptId, url: "" }, hitBreakpoints: [],
      callFrames: stage === "initial" ? [top, ...callers] : [top] }) };
}
function originalContext(): CurrentPcbDiagnosticContext {
  const context = new CurrentPcbDiagnosticContext("parent"); context.selectTarget({ targetInfos: [parent] }); context.bindSession("parent-session");
  context.observeFrames({ frameTree: { frame: root } }); context.selectFrame("root", { family: "ui", relativePath: "pro-ui/fixture/js/ui.js",
    scriptBytes: Buffer.byteLength(source), scriptSha256: createHash("sha256").update(source).digest("hex") });
  context.observeEvent(event("Runtime.executionContextCreated", { context: uiContext })); context.observeEvent(event("Debugger.scriptParsed", uiScript));
  context.finish({ scriptSource: source }, { targetInfos: [{ ...parent, attached: true }] }, { frameTree: { frame: root } });
  context.beginOpeningTransition(projectUuid); context.observeEvent(event("Page.navigatedWithinDocument", { frameId: "root", url: projectUrl, navigationType: "fragment" }));
  context.finishOpeningTransition({ targetInfos: [{ ...parent, attached: true, url: projectUrl }] },
    { frameTree: { frame: { ...root, urlFragment: `#id=${projectUuid}` } } }); return context;
}
async function loadModule(file: string, replacement: (specifier: string) => unknown): Promise<Record<string, unknown>> {
  const path = new URL(`../src/${file}`, import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => replacement(specifier) ?? actualRequire(specifier) as unknown, loaded, loaded.exports]); return loaded.exports;
}
async function routerConstructor(): Promise<typeof CurrentPcb209RatlinePcbContextRouter> {
  const sourceModule = await loadModule("current-pcb-209-ratline-pcb-bootstrap-owner.ts", specifier => specifier === "./current-pcb-209-ratline-pcb-bootstrap-profile.ts" ? {
    CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES: roles, currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl,
    qualifyCurrentPcb209RatlinePcbBootstrapSource: (role: string, raw: unknown): void => { assert.deepEqual(raw, { scriptSource: `synthetic:${role}` }); },
    qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator: (): void => {
      // Exact generated-source metadata is covered by its separate source tests.
    },
    qualifyCurrentPcb209RatlinePcbBootstrapCopyPause: (): void => {
      // Only source qualification is substituted, never context or routing.
    },
  } : undefined);
  const loaded = await loadModule("current-pcb-209-ratline-pcb-context-router.ts", specifier => specifier === "./current-pcb-209-ratline-pcb-bootstrap-owner.ts" ? sourceModule : undefined);
  const Constructor = loaded["CurrentPcb209RatlinePcbContextRouter"]; assert.equal(typeof Constructor, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This is the unchanged actual router module loaded with the actual source owner and its labeled source-only substitution.
  return Constructor as typeof CurrentPcb209RatlinePcbContextRouter;
}
type Events = Parameters<CurrentPcb209RatlinePcbContextDependency["subscribe"]>[0];
async function fixture(options: Readonly<{ badReplay?: boolean; badDom?: boolean; foreignPause?: boolean; delayMilliseconds?: number;
  navigationPause?: "valid" | "source-change" | "foreign-context" | "lost-resume-ack" | "historical-script";
  loaderPause?: "valid" | "source-change" | "historical-script" | "settled-navigation" | "duplicate"; holdNavigationAck?: boolean;
  windowPause?: "valid" | "source-change" | "duplicate" | "foreign-context" | "lost-resume-ack";
  initialOwnershipCommit?: "reuse" | "destroy" | "replace-identical";
  cleanupFailure?: boolean; lateCleanupEvents?: boolean; beforeInitialSource?: (phase: "navigation" | "loader") => Promise<unknown> }> = {}): Promise<Readonly<{
  router: CurrentPcb209RatlinePcbContextRouter; owner: CurrentPcb209RatlinePcbBootstrapOwner;
  counts: () => Readonly<{ navigation: number; resumes: number; sources: number; snapshots: number; removals: number }>;
  emit: (value: DiagnosticEvent) => void; finishNavigation: () => void; changeFrame: () => void; terminate: () => Promise<void>;
  navigationResumeRequested: Promise<null>; acknowledgeNavigationResume: () => void; loaderCounts: () => Readonly<{ sources: number; resumes: number }>;
  cleanupCount: () => number; windowCounts: () => Readonly<{ sources: number; resumes: number }>;
}>> {
  const Constructor = await routerConstructor(), context = originalContext(), navigation = Promise.withResolvers<null>();
  const navigationAck = Promise.withResolvers<null>(), navigationResumeRequested = Promise.withResolvers<null>();
  let cleanupCalls = 0, initialWindow = false, loaderResumes = 0, loaderSources = 0, windowResumes = 0, windowSources = 0;
  let drift = false, index = 0, listener: Events | null = null, removals = 0, resumes = 0, snapshots = 0, sources = 0, started = 0, terminated = false;
  let lastPause: DiagnosticEvent | null = null;
  let committedDuringOwnership = false, instrumentationHeld = false;
  const activePcbContext = options.initialOwnershipCommit === undefined ? pcbContext : { ...pcbContext, id: 2, uniqueId: "initial-blank" };
  const ownership = new Map<string, Readonly<{ breakpointId: string; callFrames: unknown }>>();
  const emit = (value: DiagnosticEvent): void => {
    if (value.method === "Debugger.paused") { lastPause = value; instrumentationHeld = value.params["reason"] === "instrumentation"; }
    else if (value.method === "Debugger.resumed") { instrumentationHeld = false; }
    listener?.event(value);
  };
  const pause = (): void => {
    const role = roles[index]; if (role === undefined) { return; }
    const url = currentPcb209RatlinePcbBootstrapRoleUrl(role, pcbUrl);
    emit(event("Debugger.scriptParsed", { scriptId: role, executionContextId: activePcbContext.id, url, hasSourceURL: false, isLiveEdit: false, startLine: 0, startColumn: 0 }));
    emit(event("Debugger.paused", { reason: "instrumentation", data: { scriptId: role, url }, hitBreakpoints: ["instrumentation"],
      callFrames: [loaderFrame("", options.foreignPause === true ? "ui-script" : role, 0, 0, 0)] }));
  };
  const emitWindow = (stage: "initial" | "document"): void => {
    const observation = windowObservations(stage);
    let script = observation.script;
    if (options.windowPause === "foreign-context" && stage === "initial") {
      script = { ...script, params: { ...script.params, executionContextId: 1 } };
    } else if (stage === "document") { script = { ...script, params: { ...script.params, executionContextId: activePcbContext.id } }; }
    emit(script); emit(observation.paused);
    if (options.windowPause === "duplicate") { emit(observation.paused); }
  };
  const commitPcb = (): void => {
    initialWindow = false;
    if (!committedDuringOwnership) {
      emit(event("Runtime.executionContextDestroyed", { executionContextId: 2, executionContextUniqueId: "initial-blank" }));
      emit(event("Page.frameNavigated", { frame: pcbFrame, type: "Navigation" }));
      emit(event("Runtime.executionContextCreated", { context: pcbContext }));
    }
    if (options.windowPause === undefined) { pause(); } else { emitWindow("document"); }
  };
  const beginPcb = (): void => {
      emit(event("Page.navigatedWithinDocument", { frameId: "root", url: openedUrl, navigationType: "fragment" }));
      emit(event("Page.frameAttached", { frameId: "pcb-frame", parentFrameId: "root" }));
      emit(event("Runtime.executionContextCreated", { context: { ...pcbContext, id: 2, uniqueId: "initial-blank" } }));
      if (options.windowPause === undefined) { commitPcb(); } else { initialWindow = true; emitWindow("initial"); }
  };
  const emitNavigationScript = (): void => {
    emit(event("Debugger.scriptParsed", { scriptId: "navigation", executionContextId: options.navigationPause === "foreign-context" ? 2 : 1,
      url: "", hasSourceURL: false, isLiveEdit: false, startLine: 0, startColumn: 0, length: navigationSource.length }));
  };
  const commitDuringOwnership = (): void => {
    if (options.initialOwnershipCommit !== "reuse") {
      emit(event("Runtime.executionContextDestroyed", { executionContextId: 2, executionContextUniqueId: "initial-blank" }));
      if (options.initialOwnershipCommit === "replace-identical") { emit(event("Runtime.executionContextCreated", { context: activePcbContext })); }
    }
    emit(event("Page.frameNavigated", { frame: pcbFrame, type: "Navigation" })); committedDuringOwnership = true;
  };
  async function request(command: CurrentPcb209RatlinePcbContextCommand): Promise<unknown> {
      if (options.delayMilliseconds !== undefined) { const delay = Promise.withResolvers<null>(); setTimeout(() => { delay.resolve(null); }, options.delayMilliseconds); await delay.promise; }
      if ("ownershipPhase" in command) {
        if (command.method === "Debugger.setBreakpoint") {
          assert.ok(lastPause); assert.equal(instrumentationHeld, true);
          const breakpointId = `owned-${command.ownershipStage}`;
          ownership.set(command.ownershipStage, { breakpointId, callFrames: lastPause.params["callFrames"] });
          return { breakpointId, actualLocation: { ...command.params.location } };
        }
        const current = ownership.get(command.ownershipStage); assert.ok(current);
        if (command.method === "Debugger.resume") {
          emit(event("Debugger.resumed", {}));
          emit(event("Debugger.paused", { reason: "other", hitBreakpoints: [current.breakpointId], callFrames: current.callFrames }));
          if (command.ownershipStage === "initial-window" && options.initialOwnershipCommit !== undefined) {
            commitDuringOwnership();
          }
        } else { assert.equal(command.params.breakpointId, current.breakpointId); ownership.delete(command.ownershipStage); }
        return {};
      }
      switch (command.method) {
        case "Target.setAutoAttach": { return ({}); }
        case "Runtime.enable": { emit(event("Runtime.executionContextCreated", { context: options.badReplay === true ? { ...uiContext, origin: "https://foreign" } : uiContext })); return ({}); }
        case "Debugger.enable": { emit(event("Debugger.scriptParsed", uiScript)); if (options.navigationPause === "historical-script") { emitNavigationScript(); }
          if (options.loaderPause === "historical-script") { emit(loaderObservations().script); } return ({ debuggerId: "debugger" }); }
        case "Debugger.setAsyncCallStackDepth": { assert.equal(command.params.maxDepth, 1); return ({}); }
        case "Debugger.setInstrumentationBreakpoint": { return ({ breakpointId: "instrumentation" }); }
        case "Debugger.getScriptSource": { if ("navigationPhase" in command) {
            assert.notEqual(options.navigationPause, "foreign-context"); assert.notEqual(options.navigationPause, "historical-script");
            await options.beforeInitialSource?.("navigation"); return { scriptSource: navigationSource + (options.navigationPause === "source-change" ? " " : "") };
          }
          if ("loaderPhase" in command) { loaderSources += 1; await options.beforeInitialSource?.("loader"); return { scriptSource: loaderSource + (options.loaderPause === "source-change" ? " " : "") }; }
          if ("windowPhase" in command) { windowSources += 1; return { scriptSource: options.windowPause === "source-change" ? "void 1" : "void 0" }; }
          sources += 1; return ({ scriptSource: `synthetic:${String(roles[index])}` }); }
        case "Debugger.removeBreakpoint": { removals += 1; return ({}); }
        case "Debugger.resume": { if ("navigationPhase" in command) {
          if (options.navigationPause === "lost-resume-ack") { listener?.lost(); throw new Error("lost native resume acknowledgement"); }
          emit(event("Debugger.resumed", {}));
          if (options.loaderPause === undefined) { beginPcb(); } else {
            const loader = loaderObservations(); if (options.loaderPause !== "historical-script") { emit(loader.script); }
            emit(loader.paused); if (options.loaderPause === "duplicate") { emit(loader.paused); }
          }
          navigationResumeRequested.resolve(null);
          if (options.holdNavigationAck === true) { await navigationAck.promise; }
          if (options.loaderPause === "settled-navigation") { navigation.resolve(null); }
          return {};
        }
          if ("loaderPhase" in command) { loaderResumes += 1; emit(event("Debugger.resumed", {})); beginPcb(); return {}; }
          if ("windowPhase" in command) {
            windowResumes += 1;
            if (options.windowPause === "lost-resume-ack") { listener?.lost(); throw new Error("window resume acknowledgment lost"); }
            emit(event("Debugger.resumed", {}));
            if (command.windowPhase === "initial-resume") { commitPcb(); } else { pause(); } return {};
          }
          resumes += 1; emit(event("Debugger.resumed", {})); index += 1; pause(); return ({}); }
        case "Target.getTargets": { snapshots += 1; return ({ targetInfos: [{ ...parent, attached: true, url: openedUrl }] }); }
        case "Page.getFrameTree": { assert.equal(instrumentationHeld, false); snapshots += 1; return ({ frameTree: { frame: { ...root, urlFragment: openedUrl.slice(base.length) },
          childFrames: [{ frame: { ...pcbFrame, ...(drift ? { loaderId: "replacement" } : {}) } }] } }); }
        case "DOM.getFrameOwner": { assert.equal(instrumentationHeld, false); snapshots += 1; assert.equal(command.params.frameId, "pcb-frame"); return ({ backendNodeId: 17 }); }
        case "DOM.describeNode": {
          assert.equal(instrumentationHeld, false);
          snapshots += 1; assert.deepEqual(command.params, { backendNodeId: 17, depth: 0, pierce: false });
          return ({ node: { backendNodeId: 17, nodeType: 1, nodeName: "IFRAME", localName: "iframe", frameId: "pcb-frame",
            attributes: ["id", `frame_${tab}`, "c_dbid", options.badDom === true ? "foreign" : tab, "c_doctype", "3", "src", "editor?entry=pcb", ...(initialWindow ? [] : ["pcb-canvas", "true"]), "class", "editframe"] } });
        }
        case "Debugger.evaluateOnCallFrame": case "Debugger.setBreakpoint": case "Runtime.callFunctionOn": case "Runtime.runIfWaitingForDebugger": { throw new Error("Unexpected synthetic command"); }
        default: { throw new Error("Unknown synthetic command"); }
      }
  }
  const dependency: CurrentPcb209RatlinePcbContextDependency = Object.freeze<CurrentPcb209RatlinePcbContextDependency>({ parentSessionId: "parent-session", parentTargetId: "parent",
    assertOriginalOwner: async (): Promise<void> => {
      assert.equal(terminated, false);
      if (options.delayMilliseconds !== undefined) { const delay = Promise.withResolvers<null>(); setTimeout(() => { delay.resolve(null); }, options.delayMilliseconds); await delay.promise; }
    },
    assertOriginalBeforeNavigation: (): Promise<void> => { assert.equal(started, 0); context.openingContext(); return Promise.resolve(); },
    assertOriginalTermination: (): Promise<void> => { assert.equal(terminated, true); return Promise.resolve(); },
    beginOriginalPcbNavigation: (): Promise<void> => {
      assert.equal(started, 0); started += 1;
      if (options.navigationPause === undefined) { beginPcb(); } else {
        if (options.navigationPause === "foreign-context") { emit(event("Runtime.executionContextCreated", { context: { ...uiContext, id: 2, uniqueId: "isolated-context",
          auxData: { frameId: "root", isDefault: false, type: "isolated" } } })); }
        if (options.navigationPause !== "historical-script") { emitNavigationScript(); }
        const location = { scriptId: "navigation", lineNumber: 0, columnNumber: 0 };
        emit(event("Debugger.paused", { reason: "instrumentation", data: { scriptId: "navigation", url: "" }, hitBreakpoints: [],
          callFrames: [{ functionName: "", url: "", location, functionLocation: { ...location } }] }));
      } return (async (): Promise<void> => { await navigation.promise; })();
    }, subscribe: (events: Events): (() => void) => { assert.equal(listener, null); listener = events; return (): void => {
      cleanupCalls += 1;
      if (options.lateCleanupEvents === true) { events.lost(); events.event(event("Debugger.paused", {})); }
      if (options.cleanupFailure === true) { throw new Error("synthetic disposer outcome uncertain"); }
      listener = null;
    }; },
    request, requestParent: request,
  });
  const router = new Constructor(context, target, dependency);
  return { router, owner: router.sourceOwner, counts: (): Readonly<{ navigation: number; resumes: number; sources: number; snapshots: number; removals: number }> =>
    ({ navigation: started, resumes, sources, snapshots, removals }), emit, finishNavigation: (): void => { navigation.resolve(null); }, changeFrame: (): void => { drift = true; },
    navigationResumeRequested: navigationResumeRequested.promise, acknowledgeNavigationResume: (): void => { navigationAck.resolve(null); },
    loaderCounts: (): Readonly<{ sources: number; resumes: number }> => ({ sources: loaderSources, resumes: loaderResumes }),
    cleanupCount: (): number => cleanupCalls, windowCounts: (): Readonly<{ sources: number; resumes: number }> => ({ sources: windowSources, resumes: windowResumes }),
    terminate: async (): Promise<void> => { terminated = true; await router.releaseAfterTermination(); } };
}
void test("actual context/router/source owner retain old enable replay and blank teardown, qualify held PCB with pending navigation and exactly three proof sets", async () => {
  const f = await fixture(); await f.owner.armBeforeNavigation(); assert.equal(f.counts().navigation, 0);
  await f.owner.startOriginalNavigation(); const packet = await f.owner.whenSourceQualified();
  assert.deepEqual(f.counts(), { navigation: 1, resumes: 28, sources: 29, snapshots: 4, removals: 1 });
  assert.equal(f.owner.status()["navigationSettled"], false); assert.equal(f.router.status()["proofSets"], 1);
  const realm = await f.owner.claimOriginalPcbRealm(packet); realm.subscribe({ paused: (): never => { throw new Error("Unexpected successor pause"); },
    resumed: (): void => { assert.equal(f.counts().resumes, 29); }, attached: (): never => { throw new Error("Unexpected child"); },
    lost: (): void => { assert.equal(f.router.status()["failed"], true); } });
  await f.router.releaseOriginalPinnedSource(packet); await f.router.reproveFirstChildHeld(packet);
  assert.equal(f.counts().snapshots, 12); assert.equal(f.counts().resumes, 29); assert.equal(f.router.status()["proofSets"], 3);
  assert.equal(f.router.status()["nativeWorkerTargetIdentityVerified"], false);
  f.finishNavigation(); await f.owner.whenOriginalNavigationSettled(); await f.router.abort(); await f.terminate();
});
void test("changed historical Runtime replay refuses before any PCB navigation or source read", async () => {
  const f = await fixture({ badReplay: true }); await assert.rejects(f.owner.armBeforeNavigation());
  const state = f.router.status(); const failure = state["firstFailure"]; assert.ok(failure !== null && typeof failure === "object");
  assert.equal(Reflect.get(failure, "lastEvent"), "Runtime.executionContextCreated");
  assert.equal(Reflect.get(failure, "transitionStarted"), false); assert.ok(typeof Reflect.get(failure, "reason") === "string");
  const sourceState = state["sourceOwner"]; assert.ok(sourceState !== null && typeof sourceState === "object");
  assert.equal(Reflect.get(sourceState, "failed"), true); assert.ok(Object.isFrozen(failure));
  assert.deepEqual(f.counts(), { navigation: 0, resumes: 0, sources: 0, snapshots: 0, removals: 0 }); await f.router.abort(); await f.terminate();
  assert.equal(f.router.status()["firstFailure"], failure);
});
void test("foreign debugger pause and incorrect DOM owner refuse before any source execution", async () => {
  for (const options of [{ foreignPause: true }, { badDom: true }]) {
    const f = await fixture(options); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); await assert.rejects(f.owner.whenSourceQualified());
    // The source-qualified ordinary entry transfer reads the first source before
    // DOM admission, while its first statement remains paused and unexecuted.
    assert.equal(f.counts().resumes, 0); assert.equal(f.counts().sources, options.badDom === true ? 1 : 0); assert.equal(f.router.status()["failed"], true);
    const failure = f.router.status()["firstFailure"]; assert.ok(failure !== null && typeof failure === "object");
    if (options.foreignPause === true) { assert.equal(Reflect.get(failure, "reason"), "PCB209_RATLINE_CONTEXT_FOREIGN_PAUSE");
      assert.equal(Reflect.get(failure, "lastEvent"), "Debugger.paused"); }
    f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
  }
});
void test("fresh parent frame drift blocks final PCB continuation and late navigation completion cannot restore it", async () => {
  const f = await fixture(); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); const packet = await f.owner.whenSourceQualified();
  f.changeFrame(); await assert.rejects(f.router.releaseOriginalPinnedSource(packet)); assert.equal(f.counts().resumes, 28);
  f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
});

void test("composed ancestry retains four serial snapshots with individual owner and request deadlines", async context => {
  const original = globalThis.setTimeout;
  context.mock.method(globalThis, "setTimeout", (...args: Parameters<typeof setTimeout>): ReturnType<typeof setTimeout> => {
    if (typeof args[1] === "number") { args[1] /= 100; } return original(...args);
  });
  const f = await fixture({ delayMilliseconds: 1200 }); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation();
  await f.owner.whenSourceQualified(); assert.equal(f.router.status()["proofSets"], 1);
  assert.equal(f.router.status()["firstFailure"], null); assert.equal(f.owner.status()["firstFailure"], null);
  assert.deepEqual(f.counts(), { navigation: 1, resumes: 28, sources: 29, snapshots: 4, removals: 1 });
  f.finishNavigation(); await f.owner.whenOriginalNavigationSettled(); await f.router.abort(); await f.terminate();
});
void test("selected context destruction poisons original source while navigation remains pending", async () => {
  const f = await fixture(); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); const packet = await f.owner.whenSourceQualified();
  f.emit(event("Runtime.executionContextDestroyed", { executionContextId: 3, executionContextUniqueId: "pcb-context" }));
  await assert.rejects(f.owner.requireOriginal(packet)); await assert.rejects(f.router.releaseOriginalPinnedSource(packet)); assert.equal(f.counts().resumes, 28);
  f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
});

void test("original navigation instrumentation is qualified and resumed once without consuming PCB bootstrap ordinals", async () => {
  const f = await fixture({ navigationPause: "valid" }); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation();
  await f.owner.whenSourceQualified(); assert.equal(f.router.status()["navigationPause"], "complete");
  assert.deepEqual(f.counts(), { navigation: 1, resumes: 28, sources: 29, snapshots: 4, removals: 1 });
  assert.equal(f.router.retainedRejectedStopEvidence(), null);
  f.finishNavigation(); await f.owner.whenOriginalNavigationSettled(); await f.router.abort(); await f.terminate();
});
void test("navigation source mismatch and lost resume acknowledgement retain the original bounded rejected stop without source continuation", async () => {
  for (const navigationPause of ["source-change", "lost-resume-ack"] as const) {
    const f = await fixture({ navigationPause }); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation();
    await assert.rejects(f.owner.whenSourceQualified()); assert.equal(f.counts().sources, 0); assert.equal(f.counts().resumes, 0);
    const retained = f.router.retainedRejectedStopEvidence(); assert.ok(retained !== null); assert.equal(retained.event.status, "captured");
    assert.equal(retained.script.status, "captured"); assert.equal(retained.context.status, "captured");
    assert.equal(retained.metadata.observedTopScriptContextId, 1); assert.equal(retained.executionAuthorized, false);
    f.emit(event("Debugger.paused", { reason: "other", callFrames: [] })); assert.equal(f.router.retainedRejectedStopEvidence(), retained);
    f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
    assert.equal(f.router.retainedRejectedStopEvidence(), retained);
  }
});

void test("foreign UI context and historical identical script refuse navigation source/resume before dispatch", async () => {
  for (const navigationPause of ["foreign-context", "historical-script"] as const) {
    const f = await fixture({ navigationPause }); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation();
    await assert.rejects(f.owner.whenSourceQualified()); assert.equal(f.counts().sources, 0); assert.equal(f.counts().resumes, 0);
    const evidence = f.router.retainedRejectedStopEvidence(); assert.ok(evidence !== null);
    assert.equal(evidence.event.status, "captured"); assert.equal(evidence.context.status, "captured");
    assert.equal(evidence.metadata.observedTopScriptContextId, navigationPause === "foreign-context" ? 2 : 1);
    const failure = f.router.status()["firstFailure"]; assert.ok(failure !== null && typeof failure === "object");
    assert.equal(Reflect.get(failure, "reason"), navigationPause === "foreign-context" ? "PCB209_RATLINE_NAVIGATION_PAUSE" : "PCB209_RATLINE_CONTEXT_NAVIGATION_SCRIPT_EVENT");
    f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
  }
});
void test("bounded recent script provenance evicts old captures and retains a newly issued navigation script", async () => {
  const f = await fixture({ navigationPause: "valid" }); await f.owner.armBeforeNavigation();
  for (let index = 0; index < 40; index += 1) {
    f.emit(event("Debugger.scriptParsed", { scriptId: `old-${String(index)}`, executionContextId: 1,
      url: "", hasSourceURL: false, isLiveEdit: false, diagnosticPadding: "x".repeat(10_000) }));
  }
  assert.equal(f.router.status()["scriptEvidenceExhausted"], true);
  const bytes = f.router.status()["retainedScriptEvidenceBytes"]; assert.ok(typeof bytes === "number" && bytes <= 131_072);
  await f.owner.startOriginalNavigation(); await f.owner.whenSourceQualified(); assert.equal(f.router.status()["navigationPause"], "complete");
  f.finishNavigation(); await f.owner.whenOriginalNavigationSettled(); await f.router.abort(); await f.terminate();
});
void test("loader pause preceding navigation resume acknowledgement waits for that original reply without advancing PCB ordinals", async () => {
  const f = await fixture({ navigationPause: "valid", loaderPause: "valid", holdNavigationAck: true });
  try {
    await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); await f.navigationResumeRequested;
    assert.equal(f.router.status()["navigationPause"], "resume"); assert.equal(f.router.status()["loaderPause"], "source");
    assert.deepEqual(f.loaderCounts(), { sources: 0, resumes: 0 }); assert.equal(f.counts().sources, 0); assert.equal(f.counts().resumes, 0);
    f.acknowledgeNavigationResume(); await f.owner.whenSourceQualified();
    assert.equal(f.router.status()["navigationPause"], "complete"); assert.equal(f.router.status()["loaderPause"], "complete");
    assert.deepEqual(f.loaderCounts(), { sources: 1, resumes: 1 });
    assert.deepEqual(f.counts(), { navigation: 1, resumes: 28, sources: 29, snapshots: 4, removals: 1 });
    assert.equal(f.owner.status()["navigationSettled"], false);
    f.finishNavigation(); await f.owner.whenOriginalNavigationSettled();
  } finally { f.acknowledgeNavigationResume(); f.finishNavigation(); await f.router.abort(); await f.terminate(); }
});
void test("first PCB pause allows composed navigation and loader source waits while each retains its individual deadline", async context => {
  const loaderEntered = Promise.withResolvers<null>(), loaderRelease = Promise.withResolvers<null>();
  const navigationEntered = Promise.withResolvers<null>(), navigationRelease = Promise.withResolvers<null>();
  const f = await fixture({ navigationPause: "valid", loaderPause: "valid", beforeInitialSource: phase => {
    if (phase === "navigation") { navigationEntered.resolve(null); return navigationRelease.promise; }
    loaderEntered.resolve(null); return loaderRelease.promise;
  } });
  context.mock.timers.enable({ apis: ["setTimeout"] });
  try {
    await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); await navigationEntered.promise;
    context.mock.timers.tick(2000); navigationRelease.resolve(null); await loaderEntered.promise;
    context.mock.timers.tick(2000); loaderRelease.resolve(null); await f.owner.whenSourceQualified();
    assert.equal(f.router.status()["loaderPause"], "complete"); assert.deepEqual(f.loaderCounts(), { sources: 1, resumes: 1 });
    assert.equal(f.counts().sources, 29); assert.equal(f.counts().resumes, 28);
    f.finishNavigation(); await f.owner.whenOriginalNavigationSettled();
  } finally { navigationRelease.resolve(null); loaderRelease.resolve(null); f.finishNavigation(); await f.router.abort(); await f.terminate(); }
});
void test("changed loader source, stale provenance, settled opener and duplicate pause cannot resume or start PCB source reads", async () => {
  for (const loaderPause of ["source-change", "historical-script", "settled-navigation", "duplicate"] as const) {
    const f = await fixture({ navigationPause: "valid", loaderPause });
    try {
      await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); await assert.rejects(f.owner.whenSourceQualified());
      assert.deepEqual(f.loaderCounts(), { sources: loaderPause === "source-change" ? 1 : 0, resumes: 0 });
      assert.equal(f.counts().sources, 0); assert.equal(f.counts().resumes, 0); assert.equal(f.router.status()["failed"], true);
      const evidence = f.router.retainedRejectedStopEvidence(); assert.ok(evidence !== null); assert.equal(evidence.event.status, "captured");
    } finally { f.finishNavigation(); await f.router.abort(); await f.terminate(); }
  }
});
void test("router cleanup reports disposal failure without replay and ignores terminal callback traffic", async () => {
  for (const cleanupFailure of [false, true]) {
    const f = await fixture({ cleanupFailure, lateCleanupEvents: true }); await f.owner.armBeforeNavigation();
    if (cleanupFailure) {
      await assert.rejects(f.terminate(), /synthetic disposer outcome uncertain/u);
      assert.equal(f.router.status()["released"], false); assert.throws(() => { f.router.assertCurrent(); }, /NOT_CURRENT/u);
      await assert.rejects(f.terminate(), /synthetic disposer outcome uncertain/u);
    } else { await f.terminate(); assert.equal(f.router.status()["released"], true); assert.equal(f.router.status()["failed"], false); }
    assert.equal(f.cleanupCount(), 1);
  }
});

for (const initialOwnershipCommit of [undefined, "reuse"] as const) {
void test(`both Electron hooks preserve PCB ordinals with ${initialOwnershipCommit === undefined ? "ordinary teardown" : "original Window reuse during ownership"}`, async () => {
  const f = await fixture({ navigationPause: "valid", loaderPause: "valid", windowPause: "valid",
    ...(initialOwnershipCommit === undefined ? {} : { initialOwnershipCommit }) });
  try {
    await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); const packet = await f.owner.whenSourceQualified();
    assert.deepEqual(f.router.status()["windowPauses"], { initial: "complete", document: "complete" });
    assert.deepEqual(f.windowCounts(), { sources: 2, resumes: 2 });
    assert.deepEqual(f.counts(), { navigation: 1, resumes: 28, sources: 29, snapshots: 6, removals: 1 });
    const realm = await f.owner.claimOriginalPcbRealm(packet); realm.subscribe({ paused: (): never => { throw new Error("Unexpected successor pause"); },
      resumed: (): void => { assert.equal(f.counts().resumes, 29); }, attached: (): never => { throw new Error("Unexpected child"); },
      lost: (): void => { assert.equal(f.router.status()["failed"], true); } });
    await f.router.releaseOriginalPinnedSource(packet); await f.router.reproveFirstChildHeld(packet);
    assert.equal(f.router.status()["proofCommands"], 14); assert.equal(f.router.status()["proofSets"], 3);
  } finally { f.finishNavigation(); await f.router.abort(); await f.terminate(); }
});
}
void test("initial ownership loses authority after context destruction or replacement before commit", async () => {
  for (const initialOwnershipCommit of ["destroy", "replace-identical"] as const) {
    const f = await fixture({ navigationPause: "valid", loaderPause: "valid", windowPause: "valid", initialOwnershipCommit });
    try {
      await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); await assert.rejects(f.owner.whenSourceQualified());
      assert.deepEqual(f.windowCounts(), { sources: 1, resumes: 0 });
      assert.deepEqual(f.counts(), { navigation: 1, resumes: 0, sources: 0, snapshots: 0, removals: 0 });
      const firstFailure = f.router.status()["firstFailure"]; assert.ok(firstFailure !== null && typeof firstFailure === "object");
      assert.equal(Reflect.get(firstFailure, "reason"), "PCB_DIAGNOSTIC_CONTEXT_IDENTITY");
      assert.equal(Reflect.get(firstFailure, "step"), "window-initial-identity");
      assert.ok(f.router.retainedRejectedStopEvidence());
      f.emit(event("Debugger.paused", {})); assert.equal(f.router.status()["firstFailure"], firstFailure);
    } finally { f.finishNavigation(); await f.router.abort(); await f.terminate(); }
  }
});
void test("initial window source, context, duplicate and missing resume acknowledgement cannot continue PCB imports", async () => {
  for (const windowPause of ["source-change", "foreign-context", "duplicate", "lost-resume-ack"] as const) {
    const f = await fixture({ navigationPause: "valid", loaderPause: "valid", windowPause });
    try {
      await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); await assert.rejects(f.owner.whenSourceQualified());
      assert.equal(f.counts().sources, 0); assert.equal(f.counts().resumes, 0);
      assert.ok(f.router.retainedRejectedStopEvidence());
      assert.deepEqual(f.windowCounts(), { sources: ["source-change", "lost-resume-ack"].includes(windowPause) ? 1 : 0,
        resumes: windowPause === "lost-resume-ack" ? 1 : 0 });
    } finally { f.finishNavigation(); await f.router.abort(); await f.terminate(); }
  }
});
