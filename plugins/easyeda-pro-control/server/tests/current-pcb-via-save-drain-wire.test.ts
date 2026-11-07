/** Exact finite wires and refusal of copied completion data; no native owner is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbViaPostHistorySyncNativeCases } from "../src/current-pcb-via-post-history-sync-protocol.ts";
import { currentPcbViaPostHistorySyncWire } from "../src/current-pcb-via-post-history-sync-wire.ts";
import { currentPcbViaSaveDrainNativeCases } from "../src/current-pcb-via-save-drain-protocol.ts";
import { currentPcbViaSaveDrainWire } from "../src/current-pcb-via-save-drain-wire.ts";
import { currentPcbViaObservedSourceWire } from "../src/current-pcb-via-observed-source-protocol.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { requireOriginalCurrentPcbViaSaveDrained } from "../src/current-pcb-diagnostic-owner.ts";

void test("the changed-head replay is a selector with no caller code or remote receivers",()=>{for(const input of currentPcbViaPostHistorySyncNativeCases()){const wire=currentPcbViaPostHistorySyncWire(input,7);const raw=Buffer.from(`${JSON.stringify({id:7,...wire.command,viaPostSyncCommand:true,sessionId:"original-worker"})}\0`);assert.deepEqual(currentPcbViaWriteNativeRequest(raw),wire.request);assert.throws(()=>currentSchematicDisplayWriteNativeRequest(raw));if(input.phase==="via-post-sync-replay"){assert.deepEqual(wire.request,{action:"pcb-via-post-sync",requestId:7,phase:"via-post-sync-replay",method:"Runtime.callFunctionOn"});assert.throws(()=>currentPcbViaPostHistorySyncWire({...input,objectId:"foreign"},7));}}});
void test("all drain messages and source reads stay on the original Via grammar",()=>{for(const input of currentPcbViaSaveDrainNativeCases()){const wire=currentPcbViaSaveDrainWire(input,9);const raw=Buffer.from(`${JSON.stringify({id:9,...wire.command,viaSaveDrainCommand:true,sessionId:"original-worker"})}\0`);assert.deepEqual(currentPcbViaWriteNativeRequest(raw),wire.request);assert.throws(()=>currentSchematicDisplayWriteNativeRequest(raw));}const wire=currentPcbViaObservedSourceWire({phase:"via-observed-source",method:"Debugger.getScriptSource",params:{scriptId:"original-script"}},11);const raw=Buffer.from(`${JSON.stringify({id:11,...wire.command,viaObservedSourceCommand:true,sessionId:"original-worker"})}\0`);assert.deepEqual(currentPcbViaWriteNativeRequest(raw),wire.request);assert.throws(()=>currentSchematicDisplayWriteNativeRequest(raw));});
void test("a completion-shaped object cannot issue the original drained capability",()=>{const fake=Object.freeze({profile:"private.current-pcb-via-save-drained.v1" as const});assert.throws(()=>{requireOriginalCurrentPcbViaSaveDrained(fake,Object.freeze({}),Object.freeze({}));},/ORIGINAL_COMPLETION/u);});
