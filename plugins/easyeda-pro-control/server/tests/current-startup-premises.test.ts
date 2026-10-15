import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { assessCurrentStartupPremises } from "../src/current-startup-premises.ts";
import { readNativeHistoryCheckpoint } from "../src/native-history.ts";
import { IDS, encrypted, fixture, inventory } from "./helpers/symbol-sql-fixture.ts";

const PAGE = "c".repeat(16), PCB = "b".repeat(16), PROJECT = "1".repeat(64);
function record(type: string, body: unknown, id?: string): string {
  return `${JSON.stringify({ type, ticket: 1, ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}
function header(uuid: string, docType: string): string {
  return record("DOCHEAD", { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2.206" });
}
async function input(options: Readonly<{ meta?: "missing" | "wrong-title"; page?: "active" | "deleted"; deletedPcb?: boolean; oldVersion?: boolean }> = {}): Promise<{
  path: string; request: Parameters<typeof assessCurrentStartupPremises>[0];
}> {
  const value = await fixture();
  const database = new DatabaseSync(value.path, { enableForeignKeyConstraints: false });
  try {
    database.prepare("UPDATE projects SET uuid=?").run(PROJECT);
    database.prepare("UPDATE branches SET project_uuid=?").run(PROJECT);
    let raw = header(PCB, "PCB");
    if (options.meta !== "missing") { raw += record("META", { title: options.meta === "wrong-title" ? false : "Synthetic PCB" }, "META"); }
    if (options.deletedPcb === true) { raw += record("DELETE_DOC", { isDelete: true }, "DELETE_DOC"); }
    if (options.page !== undefined) {
      raw += header(PAGE, "SCH_PAGE") + record("META", { title: "Synthetic sheet", schematic: "d".repeat(16) }, "META");
      if (options.page === "deleted") { raw += record("DELETE_DOC", { isDelete: true }, "DELETE_DOC"); }
    }
    database.prepare("UPDATE history_data SET dataStr=?").run(encrypted(raw, IDS.oldHead, IDS.oldKey));
    if (options.oldVersion === true) { database.exec("UPDATE db_versions SET value='25.9.9.0' WHERE key='sqlite'"); }
  } finally { database.close(); }
  const sql = await inventory(value.path);
  const history = await readNativeHistoryCheckpoint({ checkpointPath: value.path, expectedSha256: sql.checkpointSha256, projectUuid: PROJECT });
  return { path: value.path, request: { inventory: sql, sourceSha256: sql.checkpointSha256, checkpointSha256: sql.checkpointSha256, history,
    target: { projectUuid: PROJECT, branchUuid: IDS.branch, ownerUuid: IDS.actor }, documentUuid: PCB } };
}

void test("current startup report retains only a historical subset, with metadata counting but no live authority", async () => {
  const value = await input();
  const before = await readFile(value.path);
  const report = await assessCurrentStartupPremises(value.request);
  assert.equal(report.scope, "historical-closed-default-branch"); assert.equal(report.historicalSubsetSatisfied, true);
  assert.equal(report.sqlSchemaSupported, true); assert.equal(report.databaseVersion, "25.10.31.1");
  assert.equal(report.targetPcbSuppliesNonzeroNativeCount, true); assert.equal(report.activeSchematicPages, 0);
  assert.deepEqual(report.blockers, []); assert.equal(report.historySemanticSha256, value.request.history.semanticSha256);
  assert.equal(report.sourceSha256, value.request.sourceSha256); assert.equal(report.checkpointSha256, value.request.checkpointSha256);
  assert.equal(report.localEditorVersionUpdate, "source-reviewed-backend-no-op");
  assert.equal(report.localProjectDetailExamInfo, "source-reviewed-field-omitted");
  for (const key of ["runtimeExamStateVerified", "preOpeningContinuityVerified", "startupQualified", "openingEffectsVerified", "executionAuthorized"] as const) {
    assert.equal(report[key], false);
  }
  assert.ok(Object.isFrozen(report) && Object.isFrozen(report.blockers));
  assert.deepEqual(await readFile(value.path), before);
});

void test("startup subset reports concrete migration, metadata and active-page blockers", async () => {
  for (const [options, blocker] of [[{ oldVersion: true }, "unsupported-database-version"], [{ meta: "missing" }, "target-pcb-count-witness-unavailable"],
    [{ meta: "wrong-title" }, "target-pcb-count-witness-unavailable"], [{ page: "active" }, "active-schematic-pages"]] as const) {
    const value = await input(options);
    const report = await assessCurrentStartupPremises(value.request);
    assert.deepEqual(report.blockers, [blocker]); assert.equal(report.historicalSubsetSatisfied, false);
    assert.equal(report.startupQualified, false); assert.equal(report.executionAuthorized, false);
  }
});

void test("startup subset excludes deleted pages from its conservative active-page predicate", async () => {
  const value = await input({ page: "deleted" });
  const report = await assessCurrentStartupPremises(value.request);
  assert.equal(value.request.history.documents.length, 2); assert.equal(report.activeSchematicPages, 0);
  assert.equal(report.historicalSubsetSatisfied, true); assert.equal(report.startupQualified, false);
});

void test("startup report refuses nonlocal targets, cloned SQL evidence and missing or deleted target PCBs", async () => {
  const value = await input();
  await assert.rejects(assessCurrentStartupPremises({ ...value.request, target: { ...value.request.target, projectUuid: IDS.project } }), /local path-hash/u);
  await assert.rejects(assessCurrentStartupPremises({ ...value.request, inventory: structuredClone(value.request.inventory) }), /original inventory/u);
  await assert.rejects(assessCurrentStartupPremises({ ...value.request, documentUuid: PAGE }), /exact undeleted PCB/u);
  const deleted = await input({ deletedPcb: true });
  await assert.rejects(assessCurrentStartupPremises(deleted.request), /exact undeleted PCB/u);
});
