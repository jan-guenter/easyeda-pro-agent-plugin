import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { decodeRawHistoryForOriginalCurrentSymbolSqlPlan, metadataPlanForOriginalCurrentSymbolSqlPlan, prepareCurrentSymbolNewHeadSqlPlan, prepareSymbolNewHeadSqlPlan, verifyCurrentSymbolNewHeadSqlEffect, verifySymbolNewHeadSqlEffect } from "../src/symbol-sql-comparator.ts";
import type { CurrentSymbolNewHeadSqlPlan, CurrentSymbolSqlWitness, SymbolNewHeadSqlPlan } from "../src/symbol-sql-comparator.ts";
import { HISTORY_TABLE, IDS, OPERATION, TIMES, WITNESS, applyEffect, encrypted, expectedRaw, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const DOCUMENT_TIME = TIMES.document - 120_000;
const CURRENT_WITNESS: CurrentSymbolSqlWitness = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor,
  client: WITNESS.client, preDispatchMaxTicket: WITNESS.preDispatchMaxTicket, documentClockMinMs: DOCUMENT_TIME - 500,
  documentClockMaxMs: DOCUMENT_TIME + 500, backendClockMinMs: WITNESS.serverClockMinMs,
  backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes });
function currentRaw(): string {
  return expectedRaw().replace('"editVersion":"3.0"', '"editVersion":"3.2.206"').replaceAll(String(TIMES.document), String(DOCUMENT_TIME));
}
function replaceNewChunk(path: string, raw: string): void {
  mutate(path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.newHead, IDS.newKey)}' WHERE id=12`);
}

void test("current SQL profile admits version transition and disjoint clocks without granting provenance", async () => {
  const input = await fixture();
  const current = await prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: CURRENT_WITNESS });
  const legacy = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  assert.equal(current.expectedDocumentEditVersion, "3.2.206");
  assert.equal(current.executionAuthorized, false); assert.equal(current.producerBindingVerified, false);
  applyEffect(input.path, currentRaw()); const after = await inventory(input.path);
  const proof = await verifyCurrentSymbolNewHeadSqlEffect(current, after);
  assert.equal(proof["profile"], "easyeda-pro-control.current-symbol-new-head-full-sql-effect.v1");
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["expectedTicket"], 101);
  for (const key of ["executionAuthorized", "producerBindingVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"]) {
    assert.equal(proof[key], false);
  }
  await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(structuredClone(current), after), /original prepared/u);
  await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(current, structuredClone(after)), /original inventory/u);
  await assert.rejects(prepareCurrentSymbolNewHeadSqlPlan({ before: structuredClone(input.before), operation: OPERATION, witness: CURRENT_WITNESS }), /original inventory/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately cross the static profile boundary to prove runtime issuer rejection.
  await assert.rejects(verifySymbolNewHeadSqlEffect(current as unknown as SymbolNewHeadSqlPlan, after), /original prepared/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The opposite cross-profile object must also fail before SQL comparison.
  await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(legacy as unknown as CurrentSymbolNewHeadSqlPlan, after), /original prepared/u);
  await assert.rejects(verifySymbolNewHeadSqlEffect(legacy, after), /timestamp|exact intended raw/u);
  mutate(input.path, "UPDATE resources SET dataStr='unrelated change'");
  await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(current, await inventory(input.path)), /resources/u);
});

void test("current SQL profile permits an absent baseline editVersion while preserving old ciphertext", async () => {
  const input = await fixture(); const data = input.before.tables.find((entry) => entry.name === "history_data");
  assert.ok(data);
  const cell = data.rows[0]?.cells[data.columns.findIndex((column) => column["name"] === "dataStr")];
  assert.equal(cell?.kind, "text"); assert.ok(cell?.kind === "text");
  const raw = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(cell.hex, "hex").toString("utf8") });
  const baseline = encrypted(raw.replaceAll(',"editVersion":"3.0"', ""), IDS.oldHead, IDS.oldKey);
  mutate(input.path, `UPDATE history_data SET dataStr='${baseline}' WHERE id=7`);
  const plan = await prepareCurrentSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: CURRENT_WITNESS });
  applyEffect(input.path, currentRaw());
  const proof = await verifyCurrentSymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["exactLogicalSqlEffect"], true);
  mutate(input.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE id=7`);
  await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(plan, await inventory(input.path)), /history_data/u);
});

void test("current SQL profile requires exact current DOCHEAD version, field order and omitted user", async () => {
  const input = await fixture();
  const plan = await prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: CURRENT_WITNESS });
  applyEffect(input.path, currentRaw());
  for (const raw of [
    currentRaw().replace('"editVersion":"3.2.206"', '"editVersion":"3.0"'),
    currentRaw().replace(',"editVersion":"3.2.206"', ""),
    currentRaw().replace('"editVersion":"3.2.206"', '"editVersion":"3.2.207"'),
    currentRaw().replace('"version":', '"user":{},"version":'),
    currentRaw().replace('"type":"DOCHEAD","ticket":101', '"ticket":101,"type":"DOCHEAD"'),
  ]) {
    replaceNewChunk(input.path, raw);
    await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(plan, await inventory(input.path)), /exact intended raw/u);
  }
});

void test("current SQL comparison never unions document and backend clock intervals", async () => {
  const input = await fixture();
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A JavaScript caller can supply a numeric value whose decimal text matches the client regex.
  const malformed = { ...CURRENT_WITNESS, client: 1_234_567_890_123_456 } as unknown as CurrentSymbolSqlWitness;
  await assert.rejects(prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: malformed }), /identity witness/u);
  const plan = await prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: CURRENT_WITNESS });
  applyEffect(input.path, currentRaw());
  for (const raw of [currentRaw().replaceAll(String(DOCUMENT_TIME), String(TIMES.document)),
    currentRaw().replace(String(TIMES.edit), String(DOCUMENT_TIME))]) {
    replaceNewChunk(input.path, raw);
    await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(plan, await inventory(input.path)), /timestamp.*clock witness/u);
  }
  replaceNewChunk(input.path, currentRaw());
  mutate(input.path, "UPDATE history_data SET created_at='2026-10-12 12:32:56',updated_at='2026-10-12 12:32:56' WHERE id=12");
  await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(plan, await inventory(input.path)), /SQL timestamp.*clock witness/u);
  for (const witness of [
    { ...CURRENT_WITNESS, documentClockMinMs: -0 },
    { ...CURRENT_WITNESS, documentClockMaxMs: Number.MAX_SAFE_INTEGER + 1 },
    { ...CURRENT_WITNESS, backendClockMaxMs: CURRENT_WITNESS.backendClockMinMs - 1 },
    { ...CURRENT_WITNESS, backendClockMaxMs: CURRENT_WITNESS.backendClockMinMs + 60_001 },
  ]) {
    await assert.rejects(prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness }), /clock bounds/u);
  }
});

void test("current aged-head selection uses backend bounds even when document time is earlier", async () => {
  const input = await fixture();
  mutate(input.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-10-12 12:33:55' WHERE id=5`);
  const before = await inventory(input.path); const agedHead = { createdAtLiteral: "2026-10-12 12:33:55",
    nativeParsedLocalMs: Date.parse("2026-10-12T10:33:55Z"), nativeTimezoneOffsetMinutes: -120 };
  const witness = { ...CURRENT_WITNESS, agedHead };
  const plan = await prepareCurrentSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness });
  assert.equal(plan.headEligibility, "aged-unlocked");
  applyEffect(input.path, currentRaw());
  const proof = await verifyCurrentSymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["exactLogicalSqlEffect"], true);
  await assert.rejects(prepareCurrentSymbolNewHeadSqlPlan({ before, operation: OPERATION,
    witness: { ...witness, backendClockMinMs: witness.backendClockMinMs - 1 } }), /every possible/u);
});

void test("legacy SQL plan and effect retain their old header contract and result profile", async () => {
  const input = await fixture();
  const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  const current = await prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION,
    witness: { ...CURRENT_WITNESS, documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs } });
  assert.equal(plan.profile, "easyeda-pro-control.symbol-new-head-sql-plan.v1");
  assert.equal(Object.hasOwn(plan, "expectedDocumentEditVersion"), false);
  applyEffect(input.path);
  const after = await inventory(input.path), proof = await verifySymbolNewHeadSqlEffect(plan, after);
  assert.equal(proof["profile"], "easyeda-pro-control.symbol-new-head-full-sql-effect.v1");
  assert.equal(proof["exactLogicalSqlEffect"], true);
  await assert.rejects(verifyCurrentSymbolNewHeadSqlEffect(current, after), /exact intended raw/u);
});

void test("current original-plan history decoder retains complete post-edit history and rejects copied or legacy authority", async () => {
  const input = await fixture();
  const plan = await prepareCurrentSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: CURRENT_WITNESS });
  const legacy = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  await assert.rejects(decodeRawHistoryForOriginalCurrentSymbolSqlPlan(plan, input.before), /maximum differs/u);
  applyEffect(input.path, currentRaw()); const after = await inventory(input.path);
  await verifyCurrentSymbolNewHeadSqlEffect(plan, after);
  const decoded = await decodeRawHistoryForOriginalCurrentSymbolSqlPlan(plan, after);
  assert.equal(decoded.maximumTicket, plan.expectedTicket); assert.equal(decoded.history.projectUuid, IDS.project);
  assert.equal(decoded.chunks.at(-1), currentRaw()); assert.equal(decoded.links.length, decoded.chunks.length);
  const metadata = metadataPlanForOriginalCurrentSymbolSqlPlan(plan);
  assert.equal(metadata.targetUuid, plan.targetUuid); assert.ok(Object.isFrozen(metadata) && Object.isFrozen(metadata.beforeTags));
  await assert.rejects(decodeRawHistoryForOriginalCurrentSymbolSqlPlan(structuredClone(plan), after), /original prepared/u);
  await assert.rejects(decodeRawHistoryForOriginalCurrentSymbolSqlPlan(legacy, after), /original prepared/u);
  await assert.rejects(decodeRawHistoryForOriginalCurrentSymbolSqlPlan(plan, structuredClone(after)), /original inventory/u);
  assert.throws(() => metadataPlanForOriginalCurrentSymbolSqlPlan(legacy), /original prepared/u);
});
