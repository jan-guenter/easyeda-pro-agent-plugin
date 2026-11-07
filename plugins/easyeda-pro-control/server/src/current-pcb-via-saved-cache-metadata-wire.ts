/** Original private metadata reservations only. Identifiers and native handles
 * come from the same original driver; command selectors never contain them. */
import { currentPcbViaSavedCacheMetadataNativeRequest } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import type { CurrentPcbViaSavedCacheMetadataPlan } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE as PROFILE } from "./current-pcb-via-saved-readback-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentPcbViaSavedCacheMetadataWire(plan: CurrentPcbViaSavedCacheMetadataPlan, id: number, sessionId: string): Readonly<{
  id: number; method: CurrentPcbViaSavedCacheMetadataPlan["method"]; params: CurrentPcbViaSavedCacheMetadataPlan["params"]; sessionId: string; savedReadbackMetadata: true;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > PROFILE.renderer.activeReadOnly || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SAVED_READBACK_METADATA_WIRE"); }
  return freezeDeep({ id, method: plan.method, params: plan.params, sessionId, savedReadbackMetadata: true });
}
export function currentPcbViaSavedCacheMetadataNativeFrame(chunk: Buffer, plan: CurrentPcbViaSavedCacheMetadataPlan, sessionId: string): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SAVED_READBACK_METADATA_WIRE"); }
  const value: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number" || chunk.toString("utf8") !== `${JSON.stringify(currentPcbViaSavedCacheMetadataWire(plan, value.id, sessionId))}\0`) { throw new Error("SAVED_READBACK_METADATA_WIRE"); }
  const fields: Record<string, unknown> = {};
  for (const name of ["objectId", "uniqueContextId", "scriptId"]) { if (Object.hasOwn(plan.params, name)) { fields[name] = plan.params[name]; } }
  if (plan.helper === "bind") {
    const args = plan.params["arguments"]; if (!Array.isArray(args) || args.length !== 2) { throw new Error("SAVED_READBACK_METADATA_WIRE"); }
    const first: unknown = args[0], second: unknown = args[1];
    if (first === null || typeof first !== "object" || !("objectId" in first) || second === null || typeof second !== "object" || !("value" in second)) { throw new Error("SAVED_READBACK_METADATA_WIRE"); }
    fields["requestMembersObjectId"] = first.objectId; fields["projectUuid"] = second.value;
  }
  return freezeDeep({ action: "saved-readback-metadata", requestId: value.id, sessionId, ...currentPcbViaSavedCacheMetadataNativeRequest(plan.command), ...fields });
}
