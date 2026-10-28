/** Data-only namespace and historical decoding checks. No application is launched. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintCopyRoutePreparationIdSchema, currentFootprintCopyRoutePreparationValidationRequestSchema } from "../src/current-footprint-copy-route-preparation-validation.ts";
import { currentFootprintCopyPreparationValidationRequestSchema } from "../src/current-footprint-copy-preparation-validation.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const createdAt = "2026-10-28T12:00:00.000Z", digest = "a".repeat(64);
void test("route namespace consumes only fixed read stages and rejects terminal newline and legacy owners", () => {
  const operationId = "footprint-route-synthetic";
  const request = { operationId, action: "observe-footprint-route", expectedBindingSha256: digest };
  assert.equal(currentFootprintCopyRoutePreparationValidationRequestSchema.safeParse(request).success, true);
  assert.equal(currentFootprintCopyPreparationValidationRequestSchema.safeParse(request).success, false);
  assert.equal(currentFootprintCopyRoutePreparationValidationRequestSchema.safeParse({ ...request, operationId: "footprint-preparation-synthetic" }).success, false);
  for (const suffix of ["\n", "\r", "\u2028", "\u2029", "/extra"]) {
    assert.equal(currentFootprintCopyRoutePreparationIdSchema.safeParse(operationId + suffix).success, false);
  }
  for (const action of ["observe-current-channel", "observe-footprint-source", "prepare-footprint-copy", "prepare-footprint-bindings", "create", "save", "execute"]) {
    assert.equal(currentFootprintCopyRoutePreparationValidationRequestSchema.safeParse({ ...request, action }).success, false);
  }
});

void test("route journals preserve historical nine pauses and admit eleven only under the distinct namespace", () => {
  const construction = { profile: "private.current-pcb209-worker-construction.v1", pauses: 9,
    originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true,
    channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
    nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false };
  const record = { schema: "easyeda-pro-control.pcb-worker-startup-opening-result.v1", operationId: "footprint-preparation-synthetic",
    createdAt, intentSha256: digest, executionAuthorized: false, result: { construction, opening: {
      schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project", projectUuid: digest, branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
      ok: true, status: "opened-prefix-observed", failure: null, dispatchAttempted: true, observation: { windowTabId: "synthetic" },
      executionAuthorized: false, persistenceVerified: false }, workerIdentity: { projectUuid: digest, branchUuid: "b".repeat(32), windowTabId: "synthetic" },
    ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false } };
  const schema = diagnosticLifecycleRecordSchemas["worker-startup-opening-result.json"];
  assert.equal(schema.safeParse(record).success, true);
  const route = { ...record, operationId: "footprint-route-synthetic", result: { ...record.result,
    construction: { ...construction, profile: "private.current-footprint-copy-construction.v1", pauses: 11 } } };
  assert.equal(schema.safeParse(route).success, true);
  assert.equal(schema.safeParse({ ...route, operationId: record.operationId }).success, false);
  assert.equal(schema.safeParse({ ...record, operationId: route.operationId }).success, false);
  assert.equal(schema.safeParse({ ...route, result: { ...route.result, construction: { ...route.result.construction, pauses: 9 } } }).success, false);
  const launch = { schema: "easyeda-pro-control.footprint-copy-route-preparation-launch-intent.v1", operationId: route.operationId,
    createdAt, purpose: "worker-startup", facadeSha256: digest, installationSha256: digest,
    confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse(launch).success, true);
  assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse({ ...launch, operationId: record.operationId }).success, false);
});
