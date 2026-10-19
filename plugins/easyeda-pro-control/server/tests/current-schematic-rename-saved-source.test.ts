/** Synthetic completed SQL and supplied observations, never a live lifecycle. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import type { CurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import type { CurrentSchematicChildObservation } from "../src/current-schematic-child-roster-contract.ts";
import { prepareCurrentSchematicNativeMetadata } from "../src/current-schematic-native-metadata.ts";
import { assertCurrentSchematicRenameSavedReadEligibility, compareCurrentSchematicRenameLaterSql, compareCurrentSchematicRenameSavedObservations,
  originalCurrentSchematicRenameSavedSource, prepareCurrentSchematicRenameSavedSource } from "../src/current-schematic-rename-saved-source.ts";
import { prepareCurrentSchematicRenameSql } from "../src/current-schematic-rename-sql.ts";
import { verifyCurrentSchematicRenameStoredEffect } from "../src/current-schematic-rename-stored-effect.ts";
import { decodeCurrentSymbolPreEditHistory } from "../src/symbol-sql-comparator.ts";
import { ACTOR, PAYLOAD, REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
// oxlint-disable-next-line import/max-dependencies -- Integrate real completed SQL readers and every production relation instead of mocking their issuer identities.
import { IDS, TIMES, applyEffect, encrypted, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

function record(identity: unknown, body: unknown): string { return `${JSON.stringify(identity)}||${JSON.stringify(body)}`; }
async function setup(childTime = 1, libraryOrigin?: string, childTitle = "Child title"): Promise<Readonly<{
  baseline: Awaited<ReturnType<typeof schematicBaseline>>;
  children: CurrentSchematicChildRoster;
  preparation: Awaited<ReturnType<typeof prepareCurrentSchematicRenameSql>>;
  effect: Awaited<ReturnType<typeof verifyCurrentSchematicRenameStoredEffect>>;
  after: Awaited<ReturnType<typeof inventory>>;
}>> {
  const baseline = await schematicBaseline(childTime, libraryOrigin, childTitle), children = await prepareCurrentSchematicChildRoster(baseline.metadata, baseline.before);
  const preparation = await prepareCurrentSchematicRenameSql({ before: baseline.before, metadata: baseline.metadata,
    witness: { projectUuid: TARGET.projectUuid, branchUuid: TARGET.branchUuid, backendActorUuid: ACTOR.uuid, client: "a".repeat(16),
      documentClockMinMs: TIMES.document - 500, documentClockMaxMs: TIMES.document + 500,
      backendClockMinMs: TIMES.edit - 1100, backendClockMaxMs: TIMES.edit + 2900, backendLocalOffsetMinutes: 120 } });
  const raw = [record({ type: "EDIT_HEAD" }, { ...ACTOR, updateTime: TIMES.edit }),
    record({ type: "DOCHEAD", ticket: 101 }, { docType: "SCH", client: "a".repeat(16), uuid: TARGET.schematicUuid,
      updateTime: TIMES.document, version: String(TIMES.document), editVersion: "3.2.206" }),
    record({ type: "META", ticket: 101, id: "META" }, { title: REQUEST.desiredTitle, source: "", board: "", zIndex: null })].join("|\n");
  applyEffect(baseline.path, raw);
  mutate(baseline.path, `UPDATE project_structures SET structure=json_set(structure,
    '$.schematics.${TARGET.schematicUuid}.name','${REQUEST.desiredTitle}',
    '$.schematics.${TARGET.schematicUuid}.version','${TIMES.document}',
    '$.schematics.${TARGET.schematicUuid}.updateTime',${TIMES.document}) WHERE branch_uuid='${TARGET.branchUuid}'`);
  const after = await inventory(baseline.path);
  const effect = await verifyCurrentSchematicRenameStoredEffect(preparation, baseline.before, baseline.metadata, after, TIMES.document);
  return { baseline, children, preparation, effect, after };
}
function childObservation(prepared: CurrentSchematicChildRoster): CurrentSchematicChildObservation {
  const sample = { childKv: structuredClone(prepared.childKv), manager: { prjUuid: TARGET.projectUuid, batchDepth: 0 as const,
    _isClose: false as const, pendingSchematics: null, pendingSheets: null },
  ast: { isBuild: true as const, isPass: false as const, transId: 1, lastModify: 1, schematic: structuredClone(prepared.targetAst) },
  tempAst: { isBuild: false as const, isPass: false as const, transId: 1, schematic: structuredClone(prepared.targetAst) } };
  return { profile: "private.current-schematic-child-roster-observation.v1", target: { ...TARGET }, samples: [sample, structuredClone(sample)] };
}
const FLAGS = ["originalDispatchVerified", "producerBindingVerified", "actorProvenanceVerified", "clockProvenanceVerified",
  "schematicSubscriberCompletionVerified", "queueCompletionVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened", "executionAuthorized"] as const;
function noAuthority(value: Readonly<Record<string, unknown>>): void { for (const key of FLAGS) { assert.equal(value[key], false); } }

void test("SCH saved source preserves complete peers and children while projecting only the verified container metadata", async () => {
  const f = await setup();
  assertCurrentSchematicRenameSavedReadEligibility(f.baseline.metadata, f.baseline.before);
  const source = await prepareCurrentSchematicRenameSavedSource(f.preparation, f.baseline.before, f.baseline.metadata, f.children, f.effect, f.after);
  const original = originalCurrentSchematicRenameSavedSource(source, f.after);
  assert.equal(source.completeChildRosterUnchanged, true); assert.equal(source.maximumTicket, 101); noAuthority({ ...source });
  assert.equal(original.metadata.request.desiredTitle, REQUEST.expectedBefore.displayName);
  assert.equal(original.metadata.request.expectedBefore.displayName, REQUEST.desiredTitle);
  assert.equal(original.metadata.request.expectedBefore.updateTime, TIMES.document);
  assert.deepEqual(original.children.childKv, f.children.childKv); assert.deepEqual(original.children.targetAst.sort, f.children.targetAst.sort);
  assert.equal(original.children.targetAst.displayTitle, REQUEST.desiredTitle);
  assert.equal(original.children.targetAst.version, String(TIMES.document));
  assert.ok(Object.isFrozen(source)); assert.ok(Object.isFrozen(original)); assert.ok(Object.isFrozen(original.metadata.request));
  const metadata = { ...structuredClone(PAYLOAD), ...original.metadata.request, peers: original.metadata.peers,
    clientTicketObservation: { client: "f".repeat(16), maxTicket: 101, samples: 4 } };
  const result = compareCurrentSchematicRenameSavedObservations(source, f.after, metadata, childObservation(original.children));
  assert.equal(result["suppliedSavedMetadataMatched"], true); assert.equal(result["suppliedSavedChildRosterMatched"], true); noAuthority(result);
});
void test("SCH child-derived baseline clocks survive full SQL rename and saved projection without changing children", async () => {
  const childTime = TIMES.document - 1000, f = await setup(childTime, `${"a".repeat(32)}|${"b".repeat(32)}`, "Child Input");
  assert.equal(f.baseline.metadata.baseline.maximumTargetHeaderTime, 1);
  assert.equal(f.baseline.metadata.baseline.maximumTargetNativeTime, childTime);
  assert.equal(f.baseline.metadata.request.expectedBefore.version, String(childTime));
  assert.equal(f.children.targetAst.updateTime, childTime); assert.equal(f.children.targetAst.version, String(childTime));
  assert.deepEqual(f.children.startupInput.templates, [{ uuid: "d".repeat(16), docType: 2, partId: "part" }]);
  assert.equal(f.children.nativeChildTitlePolicy, "ascii-fold-projection-requires-exact-native-match");
  assert.equal(f.children.childKv["c".repeat(16)]?.title, "child input");
  assert.equal(f.children.childKv["c".repeat(16)]?.display_title, "Child Input");
  const source = await prepareCurrentSchematicRenameSavedSource(f.preparation, f.baseline.before, f.baseline.metadata, f.children, f.effect, f.after);
  const original = originalCurrentSchematicRenameSavedSource(source, f.after);
  assert.equal(original.metadata.baseline.maximumTargetHeaderTime, TIMES.document);
  assert.equal(original.metadata.baseline.maximumTargetNativeTime, TIMES.document);
  assert.equal(original.metadata.request.expectedBefore.updateTime, TIMES.document);
  assert.deepEqual(original.children.childKv, f.children.childKv);
  assert.deepEqual(original.metadata.peers.filter(peer => peer.uuid !== TARGET.schematicUuid), f.baseline.metadata.peers.filter(peer => peer.uuid !== TARGET.schematicUuid));
  const metadata = { ...structuredClone(PAYLOAD), ...original.metadata.request, peers: original.metadata.peers,
    clientTicketObservation: { client: "f".repeat(16), maxTicket: 101, samples: 4 } };
  const observed = compareCurrentSchematicRenameSavedObservations(source, f.after, metadata, childObservation(original.children));
  assert.equal(observed["suppliedSavedMetadataMatched"], true); assert.equal(observed["suppliedSavedChildRosterMatched"], true);
  const dotless = childObservation(original.children);
  for (const sample of dotless.samples) {
    const child = sample.childKv["c".repeat(16)]; assert.ok(child !== undefined); child.title = "child ınput";
  }
  assert.throws(() => compareCurrentSchematicRenameSavedObservations(source, f.after, metadata, dotless), /printable ASCII/u);
  const later = await inventory(f.baseline.path), unchanged = await compareCurrentSchematicRenameLaterSql(source, f.after, later);
  assert.equal(unchanged["completeLaterSqlUnchanged"], true);
  await assert.rejects(prepareCurrentSchematicRenameSql({ before: f.baseline.before, metadata: f.baseline.metadata,
    witness: { projectUuid: TARGET.projectUuid, branchUuid: TARGET.branchUuid, backendActorUuid: ACTOR.uuid, client: "a".repeat(16),
      documentClockMinMs: childTime, documentClockMaxMs: childTime + 500, backendClockMinMs: TIMES.edit - 1100,
      backendClockMaxMs: TIMES.edit + 2900, backendLocalOffsetMinutes: 120 } }), /newer direct\/native/u);
});

void test("SCH saved source requires the original preparation, both original readers, child roster and stored effect", async () => {
  const f = await setup();
  const args = [f.preparation, f.baseline.before, f.baseline.metadata, f.children, f.effect, f.after] as const;
  const changes: Parameters<typeof prepareCurrentSchematicRenameSavedSource>[] = [
    [structuredClone(f.preparation), f.baseline.before, f.baseline.metadata, f.children, f.effect, f.after],
    [f.preparation, structuredClone(f.baseline.before), f.baseline.metadata, f.children, f.effect, f.after],
    [f.preparation, f.baseline.before, structuredClone(f.baseline.metadata), f.children, f.effect, f.after],
    [f.preparation, f.baseline.before, f.baseline.metadata, structuredClone(f.children), f.effect, f.after],
    [f.preparation, f.baseline.before, f.baseline.metadata, f.children, structuredClone(f.effect), f.after],
    [f.preparation, f.baseline.before, f.baseline.metadata, f.children, f.effect, structuredClone(f.after)],
  ];
  for (const changed of changes) {
    await assert.rejects(prepareCurrentSchematicRenameSavedSource(...changed), /original/u);
  }
  const other = await inventory(f.baseline.path);
  assert.equal(other.logicalSha256, f.after.logicalSha256);
  await assert.rejects(prepareCurrentSchematicRenameSavedSource(f.preparation, f.baseline.before, f.baseline.metadata, f.children, f.effect, other), /original/u);
  const source = await prepareCurrentSchematicRenameSavedSource(...args);
  assert.throws(() => originalCurrentSchematicRenameSavedSource(structuredClone(source), f.after), /original/u);
  assert.throws(() => originalCurrentSchematicRenameSavedSource(source, other), /original/u);
});
void test("SCH saved observations refuse old metadata, changed peers, actor and either child AST", async () => {
  const f = await setup();
  const source = await prepareCurrentSchematicRenameSavedSource(f.preparation, f.baseline.before, f.baseline.metadata, f.children, f.effect, f.after);
  const original = originalCurrentSchematicRenameSavedSource(source, f.after);
  const metadata = { ...structuredClone(PAYLOAD), ...original.metadata.request, peers: structuredClone(original.metadata.peers),
    clientTicketObservation: { client: "e".repeat(16), maxTicket: 101, samples: 4 } };
  const children = childObservation(original.children);
  assert.throws(() => compareCurrentSchematicRenameSavedObservations(source, f.after, PAYLOAD, children));
  assert.throws(() => compareCurrentSchematicRenameSavedObservations(source, f.after, { ...metadata, peers: metadata.peers.slice(0, 1) }, children), /metadata/u);
  assert.throws(() => compareCurrentSchematicRenameSavedObservations(source, f.after,
    { ...metadata, runtimeObservation: { ...metadata.runtimeObservation, actor: { ...ACTOR, username: "other" } } }, children), /actor/u);
  assert.throws(() => compareCurrentSchematicRenameSavedObservations(source, f.after, metadata, childObservation(f.children)), /metadata/u);
  for (const kind of ["ast", "tempAst"] as const) {
    const changed = childObservation(original.children);
    for (const sample of changed.samples) { sample[kind].schematic.sort = []; }
    assert.throws(() => compareCurrentSchematicRenameSavedObservations(source, f.after, metadata, changed));
  }
});
void test("SCH later SQL needs a distinct completed reader and every SQL cell unchanged, without claiming closure", async () => {
  const f = await setup();
  const source = await prepareCurrentSchematicRenameSavedSource(f.preparation, f.baseline.before, f.baseline.metadata, f.children, f.effect, f.after);
  const later = await inventory(f.baseline.path);
  const result = await compareCurrentSchematicRenameLaterSql(source, f.after, later);
  assert.equal(result["completeLaterSqlUnchanged"], true); noAuthority(result);
  await assert.rejects(compareCurrentSchematicRenameLaterSql(source, f.after, f.after), /distinct/u);
  await assert.rejects(compareCurrentSchematicRenameLaterSql(source, f.after, structuredClone(later)), /original/u);
  await assert.rejects(compareCurrentSchematicRenameLaterSql(source, f.after, f.baseline.before), /complete later SQL/u);
  mutate(f.baseline.path, "UPDATE resources SET dataStr='unrelated change'");
  const changed = await inventory(f.baseline.path);
  await assert.rejects(compareCurrentSchematicRenameLaterSql(source, f.after, changed), /complete later SQL/u);
});
void test("SCH saved-read eligibility rejects an existing old-name collision before a future writer", async () => {
  const f = await schematicBaseline();
  const decoded = await decodeCurrentSymbolPreEditHistory(f.before, { projectUuid: TARGET.projectUuid, branchUuid: TARGET.branchUuid });
  const chunk = decoded.chunks[0]; assert.ok(chunk !== undefined);
  const duplicate = encrypted(chunk.replace('"Peer SCH"', '"Source SCH"'), IDS.oldHead, IDS.oldKey);
  mutate(f.path, `UPDATE history_data SET dataStr='${duplicate}' WHERE id=7;
    UPDATE project_structures SET structure=json_set(structure,'$.schematics.${IDS.peer}.name','Source SCH')`);
  const before = await inventory(f.path), metadata = await prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: REQUEST.desiredTitle });
  assert.throws(() => { assertCurrentSchematicRenameSavedReadEligibility(metadata, before); }, /unique original normalized name/u);
  assert.throws(() => { assertCurrentSchematicRenameSavedReadEligibility(structuredClone(f.metadata), f.before); }, /original/u);
});
