import assert from "node:assert/strict";
import { test } from "node:test";
import { context, expectedActor, expectedWorker, fixture, plan } from "./helpers/project-symbol-worker-fixture.ts";
import { isRecord, sha256Text } from "../src/core.ts";
import { buildSavedSymbolContentExpression as legacy, buildClosedSymbolSavedContentExpression as small } from "../src/saved-symbol-reader.ts";

const INPUT={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,ownerUuid:plan.ownerUuid,targetUuid:plan.targetUuid,
  headerEditVersion:plan.headerEditVersion,maximumTicket:expectedWorker.maxTicket,notBeforeMs:expectedWorker.notBeforeMs,notAfterMs:expectedWorker.notAfterMs};
// These byte pins retain the original 32-character document inputs, independently
// Of the current native 16-character fixture used by the small-reader cases.
const LEGACY_INPUT={projectUuid:"1".repeat(64),branchUuid:"2".repeat(32),ownerUuid:"3".repeat(32),targetUuid:"4".repeat(32),
  headerEditVersion:"3.0",maximumTicket:100,notBeforeMs:1_800_000_000_000,notAfterMs:1_800_000_060_000};
const LEGACY_CONTEXT={project:{uuid:LEGACY_INPUT.projectUuid,path:"/synthetic/project.eprj2"},
  document:{uuid:"5".repeat(32),documentType:3,tabId:`${"5".repeat(32)}@${LEGACY_INPUT.projectUuid}`}};
const GOLDENS = ["7ba61c6e9fa5dee6fdd07cafd4077c7f3bb4b086060ffd560711b392e80785b0","577c5cc0784cca5d1d7b6e611002b8d26737845dc6db2a287adc186660884162","8871b09d32fd2829699b70535b1671b08d66af80935d16b8f3f424483d999d82","65c1c35d2d2db8339327f4bf6849c16610a697d854c3e16356023d8a55076486","d58a5bef2faccb06503db11dddd9637024cfaef818760cd47c379aae7fdd1654","ce73fa7c811ea6da715f2809d8897eaa91b71472cb952036e27a852528cae4e2","80a4d58ac1e025f21c1f1b33e33f1c91643228b85fb00c3160b0e0d60c0c2177","eb62238c35f6fb31b5e05429181c929c88b6eb574fcfafc7f4c0e6f192b3db22","9362d9ac545f8a3336c4a2b40786e42b3b235022293a6a8564da99c220a1c081"];
for(const maximumTicket of[0,100,Number.MAX_SAFE_INTEGER-1]){for(const headerEditVersion of[null,"3.0","v".repeat(128)]){
  void test(`legacy observer bytes unchanged ticket${maximumTicket} version${String(headerEditVersion)}`,()=>{
    const input={...LEGACY_INPUT,maximumTicket,headerEditVersion};assert.equal(sha256Text(legacy(input,LEGACY_CONTEXT,expectedActor)),GOLDENS[[0,100,Number.MAX_SAFE_INTEGER-1].indexOf(maximumTicket)*3+[null,"3.0","v".repeat(128)].indexOf(headerEditVersion)]);
  });
}}
for(const [name,content,allowed]of[
  ["ASCII exact", "x".repeat(65_536), true], ["ASCII over", "x".repeat(65_537), false],
  ["two-byte exact", "Ω".repeat(32_768), true], ["two-byte over", "Ω".repeat(32_769), false],
  ["four-byte exact", "😀".repeat(16_384), true], ["four-byte over", "😀".repeat(16_385), false],
]as const){
  void test(`fixed small observer ${name}`,async()=>{
    const state=fixture();const bus=state.host["messageBus"];assert.ok(isRecord(bus));const original=bus["rpcCall"];assert.ok(typeof original==="function");let reads=0;
    bus["rpcCall"]=async function rpcCall(this:unknown,topic:string,args:unknown[]):Promise<unknown>{
      if(topic!=="/PrjDB/symbol/getStr"){const returned:unknown=await Reflect.apply(original,this,[topic,args]);return returned;}
      reads+=1;return{message:content};
    };
    const result=state.run(small(INPUT,context,expectedActor));
    if(allowed){const returned:unknown=await result;assert.ok(isRecord(returned));assert.equal(returned["content"],content);}
    else{await assert.rejects(result,/SAVED_SYMBOL_OUTPUT/u);}
    assert.equal(reads,1);assert.equal(state.updates,0);
  });
}
void test("small bound is compiled fixed, not a caller-selected field",()=>{
  assert.ok(small(INPUT,context,expectedActor).includes("content.length>65536"));
  assert.ok(legacy(INPUT,context,expectedActor).includes("content.length>8388608"));
  const expanded={...INPUT,maximumBytes:8_388_608};assert.throws(()=>small(expanded,context,expectedActor),/INPUT/u);
});
