/** Encoder-only parity and exact composition. No native owner or app starts. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCurrentProjectLibraryRefreshNativeFragment,currentProjectLibraryRefreshNativeSource } from "../src/current-project-library-refresh-native.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS as REQUESTS,currentProjectLibraryRefreshCases } from "../src/current-project-library-refresh-protocol.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_OBSERVATION_STEPS as STEPS,currentProjectLibraryRefreshEnvelope,currentProjectLibraryRefreshNativeFrame,currentProjectLibraryRefreshOrder,currentProjectLibraryRefreshTemplate,currentProjectLibraryRefreshWire } from "../src/current-project-library-refresh-wire.ts";

void test("all fixed library packets retain exact selectors and reject copied sessions, fields and trailing bytes",()=>{
 const commands=currentProjectLibraryRefreshCases(),order=currentProjectLibraryRefreshOrder();assert.equal(commands.length,52);assert.equal(order.length,REQUESTS.normal);assert.equal(new Set(order).size,order.length);assert.equal(STEPS.length,order.length);assert.deepEqual(STEPS[9],{phase:"library-refresh-modules"});assert.deepEqual(STEPS[32],{phase:"library-refresh-frame",role:"loopReturned"});assert.deepEqual(STEPS[38],{phase:"library-refresh-frame",role:"mountReturned"});
 for(const command of commands){const row=currentProjectLibraryRefreshTemplate(command),wire=currentProjectLibraryRefreshEnvelope(command,79,"original_worker");const bytes=Buffer.from(`${JSON.stringify(wire)}\0`);
  for(const action of ["footprint-inverse-library-refresh","schematic-relevance-library-refresh"]as const){assert.equal(currentProjectLibraryRefreshWire(command,79,action).request["action"],action);}
  assert.deepEqual(currentProjectLibraryRefreshNativeFrame(bytes,command,"original_worker"),{requestId:79,phase:row.phase,method:row.method,...row.values});
  assert.throws(()=>currentProjectLibraryRefreshNativeFrame(bytes,command,"replacement_worker"));assert.throws(()=>currentProjectLibraryRefreshNativeFrame(Buffer.concat([bytes,Buffer.from([0])]),command,"original_worker"));
  const tampered=Buffer.from(`${JSON.stringify({...wire,scope:"replacement"})}\0`);assert.throws(()=>currentProjectLibraryRefreshNativeFrame(tampered,command,"original_worker"));
  const params:unknown=JSON.parse(row.template);assert.ok(params!==null&&typeof params==="object"&&"method"in params&&params.method===command.method);
 }
});
void test("both purpose fragments share exactly one immutable packed codebook",()=>{
 const base="before\ninternal enum EasyedaPcbViaWriteBirth { Original }\nafter",once=applyCurrentProjectLibraryRefreshNativeFragment(base);assert.equal(applyCurrentProjectLibraryRefreshNativeFragment(once),once);
 const source=currentProjectLibraryRefreshNativeSource();assert.ok(source.includes("EasyedaDiagnosticFixedTable.Load("));assert.ok(source.includes("Order.Length==43"));assert.equal(source.includes("SendMessage("),false);assert.equal(source.includes("Process.Start("),false);
 assert.throws(()=>applyCurrentProjectLibraryRefreshNativeFragment("missing_anchor"));assert.throws(()=>applyCurrentProjectLibraryRefreshNativeFragment(`${once}\n// BEGIN SHARED ORIGINAL LIBRARY REFRESH CODEBOOK`));
});
