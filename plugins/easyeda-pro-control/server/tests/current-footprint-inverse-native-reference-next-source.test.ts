/** Exercises the real full-source callback boundary without issuing native work. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {readCurrentFootprintInverseNativeReferenceNextSource as readSource} from "../src/current-footprint-inverse-native-reference-next-dependencies-collector.ts";

void test("native reference callback accepts both complete pinned schematic source sizes",async()=>{
 for(const bytes of[6_289_622,6_472_538]){
  const order:string[]=[],source="s".repeat(bytes);
  const actual=await readSource({kind:"schematic",current:():void=>{order.push("current");},sourceBound:(scriptId):Promise<void>=>{assert.equal(scriptId,"original-script");order.push("source-bound");return Promise.resolve();},request:(command):Promise<unknown>=>{assert.equal(command.method,"Debugger.getScriptSource");assert.deepEqual(command.params,{scriptId:"original-script"});order.push("request");return Promise.resolve({scriptSource:source});}},"original-script");
  assert.equal(actual,source);assert.deepEqual(order,["current","source-bound","current","request","current"]);
 }
});
void test("native reference source boundary rejects accessors, proxies and invalid or oversized source",async()=>{
 let getterCalls=0;const accessor={get scriptSource():string{getterCalls+=1;return"source";}};
 for(const reply of[accessor,new Proxy({scriptSource:"source"},{}),{scriptSource:"\uD800"},{scriptSource:"s".repeat(6_472_539)},{scriptSource:"é".repeat(3_236_270)}]){
  await assert.rejects(readSource({kind:"schematic",current:():void=>{
   // Inert source-reader fixture owns no native state.
  },sourceBound:():Promise<void>=>Promise.resolve(),request:():Promise<unknown>=>Promise.resolve(reply)},"original-script"));
 }
 assert.equal(getterCalls,0);
});
void test("native reference source reproof refuses drift before request and before decoding",async()=>{
 for(const failAt of[2,3]){
  let currents=0,requests=0;
  await assert.rejects(readSource({kind:"schematic",current:():void=>{currents+=1;if(currents===failAt){throw new Error("original-source-drift");}},sourceBound:():Promise<void>=>Promise.resolve(),request:():Promise<unknown>=>{requests+=1;return Promise.resolve({scriptSource:"source"});}},"original-script"),/original-source-drift/u);
  assert.equal(requests,failAt===2?0:1);
 }
});
