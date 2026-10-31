/** Counter-only synthetic originals. No helper, process, cache, source reader
 * or saved-copy execution is admitted by these allocation-boundary checks. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY as CAPACITY, CurrentFootprintCopyHeldSavedResourceLedger,
  requireOriginalHeldSavedLedgerBinding } from "../src/current-footprint-copy-held-saved-capacity.ts";

/** Bind only a synthetic receiver to exercise the original counter methods. */
function fixture(): Readonly<{ owner: object; ledger: CurrentFootprintCopyHeldSavedResourceLedger }> {
  const ledger = new CurrentFootprintCopyHeldSavedResourceLedger(), owner = Object.freeze({}); ledger.bind(owner); return { owner, ledger };
}

void test("held-saved derives complete purpose-specific controls, raw bytes and poll reserves", () => {
  assert.equal(CAPACITY.renderer.normalClassLimit, 328); assert.equal(CAPACITY.renderer.cleanupClassLimit, 35);
  assert.equal(CAPACITY.renderer.requestLimit, 363); assert.equal(CAPACITY.renderer.normalIdCeiling, 363);
  assert.equal(CAPACITY.controls.normalProofControls, 44); assert.equal(CAPACITY.controls.cleanupProofControls, 4);
  assert.equal(CAPACITY.controls.normal, 46); assert.equal(CAPACITY.controls.cleanup, 251); assert.equal(CAPACITY.controls.total, 297);
  assert.equal(CAPACITY.controls.cleanupCoreControls.termination, 240);
  assert.equal(CAPACITY.controls.cleanupCoreControls.ownerReleaseTermination + CAPACITY.controls.cleanupCoreControls.channelTermination +
    CAPACITY.controls.cleanupCoreControls.openingTransportTermination, 3);
  assert.equal(CAPACITY.controls.cleanupCoreControls.originalJobAbort, 1);
  assert.equal(CAPACITY.renderer.cleanupReplyFrameBytes, 33_024);
  assert.equal(CAPACITY.renderer.cleanupReceivedBytes, 9_544_448); assert.equal(CAPACITY.renderer.normalReceivedBytes, 57_564_416);
  assert.equal(CAPACITY.renderer.normalReceivedBytes + CAPACITY.renderer.cleanupReceivedBytes, 64 * 1024 * 1024);
  assert.deepEqual(CAPACITY.renderer.cleanupPolls, { data: 4277, idle: 240, wait: 3000 });
  assert.deepEqual(CAPACITY.renderer.normalPolls, { data: 3915, idle: 14_160, wait: 5192 });
  assert.equal(CAPACITY.normalHelperStdoutBytes, 85 * 1024 * 1024);
  assert.equal(CAPACITY.cleanupHelperStdoutBytes, 16 * 1024 * 1024); assert.equal(CAPACITY.helperStdoutBytes, 101 * 1024 * 1024);
  assert.equal(CAPACITY.nativeAuthorityIssued, false); assert.equal(CAPACITY.executionAuthorized, false);
});

void test("held-saved global cursor admits interleaved cleanup and exactly328normal plus35cleanup requests", () => {
  const { ledger, owner } = fixture(); let id = 1;
  ledger.consumeRequest(owner, id, false); id += 1; ledger.consumeRequest(owner, id, true); id += 1;
  for (let index = 1; index < CAPACITY.renderer.normalClassLimit; index += 1) { ledger.consumeRequest(owner, id, false); id += 1; }
  assert.ok(id > CAPACITY.renderer.normalClassLimit);
  for (let index = 1; index < CAPACITY.renderer.cleanupClassLimit; index += 1) { ledger.consumeRequest(owner, id, true); id += 1; }
  assert.equal(id, 364); assert.deepEqual(ledger.status(owner).requests, { normal: 328, cleanup: 35 });
  assert.throws(() => { ledger.consumeRequest(owner, id, false); }, /REQUEST/u);
  assert.throws(() => { ledger.consumeRequest(owner, id, true); }, /REQUEST/u);
  assert.equal(ledger.status(owner).nextRequestId, 364);
});

void test("normal control, byte and poll exhaustion cannot consume their cleanup reservations", () => {
  for (const kind of ["control", "renderer", "helper-stdout", "data", "idle", "wait"] as const) {
    const { ledger, owner } = fixture();
    const spend = (cleanup: boolean, excess = false): void => {
      if (kind === "control") {
        const allowance = cleanup ? CAPACITY.controls.cleanup : CAPACITY.controls.normal;
        const limit = excess ? 1 : allowance;
        for (let index = 0; index < limit; index += 1) { ledger.consumeControl(owner, cleanup); }
      } else if (kind === "renderer" || kind === "helper-stdout") {
        const renderer = cleanup ? CAPACITY.renderer.cleanupReceivedBytes : CAPACITY.renderer.normalReceivedBytes;
        const helper = cleanup ? CAPACITY.cleanupHelperStdoutBytes : CAPACITY.normalHelperStdoutBytes;
        const limit = kind === "renderer" ? renderer : helper;
        ledger.consumeBytes(owner, kind, excess ? 1 : limit, cleanup);
      } else {
        const allowance = cleanup ? CAPACITY.renderer.cleanupPolls[kind] : CAPACITY.renderer.normalPolls[kind];
        const limit = excess ? 1 : allowance;
        for (let index = 0; index < limit; index += 1) { ledger.consumeRendererPoll(owner, kind, cleanup); }
      }
    };
    spend(false); assert.throws(() => { spend(false, true); }, /CONTROL|BYTES|POLL/u, kind);
    assert.equal(ledger.status(owner).failed, true); spend(true);
    assert.throws(() => { spend(true, true); }, /CONTROL|BYTES|POLL/u, kind);
    assert.throws(() => { spend(false, true); }, /CLEANUP_ONLY/u, kind);
  }
});

void test("held-saved original bindings reject copies and separately cap event and held-reply retention", () => {
  const { ledger, owner } = fixture();
  const binding = requireOriginalHeldSavedLedgerBinding(ledger);
  assert.equal(requireOriginalHeldSavedLedgerBinding(ledger), binding);
  assert.throws(() => { ledger.bind(Object.freeze({})); }, /BIND/u);
  assert.throws(() => { binding.consumeControl(Object.freeze({}), false); }, /ORIGINAL_OWNER/u);
  // oxlint-disable-next-line typescript/no-misused-spread -- Deliberately lose the class prototype/private fields to prove a copied ledger cannot acquire its original binding.
  assert.throws(() => { Reflect.apply(requireOriginalHeldSavedLedgerBinding, undefined, [Object.freeze({ ...ledger })]); }, /ORIGINAL_LEDGER/u);
  assert.throws(() => requireOriginalHeldSavedLedgerBinding(new Proxy(ledger, {})), /ORIGINAL_LEDGER/u);
  for (let index = 0; index < CAPACITY.heldReplyCount; index += 1) { binding.consumeHeldReply(owner, CAPACITY.heldReplyBytes); }
  assert.equal(binding.status(owner).heldReplyBytes, CAPACITY.retainedHeldReplyBytes);
  assert.throws(() => { binding.consumeHeldReply(owner, 1); }, /HELD_REPLY/u);
  assert.equal(binding.status(owner).heldReplies, CAPACITY.heldReplyCount);
  const events = fixture();
  for (let index = 0; index < CAPACITY.renderer.eventBytes / CAPACITY.renderer.eventFrameBytes; index += 1) {
    events.ledger.consumeRendererEvent(events.owner, CAPACITY.renderer.eventFrameBytes);
  }
  assert.throws(() => { events.ledger.consumeRendererEvent(events.owner, 1); }, /EVENT/u);
  assert.equal(events.ledger.status(events.owner).bytes.renderer.normal, 0);
});
