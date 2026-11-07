/** Real private plan issuer and authenticated history decode. Original native
 * factory/reader identities are explicit inert seams; no app or SQL runs. */
import assert from "node:assert/strict";
import { createCipheriv } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { gzipSync } from "node:zlib";
import { transform } from "esbuild";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { viaLiveHistoryCacheInput } from "./helpers/via-live-history-cache-data.ts";

async function fixture(mode: "append" | "mutable", delayed = false): Promise<Readonly<{
  owner: object; plan: object; entered: Promise<null>; finish: () => void; drift: () => void;
  prepare: (owner: object, plan: object) => Promise<unknown>; lookup: (token: unknown, owner: object, plan: object) => unknown;
}>> {
  const input=viaLiveHistoryCacheInput(mode);const cipher=createCipheriv("aes-128-gcm",Buffer.from(input.effects.keyHex,"hex"),Buffer.from(input.effects.historyUuid,"hex"));
  // oxlint-disable-next-line node/no-sync -- Bounded inert bytes, with the source's actual gzip/GCM framing.
  const compressed=gzipSync(Buffer.from(input.plaintext),{level:1}),encrypted=Buffer.concat([cipher.update(compressed),cipher.final(),cipher.getAuthTag()]);
  const effects=Object.freeze({...input.effects,dataBase64:encrypted.toString("base64")});const delta=Object.freeze({dataStr:input.body,bodySha256:input.effects.bodySha256});const workerValue=Object.freeze({body:input.body,clock:input.clock});
  let changed=false;const entered=Promise.withResolvers<null>(),gate=Promise.withResolvers<null>();
  const inventory=Object.freeze({logicalSha256:input.initial.initialLogicalSha256}),original=Object.freeze({inventory,qualification:{sourceSha256:input.initial.initialSourceSha256}});
  const plan=Object.freeze({initialLogicalSha256:inventory.logicalSha256,target:{projectUuid:input.projectUuid,branchUuid:input.branchUuid,documentUuid:input.documentUuid}});
  const owner=Object.freeze({requireViaHistorySqlEffects:()=>effects,requireViaLiveHistoryRows:()=>input.native,requireViaInitialCacheData:()=>input.initial,requireViaInitialBranchData:()=>input.initialBranch,
    requireViaLiveHistoryBody:()=>({delta:changed?{...delta}:delta,workerValue,clock:input.clock})});
  const url=new URL("../src/current-pcb-via-live-history-cache-plan.ts",import.meta.url);const local=createRequire(url);const compiled=await transform(await readFile(url,"utf8"),{loader:"ts",format:"cjs",target:"node24"});
  const loaded:{exports:Record<string,unknown>}={exports:{}};const evaluate:unknown=runInThisContext(`(function(require,module,exports){${compiled.code}\n})`);assert.ok(typeof evaluate==="function");
  Reflect.apply(evaluate,undefined,[(name:string):unknown=>{
    if(name==="./current-pcb-via-write-owner.ts"){return{assertOriginalCurrentPcbViaWriteOwner:(actual:unknown):void=>{assert.equal(actual,owner);}};}
    if(name==="./current-pcb-via-write-plan.ts"){return{requireOriginalCurrentPcbViaWritePlan:(actual:unknown):object=>{assert.equal(actual,plan);return original;}};}
    if(name==="./sqlite-inventory.ts"){return{readerCompletion:(actual:unknown):object=>{assert.equal(actual,inventory);return{exitCode:0};}};}
    if(name==="./native-history.ts"){return{decodeNativeHistoryChunk:async(value:Parameters<typeof decodeNativeHistoryChunk>[0]):Promise<string>=>{entered.resolve(null);if(delayed){await gate.promise;}return decodeNativeHistoryChunk(value);}};}
    return local(name)as unknown;
  },loaded,loaded.exports]);
  const prepare=loaded.exports["prepareCurrentPcbViaLiveHistoryCachePlan"];const lookup=loaded.exports["requireOriginalCurrentPcbViaLiveHistoryCachePlan"];assert.ok(typeof prepare==="function"&&typeof lookup==="function");
  return{owner,plan,entered:entered.promise,finish:():void=>{gate.resolve(null);},drift:():void=>{changed=true;},prepare:(actor,operation):Promise<unknown>=>{const value:unknown=Reflect.apply(prepare,undefined,[actor,operation]);assert.ok(value instanceof Promise);return value;},lookup:(token,actor,operation):unknown=>Reflect.apply(lookup,undefined,[token,actor,operation])};
}
void test("both real cipher paths issue only the original live plan and retain the same preparation Promise",async()=>{
  for(const mode of ["mutable","append"]as const){const f=await fixture(mode);assert.throws(()=>f.prepare({...f.owner},f.plan));assert.throws(()=>f.prepare(f.owner,{...f.plan}));
    const pending=f.prepare(f.owner,f.plan);assert.equal(f.prepare(f.owner,f.plan),pending);const token=await pending;const data:unknown=f.lookup(token,f.owner,f.plan);assert.ok(data!==null&&typeof data==="object");assert.equal(Reflect.get(data,"mode"),mode);assert.equal(Reflect.get(data,"cacheContinuationAuthorized"),false);
    assert.ok(token!==null&&typeof token==="object");assert.throws(()=>f.lookup({...token},f.owner,f.plan));assert.throws(()=>f.lookup(token,{...f.owner},f.plan));
    f.drift();assert.throws(()=>f.lookup(token,f.owner,f.plan),/LIVE_HISTORY_CACHE_ORIGINAL/u);
  }
});
void test("a changed original body reference during actual history decode cannot issue or refund the plan",async()=>{
  const f=await fixture("append",true);const pending=f.prepare(f.owner,f.plan);await f.entered;f.drift();f.finish();await assert.rejects(pending,/LIVE_HISTORY_CACHE_ORIGINAL/u);assert.equal(f.prepare(f.owner,f.plan),pending);await assert.rejects(pending);
  assert.throws(()=>f.lookup({profile:"private.current-pcb-via-live-history-cache-plan.v1"},f.owner,f.plan),/LIVE_HISTORY_CACHE_ORIGINAL/u);
});
