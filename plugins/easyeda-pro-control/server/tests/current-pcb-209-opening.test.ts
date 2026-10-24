import assert from "node:assert/strict";
import { test } from "node:test";
import { createCurrentPcb209DiagnosticInstallationPlan, createCurrentPcbDiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import { CURRENT_PCB_209_OPENING_PROFILE, CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { currentPcb209OpeningRequestSchema, queryCurrentPcb209Opening, validateCurrentPcb209OpeningArguments } from "../src/current-pcb-209-opening-validation.ts";
import { currentPcbDiagnosticValidationRequestSchema } from "../src/current-pcb-diagnostic-validation.ts";

const options = { pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets",
  powershellSha256: "a".repeat(64), powershellBytes: 1234 };
const bound = { operationId: "pcb209-fixture", expectedBindingSha256: "a".repeat(64) };
const launch = { action: "launch", operationId: bound.operationId, confirmValidationOnly: true,
  confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };

void test("209 opening has separate fixed native pins while legacy206 stays unchanged", () => {
  const current = createCurrentPcb209DiagnosticInstallationPlan(options), legacy = createCurrentPcbDiagnosticInstallationPlan(options);
  assert.equal(current.plan.files.length, 5);
  assert.equal(legacy.plan.files.length, 5);
  assert.equal(current.plan.files[0]?.sha256, "8770f2cea950d9483f230f961b486e5ceaeffd619e2c2816957cb6ff3fd0bb38");
  assert.equal(legacy.plan.files[0]?.sha256, "e59d159f0f7bb5ac4832ce6583622251750ede7b839050f3aabe774cadfd1f55");
  assert.deepEqual(current.plan.files.map(file => file.windowsPath), legacy.plan.files.map(file => file.windowsPath));
  assert.ok(Object.isFrozen(current.plan.files));
  assert.equal(CURRENT_PCB_209_OPENING_PROFILE.installedFiles.length, 9);
  assert.deepEqual(CURRENT_PCB_209_OPENING_PROFILE.installedFiles.find(pin => pin.relativePath.endsWith("/js/pro-mgr.js")), {
    relativePath: "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", bytes: 2_196_424,
    sha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d",
  });
  for (const pin of CURRENT_PCB_209_OPENING_PROFILE.installedFiles) { assert.match(pin.sha256, /^[a-f\d]{64}$/u); }
  assert.equal(CURRENT_PCB_209_OPENING_SCRIPTS.pcb.scriptSha256, "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b");
  assert.ok(Object.isFrozen(CURRENT_PCB_209_OPENING_SCRIPTS.ui));
});

void test("209 opening request strictly selects a separate purpose and no executable fields", () => {
  assert.deepEqual(currentPcb209OpeningRequestSchema.parse(launch), launch);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(launch).success, false);
  for (const operationId of ["diagnostic-fixture", "worker-startup-fixture", "string-precreate-fixture", "pcb209-", "pcb209-UPPER"]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...launch, operationId }).success, false);
  }
  for (const extra of [{ code: "1" }, { generation: "206" }, { profile: "209" }, { acceptExistingProfileEffects: false }]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...launch, ...extra }).success, false);
  }
});

void test("209 public grammar refuses legacy workers, models, other script families and raw native commands", () => {
  for (const action of ["worker-startup", "inspect-workers", "inspect-worker-script", "observe-worker-state", "observe-model-state",
    "observe-string-precreate", "observe-common-baseline", "save", "evaluate", "Debugger.resume"]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action, ...bound }).success, false);
  }
  for (const family of ["pcb", "public-api", "worker", "unknown"]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "inspect-script", ...bound, frameId: "frame", family }).success, false);
  }
  assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "inspect-script", ...bound, frameId: "frame", family: "ui" }).success, true);
  assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "open-pcb", ...bound, acceptNormalOpenEffects: true, documentUuid: "a".repeat(16) }).success, false);
});

void test("209 discovery and validation expose exact scope without startup or writer claims", () => {
  const query = queryCurrentPcb209Opening({ includeSchemas: true });
  assert.equal(query["connectedValidation"], false);
  assert.equal(query["startupCompletionVerified"], false);
  assert.equal(query["completeLiveBaselineVerified"], false);
  assert.equal(query["saveAuthorized"], false);
  assert.equal(typeof query["inputSchema"], "object");
  assert.deepEqual(query["actions"], currentPcb209OpeningRequestSchema.options.map(option => option.shape.action.value));
  assert.equal(validateCurrentPcb209OpeningArguments(launch)["valid"], true);
  assert.equal(validateCurrentPcb209OpeningArguments({ action: "observe-model-state", ...bound })["valid"], false);
  assert.throws(() => queryCurrentPcb209Opening({ includeSchemas: true, generation: "206" }));
});

void test("209 primitive reader takes only its original operation binding and retains a named inspection stage", () => {
  const request = { action: "observe-primitives", ...bound };
  assert.deepEqual(currentPcb209OpeningRequestSchema.parse(request), request);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(request).success, false);
  for (const extra of [{ topic: "pcb/getAllLine" }, { code: "1" }, { ids: [] }, { family: "Line" }, { limit: 1 }]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...request, ...extra }).success, false);
  }
  assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "inspect", operationId: bound.operationId, observation: "primitives209" }).success, true);
});

void test("209 extended collections accept no caller target, filter, family or native topic", () => {
  const request = { action: "observe-extended-primitives", ...bound };
  assert.deepEqual(currentPcb209OpeningRequestSchema.parse(request), request);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(request).success, false);
  for (const extra of [{ target: {} }, { topic: "pcb/getAllComponent" }, { code: "1" }, { ids: [] },
    { family: "Pad" }, { filter: {} }, { limit: 1 }]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...request, ...extra }).success, false);
  }
  assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "inspect", operationId: bound.operationId,
    observation: "extended-primitives209" }).success, true);
});

void test("209 selection and relations normalize an omitted bounded component list and reject executable selectors", () => {
  const request = { action: "observe-selection-relations", ...bound };
  assert.deepEqual(currentPcb209OpeningRequestSchema.parse(request), { ...request, componentIds: [] });
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(request).success, false);
  for (const componentIds of [["same", "same"], [""], ["\uD800"], Array.from({ length: 17 }, (_, index) => String(index))]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...request, componentIds }).success, false);
  }
  for (const extra of [{ code: "1" }, { family: "Pad" }, { target: {} }, { topic: "pcb/getSelectedIds" }, { selection: [] }]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...request, ...extra }).success, false);
  }
  assert.equal(currentPcb209OpeningRequestSchema.safeParse({ action: "inspect", operationId: bound.operationId,
    observation: "selection-relations209" }).success, true);
});

void test("209 historical queries require published-record provenance and allow only bounded data selectors", () => {
  const request = { action: "query-observation", operationId: bound.operationId, observation: "selection-relations209",
    expectedResultRecordSha256: "b".repeat(64), query: { kind: "family", family: "Pad", primitiveIds: ["pad-a"], where: { net: null, layer: 12 } } };
  assert.deepEqual(currentPcb209OpeningRequestSchema.parse(request), request);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(request).success, false);
  for (const extra of [{ expectedBindingSha256: bound.expectedBindingSha256 }, { path: "/private/result.json" }, { result: {} },
    { target: {} }, { code: "1" }, { expectedResultRecordSha256: undefined }, { observation: "layers209" }]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...request, ...extra }).success, false);
  }
  for (const query of [{ kind: "family", family: "Pad", primitiveIds: ["same", "same"] },
    { kind: "family", family: "Via", where: { layer: 1 } }, { kind: "selection", filter: {} },
    { kind: "component-pads", componentId: "" }, { kind: "family", family: "Pad", where: { net: { regex: ".*" } } }]) {
    assert.equal(currentPcb209OpeningRequestSchema.safeParse({ ...request, query }).success, false);
  }
});
