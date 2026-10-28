/* oxlint-disable import/max-dependencies -- Exercises the actual lifecycle, adapter, durable journal and original completed SQL reader with explicitly synthetic native collaborators. */
/* oxlint-disable eslint/max-classes-per-file -- These three synthetic collaborators replace only the opening, PCB and empty-session boundaries in one isolated module loader. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentFootprintCopyStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import { canonicalJson } from "../src/core.ts";
import { CurrentPcbWorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupHandoff } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcb209EmptyStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "../src/current-pcb-209-worker-startup-opening.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

type Row = Record<string, unknown>;
interface Fixture {
  readonly coordinator: CurrentPcb209EmptyStartupLifecycle;
  readonly owner: Row;
  readonly state: { terminated: boolean };
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
 * configure its synthetic owner for the separate empty209 purpose. Production
 * lifecycle/adapter source is evaluated byte-for-byte, without guard changes. */
async function loadFixture(lifecycle: Row): Promise<FixtureModule> {
  const path = new URL("current-pcb-diagnostic-lifecycle.test.ts", import.meta.url);
  const complete = await readFile(path, "utf8"), offset = complete.indexOf("\nvoid test(");
  assert.ok(offset > 10_000 && offset < 40_000);
  let source = complete.slice(0, offset);
  const substitutions = [
    ["diagnostic-test|pcb209-test|string-precreate-test|worker-startup-test", "diagnostic-test|pcb209-test|pcb209-empty-test|string-precreate-test|worker-startup-test"],
    ['const startupPurpose = id.startsWith("worker-startup-");', 'const startupPurpose = id.startsWith("worker-startup-") || id.startsWith("pcb209-empty-");'],
    ['profile: ownerPurpose, stringPrecreateConsumed:', 'profile: startupPurpose ? "worker-startup-empty209" : ownerPurpose, stringPrecreateConsumed:'],
    ['if (opening209) { coordinator =', 'if (opening209 && !startupPurpose) { coordinator ='],
    ['return Promise.resolve({ sourceVerified: true, family: profile.family, executionAuthorized: false });',
      'return Promise.resolve({ sourceVerified: true, family: profile.family, sourceSha256: profile.scriptSha256, sourceBytes: profile.scriptBytes, relativePath: profile.relativePath, executionAuthorized: false });'],
  ] as const;
  for (const [before, after] of substitutions) {
    assert.equal(source.split(before).length, 2); source = source.replace(before, after);
  }
  assert.equal(source.split("/worker-startup-launch-intent/u").length, 3);
  source = source.replaceAll("/worker-startup-launch-intent/u", "/pcb209-empty-startup-launch-intent/u");
  source += "\nexport { fixture, readyForOpening, directory, OPEN_RESULT, STARTUP_OPEN_INPUT };\n";
  const loaded = await loadSource(path, source, new Map([["../src/current-pcb-diagnostic-lifecycle.ts", {
    ...lifecycle, CurrentPcbWorkerStartupLifecycle: lifecycle["CurrentPcb209EmptyStartupLifecycle"],
  }]]));
  for (const name of ["fixture", "readyForOpening", "directory"]) { assert.equal(typeof loaded[name], "function"); }
  assert.ok(loaded["OPEN_RESULT"] !== null && typeof loaded["OPEN_RESULT"] === "object");
  assert.ok(loaded["STARTUP_OPEN_INPUT"] !== null && typeof loaded["STARTUP_OPEN_INPUT"] === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked exports come from the bounded maintained fixture prefix; no production capability is reconstructed.
  return loaded as unknown as FixtureModule;
}
async function fixture(context: TestContext, mode: "prepare-fails" | "intent-changes" | "ordered"): Promise<Readonly<{
  value: Fixture; id: string; binding: string; observe: () => Promise<Row>;
  counters: { issue: number; prepared: number; navigation: number; empty: number; durableIntent: number };
}>> {
  const counters = { issue: 0, prepared: 0, navigation: 0, empty: 0, durableIntent: 0 }, id = `pcb209-empty-test-${mode}`;
  let module: FixtureModule | null = null, result: CurrentPcb209WorkerStartupOpeningResult | null = null;
  let reverify: (() => Promise<unknown>) | null = null;
  let retainedDependency: unknown = null;
  const packet = Object.freeze({ syntheticPcbPacket: true });
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
    public releaseAfterTermination(): Promise<void> { assert.equal(this.#original.syntheticTransport, true); return Promise.resolve(); }
  }
  class Pcb {
    readonly #packet = packet;
    public async openAndQualify(): Promise<typeof packet> {
      assert.ok(module !== null && reverify !== null);
      const path = join(module.directory(id), "worker-startup-empty-intent.json"), raw = await readFile(path, "utf8");
      const intent = diagnosticLifecycleRecordSchemas["worker-startup-empty-intent.json"].parse(JSON.parse(raw) as unknown);
      assert.equal(intent.operationId, id); counters.durableIntent += 1;
      try {
        if (mode === "intent-changes") { await writeFile(path, canonicalJson({ ...intent, createdAt: "2026-01-02T00:00:00Z" })); }
        await reverify(); counters.navigation += 1; return this.#packet;
      } finally {
        // Restore only this deliberately changed synthetic test record, so the
        // Actual lifecycle can prove cleanup against its original durable intent.
        if (mode === "intent-changes") { await writeFile(path, raw); }
      }
    }
    public status(): Row { assert.equal(this.#packet, packet); return { synthetic: true, navigation: counters.navigation }; }
    public retainedOpeningObservation(): null { assert.equal(this.#packet, packet); return null; }
  }
  class Empty {
    readonly #packet = packet;
    public constructor(input: Readonly<{ packet: unknown; pcb: unknown; dependency: unknown }>) {
      assert.equal(input.packet, packet); assert.ok(input.pcb instanceof Pcb); assert.equal(input.dependency, retainedDependency);
    }
    public observeAndJoin(): never { assert.equal(this.#packet, packet); counters.empty += 1; throw new Error("synthetic stop after original PCB navigation"); }
    public requireOriginal(): never { assert.equal(this.#packet, packet); return unused(); }
    public status(): Row { assert.equal(this.#packet, packet); return { synthetic: true, complete: false }; }
  }
  const classes = new Map<string, unknown>([["./current-pcb-209-worker-startup-opening.ts", { CurrentFootprintCopyStartupOpening, CurrentPcb209WorkerStartupOpening: Opening }],
    ["./current-pcb-209-worker-startup-pcb-session.ts", { CurrentPcb209WorkerStartupPcbSession: Pcb }],
    ["./current-pcb-209-worker-startup-empty-session.ts", { CurrentPcb209WorkerStartupEmptySession: Empty }]]);
  const adapter = await loadFile("../src/current-pcb-worker-startup-lifecycle-adapter.ts", classes);
  classes.set("./current-pcb-worker-startup-lifecycle-adapter.ts", adapter);
  const lifecycle = await loadFile("../src/current-pcb-diagnostic-lifecycle.ts", classes);
  module = await loadFixture(lifecycle);
  const value = module.fixture(context, id, { create209StartupOpening: (): Opening => new Opening() });
  result = Object.freeze({ opening: module.OPEN_RESULT, construction: Object.freeze({
    profile: "private.current-pcb209-worker-construction.v1", pauses: 9, originalConstructorAndFactoryEventsRetained: true,
    originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
    nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false,
  }), workerIdentity: Object.freeze({ projectUuid: module.OPEN_RESULT.projectUuid, branchUuid: module.OPEN_RESULT.branchUuid, windowTabId: "fixture-tab" }),
  ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false });
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const channel = new CurrentPcbWorkerStartupChannel({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(value.state.terminated); return Promise.resolve(); },
    observeOriginalParentEvent: unused, exchange: unused });
  const handoff: CurrentPcbWorkerStartupHandoff = Object.freeze({ channel, dependency: await channel.start(), opening: Object.freeze({
    context: (): Readonly<{ sessionId: string; uniqueContextId: string }> => ({ sessionId: parent.sessionId, uniqueContextId: "parent-context" }),
    reprove: (): Promise<void> => Promise.resolve(), begin: unused, finish: unused, observeParent: unused,
    ancillaryFrame: (): null => null, observeAncillary: unused, ancillaryObservation: (): null => null,
  }) });
  retainedDependency = handoff.dependency;
  value.owner["handoffWorkerStartup"] = async (): Promise<CurrentPcbWorkerStartupHandoff> => {
    assert.ok(module !== null); await readFile(join(module.directory(id), "worker-startup-handoff-intent.json")); return handoff;
  };
  value.owner["requireWorkerStartupEmptyDependency209"] = (): Promise<typeof handoff.dependency> => {
    counters.issue += 1; if (mode === "prepare-fails") { return Promise.reject(new Error("synthetic preparation failure")); }
    return Promise.resolve(handoff.dependency);
  };
  value.owner["prepareWorkerStartupPcbSession209"] = (opening: unknown, selected: unknown, _target: unknown, check: () => Promise<unknown>): Promise<Pcb> => {
    assert.ok(opening instanceof Opening); assert.equal(selected, result); reverify = check; counters.prepared += 1; return Promise.resolve(new Pcb());
  };
  context.after(async (): Promise<void> => { value.state.terminated = true; await channel.releaseAfterTermination(); });
  await module.readyForOpening(id, value);
  const inspect = await value.coordinator.run({ action: "inspect", operationId: id });
  const binding = inspect["bindingSha256"];
  assert.equal(typeof binding, "string"); assert.ok(typeof binding === "string");
  await value.coordinator.handoffWorkerStartup(id, binding);
  assert.equal(await value.coordinator.openWorkerStartup(id, binding, module.STARTUP_OPEN_INPUT), result);
  return { value, id, binding, counters, observe: (): Promise<Row> => value.coordinator.observeWorkerStartupEmpty(id, binding) };
}
for (const mode of ["prepare-fails", "intent-changes", "ordered"] as const) {
  void test(`synthetic empty209 lifecycle retains consumed failure and original intent before navigation: ${mode}`, async context => {
    const current = await fixture(context, mode);
    const expected = { "prepare-fails": /synthetic preparation failure/u, "intent-changes": /STARTUP_EMPTY_INTENT_CHANGED/u,
      ordered: /synthetic stop after original PCB navigation/u }[mode];
    await assert.rejects(current.observe(), expected);
    const status = await current.value.coordinator.run({ action: "inspect", operationId: current.id });
    assert.equal(status["workerStartupEmptyAttemptConsumed"], true); assert.equal(status["workerStartupEmptyFailed"], true);
    assert.equal(status["workerStartupEmptyResultPublished"], false);
    await assert.rejects(current.observe(), /STARTUP_EMPTY_CONSUMED/u);
    assert.deepEqual(current.counters, { issue: 1, prepared: mode === "prepare-fails" ? 0 : 1,
      navigation: mode === "ordered" ? 1 : 0, empty: mode === "ordered" ? 1 : 0, durableIntent: mode === "prepare-fails" ? 0 : 1 });
  });
}
