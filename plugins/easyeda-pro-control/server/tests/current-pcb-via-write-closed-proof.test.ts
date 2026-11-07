/** Explicit historical issuer/comparator seams isolate the original-ref
 * custody contract. Actual full SQLite/crypto is covered by its own tests. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";

type Data=Record<string,unknown>;
async function fixture():Promise<Readonly<{qualify:()=>Promise<object>;copyRefused:()=>void;requireProof:(proof:object)=>unknown;complete:()=>void;changeEffects:()=>void;comparisons:()=>number}>>{
  const owner=Object.freeze({explicitHistoricalOwnerSeam:true});const plan=Object.freeze({target:{documentUuid:"d".repeat(32)}});const termination=Object.freeze({explicitOriginalExitSeam:true});
  const snapshot=Object.freeze({sourceSha256:"a".repeat(64)});const before=Object.freeze({explicitBeforeReaderSeam:true});const after=Object.freeze({logicalSha256:"b".repeat(64)});const initial=Object.freeze({inventory:before});const captured=Object.freeze({inventory:after});
  let effects:object=Object.freeze({body:{dataStr:"original body",bodySha256:"c".repeat(64),documentUuid:plan.target.documentUuid,headTicket:5},history:{},structure:{ticket:5}});let comparisons=0;
  const held=Promise.withResolvers<object>();const url=new URL("../src/current-pcb-via-write-closed-proof.ts",import.meta.url);const sourceRequire=createRequire(url);const output=await transform(await readFile(url,"utf8"),{loader:"ts",format:"cjs",target:"node24"});
  const loaded:{exports:Data}={exports:{}};const evaluate:unknown=runInThisContext(`(function(require,module,exports){${output.code}\n})`);assert.ok(typeof evaluate==="function");
  Reflect.apply(evaluate,undefined,[(name:string):unknown=>{
    if(name==="./current-pcb-via-write-owner.ts"){return {originalCurrentPcbViaWriteClosedEffects:(actual:unknown,operation:unknown,exit:unknown):object=>{assert.equal(actual,owner);assert.equal(operation,plan);assert.equal(exit,termination);return effects;}};}
    if(name==="./current-pcb-via-write-plan.ts"){return {requireOriginalCurrentPcbViaWritePlan:(actual:unknown):object=>{assert.equal(actual,plan);return initial;}};}
    if(name==="./current-pcb-via-write-closed-snapshot.ts"){return {requireOriginalCurrentPcbViaWriteClosedSnapshot:(actual:unknown,actor:unknown,operation:unknown):object=>{assert.equal(actual,snapshot);assert.equal(actor,owner);assert.equal(operation,plan);return captured;}};}
    if(name==="./generated-project-closed-sql-delta.ts"){return {compareGeneratedProjectClosedSqlDelta:(source:unknown,closed:unknown,body:unknown):Promise<object>=>{assert.equal(source,before);assert.equal(closed,after);assert.equal(body,"original body");comparisons+=1;return held.promise;}};}
    return sourceRequire(name) as unknown;
  },loaded,loaded.exports]);
  const qualify=loaded.exports["qualifyOriginalCurrentPcbViaWriteClosedSql"];const lookup=loaded.exports["requireOriginalCurrentPcbViaWriteClosedSql"];assert.ok(typeof qualify==="function"&&typeof lookup==="function");
  // Keep the actual issued object separately from the visible inert copy.
  let original:unknown;
  return {qualify:async():Promise<object>=>{original=await Reflect.apply(qualify,undefined,[owner,plan,termination,snapshot]);assert.ok(original!==null&&typeof original==="object");return original;},copyRefused:():void=>{assert.throws(()=>Reflect.apply(qualify,undefined,[owner,{...plan},termination,snapshot]));},requireProof:(proof):unknown=>Reflect.apply(lookup,undefined,[proof,owner,plan]),
    complete:():void=>{held.resolve({afterLogicalSha256:after.logicalSha256,bodySha256:"c".repeat(64),structureSha256:"e".repeat(64)});},changeEffects:():void=>{effects=Object.freeze({...effects});},comparisons:():number=>comparisons};
}
void test("one historical closed comparison retains its original result and rejects copied proof or changed source refs",async()=>{const f=await fixture();f.copyRefused();const first=f.qualify();const second=f.qualify();assert.equal(f.comparisons(),1);f.complete();const proof=await first;assert.equal(await second,proof);assert.equal(Reflect.get(proof,"liveContinuationAuthorized"),false);assert.equal(Reflect.get(proof,"persistenceVerified"),false);assert.notEqual(f.requireProof(proof),undefined);assert.throws(()=>{f.requireProof(structuredClone(proof));});f.changeEffects();assert.throws(()=>{f.requireProof(proof);});await assert.rejects(f.qualify());assert.equal(f.comparisons(),1);});
void test("changed original historical inputs during the pending comparison cannot issue a proof",async()=>{const f=await fixture();const pending=f.qualify();f.changeEffects();f.complete();await assert.rejects(pending,/ORIGINAL_PROOF/u);assert.equal(f.comparisons(),1);});
