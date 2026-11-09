/** Genuine factory gates only; no application or native owner is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeCurrentFootprintInverseLibraryRefreshIntent,enrollCurrentFootprintInverseLibraryRefreshIntent,requireOriginalCurrentFootprintInverseLibraryRefreshIntent } from "../src/current-footprint-inverse-library-refresh-intent.ts";
import { CurrentFootprintInverseNativeOwner } from "../src/current-footprint-inverse-native-owner.ts";

void test("copied inverse library-loop intent and owners refuse before inspecting caller data",()=>{
 let reads=0;const trap=():never=>{reads+=1;throw new Error("caller getter");};const token=Object.freeze({profile:"private.current-footprint-inverse-library-refresh-intent.v1"});const fake=Object.defineProperty({},"prepared",{get:trap});const proxy=new Proxy({},{get:trap,getPrototypeOf:trap});
 for(const owner of [fake,proxy,Object.create(CurrentFootprintInverseNativeOwner.prototype)]){
  // oxlint-disable-next-line typescript/unbound-method -- Deliberately invalid receivers exercise the actual private original-factory gate.
  assert.throws(()=>Reflect.apply(CurrentFootprintInverseNativeOwner.prototype.prepareFootprintInverseLibraryRefreshIntent,owner,[]));
  for(const consume of [consumeCurrentFootprintInverseLibraryRefreshIntent,enrollCurrentFootprintInverseLibraryRefreshIntent,requireOriginalCurrentFootprintInverseLibraryRefreshIntent]){assert.throws(()=>Reflect.apply(consume,undefined,[token,owner,fake]));}
 }
 assert.equal(reads,0);
});
