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
import { originalCurrentSchematicRenameSqlPreparation, prepareCurrentSchematicRenameSql } from "../src/current-schematic-rename-sql.ts";
import { validateActorProjection } from "../src/symbol-dual-actor.ts";
import { assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";
import { validateClockSample } from "../src/windows-clock-transport.ts";
import { ACTOR, REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { HISTORY_TABLE, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const BASE = Date.parse("2026-10-12T12:34:55.000Z"), EPOCH = 621_355_968_000_000_000n;
type Bag = Record<string, unknown>;
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
  input: Bag; source: object; make: (options?: Bag) => {
    run: (overrides?: Bag) => Promise<Bag>; original: (plan: unknown, owner?: unknown, startup?: unknown) => Bag; invalidate: () => void;
  };
}> {
  const baseline = await schematicBaseline(), native = await qualifiedClockFixture(context); let time = BASE - 10_000;
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
  const engine = Object.freeze({ synthetic: "original-engine" }), generation = Object.freeze({ operationId: INPUT.operationId });
  const owner = Object.freeze({ synthetic: "issued-sch-writer-owner" }), startup = Object.freeze({ synthetic: "original-startup" });
  const source = Object.freeze({ source: { launchClock, captureClock, baseline: { inventory: before, intent: { target: TARGET, desiredTitle: REQUEST.desiredTitle } } },
    projection, observation: { runtimeObservation: { actor: ACTOR }, clientTicketObservation: { client: "a".repeat(16), maxTicket: 100 } } });
  const input = { engine, generation, startup, dispatchOwner: owner, beforeClock, armedClock, documentBefore: document() };
  const text = await readFile(new URL("../src/current-schematic-rename-clock.ts", import.meta.url), "utf8");
  const start = text.indexOf("const COLLECTION_MS ="); assert.ok(start > 0);
  const program = stripTypeScriptTypes(text.slice(start)).replaceAll("export function", "function").replaceAll("export async function", "async function");
  return { input, source, make(options = {}) {
    let clockChecks = 0, current = true;
    const writer = { generation, original: source.source };
    const selectedSource = options["source"] ?? source;
    const sandbox = createContext({ types, Object, WeakMap, WeakSet, Promise, Error, Date, Number, BigInt, Math, canonicalJson, isRecord, sha256Json,
      prepareCurrentSchematicRenameSql: async (value: Parameters<typeof prepareCurrentSchematicRenameSql>[0]): ReturnType<typeof prepareCurrentSchematicRenameSql> => {
        const result = await prepareCurrentSchematicRenameSql({ ...value, witness: { ...value.witness } });
        if (options["invalidateDuringSql"] === true) { current = false; } return result;
      }, originalCurrentSchematicRenameSqlPreparation, validateActorProjection,
      assertCurrentIssuedWindowsClockObservation, validateClockSample,
      assertIssuedWindowsClockObservation: async (value: Parameters<typeof assertIssuedWindowsClockObservation>[0]): ReturnType<typeof assertIssuedWindowsClockObservation> => {
        const result = await assertIssuedWindowsClockObservation(value); clockChecks += 1;
        if (options["invalidateClockStage"] === clockChecks) { current = false; } return result;
      },
      assertOriginalCurrentSchematicRenameStartup: (value: unknown, selectedEngine: unknown, selectedGeneration: unknown): unknown => {
        assert.ok(current, "original startup expired"); assert.equal(value, startup); assert.equal(selectedEngine, engine); assert.equal(selectedGeneration, generation); return selectedSource;
      }, assertCurrentSchematicRenameWriterOwner: (value: unknown, selectedEngine: unknown): unknown => {
        assert.ok(current, "original writer expired"); assert.equal(value, owner); assert.equal(selectedEngine, engine); return writer;
      }, input });
    runInContext(program, sandbox);
    return { run: async (overrides = {}): Promise<Bag> => { sandbox["selectedInput"] = { ...input, ...overrides };
      return bag(await runInContext("prepareCurrentSchematicRenameClock(selectedInput)", sandbox));
    }, original: (plan, selectedOwner = owner, selectedStartup = startup): Bag => {
      sandbox["selectedPlan"] = plan; sandbox["selectedOwner"] = selectedOwner; sandbox["selectedStartup"] = selectedStartup;
      return bag(runInContext("assertOriginalCurrentSchematicRenameClock(selectedPlan,input.engine,input.generation,selectedStartup,selectedOwner)", sandbox));
    }, invalidate(): void { current = false; } };
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
void test("SCH clock rejects caller age authority, input getters and Proxy traps", async context => {
  const fixture = await setup(context); let traps = 0;
  const trap = (): never => { traps += 1; throw new Error("unexpected trap"); };
  for (const documentBefore of [new Proxy(document(), { get: trap, ownKeys: trap, getPrototypeOf: trap }),
    Object.defineProperty(document(), "serverTimeMs", { get: trap })]) {
    await assert.rejects(fixture.make().run({ documentBefore }));
  }
  await assert.rejects(fixture.make().run({ agedHead: { createdAtLiteral: "2000-01-01 00:00:00" } }), /fields/u); assert.equal(traps, 0);
});
void test("SCH clock refuses unlocked heads and historical actor strings differing from the observed UI actor", async context => {
  const unlocked = await setup(context, `UPDATE "${HISTORY_TABLE}" SET is_lock=0`);
  await assert.rejects(unlocked.make().run(), /independently bound native head age/u);
  const actor = await setup(context, "UPDATE users SET username='other-user'");
  await assert.rejects(actor.make().run(), /Historical SQL actor strings/u);
});
