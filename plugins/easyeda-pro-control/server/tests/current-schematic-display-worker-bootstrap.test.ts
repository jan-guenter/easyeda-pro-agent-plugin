/** Real source-order state machine with one explicit source-byte seam. No
 * native target, origin, application execution or writer proof is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCES as BOOTSTRAPS,
  CURRENT_PCB_209_PRELOAD_COPY_SOURCE as COPY, CURRENT_PCB_209_WORKER_PRELOAD_LOG as LOG, CURRENT_PCB_209_WORKER_PRELOAD_URL as PRELOAD,
  CURRENT_PCB_209_PROJECT_WORKER_URL as PROJECT, CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES, currentPcb209PreloadCopyCaller } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentPcb209StartupScriptRole } from "../src/current-pcb-209-worker-bootstrap-source.ts";
import type { CurrentSchematicDisplayWorkerBootstrap, CurrentSchematicDisplayWorkerBootstrapEvent } from "../src/current-schematic-display-worker-bootstrap.ts";
import type { CurrentSchematicDisplayWorkerBootstrapCommand } from "../src/current-schematic-display-worker-bootstrap-protocol.ts";

type Fault = "none" | "online" | "copy" | "log" | "resume";
async function fixture(fault: Fault = "none"): Promise<Readonly<{ runner: CurrentSchematicDisplayWorkerBootstrap; commands: CurrentSchematicDisplayWorkerBootstrapCommand[];
  state: { failed: boolean; callbacks: number; released: number; projectResumed: boolean } }>> {
  const projectUuid = "a".repeat(64), targetUrl = "https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0", windowTabId = "window_original";
  const targetTitle = `project_${projectUuid}_${windowTabId}`; const queue: CurrentSchematicDisplayWorkerBootstrapEvent[] = []; const commands: CurrentSchematicDisplayWorkerBootstrapCommand[] = [];
  const state = { failed: false, callbacks: 0, released: 0, projectResumed: false };
  const event = (method: string, params: unknown): void => { queue.push({ method, sessionId: "worker-session", params }); };
  const stage = (role: CurrentPcb209StartupScriptRole): void => {
    let url = ""; if (role === "bootstrap") { url = targetUrl; } else if (role === "preload") { url = PRELOAD; } else if (role === "project") { url = PROJECT; }
    const caller = currentPcb209PreloadCopyCaller(role), scriptId = `script-${role}`;
    const stackTrace = caller === null ? {} : { stackTrace: { callFrames: [{ functionName: COPY.creator.functionName, scriptId: "script-preload", url: PRELOAD,
      lineNumber: COPY.creator.lineNumber, columnNumber: fault === "copy" ? COPY.creator.columnNumber + 1 : COPY.creator.columnNumber }] } };
    event("Debugger.scriptParsed", { scriptId, executionContextId: 7, url, ...stackTrace });
    const callFrames = caller === null ? [{ location: { scriptId } }] : [
      { functionName: "", location: { scriptId, lineNumber: 0, columnNumber: 0 } },
      { functionName: COPY.creator.functionName, location: { scriptId: "script-preload", lineNumber: COPY.creator.lineNumber, columnNumber: COPY.creator.columnNumber } },
      { functionName: "", location: { scriptId: "script-preload", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber } }];
    event("Debugger.paused", { reason: "instrumentation", data: { scriptId, url }, hitBreakpoints: caller === null ? ["instrument"] : [], callFrames });
  };
  const bindings = { sessionId: "worker-session", targetId: "worker-target", targetUrl, targetTitle, expectedWindowTabId: windowTabId, projectUuid,
    assertCurrent: (): Promise<void> => { assert.equal(state.failed, false); return Promise.resolve(); }, fail: (): void => { state.failed = true; },
    nextEvent: (): Promise<CurrentSchematicDisplayWorkerBootstrapEvent> => { const next = queue.shift(); assert.ok(next !== undefined); return Promise.resolve(next); },
    projectSourceHeld: (held: unknown): Promise<void> => {
      assert.equal(state.callbacks, 0); assert.equal(state.projectResumed, false); assert.deepEqual(held, { scriptId: "script-project", uniqueContextId: "original-context", executionContextId: 7, source: "source-project" });
      assert.equal(commands.filter(command => command.phase === "schematic-worker-source").length, 7); state.callbacks += 1; return Promise.resolve();
    }, releaseParentWait: (): Promise<void> => { assert.equal(state.callbacks, 1); assert.equal(commands.at(-1)?.phase, "schematic-worker-remove"); state.released += 1; return Promise.resolve(); },
    request: (command: CurrentSchematicDisplayWorkerBootstrapCommand): Promise<unknown> => {
      commands.push(command);
      if (command.phase === "schematic-worker-runtime") { event("Runtime.executionContextCreated", { context: { id: 7, uniqueId: "original-context", name: targetTitle, origin: targetUrl } }); }
      if (command.phase === "schematic-worker-debugger") { return Promise.resolve({ debuggerId: "debugger" }); }
      if (command.phase === "schematic-worker-instrument") { return Promise.resolve({ breakpointId: "instrument" }); }
      if (command.phase === "schematic-worker-run-waiting") { stage("bootstrap"); }
      if (command.phase === "schematic-worker-source") { return Promise.resolve({ scriptSource: command.role === "bootstrap" ? BOOTSTRAPS[fault === "online" ? 0 : 1] : `source-${command.role}` }); }
      if (command.phase === "schematic-worker-resume") {
        event(fault === "resume" ? "Debugger.paused" : "Debugger.resumed", {});
        if (command.role === "project") { assert.equal(state.callbacks, 1); assert.equal(state.released, 1); state.projectResumed = true; }
        const index = ROLES.indexOf(command.role), next = ROLES[index + 1];
        if (next === "project" && fault !== "log") { event("Runtime.consoleAPICalled", { type: "log", args: [{ type: "string", value: LOG.message }], executionContextId: 7,
          timestamp: 1000, stackTrace: { callFrames: [{ scriptId: "script-preload", functionName: LOG.functionName, url: PRELOAD, lineNumber: LOG.lineNumber, columnNumber: LOG.columnNumber }] } }); }
        if (next !== undefined) { stage(next); }
      }
      return Promise.resolve({});
    } };
  const url = new URL("../src/current-schematic-display-worker-bootstrap.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-209-worker-bootstrap-source.ts") {
      const actual: unknown = sourceRequire(name); assert.ok(typeof actual === "object" && actual !== null);
      return { ...actual, qualifyCurrentPcb209StartupScriptSource: (role: CurrentPcb209StartupScriptRole, raw: unknown): string => {
        assert.ok(typeof raw === "object" && raw !== null && "scriptSource" in raw && typeof raw.scriptSource === "string");
        assert.equal(raw.scriptSource, role === "bootstrap" ? BOOTSTRAPS[fault === "online" ? 0 : 1] : `source-${role}`); return raw.scriptSource;
      } };
    }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicDisplayWorkerBootstrap"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual pure runner is VM-loaded with the explicit full-source-byte seam above; creator/pause/log/source-order guards remain production code.
  const runner = Reflect.construct(Constructor, [Object.freeze(bindings)]) as CurrentSchematicDisplayWorkerBootstrap; return { runner, commands, state };
}
void test("the seven-stage source callback arms before final original resume and preserves source-only limits", async () => {
  const f = await fixture(), result = await f.runner.observe();
  assert.equal(f.commands.length, 20); assert.equal(f.state.callbacks, 1); assert.equal(f.state.released, 1); assert.equal(f.state.projectResumed, true);
  assert.equal(result.completeImportedSourceQualified, true); assert.equal(result.nativeWorkerOwnershipIssuedByThisRunner, false); assert.equal(result.startupCompletionVerified, false);
  assert.equal(result.clockResponderVerified, false); assert.equal(result.selectedSqlAuthorized, false); await assert.rejects(f.runner.observe(), /CONSUMED/u);
});
void test("ONLINE source, foreign copy creators, missing original preload log and unobserved resume refuse without a project continuation", async () => {
  for (const fault of ["online", "copy", "log", "resume"] as const) {
    const f = await fixture(fault); await assert.rejects(f.runner.observe()); assert.equal(f.state.failed, true); assert.equal(f.state.projectResumed, false);
    assert.equal(f.state.callbacks, 0); assert.equal(f.state.released, 0); await assert.rejects(f.runner.observe(), /CONSUMED/u);
  }
});
