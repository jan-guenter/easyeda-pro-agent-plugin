import assert from "node:assert/strict";
import {test} from "node:test";
import {currentPcbViaWriteMainFailure,currentPcbViaWriteMainFailureSchema,refusedCurrentPcbViaWriteMainFailure} from "../src/current-pcb-via-write-main-failure.ts";
import {queryCurrentPcbViaWrite} from "../src/current-pcb-via-write-validation.ts";
import {mainBackendModule,mainBackendTransportFixture} from "./helpers/footprint-main-backend-runner-fixture.ts";

void test("actual runner foreign schema paths remain sanitized in the separate immutable snapshot",async()=>{
 const module=await mainBackendModule();const transport=mainBackendTransportFixture();transport.state.metadataShapeRole="capture";
 const runner=new module.Constructor(transport.transport);await assert.rejects(runner.observe());const count=transport.commands.length;
 const value=currentPcbViaWriteMainFailure(runner.retained());assert.equal(value.capture,"original-status-retained");assert.equal(value.status?.failure,"REPLY_SCHEMA");assert.equal(value.status.metadataRole,"retained-array");
 assert.equal(transport.commands.length,count);assert.equal(JSON.stringify(value).includes("sensitive-foreign-value"),false);
 assert.equal(currentPcbViaWriteMainFailureSchema.safeParse({...value,executionAuthorized:true}).success,false);
 assert.equal(currentPcbViaWriteMainFailureSchema.safeParse({...value,status:{...value.status,schemaIssues:[{code:"custom",path:["/private/path"]}]}}).success,false);
 assert.equal(currentPcbViaWriteMainFailureSchema.safeParse({...value,status:{...value.status,registrationLocationFailure:{lineNumber:1,columnNumber:2,scriptObserved:true,scriptId:"private"}}}).success,false);
 assert.equal(currentPcbViaWriteMainFailureSchema.safeParse({...value,status:{...value.status,metadataRole:"/private/path"}}).success,false);
 assert.equal(currentPcbViaWriteMainFailureSchema.safeParse({...value,message:"private",stack:"private"}).success,false);
 assert.ok(Object.isFrozen(value)&&Object.isFrozen(value.status)&&Object.isFrozen(value.status.schemaIssues));
});
void test("absent and refused snapshots grant no authority and reject getter/Error reflection",()=>{
 const absent=currentPcbViaWriteMainFailure(null);assert.equal(absent.capture,"runner-absent");assert.equal(absent.status,null);assert.equal(absent.nativeFailure,null);
 const native=currentPcbViaWriteMainFailure(null,{action:"main-attach",code:"pcb-diagnostic-main-endpoint-deadline"},"HELPER_ERROR");assert.equal(native.nativeFailure?.action,"main-attach");assert.equal(native.ownerFailure,"HELPER_ERROR");
 for(const input of[{action:"main-attach",code:"/private/path"},{action:"other",code:"pcb-diagnostic-main-endpoint-deadline"}]){assert.throws(()=>currentPcbViaWriteMainFailure(null,input));}
 const refused=refusedCurrentPcbViaWriteMainFailure();assert.equal(refused.capture,"capture-refused");assert.equal(refused.cleanupAuthorized,false);
 let hooks=0;const poison={};Object.defineProperty(poison,"phase",{get:():never=>{hooks+=1;throw new Error("must not read");},enumerable:true});
 assert.throws(()=>currentPcbViaWriteMainFailure(poison));const error=new Error("Untrusted retained status");const forbidden=():never=>{hooks+=1;throw new Error("must not read");};for(const key of["name","message","stack"]){Object.defineProperty(error,key,{get:forbidden});}assert.throws(()=>currentPcbViaWriteMainFailure(error));assert.equal(hooks,0);
 const query=queryCurrentPcbViaWrite(true);assert.ok(query["mainFailureSchema"]!==undefined);assert.equal(query["executionAuthorized"],false);
});
