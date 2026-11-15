/** Inert descriptor/Storage surrogates exercise the production fixed helpers.
 * These tests issue no Core origin, native owner, browser or DEL grant. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {Script,createContext,runInContext} from "node:vm";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_PROGRAMS as P} from "../src/current-footprint-inverse-native-delete-collateral-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_CALLS as CALLS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLLATERAL_REQUESTS as R,currentFootprintInverseNativeDeleteCollateralCases as cases,currentFootprintInverseNativeDeleteCollateralTemplate as template,validateCurrentFootprintInverseNativeDeleteCollateralCommand as validate} from "../src/current-footprint-inverse-native-delete-collateral-protocol.ts";
import {CurrentFootprintInverseNativeDeleteCollateralCollector as Collector,assertOriginalCurrentFootprintInverseNativeDeleteCollateralCollector as original} from "../src/current-footprint-inverse-native-delete-collateral-collector.ts";

function realm():ReturnType<typeof createContext>{
 const context=createContext({});
 runInContext('globalThis.I=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];globalThis.g=()=>true;globalThis.project={projectId:"a".repeat(64),branchUuid:"b".repeat(32),isV2Format:false};globalThis.gVars={currentProject:project,isHistoryMode:false};globalThis.bar=class tt{};bar.containerIds=["one","absent"];globalThis.store={containerInfo:{one:{tabs:[{tabId:"unrelated-tab",state:{dirty:false}}]}}};globalThis.scope={object:{tt:bar,me:bar,vt:store,w:gVars}};globalThis.sender=[null,null,null,"c".repeat(32),project.projectId,g,null,null];globalThis.traps=0;globalThis.writes=0;globalThis.Storage=function Storage(){};Object.defineProperty(Storage.prototype,"length",{get(){return Object.getOwnPropertyNames(this).length},enumerable:true,configurable:true});globalThis.local=Object.create(Storage.prototype);Object.assign(local,{checkRatlineNotShowAgain:"keep-one",checkDrcNotShowAgain:"keep-two",peer:"unchanged"});Object.defineProperty(globalThis,"localStorage",{get(){return local},enumerable:true,configurable:true});',context);
 for(const[role,program]
of Object.entries(P)){
runInContext(`globalThis.${role}=(${program});`,context);
}
 return context;
}
function prepareTabs(context:ReturnType<typeof createContext>):void{
 runInContext('globalThis.m=Reflect.apply(module,I,[scope,sender]);globalThis.r=Reflect.apply(tabRoots,I,[m]);globalThis.cs=Reflect.apply(tabContainers,I,[r]);globalThis.ls=Reflect.apply(tabLists,I,[cs]);globalThis.rs=Reflect.apply(tabRows,I,[ls]);globalThis.tp=Reflect.apply(tabPrepare,I,[m,r,cs,ls,rs]);',context);
}
function prepareStorage(context:ReturnType<typeof createContext>):void{
 runInContext('globalThis.sr=Reflect.apply(storageRoots,I,[]);globalThis.sm=Reflect.apply(storageMembers,I,[sr]);globalThis.sv=Reflect.apply(storageValue,I,[sr,sm]);globalThis.sp=Reflect.apply(storagePrepare,I,[sr,sm,sv]);',context);
}
void test("native tab guard retains the whole absent-target census and rejects changes without executing accessors",()=>{
 for(const mutation
 of ['rs[0].tabId=sender[3]+"@"+sender[4]','Object.defineProperty(rs[0],"tabId",{get(){traps++;return "unrelated"},enumerable:true,configurable:true})','store.containerInfo.one.tabs.push({tabId:"new"})','project.branchUuid="d".repeat(32)','scope.object.me=class tt{}','store.containerInfo.one.tabs=[]','rs[0].state={dirty:true}']){
  const context=realm();
prepareTabs(context);
assert.equal(runInContext('Reflect.apply(tabReprove,I,[tp])',context),true);
runInContext(mutation,context);
assert.throws(()=>runInContext('Reflect.apply(tabReprove,I,[tp])',context));
assert.equal(runInContext('traps',context),0);
 }
 const context=realm();
runInContext('store.containerInfo.one.tabs[0].tabId=sender[3]+"@"+sender[4]',context);
assert.throws(():void=>{prepareTabs(context);});
assert.equal(runInContext('writes',context),0);
}
);
void test("native Storage continuity preserves both preference keys and every original peer on the same Storage object",()=>{
 for(const mutation
 of ['local.checkRatlineNotShowAgain="changed"','delete local.checkDrcNotShowAgain','local.peer="changed"','local.extra="new"','globalThis.local=Object.assign(Object.create(Storage.prototype),local)','Object.defineProperty(local,"peer",{get(){traps++;return "unchanged"},enumerable:true,configurable:true})','Object.defineProperty(globalThis,"localStorage",{get(){traps++;return local},enumerable:true,configurable:true})','Object.defineProperty(Storage.prototype,"length",{get(){traps++;return 3},enumerable:true,configurable:true})']){
  const context=realm();
prepareStorage(context);
assert.equal(runInContext('Reflect.apply(storageReprove,I,[sp])',context),3);
runInContext(mutation,context);
assert.throws(()=>runInContext('Reflect.apply(storageReprove,I,[sp])',context));
assert.equal(runInContext('traps',context),0);
assert.equal(runInContext('writes',context),0);
 }
 const context=realm();
runInContext('Object.defineProperty(local,"checkRatlineNotShowAgain",{get(){traps++;return "keep-one"},enumerable:true,configurable:true})',context);
assert.throws(():void=>{prepareStorage(context);});
assert.equal(runInContext('traps',context),0);
}
);
void test("the native collateral grammar restores complete fixed packets and keeps all mutation vocabulary closed",()=>{
 const all=cases();
assert.equal(all.length,20);
for(const c
 of all){
let text=template(c).template;
const row=template(c);
if(c.method==="Runtime.callFunctionOn"){
text=text.replace(JSON.stringify(`__inverse_native_delete_collateral_program_${c.role}__`),JSON.stringify(CALLS[c.role].program));
}
for(const name
 of row.names){
text=text.replace(JSON.stringify(`__inverse_native_delete_collateral_${name}__`),JSON.stringify("original_ref"));
}
assert.deepEqual(JSON.parse(text),{method:c.method,params:c.params});
assert.throws(()=>validate({...c,callerProgram:"foreign"}));
}
 for(const program
 of Object.values(P)){
assert.ok(new Script(`(${program})`) instanceof Script);
}
const before=all.find(c=>c.method==="Runtime.callFunctionOn"&&c.role==="module");
assert.ok(before);
assert.throws(()=>validate({...before,round:"after"}));
for(const method
 of ["Debugger.resume","Runtime.evaluate","Storage.setItem","Storage.removeItem"]){
assert.throws(()=>validate({round:"after",phase:"inverse-native-delete-collateral-call",role:"storageReprove",method,params:{}}));
}
assert.equal(R.cdpRequests,12+12+24+2*8+32+2+2+1);
assert.equal(R.restorationAuthorized,false);
}
);
void test("native collateral cleanup joins the original pending read and rejects data without an original after-return assertion",async()=>{
 const gate=Promise.withResolvers<unknown>();
let requests=0;
let exited=false;
let exitChecks=0;
let after=false;
 const collector=new Collector({receipt:"original_ref",uiScope:"original_scope",sender:"original_sender",uiScriptId:"original_ui",current:():void=>{
assert.ok(requests<=1);
}
,assertBefore:():void=>{
assert.equal(exited,false);
}
,assertAfter:():void=>{
after=true;
throw new Error("Original DEL has not returned");
}
,assertOriginalExit:():void=>{
exitChecks+=1;
assert.equal(exited,true);
}
,request:():Promise<unknown>=>{
requests+=1;
return gate.promise;
}
});
 original(collector);
const copied:unknown=Object.create(Collector.prototype);
assert.throws(()=>Reflect.apply(original,null,[copied]),/CUSTODY/u);
const pending=collector.prepare();
assert.equal(collector.prepare(),pending);
assert.equal(requests,1);
assert.throws(():void=>{collector.requirePrepared({profile:"private.current-footprint-inverse-native-delete-collateral-prepared.v1",tabProof:"matching",storageProof:"matching",storage:"matching",tabId:"matching",containers:1,presentContainers:1,tabs:1,properties:27,targetTabAbsent:true,storageKeys:3,storagePeerSha256:"a".repeat(64),publicTabCloseObserved:false,publicPreferenceRemovalObserved:false,restorationAuthorized:false,deleteAuthorized:false});});
assert.equal(after,false);
 exited=true;
let settled=false;
const cleanup=collector.settleAfterOriginalExit();
const observing=(async():Promise<void>=>{await cleanup;settled=true;})();
await Promise.resolve();
assert.equal(settled,false);
gate.reject(new Error("Original read failed after exit"));
await assert.rejects(pending,/Original read failed/u);
await cleanup;
await observing;
assert.equal(requests,1);
assert.equal(exitChecks,2);
}
);
