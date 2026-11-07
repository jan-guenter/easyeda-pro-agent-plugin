/** Production cursor + production seven-source runner, with only full imported
 * source bytes replaced at the explicit VM seam. No native origin is issued. */
/* oxlint-disable import/max-dependencies -- Exercise the two actual state machines and their independent source/Save contracts. */
import { CURRENT_GENERATED_INITIAL_SYNC_CONDITION } from "../src/current-generated-initial-sync-condition.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS } from "../src/current-project-structure-transport-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_ROLES, CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS } from "../src/current-project-save-producer-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES } from "../src/current-project-save-producer-source.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS as CONSTRUCTORS, CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES as GUARDS, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as STRUCTURE } from "../src/current-project-save-structure-protocol.ts";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES as BOOTSTRAPS, CURRENT_PCB_209_PRELOAD_COPY_SOURCE as COPY,
  CURRENT_PCB_209_WORKER_PRELOAD_LOG as LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL as PRELOAD, CURRENT_PCB_209_PROJECT_WORKER_URL as PROJECT,
  CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES, currentPcb209PreloadCopyCaller } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentPcb209StartupScriptRole } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_VIA_SAVE_SITES as SITES } from "../src/current-pcb-via-save-source.ts";
import type { CurrentPcbViaWorkerController, CurrentPcbViaWorkerControllerBindings } from "../src/current-pcb-via-worker-controller.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import type { CurrentPcbViaProjectSourceHeld } from "../src/current-pcb-via-worker-bootstrap.ts";
import type { CurrentPcbViaObservedSourceCommand } from "../src/current-pcb-via-observed-source-protocol.ts";
import type { CurrentPcbViaWorkerCommand } from "../src/current-pcb-via-worker-wire.ts";

async function moduleWithSeam(file: string, replacement: (name: string, actual: unknown) => unknown): Promise<Record<string, unknown>> {
  const url = new URL(`../src/${file}`, import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacement(name, sourceRequire(name) as unknown), loaded, loaded.exports]); return loaded.exports;
}
async function constructor(): Promise<typeof CurrentPcbViaWorkerController> {
  const bootstrap = await moduleWithSeam("current-pcb-via-worker-bootstrap.ts", (name, actual) => {
    if (name !== "./current-pcb-209-worker-bootstrap-source.ts") { return actual; }
    assert.ok(typeof actual === "object" && actual !== null);
    return { ...actual, qualifyCurrentPcb209StartupScriptSource: (role: CurrentPcb209StartupScriptRole, raw: unknown): string => {
      assert.ok(typeof raw === "object" && raw !== null && "scriptSource" in raw && typeof raw.scriptSource === "string");
      assert.equal(raw.scriptSource, role === "bootstrap" ? BOOTSTRAPS[1] : `source-${role}`); return raw.scriptSource;
    } };
  });
  const controller = await moduleWithSeam("current-pcb-via-worker-controller.ts", (name, actual) => name === "./current-pcb-via-worker-bootstrap.ts" ? bootstrap : actual);
  const result = controller["CurrentPcbViaWorkerController"]; assert.ok(typeof result === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime checked production class; only pinned full-source bytes have the stated seam.
  return result as typeof CurrentPcbViaWorkerController;
}
async function fixture(failSetup = false, holdPoll = false, structure = false, producerGuards = false, producerObservation = false, helper: "none" | "original" | "foreign" = "none"): Promise<Readonly<{ controller: CurrentPcbViaWorkerController; bindings: CurrentPcbViaWorkerControllerBindings;
  commands: CurrentPcbViaWorkerCommand[]; incoming: DiagnosticEvent[]; observed:CurrentPcbViaObservedSourceCommand[];observedReplies:Map<string,unknown>;source:()=>CurrentPcbViaProjectSourceHeld;state: { failed: boolean; held: number; released: number; resumed: boolean; bound: number }; releasePoll: () => void; pollStarted: Promise<true>; polls: { count: number } }>> {
  const Constructor = await constructor(), projectUuid = "a".repeat(64), windowTabId = "original-window";
  const targetUrl = "https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0", title = `project_${projectUuid}_${windowTabId}`;
  const commands: CurrentPcbViaWorkerCommand[] = [], incoming: DiagnosticEvent[] = [];
  let heldSource:CurrentPcbViaProjectSourceHeld|null=null;const observed:CurrentPcbViaObservedSourceCommand[]=[];const observedReplies=new Map<string,unknown>();
  const state = { failed: false, held: 0, released: 0, resumed: false, bound: 0 };
  const pollGate = Promise.withResolvers<true>(), pollStarted = Promise.withResolvers<true>(), polls = { count: 0 }; let firstPoll = true;
  const event = (method: string, params: Record<string, unknown>): void => { incoming.push({ method, sessionId: "original-worker", params }); };
  const stage = (role: CurrentPcb209StartupScriptRole): void => {
    let url = ""; if (role === "bootstrap") { url = targetUrl; } else if (role === "preload") { url = PRELOAD; } else if (role === "project") { url = PROJECT; }
    const caller = currentPcb209PreloadCopyCaller(role), scriptId = `script-${role}`;
    const stackTrace = caller === null ? {} : { stackTrace: { callFrames: [{ functionName: COPY.creator.functionName, scriptId: "script-preload", url: PRELOAD,
      lineNumber: COPY.creator.lineNumber, columnNumber: COPY.creator.columnNumber }] } };
    event("Debugger.scriptParsed", { scriptId, executionContextId: 7, url, ...stackTrace });
    const callFrames = caller === null ? [{ location: { scriptId } }] : [{ functionName: "", location: { scriptId, lineNumber: 0, columnNumber: 0 } },
      { functionName: COPY.creator.functionName, location: { scriptId: "script-preload", lineNumber: COPY.creator.lineNumber, columnNumber: COPY.creator.columnNumber } },
      { functionName: "", location: { scriptId: "script-preload", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber } }];
    event("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: caller === null ? ["instrument"] : [], callFrames });
  };
  // oxlint-disable-next-line eslint/prefer-const -- The retained callbacks close over this original cursor before its constructor receives them.
  let controller: CurrentPcbViaWorkerController;
  const bindings = Object.freeze<CurrentPcbViaWorkerControllerBindings>({ parentSessionId: "original-parent", projectUuid, windowTabId, existingWorkers: Object.freeze([]),
    observedSource:command=>{observed.push(command);assert.equal(command.phase,"via-observed-source");return Promise.resolve(observedReplies.get(command.params.scriptId)??{scriptSource:`(${CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS.capture})`});},
    bindWorker: worker => { assert.equal(worker.sessionId, "original-worker"); state.bound += 1; return Promise.resolve(); },
    poll: async () => { polls.count += 1; if (firstPoll) { firstPoll = false; pollStarted.resolve(true); if (holdPoll) { await pollGate.promise; } }
      const next = incoming.shift(); assert.ok(next !== undefined); controller.observeEvent(next); },
    assertCurrent: () => { assert.equal(state.failed, false); return Promise.resolve(); }, fail: () => { state.failed = true; },
    releaseParentWait: () => { assert.equal(state.held, 1); assert.equal(state.resumed, false); state.released += 1; return Promise.resolve(); },
    projectSourceHeld: (source, original) => {
      heldSource=source;assert.equal(original, controller); assert.equal(source.scriptId, "script-project"); assert.equal(state.released, 0); assert.equal(state.resumed, false); state.held += 1;
      assert.equal(controller.requireHeld(source).sessionId, "original-worker"); if (failSetup) { throw new Error("original setup refused"); }
      for (const role of ["noData", "entry", "clock", "compress", "body", "result"] as const) {
        controller.bindSaveBreakpoint(source, role, `save-${role}`);
        event("Debugger.breakpointResolved", { breakpointId: `save-${role}`, location: { scriptId: source.scriptId, lineNumber: SITES[role].lineNumber, columnNumber: SITES[role].columnNumber } });
      }
      if (producerGuards) { for (const [role, site] of Object.entries(GUARDS)) {
        assert.ok(role in GUARDS);
        // The fixed data roster supplies every role; no native handle/source is caller-selected.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.entries loses the keys of this frozen fixed source roster.
        controller.bindProducerGuardBreakpoint(source, role as keyof typeof GUARDS, `producer-${role}`);
        event("Debugger.breakpointResolved", { breakpointId: `producer-${role}`, location: { scriptId: source.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } });
      } controller.requireProducerGuardsArmed(source); }
      if (producerObservation) {
        for (const role of CURRENT_PROJECT_SAVE_PRODUCER_ROLES) { const site = CURRENT_PROJECT_SAVE_PRODUCER_SITES[role];
          if (!CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS.some(value => value === role)) { controller.bindProducerObservationBreakpoint(source, role, `observed-${role}`);
          event("Debugger.breakpointResolved", { breakpointId: `observed-${role}`, location: { scriptId: source.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } }); }
        }
        for (const role of CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS) { controller.bindProducerObservationBreakpoint(source, role, controller.originalProducerGuardBreakpoint(source, role)); }
        controller.sealProducerObservation(source); controller.requireProducerObservationArmed(source);
      }
      if (structure) { for (const role of [...CONSTRUCTORS, "startupEntry", "startupReturn", "bootstrap", "packet", "response", "callbackReturn", "initialFinally", "queuedFinally"] as const) {
        controller.bindStructureBreakpoint(source, role, `structure-${role}`); const site = STRUCTURE[role];
        event("Debugger.breakpointResolved", { breakpointId: `structure-${role}`, location: { scriptId: source.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } });
      } controller.requireStructureArmed(source); }
      if (helper !== "none") { controller.expectSetupHelper(source, CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS.capture); event("Debugger.scriptParsed", { scriptId: "original-helper", executionContextId: 7, url: "" }); }
      return Promise.resolve();
    },
    request: command => {
      commands.push(command);
      if (command.phase === "via-worker-runtime") { event("Runtime.executionContextCreated", { context: { id: 7, uniqueId: "original-context", name: title, origin: targetUrl } }); }
      if (command.phase === "via-worker-debugger") { return Promise.resolve({ debuggerId: "debugger" }); }
      if (command.phase === "via-worker-instrument") { return Promise.resolve({ breakpointId: "instrument" }); }
      if (command.phase === "via-worker-run-waiting") { stage("bootstrap"); }
      if (command.phase === "via-worker-helper-source") { assert.equal(command.params.scriptId, "original-helper"); return Promise.resolve({ scriptSource: helper === "foreign" ? "(function(){return false;})" : `(${CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS.capture})` }); }
      if (command.phase === "via-worker-source") { return Promise.resolve({ scriptSource: command.role === "bootstrap" ? BOOTSTRAPS[1] : `source-${command.role}` }); }
      if (command.phase === "via-worker-resume") {
        event("Debugger.resumed", {});
        if (command.role === "project") { assert.equal(state.held, 1); assert.equal(state.released, 1); state.resumed = true; }
        if (command.role === "project" && structure) { const site = STRUCTURE.bootstrap; event("Debugger.paused", { reason: "other", hitBreakpoints: ["structure-bootstrap"], callFrames: [{ location: { scriptId: "script-project", lineNumber: site.lineNumber, columnNumber: site.columnNumber } }] }); }
        const next = ROLES[ROLES.indexOf(command.role) + 1];
        if (next === "project") { event("Runtime.consoleAPICalled", { type: "log", args: [{ type: "string", value: LOG.message }], executionContextId: 7, timestamp: 1,
          stackTrace: { callFrames: [{ scriptId: "script-preload", functionName: LOG.functionName, url: PRELOAD, lineNumber: LOG.lineNumber, columnNumber: LOG.columnNumber }] } }); }
        if (next !== undefined) { stage(next); }
      }
      return Promise.resolve({});
    } });
  controller = new Constructor(bindings);
  controller.observeEvent({ method: "Target.attachedToTarget", sessionId: "original-parent", params: { sessionId: "original-worker", waitingForDebugger: true,
    targetInfo: { targetId: "original-target", type: "worker", attached: true, url: targetUrl, title } } });
  return { controller, bindings, commands, incoming,observed,observedReplies,source:()=>{assert.ok(heldSource!==null);return heldSource;}, state, releasePoll: (): void => { pollGate.resolve(true); }, pollStarted: pollStarted.promise, polls };
}
void test("actual cursor retains source setup and six exact Save resolutions before original final continuation", async () => {
  const f = await fixture(); await f.controller.pump();
  assert.deepEqual(f.state, { failed: false, held: 1, released: 1, resumed: true, bound: 1 }); assert.equal(f.commands.length, 20);
  assert.deepEqual(f.controller.status(), { ready: true, pumping: false, failed: false, projectSourceHeld: true, originalWorkerSelected: true });
  f.incoming.push({ method: "Debugger.paused", sessionId: "original-worker", params: { hitBreakpoints: ["save-entry"], callFrames: [{ location: { scriptId: "script-project", lineNumber: SITES.entry.lineNumber, columnNumber: SITES.entry.columnNumber } }] } });
  const savedEvent = await f.controller.nextSaveEvent(); assert.equal(savedEvent.method, "Debugger.paused"); await f.controller.pump(); assert.equal(f.commands.length, 20);
});
void test("setup refusal leaves project pause held and never releases parent waiting or replays bootstrap", async () => {
  const f = await fixture(true); await assert.rejects(f.controller.pump(), /setup refused/u);
  assert.equal(f.state.held, 1); assert.equal(f.state.released, 0); assert.equal(f.state.resumed, false); assert.equal(f.state.failed, true);
  assert.equal(f.commands.some(command => command.phase === "via-worker-remove" || command.phase === "via-worker-resume" && command.role === "project"), false);
  const count = f.commands.length; await assert.rejects(f.controller.pump()); assert.equal(f.commands.length, count);
});
void test("foreign breakpoint resolutions and nonwaiting selected attachments refuse without adoption", async () => {
  const f = await fixture(); await f.controller.pump();
  f.incoming.push({ method: "Debugger.breakpointResolved", sessionId: "original-worker", params: { breakpointId: "foreign", location: { scriptId: "script-project", lineNumber: 110, columnNumber: 131_055 } } });
  await assert.rejects(f.controller.nextSaveEvent(), /EVENT_ROUTE/u); assert.equal(f.state.failed, true);
  const other = await fixture(); assert.throws(() => { other.controller.observeEvent({ method: "Target.attachedToTarget", sessionId: "original-parent", params: { sessionId: "unowned", waitingForDebugger: false,
    targetInfo: { targetId: "second", type: "worker", attached: true, url: "https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0", title: "foreign" } } }); });
  assert.equal(other.commands.length, 0);
});
void test("constructor rejects original binding accessors and proxies before invoking them", async () => {
  const Constructor = await constructor(), f = await fixture(); let reads = 0;
  const getter = Object.freeze(Object.defineProperty({ ...f.bindings }, "request", { get: (): never => { reads += 1; throw new Error("getter"); } }));
  assert.throws(() => Reflect.construct(Constructor, [getter]));
  assert.throws(() => Reflect.construct(Constructor, [new Proxy(f.bindings, { getPrototypeOf: (): never => { reads += 1; throw new Error("proxy"); } })])); assert.equal(reads, 0);
});

void test("failure retains an already pending original poll until its genuine settlement", async () => {
  const f = await fixture(false, true); let settled = false;
  const pending = f.controller.pump(); const refused = assert.rejects(pending);
  const observed = (async (): Promise<void> => { try { await pending; } catch { assert.equal(f.state.failed, true); } finally { settled = true; } })();
  await f.pollStarted; f.controller.fail(); await Promise.resolve(); assert.equal(settled, false);
  f.releasePoll(); await refused; await observed; assert.equal(settled, true);
  assert.equal(f.state.resumed, false); assert.equal(f.state.released, 0);
});

void test("original construction collector starts before navigation settles and waits the exact final source-resume cursor release", async () => {
  const f = await fixture(false, false, true); const constructed = f.controller.nextStructureEvent();
  await f.controller.pump(); const event = await constructed;
  assert.equal(event.method, "Debugger.paused"); assert.equal(f.controller.status().pumping, false); assert.equal(f.commands.length, 20);
});

void test("original producer guards remain held and never become a Save or structure continuation", async () => {
  for (const role of ["historyCloud", "localIngress", "pendingCache"] as const) {
    const f = await fixture(false, false, false, true); await f.controller.pump(); const count = f.commands.length, site = GUARDS[role];
    f.incoming.push({ method: "Debugger.paused", sessionId: "original-worker", params: { hitBreakpoints: [`producer-${role}`], callFrames: [{ location: { scriptId: "script-project", lineNumber: site.lineNumber, columnNumber: site.columnNumber } }] } });
    await assert.rejects(f.controller.nextSaveEvent(), /PRODUCER_GUARD_HELD/u); assert.equal(f.state.failed, true); assert.equal(f.commands.length, count);
    assert.throws(() => Reflect.apply(f.controller.reserveSaveResume.bind(f.controller), f.controller, [{}, "entry"])); await assert.rejects(f.controller.pump()); assert.equal(f.commands.length, count);
  }
});

void test("original worker pause parks the other collector without another native poll, and original failure wakes it", async () => {
  const f = await fixture(false, false, true); await f.controller.pump(); await f.controller.nextStructureEvent();
  const count = f.polls.count, saving = assert.rejects(f.controller.nextSaveEvent());
  for (let index = 0; index < 24; index += 1) { await Promise.resolve(); }
  assert.equal(f.state.failed, false); assert.equal(f.polls.count, count); f.controller.fail(); await saving;
  assert.equal(f.state.failed, true); assert.equal(f.polls.count, count);
});

void test("actual producer collector receives only the four transferred guard identities while other roots remain refused", async () => {
  const f = await fixture(false, false, false, true, true); await f.controller.pump(); const count = f.commands.length;
  const site = CURRENT_PROJECT_SAVE_PRODUCER_SITES.localIngress;
  f.incoming.push({ method: "Debugger.paused", sessionId: "original-worker", params: { hitBreakpoints: ["producer-localIngress"], callFrames: [{ location: { scriptId: "script-project", lineNumber: site.lineNumber, columnNumber: site.columnNumber } }] } });
  const observed = await f.controller.nextProducerEvent(); assert.equal(observed.method, "Debugger.paused"); assert.equal(f.state.failed, false); assert.equal(f.commands.length, count);
  const denied = GUARDS.historySeed;
  f.controller.observeEvent({ method: "Debugger.breakpointResolved", sessionId: "original-worker", params: { breakpointId: "producer-historySeed", location: { scriptId: "script-project", lineNumber: denied.lineNumber, columnNumber: denied.columnNumber } } });
  assert.throws(() => { f.controller.observeEvent({ method: "Debugger.paused", sessionId: "original-worker", params: { hitBreakpoints: ["producer-historySeed"], callFrames: [{ location: { scriptId: "script-project", lineNumber: denied.lineNumber, columnNumber: denied.columnNumber } }] } }); }, /PRODUCER_GUARD_HELD/u);
  assert.equal(f.state.failed, true); assert.equal(f.commands.length, count);
});

void test("actual controller qualifies its correlated helper source before accepting the original final resume", async () => {
  const f = await fixture(false, false, false, false, false, "original"); await f.controller.pump();
  const helper = f.commands.findIndex(command => command.phase === "via-worker-helper-source"), resumed = f.commands.findIndex(command => command.phase === "via-worker-resume" && command.role === "project");
  assert.ok(helper !== -1 && resumed > helper); assert.equal(f.commands.length, 21); assert.equal(f.state.failed, false);
  const changed = await fixture(false, false, false, false, false, "foreign"); await assert.rejects(changed.controller.pump(), /SETUP_HELPER_SOURCE/u);
  assert.equal(changed.state.resumed, false); assert.equal(changed.state.released, 0); assert.equal(changed.state.failed, true);
});

void test("after-bootstrap helper reads match the original submitted fixed program without another producer read",async()=>{const f=await fixture();await f.controller.pump();const source=f.source();const count=f.polls.count;f.controller.expectObservedProgram(source,"function",CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS.capture);f.controller.observeEvent({method:"Debugger.scriptParsed",sessionId:"original-worker",params:{scriptId:"observed-helper",url:"",executionContextId:7}});await f.controller.settleObservedPrograms(source);assert.deepEqual(f.observed,[{phase:"via-observed-source",method:"Debugger.getScriptSource",params:{scriptId:"observed-helper"}}]);assert.equal(f.polls.count,count);f.controller.requireProducerFrontier(source);});
void test("an unsubmitted helper or foreign context refuses before a source read",async()=>{for(const context of [7,8]){const f=await fixture();await f.controller.pump();const source=f.source();if(context===8){f.controller.expectObservedProgram(source,"function",CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS.capture);}f.controller.observeEvent({method:"Debugger.scriptParsed",sessionId:"original-worker",params:{scriptId:"foreign-helper",url:"",executionContextId:context}});await assert.rejects(f.controller.settleObservedPrograms(source));assert.equal(f.observed.length,0);}});

void test("an original armed condition source can interleave without consuming the submitted helper",async()=>{const f=await fixture();await f.controller.pump();const source=f.source();f.controller.expectObservedProgram(source,"condition",CURRENT_GENERATED_INITIAL_SYNC_CONDITION);f.controller.expectObservedProgram(source,"function",CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS.capture);f.observedReplies.set("condition-source",{scriptSource:CURRENT_GENERATED_INITIAL_SYNC_CONDITION});for(const scriptId of ["condition-source","helper-source"]){f.controller.observeEvent({method:"Debugger.scriptParsed",sessionId:"original-worker",params:{scriptId,url:"",executionContextId:7}});}await f.controller.settleObservedPrograms(source);assert.equal(f.observed.length,2);f.controller.requireProducerFrontier(source);assert.throws(()=>{f.controller.expectObservedProgram(source,"condition","1===1");});});
