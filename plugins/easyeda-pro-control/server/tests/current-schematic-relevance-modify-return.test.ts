/** Original batch-tail data only. No original CM owner, callback delivery,
 * timer, worker completion, SDK settlement or Save is established here. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_PROGRAMS as P } from "../src/current-schematic-relevance-modify-return-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyWorkerSource } from "../src/current-schematic-relevance-modify-worker-replies.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("the actual batch tail adds row.length without consuming pend and preserves all unknown descriptors and Symbols", async context => {
 const source = await readConfiguredEasyedaAsset("pro-mgr/3.2.185.bf63a159/js/project-worker.js"); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; } qualifyCurrentSchematicRelevanceModifyWorkerSource(source);
 const realm = createContext({}); const batch = SOURCE.roles.batch;
 runInContext(`let hooks=0,calls=[];const forbidden=()=>{hooks++;throw Error("not invoked")},symbol=Symbol("peer"),row={type:"SCH_PAGE",pend:[["text",7,"TEXT","body"]],[symbol]:-0},cache={page:row},message=[cache,"client","unique","page"],envelope={type:"PUBLISH",uuid:"sender",topic:"/pro-mgr/worker/batchPendData",message},event={},read=[event,envelope],peer={unchanged:true},cm={remoteChange(...args){calls.push(args)}},project={consistencyManager:cm};globalThis.PROJECT=project;
 const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis],qualified=[row,row.pend,row.pend[0],cache,message,envelope,event,peer,cm,project,Object.prototype,Array.prototype,Function.prototype],frame=[project,"page","text","body","TEXT","client",7,0,true,undefined,false,"unique",undefined,"TEXT"],before=(${P.snapshot}).call(I11,qualified);
 const callback=(function(){return(${source.slice(batch.start, batch.end)})}).call(project);callback(message);`, realm);
 assert.equal(runInContext("calls.length", realm), 1); assert.equal(runInContext("row.length", realm), 0); assert.equal(runInContext("row.pend.length", realm), 1);
 assert.throws(() => runInContext(`(${P.same}).call(I11,before,qualified)`, realm));
 assert.equal(runInContext(`(${P.parentDelta}).call(I11,before,qualified,read,frame)`, realm), true);
 runInContext('row[symbol]=0', realm); assert.throws(() => runInContext(`(${P.parentDelta}).call(I11,before,qualified,read,frame)`, realm)); runInContext('row[symbol]=-0;peer.unchanged=false', realm); assert.throws(() => runInContext(`(${P.parentDelta}).call(I11,before,qualified,read,frame)`, realm));
 runInContext('peer.unchanged=true;Object.defineProperty(row,"length",{get:forbidden,configurable:true,enumerable:true})', realm); assert.throws(() => runInContext(`(${P.parentDelta}).call(I11,before,qualified,read,frame)`, realm)); assert.equal(runInContext("hooks", realm), 0);
});

void test("the new batch field is refused before a source assignment can reach an inherited setter or a nonextensible row", () => {
 const realm=createContext({});runInContext(`const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis],extensible=Object.isExtensible,native=Array.from({length:18},()=>undefined);native[15]=extensible;let hooks=0;const row={type:"SCH_PAGE",pend:[]},cache={page:row},message=[cache,"client","unique","page"],envelope={message},event={},read=[event,envelope],frame=[{},"page",null,null,null,null,null,null,null,null,null,null,null,null],qualified=[row,row.pend,cache,message,envelope,event,Object.prototype,Array.prototype,Function.prototype,extensible];const snapshot=()=>(${P.snapshot}).call(I11,qualified);let before=snapshot();`,realm);
 const before=():unknown=>runInContext(`(${P.parentBefore}).call(I11,before,qualified,read,frame,native)`,realm);assert.equal(before(),true);
 runInContext('Object.defineProperty(Object.prototype,"length",{set(){hooks++},configurable:true});before=snapshot()',realm);assert.throws(before);assert.equal(runInContext("hooks",realm),0);runInContext('delete Object.prototype.length;Object.defineProperty(Object.prototype,"length",{value:0,writable:false,configurable:true});before=snapshot()',realm);assert.throws(before);assert.equal(runInContext("hooks",realm),0);runInContext('delete Object.prototype.length;Object.preventExtensions(row);before=snapshot()',realm);assert.throws(before);assert.equal(runInContext('Object.hasOwn(row,"length")',realm),false);
});
