import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import type { LibraryOperation } from "./library-operations.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { DEVICE_MODEL_RUNTIME_GUARD, deviceRequestedModel, validateDeviceModelMetadata } from "./device-model.ts";
import type { DeviceModelEvidence } from "./device-model.ts";
import { DEVICE_NATIVE_ASSET_GUARD, DEVICE_NATIVE_HOST_GUARD, wrapDeviceStageDiagnostics } from "./device-runtime-guard.ts";

export const DEVICE_CREATE_PROFILE = "easyeda-pro-control.project-device-create.v1";
export interface DeviceCreatePlan {
  readonly profile: typeof DEVICE_CREATE_PROFILE;
  readonly projectUuid: string;
  readonly ownerUuid: string;
  readonly expectedMeta: Record<string, unknown>;
  readonly associations: readonly { uuid: string; family: "symbol" | "footprint"; name: string }[];
  readonly model?: DeviceModelEvidence;
  readonly beforeProjectSha256: string;
}
function projected(history: NativeHistorySnapshot): unknown[] {
  return history.documents.map(({ uuid, docType, metadata, records }) => ({ uuid, docType, metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }));
}
export function deviceCreateOperation(input: unknown): Extract<LibraryOperation, { action: "library.device.create" }> {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "library.device.create") { throw new Error("Expected typed device create."); }
  deviceRequestedModel(operation);
  return operation;
}
export function prepareDeviceCreate(input: unknown, history: NativeHistorySnapshot, modelInput?: unknown): DeviceCreatePlan {
  const operation = deviceCreateOperation(input);
  if (operation.libraryUuid !== history.projectUuid || history.projectOwnerUuid === undefined) { throw new Error("Device creation requires the exact current project collection and owner."); }
  if (history.documents.some((entry) => entry.docType === "DEVICE" && !isNativeDocumentDeleted(entry) && entry.records.some((record) => record.type === "META" && typeof record.body["title"] === "string" && record.body["title"].trim().toLowerCase() === operation.name.trim().toLowerCase()))) { throw new Error("A project device with the requested name already exists."); }
  const associations: { uuid: string; family: "symbol" | "footprint"; name: string }[] = [];
  const attributes: Record<string, string | number | boolean> = { Symbol: "", Footprint: "", Designator: operation.property?.designator ?? "U?", "Add into BOM": operation.property?.addIntoBom === false ? "no" : "yes", "Convert to PCB": operation.property?.addIntoPcb === false ? "no" : "yes", Name: operation.property?.name ?? "", Description: operation.description ?? "" };
  for (const family of ["symbol", "footprint"] as const) {
    const binding = operation.association[family];
    if (binding === undefined) { if (family === "symbol") { throw new Error("A symbol is required."); } }
    else {
      if (binding.libraryUuid !== history.projectUuid) { throw new Error("Device creation may only bind existing project symbols and footprints."); }
      const asset = history.documents.find((entry) => entry.uuid === binding.uuid && entry.docType === (family === "symbol" ? "SYMBOL" : "FOOTPRINT") && !isNativeDocumentDeleted(entry));
      const title = asset?.records.find((entry) => entry.type === "META" && entry.id === "META")?.body["title"];
      if (asset === undefined || typeof title !== "string" || title.length === 0) { throw new Error("Device binding is absent from the complete checkpoint."); }
      attributes[family === "symbol" ? "Symbol" : "Footprint"] = asset.uuid;
      associations.push({ uuid: asset.uuid, family, name: title });
    }
  }
  const sourcing = { manufacturer: "Manufacturer", manufacturerId: "Manufacturer Part", supplier: "Supplier", supplierId: "Supplier Part", net: "Global Net Name" } as const;
  for (const [field, key] of Object.entries(sourcing)) {
    const value: unknown = operation.property === undefined ? undefined : Reflect.get(operation.property, field);
    if (value !== undefined && value !== null) { if (typeof value !== "string") { throw new TypeError("Invalid device property."); } attributes[key] = value; }
  }
  const reserved = new Set([...Object.keys(attributes), ...Object.values(sourcing), "Device", "3D Model", "3D Model Title", "3D Model Transform", "Unique ID"]);
  for (const [key, value] of Object.entries(operation.property?.otherProperty ?? {})) {
    if (reserved.has(key) || ["__proto__", "prototype", "constructor"].includes(key) || value === null) { throw new Error("Other properties may not override reserved device bindings or metadata, or create null values."); }
    attributes[key] = value;
  }
  const requested = deviceRequestedModel(operation);
  const model = requested === undefined ? undefined : validateDeviceModelMetadata(modelInput, requested);
  if (model !== undefined) { attributes["3D Model"] = `${model.uuid}|${model.libraryUuid}`; attributes["3D Model Title"] = String(model.metadata["name"]); }
  return { profile: DEVICE_CREATE_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid, expectedMeta: { images: [], title: operation.name, source: "", attributes, tags: operation.classification ?? [] }, associations, ...(model === undefined ? {} : { model }), beforeProjectSha256: sha256Json(projected(history)) };
}

export function buildDeviceCreateExpression(plan: DeviceCreatePlan): string {
  if (plan.profile !== DEVICE_CREATE_PROFILE || Buffer.byteLength(canonicalJson(plan), "utf8") > 2_097_152) { throw new Error("Invalid bounded device-create plan."); }
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
deviceStage='DUPLICATE_READ';
const duplicates=(await bus.rpcCall('/PrjDB/device/getDataByTitle',[PLAN.expectedMeta.title,PLAN.projectUuid])).message;
if(!Array.isArray(duplicates)||duplicates.length!==0)throw new Error('DEVICE_NAME_EXISTS');
await assertProject();
const meta=PLAN.expectedMeta;
deviceStage='CREATE_RPC';
const result=(await bus.rpcCall('/PrjDB/device/createData',[{device:{display_title:meta.title,title:meta.title,attributes:meta.attributes,images:meta.images,custom_tags:JSON.stringify(meta.tags),source:'',version:'1'}},PLAN.projectUuid])).message;
deviceStage='ACKNOWLEDGMENT';
const created=result?.result?.device;
if(result?.success!==true||typeof created?.uuid!=='string'||!/^[a-f0-9]{16}$/.test(created.uuid)||created.project_uuid!==PLAN.projectUuid||created.owner?.uuid!==PLAN.ownerUuid||stable(created.attributes)!==stable(meta.attributes)||created.display_title!==meta.title)throw new Error('DEVICE_CREATE_ACK_INVALID');
deviceStage='FINAL_PROJECT';
await assertProject();
deviceStage='RESULT';
const payload={kind:'project-device-create',createdId:created.uuid};const json=JSON.stringify(payload);return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
`, "create");
}

export function verifyDeviceCreateEffect(plan: DeviceCreatePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot, createdId: string | undefined): Record<string, unknown> {
  if (plan.profile !== DEVICE_CREATE_PROFILE || before.projectUuid !== plan.projectUuid || before.projectOwnerUuid !== plan.ownerUuid || after.projectUuid !== before.projectUuid || after.projectOwnerUuid !== before.projectOwnerUuid || after.branchUuid !== before.branchUuid || sha256Json(projected(before)) !== plan.beforeProjectSha256 || createdId === undefined || !/^[a-f0-9]{16}$/u.test(createdId) || before.documents.some((entry) => entry.uuid === createdId)) { throw new Error("Device create checkpoint or created identity differs."); }
  const created = after.documents.find((entry) => entry.uuid === createdId);
  if (created === undefined || created.docType !== "DEVICE" || isNativeDocumentDeleted(created) || after.documents.length !== before.documents.length + 1 || canonicalJson(projected({ ...after, documents: after.documents.filter((entry) => entry.uuid !== createdId) })) !== canonicalJson(projected(before))) { throw new Error("Device creation altered unrelated project records or added more than one device."); }
  const meta = created.records[0];
  if (created.records.length !== 1 || meta?.type !== "META" || meta.id !== "META" || canonicalJson(meta.body) !== canonicalJson(plan.expectedMeta)) { throw new Error("Created device complete metadata differs from the planned addition."); }
  const header = created.metadata;
  if (header["uuid"] !== createdId || header["docType"] !== "DEVICE" || header["editVersion"] !== "3.2.149.88089769" || typeof header["client"] !== "string" || !/^[a-f0-9]{16}$/u.test(header["client"]) || typeof header["updateTime"] !== "number" || !Number.isSafeInteger(header["updateTime"]) || header["updateTime"] < 0 || header["version"] !== "1" || Object.keys(header).some((key) => !["uuid", "docType", "editVersion", "client", "updateTime", "version"].includes(key))) { throw new Error("Created device native header differs from the reviewed encoding."); }
  if (!isRecord(meta.body["attributes"])) { throw new Error("Created device attributes are missing."); }
  return { profile: DEVICE_CREATE_PROFILE, createdId, beforeProjectSha256: plan.beforeProjectSha256, afterProjectSha256: sha256Json(projected(after)), documentCount: after.documents.length, saved: true, reopened: false };
}
