import assert from "node:assert/strict";
import { test } from "node:test";
import { assertWirePageLoadAuthority, verifyWirePageLoadResult } from "../src/design-execution.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { DesignActionState } from "../src/design-action.ts";

function fixture(reopened = false): DesignActionState {
  const inherited = { id: (reopened ? "b" : "a").repeat(16), key: "Part", value: "R", symbolValue: "R", blockValue: null, instanceValue: null,
    body: { parentId: "part", key: "Part", value: "R", x: null, y: null, zIndex: 1 } };
  const component = { id: "part", kind: "part", locked: false, body: { x: 100, y: 200, rotation: 0, isMirror: false }, pins: [], attributes: [inherited] };
  const records = [{ id: "part", type: "COMPONENT", body: component.body }, { id: "wire", type: "WIRE", body: { zIndex: 2 } }];
  const source = `{"type":"DOCHEAD"}||${JSON.stringify({ uuid: "page", docType: "SCH_PAGE", editVersion: "3.2.149.88089769" })}|\n${records.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  return { source: parseDocumentSource(source), schematic: schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1",
    document: { documentUuid: "page", tabId: "page@project" }, source, components: [component] }) };
}

const topology = [{ uniqueId: "device", designator: "R1", pins: [{ pinNumber: "1", net: "GND" }] }];
function journal(): Parameters<typeof assertWirePageLoadAuthority>[0] {
  const before = fixture();
  assert.ok(before.schematic);
  const context = { project: { uuid: "project", path: "/project.eprj2" }, document: { uuid: "page", tabId: "page@project", documentType: 1 } };
  return { plan: { profile: "easyeda-pro-control.typed-design-transaction.v1", operation: { id: "wire-edit", action: "sch.wire.modify", documentType: 1,
    target: { primitiveId: "wire" }, patch: { line: [0, 0, 10, 0], color: null, lineWidth: 1, lineType: 0 } }, expectedContext: context, expectedFingerprint: {}, expectedTopology: topology },
    context, state: "target-opened-needs-reconciliation", saved: false, reopened: false, orphanedCallPossible: false, hardStop: true,
    before: before.source, beforeNative: before.schematic, beforeTopology: topology, artifacts: [] };
}

void test("restored wire recovery admits original or inherited-ID-only baseline without changing evidence", () => {
  const authority = journal(), current = fixture(true), retained = JSON.stringify({ authority, current });
  assertWirePageLoadAuthority(authority, fixture());
  assertWirePageLoadAuthority(authority, current);
  assertWirePageLoadAuthority({ ...authority, state: "target-open-needs-recovery" }, current);
  verifyWirePageLoadResult(current, structuredClone(current), topology, structuredClone(topology));
  assert.equal(JSON.stringify({ authority, current }), retained);
});

void test("wire page navigation refuses prior intent, Save, correction, incomplete evidence and a changed baseline", () => {
  const authority = journal(), current = fixture(true);
  assert.ok(authority.beforeNative);
  for (const patch of [{ state: "completed" }, { state: "reconciled-no-mutation" }, { state: "layout-pages-loaded-needs-reconciliation" },
    { state: "layout-pages-load-needs-review" }, { state: "target-open-dispatching" }, { orphanedCallPossible: true }, { hardStop: false },
    { saved: true }, { reopened: true }, { after: authority.before }, { afterNative: authority.beforeNative }, { beforeTopology: [] }]) {
    assert.throws(() => { assertWirePageLoadAuthority({ ...authority, ...patch }, current); });
  }
  for (const phase of ["layout-page-load-1-prepared", "layout-page-load-1", "layout-pages-loaded", "save-reopen", "library-save-intent", "reopened",
    "layout-net-label-repair-prepared", "layout-wire-group-repair-apply", "layout-visibility-repair-verified", "inverse"]) {
    assert.throws(() => { assertWirePageLoadAuthority({ ...authority, artifacts: [{ path: `/operation/04-${phase}.json`, bytes: 1, sha256: "c".repeat(64) }] }, current); });
  }
  const missing = journal(); delete missing.beforeNative;
  assert.throws(() => { assertWirePageLoadAuthority(missing, current); });
  const missingIntent = journal(); delete missingIntent.plan.expectedTopology;
  assert.throws(() => { assertWirePageLoadAuthority(missingIntent, current); });
  const missingTopology = journal(); delete missingTopology.beforeTopology;
  assert.throws(() => { assertWirePageLoadAuthority(missingTopology, current); });
  assert.throws(() => { assertWirePageLoadAuthority({ ...authority, plan: { ...authority.plan, operation: { id: "different", action: "sch.wire.delete", documentType: 1, target: { primitiveId: "wire" } } } }, current); });
  assert.throws(() => { assertWirePageLoadAuthority(authority, { ...current, source: { ...current.source, sha256: "d".repeat(64) } }); });
  assert.ok(current.schematic);
  const inherited = current.schematic.components[0]?.attributes[0]; assert.ok(inherited);
  inherited.value = "changed";
  assert.throws(() => { assertWirePageLoadAuthority(authority, current); });
});

void test("after page loading every native field and original endpoint topology must still match", () => {
  const before = fixture(true);
  assert.throws(() => { verifyWirePageLoadResult(before, fixture(), topology, topology); }, /native state changed/u);
  assert.throws(() => { verifyWirePageLoadResult(before, before, topology, []); }, /endpoints differ/u);
  assert.throws(() => { verifyWirePageLoadResult(before, { ...before, source: { ...before.source, sha256: "e".repeat(64) } }, topology, topology); }, /source or native state changed/u);
});
