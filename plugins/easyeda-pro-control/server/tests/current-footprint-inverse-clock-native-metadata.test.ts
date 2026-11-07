/** Actual V8 native metadata only. No browser/channel, app or native owner. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { currentFootprintInverseClockNativeCallable,qualifyCurrentFootprintInverseClockDateConstructor,qualifyCurrentFootprintInverseClockNativeFunction,qualifyCurrentFootprintInverseClockPromiseConstructor } from "../src/current-footprint-inverse-clock-native-metadata.ts";

void test("actual V8 Promise/Date packets and used methods qualify without clock or channel invocation",async()=>{
 const session=new Session();session.connect();try{
  const properties=async(expression:string,role?:"Promise"|"Date"|number):Promise<unknown>=>{const value=await session.post("Runtime.evaluate",{expression,returnByValue:false,objectGroup:"inert-clock-native-metadata"});assert.equal(value.exceptionDetails,undefined);assert.ok(value.result.objectId!==undefined);if(role!==undefined){assert.equal(currentFootprintInverseClockNativeCallable({result:value.result},role),value.result.objectId);}return session.post("Runtime.getProperties",{objectId:value.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});};
  const date=await properties("Date","Date"),promise=await properties("Promise","Promise");qualifyCurrentFootprintInverseClockPromiseConstructor(promise);qualifyCurrentFootprintInverseClockDateConstructor(date);
  for(const[expression,slot]of[["Promise.resolve",5],["Promise.prototype.then",6],["Promise.prototype.catch",7],["Promise.prototype.finally",8],["Object.getOwnPropertyDescriptor(Promise,Symbol.species).get",9],["Date.now",11]]as const){qualifyCurrentFootprintInverseClockNativeFunction(await properties(expression,slot),slot);}
  const shim=await properties("BroadcastChannel");assert.throws(()=>{qualifyCurrentFootprintInverseClockNativeFunction(shim,0);});assert.throws(()=>{qualifyCurrentFootprintInverseClockPromiseConstructor(date);});assert.throws(()=>{qualifyCurrentFootprintInverseClockDateConstructor(promise);});
  const fake=await properties('(globalThis.__inverseNativeGetterCalls=0,(()=>{function Promise(executor){};Object.defineProperty(Promise,Symbol.species,{get(){globalThis.__inverseNativeGetterCalls++;return Promise}});return Promise;})())');assert.throws(()=>{qualifyCurrentFootprintInverseClockPromiseConstructor(fake);});const count=await session.post("Runtime.evaluate",{expression:"globalThis.__inverseNativeGetterCalls",returnByValue:true});assert.equal(count.result.value,0);await session.post("Runtime.evaluate",{expression:"delete globalThis.__inverseNativeGetterCalls"});
  await session.post("Runtime.releaseObjectGroup",{objectGroup:"inert-clock-native-metadata"});
 }finally{session.disconnect();}
});
void test("constructor metadata rejects accessor packets before reading caller fields",()=>{
 assert.throws(()=>currentFootprintInverseClockNativeCallable({result:{type:"function",className:"Function",description:"function Object() { [native code] }",objectId:"foreign-native-alias"}},"Date"));let reads=0;const input=Object.defineProperty({},"result",{enumerable:true,get(){reads+=1;return[];}});assert.throws(()=>{qualifyCurrentFootprintInverseClockPromiseConstructor(input);});assert.throws(()=>{qualifyCurrentFootprintInverseClockDateConstructor(input);});assert.equal(reads,0);
});
