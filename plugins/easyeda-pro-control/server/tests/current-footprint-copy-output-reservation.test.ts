/** Original synthetic SQLite plans and actual byte/slot preflight. No EasyEDA,
 * native owner, filesystem publication or whole-writer reservation is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyOutputLedger, assertCurrentFootprintCopyOutputHeadroom,
  reserveCurrentFootprintCopyOutput } from "../src/current-footprint-copy-output-reservation.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { currentFootprintCopyV2Before, prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { prepareCurrentFootprintCopyV2SqlPlan } from "../src/current-footprint-copy-v2-sql.ts";
import { requireCurrentFootprintCopyForwardOutput, reserveCurrentFootprintCopyForwardOutput } from "../src/current-footprint-copy-forward-capacity.ts";
import { CurrentFootprintCopyExecutionCoordinator, CurrentFootprintCopyExecutionOwner } from "../src/current-footprint-copy-execution-runtime.ts";
import type { CurrentFootprintCopyExecutionNative } from "../src/current-footprint-copy-execution-runtime.ts";
import { CurrentFootprintCopyTransactionClockEvents } from "../src/current-footprint-copy-transaction-clock-events.ts";
import { IDS, WITNESS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target };
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" }, CLIENT = "a".repeat(16);
const META = { title: "Source", description: "Preserve Ω", tags: ["tag"], source: "source-reference" };
const SQL_WITNESS = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: CLIENT, preDispatchMaxTicket: 100,
  documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
  backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs,
  backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes });
function head(ticket: number): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT,
    uuid: IDS.target, updateTime: 300, version: "300", editVersion: "3.2.209", user: ACTOR })}`;
}
async function plans(): Promise<Readonly<{
  copy: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>;
  sql: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SqlPlan>>;
}>> {
  const created = await fixture();
  const metadata = `${JSON.stringify({ type: "META", ticket: 90, id: "META" })}||${JSON.stringify(META)}`;
  const pad = '{"type":"PAD","ticket":90,"id":"pad"}||{"number":"1", "x":10}';
  const raw = [`{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: 1 })}`, head(100), metadata, pad].join("|\n");
  mutate(created.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(created.path), source = await prepareCurrentFootprintSourcePlan(before, SOURCE);
  const content = [head(101), metadata, head(100), pad].join("|\n");
  const copy = await prepareCurrentFootprintCopyV2Plan(before, source, { client: CLIENT, content });
  const sql = await prepareCurrentFootprintCopyV2SqlPlan({ before, copyPlan: copy, witness: SQL_WITNESS });
  return { copy, sql };
}

void test("output preflight binds original SQL/copy plans and accounts distinct escaped records", async () => {
  const { copy, sql } = await plans(), reservation = reserveCurrentFootprintCopyOutput(copy, sql);
  assert.equal(reservation.slots["create-frame"].bytes, 4_198_400);
  assert.equal(reservation.slots["create-result"].bytes, 2_097_152);
  assert.equal(reservation.slots["rejected-frame"].count, 1);
  assert.equal(reservation.slots["rejected-frame"].bytes, 4 * Math.ceil(4_198_400 / 3) + 65_536);
  assert.equal(reservation.slots["closed-sql"].bytes, sql.maximumEncodedSqlBytes);
  assert.equal(reservation.slots["journal-control"].count + reservation.slots["journal-create"].count +
    reservation.slots["journal-saved"].count + reservation.slots["journal-clock-failure"].count, 32);
  assert.equal(reservation.slots["saved-state"].count, 4);
  assert.equal(reservation.slots["journal-create"].bytes, 5 * 2_097_152 + 65_536);
  assert.equal(reservation.retainedBytes, reservation.artifactBytes + reservation.journalBytes);
  assert.equal(reservation.wholeWriterOutputReserved, false); assert.equal(reservation.helperStdoutReserved, false);
  assert.equal(reservation.nativeRequestsReserved, false); assert.equal(reservation.executionAuthorized, false);
  assertCurrentFootprintCopyOutputHeadroom(reservation, reservation.artifactBytes, reservation.journalBytes);
  assert.throws(() => { assertCurrentFootprintCopyOutputHeadroom(reservation, reservation.artifactBytes - 1, reservation.journalBytes); }, /HEADROOM/u);
  assert.throws(() => { assertCurrentFootprintCopyOutputHeadroom(reservation, reservation.artifactBytes, reservation.journalBytes - 1); }, /HEADROOM/u);
  assert.throws(() => reserveCurrentFootprintCopyOutput(structuredClone(copy), sql), /original/u);
  assert.throws(() => reserveCurrentFootprintCopyOutput(copy, structuredClone(sql)), /original/u);
  assert.throws(() => new CurrentFootprintCopyOutputLedger(structuredClone(reservation)), /ORIGINAL_RESERVATION/u);
  const forward = reserveCurrentFootprintCopyForwardOutput(copy, sql); requireCurrentFootprintCopyForwardOutput(forward);
  assert.throws(() =>{  requireCurrentFootprintCopyForwardOutput(reservation); }, /ORIGINAL_OUTPUT/u);
  assert.throws(() =>{  requireCurrentFootprintCopyForwardOutput(structuredClone(forward)); }, /ORIGINAL_OUTPUT/u);
  for (const value of [-0, -1, Number.NaN, Infinity, "1000000000", {}]) {
    assert.throws(() => { assertCurrentFootprintCopyOutputHeadroom(reservation, value, reservation.journalBytes); }, /HEADROOM_SCALAR/u);
  }
});

void test("output ledger consumes original slots before decoding and retains malformed or late raw text", async () => {
  const { copy, sql } = await plans(), ledger = new CurrentFootprintCopyOutputLedger(reserveCurrentFootprintCopyOutput(copy, sql));
  const frame = ledger.begin("create-frame"), result = ledger.begin("create-result");
  assert.equal(ledger.status().pending, 2);
  const malformed = '{"id":1,"result":';
  ledger.retain(frame, malformed);
  assert.equal(ledger.retained(frame), malformed);
  assert.throws(() => JSON.parse(ledger.retained(frame)));
  assert.throws(() => ledger.retain({ ...frame }, "{}"), /ORIGINAL_SLOT/u);
  assert.throws(() => ledger.retain(frame, "{}"), /ORIGINAL_SLOT/u);
  assert.throws(() => ledger.begin("create-frame"), /SLOT_EXHAUSTED/u);
  assert.equal(ledger.status().failed, true);
  // Failure cannot discard an already written original request's later reply.
  ledger.retain(result, '{"success":false,"result":"late original"}');
  assert.equal(ledger.status().pending, 0); assert.equal(ledger.status().retained, 2);
  assert.throws(() => ledger.begin("saved-packet"), /SLOT_CLASS/u);
  const cleanup = ledger.beginCleanup("journal-control"); ledger.retain(cleanup, '{"originalCloseIntent":true}');
  const closed = ledger.beginCleanup("closed-sql"); ledger.retain(closed, '{"closedSnapshot":true}');
  assert.throws(() => ledger.begin("create-result"), /SLOT_CLASS/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately cross the internal cleanup vocabulary; no native callback is involved.
  assert.throws(() => ledger.beginCleanup("create-result" as "journal-control"), /CLEANUP_CLASS/u);
  assert.equal(ledger.status().failed, true); assert.equal(ledger.status().slotsConsumed, 4);
});

void test("UTF8 size and failed output consume publication once without invoking object hooks", async () => {
  const { copy, sql } = await plans(), reservation = reserveCurrentFootprintCopyOutput(copy, sql);
  const ledger = new CurrentFootprintCopyOutputLedger(reservation);
  const raw = ledger.begin("create-result"), saved = ledger.begin("saved-observation");
  const maximum = reservation.slots["saved-observation"].bytes;
  const unicode = "Ω".repeat(Math.floor(maximum / 2) + 1);
  assert.ok(unicode.length <= maximum && Buffer.byteLength(unicode) > maximum);
  let publications = 0;
  const publish = (): void => { ledger.retain(saved, unicode); publications += 1; };
  assert.throws(publish, /SLOT_BYTES/u); assert.equal(publications, 0);
  assert.throws(() => ledger.retain(saved, "{}"), /ORIGINAL_SLOT/u);
  let traps = 0;
  const object = new Proxy({}, { get(): never { traps += 1; throw new Error("hook"); } });
  assert.throws(() => ledger.retain(raw, object), /PRIMITIVE_UTF8/u);
  assert.equal(traps, 0); assert.equal(ledger.status().pending, 0); assert.equal(ledger.status().slotsConsumed, 2);
  assert.equal(ledger.status().retained, 0); assert.equal(ledger.status().failed, true);
});

void test("actual coordinator callbacks charge publication before sending and retain cleanup after output refusal", async () => {
  const { copy } = await plans(), before = currentFootprintCopyV2Before(copy), terminated = Object.freeze({});
  const clocks = new CurrentFootprintCopyTransactionClockEvents(Object.freeze({ scriptId: "script", managerObjectId: "manager",
    lexicalBundleObjectId: "lexicals", workerSessionId: "worker", assertOriginal: (): Promise<void> => Promise.resolve(),
    assertCleanup: (): void => { assert.ok(true); }, assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    request: (): Promise<unknown> => Promise.reject(new Error("synthetic arm stop")),
    subscribe: (): (() => void) => (): void => { assert.ok(true); },
  }));
  const published: string[] = [], qualification = Object.freeze({ copyPlan: copy, witness: SQL_WITNESS, clocks });
  let closes = 0, creates = 0, releases = 0;
  const native: CurrentFootprintCopyExecutionNative = Object.freeze({
    generation: Object.freeze({ profile: "private.current-footprint-copy-execution-generation.v1",
      purpose: "worker-startup-footprint-copy209", operationId: "footprint-copy-output-synthetic", bindingSha256: "a".repeat(64) }),
    nativeGeneration: Object.freeze({}), assertOwned: (): void => { assert.ok(true); }, qualify: () => Promise.resolve(qualification),
    requireQualification: (original: object) => { assert.equal(original, qualification); return Promise.resolve(); },
    publish: (phase: string) => { published.push(phase); return Promise.resolve(); },
    create: () => { creates += 1; return Promise.reject(new Error("create must not execute")); },
    close: () => { closes += 1; return Promise.resolve("x".repeat(262_144)); },
    termination: () => Promise.resolve({ status: "terminated", original: terminated } as const),
    requireTermination: (original: object) => { assert.equal(original, terminated); return Promise.resolve(); },
    snapshot: (original: object) => { assert.equal(original, terminated); return Promise.resolve(before); },
    verifyClockClosure: () => Promise.reject(new Error("failed work has no clocks")),
    release: (original: object) => { assert.equal(original, terminated); releases += 1; return Promise.resolve(); },
    observeRelease: () => Promise.resolve("released" as const),
    verification: (): never => { throw new Error("failed work must not allocate verification"); },
  });
  const runner = new CurrentFootprintCopyExecutionCoordinator(new CurrentFootprintCopyExecutionOwner(native));
  await assert.rejects(runner.advance({ expectedPhase: "prepare" }), /synthetic arm stop/u);
  assert.deepEqual(published, ["prepared"]); assert.equal(runner.status().output?.retained, 1);
  await assert.rejects(runner.advance({ expectedPhase: "close-writer" }), /SLOT_BYTES/u);
  assert.deepEqual(published, ["prepared", "clock-cleanup-failed", "writer-close-intent"]);
  assert.equal(runner.status().output?.failed, true); assert.equal(closes, 1);
  await runner.advance({ expectedPhase: "observe-writer-exit" });
  await runner.advance({ expectedPhase: "release-writer" });
  assert.equal(published.at(-1), "writer-closed-without-continuation");
  assert.equal(runner.status().phase, "failed-closed"); assert.equal(runner.status().cleanupPending, false);
  assert.equal(runner.status().output?.failed, true); assert.equal(creates, 0); assert.equal(closes, 1); assert.equal(releases, 1);
});
