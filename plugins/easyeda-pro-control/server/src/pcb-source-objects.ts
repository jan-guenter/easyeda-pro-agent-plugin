import { z } from "zod";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { PcbInheritedLineEvidence } from "./pcb-inherited-lines.ts";
import type { pcbSelectedObjectsResultSchema } from "./pcb-selected-objects.ts";
import { PCB_SELECTED_OBJECTS_METHOD, derivePcbSelectedObjects, pcbSelectedObjectIdsSchema } from "./pcb-selected-objects.ts";

export const PCB_SOURCE_OBJECT_METHOD = "eda.pcb_Primitive.getPrimitiveByPrimitiveId";
export const PCB_SOURCE_OBJECTS_METHOD = "eda.pcb_Primitive.getPrimitivesByPrimitiveId";
export const PCB_SOURCE_OBJECTS_PROFILE = "easyeda-pro-control.pcb-explicit-source-objects.v1";
export const PCB_SOURCE_OBJECTS_LIMITATIONS = [
  "Native-source DTO equivalent, not public primitive instances or public getter execution/parity. The installed singular getter is empty; the plural wrapper delegates to it. Neither is called.",
  "One exact ID or 1–256 unique IDs in caller order. Missing IDs refuse, rather than returning undefined or a partial array. Only root Line, Arc, Via, standalone Pad, Component and STRING (String) are supported; inherited, generated, grouped, unsupported or colliding requested identities refuse the entire call.",
  "Each DTO retains the complete exported native source record and its direct source-backed ATTR records, including native units, nulls and spelling. No SDK getter conversion, defaults or model serialization. Component DTOs omit inherited footprint geometry and generated attributes.",
  "Complete source/inventory correspondence is required for every requested owning family, with duplicate and cross-family identity checks across all inventory families. Pad proof includes component-owned pad correlation; requested ComponentPad and inherited tracks still refuse.",
  "Two identical source/inventory/source cycles bind an active project-owned type-3 PCB and private runtime fingerprint. Each constituent read is independently double-sampled. No selection RPC or UI changes. Switching away and back between observations remains undetectable; no atomic snapshot or persistence claim.",
  "Unselected inherited footprint lines may require the maintained fresh checkpoint proof. Its existing ownership and geometry restrictions remain unchanged. Generated poured-state correlation must be exactly empty; generated polygon and component-descendant identity namespaces refuse.",
  "At most 20000 source records and identities per inventory family, 16 MiB source evidence and 2 MiB result. Exceeding bounds refuses without truncation. No navigation, Save, mutation or retry. Offline tests do not establish connected validation for any family.",
] as const;
const identity = pcbSelectedObjectIdsSchema.element;
export const pcbSourceObjectArgumentsSchema = z.object({ id: identity }).strict();
export const pcbSourceObjectsArgumentsSchema = z.object({ ids: pcbSelectedObjectIdsSchema.min(1) }).strict();
export const pcbSourceObjectsRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal(PCB_SOURCE_OBJECT_METHOD), arguments: pcbSourceObjectArgumentsSchema }).strict(),
  z.object({ method: z.literal(PCB_SOURCE_OBJECTS_METHOD), arguments: pcbSourceObjectsArgumentsSchema }).strict(),
]);
export function isPcbSourceObjectsMethod(method: string): boolean {
  return method === PCB_SOURCE_OBJECT_METHOD || method === PCB_SOURCE_OBJECTS_METHOD;
}
export function pcbSourceObjectIds(input: unknown): string[] {
  const request = pcbSourceObjectsRequestSchema.parse(input);
  return request.method === PCB_SOURCE_OBJECT_METHOD ? [request.arguments.id] : request.arguments.ids;
}

/** Reuse only the pure complete owning-family projection. Caller IDs replace
 * selection data; no selected-ID getter or public primitive mapper is invoked.
 */
export function derivePcbSourceObjects(source: NativeSourceSnapshot, inventory: unknown, requestInput: unknown,
  documentUuid: string, inherited?: PcbInheritedLineEvidence): z.infer<typeof pcbSelectedObjectsResultSchema> {
  return derivePcbSelectedObjects(source, inventory, pcbSourceObjectIds(requestInput),
    { method: PCB_SELECTED_OBJECTS_METHOD, arguments: {} }, documentUuid, inherited);
}
