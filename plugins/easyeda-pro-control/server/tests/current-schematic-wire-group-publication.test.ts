/** Original worker batch/CM execution against inert data. This grants no
 * renderer upload origin, worker ownership, pending-node issuer or Save proof. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyCmCalleeSource as qualify } from "../src/current-schematic-relevance-modify-cm-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as WORKER } from "../src/current-schematic-relevance-modify-worker-replies.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("original GROUP-shaped worker batch retains pending WIRE and ATTR nodes even when only LINE data differs", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; } qualify(source);
  const methodRoles = ["remoteChange", "getDoctype", "setDoctype", "setMaxTicket", "getUnique", "getIsLocalChange", "getIsPendChange", "setDocMaxTicket", "publishChange"] as const;
  const methods = methodRoles.map(role => { const row = SOURCE.roles[role]; return source.slice(row.start, row.end); }).join("");
  const node = SOURCE.roles.nodeConstructor; const compare = SOURCE.roles.ticketCompare; const batch = WORKER.roles.batch; const order = SOURCE.roles.orderHas;
  const realm = createContext({});
  runInContext(`const At=${source.slice(node.start, node.end)};${source.slice(compare.start, compare.end)}class CM{${methods}}class Order{${source.slice(order.start, order.end)}}
const page="page",client="ui-client",unique="ui-unique",published=[],order=new Order;order.numSets={};
const before={wire:'{"type":"wire","locked":false}',line:'{"startX":0,"startY":0,"endX":100,"endY":0}',attr:'{"key":"Relevance","value":"[]","parentId":"wire"}'},after={...before,line:'{"startX":20,"startY":30,"endX":120,"endY":30}'},types={wire:"WIRE",line:"LINE",attr:"ATTR"},ids=["wire","line","attr"],oldRows=ids.map((id,index)=>({client:"baseline",ticket:index+1,dataType:types[id],data:before[id]})),nodes=oldRows.map(last=>({last})),peer={last:{client:"peer",ticket:4,dataType:"TEXT",data:"retained"}},doc=new Map([...ids.map((id,index)=>[id,nodes[index]]),["peer",peer]]);
const cm=Object.assign(new CM,{maxTicket:10,docMaxTicket:{page:10},docHead:{page:{docType:"SCH_PAGE"}},wDocData:new Map([[page,doc]]),uniqueIds:{},caseInsensitiveTypes:new Set,cacheType:[],getCache:false,needDocIdDoctype:[],orderTree:order,cbArr:[(...args)=>published.push(args)],unique:"worker",isLocalChange:true,isPendChange:true}),project={consistencyManager:cm};
const packet=[{page:{type:"SCH_PAGE",pend:ids.map((id,index)=>[id,11+index,types[id],after[id]])}},client,unique,page];
(function(){return(${source.slice(batch.start, batch.end)})}).call(project)(packet);
globalThis.result={maximum:cm.maxTicket,docMaximum:cm.docMaxTicket.page,publications:published.map(args=>({id:args[1],data:args[2],type:args[3]})),nodes:ids.map((id,index)=>({id,data:doc.get(id).last.data,type:doc.get(id).last.dataType,pend:doc.get(id).last.pend,ticket:doc.get(id).last.ticket,oldRetained:doc.get(id).list[0]===oldRows[index],length:At.getLength(doc.get(id))})),samePeer:doc.get("peer")===peer,uniqueIds:[...cm.uniqueIds[unique][page]],unchangedPeers:before.wire===after.wire&&before.attr===after.attr};`, realm);
  const actual: unknown = runInContext("result", realm); assert.ok(actual !== null && typeof actual === "object");
  assert.equal(Reflect.get(actual, "maximum"), 13); assert.equal(Reflect.get(actual, "docMaximum"), 10); assert.equal(Reflect.get(actual, "samePeer"), true); assert.equal(Reflect.get(actual, "unchangedPeers"), true);
  const rows: unknown = Reflect.get(actual, "nodes"); const publications: unknown = Reflect.get(actual, "publications"); assert.ok(Array.isArray(rows) && Array.isArray(publications)); assert.equal(rows.length, 3); assert.equal(publications.length, 3);
  for (const [index, value] of rows.entries()) { assert.ok(value !== null && typeof value === "object"); assert.equal(Reflect.get(value, "ticket"), 11 + index); assert.equal(Reflect.get(value, "pend"), true); assert.equal(Reflect.get(value, "oldRetained"), true); assert.equal(Reflect.get(value, "length"), 2); }
  assert.deepEqual(structuredClone(Reflect.get(actual, "uniqueIds")), ["wire", "line", "attr"]);
});
