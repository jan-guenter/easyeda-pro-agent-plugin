/** Selectors are inert plans from this reader's original retained ledgers.
 * All IDs/keys/URLs/handles are substituted by its private Core, never callers. */
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { diagnosticOpeningParams } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentPcbViaSavedCachePlan } from "./current-pcb-via-saved-cache-ledger.ts";
import type { CurrentPcbViaSavedCacheMetadataPlan } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import { currentPcbViaSavedCacheMetadataNativeRequest } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import { currentPcbViaSavedCacheNativeRequest } from "./current-pcb-via-saved-cache-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PARENT_PARAMS as PARENT } from "./current-pcb-via-saved-cache-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "./current-schematic-relevance-saved-readback-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function domain(id: number, sessionId: string): void { if (!Number.isSafeInteger(id) || id < 1 || id > PROFILE.renderer.activeLoading || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_SAVED_CACHE_WIRE"); } }
export function currentSchematicRelevanceSavedCacheWire(plan: CurrentPcbViaSavedCachePlan, id: number, sessionId: string): Readonly<{
  id: number; method: CurrentPcbViaSavedCachePlan["method"]; params: CurrentPcbViaSavedCachePlan["params"]; sessionId: string; schematicSavedCache: true;
}> { domain(id, sessionId); return freezeDeep({ id, method: plan.method, params: plan.params, sessionId, schematicSavedCache: true }); }
export function currentSchematicRelevanceSavedMetadataWire(plan: CurrentPcbViaSavedCacheMetadataPlan, id: number, sessionId: string): Readonly<{
  id: number; method: CurrentPcbViaSavedCacheMetadataPlan["method"]; params: CurrentPcbViaSavedCacheMetadataPlan["params"]; sessionId: string; schematicSavedMetadata: true;
}> { domain(id, sessionId); return freezeDeep({ id, method: plan.method, params: plan.params, sessionId, schematicSavedMetadata: true }); }
export function currentSchematicRelevanceSavedParentWire(id: number, sessionId: string): Readonly<{
  id: number; method: "Target.setAutoAttach"; params: typeof PARENT; sessionId: string; schematicSavedParent: true;
}> { domain(id, sessionId); return freezeDeep({ id, method: "Target.setAutoAttach", params: PARENT, sessionId, schematicSavedParent: true }); }
export function currentSchematicRelevanceSavedPreflightWire(id: number, sessionId: string, uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Readonly<{
  id: number; method: "Runtime.callFunctionOn"; params: ReturnType<typeof diagnosticOpeningParams>; sessionId: string; schematicSavedPreflight: true;
}> { domain(id, sessionId); return freezeDeep({ id, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(uniqueContextId, target, "preflight"), sessionId, schematicSavedPreflight: true }); }
function exact(chunk: Buffer, make: (id: number) => unknown): number {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_SAVED_CACHE_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (raw === null || typeof raw !== "object" || !("id" in raw) || typeof raw.id !== "number" || chunk.toString("utf8") !== `${JSON.stringify(make(raw.id))}\0`) { throw new Error("SCHEMATIC_SAVED_CACHE_FRAME"); } return raw.id;
}
export function currentSchematicRelevanceSavedCacheFrame(chunk: Buffer, plan: CurrentPcbViaSavedCachePlan, sessionId: string): Readonly<Record<string, unknown>> {
  const id = exact(chunk, value => currentSchematicRelevanceSavedCacheWire(plan, value, sessionId));
  return freezeDeep({ action: "schematic-saved-cache", requestId: id, sessionId, ...currentPcbViaSavedCacheNativeRequest(plan.command), ...Object.fromEntries(Object.entries(plan.params).filter(([name]) => name !== "requestHeaders")) });
}
export function currentSchematicRelevanceSavedMetadataFrame(chunk: Buffer, plan: CurrentPcbViaSavedCacheMetadataPlan, sessionId: string): Readonly<Record<string, unknown>> {
  const id = exact(chunk, value => currentSchematicRelevanceSavedMetadataWire(plan, value, sessionId)); const fields: Record<string, unknown> = {};
  for (const name of ["objectId", "uniqueContextId", "scriptId"]) { if (Object.hasOwn(plan.params, name)) { fields[name] = plan.params[name]; } }
  if (plan.helper === "bind") { const args = plan.params["arguments"];
    if (!Array.isArray(args) || args.length !== 2) { throw new Error("SCHEMATIC_SAVED_METADATA_FRAME"); }
    const first: unknown = args[0], second: unknown = args[1];
    if (first === null || typeof first !== "object" || !("objectId" in first) || second === null || typeof second !== "object" || !("value" in second)) { throw new Error("SCHEMATIC_SAVED_METADATA_FRAME"); }
    fields["requestMembersObjectId"] = first.objectId; fields["projectUuid"] = second.value;
  }
  return freezeDeep({ action: "schematic-saved-metadata", requestId: id, sessionId, ...currentPcbViaSavedCacheMetadataNativeRequest(plan.command), ...fields });
}
export function currentSchematicRelevanceSavedParentFrame(chunk: Buffer, sessionId: string): Readonly<Record<string, unknown>> {
  const id = exact(chunk, value => currentSchematicRelevanceSavedParentWire(value, sessionId)); return Object.freeze({ action: "schematic-saved-parent", requestId: id, sessionId });
}
export function currentSchematicRelevanceSavedPreflightFrame(chunk: Buffer, sessionId: string, uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Readonly<Record<string, unknown>> {
  const id = exact(chunk, value => currentSchematicRelevanceSavedPreflightWire(value, sessionId, uniqueContextId, target));
  return freezeDeep({ action: "schematic-saved-preflight", requestId: id, sessionId, uniqueContextId, targetRawWindowsPath: target.rawWindowsPath, targetProjectUuid: target.projectUuid, targetBranchUuid: target.branchUuid, targetDocumentUuid: target.documentUuid, targetExpectedSourceSha256: target.expectedSourceSha256 });
}

export type CurrentSchematicSavedCacheGuard = "before-delete-0" | "before-delete-1" | "loading";
export function currentSchematicRelevanceSavedGuardWire(id: number, sessionId: string, uniqueContextId: string, target: CurrentDisposableOpenSealedTarget, stage: CurrentSchematicSavedCacheGuard): Readonly<{
  id: number; method: "Runtime.callFunctionOn"; params: ReturnType<typeof diagnosticOpeningParams>; sessionId: string; schematicSavedGuard: CurrentSchematicSavedCacheGuard;
}> { domain(id, sessionId); if (!["before-delete-0", "before-delete-1", "loading"].includes(stage)) { throw new Error("SCHEMATIC_SAVED_GUARD_STAGE"); } return freezeDeep({ id, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(uniqueContextId, target, "preflight"), sessionId, schematicSavedGuard: stage }); }
export function currentSchematicRelevanceSavedGuardFrame(chunk: Buffer, sessionId: string, uniqueContextId: string, target: CurrentDisposableOpenSealedTarget, stage: CurrentSchematicSavedCacheGuard): Readonly<Record<string, unknown>> {
  const id = exact(chunk, value => currentSchematicRelevanceSavedGuardWire(value, sessionId, uniqueContextId, target, stage));
  return freezeDeep({ action: "schematic-saved-guard", requestId: id, sessionId, uniqueContextId, cacheGuardStage: stage, targetRawWindowsPath: target.rawWindowsPath, targetProjectUuid: target.projectUuid, targetBranchUuid: target.branchUuid, targetDocumentUuid: target.documentUuid, targetExpectedSourceSha256: target.expectedSourceSha256 });
}
