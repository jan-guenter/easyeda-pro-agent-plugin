/** Synthetic host graph; the constructor/geometry method bytes are pinned
 * vendor syntax. This supplies no original action, worker or persistence grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION, generatedSchematicWireEditArgumentsValue, generatedSchematicWireEditStageResultSchema } from "../src/generated-schematic-wire-edit-program.ts";
import type { GENERATED_SCHEMATIC_WIRE_EDIT_STAGES } from "../src/generated-schematic-wire-edit-program.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE } from "../src/generated-schematic-wire-native-source.ts";
import { GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE } from "../src/generated-schematic-wire-source.ts";
import { GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE } from "../src/generated-schematic-display-program.ts";
import { compareGeneratedSchematicWireEditEffect } from "../src/generated-schematic-wire-edit-effect.ts";
import { wireData } from "./generated-schematic-wire-edit-fixture.ts";

function fixture(mode: "success" | "foreign-marker" | "window-drift" | "changed-peer" = "success"): Readonly<{
  call: (stage: typeof GENERATED_SCHEMATIC_WIRE_EDIT_STAGES[number] | "save") => Promise<unknown>; counts: () => Record<string, number>;
}> {
  const { args } = wireData(), context = createContext({ input: JSON.stringify(args), mode, TextEncoder });
  const pointSource = GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE[0]?.methods.pointConstructor.source; assert.ok(pointSource !== undefined);
  runInContext(`const {target,operation:op}=JSON.parse(input);globalThis.target=target;globalThis.operation=op;
globalThis.window=globalThis;globalThis.top=globalThis;globalThis.location={origin:"https://client",href:"https://client/editor?cll=warn#id="+target.projectUuid+",tab=*"+target.pageUuid+"@"+target.projectUuid};globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis._TAB_ID_="synthetic-wire-window";
globalThis.counts={actions:0,points:0,save:0,allocation:0};const qt={},Cr=()=>{throw Error("delete")},Ea={normal(v){if(!Number.isFinite(v))throw Error("finite");return v}},memory=new ArrayBuffer(16),_he=new Float64Array(memory),ok=new Int32Array(memory),Point=${pointSource};
const methods={${GENERATED_SCHEMATIC_WIRE_SET_LINES_SOURCE},get points(){return this._points},set points(t){this._points!==t&&this.shapeManager.modifyMonitor.record({model:this,attr:"points",oldValue:this._points,newValue:this._points=t})}};
const tabId=target.pageUuid+"@"+target.projectUuid,page={uuid:target.pageUuid,schematicUuid:target.schematicUuid,project_uuid:target.projectUuid,tabId,docType:1,source:"",readonlyMode:false,isLockedByAuth:false,isBlockSymbolInstancePage:false,isSchSheetDoc(){return true},projectMgr:{uuid:target.projectUuid}},index=new Map,shapes={docManager:page},ids={idMap:index};shapes.idManager=ids;page.idManager=ids;page.shapeManager=shapes;
const rootModel={id:"$$root",modelType:"Root",parent:null,shapeManager:shapes,isConnected:true,children:[],invalidZIndexChildMap:new Map,_childZIndexChange:undefined,minChildZIndex:0,maxChildZIndex:2};shapes.root=rootModel;
const records=[{id:op.lineId,type:"LINE",body:JSON.parse(JSON.stringify(op.beforeBody))},...JSON.parse(JSON.stringify(op.peers))];
for(const row of records.filter(row=>row.id!=="CANVAS")){const model={id:row.id,modelType:row.type==="TEXT"?"Text":row.type==="ATTR"?"Attr":row.type==="WIRE"||row.type==="BUS"?"NetGroup":row.body.lineGroup===op.wireId?"Wire":"Bus",cmdKey:row.type==="WIRE"||row.type==="BUS"?"netGroup":row.type==="TEXT"?"text":row.type==="ATTR"?"attr":row.body.lineGroup===op.wireId?"wire":"bus",parent:null,shapeManager:shapes,isConnected:true,locked:false,children:[]};index.set(row.id,model);}
for(const id of op.rootIds){const model=index.get(id);model.parent=rootModel;model.zIndex=rootModel.children.length;rootModel.children.push(model);records.find(row=>row.id===id).body.zIndex=model.zIndex;}
const wire=index.get(op.wireId),line=index.get(op.lineId),bus=rootModel.children.find(model=>model!==wire&&model.modelType==="NetGroup"),attr=[...index.values()].find(model=>model.modelType==="Attr"),busLine=[...index.values()].find(model=>model.modelType==="Bus");
wire.type="wire";bus.type="bus";line.type="wire";line.tagName="NetGroupLine";busLine.type="bus";busLine.tagName="NetGroupLine";attr.key="Relevance";attr.value="[]";attr.zIndex=3;
line.parent=wire;attr.parent=wire;busLine.parent=bus;wire.children=[line,attr];bus.children=[busLine];line.zIndex=0;busLine.zIndex=0;
for(const group of [wire,bus]){group._lines=new Set([group===wire?line:busLine]);group._netNames=new Set;group._customAttrMap=new Map(group===wire?[["Relevance",attr]]:[]);group._unConnectDotModels=new Set;}
Object.defineProperty(wire,"setLines",{value:methods.setLines,writable:true,configurable:true});wire.createLineBaseOn=()=>{counts.allocation++;throw Error("allocation")};line._points=[new Point(0,0),new Point(100,0)];Object.defineProperty(line,"points",Object.getOwnPropertyDescriptor(methods,"points"));
const net={shapeManager:shapes,unConnectDotModels:new Set,junctionModels:new Set,netGroupLineUnConnectDotIdMap:{},netGroupLineJunctionIdMap:{}};shapes.netPointManager=net;let dotGeneration=0;
function refresh(){for(const dot of net.unConnectDotModels){index.delete(dot.id);dot.parent=null;}net.unConnectDotModels.clear();wire._unConnectDotModels.clear();wire.children=[line];net.netGroupLineUnConnectDotIdMap={[op.lineId]:new Set};for(const point of line._points){const node={x:point.x,y:point.y,Wire:new Set([line]),Bus:new Set,Pin:new Set,BusEntry:new Set,wireNetGroup:wire},dot={id:"dot-"+(++dotGeneration),modelType:mode==="foreign-marker"?"Junction":"UnConnectDot",tagName:"UnConnectDot",cmdKey:"unConnectDot",notAddHistory:true,_cx:point.x,_cy:point.y,connectionPointNode:node,parent:wire,shapeManager:shapes,isConnected:true,locked:false,children:[],zIndex:wire.children.length};wire.children.push(dot);index.set(dot.id,dot);net.unConnectDotModels.add(dot);wire._unConnectDotModels.add(dot);net.netGroupLineUnConnectDotIdMap[op.lineId].add(dot.id);}wire.children.push(attr);}
refresh();shapes.modifyMonitor={record(record){counts.points++;if(record.model!==line||record.attr!=="points")throw Error("record");Object.assign(records.find(row=>row.id===op.lineId).body,{startX:line._points[0].x,startY:line._points[0].y,endX:line._points[1].x,endY:line._points[1].y});if(mode==="window-drift")globalThis._TAB_ID_="foreign-window";if(mode==="changed-peer")records.find(row=>row.id===attr.id).body.value="foreign";}};
const sourceMap=new Map([...index.keys()].filter(id=>!id.startsWith("dot-")).map(id=>[id,1])),handler={docManager:page,getSourceCodeIdMap(){return new Map(sourceMap)}},consistency={state:"initialized",handler,decodeAndRealTimeSyncHandler:handler,getSourceCode(){return JSON.stringify({type:"DOCHEAD"})+"||"+JSON.stringify({uuid:target.pageUuid,docType:"SCH_PAGE"})+"|\\n"+records.map((row,i)=>JSON.stringify({type:row.type,id:row.id,ticket:i+1})+"||"+JSON.stringify(row.body)+"|\\n").join("")}};handler.consistencyImpl=consistency;page.consistencyImpl=consistency;
const runner={running:false,currentAction:null,async run(fn){counts.actions++;this.running=true;this.currentAction={status:"running"};try{await fn();refresh();return true}finally{this.currentAction.status="finished";this.running=false}}};Object.defineProperty(shapes,"actionRunner",{get(){return runner}});
const manager={getActiveDoc(){return page}},tab={data:{doctype:1,pid:target.projectUuid}},tabs={getActiveTab(){return tabId},getTabById(){return tab}};globalThis.SCH={get docMemoryManager(){return manager}};globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,isReadOnlyMode:false};globalThis.UI={tabBar:tabs,gVars};const T={extensionApiMessageBus2:{rpcCall(){counts.save++;throw Error("save")}}};globalThis._EXTAPI_ROOT_={sch_Document:{${GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE}}};
globalThis.stageFn=(${GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION});globalThis.holder=null;globalThis.call=async stage=>{const result=await stageFn.call(stage==="capture"?globalThis:holder,target,stage,op);if(stage==="capture"&&Array.isArray(result))holder=result;return result;};`, context);
  return { call: async stage => { const result: unknown = await runInContext(`call(${JSON.stringify(stage)})`, context); return result; },
    counts: () => { const raw: unknown = runInContext("JSON.stringify(counts)", context); const value: unknown = JSON.parse(String(raw)); return z.record(z.string(), z.number()).parse(value); } };
}
void test("fixed native LINE stage preserves all seven source rows and derives exactly two new endpoint dots", async () => {
  const native = fixture(), { args } = wireData(); await native.call("capture");
  const before = generatedSchematicWireEditStageResultSchema.parse(await native.call("preflight")), modified = generatedSchematicWireEditStageResultSchema.parse(await native.call("modify")), observed = generatedSchematicWireEditStageResultSchema.parse(await native.call("observe"));
  assert.equal(before.ok, true); assert.equal(modified.modifyAcknowledged, true); assert.equal(observed.ok, true);
  assert.equal(modified.persistenceVerified, false); assert.ok(before.source !== null && modified.source !== null && observed.source !== null);
  assert.equal(compareGeneratedSchematicWireEditEffect(args, before.source, modified.source, observed.source).completePeerBodyRosterPreserved, true);
  await native.call("modify"); assert.deepEqual(native.counts(), { actions: 1, points: 1, save: 0, allocation: 0 });
  await assert.rejects(native.call("save"));
});
void test("unknown implicit models refuse before action; post-setter drift consumes the only attempt", async () => {
  const foreign = fixture("foreign-marker"); const failed = generatedSchematicWireEditStageResultSchema.parse(await foreign.call("capture"));
  assert.equal(failed.ok, false); assert.equal(foreign.counts()["actions"], 0);
  for (const mode of ["window-drift", "changed-peer"] as const) {
    const native = fixture(mode); await native.call("capture"); const modified = generatedSchematicWireEditStageResultSchema.parse(await native.call("modify"));
    assert.equal(modified.ok, false); assert.equal(modified.modifyAttempted, true); assert.equal(modified.modifyAcknowledged, false);
    await assert.rejects(native.call("modify")); assert.deepEqual(native.counts(), { actions: 1, points: 1, save: 0, allocation: 0 });
  }
  let touched = false;
  assert.throws(() => Reflect.apply(generatedSchematicWireEditArgumentsValue, undefined, [{ get target(): never { touched = true; throw new Error("foreign"); } }, {}]));
  assert.equal(touched, false);
});
