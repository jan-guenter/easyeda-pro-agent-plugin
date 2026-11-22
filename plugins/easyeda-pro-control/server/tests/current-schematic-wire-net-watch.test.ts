/** Actual original pre-mutation registration; page/model surroundings stay inert. */
 import assert from "node:assert/strict";
  import {test} from "node:test";
 import {Script,createContext,runInContext} from "node:vm";
 import {Worker} from "node:worker_threads";
 import {CurrentSchematicWireNetWatchDriver} from "../src/current-schematic-wire-net-watch-driver.ts";
import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE as SOURCE} from "../src/current-schematic-wire-net-watch-source.ts";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_PROGRAMS as PROGRAMS} from "../src/current-schematic-wire-net-watch-programs.ts";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_LIMIT as LIMIT,currentSchematicWireNetWatchCall,validateCurrentSchematicWireNetWatchCommand} from "../src/current-schematic-wire-net-watch-protocol.ts";
 import {wireNetWatchFixture} from "./helpers/current-schematic-wire-net-watch-fixture.ts";
  import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

 void test("Wire original nonempty bbox registration binds its actual source/receiver before mutation",async context=>{
  for(const[variant,foreign,iterator]of[[0,false,false],[1,false,false],[0,true,false],[0,false,true]]as const){
   const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}

   const vm=createContext({});const key=`__wireNetWatch${String(variant)}${String(foreign)}${String(iterator)}`;const url=`${key}.js`;
   const fixture:{roots:unknown}={roots:null};
  const worker=new Worker(new URL("helpers/current-schematic-wire-net-watch-worker.ts",import.meta.url),{workerData:{key,source,variant,foreign,iterator}});const done=Promise.withResolvers<unknown>();const exit=Promise.withResolvers<number>();const needFixture=Promise.withResolvers<null>();worker.once("error",done.reject);let dispatched=false;let originalWatchReturn:unknown;worker.on("message",(message:unknown)=>{if(message!==null&&typeof message==="object"&&Reflect.get(message,"needFixture")===true){needFixture.resolve(null);}else if(message!==null&&typeof message==="object"&&Reflect.get(message,"armed")===true){assert.equal(dispatched,false);dispatched=true;setImmediate(()=>{const roots=fixture.roots;assert.ok(roots!==null&&typeof roots==="object");const run:unknown=Reflect.get(roots,"run");assert.ok(typeof run==="function");originalWatchReturn=Reflect.apply(run,roots,[]);worker.postMessage({originalWatchReturned:true},[]);});}else{done.resolve(message);}});worker.once("exit",exit.resolve);
   context.after(async()=>{Reflect.deleteProperty(globalThis,key);await worker.terminate();});await needFixture.promise;runInContext(wireNetWatchFixture(source,variant),vm,{filename:url});fixture.roots=Reflect.get(vm,"netWatchRoots");Object.defineProperty(globalThis,key,{value:fixture.roots,configurable:true});worker.postMessage({fixtureReady:true},[]);
   const raw=await done.promise;assert.equal(await exit.promise,0);const roots=fixture.roots;if(roots!==null&&typeof roots==="object"){const shapes:unknown=Reflect.get(roots,"shapes");assert.ok(shapes!==null&&typeof shapes==="object");assert.equal(originalWatchReturn,Reflect.get(shapes,"_baseWatchSubscriptions"));}assert.ok(raw!==null&&typeof raw==="object"&&!("error"in raw),JSON.stringify(raw));context.diagnostic(JSON.stringify({variant,foreign,iterator,raw,originalWorkerExit:0}));
   assert.deepEqual(Reflect.get(raw,"state"),{modify:false,save:false,failed:false});assert.equal(Reflect.get(raw,"originalInvocationSettled"),true);assert.equal(Reflect.get(raw,"refused"),foreign||iterator);
   if(foreign||iterator){assert.equal(Reflect.get(raw,"sameSourceForeign"),foreign);}else{
   const packet:unknown=Reflect.get(raw,"packet");assert.ok(packet!==null&&typeof packet==="object");assert.equal(Reflect.get(packet,"schema"),"private.schematic-wire-original-net-watch-preflight.v1");
   for(const field of["originalRegistrationConsumed","originalBaseWatchParentRegistrationCompared","originalWriterPreMutationStateCompared","originalBboxUpdateRosterOne","originalListenerAndSubscriptionRecompared","originalSourcePrimitivesQualified"]){assert.equal(Reflect.get(packet,field),true);}
   for(const field of["originalWholeScriptSourceJoined","originalNativeOwnerJoined","continuousGlobalsVerified","markerRefreshObserved","sourceSerializationObserved","modifyAuthorized","saveAuthorized"]){assert.equal(Reflect.get(packet,field),false);}
   assert.equal(Reflect.get(packet,"normalRequests"),LIMIT.normal);assert.equal(Reflect.get(packet,"helperSources"),LIMIT.helperSources);assert.equal(Reflect.get(packet,"cleanupRequests"),LIMIT.cleanup);
   const events:unknown=Reflect.get(raw,"events");assert.ok(Array.isArray(events));assert.equal(events.length,LIMIT.events);assert.equal(events.filter(e=>Reflect.get(e,"method")==="Debugger.paused").length,6);assert.equal(events.filter(e=>Reflect.get(e,"method")==="Debugger.resumed").length,6);}
  }
  for(const body of Object.values(PROGRAMS)){assert.ok(body.length<=16_384);assert.doesNotThrow(()=>new Script(`(${body})`));}
  const command=currentSchematicWireNetWatchCall("selectNet","123.1.2",["123.1.3","123.1.4"]);assert.throws(()=>validateCurrentSchematicWireNetWatchCommand({...command,params:{...command.params,throwOnSideEffect:false}}));assert.throws(()=>validateCurrentSchematicWireNetWatchCommand({...command,params:{...command.params,functionDeclaration:"function(){return true}"}}));assert.throws(()=>validateCurrentSchematicWireNetWatchCommand({phase:"net-watch-resume",method:"Debugger.stepInto",params:{}}));
 });

 void test("rejected original breakpoint replies stay retained without qualifying a pause",async context=>{
  const source=await readConfiguredEasyedaAsset(SOURCE[0].relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  for(const kind of["source-changed-after-ack","location-mismatch"]as const){
   const sourceReceipt=Object.freeze({scriptSource:source});let current=true;let requests=0;
   const driver=new CurrentSchematicWireNetWatchDriver({sessionId:"unit-session",scriptId:"unit-script",variant:0,native:"native",net:"net",shapes:"shapes",page:"page",source:sourceReceipt},{
    request:(command):Promise<unknown>=>{requests+=1;assert.equal(command.phase,"net-watch-arm");assert.equal(command.method,"Debugger.setBreakpoint");if(command.method!=="Debugger.setBreakpoint"){throw new Error("only the initial arm is permitted");}const original={breakpointId:"supplied-original-arm",actualLocation:{...command.params.location}};if(kind==="source-changed-after-ack"){current=false;}else{original.actualLocation.columnNumber+=1;}return Promise.resolve(original);},
    assertCurrent:():void=>{
     // This negative control-flow unit owns no native actor.
    },assertOriginalSourceReceipt:(receipt,binding):void=>{assert.equal(receipt,sourceReceipt);assert.deepEqual(binding,{sessionId:"unit-session",scriptId:"unit-script",variant:0});assert.equal(current,true);},assertOriginalWriterHolder:():never=>{throw new Error("holder binding must remain unavailable");},assertOriginalExit:():never=>{throw new Error("No original native owner");},fail:():void=>{
     // The original source failure is retained by the driver.
    },
   });
   await assert.rejects(driver.prepare());assert.deepEqual(driver.inspect(),{ownedArms:1,qualifiedArms:0,pendingArmCleanup:1,normalRequests:1,failed:true,originalNativeOwnerJoined:false});assert.equal(requests,1);assert.throws(()=>driver.retireAfterOriginalExit(),/No original native owner/u);
  }
 });
