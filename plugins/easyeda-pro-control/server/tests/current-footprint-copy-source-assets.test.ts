/** Synthetic completed-reader source eligibility. No live callbacks or writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { qualifyCurrentFootprintCopySourceAssets, requireCurrentFootprintCopySourceAssets } from "../src/current-footprint-copy-source-assets.ts";
import { currentFootprintCopyV2Rows, prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const client = "a".repeat(16);
const actor = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
const metadata = { title: "Local", description: "Keep Ω", tags: [], source: "https://example.invalid/original-library" };
const canvas = { originX: 0, originY: 0, unit: "mm" };
const pad = { groupId: 0, netName: "", layerId: 1, num: "1", centerX: 0, centerY: 0, padAngle: 0,
  hole: null, defaultPad: { padType: "RECT", width: 30, height: 40, radius: 0 }, specialPad: [],
  padOffsetX: 0, padOffsetY: 0, relativeAngle: null, plated: true, padType: "NORMAL",
  topSolderExpansion: 0, bottomSolderExpansion: 0, topPasteExpansion: 0, bottomPasteExpansion: 0,
  locked: false, zIndex: 0, connectMode: null, spokeSpace: null, spokeWidth: null, spokeAngle: null,
  unusedInnerLayers: [], padLen: 0, attrsMap: {} };
interface Atom { readonly type: string; readonly id: string; readonly body: unknown; }
/** Preserve exact supplied body JSON or an explicit empty tombstone. */
function row(type: string, ticket: number, id: string, body: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${body === null ? "" : JSON.stringify(body)}`;
}
/** Build one original general-purpose plan without narrowing its record bodies. */
async function copyPlan(atoms: readonly Atom[]): Promise<Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>> {
  const db = await fixture();
  const head = (ticket: number): string => `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT",
    client, uuid: IDS.target, updateTime: 300, version: "300", editVersion: "3.2.209", user: actor })}`;
  const records = atoms.map((atom, index) => row(atom.type, index + 10, atom.id, atom.body));
  const raw = [head(100), row("META", 5, "META", metadata), ...records].join("|\n");
  mutate(db.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(db.path), source = await prepareCurrentFootprintSourcePlan(before,
    { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const content = [head(101), row("META", atoms.length + 9, "META", metadata), head(100), ...records].join("|\n");
  return prepareCurrentFootprintCopyV2Plan(before, source, { client, content });
}

void test("strict local primitive bodies qualify while the losing original META source stays preserved", async () => {
  const copy = await copyPlan([{ type: "CANVAS", id: "CANVAS", body: canvas }, { type: "PAD", id: "pad", body: pad },
    { type: "LINE", id: "old-line", body: null }]);
  const qualification = await qualifyCurrentFootprintCopySourceAssets(copy);
  assert.equal(qualification.status, "qualified"); assert.equal(requireCurrentFootprintCopySourceAssets(qualification, copy), qualification);
  if (qualification.status !== "qualified") { assert.fail("canonical primitive bodies should qualify"); }
  assert.equal(qualification.effectiveAssetReferences, 0); assert.equal(qualification.destinationSourceCleared, true);
  assert.equal(copy.sourceMetadata.source, metadata.source); assert.equal(copy.destinationMetadata.source, "");
  assert.ok(currentFootprintCopyV2Rows(copy).some(record => record.includes(metadata.source)));
  assert.equal(qualification.nativeCallbacksBound, false); assert.equal(qualification.uploadCompletionVerified, false); assert.equal(qualification.executionAuthorized, false);
  assert.throws(() => requireCurrentFootprintCopySourceAssets(structuredClone(qualification), copy), /ORIGINAL_QUALIFICATION/u);
  const foreign = await copyPlan([{ type: "CANVAS", id: "CANVAS", body: canvas }, { type: "PAD", id: "pad", body: pad },
    { type: "LINE", id: "old-line", body: null }]);
  assert.throws(() => requireCurrentFootprintCopySourceAssets(qualification, foreign), /ORIGINAL_QUALIFICATION/u);
});

void test("unknown nested fields refuse source eligibility without changing the general plan's lossless bytes", async () => {
  for (const body of [{ ...pad, defaultPad: { ...pad.defaultPad, assetUrl: "https://example.invalid/pad" } },
    { ...pad, attrsMap: { hiddenModel: "asset" } }, { ...pad, source: "external" }]) {
    const copy = await copyPlan([{ type: "PAD", id: "pad", body }]);
    const rows = currentFootprintCopyV2Rows(copy);
    const qualification = await qualifyCurrentFootprintCopySourceAssets(copy);
    assert.equal(qualification.status, "unsupported");
    if (qualification.status !== "unsupported") { assert.fail("opaque nested data cannot qualify"); }
    assert.equal(qualification.reason, "record-body"); assert.equal(qualification.recordId, "pad");
    assert.equal(currentFootprintCopyV2Rows(copy), rows); assert.ok(rows.some(record => record.endsWith(JSON.stringify(body))));
    assert.equal(requireCurrentFootprintCopySourceAssets(qualification, copy), qualification);
  }
});

void test("unreviewed asset families and custom-font fields cannot qualify even when the general source plan accepts them", async () => {
  for (const atom of [{ type: "IMAGE", id: "image", body: { url: "blob-reference" } },
    { type: "FUTURE", id: "future", body: null }, { type: "CANVAS", id: "CANVAS", body: { ...canvas, fontFamily: "custom" } }]) {
    const copy = await copyPlan([atom]), qualification = await qualifyCurrentFootprintCopySourceAssets(copy);
    assert.equal(qualification.status, "unsupported"); assert.equal(copy.executionAuthorized, false);
    assert.equal(qualification.nativeCallbacksBound, false); assert.equal(qualification.executionAuthorized, false);
  }
});
