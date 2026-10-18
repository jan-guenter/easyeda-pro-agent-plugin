/** Synthetic source-qualified Windows child streams and original SQL readers.
 * The startup owner is isolated in a harness; no live writer is qualified.
 */
/* oxlint-disable import/max-dependencies -- Combine the real SQL preparers and original source-qualified Windows test issuer; replacing them with permissive test callbacks would lose identity coverage. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { prepareCurrentPcbNativeMetadata } from "../src/current-pcb-native-metadata.ts";
import { assertOriginalCurrentPcbRenameBinding, prepareCurrentPcbRenameBinding } from "../src/current-pcb-rename-binding.ts";
import { bindCurrentPcbRenameTimes, prepareCurrentPcbRename } from "../src/current-pcb-rename-preparation.ts";
import { validateCurrentPcbRenameResult } from "../src/current-pcb-rename-program.ts";
import { completedCurrentPcbRenameStoredSource, verifyCurrentPcbRenameStoredEffect } from "../src/current-pcb-rename-stored-effect.ts";
import { validateActorProjection } from "../src/symbol-dual-actor.ts";
import { assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";
import { validateClockSample } from "../src/windows-clock-transport.ts";
import { PCB_PROGRAM_ACTOR, PCB_PROGRAM_TARGET, pcbProgramBaseline } from "./helpers/current-pcb-rename-program-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { HISTORY_TABLE, IDS, TIMES, applyEffect, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const BASE = Date.parse("2026-10-12T12:34:55.000Z"), EPOCH = 621_355_968_000_000_000n;
type Bag = Record<string, unknown>;
type Inventory = Awaited<ReturnType<typeof inventory>>;
interface Harness {
  readonly run: (overrides?: Bag) => Promise<Bag>;
  readonly original: (plan: unknown, owner?: unknown, startup?: unknown) => Bag;
  readonly post: (plan: unknown, result: unknown, afterClock: unknown, overrides?: Bag) => Promise<void>;
  readonly verify: (plan: unknown, proof: unknown, after: Inventory, overrides?: Bag) => Promise<Bag>;
  readonly completed: (plan: unknown, after: Inventory, owner?: unknown) => Bag;
  readonly persist: (plan: unknown, backendTime?: number) => Promise<Inventory>;
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
async function setup(context: TestContext): Promise<Readonly<{ input: Bag; source: object; make: () => Harness;
  nextClock: () => Promise<unknown>; terminate: (offsetMs?: number) => Promise<unknown> }>> {
  const native = await qualifiedClockFixture(context), original = await pcbProgramBaseline(); let time = BASE - 10_000;
  let closed = false;
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
  const engine = Object.freeze({ synthetic: "original-engine" }), generation = Object.freeze({ operationId: INPUT.operationId });
  const owner = Object.freeze({ synthetic: "one-shot-owner" }), startup = Object.freeze({ synthetic: "original-startup" });
  const projection = await prepareCurrentPcbNativeMetadata({ before: original.before, target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB" });
  const source = Object.freeze({ source: { launchClock, captureClock, baseline: { inventory: original.before, intent: { target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB" } } },
    expectation: { sheetUuids: ["e".repeat(16)], templates: [] }, projection,
    observation: { runtimeObservation: { actor: PCB_PROGRAM_ACTOR }, clientTicketObservation: { client: "a".repeat(16), maxTicket: 100 } } });
  const input = { engine, generation, startup, dispatchOwner: owner, beforeClock, armedClock, documentBefore: document() };
  const text = await readFile(new URL("../src/current-pcb-rename-clock.ts", import.meta.url), "utf8"); const start = text.indexOf("const COLLECTION_MS ="); assert.ok(start > 0);
  const program = stripTypeScriptTypes(text.slice(start)).replaceAll("export function", "function").replaceAll("export async function", "async function");
  return { input, source, nextClock() { time = BASE + 3000; return observe(authority); }, async terminate(offsetMs = 180_000) {
    time = BASE + offsetMs;
    const binding = { operationId: INPUT.operationId, phase: INPUT.orphanPhase, challengeAttempt: INPUT.challengeAttempt,
      bridgeSession: INPUT.bridgeSession, runtimeIdentity: INPUT.runtimeIdentity, launch, executionAuthority: authority };
    const intent = await native.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
    const closeReceipt = await native.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
    const proof = await native.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }); closed = true; return proof;
  }, make() {
    const sandbox = createContext({ Object, WeakMap, WeakSet, Promise, Error, Date, Number, BigInt, Math, canonicalJson, isRecord, sha256Json,
      // Only realm-normalize data containers; original reader/token identities
      // Are retained. Production never accepts VM or caller verifier callbacks.
      prepareCurrentPcbRename: (value: Parameters<typeof prepareCurrentPcbRename>[0]): ReturnType<typeof prepareCurrentPcbRename> =>
        prepareCurrentPcbRename({ ...value, target: { ...value.target }, witness: { ...value.witness } }),
      prepareCurrentPcbRenameBinding: (value: Parameters<typeof prepareCurrentPcbRenameBinding>[0]): ReturnType<typeof prepareCurrentPcbRenameBinding> =>
        prepareCurrentPcbRenameBinding({ ...value }),
      assertOriginalCurrentPcbRenameBinding, bindCurrentPcbRenameTimes, validateActorProjection, verifyCurrentPcbRenameStoredEffect, completedCurrentPcbRenameStoredSource,
      validateCurrentPcbRenameResult: (value: unknown, preparation: Parameters<typeof validateCurrentPcbRenameResult>[1], binding: Parameters<typeof validateCurrentPcbRenameResult>[2], selected: unknown): ReturnType<typeof validateCurrentPcbRenameResult> =>
        validateCurrentPcbRenameResult(value, preparation, binding, structuredClone(selected)),
      assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult, validateClockSample,
      assertOriginalCurrentPcbRenameStartup: (value: unknown, selectedEngine: unknown, selectedGeneration: unknown): typeof source => {
        assert.equal(closed, false, "live startup assertion was invoked after closure");
        assert.equal(value, startup); assert.equal(selectedEngine, engine); assert.equal(selectedGeneration, generation); return source;
      }, input,
    });
    runInContext(program, sandbox);
    return { run: async (overrides: Bag = {}): Promise<Bag> => { sandbox["selectedInput"] = { ...input, ...overrides };
      return bag(await runInContext("prepareCurrentPcbRenameClock(selectedInput)", sandbox));
    }, original: (plan: unknown, selectedOwner: unknown = owner, selectedStartup: unknown = startup): Bag => {
      sandbox["selectedPlan"] = plan; sandbox["selectedOwner"] = selectedOwner; sandbox["selectedStartup"] = selectedStartup;
      return bag(runInContext("assertOriginalCurrentPcbRenameClock(selectedPlan,input.engine,input.generation,selectedStartup,selectedOwner)", sandbox));
    }, post: async (plan, nativeResult, afterClock, overrides = {}): Promise<void> => {
      sandbox["selectedPlan"] = plan; sandbox["postInput"] = { engine, generation, startup, dispatchOwner: owner, afterClock, result: nativeResult, ...overrides };
      await runInContext("recordCurrentPcbRenameClockPost(selectedPlan,postInput)", sandbox);
    }, verify: async (plan, proof, after, overrides = {}): Promise<Bag> => {
      sandbox["selectedPlan"] = plan; sandbox["verifyInput"] = { engine, dispatchOwner: owner, terminationProof: proof, after, ...overrides };
      return bag(await runInContext("verifyCurrentPcbRenameClockEffect(selectedPlan,verifyInput)", sandbox));
    }, completed: (plan, after, selectedOwner = owner): Bag => {
      sandbox["selectedPlan"] = plan; sandbox["selectedAfter"] = after; sandbox["selectedOwner"] = selectedOwner;
      return bag(runInContext("completedCurrentPcbRenameClockSource(selectedPlan,input.engine,selectedOwner,selectedAfter)", sandbox));
    }, persist: async (plan, backendTime = TIMES.edit): Promise<Inventory> => {
      sandbox["selectedPlan"] = plan; sandbox["savedTimes"] = { documentTime: TIMES.document, backendTime: TIMES.edit };
      const bound = bag(await runInContext("bindCurrentPcbRenameTimes(plans.get(selectedPlan).preparation,savedTimes)", sandbox));
      const raw = bag(bound["history"])["chunkText"], tree = bag(bound["structure"])["afterStructureText"];
      assert.ok(typeof raw === "string" && typeof tree === "string");
      const [edit, ...records] = raw.split("|\n"), prefix = `${JSON.stringify({ type: "EDIT_HEAD" })}||`;
      assert.ok(edit !== undefined && edit.startsWith(prefix)); const body = bag(JSON.parse(edit.slice(prefix.length)));
      assert.equal(body["updateTime"], TIMES.edit);
      // Change only the synthetic persisted timestamp, not the frozen plan, so
      // Invalid-window fixtures reach the actual stored-effect verifier.
      applyEffect(original.path, [`${prefix}${JSON.stringify({ ...body, updateTime: backendTime })}`, ...records].join("|\n"));
      const utc = new Date(backendTime).toISOString().slice(0, 19).replace("T", " ");
      const local = new Date(backendTime + 120 * 60_000).toISOString().slice(0, 19).replace("T", " ");
      mutate(original.path, [`UPDATE history_data SET created_at='${utc}',updated_at='${utc}' WHERE uuid='${IDS.newHead}'`,
        `UPDATE "${HISTORY_TABLE}" SET created_at='${utc}',updated_at='${utc}' WHERE uuid='${IDS.newHead}'`,
        `UPDATE projects SET updated_at='${local}'`].join(";"));
      mutate(original.path, `UPDATE project_structures SET structure='${tree.replaceAll("'", "''")}' WHERE branch_uuid='${IDS.branch}'`);
      return inventory(original.path);
    } };
  } };
}

function result(original: Bag): Bag {
  const binding = bag(original["binding"]), peers = binding["peers"]; assert.ok(Array.isArray(peers));
  const before = bag(peers[0]); const after = { ...before, displayTitle: "Renamed PCB", title: "renamed pcb", ticket: 101, updateTime: TIMES.document, version: String(TIMES.document) };
  return { kind: "current-pcb-rename", target: PCB_PROGRAM_TARGET, bindingSha256: binding["bindingSha256"], before, after, acknowledged: after,
    nativeReturnAcknowledged: true, actor: PCB_PROGRAM_ACTOR, client: "a".repeat(16), beforeMaxTicket: 100, afterMaxTicket: 101,
    documentBefore: document(1000, 1005, 1010), documentAfter: document(2000, 2005, 2010), peerMetadataMatched: true, peerCount: 2, mutationDispatched: true,
    permissionVerified: false, startupQualified: false, postRenameStartupQualified: false, peerDesignInvarianceVerified: false, backendActorVerified: false,
    backendClockVerified: false, workerIdentityVerified: false, producerBindingVerified: false, crossInvocationReceiverContinuityVerified: false,
    atomicCompareAndSwap: false, persistenceVerified: false, reopened: false, executionAuthorized: false, explicitSaveDispatched: false };
}

void test("PCB clock derives original intent/client/UI actor and binds immutable SQL preparation inside original Windows brackets", async context => {
  const fixture = await setup(context); const env = fixture.make(), plan = await env.run(); const original = env.original(plan);
  assert.deepEqual(structuredClone(plan["backendWindow"]), { minimumMs: BASE, maximumMs: BASE + 60_000 });
  assert.deepEqual(structuredClone(plan["documentWindow"]), { minimumMs: BASE + 20, maximumMs: BASE + 60_020 });
  assert.equal(plan["operationId"], INPUT.operationId); assert.equal(plan["originalStartupBound"], true); assert.equal(plan["originalWindowsObservationsRetained"], true);
  assert.equal(Object.hasOwn(plan, "preparation"), false); assert.equal(Object.hasOwn(plan, "binding"), false); assert.equal(original["source"], fixture.source);
  const binding = bag(original["binding"]), preparation = bag(original["preparation"]), witness = bag(preparation["witness"]);
  assert.deepEqual(preparation["target"], PCB_PROGRAM_TARGET); assert.equal(preparation["desiredTitle"], "Renamed PCB");
  assert.equal(witness["backendActorUuid"], PCB_PROGRAM_ACTOR.uuid); assert.equal(witness["client"], "a".repeat(16));
  assert.equal(plan["preparationSha256"], preparation["preparationSha256"]); assert.equal(plan["bindingSha256"], binding["bindingSha256"]);
  for (const key of ["dispatchOwnershipVerified", "documentSampleProvenanceVerified", "startupQualified", "completeAstSourceBindingVerified", "startupLocalChangesExcluded",
    "backendActorVerified", "producerBindingVerified", "appClockDirectlyObserved", "continuousClockStabilityProved", "futureWriteClockVerified",
    "entireJobExitedWithinOriginalWindow", "persistentUploadReplayExcluded", "reopened", "writerReady", "executionAuthorized"]) { assert.equal(plan[key], false); }
  assert.throws(() => env.original(structuredClone(plan)), /Original PCB clock/u); assert.throws(() => env.original(plan, {}), /Original PCB clock/u);
  assert.throws(() => env.original(plan, undefined, {}), /Original PCB clock/u);
  await assert.rejects(env.run(), /reservation already consumed/u); await assert.rejects(env.run({ dispatchOwner: {} }), /reservation already consumed/u);
});

void test("PCB clock consumes failed preparation and never accepts equivalent copied Windows observations", async context => {
  const fixture = await setup(context);
  for (const key of ["beforeClock", "armedClock"]) {
    const env = fixture.make(); await assert.rejects(env.run({ [key]: structuredClone(fixture.input[key]) }), /not issued/u);
    await assert.rejects(env.run(), /reservation already consumed/u); await assert.rejects(env.run({ dispatchOwner: {} }), /reservation already consumed/u);
  }
  const env = fixture.make(); await assert.rejects(env.run({ armedClock: fixture.input["beforeClock"] }), /distinct original/u);
  await assert.rejects(env.run(), /reservation already consumed/u);
});

void test("PCB clock refuses unbracketed documents, timezone mismatch and injection fields without inventing new clocks", async context => {
  const fixture = await setup(context);
  for (const documentBefore of [document(0, 1, 2), document(110, 120, 130), { ...document(), rendererTimezoneOffsetMinutes: 120 },
    { ...document(), rendererBeforeIso: "not-an-iso" }, { ...document(), serverTimeMs: BASE + 31 }]) {
    const env = fixture.make(); await assert.rejects(env.run({ documentBefore })); await assert.rejects(env.run(), /reservation already consumed/u);
  }
  for (const key of ["client", "actor", "target", "desiredTitle", "witness", "launchClock", "captureClock"]) {
    const env = fixture.make(); await assert.rejects(env.run({ [key]: {} }), /fields differ/u);
  }
  const env = fixture.make(); let accessed = false;
  const documentBefore = Object.defineProperty(document(), "serverTimeMs", { get() { accessed = true; return BASE; } });
  await assert.rejects(env.run({ documentBefore }), /accessors/u);
  assert.equal(accessed, false);
});

void test("PCB clock snapshots the unqualified document sample before the first awaited original issuer check", async context => {
  const fixture = await setup(context); const documentBefore = document(), env = fixture.make(), pending = env.run({ documentBefore });
  documentBefore["serverTimeMs"] = 0; documentBefore["notifyTabId"] = "f".repeat(16);
  const plan = await pending; const original = env.original(plan); assert.equal(bag(plan["documentWindow"])["minimumMs"], BASE + 20);
  assert.equal(bag(original["documentBefore"])["notifyTabId"], "a".repeat(16)); assert.equal(plan["documentSampleProvenanceVerified"], false);
});

void test("PCB post and closure bind the native result to original Windows clocks and every saved SQL row without reviving live owners", async context => {
  const fixture = await setup(context); const env = fixture.make(), plan = await env.run(); const nativeResult = result(env.original(plan));
  await env.post(plan, nativeResult, await fixture.nextClock()); const proof = await fixture.terminate(); const after = await env.persist(plan);
  assert.throws(() => env.original(plan), /live startup assertion/u);
  assert.throws(() => env.completed(plan, after), /Original successful/u);
  const comparison = await env.verify(plan, proof, after), source = env.completed(plan, after);
  assert.equal(source["comparison"], comparison); assert.equal(source["maximumTicket"], 101);
  assert.equal(bag(source["storedEffect"])["wholeRenameSqlEffectVerified"], true); assert.deepEqual(source["expectedActor"], PCB_PROGRAM_ACTOR);
  assert.equal(comparison["nativeResultSha256"], sha256Json(nativeResult)); assert.equal(comparison["executionAuthorized"], false); assert.equal(comparison["reopened"], false);
  assert.throws(() => env.completed(structuredClone(plan), after), /Original successful/u); assert.throws(() => env.completed(plan, structuredClone(after)), /Original successful/u);
  assert.throws(() => env.completed(plan, after, {}), /Original successful/u); await assert.rejects(env.verify(plan, proof, after), /consumed/u);
});

for (const backendOffset of [3500, 5001]) {
  void test(`PCB backend persistence at +${backendOffset}ms may follow the renderer return within the original exit and frozen SQL windows`, async context => {
    const fixture = await setup(context); const env = fixture.make(), plan = await env.run();
    const nativeResult = result(env.original(plan)); await env.post(plan, nativeResult, await fixture.nextClock());
    // Handle-ClockedRequest brackets Handle-Request/prove-terminated with clock
    // Reads. This synthetic checkedAt is +5001, between samples +5000 and +5002.
    // The +5001 backend case must not assume exit preceded the pre-probe sample.
    const proof = await fixture.terminate(5000); const backendTime = BASE + backendOffset;
    const after = await env.persist(plan, backendTime), comparison = await env.verify(plan, proof, after);
    assert.deepEqual(structuredClone(comparison["rendererReturnInterval"]), { minimumMs: BASE + 103, maximumMs: BASE + 3000 });
    assert.deepEqual(structuredClone(comparison["backendPersistenceInterval"]), { minimumMs: BASE + 103, maximumMs: BASE + 5003 });
    assert.deepEqual(structuredClone(comparison["backendWindow"]), { minimumMs: BASE, maximumMs: BASE + 60_000 });
    assert.equal(bag(comparison["storedEffect"])["backendTime"], backendTime);
    assert.equal(bag(comparison["storedEffect"])["documentTime"], TIMES.document);
    assert.equal(bag(env.completed(plan, after)["storedEffect"])["wholeRenameSqlEffectVerified"], true);
    assert.equal(comparison["entireJobExitedWithinOriginalWindow"], false); assert.equal(comparison["reopened"], false);
    await assert.rejects(env.verify(plan, proof, after), /consumed/u);
  });
}

for (const selected of [
  { name: "before armed", backendOffset: 102, exitOffset: 5000, error: /armed-to-termination persistence interval/u },
  { name: "after original exit", backendOffset: 5004, exitOffset: 5000, error: /armed-to-termination persistence interval/u },
  { name: "outside the frozen window despite later exit", backendOffset: 60_001, exitOffset: 180_000, error: /separate supplied clock bounds/u },
]) {
  void test(`PCB backend persistence ${selected.name} consumes verification without completed authority`, async context => {
    const fixture = await setup(context); const env = fixture.make(), plan = await env.run();
    await env.post(plan, result(env.original(plan)), await fixture.nextClock());
    const proof = await fixture.terminate(selected.exitOffset); const after = await env.persist(plan, BASE + selected.backendOffset);
    await assert.rejects(env.verify(plan, proof, after), selected.error);
    assert.throws(() => env.completed(plan, after), /Original successful/u);
    await assert.rejects(env.verify(plan, proof, after), /consumed/u);
  });
}

void test("PCB post consumes forged results, wrong owners and copied clocks without issuing saved authority", async context => {
  const fixture = await setup(context); const afterClock = await fixture.nextClock();
  for (const mode of ["owner", "clock", "actor", "ticket", "window", "return"] as const) {
    const env = fixture.make(), plan = await env.run(); const nativeResult = result(env.original(plan));
    if (mode === "actor") { nativeResult["actor"] = { ...PCB_PROGRAM_ACTOR, uuid: "f".repeat(32) }; }
    if (mode === "ticket") { nativeResult["after"] = { ...bag(nativeResult["after"]), ticket: 102 }; }
    if (mode === "window") { nativeResult["documentBefore"] = document(10, 20, 30); }
    if (mode === "return") { nativeResult["documentAfter"] = document(3100, 3105, 3110); }
    await assert.rejects(env.post(plan, nativeResult, mode === "clock" ? structuredClone(afterClock) : afterClock, mode === "owner" ? { dispatchOwner: {} } : {}));
    const retryResult = result(env.original(plan)); await assert.rejects(env.post(plan, retryResult, afterClock), /consumed/u);
  }
});

void test("PCB closed effect consumes copied termination and cannot issue completed history after refusal", async context => {
  const fixture = await setup(context); const env = fixture.make(), plan = await env.run();
  await env.post(plan, result(env.original(plan)), await fixture.nextClock()); const proof = await fixture.terminate(); const after = await env.persist(plan);
  await assert.rejects(env.verify(plan, structuredClone(proof), after), /no clock observation/u);
  assert.throws(() => env.completed(plan, after), /Original successful/u); await assert.rejects(env.verify(plan, proof, after), /consumed/u);
});
