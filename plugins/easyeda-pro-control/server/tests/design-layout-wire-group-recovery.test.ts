import assert from "node:assert/strict";
import { test } from "node:test";
import { assertLayoutWireGroupRepairAuthority } from "../src/design-execution.ts";

void test("wire-group correction requires one original settled dispatch and refuses every consumed correction intent", () => {
  const topology = [{ uniqueId: "device", designator: "R1", pins: [{ pinNumber: "1", net: "GND" }] }];
  const createdIds = { wire: "a".repeat(16), drop: "b".repeat(16), flag: "c".repeat(16) };
  const context = { project: { uuid: "project", path: "/project.eprj2" }, document: { uuid: "page", tabId: "page@project", documentType: 1 } };
  const journal: Parameters<typeof assertLayoutWireGroupRepairAuthority>[0] = {
    plan: { profile: "easyeda-pro-control.typed-design-transaction.v1", operation: { id: "layout", action: "sch.layout.batch", documentType: 1,
      operations: [{ id: "flag", action: "sch.net-flag.clone", template: { sheetUuid: "template", componentId: "ground" }, x: 10, y: 20 }] },
      expectedContext: context, expectedFingerprint: {}, expectedTopology: topology },
    state: "apply-needs-review", saved: false, reopened: false, orphanedCallPossible: false, hardStop: true,
    context, createdIds, beforeTopology: topology, artifacts: [],
  };
  const prepared = { adapterProfile: "easyeda-pro-control.schematic-layout-batch.v1", codeSha256: "d".repeat(64), createdIds };
  const acknowledgment = { ok: true, kind: "typed-design-result", id: "layout", createdId: null, createdIds };
  assertLayoutWireGroupRepairAuthority(journal, prepared, acknowledgment);
  assertLayoutWireGroupRepairAuthority({ ...journal, state: "runtime-rebound-needs-reconciliation" }, prepared, acknowledgment);
  for (const phase of ["prepared", "apply", "verified"]) {
    assert.throws(() => { assertLayoutWireGroupRepairAuthority({ ...journal,
      artifacts: [{ path: `/operation/04-layout-wire-group-repair-${phase}.json`, bytes: 1, sha256: "e".repeat(64) }] }, prepared, acknowledgment); });
  }
  for (const patch of [{ orphanedCallPossible: true }, { saved: true }, { reopened: true }, { hardStop: false }, { state: "applied-unsaved" },
    { artifacts: [{ path: "/operation/04-layout-net-label-repair-prepared.json", bytes: 1, sha256: "e".repeat(64) }] },
    { artifacts: [{ path: "/operation/04-save-reopen.json", bytes: 1, sha256: "e".repeat(64) }] }]) {
    assert.throws(() => { assertLayoutWireGroupRepairAuthority({ ...journal, ...patch }, prepared, acknowledgment); });
  }
  assert.throws(() => { assertLayoutWireGroupRepairAuthority(journal, { ...prepared, createdIds: { flag: "wrong" } }, acknowledgment); });
  assert.throws(() => { assertLayoutWireGroupRepairAuthority(journal, prepared, { ...acknowledgment, id: "another" }); });
  assert.throws(() => { assertLayoutWireGroupRepairAuthority({ ...journal, beforeTopology: [] }, prepared, acknowledgment); });
  assert.throws(() => { assertLayoutWireGroupRepairAuthority({ ...journal, layoutWireGroupRepair: {
    profile: "easyeda-pro-control.schematic-wire-group-repair.v1", operationSha256: "a".repeat(64), createdIdsSha256: "b".repeat(64),
    legacySourceSha256: "c".repeat(64), correctedSourceSha256: "d".repeat(64), merges: [], wireOrders: [],
  } }, prepared, acknowledgment); });
});
