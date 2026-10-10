import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import { selectSavedLibraryReopen, verifySavedLibraryArtifacts } from "../src/saved-library-recovery.ts";

function source(width = 40): NativeSourceSnapshot {
  const body = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "footprint", docType: "PCB" },
    objects: [{ id: "pad", type: "PAD", body: { width } }] };
  return { ...body, sha256: sha256Json(body) };
}

void test("saved library recovery uses retained source/scope/checkpoint evidence and never plans another Save", () => {
  const expected = source();
  const scope = { libraryUuid: "project", footprintUuid: "footprint", footprintName: "Fixture", metadataOwnerUuid: "owner" };
  const checkpoint = { schema: "easyeda-pro-control.checkpoint.v2", checkpoint: "/managed/saved.eprj2", receiptPath: "/managed/saved.json", checkpointSha256: "ab".repeat(32) };
  const input = { family: "footprint" as const, expected, current: expected, scope,
    save: { ok: true, kind: "footprint-save-requested", saved: false },
    durable: { snapshot: expected, scope, checkpoint, persistence: { ok: false } } };
  // The coordinator decodes and recomputes persistence. The old ok field is
  // Intentionally not trusted by this retained-artifact content guard.
  assert.deepEqual(verifySavedLibraryArtifacts(input), { checkpoint });
  const navigation = { documentUuid: "footprint", documentType: 4 as const, tabId: "footprint@project", receipts: [], outstandingDispatch: false };
  assert.deepEqual(selectSavedLibraryReopen(navigation), { action: "reopen-once" });
  const receipt = { ok: true, saved: true, closed: true, reopened: true, document: { uuid: "footprint", documentType: 4, tabId: "footprint@project" } };
  assert.deepEqual(selectSavedLibraryReopen({ ...navigation, outstandingDispatch: true, receipts: [receipt] }), { action: "reuse-reopen", receipt });
  assert.throws(() => selectSavedLibraryReopen({ ...navigation, outstandingDispatch: true }), /do not repeat navigation/u);
  assert.throws(() => selectSavedLibraryReopen({ ...navigation, receipts: [{ ...receipt, document: { ...receipt.document, uuid: "foreign" } }] }), /exact current target/u);
});

void test("saved flags cannot authorize recovery with missing acknowledgment, changed source or another asset", () => {
  const expected = source();
  const input = { family: "footprint" as const, expected, current: expected, scope: { footprintUuid: "footprint" },
    save: { saved: true }, durable: { saved: true, snapshot: expected, scope: { footprintUuid: "footprint" }, checkpoint: {} } };
  assert.throws(() => verifySavedLibraryArtifacts(input), /acknowledgment/u);
  const save = { ok: true, kind: "footprint-save-requested" };
  assert.throws(() => verifySavedLibraryArtifacts({ ...input, save, current: source(41) }), /retained saved edit/u);
  assert.throws(() => verifySavedLibraryArtifacts({ ...input, save, durable: { ...input.durable, scope: { footprintUuid: "foreign" } } }), /asset scope/u);
  assert.throws(() => verifySavedLibraryArtifacts({ ...input, save }), /checkpoint identity/u);
});
