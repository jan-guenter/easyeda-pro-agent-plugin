/** Three actual coordinator/collector/clock module bodies, real completed SQL
 * readers and source-qualified Windows clock issuers over synthetic streams.
 * Generation ownership, renderer replies and snapshot publication are test
 * seams. This is not a connected rename or production ownership issuance.
 */
/* oxlint-disable import/max-dependencies -- Integrate the SCH lifecycle with real SQL and Windows clock issuers without adding injectable production callbacks. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { assertUpstreamReplySettled, canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS, buildCurrentSchematicRenameProgram, decodeCurrentSchematicRenameReply,
  decodeCurrentSchematicRenameStoppedReply, validateCurrentSchematicRenameResult } from "../src/current-schematic-rename-program.ts";
import { assertCurrentSchematicRenameSavedReadEligibility } from "../src/current-schematic-rename-saved-source.ts";
import { originalCurrentSchematicRenameSqlPreparation, prepareCurrentSchematicRenameSql } from "../src/current-schematic-rename-sql.ts";
import { completedCurrentSchematicRenameStoredSource, verifyCurrentSchematicRenameStoredEffect } from "../src/current-schematic-rename-stored-effect.ts";
import { buildCurrentSchematicRenameWriterClockProgram, decodeCurrentSchematicRenameWriterClockReply } from "../src/current-schematic-rename-writer-clock-program.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { validateActorProjection } from "../src/symbol-dual-actor.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentIssuedWindowsClockObservation,
  assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";
import { validateClockSample } from "../src/windows-clock-transport.ts";
import { ACTOR, REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { IDS, TIMES, applyEffect, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

type Bag = Record<string, unknown>;
type Mode = "normal" | "interposed-capture" | "scope-drift";
const BASE = Date.parse("2026-10-12T12:34:55.000Z"), EPOCH = 621_355_968_000_000_000n;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function noOp(): undefined { return undefined; }
function invoke(module: Bag, name: string, args: unknown[] = []): unknown {
  const method = module[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, module, args) as unknown;
}
async function moduleBody(file: string, names: string[], dependencies: Bag): Promise<Bag> {
  const text = stripTypeScriptTypes(await readFile(new URL(`../src/${file}.ts`, import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Reflect, Map, WeakMap, WeakSet, Number, BigInt, Math, Date, Promise, Error, AggregateError,
    structuredClone, types, canonicalJson, isRecord, sha256Json, sha256Text, ...dependencies });
  return bag(runInContext(`${text}\n({${names.join(",")}})`, context));
}
function sample(milliseconds: number): Bag {
  const qpc = 10_000_000_000_000_000n + BigInt(milliseconds - BASE) * 1000n, ticks = EPOCH + BigInt(milliseconds) * 10_000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10_000n),
    qpcBefore: String(qpc), qpcAfter: String(qpc + 1000n), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "f".repeat(64) };
}
function document(first: number, server: number, last: number): Bag {
  return { rendererBeforeMs: BASE + first, serverTimeMs: BASE + server, rendererAfterMs: BASE + last,
    rendererBeforeIso: new Date(BASE + first).toISOString(), rendererAfterIso: new Date(BASE + last).toISOString(),
    rendererTimezoneOffsetMinutes: -120, notifyTabId: "a".repeat(16) };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }

async function fixture(context: TestContext, mode: Mode): Promise<{
  run: () => Promise<unknown>; close: () => Promise<unknown>; finish: () => Promise<Bag>; inspect: () => Bag; continuation: () => unknown;
  state: { active: boolean; transferred: boolean; finishing: boolean; retired: boolean; calls: string[]; marks: number; clears: number; clocks: number };
  artifacts: Map<string, unknown>;
}> {
  const native = await qualifiedClockFixture(context), sql = await schematicBaseline();
  let time = BASE - 10_000;
  native.behavior.mutateResponse = (_request, response): void => {
    if (response["clock"] === undefined) { return; }
    response["clock"] = { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before: sample(time), after: sample(time + 2) };
    const base = bag(response["base"]);
    for (const key of ["capturedAt", "observedAt", "checkedAt"]) {
      if (key in base) { base[key] = new Date(time + 1).toISOString().replace(/Z$/u, "0000Z"); }
    }
  };
  const launch = await native.supervisor.launch({ confirmLaunch: true });
  const launchClock = await windowsClockObservationForResult(launch, "launch"); time = BASE - 5000;
  const authority = await native.supervisor.capture(INPUT), captureClock = await windowsClockObservationForResult(authority, "capture");
  const observe = native.supervisor.observeCurrentClock; assert.ok(observe !== undefined);
  const capture = { operationId: INPUT.operationId, phase: INPUT.orphanPhase, challengeAttempt: INPUT.challengeAttempt,
    bridgeSession: INPUT.bridgeSession, runtimeIdentity: INPUT.runtimeIdentity, executionAuthority: authority };
  const binding = { ...capture, launch };
  const children = await prepareCurrentSchematicChildRoster(sql.metadata, sql.before);
  const baseline = { copy: { receiptSha256: "0".repeat(64) }, inventory: sql.before, metadata: sql.metadata, children,
    intent: { target: TARGET, desiredTitle: REQUEST.desiredTitle } };
  const generation = Object.freeze({ operationId: INPUT.operationId }), owner = Object.freeze({ operationId: INPUT.operationId });
  const startup = Object.freeze({ synthetic: "original-startup" });
  const lease = Object.freeze({ synthetic: "original-lease" }); let currentLease: Readonly<{ synthetic: string }> = lease;
  const state = { active: false, transferred: false, finishing: false, retired: false, calls: [] as string[], marks: 0, clears: 0, clocks: 0 };
  const journal: Bag = { operationId: INPUT.operationId, plan: { profile: "baseline" }, artifacts: [], sequence: 0,
    state: "project-only-opened", hardStop: false, orphanedCallPossible: false };
  let disk = structuredClone(journal), preparation: Awaited<ReturnType<typeof prepareCurrentSchematicRenameSql>> | undefined;
  let after: Awaited<ReturnType<typeof inventory>> | undefined, markAuthority: typeof authority | undefined;
  const artifacts = new Map<string, unknown>();
  const runtime = {
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ outcome: "available", hwnd: "12345", jobId: launch.jobId, helperInstance: launch.helperInstance }),
    prepareClosedSessionClose: (): ReturnType<typeof native.supervisor.prepareClosedSessionClose> => native.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" }),
    requestClosedSessionNormalClose: (input: Parameters<typeof native.supervisor.requestClosedSessionNormalClose>[0]): ReturnType<typeof native.supervisor.requestClosedSessionNormalClose> =>
      native.supervisor.requestClosedSessionNormalClose({ ...input, launch }),
    probeClosedSessionTermination: async (input: Parameters<typeof native.supervisor.proveClosedSession>[0]): Promise<unknown> => {
      time = BASE + 180_000; return { status: "terminated", proof: await native.supervisor.proveClosedSession({ ...input, launch }) };
    }, releaseCapture: (value: typeof authority): Promise<void> => native.supervisor.releaseCapture(value),
  };
  const original = { source: { purpose: "disposable-validation", target: TARGET, runtime, expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/assets" } } },
    baseline, capture, launch, launchClock, captureClock };
  const source = { generation, original, journal, sqlRuntime: {},
    beginFinish(): void { assert.equal(state.finishing, false); state.finishing = true; },
    retire(): void { assert.equal(state.finishing, true); state.retired = true; } };
  const startupSource = { source: original, projection: sql.metadata, expectation: children.startupInput,
    observation: { runtimeObservation: { actor: ACTOR }, clientTicketObservation: { client: "a".repeat(16), maxTicket: 100 } } };
  const engine = {
    upstream: {
      currentAuthenticatedBridgeDispatchBinding: (): object | undefined => state.active ? currentLease : undefined,
      withAuthenticatedBridgeDispatchScope: async (task: (selected: object) => Promise<void>): Promise<void> => {
        assert.equal(state.active, false); state.active = true; try { await task(currentLease); } finally { state.active = false; }
      },
      bridgeSessionLifecycle: (): Bag => ({ activeSession: null }),
      assertClosedAuthenticatedBridgeDispatchReleased: (): Bag => ({ ...INPUT.bridgeSession, closedAtEpochMs: 2000 }),
      callTool: async (_name: unknown, args: Bag): Promise<unknown> => {
        assert.equal(state.active, true); const code = String(args["code"]);
        if (code.includes("private.current-schematic-rename-writer-document-clock.v1")) {
          state.calls.push("n0"); return reply({ profile: "private.current-schematic-rename-writer-document-clock.v1", target: TARGET, actor: ACTOR,
            requestSha256: sha256Json({ target: TARGET, expectedActor: ACTOR, startup: children.startupInput }), sample: document(10, 20, 30),
            mutationDispatched: false, explicitSaveDispatched: false });
        }
        assert.ok(code.includes("/PrjDB/schematic/updateData")); state.calls.push("rename"); assert.ok(preparation !== undefined);
        const raw = [
          [{ type: "EDIT_HEAD" }, { ...ACTOR, updateTime: TIMES.edit }],
          [{ type: "DOCHEAD", ticket: 101 }, { docType: "SCH", client: "a".repeat(16), uuid: TARGET.schematicUuid,
            updateTime: TIMES.document, version: String(TIMES.document), editVersion: "3.2.206" }],
          [{ type: "META", ticket: 101, id: "META" }, { title: REQUEST.desiredTitle, source: "", board: "", zIndex: null }],
        ].map(([identity, body]) => `${JSON.stringify(identity)}||${JSON.stringify(body)}`).join("|\n");
        applyEffect(sql.path, raw);
        mutate(sql.path, `UPDATE project_structures SET structure=json_set(structure,
          '$.schematics.${TARGET.schematicUuid}.name','${REQUEST.desiredTitle}',
          '$.schematics.${TARGET.schematicUuid}.version','${TIMES.document}',
          '$.schematics.${TARGET.schematicUuid}.updateTime',${TIMES.document}) WHERE branch_uuid='${IDS.branch}'`);
        after = await inventory(sql.path);
        const before = { uuid: TARGET.schematicUuid, ...REQUEST.expectedBefore };
        const changed = { ...before, name: REQUEST.desiredTitle.toLowerCase(), displayName: REQUEST.desiredTitle,
          version: String(TIMES.document), ticket: 101, updateTime: TIMES.document };
        return reply({ kind: "current-schematic-rename", target: TARGET, preparationSha256: preparation.preparationSha256, before, after: changed,
          acknowledged: changed, nativeReturnAcknowledged: true, actor: ACTOR, client: "a".repeat(16), beforeMaxTicket: 100, afterMaxTicket: 101,
          documentBefore: document(1000, 1005, 1010), documentAfter: document(2000, 2005, 2010), peerMetadataMatched: true, childMetadataMatched: true,
          peerCount: 2, mutationDispatched: true, permissionVerified: false, startupQualified: false, postRenameStartupQualified: false,
          peerDesignInvarianceVerified: false, backendActorVerified: false, backendClockVerified: false, workerIdentityVerified: false,
          producerBindingVerified: false, schematicSubscriberCompletionVerified: false, crossInvocationReceiverContinuityVerified: false,
          atomicCompareAndSwap: false, persistenceVerified: false, reopened: false, executionAuthorized: false, explicitSaveDispatched: false });
      },
    },
    assertBridgeDispatchAllowed: noOp, assertRecoveryOperationIsolated: noOp,
    freshClockObservationForClosedCapture: (value: unknown): Promise<unknown> => {
      assert.equal(value, capture); state.clocks += 1; const offset = [0, 100, 3000][state.clocks - 1]; assert.ok(offset !== undefined); time = BASE + offset;
      return observe(authority);
    },
    markOrphanedCallRisk: async (value: unknown, phase: string): Promise<unknown> => {
      assert.equal(value, journal); state.marks += 1; time = BASE - 1000;
      markAuthority = await native.supervisor.capture({ ...INPUT, bindingSha256: "9".repeat(64), orphanPhase: phase, challengeAttempt: 2 });
      Object.assign(journal, { orphanedCallPossible: true, orphanedCallPhase: phase, bridgeDispatchBeforeOrphan: lease,
        bridgeSessionBeforeOrphan: INPUT.bridgeSession, executionAuthorityBeforeOrphan: markAuthority }); disk = structuredClone(journal);
      return { binding: lease, ownedByAuthenticatedScope: true };
    },
    clearOrphanedCallRisk: async (): Promise<void> => {
      assert.ok(markAuthority !== undefined); state.clears += 1; journal["orphanedCallPossible"] = false; disk = structuredClone(journal);
      await native.supervisor.releaseCapture(markAuthority);
    },
    dispatchWithOrphanTracking: noOp,
    releaseClosedSessionAuthority: async (value: unknown): Promise<void> => { assert.equal(value, capture); await native.supervisor.releaseCapture(authority); },
  };
  const ownerAssert = (value: unknown, selectedEngine: unknown, scopeText?: string): typeof source => {
    assert.equal(value, owner); assert.equal(selectedEngine, engine); assert.equal(state.transferred, true); assert.equal(state.retired, false);
    // Exact contract in the actual SCH generation issuer: omitted scope text
    // Requires an ended scope; active operations must retain their exact lease.
    assert.equal(scopeText, state.active ? canonicalJson(currentLease) : undefined, "original SCH writer dispatch scope changed"); return source;
  };
  const startupAssert = (value: unknown, selectedEngine: unknown, selectedGeneration: unknown): typeof startupSource => {
    assert.equal(value, startup); assert.equal(selectedEngine, engine); assert.equal(selectedGeneration, generation);
    assert.equal(state.finishing, false); assert.equal(state.retired, false); return startupSource;
  };
  const common = { CURRENT_SCHEMATIC_OPERATION_PURPOSE: "ordinary-schematic-rename",
    assertExpectedFingerprint: noOp, validateSdkLocalRuntimeFingerprint: noOp, assertUpstreamReplySettled,
    verifyCurrentProjectOnlySymbolPreflightImplementation: noOp, verifyCurrentSymbolPersistenceImplementation: noOp,
    assertOriginalCurrentSchematicRenameStartup: startupAssert, revalidateCurrentSchematicRenameStartupObservation: startupAssert,
    assertCurrentSchematicRenameWriterOwner: ownerAssert, originalCurrentSchematicRenameSqlPreparation,
    assertCurrentSchematicRenameSavedReadEligibility,
    loadOperation: (): Promise<Bag> => Promise.resolve(structuredClone(disk)),
    updateOperation: (next: Bag): Promise<void> => { disk = structuredClone(next); return Promise.resolve(); },
    writePhaseArtifact: async (_id: unknown, _sequence: unknown, phase: string, value: unknown): Promise<unknown> => {
      artifacts.set(phase, value);
      if (phase === "schematic-rename-writer-dispatch-intent" && mode === "interposed-capture") {
        time = BASE + 200; await native.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), orphanPhase: "interposed" });
      }
      return { path: `/synthetic/${phase}.json`, bytes: 1, sha256: "0".repeat(64) };
    },
    assertCurrentSymbolCacheMark: (_before: unknown, selected: unknown, input: Bag): void => {
      assert.equal(selected, journal); assert.equal(journal["orphanedCallPossible"], true); assert.equal(journal["orphanedCallPhase"], input["phase"]);
    },
    assertCurrentSymbolCacheClear: (_before: unknown, selected: unknown): void => { assert.equal(selected, journal); assert.equal(journal["orphanedCallPossible"], false); },
  };
  const clock = await moduleBody("current-schematic-rename-clock", ["prepareCurrentSchematicRenameClock", "assertOriginalCurrentSchematicRenameClock",
    "recordCurrentSchematicRenameClockPost", "verifyCurrentSchematicRenameClockEffect", "completedCurrentSchematicRenameClockSource"], {
    ...common, validateActorProjection, validateClockSample, assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation,
    windowsClockObservationForResult, completedCurrentSchematicRenameStoredSource, verifyCurrentSchematicRenameStoredEffect,
    prepareCurrentSchematicRenameSql: async (input: Parameters<typeof prepareCurrentSchematicRenameSql>[0]): ReturnType<typeof prepareCurrentSchematicRenameSql> => {
      const result = await prepareCurrentSchematicRenameSql({ ...input, witness: structuredClone(input.witness) }); preparation = result;
      if (mode === "scope-drift") { currentLease = Object.freeze({ synthetic: "foreign-lease" }); } return result;
    },
    validateCurrentSchematicRenameResult: (raw: unknown, prepared: Parameters<typeof validateCurrentSchematicRenameResult>[1],
      before: Parameters<typeof validateCurrentSchematicRenameResult>[2], metadata: Parameters<typeof validateCurrentSchematicRenameResult>[3],
      roster: Parameters<typeof validateCurrentSchematicRenameResult>[4], input: unknown) =>
      validateCurrentSchematicRenameResult(raw, prepared, before, metadata, roster, structuredClone(input)),
  });
  const collector = await moduleBody("current-schematic-rename-writer-clock-runtime", ["CURRENT_SCHEMATIC_RENAME_WRITER_DISPATCH_PHASE",
    "collectCurrentSchematicRenameWriterClock", "assertOriginalCurrentSchematicRenameWriterClock", "currentSchematicRenameWriterClockEvidence",
    "retainedCurrentSchematicRenameWriterClockJournal"], { ...common, ...clock,
    prepareCurrentSchematicRenameClock: (input: Bag) => invoke(clock, "prepareCurrentSchematicRenameClock", [{ ...input, documentBefore: structuredClone(input["documentBefore"]) }]),
    buildCurrentSchematicRenameWriterClockProgram: (input: unknown) => buildCurrentSchematicRenameWriterClockProgram(structuredClone(input)),
    decodeCurrentSchematicRenameWriterClockReply: (raw: unknown, input: unknown) => decodeCurrentSchematicRenameWriterClockReply(raw, structuredClone(input)),
  });
  const snapshot = Object.freeze({ synthetic: "closed-edit-snapshot" });
  const writer = await moduleBody("current-schematic-rename-writer-runtime", ["CurrentSchematicRenameWriterCoordinator"], {
    ...common, ...collector, ...clock, CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS, buildPlanHash: sha256Json,
    assertCurrentProjectOnlySchematicRenameGeneration: (value: unknown): typeof original => { assert.equal(value, generation); assert.equal(state.transferred, false); return original; },
    revalidateCurrentProjectOnlySchematicRenameGeneration: noOp,
    transferCurrentProjectOnlySchematicRenameGeneration: (value: unknown): typeof owner => { assert.equal(value, generation); assert.equal(state.transferred, false); state.transferred = true; return owner; },
    retainedCurrentSchematicRenameWriterOwner: (): typeof owner | undefined => state.transferred ? owner : undefined,
    buildCurrentSchematicRenameProgram: (prepared: Parameters<typeof buildCurrentSchematicRenameProgram>[0], before: Parameters<typeof buildCurrentSchematicRenameProgram>[1],
      metadata: Parameters<typeof buildCurrentSchematicRenameProgram>[2], roster: Parameters<typeof buildCurrentSchematicRenameProgram>[3], input: unknown) =>
      buildCurrentSchematicRenameProgram(prepared, before, metadata, roster, structuredClone(input)),
    decodeCurrentSchematicRenameReply: (raw: unknown, prepared: Parameters<typeof decodeCurrentSchematicRenameReply>[1], before: Parameters<typeof decodeCurrentSchematicRenameReply>[2],
      metadata: Parameters<typeof decodeCurrentSchematicRenameReply>[3], roster: Parameters<typeof decodeCurrentSchematicRenameReply>[4], input: unknown) =>
      decodeCurrentSchematicRenameReply(raw, prepared, before, metadata, roster, structuredClone(input)),
    decodeCurrentSchematicRenameStoppedReply, assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority,
    assertCurrentClosedSessionTerminationObservation: noOp,
    recordCurrentSchematicRenameClockPost: (plan: unknown, input: Bag) => invoke(clock, "recordCurrentSchematicRenameClockPost", [plan, { ...input }]),
    verifyCurrentSchematicRenameClockEffect: (plan: unknown, input: Bag) => invoke(clock, "verifyCurrentSchematicRenameClockEffect", [plan, { ...input }]),
    captureCurrentSchematicRenameFinishSnapshot: (_engine: unknown, _input: unknown, retain: (event: unknown) => void): unknown => {
      assert.ok(after !== undefined); retain({ kind: "inventory", value: after }); return snapshot;
    },
    assertOriginalCurrentSchematicRenameSnapshot: (value: unknown): Bag => { assert.equal(value, snapshot); return { inventory: after }; },
    revalidateCurrentSchematicRenameSnapshot: noOp,
    assertOriginalCurrentSchematicRenameBaseline: (value: unknown): void => { assert.equal(value, baseline); },
  });
  const constructor = writer["CurrentSchematicRenameWriterCoordinator"]; assert.ok(typeof constructor === "function");
  const instance = bag(Reflect.construct(constructor, [engine]));
  return { state, artifacts, run: async () => await invoke(instance, "execute", [generation, startup]),
    close: async () => await invoke(instance, "finishNormalClose", [INPUT.operationId]),
    finish: async () => bag(await invoke(instance, "observeFinish", [INPUT.operationId])), inspect: () => bag(invoke(instance, "inspect", [INPUT.operationId])),
    continuation: () => invoke(instance, "getVerificationContinuation", [INPUT.operationId]) };
}

void test("SCH integrated writer retains one capture through real N0/post clocks and exact closed SQL", async context => {
  const f = await fixture(context, "normal"); await f.run();
  assert.deepEqual(f.state.calls, ["n0", "rename"]); assert.equal(f.state.marks, 1); assert.equal(f.state.clears, 1); assert.equal(f.state.clocks, 3);
  assert.equal(f.inspect()["postRecorded"], true); await f.close(); const finished = await f.finish();
  assert.equal(finished["retired"], true); assert.equal(finished["verificationContinuationRetained"], true); assert.ok(f.continuation() !== undefined);
  assert.equal(finished["reopened"], false); assert.equal(finished["executionAuthorized"], false); await assert.rejects(f.run(), /consumed/u);
});
void test("SCH integrated writer refuses interposed capture epochs and active-scope drift without replay", async context => {
  for (const mode of ["interposed-capture", "scope-drift"] as const) {
    const f = await fixture(context, mode); await assert.rejects(f.run());
    assert.equal(f.state.marks, 1); assert.equal(f.state.clears, 0); assert.equal(f.inspect()["postRecorded"], false);
    assert.deepEqual(f.state.calls, ["n0"]);
    assert.throws(f.continuation); await assert.rejects(f.run(), /consumed/u);
    assert.ok(f.artifacts.has("schematic-writer-n0-intent"));
  }
});
