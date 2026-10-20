/** Ordinary-purpose scope and original full-SQL startup projection.
 * Synthetic storage only; these tests are not connected writer validation.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { assertCurrentSchematicOpeningExpectation, currentSchematicOpeningExpectationSchema,
  prepareCurrentSchematicOpeningExpectation } from "../src/current-schematic-operation-startup.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE, currentSchematicOperationRequestSchema,
  queryCurrentSchematicOperation, validateCurrentSchematicOperationArguments } from "../src/current-schematic-operation.ts";
import { REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";

const RAW = String.raw`C:\Synthetic\OrdinarySchematic.eprj2`;
const OPEN = { action: "open", operationId: "ordinary-sch-opening", rawWindowsPath: RAW, projectUuid: sha256Text(RAW),
  documentUuid: "a".repeat(16), expectedSourceSha256: "b".repeat(64), acceptNormalOpenEffects: true,
  rename: { target: { ...TARGET, projectUuid: sha256Text(RAW) }, desiredTitle: REQUEST.desiredTitle } };
const BEGIN = { action: "baseline-begin", operationId: "ordinary-sch-operation", openingOperationId: OPEN.operationId,
  target: OPEN.rename.target, desiredTitle: OPEN.rename.desiredTitle, acceptSchematicRename: true };

void test("ordinary SCH discovery reports its own historical validation without granting invocation authority", () => {
  const query = queryCurrentSchematicOperation({ includeSchemas: true });
  assert.equal(query["purpose"], CURRENT_SCHEMATIC_OPERATION_PURPOSE);
  assert.equal(query["validationOnly"], false); assert.equal(query["ordinaryProjectsSupported"], true);
  assert.equal(query["historicalConnectedValidation"], "installed203733-ordinary-schematic-title-only-lifecycle");
  assert.equal(query["connectedValidation"], false); assert.equal(query["executionAuthorized"], false);
  assert.equal(query["inverseSupported"], false); assert.equal(query["replayAllowed"], false);
  assert.ok(query["inputSchema"] !== undefined);
  assert.equal(validateCurrentSchematicOperationArguments(OPEN)["valid"], true);
  assert.equal(validateCurrentSchematicOperationArguments(BEGIN)["valid"], true);
  for (const request of [{ ...OPEN, confirmDisposableProject: false },
    { ...OPEN, purpose: "disposable-validation" }, { ...OPEN, rawWindowsPath: `${RAW}2` },
    { ...OPEN, rename: { ...OPEN.rename, target: TARGET } }, { ...BEGIN, openingOperationId: BEGIN.operationId },
    { ...BEGIN, desiredTitle: "INPUT" }, { ...BEGIN, startupExpectation: {} }, { ...BEGIN, owner: {} },
    { action: "inverse", operationId: BEGIN.operationId }]) {
    assert.equal(validateCurrentSchematicOperationArguments(request)["valid"], false);
  }
});

void test("ordinary SCH opening preserves omitted confirmation and legacy true without accepting false", () => {
  const current = currentSchematicOperationRequestSchema.parse(OPEN);
  assert.deepEqual(current, OPEN); assert.equal(Object.hasOwn(current, "confirmDisposableProject"), false);
  const legacy = { ...OPEN, confirmDisposableProject: true };
  assert.deepEqual(currentSchematicOperationRequestSchema.parse(legacy), legacy);
  assert.deepEqual(validateCurrentSchematicOperationArguments(OPEN)["request"], OPEN);
  assert.deepEqual(validateCurrentSchematicOperationArguments(legacy)["request"], legacy);
  for (const confirmDisposableProject of [false, null, "true", 1]) {
    assert.equal(currentSchematicOperationRequestSchema.safeParse({ ...OPEN, confirmDisposableProject }).success, false);
  }
});

void test("ordinary SCH phases reject unqualified startup and injected authority before any batch starts", () => {
  const write = { expectedPhase: "rename-write", confirmWrite: true, acceptSchematicRename: true };
  const close = { expectedPhase: "rename-close", confirmNormalClose: true, acceptUnknownFileEffects: true };
  const batch = { action: "advance-batch", operationId: BEGIN.operationId, steps: [write, close] };
  assert.equal(currentSchematicOperationRequestSchema.safeParse(batch).success, true);
  for (const request of [
    { action: "advance", operationId: BEGIN.operationId, step: { expectedPhase: "baseline-open-project", acceptNormalOpenEffects: true,
      acceptUnqualifiedSchematicStartupEffects: true } },
    { ...batch, steps: [write, { expectedPhase: "rename-close" }] },
    { ...batch, steps: [{ ...write, clock: {} }, close] }, { ...batch, steps: [{ ...write, confirmDisposableProject: true }, close] },
    { ...batch, steps: [{ expectedPhase: "baseline-prepare-clock", acceptScratchProcessEffects: true },
      { expectedPhase: "baseline-relaunch", acceptNormalOpenEffects: true }] },
    { ...batch, steps: [close, write] }, { ...batch, steps: [write] }, { ...batch, continueOnError: true },
  ]) { assert.equal(currentSchematicOperationRequestSchema.safeParse(request).success, false); }
});

void test("ordinary SCH opening freezes the complete supported projection and rejects intent, child, peer or startup drift", async () => {
  const original = await schematicBaseline();
  const expectation = await prepareCurrentSchematicOpeningExpectation(original.before, { target: TARGET, desiredTitle: REQUEST.desiredTitle });
  const children = await prepareCurrentSchematicChildRoster(original.metadata, original.before);
  assert.doesNotThrow(() => { assertCurrentSchematicOpeningExpectation(expectation, original.metadata, children); });
  assert.ok(Object.isFrozen(expectation)); assert.ok(Object.isFrozen(expectation.intent.target));
  assert.ok(Object.isFrozen(expectation.childKv)); assert.ok(Object.isFrozen(expectation.targetAst.sheets));
  const child = Object.keys(expectation.childKv)[0]; assert.ok(child !== undefined);
  const mutations: ((value: typeof expectation) => void)[] = [
    value => { value.intent.desiredTitle = "Another title"; },
    value => { value.intent.target.ownerUuid = "9".repeat(32); },
    value => { value.intent.target.branchUuid = "9".repeat(32); },
    value => { value.intent.target.schematicUuid = "9".repeat(16); },
    value => { value.startup.sheetUuids.push("9".repeat(16)); },
    value => { const peer = value.peers[0]; assert.ok(peer !== undefined); peer.ticket += 1; },
    value => { const sheet = value.childKv[child]; assert.ok(sheet !== undefined); sheet.display_title = "Another child"; },
    value => { value.targetAst.sort = []; },
  ];
  for (const change of mutations) {
    const changed = structuredClone(expectation); change(changed);
    assert.throws(() => { assertCurrentSchematicOpeningExpectation(changed, original.metadata, children); }, /sealed pre-navigation/u);
  }
  const later = await schematicBaseline(2), laterChildren = await prepareCurrentSchematicChildRoster(later.metadata, later.before);
  assert.throws(() => { assertCurrentSchematicOpeningExpectation(expectation, later.metadata, laterChildren); }, /sealed pre-navigation/u);
  assert.equal(currentSchematicOpeningExpectationSchema.safeParse({ ...expectation, suppliedOwner: {} }).success, false);
  assert.equal(currentSchematicOpeningExpectationSchema.safeParse({ ...expectation, childKv: { arbitrary: expectation.childKv[child] } }).success, false);
});

void test("ordinary SCH startup qualification refuses mismatched source identity before creating an expectation", async () => {
  const original = await schematicBaseline();
  for (const target of [{ ...TARGET, ownerUuid: "9".repeat(32) }, { ...TARGET, branchUuid: "9".repeat(32) },
    { ...TARGET, projectUuid: "9".repeat(64) }, { ...TARGET, schematicUuid: "9".repeat(16) }]) {
    await assert.rejects(prepareCurrentSchematicOpeningExpectation(original.before, { target, desiredTitle: REQUEST.desiredTitle }));
  }
});
