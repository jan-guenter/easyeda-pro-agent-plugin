/** Synthetic closed SQLite inputs only. No editor, original project or writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentPcbRenameStructure, verifyCurrentPcbRenameStructure } from "../src/current-pcb-rename-structure.ts";
import type { CurrentPcbRenameStructureProjection } from "../src/current-pcb-rename-structure.ts";
import { prepareCurrentPcbRenameStructureSql, verifyCurrentPcbRenameStructureSql } from "../src/current-pcb-rename-structure-sql.ts";
import { IDS, applyEffect, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const BEFORE = Object.freeze({ title: "Original PCB Ω", version: "200", updateTime: 200 });
const TICKET = 101;
function structure(): string {
  return JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: {
    [IDS.target]: { uuid: IDS.target, title: BEFORE.title, board: "", parent_uuid: "", source: "", version: BEFORE.version, updateTime: BEFORE.updateTime },
    [IDS.peer]: { uuid: IDS.peer, title: "Keep PCB peer", board: "", parent_uuid: "", source: "", version: "100", updateTime: 100 },
  }, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: null } });
}
function projection(): CurrentPcbRenameStructureProjection {
  return prepareCurrentPcbRenameStructure({ structureText: structure(), targetUuid: IDS.target, expectedOwnerUuid: IDS.actor,
    expectedBefore: BEFORE, desiredTitle: "Renamed PCB Ω", documentTime: 201 });
}
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
async function setup(): Promise<{ path: string; before: Awaited<ReturnType<typeof inventory>>; projection: CurrentPcbRenameStructureProjection;
  projectUuid: string; branchUuid: string; ticket: number }> {
  const created = await fixture();
  mutate(created.path, `UPDATE project_structures SET structure=${literal(structure())};
    INSERT INTO project_structures(id,ticket,project_uuid,branch_uuid,structure)
    VALUES(2,70,'${IDS.project}','${IDS.branch}',${literal(structure())}),
          (3,1,'${IDS.project}','${IDS.branch}',${literal(structure())}),
          (5,900,'${IDS.project}','${IDS.peer}','uninterpreted peer structure');`);
  return { path: created.path, before: await inventory(created.path), projection: projection(), projectUuid: IDS.project, branchUuid: IDS.branch, ticket: TICKET };
}
function request(input: Awaited<ReturnType<typeof setup>>): Parameters<typeof prepareCurrentPcbRenameStructureSql>[0] {
  return { before: input.before, projection: input.projection, projectUuid: input.projectUuid, branchUuid: input.branchUuid, ticket: input.ticket };
}
function applyStructure(input: Awaited<ReturnType<typeof setup>>): void {
  mutate(input.path, `UPDATE project_structures SET ticket=${TICKET},structure=${literal(input.projection.afterStructureText)} WHERE branch_uuid='${IDS.branch}'`);
}

void test("PCB structure SQL projects every duplicate branch row and preserves all other SQL", async () => {
  const input = await setup(), original = JSON.stringify(input.before);
  const plan = await prepareCurrentPcbRenameStructureSql(request(input));
  assert.ok(Object.isFrozen(plan)); assert.equal(plan.updatedStructureRows, 3); assert.equal(plan.ticket, TICKET);
  assert.equal(plan.targetUuid, IDS.target); assert.equal(plan.executionAuthorized, false); assert.equal(plan.wholeRenameVerified, false);
  applyStructure(input); const after = await inventory(input.path), result = await verifyCurrentPcbRenameStructureSql(plan, after);
  assert.equal(result.exactStructureUploadLogicalSqlEffect, true); assert.equal(result.updatedStructureRows, 3);
  assert.equal(result.preservedTables, input.before.tables.length - 1); assert.equal(result.afterSqlSha256, plan.expectedSqlSha256);
  assert.equal(result.beforeSqlSha256, input.before.logicalSha256); assert.equal(JSON.stringify(input.before), original);
  assert.ok(Object.isFrozen(result));
  for (const key of ["executionAuthorized", "wholeRenameVerified", "completeHistoryVerified", "producerBindingVerified", "queueCompletionVerified", "clockProvenanceVerified", "reopened"] as const) {
    assert.equal(result[key], false);
  }
  assert.equal(verifyCurrentPcbRenameStructure(input.projection, input.projection.afterStructureText).fullSqlVerified, false);
});

void test("PCB structure SQL refuses a ticket choice that could select INSERT", async () => {
  const input = await setup();
  for (const ticket of [100, 70, 1, 0, -0, -1, Number.NaN, Infinity, 101.5, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), ticket }));
  }
  mutate(input.path, "UPDATE project_structures SET ticket=-1 WHERE id=2");
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: await inventory(input.path) }), /lower ticket/u);
  mutate(input.path, `DELETE FROM project_structures WHERE branch_uuid='${IDS.branch}'`);
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: await inventory(input.path) }), /rows missing/u);
});

void test("PCB structure SQL rejects ambiguous duplicate tree bytes and cross-project branch matches", async () => {
  const input = await setup();
  mutate(input.path, "UPDATE project_structures SET structure='different tree' WHERE id=2");
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: await inventory(input.path) }), /structure bytes differ/u);
  mutate(input.path, `UPDATE project_structures SET structure=${literal(structure())},project_uuid='${IDS.peer}' WHERE id=2`);
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: await inventory(input.path) }), /crosses project/u);
});

void test("PCB structure SQL binds original reader and original sealed projection, without invoking accessors", async () => {
  const input = await setup(), plan = await prepareCurrentPcbRenameStructureSql(request(input));
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: structuredClone(input.before) }), /original/u);
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), projection: structuredClone(input.projection) }), /original/u);
  let accessed = false;
  const accessor = Object.defineProperty({}, "afterStructureText", { get(): string { accessed = true; return input.projection.afterStructureText; } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately submit an accessor-backed fake issuer object to the runtime boundary.
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), projection: accessor as CurrentPcbRenameStructureProjection }), /accessor/u);
  const outer = Object.defineProperty(request(input), "ticket", { get(): number { accessed = true; return TICKET; } });
  await assert.rejects(prepareCurrentPcbRenameStructureSql(outer), /accessors/u); assert.equal(accessed, false);
  applyStructure(input); const after = await inventory(input.path);
  await assert.rejects(verifyCurrentPcbRenameStructureSql(structuredClone(plan), after), /original prepared/u);
  await assert.rejects(verifyCurrentPcbRenameStructureSql(plan, structuredClone(after)), /original/u);
});

void test("PCB structure SQL refuses unknown request fields and inconsistent project, branch or owner", async () => {
  const input = await setup();
  const unknownField = { ...request(input), extra: true };
  await assert.rejects(prepareCurrentPcbRenameStructureSql(unknownField), /input keys/u);
  for (const patch of [{ projectUuid: IDS.peer }, { branchUuid: IDS.peer }]) {
    await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), ...patch }), /identity|schema/u);
  }
  mutate(input.path, `UPDATE projects SET owner_uuid='${IDS.peer}'`);
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: await inventory(input.path) }), /owner differs/u);
  mutate(input.path, `UPDATE projects SET owner_uuid='${IDS.actor}'; UPDATE branches SET node=1 WHERE uuid='${IDS.branch}'`);
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: await inventory(input.path) }), /association/u);
});

void test("PCB structure SQL rejects partial duplicate updates, extra rows, lost rows and rowid changes", async () => {
  for (const change of [
    `UPDATE project_structures SET ticket=70,structure=${literal(structure())} WHERE id=2`,
    `INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) VALUES(${TICKET},'${IDS.project}','${IDS.branch}',${literal(projection().afterStructureText)})`,
    "DELETE FROM project_structures WHERE id=2", "UPDATE project_structures SET id=4 WHERE id=2",
  ]) {
    const input = await setup(), plan = await prepareCurrentPcbRenameStructureSql(request(input));
    applyStructure(input); mutate(input.path, change);
    await assert.rejects(verifyCurrentPcbRenameStructureSql(plan, await inventory(input.path)), /row|delta/u);
  }
});

void test("PCB structure SQL preserves peer branches, sequences, all table fields and storage classes", async () => {
  for (const change of ["UPDATE project_structures SET structure='changed peer' WHERE id=5",
    "UPDATE sqlite_sequence SET seq=99 WHERE name='project_structures'", "UPDATE sqlite_sequence SET seq=99 WHERE name='history_data'",
    "UPDATE resources SET dataStr=x'6B656570207261772070656572206279746573'", "UPDATE users SET nickname='changed actor'",
    "UPDATE projects SET ticket=101", `UPDATE branches SET name='changed branch' WHERE uuid='${IDS.branch}'`,
    "UPDATE project_images SET image_data=x'00'", "UPDATE history_data SET dataStr='changed ciphertext'",
  ]) {
    const input = await setup(), plan = await prepareCurrentPcbRenameStructureSql(request(input));
    applyStructure(input); mutate(input.path, change);
    await assert.rejects(verifyCurrentPcbRenameStructureSql(plan, await inventory(input.path)), /delta|identity/u);
  }
});

void test("PCB structure SQL checks the complete projected text, ticket and storage classes", async () => {
  for (const change of ["UPDATE project_structures SET ticket=102 WHERE id=1",
    `UPDATE project_structures SET structure=${literal(projection().afterStructureText.replace("Keep PCB peer", "Altered peer"))} WHERE id=1`,
    "UPDATE project_structures SET structure=CAST(structure AS BLOB) WHERE id=1",
  ]) {
    const input = await setup(), plan = await prepareCurrentPcbRenameStructureSql(request(input));
    applyStructure(input); mutate(input.path, change);
    await assert.rejects(verifyCurrentPcbRenameStructureSql(plan, await inventory(input.path)), /delta|identity/u);
  }
});

void test("PCB structure SQL refuses changed schema and persisted properties", async () => {
  const input = await setup(), plan = await prepareCurrentPcbRenameStructureSql(request(input));
  applyStructure(input); mutate(input.path, "PRAGMA user_version=99");
  await assert.rejects(verifyCurrentPcbRenameStructureSql(plan, await inventory(input.path)), /properties/u);
  mutate(input.path, "CREATE TABLE unexpected(value TEXT)");
  await assert.rejects(verifyCurrentPcbRenameStructureSql(plan, await inventory(input.path)), /schema/u);
  await assert.rejects(prepareCurrentPcbRenameStructureSql({ ...request(input), before: await inventory(input.path) }), /schema/u);
});

void test("PCB structure SQL does not accept a complete rename/history effect as one isolated structure upload", async () => {
  const input = await setup(), plan = await prepareCurrentPcbRenameStructureSql(request(input));
  applyStructure(input); applyEffect(input.path);
  await assert.rejects(verifyCurrentPcbRenameStructureSql(plan, await inventory(input.path)), /delta|row/u);
});
