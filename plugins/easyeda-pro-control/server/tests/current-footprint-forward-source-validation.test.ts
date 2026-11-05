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

const operationId = "footprint-forward-execution-source-validation";
const rawWindowsPath = String.raw`C:\Synthetic\validation.eprj2`;
const launch = { action: "launch", operationId,
  target: { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
  footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true,
  acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true, confirmValidationOnly: true, confirmDiagnosticLaunch: true };

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
