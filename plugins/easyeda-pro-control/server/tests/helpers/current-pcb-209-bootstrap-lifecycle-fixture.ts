/** Actual transport module in the current realm with two import substitutions:
 * synthetic source replies and a construction observer. Production has no such
 * seam. This tests event/cleanup ownership, not vendor source admission. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PCB_209_PROJECT_WORKER_URL, CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES,
  CURRENT_PCB_209_WORKER_PRELOAD_LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL,
  currentPcb209StartupScriptRole, isCurrentPcb209BootstrapTargetUrl, qualifyCurrentPcb209StartupScriptSource } from "../../src/current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "../../src/current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../../src/current-pcb-worker-construction-contract.ts";
import type { CurrentPcb209WorkerStartupTransport } from "../../src/current-pcb-worker-startup-transport.ts";

export const BOOTSTRAP_IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "fixture_tab" });
export const BOOTSTRAP_URL = "https://client/editor?entry=mgr-project-worker.js&cll=warn&debugOpen=0";
const bootstrap = Object.freeze({ CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES,
  CURRENT_PCB_209_WORKER_PRELOAD_LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL, CURRENT_PCB_209_PROJECT_WORKER_URL,
  currentPcb209StartupScriptRole, isCurrentPcb209BootstrapTargetUrl, qualifyCurrentPcb209StartupScriptSource });
const urls = [BOOTSTRAP_URL, bootstrap.CURRENT_PCB_209_WORKER_PRELOAD_URL, bootstrap.CURRENT_PCB_209_PROJECT_WORKER_URL] as const;
const path = new URL("../../src/current-pcb-worker-startup-transport.ts", import.meta.url);
const actualRequire = createRequire(path);
export interface BootstrapFixtureOptions {
  readonly badSource?: "bootstrap" | "preload" | "project";
  readonly ownerLossAt?: "bootstrap" | "preload" | "project";
  readonly loseResumeReply?: number;
  readonly lateSource?: boolean;
  readonly targetUrl?: string;
  readonly logContext?: number;
  readonly duplicateLog?: boolean;
}
export async function bootstrapLifecycleFixture(options: BootstrapFixtureOptions = {}): Promise<Readonly<{
  owner: CurrentPcb209WorkerStartupTransport;
  commands: CurrentPcbWorkerStartupCommand[];
  qualified: string[];
  constructed: () => number;
  emit: (method: string, params: Readonly<Record<string, unknown>>) => void;
  settleLateSource: () => void;
  terminate: () => void;
}>> {
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const program = transformed.code;
  const commands: CurrentPcbWorkerStartupCommand[] = [], qualified: string[] = [];
  const capture = Promise.withResolvers<Readonly<{ synthetic: true }>>(), lateSource = Promise.withResolvers<unknown>();
  const packet = Object.freeze({ synthetic: true as const });
  let listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  let constructions = 0, current = true, instrumented = false, roleIndex = 0, terminated = false;
  class Construction {
    readonly #transport: CurrentPcbWorkerConstructionTransport;
    public constructor(transport: CurrentPcbWorkerConstructionTransport) { this.#transport = transport; constructions += 1; }
    public capture(): Promise<Readonly<{ synthetic: true }>> {
      assert.deepEqual(qualified, ["bootstrap", "preload", "project"]);
      assert.equal(this.#transport.scriptId, "project-script"); return capture.promise;
    }
    public whenArmed(): Promise<void> { return this.#transport.assertOriginalPinnedWorker(); }
    public requireOriginal(value: unknown): Promise<void> { assert.equal(value, packet); return this.#transport.assertOriginalPinnedWorker(); }
    public status(): Readonly<{ unresolvedBreakpoints: false }> { assert.equal(this.#transport.scriptId, "project-script"); return { unresolvedBreakpoints: false }; }
  }
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program}\n})`);
  assert.ok(typeof evaluate === "function");
  const load = (specifier: string): unknown => {
    if (specifier === "./current-pcb-209-worker-bootstrap-source.ts") {
      return { ...bootstrap, qualifyCurrentPcb209StartupScriptSource: (role: string, raw: unknown): void => {
        assert.deepEqual(raw, { scriptSource: role === "bootstrap" ? bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[0] : `fixture:${role}` });
        if (role === "bootstrap") { bootstrap.qualifyCurrentPcb209StartupScriptSource(role, raw); }
        if (options.badSource === role) { throw new Error("SYNTHETIC_SOURCE_REFUSAL"); }
        qualified.push(role); if (options.ownerLossAt === role) { current = false; }
      } };
    }
    if (specifier === "./current-pcb-worker-construction-runner.ts") { return { CurrentPcb209WorkerConstructionRunner: Construction }; }
    return actualRequire(specifier) as unknown;
  };
  Reflect.apply(evaluate, undefined, [load, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209WorkerStartupTransport"]; assert.ok(typeof Constructor === "function");
  const emit = (method: string, params: Readonly<Record<string, unknown>>, sessionId = "worker-session"): void => {
    listener?.({ method, sessionId, params });
  };
  const script = (): void => {
    const role = bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[roleIndex], url = urls[roleIndex];
    if (role === undefined || url === undefined) { return; }
    const scriptId = `${role}-script`;
    emit("Debugger.scriptParsed", { scriptId, url, executionContextId: 7, hasSourceURL: false, isLiveEdit: false, scriptLanguage: "JavaScript" });
    if (instrumented) { emit("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: [],
      callFrames: [{ location: { scriptId } }] }); }
  };
  const log = (): void => {
    const value = bootstrap.CURRENT_PCB_209_WORKER_PRELOAD_LOG;
    emit("Runtime.consoleAPICalled", { type: "log", args: [{ type: "string", value: value.message }],
      executionContextId: options.logContext ?? 7, timestamp: 1,
      stackTrace: { callFrames: [{ functionName: value.functionName, scriptId: "preload-script",
        url: bootstrap.CURRENT_PCB_209_WORKER_PRELOAD_URL, lineNumber: value.lineNumber, columnNumber: value.columnNumber }] } });
  };
  const dependency: CurrentPcbWorkerStartupDependency = {
    parentTargetId: "parent", parentSessionId: "parent-session",
    assertOriginalOwner: (): Promise<void> => current ? Promise.resolve() : Promise.reject(new Error("OWNER_LOST")),
    assertOriginalTermination: (): Promise<void> => { assert.ok(terminated); return Promise.resolve(); },
    subscribe: next => { listener = next; return (): void => { listener = null; }; },
    request: (command): Promise<unknown> => {
      commands.push(command);
      switch (command.method) {
        case "Target.setAutoAttach": {
          emit("Target.attachedToTarget", { sessionId: "worker-session", waitingForDebugger: true,
            targetInfo: { targetId: "worker", type: "worker", attached: true,
              title: `project_${BOOTSTRAP_IDENTITY.projectUuid}_${BOOTSTRAP_IDENTITY.windowTabId}`, url: options.targetUrl ?? BOOTSTRAP_URL } }, "parent-session"); break;
        }
        case "Runtime.enable": {
          emit("Runtime.executionContextCreated", { context: { id: 7, uniqueId: "original-context", origin: BOOTSTRAP_URL,
            name: `project_${BOOTSTRAP_IDENTITY.projectUuid}_${BOOTSTRAP_IDENTITY.windowTabId}` } }); break;
        }
        case "Debugger.enable": { return Promise.resolve({ debuggerId: "debugger" }); }
        case "Debugger.setInstrumentationBreakpoint": { instrumented = true; return Promise.resolve({ breakpointId: "instrumentation" }); }
        case "Runtime.runIfWaitingForDebugger": { script(); break; }
        case "Debugger.getScriptSource": {
          if (options.lateSource === true && roleIndex === 0) { return lateSource.promise; }
          const role = bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[roleIndex];
          return Promise.resolve({ scriptSource: role === "bootstrap" ? bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[0] : `fixture:${String(role)}` });
        }
        case "Debugger.removeBreakpoint": { instrumented = false; break; }
        case "Debugger.resume": {
          const resumedRole = roleIndex; emit("Debugger.resumed", {}); roleIndex += 1;
          if (resumedRole === 1 && qualified.includes("preload")) { log(); if (options.duplicateLog === true) { log(); } }
          if (roleIndex === 3) { capture.resolve(packet); } else { script(); }
          if (options.loseResumeReply === resumedRole) { return Promise.reject(new Error("LOST_RESUME_REPLY")); } break;
        }
        case "DOM.describeNode": case "DOM.getFrameOwner": case "Debugger.evaluateOnCallFrame":
        case "Debugger.setBreakpoint": case "Page.getFrameTree": case "Runtime.callFunctionOn":
        case "Runtime.getProperties": case "Runtime.releaseObjectGroup": case "Target.getTargets": {
          throw new Error(`unexpected fixture command ${command.method}`);
        }
        default: { assert.fail("unrecognized fixture command"); }
      }
      return Promise.resolve({});
    },
  };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This exact source module's exported constructor is instantiated in the current realm; two declared imports are the only synthetic boundaries.
  const owner = Reflect.construct(Constructor, [dependency]) as CurrentPcb209WorkerStartupTransport;
  owner.bindExpectedProject(BOOTSTRAP_IDENTITY);
  owner.bindExistingWorkers({ targetInfos: [{ targetId: "parent", type: "page", attached: true, title: "fixture", url: "https://client/" }] });
  return Object.freeze({ owner, commands, qualified, constructed: (): number => constructions,
    emit: (method, params): void => { emit(method, params); },
    settleLateSource: (): void => { lateSource.resolve({ scriptSource: bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[0] }); },
    terminate: (): void => { terminated = true; } });
}
