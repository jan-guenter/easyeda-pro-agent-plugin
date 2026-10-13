/** Synthetic data only; no project/native profile is read. */
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { controlDataDirectory } from "../../src/artifacts.ts";
import type { ClosedSymbolPlan } from "../../src/closed-symbol-journal.ts";
import { sha256Json } from "../../src/core.ts";
import { WITNESS_NATIVE_PINS_SHA256 } from "../../src/closed-symbol-native-profile.ts";
import { VALIDATION_ACTION_ID } from "../../src/closed-symbol-target-claim.ts";
import { parseClosedSymbolValidationRequest } from "../../src/closed-symbol-validation-request.ts";
import type { ClosedSymbolValidationRequest } from "../../src/closed-symbol-validation-request.ts";

export function fixture(): { request: ClosedSymbolValidationRequest; plan: ClosedSymbolPlan } {
  const request = parseClosedSymbolValidationRequest({ action: "run-disposable-once", confirmDisposableMetadataEdit: true,
    target: { projectPath: "/not-opened/Synthetic.eprj2", projectUuid: randomBytes(32).toString("hex"), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), symbolUuid: "d".repeat(32), companionPcbUuid: "e".repeat(32) },
    metadata: { name: "Synthetic symbol", description: "One metadata change only." } });
  return { request, plan: makePlan(request) };
}
export function makePlan(request: ClosedSymbolValidationRequest): ClosedSymbolPlan {
  return { profile: "easyeda-pro-control.project-symbol-closed-session.v1", projectUuid: request.target.projectUuid,
    branchUuid: request.target.branchUuid, ownerUuid: request.target.ownerUuid, targetUuid: request.target.symbolUuid,
    activeUuid: request.target.companionPcbUuid, projectPath: request.target.projectPath,
    operation: { id: VALIDATION_ACTION_ID, action: "library.symbol.modify", libraryUuid: request.target.projectUuid,
      target: { uuid: request.target.symbolUuid }, patch: { ...request.metadata } },
    marker: { namespaceNonce: randomBytes(32).toString("hex"), keyNonce: randomBytes(32).toString("hex"), bodyNonce: randomBytes(32).toString("hex") },
    nativePinsSha256: WITNESS_NATIVE_PINS_SHA256, facadeSha256: "1".repeat(64), expectedFingerprintSha256: "2".repeat(64) };
}
export function slotPath(request: ClosedSymbolValidationRequest): string {
  const key = sha256Json({ profile: "easyeda-pro-control.closed-symbol-validation-claim.v1", projectUuid: request.target.projectUuid, symbolUuid: request.target.symbolUuid });
  return join(controlDataDirectory(), "closed-symbol-validation-claims-v1", key);
}
