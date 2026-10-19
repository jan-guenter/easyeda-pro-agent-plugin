/** Maintained coordinator in a private realm with synthetic I/O/issuer seams.
 * Separate owner-baseline tests exercise real storage and termination leaves.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json } from "../src/core.ts";

type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(): Promise<{
  capture: () => Promise<Bag>; close: (confirmation?: unknown) => Promise<Bag>; observe: () => Promise<Bag>;
  baseline: () => Promise<unknown>; inspect: () => Bag; owner: () => unknown;
  cleanupClose: () => Promise<Bag>; cleanupObserve: () => Promise<Bag>; continuation: () => Promise<unknown>; claim: (value: unknown) => Promise<unknown>;
  captureCleanup: () => Promise<Bag>; requestCleanup: () => Promise<Bag>; retire: () => Promise<Bag>;
  state: { scopeFailure: boolean; captureDrift: boolean; current: boolean; pending: boolean; copyFailure: boolean;
    transferCompleted: boolean; releaseJournalDrift: boolean;
    failingArtifact: string; calls: string[]; evidence: Map<string, unknown>; disk: Bag | undefined };
}> {
  const id = "synthetic-schematic-baseline-runtime", owner = Object.freeze({ profile: "private.current-schematic-rename-opening-owner.v1", operationId: id, openingOperationId: "synthetic-opening" });
  const launch = { jobId: "a".repeat(32), helperInstance: "b".repeat(32), root: { pid: 1, role: "easyeda-main", startIdentity: `win32:12345678901234567:job:${"a".repeat(32)}` } };
  const session = { gatewayInstanceId: "synthetic-gateway", sessionId: "synthetic-session", sequence: 1 };
  const capture = { operationId: id, phase: "closed-baseline", challengeAttempt: 1, bridgeSession: session, runtimeIdentity: {}, executionAuthority: { processes: [launch.root] } };
  const closeIntent = Object.freeze({ synthetic: "close-intent" }), proof = Object.freeze({ proofSha256: "c".repeat(64) }), receipt = Object.freeze({ synthetic: "close-acknowledged" });
  let scoped = false;
  const state = { scopeFailure: false, captureDrift: false, current: true, pending: false, copyFailure: false, transferCompleted: true, releaseJournalDrift: false, failingArtifact: "",
    calls: [] as string[], evidence: new Map<string, unknown>(), disk: undefined as Bag | undefined };
  const runtime = {
    status: (): unknown => ({ state: "owned", launch }),
    observeApplicationWindow: (): Promise<unknown> => { state.calls.push("window"); return Promise.resolve({ outcome: "available", hwnd: "1234" }); },
    prepareClosedSessionClose: (): Promise<unknown> => { state.calls.push("prepare-close"); return Promise.resolve(closeIntent); },
    requestClosedSessionNormalClose: (input: unknown): Promise<unknown> => {
      const value = bag(input); assert.equal(value["intent"], closeIntent); assert.equal(value["confirmNormalClose"], true);
      assert.equal(state.disk?.["closeAttempted"], true); state.calls.push("close"); return Promise.resolve(receipt);
    },
    probeClosedSessionTermination: (input: unknown): Promise<unknown> => {
      assert.equal(bag(input)["closeReceipt"], receipt); state.calls.push("termination");
      return Promise.resolve(state.pending ? { status: "pending" } : { status: "terminated", proof });
    },
  };
  const engine = {
    executionAuthorityValidator: {},
    captureClosedSessionAuthority: (operationId: string, phase: string, attempt: number): Promise<unknown> => {
      assert.equal(operationId, id); assert.equal(phase, "closed-baseline"); assert.equal(attempt, 1); assert.equal(scoped, true);
      state.calls.push("capture"); if (state.captureDrift) { state.current = false; } return Promise.resolve(capture);
    },
    clockObservationForClosedCapture: (): never => { throw new Error("Unexpected synthetic clock"); },
    releaseClosedSessionAuthority: (value: unknown): Promise<void> => {
      assert.equal(value, capture); state.calls.push("release");
      if (state.releaseJournalDrift) { assert.ok(state.disk); state.disk["foreign"] = true; }
      return Promise.resolve();
    },
    assertBridgeAndRecoveryAdmission: (): Promise<void> => Promise.resolve(),
    upstream: { currentAuthenticatedBridgeDispatchBinding: (): unknown => scoped ? {
      gatewayInstanceId: session.gatewayInstanceId, sessionId: session.sessionId, sessionSequence: session.sequence,
    } : undefined,
    withAuthenticatedBridgeDispatchScope: async (task: () => Promise<unknown>): Promise<unknown> => {
      scoped = true;
      try { const result = await task(); if (state.scopeFailure) { throw new Error("Synthetic scope exit failed"); } return result; }
      finally { scoped = false; }
    } },
  };
  const original = { source: { runtime, launchProjection: launch, bridgeSession: session, expectedFingerprint: {}, target: { schematicUuid: "d".repeat(16) } },
    intent: { target: { schematicUuid: "d".repeat(16) }, desiredTitle: "Renamed SCH" } };
  const baseline = Object.freeze({ intent: original.intent, checkpoint: {}, copy: {}, history: { semanticSha256: "e".repeat(64) },
    inventory: { checkpointSha256: "f".repeat(64), schemaSha256: "1".repeat(64), logicalSha256: "2".repeat(64) },
    metadata: { projectionSha256: "5".repeat(64) }, children: { projectionSha256: "6".repeat(64) },
    targetMetadata: { title: "Original SCH" }, targetHeader: {}, maximumTicket: 4, rawHistorySha256: "3".repeat(64) });
  const assertOwner = (value: unknown, candidate: unknown): typeof original => {
    assert.equal(value, owner); assert.equal(candidate, engine); assert.equal(state.current, true, "Synthetic owner lost"); return original;
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-baseline-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Promise, Date, structuredClone, OPERATION_SCHEMA, buildPlanHash, canonicalJson, sha256Json,
    CURRENT_SCHEMATIC_OPERATION_PURPOSE: "ordinary-schematic-rename",
    createOperation: (journal: Bag): Promise<void> => { assert.equal(state.disk, undefined); state.disk = structuredClone(journal); return Promise.resolve(); },
    loadOperation: (operationId: string): Promise<Bag> => { assert.equal(operationId, id); assert.ok(state.disk); return Promise.resolve(structuredClone(state.disk)); },
    operationPath: (operationId: string): string => `/synthetic/${operationId}.json`,
    updateOperation: (journal: Bag): Promise<void> => { state.disk = structuredClone(journal); return Promise.resolve(); },
    writePhaseArtifact: (operationId: string, sequence: number, phase: string, value: unknown): Promise<Bag> => {
      assert.equal(operationId, id); state.calls.push(`artifact:${phase}`);
      if (state.failingArtifact === phase) { throw new Error("Synthetic artifact publication failed"); }
      state.evidence.set(phase, structuredClone(value)); return Promise.resolve({ path: `/synthetic/${sequence}-${phase}`, bytes: 1, sha256: "4".repeat(64) });
    },
    assertCompletedCurrentSchematicRenameOpeningTransfer: (value: unknown, candidate: unknown): typeof original => {
      assert.equal(state.transferCompleted, true, "Synthetic opening transfer did not complete"); return assertOwner(value, candidate);
    }, assertCurrentSchematicRenameOpeningOwner: assertOwner,
    revalidateCurrentSchematicRenameOpeningOwner: (value: unknown, candidate: unknown): Promise<typeof original> => Promise.resolve(assertOwner(value, candidate)),
    assertWindowsRuntimeValidator: (value: unknown, candidate: unknown): void => { assert.equal(value, engine.executionAuthorityValidator); assert.equal(candidate, runtime); },
    assertCurrentClosedSessionTerminationObservation: (value: unknown): void => {
      const status = String(bag(value)["status"]); assert.ok(["pending", "terminated"].includes(status));
    },
    assertCurrentClosedSessionCopyAuthority: (value: unknown): void => { assert.equal(value, proof); },
    assertClosedSessionCopyAuthority: (value: unknown): Promise<unknown> => { assert.equal(value, proof); return Promise.resolve(value); },
    captureCurrentSchematicRenameBaseline: (candidate: unknown, input: unknown, retain: (event: Bag) => void): Promise<typeof baseline> => {
      assert.equal(candidate, engine); assert.equal(bag(input)["owner"], owner); assert.equal(bag(input)["capture"], capture);
      assert.equal(bag(input)["proof"], proof); assert.equal(state.disk?.["copyAttempted"], true); state.calls.push("baseline");
      retain({ kind: "checkpoint", value: { synthetic: "partial-checkpoint" } });
      if (state.copyFailure) { throw new Error("Synthetic raw SQL failed"); }
      retain({ kind: "copy", value: {} }); retain({ kind: "inventory", value: baseline.inventory }); return Promise.resolve(baseline);
    },
    assertOriginalCurrentSchematicRenameBaseline: (value: unknown, candidate: unknown): typeof baseline => {
      assert.equal(candidate, engine); assert.equal(value, baseline); return baseline;
    },
    revalidateCurrentSchematicRenameBaseline: (value: unknown, candidate: unknown): Promise<void> => {
      assert.equal(candidate, engine); assert.equal(value, baseline); return Promise.resolve();
    }, testEngine: engine, testRuntime: runtime, testOwner: owner,
  });
  const api = bag(runInContext(`${program}\nconst stage=new CurrentSchematicRenameBaselineCoordinator(testEngine,testRuntime,{});
({capture:()=>stage.capture(testOwner),close:value=>stage.close('${id}',value),observe:()=>stage.observeTermination('${id}'),
baseline:()=>stage.closedBaseline('${id}'),inspect:()=>stage.inspect('${id}'),owner:()=>stage.originalOpeningOwner('${id}'),
cleanupClose:()=>stage.cleanupClose('${id}',true),cleanupObserve:()=>stage.cleanupObserveTermination('${id}'),
captureCleanup:()=>stage.captureForCleanup(testOwner),requestCleanup:()=>stage.requestCleanup('${id}'),retire:()=>stage.retireClosedBaseline('${id}'),
continuation:()=>stage.closedContinuation('${id}'),claim:value=>claimCurrentSchematicRenameClosedContinuation(value,testEngine,testRuntime)});`, context));
  const invoke = (name: string, args: unknown[] = []): unknown => { const value = api[name]; assert.ok(typeof value === "function"); return Reflect.apply(value, undefined, args) as unknown; };
  return { capture: async (): Promise<Bag> => bag(await invoke("capture")), close: async (confirmation = true): Promise<Bag> => bag(await invoke("close", [confirmation])),
    observe: async (): Promise<Bag> => bag(await invoke("observe")), baseline: async (): Promise<unknown> => await invoke("baseline"),
    inspect: (): Bag => bag(invoke("inspect")), owner: (): unknown => invoke("owner"),
    cleanupClose: async (): Promise<Bag> => bag(await invoke("cleanupClose")), cleanupObserve: async (): Promise<Bag> => bag(await invoke("cleanupObserve")),
    captureCleanup: async (): Promise<Bag> => bag(await invoke("captureCleanup")), requestCleanup: async (): Promise<Bag> => bag(await invoke("requestCleanup")),
    retire: async (): Promise<Bag> => bag(await invoke("retire")),
    continuation: async (): Promise<unknown> => await invoke("continuation"), claim: async (value: unknown): Promise<unknown> => await invoke("claim", [value]), state };
}

void test("SCH coordinator captures, closes once, polls only pending termination and retains original full baseline", async () => {
  const value = await fixture(); const captured = await value.capture(); assert.equal(captured["state"], "captured");
  const closed = await value.close(); assert.equal(closed["state"], "awaiting-termination"); value.state.pending = true;
  const pending = await value.observe(); assert.equal(pending["termination"], "pending"); assert.equal(value.state.calls.includes("baseline"), false);
  value.state.pending = false; const result = await value.observe();
  assert.equal(result["baselineCaptured"], true); assert.equal(result["executionAuthorized"], false);
  assert.equal(value.state.calls.filter(call => call === "close").length, 1); assert.equal(value.state.calls.filter(call => call === "baseline").length, 1);
  assert.equal(value.owner(), value.owner()); assert.equal(await value.baseline(), await value.baseline());
  await assert.rejects(value.capture()); await assert.rejects(value.close()); await assert.rejects(value.observe());
});

void test("SCH coordinator retains acquired capture across owner loss or failed authenticated scope exit", async () => {
  for (const key of ["captureDrift", "scopeFailure"] as const) {
    const value = await fixture(); value.state[key] = true; await assert.rejects(value.capture());
    const result = value.inspect(); assert.equal(result["captureRetained"], true); assert.equal(result["state"], "stopped");
    assert.equal(value.state.calls.includes("close"), false); await assert.rejects(value.capture()); await assert.rejects(value.close());
  }
});

void test("SCH failed opening transfer admits original capture only for cleanup, never baseline progression", async () => {
  const value = await fixture(); value.state.transferCompleted = false; await assert.rejects(value.capture(), /did not complete/u);
  const result = await value.captureCleanup(); assert.equal(result["cleanupOnly"], true); await assert.rejects(value.close());
  await value.cleanupClose(); await assert.rejects(value.observe()); const retired = await value.cleanupObserve();
  assert.equal(retired["retired"], true); assert.equal(retired["baselineCaptured"], false);
  assert.equal(value.state.calls.includes("baseline"), false); assert.equal(value.state.calls.filter(call => call === "capture").length, 1);
  await assert.rejects(value.captureCleanup()); await assert.rejects(value.continuation());
});

void test("SCH caller-selected cleanup preserves captured and acknowledged close stages without replay", async () => {
  for (const closeFirst of [false, true]) {
    const value = await fixture(); await value.capture(); if (closeFirst) { await value.close(); }
    await value.requestCleanup(); await assert.rejects(value.close()); await assert.rejects(value.observe());
    if (!closeFirst) { await value.cleanupClose(); }
    const result = await value.cleanupObserve(); assert.equal(result["retired"], true);
    assert.equal(value.state.calls.filter(call => call === "close").length, 1); assert.equal(value.state.calls.includes("baseline"), false);
  }
});

void test("SCH completed closed baseline can be abandoned without another close, probe or SQL read", async () => {
  const value = await fixture(); await value.capture(); await value.close(); await value.observe();
  const continuation = await value.continuation(); await value.requestCleanup(); await assert.rejects(value.baseline());
  const result = await value.retire(); assert.equal(result["retired"], true); assert.equal(result["ownershipTransferred"], false);
  for (const call of ["close", "termination", "baseline", "release"]) { assert.equal(value.state.calls.filter(item => item === call).length, 1); }
  const retiredJournal = canonicalJson(value.state.disk);
  await assert.rejects(value.claim(continuation)); await assert.rejects(value.retire());
  assert.equal(canonicalJson(value.state.disk), retiredJournal); assert.equal(value.inspect()["state"], "plan-invalidated");
});

void test("SCH closed-baseline abandonment preserves release-await journal drift", async () => {
  const value = await fixture(); await value.capture(); await value.close(); await value.observe(); await value.requestCleanup();
  value.state.releaseJournalDrift = true; await assert.rejects(value.retire(), /journal changed/u);
  assert.equal(value.state.disk?.["foreign"], true); assert.equal(value.inspect()["retired"], false);
  assert.equal(value.inspect()["closedBaselineRetirementAvailable"], false); assert.equal(value.inspect()["finishObservationAvailable"], false);
  await assert.rejects(value.retire()); assert.equal(value.state.calls.filter(call => call === "release").length, 1);
});

void test("SCH coordinator close acknowledgement survives publication failure without authorizing another close", async () => {
  const value = await fixture(); await value.capture(); value.state.failingArtifact = "close-result";
  await assert.rejects(value.close(), /publication failed/u);
  assert.equal(value.inspect()["closeAcknowledged"], true); assert.equal(value.inspect()["state"], "stopped");
  await assert.rejects(value.close()); assert.equal(value.state.calls.filter(call => call === "close").length, 1);
});

void test("SCH coordinator retains partial checkpoint evidence and termination proof when SQL capture fails", async () => {
  const value = await fixture(); await value.capture(); await value.close(); value.state.copyFailure = true;
  await assert.rejects(value.observe(), /SQL failed/u); const result = value.inspect();
  assert.equal(result["terminationProved"], true); assert.equal(result["baselineAttempted"], true); assert.equal(result["baselineCaptured"], false);
  assert.deepEqual(structuredClone(result["partialEvidence"]), ["checkpoint"]);
  assert.deepEqual(bag(value.state.evidence.get("stopped"))["retainedEvidence"], { checkpoint: { synthetic: "partial-checkpoint" } });
  await assert.rejects(value.observe()); await assert.rejects(value.baseline());
});

void test("SCH coordinator refuses wrong close confirmation without consuming the valid close", async () => {
  const value = await fixture(); await value.capture(); await assert.rejects(value.close("true"));
  assert.equal(value.inspect()["closeAttempted"], false); await value.close(); assert.equal(value.state.calls.filter(call => call === "close").length, 1);
});

void test("SCH coordinator preserves an externally changed journal and refuses close before native window work", async () => {
  const value = await fixture(); await value.capture(); assert.ok(value.state.disk); value.state.disk["nextSafeAction"] = "External evidence";
  const changed = canonicalJson(value.state.disk); await assert.rejects(value.close(), /journal changed/u);
  assert.equal(canonicalJson(value.state.disk), changed); assert.equal(value.inspect()["closeAttempted"], true);
  assert.equal(value.state.calls.includes("window"), false); assert.equal(value.state.calls.includes("close"), false);
});

void test("SCH failed capture scope exit permits original cleanup only, with no baseline promotion", async () => {
  const value = await fixture(); value.state.scopeFailure = true; await assert.rejects(value.capture());
  await value.cleanupClose(); const retired = await value.cleanupObserve();
  assert.equal(retired["retired"], true); assert.equal(retired["baselineCaptured"], false);
  assert.equal(value.state.calls.filter(call => call === "release").length, 1); assert.equal(value.state.calls.includes("baseline"), false);
  await assert.rejects(value.baseline()); await assert.rejects(value.continuation()); await assert.rejects(value.cleanupClose());
});

void test("SCH failed close-result publication retains the original receipt for cleanup without another close", async () => {
  const value = await fixture(); await value.capture(); value.state.failingArtifact = "close-result"; await assert.rejects(value.close());
  value.state.failingArtifact = ""; const retired = await value.cleanupObserve(); assert.equal(retired["retired"], true);
  assert.equal(value.state.calls.filter(call => call === "close").length, 1); assert.equal(value.state.calls.includes("baseline"), false);
});

void test("SCH failed SQL capture cleanup reuses its exact original termination rather than probing again", async () => {
  const value = await fixture(); await value.capture(); await value.close(); value.state.copyFailure = true; await assert.rejects(value.observe());
  assert.equal(bag(await value.cleanupObserve())["retired"], true);
  assert.equal(value.state.calls.filter(call => call === "termination").length, 1); assert.equal(value.state.calls.filter(call => call === "baseline").length, 1);
});

void test("SCH closed continuation is original, one-use and atomically transfers the initial owner", async () => {
  const value = await fixture(); await value.capture(); await value.close(); await value.observe();
  const token = await value.continuation(); assert.equal(await value.continuation(), token);
  await assert.rejects(value.claim(structuredClone(token)), /unavailable/u);
  const attempts = await Promise.allSettled([value.claim(token), value.claim(token)]);
  assert.equal(attempts.filter(attempt => attempt.status === "fulfilled").length, 1);
  assert.equal(value.inspect()["ownershipTransferred"], true); await assert.rejects(value.baseline()); await assert.rejects(value.claim(token));
});

