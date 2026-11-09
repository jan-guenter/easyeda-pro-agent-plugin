/** Execute pinned original CM/batch bodies in an inert VM, then check only
 * data recipes. This creates no original owner or continuation receipt. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Session } from "node:inspector/promises";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyCmCalleeSource as qualify } from "../src/current-schematic-relevance-modify-cm-callee-source.ts";
import { collectCurrentSchematicRelevanceModifyCmDelta } from "../src/current-schematic-relevance-modify-cm-delta-collector.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_PROGRAMS as P } from "../src/current-schematic-relevance-modify-cm-delta-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as WORKER } from "../src/current-schematic-relevance-modify-worker-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as W } from "../src/current-schematic-relevance-modify-worker-programs.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("original batch→remoteChange→publishChange produces only the exact TEXT node and selected unique-Set deltas", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  qualify(source);
  const methodRoles = ["remoteChange", "getDoctype", "setDoctype", "setMaxTicket", "getUnique", "getIsLocalChange", "getIsPendChange", "setDocMaxTicket", "publishChange"] as const;
  const methods = methodRoles.map(role => { const row = SOURCE.roles[role]; return source.slice(row.start, row.end); }).join("");
  const node = SOURCE.roles.nodeConstructor; const compare = SOURCE.roles.ticketCompare; const batch = WORKER.roles.batch; const order = SOURCE.roles.orderHas;
  const code = `const At=${source.slice(node.start, node.end)};${source.slice(compare.start, compare.end)}class CM{${methods}}class Order{${source.slice(order.start, order.end)}}`;
  const session = new Session(); session.connect(); const contexts = new Map<string, number>();
  session.on("Runtime.executionContextCreated", event => { contexts.set(event.params.context.name, event.params.context.id); });
  await session.post("Runtime.enable");
  try {
  for (const state of ["newNamespace", "newSet", "append", "existing"] as const) {
    const realm = createContext({}, { name: `inert-cm-delta-${state}` });
    runInContext(`${code}let gets=0,args=null,entry=null;const stop={};const page="page",id="text",unique="unique",client="client",body="new TEXT",old={client:"old",ticket:2,dataType:"TEXT",data:"old TEXT"},node={last:old},ids={},symbol=Symbol("peer"),peer={retained:true},docHead={page:{docType:"SCH_PAGE"}},order=new Order;order.numSets={};
      if(${JSON.stringify(state)}!=="newNamespace"){ids[unique]={};if(${JSON.stringify(state)}!=="newSet")ids[unique][page]=new Set(${JSON.stringify(state)}==="existing"?["other",id]:["other"]);}
      const oldNamespace=ids[unique]??null,oldSet=oldNamespace?.[page]??null,callbacks=[(...value)=>{args=value;throw stop}],cm=Object.assign(new CM,{maxTicket:3,docMaxTicket:{page:2},docHead,wDocData:new Map([[page,new Map([[id,node]])]]),uniqueIds:ids,caseInsensitiveTypes:new Set,cacheType:[],getCache:false,needDocIdDoctype:[],orderTree:order,cbArr:callbacks,unique:"worker"}),project={consistencyManager:cm};
      cm[symbol]=peer;Object.defineProperty(cm,"unknown",{get(){gets++;throw Error("unread")},configurable:true});
      const remote=cm.remoteChange;cm.remoteChange=function(...value){entry=[this,...value];while(entry.length<16)entry.push(undefined);entry.push(At,EE);return remote.apply(this,value)};
      const packet=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
      const natives=[Map,Map.prototype,Set,Set.prototype,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Map.prototype.set,Set.prototype.has,Set.prototype.add,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Array.prototype.forEach,Array.prototype.includes,Object.isExtensible,null,null];
      const roots=[cm,node,old,ids,oldNamespace,oldSet,callbacks,project],collections=[cm.wDocData,cm.wDocData.get(page),cm.caseInsensitiveTypes,new Map([["peer",peer]])];if(oldSet)collections.push(oldSet);
      const beforeQualified=[cm,node,old,ids,callbacks,project,docHead,docHead.page,cm.docMaxTicket,order,order.numSets,cm.cacheType,cm.needDocIdDoctype,Object.prototype,Array.prototype,Function.prototype,Map.prototype,Set.prototype,Map.prototype.forEach,Set.prototype.forEach,...collections];if(oldNamespace)beforeQualified.push(oldNamespace);
      const uniqueObjects=[...new Set(beforeQualified)];beforeQualified.length=0;beforeQualified.push(...uniqueObjects);const snapshot=(${W.snapshot}).call(packet,beforeQualified),collectionSnapshot=collections.map(o=>[o,o instanceof Map?"map":"set",[...o].map(value=>o instanceof Map?value:[value])]);
      const cache={page:{type:"SCH_PAGE",pend:[[id,7,"TEXT",body]]}},wire=[cache,client,unique,page];try{(function(){return(${source.slice(batch.start, batch.end)})}).call(project)(wire)}catch(error){if(error!==stop)throw error}if(args===null)throw Error("original callback did not run");const frame=[project,...args];let qualified=[...beforeQualified];`, realm);
    const run = (program: string, args: string): unknown => runInContext(`(${program}).apply(packet,${args})`, realm);
    runInContext(`const fresh=(${P.opaque}).call(packet,frame,roots,entry,qualified);for(const o of fresh)if(!qualified.includes(o))qualified.push(o);const pageSet=(${P.page}).call(packet,roots,entry,fresh,qualified);if(!qualified.includes(pageSet[0]))qualified.push(pageSet[0]);`, realm);
    assert.equal(run(P.descriptors, "[snapshot,beforeQualified,qualified,roots,fresh,pageSet,frame,entry]"), true);
    assert.equal(run(P.collections, "[collections,collectionSnapshot,qualified,roots,pageSet,entry,natives]"), true);
    assert.equal(runInContext('args[8]===undefined&&args[9]===false&&args[12]==="TEXT"&&node.list[0]===old&&node.last.pend===true', realm), true);
    if (state === "newNamespace") {
      const contextId = contexts.get(`inert-cm-delta-${state}`); assert.ok(contextId !== undefined);
      const original = async (expression: string): Promise<string> => { const value = await session.post("Runtime.evaluate", { expression, contextId, returnByValue: false }); assert.ok(value.result.objectId !== undefined); return value.result.objectId; };
      const host: Parameters<typeof collectCurrentSchematicRelevanceModifyCmDelta>[0] = {
        current: (): void => { assert.ok(session !== null); },
        request: (command): Promise<unknown> => {
          if (command.method === "Debugger.evaluateOnCallFrame") { return session.post("Runtime.evaluate", { expression: "frame", contextId, returnByValue: false, throwOnSideEffect: true }); }
          if (command.method === "Runtime.getProperties") { return session.post("Runtime.getProperties", command.params); }
          return session.post("Runtime.callFunctionOn", command.params);
        },
      };
      const result = await collectCurrentSchematicRelevanceModifyCmDelta(host, "inert-frame-data-only", {
        nativeObjectId: await original("packet"), entryFrameObjectId: await original("entry"), qualifiedObjectId: await original("beforeQualified"), snapshotObjectId: await original("snapshot"), collectionsObjectId: await original("collections"), collectionSnapshotObjectId: await original("collectionSnapshot"), nativeMethodsObjectId: await original("natives"), rootsObjectId: await original("roots"),
      });
      assert.equal(result.originalRequests, 34); assert.deepEqual([result.originalReceiverVerified, result.workerCompleted, result.modifyCompleted, result.saveAuthorized], [false, false, false, false]);
    }
    runInContext("cm[symbol]={retained:false}", realm); assert.throws(() => run(P.descriptors, "[snapshot,beforeQualified,qualified,roots,fresh,pageSet,frame,entry]")); runInContext("cm[symbol]=peer", realm);
    runInContext('collections[3].set("unrelated",7)', realm); assert.throws(() => run(P.collections, "[collections,collectionSnapshot,qualified,roots,pageSet,entry,natives]")); assert.equal(runInContext("gets", realm), 0);
  }
  } finally { session.disconnect(); }
});
