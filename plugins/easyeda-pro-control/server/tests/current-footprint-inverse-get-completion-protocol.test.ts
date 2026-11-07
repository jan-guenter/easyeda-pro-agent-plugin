/** Fixed codec/budget and copied-token refusals only; no original owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintInverseGetCompletionBudget,currentFootprintInverseGetCompletionCases,currentFootprintInverseGetCompletionFrame,currentFootprintInverseGetCompletionTemplate,currentFootprintInverseGetCompletionWire,validateCurrentFootprintInverseGetCompletionCommand } from "../src/current-footprint-inverse-get-completion-protocol.ts";
import { requireOriginalCurrentFootprintInverseGetWorkerCompletion } from "../src/current-footprint-inverse-get-completion.ts";

void test("GET completion templates preserve all fixed bytes, role arities, data bounds and original worker selectors",()=>{
 const cases=currentFootprintInverseGetCompletionCases();assert.equal(cases.length,116);
 for(const command of cases){const row=currentFootprintInverseGetCompletionTemplate(command);let text=row.template;
  if(command.method==="Runtime.callFunctionOn"){text=text.replace(JSON.stringify(`__get_complete_program${command.role}__`),JSON.stringify(command.params.functionDeclaration));}
  const wire=currentFootprintInverseGetCompletionWire(command,79,"original_worker");const bytes=Buffer.from(`${JSON.stringify(wire)}\0`);const fields=currentFootprintInverseGetCompletionFrame(bytes,command,"original_worker");
  for(const name of row.names){assert.ok(Object.hasOwn(fields,name));text=text.replace(JSON.stringify(`__get_complete_${name}__`),JSON.stringify(fields[name]));}
  assert.deepEqual(JSON.parse(text),{method:command.method,params:command.params});assert.equal(fields["action"],"footprint-inverse-get-completion");assert.equal(Object.hasOwn(fields,"sessionId"),false);
  assert.throws(()=>currentFootprintInverseGetCompletionFrame(bytes,command,"foreign_worker"));
 }
 const call=cases.find(value=>value.method==="Runtime.callFunctionOn"&&value.role==="input-roots");assert.ok(call!==undefined&&call.method==="Runtime.callFunctionOn");assert.throws(()=>validateCurrentFootprintInverseGetCompletionCommand({...call,params:{...call.params,arguments:[]}}));assert.throws(()=>validateCurrentFootprintInverseGetCompletionCommand({...call,params:{...call.params,functionDeclaration:"function(){return true;}"}}));assert.throws(()=>validateCurrentFootprintInverseGetCompletionCommand({...call,params:{...call.params,throwOnSideEffect:false}}));
 const graph=cases.find(value=>value.method==="Runtime.callFunctionOn"&&value.role==="graph-node");assert.ok(graph!==undefined&&graph.method==="Runtime.callFunctionOn");assert.throws(()=>validateCurrentFootprintInverseGetCompletionCommand({...graph,params:{...graph.params,arguments:[{objectId:"original_ref"},{objectId:"original_ref"},{value:"é"}]}}));
 assert.deepEqual(currentFootprintInverseGetCompletionBudget(3,2),{normal:188,helpers:55,cdpRequests:243,controls:276,events:106});assert.throws(()=>currentFootprintInverseGetCompletionBudget(64,2));assert.throws(()=>currentFootprintInverseGetCompletionBudget(3,0));
});
void test("matching completion labels cannot construct original GET custody or execute accessor callbacks",()=>{
 let reads=0;const copied=Object.freeze({profile:"private.current-footprint-inverse-get-worker-completion.v1"as const});const target=Object.defineProperty({},"profile",{get(){reads+=1;throw new Error("getter invoked");},enumerable:true});
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Intentionally malformed brand supplied only to the refusal boundary; no issuer is exposed.
 assert.throws(()=>requireOriginalCurrentFootprintInverseGetWorkerCompletion(copied,{},target as never));assert.equal(reads,0);
});
