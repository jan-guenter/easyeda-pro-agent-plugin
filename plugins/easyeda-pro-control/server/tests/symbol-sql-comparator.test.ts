import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers";
import { prepareSymbolNewHeadSqlPlan, verifySymbolNewHeadSqlEffect } from "../src/symbol-sql-comparator.ts";
import { HISTORY_TABLE, IDS, OPERATION, TIMES, WITNESS, applyEffect, encrypted, expectedRaw, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("exact native-source SQL projection updates all duplicate branch structures without authorizing execution", async () => {
  const input = await fixture();
  mutate(input.path, `INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures;
    INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) VALUES(99,'${IDS.project}','${IDS.start}','{"untouched":true}')`);
  const plan = await prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: WITNESS });
  applyEffect(input.path); const after = await inventory(input.path); const proof = await verifySymbolNewHeadSqlEffect(plan, after);
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["headEligibility"], "locked");
  assert.equal(proof["newHistoryId"], "6"); assert.equal(proof["newChunkId"], "12"); assert.equal(proof["expectedTicket"], 101);
  for (const key of ["executionAuthorized", "producerBindingVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"]) { assert.equal(proof[key], false); }
  await assert.rejects(verifySymbolNewHeadSqlEffect(structuredClone(plan), after), /original prepared/u);
  await assert.rejects(verifySymbolNewHeadSqlEffect(plan, structuredClone(after)), /original inventory/u);
  mutate(input.path, "UPDATE project_structures SET ticket=100 WHERE id=2");
  await assert.rejects(verifySymbolNewHeadSqlEffect(plan, await inventory(input.path)), /project_structures/u);
});

void test("native local 64-hex project ID is admitted without widening branch or actor identities", async () => {
  const input = await fixture(); const projectUuid = "ab".repeat(32);
  mutate(input.path, `UPDATE projects SET uuid='${projectUuid}'; UPDATE branches SET project_uuid='${projectUuid}'; UPDATE project_structures SET project_uuid='${projectUuid}'; UPDATE project_images SET project_uuid='${projectUuid}'`);
  const before = await inventory(input.path); const operation = { ...OPERATION, libraryUuid: projectUuid }; const witness = { ...WITNESS, projectUuid };
  const plan = await prepareSymbolNewHeadSqlPlan({ before, operation, witness });
  applyEffect(input.path); const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["executionAuthorized"], false);
  for (const key of ["branchUuid", "actorUuid"] as const) {
    await assert.rejects(prepareSymbolNewHeadSqlPlan({ before, operation, witness: { ...witness, [key]: "ab".repeat(32) } }), /Native identity/u);
  }
});

void test("project ID grammar still rejects noncanonical, truncated and overlong identities", async () => {
  const input = await fixture();
  for (const projectUuid of ["", "a".repeat(31), "a".repeat(33), "a".repeat(63), "a".repeat(65), "A".repeat(64), "g".repeat(64), `${IDS.project}\n`, `../${IDS.project}`]) {
    await assert.rejects(prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: { ...WITNESS, projectUuid } }), /Native identity/u);
  }
});

for (const [name, sql] of [
  ["peer resource", "UPDATE resources SET dataStr='changed'"],
  ["peer image", "UPDATE project_images SET url='changed'"],
  ["inherited history", `UPDATE "${HISTORY_TABLE}" SET updated_at='changed' WHERE id=5`],
  ["old chunk", "UPDATE history_data SET dataStr='changed' WHERE id=7"],
  ["old rowid", "UPDATE history_data SET id=8 WHERE id=7"],
  ["new history id", `UPDATE "${HISTORY_TABLE}" SET id=9 WHERE id=6`],
  ["new chunk id", "UPDATE history_data SET id=13 WHERE id=12"],
  ["new history parent", `UPDATE "${HISTORY_TABLE}" SET parent=NULL WHERE id=6`],
  ["new snapshot", `UPDATE "${HISTORY_TABLE}" SET snapshot='unexpected' WHERE id=6`],
  ["new snapshot num", `UPDATE "${HISTORY_TABLE}" SET snapshot_num=1 WHERE id=6`],
  ["new lock", `UPDATE "${HISTORY_TABLE}" SET is_lock=1 WHERE id=6`],
  ["new num", `UPDATE "${HISTORY_TABLE}" SET num=1 WHERE id=6`],
  ["new lock time", `UPDATE "${HISTORY_TABLE}" SET lock_time='1970-01-01 00:00:00' WHERE id=6`],
  ["head default mismatch", `UPDATE "${HISTORY_TABLE}" SET updated_at='2026-10-12 12:34:59' WHERE id=6`],
  ["chunk default mismatch", "UPDATE history_data SET updated_at='2026-10-12 12:34:58' WHERE id=12"],
  ["chunk clock outside witness", "UPDATE history_data SET created_at='2026-10-12 12:35:01' WHERE id=12"],
  ["ciphertext authentication", "UPDATE history_data SET dataStr='AAAA' WHERE id=12"],
  ["head/chunk association", `UPDATE history_data SET history_uuid='${IDS.oldHead}' WHERE id=12`],
  ["branch association", `UPDATE branches SET history_uuid='${IDS.oldHead}'`],
  ["unrequested branch timestamp", "UPDATE branches SET updated_at='unexpected'"],
  ["project modifier", `UPDATE projects SET modifier_uuid='${IDS.peer}'`],
  ["project time timezone", "UPDATE projects SET updated_at='2026-10-12 12:34:59'"],
  ["project title", "UPDATE projects SET name='unexpected'"],
  ["actor username row", "UPDATE users SET username='unexpected'"],
  ["database version row", "UPDATE db_versions SET value='unexpected'"],
  ["branch node state", "UPDATE branches SET node=1"],
  ["structure owner", `UPDATE project_structures SET project_uuid='${IDS.peer}'`],
  ["structure ticket", "UPDATE project_structures SET ticket=102"],
  ["structure bytes", "UPDATE project_structures SET structure='{}'"],
  ["history_data sequence", "UPDATE sqlite_sequence SET seq=13 WHERE name='history_data'"],
  ["peer sequence", "UPDATE sqlite_sequence SET seq=9 WHERE name='project_structures'"],
  ["invented dynamic sequence", `INSERT INTO sqlite_sequence VALUES('${HISTORY_TABLE}',6)`],
  ["duplicate structure", "INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures"],
  ["extra chunk", `INSERT INTO history_data(uuid,history_uuid,dataStr) VALUES('unexpected','${IDS.newHead}','AAAA')`],
  ["schema", "CREATE INDEX extra_index ON projects(name)"],
  ["trigger", "CREATE TRIGGER extra_trigger AFTER UPDATE ON projects BEGIN SELECT 1; END"],
  ["pragma", "PRAGMA user_version=7"],
] as const) {
  void test(`complete SQL projection rejects ${name}`, async () => {
    const input = await fixture(); const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
    applyEffect(input.path); mutate(input.path, sql); const after = await inventory(input.path);
    await assert.rejects(verifySymbolNewHeadSqlEffect(plan, after));
  });
}

for (const [name, transform] of [
  ["extra raw record", (raw: string): string => `${raw}|\n{"type":"EDIT_HEAD"}||{}`],
  ["duplicate upload", (raw: string): string => `${raw}|\n${raw}`],
  ["wrong META title", (raw: string): string => raw.replace(OPERATION.patch.name, "unrequested")],
  ["wrong target", (raw: string): string => raw.replace(IDS.target, IDS.peer)],
  ["wrong client", (raw: string): string => raw.replace(WITNESS.client, "b".repeat(16))],
  ["wrong actor", (raw: string): string => raw.replace(IDS.actor, IDS.peer)],
  ["wrong nickname", (raw: string): string => raw.replace('"nickname":"Synthetic"', '"nickname":"Changed"')],
  ["wrong raw ticket", (raw: string): string => raw.replaceAll('"ticket":101', '"ticket":102')],
  ["out-of-window DOCHEAD time", (raw: string): string => raw.replace(String(TIMES.document), String(TIMES.document - 999_999))],
  ["added DOCHEAD user", (raw: string): string => raw.replace('"version":', '"user":{},"version":')],
  ["META source change", (raw: string): string => raw.replace('"source":""', '"source":"foreign"')],
  ["record field order", (raw: string): string => raw.replace('"type":"DOCHEAD","ticket":101', '"ticket":101,"type":"DOCHEAD"')],
] as const) {
  void test(`raw native projection rejects ${name}`, async () => {
    const input = await fixture(); const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
    applyEffect(input.path, transform(expectedRaw())); await assert.rejects(verifySymbolNewHeadSqlEffect(plan, await inventory(input.path)));
  });
}

void test("UUID v4 random fields are constrained observations, not caller-picked expected effects", async () => {
  const input = await fixture(); const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  applyEffect(input.path, expectedRaw(), "123456789abc4defa123456789abcdef", "c".repeat(32));
  const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["exactLogicalSqlEffect"], true);
});
void test("a non-v4 new history UUID is rejected even with valid authenticated intended records", async () => {
  const input = await fixture(); const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  applyEffect(input.path, expectedRaw(), "a".repeat(32));
  await assert.rejects(verifySymbolNewHeadSqlEffect(plan, await inventory(input.path)), /UUID/u);
});
void test("baseline max ticket includes a deleted raw occurrence rather than final materialized records", async () => {
  const input = await fixture();
  mutate(input.path, "UPDATE project_structures SET ticket=2");
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: { ...WITNESS, preDispatchMaxTicket: 2 } }), /complete selected raw history/u);
});
void test("aged unlocked head requires the entire native selection window beyond 61 seconds", async () => {
  const input = await fixture(); mutate(input.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-10-12 12:33:55' WHERE id=5`);
  const before = await inventory(input.path);
  const parsed = Date.parse("2026-10-12T10:33:55Z");
  const agedHead = { createdAtLiteral: "2026-10-12 12:33:55", nativeParsedLocalMs: parsed, nativeTimezoneOffsetMinutes: -120 };
  const witness = { ...WITNESS, agedHead };
  const plan = await prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness });
  assert.equal(plan.headEligibility, "aged-unlocked"); applyEffect(input.path);
  const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["exactLogicalSqlEffect"], true);
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness: { ...witness, serverClockMinMs: WITNESS.serverClockMinMs - 1 } }), /every possible/u);
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness: WITNESS }), /Date\/zone/u);
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness: { ...witness, agedHead: { ...agedHead, createdAtLiteral: "other" } } }), /Date\/zone/u);
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness: { ...witness, agedHead: { ...agedHead, nativeTimezoneOffsetMinutes: 120 } } }), /Date\/zone/u);
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness: { ...witness, agedHead: { ...agedHead, nativeParsedLocalMs: 0 } } }), /bounded timezone/u);
});

for (const [name, sql, failure] of [
  ["deleted selected branch", "UPDATE branches SET delete_status=1", /active root/u],
  ["node branch", "UPDATE branches SET node=1", /active root/u],
  ["ancestor branch", `UPDATE branches SET parent_uuid='${IDS.peer}' WHERE uuid='${IDS.branch}'`, /not unique/u],
  ["renamed start node", "UPDATE branches SET name='version' WHERE name='start'", /terminal empty start/u],
  ["inactive start node", "UPDATE branches SET delete_status=1 WHERE name='start'", /terminal empty start/u],
  ["non-node start", "UPDATE branches SET node=0 WHERE name='start'", /terminal empty start/u],
  ["nonterminal start", `UPDATE branches SET parent_uuid='${IDS.peer}' WHERE name='start'`, /terminal empty start/u],
  ["foreign project start", `UPDATE branches SET project_uuid='${IDS.peer}' WHERE name='start'`, /terminal empty start/u],
  ["history-bearing start", `UPDATE branches SET history_uuid='${IDS.oldHead}' WHERE name='start'`, /terminal empty start/u],
  ["extra start history table", `CREATE TABLE "project_history_${IDS.start}"(id INTEGER PRIMARY KEY)`, /schema/u],
  ["missing chunk", "DELETE FROM history_data", /not unique/u],
  ["missing sequence", "DELETE FROM sqlite_sequence WHERE name='history_data'", /not unique/u],
  ["low sequence", "UPDATE sqlite_sequence SET seq=6 WHERE name='history_data'", /AUTOINCREMENT/u],
  ["unsafe sequence", "UPDATE sqlite_sequence SET seq=9007199254740991 WHERE name='history_data'", /AUTOINCREMENT/u],
  ["unsafe head ID", `UPDATE "${HISTORY_TABLE}" SET id=9007199254740991`, /allocation edge/u],
  ["nonpositive head ID", `UPDATE "${HISTORY_TABLE}" SET id=0`, /positive profile/u],
  ["unsafe chunk ID", "UPDATE history_data SET id=9007199254740991", /allocation edge/u],
  ["snapshot history", `UPDATE "${HISTORY_TABLE}" SET snapshot='unexpected'`, /snapshots/u],
  ["cyclic history", `UPDATE "${HISTORY_TABLE}" SET parent='${IDS.oldHead}'`, /cyclic/u],
  ["orphan ID-range history", `INSERT INTO "${HISTORY_TABLE}"(id,uuid,key) VALUES(4,'${IDS.peer}','${IDS.oldKey}')`, /ID-range/u],
  ["reverse-ordered parent", `INSERT INTO "${HISTORY_TABLE}"(id,uuid,key) VALUES(6,'${IDS.peer}','${IDS.oldKey}'); UPDATE "${HISTORY_TABLE}" SET parent='${IDS.peer}' WHERE id=5`, /Future|ID-range|ID order/u],
  ["baseline trigger", "CREATE TRIGGER extra_trigger AFTER UPDATE ON projects BEGIN SELECT 1; END", /schema/u],
  ["non-text actor display name", "UPDATE users SET username=X'00'", /SQL TEXT/u],
  ["different duplicate structure", "INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,'{}' FROM project_structures", /different tree bytes/u],
  ["second project", `INSERT INTO projects(uuid,archive,name,content,thumb,ticket) VALUES('${IDS.peer}',0,'synthetic','','',0)`, /exactly one/u],
] as const) {
  void test(`preparation refuses source-inadmissible ${name}`, async () => {
    const input = await fixture(); mutate(input.path, sql);
    await assert.rejects(prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: WITNESS }), failure);
  });
}
void test("native allocation derives unusual current max ID and deleted AUTOINCREMENT gaps", async () => {
  const input = await fixture();
  mutate(input.path, `UPDATE "${HISTORY_TABLE}" SET id=100; UPDATE history_data SET id=200; UPDATE sqlite_sequence SET seq=211 WHERE name='history_data'`);
  const plan = await prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: WITNESS });
  applyEffect(input.path); const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["newHistoryId"], "101"); assert.equal(proof["newChunkId"], "212");
});
void test("future history rows are refused because the new native head would select them", async () => {
  const input = await fixture();
  mutate(input.path, `INSERT INTO "${HISTORY_TABLE}"(id,uuid,key) VALUES(9,'${IDS.peer}','${IDS.oldKey}')`);
  await assert.rejects(prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: WITNESS }), /Future history/u);
});
void test("an active parentless ordinary branch also has a complete single-table history", async () => {
  const input = await fixture(); mutate(input.path, `UPDATE branches SET parent_uuid=NULL WHERE uuid='${IDS.branch}'`);
  const plan = await prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: WITNESS });
  applyEffect(input.path); const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["exactLogicalSqlEffect"], true);
});
void test("native actor fallback uses empty display names when the actor has no users row", async () => {
  const input = await fixture(); mutate(input.path, "DELETE FROM users");
  const plan = await prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: WITNESS });
  applyEffect(input.path, expectedRaw().replace('"username":"synthetic-user"', '"username":""').replace('"nickname":"Synthetic"', '"nickname":""'));
  const proof = await verifySymbolNewHeadSqlEffect(plan, await inventory(input.path));
  assert.equal(proof["exactLogicalSqlEffect"], true);
});
void test("valid replacement encryption never authorizes rewriting complete old chunk bytes", async () => {
  const input = await fixture(); const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  applyEffect(input.path);
  const replacement = encrypted(expectedRaw(), IDS.oldHead, IDS.oldKey);
  mutate(input.path, `UPDATE history_data SET dataStr='${replacement}' WHERE id=7`);
  await assert.rejects(verifySymbolNewHeadSqlEffect(plan, await inventory(input.path)), /history_data/u);
});
void test("large exact SQL comparison yields real event-loop turns without weakening final-row equality", async (context) => {
  const input = await fixture();
  mutate(input.path, "WITH RECURSIVE n(v) AS (VALUES(1) UNION ALL SELECT v+1 FROM n WHERE v<10000) INSERT INTO resources(hash,dataStr) SELECT printf('bulk-%05d',v),hex(zeroblob(128)) FROM n");
  const plan = await prepareSymbolNewHeadSqlPlan({ before: await inventory(input.path), operation: OPERATION, witness: WITNESS });
  applyEffect(input.path); const after = await inventory(input.path);
  let running = true; let ticks = 0; let last = performance.now(); let maximumGapMs = 0;
  function tick(): void {
    if (!running) { return; }
    const now = performance.now(); maximumGapMs = Math.max(maximumGapMs, now - last); last = now; ticks += 1; setImmediate(tick);
  }
  setImmediate(tick);
  try { const proof = await verifySymbolNewHeadSqlEffect(plan, after); assert.equal(proof["exactLogicalSqlEffect"], true); }
  finally { running = false; }
  assert.ok(ticks > 100, "The exact 10000-row comparison must service real event-loop turns.");
  context.diagnostic(`10000-row proof heartbeat: ${ticks} turns, maximum measured gap ${maximumGapMs.toFixed(3)} ms; measurement is not a host-independent deadline guarantee.`);
  mutate(input.path, "UPDATE resources SET dataStr='changed-last-row' WHERE hash='bulk-10000'");
  await assert.rejects(verifySymbolNewHeadSqlEffect(plan, await inventory(input.path)), /resources/u);
});
