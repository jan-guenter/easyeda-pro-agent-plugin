import { canonicalJson } from "./core.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";

interface Contact { x: number; y: number; lineIds: string[]; pinIds: string[]; kind: "Junction" | "UnConnectDot" | null }

/** Separate marker/ownership projection, not a substitute for the complete
 * flat topology proof. The initial writer excludes shared-WIRE endpoints and
 * pin-bearing junctions because their owner depends on native insertion/global
 * z order. Read-only guards never call lazy group collection getters.
 */
export function flatWireMarkerSpecification(source: NativeSourceSnapshot,
  native: { readonly components: readonly { readonly pins: readonly { readonly id: string; readonly body: Readonly<Record<string, unknown>> }[] }[] }, wireId: string): readonly Contact[] {
  const contacts = new Map<string, Contact>(), owners = new Map<string, string>();
  const point = (x: unknown, y: unknown): Contact => {
    if (typeof x !== "number" || typeof y !== "number" || !Number.isSafeInteger(x) || !Number.isSafeInteger(y) ||
        Math.abs(x) > 1_000_000 || Math.abs(y) > 1_000_000) { throw new Error("Flat wire marker origin is outside the exact integer domain."); }
    const key = canonicalJson([x, y]);
    const found = contacts.get(key);
    if (found !== undefined) { return found; }
    if (contacts.size >= 8192) { throw new Error("Flat wire marker graph exceeds its bound."); }
    const value: Contact = { x, y, lineIds: [], pinIds: [], kind: null }; contacts.set(key, value); return value;
  };
  for (const row of source.objects.filter((entry) => entry.type === "LINE")) {
    if (typeof row.body["lineGroup"] !== "string") { throw new TypeError("Flat wire marker LINE has no exact owner."); }
    owners.set(row.id, row.body["lineGroup"]);
    point(row.body["startX"], row.body["startY"]).lineIds.push(row.id);
    point(row.body["endX"], row.body["endY"]).lineIds.push(row.id);
  }
  for (const component of native.components) { for (const pin of component.pins) { point(pin.body["x"], pin.body["y"]).pinIds.push(pin.id); } }
  const selected = [...contacts.values()].filter((entry) => entry.lineIds.some((id) => owners.get(id) === wireId));
  for (const entry of selected) {
    if (entry.lineIds.some((id) => owners.get(id) !== wireId)) { throw new Error("Flat wire marker ownership excludes shared-WIRE contacts."); }
    const pins = entry.pinIds.length, wires = entry.lineIds.length;
    const junction = (pins >= 2 && wires > 0) || (pins === 1 && wires >= 2) || (pins === 0 && wires >= 3);
    if (junction && pins > 0) { throw new Error("Flat wire marker ownership excludes pin-bearing junctions."); }
    if (junction) { entry.kind = "Junction"; }
    else if (pins === 0 && wires === 1) { entry.kind = "UnConnectDot"; }
    entry.lineIds.sort(); entry.pinIds.sort();
  }
  return selected.toSorted((left, right) => canonicalJson([left.x, left.y]).localeCompare(canonicalJson([right.x, right.y])));
}

/** Pinned sch.js 3f50136f: refreshNetPoint4131035, updateWireJunction4130220;
 * marker cx/cy/r, reciprocal native sets and plain-object LINE→Set<ID> indexes.
 * The returned guard captures exact receivers/methods before any later await.
 * All reads are passive; absent lazy private group sets mean empty only.
 */
export function buildFlatWireMarkerGuard(specifications: readonly Contact[], wireId: string): string {
  return `((page,shapes)=>{
const spec=${JSON.stringify(specifications)},wireId=${JSON.stringify(wireId)},wire=shapes.idManager?.get(wireId),setLines=wire?.setLines,npm=shapes.netPointManager,getPoint=npm?.getNetPoint;
const fail=()=>{throw new Error('FLAT_WIRE_MARKER_OR_RECEIVER_DRIFT');};
const exact=(actual,expected)=>actual.length===expected.length&&new Set(actual).size===actual.length&&actual.every(value=>expected.includes(value));
const readSet=(object,key,absent=false)=>{const descriptor=Object.getOwnPropertyDescriptor(object,key);if(descriptor===undefined&&absent)return new Set();if(!descriptor||!('value'in descriptor)||!(descriptor.value instanceof Set))fail();return descriptor.value;};
const index=(object,key)=>{const descriptor=Object.getOwnPropertyDescriptor(object,key);if(!descriptor||!('value'in descriptor)||!descriptor.value||typeof descriptor.value!=='object'||Array.isArray(descriptor.value)||![Object.prototype,null].includes(Object.getPrototypeOf(descriptor.value)))fail();return descriptor.value;};
return()=>{
 if(page.shapeManager!==shapes||shapes.netPointManager!==npm||npm?.getNetPoint!==getPoint||shapes.idManager?.get(wireId)!==wire||wire?.setLines!==setLines||typeof setLines!=='function'||!Array.isArray(wire.children)||!Array.isArray(wire.lines))fail();
 const source=page.consistencyImpl?.decodeAndRealTimeSyncHandler?.getSourceCodeIdMap?.();if(!(source instanceof Map))fail();
 const groups={Junction:readSet(wire,'_junctionModels',true),UnConnectDot:readSet(wire,'_unConnectDotModels',true)};
 const global={Junction:readSet(npm,'junctionModels'),UnConnectDot:readSet(npm,'unConnectDotModels')};
 const maps={Junction:index(npm,'netGroupLineJunctionIdMap'),UnConnectDot:index(npm,'netGroupLineUnConnectDotIdMap')};
 const actual=wire.children.filter(child=>child?.notAddHistory===true||child?.modelType==='Junction'||child?.modelType==='UnConnectDot');
 const expected=[],identities=new Set();
 for(const item of spec){const node=getPoint.call(npm,{x:item.x,y:item.y});
  if(!node||node.x!==item.x||node.y!==item.y||node.wireNetGroup!==wire||!(node.Wire instanceof Set)||!(node.Pin instanceof Set)||!(node.Bus instanceof Set)||!(node.BusEntry instanceof Set)||node.Bus.size||node.BusEntry.size)fail();
  const models=(values,ids)=>{if(!exact([...values].map(model=>model.id),ids)||[...values].some(model=>model.shapeManager!==shapes||shapes.idManager.get(model.id)!==model||page.idManager.idMap.get(model.id)!==model))fail();};models(node.Wire,item.lineIds);models(node.Pin,item.pinIds);
  const candidates=actual.filter(model=>model.cx===item.x&&model.cy===item.y);
  if(item.kind===null){if(candidates.length)fail();continue;}
  if(candidates.length!==1)fail();const marker=candidates[0],kind=item.kind;
  if(typeof marker.id!=='string'||!marker.id||identities.has(marker.id)||source.has(marker.id)||marker.modelType!==kind||marker.tagName!==kind||marker.cmdKey!==(kind==='Junction'?'junction':'unConnectDot')||marker.r!==(kind==='Junction'?2.5:1)||marker.parent!==wire||marker.shapeManager!==shapes||marker.isConnected!==true||marker.notAddHistory!==true||marker.connectionPointNode!==node||typeof marker.getConsistencyData!=='function'||marker.getConsistencyData()!==undefined||shapes.idManager.get(marker.id)!==marker||page.idManager.idMap.get(marker.id)!==marker||!groups[kind].has(marker)||!global[kind].has(marker))fail();
  for(const pin of node.Pin)if(kind==='Junction'&&pin.junctionModel!==marker)fail();identities.add(marker.id);expected.push(marker);
 }
 if(!exact(actual,expected))fail();
 let indexedIds=0;
 for(const kind of ['Junction','UnConnectDot']){
  const typed=expected.filter(marker=>marker.modelType===kind);if(!exact([...groups[kind]],typed)||[...global[kind]].some(marker=>marker?.parent===wire&&!typed.includes(marker)))fail();
  const keys=Reflect.ownKeys(maps[kind]);if(keys.length>100000)fail();
  for(const key of keys){const descriptor=Object.getOwnPropertyDescriptor(maps[kind],key);if(typeof key!=='string'||!descriptor||!('value'in descriptor)||!(descriptor.value instanceof Set))fail();indexedIds+=descriptor.value.size;if(indexedIds>1000000)fail();
   for(const id of descriptor.value){if(typeof id!=='string')fail();if(identities.has(id)){const marker=expected.find(value=>value.id===id);if(marker.modelType!==kind||![...marker.connectionPointNode.Wire].some(line=>line.id===key))fail();}}
  }
  for(const line of wire.lines){const descriptor=Object.getOwnPropertyDescriptor(maps[kind],line.id);if(descriptor!==undefined&&(!('value'in descriptor)||!(descriptor.value instanceof Set)))fail();const ids=descriptor===undefined?[]:[...descriptor.value];const own=typed.filter(marker=>marker.connectionPointNode.Wire.has(line)).map(marker=>marker.id);if(!exact(ids,own))fail();}
 }
};
})`;
}
