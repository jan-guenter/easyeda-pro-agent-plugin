/** Synthetic VM graph only. No EasyEDA constructor, process, original native
 * capability, worker, SQL or persistence proof is supplied by these tests. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { createContext, runInContext } from "node:vm";
import { GENERATED_SCHEMATIC_DISPLAY_FUNCTION, GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE } from "../src/generated-schematic-display-program.ts";
import { generatedSchematicDisplayStageResultSchema } from "../src/generated-schematic-display.ts";
import type { GeneratedSchematicDisplayStage } from "../src/generated-schematic-display-program.ts";
import { prepareGeneratedSchematicDisplayBodyPlan } from "../src/generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayPatch } from "../src/generated-schematic-display.ts";

const defaultPatch = Object.freeze({ x: 25, bold: true });
function fixture(mode: "success" | "save-refused" | "window-drift" | "read-only" | "unknown-child" = "success", patch: GeneratedSchematicDisplayPatch = defaultPatch): { call: (stage: GeneratedSchematicDisplayStage) => Promise<unknown>; counts: () => Record<string, number>; guard: () => unknown; sameGuard: () => unknown } {
  const body = prepareGeneratedSchematicDisplayBodyPlan(patch);
  const target = { rawWindowsPath: `C:\\SyntheticTemp\\CodexEasyedaFixture_${"1".repeat(32)}\\Codex_schematic_${"2".repeat(16)}.eprj2`,
    projectUuid: "3".repeat(64), branchUuid: "4".repeat(32), schematicUuid: "5".repeat(32), pageUuid: "6".repeat(32), expectedSourceSha256: "7".repeat(64) };
  const textId = `0${"8".repeat(15)}`; const wireId = `0${"9".repeat(15)}`; const busId = `0${"a".repeat(15)}`;
  const operation = { operationId: "sch209-display-vm-test", textId, beforeBody: body.nativeBeforeBody, afterBody: body.nativeAfterBody,
    peers: [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }, { id: wireId, type: "WIRE", body: { locked: false, zIndex: null } },
      { id: `0${"b".repeat(15)}`, type: "LINE", body: { lineGroup: wireId } }, { id: busId, type: "BUS", body: { locked: false, zIndex: null, busEntry: {} } },
      { id: `0${"c".repeat(15)}`, type: "LINE", body: { lineGroup: busId } }].toSorted((left, right) => left.id.localeCompare(right.id)) };
  const context = createContext({ target: structuredClone(target), operation: structuredClone(operation), mode, TextEncoder });
  runInContext(`
const t=JSON.parse(JSON.stringify(target)),op=JSON.parse(JSON.stringify(operation));target=t;operation=op;
globalThis.window=globalThis;globalThis.top=globalThis;globalThis.location={origin:"https://client",href:"https://client/editor?cll=warn#id="+t.projectUuid+",tab=*"+t.pageUuid+"@"+t.projectUuid};globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis._TAB_ID_="synthetic-window";
globalThis.counters={setSource:0,setters:0,transactions:0,save:0,active:0};const tabId=t.pageUuid+"@"+t.projectUuid;
const page={uuid:t.pageUuid,schematicUuid:t.schematicUuid,project_uuid:t.projectUuid,tabId,docType:1,source:"",readonlyMode:mode==="read-only",isLockedByAuth:false,isBlockSymbolInstancePage:false,isSchSheetDoc(){return true;},projectMgr:{uuid:t.projectUuid}};
const index=new Map(),shapes={docManager:page},ids={idMap:index};shapes.idManager=ids;page.idManager=ids;page.shapeManager=shapes;
const rootModel={id:"$$root",modelType:"Root",parent:null,shapeManager:shapes,isConnected:true,children:[]};shapes.root=rootModel;
let records=[{id:op.textId,type:"TEXT",body:JSON.parse(JSON.stringify(op.beforeBody))},...JSON.parse(JSON.stringify(op.peers))];
for(const row of records.filter(r=>r.id!=="CANVAS")){const model={id:row.id,modelType:row.type==="TEXT"?"Text":row.type,cmdKey:row.type==="TEXT"?"text":row.type,parent:rootModel,shapeManager:shapes,isConnected:true,locked:false,children:[]};index.set(row.id,model);rootModel.children.push(model);}
const textModel=index.get(op.textId),textRecord=records.find(r=>r.id===op.textId),labels=["LEFT_TOP","LEFT_MIDDLE","LEFT_BOTTOM","CENTER_TOP","CENTER_MIDDLE","CENTER_BOTTOM","RIGHT_TOP","RIGHT_MIDDLE","RIGHT_BOTTOM"];
let h=Math.floor(labels.indexOf(textRecord.body.align)/3),v=labels.indexOf(textRecord.body.align)%3;
for(const field of ["x","y","rotation","fontFamily","fontSize","fontWeight","italic","underline","hAlign","vAlign"]){Object.defineProperty(textModel,field,{get(){return field==="hAlign"?h:field==="vAlign"?v:textRecord.body[field];},set(value){counters.setters++;if(field==="hAlign")h=value;else if(field==="vAlign")v=value;else textRecord.body[field]=value;if(field==="hAlign"||field==="vAlign")textRecord.body.align=h===null&&v===null?null:labels[(h??0)*3+(v??0)];if(mode==="window-drift")globalThis._TAB_ID_="foreign-window";}});}
const sourceMap=new Map([...index.keys()].map(id=>[id,1]));const handler={docManager:page,getSourceCodeIdMap(){return new Map(sourceMap);}};
if(mode==="unknown-child"){const child={id:"unplanned-model",modelType:"Attr",parent:rootModel,shapeManager:shapes,isConnected:true,locked:false,children:[]};rootModel.children.push(child);index.set(child.id,child);}
const consistency={docManager:page,state:"initialized",decodeAndRealTimeSyncHandler:handler,handler,getSourceCode(){return JSON.stringify({type:"DOCHEAD"})+"||"+JSON.stringify({uuid:t.pageUuid,docType:"SCH_PAGE"})+"|\\n"+records.map((r,i)=>JSON.stringify({type:r.type,id:r.id,ticket:i+1})+"||"+JSON.stringify(r.body)).join("|\\n")+"|\\n";},async setSourceCode(){counters.setSource++;throw new Error("Whole-source application is forbidden by this Text-only fixture");}};
handler.consistencyImpl=consistency;page.consistencyImpl=consistency;
const runner={running:false,currentAction:null,async run(fn){counters.transactions++;this.running=true;this.currentAction={status:"running"};try{await fn();return true;}finally{this.currentAction.status="finished";this.running=false;}}};Object.defineProperty(shapes,"actionRunner",{get(){return runner;}});
const manager={getActiveDoc(){counters.active++;return page;}};globalThis.SCH={get docMemoryManager(){return manager;}};
const tab={data:{doctype:1,pid:t.projectUuid}},tabs={getActiveTab(){return tabId;},getTabById(){return tab;}};globalThis.gVars={currentProject:{projectId:t.projectUuid,branchUuid:t.branchUuid,isV2Format:false},isHistoryMode:false,isReadOnlyMode:false};globalThis.UI={gVars,tabBar:tabs};
const T={extensionApiMessageBus2:{async rpcCall(){counters.save++;return{success:mode!=="save-refused"};}}};globalThis._EXTAPI_ROOT_={sch_Document:{${GENERATED_SCHEMATIC_DISPLAY_SAVE_SOURCE}}};globalThis.holder=null;
`, context);
  return { call: async stage => {
    const value: unknown = await runInContext(stage === "capture" ? `(async()=>{holder=await (${GENERATED_SCHEMATIC_DISPLAY_FUNCTION}).call(globalThis,target,"capture",operation);globalThis.originalGuard=holder[1]?.guard;return holder;})()` :
      `(${GENERATED_SCHEMATIC_DISPLAY_FUNCTION}).call(holder,target,${JSON.stringify(stage)},operation)`, context);
    return value;
  }, counts: (): Record<string, number> => { const raw: unknown = JSON.parse(String(runInContext("JSON.stringify(counters)", context))); return z.record(z.string(), z.number().int().nonnegative()).parse(raw); },
  guard: (): unknown => runInContext("holder[1].guard()", context), sameGuard: (): unknown => runInContext(`holder[1].guard===originalGuard&&Object.getOwnPropertyDescriptor(holder[1],"guard").writable===false&&Object.getOwnPropertyDescriptor(holder[1],"guard").configurable===false`, context) };
}
void test("fixed native stage logic changes one literal Text body and consumes one original Save with no acceptance claims", async () => {
  const native = fixture(); await native.call("capture"); await native.call("preflight"); const modified = await native.call("modify");
  assert.ok(modified !== null && typeof modified === "object" && "modifyAcknowledged" in modified && modified.modifyAcknowledged === true);
  await native.call("observe"); const saved = generatedSchematicDisplayStageResultSchema.parse(await native.call("save")); assert.equal(saved.saveAcknowledged, true);
  assert.equal(native.sameGuard(), true); assert.doesNotThrow(() => { native.guard(); });
  assert.equal(generatedSchematicDisplayStageResultSchema.safeParse({ ...saved, originalPromiseSettled: false }).success, false);
  assert.equal(generatedSchematicDisplayStageResultSchema.safeParse({ ...saved, saveAcknowledged: false }).success, false);
  assert.equal("persistenceVerified" in saved && saved.persistenceVerified, false); assert.equal("structureCompletionVerified" in saved && saved.structureCompletionVerified, false);
  const repeated = await native.call("modify"); assert.ok(repeated !== null && typeof repeated === "object" && "ok" in repeated && repeated.ok === false);
  assert.deepEqual({ setSource: native.counts()["setSource"], setters: native.counts()["setters"], transactions: native.counts()["transactions"], save: native.counts()["save"] }, { setSource: 0, setters: 2, transactions: 1, save: 1 });
});
void test("a refused Save stays consumed and a post-mutation window drift returns an inert partial receipt", async () => {
  const refused = fixture("save-refused"); await refused.call("capture"); await refused.call("preflight"); await refused.call("modify"); await refused.call("observe");
  const saved = await refused.call("save"); assert.ok(saved !== null && typeof saved === "object" && "ok" in saved && saved.ok === false);
  assert.equal("saveAttempted" in saved && saved.saveAttempted, true); assert.equal("saveAcknowledged" in saved && saved.saveAcknowledged, false);
  await assert.rejects(refused.call("save")); assert.equal(refused.counts()["save"], 1);
  const drift = fixture("window-drift"); await drift.call("capture"); const partial = await drift.call("modify");
  assert.ok(partial !== null && typeof partial === "object" && "ok" in partial && partial.ok === false); assert.equal("source" in partial && partial.source, null);
  assert.equal("modifyAttempted" in partial && partial.modifyAttempted, true); assert.equal(drift.counts()["setSource"], 0); assert.equal(drift.counts()["setters"], 1); assert.equal(drift.counts()["save"], 0);
  assert.equal(drift.sameGuard(), true); assert.throws(() => { drift.guard(); });
});
void test("original setters accept zero and independent alignment axes while preserving false; read-only capture reaches no transaction", async () => {
  const native = fixture("success", { y: 0, bold: false, alignMode: 9 });
  await native.call("capture"); const modified = generatedSchematicDisplayStageResultSchema.parse(await native.call("modify"));
  assert.equal(modified.modifyAcknowledged, true); assert.equal(native.counts()["setSource"], 0); assert.equal(native.counts()["setters"], 3);
  const locked = fixture("read-only"); const refused = generatedSchematicDisplayStageResultSchema.parse(await locked.call("capture"));
  assert.equal(refused.ok, false); assert.equal(refused.dispatchAttempted, false); assert.equal(locked.counts()["transactions"], 0); assert.equal(locked.counts()["setters"], 0);
});
void test("six-row stage refuses a source-excluded child instead of accepting its unknown model effects", async () => {
  const vm = fixture("unknown-child"); const refused = generatedSchematicDisplayStageResultSchema.parse(await vm.call("capture"));
  assert.equal(refused.ok, false); assert.equal(refused.dispatchAttempted, false); assert.equal(vm.counts()["setters"], 0); assert.equal(vm.counts()["transactions"], 0); assert.equal(vm.counts()["save"], 0);
});
