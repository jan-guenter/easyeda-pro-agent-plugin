/** Descriptor-only program checks. Synthetic methods throw if invoked; this
 * fixture supplies no native metadata, owner, callback or bootstrap authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_PROGRAMS as PROGRAMS, currentFootprintInverseNoPublicationCases, validateCurrentFootprintInverseNoPublicationCommand } from "../src/current-footprint-inverse-no-publication-programs.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_SELECTOR } from "../src/current-pcb-string-worker-gate-program.ts";

function fixture():Readonly<{run:(source:string)=>unknown}>{
  const context=createContext({});runInContext(`let calls=0;class Gd{isReadOnly(){calls++;throw Error('not invoked');}get isV2Format(){calls++;throw Error('not invoked');}set isV2Format(value){calls++;throw Error('not invoked');}}class Lg extends Gd{};globalThis.PROJECT=new Lg();`,context);
  return Object.freeze({run:(source:string):unknown=>runInContext(source,context)});
}
void test("actual selected method/getter references are captured and reproved without any application invocation",()=>{
  const f=fixture();f.run(`const original=(${PROGRAMS.capture}).call(PROJECT);`);assert.equal(f.run("original.length"),2);assert.equal(f.run(`(${PROGRAMS.reprove}).call(PROJECT,original)`),true);assert.equal(f.run("calls"),0);
  assert.equal(PROGRAMS.capture.includes('const bus='),false);assert.ok(CURRENT_PCB_STRING_WORKER_GATE_SELECTOR.includes('const bus='));
});
void test("method/getter replacement and own shadow/accessor refuse without invoking a method or getter",()=>{
  for(const mutation of ['Gd.prototype.isReadOnly=function(){}','Object.defineProperty(Gd.prototype,"isV2Format",{get(){calls++;throw Error("get")},set(value){},configurable:true})','Object.defineProperty(PROJECT,"isReadOnly",{get(){calls++;throw Error("get")}})','Object.setPrototypeOf(PROJECT,{})']){
    const f=fixture();f.run(`const original=(${PROGRAMS.capture}).call(PROJECT);`);f.run(mutation);assert.throws(()=>f.run(`(${PROGRAMS.reprove}).call(PROJECT,original)`));assert.equal(f.run("calls"),0);
  }
});
void test("readonly gate grammar accepts only its two fixed programs and three metadata roles",()=>{
  const cases=currentFootprintInverseNoPublicationCases();assert.equal(cases.length,5);
  for(const command of cases){assert.deepEqual(validateCurrentFootprintInverseNoPublicationCommand(command),command);assert.throws(()=>validateCurrentFootprintInverseNoPublicationCommand({...command,method:"Debugger.resume"}));
    if(command.method==="Runtime.callFunctionOn"){assert.throws(()=>validateCurrentFootprintInverseNoPublicationCommand({...command,params:{...command.params,functionDeclaration:"function(){return true;}",throwOnSideEffect:false}}));}}
});
