import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { deriveFootprintBaselineTargets, verifyFootprintBaseline, verifyFootprintEmptyNetPersistence } from "../src/footprint-empty-net-persistence.ts";
import { inverseDesignAction, prepareDesignAction } from "../src/design-action.ts";
import { expectedNativeEmptyNetDefault } from "../src/native-empty-net-default.ts";

const SELECTOR = '["RULE_SELECTOR",["NET",""]]';
const NET = '["NET",""]';
const USER = { uuid: "44".repeat(16), username: "fixture", nickname: "fixture", avatar: "" };
function source(records: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "PCB", uuid: "footprint-fixture", editVersion: "3.2.149.88089769" }, objects: records.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...base, sha256: sha256Json(base) };
}
function checkpoint(state: NativeSourceSnapshot, omitted: readonly string[], user?: unknown): NativeHistorySnapshot {
  const base = { uuid: "footprint-fixture", docType: "FOOTPRINT", metadata: { ...state.document, docType: "FOOTPRINT", ...(user === undefined ? {} : { user }) }, records: state.objects.filter((record) => !omitted.includes(record.id)) };
  const anchor = { uuid: "CONFIG", docType: "CONFIG", metadata: { uuid: "CONFIG", docType: "CONFIG", user: USER }, records: [] };
  const documents = [{ ...base, records: base.records.map((record) => ({ ...record, ticket: 1, client: null })), semanticSha256: sha256Json(base) }, { ...anchor, semanticSha256: sha256Json(anchor) }];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "11".repeat(32), projectOwnerUuid: USER.uuid, branchUuid: "22".repeat(16), headHistoryUuid: "33".repeat(16), checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

void test("footprint export-only selector and exact default NET materialization preserve geometry proof", () => {
  const before = source([{ id: SELECTOR, type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} } }, { id: NET, type: "NET", body: { netType: null, specialColor: null, retLine: true, differentialName: null, isPositiveNet: false, equalLengthGroupName: null } }]);
  const corrected = expectedNativeEmptyNetDefault(before);
  const after = source([...corrected.objects, { id: "line", type: "LINE", body: { layerId: 3, net: "", startX: 0, startY: 0, endX: 10, endY: 0, width: 6 } }]);
  const input = { expectedBefore: before, expectedAfter: after, before: checkpoint(before, [SELECTOR, NET]), after: checkpoint(after, [SELECTOR]) };
  assert.deepEqual(deriveFootprintBaselineTargets(before, after, input.before), []);
  assert.equal(verifyFootprintEmptyNetPersistence(input)["ok"], true);
  assert.throws(() => verifyFootprintEmptyNetPersistence({ ...input, after: checkpoint(after, [SELECTOR, "line"]) }), /intended/u);
  assert.throws(() => verifyFootprintEmptyNetPersistence({ ...input, after: checkpoint(after, []) }), /selector unexpectedly persisted/u);
  const alteredRecords = structuredClone(after.objects);
  for (const record of alteredRecords) { if (record.id === NET) { record.body["specialColor"] = "#123456"; } }
  const altered = source(alteredRecords);
  assert.throws(() => verifyFootprintEmptyNetPersistence({ ...input, after: checkpoint(altered, [SELECTOR]) }), /materialization/u);
  const recovered = verifyFootprintEmptyNetPersistence({ expectedBefore: before, expectedAfter: before, before: input.before, after: checkpoint(before, [SELECTOR]) });
  assert.equal(recovered["ok"], true);
  assert.deepEqual(recovered["footprintEmptyNetStorage"], { schema: "easyeda-pro-control.footprint-empty-net-storage.v1", beforeSourceSha256: before.sha256, afterSourceSha256: before.sha256, beforeCheckpointSemanticSha256: input.before.semanticSha256, afterCheckpointSemanticSha256: checkpoint(before, [SELECTOR]).semanticSha256, exportOnlySelector: SELECTOR, materializedNet: NET, userStamp: null });
  assert.equal(verifyFootprintEmptyNetPersistence({ ...input, after: checkpoint(after, [SELECTOR], USER) })["ok"], true);
  assert.throws(() => verifyFootprintEmptyNetPersistence({ ...input, after: checkpoint(after, [SELECTOR], { ...USER, nickname: "unrelated" }) }), /same-owner baseline/u);
  assert.throws(() => verifyFootprintEmptyNetPersistence({ ...input, after: checkpoint(after, [SELECTOR], { ...USER, uuid: "55".repeat(16) }) }), /identity/u);
});

void test("modified SMD pad proves its exact native whole-record encoding without changing another pad", () => {
  const pad = { groupId: 0, netName: "", layerId: 1, num: "1", centerX: -29.66, centerY: 0, padAngle: 0,
    hole: null, defaultPad: { padType: "RECT", width: 31.751, height: 34.016, radius: 0 }, specialPad: [],
    padOffsetX: 0, padOffsetY: 0, relativeAngle: null, plated: true, padType: "NORMAL",
    topSolderExpansion: 2, bottomSolderExpansion: 2, topPasteExpansion: -3937.008, bottomPasteExpansion: -3937.008,
    locked: false, zIndex: 8, connectMode: null, spokeSpace: null, spokeWidth: null, spokeAngle: null,
    unusedInnerLayers: [], padLen: 0, attrsMap: {} };
  const before = source([{ id: "pad", type: "PAD", body: pad }, { id: "other-pad", type: "PAD", body: { ...pad, num: "2" } },
    { id: "name", type: "ATTR", body: { key: "Footprint", value: "Test", parentId: "", locked: false } },
    { id: "CANVAS", type: "CANVAS", body: { unit: "mm", originX: 0, originY: 0 } }]);
  const storedPad = Object.fromEntries(Object.entries({ ...pad, padOffsetX: 0.005, relativeAngle: 90,
    topPasteExpansion: -3937.0080000000003, bottomPasteExpansion: -3937.0080000000003 }).filter(([key]) => key !== "unusedInnerLayers" && key !== "attrsMap"));
  const durableBefore = source(before.objects.map((record) => record.type === "PAD" ? { ...record, body: { ...storedPad, num: record.body["num"] } } : record));
  const operation = { id: "pad-zero", action: "footprint.pad.modify", target: { primitiveId: "pad" },
    patch: { pad: ["RECT", 40, 34.016, 0], solderMaskAndPasteMaskExpansion: { topSolderMask: 0, bottomSolderMask: 0, topPasteMask: 0, bottomPasteMask: 0 } } };
  const prepared = prepareDesignAction(operation, { source: before, footprintScope: { libraryUuid: "collection", metadataOwnerUuid: "owner", footprintUuid: "footprint-fixture", footprintName: "Test" } }, { targetId: "pad" });
  const after = prepared.expectedSource;
  assert.ok(after);
  const oldCheckpoint = checkpoint(durableBefore, []);
  const targets = deriveFootprintBaselineTargets(before, after, oldCheckpoint);
  assert.deepEqual(targets, [{ id: "pad", fields: ["bottomPasteExpansion", "bottomSolderExpansion", "defaultPad", "topPasteExpansion", "topSolderExpansion"] }]);
  const baseline = verifyFootprintBaseline({ checkpoint: oldCheckpoint, source: before, targets });
  assert.equal(baseline["ok"], true);
  assert.equal(inverseDesignAction(operation, { source: before, history: oldCheckpoint }, { targetId: "pad" }), undefined);
  assert.ok(inverseDesignAction(operation, { source: before, history: checkpoint(before, []) }, { targetId: "pad" }));
  const durableAfter = source(durableBefore.objects.map((record) => record.id === "pad" ? after.objects.find((entry) => entry.id === "pad") ?? record : record));
  const input = { expectedBefore: before, expectedAfter: after, before: oldCheckpoint, after: checkpoint(durableAfter, []) };
  assert.equal(verifyFootprintEmptyNetPersistence(input)["ok"], true);
  // A different pad's identical representation drift is still collateral.
  assert.throws(() => verifyFootprintEmptyNetPersistence({ ...input, after: checkpoint(after, []) }), /unchanged or export-invisible durable record/u);
  for (const patch of [{ relativeAngle: 0 }, { attrsMap: { preserved: true } }, { topPasteExpansion: -3936 }, { padOffsetX: 0.01 }]) {
    const drift = source(before.objects.map((record) => record.id === "pad" ? { ...record, body: { ...record.body, ...patch } } : record));
    assert.throws(() => verifyFootprintBaseline({ checkpoint: oldCheckpoint, source: drift, targets }), /Unreviewed footprint pad/u);
  }
  const unequalRecords = structuredClone(durableBefore.objects);
  for (const record of unequalRecords) { if (record.id === "pad") { record.body["topPasteExpansion"] = -1; } }
  const unequal = source(unequalRecords);
  assert.throws(() => verifyFootprintBaseline({ checkpoint: checkpoint(unequal, []), source: before, targets }), /Unreviewed footprint pad/u);
  assert.throws(() => verifyFootprintEmptyNetPersistence({ ...input, after: oldCheckpoint }), /intended|Intended|outside/u);
});
