/** Supplied expected data and bounds only. No original owner or native query. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {currentFootprintInverseReferenceExpected as expected} from "../src/current-footprint-inverse-reference-worker-observer.ts";
import {CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_MAXIMUM as MAXIMUM,currentFootprintInverseReferenceWorkerBudget as budget} from "../src/current-footprint-inverse-reference-worker-protocol.ts";

const uuid="01234567-0123-4567-89ab-0123456789ab";
function supplied():Readonly<{job:object;packet:Record<string,unknown>}>{const packet:Record<string,unknown>={message:undefined,replyTopic:"_MSG_BUS_RPC_-readonly-reference-test-1"};const job={kind:"pcb-all",footprintUuid:"a".repeat(32),replyTopic:packet["replyTopic"],nativeOrigin:"",nativeEnvelope:{type:"IGIVE",uuid,topic:"/mgr/projectWorker/pcb/getAllArrData",id:7,target:uuid,message:packet}};return{job,packet};}
void test("a present undefined native message is transported as an explicit tag; missing/null/getters refuse",()=>{
 const good=supplied();const text:unknown=Reflect.apply(expected,undefined,[good.job]);assert.equal(typeof text,"string");assert.match(String(text),/"message":\{"kind":"undefined"\}/u);assert.ok(Object.hasOwn(good.packet,"message"));
 const missing=supplied();Reflect.deleteProperty(missing.packet,"message");assert.throws(()=>Reflect.apply(expected,undefined,[missing.job]));const nullValue=supplied();nullValue.packet["message"]=null;assert.throws(()=>Reflect.apply(expected,undefined,[nullValue.job]));const getter=supplied();let calls=0;Object.defineProperty(getter.packet,"message",{get:()=>{calls+=1;},enumerable:true});assert.throws(()=>Reflect.apply(expected,undefined,[getter.job]));assert.equal(calls,0);
});
void test("fixed per-graph census yields exact bounded native costs",()=>{assert.equal(MAXIMUM.cdpRequests,1684);assert.equal(MAXIMUM.controls,1752);for(let count=1;count<=4;count+=1){for(let sum=count;sum<=63*count;sum+=1){const values=Array.from({length:count},()=>1);let remaining=sum-count;for(let index=0;index<values.length;index+=1){const take=Math.min(62,remaining);values[index]=1+take;remaining-=take;}assert.equal(remaining,0);const value=budget(values);assert.equal(value.entryNormal,21+count);assert.equal(value.queryNormal,101+2*count);assert.equal(value.cdpRequests,580+24*count+4*sum);assert.equal(value.controls,value.cdpRequests+68);}}for(const values of[[],[0],[64],[1.5],[Number.NaN],[-0],[1,1,1,1,1]]){assert.throws(()=>budget(values));}});
