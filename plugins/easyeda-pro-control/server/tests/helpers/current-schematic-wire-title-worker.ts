/* oxlint-disable unicorn/prefer-top-level-await -- Retain the worker while the original main-thread fixture is held. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { parentPort,workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireParserServiceCoordinator,consumeCurrentSchematicWireParserServiceData as consume } from "../../src/current-schematic-wire-parser-service-coordinator.ts";
import type { CurrentSchematicWireParserServiceCommand } from "../../src/current-schematic-wire-parser-service-coordinator.ts";

const config=z.strictObject({key:z.string(),scriptId:z.string(),busScriptId:z.string(),source:z.string(),busSource:z.string(),variant:z.union([z.literal(0),z.literal(1)]),mode:z.enum(["complete","surplus-sheet","wrong-enum","swap-helper","missing-return","ft-return","ft-missing-return","ft-foreign-request","ft-native-predicate"]).default("complete")}).parse(workerData);
const port=parentPort??(():never=>{throw new Error("worker port");})();port.on("message",()=>{
 // Keep observing while the main thread is held.
});
const session=new Session();session.connectToMainThread();let coordinator:CurrentSchematicWireParserServiceCoordinator|null=null;let originalExit=false;let stopped=false;
const alteredLocation=z.looseObject({columnNumber:z.number()});
const alteredFrame=z.looseObject({location:alteredLocation});
const alteredPause=z.looseObject({callFrames:z.array(alteredFrame)});
function missingReturn(params:unknown):unknown{
 const copy=alteredPause.parse(structuredClone(params));
 const column=config.variant===0?42_982:239_500;
 const expected=config.mode==="ft-missing-return"?4891:column,top=copy.callFrames[0];
 if(top!==undefined&&top.location.columnNumber===expected){Reflect.deleteProperty(top,"returnValue");}
 return copy;
}
function listener(method:"Debugger.scriptParsed"|"Debugger.paused"|"Debugger.resumed"):(raw:unknown)=>void{return(raw:unknown):void=>{
 const event=z.object({params:z.unknown()}).parse(raw);
 const params=(config.mode==="missing-return"||config.mode==="ft-missing-return")&&method==="Debugger.paused"?missingReturn(event.params):event.params;
 coordinator?.observe({sessionId:"123.4",method,params});
};}
for(const method of["Debugger.scriptParsed","Debugger.paused","Debugger.resumed"]as const){session.on(method,listener(method));}
function exception(raw:unknown):unknown{if(raw!==null&&typeof raw==="object"){const value:unknown=Reflect.get(raw,"exceptionDetails");return value;}return undefined;}
async function request(command:CurrentSchematicWireParserServiceCommand):Promise<unknown>{
const params=config.mode==="ft-foreign-request"&&command.phase==="wire-title-ft-frame"?{...command.params,expression:"[{},e]"}:command.params;
 const pending:unknown=Reflect.apply(session.post.bind(session),session,[command.method,params]);const raw:unknown=await pending;
 if(config.mode==="ft-native-predicate"&&command.phase==="wire-title-ft-properties"){
  const copy:unknown=structuredClone(raw);const field=z.object({name:z.string(),value:z.unknown().optional()});const candidate=z.object({result:z.array(field)}).safeParse(copy);
  if(candidate.success){for(const item of candidate.data.result){const name=z.object({value:z.literal("isArray")}).safeParse(item.value);if(item.name==="name"&&name.success&&item.value!==null&&typeof item.value==="object"){Reflect.set(item.value,"value","isArrayShadow");}}}
  return copy;
 }return raw;}
function snapshot(value:CurrentSchematicWireParserServiceCoordinator|null):ReturnType<CurrentSchematicWireParserServiceCoordinator["retained"]>|null{return value?.retained()??null;}
async function cleanup():Promise<void>{
 if(stopped){return;}stopped=true;
 // This is only the inert fixture transport: resume/disconnect closes its own
 // Inspector waiters before asserting its simulated original exit.
 try{await session.post("Debugger.resume");}catch{
  // The inert frame may have already returned.
 }
 session.disconnect();originalExit=true;
 if(coordinator!==null){const task=coordinator.retireAfterOriginalExit();assert.equal(task,coordinator.retireAfterOriginalExit());await task;}
}
async function main():Promise<void>{
 await session.post("Debugger.enable");const roots:string[]=[];for(const name of["holder","native"]){const result=await session.post("Runtime.evaluate",{expression:`globalThis.${config.key}.${name}`});assert.ok(result.result.objectId!==undefined);roots.push(result.result.objectId);}
 const holder=roots[0],native=roots[1];assert.ok(holder!==undefined&&native!==undefined);const failures:unknown[]=[];
 const current=new CurrentSchematicWireParserServiceCoordinator({sessionId:"123.4",scriptId:config.scriptId,busScriptId:config.busScriptId,holder,native,variant:config.variant,source:{scriptSource:config.source},busSource:{scriptSource:config.busSource}},{request,assertCurrent:():void=>{assert.equal(originalExit,false);},assertOriginalExit:():void=>{assert.equal(originalExit,true);},fail:(cause:unknown):void=>{failures.push(cause);}});
 coordinator=current;
 await(config.mode.startsWith("ft-")?current.prepareTitleFtReturn():current.prepareTitles());
 const watchdog=setTimeout(()=>{const kept=current.retained();port.postMessage({fixtureTimeout:true,attempts:kept.attempts.length,firstFailure:kept.firstFailure?.cause instanceof Error?kept.firstFailure.cause.stack:String(kept.firstFailure?.cause),tail:kept.attempts.slice(-8).map(row=>({phase:row.command.phase,method:row.command.method,cause:String(row.cause),exception:exception(row.raw)}))});void cleanup();},15_000);
 const pending=current.run();assert.equal(pending,current.run());const armed=current.arm();assert.equal(armed,current.arm());await armed;port.postMessage({ready:true});
 try{const result=await pending;
assert.equal(result.joined.originalParserAndThreeRpcCallersCompared,true);
assert.equal(result.service.originalThreeCallbacksTargetsAndRepliesCompared,true);
assert.equal(result.service.originalLocalTitleQueryAndPublishedResultCompared,true);
const tree=current.runSelectedTree();assert.equal(tree,current.runSelectedTree());const treeResult=await tree;assert.equal(treeResult.originalChildReturnCellComparedAfterResume,true);assert.equal(treeResult.originalOuterParserReturnCompared,true);
const title=current.runTitles();assert.equal(title,current.runTitles());const titleResult=await title;assert.equal(titleResult.originalCallbackNormalReturnCellComparedAfterResume,true);assert.throws(()=>{ current.requireLiveComparison(structuredClone(result)); });
const ui=current.runUiProviders();
assert.equal(ui,current.runUiProviders());
const uiResult=await ui;
assert.equal(uiResult.allThreeReturnCellsComparedAfterResume,true);
assert.throws(()=>consume(structuredClone(result),current));
assert.equal(consume(result,current),result);
assert.throws(()=>consume(result,current));
assert.throws(()=>current.consumeServiceComparison(structuredClone(result)));
const bindings=current.consumeServiceComparison(result);
assert.equal(bindings.roles.length,3);
assert.equal(bindings.roles[2]?.first.request.role,"titles");
assert.throws(()=>current.consumeServiceComparison(result));
const ft=config.mode==="ft-return"?current.requireTitleFtReturn(result):null;
if(ft!==null){assert.equal(ft.originalFtNormalReturnPromiseRetainedBeforeResume,true);assert.equal(ft.sameOriginalPromiseFulfilledUndefinedAfterResume,true);assert.throws(()=>current.requireTitleFtReturn(structuredClone(result)));}
const finished=current.finish();
assert.equal(finished,current.finish());
await finished;
assert.throws(()=>{ current.requireLiveComparison(result);
 });
const kept=current.retained();
port.postMessage({ft,titleNormal:titleResult.normalRequests,titleCleanup:titleResult.cleanupRequests,completed:current.inspect().completed,failures:failures.length,attempts:kept.attempts.length,pauses:kept.events.filter(event=>event!==null&&typeof event==="object"&&Reflect.get(event,"method")==="Debugger.paused").length,sourceReads:kept.attempts.filter(row=>row.command.method==="Debugger.getScriptSource").length,serviceDeliveryJoined:result.serviceDeliveryJoined,parserCompleted:result.parserCompleted,saveAuthorized:result.saveAuthorized});
}
 catch(error){const kept=current.retained();port.postMessage({error:String(error),ftResumes:kept.attempts.filter(row=>row.command.phase==="wire-title-ft-resume").length,attempts:kept.attempts.length,tail:kept.attempts.slice(-6).map(row=>({phase:row.command.phase,cause:String(row.cause),exception:exception(row.raw)})),firstFailure:kept.firstFailure?.cause instanceof Error?kept.firstFailure.cause.stack:String(kept.firstFailure?.cause),originalServiceFailureRetained:kept.firstFailure?.cause instanceof Error&&z.object({schema:z.literal("private.schematic-wire-original-service-failure.v1"),kind:z.literal("caught"),captured:z.string(),raw:z.unknown()}).safeParse(kept.firstFailure.cause.cause).success});}
 finally{clearTimeout(watchdog);await cleanup();port.close();}
}
void(async():Promise<void>=>{try{await main();}catch(error){const kept=snapshot(coordinator);port.postMessage({fixtureError:error instanceof Error?error.stack:String(error),attempts:kept?.attempts.length,armedRequests:kept?.attempts.filter(row=>row.command.method==="Debugger.setBreakpoint").length,resumes:kept?.attempts.filter(row=>row.command.method==="Debugger.resume").length,tail:kept?.attempts.slice(-5).map(row=>({phase:row.command.phase,method:row.command.method,cause:String(row.cause),exception:exception(row.raw)})),firstFailure:kept?.firstFailure?.cause instanceof Error?kept.firstFailure.cause.stack:String(kept?.firstFailure?.cause)});await cleanup();port.close();}})();
