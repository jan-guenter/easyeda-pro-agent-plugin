/** Actual pinned declarations on an inert graph. This proves paused stack
 * and packet identity only; no EasyEDA process/native job token is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { buildCurrentFootprintInverseDeleteJobInertSource as inertSource,CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_INERT_INSPECTOR as inspect,CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_INERT_SOURCE_PATH as installed } from "./fixtures/current-footprint-inverse-delete-job-fixture.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_TOPIC as TOPIC,qualifyCurrentFootprintInverseDeleteRpcSource } from "../src/current-footprint-inverse-delete-rpc-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_EXPRESSION as EXPRESSION,CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-delete-job-programs.ts";
import { currentFootprintInverseDeleteNativeEventFrame } from "../src/current-footprint-inverse-delete-native-event-replies.ts";
import { qualifyCurrentFootprintInverseDeleteNativeEventSource } from "../src/current-footprint-inverse-delete-native-event-source.ts";
import { currentFootprintInverseDeleteJobFrame } from "../src/current-footprint-inverse-delete-job-replies.ts";

void test("actual strict worker callback stack reaches before-qe and binds only its original forwarded packet",async context=>{
 let full:string;try{full=await readFile(installed,"utf8");}catch(error){if(error!==null&&typeof error==="object"&&"code"in error&&error.code==="ENOENT"){context.skip("installed source unavailable");return;}throw error;}qualifyCurrentFootprintInverseDeleteRpcSource(full);const worker=new Worker(inspect,{eval:true,workerData:{source:inertSource(full),expression:EXPRESSION,programs:PROGRAMS,replyTopic:"_MSG_BUS_RPC_-original-forwarded-delete-job-1"}});
 try{
  // oxlint-disable-next-line promise/avoid-new -- Worker events are the real paused-Inspector completion boundary.
  const result:unknown=await new Promise((resolve,reject)=>{worker.once("message",resolve);worker.once("error",reject);worker.once("exit",code=>{if(code!==0){reject(new Error("inert Inspector worker exited"));}});});assert.ok(result!==null&&typeof result==="object"&&!("error"in result),JSON.stringify(result));assert.ok("scriptId"in result&&typeof result.scriptId==="string"&&"point"in result&&typeof result.point==="string"&&"event"in result&&"result"in result);assert.deepEqual(result.result,{same:true,foreignRefused:true,clockCalls:0});const point=result.point,scriptId=result.scriptId;const event={method:"Debugger.paused",sessionId:"original-worker",params:result.event};assert.equal(typeof currentFootprintInverseDeleteJobFrame(event,"original-worker",scriptId,point),"string");assert.throws(()=>currentFootprintInverseDeleteJobFrame(event,"foreign-worker",scriptId,point));const serialized=JSON.stringify(event),shifted=serialized.replace('"columnNumber":8431','"columnNumber":8432');assert.notEqual(shifted,serialized);const wrong:unknown=JSON.parse(shifted);assert.throws(()=>currentFootprintInverseDeleteJobFrame(wrong,"original-worker",scriptId,point));
 }finally{await worker.terminate();for(const key of["PROJECT","self","inverseJobInert"]){Reflect.deleteProperty(globalThis,key);}}
});

void test("actual pinned native callback path retains the MessageEvent caller frame before qe",async context=>{
 let full:string;try{full=await readFile(installed,"utf8");}catch(error){if(error!==null&&typeof error==="object"&&"code"in error&&error.code==="ENOENT"){context.skip("installed source unavailable");return;}throw error;}qualifyCurrentFootprintInverseDeleteNativeEventSource(full);const worker=new Worker(inspect,{eval:true,workerData:{source:inertSource(full,true),nativeCallback:true,topic:TOPIC,expression:EXPRESSION,programs:PROGRAMS,replyTopic:"_MSG_BUS_RPC_-original-forwarded-delete-job-2"}});
 try{
  // oxlint-disable-next-line promise/avoid-new -- Actual paused Inspector returns the original callback stack.
  const result:unknown=await new Promise((resolve,reject)=>{worker.once("message",resolve);worker.once("error",reject);worker.once("exit",code=>{if(code!==0){reject(new Error("inert native callback worker exited"));}});});assert.ok(result!==null&&typeof result==="object"&&!("error"in result),JSON.stringify(result));assert.ok("event"in result&&"result"in result&&"scriptId"in result&&typeof result.scriptId==="string"&&"point"in result&&typeof result.point==="string");assert.deepEqual(result.result,{same:true,foreignRefused:true,clockCalls:0});const point=result.point,scriptId=result.scriptId;const event={method:"Debugger.paused",sessionId:"original-worker",params:result.event};assert.equal(typeof currentFootprintInverseDeleteNativeEventFrame(event,"original-worker",scriptId,point),"string");const raw=JSON.stringify(event),shifted=raw.replace('"columnNumber":11794','"columnNumber":11795');assert.notEqual(shifted,raw);const changed:unknown=JSON.parse(shifted);assert.throws(()=>currentFootprintInverseDeleteNativeEventFrame(changed,"original-worker",scriptId,point));
 }finally{await worker.terminate();for(const key of["PROJECT","self","inverseJobInert"]){Reflect.deleteProperty(globalThis,key);}}
});
