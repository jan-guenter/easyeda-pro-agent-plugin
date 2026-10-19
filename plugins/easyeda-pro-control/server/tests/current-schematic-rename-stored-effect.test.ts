/** Synthetic SQL, crypto and frozen intent only. No application close,
 * native write, Save or reopened-generation proof is produced here. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentSchematicRenameSql } from "../src/current-schematic-rename-sql.ts";
import { completedCurrentSchematicRenameStoredSource, verifyCurrentSchematicRenameStoredEffect } from "../src/current-schematic-rename-stored-effect.ts";
import { ACTOR, REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { IDS, TIMES, applyEffect, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

function record(identity: unknown, body: unknown): string { return `${JSON.stringify(identity)}||${JSON.stringify(body)}`; }
function appended(options: { title?: string; backendTime?: number; docType?: string; actor?: Readonly<{ uuid: string; username: string; nickname: string }> } = {}): string {
  return [record({ type: "EDIT_HEAD" }, { ...(options.actor ?? ACTOR), updateTime: options.backendTime ?? TIMES.edit }),
    record({ type: "DOCHEAD", ticket: 101 }, { docType: options.docType ?? "SCH", client: "a".repeat(16), uuid: TARGET.schematicUuid,
      updateTime: TIMES.document, version: String(TIMES.document), editVersion: "3.2.206" }),
    record({ type: "META", ticket: 101, id: "META" }, { title: options.title ?? REQUEST.desiredTitle, source: "", board: "", zIndex: null })].join("|\n");
}
async function setup(): Promise<Awaited<ReturnType<typeof schematicBaseline>> & { preparation: Awaited<ReturnType<typeof prepareCurrentSchematicRenameSql>> }> {
  const baseline = await schematicBaseline();
  const preparation = await prepareCurrentSchematicRenameSql({ before: baseline.before, metadata: baseline.metadata,
    witness: { projectUuid: TARGET.projectUuid, branchUuid: TARGET.branchUuid, backendActorUuid: ACTOR.uuid, client: "a".repeat(16),
      documentClockMinMs: TIMES.document - 500, documentClockMaxMs: TIMES.document + 500,
      backendClockMinMs: TIMES.edit - 1100, backendClockMaxMs: TIMES.edit + 2900, backendLocalOffsetMinutes: 120 } });
  return { ...baseline, preparation };
}
function apply(path: string, raw = appended()): void {
  applyEffect(path, raw);
  mutate(path, `UPDATE project_structures SET structure=json_set(structure,
    '$.schematics.${TARGET.schematicUuid}.name','${REQUEST.desiredTitle}',
    '$.schematics.${TARGET.schematicUuid}.version','${TIMES.document}',
    '$.schematics.${TARGET.schematicUuid}.updateTime',${TIMES.document}) WHERE branch_uuid='${TARGET.branchUuid}'`);
}
void test("SCH stored effect binds only native timestamps and verifies the full original SQL relation", async () => {
  const f = await setup(); apply(f.path); const after = await inventory(f.path);
  const effect = await verifyCurrentSchematicRenameStoredEffect(f.preparation, f.before, f.metadata, after, TIMES.document);
  assert.equal(effect.documentTime, TIMES.document); assert.equal(effect.backendTime, TIMES.edit); assert.equal(effect.targetUuid, TARGET.schematicUuid);
  assert.equal(effect.wholeRenameSqlEffectVerified, true); assert.equal(effect.comparison["exactLogicalSqlEffect"], true);
  assert.equal(effect.beforeSqlSha256, f.before.logicalSha256); assert.equal(effect.afterSqlSha256, after.logicalSha256);
  for (const key of ["originalDispatchVerified", "producerBindingVerified", "actorProvenanceVerified", "clockProvenanceVerified",
    "schematicSubscriberCompletionVerified", "queueCompletionVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened", "executionAuthorized"] as const) {
    assert.equal(effect[key], false);
  }
  const source = completedCurrentSchematicRenameStoredSource(effect, f.preparation, after);
  assert.equal(source.history.documents.length, 3); assert.equal(source.maximumTicket, 101); assert.equal(source.comparison, effect);
  assert.throws(() => completedCurrentSchematicRenameStoredSource(structuredClone(effect), f.preparation, after), /original successful/u);
  assert.throws(() => completedCurrentSchematicRenameStoredSource(effect, structuredClone(f.preparation), after), /original successful/u);
  assert.throws(() => completedCurrentSchematicRenameStoredSource(effect, f.preparation, structuredClone(after)), /original successful/u);
  assert.throws(() => completedCurrentSchematicRenameStoredSource(effect, f.preparation, f.before), /original successful/u);
});
void test("SCH stored effect cannot replace original reader/preparation/metadata or the retained native timestamp", async () => {
  const f = await setup(); apply(f.path); const after = await inventory(f.path);
  for (const args of [[structuredClone(f.preparation), f.before, f.metadata, after], [f.preparation, structuredClone(f.before), f.metadata, after],
    [f.preparation, f.before, structuredClone(f.metadata), after], [f.preparation, f.before, f.metadata, structuredClone(after)]] as const) {
    await assert.rejects(verifyCurrentSchematicRenameStoredEffect(...args, TIMES.document), /original/u);
  }
  for (const time of [TIMES.document + 1, -0, Number.NaN]) {
    await assert.rejects(verifyCurrentSchematicRenameStoredEffect(f.preparation, f.before, f.metadata, after, time), /timestamp/u);
  }
});
void test("SCH stored effect refuses changed title/actor/backend window, wrong document type and unrelated SQL changes", async () => {
  for (const raw of [appended({ title: "Wrong title" }), appended({ actor: { ...ACTOR, username: "other" } }),
    appended({ backendTime: TIMES.edit + 3000 }), appended({ docType: "PCB" }),
    `${appended()}|\n${record({ type: "LINE", ticket: 101, id: "unexpected" }, { x: 1 })}`]) {
    const f = await setup(); apply(f.path, raw);
    await assert.rejects(verifyCurrentSchematicRenameStoredEffect(f.preparation, f.before, f.metadata, await inventory(f.path), TIMES.document));
  }
  for (const sql of [`UPDATE projects SET owner_uuid='${IDS.peer}'`, "UPDATE resources SET dataStr='changed peer asset'"]) {
    const f = await setup(); apply(f.path); mutate(f.path, sql);
    await assert.rejects(verifyCurrentSchematicRenameStoredEffect(f.preparation, f.before, f.metadata, await inventory(f.path), TIMES.document));
  }
});
