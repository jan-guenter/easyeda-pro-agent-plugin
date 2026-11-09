/** Uninvoked complete original classes only. No tab/store/DOM body is run. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_UI_CLASSES as CLASSES, CURRENT_FOOTPRINT_INVERSE_DELETE_UI_METHODS as METHODS, requireCurrentFootprintInverseDeleteUiDescription as description, qualifyCurrentFootprintInverseDeleteUiFunction as qualify, qualifyCurrentFootprintInverseDeleteUiSource } from "../src/current-footprint-inverse-delete-ui-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("original tab/hash/export methods preserve actual source positions and callable metadata",async context=>{
 const full=await readConfiguredEasyedaAsset("pro-ui/3.2.198.2800f583/js/ui.js");if(full===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}qualifyCurrentFootprintInverseDeleteUiSource(full);assert.throws(()=>{ qualifyCurrentFootprintInverseDeleteUiSource(full.replace("me=tt","me=fr")); });
 const s=new Session();s.connect();let count=0;
 try{for(const[name,start,end,parent]of[["tab",CLASSES.tab.start,CLASSES.tab.end,false],["location",CLASSES.location.start,CLASSES.location.end,false],["export",10_850_248,10_856_677,true]]as const){
   const prefix="const __Class=",program=`${full.slice(0,start-prefix.length).replaceAll(/[^\r\n]/gu," ")+prefix+full.slice(start,end)};globalThis.__Class=__Class;`;const realm=createContext(parent?{Xe:class{public readonly marker="uninvoked";}}:{});runInContext(program,realm);const value:unknown=Reflect.get(realm,"__Class");assert.ok(typeof value==="function");
   for(const[key,row]of Object.entries(METHODS)){if(key.startsWith(name)){const fn:unknown=Object.getOwnPropertyDescriptor(row.start<end&&row.start>=start&&name!=="export"?value:Reflect.get(value,"prototype"),row.name)?.value;assert.ok(typeof fn==="function");Object.defineProperty(globalThis,"__inverseUiMethod",{value:fn,configurable:true});const remote=await s.post("Runtime.evaluate",{expression:"__inverseUiMethod",objectGroup:"inert-inverse-ui-source"});assert.ok(remote.result.objectId!==undefined&&remote.result.description!==undefined);const raw=await s.post("Runtime.getProperties",{objectId:remote.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});const point:unknown=raw.internalProperties?.find(p=>p.name==="[[FunctionLocation]]")?.value?.value;assert.ok(point!==null&&typeof point==="object"&&"scriptId"in point&&typeof point.scriptId==="string");assert.ok(Object.hasOwn(METHODS,key));
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Key comes from this exact own immutable source table.
    const role=key as keyof typeof METHODS;description(remote.result.description,role);qualify(raw,role,point.scriptId);assert.throws(()=>qualify(raw,role,"foreign-script"));count+=1;}
   }
  }assert.equal(count,22);
 }finally{Reflect.deleteProperty(globalThis,"__inverseUiMethod");await s.post("Runtime.releaseObjectGroup",{objectGroup:"inert-inverse-ui-source"});s.disconnect();}
});
