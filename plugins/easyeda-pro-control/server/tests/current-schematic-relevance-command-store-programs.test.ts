/** Mapped descriptor and queue comparisons on inert, hash-qualified source
 * fragments. No original UI, native owner or continuation is issued. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_COMMAND_STORE_QUEUE as QUEUE, CURRENT_SCHEMATIC_RELEVANCE_COMMAND_STORE_RECIPES as RECIPES } from "../src/current-schematic-relevance-command-store-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE as SOURCE } from "../src/current-schematic-relevance-normal-ui-source.ts";

const bodies = {
  storeBaseConstructor: 'class{constructor(){this.ticket=0;this.checkPoint=0;this.watcherCnt=0;this.watcherIndex=new Map}notify(){this.ticket===this.checkPoint&&(Promise.resolve().then(()=>{this.watcherIndex.forEach(async e=>{e.callback?await e.callback()&&e.setState(this.ticket):e.setState(this.ticket)}),this.checkPoint=this.ticket}),this.ticket++)}createEffectFb(e,i){let o=this.watcherCnt++;return()=>(this.watcherIndex.set(o,{setState:e,callback:i}),()=>{this.watcherIndex.delete(o)})}}',
  valueStoreConstructor: 'class extends Xe{constructor(e){super(),this.value=e}setValue(e){e!==this.value&&(this.value=e,this.notify())}refresh(){this.notify()}}',
  disabledStoreConstructor: 'class extends Xe{constructor(){super(...arguments);this.disableCmdStoreSet={};this.staticStore=new Bs(void 0)}setDisableCmd(i){for(let o in i){let n=i[o];this.disableCmdStoreSet[o]||(this.disableCmdStoreSet[o]=new Bs(void 0)),this.disableCmdStoreSet[o].setValue(!!n)}this.notify()}getDisableCmdStore(i){return i?(this.disableCmdStoreSet[i]||(this.disableCmdStoreSet[i]=new Bs(void 0)),this.disableCmdStoreSet[i]):this.staticStore}}',
  menuDisabled: 'function e_(t,e){if(!t)return;let i={};typeof t=="string"?i={[t]:e}:Object.prototype.toString.call(t)==="[object Object]"?i=pe.deepClone(t):Array.isArray(t)&&t.map(o=>{i[o]=e}),e0.setDisableCmd(i)}',
  toolbarDisabled: 'function w5(t,e){if(!t)return;let i={};typeof t=="string"?i={[t]:e}:Object.prototype.toString.call(t)==="[object Object]"?i=pe.deepClone(t):Array.isArray(t)&&t.map(o=>{i[o]=e}),e0.setDisableCmd(i)}',
} as const;

void test("four fixed source calls preserve mapped descriptors, pending tickets, ordered Maps and exact status queue progress", () => {
  for (const name of ["storeBaseConstructor", "valueStoreConstructor", "disabledStoreConstructor", "menuDisabled", "toolbarDisabled"] as const) {
    const row = SOURCE.roles[name], text = bodies[name];
    assert.equal(Buffer.byteLength(text), row.bytes, name);
    assert.equal(createHash("sha256").update(text).digest("hex"), row.sha256, name);
  }
  const context = createContext({ recipes: RECIPES, queuePrograms: QUEUE, bodies });
  const result: unknown = runInContext(String.raw`(()=>{
const fail=()=>{throw "inert comparison failed"},must=v=>{if(v!==true)fail()},throws=f=>{let refused=false;try{f()}catch{refused=true}if(!refused)fail()};
const queued=[],Promise={resolve(){return{then(fn){queued.push(fn)}}}},pe={deepClone(){throw "wrong branch"}};
const Xe=eval("("+bodies.storeBaseConstructor+")"),Bs=eval("("+bodies.valueStoreConstructor+")"),_4t=eval("("+bodies.disabledStoreConstructor+")"),e0=new _4t;
const e_=eval("("+bodies.menuDisabled+")"),w5=eval("("+bodies.toolbarDisabled+")");
const raw=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
const file=new Bs(false),undo=new Bs(void 0),redo=new Bs(false);e0.disableCmdStoreSet={file_save:file,undo,redo};e0.ticket=1;e0.checkPoint=0;file.ticket=1;file.checkPoint=0;redo.ticket=5;redo.checkPoint=4;
const stores=[e0,file,undo,redo],maps=stores.map(s=>s.watcherIndex),watcher={callback:void 0,setState(){throw "queued watcher executed"}};undo.watcherIndex.set("original",watcher);undo.watcherIndex.set("peer",{});
const objects=[...stores,e0.disableCmdStoreSet,e0.staticStore,_4t.prototype,Bs.prototype,Xe.prototype,Bs,Xe,_4t,_4t.prototype.setDisableCmd,Bs.prototype.setValue,Xe.prototype.notify,...maps];
const peer=Symbol("preserved");undo[peer]=17;e0.staticStore[peer]=19;
const invoke=(program,receiver,args)=>Reflect.apply(eval("("+program+")"),receiver,args),snap=()=>objects.map(o=>[o,Object.getPrototypeOf(o),Object.getOwnPropertyDescriptors(o)]),mapSnap=()=>maps.map(m=>[m,[...m.keys()],[...m.values()]]);
let getterCalls=0,changedCalls=0,unchangedCalls=0;
for(const recipe of recipes){const prior=snap(),mapPrior=mapSnap(),args=[raw,objects,stores,maps,mapPrior],selected=stores[recipe.slot],target=recipe.kind==="menu"?e_:w5,frame=[target,recipe.command,recipe.disabled,e0];
must(invoke(recipe.entry,frame,[raw,stores,target]));throws(()=>invoke(recipe.entry,[globalThis,...frame.slice(1)],[raw,stores,target]));must(invoke(recipe.before,prior,args));
const value=selected.value,ticket=selected.ticket,checkpoint=selected.checkPoint,mainTicket=e0.ticket,changed=value!==recipe.disabled;
selected.value=recipe.disabled;must(invoke(recipe.deltas[0],prior,args));if(changed){changedCalls++;if(selected.ticket===selected.checkPoint)selected.ticket++;must(invoke(recipe.deltas[1],prior,args));}else{unchangedCalls++;throws(()=>invoke(recipe.deltas[1],prior,args));}
if(e0.ticket===e0.checkPoint)e0.ticket++;must(invoke(recipe.deltas[2],prior,args));
selected.value=value;selected.ticket=ticket;selected.checkPoint=checkpoint;e0.ticket=mainTicket;target.call(target,recipe.command,recipe.disabled);must(invoke(recipe.deltas[2],prior,args));
e0.ticket++;throws(()=>invoke(recipe.deltas[2],prior,args));e0.ticket--;
selected.checkPoint=selected.ticket;throws(()=>invoke(recipe.deltas[2],prior,args));selected.checkPoint=checkpoint;
e0.staticStore[peer]=20;throws(()=>invoke(recipe.deltas[2],prior,args));e0.staticStore[peer]=19;
e0.staticStore[Symbol("extra")]=1;throws(()=>invoke(recipe.deltas[2],prior,args));for(const key of Object.getOwnPropertySymbols(e0.staticStore))if(key!==peer)Reflect.deleteProperty(e0.staticStore,key);
const field=Object.getOwnPropertyDescriptor(selected,"value");Object.defineProperty(selected,"value",{get(){getterCalls++;return recipe.disabled},configurable:true});throws(()=>invoke(recipe.deltas[2],prior,args));Object.defineProperty(selected,"value",field);
const old=undo.watcherIndex.get("original");undo.watcherIndex.set("original",{});throws(()=>invoke(recipe.deltas[2],prior,args));undo.watcherIndex.set("original",old);const entries=[...undo.watcherIndex];undo.watcherIndex.delete("original");undo.watcherIndex.set("original",old);throws(()=>invoke(recipe.deltas[2],prior,args));undo.watcherIndex.clear();for(const pair of entries)undo.watcherIndex.set(pair[0],pair[1]);
const wrong=[...stores];[wrong[2],wrong[3]]=[wrong[3],wrong[2]];throws(()=>invoke(recipe.deltas[2],prior,[raw,objects,wrong,maps,mapPrior]));must(invoke(recipe.deltas[2],prior,args));}
const q={index:-1,end:0},status={},other={[peer]:23},roots=Array(14).fill(null),details=Array(12).fill(null),value={canRedo:false,canUndo:true},args=[value,void 0],statusObjects=[args,value],normalSnapshot=[q,other].map(o=>[o,Object.getPrototypeOf(o),Object.getOwnPropertyDescriptors(o)]);roots[8]=status;details[11]=q;
q.index=2;q.end=3;q.current=status;q.args=args;must(invoke(queuePrograms.menu,normalSnapshot,[raw,roots,details,statusObjects]));throws(()=>invoke(queuePrograms.toolbar,normalSnapshot,[raw,roots,details,statusObjects]));q.index=3;must(invoke(queuePrograms.toolbar,normalSnapshot,[raw,roots,details,statusObjects]));q.current=void 0;q.args=void 0;must(invoke(queuePrograms.disposed,normalSnapshot,[raw,roots,details,statusObjects]));throws(()=>invoke(queuePrograms.toolbar,normalSnapshot,[raw,roots,details,statusObjects]));other[peer]=24;throws(()=>invoke(queuePrograms.disposed,normalSnapshot,[raw,roots,details,statusObjects]));
return{changedCalls,unchangedCalls,getterCalls,undo:undo.value,redo:redo.value,mainTicket:e0.ticket,redoTicket:redo.ticket,queued:queued.length};})()`, context);
  assert.deepEqual(structuredClone(result), { changedCalls: 2, unchangedCalls: 2, getterCalls: 0, undo: false, redo: true, mainTicket: 1, redoTicket: 5, queued: 1 });
  for (const recipe of RECIPES) { assert.equal(recipe.continuationAuthorized, false); assert.equal(recipe.queuedNotificationsCompleted, false); }
});
