/** Data preparation/refusal checks allocate no native owner or application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { createCurrentFootprintForwardWriterHeadInput, currentFootprintForwardWriterHeadInputBirthOptions, currentFootprintForwardWriterHeadInputRequestSchema,
  currentFootprintForwardWriterHeadInputStatus, prepareCurrentFootprintForwardWriterHeadInput,
  requireCurrentFootprintForwardWriterHeadInput } from "../src/current-footprint-forward-writer-head-input.ts";
import { currentFootprintForwardWriterBirthOutcome, startCurrentFootprintForwardWriterNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";

function request(): unknown {
  const rawWindowsPath=String.raw`C:\Synthetic\validation.eprj2`;
  return {operationId:"footprint-forward-writer-head-test",target:{rawWindowsPath,projectUuid:sha256Text(rawWindowsPath),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)},
    footprintUuid:"e".repeat(16),confirmDisposableProject:true,acceptExistingProfileEffects:true,acceptNormalOpenEffects:true,acceptDebuggerPauseEffects:true};
}
function options(other:()=>Promise<void>=():Promise<void>=>Promise.resolve()):CurrentPcbDiagnosticLifecycleOptions {
  return Object.freeze({pluginRoot:"/synthetic-missing-plugin",assetsRoot:"/synthetic-missing-assets",powershellSha256:"a".repeat(64),powershellBytes:1,
    assertAllowed:():Promise<void>=>Promise.resolve(),assertLocalAllowed:():void=>{
      // Original local guard is intentionally inert in this no-I/O fixture.
    },assertOtherLaunchesSettled:other});
}
void test("copied/unprepared full input cannot manufacture a source, options grant, or native birth", async () => {
  const input=createCurrentFootprintForwardWriterHeadInput(request(),options());
  const copy=structuredClone(input);
  assert.throws(()=>currentFootprintForwardWriterHeadInputBirthOptions(copy),/FORWARD_WRITER_HEAD_INPUT/u);
  assert.throws(()=>currentFootprintForwardWriterHeadInputBirthOptions(input),/FORWARD_WRITER_HEAD_INPUT/u);
  assert.throws(()=>requireCurrentFootprintForwardWriterHeadInput(input,{}),/FORWARD_WRITER_HEAD_INPUT/u);
  const birth=Object.freeze({pluginRoot:"/synthetic-missing-plugin",assetsRoot:"/synthetic-missing-assets",powershellSha256:"a".repeat(64),powershellBytes:1});
  await assert.rejects(startCurrentFootprintForwardWriterNativeOwner(birth,copy),/FORWARD_WRITER_HEAD_INPUT/u);
  assert.deepEqual(currentFootprintForwardWriterBirthOutcome(birth),{state:"no-resource",owner:null,helperClosed:false,eofAttempted:false});
  assert.deepEqual(currentFootprintForwardWriterHeadInputStatus(input),{attempted:false,prepared:false,consumed:false,failed:false,executionAuthorized:false});
  assert.equal(startCurrentFootprintForwardWriterNativeOwner.length,1);
});
void test("a preparation guard failure preserves its original rejection and consumes preparation before any checkpoint I/O", async () => {
  const failure=new Error("original-guard-refusal");let observations=0;
  const input=createCurrentFootprintForwardWriterHeadInput(request(),options(():Promise<void>=>{observations+=1;return Promise.reject(failure);}));
  await assert.rejects(prepareCurrentFootprintForwardWriterHeadInput(input),(error:unknown)=>error===failure);
  assert.equal(observations,1);
  assert.deepEqual(currentFootprintForwardWriterHeadInputStatus(input),{attempted:true,prepared:false,consumed:false,failed:true,executionAuthorized:false});
  assert.throws(()=>prepareCurrentFootprintForwardWriterHeadInput(input),/FORWARD_WRITER_HEAD_INPUT/u);
  assert.equal(observations,1);
});
void test("options accessors and proxies are rejected before invoking supplied traps or guards", () => {
  let effects=0;const base=options();
  const accessor=Object.freeze(Object.defineProperty({...base},"pluginRoot",{get:():never=>{effects+=1;throw new Error("accessor");}}));
  assert.throws(()=>createCurrentFootprintForwardWriterHeadInput(request(),accessor),/FORWARD_WRITER_HEAD_INPUT/u);
  const proxy=new Proxy(base,{getOwnPropertyDescriptor:():never=>{effects+=1;throw new Error("proxy");}});
  assert.throws(()=>createCurrentFootprintForwardWriterHeadInput(request(),proxy),/FORWARD_WRITER_HEAD_INPUT/u);
  assert.equal(effects,0);
});

void test("full input has its own exact operation and UUID schema", () => {
  const valid=currentFootprintForwardWriterHeadInputRequestSchema.parse(request());
  assert.equal(currentFootprintForwardWriterHeadInputRequestSchema.safeParse({...valid,operationId:"footprint-forward-writer-123"}).success,true);
  assert.equal(currentFootprintForwardWriterHeadInputRequestSchema.safeParse({...valid,footprintUuid:"1".repeat(16)}).success,true);
  for(const operationId of ["footprint-forward-head-test","footprint-forward-writer-x\n",String.raw`footprint-forward-writer-x\d`]) {
    assert.equal(currentFootprintForwardWriterHeadInputRequestSchema.safeParse({...valid,operationId}).success,false);
  }
  assert.equal(currentFootprintForwardWriterHeadInputRequestSchema.safeParse({...valid,footprintUuid:`${"e".repeat(16)}\n`}).success,false);
});
