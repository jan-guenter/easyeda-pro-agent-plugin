/** Same Inspector request, callback argument and original return throughout. */
 import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
 import {types} from "node:util";
 import {parentPort,workerData} from "node:worker_threads";
 import {z} from "zod";
 import {CurrentSchematicWireNetWatchDriver} from "../../src/current-schematic-wire-net-watch-driver.ts";
 import type {CurrentSchematicWireNetWatchCommand as Command} from "../../src/current-schematic-wire-net-watch-protocol.ts";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE as SOURCE,qualifyCurrentSchematicWireNetWatchFunction} from "../../src/current-schematic-wire-net-watch-source.ts";

 const config=z.strictObject({key:z.string().regex(/^[A-Za-z\d_]+$/u),source:z.string(),variant:z.union([z.literal(0),z.literal(1)]),foreign:z.boolean(),iterator:z.boolean()}).parse(workerData);

const fixtureReady=Promise.withResolvers<null>();const originalReturned=Promise.withResolvers<null>();const scriptReady=Promise.withResolvers<Readonly<{contextId:number;scriptId:string}>>();let contextId=0;let scriptId="";parentPort?.on("message",(message:unknown)=>{if(message!==null&&typeof message==="object"&&Reflect.get(message,"fixtureReady")===true){assert.deepEqual(message,{fixtureReady:true});fixtureReady.resolve(null);}else{assert.deepEqual(message,{originalWatchReturned:true});originalReturned.resolve(null);}});
const session=new Session;session.connectToMainThread();let driver:CurrentSchematicWireNetWatchDriver|null=null;const raw:unknown[]=[];const events:unknown[]=[];
 function post(method:string,params:unknown):Promise<unknown>{const pending:unknown=Reflect.apply(session.post.bind(session),session,[method,params]);assert.ok(types.isPromise(pending));return pending;}
 async function id(field:string):Promise<string>{const value=await session.post("Runtime.evaluate",{expression:`globalThis.netWatchRoots.${field}`,contextId,returnByValue:false});assert.equal(value.exceptionDetails,undefined);assert.ok(value.result.objectId!==undefined);return value.result.objectId;}
 async function request(command:Command):Promise<unknown>{const reply=await post(command.method,command.params);raw.push({command,reply});return reply;}
 function observe(method:string,params:unknown):void{const actual=driver;if(actual!==null&&actual.observeObject({sessionId:"wire-net-watch-fixture",method,params})){events.push({method,params});}}
 session.on("Debugger.paused",e=>{observe("Debugger.paused",e.params);});session.on("Debugger.resumed",(notification:unknown)=>{const packet=z.object({params:z.unknown()}).parse(notification);observe("Debugger.resumed",packet.params);});session.on("Debugger.scriptParsed",e=>{if(e.params.url===`${config.key}.js`){scriptReady.resolve({contextId:e.params.executionContextId,scriptId:e.params.scriptId});}observe("Debugger.scriptParsed",e.params);});
 async function main():Promise<void>{
  await session.post("Runtime.enable");await session.post("Debugger.enable");parentPort?.postMessage({needFixture:true},[]);await fixtureReady.promise;const selected=await scriptReady.promise;contextId=selected.contextId;scriptId=selected.scriptId;const native=await id("native");const net=await id("net");const shapes=await id("shapes");const page=await id("page");const holder=await id("holder");
  const sourceReceipt=Object.freeze({scriptSource:config.source});const actorSource=await session.post("Debugger.getScriptSource",{scriptId});const selectedSource=actorSource.scriptSource;const spans:Readonly<Record<string,Readonly<{start:number;end:number}>>>=SOURCE[config.variant].rows;for(const row of Object.values(spans)){assert.equal(selectedSource.slice(row.start,row.end),config.source.slice(row.start,row.end));}
  const original=new CurrentSchematicWireNetWatchDriver({sessionId:"wire-net-watch-fixture",scriptId,variant:config.variant,native,net,shapes,page,source:sourceReceipt},{request,assertOriginalSourceReceipt:(receipt,binding):void=>{assert.equal(receipt,sourceReceipt);assert.deepEqual(binding,{sessionId:"wire-net-watch-fixture",scriptId,variant:config.variant});assert.equal(actorSource.scriptSource,selectedSource);},assertCurrent:():void=>{assert.equal(driver,original);},assertOriginalWriterHolder:(value):void=>{assert.equal(value,holder);},assertOriginalExit:():never=>{throw new Error("No original native owner exists in this inert source fixture");},fail:():void=>{
 // The source driver retains its original first failure; no native owner exists.
 }});driver=original;
  const prepared=original.prepare();assert.equal(original.prepare(),prepared);await prepared;assert.throws(()=>original.retireAfterOriginalExit(),/No original native owner/u);
  const pending=original.waitForOriginalRegistration();assert.equal(original.waitForOriginalRegistration(),pending);
  parentPort?.postMessage({armed:true},[]);
  const registered=await pending;await originalReturned.promise;original.requireOriginalRegistration(registered);assert.throws(()=>original.requireOriginalRegistration(structuredClone(registered)));
  let sameSourceForeign=false;if(config.foreign){const replaced=await session.post("Runtime.evaluate",{expression:`globalThis.${config.key}.dispatcher._listenerSubscriptions[0].cb=globalThis.${config.key}.spawnForeign()`,returnByValue:false});assert.ok(replaced.result.objectId!==undefined&&replaced.exceptionDetails===undefined);const own=await session.post("Runtime.getProperties",{objectId:replaced.result.objectId,ownProperties:true});qualifyCurrentSchematicWireNetWatchFunction(own,replaced.result,config.variant,"listener",scriptId);sameSourceForeign=true;}
  if(config.iterator){await session.post("Runtime.evaluate",{expression:`globalThis.${config.key}.tamperIterator()`,returnByValue:false});}
  assert.throws(()=>original.bindOriginalWriterPreMutation(registered,"different-holder"));const binding=original.bindOriginalWriterPreMutation(registered,holder);assert.equal(original.bindOriginalWriterPreMutation(registered,holder),binding);assert.throws(()=>original.bindOriginalWriterPreMutation(structuredClone(registered),holder));
  let packet:unknown=null;let refused=false;if(config.foreign||config.iterator){await assert.rejects(binding);refused=true;}else{const originalPacket=await binding;packet=originalPacket;original.requireOriginalPreflight(originalPacket);assert.throws(()=>original.requireOriginalPreflight(structuredClone(originalPacket)));}
  const state=await session.post("Runtime.evaluate",{expression:`({modify:globalThis.${config.key}.holder[1].modifyAttempted,save:globalThis.${config.key}.holder[1].saveAttempted,failed:globalThis.${config.key}.holder[1].failed})`,returnByValue:true});
  const reportedState:unknown=state.result.value;driver=null;await session.post("Debugger.disable");session.disconnect();parentPort?.postMessage({registered,packet,refused,sameSourceForeign,raw,events,state:reportedState,originalInvocationSettled:true},[]);parentPort?.close();
 }
 try{
  // oxlint-disable-next-line node/no-top-level-await -- This fixture retains its original Inspector and port until its one source result settles.
  await main();
 }catch(error){
  driver=null;
  // oxlint-disable-next-line node/no-top-level-await -- Release only this inert fixture's Inspector agent after its recorded failure.
  await session.post("Debugger.disable");session.disconnect();parentPort?.postMessage({error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:null,raw,events},[]);parentPort?.close();
 }
