/** Complete original classic bus/Task/helpers, with explicit asynchronous
 * service and timer peers. No native/app/context provenance exists here. */
import assert from "node:assert/strict";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_CONTAINERS as CONTAINERS, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE,
 qualifyCurrentSchematicWireClassicRpcSource as qualify } from "../../src/current-schematic-wire-classic-rpc-source.ts";

export function wireClassicRpcFixture(source:string,variant:0|1,mode:"complete"|"foreign"="complete"):string {
 assert.equal(qualify({scriptSource:source}),variant);const profile=SOURCE[variant];const container=CONTAINERS[variant];
 const parts:{start:number;end:number;text:string}[]=[];const add=(start:number,end:number,text:string):void=>{assert.equal(text.length,end-start);parts.push({start,end,text});};
 const before=(start:number,text:string):void=>{add(start-text.length,start,text);};
 const after=(end:number,text:string):void=>{add(end,end+text.length,text);};
 const vars=container.initializer;
 const prefix=`(function(){"use strict";const timers=[],counts={reply:[]},${vars.timeout}=300000,${vars.prefix}="_MSG_BUS_RPC_",${vars.image}=ArrayBuffer,${vars.shared}=true,${vars.weak}=WeakRef,setTimeout=(reject,delay)=>{timers.push({reject,delay})};`;
 add(0,prefix.length,prefix);
 for(const role of ["helperClone","helperRef","helperDeref","helperListGet","helperListEnsure","helperListRemove"]as const){
  const row=profile.rows[role];add(row.start,row.end,source.slice(row.start,row.end));
 }
 for(const role of ["MessageBusTask","MessageBus"]as const){
  const row=container.classes[role];before(row.start,`${role==="MessageBusTask"?"var ":","}${container.aliases[role]}=`);add(row.start,row.end,source.slice(row.start,row.end));if(role==="MessageBus"){after(row.end,";");}
 }
 const tail=`const mode=${JSON.stringify(mode)},bus=new ${container.aliases.MessageBus};
bus.rpcService("isClosing",async()=>{await new Promise(resolve=>setImmediate(resolve));return false});
bus.rpcService("i18n",async()=>{await new Promise(resolve=>setImmediate(resolve));return "or clear."});
bus.rpcService("getSheetAllTitle",async()=>{await new Promise(resolve=>setImmediate(resolve));return{page:{title:"sheet.schematic",docType:"sch",data:{}}}});
const shapes={},page={uuid:"page",shapeManager:shapes},host={currentProject:{projectId:"p"},messageBus:bus},line={},group={},before={line,wire:group},state={owner:null,before,failed:false,modifyAttempted:true,modifyAcknowledged:false,saveAttempted:false},holder=[{page,host,metadata:host.currentProject,line,group,shapes},state];state.owner=holder;
const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
let foreign=null,foreignTopic=null;if(mode==="foreign"){foreign=new ${container.aliases.MessageBus};foreign.rpcCall("outside",null);foreignTopic=Object.keys(foreign.pulled)[0];}
return{holder,native,bus,timers,counts,drive(){if(foreign!==null)setImmediate(()=>foreign.push(foreignTopic,false));const pending=[bus.rpcCall("isClosing",null),bus.rpcCall("getSheetAllTitle",{page:[]}),bus.rpcCall("i18n",["or clear."])];return Promise.all(pending).then(result=>{counts.reply=result;return result})}}})()`;
 before(source.length,tail);let cursor=0;const out:string[]=[];
 for(const part of parts.toSorted((a,b)=>a.start-b.start)){assert.ok(part.start>=cursor);out.push(source.slice(cursor,part.start).replaceAll(/[^\r\n]/gu,value=>" ".repeat(value.length)),part.text);cursor=part.end;}
 out.push(source.slice(cursor).replaceAll(/[^\r\n]/gu,value=>" ".repeat(value.length)));return out.join("");
}
