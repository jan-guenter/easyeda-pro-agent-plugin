/** Actual transport module with synthetic source replies. By default the
 * construction observer is synthetic too; the optional inert inspector uses
 * the actual construction runner. Production exposes neither test boundary. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { z } from "zod";
import { CURRENT_PCB_209_PRELOAD_COPY_SOURCE, CURRENT_PCB_209_PROJECT_WORKER_URL, CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES,
  CURRENT_PCB_209_WORKER_PRELOAD_LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL,
  currentPcb209PreloadCopyCaller, currentPcb209StartupScriptRole, isCurrentPcb209BootstrapTargetUrl,
  qualifyCurrentPcb209PreloadCopyCreator, qualifyCurrentPcb209PreloadCopyPause, qualifyCurrentPcb209StartupScriptSource } from "../../src/current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentPcb209StartupScriptRole } from "../../src/current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "../../src/current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../../src/current-pcb-worker-construction-contract.ts";
import type { CurrentPcb209WorkerStartupTransport } from "../../src/current-pcb-worker-startup-transport.ts";
// oxlint-disable-next-line import/max-dependencies -- The composed capture regression sends the maintained fixed source command through the actual startup transport; no copied command or test-only production port.
import { currentFootprintCopySourceNativeSample } from "../../src/current-footprint-copy-source-native.ts";

export const BOOTSTRAP_IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "fixture_tab" });
export const BOOTSTRAP_URL = "https://client/editor?entry=mgr-project-worker.js&cll=warn&debugOpen=0";
const bootstrap = Object.freeze({ CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES,
  CURRENT_PCB_209_WORKER_PRELOAD_LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL, CURRENT_PCB_209_PROJECT_WORKER_URL,
  currentPcb209PreloadCopyCaller, currentPcb209StartupScriptRole, isCurrentPcb209BootstrapTargetUrl,
  qualifyCurrentPcb209PreloadCopyCreator, qualifyCurrentPcb209PreloadCopyPause, qualifyCurrentPcb209StartupScriptSource });
const urls = [BOOTSTRAP_URL, bootstrap.CURRENT_PCB_209_WORKER_PRELOAD_URL, "", "", "", "", bootstrap.CURRENT_PCB_209_PROJECT_WORKER_URL] as const;
const path = new URL("../../src/current-pcb-worker-startup-transport.ts", import.meta.url);
const actualRequire = createRequire(path);
export interface BootstrapFixtureOptions {
  readonly timing?: Readonly<{ now: () => number; beforeSource?: () => void; beforeConstructionArmed?: () => void }>;
  readonly badSource?: CurrentPcb209StartupScriptRole;
  readonly ownerLossAt?: CurrentPcb209StartupScriptRole;
  readonly loseResumeReply?: number;
  readonly lateSource?: boolean;
  readonly sourceReply?: (role: CurrentPcb209StartupScriptRole, reply: Readonly<{ scriptSource: string }>) => Promise<unknown>;
  readonly footprintSourceReply?: () => Promise<unknown>;
  readonly targetUrl?: string;
  readonly logContext?: number;
  readonly duplicateLog?: boolean;
  readonly construction?: Readonly<{ transport: CurrentPcbWorkerConstructionTransport; run: () => Promise<unknown> }>;
  readonly loadedEvent?: Readonly<{ role: CurrentPcb209StartupScriptRole; beforeResume?: boolean;
    sessionId?: string; params?: Readonly<Record<string, unknown>>; repeat?: boolean }>;
}
export async function bootstrapLifecycleFixture(options: BootstrapFixtureOptions = {}): Promise<Readonly<{
  owner: CurrentPcb209WorkerStartupTransport;
  commands: CurrentPcbWorkerStartupCommand[];
  qualified: string[];
  constructed: () => number;
  emit: (method: string, params: Readonly<Record<string, unknown>>, sessionId?: string) => void;
  settleLateSource: () => void;
  readFootprintSource: () => Promise<unknown>;
  terminate: () => void;
}>> {
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const program = transformed.code;
  const commands: CurrentPcbWorkerStartupCommand[] = [], qualified: string[] = [];
  const capture = Promise.withResolvers<Readonly<{ synthetic: true }>>(), lateSource = Promise.withResolvers<unknown>();
  const packet = Object.freeze({ synthetic: true as const });
  let listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  let originalConstruction: CurrentPcbWorkerConstructionTransport | null = null;
  let constructions = 0, current = true, instrumented = false, roleIndex = 0, terminated = false;
  class Construction {
    readonly #transport: CurrentPcbWorkerConstructionTransport;
    public constructor(transport: CurrentPcbWorkerConstructionTransport) { this.#transport = transport; originalConstruction = transport; constructions += 1; }
    public capture(): Promise<Readonly<{ synthetic: true }>> {
      assert.deepEqual(qualified, ["bootstrap", "preload", "preload-copy-1", "preload-copy-2", "preload-copy-3", "preload-copy-4", "project"]);
      assert.equal(this.#transport.scriptId, "project-script"); return capture.promise;
    }
    public whenArmed(): Promise<void> { options.timing?.beforeConstructionArmed?.(); return this.#transport.assertOriginalPinnedWorker(); }
    public requireOriginal(value: unknown): Promise<void> { assert.equal(value, packet); return this.#transport.assertOriginalPinnedWorker(); }
    public footprintCacheConstructionDiagnostics(): null { assert.equal(this.#transport.scriptId, "project-script"); return null; }
    public waitOriginalFootprintCacheCapture(): Promise<void> { assert.equal(this.#transport.scriptId, "project-script"); return Promise.reject(new Error("FIXTURE_FOOTPRINT_CACHE_UNAVAILABLE")); }

    public status(): Readonly<{ unresolvedBreakpoints: false }> { assert.equal(this.#transport.scriptId, "project-script"); return { unresolvedBreakpoints: false }; }
  }
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program}\n})`);
  assert.ok(typeof evaluate === "function");
  const load = (specifier: string): unknown => {
    if (specifier === "./current-pcb-209-worker-startup-timing.ts" && options.timing !== undefined) {
      return { ...z.record(z.string(), z.unknown()).parse(actualRequire(specifier)), currentPcbStartupMonotonicMs: options.timing.now };
    }
    if (specifier === "./current-pcb-209-worker-bootstrap-source.ts") {
      return { ...bootstrap, qualifyCurrentPcb209StartupScriptSource: (role: string, raw: unknown): void => {
        assert.deepEqual(raw, { scriptSource: role === "bootstrap" ? bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[0] : `fixture:${role}` });
        if (role === "bootstrap") { bootstrap.qualifyCurrentPcb209StartupScriptSource(role, raw); }
        if (options.badSource === role) { throw new Error("SYNTHETIC_SOURCE_REFUSAL"); }
        qualified.push(role); if (options.ownerLossAt === role) { current = false; }
      } };
    }
    if (specifier === "./current-pcb-worker-construction-runner.ts" && options.construction === undefined) {
      return { CurrentPcb209WorkerConstructionRunner: Construction };
    }
    return actualRequire(specifier) as unknown;
  };
  Reflect.apply(evaluate, undefined, [load, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209WorkerStartupTransport"]; assert.ok(typeof Constructor === "function");
  const emit = (method: string, params: Readonly<Record<string, unknown>>, sessionId = "worker-session"): void => {
    listener?.({ method, sessionId, params });
  };
  const stopConstructionEvents = options.construction?.transport.subscribe({
    paused: raw => { emit("Debugger.paused", z.record(z.string(), z.unknown()).parse(raw)); },
    resumed: () => { emit("Debugger.resumed", {}); },
    lost: () => { current = false; },
  });
  const loadedEvent = (): void => {
    const selected = options.loadedEvent;
    if (selected === undefined) { return; }
    emit("Inspector.workerScriptLoaded", selected.params ?? {}, selected.sessionId);
    if (selected.repeat === true) { emit("Inspector.workerScriptLoaded", selected.params ?? {}, selected.sessionId); }
  };
  const script = (): void => {
    const role = bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[roleIndex], url = urls[roleIndex];
    if (role === undefined || url === undefined) { return; }
    const caller = bootstrap.currentPcb209PreloadCopyCaller(role);
    const scriptId = role === "project" ? options.construction?.transport.scriptId ?? "project-script" : `${role}-script`;
    const creator = CURRENT_PCB_209_PRELOAD_COPY_SOURCE.creator;
    const stack = caller === null ? {} : { stackTrace: { callFrames: [{ ...creator, scriptId: "preload-script", url: bootstrap.CURRENT_PCB_209_WORKER_PRELOAD_URL }] } };
    const frames = caller === null ? [{ location: { scriptId } }] : [
      { functionName: "", location: { scriptId, lineNumber: 0, columnNumber: 0 } },
      { functionName: creator.functionName, location: { scriptId: "preload-script", lineNumber: creator.lineNumber, columnNumber: creator.columnNumber } },
      { functionName: "", location: { scriptId: "preload-script", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber } },
    ];
    emit("Debugger.scriptParsed", { scriptId, url, executionContextId: 7, hasSourceURL: false, isLiveEdit: false, scriptLanguage: "JavaScript", ...stack });
    if (instrumented) { emit("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: [],
      callFrames: frames }); }
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
    assertOriginalOwner: (): Promise<void> => current
      ? options.construction?.transport.assertOriginalPinnedWorker() ?? Promise.resolve() : Promise.reject(new Error("OWNER_LOST")),
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
          options.timing?.beforeSource?.();
          if (options.lateSource === true && roleIndex === 0) { return lateSource.promise; }
          const role = bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[roleIndex];
          assert.ok(role !== undefined);
          const scriptSource = role === "bootstrap" ? bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[0] : `fixture:${role}`;
          assert.ok(typeof scriptSource === "string"); const reply = { scriptSource };
          return options.sourceReply?.(role, reply) ?? Promise.resolve(reply);
        }
        case "Debugger.removeBreakpoint": {
          if (command.params.breakpointId !== "instrumentation" && options.construction !== undefined) {
            return options.construction.transport.request(command);
          }
          instrumented = false; break;
        }
        case "Debugger.resume": {
          if (roleIndex >= 7 && options.construction !== undefined) { return options.construction.transport.request(command); }
          const resumedRole = roleIndex;
          const injectLoaded = options.loadedEvent?.role === bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES[resumedRole];
          if (injectLoaded && options.loadedEvent?.beforeResume === true) { loadedEvent(); }
          emit("Debugger.resumed", {}); roleIndex += 1;
          if (injectLoaded && options.loadedEvent?.beforeResume !== true) { loadedEvent(); }
          if (resumedRole === 5 && qualified.includes("preload")) { log(); if (options.duplicateLog === true) { log(); } }
          if (roleIndex === 7) {
            if (options.construction === undefined) { capture.resolve(packet); }
            else {
              const construction = options.construction;
              void (async (): Promise<void> => { try { await construction.run(); } catch { current = false; } })();
            }
          } else { script(); }
          if (options.loseResumeReply === resumedRole) { return Promise.reject(new Error("LOST_RESUME_REPLY")); } break;
        }
        case "Runtime.callFunctionOn": {
          const params = command.params;
          if ("objectId" in params && params.awaitPromise && options.footprintSourceReply !== undefined) {
            return options.footprintSourceReply();
          }
          if (!("objectId" in params) || params.awaitPromise) { throw new Error("Unexpected async command in construction fixture"); }
          if (options.construction !== undefined) { return options.construction.transport.request({ method: command.method, params }); }
          throw new Error(`unexpected fixture command ${command.method}`);
        }
        case "Debugger.evaluateOnCallFrame": case "Debugger.setBreakpoint":
        case "Runtime.getProperties": case "Runtime.releaseObjectGroup": {
          if (options.construction !== undefined) { return options.construction.transport.request(command); }
          throw new Error(`unexpected fixture command ${command.method}`);
        }
        case "DOM.describeNode": case "DOM.getFrameOwner": case "Page.getFrameTree": case "Target.getTargets": {
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
    emit: (method, params, sessionId): void => { emit(method, params, sessionId); },
    settleLateSource: (): void => { lateSource.resolve({ scriptSource: bootstrap.CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES[0] }); },
    readFootprintSource: (): Promise<unknown> => {
      assert.ok(originalConstruction !== null); return originalConstruction.request(currentFootprintCopySourceNativeSample());
    },
    terminate: (): void => { terminated = true; stopConstructionEvents?.(); } });
}
