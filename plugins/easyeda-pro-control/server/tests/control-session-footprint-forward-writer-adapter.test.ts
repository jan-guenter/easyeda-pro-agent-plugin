/** The strict adapter is data only; a manager's private connection is separate. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL as TOOL} from "../src/current-footprint-forward-writer-control-contract.ts";
import {isOriginalFootprintForwardWriterManagerControl as allows,captureOriginalFootprintForwardWriterManagerRequest as capture,originalFootprintForwardWriterManagerControl as control} from "../../scripts/control-session-footprint-forward-writer-adapter.ts";

const operationId="footprint-forward-flow-manager-original";
const execute={action:"execute",operationId,confirmDisposableCopy:true,confirmCopyTriggeredPersistence:true,confirmNoExplicitSave:true,acceptUnsupportedInverse:true} as const;
void test("full-writer manager adapter captures only the actual strict contract and injects original-only cleanup",()=>{
 const original=capture(TOOL,{request:execute});assert.ok(original!==null);assert.deepEqual(original.request,execute);assert.ok(Object.isFrozen(original)&&Object.isFrozen(original.request));
 for(const action of["inspect","cleanup","settle-publication"]){assert.equal(allows(action),true);const output=control(original,action);assert.equal(output.tool,TOOL);assert.deepEqual(output.arguments,{request:{action,operationId,...(action==="cleanup"?{confirmOriginalJobsOnly:true}:{})}});}
 for(const action of["prepare","execute","abort","release","save","cleanup-before-launch"]){assert.equal(allows(action),false);assert.throws(()=>control(original,action));}
 for(const request of[{...execute,confirmNoExplicitSave:false},{...execute,operationId:"footprint-forward-writer-manager-original"},{...execute,binding:{}},{...execute,program:"caller-js"}]){assert.equal(capture(TOOL,{request}),null);}
 assert.equal(capture("foreign_tool",{request:execute}),null);assert.equal(capture(TOOL,{request:execute,operationId:"caller-override"}),null);
 const raw:{operationId:string}&Omit<typeof execute,"operationId">={...execute};const snapshot=capture(TOOL,{request:raw});assert.ok(snapshot!==null);raw.operationId="footprint-forward-flow-replaced";assert.equal(snapshot.operationId,operationId);
});
