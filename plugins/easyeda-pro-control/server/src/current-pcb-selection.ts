import { z } from "zod";

export const CURRENT_PCB_SELECTED_GEOMETRY_METHOD = "eda.pcb_SelectControl.getSelectedPrimitives";
export const CURRENT_PCB_SELECTION_FAMILIES = ["Line", "Arc", "Via", "Component", "Pad", "String", "Attribute", "Dimension", "Image"] as const;
export const CURRENT_PCB_SELECTION_LIMITATION = "getSelectedPrimitives is a native loaded-view geometry equivalent with empty arguments. Each complete sample brackets the nine existing family projections with the entire ordered native selected-ID list; two compound samples must match. Returns every selected object in selected order or refuses the whole request when an ID is missing, ambiguous or unsupported. Fill, Polyline, Region, Pour, Poured, Object and inherited String views outside these family readers are unsupported, never silently dropped. Nonempty selection observes every family under its existing bounds, including unselected rows; the combined byte bound still applies. Empty selection skips family serialization but retains both selection brackets and native identity checks. observedFamilies preserves complete family ID order and Attribute groups preserve observed associations, not reciprocal ownership or saved membership. The raw selected-object serializer is never called: it filters objects without toJSON and can substitute showNet. This equivalent uses the existing family DTO net fields instead, without claiming full public result parity. Selection itself is not changed; sampled stability is not atomic isolation or a writer baseline.";

export function createCurrentPcbSelectionFields(id: z.ZodType<string>, maxRows: number): {
  selectedPrimitiveIds: z.ZodArray<z.ZodType<string>>;
  observedFamilies: z.ZodArray<z.ZodObject<{
    family: z.ZodEnum<{ [K in typeof CURRENT_PCB_SELECTION_FAMILIES[number]]: K }>;
    ids: z.ZodArray<z.ZodType<string>>;
  }>>;
  selectionEvidence: z.ZodLiteral<"native-ordered-selection-and-complete-family-projections">;
} {
  return { selectedPrimitiveIds: z.array(id).max(maxRows),
    observedFamilies: z.array(z.object({ family: z.enum(CURRENT_PCB_SELECTION_FAMILIES), ids: z.array(id).max(maxRows) }).strict())
      .max(CURRENT_PCB_SELECTION_FAMILIES.length),
    selectionEvidence: z.literal("native-ordered-selection-and-complete-family-projections") };
}

interface SelectionPayload {
  readonly selectedPrimitiveIds: readonly string[];
  readonly observedFamilies: readonly { readonly family: typeof CURRENT_PCB_SELECTION_FAMILIES[number]; readonly ids: readonly string[] }[];
  readonly attributeParentGroups: readonly { readonly parentPrimitiveId: string; readonly ids: readonly string[] }[];
  readonly rows: readonly { readonly primitiveId: string; readonly primitiveType: string; readonly parentPrimitiveId?: string }[];
}

/** Check the retained membership evidence independently of the generated
 * program. These are observed view associations, not persisted source owners. */
export function validateCurrentPcbSelection(payload: SelectionPayload, maxRows: number): number {
  if (payload.selectedPrimitiveIds.length !== payload.rows.length ||
    new Set(payload.selectedPrimitiveIds).size !== payload.selectedPrimitiveIds.length) {
    throw new Error("Selected PCB geometry differs from the complete selected-ID sequence.");
  }
  if (payload.selectedPrimitiveIds.length === 0) {
    if (payload.observedFamilies.length > 0 || payload.attributeParentGroups.length > 0) {
      throw new Error("Empty PCB selection must not claim family observations.");
    }
    return 0;
  }
  if (payload.observedFamilies.length !== CURRENT_PCB_SELECTION_FAMILIES.length) {
    throw new Error("Selected PCB geometry lacks the complete supported family roster.");
  }
  const membership = new Map<string, string>();
  for (const [index, family] of payload.observedFamilies.entries()) {
    if (family.family !== CURRENT_PCB_SELECTION_FAMILIES[index]) { throw new Error("Selected PCB family order is invalid."); }
    for (const id of family.ids) {
      if (membership.has(id)) { throw new Error("Selected PCB family membership is duplicate or ambiguous."); }
      membership.set(id, family.family);
    }
  }
  const attributeIds: string[] = [], attributeParents = new Map<string, string>(), parents = new Set<string>();
  for (const group of payload.attributeParentGroups) {
    if (parents.has(group.parentPrimitiveId)) { throw new Error("Selected PCB Attribute groups contain duplicate parents."); }
    parents.add(group.parentPrimitiveId);
  }
  for (const group of payload.attributeParentGroups) {
    for (const id of group.ids) {
      if (parents.has(id) || attributeParents.has(id) || attributeIds.length >= maxRows) {
        throw new Error("Selected PCB Attribute groups have duplicate, colliding or oversized membership.");
      }
      attributeParents.set(id, group.parentPrimitiveId); attributeIds.push(id);
    }
  }
  const observedAttributes = payload.observedFamilies.find(family => family.family === "Attribute")?.ids;
  if (observedAttributes === undefined || observedAttributes.length !== attributeIds.length ||
    observedAttributes.some((id, index) => id !== attributeIds[index])) {
    throw new Error("Selected PCB Attribute groups differ from their complete observed family.");
  }
  for (const [index, row] of payload.rows.entries()) {
    if (row.primitiveId !== payload.selectedPrimitiveIds[index] || membership.get(row.primitiveId) !== row.primitiveType ||
      row.primitiveType === "Attribute" && attributeParents.get(row.primitiveId) !== row.parentPrimitiveId) {
      throw new Error("Selected PCB geometry has missing, unsupported or contradictory selected membership.");
    }
  }
  return membership.size;
}

/** Fixed fragment in the original geometry owner's scope. Never call the raw
 * selected-object handler at PCB217199c8@10406582: it drops nonserializable
 * selected objects and replaces some nets with showNet. */
export const CURRENT_PCB_SELECTION_PROGRAM = `
const selectedIds=async()=>{
 const raw=await call('pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds',undefined),ids=[],seen=new Set();
 for(let i=0,n=arrayLength(raw);i<n;i++){const id=text(own(raw,String(i)),256);if(id.length===0||seen.has(id))bad();seen.add(id);ids.push(id);}
 check();return ids;
};
const readSelected=async()=>{
 await identity();check();const before=await selectedIds(),families=[],observedFamilies=[],byId=new Map();let attributeParentGroups=[];
 if(before.length>0){
  for(const selectedFamily of selectionFamilies){
   const raw=await call(topics[selectedFamily],{});check();
   const copied=selectedFamily==='Attribute'?copyAttributeGroups(raw):copyRows(raw,selectedFamily);
   const rows=selectedFamily==='Attribute'?copied.rows:copied;
   if(selectedFamily==='Attribute')attributeParentGroups=copied.attributeParentGroups;
   const ids=[];for(const row of rows){if(byId.has(row.primitiveId))bad();byId.set(row.primitiveId,row);ids.push(row.primitiveId);}
   families.push({family:selectedFamily,rows});observedFamilies.push({family:selectedFamily,ids});
   if(new TextEncoder().encode(JSON.stringify({families,attributeParentGroups})).byteLength>maxBytes)bad();
  }
 }
 const after=await selectedIds();if(JSON.stringify(before)!==JSON.stringify(after))bad();
 await identity();check();
 const rows=before.map(id=>{const row=byId.get(id);if(row===undefined)bad();return row;});
 return{selectedPrimitiveIds:before,rows,families,observedFamilies,attributeParentGroups};
};
`;
