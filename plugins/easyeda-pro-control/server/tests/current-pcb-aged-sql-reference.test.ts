/** Actual issuer body with synthetic trusted boundaries. No native scratch,
 * Windows helper, live artifact or production ownership token is created.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "publication" | "validation" | "authority-after-return";
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(failure?: Failure): Promise<{
  run: (options?: Readonly<{ copiedBaseline?: boolean; copiedProof?: boolean; sibling?: boolean }>) => Promise<unknown>;
  original: (result: unknown, options?: Readonly<{ copiedBaseline?: boolean; wrongEngine?: boolean }>) => unknown;
  revalidate: (result: unknown) => Promise<unknown>;
  retained: (sibling?: boolean) => unknown;
  raw: unknown;
  state: { alive: boolean; closedAuthority: boolean; artifactIntact: boolean; calls: number; writes: string[]; reads: number };
}> {
  const evidenceId = "synthetic-clock-evidence", journalOperationId = "synthetic-pcb-close", operationId = "synthetic-pcb-reference";
  const target = { projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), ownerUuid: "3".repeat(32), pcbUuid: "4".repeat(16) };
  const baseline = { owner: { operationId }, intent: { target }, copy: { receiptSha256: "5".repeat(64) },
    inventory: { logicalSha256: "6".repeat(64) } };
  const proof = { closedAt: "2026-10-18T12:00:00.000Z" };
  const binding = { journalOperationId, phase: "baseline-close", proof };
  const sample = { zoneRulesSha256: "7".repeat(64), localOffsetMinutes: -120, qpcFrequency: "10000000",
    utcBeforeTicks: "639279792000000000", utcAfterTicks: "639279792000010000", qpcBefore: "200", qpcAfter: "210" };
  const clock = { clock: { status: "observed", after: sample }, base: { checkedAt: proof.closedAt },
    ownerBinding: { operationId: journalOperationId, phase: binding.phase } };
  const nativeBefore = { ...sample, utcBeforeTicks: "639279792000020000", utcAfterTicks: "639279792000030000", qpcBefore: "220", qpcAfter: "230" };
  const nativeAfter = { ...sample, utcBeforeTicks: "639279792000040000", utcAfterTicks: "639279792000050000", qpcBefore: "240", qpcAfter: "250" };
  const controlsAfter = { syntheticControls: true }, observation = { reference: { mainReference: controlsAfter }, nativeBefore, nativeAfter };
  const raw = Object.freeze({ stdout: JSON.stringify(observation), syntheticOriginal: true });
  const journal = { operationId: journalOperationId, planHash: "8".repeat(64), orphanedCallPossible: false };
  const head = { historyUuid: "9".repeat(32), createdAtLiteral: "2026-01-15 12:34:56" };
  const state = { alive: true, closedAuthority: true, artifactIntact: true, calls: 0, writes: [] as string[], reads: 0 };
  const engine = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): undefined => undefined },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(),
    assertRecoveryOperationIsolated: (id: unknown): Promise<void> => { assert.equal(id, journalOperationId); return Promise.resolve(); } };
  const owned = (value: unknown, receivedEngine: unknown): typeof baseline => {
    assert.equal(value, baseline, "Synthetic original baseline required"); assert.equal(receivedEngine, engine);
    assert.equal(state.alive, true, "Synthetic baseline lost"); return baseline;
  };
  const invocation = { profile: "synthetic-transport", parserSource: "synthetic-parser", scanPolicy: "synthetic-full-scan",
    mainSha256: "a".repeat(64), commandSha256: "b".repeat(64), stdinSha256: "c".repeat(64), sourcePins: {},
    runtimePinsSha256: "d".repeat(64), helperIdentity: {}, requestSha256: "e".repeat(64) };
  const intentSha256 = "f".repeat(64), retained = { syntheticEnvelope: true };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-aged-sql-reference.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Reflect, Buffer, join, canonicalJson, isRecord, sha256Json,
    CURRENT_AGED_SQL_DATE_PARSER_SOURCE: "synthetic-parser", MAIN_REFERENCE_PROFILE: "synthetic-main-reference",
    CURRENT_MAIN_REFERENCE_RUNTIME_PINS: { synthetic: true },
    randomBytes: (bytes: number): Buffer => { assert.equal(bytes, 32); return Buffer.alloc(32, 1); },
    newOperationId: (): string => "synthetic-wire-operation",
    assertOriginalCurrentPcbRenameBaseline: owned,
    revalidateCurrentPcbRenameBaseline: (...args: Parameters<typeof owned>): Promise<typeof baseline> => Promise.resolve(owned(...args)),
    currentPcbRenameBaselineClockBinding: (...args: Parameters<typeof owned>): typeof binding => { owned(...args); return binding; },
    assertCurrentClosedSessionCopyAuthority: (value: unknown): void => {
      assert.equal(value, proof); assert.equal(state.closedAuthority, true, "Synthetic closed authority lost");
    },
    loadOperation: (id: unknown): Promise<typeof journal> => { assert.equal(id, journalOperationId); return Promise.resolve(journal); },
    selectCurrentUnlockedSqlHead: (inventory: unknown, selected: unknown): Promise<typeof head> => {
      assert.equal(inventory, baseline.inventory); assert.equal(selected, target); return Promise.resolve(head);
    },
    windowsClockObservationForResult: (value: unknown, phase: unknown): Promise<typeof clock> => {
      assert.equal(value, proof); assert.equal(phase, "termination"); return Promise.resolve(clock);
    },
    assertCurrentIssuedWindowsClockObservation: (value: unknown): void => { assert.equal(value, clock); },
    validateMainReferenceRequest: (value: unknown): Bag => bag(value),
    compileCurrentAgedSqlReferenceTransport: (request: unknown): Promise<typeof invocation> => {
      const parsed = bag(request); assert.equal(parsed["createdAtLiteral"], head.createdAtLiteral);
      assert.equal(parsed["baselineCopyReceiptSha256"], baseline.copy.receiptSha256); return Promise.resolve(invocation);
    },
    currentSymbolClockEvidenceId: (id: unknown): string => { assert.equal(id, operationId); return evidenceId; },
    operationPath: (id: unknown): string => { assert.equal(id, evidenceId); return `/synthetic/${evidenceId}.json`; },
    writePhaseArtifact: (id: unknown, sequence: unknown, phase: string, value: unknown): Promise<Bag> => {
      assert.equal(id, evidenceId); assert.equal(sequence, 0); state.writes.push(phase);
      if (phase === "current-aged-reference-result") {
        assert.equal(value, retained);
        if (failure === "publication") { return Promise.reject(new Error("Synthetic publication refusal")); }
      }
      return Promise.resolve({ path: `/synthetic/${evidenceId}/00-${phase}.json`, bytes: 10, sha256: intentSha256 });
    },
    readExactUtf8Artifact: (value: unknown): Promise<void> => {
      assert.equal(typeof bag(value)["path"], "string"); state.reads += 1; assert.equal(state.artifactIntact, true, "Synthetic artifact drift"); return Promise.resolve();
    },
    invokeMainReferenceTransport: (value: unknown): Promise<typeof raw> => {
      assert.equal(value, invocation); state.calls += 1;
      if (failure === "authority-after-return") { state.closedAuthority = false; }
      return Promise.resolve(raw);
    },
    retainMainReferenceTransportV2: (value: unknown, requestHash: unknown, intentHash: unknown): typeof retained => {
      assert.equal(value, raw); assert.equal(requestHash, invocation.requestSha256); assert.equal(intentHash, intentSha256); return retained;
    },
    successfulRetainedMainReferenceText: (value: unknown): { text: string } => { assert.equal(value, retained); return { text: raw.stdout }; },
    validateMainReferenceTransportV3Result: (value: unknown, compiled: unknown): typeof observation => {
      assert.equal(compiled, invocation); assert.deepEqual(structuredClone(value), observation);
      if (failure === "validation") { throw new Error("Synthetic native relation refusal"); }
      return observation;
    },
    validateClockControls: (value: unknown): typeof controlsAfter => { assert.equal(value, controlsAfter); return controlsAfter; },
    validateClockSample: (value: unknown): unknown => { assert.ok(value === nativeBefore || value === nativeAfter); return value; },
    testEngine: engine,
  });
  const api = bag(runInContext(`${program}
const first=new CurrentPcbAgedSqlReferenceStage(testEngine),second=new CurrentPcbAgedSqlReferenceStage(testEngine);
({run:(input,sibling)=>(sibling?second:first).runOnce(input),retained:(id,sibling)=>(sibling?second:first).originalReturn(id),
original:(value,engine,baseline)=>assertOriginalCurrentPcbAgedSqlReference(value,engine,baseline),
revalidate:(value,baseline)=>revalidateOriginalCurrentPcbAgedSqlReference(value,testEngine,baseline)});`, context));
  const invoke = (name: string, args: unknown[]): unknown => { const method = api[name]; assert.ok(typeof method === "function");
    return Reflect.apply(method, undefined, args) as unknown; };
  return { state, raw,
    run: async (options = {}): Promise<unknown> => await invoke("run", [{ baseline: options.copiedBaseline === true ? structuredClone(baseline) : baseline,
      proof: options.copiedProof === true ? structuredClone(proof) : proof }, options.sibling === true]),
    original: (result, options = {}): unknown => invoke("original", [result, options.wrongEngine === true ? {} : engine,
      options.copiedBaseline === true ? structuredClone(baseline) : baseline]),
    revalidate: async (result): Promise<unknown> => await invoke("revalidate", [result, baseline]),
    retained: (sibling = false): unknown => invoke("retained", [operationId, sibling]),
  };
}

void test("PCB scratch issuer retains only its original result, engine and baseline without granting APP or writer authority", async () => {
  const f = await fixture(), result = await f.run();
  assert.equal(f.original(result), result); assert.equal(await f.revalidate(result), result); assert.equal(f.retained(), f.raw);
  assert.equal(f.retained(true), undefined); assert.equal(Object.isFrozen(result), true);
  const returned = bag(result);
  for (const flag of ["currentAppSourceQualified", "appClockDirectlyObserved", "executionAuthorized", "fullScanWireOutputRetained"]) {
    assert.equal(returned[flag], false);
  }
  assert.equal(returned["originalScratchProcessRetained"], true); assert.equal(returned["fullScanRequiredBeforeResult"], true);
  assert.throws(() => f.original(structuredClone(result)), /original engine and baseline/u);
  assert.throws(() => f.original(result, { copiedBaseline: true }), /original engine and baseline/u);
  assert.throws(() => f.original(result, { wrongEngine: true }), /original engine and baseline/u);
  f.state.artifactIntact = false; await assert.rejects(f.revalidate(result), /artifact drift/u);
  assert.equal(f.retained(), f.raw); assert.equal(f.state.calls, 1);
});

void test("PCB scratch attempt is one-shot across stage instances and overlapping requests", async () => {
  const f = await fixture(), outcomes = await Promise.allSettled([f.run(), f.run({ sibling: true })]);
  assert.equal(outcomes[0]?.status, "fulfilled"); assert.equal(outcomes[1]?.status, "rejected");
  await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
  assert.equal(f.state.calls, 1); assert.deepEqual(f.state.writes, ["current-aged-reference-intent", "current-aged-reference-result"]);
});

void test("PCB scratch refuses copied baselines and consumes mismatched original-proof attempts before transport", async () => {
  const f = await fixture(); await assert.rejects(f.run({ copiedBaseline: true }), /original baseline/u);
  await assert.rejects(f.run({ copiedProof: true }), /original baseline proof/u);
  await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
  assert.equal(f.state.calls, 0); assert.deepEqual(f.state.writes, []); assert.equal(f.retained(), undefined);
});

for (const failure of ["publication", "validation", "authority-after-return"] as const) {
  void test(`PCB scratch retains the exact original transport return after ${failure} and never retries`, async () => {
    const f = await fixture(failure); await assert.rejects(f.run(), /Synthetic/u);
    assert.equal(f.retained(), f.raw); assert.equal(f.retained(true), undefined);
    assert.throws(() => f.original(f.raw), /original engine and baseline/u);
    f.state.closedAuthority = true;
    await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
    assert.equal(f.state.calls, 1); assert.deepEqual(f.state.writes, ["current-aged-reference-intent", "current-aged-reference-result"]);
  });
}
