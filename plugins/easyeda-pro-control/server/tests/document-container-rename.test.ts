import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { assertDocumentContainerRenameContext, documentContainerRenameInverse, isDocumentContainerRenameProjectUnchanged, prepareDocumentContainerRename, verifyDocumentContainerRenameEffect } from "../src/document-container-rename.ts";

type Value = Record<string, unknown>;
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "active", documentType: 3,
  tabId: "active@project", parentProjectUuid: "project" } };
function operation(kind: "pcb" | "schematic"): Value { return { id: "rename-document", action: `document.${kind}.rename`, target: { uuid: kind }, name: "Renamed document" }; }
function document(uuid: string, docType: string, body: Value): NativeDocumentSnapshot {
  return { uuid, docType, metadata: { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2", user: { uuid: "original-author" } },
    records: [{ id: "META", type: "META", ticket: 1, client: null, body }], semanticSha256: "" };
}
function rehash(documents: readonly NativeDocumentSnapshot[]): NativeHistorySnapshot {
  const updated = documents.map((entry) => ({ ...entry, semanticSha256: sha256Json({ uuid: entry.uuid, docType: entry.docType,
    metadata: entry.metadata, records: entry.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: updated,
    semanticSha256: sha256Json(updated.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function history(): NativeHistorySnapshot {
  return rehash([document("board", "BOARD", { title: "Board" }),
    document("active", "PCB", { title: "Other board", source: "", parent: "", board: "", zIndex: null }),
    document("pcb", "PCB", { title: "Before", source: "", parent: "", board: "board", zIndex: null }),
    document("schematic", "SCH", { title: "Before", source: "", board: "board", zIndex: null }),
    document("page", "SCH_PAGE", { title: "Page", source: "", schematic: "schematic", zIndex: 1 })]);
}
function mutate(before: NativeHistorySnapshot, uuid: string, update: (value: NativeDocumentSnapshot) => void): NativeHistorySnapshot {
  const documents = structuredClone(before.documents), target = documents.find((entry) => entry.uuid === uuid); assert.ok(target);
  update(target); return { ...rehash(documents), checkpointSha256: before.checkpointSha256 };
}
function desired(before: NativeHistorySnapshot, kind: "pcb" | "schematic"): NativeHistorySnapshot {
  return mutate(before, kind, (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = "Renamed document";
    Reflect.set(meta, "ticket", 2); Reflect.set(meta, "client", "a".repeat(16));
    entry.metadata["updateTime"] = 2; entry.metadata["version"] = "2"; delete entry.metadata["user"]; });
}
for (const kind of ["pcb", "schematic"] as const) {
  void test(`${kind} rename preserves every peer and schematic child with metadata-only persistence`, () => {
    const before = history();
    const after = desired(before, kind), plan = prepareDocumentContainerRename(operation(kind), before, CONTEXT);
    assert.deepEqual(plan.childUuids, kind === "schematic" ? ["page"] : []);
    const proof = verifyDocumentContainerRenameEffect(plan, before, after);
    assert.equal(proof["effectVerified"], true); assert.equal(proof["saveInvoked"], false); assert.equal(proof["reopened"], false);
    assert.equal(proof["currentGenerationLiveValidated"], false);
    for (const uuid of ["active", "board", "page", kind === "pcb" ? "schematic" : "pcb"]) {
      assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, mutate(after, uuid, (entry) => { entry.metadata["extra"] = true; })), /children, peers/u);
      for (const patch of [{ ticket: 9 }, { client: "b".repeat(16) }, { firstTicket: 1 }, { firstClient: null }]) {
        assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, mutate(after, uuid, (entry) => { Object.assign(entry.records[0] ?? {}, patch); })));
      }
    }
    for (const field of ["source", "board", "zIndex", "future"]) {
      assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, mutate(after, kind, (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body[field] = "changed"; })));
    }
    for (const patch of [{ user: "other" }, { version: "999" }, { client: "bad" }, { updateTime: 0 }, { editVersion: "future" }]) {
      assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, mutate(after, kind, (entry) => { Object.assign(entry.metadata, patch); })));
    }
    assert.throws(() => verifyDocumentContainerRenameEffect({ ...plan, childUuids: ["unknown"] }, before, after));
    for (const patch of [{ ticket: 1 }, { ticket: 1.5 }, { client: null }, { client: "b".repeat(16) }, { firstTicket: 1 }, { firstClient: null }]) {
      assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, mutate(after, kind, (entry) => { Object.assign(entry.records[0] ?? {}, patch); })));
    }
    assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, { ...after, branchUuid: "other" }));
    assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, { ...after, projectOwnerUuid: "other" }));
    assert.equal(documentContainerRenameInverse(plan, before, after, "explicit-inverse").name, "Before");
    assert.throws(() => documentContainerRenameInverse(plan, before, before, "inverse"));
  });
  void test(`${kind} rename rejects unsupported serializer baselines before dispatch preparation`, () => {
    const before = history();
    for (const field of ["source", "board", "title", "zIndex", ...(kind === "pcb" ? ["parent"] : [])]) {
      assert.throws(() => prepareDocumentContainerRename(operation(kind), mutate(before, kind, (entry) => { const meta = entry.records[0]; assert.ok(meta); Reflect.deleteProperty(meta.body, field); }), CONTEXT));
    }
    for (const patch of [{ future: true }, { zIndex: 1 }, { source: "inherited" }, { board: "missing" }, { blockSymbolUuid: "cbb" }]) {
      assert.throws(() => prepareDocumentContainerRename(operation(kind), mutate(before, kind, (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CONTEXT));
    }
    assert.throws(() => prepareDocumentContainerRename(operation(kind), mutate(before, kind, (entry) => { entry.metadata["future"] = true; }), CONTEXT), /DOCHEAD/u);
    for (const patch of [{ target: { resultOf: "create" } }, { name: "Before" }, { name: " leading" }, { name: "line\nbreak" }, { callerCode: "unknown" }]) {
      assert.throws(() => prepareDocumentContainerRename({ ...operation(kind), ...patch }, before, CONTEXT));
    }
  });
}
void test("container rename refuses imported provenance, hierarchy, missing membership and contradictory aliases", () => {
  const before = history(), input = operation("schematic"), plan = prepareDocumentContainerRename(input, before, CONTEXT);
  for (const docType of ["INSTANCE", "VARIANT", "COMPONENT_GROUP", "COMPONENT_GROUP_DATA"]) {
    assert.throws(() => prepareDocumentContainerRename(input, rehash([...before.documents, document("unknown", docType, {})]), CONTEXT), /hierarchy/u);
  }
  for (const docType of [17, "2", null, 999]) {
    assert.throws(() => prepareDocumentContainerRename(input, rehash([...before.documents, document("symbol", "SYMBOL", { docType })]), CONTEXT), /CBB/u);
  }
  for (const docType of [2, 18, 19, 20, 21, 22, 25, 31]) {
    assert.doesNotThrow(() => prepareDocumentContainerRename(input, rehash([...before.documents, document("symbol", "SYMBOL", { docType })]), CONTEXT));
  }
  assert.throws(() => prepareDocumentContainerRename(input, mutate(before, "active", (entry) => { Reflect.set(entry, "atomHeaderHistory", []); }), CONTEXT), /provenance/u);
  assert.throws(() => prepareDocumentContainerRename(input, mutate(before, "page", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["schematic"] = "missing"; }), CONTEXT));
  assert.throws(() => prepareDocumentContainerRename(input, { ...before, semanticSha256: "b".repeat(64) }, CONTEXT), /integrity/u);
  const first = before.documents[0]; assert.ok(first);
  assert.throws(() => prepareDocumentContainerRename(input, rehash([...before.documents, first]), CONTEXT), /integrity/u);
  assert.throws(() => prepareDocumentContainerRename(input, mutate(before, "active", (entry) => { const meta = entry.records[0]; assert.ok(meta); Reflect.set(entry, "records", [...entry.records, structuredClone(meta)]); }), CONTEXT), /integrity/u);
  for (const context of [{ ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentLibraryUuid: "owner" } },
    { ...CONTEXT, document: { ...CONTEXT.document, tabId: "arbitrary" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentType: 1 } }]) {
    assert.throws(() => prepareDocumentContainerRename(input, before, context));
    assert.throws(() => { assertDocumentContainerRenameContext(plan, context); });
  }
  const sibling = document("peer", "SCH", { title: "RENAMED DOCUMENT", source: "", board: "", zIndex: null });
  assert.throws(() => prepareDocumentContainerRename(input, rehash([...before.documents, sibling]), CONTEXT), /normalized title/u);
});

void test("rename retains peer header lineage across checkpoint rebinding and binds clocks into its original plan", () => {
  const plain = history();
  const bind = (input: NativeHistorySnapshot, ticket = 1): NativeHistorySnapshot => mutate(input, "page", (entry) => {
    const value = { profile: "easyeda.native-history.schematic-header-lineage.v1", checkpointSha256: input.checkpointSha256, documentUuid: entry.uuid,
      headers: [{ ticket, metadata: entry.metadata }] };
    Reflect.set(entry, "headerHistory", { ...value, sha256: sha256Json(value) });
  });
  const before = bind(plain), plan = prepareDocumentContainerRename(operation("schematic"), before, CONTEXT);
  const after = bind({ ...desired(before, "schematic"), checkpointSha256: "b".repeat(64) });
  assert.equal(verifyDocumentContainerRenameEffect(plan, before, after)["effectVerified"], true);
  assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, bind(after, 2)), /children, peers/u);
  const changedClock = mutate(before, "active", (entry) => { Reflect.set(entry.records[0] ?? {}, "ticket", 99); });
  assert.notEqual(prepareDocumentContainerRename(operation("schematic"), changedClock, CONTEXT).beforeProjectSha256, plan.beforeProjectSha256);
  assert.throws(() => verifyDocumentContainerRenameEffect(plan, changedClock, after), /original checkpoint/u);
  const corrupt = mutate(after, "page", (entry) => { assert.ok(entry.headerHistory); Reflect.set(entry.headerHistory, "sha256", "0".repeat(64)); });
  assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, corrupt), /provenance/u);
});

void test("complete projection preserves target geometry clocks and peer ATTR insertion provenance", () => {
  const withLine = mutate(history(), "pcb", (entry) => { Reflect.set(entry, "records", [...entry.records, { id: "line", type: "LINE", ticket: 1, client: "a".repeat(16), body: { x: 1 } }]); });
  const before = mutate(withLine, "page", (entry) => { Reflect.set(entry, "records", [...entry.records, { id: "attr", type: "ATTR", ticket: 1, client: "a".repeat(16), firstTicket: 0, firstClient: "a".repeat(16), body: { key: "Name", value: "Peer" } }]); });
  const after = desired(before, "pcb"), plan = prepareDocumentContainerRename(operation("pcb"), before, CONTEXT);
  assert.equal(verifyDocumentContainerRenameEffect(plan, before, after)["effectVerified"], true);
  for (const [uuid, id, patch] of [["pcb", "line", { ticket: 2 }], ["pcb", "line", { client: "b".repeat(16) }],
    ["page", "attr", { firstTicket: 1 }], ["page", "attr", { firstClient: "b".repeat(16) }], ["active", "META", { ticket: 2 }]] as const) {
    const changed = mutate(after, uuid, (entry) => { const record = entry.records.find((item) => item.id === id); assert.ok(record); Object.assign(record, patch); });
    assert.throws(() => verifyDocumentContainerRenameEffect(plan, before, changed));
    const unchangedDelta = mutate(before, uuid, (entry) => { const record = entry.records.find((item) => item.id === id); assert.ok(record); Object.assign(record, patch); });
    assert.equal(isDocumentContainerRenameProjectUnchanged(plan, before, unchangedDelta), false);
  }
  assert.equal(isDocumentContainerRenameProjectUnchanged(plan, before, before), true);
});
