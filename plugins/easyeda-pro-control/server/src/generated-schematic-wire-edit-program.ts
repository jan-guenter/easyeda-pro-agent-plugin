/** Fixed unmounted native-equivalent LINE stages. The original action/setter,
 * worker, Main SQL and saved-content capabilities remain separate gates. */
import { z } from "zod";
import { GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_FUNCTION } from "./generated-schematic-relevance-display-program.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_SCENE_FUNCTION } from "./generated-schematic-relevance-scene-program.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE } from "./generated-schematic-wire-native-source.ts";
import { GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE } from "./generated-schematic-wire-source.ts";
import { requireOriginalGeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";

export const GENERATED_SCHEMATIC_WIRE_EDIT_STAGES = ["capture", "preflight", "modify", "observe"] as const;
const pointsGet = "get points(){return this._points}";
const pointsSet = 'set points(t){this._points!==t&&this.shapeManager.modifyMonitor.record({model:this,attr:"points",oldValue:this._points,newValue:this._points=t})}';
function once(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCH209_WIRE_PROGRAM_ANCHOR"); } return source.replace(before, after);
}
function section(source: string, start: string, end: string, replacement: string): string {
  if (source.split(start).length !== 2 || source.split(end).length !== 2) { throw new Error("SCH209_WIRE_PROGRAM_SECTION"); }
  const from = source.indexOf(start), to = source.indexOf(end, from);
  if (to < from) { throw new Error("SCH209_WIRE_PROGRAM_ORDER"); } return source.slice(0, from) + replacement + source.slice(to);
}
function build(): string {
  let source = once(GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_FUNCTION, '["capture","preflight","modify","observe","save"].includes(stage)', `${JSON.stringify(GENERATED_SCHEMATIC_WIRE_EDIT_STAGES)}.includes(stage)`);
  source = once(source, 'keys(operation,["operationId","textId","beforeBody","afterBody","peers","rootIds"]);', 'keys(operation,["operationId","wireId","lineId","beforeBody","afterBody","peers","rootIds"]);');
  source = section(source, 'if(typeof operation.operationId!=="string"', 'const peerIds=', `if(typeof operation.operationId!=="string"||operation.operationId.length<20||operation.operationId.length>80||!/^sch209-wire-edit-[a-z0-9][a-z0-9-]*$/.test(operation.operationId)||![operation.wireId,operation.lineId].every(id=>typeof id==="string"&&/^0[a-f0-9]{15}$/.test(id))||operation.wireId===operation.lineId)bad("OPERATION");
const bodyKeys=["fillColor","fillStyle","strokeColor","strokeStyle","strokeWidth","startX","startY","endX","endY","lineGroup"];
keys(operation.beforeBody,bodyKeys);keys(operation.afterBody,bodyKeys);dense(operation.peers,6);if(operation.peers.length!==6)bad("BODY");
for(const body of [operation.beforeBody,operation.afterBody]){if(body.lineGroup!==operation.wireId||body.fillColor!==null||body.fillStyle!==null||body.strokeColor!=="#008800"||body.strokeStyle!=="SOLID"||body.strokeWidth!==2||![body.startX,body.startY,body.endX,body.endY].every(v=>typeof v==="number"&&Number.isFinite(v)&&Math.abs(v)<=10000&&!Object.is(v,-0))||(body.startX===body.endX)===(body.startY===body.endY))bad("LINE_BODY");}
if(operation.beforeBody.startX!==0||operation.beforeBody.startY!==0||operation.beforeBody.endX!==100||operation.beforeBody.endY!==0||json(operation.beforeBody)===json(operation.afterBody))bad("BEFORE");
const next=operation.afterBody;if(!(Math.max(next.startX,next.endX)<-20||Math.min(next.startX,next.endX)>120||Math.max(next.startY,next.endY)<80||Math.min(next.startY,next.endY)>120))bad("BUS_CONTACT");
`);
  source = once(source, 'row.id===operation.textId||!["CANVAS","WIRE","LINE","BUS","ATTR"].includes(row.type)', 'row.id===operation.lineId||!["CANVAS","TEXT","WIRE","LINE","BUS","ATTR"].includes(row.type)');
  source = once(source, '[operation.textId,...operation.peers.filter(r=>r.type==="WIRE"||r.type==="BUS").map(r=>r.id)].sort()', 'operation.peers.filter(r=>r.type==="TEXT"||r.type==="WIRE"||r.type==="BUS").map(r=>r.id).sort()');
  source = section(source, ' const text=index.get(operation.textId);', ' const permissionProperty=', ` const line=index.get(operation.lineId),group=index.get(operation.wireId);if(!line||!group)bad("LINE");
 const pointBinding=setter(line,"points"),setLines=method(group,"setLines"),points=dense(own(line,"_points"),2);if(points.length!==2)bad("POINTS");
 const pointPrototype=Object.getPrototypeOf(points[0]),vectorCtor=method(points[0],"constructor");
 if(Object.getPrototypeOf(points[1])!==pointPrototype||vectorCtor.owner!==pointPrototype||own(vectorCtor.fn,"prototype")!==pointPrototype||!${JSON.stringify(GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE.map(file => file.methods.pointConstructor.source))}.includes(apply(Function.prototype.toString,vectorCtor.fn,[])))bad("POINT_CONSTRUCTOR");
 if(apply(Function.prototype.toString,pointBinding.get,[])!==${JSON.stringify(pointsGet)}||apply(Function.prototype.toString,pointBinding.set,[])!==${JSON.stringify(pointsSet)}||apply(Function.prototype.toString,setLines.fn,[])!==${JSON.stringify(GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE)})bad("LINE_METHOD_SOURCE");
`);
  source = once(source, 'run,setters,permissionProperty', 'run,line,group,pointBinding,setLines,pointPrototype,vectorCtor,permissionProperty');
  source = once(source, 'failed:false,before:null,rootIndices:null', 'failed:false,before:null,after:null,rootIndices:null');
  source = once(source, 'for(const m of [b.active,b.activeTab,b.getTab,b.getSource,b.sourceIds,b.run,b.save])reprove(m);for(const binding of Object.values(b.setters))reproveSetter(binding);', 'for(const m of [b.active,b.activeTab,b.getTab,b.getSource,b.sourceIds,b.run,b.save,b.setLines,b.vectorCtor])reprove(m);reproveSetter(b.pointBinding);if(b.index.get(operation.lineId)!==b.line||b.index.get(operation.wireId)!==b.group||b.pointBinding.object!==b.line||b.setLines.object!==b.group||own(b.vectorCtor.fn,"prototype")!==b.pointPrototype)bad("LINE_RECEIVER");');
  source = section(source, 'const capture=expected=>{', 'const receipt=', `const scene=${GENERATED_SCHEMATIC_RELEVANCE_SCENE_FUNCTION};
const capture=expected=>{
 check();const sourceMap=apply(b.sourceIds.fn,b.handler,[]);if(!(sourceMap instanceof Map)||sourceMap.size!==6)bad("SOURCE_IDS");
 const observed=scene(b.shapes,b.index,sourceMap,operation.rootIds,operation.wireId,operation.lineId,expected);
 const rootIndices=json(observed.rootIndices);if(state.rootIndices===null)Object.defineProperty(state,"rootIndices",{value:rootIndices,writable:false,configurable:false,enumerable:true});else if(state.rootIndices!==rootIndices)bad("ROOT_CHANGED");
 const raw=apply(b.getSource.fn,b.consistency,[]);if(typeof raw!=="string"||!raw.endsWith("|\\n")||new TextEncoder().encode(raw).byteLength>16384)bad("SOURCE");
 const parts=raw.slice(0,-2).split("|\\n"),head=parts.shift();if(!head)bad("HEADER");const boundary=head.indexOf("||"),header=JSON.parse(head.slice(0,boundary)),document=JSON.parse(head.slice(boundary+2));plain(header);plain(document);if(header.type!=="DOCHEAD"||document.uuid!==target.pageUuid||document.docType!=="SCH_PAGE")bad("HEADER");
 const rows=parts.map(part=>{const at=part.indexOf("||"),h=JSON.parse(part.slice(0,at)),body=JSON.parse(part.slice(at+2));plain(h);plain(body);if(typeof h.id!=="string"||typeof h.type!=="string")bad("RECORD");return{id:h.id,type:h.type,body,header:h};});
 if(rows.length!==7||new Set(rows.map(row=>row.id)).size!==7)bad("ROSTER");const record=rows.find(row=>row.id===operation.lineId);if(!record||record.type!=="LINE"||json(record.body)!==json(expected))bad("LINE_BODY");
 const peers=rows.filter(row=>row.id!==operation.lineId).map(({id,type,body})=>({id,type,body})).sort((l,r)=>l.id<r.id?-1:l.id>r.id?1:0),projected=operation.peers.map(row=>operation.rootIds.includes(row.id)?{...row,body:{...row.body,zIndex:observed.rootIndices.find(root=>root.id===row.id).zIndex}}:row);if(json(peers)!==json(projected))bad("PEERS");
 for(const row of rows){if(row.id==="CANVAS")continue;const model=b.index.get(row.id),parentId=operation.rootIds.includes(row.id)?observed.rootModel.id:row.type==="LINE"?row.body.lineGroup:row.type==="ATTR"?row.body.parentId:null;if(sourceMap.get(row.id)!==1||!model||model.parent?.id!==parentId)bad("SOURCE_PARENT");}
 check();return{...observed,raw,head,rows,sourceMap:new Map(sourceMap)};
};
const same=(before,after,changedMarkers=false)=>{if(before.rootModel!==after.rootModel||before.wire!==after.wire||before.line!==after.line||before.attribute!==after.attribute||before.head!==after.head||json(before.rows.map(row=>row.header))!==json(after.rows.map(row=>row.header))||before.tree.length!==after.tree.length||before.sourceMap.size!==after.sourceMap.size)bad("SCENE_CHANGED");for(let i=0;i<before.tree.length;i++){const x=before.tree[i],y=after.tree[i];if(x.model!==y.model||x.parent!==y.parent||x.id!==y.id||x.type!==y.type||!Object.is(x.locked,y.locked))bad("SCENE_CHANGED");}for(const[id,value]of before.sourceMap)if(after.sourceMap.get(id)!==value)bad("SCENE_CHANGED");if(!changedMarkers&&(before.markers.length!==after.markers.length||before.markers.some((model,i)=>model!==after.markers[i])))bad("MARKERS_CHANGED");};
`);
  source = once(source, 'schema:"easyeda-pro-control.generated-schematic-relevance-display-stage.v1"', 'schema:"easyeda-pro-control.generated-schematic-wire-edit-stage.v1"');
  source = section(source, ' if(stage==="modify"){', ' bad("STAGE");', ` if(stage==="modify"){
  if(state.modifyAttempted||state.saveAttempted)bad("CONSUMED");state.modifyAttempted=true;const before=capture(operation.beforeBody);same(state.before,before);
  dispatchAttempted=true;const original=apply(b.run.fn,b.runner,[async()=>{ownedAction=b.runner.currentAction;check();same(before,capture(operation.beforeBody));const points=[[operation.afterBody.startX,operation.afterBody.startY],[operation.afterBody.endX,operation.afterBody.endY]].map(([x,y])=>{check();const point=Reflect.construct(b.vectorCtor.fn,[x,y]);if(Object.getPrototypeOf(point)!==b.pointPrototype||own(point,"x")!==x||own(point,"y")!==y||Reflect.ownKeys(point).length!==3||typeof own(point,"hashed")!=="number")bad("NEW_POINT");return point;});check();reproveSetter(b.pointBinding);reprove(b.setLines);apply(b.setLines.fn,b.group,[[{id:operation.lineId,points}]]);check();}]);
  if(Object.getPrototypeOf(original)!==Promise.prototype)bad("ACTION_PROMISE");const result=await original;ownedAction=null;originalPromiseSettled=true;if(result!==true)bad("ACTION_REJECTED");const after=capture(operation.afterBody);same(before,after,true);state.after=after;state.modifyAcknowledged=true;return receipt(true,after);
 }
 if(stage==="observe"){if(!state.modifyAcknowledged||state.saveAttempted)bad("ORDER");const after=capture(operation.afterBody);same(state.after,after);state.observed=true;return receipt(true,after);}
`);
  return source;
}
export const GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION = build();
export const generatedSchematicWireEditStageResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.generated-schematic-wire-edit-stage.v1"), stage: z.enum(GENERATED_SCHEMATIC_WIRE_EDIT_STAGES), ok: z.boolean(),
  dispatchAttempted: z.boolean(), originalPromiseSettled: z.boolean(), modifyAttempted: z.boolean(), modifyAcknowledged: z.boolean(),
  saveAttempted: z.literal(false), saveAcknowledged: z.literal(false), savePromiseSettled: z.literal(false), source: z.string().max(16_384).nullable(), windowTabId: z.string(),
  originalContextIntact: z.boolean(), connectivityVerified: z.literal(false), sourceVersionAliased: z.literal(false), workerCompletionVerified: z.literal(false),
  structureCompletionVerified: z.literal(false), persistenceVerified: z.literal(false), inverseAvailable: z.literal(false),
}).refine(value => (!value.modifyAcknowledged || value.modifyAttempted) && (!value.originalPromiseSettled || value.dispatchAttempted) && (!value.ok || value.originalContextIntact));
export function generatedSchematicWireEditArgumentsValue(args: GeneratedSchematicWireEditNativeArguments, prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): Readonly<{
  target: GeneratedSchematicWireEditNativeArguments["target"]; operation: GeneratedSchematicWireEditNativeArguments["operation"];
}> { requireOriginalGeneratedSchematicWireEditNativeArguments(args, prepared); return { target: args.target, operation: args.operation }; }
