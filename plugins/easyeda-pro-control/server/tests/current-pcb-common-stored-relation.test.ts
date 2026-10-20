/** Synthetic common graphs plus real isolated SQLite/AES-GCM/gzip history. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeCurrentPcbCommonPreference, encodeCurrentPcbCommonPresentation } from "../src/current-pcb-common-encoding.ts";
import { encodeCurrentPcbCommonRulesAndPrimitives } from "../src/current-pcb-common-rule-encoding.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, CURRENT_PCB_COMMON_RULES_FUNCTION } from "../src/current-pcb-common-state.ts";
import { prepareCurrentPcbCommonStoredFromMetadataObservation, prepareCurrentPcbCommonStoredRelation } from "../src/current-pcb-common-stored-relation.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION } from "../src/current-pcb-string-empty-assets.ts";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { prepareCurrentPcbStringHistory } from "../src/current-pcb-string-history.ts";
// oxlint-disable-next-line import/max-dependencies -- This integration fixture composes existing common, native-history and whole-SQL proofs instead of recreating their encoders or weakening reader provenance.
import { planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";
import { prepareCurrentPcbStringSql, verifyCurrentPcbStringSql } from "../src/current-pcb-string-sql.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { PCB_COMMON_RULE_ENCODING_SETUP, pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const identity = { projectUuid: IDS.project, branchUuid: IDS.branch, documentUuid: IDS.target };
const metadata = { headerText: JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target,
  updateTime: 1, version: "1", editVersion: "3.0" }),
metaBodyText: '{"title":"Empty PCB","parent":"","source":"","board":"","zIndex":null}' };
function observations(change = ""): {
  replies: { presentation: ReturnType<typeof pcbStringReply>; rules: ReturnType<typeof pcbStringReply>;
    preference: ReturnType<typeof pcbStringReply>; assets: ReturnType<typeof pcbStringReply> };
  rows: readonly { dataType: string; id: string; bodyText: string }[];
} {
  const context = pcbCommonFixture(`${PCB_COMMON_RULE_ENCODING_SETUP}
scope.object.x.env._id=${JSON.stringify(IDS.target)};scope.object.Me._prevTrackWidth=1;
scope.object.Ke.manager.map.set(4,make("WA",{layerId:4,type:"BOTTOM_SILK",name:"Bottom",status:make("Ff",{state:0}),_activeColor:black,deactiveColor:black}));
${change}`);
  const reply = (source: string): ReturnType<typeof pcbStringReply> => pcbStringReply(callPcbStringObservation(context, source));
  const replies = { presentation: reply(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION), rules: reply(CURRENT_PCB_COMMON_RULES_FUNCTION),
    preference: reply(CURRENT_PCB_COMMON_PREFERENCE_FUNCTION), assets: reply(CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION) };
  const presentation = encodeCurrentPcbCommonPresentation(replies.presentation), rules = encodeCurrentPcbCommonRulesAndPrimitives(replies.rules, replies.presentation);
  return { replies, rows: [...presentation.rows, ...rules.rows, ...encodeCurrentPcbCommonPreference(replies.preference, replies.rules).rows, rules.panelize] };
}
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function structure(saved = false): string {
  return JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [IDS.target]: {
    uuid: IDS.target, title: "Empty PCB", board: "", parent_uuid: "", source: "",
    version: saved ? String(TIMES.document) : "1", updateTime: saved ? TIMES.document : 1,
  } }, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: null } });
}
type RowChange = (rows: string[]) => string[];
async function setup(change: RowChange = rows => rows): Promise<{
  input: Parameters<typeof prepareCurrentPcbCommonStoredRelation>[0]; path: string; raw: string;
  rows: ReturnType<typeof observations>["rows"];
}> {
  const base = await fixture(), samples = observations();
  const owner = base.before.tables.find(table => table.name === "history_data"); assert.ok(owner);
  const value = owner.rows[0]?.cells[owner.columns.findIndex(column => column["name"] === "dataStr")]; assert.ok(value?.kind === "text");
  const original = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(value.hex, "hex").toString() });
  const old = original.split("|\n");
  const common = samples.rows.map((row, index) => `${JSON.stringify({ type: row.dataType, ticket: 10 + index, id: row.id })}||${row.bodyText}`).toReversed();
  const raw = [old[0], `{"type":"DOCHEAD","ticket":1}||${metadata.headerText}`,
    `{"type":"META","ticket":1,"id":"META"}||${metadata.metaBodyText}`, ...change(common), ...old.slice(3)].join("|\n");
  mutate(base.path, `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.oldHead, IDS.oldKey))} WHERE id=7;
    UPDATE project_structures SET structure=${literal(structure())};`);
  return { input: { before: await inventory(base.path), identity, metadata, replies: samples.replies }, path: base.path, raw, rows: samples.rows };
}

void test("complete empty-PCB common bodies join original SQL/history without inventing native authority", async () => {
  const sample = await setup();
  const result = await prepareCurrentPcbCommonStoredRelation(sample.input);
  assert.equal(result.rows.length, 62); assert.equal(result.documentCount, 2); assert.equal(result.maximumHistoryTicket, 100);
  assert.equal(result.commonEmissionOrder[0], "CANVAS"); assert.equal(result.commonEmissionOrder.at(-1), "PANELIZE");
  const primitive = result.commonEmissionOrder.indexOf('["PRIMITIVE","FPC_STIFFENER"]'), silk = result.commonEmissionOrder.indexOf('["SILK_OPTS",3]');
  assert.ok(silk > primitive); assert.equal(result.rows.find(row => row.id === "CANVAS")?.selected.ticket, 10);
  assert.deepEqual(result.rows.find(row => row.id === "CANVAS")?.selected.serializedClient, { kind: "absent" });
  assert.equal(result.rows.find(row => row.id === "CANVAS")?.selected.inheritedClient, "b".repeat(16));
  assert.equal(result.targetOccurrenceCount, 65); assert.equal(result.suppliedTargetCommonAndMetaMatch, true);
  assert.equal(result.structureRowCount, 1);
  for (const key of ["originalOwnerVerified", "nativeIntrinsicsVerified", "originalPrototypeIntegrityVerified", "metadataObservationProvenanceVerified",
    "atomicSnapshotVerified", "completeLiveBaselineVerified", "completeStoredAssetsOwnershipVerified", "queueCompletionVerified", "closedFileOwnershipVerified",
    "savedVerified", "reopenedVerified", "saveAuthorized", "executionAuthorized"] as const) { assert.equal(result[key], false); }
  assert.ok(Object.isFrozen(result.rows[0]?.selected));
});

void test("missing, additional, reordered-body and foreign-identity rows refuse; native defaults are not inferred", async () => {
  const changes: readonly RowChange[] = [rows => rows.slice(1), rows => [...rows, '{"type":"STRING","ticket":80,"id":"unexpected"}||{"text":"not empty"}'],
    rows => rows.map(row => row.includes('"id":"CANVAS"') ? row.replace('"unit":"mil"', '"unit":"mm"') : row),
    rows => rows.map(row => row.includes('"id":"CANVAS"') ? row.replace('"originX":0,"originY":0', '"originY":0,"originX":0') : row),
    rows => rows.map(row => row.replace('"id":"PREFERENCE"', '"id":"UNKNOWN_PREFERENCE"'))];
  for (const change of changes) { const sample = await setup(change); await assert.rejects(prepareCurrentPcbCommonStoredRelation(sample.input), /PCB_COMMON_STORED_RELATION/u); }
  const sample = await setup();
  await assert.rejects(prepareCurrentPcbCommonStoredRelation({ ...sample.input, identity: { ...identity, documentUuid: IDS.peer } }), /document differ/u);
  await assert.rejects(prepareCurrentPcbCommonStoredRelation({ ...sample.input, metadata: { ...metadata,
    metaBodyText: metadata.metaBodyText.replace('"parent":""', '"parent":"linked"') } }));
  mutate(sample.path, `UPDATE project_structures SET structure=${literal(structure().replace("Empty PCB", "Wrong title"))}`);
  await assert.rejects(prepareCurrentPcbCommonStoredRelation({ ...sample.input, before: await inventory(sample.path) }), /target structure/u);
});

void test("two chunks retain stale clocks, tie-client selection, duplicate bytes and explicit-null inheritance", async () => {
  const sample = await setup();
  const canvas = sample.rows.find(row => row.id === "CANVAS"); assert.ok(canvas);
  const c = "c".repeat(16), head = `{"type":"DOCHEAD","ticket":2}||${metadata.headerText}`;
  const item = (ticket: number, selectedClient: string | null, body = canvas.bodyText): string => `${JSON.stringify({ type: "CANVAS", ticket, id: "CANVAS", client: selectedClient })}||${body}`;
  const extra = [head, item(9, c, '{"stale":true}'), item(10, "a".repeat(16), '{"lowerClient":true}'),
    item(10, null), item(10, c), item(10, c, canvas.bodyText.replace('"originX":0,"originY":0', '"originY":0,"originX":0'))].join("|\n");
  mutate(sample.path, `UPDATE "project_history_${IDS.branch}" SET num=1 WHERE id=5;
    INSERT INTO history_data(id,uuid,history_uuid,dataStr) VALUES(8,'${IDS.oldHead}-1','${IDS.oldHead}',${literal(encrypted(extra, IDS.oldHead, IDS.oldKey))});`);
  const result = await prepareCurrentPcbCommonStoredRelation({ ...sample.input, before: await inventory(sample.path) });
  const row = result.rows.find(value => value.id === "CANVAS"); assert.ok(row);
  assert.equal(result.historyChunkSha256.length, 2); assert.equal(result.selectedHeader.ticket, 2);
  assert.equal(row.selected.chunkIndex, 1); assert.equal(row.selected.recordIndex, 4); assert.equal(row.selected.client, c);
  assert.deepEqual(row.selected.serializedClient, { kind: "value", value: c }); assert.equal(row.sameWinningClockOccurrences, 2);
  const conflict = extra.replace(item(10, c), item(10, c, '{"conflict":true}'));
  mutate(sample.path, `UPDATE history_data SET dataStr=${literal(encrypted(conflict, IDS.oldHead, IDS.oldKey))} WHERE id=8;`);
  await assert.rejects(prepareCurrentPcbCommonStoredRelation({ ...sample.input, before: await inventory(sample.path) }), /record-ticket-conflict/u);
});

void test("raw excluded state remains separately bound and hostile/forged inputs do not invoke getters", async () => {
  const sample = await setup();
  const first = await prepareCurrentPcbCommonStoredRelation(sample.input);
  const other = observations('scope.object.Ke.manager.futureBacking={preserved:true};');
  const second = await prepareCurrentPcbCommonStoredRelation({ ...sample.input, replies: other.replies });
  assert.equal(first.bodySequenceSha256, second.bodySequenceSha256); assert.notEqual(first.presentationGraphSha256, second.presentationGraphSha256);
  await assert.rejects(prepareCurrentPcbCommonStoredRelation({ ...sample.input, before: structuredClone(sample.input.before) }), /original/u);
  let reads = 0;
  const hostile = Object.defineProperty({ ...sample.input }, "metadata", { get(): unknown { reads += 1; return metadata; } });
  await assert.rejects(prepareCurrentPcbCommonStoredRelation(hostile), /own data/u); assert.equal(reads, 0);
  await assert.rejects(prepareCurrentPcbCommonStoredRelation(new Proxy(sample.input, {})), /own plain/u);
});

void test("existing one-String complete SQL proof preserves the joined common baseline and rejects any collateral row", async () => {
  const sample = await setup(); await prepareCurrentPcbCommonStoredRelation(sample.input);
  const candidate = planCurrentPcbStringCreate({ x: 100, y: -200, text: "Saved String" });
  const create = planCurrentPcbStringCreateObservation(candidate, { ...identity, tabId: `${IDS.target}@${IDS.project}` });
  const publication = planCurrentPcbStringPublication(candidate, create, { primitiveId: "d".repeat(16), client: WITNESS.client,
    uniqueId: "synthetic-compiler-token", maximumTicket: 100 });
  const clocks = { minimumMs: WITNESS.serverClockMinMs, maximumMs: WITNESS.serverClockMaxMs };
  const history = prepareCurrentPcbStringHistory(candidate, publication, { maximumTargetHeaderTime: 1, saveTime: TIMES.document, backendTime: TIMES.edit,
    saveClock: clocks, backendClock: clocks, workerUser: { uuid: IDS.actor, nickname: "UI nickname", username: "UI name", avatar: "" },
    backendActor: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" } });
  const plan = await prepareCurrentPcbStringSql({ before: sample.input.before, history,
    witness: { projectUuid: IDS.project, branchUuid: IDS.branch, backendClockMinMs: clocks.minimumMs, backendClockMaxMs: clocks.maximumMs, backendLocalOffsetMinutes: 120 } });
  applyEffect(sample.path, history.chunkText);
  mutate(sample.path, `UPDATE project_structures SET ticket=102,structure=${literal(structure(true))} WHERE branch_uuid='${IDS.branch}'`);
  const result = await verifyCurrentPcbStringSql(plan, await inventory(sample.path));
  assert.equal(result["exactLogicalSqlEffect"], true);
  const changedCommon = sample.raw.replace('"originX":0,"originY":0', '"originX":1,"originY":0');
  assert.notEqual(changedCommon, sample.raw);
  mutate(sample.path, `UPDATE history_data SET dataStr=${literal(encrypted(changedCommon, IDS.oldHead, IDS.oldKey))} WHERE id=7`);
  await assert.rejects(verifyCurrentPcbStringSql(plan, await inventory(sample.path)), /delta/u);
  mutate(sample.path, `UPDATE history_data SET dataStr=${literal(encrypted(sample.raw, IDS.oldHead, IDS.oldKey))} WHERE id=7`);
  mutate(sample.path, "UPDATE resources SET dataStr='changed peer resource'");
  await assert.rejects(verifyCurrentPcbStringSql(plan, await inventory(sample.path)), /delta/u);
});

void test("metadata graph joins exact META bytes without synthesizing DOCHEAD or granting observation provenance", async () => {
  const sample = await setup();
  const fields = [["title", ["string", "Empty PCB"]], ["parent", ["string", ""]], ["source", ["string", ""]],
    ["board", ["string", ""]], ["zIndex", ["number", "0"]]];
  const payload = { schema: "easyeda-pro-control.pcb-common-metadata.v1", documentUuid: IDS.target, projectUuid: IDS.project,
    compilerUniqueId: "e".repeat(16), ownerPublicShadowsAbsent: true,
    graph: { roots: [["docDetail", ["ref", 0]]], nodes: [{ kind: "object", className: "plain", fields,
      enumerableKeys: ["title", "parent", "source", "board", "zIndex"], jsonToJSONAbsent: true }] } };
  const input = { before: sample.input.before, identity, replies: sample.input.replies, headerText: metadata.headerText,
    metadataReply: pcbStringReply(JSON.stringify(payload)) };
  const result = await prepareCurrentPcbCommonStoredFromMetadataObservation(input);
  assert.equal(result.common.suppliedTargetCommonAndMetaMatch, true); assert.equal(result.compilerUniqueId, "e".repeat(16));
  assert.equal(result.metadataObservationProvenanceVerified, false); assert.equal(result.headerSourceMatched, false);
  assert.equal(result.atomicSnapshotVerified, false); assert.equal(result.executionAuthorized, false);
  const foreignReply = pcbStringReply(JSON.stringify({ ...payload, projectUuid: "a".repeat(32) }));
  await assert.rejects(prepareCurrentPcbCommonStoredFromMetadataObservation({ ...input, metadataReply: foreignReply }), /identity differs/u);
  fields[0] = ["title", ["string", "Different"]];
  const changedReply = pcbStringReply(JSON.stringify(payload));
  await assert.rejects(prepareCurrentPcbCommonStoredFromMetadataObservation({ ...input, metadataReply: changedReply }), /target structure and stored metadata differ/u);
});
