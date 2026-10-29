import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { inspectManagedPcbStackRules } from "../src/managed-pcb-stack-rules.ts";
import type { ManagedPcbStackRuleSource } from "../src/managed-pcb-stack-rules.ts";

const UUID = "1234567890abcdef";
function hash(sourceText: string): string { return createHash("sha256").update(sourceText, "utf8").digest("hex"); }
function item(documentSource: string): ManagedPcbStackRuleSource {
  return { member: "fixture.epru", documentSource, sha256: hash(documentSource), documentUuid: UUID };
}
function row(kind: string, id: string, body: Record<string, unknown>): string {
  return `${JSON.stringify({ type: kind, id, ticket: 1 })}||${JSON.stringify(body)}`;
}
function source(extra: readonly string[] = []): string {
  return [`{"type":"DOCHEAD"}||{"docType":"PCB","uuid":"${UUID}"}`, row("LAYER", '["LAYER",1]', { layerId: 1, layerName: "Top", layerType: "TOP", use: true }),
    row("LAYER_PHYS", '["LAYER_PHYS",1]', { material: "Cu", thickness: 1.4, zIndex: 0, permittivity: null, future: "保留😀" }),
    row("RULE", '["RULE","TRACK","fine"]', { ruleState: "DEFAULT", ruleContext: { unit: "mil", nested: [1, 2, 3] } }),
    row("RULE", '["RULE","AUTO_ROUTER","route"]', { ruleState: "NORMAL", ruleContext: { layers: [1, 2] } }),
    row("RULE_SELECTOR", '["RULE_SELECTOR",["NET","VCC"]]', { ruleSelect: ["NET", "VCC"], ruleOrder: ["BETWEEN", "CLASS"], ruleKeyValue: { TRACK: "fine" }, opaque: null }),
    row("FUTURE_RECORD", "future", { retained: true }), ...extra].join("|\n");
}
function records(result: Record<string, unknown>): Record<string, unknown>[] {
  const value = result["records"]; assert.ok(Array.isArray(value));
  return value.map(entry => { assert.ok(isRecord(entry)); return entry; });
}

void test("supplied native PCB report retains physical fields, all14family slots, nonempty selectors and exact raw ordering", () => {
  const supplied = source(); const result = inspectManagedPcbStackRules(item(supplied), 0, 16);
  assert.equal(result["recordCount"], 7); assert.equal(result["totalSelectedRecords"], 5);
  assert.equal(result["completeRecordsReturned"], true);
  assert.equal(result["effectiveRulesEvaluated"], false); assert.equal(result["physicalStackVerified"], false);
  assert.equal(result["loadedStateVerified"], false); assert.equal(result["executionAuthorized"], false);
  const families = result["ruleFamilyCounts"]; assert.ok(isRecord(families)); assert.equal(Object.keys(families).length, 14);
  assert.equal(families["TRACK"], 1); assert.equal(families["AUTO_ROUTER"], 1); assert.equal(families["SAFE"], 0);
  const page = records(result); assert.deepEqual(page.map(entry => entry["recordType"]), ["LAYER", "LAYER_PHYS", "RULE", "RULE", "RULE_SELECTOR"]);
  const original = supplied.split("|\n");
  for (const entry of page) {
    assert.equal(entry["recordText"], original[Number(entry["recordIndex"])]);
    assert.equal(entry["recordSha256"], hash(String(entry["recordText"])));
  }
  assert.match(String(page[1]?.["recordText"]), /保留😀/u);
  assert.match(String(page[4]?.["recordText"]), /ruleOrder.*BETWEEN/u);
  const selectors = inspectManagedPcbStackRules(item(supplied), 0, 16, "selectors"), stack = inspectManagedPcbStackRules(item(supplied), 0, 16, "stack");
  assert.deepEqual(records(stack).map(entry => entry["recordType"]), ["LAYER", "LAYER_PHYS"]);
  assert.deepEqual(records(selectors).map(entry => entry["recordType"]), ["RULE_SELECTOR"]);
});

void test("ordinary PCB1.x source exposes raw rows without parser migration, default repair or numeric normalization", () => {
  const supplied = '\uFEFF["DOCTYPE","PCB","1.7"]\r\n["HEAD",{"title":"fixture"}]\r\n["LAYER",101,"SUBSTRATE","Core",0]\r\n["LAYER_PHYS",101,"FR4",-0,null,null,1]\r\n["RULE","FUTURE","extra","NORMAL",{"opaque":true}]\r\n["RULE_SELECTOR",["NET_CLASS","Power"],[],{"TRACK":"thin"}]\r\n["RULE",3,"legacy",1,[]]\r\n["RULE","12","legacy-route",0,[]]\r\n';
  const result = inspectManagedPcbStackRules({ ...item(supplied), documentUuid: null }, 0, 16);
  assert.equal(result["sourceVersion"], "1.7");
  assert.match(String(records(result)[1]?.["recordText"]), /,-0,/u);
  assert.deepEqual(result["unknownRuleFamilyCounts"], { FUTURE: 1 });
  assert.match(String(records(result)[0]?.["recordText"]), /101/u);
  assert.equal(result["numericConvention"], "exact-raw-record-text;no-unit-or-layer-id-normalization");
  const page = records(result); assert.equal(page[4]?.["ruleFamily"], "TRACK"); assert.equal(page[4]?.["ruleFamilyRaw"], 3);
  assert.equal(page[5]?.["ruleFamily"], "AUTO_ROUTER"); assert.equal(page[5]?.["ruleFamilyRaw"], "12");
  const families = result["ruleFamilyCounts"]; assert.ok(isRecord(families)); assert.equal(families["TRACK"], 1); assert.equal(families["AUTO_ROUTER"], 1);
});

void test("whole source is checked before an early page, with digest, duplicate, history and header refusals", () => {
  const supplied = source();
  assert.throws(() => inspectManagedPcbStackRules({ ...item(supplied), sha256: "0".repeat(64) }, 0, 1), /digest/u);
  assert.throws(() => inspectManagedPcbStackRules({ ...item(supplied), documentUuid: "0".repeat(16) }, 0, 1), /identity/u);
  for (const extra of [row("LAYER", '["LAYER",1]', { layerId: 1 }), '{"type":"RULE","id":"x"}||null',
    row("EDIT_HEAD", "history", {}), row("DOCHEAD", "another", { docType: "PCB" }), '{"type":"FUTURE","id":"bad"}||{"x":1,"x":2}']) {
    assert.throws(() => inspectManagedPcbStackRules(item(source([extra])), 0, 1));
  }
  assert.throws(() => inspectManagedPcbStackRules(item(supplied), -1, 1), /bounds/u);
  assert.throws(() => inspectManagedPcbStackRules(item(supplied), 6, 1), /offset/u);
  assert.throws(() => inspectManagedPcbStackRules(item(supplied), 0, 17), /bounds/u);
  assert.throws(() => inspectManagedPcbStackRules(item('["DOCTYPE","PCB","2.0"]\n["HEAD",{}]'), 0, 1), /header/u);
});

void test("pages never truncate a selected record, and preserve bounded progress and trailing delimiter", () => {
  const supplied = `${source()}|\n`; const first = inspectManagedPcbStackRules(item(supplied), 0, 2);
  assert.equal(first["nextOffset"], 2); assert.equal(first["endOfRecords"], false);
  const second = inspectManagedPcbStackRules(item(supplied), 2, 16);
  assert.equal(second["nextOffset"], 5); assert.equal(second["endOfRecords"], true);
  const oversized = source([row("RULE", '["RULE","SAFE","large"]', { ruleContext: "x".repeat(40_000) })]);
  assert.throws(() => inspectManagedPcbStackRules(item(oversized), 5, 1), /source pages/u);
  const partial = inspectManagedPcbStackRules(item(oversized), 0, 16);
  assert.equal(partial["nextOffset"], 5); assert.equal(partial["endOfRecords"], false);
});
