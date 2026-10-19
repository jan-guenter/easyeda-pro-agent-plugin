/** Isolated synthetic SQL and supplied data only; no native app or live writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_CHILD_LIMITATIONS, parseCurrentSchematicChildObservation } from "../src/current-schematic-child-roster-contract.ts";
import type { CurrentSchematicChildObservation } from "../src/current-schematic-child-roster-contract.ts";
import { compareCurrentSchematicChildRoster, prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import type { CurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { prepareCurrentSchematicNativeMetadata } from "../src/current-schematic-native-metadata.ts";
import { decodeCurrentSymbolPreEditHistory } from "../src/symbol-sql-comparator.ts";
import { REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { IDS, encrypted, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SECOND = "d".repeat(16), SHEET = "c".repeat(16), SYMBOL = "f".repeat(16);
function record(identity: unknown, body?: unknown): string { return `${JSON.stringify(identity)}||${body === undefined ? "" : JSON.stringify(body)}`; }
function header(uuid: string, docType: string): Record<string, unknown> {
  return { docType, client: "b".repeat(16), uuid, updateTime: 1, version: "1", editVersion: "3.0" };
}
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function observation(prepared: CurrentSchematicChildRoster): CurrentSchematicChildObservation {
  const sample = { childKv: structuredClone(prepared.childKv), manager: { prjUuid: TARGET.projectUuid, batchDepth: 0 as const,
    _isClose: false as const, pendingSchematics: null, pendingSheets: null },
  ast: { isBuild: true as const, isPass: false as const, transId: 1, lastModify: 1, schematic: structuredClone(prepared.targetAst) },
  tempAst: { isBuild: false as const, isPass: false as const, transId: 1, schematic: structuredClone(prepared.targetAst) } };
  return { profile: "private.current-schematic-child-roster-observation.v1", target: { ...TARGET }, samples: [sample, structuredClone(sample)] };
}
async function changed(input: Readonly<{ append?: string; sql?: string; removePage?: boolean }> = {}): Promise<Awaited<ReturnType<typeof schematicBaseline>>> {
  const base = await schematicBaseline(), decoded = await decodeCurrentSymbolPreEditHistory(base.before, { projectUuid: TARGET.projectUuid, branchUuid: TARGET.branchUuid });
  assert.equal(decoded.chunks.length, 1); const raw = decoded.chunks[0]; assert.ok(raw !== undefined);
  const marker = record({ type: "DOCHEAD", ticket: 3 }, header(SHEET, "SCH_PAGE")); const index = raw.indexOf(marker);
  assert.ok(index > 0); const selected = input.removePage === true ? raw.slice(0, index - 2) : raw;
  mutate(base.path, [`UPDATE history_data SET dataStr=${literal(encrypted(`${selected}${input.append === undefined ? "" : `|\n${input.append}`}`, IDS.oldHead, IDS.oldKey))} WHERE id=7`,
    ...(input.sql === undefined ? [] : [input.sql])].join(";"));
  const before = await inventory(base.path), metadata = await prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: REQUEST.desiredTitle });
  return { path: base.path, before, metadata };
}
void test("SCH child roster binds original complete SQL, target AST and supplied settled samples without authority", async () => {
  const { before, metadata } = await schematicBaseline(), prepared = await prepareCurrentSchematicChildRoster(metadata, before), raw = observation(prepared);
  const child = prepared.childKv[SHEET]; assert.ok(child !== undefined);
  assert.deepEqual(child, { uuid: SHEET, project_uuid: TARGET.projectUuid, schematic_uuid: IDS.target, title: "child title", display_title: "Child title",
    docType: 1, zIndex: 0, source: "", version: "1", updateTime: 1, ticket: 3 });
  assert.deepEqual(prepared.targetAst.sort, [SHEET]); assert.deepEqual(prepared.startupInput, { sheetUuids: [SHEET], templates: [] });
  assert.ok(Object.isFrozen(prepared)); assert.ok(Object.isFrozen(prepared.childKv[SHEET])); assert.ok(Object.isFrozen(prepared.targetAst.sort));
  const result = compareCurrentSchematicChildRoster(prepared, before, raw);
  assert.equal(result["historicalChildRosterMatched"], true); assert.equal(result["targetAstMembershipAndOrderMatched"], true);
  for (const key of Object.keys(CURRENT_SCHEMATIC_CHILD_LIMITATIONS)) { assert.equal(result[key], false); }
  for (const key of ["doc_id", "uniqueNumber", "geometry"]) { assert.equal(Object.hasOwn(child, key), false); }
  assert.ok(Object.isFrozen(parseCurrentSchematicChildObservation(raw).samples[0].childKv));
});
void test("SCH child raw data tickets retain tombstones, ignore DOCHEAD ticket and order by unique zIndex", async () => {
  const second = { uuid: SECOND, title: "Second", schematic_uuid: IDS.target, zIndex: -1, source: "", version: "1", updateTime: 1 };
  const { before, metadata } = await changed({ append: [record({ type: "LINE", ticket: 17, id: "gone" }, { x: 1 }),
    record({ type: "LINE", ticket: 18, id: "gone" }), record({ type: "DOCHEAD", ticket: 1000 }, header(SHEET, "SCH_PAGE")),
    record({ type: "DOCHEAD", ticket: 4 }, header(SECOND, "SCH_PAGE")),
    record({ type: "META", id: "META", ticket: 4 }, { title: "Second", schematic: IDS.target, source: "", zIndex: -1 })].join("|\n"),
  sql: `UPDATE project_structures SET structure=json_set(structure,'$.sheets.${SECOND}',json(${literal(JSON.stringify(second))}))` });
  const prepared = await prepareCurrentSchematicChildRoster(metadata, before);
  assert.equal(prepared.childKv[SHEET]?.ticket, 18); assert.deepEqual(prepared.targetAst.sort, [SECOND, SHEET]);
  assert.equal(Object.keys(prepared.childKv).length, 2); compareCurrentSchematicChildRoster(prepared, before, observation(prepared));
  const swapped = observation(prepared);
  for (const sample of swapped.samples) { sample.ast.schematic.sort.reverse(); sample.tempAst.schematic.sort.reverse(); }
  assert.throws(() => compareCurrentSchematicChildRoster(prepared, before, swapped), /membership\/count\/order/u);
});
void test("SCH child contracts preserve original reader/metadata/preparation identity", async () => {
  const { before, metadata, path } = await schematicBaseline(), prepared = await prepareCurrentSchematicChildRoster(metadata, before);
  const other = await inventory(path); assert.equal(other.logicalSha256, before.logicalSha256);
  await assert.rejects(prepareCurrentSchematicChildRoster(structuredClone(metadata), before), /original SQL metadata/u);
  await assert.rejects(prepareCurrentSchematicChildRoster(metadata, other), /original SQL metadata/u);
  assert.throws(() => compareCurrentSchematicChildRoster(structuredClone(prepared), before, observation(prepared)), /original prepared/u);
  assert.throws(() => compareCurrentSchematicChildRoster(prepared, other, observation(prepared)), /original prepared/u);
});
void test("SCH complete KV and both AST memberships/counts/order are required", async () => {
  const { before, metadata } = await schematicBaseline(), prepared = await prepareCurrentSchematicChildRoster(metadata, before);
  const changes: ((value: CurrentSchematicChildObservation) => void)[] = [value => { assert.ok(Reflect.deleteProperty(value.samples[0].childKv, SHEET)); },
    value => { const child = value.samples[0].childKv[SHEET]; assert.ok(child !== undefined); child.ticket += 1; },
    value => { const child = value.samples[0].childKv[SHEET]; assert.ok(child !== undefined); value.samples[0].childKv[SECOND] = { ...child, uuid: SECOND }; },
    value => { value.samples[0].ast.schematic.sort = []; }, value => { value.samples[0].tempAst.schematic.sort = [SHEET, SHEET]; },
    value => { assert.ok(Reflect.deleteProperty(value.samples[0].ast.schematic.sheets, SHEET)); },
    value => { value.samples[0].tempAst.schematic.sheets[SECOND] = { uuid: SECOND, title: "extra", displayTitle: "Extra", zIndex: 1 }; },
    value => { value.samples[0].ast.schematic.displayTitle = "Changed"; },
    value => { value.samples[0].manager.prjUuid = "e".repeat(64); }, value => { value.target.schematicUuid = IDS.peer; }];
  for (const change of changes) {
    const raw = observation(prepared); change(raw); raw.samples[1] = structuredClone(raw.samples[0]);
    assert.throws(() => compareCurrentSchematicChildRoster(prepared, before, raw), /differs/u);
  }
});
void test("SCH holder data rejects unsettled, mismatched, sparse and authority-bearing claims", async () => {
  const { before, metadata } = await schematicBaseline(), prepared = await prepareCurrentSchematicChildRoster(metadata, before), raw = observation(prepared);
  const sample = raw.samples[0];
  const changes = [{ ...sample, manager: { ...sample.manager, batchDepth: 1 } }, { ...sample, manager: { ...sample.manager, _isClose: true } },
    { ...sample, manager: { ...sample.manager, pendingSheets: [] } }, { ...sample, manager: { ...sample.manager, CBB: true } },
    { ...sample, ast: { ...sample.ast, isPass: true } }, { ...sample, tempAst: { ...sample.tempAst, isBuild: true } },
    { ...sample, tempAst: { ...sample.tempAst, transId: 2 } }, { ...sample, ast: { ...sample.ast, lastModify: -0 } }];
  for (const replacement of changes) { assert.throws(() => parseCurrentSchematicChildObservation({ ...raw, samples: [replacement, replacement] })); }
  assert.throws(() => parseCurrentSchematicChildObservation({ ...raw, producerBindingVerified: true }));
  const drift = observation(prepared); drift.samples[1].ast.lastModify += 1; assert.throws(() => parseCurrentSchematicChildObservation(drift));
  const sparse: unknown[] = []; sparse.length = 2; assert.throws(() => parseCurrentSchematicChildObservation({ ...raw, samples: sparse }), /dense/u);
  for (const CBB of [false, null, 0] as const) {
    const settled = observation(prepared); for (const entry of settled.samples) { entry.manager.CBB = CBB; entry.manager.pendingSchematics = []; entry.manager.pendingSheets = []; }
    compareCurrentSchematicChildRoster(prepared, before, settled);
  }
});
void test("SCH own-data decoder rejects nested accessors and Proxies before executing any trap", async () => {
  const { before, metadata } = await schematicBaseline(), prepared = await prepareCurrentSchematicChildRoster(metadata, before); let calls = 0;
  const trap = (): never => { calls += 1; throw new Error("must not execute"); };
  const raw = observation(prepared); const hostile = Object.defineProperty({ ...raw }, "target", { get: trap });
  assert.throws(() => parseCurrentSchematicChildObservation(hostile), /accessor/u);
  for (const value of [new Proxy(raw, { getPrototypeOf: trap, ownKeys: trap, getOwnPropertyDescriptor: trap }),
    { ...raw, target: new Proxy(raw.target, { getPrototypeOf: trap, ownKeys: trap, getOwnPropertyDescriptor: trap }) },
    { ...raw, samples: new Proxy(raw.samples, { getPrototypeOf: trap, ownKeys: trap, getOwnPropertyDescriptor: trap }) }]) {
    assert.throws(() => parseCurrentSchematicChildObservation(value), /plain own data/u);
  }
  const revoked = Proxy.revocable(raw, {}); revoked.revoke(); assert.throws(() => parseCurrentSchematicChildObservation(revoked.proxy), /plain own data/u);
  assert.equal(calls, 0);
});
void test("SCH preparation refuses missing/extra tree rows, reuse, tied order and zero-page lazy managers", async () => {
  for (const sql of [`UPDATE project_structures SET structure=json_remove(structure,'$.sheets.${SHEET}')`,
    `UPDATE project_structures SET structure=json_set(structure,'$.sheets.${SHEET}.title','Changed')`,
    `UPDATE project_structures SET structure=json_set(structure,'$.blockSymbols.${SYMBOL}',json('{}'))`]) {
    const { before, metadata } = await changed({ sql }); await assert.rejects(prepareCurrentSchematicChildRoster(metadata, before));
  }
  const second = { uuid: SECOND, title: "Second", schematic_uuid: IDS.target, zIndex: 0, source: "", version: "1", updateTime: 1 };
  const tied = await changed({ append: [record({ type: "DOCHEAD", ticket: 4 }, header(SECOND, "SCH_PAGE")),
    record({ type: "META", id: "META", ticket: 4 }, { title: "Second", schematic: IDS.target, source: "", zIndex: 0 })].join("|\n"),
  sql: `UPDATE project_structures SET structure=json_set(structure,'$.sheets.${SECOND}',json(${literal(JSON.stringify(second))}))` });
  await assert.rejects(prepareCurrentSchematicChildRoster(tied.metadata, tied.before), /equal-zIndex/u);
  const empty = await changed({ removePage: true, sql: `UPDATE project_structures SET structure=json_remove(structure,'$.sheets.${SHEET}')` });
  await assert.rejects(prepareCurrentSchematicChildRoster(empty.metadata, empty.before), /empty lazy managers/u);
});
void test("SCH preparation preserves inherited, reparenting, block-symbol and unsupported startup exclusions", async () => {
  for (const data of [{ title: "Reuse", source: "", docType: 17 }, { title: "Template", source: "inherited", docType: 2 }]) {
    const baseline = await changed({ append: [record({ type: "DOCHEAD", ticket: 4 }, header(SYMBOL, "SYMBOL")),
      record({ type: "META", ticket: 4, id: "META" }, data)].join("|\n") });
    await assert.rejects(prepareCurrentSchematicChildRoster(baseline.metadata, baseline.before), /library origin or block-symbol/u);
  }
  for (const data of [{ title: "Child title", schematic: IDS.target, source: "inherited", zIndex: 0 },
    { title: "Child title", schematic: IDS.peer, source: "", zIndex: 0 }]) {
    await assert.rejects(changed({ append: record({ type: "META", ticket: 4, id: "META" }, data) }), /ordinary child|reparenting/u);
  }
  const component = await changed({ append: record({ type: "COMPONENT", ticket: 4, id: "component" }, { attrs: { override: true } }) });
  await assert.rejects(prepareCurrentSchematicChildRoster(component.metadata, component.before), /supported no-repair/u);
});

void test("SCH child eligibility admits stored canonical library-origin ordinary templates without fetching them", async () => {
  const origin = `${"a".repeat(32)}|${"b".repeat(32)}`;
  for (const docType of [2, 18, 20]) {
    const baseline = await changed({ append: [record({ type: "COMPONENT", ticket: 4, id: "component" }, { attrs: {}, partId: "part" }),
      record({ type: "ATTR", ticket: 4, id: "symbol-ref" }, { parentId: "component", key: "Symbol", value: SYMBOL }),
      record({ type: "DOCHEAD", ticket: 5 }, header(SYMBOL, "SYMBOL")),
      record({ type: "META", ticket: 5, id: "META" }, { title: "Stored library template", source: origin, docType }),
      record({ type: "PART", ticket: 5, id: "part" }, {})].join("|\n") });
    const roster = await prepareCurrentSchematicChildRoster(baseline.metadata, baseline.before);
    assert.deepEqual(roster.startupInput.templates, [{ uuid: SYMBOL, docType, partId: "part" }]);
    assert.equal(Object.keys(roster.childKv).length, 1); assert.equal(roster.executionAuthorized, false);
  }
});

void test("SCH child tree omission stays distinct from the native getter's constant document type", async () => {
  const baseline = await changed();
  const original = JSON.stringify(baseline.before), roster = await prepareCurrentSchematicChildRoster(baseline.metadata, baseline.before);
  assert.equal(roster.childKv[SHEET]?.docType, 1); assert.equal(JSON.stringify(baseline.before), original);
  for (const value of ["null", "1", "2", "'1'"]) {
    const invalid = await changed({ sql: `UPDATE project_structures SET structure=json_set(structure,'$.sheets.${SHEET}.docType',${value})` });
    await assert.rejects(prepareCurrentSchematicChildRoster(invalid.metadata, invalid.before));
  }
});

void test("SCH child eligibility still refuses malformed origins, unknown types and imported reuse blocks", async () => {
  const origin = `${"a".repeat(32)}|${"b".repeat(32)}`;
  for (const data of [{ source: origin, docType: 17 }, { source: origin, docType: 0 }, { source: origin },
    { source: null, docType: 2 }, { docType: 2 }, { source: "a".repeat(32), docType: 2 },
    { source: origin.toUpperCase(), docType: 2 }, { source: `${origin}|extra`, docType: 2 },
    { source: `${"a".repeat(32)}:${"b".repeat(32)}`, docType: 2 }]) {
    const baseline = await changed({ append: [record({ type: "DOCHEAD", ticket: 4 }, header(SYMBOL, "SYMBOL")),
      record({ type: "META", ticket: 4, id: "META" }, { title: "Nonmatching title", ...data })].join("|\n") });
    await assert.rejects(prepareCurrentSchematicChildRoster(baseline.metadata, baseline.before), /library origin or block-symbol/u);
  }
});
