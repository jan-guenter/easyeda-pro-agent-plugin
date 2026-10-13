import assert from "node:assert/strict";
import { test } from "node:test";
import { readExactUtf8Artifact } from "../src/artifacts.ts";
import { sha256Json } from "../src/core.ts";
import type { ClosedSymbolPlan } from "../src/closed-symbol-journal.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "../src/closed-symbol-native-profile.ts";
import { claimClosedSymbolOperationIntent } from "../src/closed-symbol-operation-intent.ts";
import { assertClosedSymbolOperationValidated } from "../src/closed-symbol-operation-request.ts";
import { closedSymbolFailureDiagnostic } from "../src/closed-symbol-failure-diagnostic.ts";
import { closedSymbolOperationInputSchema, closedSymbolOperationStopped, formatClosedSymbolOperationResult,
  parseClosedSymbolOperationInput } from "../src/closed-symbol-operation-tool.ts";
// oxlint-disable-next-line import/max-dependencies -- Reuse the existing request fixture and exact projector in this ordinary formatter/intent test.
import { requestData } from "./helpers/disposable-tool-data.ts";

function input(): unknown {
  const scope = requestData().request;
  return { request: { action: "execute-closed-symbol", target: scope.target,
    operation: { id: "ordinary-metadata-id", action: "library.symbol.modify", libraryUuid: scope.target.projectUuid,
      target: { uuid: scope.target.symbolUuid }, patch: scope.metadata }, confirmWrite: true } };
}

void test("ordinary request preserves its real operation identity and rejects validation substitution", () => {
  const raw = input();
  const parsed = parseClosedSymbolOperationInput(raw);
  assert.equal(parsed.request.operation.id, "ordinary-metadata-id");
  assert.ok(closedSymbolOperationInputSchema.safeParse(raw).success);
  assert.ok(Object.isFrozen(parsed.request.operation) && Object.isFrozen(parsed.request.operation.patch));
  assert.throws(() => parseClosedSymbolOperationInput({ request: { ...parsed.request, unexpected: true } }));
  assert.throws(() => parseClosedSymbolOperationInput({ request: { ...parsed.request,
    operation: { ...parsed.request.operation, id: "disposable-symbol-metadata-validation" } } }));
  assert.throws(() => parseClosedSymbolOperationInput({ request: { ...parsed.request,
    operation: { ...parsed.request.operation, target: { uuid: "f".repeat(32) } } } }));
  assert.throws(() => parseClosedSymbolOperationInput({ request: { ...parsed.request, confirmWrite: false } }));
});

void test("ordinary validation gate stays closed and bounded refusal never grants completion", () => {
  assert.throws(assertClosedSymbolOperationValidated, /awaits successful disposable/u);
  const value = closedSymbolOperationStopped({ phase: "validation", attemptReserved: false });
  const reply = formatClosedSymbolOperationResult(value);
  assert.equal(reply.isError, true);
  assert.deepEqual(reply.structuredContent, { result: value });
  const diagnostic = closedSymbolFailureDiagnostic(new Error("Ordinary closed-symbol metadata execution awaits successful disposable full-lifecycle validation."), "validation");
  const diagnosed = formatClosedSymbolOperationResult(value, diagnostic);
  assert.deepEqual(diagnosed.structuredContent, reply.structuredContent); assert.deepEqual(diagnosed.content[0], reply.content[0]);
  assert.equal(diagnosed.content.length, 2); assert.equal(diagnostic?.errorCode, "VALIDATION_REQUIRED");
  assert.throws(() => formatClosedSymbolOperationResult({ ...value, completionProved: true }));
  let reads = 0;
  assert.throws(() => formatClosedSymbolOperationResult({ get outcome(): never { reads += 1; throw new Error("must not read"); } }));
  assert.equal(reads, 0);
});

void test("ordinary intent is permanently keyed by caller ID and preserves its sealed plan", async () => {
  const request = parseClosedSymbolOperationInput(input()).request;
  const plan: ClosedSymbolPlan = { profile: "easyeda-pro-control.project-symbol-closed-session.v1", projectUuid: request.target.projectUuid,
    branchUuid: request.target.branchUuid, ownerUuid: request.target.ownerUuid, targetUuid: request.target.symbolUuid,
    activeUuid: request.target.companionPcbUuid, projectPath: request.target.projectPath, operation: request.operation,
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) },
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: "4".repeat(64), expectedFingerprintSha256: "5".repeat(64) };
  const result = await claimClosedSymbolOperationIntent(request, plan);
  assert.equal(result.intentKey, sha256Json({ profile: "easyeda-pro-control.closed-symbol-operation-intent.v1", actionId: request.operation.id }));
  assert.equal(result.closedPlanSha256, sha256Json(plan)); assert.equal(result.attemptConsumed, true);
  assert.ok(result.artifact.path.includes("/closed-symbol-operation-intents-v1/"));
  const original = await readExactUtf8Artifact(result.artifact);
  await assert.rejects(claimClosedSymbolOperationIntent(request, plan), { code: "EEXIST" });
  assert.deepEqual(await readExactUtf8Artifact(result.artifact), original);
});
