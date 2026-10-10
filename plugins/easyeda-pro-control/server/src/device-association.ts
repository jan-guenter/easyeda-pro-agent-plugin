import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import type { LibraryOperation } from "./library-operations.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { DEVICE_MODEL_RUNTIME_GUARD, deviceRequestedModel, validateDeviceModelMetadata } from "./device-model.ts";
import type { DeviceModelEvidence } from "./device-model.ts";
import { DEVICE_NATIVE_ASSET_GUARD, DEVICE_NATIVE_HOST_GUARD, wrapDeviceStageDiagnostics } from "./device-runtime-guard.ts";

export const DEVICE_ASSOCIATION_PROFILE = "easyeda-pro-control.project-device-association.v1";
export interface DeviceAssociationPlan {
  readonly profile: typeof DEVICE_ASSOCIATION_PROFILE;
  readonly projectUuid: string;
  readonly ownerUuid: string;
  readonly deviceUuid: string;
  readonly beforeMeta: Record<string, unknown>;
  readonly afterMeta: Record<string, unknown>;
  readonly associations: readonly { uuid: string; family: "symbol" | "footprint"; name: string }[];
  readonly beforeProjectSha256: string;
  readonly model?: DeviceModelEvidence;
}
function projected(history: NativeHistorySnapshot): { uuid: string; docType: string; metadata: Record<string, unknown>; records: { id: string; type: string; body: Record<string, unknown> }[] }[] {
  return history.documents.map(({ uuid, docType, metadata, records }) => ({ uuid, docType, metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }));
}
export function deviceAssociationOperation(input: unknown): Extract<LibraryOperation, { action: "library.device.modify" }> {
  const value = libraryOperationSchema.parse(input);
  if (value.action !== "library.device.modify" || !("uuid" in value.target) || Object.keys(value.patch).length !== 1 || value.patch.association === undefined) { throw new Error("Project association editing requires one exact device and only association changes."); }
  deviceRequestedModel(value);
  return value;
}
export function prepareDeviceAssociation(input: unknown, history: NativeHistorySnapshot, modelInput?: unknown): DeviceAssociationPlan {
  const parsed = deviceAssociationOperation(input);
  if (parsed.libraryUuid !== history.projectUuid || history.projectOwnerUuid === undefined || !("uuid" in parsed.target)) { throw new Error("Device association requires exact current-project collection and owner."); }
  const deviceUuid = parsed.target.uuid;
  const device = history.documents.find((entry) => entry.uuid === deviceUuid && entry.docType === "DEVICE" && !isNativeDocumentDeleted(entry));
  const meta = device?.records.find((entry) => entry.id === "META" && entry.type === "META");
  if (meta === undefined || !isRecord(meta.body["attributes"]) || typeof meta.body["title"] !== "string" || !Array.isArray(meta.body["tags"]) || !Array.isArray(meta.body["images"]) || typeof meta.body["source"] !== "string") { throw new Error("Complete native device metadata is unavailable."); }
  const beforeMeta = structuredClone(meta.body);
  const originalAttributes = meta.body["attributes"];
  const afterMeta = structuredClone(beforeMeta);
  const attributes = afterMeta["attributes"];
  if (!isRecord(attributes)) { throw new Error("Device attributes are not an exact object."); }
  const associations: { uuid: string; family: "symbol" | "footprint"; name: string }[] = [];
  const requestedModel = deviceRequestedModel(parsed);
  const model = requestedModel === undefined ? undefined : validateDeviceModelMetadata(modelInput, requestedModel);
  for (const [family, identity] of Object.entries(parsed.patch.association ?? {})) {
    if (family === "model3D" && identity === null) { attributes["3D Model"] = ""; }
    else if (family === "model3D" && model !== undefined) { attributes["3D Model"] = `${model.uuid}|${model.libraryUuid}`; attributes["3D Model Title"] = model.metadata["name"]; }
    else {
      if (family !== "symbol" && family !== "footprint") { throw new Error("Unreviewed project association family."); }
      const key = family === "symbol" ? "Symbol" : "Footprint";
      if (identity === null && family === "footprint") { attributes[key] = ""; }
      else {
        if (!isRecord(identity) || identity.libraryUuid !== history.projectUuid || typeof identity.uuid !== "string") { throw new Error("Association may not import or reference an off-project asset."); }
        const target = history.documents.find((entry) => entry.uuid === identity.uuid && entry.docType === (family === "symbol" ? "SYMBOL" : "FOOTPRINT") && !isNativeDocumentDeleted(entry));
        const title = target?.records.find((entry) => entry.id === "META" && entry.type === "META")?.body["title"];
        if (target === undefined || typeof title !== "string" || title.length === 0) { throw new Error("Association asset is absent from the complete checkpoint."); }
        attributes[key] = target.uuid;
        associations.push({ uuid: target.uuid, family, name: title });
      }
    }
  }
  if (canonicalJson(beforeMeta) === canonicalJson(afterMeta)) { throw new Error("Device association patch has no effect."); }
  // Existing instances own their Symbol and Footprint overrides. Refuse any
  // Schematic instance that would inherit one of the changed bindings silently.
  const changed = ["Symbol", "Footprint", "3D Model", "3D Model Title"].filter((key) => !Object.is(originalAttributes[key], attributes[key]));
  for (const document of history.documents.filter((entry) => entry.docType === "SCH_PAGE" && !isNativeDocumentDeleted(entry))) {
    for (const record of document.records.filter((entry) => entry.type === "ATTR" && entry.body["key"] === "Device" && entry.body["value"] === deviceUuid)) {
      const parent = record.body["parentId"];
      if (typeof parent !== "string" || changed.some((key) => !document.records.some((entry) => entry.type === "ATTR" && entry.body["parentId"] === parent && entry.body["key"] === key && typeof entry.body["value"] === "string" && entry.body["value"].length > 0))) { throw new Error("An existing component inherits the changed association; explicit instance/ECO authority is required."); }
    }
  }
  return { profile: DEVICE_ASSOCIATION_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid, deviceUuid, beforeMeta, afterMeta, associations, ...(model === undefined ? {} : { model }), beforeProjectSha256: sha256Json(projected(history)) };
}

/** Fixed native project-manager API used by updateDeviceAttributes. Unlike the
 * public metadata editor, it does not rebuild images, tags or create/import assets.
 */
export function buildDeviceAssociationExpression(plan: DeviceAssociationPlan, resultKind: "project-device-association" | "project-device-transform" = "project-device-association"): string {
  if (plan.profile !== DEVICE_ASSOCIATION_PROFILE || Buffer.byteLength(canonicalJson(plan), "utf8") > 2_097_152) { throw new Error("Invalid bounded device association plan."); }
  return wrapDeviceStageDiagnostics(`
const PLAN=${JSON.stringify(plan)};
${DEVICE_NATIVE_HOST_GUARD}
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v!==null&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const assertProject=async()=>{const p=await eda.dmt_Project.getCurrentProjectInfo();if(p?.uuid!==PLAN.projectUuid||host.currentProject?.projectId!==PLAN.projectUuid)throw new Error('DEVICE_PROJECT_DRIFT');};
deviceStage='PROJECT';
await assertProject();
deviceStage='ASSET_READ';
${DEVICE_NATIVE_ASSET_GUARD}
deviceStage='MODEL_READ';
${DEVICE_MODEL_RUNTIME_GUARD}
deviceStage='METADATA_READ';
const current=(await bus.rpcCall('/PrjDB/device/getData',[PLAN.deviceUuid,PLAN.projectUuid])).message;
if(current?.uuid!==PLAN.deviceUuid||current?.project_uuid!==PLAN.projectUuid||current?.owner?.uuid!==PLAN.ownerUuid||current?.display_title!==PLAN.beforeMeta.title||stable(current.attributes)!==stable(PLAN.beforeMeta.attributes)||stable(current.images)!==stable(PLAN.beforeMeta.images)||stable(JSON.parse(current.custom_tags))!==stable(PLAN.beforeMeta.tags)||current.source!==PLAN.beforeMeta.source)throw new Error('DEVICE_METADATA_DRIFT');
await assertProject();
deviceStage='UPDATE_RPC';
const result=(await bus.rpcCall('/PrjDB/device/updateData',[{uuid:PLAN.deviceUuid,attributes:PLAN.afterMeta.attributes},PLAN.projectUuid])).message;
deviceStage='ACKNOWLEDGMENT';
if(result?.uuid!==PLAN.deviceUuid||result?.project_uuid!==PLAN.projectUuid||stable(result.attributes)!==stable(PLAN.afterMeta.attributes))throw new Error('DEVICE_ASSOCIATION_ACK_INVALID');
deviceStage='FINAL_PROJECT';
await assertProject();
deviceStage='RESULT';
const payload={kind:${JSON.stringify(resultKind)},targetId:PLAN.deviceUuid,createdId:null};const json=JSON.stringify(payload);return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
`, "association");
}

export function verifyDeviceAssociationEffect(plan: DeviceAssociationPlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): Record<string, unknown> {
  if (plan.profile !== DEVICE_ASSOCIATION_PROFILE || before.projectUuid !== plan.projectUuid || before.projectOwnerUuid !== plan.ownerUuid || after.projectUuid !== before.projectUuid || after.projectOwnerUuid !== before.projectOwnerUuid || after.branchUuid !== before.branchUuid || sha256Json(projected(before)) !== plan.beforeProjectSha256) { throw new Error("Device association checkpoint scope differs."); }
  const old = before.documents.find((entry) => entry.uuid === plan.deviceUuid && entry.docType === "DEVICE");
  const next = after.documents.find((entry) => entry.uuid === plan.deviceUuid && entry.docType === "DEVICE");
  if (old === undefined || next === undefined || isNativeDocumentDeleted(old) || isNativeDocumentDeleted(next)) { throw new Error("Active device association target disappeared."); }
  const expected = projected(before).map((entry) => {
    if (entry.uuid !== plan.deviceUuid) { return entry; }
    return { uuid: entry.uuid, docType: entry.docType, metadata: next.metadata, records: old.records.map(({ id, type, body }) => ({ id, type, body: id === "META" && type === "META" ? plan.afterMeta : body })) };
  });
  if (canonicalJson(expected) !== canonicalJson(projected(after))) { throw new Error("Device association changed unrelated metadata, images, geometry or placed records."); }
  const changed = [...new Set([...Object.keys(old.metadata), ...Object.keys(next.metadata)])].filter((key) => canonicalJson({ value: old.metadata[key] }) !== canonicalJson({ value: next.metadata[key] }));
  const time = next.metadata["updateTime"];
  if (changed.some((key) => !["client", "updateTime", "version"].includes(key)) || typeof time !== "number" || !Number.isSafeInteger(time) || time < 0 || typeof old.metadata["updateTime"] !== "number" || time < old.metadata["updateTime"] || typeof next.metadata["client"] !== "string" || !/^[a-f0-9]{16}$/u.test(next.metadata["client"]) || next.metadata["version"] !== String(time)) { throw new Error("Device association changed unsupported native header fields."); }
  return { profile: DEVICE_ASSOCIATION_PROFILE, targetId: plan.deviceUuid, beforeProjectSha256: plan.beforeProjectSha256, afterProjectSha256: sha256Json(projected(after)), documentCount: after.documents.length, saved: true, reopened: false };
}
