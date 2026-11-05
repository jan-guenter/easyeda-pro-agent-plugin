/** Exact public source-only selectors and original no-allocation cleanup.
 * No native process, project read or writer is activated by these cases. */
/* oxlint-disable import/max-dependencies -- Join actual controller, registered wrapper and offline discovery contracts in this original-cleanup regression. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintForwardSourceValidation } from "../src/current-footprint-forward-source-validation.ts";
import { currentFootprintForwardSourceValidationRequestSchema, queryCurrentFootprintForwardSourceValidation,
  validateCurrentFootprintForwardSourceValidationArguments } from "../src/current-footprint-forward-source-validation-schema.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { forwardExecutionOpeningJournalFixture } from "./helpers/forward-execution-opening-journal-fixture.ts";
import type { CurrentFootprintForwardExecutionOpeningProvider } from "../src/current-footprint-forward-execution-opening.ts";
import { currentFootprintForwardExecutionOpeningRequestSchema } from "../src/current-footprint-forward-execution-opening-contract.ts";
import { markCurrentFootprintExecutionDependency } from "../src/current-footprint-copy-execution-purpose.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentFootprintCopyStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";

const operationId = "footprint-forward-execution-source-validation";
const rawWindowsPath = String.raw`C:\Synthetic\validation.eprj2`;
const launch = { action: "launch", operationId,
  target: { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
  footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true,
  acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true, confirmValidationOnly: true, confirmDiagnosticLaunch: true };

function unstartedOpeningWorkRefused(): never { return assert.fail("An unstarted original wrapper must issue no native or opening work"); }
/** Keep the original class/private transport code while naming each synthetic
 * source/native collector dependency; this never constructs an application. */
async function loadOriginalOpeningTestModule(url: URL, text: string, replacements: ReadonlyMap<string, unknown>): Promise<Record<string, unknown>> {
  const require = createRequire(url); const output = await transform(text, { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (replacements.has(name)) { return replacements.get(name); }
    // oxlint-disable-next-line import/no-dynamic-require -- Actual class/transport imports stay unchanged outside the named source/native collector seams.
    return require(name) as unknown;
  }, loaded, loaded.exports]); return loaded.exports;
}

void test("offline discovery validates the separate strict source route without promoting v1 or accepting authority injection", () => {
  const discovered = queryOfflineApi(apiRequestSchema.parse({ action: "footprint-forward-source-validation", query: { includeSchemas: true } })).result;
  assert.deepEqual(discovered, queryCurrentFootprintForwardSourceValidation(true));
  assert.equal(validateCurrentFootprintForwardSourceValidationArguments(launch)["valid"], true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-forward-source-validation", request: launch }).success, true);
  const capture = { action: "capture-source", operationId, expectedBindingSha256: "a".repeat(64) };
  for (const action of [launch, capture]) {
    for (const extra of [{ nativeOwner: {} }, { executionReady: true }, { saveAuthorized: true }, { callerCode: "return 1" }]) {
      assert.equal(currentFootprintForwardSourceValidationRequestSchema.safeParse({ ...action, ...extra }).success, false);
    }
    assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-forward-prewrite", request: action }).success, false);
  }
  for (const action of ["create", "copy", "execute", "observe-footprint-route", "save"]) {
    assert.equal(currentFootprintForwardSourceValidationRequestSchema.safeParse({ ...capture, action }).success, false);
  }
});

void test("an original pre-journal admission failure is consumed and cleanable without allocating or adopting a journal", async () => {
  const failure = new Error("synthetic original admission refusal"); let calls = 0;
  const controller = new CurrentFootprintForwardSourceValidation(Object.freeze({ pluginRoot: "/synthetic-unused", assetsRoot: "/synthetic-unused",
    powershellSha256: "a".repeat(64), powershellBytes: 1, assertLocalAllowed: (): void => undefined,
    assertAllowed: (): Promise<void> => { calls += 1; return Promise.reject(failure); }, assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() }));
  assert.equal(Object.isFrozen(controller), true); assert.deepEqual(Reflect.ownKeys(controller), []);
  await assert.rejects(controller.run(launch), error => error === failure);
  assert.equal(calls, 1); assert.equal(controller.hasAttemptedNativeOwnerAllocation(), false);
  assert.equal(controller.hasOwnedAllocation(), false); assert.equal(controller.hasActiveReservation(), false);
  const inspected = await controller.run({ action: "inspect", operationId });
  assert.equal(inspected["originalBindingRetained"], false); assert.equal(inspected["intentSha256"], null);
  await assert.rejects(controller.run({ action: "cleanup-before-launch", operationId: "footprint-forward-execution-foreign" }), /ORIGINAL_OPERATION/u);
  await controller.run({ action: "cleanup-before-launch", operationId });
  assert.equal(controller.hasActiveReservation(), false); assert.equal(controller.hasOwnedAllocation(), false);
  await assert.rejects(controller.run(launch), /ORIGINAL_OPERATION/u); assert.equal(calls, 1);
});

void test("confirmed original abort joins a held publication without replay or a racing normal failure append", async () => {
  const held = await forwardExecutionOpeningJournalFixture("held-main-result");
  const selected = currentFootprintForwardExecutionOpeningRequestSchema.parse({ operationId, target: launch.target, footprintUuid: launch.footprintUuid,
    confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
  const journal = new held.Journal(selected); await journal.reserve();
  for (const stage of ["prepare", "allocation", "launch"] as const) {
    await journal.append(`${stage}-intent`, {});
    const result = { launch: "binding", prepare: "prepare-result", allocation: "allocation-result" } as const;
    await journal.append(result[stage], {});
  }
  const reservation = Object.freeze({ originalSyntheticJob: true }); let aborts = 0, reservations = 0;
  const owner = Object.freeze({
    status: (): object => ({ binding: null }),
    observeFootprintMainConstruction: (): Promise<object> => Promise.resolve({ observed: true }),
    reserveFootprintCombinedAbort: (): object => { reservations += 1; return reservation; },
    dispatchFootprintCombinedAbort: (original: object, confirm: true): Promise<void> => {
      assert.equal(original, reservation); assert.equal(confirm, true); aborts += 1; return Promise.resolve();
    },
  });
  const source = new URL("../src/current-footprint-forward-execution-opening.ts", import.meta.url); const require = createRequire(source);
  let text = await readFile(source, "utf8");
  const anchor = "  public constructor(input: CurrentPcbDiagnosticLifecycleOptions)"; assert.equal(text.split(anchor).length, 2);
  // Only original external native collectors are synthetic. Actual provider
  // Cutoff, private journal idle promise and managed publication remain intact.
  text = text.replace(anchor, `  public seedSyntheticPendingOwnerForTest(owner: object, journal: object, request: object): void {
    this.#owner=owner as never;this.#journal=journal as never;this.#request=request as never;this.#stage="launched";this.#launchAttempted=true;
    this.#journalCurrent=captureCurrentFootprintForwardExecutionReceiver(journal,journalPrototypes,["reserve","append","settle","waitForCurrentPublication","assertCurrent","retained","reservationOutcome"]);
  }
${anchor}`);
  const output = await transform(text, { loader: "ts", format: "cjs", target: "node24" }); const loaded = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-forward-execution-opening-journal.ts") { return { CurrentFootprintForwardExecutionOpeningJournal: held.Journal }; }
    if (name === "./current-pcb-diagnostic-owner.ts") { return { assertOriginalCurrentFootprintForwardExecutionNativeOwner: (actual: unknown): void => { assert.equal(actual, owner); } }; }
    // oxlint-disable-next-line import/no-dynamic-require -- Preserve unchanged provider imports; only named native collectors and the actual held publisher are isolated above.
    return require(name) as unknown;
  }, loaded, loaded.exports]);
  const api: unknown = loaded.exports;
  assert.ok(api !== null && typeof api === "object" && "CurrentFootprintForwardExecutionOpeningProvider" in api && typeof api.CurrentFootprintForwardExecutionOpeningProvider === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The transformed original class retains its actual private journal/cutoff methods; only named native collectors are synthetic.
  const Constructor = api.CurrentFootprintForwardExecutionOpeningProvider as typeof CurrentFootprintForwardExecutionOpeningProvider;
  const provider = new Constructor(Object.freeze({ pluginRoot: "/synthetic-unused", assetsRoot: "/synthetic-unused",
    powershellSha256: "a".repeat(64), powershellBytes: 1, assertLocalAllowed: (): void => undefined,
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() }));
  const seed: unknown = Reflect.get(provider, "seedSyntheticPendingOwnerForTest"); assert.ok(typeof seed === "function"); Reflect.apply(seed, provider, [owner, journal, selected]);
  const normal = assert.rejects(provider.observeMain(), /NORMAL_ENDED/u); await held.entered;
  let abortSettled = false;
  const abort = (async (): Promise<unknown> => {
    try { await provider.abort(true); return null; } catch (error) { return error; } finally { abortSettled = true; }
  })();
  try {
    const turn = Promise.withResolvers<null>(); setImmediate(() => { turn.resolve(null); }); await turn.promise;
    assert.equal(aborts, 0); assert.equal(reservations, 1); assert.equal(abortSettled, false);
  } finally { held.release(); }
  await normal; assert.equal(await abort, null);
  assert.equal(aborts, 1); assert.equal(reservations, 1);
  assert.equal(journal.retained().records.filter(record => record.kind === "failure").length, 0);
  await assert.rejects(provider.abort(true), /ABORT_UNAVAILABLE/u); assert.equal(aborts, 1);
  // Close only this data-only journal fixture; no native exit is asserted.
  await journal.append("termination-intent", { ordinal: 1 }); await journal.append("termination-result", { ordinal: 1, terminated: true });
  await journal.append("release-intent", {}); await journal.append("release-result", { released: true });
});

void test("terminated original cleanup skips only its genuine never-invoked opening without navigation or wrapper settlement", async () => {
  const sourceQualification = Object.freeze({ syntheticSourceIssuer: true });
  const state = { requests: 0, subscriptions: 0, helperReleases: 0, terminationProved: false };
  const dependency = Object.freeze({ parentTargetId: "synthetic-parent", parentSessionId: "synthetic-session",
    request: (): Promise<never> => { state.requests += 1; return Promise.reject(new Error("Unexpected native request")); },
    subscribe: (): (() => void) => { state.subscriptions += 1; return unstartedOpeningWorkRefused; },
    assertOriginalOwner: (): Promise<void> => Promise.resolve(),
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.terminationProved, true); return Promise.resolve(); } });
  markCurrentFootprintExecutionDependency(dependency);
  const binding = Object.freeze({ context: unstartedOpeningWorkRefused, reprove: unstartedOpeningWorkRefused, begin: unstartedOpeningWorkRefused, finish: unstartedOpeningWorkRefused,
    observeParent: unstartedOpeningWorkRefused, ancillaryFrame: unstartedOpeningWorkRefused, observeAncillary: unstartedOpeningWorkRefused, ancillaryObservation: unstartedOpeningWorkRefused });
  const openingUrl = new URL("../src/current-pcb-209-worker-startup-opening.ts", import.meta.url);
  const providerUrl = new URL("../src/current-footprint-forward-execution-opening.ts", import.meta.url);
  const openingModule = await loadOriginalOpeningTestModule(openingUrl, await readFile(openingUrl, "utf8"), new Map([["./current-pcb-209-actor-clock-source.ts", {
    requireCurrentPcb209ActorClockSourceQualification: (actual: unknown): void => { assert.equal(actual, sourceQualification); },
  }]]));
  const actualOpening = openingModule["CurrentFootprintCopyStartupOpening"]; assert.ok(typeof actualOpening === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual original opening/private core and transport; only complete-source qualification above is synthetic.
  const Opening = actualOpening as typeof CurrentFootprintCopyStartupOpening;
  const opening: unknown = Reflect.construct(Opening, [{ dependency, opening: binding, actorClockSourceQualification: sourceQualification }]);
  assert.ok(opening instanceof Opening);
  await assert.rejects(opening.releaseAfterTermination(), /RELEASE_STATE/u);
  const held = await forwardExecutionOpeningJournalFixture("held-main-result");
  const selected = currentFootprintForwardExecutionOpeningRequestSchema.parse({ operationId: `${operationId}-unstarted`, target: launch.target,
    footprintUuid: launch.footprintUuid, confirmDisposableProject: true, acceptExistingProfileEffects: true,
    acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
  const journal = new held.Journal(selected); await journal.reserve();
  for (const stage of ["prepare", "allocation", "launch"] as const) {
    await journal.append(`${stage}-intent`, {}); await journal.append(stage === "launch" ? "binding" : `${stage}-result`, {});
  }
  await journal.append("close-intent", { hwnd: "123" }); await journal.append("close-result", { requested: true });
  await journal.append("termination-intent", { ordinal: 1 }); await journal.append("termination-result", { ordinal: 1, terminated: true });
  const owner = Object.freeze({ releaseClosed: (): Promise<void> => { assert.equal(state.terminationProved, true); state.helperReleases += 1; return Promise.resolve(); } });
  let providerText = await readFile(providerUrl, "utf8");
  const anchor = "  public constructor(input: CurrentPcbDiagnosticLifecycleOptions)"; assert.equal(providerText.split(anchor).length, 2);
  providerText = providerText.replace(anchor, `  public seedUnstartedOpeningForTest(owner: object, opening: object, journal: object, request: object, lease: object): void {
    this.#owner=owner as never;this.#opening=opening as never;this.#journal=journal as never;this.#request=request as never;this.#lease=lease as never;
    this.#failed=new Error('synthetic receiver capture failure');this.#stage='ui-source';this.#launchAttempted=true;this.#cleanupKind='close';
    this.#journalCurrent=captureCurrentFootprintForwardExecutionReceiver(journal,journalPrototypes,['reserve','append','settle','waitForCurrentPublication','assertCurrent','retained','reservationOutcome']);
  }
  public retainSyntheticOriginalTerminationForTest(): void {this.#terminated=true;}
${anchor}`);
  const providerModule = await loadOriginalOpeningTestModule(providerUrl, providerText, new Map<string, unknown>([
    ["./current-pcb-209-worker-startup-opening.ts", openingModule],
    ["./current-footprint-forward-execution-opening-journal.ts", { CurrentFootprintForwardExecutionOpeningJournal: held.Journal }],
    ["./current-pcb-diagnostic-owner.ts", { assertOriginalCurrentFootprintForwardExecutionNativeOwner: (actual: unknown): void => { assert.equal(actual, owner); } }],
  ]));
  const actualProvider = providerModule["CurrentFootprintForwardExecutionOpeningProvider"]; assert.ok(typeof actualProvider === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Original provider/private cleanup over the actual opening; native termination/helper callbacks are explicit synthetic seams.
  const Provider = actualProvider as typeof CurrentFootprintForwardExecutionOpeningProvider;
  const provider = new Provider(Object.freeze({ pluginRoot: "/synthetic-unused", assetsRoot: "/synthetic-unused", powershellSha256: "a".repeat(64), powershellBytes: 1,
    assertLocalAllowed: (): void => undefined, assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() }));
  const seed: unknown = Reflect.get(provider, "seedUnstartedOpeningForTest"); assert.ok(typeof seed === "function");
  Reflect.apply(seed, provider, [owner, opening, journal, selected, acquireCurrentPcbDiagnosticLaunchExclusion()]);
  await assert.rejects(provider.release(), /RELEASE_UNAVAILABLE/u); assert.equal(state.helperReleases, 0);
  state.terminationProved = true;
  const terminated: unknown = Reflect.get(provider, "retainSyntheticOriginalTerminationForTest"); assert.ok(typeof terminated === "function"); Reflect.apply(terminated, provider, []);
  await provider.release(); assert.equal(state.helperReleases, 1);
  const observed = opening.status(); assert.equal(observed.consumed, false); assert.equal(observed.settled, false); assert.equal(observed.openingAttempted, false);
  assert.equal(observed.transport.started, false); assert.equal(observed.transport.requests, 0);
  assert.equal(state.requests, 0); assert.equal(state.subscriptions, 0); assert.equal(journal.retained().records.at(-1)?.kind, "release-result");
  await assert.rejects(provider.release(), /RELEASE_UNAVAILABLE/u); assert.equal(state.helperReleases, 1);
  const lease = acquireCurrentPcbDiagnosticLaunchExclusion(); releaseCurrentPcbDiagnosticLaunchExclusion(lease);
});
