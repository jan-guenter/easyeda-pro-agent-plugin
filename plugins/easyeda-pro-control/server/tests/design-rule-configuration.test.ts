import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { compileDesignOperation } from "../src/design-operations.ts";
import { nativeRuleContext } from "../src/design-rule-configuration.ts";
import { buildExpectedDesignSource, verifyDesignSourceEffect } from "../src/design-source-proof.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { buildDesignRulePublicAdapter } from "../src/design-rule-public-adapter.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "PCB", uuid: "rules-fixture", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...base, sha256: sha256Json(base) };
}
const BASE = snapshot([{ id: '["LAYER",1]', type: "LAYER", body: { layerId: 1 } }, { id: "opaque", type: "FUTURE", body: { retained: [1, 2, 3] } }]);
const header = { editName: "default", unit: "mil", isSetDefault: true };
const width = { status: 1, data: { 1: { minValue: 5, defaultValue: 10, maxValue: 100 } } };
const thermal = { status: 1, data: { 1: { connectMode: 0, lineClearance: 10, lineWidth: 8, lineAngle: 90 } } };
const labels = ["Track", "SMD Pad", "TH Pad", "SMD Test Point", "TH Test Point", "Via", "Fill Region/Teardrop", "Copper/Plane Zone", "Slot Region", "Line", "Text/Image", "Board Outline", "Hole"];
const scalar = (form: Record<string, unknown>): Record<string, unknown> => ({ default: { ...header, form } });
const configuration = {
  Spacing: {
    "Safe Spacing": { default: { ...header, column: labels.slice(0, 12), row: labels, status: 0, tables: { 1: { status: 1, content: Array.from({ length: 13 }, (_, index) => Array.from({ length: index < 11 ? index + 1 : index }, () => 6)) } } } },
    "Other Spacing": scalar({ device2device: 0, thru2Smd: 0, hole2Hole: 12 }),
    "Creepage Distance": scalar({ creepageDistance: 0, ignoreLayer: true }),
  },
  Physics: {
    Track: scalar(width), "Net Length Range": scalar({ netLengthMin: 0, netLengthMax: 0 }), "Net Length Tolerance": scalar({ netLengthTolerance: 10 }),
    "Differential Pair": scalar({ strokeWidthTables: width, diffPairSpacingTables: { status: 1, data: { 1: { minValue: 6, defaultValue: 8, maxValue: null } } }, differentailPairLenTolerMax: 10 }),
    "Blind/Buried Via": { default: { editName: "default", isSetDefault: true, table: [] } },
    "Via Size": scalar({ viaOuterdiameterMin: 20, viaOuterdiameterDefault: 24, viaOuterdiameterMax: 100, viaInnerdiameterMin: 10, viaInnerdiameterDefault: 12, viaInnerdiameterMax: 50 }),
  },
  Plane: { "Plane Zone": scalar(thermal), "Copper Zone": scalar({ singleLayerPadModel: thermal, multiLayerPadModel: thermal, trackConnectModel: { status: 1, data: { 1: { trackConnectMode: 0 } } } }) },
  Expansion: { "Solder Mask Expansion": scalar({ padToplayerExpansion: 2, padBottomlayerExpansion: 2, viaToplayerExpansion: -1000, viaBottomlayerExpansion: -1000, testPointToplayerExpansion: 2, testPointBottomlayerExpansion: 2 }), "Paste Mask Expansion": scalar({ padToplayerExpansion: 0, padBottomlayerExpansion: 0, testPointToplayerExpansion: -1000, testPointBottomlayerExpansion: -1000 }) },
};

void test("numeric replacement uses the exact PCB service without global configuration writes", async () => {
  const adapter = buildDesignRulePublicAdapter({ id: "rules", action: "pcb.rules.configuration.replace", value: configuration }, BASE);
  let current = BASE, writes = 0;
  const source = (): string => `{"type":"DOCHEAD"}||${JSON.stringify(current.document)}|\n${current.objects.map((record) => `${JSON.stringify({ type: record.type, id: record.id })}||${JSON.stringify(record.body)}|\n`).join("")}`;
  const bus = { messageBus: { rpcCall: (method: string, args: { ruleConfiguration?: unknown }): Promise<unknown> => {
    if (method === "getTabIdAndDocType") { return Promise.resolve({ message: { tabId: "tab", docType: 3 } }); }
    if (method === "FileSource") { return Promise.resolve({ message: source() }); }
    assert.equal(method, "pcb/extensionAPI/drc-overwriteCurrentRuleConfiguration");
    assert.equal(canonicalJson(args), canonicalJson({ ruleConfiguration: configuration }));
    writes += 1; current = adapter.expected; return Promise.resolve({ message: true });
  } } };
  const eda = { dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "rules-fixture", tabId: "tab", documentType: 3 }) }, sys_FileManager: { getDocumentSource: (): Promise<string> => Promise.resolve(source()) }, pcb_Drc: { overwriteCurrentRuleConfiguration: (): never => { throw new Error("Global preset wrapper must not be called"); } } };
  const run = (buses: unknown[]): unknown => runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='rules-fixture',EXPECTED_TAB_ID='tab',EXPECTED_DOCUMENT_TYPE=3;${adapter.code}})()`, { eda, window: { top: { frames: buses.map((entry) => ({ frames: [], MSG_BUS_PCB: entry })) } } });
  await assert.rejects(Promise.resolve(run([bus, { messageBus: bus.messageBus }])), /Duplicate/u);
  assert.equal(writes, 0);
  assert.equal(await run([bus]), true);
  assert.equal(writes, 1);
});

void test("spacing excludes the outline diagonal while preserving all hole cells and exact row order", () => {
  const lengths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 12];
  const content = lengths.map((length, row) => Array.from({ length }, (_, column) => row * 20 + column + 1));
  const row = { ...configuration.Spacing["Safe Spacing"].default, tables: { 1: { status: 1, content } } };
  assert.deepEqual(nativeRuleContext("SAFE", row, BASE), { unit: "mil", isForAll: "ALL", safeSpacing: [{ layerId: 1, isOpen: true, content, columnNames: [] }] });
  const wrong = [
    content.map((cells, index) => index === 11 ? [...cells, 999] : cells),
    content.map((cells, index) => index === 12 ? cells.slice(0, 11) : cells),
  ];
  for (const invalid of wrong) {
    assert.throws(() => nativeRuleContext("SAFE", { ...row, tables: { 1: { status: 1, content: invalid } } }, BASE), /triangle shape/u);
  }
});

void test("all current physical rule families map exact units and retain unrelated source", () => {
  const operation = { id: "rules", action: "pcb.rules.configuration.replace", value: configuration };
  const after = buildExpectedDesignSource(operation, BASE);
  const delta = verifyDesignSourceEffect(compileDesignOperation(operation), BASE, after);
  assert.equal(delta.added.length, 13);
  assert.deepEqual(after.objects.find((entry) => entry.id === '["RULE","RADIUS","default"]')?.body["ruleContext"], { unit: "mil", minRadius: 10, defRadius: 12, maxRadius: 50, minInner: 5, defInner: 6, maxInner: 25 });
  assert.equal(nativeRuleContext("RADIUS", { ...header, form: { viaOuterdiameterMin: 20.00008, viaOuterdiameterDefault: 24, viaOuterdiameterMax: 100, viaInnerdiameterMin: 10, viaInnerdiameterDefault: 12, viaInnerdiameterMax: 50 } }, BASE)["minRadius"], 10);
  assert.deepEqual(nativeRuleContext("TRACK", { ...header, unit: "mm", form: { status: 1, data: { 1: { minValue: 0.127, defaultValue: 0.254, maxValue: 2.54 } } } }, BASE), { unit: "mm", track: { isOpen: true, content: [{ layerId: 1, stroMin: 5, stroDef: 10, stroMax: 100 }] } });
  assert.deepEqual(after.objects.find((entry) => entry.id === "opaque"), BASE.objects.find((entry) => entry.id === "opaque"));
  assert.throws(() => nativeRuleContext("TRACK", { ...header, form: { ...width, typo: true } }, BASE), /unreviewed/u);
  const spacing = configuration.Spacing["Safe Spacing"].default;
  assert.throws(() => nativeRuleContext("SAFE", { ...spacing, column: spacing.column.toReversed() }, BASE), /reordered/u);
});

void test("pair and constraint rules bind existing references and do not change net memberships", () => {
  const before = snapshot([...BASE.objects,
    ...["A", "B"].map((name): NativeSourceObject => ({ id: JSON.stringify(["NET", name]), type: "NET", body: { netName: name, netType: null } })),
    { id: '["RULE","SAFE","default"]', type: "RULE", body: { ruleState: "DEFAULT", ruleContext: {} } },
    { id: "zone", type: "REGION", body: { regionType: "CONSTRAINT", name: "original", locked: false, path: [["R", 0, 0, 100, 100, 0, 0]] } },
  ]);
  const pair = { id: "pair-rule", action: "pcb.rules.net-to-net.replace", value: { "Safe Spacing": [{ net1: { type: "net", name: "A" }, net2: { type: "net", name: "B" }, rule: "default", copperRuleName: null, planeRuleName: null }], "Creepage Distance": [] } };
  const paired = buildExpectedDesignSource(pair, before);
  assert.equal(verifyDesignSourceEffect(compileDesignOperation(pair), before, paired).added.length, 1);
  const region = { id: "zone-rule", action: "pcb.rules.region.replace", value: [{ type: "region", name: "zone", constraintName: "controlled", "Safe Spacing": "default" }] };
  const zoned = buildExpectedDesignSource(region, paired);
  assert.equal(verifyDesignSourceEffect(compileDesignOperation(region), paired, zoned).changed[0]?.after.body["name"], "controlled");
  assert.throws(() => buildExpectedDesignSource({ ...region, value: [{ type: "region", name: "zone", Track: "missing" }] }, paired), /Unknown/u);
  const first = pair.value["Safe Spacing"][0];
  assert.ok(first);
  const reversed = { ...first, net1: first.net2, net2: first.net1 };
  assert.throws(() => buildExpectedDesignSource({ ...pair, value: { ...pair.value, "Safe Spacing": [first, reversed] } }, before), /Duplicate symmetric/u);
  assert.throws(() => buildExpectedDesignSource({ ...pair, value: { ...pair.value, "Creepage Distance": [{ net1: reversed.net1, net2: reversed.net2, rule: null }] } }, before), /orientation/u);
});
