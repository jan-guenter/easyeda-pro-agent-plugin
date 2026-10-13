/** Ordinary operation input. No caller-supplied native phase or execution authority. */
import { projectSymbolMetadataOperation } from "./project-symbol-metadata.ts";
import { exactData, parseClosedSymbolValidationRequest, requireValue } from "./closed-symbol-validation-request.ts";
import type { ClosedSymbolValidationRequest } from "./closed-symbol-validation-request.ts";
import { VALIDATION_ACTION_ID } from "./closed-symbol-target-claim.ts";

export interface ClosedSymbolOperationRequest {
  readonly action: "execute-closed-symbol";
  readonly target: ClosedSymbolValidationRequest["target"];
  readonly operation: ReturnType<typeof projectSymbolMetadataOperation>;
  readonly confirmWrite: true;
}

/** Deliberately blocked until the original disposable full lifecycle is reviewed.
 * No environment switch, request field, or historical helper receipt enables it.
 */
export function assertClosedSymbolOperationValidated(): void {
  throw new Error("Ordinary closed-symbol metadata execution awaits successful disposable full-lifecycle validation.");
}

export function parseClosedSymbolOperationRequest(input: unknown): ClosedSymbolOperationRequest {
  const value = exactData(input, ["action", "target", "operation", "confirmWrite"]);
  requireValue(value["action"] === "execute-closed-symbol" && value["confirmWrite"] === true, "Closed-symbol operation requires explicit write confirmation.");
  const raw = exactData(value["operation"], ["id", "action", "libraryUuid", "target", "patch"]);
  const patch = exactData(raw["patch"], ["name", "description"]), target = exactData(raw["target"], ["uuid"]);
  // Reuse the exact bounded identity/metadata parser, not its validation claim.
  const scope = parseClosedSymbolValidationRequest({ action: "run-disposable-once", target: value["target"],
    metadata: patch, confirmDisposableMetadataEdit: true });
  requireValue(typeof raw["id"] === "string" && raw["id"] !== VALIDATION_ACTION_ID &&
    raw["action"] === "library.symbol.modify" && raw["libraryUuid"] === scope.target.projectUuid &&
    target["uuid"] === scope.target.symbolUuid && scope.metadata.name.trim().length > 0, "Closed-symbol operation identity or title differs.");
  const operation = projectSymbolMetadataOperation({ id: raw["id"], action: raw["action"], libraryUuid: raw["libraryUuid"],
    target: { uuid: target["uuid"] }, patch: scope.metadata });
  Object.freeze(operation.target); Object.freeze(operation.patch); Object.freeze(operation);
  const request: ClosedSymbolOperationRequest = Object.freeze({ action: "execute-closed-symbol", target: scope.target, operation, confirmWrite: true });
  requireValue(Buffer.byteLength(JSON.stringify(request)) <= 32_768, "Closed-symbol operation exceeds 32768 UTF-8 JSON bytes.");
  return request;
}
