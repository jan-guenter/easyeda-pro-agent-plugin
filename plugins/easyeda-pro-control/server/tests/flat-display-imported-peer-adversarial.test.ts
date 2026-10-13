import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDocumentSource } from "../src/document-source.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { nativeLibraryHeaderEvidence } from "../src/native-library-header-evidence.ts";
import { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE, assertFlatDisplayLibraryPeers, captureFlatDisplayHistory,
  flatDisplayLibrarySeal, flatDisplayLibrarySealSchema } from "../src/flat-display-library-peers.ts";
import { FLAT_DISPLAY_TRANSACTION_PROFILE, assertFlatDisplayBinding, prepareFlatDisplayProfile,
  verifyFlatDisplayObservation, verifyFlatDisplayPersistence } from "../src/flat-display-profile.ts";
import { verifyFlatDisplayRestoration } from "../src/flat-display-storage.ts";
import { context, fixture, hash, operation, rehash, replaceSource } from "./flat-display-fixture.ts";

type Variant = "original" | "first-clock" | "raw-body" | "raw-header" | "tombstone" | "client-presence" | "extra-atom" | "body" | "compaction" | "exact-replay";
const headerOnlyVariants = ["first-clock", "raw-body", "raw-header", "tombstone", "client-presence", "compaction", "exact-replay"] as const;

function libraryChunk(variant: Variant = "original"): string {
  const head = `${JSON.stringify({ type: "DOCHEAD", ticket: 1 })  }||${  JSON.stringify({ uuid: "library-peer", docType: "SYMBOL", client: "fixture" })}`;
  const headerJson = JSON.stringify({ type: "PIN", id: "pin", ticket: 90, firstTicket: variant === "first-clock" ? 5 : 6,
    ...(variant === "client-presence" ? { client: "fixture" } : {}) });
  const header = variant === "raw-header" ? ` ${headerJson} ` : headerJson;
  const body = variant === "raw-body" ? '{ "x": 0 }' : JSON.stringify({ x: variant === "body" ? 1 : 0 });
  const tombstone = `${JSON.stringify({ type: "LINE", id: "old-line", ticket: 80, firstTicket: variant === "tombstone" ? 8 : 7 })  }||`;
  const extra = variant === "extra-atom" ? '|\n{"type":"ATTR","id":"extra","ticket":91}||{"value":"new"}' : "";
  const retained = variant === "compaction" ? "" : `|\n${tombstone}`;
  const replay = variant === "exact-replay" ? `|\n${header}||${body}` : "";
  return `${head}|\n${header}||${body}${retained}${extra}${replay}|\n`;
}

async function imported(variant: Variant = "original", checkpointSha256 = hash): Promise<ReturnType<typeof fixture>> {
  const value = fixture();
  const library = materializeNativeHistory([libraryChunk(variant)], checkpointSha256, { libraryAtomHeaders: "preserve" });
  value.evidence = { ...value.evidence, history: rehash({ ...value.evidence.history, checkpointSha256,
    documents: [...value.evidence.history.documents, ...library] }), checkpoint: { ...value.evidence.checkpoint, checkpointSha256 } };
  value.evidence = { ...value.evidence, libraryHeaderEvidence: await nativeLibraryHeaderEvidence(value.evidence.history,
    { checkpointSha256, projectUuid: value.evidence.history.projectUuid }) };
  return value;
}

async function withPeerEvidence(value: ReturnType<typeof fixture>, variant: Variant): Promise<ReturnType<typeof fixture>["evidence"]> {
  const history = withPeer(value.evidence.history, variant);
  return { ...value.evidence, history, libraryHeaderEvidence: await nativeLibraryHeaderEvidence(history,
    { checkpointSha256: history.checkpointSha256, projectUuid: history.projectUuid }) };
}

function withPeer(history: NativeHistorySnapshot, variant: Variant): NativeHistorySnapshot {
  const library = materializeNativeHistory([libraryChunk(variant)], history.checkpointSha256, { libraryAtomHeaders: "preserve" });
  return rehash({ ...history, documents: [...history.documents.filter(({ uuid }) => uuid !== "library-peer"), ...library] });
}

function afterDisplay(before: ReturnType<typeof fixture>, prepared: Awaited<ReturnType<typeof prepareFlatDisplayProfile>>): ReturnType<typeof fixture> {
  const after = replaceSource(before, prepared.expectedSource, prepared.expectedNative);
  const proof = before.evidence.history.documents.find(({ uuid }) => uuid === "library-peer")?.atomHeaderHistory;
  assert.ok(proof);
  after.evidence = { ...after.evidence, history: { ...after.evidence.history, documents: after.evidence.history.documents.map((document) =>
    document.uuid === "library-peer" ? Object.assign(document, { atomHeaderHistory: proof }) : document) } };
  return after;
}

void test("imported peer seals retain tombstones and raw header/body encoding independently of semantic bodies", async () => {
  const original = await imported();
  const history = original.evidence.history;
  const seal = flatDisplayLibrarySeal(history);
  assert.ok(seal);
  assert.equal(seal.documents.length, 1);
  assert.equal(seal.documents[0]?.occurrenceCount, 2);
  assert.deepEqual(flatDisplayLibrarySealSchema.parse(seal), seal);
  const binding = { profile: FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE, libraryHeaders: seal };
  assert.doesNotThrow(() =>{  assertFlatDisplayLibraryPeers(binding, history); });
  for (const variant of headerOnlyVariants) {
    const changed = withPeer(history, variant);
    assert.equal(changed.semanticSha256, history.semanticSha256);
    assert.throws(() =>{  assertFlatDisplayLibraryPeers(binding, changed); }, /provenance/u);
  }
  assert.throws(() =>{  assertFlatDisplayLibraryPeers(binding, withPeer(history, "extra-atom")); }, /provenance/u);
});

void test("peer capture preserves only genuinely generated proof identities and owns mutable body state", async () => {
  const value = await imported();
  const history = value.evidence.history;
  const captured = captureFlatDisplayHistory(history);
  const library = captured.documents.find(({ uuid }) => uuid === "library-peer");
  const original = history.documents.find(({ uuid }) => uuid === "library-peer");
  assert.ok(library && original);
  assert.equal(library.atomHeaderHistory, original.atomHeaderHistory);
  assert.notEqual(library.records, original.records);
  assert.deepEqual(captured, history);
  const record = original.records[0];
  assert.ok(record);
  record.body["x"] = 999;
  assert.equal(library.records[0]?.body["x"], 0);
  assert.throws(() => captureFlatDisplayHistory(structuredClone(captured)), /provenance/u);
  assert.throws(() => flatDisplayLibrarySeal({ ...captured, checkpointSha256: "f".repeat(64) }), /provenance/u);
});

void test("identical imported header content survives a different independently bound backup hash", async () => {
  const before = await imported();
  const backup = await imported("original", "f".repeat(64));
  assert.deepEqual(flatDisplayLibrarySeal(before.evidence.history), flatDisplayLibrarySeal(backup.evidence.history));
  assert.notEqual(before.evidence.libraryHeaderEvidence?.sha256, backup.evidence.libraryHeaderEvidence?.sha256);
  assert.equal(before.evidence.libraryHeaderEvidence?.contentSha256, backup.evidence.libraryHeaderEvidence?.contentSha256);
  assert.notEqual(before.evidence.libraryHeaderEvidence?.documents[0]?.proofSha256, backup.evidence.libraryHeaderEvidence?.documents[0]?.proofSha256);
});

void test("v2 preparation refuses corrupted summary integrity and unknown provenance fields", async () => {
  for (const kind of ["profile", "summary-hash", "proof-hash", "extra-summary", "extra-member"] as const) {
    const value = await imported();
    const summary = structuredClone(value.evidence.libraryHeaderEvidence);
    assert.ok(summary);
    if (kind === "profile") { Object.assign(summary, { profile: "invented-profile" }); }
    else if (kind === "summary-hash") { Object.assign(summary, { sha256: "f".repeat(64) }); }
    else if (kind === "extra-summary") { Object.assign(summary, { authority: true }); }
    else {
      const member = summary.documents[0];
      assert.ok(member);
      Object.assign(member, kind === "proof-hash" ? { proofSha256: "f".repeat(64) } : { authority: true });
    }
    value.evidence = { ...value.evidence, libraryHeaderEvidence: summary };
    await assert.rejects(prepareFlatDisplayProfile({ ...value, operation, context }));
  }
});

void test("v1 stays unchanged and rejects imported peers while v2 requires complete generated provenance", async () => {
  const legacy = fixture(), prepared = await prepareFlatDisplayProfile({ ...legacy, operation, context });
  assert.equal(prepared.binding.profile, FLAT_DISPLAY_TRANSACTION_PROFILE);
  assert.equal(Object.hasOwn(prepared.binding, "libraryHeaders"), false);
  assert.equal(flatDisplayLibrarySeal(legacy.evidence.history), undefined);
  const value = await imported();
  const history = value.evidence.history, seal = flatDisplayLibrarySeal(history);
  assert.ok(seal);
  assert.throws(() =>{  assertFlatDisplayLibraryPeers(prepared.binding, history); }, /Legacy/u);
  assert.throws(() =>{  assertFlatDisplayLibraryPeers({ profile: FLAT_DISPLAY_TRANSACTION_PROFILE, libraryHeaders: seal }, legacy.evidence.history); }, /Legacy/u);
  assert.throws(() =>{  assertFlatDisplayLibraryPeers({ profile: FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE }, history); }, /provenance/u);
  assert.throws(() =>{  assertFlatDisplayLibraryPeers({ profile: FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE, libraryHeaders: seal }, legacy.evidence.history); }, /provenance/u);
  await assert.rejects(prepareFlatDisplayProfile({ ...await imported(), operation: { ...operation, libraryHeaders: seal }, context }));
});

void test("v2 binding cannot be transplanted across original operations, context, library membership or legacy profile", async () => {
  const before = await imported(), prepared = await prepareFlatDisplayProfile({ ...before, operation, context });
  assert.equal(prepared.binding.profile, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE);
  assert.ok("libraryHeaders" in prepared.binding);
  assert.equal(prepared.binding.libraryHeaders.documents.length, 1);
  assert.equal(assertFlatDisplayBinding(prepared.binding, operation, context).profile, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE);
  for (const changed of [
    { ...prepared.binding, profile: FLAT_DISPLAY_TRANSACTION_PROFILE },
    { ...prepared.binding, libraryHeaders: undefined },
    { ...prepared.binding, members: prepared.binding.members.filter(({ uuid }) => uuid !== "library-peer") },
    { ...prepared.binding, libraryHeaders: { ...prepared.binding.libraryHeaders, contentSha256: "f".repeat(64) } },
  ]) { assert.throws(() => assertFlatDisplayBinding(changed, operation, context)); }
  assert.throws(() => assertFlatDisplayBinding(prepared.binding, { ...operation, id: "new-intent" }, context), /sealed binding/u);
  assert.throws(() => assertFlatDisplayBinding(prepared.binding, operation, { ...context, project: { ...context.project, path: "/tmp/other.eprj2" } }), /sealed binding/u);
});

void test("v2 observations refuse all header-only library drift in both before and after phases", async () => {
  const before = await imported(), prepared = await prepareFlatDisplayProfile({ ...before, operation, context });
  const after = afterDisplay(before, prepared);
  for (const [phase, value] of [["before", before], ["after", after]] as const) {
    assert.doesNotThrow(() =>{  verifyFlatDisplayObservation(prepared.binding, operation, context, value.evidence, value.native, phase); });
    for (const variant of [...headerOnlyVariants, "extra-atom", "body"] as const) {
      const evidence = await withPeerEvidence(value, variant);
      assert.throws(() =>{  verifyFlatDisplayObservation(prepared.binding, operation, context, evidence, value.native, phase); });
    }
  }
});

void test("v2 durable classification rejects imported proof loss or header drift even when semantic checkpoint content matches", async () => {
  const before = await imported(), prepared = await prepareFlatDisplayProfile({ ...before, operation, context });
  const after = afterDisplay(before, prepared);
  const input = { binding: prepared.binding, operation, context, baseline: before.evidence.history,
    before: parseDocumentSource(before.native.source), beforeNative: before.native,
    current: prepared.expectedSource, currentNative: prepared.expectedNative, evidence: after.evidence, allowAfter: true };
  const accepted = await verifyFlatDisplayPersistence(input);
  assert.equal(accepted["classification"], "exact-intended-effect");
  for (const variant of headerOnlyVariants) {
    const changed = await withPeerEvidence(after, variant);
    assert.equal(changed.history.semanticSha256, after.evidence.history.semanticSha256);
    await assert.rejects(verifyFlatDisplayPersistence({ ...input, evidence: changed }));
    await assert.rejects(verifyFlatDisplayPersistence({ ...input, baseline: withPeer(before.evidence.history, variant) }));
  }
  const documents = after.evidence.history.documents.map((document) => {
    const { atomHeaderHistory: discarded, ...body } = document;
    assert.equal(discarded === undefined || Object.isFrozen(discarded), true);
    return body;
  });
  const missing = { ...after.evidence, history: { ...after.evidence.history, documents } };
  await assert.rejects(verifyFlatDisplayPersistence({ ...input, evidence: missing }));
  await assert.rejects(verifyFlatDisplayPersistence({ ...input, baseline: structuredClone(before.evidence.history) }));
});

void test("imported peer restoration rejects history compaction and exact replay without weakening legacy restoration", async () => {
  const value = await imported();
  const source = parseDocumentSource(value.native.source);
  const input = { before: value.evidence.history, after: value.evidence.history,
    expectedBefore: source, expectedAfter: source, beforeNative: value.native, afterNative: value.native };
  const restored = await verifyFlatDisplayRestoration(input);
  assert.equal(restored["ok"], true);
  for (const variant of headerOnlyVariants) {
    const after = withPeer(input.after, variant);
    assert.equal(after.semanticSha256, input.before.semanticSha256);
    await assert.rejects(verifyFlatDisplayRestoration({ ...input, after }), /imported library header peers/u);
  }
  const legacy = fixture(), legacySource = parseDocumentSource(legacy.native.source);
  const legacyRestored = await verifyFlatDisplayRestoration({ before: legacy.evidence.history, after: legacy.evidence.history,
    expectedBefore: legacySource, expectedAfter: legacySource, beforeNative: legacy.native, afterNative: legacy.native });
  assert.equal(legacyRestored["ok"], true);
});

void test("v2 seals bind every imported symbol and footprint peer, including zero firstTicket and all metadata occurrences", async () => {
  const value = await imported();
  const footprint = materializeNativeHistory([
    '{"type":"DOCHEAD","ticket":1}||{"uuid":"footprint-peer","docType":"FOOTPRINT","client":"fixture"}|\n' +
    '{"type":"META","id":"META","ticket":2}||{"name":"Fixture footprint"}|\n' +
    '{"type":"PAD","id":"pad","ticket":3,"firstTicket":0}||{"x":0,"y":0}|\n',
  ], hash, { libraryAtomHeaders: "preserve" });
  const history = rehash({ ...value.evidence.history, documents: [...value.evidence.history.documents, ...footprint] });
  value.evidence = { ...value.evidence, history, libraryHeaderEvidence: await nativeLibraryHeaderEvidence(history,
    { checkpointSha256: history.checkpointSha256, projectUuid: history.projectUuid }) };
  const prepared = await prepareFlatDisplayProfile({ ...value, operation, context });
  assert.equal(prepared.binding.profile, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE);
  assert.ok("libraryHeaders" in prepared.binding);
  assert.deepEqual(prepared.binding.libraryHeaders.documents.map(({ documentUuid, occurrenceCount }) => ({ documentUuid, occurrenceCount })),
    [{ documentUuid: "footprint-peer", occurrenceCount: 2 }, { documentUuid: "library-peer", occurrenceCount: 2 }]);
  const missing = { ...history, documents: history.documents.map((document) => {
    if (document.uuid !== "footprint-peer") { return document; }
    const { atomHeaderHistory, ...body } = document;
    assert.ok(atomHeaderHistory);
    return body;
  }) };
  assert.throws(() =>{ assertFlatDisplayLibraryPeers(prepared.binding, missing); }, /provenance/u);
  const foreignProof = history.documents.find(({ uuid }) => uuid === "library-peer")?.atomHeaderHistory;
  assert.ok(foreignProof);
  const transplanted = { ...history, documents: history.documents.map((document) => document.uuid === "footprint-peer" ?
    Object.assign(structuredClone(document), { atomHeaderHistory: foreignProof }) : document) };
  assert.throws(() => flatDisplayLibrarySeal(transplanted), /provenance/u);
});

void test("cooperative compact evidence captures its expected checkpoint and project before yielding across many documents", async () => {
  const value = await imported();
  const peer = value.evidence.history.documents.find(({ uuid }) => uuid === "pcb");
  assert.ok(peer);
  const padding = Array.from({ length: 600 }, (_, index) => {
    const uuid = `ordinary-peer-${String(index)}`;
    return { ...structuredClone(peer), uuid, metadata: { ...peer.metadata, uuid } };
  });
  const history = rehash({ ...value.evidence.history, documents: [...padding, ...value.evidence.history.documents] });
  const expected = { checkpointSha256: history.checkpointSha256, projectUuid: history.projectUuid };
  const originalExpected = { ...expected };
  const pending = nativeLibraryHeaderEvidence(history, expected);
  expected.checkpointSha256 = "f".repeat(64);
  expected.projectUuid = "e".repeat(64);
  const captured = await pending;
  assert.equal(captured.checkpointSha256, originalExpected.checkpointSha256);
  assert.equal(captured.projectUuid, originalExpected.projectUuid);
  assert.equal(captured.documents.length, 1);
  assert.equal(captured.documents[0]?.documentUuid, "library-peer");
  assert.deepEqual(captured, await nativeLibraryHeaderEvidence(history, originalExpected));
  await assert.rejects(nativeLibraryHeaderEvidence(history, expected), /checkpoint identity/u);
});
