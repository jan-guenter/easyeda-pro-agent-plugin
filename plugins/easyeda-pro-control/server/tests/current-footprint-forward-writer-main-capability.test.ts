/** Real captured-issuer refusal paths; no helper or application is created. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {CurrentFootprintForwardWriterOpeningProvider} from "../src/current-footprint-forward-writer-opening.ts";
import {isCurrentFootprintForwardWriterMainCapability,issueCurrentFootprintForwardWriterMainCapability} from "../src/current-footprint-forward-writer-main-capability.ts";
import {isCurrentFootprintForwardWriterMainCompletionOrigin,isCurrentFootprintForwardWriterMainRequestOrigin,requireCurrentFootprintForwardWriterMainCompletionOrigin,requireCurrentFootprintForwardWriterMainRequestOrigin} from "../src/current-footprint-forward-writer-main-origin.ts";

void test("full Main source-shaped copies cannot issue capabilities or call a caller-selected getter",async()=>{
 let calls=0;const copied:unknown=Object.create(CurrentFootprintForwardWriterOpeningProvider.prototype);assert.ok(copied!==null&&typeof copied==="object");
 Object.defineProperty(copied,"requireSourceInput",{get:():never=>{calls+=1;throw new Error("caller getter");}});
 await assert.rejects(async()=>{await Reflect.apply(issueCurrentFootprintForwardWriterMainCapability,undefined,[copied]);});assert.equal(calls,0);
 const proxy=new Proxy(copied,{get:():never=>{calls+=1;throw new Error("proxy");}});
 await assert.rejects(async()=>{await Reflect.apply(issueCurrentFootprintForwardWriterMainCapability,undefined,[proxy]);});assert.equal(calls,0);
 assert.equal(isCurrentFootprintForwardWriterMainCapability({profile:"private.current-footprint-forward-writer-main-capability.v1",executionAuthorized:false}),false);
});
void test("full Main request/completion profiles do not recreate original registry references",()=>{
 const request=Object.freeze({profile:"private.current-footprint-forward-writer-main-request-origin.v1" as const,executionAuthorized:false as const});
 const completion=Object.freeze({profile:"private.current-footprint-forward-writer-main-completion-origin.v1" as const,executionAuthorized:false as const});
 assert.equal(isCurrentFootprintForwardWriterMainRequestOrigin(request),false);assert.equal(isCurrentFootprintForwardWriterMainCompletionOrigin(completion),false);
 assert.throws(()=>requireCurrentFootprintForwardWriterMainRequestOrigin(request));assert.throws(()=>requireCurrentFootprintForwardWriterMainCompletionOrigin(completion));
});
