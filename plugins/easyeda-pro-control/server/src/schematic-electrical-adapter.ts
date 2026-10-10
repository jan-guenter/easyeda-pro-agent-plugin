import { randomBytes } from "node:crypto";
import { canonicalJson } from "./core.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { SCHEMATIC_NATIVE_READER_CODE } from "./schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { schematicOperationSchema } from "./schematic-operations.ts";
import type { SchematicOperation } from "./schematic-operations.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";
import type { SchematicSourceIds } from "./schematic-source-proof.ts";

export const SCHEMATIC_ELECTRICAL_PROFILE = "easyeda-pro-control.schematic-electrical.v1";
interface PreparedElectrical { readonly profile: typeof SCHEMATIC_ELECTRICAL_PROFILE; readonly expression: string; readonly createdId?: string }
type Pin = SchematicNativeComponent["pins"][number];
function same(left: unknown, right: unknown): boolean { return canonicalJson(left) === canonicalJson(right); }
export function isSchematicElectricalAction(action: string): boolean { return ["sch.net-label.create", "sch.net-label.delete", "sch.component-pin.no-connect", "sch.component.delete"].includes(action); }
function resolved(operation: SchematicOperation, ids: SchematicSourceIds): string {
  if (!("target" in operation)) { throw new Error("Electrical target missing."); }
  const id = "primitiveId" in operation.target ? operation.target.primitiveId : ids.targetId;
  if (id === undefined || (ids.targetId !== undefined && id !== ids.targetId)) { throw new Error("Electrical target not resolved exactly."); }
  return id;
}
function getPin(native: SchematicNativeSnapshot, id: string): { component: SchematicNativeComponent; pin: Pin } {
  const matches = native.components.flatMap((component) => component.pins.filter((pin) => pin.id === id).map((pin) => ({ component, pin })));
  const match = matches[0];
  if (matches.length !== 1 || match === undefined || match.component.locked || match.pin.body["locked"] === true) { throw new Error("No-connect needs exactly one unlocked component pin."); }
  if (![match.pin.body["x"], match.pin.body["y"]].every((value) => typeof value === "number" && Number.isFinite(value))) { throw new Error("No-connect pin origin is not finite."); }
  return match;
}
function nextZ(source: NativeSourceSnapshot): number {
  const values = source.objects.map((entry) => entry.body["zIndex"]).filter((value) => value !== undefined);
  if (values.some((value) => typeof value !== "number" || !Number.isSafeInteger(value))) { throw new Error("Native z-order is not a bounded integer."); }
  let result = 0;
  for (const value of values) { if (typeof value === "number") { result = Math.max(result, value); } }
  if (result >= Number.MAX_SAFE_INTEGER) { throw new Error("Native z-order exhausted."); }
  return result + 1;
}
function labelBody(operation: SchematicOperation, source: NativeSourceSnapshot): Record<string, unknown> {
  if (operation.action !== "sch.net-label.create") { throw new Error("Expected net-label create."); }
  return { x: operation.properties.x, y: -operation.properties.y, rotation: 0, color: null, fontFamily: null, fontSize: null, fontWeight: null, italic: null, underline: null, strikeout: null, align: "LEFT_BOTTOM", value: operation.properties.net, keyVisible: false, valueVisible: true, key: "_NETLABEL_", fillColor: null, parentId: "$$root", zIndex: nextZ(source), locked: false, groupId: "" };
}
export function assertSchematicElectricalSupported(input: unknown, source: NativeSourceSnapshot, nativeInput: unknown, ids: SchematicSourceIds = {}): void {
  const operation = schematicOperationSchema.parse(input);
  const native = correlateSchematicNativeSource(source, nativeInput);
  if (!isSchematicElectricalAction(operation.action)) { throw new Error("Electrical action has no fixed adapter."); }
  if (operation.action === "sch.net-label.create") { labelBody(operation, source); return; }
  const id = resolved(operation, ids);
  if (operation.action === "sch.component-pin.no-connect") { getPin(native, id); return; }
  const target = source.objects.find((entry) => entry.id === id);
  if (target === undefined || target.body["locked"] === true) { throw new Error("Electrical deletion target is absent or locked."); }
  if (operation.action === "sch.component.delete") {
    if (target.type !== "COMPONENT" || native.components.find((entry) => entry.id === id)?.kind !== "part") { throw new Error("Component deletion requires an exact ordinary part."); }
  } else if (target.type !== "ATTR" || target.body["key"] !== "_NETLABEL_" || target.body["parentId"] !== "$$root") { throw new Error("Net-label deletion requires an exact standalone native label."); }
}

export function buildSchematicElectricalAdapter(input: unknown, source: NativeSourceSnapshot, nativeInput: unknown, ids: SchematicSourceIds = {}): PreparedElectrical {
  assertSchematicElectricalSupported(input, source, nativeInput, ids);
  const operation = schematicOperationSchema.parse(input);
  const native = correlateSchematicNativeSource(source, nativeInput);
  const creating = operation.action === "sch.net-label.create";
  const targetId = creating ? undefined : resolved(operation, ids);
  const id = creating ? ids.createdId ?? randomBytes(8).toString("hex") : targetId;
  if (id === undefined || (creating && source.objects.some((entry) => entry.id === id))) { throw new Error("Native created identity collides or is missing."); }
  const markerId = operation.action === "sch.component-pin.no-connect" ? getPin(native, id).pin.noConnect?.id ?? randomBytes(8).toString("hex") : null;
  const zIndex = nextZ(source);
  const expression = `(async () => {
const binding = ${JSON.stringify(native.document)};
${SCHEMATIC_NATIVE_READER_CODE}
const canonical = (value) => JSON.stringify(value,(_key,entry)=>entry && typeof entry === "object" && !Array.isArray(entry) ? Object.fromEntries(Object.keys(entry).sort().map((key)=>[key,entry[key]])) : entry);
const baseline = ${JSON.stringify(canonicalJson(native))};
const shapeManager = schDoc.shapeManager;
const id = ${JSON.stringify(id)};
if (shapeManager.root?.id !== "$$root" || canonical(schCapture()) !== baseline) throw new Error("SCH_ELECTRICAL_BASELINE_CHANGED");
const runner = shapeManager.actionRunner;
if (typeof runner?.run !== "function") throw new Error("SCH_ELECTRICAL_RUNNER_MISSING");
await runner.run(() => {
  schCheck();
  if (canonical(schCapture()) !== baseline) throw new Error("SCH_ELECTRICAL_BASELINE_CHANGED");
  const action = ${JSON.stringify(operation.action)};
  if (action === "sch.net-label.create") {
    if (shapeManager.idManager.get(id) || typeof shapeManager.netLabel !== "function") throw new Error("SCH_LABEL_CREATE_UNAVAILABLE");
    const label = shapeManager.netLabel({id,x:${operation.action === "sch.net-label.create" ? operation.properties.x : 0},y:${operation.action === "sch.net-label.create" ? -operation.properties.y : 0},value:${JSON.stringify(operation.action === "sch.net-label.create" ? operation.properties.net : "")},rotation:0,color:null,fontFamily:null,fontSize:null,fontWeight:null,italic:null,underline:null,strikeout:null,hAlign:0,vAlign:2,locked:false,groupId:""});
    if (!label || label.id !== id) throw new Error("SCH_LABEL_CREATE_FAILED");
    shapeManager.appendChild(label); label.zIndex = ${zIndex};
  } else if (action === "sch.component-pin.no-connect") {
    const pin = shapeManager.idManager.get(id);
    if (!pin || typeof pin.getOrCreateNoConnect !== "function") throw new Error("SCH_PIN_MISSING");
    if (!pin.noConnect && shapeManager.idManager.get(${JSON.stringify(markerId)})) throw new Error("SCH_NOCONNECT_ID_COLLISION");
    const marker = pin.getOrCreateNoConnect({id:${JSON.stringify(markerId)},zIndex:${zIndex},locked:false,groupId:""});
    if (!marker || marker.id !== ${JSON.stringify(markerId)}) throw new Error("SCH_NOCONNECT_CREATE_FAILED");
    marker.value = ${JSON.stringify(operation.action === "sch.component-pin.no-connect" && operation.noConnected ? "yes" : "no")};
  } else {
    const model = shapeManager.idManager.get(id);
    if (!model || typeof model.remove !== "function" || model.locked === true) throw new Error("SCH_DELETE_TARGET_CHANGED");
    model.remove();
  }
});
schCheck();
${operation.action.endsWith(".delete") ? "return true;" : "return {primitiveId:id,snapshot:schCapture()};"}
})()`;
  return { profile: SCHEMATIC_ELECTRICAL_PROFILE, expression, ...(creating ? { createdId: id } : {}) };
}

function withoutPinNets(components: readonly SchematicNativeComponent[]): unknown {
  return components.map((component) => ({ id: component.id, kind: component.kind, locked: component.locked, body: component.body, attributes: component.attributes, pins: component.pins.map((pin) => ({ id: pin.id, body: pin.body, attributes: pin.attributes, noConnect: pin.noConnect })) }));
}
function withoutMarker(components: readonly SchematicNativeComponent[], pinId: string): unknown {
  return components.map((component) => ({ id: component.id, kind: component.kind, locked: component.locked, body: component.body, attributes: component.attributes, pins: component.pins.map((pin) => ({ id: pin.id, body: pin.body, attributes: pin.attributes, net: pin.net, noConnect: pin.id === pinId ? null : pin.noConnect })) }));
}
function ownedComponentIds(component: SchematicNativeComponent): Set<string> {
  return new Set([component.id, ...component.attributes.map((attr) => attr.id), ...component.pins.flatMap((pin) => [pin.id, ...pin.attributes.map((attr) => attr.id), ...(pin.noConnect === null ? [] : [pin.noConnect.id])])]);
}
export function verifySchematicElectricalEffect(input: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot, oldNativeInput: unknown, newNativeInput: unknown, ids: SchematicSourceIds = {}): NativeSourceDelta {
  assertSchematicElectricalSupported(input, before, oldNativeInput, ids);
  const operation = schematicOperationSchema.parse(input);
  const oldNative = correlateSchematicNativeSource(before, oldNativeInput);
  const newNative = correlateSchematicNativeSource(after, newNativeInput);
  if (!same(oldNative.document, newNative.document)) { throw new Error("Native electrical context changed."); }
  const delta = compareDocumentSources(before, after);
  if (delta.documentChanged) { throw new Error("Schematic document metadata changed."); }
  const expected = new Map(before.objects.map((entry) => [entry.id, entry]));
  if (operation.action === "sch.net-label.create") {
    const id = ids.createdId;
    if (id === undefined || expected.has(id)) { throw new Error("Net-label creation identity is not new."); }
    expected.set(id, { id, type: "ATTR", body: labelBody(operation, before) });
  } else {
    const id = resolved(operation, ids);
    if (operation.action === "sch.component-pin.no-connect") {
      const prior = getPin(oldNative, id).pin;
      const current = getPin(newNative, id).pin;
      const marker = current.noConnect;
      const value = operation.noConnected ? "yes" : "no";
      if (marker === null || marker.value !== value || (prior.noConnect !== null && marker.id !== prior.noConnect.id)) { throw new Error("No-connect marker identity/value mismatch."); }
      if (prior.noConnect === null && expected.has(marker.id)) { throw new Error("New no-connect marker reused a source identity."); }
      const body = prior.noConnect === null ? { parentId: id, key: "NO_CONNECT", x: prior.body["x"], y: prior.body["y"], value, zIndex: nextZ(before), locked: false, groupId: "" } : { ...prior.noConnect.body, value };
      if (!same(body, marker.body)) { throw new Error("No-connect changed pin-marker geometry or metadata."); }
      expected.set(marker.id, { id: marker.id, type: "ATTR", body });
      if (!same(withoutMarker(oldNative.components, id), withoutMarker(newNative.components, id))) { throw new Error("No-connect changed another native pin, property or net."); }
    } else {
      expected.delete(id);
      if (operation.action === "sch.component.delete") {
        const component = oldNative.components.find((entry) => entry.id === id);
        if (component === undefined || newNative.components.some((entry) => entry.id === id)) { throw new Error("Deleted component is still present."); }
        const owned = ownedComponentIds(component);
        for (const ownedId of owned) { expected.delete(ownedId); }
        if (!same(withoutPinNets(oldNative.components.filter((entry) => entry.id !== id)), withoutPinNets(newNative.components))) { throw new Error("Component deletion changed unrelated native properties."); }
      }
    }
  }
  if (operation.action.startsWith("sch.net-label.") && !same(withoutPinNets(oldNative.components), withoutPinNets(newNative.components))) { throw new Error("Net-label edit changed component geometry or properties."); }
  const records: NativeSourceObject[] = [...expected.values()].toSorted((a, b) => a.id.localeCompare(b.id));
  if (!same(records, after.objects)) { throw new Error("Electrical edit has unplanned source-record changes."); }
  return delta;
}

export function inverseSchematicElectricalOperation(input: unknown, ids: SchematicSourceIds): SchematicOperation | undefined {
  const operation = schematicOperationSchema.parse(input);
  if (operation.action === "sch.net-label.create" && ids.createdId !== undefined) { return schematicOperationSchema.parse({ id: `inverse:${operation.id}`, action: "sch.net-label.delete", target: { primitiveId: ids.createdId } }); }
  return undefined;
}
