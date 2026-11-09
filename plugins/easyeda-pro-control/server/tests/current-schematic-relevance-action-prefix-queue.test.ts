import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";
/** Real pinned event/disposable methods on an inert VM graph. This creates no
 * original renderer, owner, action continuation, CAD model or native process. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_PROGRAMS as P } from "../src/current-schematic-relevance-action-prefix-queue-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_SOURCE as SOURCE, qualifyCurrentSchematicRelevancePrefixQueueSource } from "../src/current-schematic-relevance-action-prefix-queue-source.ts";
import { decodeCurrentSchematicRelevancePrefixQueueScope, decodeCurrentSchematicRelevancePrefixQueueWeakRef, requireCurrentSchematicRelevancePrefixQueueDescription } from "../src/current-schematic-relevance-action-prefix-queue-replies.ts";

let installedSources:Promise<readonly string[]|null>|null=null;
function sourceTexts():Promise<readonly string[]|null>{installedSources??=readConfiguredEasyedaAssets(SOURCE.map(row=>row.relativePath));return installedSources;}
async function sourceAvailable(context:TestContext):Promise<boolean>{if(await sourceTexts()===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return false;}return true;}

async function fixture(variant:0|1):Promise<ReturnType<typeof createContext>>{
 const profile=SOURCE[variant];const texts=await sourceTexts();assert.ok(texts!==null);const source=texts[variant];assert.ok(typeof source === "string");assert.equal(qualifyCurrentSchematicRelevancePrefixQueueSource(source),variant);
 const raw=(role:keyof typeof profile.roles):string=>{const row=profile.roles[role];return source.slice(row.start,row.end);};
 const q=profile.roles.queueConstructor.name;
 const b=profile.roles.eventBaseConstructor.name;
 const v=profile.roles.eventConstructor.name;
 const disposable=profile.roles.disposableConstructor.name;
 const factory=profile.aliases.listenerFactory;
 const cleanup=profile.aliases.listenerCleanup;
 const nc=profile.aliases.storeSymbol;
 const wb=profile.aliases.backrefsSymbol;
 const context=createContext({});runInContext(`const ${nc}=Symbol("disposable-store"),${wb}=Symbol("ref-disposable"),qt={};${raw("listenerCleanup")};${raw("listenerFactory")};const ${q}=(${raw("queueConstructor")}),${b}=(${raw("eventBaseConstructor")}),${v}=(${raw("eventConstructor")}),${disposable}=(${raw("disposableConstructor")});
globalThis.traps=0;globalThis.shapes={};globalThis.page={_onAttrChange:new ${v}};Object.defineProperty(page,"onAttrChange",{get(){return this._onAttrChange.event}});
globalThis.history={shapeManager:shapes,_isWatched:true,_onBatchSaveStart:new ${v},_onBatchSaveEnd:new ${v},_onBatchSaveWillEnd:new ${v},modelCommandMap:new Map,docManagerAttrCommand:null,${raw("historyClearTempData")},_dataOnChangeSubscriptions:new ${disposable},onModelAttributeChange:function Cr(){},_updateDocManagerAttrCore(){},_tryHandleGroupModelCommand(){}};globalThis.Cr=history.onModelAttributeChange;history.onSubTreeInsertConnectedChild=Cr;history.onSubTreeRemoveConnectedChild=Cr;shapes.docManager=page;shapes.historyRecorder=history;
class Arrows{first(t){return(${raw("historyStartFirst")})}second(e){return(${raw("historyStartSecond")})}endFirst(){return(${raw("historyEndFirst")})}endSecond(e){return(${raw("historyEndSecond")})}willEnd(){return(${raw("historyWillEnd")})}}
globalThis.first=Arrows.prototype.first.call(history,shapes);globalThis.second=Arrows.prototype.second(shapes);globalThis.endFirst=Arrows.prototype.endFirst.call(history);globalThis.endSecond=Arrows.prototype.endSecond(shapes);globalThis.willEnd=Arrows.prototype.willEnd.call(history);history._onBatchSaveWillEnd.event(willEnd);history._onBatchSaveStart.event(first);history._onBatchSaveStart.event(second);history._onBatchSaveEnd.event(endFirst);history._onBatchSaveEnd.event(endSecond);
globalThis.runner={_currentAction:null,_onWillRun:new ${v},shapeManagers:{_count:1,_idMap:new Map([[1,new WeakRef(shapes)]]),_weakMap:new WeakMap([[shapes,1]])},_historyResolversMap:new WeakMap,consistencyResumePauseImpl:{consistencyChannel:{}},_autoCancelActionTimer:{}};globalThis.cm={};globalThis.manager={_base:{consistencyManager:cm},consistencyManager:cm};globalThis.consistency={manager,uploadImpl:{}};
globalThis.native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];globalThis.refs=Array(24).fill({});refs[9]=page;refs[10]=shapes;refs[13]=consistency;refs[22]=runner;globalThis.idle=Array(18).fill(()=>{});idle[17]=Cr;globalThis.module=[${factory},${cleanup},${nc},${wb}];globalThis.run=[runner,()=>{},{},()=>{},()=>{},()=>{},()=>{},()=>{},()=>{},()=>{},Object.prototype.toString,${nc},${wb},"parent"];
globalThis.roots=(${P.roots}).call(run,native,refs,idle,module);globalThis.events=(${P.events}).call(roots,native,refs,idle);globalThis.details=(${P.details}).call(events,native,module);globalThis.subscriptions=(${P.subscriptions}).call(details,native);
globalThis.willEndRoot=(${P.willEndRoot}).call(history,native,roots);globalThis.willEndDetails=(${P.willEndDetails}).call(willEndRoot[0],native,willEndRoot);globalThis.willEndSubscription=(${P.willEndSubscription}).call(willEndDetails,native);
globalThis.qualified=[];for(const tuple of [roots,events,details,subscriptions,refs,module,idle,willEndRoot,willEndDetails,willEndSubscription])for(let value of tuple){while(value!==null&&(typeof value==="object"||typeof value==="function")){if(!qualified.includes(value))qualified.push(value);value=Object.getPrototypeOf(value);}}
globalThis.willEndFunctions=(${P.willEndFunctions}).call(history,native,roots,willEndRoot,willEndDetails,willEndSubscription,qualified);globalThis.functions=(${P.functions}).call(roots,native,run,refs,idle,module,events,details,subscriptions,qualified);`,context);return context;
}
void test("both exact installed listener/queue graphs preserve idle dispatch and actual start/end reset behavior",async testContext=>{
 if(!await sourceAvailable(testContext)){return;}
 for(const variant of [0,1] as const){const context=await fixture(variant);assert.equal(runInContext(`(${P.same}).call(functions,native)`,context),true);assert.equal(runInContext(`(${P.scopes}).call([shapes,shapes,shapes],native,refs,roots)`,context),true);runInContext('history._onBatchSaveStart.dispatch(undefined)',context);assert.equal(runInContext('history._dataOnChangeSubscriptions[module[2]].size',context),2);assert.equal(runInContext('shapes.changedBusGroupIds instanceof Set',context),true);assert.throws(()=>runInContext(`(${P.same}).call(functions,native)`,context));runInContext('history._onBatchSaveWillEnd.dispatch(undefined);history._onBatchSaveEnd.dispatch(undefined)',context);assert.equal(runInContext('history._dataOnChangeSubscriptions[module[2]].size',context),0);assert.equal(runInContext('history.onModelAttributeChange===Cr&&shapes.changedBusGroupIds===null',context),true);}
});
void test("callback/queue drift and prototype hook getters refuse without invoking an application hook",async testContext=>{
 if(!await sourceAvailable(testContext)){return;}
 for(const change of ['subscriptions[1].cb=()=>{}','details[4].current=events[0]','Object.setPrototypeOf(events[4],{get onBeforeAdd(){traps++;throw Error("getter")}})']){const context=await fixture(0);runInContext(change,context);assert.throws(()=>runInContext(`(${P.same}).call(functions,native)`,context));assert.equal(runInContext('traps',context),0);}
 const context=await fixture(0);runInContext('consistency.manager=new Proxy({},{ownKeys(){traps++;throw Error("proxy")},getOwnPropertyDescriptor(){traps++;throw Error("proxy")}})',context);runInContext(`(${P.roots}).call(run,native,refs,idle,module)`,context);assert.equal(runInContext('traps',context),0);
});
void test("WeakRef target packets require the real target field and reject proxy or collected targets",()=>{
 const packet={result:[],internalProperties:[{name:"[[Prototype]]",value:{type:"object",className:"WeakRef",objectId:"prototype"}},{name:"[[WeakRefTarget]]",value:{type:"object",className:"sk",objectId:"original-shape"}}]};assert.deepEqual(decodeCurrentSchematicRelevancePrefixQueueWeakRef(packet),{prototype:"prototype",target:"original-shape"});assert.throws(()=>decodeCurrentSchematicRelevancePrefixQueueWeakRef({...packet,internalProperties:[packet.internalProperties[0],{name:"[[WeakRefTarget]]",value:{type:"undefined"}}]}));assert.throws(()=>decodeCurrentSchematicRelevancePrefixQueueWeakRef({...packet,internalProperties:[packet.internalProperties[0],{name:"[[WeakRefTarget]]",value:{type:"object",subtype:"proxy",objectId:"foreign"}}]}));
});

void test("staged intrinsic and single-shape projections keep unknown nested objects opaque",async testContext=>{
 if(!await sourceAvailable(testContext)){return;}
 const context=await fixture(0);
 runInContext(`globalThis.extra=[Reflect,Array,Set,WeakMap,String,Error,Promise,Number,Symbol,WeakRef];globalThis.extraPrototypes=(${P.intrinsicPrototypes}).call(extra,native);for(const tuple of [extra,extraPrototypes,native,[Object.prototype.toString,Function.prototype]])for(let value of tuple){while(value!==null&&(typeof value==="object"||typeof value==="function")){if(!qualified.includes(value))qualified.push(value);value=Object.getPrototypeOf(value);}}globalThis.members=(${P.intrinsicMembers}).call(extra,native,extraPrototypes,qualified,Function.prototype,run);globalThis.container=(${P.container}).call(roots[3],native,roots);globalThis.containerMembers=(${P.containerMembers}).call(container,native,roots);globalThis.manager=(${P.manager}).call(roots[5],native,roots);`,context);
 assert.equal(runInContext('members.length===38&&members.slice(0,34).every(v=>typeof v==="function")&&members.slice(34).every(v=>typeof v==="symbol")',context),true);
 assert.equal(runInContext(`(${P.weakMap}).call(container[1],native,refs,roots,container,containerMembers,members)`,context),true);
 assert.equal(runInContext(`(${P.managerBase}).call(manager[0],native,manager)`,context),true);
 assert.equal(runInContext(`(${P.pauseChannel}).call(roots[7],native,roots)[0]===runner.consistencyResumePauseImpl.consistencyChannel`,context),true);
 for(const change of ['Object.defineProperty(String.prototype,Symbol.split,{get(){traps++;throw Error("hook")}})','Object.defineProperty(Error,"prepareStackTrace",{get(){traps++;throw Error("hook")}})','Object.defineProperty(Array,Symbol.species,{value:()=>{},configurable:true})']){const next=await fixture(0);runInContext(`globalThis.extra=[Reflect,Array,Set,WeakMap,String,Error,Promise,Number,Symbol,WeakRef];globalThis.extraPrototypes=(${P.intrinsicPrototypes}).call(extra,native);for(const tuple of [extra,extraPrototypes,native,[Object.prototype.toString,Function.prototype]])for(let value of tuple){while(value!==null&&(typeof value==="object"||typeof value==="function")){if(!qualified.includes(value))qualified.push(value);value=Object.getPrototypeOf(value);}}${change}`,next);assert.throws(()=>runInContext(`(${P.intrinsicMembers}).call(extra,native,extraPrototypes,qualified,Function.prototype,run)`,next));assert.equal(runInContext('traps',next),0);}
});
async function inspectExposedBinding(session: Session, objectId: string, binding: "t" | "e" | null): Promise<void> {
  const metadata = await session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  const scopes = metadata.internalProperties?.find(row => row.name === "[[Scopes]]")?.value?.objectId; assert.ok(typeof scopes === "string");
  const list = await session.post("Runtime.getProperties", { objectId: scopes, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  let matched = 0;
  for (const row of list.result) {
    if (/^\d+$/u.test(row.name) && row.value?.description?.startsWith("Closure") === true) {
      assert.ok(typeof row.value.objectId === "string");
      const packet = await session.post("Runtime.getProperties", { objectId: row.value.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      assert.equal(packet.result.some(value => value.name === "this"), false);
      if (binding !== null && packet.result.some(value => value.name === binding)) {
        assert.equal(typeof decodeCurrentSchematicRelevancePrefixQueueScope(packet, binding), "string"); matched += 1;
      }
    }
  }
  assert.equal(matched, binding === null ? 0 : 1);
}
void test("actual V8 scope packets expose t/e but omit lexical this for exact history callbacks", async testContext => {
  if (!await sourceAvailable(testContext)) { return; }
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); const key = "__inertPrefixQueueScopes";
  try {
    for (const variant of [0, 1] as const) {
      const context = await fixture(variant);
      for (const [field, role, binding] of [["first", "historyStartFirst", "t"], ["second", "historyStartSecond", "e"], ["endFirst", "historyEndFirst", null], ["endSecond", "historyEndSecond", "e"], ["willEnd", "historyWillEnd", null]] as const) {
        const fn: unknown = Reflect.get(context, field); Object.defineProperty(globalThis, key, { value: fn, configurable: true });
        const evaluated = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-prefix-queue" });
        const objectId = evaluated.result.objectId; assert.ok(typeof objectId === "string");
        requireCurrentSchematicRelevancePrefixQueueDescription(evaluated.result.description ?? "", variant, role);
        await inspectExposedBinding(session, objectId, binding);
      }
      const ref: unknown = runInContext("new WeakRef(shapes)", context); Object.defineProperty(globalThis, key, { value: ref, configurable: true });
      const evaluated = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-prefix-queue" });
      const objectId = evaluated.result.objectId; assert.ok(typeof objectId === "string");
      const packet = await session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      assert.equal(typeof decodeCurrentSchematicRelevancePrefixQueueWeakRef(packet).target, "string");
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-prefix-queue" }); session.disconnect(); }
});
