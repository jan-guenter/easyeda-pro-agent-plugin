import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { buildDesignNativeAdapter } from "../src/design-native-adapter.ts";
import { buildDesignBatchAdapter } from "../src/design-batch-adapter.ts";
import { buildDesignRulePublicAdapter } from "../src/design-rule-public-adapter.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { verifyRulePersistence } from "../src/rule-persistence.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "rules-fixture", docType: "PCB", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
const BEFORE = snapshot([...["A", "B", "C", "D"].map((name): NativeSourceObject => ({ id: JSON.stringify(["NET", name]), type: "NET", body: { netName: name, netType: null, differentialName: null, equalLengthGroupName: null, isPositiveNet: false, specialColor: null } })), { id: "opaque", type: "FUTURE", body: { untouched: [1, 2, 3] } }]);
const CREATE = { id: "class", action: "pcb.netclass.create", name: "CONTROL", nets: ["A", "B"], color: null };
function source(state: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(state.document)}|\n${state.objects.map((record) => `${JSON.stringify({ type: record.type, id: record.id })}||${JSON.stringify(record.body)}|\n`).join("")}`;
}

function checkpoint(state: NativeSourceSnapshot, omit: readonly string[] = []): NativeHistorySnapshot {
  const base = { uuid: "rules-fixture", docType: "PCB", metadata: state.document, records: state.objects.filter((record) => !omit.includes(record.id)) };
  const documents = [{ ...base, records: base.records.map((record) => ({ ...record, ticket: 1, client: null })), semanticSha256: sha256Json(base) }];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "11".repeat(32), branchUuid: "22".repeat(16), headHistoryUuid: "33".repeat(16), checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

void test("typed rules use persisted public calls, with exact source guards and no source setter", async () => {
  const adapter = buildDesignNativeAdapter(CREATE, BEFORE);
  assert.ok(adapter);
  assert.equal(adapter.profile, "easyeda-pro-control.pcb-rules-public.v1");
  let calls = 0, current = BEFORE;
  const eda = {
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<{ uuid: string; tabId: string; documentType: number }> => Promise.resolve({ uuid: "rules-fixture", tabId: "tab", documentType: 3 }) },
    sys_FileManager: { getDocumentSource: (): Promise<string> => Promise.resolve(source(current)), setDocumentSource: (): never => { throw new Error("Must never use non-persisting rule source apply"); } },
    pcb_Drc: { getCurrentRuleConfiguration: (): Promise<unknown> => Promise.resolve({ NetDifferentails: [], Rule: {} }), createNetClass: (name: string, nets: string[], color: unknown): Promise<boolean> => { assert.equal(name, "CONTROL"); assert.deepEqual([...nets], ["A", "B"]); assert.equal(color, null); current = adapter.expected; calls += 1; return Promise.resolve(true); } },
  };
  const run = (): unknown => runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='rules-fixture', EXPECTED_TAB_ID='tab', EXPECTED_DOCUMENT_TYPE=3;${adapter.code}})()`, { eda });
  assert.equal(await run(), true);
  assert.equal(calls, 1);
  await assert.rejects(Promise.resolve(run()), /baseline changed/u);
  assert.equal(calls, 1);
});

void test("native member reset and configured rename are refused before dispatch", () => {
  const override = snapshot([...BEFORE.objects, { id: '["RULE_SELECTOR",["NET","A"]]', type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: { TRACK: "wide" }, copperValue: {}, innerPlaneValue: {} } }]);
  assert.throws(() => buildDesignRulePublicAdapter(CREATE, override), /reset a member rule override/u);
  const created = buildDesignRulePublicAdapter(CREATE, BEFORE).expected;
  const configuredRecords = structuredClone(created.objects);
  for (const record of configuredRecords) { if (record.id === '["RULE_SELECTOR",["NET_CLASS","CONTROL"]]') { record.body["ruleKeyValue"] = { TRACK: "wide" }; } }
  const configured = snapshot(configuredRecords);
  assert.throws(() => buildDesignRulePublicAdapter({ id: "rename", action: "pcb.netclass.rename", name: "CONTROL", newName: "OTHER" }, configured), /recreates its rule selector/u);
  assert.throws(() => buildDesignBatchAdapter({ id: "mixed", action: "pcb.batch", operations: [CREATE] }, override), /reset a member rule override/u);
});

void test("pair manager's unchanged-selector deletion gets a separate fixed persistence completion", async () => {
  const pair = { id: "pair", action: "pcb.differential-pair.create", name: "PAIR", positiveNet: "A", negativeNet: "B" };
  const adapter = buildDesignRulePublicAdapter(pair, BEFORE);
  let current = BEFORE;
  const calls: string[] = [];
  const result: unknown = runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='rules-fixture', EXPECTED_TAB_ID='tab', EXPECTED_DOCUMENT_TYPE=3;${adapter.code}})()`, { eda: {
    dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ uuid: "rules-fixture", tabId: "tab", documentType: 3 }) },
    sys_FileManager: { getDocumentSource: () => Promise.resolve(source(current)) },
    pcb_Drc: { getNetRules: () => Promise.resolve([{ retained: true }]), createDifferentialPair: () => { calls.push("pair"); current = adapter.expected; return Promise.resolve(true); }, overwriteNetRules: (rules: { retained: boolean }[]) => { assert.equal(rules[0]?.retained, true); calls.push("persist"); return Promise.resolve(true); } },
  } });
  assert.equal(await result, true);
  assert.deepEqual(calls, ["pair", "persist"]);
});

void test("mixed rule batches retain step order and journaled geometry IDs", async () => {
  const line = { id: "line", action: "pcb.line.create", properties: { net: "A", layer: 1, startX: 0, startY: 0, endX: 10, endY: 0, lineWidth: 6, primitiveLock: false } };
  const classAdapter = buildDesignRulePublicAdapter(CREATE, BEFORE);
  const batch = buildDesignBatchAdapter({ id: "mixed", action: "pcb.batch", operations: [CREATE, line] }, BEFORE);
  let current = BEFORE;
  const calls: string[] = [];
  const result: unknown = runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='rules-fixture', EXPECTED_TAB_ID='tab', EXPECTED_DOCUMENT_TYPE=3;${batch.code}})()`, { eda: {
    dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ uuid: "rules-fixture", tabId: "tab", documentType: 3 }) },
    sys_FileManager: { getDocumentSource: () => Promise.resolve(source(current)), setDocumentSource: (next: string) => { calls.push("geometry"); current = parseDocumentSource(next); return Promise.resolve(true); } },
    pcb_Drc: { getCurrentRuleConfiguration: () => Promise.resolve({ NetDifferentails: [], Rule: {} }), createNetClass: () => { calls.push("class"); current = classAdapter.expected; return Promise.resolve(true); } },
  } });
  assert.equal(await result, true);
  assert.deepEqual(calls, ["class", "geometry"]);
  assert.equal(current.sha256, batch.expected.sha256);
  assert.equal(current.objects.some((record) => record.id === batch.createdIds["line"]), true);
});

void test("collection writers remain positional and reject known full-setter collateral before dispatch", () => {
  const before = snapshot([...BEFORE.objects, { id: '["RULE","SAFE","default"]', type: "RULE", body: { ruleState: "DEFAULT", ruleContext: {} } }]);
  const operation = { id: "between", action: "pcb.rules.net-to-net.replace", value: { "Safe Spacing": [{ net1: { type: "net", name: "A" }, net2: { type: "net", name: "B" }, rule: "default", copperRuleName: null, planeRuleName: null }], "Creepage Distance": [] } };
  const adapter = buildDesignRulePublicAdapter(operation, before);
  assert.match(adapter.code, /eda\.pcb_Drc\.overwriteNetByNetRules\(/u);
  const modified = structuredClone(before.objects);
  for (const record of modified) { if (record.id === '["NET","A"]') { record.body["differentialName"] = "pair"; } }
  const guarded = snapshot([...modified, { id: '["RULE_SELECTOR",["NET","A"]]', type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: { DIFFER_ENTAIL: "member-override" }, copperValue: {}, innerPlaneValue: {} } }]);
  assert.throws(() => buildDesignRulePublicAdapter(operation, guarded), /individual pair-member physics/u);
});

void test("public rule materialization accepts only exact previously-exported known upload records", () => {
  const id = '["RULE_SELECTOR",["NET","A"]]';
  const before = snapshot([...BEFORE.objects, { id, type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} } }]);
  const after = buildDesignRulePublicAdapter(CREATE, before).expected;
  const input = { before: checkpoint(before, [id]), after: checkpoint(after), expectedBefore: before, expectedAfter: after };
  const proof = verifyRulePersistence(input, CREATE);
  assert.equal(proof["ok"], true);
  const badRecords = structuredClone(after.objects);
  for (const record of badRecords) { if (record.id === id) { record.body["ruleKeyValue"] = { TRACK: "unexpected" }; } }
  assert.throws(() => verifyRulePersistence({ ...input, after: checkpoint(snapshot(badRecords)) }, CREATE), /differs/u);
  const unrelated = { id: "unrelated", type: "FUTURE", body: { untouched: true } };
  const sourceBefore = snapshot([...before.objects, unrelated]);
  const sourceAfter = buildDesignRulePublicAdapter(CREATE, sourceBefore).expected;
  assert.throws(() => verifyRulePersistence({ before: checkpoint(sourceBefore, [id, unrelated.id]), after: checkpoint(sourceAfter), expectedBefore: sourceBefore, expectedAfter: sourceAfter }, CREATE), /unchanged or export-invisible/u);
  const customId = '["RULE_SELECTOR",["NET","C"]]';
  const withCustom = snapshot([...before.objects, { id: customId, type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: { TRACK: "unsaved-custom" }, copperValue: {}, innerPlaneValue: {} } }]);
  const afterCustom = buildDesignRulePublicAdapter(CREATE, withCustom).expected;
  assert.throws(() => verifyRulePersistence({ before: checkpoint(withCustom, [id, customId]), after: checkpoint(afterCustom), expectedBefore: withCustom, expectedAfter: afterCustom }, CREATE), /unchanged or export-invisible/u);
});
