/** Pure bounded encoder; no channel, native authority or dispatch is created. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {currentFootprintForwardWriterProducerWire as wire} from "../src/current-footprint-forward-writer-producer-wire.ts";
import {currentFootprintForwardWriterProfile} from "../src/current-footprint-forward-writer-profile.ts";
import {currentFootprintForwardWriterCompleteProfile} from "../src/current-footprint-forward-writer-complete-profile.ts";
import {currentProjectSaveProducerNativeCases} from "../src/current-project-save-producer-protocol.ts";

void test("complete producer encoding accepts its admitted IDs while retaining legacy and exact upper bounds",()=>{
 const command=currentProjectSaveProducerNativeCases().find(row=>row.phase==="project-save-producer-arm");assert.ok(command!==undefined);
 const complete=currentFootprintForwardWriterCompleteProfile().renderer.requestLimit,previous=currentFootprintForwardWriterProfile().renderer.requestLimit;
 assert.ok(complete>previous);
 assert.equal(wire(command,previous,"original-session").request["requestId"],previous);
 assert.throws(()=>wire(command,previous+1,"original-session"),/FORWARD_WRITER_PRODUCER_WIRE/u);
 for(const id of[previous+1,complete]){const output=wire(command,id,"original-session",complete);assert.equal(output.request["requestId"],id);assert.equal(output.command.sessionId,"original-session");}
 for(const limit of[0,-1,Number.NaN,Number.POSITIVE_INFINITY,previous-1,complete+1]){assert.throws(()=>wire(command,1,"original-session",limit),/FORWARD_WRITER_PRODUCER_WIRE/u);}
 for(const id of[complete+1,0,-1,1.5,Number.NaN]){assert.throws(()=>wire(command,id,"original-session",complete),/FORWARD_WRITER_PRODUCER_WIRE/u);}
});
