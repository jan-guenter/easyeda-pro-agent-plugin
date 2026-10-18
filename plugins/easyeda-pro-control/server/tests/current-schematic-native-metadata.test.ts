/** Synthetic complete SQL only. No application or production-project access. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertOriginalCurrentSchematicNativeMetadata, prepareCurrentSchematicNativeMetadata } from "../src/current-schematic-native-metadata.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const TARGET = { projectUuid: "1".repeat(64), branchUuid: IDS.branch, ownerUuid: IDS.actor, schematicUuid: IDS.target };
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" }, SHEET = "c".repeat(16);
function record(identity: unknown, body?: unknown): string { return `${JSON.stringify(identity)}||${body === undefined ? "" : JSON.stringify(body)}`; }
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function header(uuid: string, docType = "SCH", updateTime = 1): Record<string, unknown> {
  return { docType, client: "b".repeat(16), uuid, updateTime, version: String(updateTime), editVersion: "3.0" };
}
function treeEntry(uuid: string, name: string): Record<string, unknown> { return { uuid, name, board: "", source: "", version: "1", updateTime: 1 }; }
async function baseline(options: Readonly<{ replaceRaw?: readonly [string, string]; sql?: string }> = {}): Promise<Readonly<{ path: string; before: Awaited<ReturnType<typeof inventory>> }>> {
  const original = await fixture();
  const raw = [record({ type: "EDIT_HEAD" }, { ...ACTOR, updateTime: 1 }),
    record({ type: "DOCHEAD", ticket: 1 }, header(IDS.target)),
    record({ type: "META", ticket: 1, id: "META" }, { title: "Source SCH", source: "", board: "", zIndex: null }),
    record({ type: "LINE", ticket: 90, id: "deleted" }, { x: 0 }), record({ type: "LINE", ticket: 100, id: "deleted" }),
    record({ type: "DOCHEAD", ticket: 2 }, header(IDS.peer)),
    record({ type: "META", ticket: 2, id: "META" }, { title: "Peer SCH", source: "", board: "", zIndex: null }),
    record({ type: "DOCHEAD", ticket: 3 }, header(SHEET, "SCH_PAGE")),
    record({ type: "META", ticket: 3, id: "META" }, { title: "Child title", schematic: IDS.target, source: "", zIndex: 0 })].join("|\n");
  const tree = JSON.stringify({ boards: {}, schematics: { [IDS.target]: treeEntry(IDS.target, "Source SCH"), [IDS.peer]: treeEntry(IDS.peer, "Peer SCH") },
    sheets: { [SHEET]: { uuid: SHEET, title: "Child title", schematic_uuid: IDS.target, docType: 1, zIndex: 0, source: "", version: "1", updateTime: 1 } },
    pcbs: {}, panels: {}, blockSymbols: {}, owner: { ...ACTOR, avatar: null } });
  const selected = options.replaceRaw === undefined ? raw : raw.replace(...options.replaceRaw);
  mutate(original.path, [`UPDATE projects SET uuid='${TARGET.projectUuid}'`, `UPDATE branches SET project_uuid='${TARGET.projectUuid}'`,
    `UPDATE project_images SET project_uuid='${TARGET.projectUuid}'`,
    `UPDATE project_structures SET project_uuid='${TARGET.projectUuid}',structure=${literal(tree)}`,
    `UPDATE history_data SET dataStr=${literal(encrypted(selected, IDS.oldHead, IDS.oldKey))} WHERE id=7`, ...(options.sql === undefined ? [] : [options.sql])].join(";"));
  return { path: original.path, before: await inventory(original.path) };
}
void test("SCH metadata projects original SQL without actor/client/clock or PCB-only fields", async () => {
  const { before } = await baseline(), projection = await prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: "Renamed SCH" });
  assertOriginalCurrentSchematicNativeMetadata(projection, before);
  assert.deepEqual(projection.request, { target: TARGET, desiredTitle: "Renamed SCH", expectedBefore: { name: "source sch", displayName: "Source SCH",
    source: "", version: "1", boardUuid: "", ticket: 100, updateTime: 1 } });
  assert.equal(projection.maximumTicket, 100); assert.equal(projection.peers.length, 2); assert.equal(projection.peers[1]?.ticket, 2);
  assert.equal(projection.baseline.maximumTargetHeaderTime, 1); assert.equal(projection.baseline.sqlSha256, before.logicalSha256);
  assert.equal(projection.baseline.documentCount, 3); assert.equal(projection.sourcePeers.length, 2);
  assert.ok(Object.isFrozen(projection)); assert.ok(Object.isFrozen(projection.request.target)); assert.ok(Object.isFrozen(projection.sourcePeers[0]));
  for (const key of ["client", "actor", "witness", "documentClock", "backendClock"]) { assert.equal(Object.hasOwn(projection, key), false); }
  for (const key of ["executionAuthorized", "originalOwnerVerified", "producerBindingVerified", "actorProvenanceVerified", "clockProvenanceVerified",
    "nativeNamePolicyVerified", "queueCompletionVerified", "schematicSubscriberCompletionVerified", "generationClosureVerified",
    "persistentUploadReplayExcluded", "fullSqlEffectVerified", "reopened"] as const) { assert.equal(projection[key], false); }
});
void test("SCH metadata retains original completed reader and projection identity", async () => {
  const { before, path } = await baseline(), projection = await prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: "Renamed SCH" });
  const sameContent = await inventory(path); assert.equal(before.logicalSha256, sameContent.logicalSha256);
  assert.throws(() => { assertOriginalCurrentSchematicNativeMetadata(projection, sameContent); }, /original SQL metadata/u);
  assert.throws(() => { assertOriginalCurrentSchematicNativeMetadata(structuredClone(projection), before); }, /original SQL metadata/u);
  await assert.rejects(prepareCurrentSchematicNativeMetadata({ before: structuredClone(before), target: TARGET, desiredTitle: "Renamed SCH" }));
});
void test("SCH metadata rejects accessors, caller witnesses, target drift and name collisions", async () => {
  const { before } = await baseline(), input = { before, target: TARGET, desiredTitle: "Renamed SCH" }; let accessed = false;
  const get = (): never => { accessed = true; throw new Error("unexpected getter"); };
  for (const key of Object.keys(input)) { await assert.rejects(prepareCurrentSchematicNativeMetadata(Object.defineProperty({ ...input }, key, { get })), /accessors/u); }
  await assert.rejects(prepareCurrentSchematicNativeMetadata({ ...input, target: Object.defineProperty({ ...TARGET }, "schematicUuid", { get }) }), /accessors/u);
  for (const key of ["client", "actor", "witness", "documentClock", "backendClock"]) { await assert.rejects(prepareCurrentSchematicNativeMetadata({ ...input, [key]: {} }), /own-data/u); }
  await assert.rejects(prepareCurrentSchematicNativeMetadata({ ...input, target: { ...TARGET, ownerUuid: "f".repeat(32) } }), /owner/u);
  await assert.rejects(prepareCurrentSchematicNativeMetadata({ ...input, target: { ...TARGET, schematicUuid: SHEET } }), /target schematic/u);
  for (const desiredTitle of ["Source SCH", "source sch", "Peer SCH"]) { await assert.rejects(prepareCurrentSchematicNativeMetadata({ ...input, desiredTitle }), /collision/u); }
  for (const desiredTitle of ["Unqualified I", "Renamed Ω"]) { await assert.rejects(prepareCurrentSchematicNativeMetadata({ ...input, desiredTitle }), /locale-invariant/u); }
  assert.equal(accessed, false);
});
void test("SCH metadata binds complete SCH tree membership and exact SCH field serialization", async () => {
  for (const sql of [`UPDATE project_structures SET structure=json_set(structure,'$.schematics.${IDS.target}.name','Drifted')`,
    `UPDATE project_structures SET structure=json_remove(structure,'$.schematics.${IDS.peer}')`,
    `UPDATE project_structures SET structure=json_set(structure,'$.schematics.${IDS.target}.title','Source SCH')`,
    `UPDATE project_structures SET structure=json_set(structure,'$.schematics.${IDS.target}.updateTime',2)`,
    `UPDATE project_structures SET project_uuid='${"a".repeat(64)}'`,
    `UPDATE project_structures SET structure=json_set(structure,'$.owner.uuid','${"f".repeat(32)}')`]) {
    const { before } = await baseline({ sql });
    await assert.rejects(prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: "Renamed SCH" }));
  }
});
void test("SCH metadata refuses unsupported META/source shapes and raw header time regression", async () => {
  const meta = '"title":"Source SCH","source":"","board":"","zIndex":null';
  for (const replaceRaw of [[meta, meta.replace('"source":""', '"source":"inherited"')], [meta, meta.replace('"zIndex":null', '"zIndex":2')],
    [meta, `${meta},"parent":""`], [meta, meta.replace("Source SCH", "Source I")],
    [record({ type: "DOCHEAD", ticket: 2 }, header(IDS.peer)), `${record({ type: "DOCHEAD", ticket: 101 }, header(IDS.target, "SCH", 0))}|\n${record({ type: "DOCHEAD", ticket: 2 }, header(IDS.peer))}`]] as const) {
    const { before } = await baseline({ replaceRaw });
    await assert.rejects(prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: "Renamed SCH" }));
  }
});
void test("SCH metadata refuses child-derived container clocks and unstable historical parent lineage", async () => {
  const originalHeader = record({ type: "DOCHEAD", ticket: 3 }, header(SHEET, "SCH_PAGE"));
  const originalMeta = record({ type: "META", ticket: 3, id: "META" }, { title: "Child title", schematic: IDS.target, source: "", zIndex: 0 });
  for (const replaceRaw of [[originalHeader, record({ type: "DOCHEAD", ticket: 3 }, header(SHEET, "SCH_PAGE", 2))],
    [originalHeader, record({ type: "DOCHEAD", ticket: 3 }, { ...header(SHEET, "SCH_PAGE"), version: "different" })],
    [originalMeta, `${originalMeta}|\n${record({ type: "META", ticket: 4, id: "META" }, { title: "Child title", schematic: IDS.peer, source: "", zIndex: 0 })}`]] as const) {
    const { before } = await baseline({ replaceRaw });
    await assert.rejects(prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: "Renamed SCH" }), /child-derived|reparenting/u);
  }
});
