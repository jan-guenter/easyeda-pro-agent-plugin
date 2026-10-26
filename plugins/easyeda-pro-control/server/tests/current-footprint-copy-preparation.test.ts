/** Synthetic complete SQL and hostile host objects. No native owner, writer
 * dispatch, connected footprint sample or lifecycle issuance is simulated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintCopyV2NativeCreateArguments } from "../src/current-footprint-copy-v2-native-arguments.ts";
import { reserveCurrentFootprintCopyV2Capacity } from "../src/current-footprint-copy-v2-capacity.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { assertCurrentFootprintCopyV2SqlInputs, prepareCurrentFootprintCopyV2SqlPlan } from "../src/current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyOwned, requireCurrentFootprintCopyOwned } from "../src/current-footprint-copy-preparation-runtime.ts";
import { CurrentPcb209WorkerStartupOpening } from "../src/current-pcb-209-worker-startup-opening.ts";
import { IDS, WITNESS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16);
const SOURCE = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
const ACTOR = Object.freeze({ uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: "" });
function row(type: string, ticket: number, id: string, body: object): string {
  return `${JSON.stringify({ type, ticket, id })}||${JSON.stringify(body)}`;
}
function head(ticket: number): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT,
    uuid: IDS.target, updateTime: 100, version: "100", editVersion: "3.2.209", user: ACTOR })}`;
}
async function prepared(description = String.raw`Preserve "quotes", \paths and Ω`): Promise<Readonly<{
  before: Awaited<ReturnType<typeof inventory>>;
  sourcePlan: Awaited<ReturnType<typeof prepareCurrentFootprintSourcePlan>>;
  copy: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>;
  sql: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SqlPlan>>;
}>> {
  const db = await fixture();
  const metadata = { title: "Footprint", description, tags: ["a\"b", String.raw`c\d`], source: "source:retained" };
  const pad = row("PAD", 99, "pad", { number: "1", unknown: "\0\t\n" });
  const raw = [head(100), row("META", 90, "META", metadata), pad].join("|\n");
  mutate(db.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(db.path), sourcePlan = await prepareCurrentFootprintSourcePlan(before, SOURCE);
  const content = [head(101), row("META", 99, "META", metadata), head(100), pad].join("|\n");
  const copy = await prepareCurrentFootprintCopyV2Plan(before, sourcePlan, { client: CLIENT, content });
  const sql = await prepareCurrentFootprintCopyV2SqlPlan({ before, copyPlan: copy, witness: {
    projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: CLIENT, preDispatchMaxTicket: 100,
    documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
    backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs,
    backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes,
  } });
  return { before, sourcePlan, copy, sql };
}

void test("copy-v2 native arguments preserve source selection and copied metadata while reserving both replay envelopes", async () => {
  const f = await prepared(); const args = currentFootprintCopyV2NativeCreateArguments(f.copy);
  assert.deepEqual(args, { createArgument: { uuid: IDS.target, path: IDS.project, isProject: true, docType: 4,
    title: "Footprint_1", display_title: "Footprint_1", description: f.copy.sourceMetadata.description,
    custom_tags: '["a\\\"b","c\\\\d"]', source: "", version: "" }, expectedProjectUuid: IDS.project });
  assert.equal(Object.isFrozen(args), true); assert.equal(Object.isFrozen(args.createArgument), true);
  const capacity = reserveCurrentFootprintCopyV2Capacity(f.copy, f.sql);
  assert.equal(capacity.maximumSavedContentBytes, Math.max(f.sql.maximumSavedRawSourceBytes, f.sql.maximumSavedCacheSourceBytes));
  assert.ok(capacity.nativeArgumentsStringBytes > capacity.nativeArgumentsJsonBytes);
  assert.equal(capacity.retainedDestinationUuidJsonBytes, 18); assert.equal(capacity.nativeReturnedResultReserved, false);
  assert.equal(capacity.sourceObservationRequests, 65); assert.equal(capacity.savedObservationRequests, 65);
  assert.equal(capacity.cleanupRequestsPerGeneration, 32);
  assert.equal(capacity.wholeLaunchBudgetReserved, false); assert.equal(capacity.nativeWriterCommandReserved, false);
  assert.equal(capacity.journalPublicationReserved, false); assert.equal(capacity.executionAuthorized, false);
});

void test("copy-v2 capacity refuses cloned and substituted original plans and escaped oversize arguments", async () => {
  const f = await prepared(), other = await prepared();
  assertCurrentFootprintCopyV2SqlInputs(f.sql, f.copy, f.before);
  for (const [sql, copy, before] of [[structuredClone(f.sql), f.copy, f.before], [f.sql, structuredClone(f.copy), f.before],
    [f.sql, f.copy, structuredClone(f.before)], [f.sql, other.copy, f.before]] as const) {
    assert.throws(() => { assertCurrentFootprintCopyV2SqlInputs(sql, copy, before); }, /original/u);
  }
  assert.throws(() => currentFootprintCopyV2NativeCreateArguments(structuredClone(f.copy)), /original/u);
  assert.throws(() => reserveCurrentFootprintCopyV2Capacity(f.copy, other.sql), /original/u);
  const oversized = await prepared("\0".repeat(12_000));
  assert.throws(() => reserveCurrentFootprintCopyV2Capacity(oversized.copy, oversized.sql), /argument encoding/u);
});

void test("owned footprint preparation rejects forged private owners before reading packet accessors and consumes refusal", async () => {
  const f = await prepared(); let calls = 0;
  const opening: unknown = Object.create(CurrentPcb209WorkerStartupOpening.prototype);
  Object.defineProperty(opening, "requireFootprintSource", { value: async (): Promise<void> => { calls += 1; await Promise.resolve(); } });
  const packet = Object.defineProperty({}, "content", { get(): string { calls += 1; return "untrusted"; }, enumerable: true });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately forged class/packet references must fail the captured private-field method before evaluating their contents.
  const source = Object.freeze({ opening, result: {}, assignments: {}, state: {}, sourcePlan: f.sourcePlan, source: packet, before: f.before }) as Parameters<typeof prepareCurrentFootprintCopyOwned>[0];
  await assert.rejects(prepareCurrentFootprintCopyOwned(source), /private|class|object/u);
  assert.equal(calls, 0);
  await assert.rejects(prepareCurrentFootprintCopyOwned(source), /consumed/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- No public-shaped descriptor may retrieve private owned preparation inputs.
  const forged = Object.freeze({ profile: "private.current-footprint-copy-owned-preparation.v1" }) as Parameters<typeof requireCurrentFootprintCopyOwned>[0];
  await assert.rejects(requireCurrentFootprintCopyOwned(forged, source.opening), /original preparation/u);
});

void test("owned footprint preparation rejects proxy and accessor wrappers without running their traps", async () => {
  const f = await prepared(); let calls = 0;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Invalid input is intentional; top-level descriptor capture must reject before the native owner or supplied getters can run.
  const source = Object.freeze({ opening: {}, result: {}, assignments: {}, state: {}, sourcePlan: f.sourcePlan, source: {}, before: f.before }) as Parameters<typeof prepareCurrentFootprintCopyOwned>[0];
  const proxy = new Proxy(source, { getPrototypeOf(): object { calls += 1; return Object.prototype; } });
  await assert.rejects(prepareCurrentFootprintCopyOwned(proxy), /fixed original/u);
  const accessor = Object.freeze(Object.defineProperty({ ...source }, "source", { get(): object { calls += 1; return {}; } }));
  await assert.rejects(prepareCurrentFootprintCopyOwned(accessor), /data references/u);
  assert.equal(calls, 0);
});
