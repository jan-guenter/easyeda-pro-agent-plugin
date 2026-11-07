/* oxlint-disable import/max-dependencies -- Compare distinct purpose decoders against every exact shared local/upload command and central registry refusal. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVE_UPLOAD_REQUESTS, currentSchematicRelevanceDisplayLocalCacheWire, currentSchematicRelevanceDisplayLocalWire, currentSchematicRelevanceDisplayUploadWire } from "../src/current-schematic-relevance-display-save-upload-wire.ts";
import { currentPcbViaLocalUploadNativeCases } from "../src/current-pcb-via-local-upload-protocol.ts";
import { currentPcbViaUploadRequestNativeCases } from "../src/current-pcb-via-upload-request-protocol.ts";
import { currentPcbViaLocalUploadWire } from "../src/current-pcb-via-local-upload-wire.ts";
import { currentPcbViaUploadRequestWire } from "../src/current-pcb-via-upload-request-wire.ts";
import { currentProjectSaveProducerNativeCases } from "../src/current-project-save-producer-protocol.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicWireEditNativeRequest } from "../src/current-schematic-wire-edit-protocol.ts";
import { continueOriginalCurrentSchematicRelevanceDisplayLocalUploadCall } from "../src/current-pcb-diagnostic-owner.ts";

void test("all fixed local/upload payload bytes retain their inert encoding under the distinct own7 selector", () => {
  for (const command of currentPcbViaLocalUploadNativeCases()) { const own = currentSchematicRelevanceDisplayLocalWire(command, 1), shared = currentPcbViaLocalUploadWire(command, 1);
    assert.deepEqual(own.command, shared.command); assert.deepEqual(own.request, { ...shared.request, action: "schematic-relevance-display-save-local" });
    const raw = Buffer.from(`${JSON.stringify({ id: 1, ...own.command, schematicRelevanceSaveLocalCommand: true, sessionId: "worker" })}\0`);
    assert.deepEqual(currentSchematicRelevanceDisplayWriteNativeRequest(raw), own.request); assert.throws(() => currentSchematicDisplayWriteNativeRequest(raw)); assert.throws(() => currentSchematicWireEditNativeRequest(raw));
  }
  for (const command of currentPcbViaUploadRequestNativeCases()) { const own = currentSchematicRelevanceDisplayUploadWire(command, 1), shared = currentPcbViaUploadRequestWire(command, 1);
    assert.deepEqual(own.command, shared.command); assert.deepEqual(own.request, { ...shared.request, action: "schematic-relevance-display-save-upload" });
    const raw = Buffer.from(`${JSON.stringify({ id: 1, ...own.command, schematicRelevanceSaveUploadCommand: true, sessionId: "worker" })}\0`);
    assert.deepEqual(currentSchematicRelevanceDisplayWriteNativeRequest(raw), own.request); assert.throws(() => currentSchematicDisplayWriteNativeRequest(raw)); assert.throws(() => currentSchematicWireEditNativeRequest(raw));
  }
  assert.deepEqual(CURRENT_SCHEMATIC_RELEVANCE_SAVE_UPLOAD_REQUESTS, { local: 20, upload: 9, localCacheMetadata: 14 });
});
void test("the fourth cache observation lane admits only local-upload metadata and never a continuation", () => {
  assert.throws(()=>currentSchematicRelevanceDisplayLocalCacheWire({phase:"project-save-producer-resume",method:"Debugger.resume",params:{}},1));
  for (const command of currentProjectSaveProducerNativeCases()) {
    const forbidden = command.method === "Debugger.setBreakpoint" || "cacheRole" in command && command.cacheRole !== "localUpload";
    if (forbidden) { assert.throws(() => currentSchematicRelevanceDisplayLocalCacheWire(command, 1)); }
  }
});
void test("copied JSON origins cannot issue an own7 local continuation", async () => {
  const origin = Object.freeze({ profile: "private.current-schematic-relevance-display-save-producer-origin.v1" as const });
  await assert.rejects(continueOriginalCurrentSchematicRelevanceDisplayLocalUploadCall(origin, {}, {}, Object.freeze({ profile: "private.current-project-save-producer-held-call.v1" })));
});

void test("the helper source selector is seven-record-only and contains no execution fields", () => {
  const command={id:1,phase:"via-observed-source",method:"Debugger.getScriptSource",params:{scriptId:"original-script"},schematicRelevanceObservedSourceCommand:true,sessionId:"worker"};const bytes=Buffer.from(`${JSON.stringify(command)}\0`);
  assert.deepEqual(currentSchematicRelevanceDisplayWriteNativeRequest(bytes),{action:"schematic-relevance-display-observed-source",requestId:1,scriptId:"original-script"});
  assert.throws(()=>currentSchematicDisplayWriteNativeRequest(bytes));assert.throws(()=>currentSchematicWireEditNativeRequest(bytes));assert.throws(()=>currentSchematicRelevanceDisplayWriteNativeRequest(Buffer.from(`${JSON.stringify({...command,params:{scriptId:"original-script",expression:"this"}})}\0`)));
});
