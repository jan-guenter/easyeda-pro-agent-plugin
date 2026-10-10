import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { DEVICE_ASSOCIATION_PROFILE, buildDeviceAssociationExpression, verifyDeviceAssociationEffect } from "./device-association.ts";
import type { DeviceAssociationPlan } from "./device-association.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import type { LibraryOperation } from "./library-operations.ts";
import { decodeModelTransform, encodeModelTransform } from "./model-transform-action.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";

export const DEVICE_TRANSFORM_PROFILE = "easyeda-pro-control.project-device-transform.v1";
export type DeviceTransformOperation = Extract<LibraryOperation, { action: "library.device.model-transform" }>;
export interface DeviceTransformPlan extends Omit<DeviceAssociationPlan, "profile"> {
  readonly profile: typeof DEVICE_TRANSFORM_PROFILE;
  readonly operation: DeviceTransformOperation;
  readonly inheritedInstances: DeviceTransformOperation["inheritedInstances"];
}
function projected(history: NativeHistorySnapshot): unknown {
  return history.documents.map(({ uuid, docType, metadata, records }) => ({ uuid, docType, metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }));
}
function storedAttribute(document: NativeDocumentSnapshot, component: NativeObjectSnapshot, key: string): unknown {
  const attributes = document.records.filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === component.id && entry.body["key"] === key);
  if (attributes.length > 1) { throw new Error("Device transform instance has duplicate stored attributes."); }
  const values = [attributes[0]?.body["value"]];
  const map = component.body["attrs"];
  if (map !== undefined && !isRecord(map)) { throw new Error("Device transform instance attribute map is malformed."); }
  if (isRecord(map) && Object.hasOwn(map, key)) { values.push(map[key]); }
  const present = values.filter((value) => value !== null && value !== undefined);
  if (present.some((value) => typeof value !== "string") || new Set(present).size > 1) { throw new Error("Device transform instance attribute sources disagree."); }
  return present[0];
}

/** PCB M8/getValue gives non-null DEVICE model fields precedence over footprint
 * defaults; component ATTR/body overrides remain explicit. SCH null ATTR values
 * likewise inherit their DEVICE property. No stored instance field is rewritten.
 */
export function deviceTransformInheritedInstances(history: NativeHistorySnapshot, deviceUuid: string): DeviceTransformOperation["inheritedInstances"] {
  const result: DeviceTransformOperation["inheritedInstances"] = [];
  for (const document of history.documents.filter((entry) => !isNativeDocumentDeleted(entry))) {
    const components = document.records.filter((entry) => entry.type === "COMPONENT");
    for (const record of document.records.filter((entry) => entry.type === "ATTR" && entry.body["key"] === "Device" && entry.body["value"] === deviceUuid)) {
      if (!components.some((component) => component.id === record.body["parentId"])) { throw new Error("Device transform has an unresolved instance parent."); }
    }
    for (const component of components) {
      if (storedAttribute(document, component, "Device") === deviceUuid && storedAttribute(document, component, "3D Model Transform") === undefined) {
        if (document.docType !== "PCB" && document.docType !== "SCH_PAGE") { throw new Error("Device transform has an unreviewed inheriting document family."); }
        if (component.body["locked"] === true) { throw new Error("Device transform would alter a locked instance model."); }
        result.push({ documentUuid: document.uuid, documentType: document.docType, componentUuid: component.id });
      }
    }
  }
  return result.toSorted((a, b) => canonicalJson(a).localeCompare(canonicalJson(b)));
}

export function prepareDeviceTransform(input: unknown, history: NativeHistorySnapshot): DeviceTransformPlan {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "library.device.model-transform" || operation.libraryUuid !== history.projectUuid || history.projectOwnerUuid === undefined) { throw new Error("Device transform requires an exact current-project collection and owner."); }
  const device = history.documents.find((entry) => entry.uuid === operation.target.uuid && entry.docType === "DEVICE" && !isNativeDocumentDeleted(entry));
  const meta = device?.records.find((entry) => entry.id === "META" && entry.type === "META");
  if (device === undefined || meta === undefined || !isRecord(meta.body["attributes"]) || typeof meta.body["title"] !== "string" || !Array.isArray(meta.body["tags"]) || !Array.isArray(meta.body["images"]) || typeof meta.body["source"] !== "string") { throw new Error("Complete native device metadata is unavailable."); }
  const old = meta.body["attributes"]["3D Model Transform"];
  const model = meta.body["attributes"]["3D Model"];
  if (typeof old !== "string" || typeof model !== "string" || !/^[a-f0-9]{32}\|[a-f0-9]{32}$/u.test(model)) { throw new Error("Device transform requires an existing exact model binding and stored transform."); }
  decodeModelTransform(old);
  const value = encodeModelTransform(operation.transform);
  if (value === old) { throw new Error("Device transform patch has no effect."); }
  const inheritedInstances = deviceTransformInheritedInstances(history, device.uuid);
  const requested = operation.inheritedInstances.toSorted((a, b) => canonicalJson(a).localeCompare(canonicalJson(b)));
  if (canonicalJson(requested) !== canonicalJson(inheritedInstances)) { throw new Error("Device transform inherited-instance authority differs from the complete checkpoint."); }
  const beforeMeta = structuredClone(meta.body);
  const afterMeta = { ...structuredClone(meta.body), attributes: { ...structuredClone(meta.body["attributes"]), "3D Model Transform": value } };
  return { profile: DEVICE_TRANSFORM_PROFILE, operation: structuredClone(operation), projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    deviceUuid: device.uuid, beforeMeta, afterMeta, associations: [], beforeProjectSha256: sha256Json(projected(history)), inheritedInstances };
}
function metadataPlan(plan: DeviceTransformPlan): DeviceAssociationPlan {
  if (plan.profile !== DEVICE_TRANSFORM_PROFILE || plan.associations.length > 0 || plan.model !== undefined) { throw new Error("Malformed device transform metadata plan."); }
  const operation = libraryOperationSchema.parse(plan.operation);
  const attributes = plan.beforeMeta["attributes"];
  if (operation.action !== "library.device.model-transform" || operation.libraryUuid !== plan.projectUuid || operation.target.uuid !== plan.deviceUuid || !isRecord(attributes) ||
      canonicalJson(plan.afterMeta) !== canonicalJson({ ...plan.beforeMeta, attributes: { ...attributes, "3D Model Transform": encodeModelTransform(operation.transform) } })) {
    throw new Error("Device transform plan exceeds its typed single-value change.");
  }
  return { profile: DEVICE_ASSOCIATION_PROFILE, projectUuid: plan.projectUuid, ownerUuid: plan.ownerUuid, deviceUuid: plan.deviceUuid,
    beforeMeta: plan.beforeMeta, afterMeta: plan.afterMeta, associations: [], beforeProjectSha256: plan.beforeProjectSha256 };
}
export function buildDeviceTransformExpression(plan: DeviceTransformPlan): string {
  return buildDeviceAssociationExpression(metadataPlan(plan), "project-device-transform");
}
export function verifyDeviceTransformEffect(plan: DeviceTransformPlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): Record<string, unknown> {
  const expected = prepareDeviceTransform(plan.operation, before);
  if (canonicalJson(expected) !== canonicalJson(plan)) { throw new Error("Device transform immutable preparation differs from its checkpoint."); }
  const proof = verifyDeviceAssociationEffect(metadataPlan(plan), before, after);
  return { ...proof, profile: DEVICE_TRANSFORM_PROFILE, inheritedInstances: plan.inheritedInstances, storedInstanceRecordsChanged: false, mechanicalValidation: "not-performed" };
}
export function inverseDeviceTransformOperation(plan: DeviceTransformPlan): DeviceTransformOperation | undefined {
  const attributes = plan.beforeMeta["attributes"];
  if (!isRecord(attributes) || typeof attributes["3D Model Transform"] !== "string") { throw new Error("Device transform inverse baseline missing."); }
  const transform = decodeModelTransform(attributes["3D Model Transform"]);
  if (encodeModelTransform(transform) !== attributes["3D Model Transform"]) { return undefined; }
  return { ...structuredClone(plan.operation), id: `inverse-${sha256Json(plan.operation).slice(0, 32)}`, transform };
}
