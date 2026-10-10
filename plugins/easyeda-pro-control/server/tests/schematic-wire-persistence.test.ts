import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { deriveDesignBaselineTargets, verifyDesignBaseline, verifyDesignPersistence } from "../src/design-persistence.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { buildSchematicNativeWireAdapter } from "../src/schematic-native-wire.ts";
import { hasSchematicWireSaveEvidence, verifySchematicWireBaseline, verifySchematicWirePersistence, verifyWireRetainedSaveAuthority } from "../src/schematic-wire-persistence.ts";

const header = { uuid: "page", docType: "SCH_PAGE", editVersion: "3.2.149.88089769" };
const topology = [{ uniqueId: "part", designator: "R1", pins: [{ pinNumber: "1", net: "SYNTHETIC_NET" }] }];
const context = { project: { uuid: "a".repeat(64), path: "/synthetic/project.eprj2" },
  document: { uuid: "page", tabId: "page@project", documentType: 1 } };
const operation = { id: "split-wire", action: "sch.wire.modify", documentType: 1, target: { primitiveId: "wire" },
  patch: { line: [[0, 0, 10, 0], [10, 0, 20, 0]], color: null, lineWidth: 1, lineType: 0 } };

function native(rows: readonly NativeSourceObject[]): SchematicNativeSnapshot {
  const source = `{"type":"DOCHEAD"}||${JSON.stringify(header)}|\n${rows.map((record) => `${JSON.stringify({ id: record.id, type: record.type })}||${JSON.stringify(record.body)}|\n`).join("")}`;
  return schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1",
    document: { documentUuid: "page", tabId: "page@project" }, source, components: [] });
}

function checkpoint(rows: readonly NativeSourceObject[], foreignValue = "unchanged"): NativeHistorySnapshot {
  const target = { uuid: "page", docType: "SCH_PAGE", metadata: header, records: rows.toSorted((a, b) => a.id.localeCompare(b.id)) };
  const other = { uuid: "other", docType: "CONFIG", metadata: { uuid: "other", docType: "CONFIG" },
    records: [{ id: "entry", type: "META", body: { value: foreignValue } }] };
  const documents = [target, other].map((entry) => Object.assign(structuredClone(entry), {
    records: entry.records.map((record) => Object.assign(structuredClone(record), { ticket: 1, client: null })), semanticSha256: sha256Json(entry) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: context.project.uuid,
    projectOwnerUuid: "b".repeat(32), branchUuid: "c".repeat(32), headHistoryUuid: "d".repeat(32),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

function row(rows: readonly NativeSourceObject[], id: string): NativeSourceObject {
  const found = rows.find((entry) => entry.id === id);
  assert.ok(found);
  return found;
}

function changed(rows: readonly NativeSourceObject[], id: string, patch: Record<string, unknown>): NativeSourceObject[] {
  return rows.map((entry) => entry.id === id ? { ...entry, body: { ...entry.body, ...patch } } : structuredClone(entry));
}

function fixture(): { input: Parameters<typeof verifySchematicWirePersistence>[1]; rows: NativeSourceObject[]; saved: NativeSourceObject[] } {
  const rows = [
    { id: "wire", type: "WIRE", body: { zIndex: 1, locked: false } },
    { id: "line", type: "LINE", body: { lineGroup: "wire", startX: 0, startY: 0, endX: 20, endY: 0,
      fillColor: null, fillStyle: null, strokeColor: null, strokeWidth: 1, strokeStyle: "SOLID" } },
    { id: "relevance", type: "ATTR", body: { parentId: "wire", key: "Relevance", value: "[]", x: null, y: null,
      zIndex: 3, keyVisible: false, valueVisible: false } },
    { id: "net", type: "ATTR", body: { parentId: "wire", key: "NET", value: "SYNTHETIC_NET", x: 10, y: -5,
      zIndex: 4, keyVisible: false, valueVisible: true } },
    { id: "foreign", type: "TEXT", body: { value: "unchanged", x: 100, y: 100 } },
  ];
  const beforeNative = native(rows);
  const expectedBefore = parseDocumentSource(beforeNative.source);
  const adapter = buildSchematicNativeWireAdapter(operation, expectedBefore, beforeNative);
  const afterNative = native(adapter.expected.objects);
  const saved = adapter.expected.objects.map((entry) => entry.type === "ATTR" ?
    { ...structuredClone(entry), body: { ...entry.body, zIndex: row(rows, entry.id).body["zIndex"] } } : structuredClone(entry));
  return { rows, saved, input: { before: checkpoint(rows), after: checkpoint(saved), expectedBefore,
    expectedAfter: adapter.expected, beforeNative, afterNative } };
}

void test("wire persistence proves the exact split with retained raw ATTR orders while generic proof refuses", () => {
  const f = fixture();
  const original = JSON.stringify(f.input);
  assert.equal(row(f.input.expectedBefore.objects, "relevance").body["zIndex"], 3);
  assert.equal(row(f.input.expectedBefore.objects, "net").body["zIndex"], 4);
  assert.equal(row(f.input.expectedAfter.objects, "relevance").body["zIndex"], 4);
  assert.equal(row(f.input.expectedAfter.objects, "net").body["zIndex"], 5);
  assert.equal(row(f.saved, "relevance").body["zIndex"], 3);
  assert.equal(row(f.saved, "net").body["zIndex"], 4);
  assert.equal(f.saved.filter((entry) => entry.type === "LINE").length, 2);
  assert.throws(() => verifyDesignPersistence(f.input), /Intended durable field/u);
  assert.equal(verifySchematicWirePersistence(operation, f.input)["ok"], true);
  assert.equal(JSON.stringify(f.input), original);
});

void test("wire baseline derives complete targets and admits only retained storage encoding", () => {
  const f = fixture();
  const stored = changed(changed(f.rows, "relevance", { zIndex: 1 }), "net", { zIndex: 2 });
  const input: Parameters<typeof verifySchematicWireBaseline>[1] = {
    checkpoint: checkpoint(stored), source: f.input.expectedBefore, native: f.input.beforeNative,
    targets: deriveDesignBaselineTargets(f.input.expectedBefore, f.input.expectedAfter),
  };
  const original = JSON.stringify(input);
  assert.throws(() => verifyDesignBaseline({ ...input, targets: [{ id: "relevance", fields: ["zIndex"] }] }));
  assert.equal(verifySchematicWireBaseline(operation, input)["ok"], true);
  assert.equal(JSON.stringify(input), original);
  assert.throws(() => verifySchematicWireBaseline(operation, { ...input, targets: [] }));
  assert.throws(() => verifySchematicWireBaseline(operation, { ...input, targets: [{ id: "wire", fields: ["zIndex"] }] }));
  for (const records of [changed(stored, "line", { endX: 21 }),
    stored.filter((entry) => entry.id !== "line"), changed(stored, "net", { value: "WRONG_NET" })]) {
    assert.throws(() => verifySchematicWireBaseline(operation, { ...input, checkpoint: checkpoint(records) }));
  }
  assert.throws(() => verifySchematicWireBaseline(operation, { ...input, native: undefined }));
});

void test("wire durable proof rejects collateral, missing geometry and arbitrary stored attribute changes", () => {
  const f = fixture();
  for (const after of [
    checkpoint(f.saved, "changed"), checkpoint(changed(f.saved, "foreign", { value: "changed" })),
    checkpoint(f.saved.filter((entry) => entry.id !== "line")), checkpoint(changed(f.saved, "line", { endX: 9 })),
    checkpoint(changed(f.saved, "line", { strokeWidth: 2 })), checkpoint(changed(f.saved, "relevance", { zIndex: 999 })),
    checkpoint(changed(f.saved, "net", { value: "WRONG_NET" })), checkpoint(changed(f.saved, "net", { valueVisible: false })),
    checkpoint(changed(f.saved, "net", { x: 11 })), checkpoint(changed(f.saved, "net", { strikeout: true })),
  ]) { assert.throws(() => verifySchematicWirePersistence(operation, { ...f.input, after })); }
  assert.throws(() => verifySchematicWirePersistence(operation, { ...f.input, beforeNative: undefined }));
  assert.throws(() => verifySchematicWirePersistence(operation, { ...f.input, afterNative: undefined }));
});

void test("wire persistence independently rejects self-consistent but unintended source and durable results", () => {
  const f = fixture();
  for (const records of [changed(f.input.expectedAfter.objects, "line", { endX: 9 }),
    changed(f.input.expectedAfter.objects, "relevance", { zIndex: 5 }), changed(f.input.expectedAfter.objects, "net", { valueVisible: false }),
    changed(f.input.expectedAfter.objects, "foreign", { value: "changed" })]) {
    const afterNative = native(records);
    assert.throws(() => verifySchematicWirePersistence(operation, { ...f.input, after: checkpoint(records),
      expectedAfter: parseDocumentSource(afterNative.source), afterNative }));
  }
  assert.throws(() => verifySchematicWirePersistence({ ...operation, id: "another-operation" }, f.input));
  assert.throws(() => verifySchematicWirePersistence({ ...operation, patch: { ...operation.patch, net: "SYNTHETIC_NET" } }, f.input));
});

function savedFixture(): { journal: Parameters<typeof verifyWireRetainedSaveAuthority>[0]; phase: Record<string, unknown>;
  acknowledgment: { ok: boolean; saved: boolean; closed: boolean; reopened: boolean; document: typeof context.document;
    exactSaveGuard: Record<string, unknown>; closeProof: Record<string, unknown>; openProof: Record<string, unknown>; projectUploadBarrier: Record<string, unknown> } } {
  const f = fixture();
  const hash = "a".repeat(64);
  const afterNative = schematicNativeSnapshotSchema.parse(f.input.afterNative);
  const journal: Parameters<typeof verifyWireRetainedSaveAuthority>[0] = {
    plan: { operation, expectedTopology: topology }, context, after: f.input.expectedAfter,
    afterNative, beforeTopology: topology, orphanedCallPossible: false,
  };
  const phase = { snapshot: journal.after, native: journal.afterNative, payload: { source: journal.afterNative?.source,
    read_consistency: { stable: true, attempts: 2, snapshotSha256: hash } } };
  const acknowledgment = { ok: true, saved: true, closed: true, reopened: true, document: context.document,
    exactSaveGuard: { passes: 2, labels: ["schematic-source"], snapshotSha256: [hash], saveInvokedInSameExecution: true, publicCompareAndSwapAvailable: false },
    closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
    openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: context.document.tabId, newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
    projectUploadBarrier: { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: context.project.uuid, scheduledWritesSettled: true, savedEditorChanges: false } };
  return { journal, phase, acknowledgment };
}

void test("wire retained Save authority binds the exact after state, topology and complete lifecycle receipt", () => {
  const f = savedFixture();
  const original = JSON.stringify(f);
  verifyWireRetainedSaveAuthority(f.journal, f.phase, f.acknowledgment);
  assert.equal(JSON.stringify(f), original);
  for (const patch of [{ orphanedCallPossible: true }, { beforeTopology: [] },
    { context: { ...context, document: { ...context.document, documentType: 3 } } },
    { plan: { ...f.journal.plan, operation: { ...operation, action: "sch.wire.delete" } } }]) {
    assert.throws(() => { verifyWireRetainedSaveAuthority({ ...f.journal, ...patch }, f.phase, f.acknowledgment); });
  }
  for (const missing of ["after", "afterNative", "beforeTopology"] as const) {
    const journal = { ...f.journal }; Reflect.deleteProperty(journal, missing);
    assert.throws(() => { verifyWireRetainedSaveAuthority(journal, f.phase, f.acknowledgment); });
  }
  assert.throws(() => { verifyWireRetainedSaveAuthority({ ...f.journal, plan: { operation } }, f.phase, f.acknowledgment); });
  assert.throws(() => { verifyWireRetainedSaveAuthority(f.journal, undefined, f.acknowledgment); });
  // oxlint-disable-next-line unicorn/no-useless-undefined -- Exercise missing evidence in the required third argument without changing the typed signature.
  assert.throws(() => { verifyWireRetainedSaveAuthority(f.journal, f.phase, undefined); });
  assert.throws(() => { verifyWireRetainedSaveAuthority(f.journal, { ...f.phase, snapshot: { ...f.journal.after, sha256: "b".repeat(64) } }, f.acknowledgment); });
  assert.throws(() => { verifyWireRetainedSaveAuthority(f.journal, { ...f.phase, native: { ...f.journal.afterNative, components: [{ id: "foreign" }] } }, f.acknowledgment); });
  assert.throws(() => { verifyWireRetainedSaveAuthority(f.journal, { ...f.phase, payload: { source: f.journal.afterNative?.source,
    read_consistency: { stable: false, attempts: 2, snapshotSha256: "a".repeat(64) } } }, f.acknowledgment); });
});

void test("wire retained Save authority refuses counterfeit or incomplete acknowledgments", () => {
  const { acknowledgment, journal, phase } = savedFixture();
  for (const patch of [{ ok: false }, { saved: false }, { closed: false }, { reopened: false },
    { document: { ...context.document, uuid: "foreign" } }, { document: { ...context.document, tabId: "foreign-tab" } },
    { exactSaveGuard: { ...acknowledgment.exactSaveGuard, snapshotSha256: ["b".repeat(64)] } },
    { exactSaveGuard: { ...acknowledgment.exactSaveGuard, passes: 1 } },
    { exactSaveGuard: { ...acknowledgment.exactSaveGuard, saveInvokedInSameExecution: false } },
    { closeProof: { ...acknowledgment.closeProof, closeCalls: 2 } }, { closeProof: { ...acknowledgment.closeProof, saved: true } },
    { closeProof: { ...acknowledgment.closeProof, oldFrameRemoved: false } }, { closeProof: { ...acknowledgment.closeProof, terminalNotification: false } },
    { openProof: { ...acknowledgment.openProof, readinessSamples: 1 } }, { openProof: { ...acknowledgment.openProof, exactContext: false } },
    { projectUploadBarrier: { ...acknowledgment.projectUploadBarrier, projectUuid: "foreign" } },
    { projectUploadBarrier: { ...acknowledgment.projectUploadBarrier, scheduledWritesSettled: false } },
    { projectUploadBarrier: { ...acknowledgment.projectUploadBarrier, savedEditorChanges: true } }]) {
    assert.throws(() => { verifyWireRetainedSaveAuthority(journal, phase, { ...acknowledgment, ...patch }); });
  }
  for (const missing of ["exactSaveGuard", "closeProof", "openProof", "projectUploadBarrier", "document"]) {
    const incomplete: Record<string, unknown> = { ...acknowledgment }; Reflect.deleteProperty(incomplete, missing);
    assert.throws(() => { verifyWireRetainedSaveAuthority(journal, phase, incomplete); });
  }
});

void test("wire Save evidence survives state changes and prevents treating the journal as unsaved", () => {
  const journal: Parameters<typeof hasSchematicWireSaveEvidence>[0] = {
    plan: { operation }, state: "applied-unsaved", saved: false, reopened: false, artifacts: [],
  };
  assert.equal(hasSchematicWireSaveEvidence(journal), false);
  for (const patch of [{ saved: true }, { reopened: true }, { wireSaveAttempted: true },
    { state: "save-reopen-dispatching" }, { state: "commit-needs-recovery" }, { orphanedCallPhase: "save-reopen" }, { orphanedCallPhase: "commit-upload-barrier" },
    { artifacts: [{ path: "/synthetic/06-wire-save-intent.json", bytes: 1, sha256: "c".repeat(64) }] },
    { artifacts: [{ path: "/synthetic/06-save-reopen.json", bytes: 1, sha256: "c".repeat(64) }] },
    { artifacts: [{ path: "/synthetic/07-commit-upload-barrier.json", bytes: 1, sha256: "d".repeat(64) }] },
    { artifacts: [{ path: "/synthetic/08-reopened.json", bytes: 1, sha256: "d".repeat(64) }] }]) {
    assert.equal(hasSchematicWireSaveEvidence({ ...journal, ...patch }), true);
    assert.equal(hasSchematicWireSaveEvidence({ ...journal, ...patch, plan: { operation: { ...operation, action: "sch.attribute.display" } } }), false);
  }
  assert.equal(hasSchematicWireSaveEvidence({ ...journal, state: "runtime-rebound-needs-reconciliation", wireSaveAttempted: true }), true);
  for (const malformed of [false, null, 1, "true"]) {
    assert.throws(() => hasSchematicWireSaveEvidence({ ...journal, wireSaveAttempted: malformed }));
  }
  assert.equal(hasSchematicWireSaveEvidence({ ...journal,
    artifacts: [{ path: "/synthetic/05-after.json", bytes: 1, sha256: "e".repeat(64) }] }), false);
});

void test("standalone wire retained-save recovery has no Save or navigation dispatch path", async () => {
  const source = await readFile(new URL("../src/design-execution.ts", import.meta.url), "utf8");
  const commitStart = source.indexOf("public async commit(");
  const recoveryStart = source.indexOf("private async reconcileSavedWire(");
  assert.ok(source.includes("private async reconcileSavedWire("));
  assert.ok(commitStart > recoveryStart);
  // oxlint-disable-next-line unicorn/prefer-set-has -- Recovery is source text; these checks require substring matching, not set membership.
  const recovery = source.slice(recoveryStart, commitStart);
  assert.equal(recovery.includes("this.call("), false);
  assert.equal(recovery.includes("dispatchWithOrphanTracking("), false);
  assert.equal(recovery.includes("buildSaveReopenCode("), false);
  assert.ok(recovery.includes("verifyWireRetainedSaveAuthority("));
  assert.ok(recovery.includes("verifySchematicWirePersistence("));
  assert.ok(recovery.includes("saveDispatchedByRecovery: false"));
  assert.ok(recovery.includes("navigationDispatchedByRecovery: false"));
  const commit = source.slice(commitStart, source.indexOf("private static hasLibrarySaveEvidence("));
  assert.ok(commit.includes("inspectDesignSaveAttempts(journal)"));
  assert.ok(commit.indexOf("inspectDesignSaveAttempts(journal)") < commit.indexOf("this.snapshot("));
  assert.ok(commit.includes("saveEvidence.attempted"));
  assert.ok(source.includes("verifySchematicWireBaseline("));
  assert.ok(source.includes("verifySchematicWirePersistence("));
});
