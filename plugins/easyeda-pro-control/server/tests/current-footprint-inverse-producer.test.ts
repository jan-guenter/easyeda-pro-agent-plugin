/** Source-fixed enrollment grammar only. No worker/origin/native owner exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS as REQUESTS, currentFootprintInverseProducerArmCases, currentFootprintInverseProducerArmNativeFrame, currentFootprintInverseProducerArmOrder, currentFootprintInverseProducerArmWire, validateCurrentFootprintInverseProducerArmCommand } from "../src/current-footprint-inverse-producer-protocol.ts";
import { currentProjectSaveProducerTemplate } from "../src/current-project-save-producer-wire.ts";
import { currentProjectSaveProducerNativeCases } from "../src/current-project-save-producer-protocol.ts";

void test("inverse producer enrollment has one fixed intrinsic sequence, ten guards and twenty-seven arms without a resume",()=>{
  const cases=currentFootprintInverseProducerArmCases(),order=currentFootprintInverseProducerArmOrder();assert.equal(order.length,REQUESTS.normal);assert.equal(new Set(order).size,order.length);
  const phases=cases.map(command=>{
    if(command.phase==="inverse-producer-helper"){return command.phase;}
    if(command.phase==="project-save-producer-guard"){return `${command.phase}-${command.role}`;}
    return currentProjectSaveProducerTemplate(command).phase;
  });
  assert.equal(phases.length,66);assert.equal(new Set(phases).size,phases.length);assert.ok(order.every(phase=>phases.includes(phase)));
  assert.equal(REQUESTS.intrinsics+REQUESTS.guards+REQUESTS.producerArms,REQUESTS.normal);assert.equal(REQUESTS.normal+REQUESTS.helperSources,REQUESTS.cdpRequests);
  for(const command of cases){
    const wire=currentFootprintInverseProducerArmWire(command,79,"original-worker");const bytes=Buffer.from(`${JSON.stringify(wire)}\0`),native=currentFootprintInverseProducerArmNativeFrame(bytes,command,"original-worker");
    assert.equal(native["action"],"footprint-inverse-producer-arm");assert.equal(Object.hasOwn(native,"sessionId"),false);assert.equal(Object.hasOwn(native,"functionDeclaration"),false);assert.notEqual(native["method"],"Debugger.resume");
    assert.throws(()=>currentFootprintInverseProducerArmNativeFrame(bytes,command,"foreign"));assert.throws(()=>currentFootprintInverseProducerArmNativeFrame(Buffer.from(`${JSON.stringify({...wire,viaWorkerCommand:true})}\0`),command,"original-worker"));
    if(command.method==="Runtime.callFunctionOn"){assert.throws(()=>validateCurrentFootprintInverseProducerArmCommand({...command,params:{...command.params,functionDeclaration:"function(){return true;}"}}));}
  }
  for(const command of currentProjectSaveProducerNativeCases()){if(command.phase!=="project-save-producer-arm"&&!command.phase.startsWith("project-save-producer-intrinsics-")){assert.throws(()=>validateCurrentFootprintInverseProducerArmCommand(command),/ARM_ONLY/u);}}
  assert.throws(()=>validateCurrentFootprintInverseProducerArmCommand({phase:"inverse-producer-helper",method:"Debugger.resume",params:{}}));
});
