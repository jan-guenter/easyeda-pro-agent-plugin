import assert from "node:assert/strict";
import { test } from "node:test";
import { assertLayoutNetLabelRepairAuthority, designTransactionActionSchema, selectDesignPhaseDescriptor } from "../src/design-execution.ts";

void test("layout label correction requires the original settled one-shot journal and unchanged circuit intent", () => {
  const topology = [{ uniqueId: "device", designator: "R1", pins: [{ pinNumber: "1", net: "GND" }] }];
  const createdIds = { label: "a".repeat(16), wire: "b".repeat(16) };
  const journal: Parameters<typeof assertLayoutNetLabelRepairAuthority>[0] = {
    plan: { profile: "easyeda-pro-control.typed-design-transaction.v1", operation: { id: "layout", action: "sch.layout.batch", documentType: 1,
      operations: [{ id: "label", action: "sch.net-label.create", properties: { net: "GND", x: 10, y: 20 } }] },
      expectedContext: { project: { uuid: "project", path: "/project.eprj2" }, document: { uuid: "page", tabId: "page@project", documentType: 1 } }, expectedFingerprint: {}, expectedTopology: topology },
    state: "apply-needs-review", saved: false, reopened: false, orphanedCallPossible: false, hardStop: true,
    context: { project: { uuid: "project", path: "/project.eprj2" }, document: { uuid: "page", tabId: "page@project", documentType: 1 } }, createdIds, beforeTopology: topology, artifacts: [],
  };
  const prepared = { adapterProfile: "easyeda-pro-control.schematic-layout-batch.v1", codeSha256: "c".repeat(64), createdIds };
  const acknowledgment = { ok: true, kind: "typed-design-result", id: "layout", createdId: null, createdIds };
  assertLayoutNetLabelRepairAuthority(journal, prepared, acknowledgment);
  assertLayoutNetLabelRepairAuthority({ ...journal, state: "layout-pages-loaded-needs-reconciliation" }, prepared, acknowledgment);
  assert.throws(() => { assertLayoutNetLabelRepairAuthority({ ...journal, state: "layout-page-load-9-dispatching" }, prepared, acknowledgment); });
  for (const patch of [{ orphanedCallPossible: true }, { saved: true }, { reopened: true }, { hardStop: false }, { state: "applied-unsaved" },
    { artifacts: [{ path: "/operation/04-layout-net-label-repair-prepared.json", bytes: 1, sha256: "d".repeat(64) }] },
    { artifacts: [{ path: "/operation/04-layout-visibility-repair-prepared.json", bytes: 1, sha256: "d".repeat(64) }] },
    { artifacts: [{ path: "/operation/04-layout-visibility-repair-apply.json", bytes: 1, sha256: "d".repeat(64) }] },
    { artifacts: [{ path: "/operation/04-save-reopen.json", bytes: 1, sha256: "d".repeat(64) }] }]) {
    assert.throws(() => { assertLayoutNetLabelRepairAuthority({ ...journal, ...patch }, prepared, acknowledgment); });
  }
  assert.throws(() => { assertLayoutNetLabelRepairAuthority(journal, { ...prepared, createdIds: { label: "wrong" } }, acknowledgment); });
  assert.throws(() => { assertLayoutNetLabelRepairAuthority(journal, prepared, { ...acknowledgment, id: "another" }); });
  assert.throws(() => { assertLayoutNetLabelRepairAuthority({ ...journal, beforeTopology: [] }, prepared, acknowledgment); });
});

void test("visibility correction retains its verified phase for Save recovery without a second dispatch", () => {
  assert.equal(designTransactionActionSchema.parse("repair-layout-label-visibility"), "repair-layout-label-visibility");
  const receipt = { path: "/operation/19-layout-visibility-repair-verified.json", bytes: 500, sha256: "d".repeat(64) };
  assert.equal(selectDesignPhaseDescriptor([receipt], "layout-visibility-repair-verified"), receipt);
  assert.equal(selectDesignPhaseDescriptor([{ ...receipt, path: "/operation/18-layout-visibility-repair-apply.json" }], "layout-visibility-repair-verified"), undefined);
  const duplicate = { ...receipt, path: "/operation/20-layout-visibility-repair-verified.json" };
  assert.throws(() => { selectDesignPhaseDescriptor([receipt, duplicate], "layout-visibility-repair-verified"); }, /ambiguous/u);
});
