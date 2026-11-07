import { validateCurrentPcbSelection } from "./current-pcb-selection.ts";

export const CURRENT_PCB_LOOKUP_METHODS = ["eda.pcb_Primitive.getPrimitiveByPrimitiveId", "eda.pcb_Primitive.getPrimitivesByPrimitiveId"] as const;
export const CURRENT_PCB_LOOKUP_LIMITATION = "Generic primitive lookup is a native supported-family DTO equivalent. Both methods accept primitiveIds in caller order; the singular method requires exactly one ID. Two matching complete compound samples cover Line, Arc, Via, Component, Pad, String, Attribute, Dimension and Image before selecting requested IDs. Missing, ambiguous or unsupported IDs refuse the whole request. Every unrequested row in those families must also satisfy its existing bounds and projection. This does not prove absence from other families, saved membership, public class-instance parity or an atomic snapshot. Selection is neither read nor changed; the installed generic object getters are empty stubs and are not called.";

interface LookupPayload {
  readonly rows: readonly { readonly primitiveId: string; readonly primitiveType: string; readonly parentPrimitiveId?: string }[];
  readonly observedFamilies: Parameters<typeof validateCurrentPcbSelection>[0]["observedFamilies"];
  readonly attributeParentGroups: Parameters<typeof validateCurrentPcbSelection>[0]["attributeParentGroups"];
  readonly observedRowCount: number;
}
/** Reuse the same independent supported-family membership checks as selection,
 * with the requested IDs supplying the sequence rather than editor selection. */
export function validateCurrentPcbPrimitiveLookup(payload: LookupPayload, requestedIds: readonly string[], maximum: number): number {
  const count = validateCurrentPcbSelection({ ...payload, selectedPrimitiveIds: requestedIds }, maximum);
  if (count !== payload.observedRowCount) { throw new Error("PCB primitive lookup differs from its complete observed membership."); }
  return count;
}

/** Fixed fragment in the original geometry receiver. Never call stub generic
 * getters, silently skip a missing ID, or enumerate raw selected objects. */
export const CURRENT_PCB_LOOKUP_PROGRAM = `
const readLookup=async()=>{
 await identity();check();const families=[],observedFamilies=[],byId=new Map();let attributeParentGroups=[];
 for(const lookupFamily of selectionFamilies){
  const raw=await call(topics[lookupFamily],{});check();
  const copied=lookupFamily==='Attribute'?copyAttributeGroups(raw):copyRows(raw,lookupFamily),rows=lookupFamily==='Attribute'?copied.rows:copied;
  if(lookupFamily==='Attribute')attributeParentGroups=copied.attributeParentGroups;
  const ids=[];for(const row of rows){if(byId.has(row.primitiveId))bad();byId.set(row.primitiveId,row);ids.push(row.primitiveId);}
  families.push({family:lookupFamily,rows});observedFamilies.push({family:lookupFamily,ids});
  if(new TextEncoder().encode(JSON.stringify({families,attributeParentGroups})).byteLength>maxBytes)bad();
 }
 await identity();check();const rows=primitiveIds.map(id=>{const row=byId.get(id);if(row===undefined)bad();return row;});
 return{rows,families,observedFamilies,attributeParentGroups,observedRowCount:byId.size};
};
`;
