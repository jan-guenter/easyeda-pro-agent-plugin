/* oxlint-disable import/max-dependencies -- Exercise the actual driver, fixed wire, descriptor decoders and independent managed chain in one inert fixture. */
/* oxlint-disable unicorn/no-useless-undefined -- Exact retained undefined Promise receipts require explicit settlement in the pinned types. */
/** Actual timer controller with explicit inert origin/CDP peers. These
 * fixtures never allocate a production owner or invoke a worker timer. */
import assert from "node:assert/strict";
import {setImmediate as nextTurn} from "node:timers/promises";
import {test} from "node:test";
import type {CurrentFootprintForwardWriterTicketTimerDriver as Driver} from "../src/current-footprint-forward-writer-ticket-timer-driver.ts";
import type {CurrentFootprintForwardWriterTicketTimerBindings as Bindings,CurrentFootprintForwardWriterTicketTimerRole as Role} from "../src/current-footprint-forward-writer-ticket-timer-origin.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_GUARD_SOURCE as GUARD,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_METHOD_METADATA as METHODS,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_NATIVE_METADATA as NATIVES,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as PROGRAMS} from "../src/current-footprint-forward-writer-ticket-timer-bindings.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES as SITES} from "../src/current-footprint-forward-writer-ticket-timer-source.ts";
import {currentFootprintForwardWriterTicketTimerWire} from "../src/current-footprint-forward-writer-ticket-timer-protocol.ts";
import {assertCurrentFootprintForwardWriterTicketTimerChain as chain} from "../src/current-footprint-forward-writer-ticket-timer-journal.ts";
import {currentFootprintForwardWriterTicketTimerRecordSchema as record} from "../src/current-footprint-forward-writer-ticket-timer-contract.ts";
import {sha256Json} from "../src/core.ts";
import {loadSyntheticRegistryModule} from "./helpers/load-synthetic-registry-module.ts";

const object=(objectId:string):object=>({type:"object",objectId});
const prop=(name:string,value:unknown,writable=true,enumerable=true,configurable=true):object=>({name,value,writable,enumerable,configurable,isOwn:true});
const callable=(id:string,description:string):object=>({type:"function",className:"Function",objectId:id,description});
const array=(objectId:string,length:number):object=>({result:{type:"object",subtype:"array",className:"Array",description:`Array(${String(length)})`,objectId}});
const internal=(parent:string,scopes:string):object[]=>[{name:"[[Prototype]]",value:callable("native-parent27",parent)},{name:"[[Scopes]]",value:{type:"object",className:"Array",subtype:"internal#scopeList",description:scopes,objectId:"scopes27"}}];
function metadata(profile:Readonly<{name:string;arity:number;constructor:boolean;parentDescription?:string}>,scriptId?:string,lineNumber=0,columnNumber=0):object{
 const fields=[prop("name",{type:"string",value:profile.name},false,false),prop("length",{type:"number",value:profile.arity},false,false)];
 if(profile.constructor){fields.push(prop("prototype",{type:"object",className:profile.name,description:profile.name,objectId:"prototype27"},false,false,false));}
 if(profile.name==="Symbol"){for(const name of["hasInstance","species","iterator"]){fields.push(prop(name,{type:"symbol",description:`Symbol(Symbol.${name})`,objectId:"symbol27"},false,false,false));}}
 const internals=internal(profile.parentDescription??"function () { [native code] }",scriptId===undefined?"Scopes[0]":"Scopes[2]");
 if(scriptId!==undefined){internals.unshift({name:"[[FunctionLocation]]",value:{type:"object",subtype:"internal#location",value:{scriptId,lineNumber,columnNumber}}});}
 return{result:fields,internalProperties:internals};
}
async function fixture(fault:"resume"|"source"|"blocked"|"next-pause"|"finish-tail"|"finish-slot"|"finish-slots"|"held-pump"|null=null):Promise<Readonly<{driver:Driver;records:ReturnType<typeof record.parse>[];callback:(role:Role)=>Promise<void>;state:{exited:boolean;created:boolean;requests:number;resumes:number;slots:number;pumps:number;failure:unknown};unblock:()=>void;freshEntered:Promise<undefined>;slotEntered:(ordinal:number)=>Promise<undefined>;releaseSlot:(ordinal:number)=>void;pumpEntered:Promise<undefined>;settlePump:(outcome:"resolve"|"reject",reason?:unknown)=>void}>>{
 // Source admission is explicit in this inert issuer. Whole installed-worker
 // Qualification remains in the separately configured ticket-timer source suite.
 const source="synthetic-ticket-timer-binding-source";
 const origin=Object.freeze({profile:"private.current-footprint-forward-writer-ticket-timer-origin.v1"as const});const owner=Object.freeze({synthetic:true});const operation=Object.freeze({syntheticOperation:true});
 const state={exited:false,created:false,requests:0,resumes:0,slots:0,pumps:0,failure:null as unknown};
 let driver:Driver|null=null;const receipts=new Map<Role,ReturnType<typeof Promise.withResolvers<undefined>>>();
 const heldPump=Promise.withResolvers<undefined>(),pumpEntered=Promise.withResolvers<undefined>();const blocked=Promise.withResolvers<undefined>();const freshEntered=Promise.withResolvers<undefined>();let freshHeld=false,postSlotFresh=0,quiescing=false;const slotGates=new Map([1,2].map(ordinal=>[ordinal,{entered:Promise.withResolvers<undefined>(),release:Promise.withResolvers<undefined>()}]));const records:ReturnType<typeof record.parse>[]=[];
 const selected=():Driver=>{assert.ok(driver!==null);return driver;};
 const append=(kind:string,evidence:Readonly<Record<string,unknown>>):Promise<void>=>{const entry=record.parse({schema:"easyeda-pro-control.footprint-forward-writer-ticket-timer-record.v1",operationId:"footprint-forward-ticket-timer-synthetic01",sequence:records.length,previousSha256:records.length===0?null:sha256Json(records.at(-1)),kind,evidence,executionAuthorized:false,saveAuthorized:false});chain([...records,entry]);records.push(entry);if(kind==="quiesce-intent"){quiescing=true;}if(kind==="timer-result"){const role=entry.evidence["role"];assert.ok(role==="entry"||role==="returned"||role==="selfReturned");receipts.get(role)?.resolve(undefined);receipts.delete(role);}return Promise.resolve();};
 await append("operation-intent",{request:{operationId:"footprint-forward-ticket-timer-synthetic01",parentOperationId:"footprint-forward-writer-synthetic01",acceptOriginalNaturalTicketTimer:true}});
 await append("ws-intent",{sourceSha256:"0".repeat(64),inputSha256:"1".repeat(64),originalStartupEntryObserved:true});await append("ws-result",{privateDeployment:false,sourceInitializations:1,originalLexicalFrameRetained:true,websocketPublicationExcluded:true});
 const bindings=Object.freeze<Bindings>({actual:{scriptId:"worker27",sessionId:"session27",reflection:"reflection27",project:"project27",dependencies:"dependencies27",destinations:"destinations27",source},inputSha256:"2".repeat(64),assertCurrent:async():Promise<void>=>{assert.equal(state.exited,false);if(!freshHeld&&(fault==="next-pause"&&state.resumes===1||fault==="finish-tail"&&quiescing)){freshHeld=true;freshEntered.resolve(undefined);await blocked.promise;}const ordinal=postSlotFresh;postSlotFresh=0;if((fault==="finish-slot"&&ordinal===1||fault==="finish-slots"&&ordinal>=1&&ordinal<=2)){const gate=slotGates.get(ordinal);assert.ok(gate!==undefined);gate.entered.resolve(undefined);await gate.release.promise;}assert.equal(state.exited,false);},journal:append,
  point:(role,id):void=>{assert.ok(["entry","returned","selfReturned"].includes(role));assert.match(id,/point-/u);},control:():Promise<void>=>Promise.resolve(),pump:():Promise<void>=>{state.pumps+=1;pumpEntered.resolve(undefined);return fault==="held-pump"?heldPump.promise:Promise.resolve();},originalCreateWritten:():boolean=>state.created,requireOriginalCallbacksCompleted:():void=>{assert.equal(state.created,true);},assertOriginalGenerationExited:():Promise<void>=>{assert.equal(state.exited,true);return Promise.resolve();},
  fail:(cause):void=>{state.failure=cause;for(const receipt of receipts.values()){receipt.reject(cause);}},
  request:async command=>{selected().requireRequest(command);state.requests+=1;assert.equal(currentFootprintForwardWriterTicketTimerWire(command,state.requests).request["action"],"footprint-forward-ticket-timer");
   if(command.phase==="ticket-timer-arm"){return{breakpointId:`point-${command.role}-27`,actualLocation:command.params.location};}
   if(command.phase==="ticket-timer-guard-source"){return{scriptSource:fault==="source"?"substituted":`(${PROGRAMS.capture})`};}
   if(command.phase==="ticket-timer-native"){const profile=NATIVES.find(row=>row.slot===command.slot);assert.ok(profile!==undefined);return metadata(profile);}
   if(command.phase==="ticket-timer-method"){const profile=METHODS.find(row=>row.slot===command.slot);assert.ok(profile!==undefined);return metadata({...profile,constructor:false},"worker27",profile.lineNumber,profile.columnNumber);}
   if(command.phase==="ticket-timer-guard"){const offset=PROGRAMS.capture.indexOf(GUARD);const before=PROGRAMS.capture.slice(0,offset);const last=before.lastIndexOf("\n");return metadata({name:"check",arity:0,constructor:false},"helper27",before.split("\n").length-1,last===-1?offset+1:offset-last-1);}
   if(command.phase==="ticket-timer-properties"){const length=command.role==="capture"?49:({baseline:7,entry:8}as const)[command.role];return{result:[...Array.from({length},(_,i)=>{
    const native=NATIVES.find(row=>row.slot===i);const method=METHODS.find(row=>row.slot===i);
    let value:object=object(`root-${String(i)}-27`);if(command.role==="capture"){if(native!==undefined){value=callable(`native-${String(i)}-27`,`function ${native.name}() { [native code] }`);}else if(method!==undefined){value=callable(`method-${String(i)}-27`,method.source);}else if(i===48){value=callable("guard27",GUARD);}}return prop(String(i),value);}),prop("length",{type:"number",value:length},true,false,false)],internalProperties:[{name:"[[Prototype]]",value:{type:"object",subtype:"array",className:"Array",description:"Array(0)",objectId:"array-prototype27"}}]};}
   if(command.phase==="ticket-timer-frame"){if(fault==="blocked"){await blocked.promise;}return array("frame-array27",command.role==="selfReturned"?2:1);}
   if(command.phase==="ticket-timer-resume"){if(fault==="resume"){throw new Error("original-timer-ack-lost");}state.resumes+=1;queueMicrotask(()=>{selected().resumed();});return{};}
   if(command.phase==="ticket-timer-call"){if(command.role==="capture"){return array("capture49",49);}if(command.role==="binding"){return array("binding15",15);}if(command.role==="baseline"){return array("baseline7",7);}if(command.role==="entry"){return array("entry8",8);}if(command.role==="slot"){state.slots+=1;postSlotFresh=state.slots;return{result:{type:"object",value:{timer:fault==="held-pump"?43:null,ticket:43}}};}return{result:{type:"boolean",value:true}};}
   throw new Error("unexpected-synthetic-timer-command");
  },
 });
 const module=await loadSyntheticRegistryModule(new URL("../src/current-footprint-forward-writer-ticket-timer-driver.ts",import.meta.url),(name,actual)=>{
  if(name==="./current-footprint-forward-writer-ticket-timer-origin.ts"){return{...actual,requireOriginalCurrentFootprintForwardWriterTicketTimerOrigin:(a:unknown,b:unknown,c:unknown):Bindings=>{assert.equal(a,origin);assert.equal(b,owner);assert.equal(c,operation);return bindings;}};}
  if(name==="./current-footprint-forward-writer-ticket-timer-bindings.ts"){return{...actual,qualifyCurrentFootprintForwardWriterTicketTimerBindingSource:(input:unknown):void=>{assert.equal(input,source);}};}
  return actual;
 });
 const Constructor=module["CurrentFootprintForwardWriterTicketTimerDriver"];assert.ok(typeof Constructor==="function");
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime-checked maintained class with explicit inert issuer and CDP peers only.
 driver=Reflect.construct(Constructor,[origin,owner,operation])as Driver;
 return{driver,records,state,pumpEntered:pumpEntered.promise,settlePump:(outcome,reason):void=>{if(outcome==="resolve"){heldPump.resolve(undefined);}else{heldPump.reject(reason);}},freshEntered:freshEntered.promise,slotEntered:(ordinal):Promise<undefined>=>{const gate=slotGates.get(ordinal);assert.ok(gate!==undefined);return gate.entered.promise;},releaseSlot:(ordinal):void=>{const gate=slotGates.get(ordinal);assert.ok(gate!==undefined);gate.release.resolve(undefined);},unblock:():void=>{blocked.resolve(undefined);for(const gate of slotGates.values()){gate.release.resolve(undefined);}},callback:async(role):Promise<void>=>{const receipt=Promise.withResolvers<undefined>();assert.equal(receipts.has(role),false);receipts.set(role,receipt);const site=SITES[role];selected().paused({reason:"other",hitBreakpoints:[`point-${role}-27`],callFrames:[{callFrameId:"frame27",functionName:"",location:{scriptId:"worker27",lineNumber:site.lineNumber,columnNumber:site.columnNumber},functionLocation:{scriptId:"worker27",lineNumber:site.functionLineNumber,columnNumber:site.functionColumnNumber},...(role==="entry"?{}:{returnValue:{type:"undefined"}})},{callFrameId:"caller29",functionName:"syntheticCaller",location:{scriptId:"worker27",lineNumber:0,columnNumber:0},functionLocation:{scriptId:"worker27",lineNumber:0,columnNumber:0}}]});await receipt.promise;}};
}
void test("actual timer controller consumes two original callback triples, fixed metadata and durable receipts",async()=>{
 const f=await fixture();await f.driver.prepare();assert.equal(f.state.requests,37);await f.driver.beforeCreate();assert.equal(f.state.requests,38);f.state.created=true;
 for(let i=0;i<2;i+=1){for(const role of["entry","returned","selfReturned"]as const){await f.callback(role);}}
 const result=await f.driver.finish();assert.equal(result.timers,2);assert.equal(f.state.requests,59);assert.equal(f.state.resumes,6);assert.equal(f.records.filter(row=>row.kind==="timer-result").length,6);chain(f.records);
 assert.throws(()=>f.driver.beforeCreate());assert.throws(()=>f.driver.finish());f.state.exited=true;await f.driver.endAfterOriginalExit();
});
void test("timer helper source substitution refuses before callback arms or any resume",async()=>{
 const f=await fixture("source");await assert.rejects(f.driver.prepare(),/ORIGINAL_GUARD_SCRIPT/u);assert.equal(f.state.resumes,0);assert.equal(f.records.some(row=>row.kind==="setup-result"),false);f.state.exited=true;await f.driver.endAfterOriginalExit();
});
void test("lost original timer resume acknowledgement cannot be retried or closed as complete",async()=>{
 const f=await fixture("resume");await f.driver.prepare();await f.driver.beforeCreate();f.state.created=true;await assert.rejects(f.callback("entry"),/original-timer-ack-lost/u);assert.equal(f.state.resumes,0);assert.throws(()=>f.driver.finish());assert.equal(f.records.some(row=>row.kind==="timer-result"),false);f.state.exited=true;await f.driver.endAfterOriginalExit();
});
void test("original Job exit joins the exact held timer request before component release",async()=>{
 const f=await fixture("blocked");await f.driver.prepare();await f.driver.beforeCreate();f.state.created=true;const callback=f.callback("entry");void(async():Promise<void>=>{try{await callback;}catch{
  // The following assertion retains the same original failure.
 }})();await nextTurn();f.state.exited=true;let ended=false;
 const ending=(async():Promise<void>=>{await f.driver.endAfterOriginalExit();ended=true;})();await nextTurn();assert.equal(ended,false);f.unblock();await assert.rejects(callback);await ending;assert.equal(ended,true);assert.equal(f.state.resumes,0);assert.equal(f.records.some(row=>row.kind==="complete"),false);
});

void test("the next timer pause remains serviceable during the prior resume freshness await",async()=>{
 const f=await fixture("next-pause");await f.driver.prepare();await f.driver.beforeCreate();f.state.created=true;
 try{
  const entry=f.callback("entry");const observed=Promise.allSettled([entry]);await f.freshEntered;
  const returned=f.callback("returned");const nextObserved=Promise.allSettled([returned]);await nextTurn();assert.equal(f.state.resumes,1);
  f.unblock();await entry;await returned;await observed;await nextObserved;await f.callback("selfReturned");
  const result=await f.driver.finish();assert.equal(result.timers,1);assert.equal(f.state.failure,null);assert.equal(f.state.resumes,3);assert.equal(f.state.requests,49);
  assert.deepEqual(f.records.filter(row=>row.kind==="timer-result").map(row=>row.evidence["role"]),["entry","returned","selfReturned"]);chain(f.records);
 }finally{f.unblock();f.state.exited=true;await f.driver.endAfterOriginalExit();}
});

void test("finish waits for a natural timer that begins during its tail freshness reproof",async()=>{
 const f=await fixture("finish-tail");await f.driver.prepare();await f.driver.beforeCreate();f.state.created=true;
 try{
  const finishing=f.driver.finish();const observed=Promise.allSettled([finishing]);await f.freshEntered;
  await f.callback("entry");f.unblock();await nextTurn();assert.equal(f.state.slots,0);assert.equal(f.driver.status()["complete"],false);
  await f.callback("returned");await nextTurn();assert.equal(f.state.slots,0);assert.equal(f.driver.status()["complete"],false);
  await f.callback("selfReturned");const result=await finishing;await observed;
  assert.equal(result.timers,1);assert.equal(f.state.failure,null);assert.equal(f.state.resumes,3);assert.equal(f.state.slots,1);assert.equal(f.state.requests,49);
  assert.equal(f.records.find(row=>row.kind==="quiesce-result")?.evidence["commands"],1);chain(f.records);
 }finally{f.unblock();f.state.exited=true;await f.driver.endAfterOriginalExit();}
});
void test("a natural timer service waits for the exact slot post-reply reproof before issuing commands",async()=>{
 const f=await fixture("finish-slot");await f.driver.prepare();await f.driver.beforeCreate();f.state.created=true;
 try{
  const finishing=f.driver.finish();const observed=Promise.allSettled([finishing]);await f.slotEntered(1);
  const entry=f.callback("entry");const entryObserved=Promise.allSettled([entry]);await nextTurn();
  assert.equal(f.state.requests,39);assert.equal(f.state.resumes,0);assert.equal(f.records.some(row=>row.kind==="timer-intent"),false);
  f.releaseSlot(1);await entry;await entryObserved;await nextTurn();assert.equal(f.state.slots,1);
  await f.callback("returned");await nextTurn();assert.equal(f.state.slots,1);assert.equal(f.driver.status()["complete"],false);
  await f.callback("selfReturned");const result=await finishing;await observed;
  assert.equal(result.timers,1);assert.equal(f.state.failure,null);assert.equal(f.state.resumes,3);assert.equal(f.state.slots,2);assert.equal(f.state.requests,50);
  assert.equal(f.records.find(row=>row.kind==="quiesce-result")?.evidence["commands"],2);chain(f.records);
 }finally{f.unblock();f.state.exited=true;await f.driver.endAfterOriginalExit();}
});
void test("two interrupted slot probes retain all six original holds within three queries and 61 requests",async()=>{
 const f=await fixture("finish-slots");await f.driver.prepare();await f.driver.beforeCreate();f.state.created=true;
 try{
  const finishing=f.driver.finish();const observed=Promise.allSettled([finishing]);
  for(const ordinal of[1,2]){
   await f.slotEntered(ordinal);const before=f.state.requests;const entry=f.callback("entry");const entryObserved=Promise.allSettled([entry]);await nextTurn();
   assert.equal(f.state.requests,before);assert.equal(f.state.resumes,3*(ordinal-1));f.releaseSlot(ordinal);await entry;await entryObserved;await nextTurn();assert.equal(f.state.slots,ordinal);
   await f.callback("returned");await nextTurn();assert.equal(f.state.slots,ordinal);assert.equal(f.driver.status()["complete"],false);
   await f.callback("selfReturned");
  }
  const result=await finishing;await observed;assert.equal(result.timers,2);assert.equal(f.state.failure,null);assert.equal(f.state.resumes,6);assert.equal(f.state.slots,3);assert.equal(f.state.requests,61);
  assert.equal(f.records.find(row=>row.kind==="quiesce-result")?.evidence["commands"],3);assert.equal(f.records.filter(row=>row.kind==="timer-result").length,6);assert.ok(f.state.pumps<=6);chain(f.records);
 }finally{f.unblock();f.state.exited=true;await f.driver.endAfterOriginalExit();}
});

for(const outcome of["resolve","reject"]as const){
 void test(`the natural deadline ends one held pump while original cleanup joins its late ${outcome}`,async context=>{
  const f=await fixture("held-pump");await f.driver.prepare();await f.driver.beforeCreate();f.state.created=true;
  context.mock.timers.enable({apis:["setTimeout"]});let ending:Promise<void>|null=null;
  try{
   const finishing=f.driver.finish();const observed=Promise.allSettled([finishing]);let finished=false;
   void(async():Promise<void>=>{await observed;finished=true;})();await f.pumpEntered;
   context.mock.timers.tick(19_999);await nextTurn();assert.equal(finished,false);assert.equal(f.state.pumps,1);
   context.mock.timers.tick(1);await nextTurn();assert.equal(finished,true,"the original natural deadline must settle finish while its pump remains held");const [result]=await observed;assert.ok(result?.status==="rejected");const deadline:unknown=result.reason;assert.ok(deadline instanceof Error);assert.match(deadline.message,/NATURAL_DEADLINE/u);
   assert.equal(f.state.failure,deadline);assert.equal(f.state.pumps,1);assert.equal(f.state.requests,39);assert.equal(f.state.slots,1);assert.equal(f.records.some(row=>row.kind==="complete"||row.kind==="quiesce-result"),false);
   assert.throws(()=>f.driver.finish(),/ORIGINAL/u);f.state.exited=true;let ended=false;
   ending=(async():Promise<void>=>{await f.driver.endAfterOriginalExit();ended=true;})();await nextTurn();assert.equal(ended,false);assert.equal(f.state.pumps,1);
   const late=new Error("late original pump rejection");f.settlePump(outcome,late);await ending;assert.equal(ended,true);assert.equal(f.state.failure,deadline);assert.equal(f.state.pumps,1);assert.equal(f.state.requests,39);assert.equal(f.driver.status()["complete"],false);
  }finally{
   f.settlePump("resolve");f.unblock();f.state.exited=true;await(ending??f.driver.endAfterOriginalExit());context.mock.timers.reset();
  }
 });
}
