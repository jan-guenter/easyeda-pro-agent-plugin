import assert from "node:assert/strict";
import {test} from "node:test";
import {currentSchematicWireWorkerPendingCases,currentSchematicWireWorkerPendingTemplate,validateCurrentSchematicWireWorkerPendingCommand as validate} from "../src/current-schematic-wire-worker-pending-protocol.ts";
import {decodeCurrentSchematicWireWorkerPendingBatchFunction as metadata} from "../src/current-schematic-wire-worker-pending-source.ts";
import {CurrentSchematicWireWorkerPendingCursor} from "../src/current-schematic-wire-worker-pending-cursor.ts";

void test("Wire worker vocabulary has no controls, caller programs or parsed-token authority",()=>{
 for(const command of currentSchematicWireWorkerPendingCases()){assert.deepEqual(validate(command),command);assert.ok(currentSchematicWireWorkerPendingTemplate(command).template.length>0);assert.throws(()=>validate({...command,params:{...command.params,callerCode:"not admitted"}}));}
 assert.throws(()=>validate({phase:"wire-worker-pending-resume",method:"Debugger.resume",params:{}}));
 assert.throws(()=>Reflect.construct(CurrentSchematicWireWorkerPendingCursor,[{stage:"after",frame:"123.1.2",previous:{}}]));
 let invoked=0;const described={type:"function",className:"Function",objectId:"123.2.3"};Object.defineProperty(described,"description",{enumerable:true,get():string{invoked+=1;return "source"}});assert.throws(()=>{ metadata({},described,"123"); });assert.equal(invoked,0);
 const proxied=new Proxy({},{ownKeys():never{invoked+=1;throw new Error("trap")}});assert.throws(()=>{ metadata({},proxied,"123"); });assert.equal(invoked,0);
});
