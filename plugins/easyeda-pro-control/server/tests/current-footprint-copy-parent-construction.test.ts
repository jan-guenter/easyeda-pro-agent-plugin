/** Actual controller with synthetic native owner and an explicit complete-source
 * issuer stub. Pauses are original callback objects, not resumed journal JSON. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintParentConstructionRunner } from "../src/current-footprint-copy-parent-construction-runner.ts";
import type { CurrentFootprintParentConstructionCommand as Command, CurrentFootprintParentConstructionTransport as Transport } from "../src/current-footprint-copy-parent-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES as SITES } from "../src/current-footprint-copy-parent-worker-source.ts";
import { fixture as peerFixture } from "./helpers/current-footprint-parent-worker-fixture.ts";

async function constructor(): Promise<typeof CurrentFootprintParentConstructionRunner> {
  const path = new URL("../src/current-footprint-copy-parent-construction-runner.ts", import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-parent-worker-source.ts") { return { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES: SITES,
      qualifyCurrentFootprintCopyParentWorkerSource: (value: string): void => { assert.equal(value, "synthetic-complete-manager-source"); } }; }
    return actualRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const result = loaded.exports["CurrentFootprintParentConstructionRunner"]; assert.ok(typeof result === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual class is loaded with only the source issuer replaced above.
  return result as typeof CurrentFootprintParentConstructionRunner;
}
async function fixture(receiverClass = "tl"): Promise<{ runner: CurrentFootprintParentConstructionRunner; commands: Command[];
  pause: (side: "before" | "after", column?: number) => void; state: { exited: boolean; source: string; sourceError: Error | null; failResume: boolean; unsubscribed: boolean } }> {
  const Constructor = await constructor(), commands: Command[] = [], state: { exited: boolean; source: string; sourceError: Error | null; failResume: boolean; unsubscribed: boolean } =
    { exited: false, source: "synthetic-complete-manager-source", sourceError: null, failResume: false, unsubscribed: false };
  let listener: Parameters<Transport["subscribe"]>[0] | null = null, resumeCount = 0;
  const pause = (side: "before" | "after", column: number = SITES[side].columnNumber): void => {
    assert.ok(listener !== null); listener.paused({ reason: "other", hitBreakpoints: [`breakpoint-${side}`], callFrames: [{ functionName: "open", callFrameId: `frame-${side}`,
      location: { scriptId: "manager-script", lineNumber: 104, columnNumber: column } }] });
  };
  const transport: Transport = {
    assertOriginalOwner: () => Promise.resolve(),
    assertOriginalGenerationExited: () => { assert.ok(state.exited, "generation remains alive"); return Promise.resolve(); },
    subscribe: selected => { listener = selected; return () => { state.unsubscribed = true; }; },
    request: command => {
      commands.push(command);
      if (command.phase === "source") { return state.sourceError === null ? Promise.resolve({ scriptSource: state.source }) : Promise.reject(state.sourceError); }
      if (command.method === "Debugger.setBreakpoint") { return Promise.resolve({ breakpointId: command.phase, actualLocation: command.params.location }); }
      if (command.phase === "receiver") { return Promise.resolve({ result: { type: "object", className: receiverClass, description: receiverClass, objectId: command.params.callFrameId === "frame-before" ? "project-before" : "project" } }); }
      if (command.phase === "before" || command.phase === "after") { return Promise.resolve({ result: { type: "boolean", value: true } }); }
      if (command.phase === "resume") {
        assert.ok(listener !== null); resumeCount += 1; listener.resumed();
        if (resumeCount === 1) { pause("after"); }
        if (state.failResume) { return Promise.reject(new Error("lost resume acknowledgment")); }
      }
      return Promise.resolve({});
    },
  };
  const runner = new Constructor(transport, { sessionId: "parent", uniqueContextId: "parent-context", managerScriptId: "manager-script", projectUuid: "a".repeat(64), windowTabId: "tab" });
  return { runner, commands, pause, state };
}

void test("parent holds the original post-Worker receiver until the actual peer packet passes", async () => {
  const value = await fixture(); await value.runner.arm();
  const work = value.runner.captureUntilHeld(); value.pause("before"); const held = await work;
  assert.deepEqual(held, { parentSessionId: "parent", parentUniqueContextId: "parent-context", projectObjectId: "project" });
  assert.equal(value.commands.length, 10); await value.runner.requireOriginalHeld(held); assert.equal(value.commands.length, 10);
  assert.equal(value.commands.filter(command => command.phase === "resume").length, 1); assert.ok(value.runner.retained().held);
  const peer = peerFixture(); const packet = await peer.runner.observe();
  await value.runner.resumeAfterPeer(peer.runner, packet); assert.equal(value.commands.length, 12);
  await assert.rejects(value.runner.resumeAfterPeer(peer.runner, packet)); assert.equal(value.commands.length, 12);
  await value.runner.release(); await value.runner.requireOriginalParent(held); await peer.runner.release();
  assert.equal(value.commands.length, 13); assert.ok(value.state.unsubscribed);
  value.state.exited = true; await value.runner.observeOriginalGenerationEnded(); await assert.rejects(value.runner.requireOriginalParent(held));
});
void test("lost original resume reply retains the later pause for generation cleanup and never resumes it", async () => {
  const value = await fixture(); await value.runner.arm(); value.state.failResume = true;
  const work = value.runner.captureUntilHeld(); value.pause("before"); await assert.rejects(work, /lost resume acknowledgment/u);
  assert.equal(value.commands.filter(command => command.phase === "resume").length, 1); assert.equal(value.runner.retained().captured, false);
  assert.ok(value.runner.retained().held); await assert.rejects(value.runner.release());
  await assert.rejects(value.runner.observeOriginalGenerationEnded(), /generation remains alive/u);
  value.state.exited = true; await value.runner.observeOriginalGenerationEnded(); assert.ok(value.state.unsubscribed);
});
void test("temporary-project sl receiver is refused without resuming its constructor", async () => {
  const value = await fixture("sl"); await value.runner.arm();
  const work = value.runner.captureUntilHeld(); value.pause("before"); await assert.rejects(work);
  assert.equal(value.commands.filter(command => command.phase === "resume").length, 0);
  assert.equal(value.runner.retained().captured, false);
  value.state.exited = true; await value.runner.observeOriginalGenerationEnded();
});
void test("wrong pause location or changed complete source stops without a speculative parent resume", async () => {
  const wrong = await fixture(); await wrong.runner.arm(); const work = wrong.runner.captureUntilHeld(); wrong.pause("before", 125_908);
  await assert.rejects(work, /PAUSE_LOCATION/u); assert.equal(wrong.commands.filter(command => command.phase === "resume").length, 0);
  wrong.state.exited = true; await wrong.runner.observeOriginalGenerationEnded();
  const changed = await fixture(); changed.state.source = "changed"; await assert.rejects(changed.runner.arm());
  assert.equal(changed.commands.length, 1); changed.state.exited = true; await changed.runner.observeOriginalGenerationEnded();
});

void test("original root and Job exit settles a pending constructor wait without a speculative resume", async () => {
  const value = await fixture(); await value.runner.arm();
  const pending = value.runner.captureUntilHeld();
  const refused = assert.rejects(pending, /ORIGINAL_GENERATION_ENDED/u);
  await assert.rejects(value.runner.observeOriginalGenerationEnded(), /generation remains alive/u);
  assert.equal(value.runner.retained().originalGenerationEnded, false);
  assert.equal(value.runner.retained().failed, false);
  value.state.exited = true;
  await value.runner.observeOriginalGenerationEnded(); await refused;
  assert.equal(value.commands.length, 3);
  assert.equal(value.commands.filter(command => command.phase === "resume").length, 0);
  assert.equal(value.runner.retained().originalGenerationEnded, true);
  assert.equal(value.runner.retained().released, true);
  assert.ok(value.state.unsubscribed);
  await assert.rejects(value.runner.captureUntilHeld(), /CAPTURE_CONSUMED/u);
});

void test("parent diagnostics retain the first fixed location refusal through failed and completed termination cleanup", async () => {
  const value = await fixture(); await value.runner.arm();
  const work = value.runner.captureUntilHeld(); value.pause("before", 125_908); await assert.rejects(work, /PAUSE_LOCATION/u);
  const first = value.runner.diagnostics().firstFailure;
  assert.deepEqual(first, { code: "PAUSE_LOCATION", phase: "waiting-before", expectedPause: "before", observedPause: null, requests: 3, replies: 4 });
  assert.ok(Object.isFrozen(first));
  await assert.rejects(value.runner.observeOriginalGenerationEnded());
  assert.equal(value.runner.diagnostics().firstFailure, first);
  value.state.exited = true; await value.runner.observeOriginalGenerationEnded();
  assert.equal(value.runner.diagnostics().firstFailure, first);
  assert.equal(value.commands.filter(command => command.phase === "resume").length, 0);
});

void test("dependency errors cannot forge a parent diagnostic code or publish source text", async () => {
  for (const message of ["private fixture source and actor must not be published", "FOOTPRINT_PARENT_CONSTRUCTION_PRIVATE_SOURCE"]) {
    const value = await fixture(); value.state.sourceError = new Error(message);
    await assert.rejects(value.runner.arm(), error => error === value.state.sourceError);
    const first = value.runner.diagnostics().firstFailure;
    assert.deepEqual(first, { code: "DEPENDENCY_FAILURE", phase: "source", expectedPause: "none", observedPause: null, requests: 1, replies: 0 });
    assert.equal(JSON.stringify(value.runner.diagnostics()).includes(message), false);
    value.state.exited = true; await value.runner.observeOriginalGenerationEnded();
    assert.equal(value.runner.diagnostics().firstFailure, first);
  }
});
