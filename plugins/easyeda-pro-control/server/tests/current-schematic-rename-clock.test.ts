/** Synthetic Windows child streams and real completed SQL readers. Only the
 * SCH startup/transfer issuer is replaced in a VM; no live owner is created. */
/* oxlint-disable import/max-dependencies -- Exercise real SQL preparation and source-qualified Windows tokens while isolating the SCH owner issuer. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { types } from "node:util";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { prepareCurrentSchematicNativeMetadata } from "../src/current-schematic-native-metadata.ts";
import { prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { validateCurrentSchematicRenameResult } from "../src/current-schematic-rename-program.ts";
import { originalCurrentSchematicRenameSqlPreparation, prepareCurrentSchematicRenameSql } from "../src/current-schematic-rename-sql.ts";
import { completedCurrentSchematicRenameStoredSource, verifyCurrentSchematicRenameStoredEffect } from "../src/current-schematic-rename-stored-effect.ts";
import { validateActorProjection } from "../src/symbol-dual-actor.ts";
import { assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";
import { validateClockSample } from "../src/windows-clock-transport.ts";
import { ACTOR, REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { HISTORY_TABLE, IDS, TIMES, applyEffect, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const BASE = Date.parse("2026-10-12T12:34:55.000Z"), EPOCH = 621_355_968_000_000_000n;
type Bag = Record<string, unknown>;
type Inventory = Awaited<ReturnType<typeof inventory>>;
interface Harness {
  run: (overrides?: Bag) => Promise<Bag>; original: (plan: unknown, owner?: unknown, startup?: unknown) => Bag; invalidate: () => void;
  post: (plan: unknown, result: unknown, afterClock: unknown, overrides?: Bag) => Promise<void>;
  verify: (plan: unknown, proof: unknown, after: Inventory, overrides?: Bag) => Promise<Bag>;
  completed: (plan: unknown, after: Inventory, owner?: unknown) => Bag;
  persist: (plan: unknown, backendTime?: number, backendActor?: Readonly<{ uuid: string; username: string; nickname: string }>) => Promise<Inventory>;
}
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function sample(milliseconds: number): Bag {
  const qpc = 10_000_000_000_000_000n + BigInt(milliseconds - BASE) * 1000n, ticks = EPOCH + BigInt(milliseconds) * 10_000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10_000n),
    qpcBefore: String(qpc), qpcAfter: String(qpc + 1000n), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "f".repeat(64) };
}
function document(first = 10, server = 20, last = 30): Bag {
  return { rendererBeforeMs: BASE + first, serverTimeMs: BASE + server, rendererAfterMs: BASE + last,
    rendererBeforeIso: new Date(BASE + first).toISOString(), rendererAfterIso: new Date(BASE + last).toISOString(),
    rendererTimezoneOffsetMinutes: -120, notifyTabId: "a".repeat(16) };
}
async function setup(context: TestContext, sql?: string): Promise<{
  input: Bag; source: object; make: (options?: Bag) => Harness;
  nextClock: () => Promise<unknown>; terminate: (offsetMs?: number) => Promise<unknown>; interposeCapture: () => Promise<void>;
}> {
  const baseline = await schematicBaseline(), native = await qualifiedClockFixture(context); let time = BASE - 10_000;
  let closed = false;
  if (sql !== undefined) { mutate(baseline.path, sql); }
  const before = sql === undefined ? baseline.before : await inventory(baseline.path);
  const projection = sql === undefined ? baseline.metadata : await prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: REQUEST.desiredTitle });
  native.behavior.mutateResponse = (_request, response): void => {
    if (response["clock"] !== undefined) {
      response["clock"] = { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before: sample(time), after: sample(time + 2) };
      const base = bag(response["base"]);
      for (const key of ["capturedAt", "observedAt", "checkedAt"]) {
        if (key in base) { base[key] = new Date(time + 1).toISOString().replace(/Z$/u, "0000Z"); }
      }
    }
  };
  const launch = await native.supervisor.launch({ confirmLaunch: true }), launchClock = await windowsClockObservationForResult(launch, "launch");
  time = BASE - 5000;
  const authority = await native.supervisor.capture(INPUT), captureClock = await windowsClockObservationForResult(authority, "capture");
  const observe = native.supervisor.observeCurrentClock; assert.ok(observe !== undefined);
  time = BASE; const beforeClock = await observe(authority); time = BASE + 100; const armedClock = await observe(authority);
  const engine = Object.freeze({ synthetic: "original-engine", upstream: { currentAuthenticatedBridgeDispatchBinding: () => ({ synthetic: "original-scope" }) } });
  const generation = Object.freeze({ operationId: INPUT.operationId });
  const owner = Object.freeze({ synthetic: "issued-sch-writer-owner" }), startup = Object.freeze({ synthetic: "original-startup" });
  const children = await prepareCurrentSchematicChildRoster(projection, before);
  const source = Object.freeze({ source: { launchClock, captureClock, baseline: { inventory: before, children, intent: { target: TARGET, desiredTitle: REQUEST.desiredTitle } } },
    projection, observation: { runtimeObservation: { actor: ACTOR }, clientTicketObservation: { client: "a".repeat(16), maxTicket: 100 } } });
  const input = { engine, generation, startup, dispatchOwner: owner, beforeClock, armedClock, documentBefore: document() };
  const text = await readFile(new URL("../src/current-schematic-rename-clock.ts", import.meta.url), "utf8");
  const start = text.indexOf("const COLLECTION_MS ="); assert.ok(start > 0);
  const program = stripTypeScriptTypes(text.slice(start)).replaceAll("export function", "function").replaceAll("export async function", "async function");
  return { input, source, nextClock() { time = BASE + 3000; return observe(authority); }, async terminate(offsetMs = 180_000) {
    time = BASE + offsetMs;
    const binding = { operationId: INPUT.operationId, phase: INPUT.orphanPhase, challengeAttempt: INPUT.challengeAttempt,
      bridgeSession: INPUT.bridgeSession, runtimeIdentity: INPUT.runtimeIdentity, launch, executionAuthority: authority };
    const intent = await native.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
    const closeReceipt = await native.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
    const proof = await native.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }); closed = true; return proof;
  }, async interposeCapture() {
    time = BASE + 200; await native.supervisor.capture({ ...INPUT, bindingSha256: "9".repeat(64), orphanPhase: "synthetic-other" });
  }, make(options = {}) {
    let clockChecks = 0, current = true;
    const writer = { generation, original: source.source };
    const selectedSource = options["source"] ?? source;
    const sandbox = createContext({ types, Object, WeakMap, WeakSet, Promise, Error, Date, Number, BigInt, Math, canonicalJson, isRecord, sha256Json,
      prepareCurrentSchematicRenameSql: async (value: Parameters<typeof prepareCurrentSchematicRenameSql>[0]): ReturnType<typeof prepareCurrentSchematicRenameSql> => {
        const result = await prepareCurrentSchematicRenameSql({ ...value, witness: { ...value.witness } });
        if (options["invalidateDuringSql"] === true) { current = false; } return result;
      }, originalCurrentSchematicRenameSqlPreparation, validateActorProjection,
      verifyCurrentSchematicRenameStoredEffect, completedCurrentSchematicRenameStoredSource,
      validateCurrentSchematicRenameResult: (value: unknown, preparation: Parameters<typeof validateCurrentSchematicRenameResult>[1],
        selectedBefore: Parameters<typeof validateCurrentSchematicRenameResult>[2], metadata: Parameters<typeof validateCurrentSchematicRenameResult>[3],
        roster: Parameters<typeof validateCurrentSchematicRenameResult>[4], selected: unknown): ReturnType<typeof validateCurrentSchematicRenameResult> =>
        validateCurrentSchematicRenameResult(value, preparation, selectedBefore, metadata, roster, structuredClone(selected)),
      assertCurrentIssuedWindowsClockObservation, windowsClockObservationForResult, validateClockSample,
      assertIssuedWindowsClockObservation: async (value: Parameters<typeof assertIssuedWindowsClockObservation>[0]): ReturnType<typeof assertIssuedWindowsClockObservation> => {
        const result = await assertIssuedWindowsClockObservation(value); clockChecks += 1;
        if (options["invalidateClockStage"] === clockChecks) { current = false; } return result;
      },
      assertOriginalCurrentSchematicRenameStartup: (value: unknown, selectedEngine: unknown, selectedGeneration: unknown): unknown => {
        assert.equal(closed, false, "live startup assertion was invoked after closure");
        assert.ok(current, "original startup expired"); assert.equal(value, startup); assert.equal(selectedEngine, engine); assert.equal(selectedGeneration, generation); return selectedSource;
      }, assertCurrentSchematicRenameWriterOwner: (value: unknown, selectedEngine: unknown, scopeText: unknown): unknown => {
        assert.equal(scopeText, canonicalJson({ synthetic: "original-scope" }), "owner requires its exact active dispatch scope");
        assert.ok(current, "original writer expired"); assert.equal(value, owner); assert.equal(selectedEngine, engine); return writer;
      }, input });
    runInContext(program, sandbox);
    return { run: async (overrides = {}): Promise<Bag> => { sandbox["selectedInput"] = { ...input, ...overrides };
      return bag(await runInContext("prepareCurrentSchematicRenameClock(selectedInput)", sandbox));
    }, original: (plan, selectedOwner = owner, selectedStartup = startup): Bag => {
      sandbox["selectedPlan"] = plan; sandbox["selectedOwner"] = selectedOwner; sandbox["selectedStartup"] = selectedStartup;
      return bag(runInContext("assertOriginalCurrentSchematicRenameClock(selectedPlan,input.engine,input.generation,selectedStartup,selectedOwner)", sandbox));
    }, invalidate(): void { current = false; }, post: async (plan, result, afterClock, overrides = {}): Promise<void> => {
      sandbox["selectedPlan"] = plan; sandbox["postInput"] = { engine, generation, startup, dispatchOwner: owner, afterClock, result, ...overrides };
      await runInContext("recordCurrentSchematicRenameClockPost(selectedPlan,postInput)", sandbox);
    }, verify: async (plan, proof, after, overrides = {}): Promise<Bag> => {
      sandbox["selectedPlan"] = plan; sandbox["verifyInput"] = { engine, dispatchOwner: owner, terminationProof: proof, after, ...overrides };
      return bag(await runInContext("verifyCurrentSchematicRenameClockEffect(selectedPlan,verifyInput)", sandbox));
    }, completed: (plan, after, selectedOwner = owner): Bag => {
      sandbox["selectedPlan"] = plan; sandbox["selectedAfter"] = after; sandbox["selectedOwner"] = selectedOwner;
      return bag(runInContext("completedCurrentSchematicRenameClockSource(selectedPlan,input.engine,selectedOwner,selectedAfter)", sandbox));
    }, persist: (_plan, backendTime = TIMES.edit, backendActor = ACTOR): Promise<Inventory> => {
      const raw = [
        [{ type: "EDIT_HEAD" }, { ...backendActor, updateTime: backendTime }],
        [{ type: "DOCHEAD", ticket: 101 }, { docType: "SCH", client: "a".repeat(16), uuid: TARGET.schematicUuid,
          updateTime: TIMES.document, version: String(TIMES.document), editVersion: "3.2.206" }],
        [{ type: "META", ticket: 101, id: "META" }, { title: REQUEST.desiredTitle, source: "", board: "", zIndex: null }],
      ].map(([identity, body]) => `${JSON.stringify(identity)}||${JSON.stringify(body)}`).join("|\n");
      applyEffect(baseline.path, raw);
      const utc = new Date(backendTime).toISOString().slice(0, 19).replace("T", " ");
      const local = new Date(backendTime + 120 * 60_000).toISOString().slice(0, 19).replace("T", " ");
      mutate(baseline.path, [`UPDATE history_data SET created_at='${utc}',updated_at='${utc}' WHERE uuid='${IDS.newHead}'`,
        `UPDATE "${HISTORY_TABLE}" SET created_at='${utc}',updated_at='${utc}' WHERE uuid='${IDS.newHead}'`,
        `UPDATE projects SET updated_at='${local}'`,
        `UPDATE project_structures SET structure=json_set(structure,
          '$.schematics.${TARGET.schematicUuid}.name','${REQUEST.desiredTitle}',
          '$.schematics.${TARGET.schematicUuid}.version','${TIMES.document}',
          '$.schematics.${TARGET.schematicUuid}.updateTime',${TIMES.document}) WHERE branch_uuid='${IDS.branch}'`].join(";"));
      return inventory(baseline.path);
    } };
  } };
}

void test("SCH clock binds original Windows brackets and issued SCH owner to immutable locked-head SQL intent", async context => {
  const fixture = await setup(context);
  const env = fixture.make();
  const plan = await env.run();
  const original = env.original(plan), preparation = bag(original["preparation"]);
  assert.deepEqual(structuredClone(plan["backendWindow"]), { minimumMs: BASE, maximumMs: BASE + 60_000 });
  assert.deepEqual(structuredClone(plan["documentWindow"]), { minimumMs: BASE + 20, maximumMs: BASE + 60_020 });
  assert.equal(plan["operationId"], INPUT.operationId); assert.equal(plan["preparationSha256"], preparation["preparationSha256"]);
  assert.equal(original["source"], fixture.source); assert.equal(preparation["targetUuid"], TARGET.schematicUuid);
  assert.equal(preparation["desiredTitle"], REQUEST.desiredTitle); assert.equal(bag(preparation["witness"])["backendActorUuid"], ACTOR.uuid);
  assert.equal(plan["originalWindowsObservationsRetained"], true); assert.equal(plan["originalStartupBound"], true);
  for (const key of ["dispatchOwnershipVerified", "documentSampleProvenanceVerified", "startupQualified", "backendActorVerified", "producerBindingVerified",
    "schematicSubscriberCompletionVerified", "futureWriteClockVerified", "writerReady", "executionAuthorized"]) { assert.equal(plan[key], false); }
  assert.throws(() => env.original(structuredClone(plan)), /Original SCH clock/u); assert.throws(() => env.original(plan, {}), /Original SCH clock/u);
  await assert.rejects(env.run(), /already consumed/u); env.invalidate(); assert.throws(() => env.original(plan), /expired/u);
});
void test("SCH clock consumes failed preparation and refuses copied, repeated or unbracketed Windows observations", async context => {
  const fixture = await setup(context);
  for (const changed of [{ beforeClock: structuredClone(fixture.input["beforeClock"]) }, { armedClock: structuredClone(fixture.input["armedClock"]) },
    { armedClock: fixture.input["beforeClock"] }, { documentBefore: document(0, 1, 2) }, { documentBefore: document(110, 120, 130) },
    { documentBefore: { ...document(), rendererTimezoneOffsetMinutes: 120 } }]) {
    const env = fixture.make(); await assert.rejects(env.run(changed)); await assert.rejects(env.run(), /already consumed/u);
  }
  const expired = fixture.make({ invalidateDuringSql: true }); await assert.rejects(expired.run(), /expired/u);
  for (const invalidateClockStage of [1, 2, 3, 4, 5, 6]) {
    await assert.rejects(fixture.make({ invalidateClockStage }).run(), /expired/u);
  }
});
void test("SCH clock rejects malformed age data, input getters and Proxy traps", async context => {
  const fixture = await setup(context); let traps = 0;
  const trap = (): never => { traps += 1; throw new Error("unexpected trap"); };
  for (const documentBefore of [new Proxy(document(), { get: trap, ownKeys: trap, getPrototypeOf: trap }),
    Object.defineProperty(document(), "serverTimeMs", { get: trap })]) {
    await assert.rejects(fixture.make().run({ documentBefore }));
  }
  await assert.rejects(fixture.make().run({ agedHead: { createdAtLiteral: "2000-01-01 00:00:00" } }), /fields/u); assert.equal(traps, 0);
});
void test("SCH clock refuses unlocked heads without independent age evidence", async context => {
  const unlocked = await setup(context, `UPDATE "${HISTORY_TABLE}" SET is_lock=0`);
  await assert.rejects(unlocked.make().run(), /independently bound native head age/u);
});

function nativeResult(original: Bag): Bag {
  const before = { uuid: TARGET.schematicUuid, ...REQUEST.expectedBefore };
  const after = { ...before, displayName: REQUEST.desiredTitle, name: REQUEST.desiredTitle.toLowerCase(), ticket: 101,
    updateTime: TIMES.document, version: String(TIMES.document) };
  return { kind: "current-schematic-rename", target: TARGET, preparationSha256: bag(original["preparation"])["preparationSha256"], before, after,
    acknowledged: after, nativeReturnAcknowledged: true, actor: ACTOR, client: "a".repeat(16), beforeMaxTicket: 100, afterMaxTicket: 101,
    documentBefore: document(1000, 1005, 1010), documentAfter: document(2000, 2005, 2010), peerMetadataMatched: true, childMetadataMatched: true,
    peerCount: 2, mutationDispatched: true, permissionVerified: false, startupQualified: false, postRenameStartupQualified: false,
    peerDesignInvarianceVerified: false, backendActorVerified: false, backendClockVerified: false, workerIdentityVerified: false,
    producerBindingVerified: false, schematicSubscriberCompletionVerified: false, crossInvocationReceiverContinuityVerified: false,
    atomicCompareAndSwap: false, persistenceVerified: false, reopened: false, executionAuthorized: false, explicitSaveDispatched: false };
}
void test("SCH clock freezes baseline user names separately from UI names, including native missing-row fallback", async context => {
  for (const [sql, backendActor] of [
    ["UPDATE users SET username='historical-user',nickname='Historical'", { ...ACTOR, username: "historical-user", nickname: "Historical" }],
    ["DELETE FROM users", { ...ACTOR, username: "", nickname: "" }],
  ] as const) {
    const f = await setup(context, sql); const env = f.make(), plan = await env.run();
    assert.deepEqual(env.original(plan)["expectedActor"], ACTOR);
    await env.post(plan, nativeResult(env.original(plan)), await f.nextClock());
    const proof = await f.terminate(); const after = await env.persist(plan, TIMES.edit, backendActor);
    const comparison = await env.verify(plan, proof, after);
    assert.equal(comparison["transactionActorMatchesExpected"], true);
    assert.deepEqual(env.completed(plan, after)["expectedActor"], ACTOR);
  }
  const f = await setup(context, "DELETE FROM users"); const env = f.make(), plan = await env.run();
  await env.post(plan, nativeResult(env.original(plan)), await f.nextClock());
  const proof = await f.terminate(), wrongUiNames = await env.persist(plan);
  await assert.rejects(env.verify(plan, proof, wrongUiNames));
  assert.throws(() => env.completed(plan, wrongUiNames), /Original successful/u);
});
void test("SCH post and closure bind original clocks and every SQL row without invoking retired live owners", async context => {
  const f = await setup(context); const env = f.make(); const plan = await env.run(); const native = nativeResult(env.original(plan));
  await env.post(plan, native, await f.nextClock()); const proof = await f.terminate(); const after = await env.persist(plan);
  assert.throws(() => env.original(plan), /live startup assertion/u);
  const comparison = await env.verify(plan, proof, after), source = env.completed(plan, after);
  assert.equal(source["comparison"], comparison); assert.equal(source["maximumTicket"], 101);
  assert.equal(bag(source["storedEffect"])["wholeRenameSqlEffectVerified"], true); assert.deepEqual(source["expectedActor"], ACTOR);
  assert.equal(comparison["nativeResultSha256"], sha256Json(native)); assert.equal(comparison["schematicSubscriberCompletionVerified"], false);
  assert.equal(comparison["transactionActorMatchesExpected"], true); assert.equal(comparison["backendActorPreverified"], false);
  assert.equal(comparison["futureRequestActorVerified"], false); assert.equal(comparison["originalLaunchAndJobTerminationVerified"], true);
  assert.equal(comparison["executionAuthorized"], false); assert.equal(comparison["reopened"], false);
  assert.throws(() => env.completed(structuredClone(plan), after), /Original successful/u);
  assert.throws(() => env.completed(plan, structuredClone(after)), /Original successful/u);
  assert.throws(() => env.completed(plan, after, {}), /Original successful/u);
  await assert.rejects(env.verify(plan, proof, after), /consumed/u);
});
void test("SCH post consumes substituted owner/result/clocks and refuses a capture interposed between N0 and rename", async context => {
  const f = await setup(context); const afterClock = await f.nextClock();
  for (const mode of ["owner", "clock", "actor", "username", "nickname", "ticket", "window"] as const) {
    const env = f.make(); const plan = await env.run(); const native = nativeResult(env.original(plan));
    if (mode === "actor") { native["actor"] = { ...ACTOR, uuid: "f".repeat(32) }; }
    if (mode === "username" || mode === "nickname") { native["actor"] = { ...ACTOR, [mode]: "changed UI name" }; }
    if (mode === "ticket") { native["after"] = { ...bag(native["after"]), ticket: 102 }; }
    if (mode === "window") { native["documentBefore"] = document(0, 1, 2); }
    await assert.rejects(env.post(plan, native, mode === "clock" ? structuredClone(afterClock) : afterClock, mode === "owner" ? { dispatchOwner: {} } : {}));
    const repeated = nativeResult(env.original(plan)); await assert.rejects(env.post(plan, repeated, afterClock), /consumed/u);
  }
  const env = f.make(); const plan = await env.run(); const native = nativeResult(env.original(plan));
  await f.interposeCapture(); await assert.rejects(env.post(plan, native, await f.nextClock()), /owner or original generation changed/u);
  await assert.rejects(env.post(plan, native, afterClock), /consumed/u);
});
void test("SCH backend persistence may follow native return but must precede original termination within frozen windows", async context => {
  for (const delta of [3500, 5001, 5004, 60_001]) {
    const f = await setup(context); const env = f.make(); const plan = await env.run();
    await env.post(plan, nativeResult(env.original(plan)), await f.nextClock());
    const proof = await f.terminate(delta === 60_001 ? 180_000 : 5000); const after = await env.persist(plan, BASE + delta);
    if (delta <= 5001) {
      const comparison = await env.verify(plan, proof, after);
      assert.deepEqual(structuredClone(comparison["backendPersistenceInterval"]), { minimumMs: BASE + 103, maximumMs: BASE + 5003 });
      assert.equal(bag(env.completed(plan, after)["storedEffect"])["backendTime"], BASE + delta);
    } else {
      await assert.rejects(env.verify(plan, proof, after)); assert.throws(() => env.completed(plan, after), /Original successful/u);
    }
    await assert.rejects(env.verify(plan, proof, after), /consumed/u);
  }
});
void test("SCH copied termination cannot receive completed clock evidence", async context => {
  const f = await setup(context); const env = f.make(); const plan = await env.run();
  await env.post(plan, nativeResult(env.original(plan)), await f.nextClock()); const proof = await f.terminate(); const after = await env.persist(plan);
  await assert.rejects(env.verify(plan, structuredClone(proof), after), /Original Windows result/u);
  assert.throws(() => env.completed(plan, after), /Original successful/u); await assert.rejects(env.verify(plan, proof, after), /consumed/u);
});
