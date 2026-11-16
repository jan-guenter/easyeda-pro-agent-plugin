/** Actual fixed data codecs and original-registry refusals; no owner is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintForwardWriterCopyUploadWire } from "../src/current-footprint-forward-writer-copy-upload-wire.ts";
import { currentPcbViaUploadRequestNativeCases } from "../src/current-pcb-via-upload-request-protocol.ts";
import { currentPcbViaUploadRequestWire } from "../src/current-pcb-via-upload-request-wire.ts";
import { currentFootprintForwardWriterProducerWire } from "../src/current-footprint-forward-writer-producer-wire.ts";
import { continueOriginalCurrentFootprintForwardWriterCopyUploadCall } from "../src/current-footprint-forward-writer-copy-upload-origin.ts";
import { CurrentFootprintForwardWriterNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";

void test("the full upload shares only immutable nine-command data rows and has its own native action", () => {
  for (const command of currentPcbViaUploadRequestNativeCases()) {
    const full = currentFootprintForwardWriterCopyUploadWire(command, 23), via = currentPcbViaUploadRequestWire(command, 23);
    assert.deepEqual(full.command, via.command);
    assert.deepEqual(full.request, { ...via.request, action: "footprint-forward-copy-upload" });
    assert.throws(() => currentFootprintForwardWriterProducerWire(command, 23, "original-worker"));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => currentFootprintForwardWriterCopyUploadWire({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }, 23)); }
  }
});
void test("copied producer tokens and prototype-derived full owners cannot mint an upload cursor", async () => {
  const origin: Parameters<typeof continueOriginalCurrentFootprintForwardWriterCopyUploadCall>[0] = Object.freeze({ profile: "private.current-footprint-forward-writer-save-producer-origin.v1" });
  const packet: Parameters<typeof continueOriginalCurrentFootprintForwardWriterCopyUploadCall>[3] = Object.freeze({ profile: "private.current-project-save-producer-held-call.v1" });
  await assert.rejects(continueOriginalCurrentFootprintForwardWriterCopyUploadCall(origin, {}, {}, packet));
  const prepare: unknown = Reflect.get(CurrentFootprintForwardWriterNativeOwner.prototype, "prepareFootprintForwardWriterCopyUpload");
  assert.ok(typeof prepare === "function");
  const fake: unknown = Object.create(CurrentFootprintForwardWriterNativeOwner.prototype);
  const result: unknown = Reflect.apply(prepare, fake, []); assert.ok(result instanceof Promise); await assert.rejects(result);
});
