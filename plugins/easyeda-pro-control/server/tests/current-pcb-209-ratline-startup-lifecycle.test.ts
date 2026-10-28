/* oxlint-disable import/max-dependencies -- Exercises the actual lifecycle, adapter, durable journal and original completed SQL reader with explicitly synthetic native collaborators. */
/* oxlint-disable eslint/max-classes-per-file -- These two synthetic collaborators replace only the opening and native-session boundaries in one isolated module loader. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { canonicalJson } from "../src/core.ts";
import { CurrentPcb209RatlineStartupChannel } from "../src/current-pcb-209-ratline-startup-channel.ts";
import { CurrentPcb209RatlineBudget } from "../src/current-pcb-209-ratline-budget.ts";
import type { CurrentPcbWorkerStartupHandoff } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcb209RatlineStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "../src/current-pcb-209-worker-startup-opening.ts";
import { CurrentFootprintCopyStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

type Row = Record<string, unknown>;
interface Fixture {
  readonly coordinator: CurrentPcb209RatlineStartupLifecycle;
  readonly owner: Row;
  readonly state: { terminated: boolean };
  readonly calls: string[];
  readonly request: (action: string, extra?: Row) => Promise<Row>;
}
interface FixtureModule {
  readonly fixture: (context: TestContext, id: string, dependencies: Row) => Fixture;
  readonly readyForOpening: (id: string, value: Fixture) => Promise<void>;
  readonly directory: (id: string) => string;
  readonly OPEN_RESULT: CurrentPcb209WorkerStartupOpeningResult["opening"];
  readonly STARTUP_OPEN_INPUT: Row;
}
function unused(): never { throw new Error("Unexpected synthetic native operation"); }
async function loadSource(path: URL, source: string, replacements: ReadonlyMap<string, unknown>): Promise<Row> {
  const generated = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const actualRequire = createRequire(path), loaded: { exports: Row } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${generated.code}\n})`);
  assert.equal(typeof evaluate, "function");
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => replacements.has(name) ? replacements.get(name) : actualRequire(name) as unknown, loaded, loaded.exports]);
  return loaded.exports;
}
async function loadFile(relative: string, replacements: ReadonlyMap<string, unknown>): Promise<Row> {
  const path = new URL(relative, import.meta.url); return loadSource(path, await readFile(path, "utf8"), replacements);
}
/** Reuse only the existing non-test fixture prefix. The substitutions below
 * configure its synthetic owner for the separate ratline209 purpose. Production
 * lifecycle/adapter source is evaluated byte-for-byte, without guard changes. */
async function loadFixture(lifecycle: Row): Promise<FixtureModule> {
  const path = new URL("current-pcb-diagnostic-lifecycle.test.ts", import.meta.url);
  const complete = await readFile(path, "utf8"), offset = complete.indexOf("\nvoid test(");
  assert.ok(offset > 10_000 && offset < 40_000);
  let source = complete.slice(0, offset);
  const substitutions = [
    ["diagnostic-test|pcb209-test|string-precreate-test|worker-startup-test", "diagnostic-test|pcb209-test|pcb209-ratline-test|string-precreate-test|worker-startup-test"],
    ['const startupPurpose = id.startsWith("worker-startup-");', 'const startupPurpose = id.startsWith("worker-startup-") || id.startsWith("pcb209-ratline-");'],
    ['profile: ownerPurpose, stringPrecreateConsumed:', 'profile: startupPurpose ? "worker-startup-ratline209" : ownerPurpose, stringPrecreateConsumed:'],
    ['if (opening209) { coordinator =', 'if (opening209 && !startupPurpose) { coordinator ='],
    ['return Promise.resolve({ sourceVerified: true, family: profile.family, executionAuthorized: false });',
      'return Promise.resolve({ sourceVerified: true, family: profile.family, sourceSha256: profile.scriptSha256, sourceBytes: profile.scriptBytes, relativePath: profile.relativePath, executionAuthorized: false });'],
  ] as const;
  for (const [before, after] of substitutions) {
    assert.equal(source.split(before).length, 2); source = source.replace(before, after);
  }
  assert.equal(source.split("/worker-startup-launch-intent/u").length, 3);
  source = source.replaceAll("/worker-startup-launch-intent/u", "/pcb209-ratline-startup-launch-intent/u");
  source += "\nexport { fixture, readyForOpening, directory, OPEN_RESULT, STARTUP_OPEN_INPUT };\n";
  const loaded = await loadSource(path, source, new Map([["../src/current-pcb-diagnostic-lifecycle.ts", {
    ...lifecycle, CurrentPcbWorkerStartupLifecycle: lifecycle["CurrentPcb209RatlineStartupLifecycle"],
  }]]));
  for (const name of ["fixture", "readyForOpening", "directory"]) { assert.equal(typeof loaded[name], "function"); }
  assert.ok(loaded["OPEN_RESULT"] !== null && typeof loaded["OPEN_RESULT"] === "object");
  assert.ok(loaded["STARTUP_OPEN_INPUT"] !== null && typeof loaded["STARTUP_OPEN_INPUT"] === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked exports come from the bounded maintained fixture prefix; no production capability is reconstructed.
  return loaded as unknown as FixtureModule;
}
async function fixture(context: TestContext, mode: "prepare-fails" | "intent-changes" | "ordered"): Promise<Readonly<{
  value: Fixture; id: string; binding: string; observe: () => Promise<Row>;
  counters: { prepared: number; navigation: number; capture: number; durableIntent: number; abort: number; release: number };
}>> {
  const counters = { prepared: 0, navigation: 0, capture: 0, durableIntent: 0, abort: 0, release: 0 }, id = `pcb209-ratline-test-${mode}`;
  let module: FixtureModule | null = null, result: CurrentPcb209WorkerStartupOpeningResult | null = null;
  let reverify: (() => Promise<unknown>) | null = null;
  let originalFixture: Fixture | null = null;
  class Opening {
    readonly #original = Object.freeze({ syntheticTransport: true });
    #opened = false;
    public async open(_target: unknown, check: () => Promise<void>): Promise<CurrentPcb209WorkerStartupOpeningResult> {
      assert.ok(module !== null && result !== null);
      const intent = await readFile(join(module.directory(id), "worker-startup-opening-intent.json"), "utf8");
      assert.match(intent, /pcb-worker-startup-opening-intent/u); await check(); this.#opened = true; return result;
    }
    public status(): Row { return { consumed: this.#opened, settled: this.#opened, completed: this.#opened, synthetic: true }; }
    public retainedOpeningResult(): CurrentPcb209WorkerStartupOpeningResult["opening"] | null { return this.#opened ? result?.opening ?? null : null; }
    public requireOriginal(selected: unknown): Promise<object> { assert.equal(selected, result); assert.ok(this.#opened); return Promise.resolve(this.#original); }
    public proveCurrentAssignments = unused;
    public requireCurrentAssignments = unused;
    public retainedActorObservation(): null { assert.equal(this.#original.syntheticTransport, true); return null; }
    public observeActorClock = unused;
    public requireActorClock = unused;
    public retainedChannelObservation(): null { assert.equal(this.#original.syntheticTransport, true); return null; }
    public observeCurrentChannel = unused;
    public requireCurrentChannel = unused;
    public releaseAfterTermination(): Promise<void> { assert.equal(this.#original.syntheticTransport, true); assert.ok(originalFixture); originalFixture.calls.push("opening-release"); return Promise.resolve(); }
  }
  class Session {
    #consumed = false;
    public async captureFirstChildHeld(): Promise<never> {
      assert.ok(module !== null && reverify !== null); assert.equal(this.#consumed, false); this.#consumed = true; counters.capture += 1;
      const path = join(module.directory(id), "worker-startup-ratline-intent.json"), raw = await readFile(path, "utf8");
      const intent = diagnosticLifecycleRecordSchemas["worker-startup-ratline-intent.json"].parse(JSON.parse(raw) as unknown);
      assert.equal(intent.operationId, id); counters.durableIntent += 1;
      try {
        if (mode === "intent-changes") { await writeFile(path, canonicalJson({ ...intent, createdAt: "2026-01-02T00:00:00Z" })); }
        await reverify(); counters.navigation += 1;
        throw new Error("synthetic stop after original PCB navigation");
      } finally {
        // Restore only this deliberately changed synthetic record for cleanup.
        if (mode === "intent-changes") { await writeFile(path, raw); }
      }
    }
    public requireOriginal(): never { assert.equal(this.#consumed, true); return unused(); }
    public status(): Row { return { synthetic: true, consumed: this.#consumed }; }
    public retainedOpeningObservation(): null { assert.equal(typeof this.#consumed, "boolean"); return null; }
    public retainedRejectedStopEvidence(): null { assert.equal(typeof this.#consumed, "boolean"); return null; }
    public retainedNativeOriginEvidence(): null { assert.equal(typeof this.#consumed, "boolean"); return null; }
    public retainedAncestryEvidence(): null { assert.equal(typeof this.#consumed, "boolean"); return null; }
    public abort(): Promise<void> { assert.equal(this.#consumed, true); assert.ok(originalFixture); counters.abort += 1; originalFixture.calls.push("ratline-abort"); return Promise.resolve(); }
    public releaseAfterTermination(): Promise<void> {
      assert.equal(this.#consumed, true); assert.ok(originalFixture); assert.equal(originalFixture.state.terminated, true); counters.release += 1; originalFixture.calls.push("ratline-release"); return Promise.resolve();
    }
  }
  const classes = new Map<string, unknown>([["./current-pcb-209-worker-startup-opening.ts", { CurrentPcb209WorkerStartupOpening: Opening, CurrentFootprintCopyStartupOpening }],
    ["./current-pcb-209-ratline-native-session.ts", { CurrentPcb209RatlineNativeSession: Session }],
    /* Held-import qualification does not run the empty-only continuation filter,
     * even when that separate filter would reject this target as populated. */
    ["./current-pcb-209-ratline-checkpoint.ts", { rejectCurrentPcb209RatlineCheckpointPopulation: (): never => {
      throw new Error("PCB209_RATLINE_CHECKPOINT_KNOWN_POPULATED");
    } }]]);
  const adapter = await loadFile("../src/current-pcb-worker-startup-lifecycle-adapter.ts", classes);
  classes.set("./current-pcb-worker-startup-lifecycle-adapter.ts", adapter);
  const lifecycle = await loadFile("../src/current-pcb-diagnostic-lifecycle.ts", classes);
  module = await loadFixture(lifecycle);
  const value = module.fixture(context, id, { create209StartupOpening: (): Opening => new Opening() });
  originalFixture = value;
  result = Object.freeze({ opening: module.OPEN_RESULT, construction: Object.freeze({
    profile: "private.current-pcb209-worker-construction.v1", pauses: 9, originalConstructorAndFactoryEventsRetained: true,
    originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
    nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false,
  }), workerIdentity: Object.freeze({ projectUuid: module.OPEN_RESULT.projectUuid, branchUuid: module.OPEN_RESULT.branchUuid, windowTabId: "fixture-tab" }),
  ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false });
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const budget = new CurrentPcb209RatlineBudget();
  for (let index = 1; index < parent.nextRequestId; index += 1) { budget.consumeDiscoveryRequest(index); } budget.closeDiscovery(parent.nextRequestId);
  const channel = new CurrentPcb209RatlineStartupChannel({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(value.state.terminated); return Promise.resolve(); },
    observeOriginalParentEvent: unused, exchange: (request): Promise<unknown> => {
      assert.equal(request["action"], "worker-startup-ratline-abort"); value.calls.push("channel-abort"); return Promise.resolve({ aborted: true });
    } }, budget);
  const handoff: CurrentPcbWorkerStartupHandoff = Object.freeze({ channel, dependency: await channel.start(), opening: Object.freeze({
    context: (): Readonly<{ sessionId: string; uniqueContextId: string }> => ({ sessionId: parent.sessionId, uniqueContextId: "parent-context" }),
    reprove: (): Promise<void> => Promise.resolve(), begin: unused, finish: unused, observeParent: unused,
    ancillaryFrame: (): null => null, observeAncillary: unused, ancillaryObservation: (): null => null,
  }) });
  value.owner["handoffWorkerStartup"] = async (): Promise<CurrentPcbWorkerStartupHandoff> => {
    assert.ok(module !== null); await readFile(join(module.directory(id), "worker-startup-handoff-intent.json")); return handoff;
  };
  value.owner["prepareWorkerStartupRatlineSession209"] = (opening: unknown, selected: unknown, _target: unknown, check: () => Promise<unknown>): Session => {
    assert.ok(opening instanceof Opening); assert.equal(selected, result); reverify = check; counters.prepared += 1;
    if (mode === "prepare-fails") { throw new Error("synthetic preparation failure"); }
    return new Session();
  };
  context.after(async (): Promise<void> => { value.state.terminated = true; await channel.releaseAfterTermination(); });
  await module.readyForOpening(id, value);
  const inspect = await value.coordinator.run({ action: "inspect", operationId: id });
  const binding = inspect["bindingSha256"];
  assert.equal(typeof binding, "string"); assert.ok(typeof binding === "string");
  await value.coordinator.handoffWorkerStartup(id, binding);
  assert.equal(await value.coordinator.openWorkerStartup(id, binding, module.STARTUP_OPEN_INPUT), result);
  return { value, id, binding, counters, observe: (): Promise<Row> => value.coordinator.observeWorkerStartupRatline(id, binding) };
}
for (const mode of ["prepare-fails", "intent-changes", "ordered"] as const) {
  void test(`synthetic ratline209 lifecycle retains consumed failure and original intent before navigation: ${mode}`, async context => {
    const current = await fixture(context, mode);
    const expected = { "prepare-fails": /synthetic preparation failure/u, "intent-changes": /LIFECYCLE_JOURNAL_CHANGED/u,
      ordered: /synthetic stop after original PCB navigation/u }[mode];
    await assert.rejects(current.observe(), expected);
    const status = await current.value.coordinator.run({ action: "inspect", operationId: current.id });
    assert.equal(status["workerStartupRatlineAttemptConsumed"], true); assert.equal(status["workerStartupRatlineFailed"], true);
    assert.equal(status["workerStartupRatlineResultPublished"], false);
    await assert.rejects(current.observe(), /STARTUP_RATLINE_CONSUMED/u);
    assert.deepEqual(current.counters, { prepared: 1, navigation: mode === "ordered" ? 1 : 0,
      capture: mode === "prepare-fails" ? 0 : 1, durableIntent: mode === "prepare-fails" ? 0 : 1, abort: 0, release: 0 });
    await current.value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
    current.value.state.terminated = true;
    await current.value.request("observe-termination"); await current.value.request("release-closed");
    const { calls } = current.value;
    if (mode === "prepare-fails") {
      assert.equal(current.counters.abort, 0); assert.equal(current.counters.release, 0);
      assert.ok(calls.includes("channel-abort") && calls.indexOf("channel-abort") < calls.indexOf("close"));
    }
    else {
      assert.equal(current.counters.abort, 1); assert.equal(current.counters.release, 1);
      assert.ok(calls.indexOf("ratline-abort") < calls.indexOf("close"));
      assert.ok(calls.indexOf("ratline-release") < calls.indexOf("opening-release"));
    }
    assert.ok(calls.indexOf("opening-release") < calls.indexOf("release"));
  });
}
