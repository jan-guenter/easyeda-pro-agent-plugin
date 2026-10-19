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
type Failure = "publication" | "validation" | "authority-after-return" | "entry-blocker" | "pre-dispatch-blocker" |
  "post-return-blocker" | "exit-blocker" | "admission-method" | "targeted-before-dispatch" | "targeted-after-return" | "journal-exit-targeted" |
  "admission-before-dispatch-binding" | "admission-exit-binding" | "journal-final-admission" |
  "opening-before-dispatch-admission" | "opening-final-admission";
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(failure?: Failure): Promise<{
  run: (options?: Readonly<{ copiedBaseline?: boolean; copiedProof?: boolean; sibling?: boolean }>) => Promise<unknown>;
  original: (result: unknown, options?: Readonly<{ copiedBaseline?: boolean; wrongEngine?: boolean }>) => unknown;
  revalidate: (result: unknown) => Promise<unknown>;
  retained: (sibling?: boolean) => unknown;
  raw: unknown;
  state: { alive: boolean; closedAuthority: boolean; artifactIntact: boolean; calls: number; writes: string[]; reads: number;
    blocked: boolean; admissions: number; targetedChecks: number; targetedIntact: boolean; bindingIntact: boolean; openingIntact: boolean };
}> {
  const evidenceId = "synthetic-clock-evidence", journalOperationId = "synthetic-schematic-close", operationId = "synthetic-schematic-reference";
  const target = { projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), ownerUuid: "3".repeat(32), schematicUuid: "4".repeat(16) };
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
  const journal = { operationId: journalOperationId, planHash: "8".repeat(64), orphanedCallPossible: false, nextSafeAction: "Synthetic original journal" };
  let lateTargetedChecks = 0, resultValidated = false;
  const head = { historyUuid: "9".repeat(32), createdAtLiteral: "2026-01-15 12:34:56" };
  const state = { alive: true, closedAuthority: true, artifactIntact: true, calls: 0, writes: [] as string[], reads: 0,
    blocked: failure === "entry-blocker", admissions: 0, targetedChecks: 0, targetedIntact: true, bindingIntact: true, openingIntact: true };
  const engine = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): undefined => undefined },
    assertBridgeAndRecoveryAdmission: (id: unknown): Promise<void> => {
      assert.equal(id, journalOperationId); state.admissions += 1;
      if (failure === "admission-before-dispatch-binding" && state.admissions === 2 ||
        failure === "admission-exit-binding" && state.admissions === 4) { state.bindingIntact = false; }
      if (failure === "journal-final-admission" && state.admissions === 4) { journal.nextSafeAction = "Synthetic admission-time journal drift"; }
      if (failure === "opening-before-dispatch-admission" && state.admissions === 2 ||
        failure === "opening-final-admission" && state.admissions === 4) { state.openingIntact = false; }
      assert.equal(state.blocked, false, "Synthetic new admission blocker"); return Promise.resolve();
    } };
  const owned = (value: unknown, receivedEngine: unknown): typeof baseline => {
    assert.equal(value, baseline, "Synthetic original baseline required"); assert.equal(receivedEngine, engine);
    assert.equal(state.alive, true, "Synthetic baseline lost"); return baseline;
  };
  const invocation = { profile: "synthetic-transport", parserSource: "synthetic-parser", scanPolicy: "synthetic-full-scan",
    mainSha256: "a".repeat(64), commandSha256: "b".repeat(64), stdinSha256: "c".repeat(64), sourcePins: {},
    runtimePinsSha256: "d".repeat(64), helperIdentity: {}, requestSha256: "e".repeat(64) };
  const intentSha256 = "f".repeat(64), retained = { syntheticEnvelope: true };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-aged-sql-reference.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Reflect, Buffer, join, canonicalJson, isRecord, sha256Json,
    CURRENT_AGED_SQL_DATE_PARSER_SOURCE: "synthetic-parser", MAIN_REFERENCE_PROFILE: "synthetic-main-reference",
    CURRENT_MAIN_REFERENCE_RUNTIME_PINS: { synthetic: true },
    randomBytes: (bytes: number): Buffer => { assert.equal(bytes, 32); return Buffer.alloc(32, 1); },
    newOperationId: (): string => "synthetic-wire-operation",
    assertOriginalCurrentSchematicRenameBaseline: owned,
    assertCurrentSchematicRenameClosedClockBinding: (...args: Parameters<typeof owned>): void => {
      owned(...args); assert.equal(state.bindingIntact, true, "Synthetic live baseline binding drift");
    },
    revalidateCurrentSchematicRenameOpeningEvidence: (value: unknown, candidate: unknown): Promise<void> => {
      assert.equal(value, baseline.owner); assert.equal(candidate, engine);
      assert.equal(state.openingIntact, true, "Synthetic original opening journal changed"); return Promise.resolve();
    },
    revalidateCurrentSchematicRenameClosedClockEvidence: (...args: Parameters<typeof owned>): Promise<typeof baseline> => {
      state.targetedChecks += 1; assert.equal(state.targetedIntact, true, "Synthetic targeted evidence drift");
      if (resultValidated) {
        lateTargetedChecks += 1;
        if (failure === "journal-exit-targeted" && lateTargetedChecks === 2) { journal.nextSafeAction = "Synthetic changed journal"; }
      }
      return Promise.resolve(owned(...args));
    },
    currentSchematicRenameBaselineClockBinding: (...args: Parameters<typeof owned>): typeof binding => { owned(...args); return binding; },
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
      if (failure === "pre-dispatch-blocker") { state.blocked = true; }
      if (failure === "targeted-before-dispatch") { state.targetedIntact = false; }
      if (failure === "admission-method") { engine.assertBridgeAndRecoveryAdmission = (): never => { throw new Error("Replacement admission must not run"); }; }
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
      if (failure === "post-return-blocker") { state.blocked = true; }
      if (failure === "targeted-after-return") { state.targetedIntact = false; }
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
    validateClockSample: (value: unknown): unknown => {
      assert.ok(value === nativeBefore || value === nativeAfter);
      if (value === nativeAfter) { resultValidated = true; }
      if (failure === "exit-blocker") { state.blocked = true; }
      return value;
    },
    testEngine: engine,
  });
  const api = bag(runInContext(`${program}
const first=new CurrentSchematicAgedSqlReferenceStage(testEngine),second=new CurrentSchematicAgedSqlReferenceStage(testEngine);
({run:(input,sibling)=>(sibling?second:first).runOnce(input),retained:(id,sibling)=>(sibling?second:first).originalReturn(id),
original:(value,engine,baseline)=>assertOriginalCurrentSchematicAgedSqlReference(value,engine,baseline),
revalidate:(value,baseline)=>revalidateOriginalCurrentSchematicAgedSqlReference(value,testEngine,baseline)});`, context));
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

void test("SCH scratch issuer retains only its original result, engine and baseline without granting APP or writer authority", async () => {
  const f = await fixture(), result = await f.run();
  assert.equal(f.original(result), result); assert.equal(await f.revalidate(result), result); assert.equal(f.retained(), f.raw);
  assert.equal(f.state.admissions, 4); assert.ok(f.state.targetedChecks >= 10);
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

void test("SCH scratch attempt is one-shot across stage instances and overlapping requests", async () => {
  const f = await fixture(), outcomes = await Promise.allSettled([f.run(), f.run({ sibling: true })]);
  assert.equal(outcomes[0]?.status, "fulfilled"); assert.equal(outcomes[1]?.status, "rejected");
  await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
  assert.equal(f.state.calls, 1); assert.deepEqual(f.state.writes, ["current-aged-reference-intent", "current-aged-reference-result"]);
});

void test("SCH scratch refuses copied baselines and consumes mismatched original-proof attempts before transport", async () => {
  const f = await fixture(); await assert.rejects(f.run({ copiedBaseline: true }), /original baseline/u);
  await assert.rejects(f.run({ copiedProof: true }), /original baseline proof/u);
  await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
  assert.equal(f.state.calls, 0); assert.deepEqual(f.state.writes, []); assert.equal(f.retained(), undefined);
});

for (const failure of ["publication", "validation", "authority-after-return"] as const) {
  void test(`SCH scratch retains the exact original transport return after ${failure} and never retries`, async () => {
    const f = await fixture(failure); await assert.rejects(f.run(), /Synthetic/u);
    assert.equal(f.retained(), f.raw); assert.equal(f.retained(true), undefined);
    assert.throws(() => f.original(f.raw), /original engine and baseline/u);
    f.state.closedAuthority = true;
    await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
    assert.equal(f.state.calls, 1); assert.deepEqual(f.state.writes, ["current-aged-reference-intent", "current-aged-reference-result"]);
  });
}

for (const [failure, admissions, calls] of [["entry-blocker", 1, 0], ["pre-dispatch-blocker", 2, 0],
  ["post-return-blocker", 3, 1], ["exit-blocker", 4, 1]] as const) {
  void test(`SCH scratch rechecks full admission at ${failure} without dispatch or acceptance after refusal`, async () => {
    const f = await fixture(failure);
    await assert.rejects(f.run(), /new admission blocker/u);
    assert.equal(f.state.admissions, admissions); assert.equal(f.state.calls, calls);
    assert.equal(f.retained(), calls === 0 ? undefined : f.raw);
    const expectedWrites: string[] = [];
    if (failure !== "entry-blocker") { expectedWrites.push("current-aged-reference-intent"); }
    if (calls === 1) { expectedWrites.push("current-aged-reference-result"); }
    assert.deepEqual(f.state.writes, expectedWrites);
    f.state.blocked = false;
    await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
    assert.equal(f.state.calls, calls);
  });
}

for (const failure of ["admission-method", "targeted-before-dispatch", "targeted-after-return"] as const) {
  void test(`SCH scratch keeps original guard and targeted evidence checks for ${failure}`, async () => {
    const f = await fixture(failure);
    await assert.rejects(f.run(), /closed baseline outside|targeted evidence drift/u);
    const calls = failure === "targeted-after-return" ? 1 : 0;
    assert.equal(f.state.calls, calls); assert.equal(f.retained(), calls === 1 ? f.raw : undefined);
    f.state.targetedIntact = true;
    await assert.rejects(f.run(), /already consumed/u); assert.equal(f.state.calls, calls);
  });
}

void test("SCH scratch rejects selected journal drift during the exit boundary's targeted reads", async () => {
  const f = await fixture("journal-exit-targeted");
  await assert.rejects(f.run(), /selected journal changed at its admission boundary/u);
  assert.equal(f.state.calls, 1); assert.equal(f.retained(), f.raw); assert.equal(f.state.admissions, 3);
  await assert.rejects(f.run(), /already consumed/u); await assert.rejects(f.run({ sibling: true }), /already consumed/u);
  assert.equal(f.state.calls, 1);
});

for (const [failure, calls] of [["admission-before-dispatch-binding", 0], ["admission-exit-binding", 1]] as const) {
  void test(`SCH scratch rejects live binding drift during ${failure} without another scan`, async () => {
    const f = await fixture(failure);
    await assert.rejects(f.run(), /live baseline binding drift/u);
    assert.equal(f.state.calls, calls); assert.equal(f.state.admissions, calls === 0 ? 2 : 4);
    assert.equal(f.retained(), calls === 0 ? undefined : f.raw);
    f.state.bindingIntact = true; await assert.rejects(f.run(), /already consumed/u); assert.equal(f.state.calls, calls);
  });
}

for (const [failure, calls] of [["journal-final-admission", 1], ["opening-before-dispatch-admission", 0], ["opening-final-admission", 1]] as const) {
  void test(`SCH scratch rechecks selected and opening journals after ${failure}`, async () => {
    const f = await fixture(failure);
    await assert.rejects(f.run(), /selected journal changed after full admission|original opening journal changed/u);
    assert.equal(f.state.calls, calls); assert.equal(f.state.admissions, calls === 0 ? 2 : 4);
    assert.equal(f.retained(), calls === 0 ? undefined : f.raw);
    await assert.rejects(f.run(), /already consumed/u); assert.equal(f.state.calls, calls);
  });
}
