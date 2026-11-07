/** Complete eager constructor source + inert VM relations. No original
 * process, native encoder scope, clock, delete or upload is authorized. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_CLASSES as CLASSES, CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_FIELDS as FIELDS, qualifyCurrentFootprintInverseDeleteEncoderSource } from "../src/current-footprint-inverse-delete-encoder-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_ENTRY_EXPRESSION as ENTRY, CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-delete-encoder-programs.ts";

const installed="/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
async function source():Promise<string|null>{try{return await readFile(installed,"utf8");}catch(error){if(error!==null&&typeof error==="object"&&"code"in error&&error.code==="ENOENT"){return null;}throw error;}}
function fixture(full:string):vm.Context{
 const context=vm.createContext({});const constructors=CLASSES.toSorted((left,right)=>left.start-right.start).map(row=>`const ${row.name}=${full.slice(row.start,row.end)};`).join("\n");
 vm.runInContext(`"use strict";${constructors}
let clockCalls=0;async function qe(){clockCalls++;throw new Error("clock invoked");}const functions=Array.from({length:28},()=>function(){});functions[11]=Ke;functions[12]=rl;functions[13]=of;functions[23]=qe;const project={},manager={};globalThis.PROJECT=project;const state=[project,{},manager,{}, {},"a".repeat(16),19,"b".repeat(16),{}],original=Object.freeze([Object.freeze(functions),Object.freeze(state),()=>true,Object.freeze({})]);
const scope={object:{${FIELDS.map(row=>row.constructor).join(",")}}};const captured=(${PROGRAMS.capture}).call(scope,original),value=new Ke(),rows=[];const entry=[manager,"b".repeat(16),value,rows,qe];`,context);return context;
}
void test("all eighteen pinned classes close the fourteen eager constructor graph before any clock",async context=>{
 const full=await source();if(full===null){context.skip("installed source unavailable");return;}const qualified=qualifyCurrentFootprintInverseDeleteEncoderSource(full);assert.equal(qualified.sourceClassCount,18);assert.equal(qualified.eagerInstances,14);assert.equal(qualified.originalNativeScopesVerified,false);assert.equal(qualified.deleteInvocationAuthorized,false);assert.throws(()=>qualifyCurrentFootprintInverseDeleteEncoderSource(`${full} `));
 const f=fixture(full);const rows:unknown=vm.runInContext(`JSON.stringify(Object.keys(value).map(name=>({field:name,constructor:Object.getOwnPropertyDescriptor(Object.getPrototypeOf(value[name]),"constructor").value.name,docType:value[name].doctype})))`,f);assert.equal(rows,JSON.stringify(FIELDS));assert.equal(vm.runInContext("clockCalls",f),0);assert.equal(FIELDS.find(row=>row.field==="footprint")?.constructor,"rN");assert.equal(FIELDS.find(row=>row.field==="blob")?.constructor,"rl");
});
void test("fresh scope derives unavailable parents and actual Ke instance relations without constructing or calling in the leaf",async context=>{
 const full=await source();if(full===null){context.skip("installed source unavailable");return;}const f=fixture(full);assert.equal(vm.runInContext("Object.keys(scope.object).length",f),14);for(const name of ["Ke","of","th","Fo"]){assert.equal(vm.runInContext(`Object.hasOwn(scope.object,${JSON.stringify(name)})`,f),false);}
 assert.equal(vm.runInContext(`(${PROGRAMS.reprove}).call(scope,original,captured)`,f),true);assert.equal(vm.runInContext(`const bound=(${PROGRAMS.instance}).call(entry,original,captured);bound.length===5&&Object.isFrozen(bound)`,f),true);assert.equal(vm.runInContext("clockCalls",f),0);assert.equal(ENTRY,"[this,s,r,i,qe]");
 vm.runInContext("value.footprint.doctype='PCB'",f);assert.throws(()=>vm.runInContext("bound[4]()",f));assert.equal(vm.runInContext("clockCalls",f),0);
 for(const change of ["scope.object.rN=class rN{}","Object.defineProperty(value.footprint,'doctype',{get(){clockCalls++;throw new Error('getter')},configurable:true})","Object.setPrototypeOf(value.footprint,rl.prototype)","entry[4]=async function(){}"]){const altered=fixture(full);vm.runInContext(change,altered);assert.throws(()=>vm.runInContext(`(${PROGRAMS.reprove}).call(scope,original,captured);(${PROGRAMS.instance}).call(entry,original,captured)`,altered));assert.equal(vm.runInContext("clockCalls",altered),0);}
});
