import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { buildReviewedNativeSourceMerge } from "./design-native-adapter.ts";
import type { DesignNativeAdapter } from "./design-native-adapter.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceDelta, NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { buildNativeStackPersistenceCode } from "./stack-native-persistence.ts";

const layer = z.number().int().min(1).max(1024);
const physicalLayer = z.object({ layerId: layer, material: z.string().max(256).nullable(), thicknessMm: z.number().nonnegative().max(20), permittivity: z.number().positive().max(100).nullable(), lossTangent: z.number().nonnegative().max(1).nullable(), isKeepIsland: z.boolean(), zIndex: z.number().int().nonnegative().max(1_000_000_000).optional() }).strict();
/** Ordered complete physical stack, top to bottom. Display/lock/color fields
 * are not a side effect of configuring material and enabled copper layers.
 */
export const designStackOperationSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u), action: z.literal("pcb.stack.replace"),
  layers: z.array(physicalLayer).min(3).max(128), enabledCopperLayers: z.array(layer).min(2).max(32),
}).strict().superRefine((value, context) => {
  if (new Set(value.layers.map((entry) => entry.layerId)).size !== value.layers.length || new Set(value.enabledCopperLayers).size !== value.enabledCopperLayers.length) {context.addIssue({ code: "custom", message: "Duplicate stack layer identity." });}
  if (!value.enabledCopperLayers.includes(1) || !value.enabledCopperLayers.includes(2)) {context.addIssue({ code: "custom", message: "Top and bottom copper layers must remain enabled." });}
  const order = value.layers.map((entry, index) => entry.zIndex ?? nativeStackZIndex(entry.layerId, index));
  if (order.some((entry, index) => index > 0 && entry <= (order[index - 1] ?? entry))) {context.addIssue({ code: "custom", message: "Explicit native order keys must strictly ascend in stack order." });}
});
export type DesignStackOperation = z.infer<typeof designStackOperationSchema>;
export const DESIGN_STACK_OPERATION_PROFILE = "easyeda-pro-control.pcb-stack.v1";
export function compileDesignStackOperation(operation: unknown): { profile: typeof DESIGN_STACK_OPERATION_PROFILE; id: string; action: "pcb.stack.replace"; documentType: 3; resultKind: "boolean"; operation: DesignStackOperation } {
  const parsed = designStackOperationSchema.parse(operation);
  return { profile: DESIGN_STACK_OPERATION_PROFILE, id: parsed.id, action: parsed.action, documentType: 3, resultKind: "boolean", operation: parsed };
}

function layerIdentity(object: NativeSourceObject): number {
  const key: unknown = JSON.parse(object.id);
  if (!Array.isArray(key) || key.length !== 2 || key[0] !== object.type || typeof key[1] !== "number" || !Number.isInteger(key[1])) {throw new Error("Malformed native stack layer identity.");}
  return key[1];
}

/** Native mfe.getPhyZIndex. This is physical order, not arbitrary display order. */
export function nativeStackZIndex(layerId: number, index: number): number {
  return ({ 3: 1, 7: 2, 5: 3, 1: 1000, 2: 9000, 6: 10_000, 8: 10_001, 4: 10_002 } as Readonly<Record<number, number>>)[layerId] ?? 1000 + index - 3;
}

export function expectedDesignStackSource(operation: unknown, before: NativeSourceSnapshot): NativeSourceSnapshot {
  const parsed = designStackOperationSchema.parse(operation);
  if (canonicalJson(parsed.layers.slice(0, 4).map((entry) => entry.layerId)) !== "[3,7,5,1]" || canonicalJson(parsed.layers.slice(-4).map((entry) => entry.layerId)) !== "[2,6,8,4]") {throw new Error("Native stack requires complete standard surface layers in Top-to-Bottom order.");}
  let substrateIndex = 0;
  for (const [index, entry] of parsed.layers.entries()) {
    if (entry.zIndex !== undefined && entry.zIndex !== nativeStackZIndex(entry.layerId, index)) {throw new Error("Explicit stack zIndex differs from the pinned native canonical physical order.");}
    if (entry.layerId >= 361) {
      if (entry.layerId !== 361 + substrateIndex) {throw new Error("Native stack dielectric identities must be consecutive from 361 in physical order.");}
      substrateIndex += 1;
    }
  }
  if (before.schema !== "easyeda-pro-control.document-source.v1" || before.document["docType"] !== "PCB" || before.sha256 !== sha256Json({ schema: before.schema, document: before.document, objects: before.objects })) {throw new Error("Invalid complete stack baseline.");}
  const layerRecords = before.objects.filter((object) => object.type === "LAYER");
  if (new Set(before.objects.map((object) => object.id)).size !== before.objects.length) {throw new Error("Duplicate native source identities.");}
  const byLayer = new Map(layerRecords.map((object) => [layerIdentity(object), object]));
  const physical = new Map(before.objects.filter((object) => object.type === "LAYER_PHYS").map((object) => [layerIdentity(object), object]));
  const copper = layerRecords.filter((object) => ["TOP", "BOTTOM", "SIGNAL", "PLANE"].includes(String(object.body["layerType"])));
  const copperIds = new Set(copper.map((object) => layerIdentity(object)));
  if (parsed.enabledCopperLayers.some((id) => !copperIds.has(id))) {throw new Error("Enabled copper layer is absent or not copper in the native layer table.");}
  const physicalIds = new Set(parsed.layers.map((entry) => entry.layerId));
  if (parsed.enabledCopperLayers.some((id) => !physicalIds.has(id))) {throw new Error("Enabled copper layer has no physical stack entry.");}
  const unusedPhysical = parsed.layers.filter((entry) => copperIds.has(entry.layerId) && !parsed.enabledCopperLayers.includes(entry.layerId));
  if (unusedPhysical.length > 0) {throw new Error("Physical stack includes disabled copper.");}
  const oldPhysicalIds = new Set(physical.keys());
  for (const [id, object] of physical) {
    if (byLayer.get(id)?.body["layerType"] !== "SUBSTRATE" && !copperIds.has(id) && !physicalIds.has(id)) {throw new Error("Complete stack must retain existing surface layers.");}
    if (object.body["locked"] === true) {throw new Error("Cannot replace locked physical stack data.");}
  }
  const activeId = before.objects.find((object) => object.type === "ACTIVE_LAYER")?.body["layerId"];
  if (typeof activeId === "number" && copperIds.has(activeId) && !parsed.enabledCopperLayers.includes(activeId)) {throw new Error("Cannot disable the active copper layer.");}
  const newSubstrates: NativeSourceObject[] = [];
  const inactiveTransparency = layerRecords[0]?.body["inactiveTransparency"];
  if (typeof inactiveTransparency !== "number" || layerRecords.some((object) => object.body["inactiveTransparency"] !== inactiveTransparency)) {throw new Error("Native layer table has no consistent inactive transparency.");}
  const coreLayers = parsed.layers.filter((entry) => copperIds.has(entry.layerId) || byLayer.get(entry.layerId)?.body["layerType"] === "SUBSTRATE" || (!byLayer.has(entry.layerId) && entry.layerId >= 361));
  if (coreLayers[0]?.layerId !== 1 || coreLayers.at(-1)?.layerId !== 2) {throw new Error("Physical copper stack must run from Top to Bottom.");}
  const nativeCopperOrder = [1, ...Array.from({ length: parsed.enabledCopperLayers.length - 2 }, (_, index) => 15 + index), 2];
  if (parsed.enabledCopperLayers.length % 2 !== 0 || canonicalJson(coreLayers.filter((entry) => copperIds.has(entry.layerId)).map((entry) => entry.layerId)) !== canonicalJson(nativeCopperOrder)) {throw new Error("Native stack requires an even copper count and consecutive inner layers in canonical order.");}
  for (let index = 0; index < coreLayers.length; index += 1) {
    const entry = coreLayers[index];
    if (entry === undefined || entry.thicknessMm <= 0 || copperIds.has(entry.layerId) !== (index % 2 === 0)) {throw new Error("Copper and positive-thickness dielectric layers must alternate.");}
  }
  // Native be.getDefPhys uses fresh IDs >=361 and this exact substrate
  // Metadata. Copper/surface identities remain the existing native LAYER rows.
  const desiredPhysical = parsed.layers.map((entry, index): NativeSourceObject => {
    if (!byLayer.has(entry.layerId) && !oldPhysicalIds.has(entry.layerId)) {
      if (entry.layerId < 361) {throw new Error("Stack layer lacks an existing native layer identity.");}
      newSubstrates.push({ id: JSON.stringify(["LAYER", entry.layerId]), type: "LAYER", body: { layerId: entry.layerId, layerType: "SUBSTRATE", layerName: `Dielectric${entry.layerId - 360}`, use: false, show: false, locked: false, activeColor: "#000000", activateTransparency: 1, inactiveColor: "#000000", inactiveTransparency } });
    }
    const previous = physical.get(entry.layerId);
    const thickness = Math.round(entry.thicknessMm / 0.0254 * 1000 + 1e-10) / 1000;
    return { id: JSON.stringify(["LAYER_PHYS", entry.layerId]), type: "LAYER_PHYS", body: { ...previous?.body, material: entry.material, thickness, permittivity: entry.permittivity, lossTangent: entry.lossTangent, isKeepIsland: entry.isKeepIsland, zIndex: nativeStackZIndex(entry.layerId, index) } };
  });
  const objects = before.objects.filter((object) => object.type !== "LAYER_PHYS" && !(object.type === "LAYER" && object.body["layerType"] === "SUBSTRATE" && !physicalIds.has(layerIdentity(object)))).map((object) => {
    if (object.type !== "LAYER" || !copperIds.has(layerIdentity(object))) {return object;}
    const use = parsed.enabledCopperLayers.includes(layerIdentity(object));
    if (!use && object.body["show"] === true) {throw new Error("Cannot disable visible copper while preserving its show flag; hide that layer explicitly first.");}
    if (!use && before.objects.some((primitive) => !["LAYER", "LAYER_PHYS", "ACTIVE_LAYER"].includes(primitive.type) && primitive.body["layerId"] === layerIdentity(object))) {throw new Error("Cannot disable a layer containing design primitives.");}
    return { id: object.id, type: object.type, body: { ...object.body, use } };
  });
  objects.push(...desiredPhysical, ...newSubstrates);
  objects.sort((left, right) => left.id.localeCompare(right.id));
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}

export function verifyDesignStackSourceEffect(operation: unknown, before: NativeSourceSnapshot, after: NativeSourceSnapshot): NativeSourceDelta {
  const expected = expectedDesignStackSource(operation, before);
  if (canonicalJson(expected) !== canonicalJson(after)) {throw new Error("Native stack effect changed unrelated records or differs from the requested construction.");}
  return compareDocumentSources(before, after);
}

export function buildDesignStackAdapter(operation: unknown, before: NativeSourceSnapshot): DesignNativeAdapter {
  const expected = expectedDesignStackSource(operation, before);
  // Admission and source-only restrictions remain shared with the ordinary
  // Merge adapter, but that setter alone does not upload layer history.
  const adapter = buildReviewedNativeSourceMerge(before, expected);
  return { ...adapter, code: buildNativeStackPersistenceCode(before, expected) };
}

export function inverseDesignStackOperation(operation: unknown, before: NativeSourceSnapshot): DesignStackOperation | undefined {
  const parsed = designStackOperationSchema.parse(operation);
  const physical = before.objects.filter((object) => object.type === "LAYER_PHYS");
  if (physical.some((object) => typeof object.body["thickness"] !== "number" || typeof object.body["zIndex"] !== "number")) {return undefined;}
  physical.sort((left, right) => Number(left.body["zIndex"]) - Number(right.body["zIndex"]));
  const candidate = designStackOperationSchema.safeParse({
    id: `${parsed.id.slice(0, 119)}.inverse`, action: "pcb.stack.replace",
    enabledCopperLayers: before.objects.filter((object) => object.type === "LAYER" && ["TOP", "BOTTOM", "SIGNAL", "PLANE"].includes(String(object.body["layerType"])) && object.body["use"] === true).map((object) => layerIdentity(object)),
    layers: physical.map((object) => ({ layerId: layerIdentity(object), material: object.body["material"], thicknessMm: Number(object.body["thickness"]) * 0.0254, permittivity: object.body["permittivity"], lossTangent: object.body["lossTangent"], isKeepIsland: object.body["isKeepIsland"], zIndex: object.body["zIndex"] })),
  });
  if (!candidate.success) {return undefined;}
  const forward = expectedDesignStackSource(parsed, before);
  try {
    const restored = expectedDesignStackSource(candidate.data, forward);
    return canonicalJson(restored) === canonicalJson(before) ? candidate.data : undefined;
  } catch {return undefined;}
}
