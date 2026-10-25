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
async function fixture(options: Readonly<{ badReplay?: boolean; badDom?: boolean; foreignPause?: boolean }> = {}): Promise<Readonly<{
  router: CurrentPcb209RatlinePcbContextRouter; owner: CurrentPcb209RatlinePcbBootstrapOwner;
  counts: () => Readonly<{ navigation: number; resumes: number; sources: number; snapshots: number; removals: number }>;
  emit: (value: DiagnosticEvent) => void; finishNavigation: () => void; changeFrame: () => void; terminate: () => Promise<void>;
}>> {
  const Constructor = await routerConstructor(), context = originalContext(), navigation = Promise.withResolvers<null>();
  let drift = false, index = 0, listener: Events | null = null, removals = 0, resumes = 0, snapshots = 0, sources = 0, started = 0, terminated = false;
  const emit = (value: DiagnosticEvent): void => { listener?.event(value); };
  const pause = (): void => {
    const role = roles[index]; if (role === undefined) { return; }
    const url = currentPcb209RatlinePcbBootstrapRoleUrl(role, pcbUrl);
    emit(event("Debugger.scriptParsed", { scriptId: role, executionContextId: 3, url, hasSourceURL: false, isLiveEdit: false }));
    emit(event("Debugger.paused", { reason: "instrumentation", data: { scriptId: role, url }, hitBreakpoints: ["instrumentation"],
      callFrames: [{ location: { scriptId: options.foreignPause === true ? "ui-script" : role } }] }));
  };
  function request(command: CurrentPcb209RatlinePcbContextCommand): Promise<unknown> {
      switch (command.method) {
        case "Target.setAutoAttach": { return Promise.resolve({}); }
        case "Runtime.enable": { emit(event("Runtime.executionContextCreated", { context: options.badReplay === true ? { ...uiContext, origin: "https://foreign" } : uiContext })); return Promise.resolve({}); }
        case "Debugger.enable": { emit(event("Debugger.scriptParsed", uiScript)); return Promise.resolve({ debuggerId: "debugger" }); }
        case "Debugger.setAsyncCallStackDepth": { assert.equal(command.params.maxDepth, 1); return Promise.resolve({}); }
        case "Debugger.setInstrumentationBreakpoint": { return Promise.resolve({ breakpointId: "instrumentation" }); }
        case "Debugger.getScriptSource": { sources += 1; return Promise.resolve({ scriptSource: `synthetic:${String(roles[index])}` }); }
        case "Debugger.removeBreakpoint": { removals += 1; return Promise.resolve({}); }
        case "Debugger.resume": { resumes += 1; emit(event("Debugger.resumed", {})); index += 1; pause(); return Promise.resolve({}); }
        case "Target.getTargets": { snapshots += 1; return Promise.resolve({ targetInfos: [{ ...parent, attached: true, url: openedUrl }] }); }
        case "Page.getFrameTree": { snapshots += 1; return Promise.resolve({ frameTree: { frame: { ...root, urlFragment: openedUrl.slice(base.length) },
          childFrames: [{ frame: { ...pcbFrame, ...(drift ? { loaderId: "replacement" } : {}) } }] } }); }
        case "DOM.getFrameOwner": { snapshots += 1; assert.equal(command.params.frameId, "pcb-frame"); return Promise.resolve({ backendNodeId: 17 }); }
        case "DOM.describeNode": {
          snapshots += 1; assert.deepEqual(command.params, { backendNodeId: 17, depth: 0, pierce: false });
          return Promise.resolve({ node: { backendNodeId: 17, nodeType: 1, nodeName: "IFRAME", localName: "iframe", frameId: "pcb-frame",
            attributes: ["id", `frame_${tab}`, "c_dbid", options.badDom === true ? "foreign" : tab, "c_doctype", "3", "src", "editor?entry=pcb", "pcb-canvas", "true", "class", "editframe"] } });
        }
        case "Debugger.evaluateOnCallFrame": case "Debugger.setBreakpoint": case "Runtime.callFunctionOn": case "Runtime.runIfWaitingForDebugger": { return Promise.reject(new Error("Unexpected synthetic command")); }
        default: { return Promise.reject(new Error("Unknown synthetic command")); }
      }
  }
  const dependency: CurrentPcb209RatlinePcbContextDependency = Object.freeze<CurrentPcb209RatlinePcbContextDependency>({ parentSessionId: "parent-session", parentTargetId: "parent",
    assertOriginalOwner: (): Promise<void> => { assert.equal(terminated, false); return Promise.resolve(); },
    assertOriginalBeforeNavigation: (): Promise<void> => { assert.equal(started, 0); context.openingContext(); return Promise.resolve(); },
    assertOriginalTermination: (): Promise<void> => { assert.equal(terminated, true); return Promise.resolve(); },
    beginOriginalPcbNavigation: (): Promise<void> => {
      assert.equal(started, 0); started += 1;
      emit(event("Page.navigatedWithinDocument", { frameId: "root", url: openedUrl, navigationType: "fragment" }));
      emit(event("Page.frameAttached", { frameId: "pcb-frame", parentFrameId: "root" }));
      emit(event("Runtime.executionContextCreated", { context: { ...pcbContext, id: 2, uniqueId: "initial-blank" } }));
      emit(event("Runtime.executionContextDestroyed", { executionContextId: 2, executionContextUniqueId: "initial-blank" }));
      emit(event("Page.frameNavigated", { frame: pcbFrame, type: "Navigation" }));
      emit(event("Runtime.executionContextCreated", { context: pcbContext })); pause(); return (async (): Promise<void> => { await navigation.promise; })();
    }, subscribe: (events: Events): (() => void) => { assert.equal(listener, null); listener = events; return (): void => { listener = null; }; },
    request, requestParent: request,
  });
  const router = new Constructor(context, target, dependency);
  return { router, owner: router.sourceOwner, counts: (): Readonly<{ navigation: number; resumes: number; sources: number; snapshots: number; removals: number }> =>
    ({ navigation: started, resumes, sources, snapshots, removals }), emit, finishNavigation: (): void => { navigation.resolve(null); }, changeFrame: (): void => { drift = true; },
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
  assert.deepEqual(f.counts(), { navigation: 0, resumes: 0, sources: 0, snapshots: 0, removals: 0 }); await f.router.abort(); await f.terminate();
});
void test("foreign debugger pause and incorrect DOM owner refuse without resuming or reading PCB source", async () => {
  for (const options of [{ foreignPause: true }, { badDom: true }]) {
    const f = await fixture(options); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); await assert.rejects(f.owner.whenSourceQualified());
    assert.equal(f.counts().resumes, 0); assert.equal(f.counts().sources, 0); assert.equal(f.router.status()["failed"], true);
    f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
  }
});
void test("fresh parent frame drift blocks final PCB continuation and late navigation completion cannot restore it", async () => {
  const f = await fixture(); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); const packet = await f.owner.whenSourceQualified();
  f.changeFrame(); await assert.rejects(f.router.releaseOriginalPinnedSource(packet)); assert.equal(f.counts().resumes, 28);
  f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
});
void test("selected context destruction poisons original source while navigation remains pending", async () => {
  const f = await fixture(); await f.owner.armBeforeNavigation(); await f.owner.startOriginalNavigation(); const packet = await f.owner.whenSourceQualified();
  f.emit(event("Runtime.executionContextDestroyed", { executionContextId: 3, executionContextUniqueId: "pcb-context" }));
  await assert.rejects(f.owner.requireOriginal(packet)); await assert.rejects(f.router.releaseOriginalPinnedSource(packet)); assert.equal(f.counts().resumes, 28);
  f.finishNavigation(); await assert.rejects(f.owner.whenOriginalNavigationSettled()); await f.router.abort(); await f.terminate();
});
