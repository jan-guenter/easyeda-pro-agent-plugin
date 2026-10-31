/** Actual transport code with one synthetic project stage and inert construction
 * collaborators. This checks source handoff only, not source pins, native
 * ownership, a complete bootstrap, clock invocation or combined-origin issuance. */
/* oxlint-disable max-classes-per-file -- The inert parent and construction collaborators exercise the actual private transport's distinct lifecycle roles. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyWorkerStartupTransport, CurrentPcb209WorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../src/current-pcb-worker-construction-contract.ts";
import type { CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "../src/current-pcb-worker-startup-contract.ts";
import { isOriginalFootprintHeldSavedDependency } from "../src/current-pcb-worker-startup-channel.ts";

const projectSource = "synthetic complete project source\nwith the original trailing newline\n";
const targetUrl = "https://client/editor?entry=mgr-project-worker.js&cll=warn&debugOpen=0";
const projectUrl = "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
const identity = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "source_fixture" };
/** Load the actual transport with a single synthetic project-source stage and
 * injectable source/owner/construction failures. Its genuine held-purpose
 * predicate must reject the synthetic dependency; the returned counters prove
 * source handoff ordering, not native ownership or a real clock invocation. */
async function fixture(execution: boolean, loseAfterSource = false, refuseSource = false, refuseBinding = false, refuseConstruction = false): Promise<Readonly<{
  owner: CurrentFootprintCopyWorkerStartupTransport | CurrentPcb209WorkerStartupTransport;
  sourceRetained: () => boolean;
  state: { sourceReads: number; boundSources: string[]; captures: number; lost: boolean; exited: boolean };
}>> {
  const state = { sourceReads: 0, boundSources: [] as string[], captures: 0, lost: false, exited: false };
  let subscriber: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  const emit = (method: string, params: Readonly<Record<string, unknown>>, sessionId = "worker-session"): void => { subscriber?.({ method, params, sessionId }); };
  const dependency: CurrentPcbWorkerStartupDependency = {
    parentTargetId: "parent-target", parentSessionId: "parent-session",
    assertOriginalOwner: (): Promise<void> => { assert.equal(state.lost, false); return Promise.resolve(); },
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.exited, true); return Promise.resolve(); },
    subscribe: observer => { subscriber = observer; return (): void => { subscriber = null; }; },
    request: command => {
      switch (command.method) {
        case "Target.setAutoAttach": {
          emit("Target.attachedToTarget", { sessionId: "worker-session", waitingForDebugger: true,
            targetInfo: { targetId: "worker-target", type: "worker", attached: true,
              title: `project_${identity.projectUuid}_${identity.windowTabId}`, url: targetUrl } }, "parent-session"); break;
        }
        case "Runtime.enable": {
          emit("Runtime.executionContextCreated", { context: { id: 1, uniqueId: "worker-context",
            name: `project_${identity.projectUuid}_${identity.windowTabId}`, origin: targetUrl } }); break;
        }
        case "Debugger.enable": { return Promise.resolve({ debuggerId: "debugger" }); }
        case "Debugger.setInstrumentationBreakpoint": { return Promise.resolve({ breakpointId: "instrumentation" }); }
        case "Runtime.runIfWaitingForDebugger": {
          emit("Debugger.scriptParsed", { scriptId: "project-script", executionContextId: 1, url: projectUrl });
          emit("Debugger.paused", { reason: "instrumentation", data: { scriptId: "project-script", url: projectUrl },
            hitBreakpoints: [], callFrames: [{ location: { scriptId: "project-script" } }] }); break;
        }
        case "Debugger.getScriptSource": { state.sourceReads += 1; return Promise.resolve({ scriptSource: projectSource }); }
        case "Debugger.removeBreakpoint": { break; }
        case "Debugger.resume": { emit("Debugger.resumed", {}); break; }
        case "DOM.describeNode": case "DOM.getFrameOwner": case "Debugger.evaluateOnCallFrame": case "Debugger.setBreakpoint":
        case "Page.getFrameTree": case "Runtime.callFunctionOn": case "Runtime.getProperties": case "Runtime.releaseObjectGroup": case "Target.getTargets": {
          throw new Error(`Unexpected synthetic transport command ${command.method}`);
        }
        default: { throw new Error("Invalid synthetic transport command"); }
      }
      return Promise.resolve({});
    },
  };
  assert.equal(isOriginalFootprintHeldSavedDependency(dependency), false);
  class Construction {
    public constructor(transport: CurrentPcbWorkerConstructionTransport) {
      assert.equal(transport.scriptId, "project-script");
      if (refuseConstruction) { throw new Error("synthetic construction allocation refusal"); }
    }
    public bindClockRpcSource(source: string): void {
      assert.ok(this instanceof Construction); assert.equal(execution, true); assert.equal(state.lost, false); state.boundSources.push(source);
      if (refuseBinding) { throw new Error("synthetic construction source binding refusal"); }
    }
    public capture(): Promise<Readonly<{ synthetic: true }>> {
      assert.ok(this instanceof Construction); assert.equal(state.boundSources.length, execution ? 1 : 0); state.captures += 1; return Promise.resolve({ synthetic: true });
    }
    public whenArmed(): Promise<void> { assert.ok(this instanceof Construction); return Promise.resolve(); }
    public status(): Readonly<{ unresolvedBreakpoints: false; firstFailure: null; progress: null }> {
      assert.ok(this instanceof Construction); return { unresolvedBreakpoints: false, firstFailure: null, progress: null };
    }
    public footprintCacheConstructionDiagnostics(): null { assert.ok(this instanceof Construction); return null; }
  }
  class Parent {
    public arm(): Promise<void> { assert.ok(this instanceof Parent); return Promise.resolve(); }
    public captureUntilHeld(): Promise<Readonly<Record<string, never>>> { assert.ok(this instanceof Parent); return Promise.resolve({}); }
    public retained(): Readonly<{ originalGenerationEnded: true; resumed: false }> { assert.ok(this instanceof Parent); return { originalGenerationEnded: true, resumed: false }; }
    public diagnostics(): null { assert.ok(this instanceof Parent); return null; }
  }
  const url = new URL("../src/current-pcb-worker-startup-transport.ts", import.meta.url);
  const actualRequire = createRequire(url);
  const originalSource = await readFile(url, "utf8");
  const status = "  public status():"; assert.equal(originalSource.split(status).length, 2);
  // A test-only private-field boolean exposes retention without changing any
  // Capture/control method or adding a production diagnostic/source getter.
  const observableSource = originalSource.replace(status,
    `  public clockRpcSourceRetainedForTest(): boolean { return this.#clockRpcProjectSource !== null; }\n${status}`);
  const compiled = await transform(observableSource, { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-worker-startup-channel.ts") { return {
      isOriginalFootprintExecutionDependency: (value: unknown): boolean => value === dependency && execution,
      isOriginalFootprintPreparationDependency: (value: unknown): boolean => value === dependency && execution,
      isOriginalFootprintSavedDependency: (): boolean => false,
      // Keep the genuine held-purpose registry check. These old-purpose
      // Synthetic dependencies must never acquire that separate marker.
      isOriginalFootprintHeldSavedDependency,
    }; }
    if (name === "./current-footprint-copy-construction-purpose.ts") { return { bindFootprintPreparationConstructionTransport: (): void => undefined }; }
    if (name === "./current-footprint-copy-clock-route.ts") { return { bindCurrentFootprintCopyClockRoute: (): void => undefined }; }
    if (name === "./current-footprint-copy-parent-construction-runner.ts") { return { CurrentFootprintParentConstructionRunner: Parent }; }
    if (name === "./current-footprint-copy-parent-route.ts") { return { requireCurrentFootprintCopyParentRoute: (): object => ({
      parentSessionId: "parent-session", parentUniqueContextId: "ui-context", managerScriptId: "manager-script",
    }) }; }
    if (name === "./current-pcb-worker-construction-runner.ts") { return {
      CurrentFootprintCopyConstructionRunner: Construction, CurrentPcb209WorkerConstructionRunner: Construction,
    }; }
    if (name === "./current-pcb-209-worker-bootstrap-source.ts") {
      const original: unknown = actualRequire(name); assert.ok(original !== null && typeof original === "object");
      return { ...original, CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES: ["project"],
        qualifyCurrentPcb209StartupScriptSource: (role: string, raw: unknown): string => {
          assert.equal(role, "project"); assert.deepEqual(raw, { scriptSource: projectSource });
          if (refuseSource) { throw new Error("synthetic source refusal"); }
          if (loseAfterSource) { state.lost = true; } return projectSource;
        } };
    }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const candidate = loaded.exports[execution ? "CurrentFootprintCopyWorkerStartupTransport" : "CurrentPcb209WorkerStartupTransport"];
  assert.ok(typeof candidate === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual transport code is unchanged; only explicitly synthetic source, purpose and construction collaborators are substituted above.
  const Constructor = candidate as typeof CurrentFootprintCopyWorkerStartupTransport;
  const owner = new Constructor(dependency); owner.bindExpectedProject(identity);
  owner.bindExistingWorkers({ targetInfos: [{ targetId: "parent-target", type: "page", attached: true, title: "parent", url: "https://client/" }] });
  const sourceRetained: unknown = Reflect.get(owner, "clockRpcSourceRetainedForTest"); assert.ok(typeof sourceRetained === "function");
  return { owner, state, sourceRetained: (): boolean => Reflect.apply(sourceRetained, owner, []) === true };
}

void test("execution transport passes its same complete qualified source once before construction without another fetch", async () => {
  const f = await fixture(true);
  assert.deepEqual(await f.owner.capture(), { synthetic: true });
  assert.deepEqual(f.state.boundSources, [projectSource]); assert.equal(f.state.sourceReads, 1); assert.equal(f.state.captures, 1);
  assert.equal(f.sourceRetained(), false);
  await assert.rejects(f.owner.capture(), /CONSUMED/u); assert.equal(f.state.boundSources.length, 1);
  f.state.exited = true; await f.owner.releaseAfterTermination();
});
void test("ordinary209 startup keeps its qualified source out of the execution-only binding", async () => {
  const f = await fixture(false); await f.owner.capture();
  assert.equal(f.state.sourceReads, 1); assert.equal(f.state.boundSources.length, 0); assert.equal(f.state.captures, 1);
  f.state.exited = true; await f.owner.releaseAfterTermination();
});
void test("refused source or lost original owner cannot hand source to construction", async () => {
  for (const lose of [false, true]) {
    const f = await fixture(true, lose, !lose); await assert.rejects(f.owner.capture());
    assert.equal(f.state.sourceReads, 1); assert.equal(f.state.boundSources.length, 0); assert.equal(f.state.captures, 0);
    f.state.exited = true; await f.owner.releaseAfterTermination();
  }
});
void test("construction or binding refusal drops raw source before failed transport settlement and release", async () => {
  for (const binding of [false, true]) {
    const f = await fixture(true, false, false, binding, !binding); await assert.rejects(f.owner.capture());
    assert.equal(f.state.boundSources.length, binding ? 1 : 0); assert.equal(f.state.captures, 0);
    assert.equal(f.owner.status().settled, true); assert.equal(f.sourceRetained(), false);
    await assert.rejects(f.owner.capture(), /CONSUMED/u);
    f.state.exited = true; await f.owner.releaseAfterTermination(); assert.equal(f.sourceRetained(), false);
  }
});
