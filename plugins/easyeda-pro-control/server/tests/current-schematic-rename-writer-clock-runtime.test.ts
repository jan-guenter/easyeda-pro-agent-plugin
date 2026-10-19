/** Actual private N0 collector with synthetic imports. No native ownership,
 * backend producer qualification, mutation or connected result is created. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "intent-publication" | "before-clock" | "call" | "after-clock" | "owner-after-reply" |
  "decode" | "prepare" | "result-publication" | "mark-after-durable-clear" | "journal-after-clock";
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function noOp(): undefined { return undefined; }
async function fixture(failure: Failure = "none"): Promise<{
  run: (badStartup?: boolean) => Promise<Bag>; evidence: () => Bag; original: (token: unknown, copiedOwner?: boolean) => Bag;
  values: Map<string, unknown>; raw: object; state: { calls: string[]; clockCount: number; dispatches: number; returned: boolean; clears: number };
  mutateRaw: () => void;
}> {
  const owner = Object.freeze({ operationId: "synthetic-sch-writer-n0", profile: "private.current-schematic-rename-writer-owner.v1" });
  const generation = Object.freeze({ operationId: owner.operationId }), startup = Object.freeze({ synthetic: "original-sch-startup" });
  const lease = Object.freeze({ synthetic: "original-lease" });
  const beforeClock = Object.freeze({ synthetic: "original-before-clock" }); const armedClock = Object.freeze({ synthetic: "original-armed-clock" });
  const actor = Object.freeze({ uuid: "a".repeat(32), username: "Actor", nickname: "Actor" });
  const target = Object.freeze({ projectUuid: "b".repeat(64), branchUuid: "c".repeat(32), ownerUuid: actor.uuid, schematicUuid: "d".repeat(16) });
  const expectation = Object.freeze({ sheetUuids: [], templates: [] }); const baseline = Object.freeze({ intent: { target, desiredTitle: "New SCH" } });
  const journal: Bag = { operationId: owner.operationId, sequence: 12, artifacts: [], state: "project-only-opened", orphanedCallPossible: false };
  let disk = structuredClone(journal);
  const original = { baseline, capture: Object.freeze({ synthetic: "original-capture" }), launch: Object.freeze({ synthetic: "original-launch" }),
    source: { purpose: "disposable-validation", expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/assets" } } } };
  const source = Object.freeze({ generation, journal, original }); const observed = Object.freeze({ source: original,
    expectation, observation: { runtimeObservation: { actor } } });
  const raw = { synthetic: "original-n0-reply" }; const documentBefore = Object.freeze({ synthetic: "decoded-n0" });
  const clockPlan = Object.freeze({ synthetic: "original-clock-plan" });
  const values = new Map<string, unknown>(); const state = { calls: [] as string[], clockCount: 0, dispatches: 0, returned: false, clears: 0 };
  const engine = { upstream: {
    currentAuthenticatedBridgeDispatchBinding: (): typeof lease => lease,
    callTool: (name: unknown, args: Bag, timeout: unknown, binding: unknown): Promise<unknown> => {
      assert.equal(name, "easyeda_execute"); assert.equal(binding, lease); assert.equal(timeout, 25_000);
      assert.deepEqual(structuredClone(args), { code: "fixed-n0", timeoutMs: 15_000, confirmWrite: true });
      state.calls.push("call"); state.dispatches += 1;
      if (failure === "call") { return Promise.reject(new Error("synthetic-call")); }
      state.returned = true; return Promise.resolve(raw);
    },
  }, assertBridgeDispatchAllowed: noOp, assertRecoveryOperationIsolated: noOp,
  freshClockObservationForClosedCapture: (capture: unknown): Promise<unknown> => {
    assert.equal(capture, original.capture); state.clockCount += 1; state.calls.push(`clock-${String(state.clockCount)}`);
    if (state.clockCount === 1 && failure === "before-clock" || state.clockCount === 2 && failure === "after-clock") {
      return Promise.reject(new Error("synthetic-clock"));
    }
    if (state.clockCount === 2 && failure === "journal-after-clock") { disk["foreign"] = true; }
    return Promise.resolve(state.clockCount === 1 ? beforeClock : armedClock);
  },
  markOrphanedCallRisk: async (value: unknown, phase: unknown, before: () => Promise<void>): Promise<unknown> => {
    assert.equal(value, journal); assert.equal(phase, "current-schematic-rename-writer-once"); state.calls.push("mark");
    journal["orphanedCallPossible"] = true; journal["orphanedCallPhase"] = phase; disk = structuredClone(journal); await before();
    if (failure === "mark-after-durable-clear") {
      journal["orphanedCallPossible"] = false; disk = structuredClone(journal); throw new Error("synthetic-release");
    }
    return { binding: lease };
  }, clearOrphanedCallRisk: (): Promise<void> => {
    state.calls.push("clear"); state.clears += 1; journal["orphanedCallPossible"] = false; disk = structuredClone(journal);
    return Promise.resolve();
  } };
  const context = createContext({ Object, Map, WeakMap, Date, Error, AggregateError, structuredClone, canonicalJson, sha256Json, sha256Text,
    assertExpectedFingerprint: noOp, validateSdkLocalRuntimeFingerprint: noOp, assertUpstreamReplySettled: noOp,
    verifyCurrentProjectOnlySymbolPreflightImplementation: noOp, verifyCurrentSymbolPersistenceImplementation: noOp,
    assertCurrentSchematicRenameWriterOwner: (value: unknown, selectedEngine: unknown, scope: unknown): typeof source => {
      assert.equal(value, owner); assert.equal(selectedEngine, engine); assert.equal(scope, canonicalJson(lease));
      if (state.returned && failure === "owner-after-reply") { throw new Error("synthetic-owner"); } return source;
    },
    assertOriginalCurrentSchematicRenameStartup: (value: unknown, selectedEngine: unknown, selectedGeneration: unknown): typeof observed => {
      assert.equal(value, startup, "synthetic-startup"); assert.equal(selectedEngine, engine); assert.equal(selectedGeneration, generation); return observed;
    }, revalidateCurrentSchematicRenameStartupObservation: noOp,
    loadOperation: (): Promise<Bag> => Promise.resolve(structuredClone(disk)),
    updateOperation: (value: Bag): Promise<void> => { assert.equal(value, journal); disk = structuredClone(value); return Promise.resolve(); },
    writePhaseArtifact: (_id: unknown, _sequence: unknown, phase: string, value: unknown): Promise<unknown> => {
      state.calls.push(phase); values.set(phase, value);
      if (failure === "intent-publication" && phase === "schematic-writer-n0-intent" || failure === "result-publication" && phase === "schematic-writer-n0-result") {
        return Promise.reject(new Error("synthetic-publication"));
      }
      return Promise.resolve({ path: `/synthetic/${phase}`, bytes: 1, sha256: "e".repeat(64) });
    }, assertCurrentSymbolCacheMark: (before: Bag, marked: Bag): void => {
      assert.equal(before["orphanedCallPossible"], false); assert.equal(marked["orphanedCallPossible"], true);
    }, assertCurrentSymbolCacheClear: (marked: Bag, cleared: Bag): void => {
      assert.equal(marked["orphanedCallPossible"], true); assert.equal(cleared["orphanedCallPossible"], false);
    }, buildCurrentSchematicRenameWriterClockProgram: (request: Bag): string => {
      assert.equal(request["target"], target); assert.equal(request["expectedActor"], actor); assert.equal(request["startup"], expectation); return "fixed-n0";
    }, decodeCurrentSchematicRenameWriterClockReply: (value: unknown): typeof documentBefore => {
      assert.equal(value, raw); if (failure === "decode") { throw new Error("synthetic-decode"); } return documentBefore;
    }, prepareCurrentSchematicRenameClock: (input: Bag): Promise<typeof clockPlan> => {
      assert.equal(input["engine"], engine); assert.equal(input["generation"], generation); assert.equal(input["startup"], startup);
      assert.equal(input["dispatchOwner"], owner); assert.equal(input["beforeClock"], beforeClock); assert.equal(input["armedClock"], armedClock);
      assert.equal(input["documentBefore"], documentBefore);
      return failure === "prepare" ? Promise.reject(new Error("synthetic-plan")) : Promise.resolve(clockPlan);
    }, assertOriginalCurrentSchematicRenameClock: (plan: unknown, selectedEngine: unknown, selectedGeneration: unknown, selectedStartup: unknown, selectedOwner: unknown): Bag => {
      assert.equal(plan, clockPlan); assert.equal(selectedEngine, engine); assert.equal(selectedGeneration, generation); assert.equal(selectedStartup, startup); assert.equal(selectedOwner, owner);
      return { writer: source, before: { token: beforeClock }, armed: { token: armedClock }, documentBefore };
    }, engine, owner, startup,
  });
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-writer-clock-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  runInContext(program, context);
  return { state, values, raw, mutateRaw: (): void => { raw.synthetic = "changed"; },
    run: async badStartup => {
      context["selectedStartup"] = badStartup === true ? structuredClone(startup) : startup;
      return bag(await runInContext("collectCurrentSchematicRenameWriterClock(engine,owner,selectedStartup)", context));
    }, evidence: (): Bag => bag(runInContext("currentSchematicRenameWriterClockEvidence(owner,engine)", context)),
    original: (token, copiedOwner = false): Bag => {
      context["token"] = token; context["selectedOwner"] = copiedOwner ? structuredClone(owner) : owner;
      return bag(runInContext("assertOriginalCurrentSchematicRenameWriterClock(token,engine,selectedOwner)", context));
    } };
}

void test("SCH N0 collector binds one retained raw dispatch and both original Windows clocks without granting a writer", async () => {
  const f = await fixture(); await assert.rejects(f.run(true), /synthetic-startup/u);
  const token = await f.run(); const original = f.original(token);
  assert.equal(original["raw"], f.raw); assert.equal(token["documentSampleProvenanceVerified"], true);
  assert.equal(token["originalDispatchRetained"], true); assert.equal(token["originalWindowsObservationsRetained"], true);
  for (const field of ["mutationDispatched", "explicitSaveDispatched", "backendActorVerified", "producerBindingVerified", "startupQualified", "writerReady", "executionAuthorized"]) {
    assert.equal(token[field], false);
  }
  assert.deepEqual(f.state.calls, ["schematic-writer-n0-intent", "mark", "clock-1", "call", "clock-2", "schematic-writer-n0-result"]);
  assert.equal(f.state.clears, 0);
  assert.equal(f.evidence()["observationIssued"], true); assert.equal(f.evidence()["failureObserved"], false);
  assert.throws(() => f.original(structuredClone(token)), /Original completed SCH/u); assert.throws(() => f.original(token, true), /Original completed SCH/u);
  await assert.rejects(f.run(), /already consumed/u); assert.equal(f.state.dispatches, 1);
  f.mutateRaw(); assert.throws(() => f.original(token), /collection refused/u);
});
void test("SCH N0 consumes dispatch failures and preserves raw replies through clock, owner, decoder, plan, publication and cleanup failures", async () => {
  for (const failure of ["intent-publication", "before-clock", "call", "after-clock", "owner-after-reply", "decode", "prepare",
    "result-publication", "mark-after-durable-clear", "journal-after-clock"] as const) {
    const f = await fixture(failure); await assert.rejects(f.run());
    const evidence = f.evidence(); const dispatched = !["intent-publication", "before-clock", "mark-after-durable-clear"].includes(failure), returned = dispatched && failure !== "call";
    assert.equal(evidence["failureObserved"], true, failure); assert.equal(evidence["observationIssued"], false, failure);
    assert.equal(evidence["rawRetained"], returned, failure); assert.equal(evidence["raw"], returned ? f.raw : null, failure);
    assert.equal(evidence["dispatchAttempted"], dispatched, failure);
    assert.equal(evidence["dispatchCaptureCleanupUncertain"], failure === "mark-after-durable-clear", failure);
    assert.equal(evidence["mutationDispatched"], false); assert.equal(evidence["executionAuthorized"], false);
    await assert.rejects(f.run()); assert.equal(f.state.dispatches, dispatched ? 1 : 0, failure);
    assert.equal(f.state.clears, 0, failure);
  }
});
