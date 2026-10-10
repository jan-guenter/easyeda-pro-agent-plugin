import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHash } from "node:crypto";
import { decodeExactReadEnvelope, encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildLibraryExecutionExpression, decodeLibraryFileResult, libraryExecutionKind, validateLibraryMetadata } from "../src/library-runtime.ts";
import { assertProjectLibraryWriteTarget, projectLibraryOpenTarget, verifyProjectLibraryEffect, verifyProjectLibraryMetadata } from "../src/library-persistence-proof.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
import { libraryRuntimeFailureCategory } from "../src/library-runtime-guard.ts";

function execute(expression: string, eda: unknown, nativeGlobal: unknown = globalThis): Promise<unknown> {
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed compiler output against an isolated API fixture, never user code.
  const run = new Function("eda", "globalThis", `return ${expression};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- The fixture executes the compiler-owned function and immediately confines its result to unknown.
  const result: unknown = run(eda, nativeGlobal);
  return Promise.resolve(result);
}
function document(uuid: string, docType: string, objects: Record<string, unknown>): NativeDocumentSnapshot {
  const body = { docType, uuid, client: "test", version: "1", updateTime: 1, editVersion: "test" };
  const records = Object.entries(objects).map(([id, value], index) => `${JSON.stringify({ type: ["META", "CANVAS"].includes(id) ? id : "PAD", id, ticket: index + 2 })}||${JSON.stringify(value)}|\n`);
  const parsed = materializeNativeHistory([`${JSON.stringify({ type: "DOCHEAD", ticket: 1 })}||${JSON.stringify(body)}|\n${records.join("")}`]);
  const result = parsed[0];
  assert.ok(result);
  return result;
}
function history(documents: readonly NativeDocumentSnapshot[]): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "0".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: documents.toSorted((a, b) => a.uuid.localeCompare(b.uuid)), semanticSha256: "0".repeat(64) };
}
const exportOperation = { id: "export", action: "export.pcb.dsn", fileName: "board", maxBytes: 1000 };

void describe("typed library execution", () => {
  void it("opens symbols through the native library route without the late tabChange wait", async () => {
    const operation = { id: "symbol-open", action: "library.symbol.open", libraryUuid: "project", target: { uuid: "symbol" } };
    const scope = { projectUuid: "project", uuid: "symbol", documentType: 2 as const, metadataOwnerUuid: "owner" };
    const calls: unknown[] = [];
    const library = { marker: true, openInEditor(...args: unknown[]): Promise<string> { assert.equal(this.marker, true); calls.push(args); return Promise.resolve("symbol@project"); } };
    const eda = { lib_Symbol: library,
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "symbol", documentType: 2, tabId: "symbol@project", parentLibraryUuid: "owner" }) },
      dmt_EditorControl: {
      openLibraryDocument(): never { throw new Error("Must not use the hanging symbol route."); },
      activateDocument(tab: string): Promise<boolean> { calls.push(tab); return Promise.resolve(true); },
    } };
    const payload = decodeExactReadEnvelope(await execute(buildLibraryExecutionExpression(operation, false, scope), eda));
    assert.deepEqual(payload, { kind: "document-open", tabId: "symbol@project", activation: { acknowledgment: true, exactContextVerified: true } });
    assert.deepEqual(calls, [["symbol", "project", undefined], "symbol@project"]);
    await assert.rejects(execute(buildLibraryExecutionExpression(operation, false, scope), { lib_Symbol: { openInEditor(): never { throw new Error("private native detail"); } } }), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, "Library operation refused: document-open:api-call:NATIVE_REJECTED");
      assert.equal(libraryRuntimeFailureCategory(error.message), "native-preflight:LIBRARY_DOCUMENT_OPEN_API_CALL_NATIVE_REJECTED");
      return true;
    });
    assert.equal(libraryRuntimeFailureCategory("Library operation refused: arbitrary:api-call:NATIVE_REJECTED"), null);
    assert.equal(libraryRuntimeFailureCategory("Library operation refused: document-open:api-call:PRIVATE_SECRET"), null);
  });
  void it("opens only an exact project library member and activates the returned native tab", async () => {
    const operation = { id: "open", action: "library.footprint.open", libraryUuid: "project", target: { uuid: "asset" } };
    const checkpoint = { ...history([document("asset", "FOOTPRINT", { META: { title: "Existing" } })]), projectOwnerUuid: "owner" };
    assert.deepEqual(projectLibraryOpenTarget(operation, checkpoint), { uuid: "asset", documentType: 4, metadataOwnerUuid: "owner" });
    assert.throws(() => projectLibraryOpenTarget({ ...operation, libraryUuid: "external" }, checkpoint), /current-project/u);
    const calls: unknown[] = [];
    const scope = { projectUuid: "project", uuid: "asset", documentType: 4 as const, metadataOwnerUuid: "owner" };
    let acknowledgment: boolean | null = false, owner = "owner";
    const editor = { marker: true, openLibraryDocument(...args: unknown[]): Promise<string> { assert.equal(this.marker, true); calls.push(args); return Promise.resolve("asset@project"); }, activateDocument(tab: string): Promise<boolean | null> { calls.push(tab); return Promise.resolve(acknowledgment); } };
    const eda = { dmt_EditorControl: editor,
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "asset", documentType: 4, tabId: "asset@project", parentLibraryUuid: owner }) } };
    const payload = decodeExactReadEnvelope(await execute(buildLibraryExecutionExpression(operation, false, scope), eda));
    assert.deepEqual(payload, { kind: "document-open", tabId: "asset@project", activation: { acknowledgment: false, exactContextVerified: true } });
    assert.deepEqual(calls, [["project", "4", "asset", undefined], "asset@project"]);
    owner = "other";
    await assert.rejects(execute(buildLibraryExecutionExpression(operation, false, scope), eda), /ACTIVATION_FAILED/u);
    owner = "owner"; acknowledgment = null;
    await assert.rejects(execute(buildLibraryExecutionExpression(operation, false, scope), eda), /ACTIVATION_FAILED/u);
    assert.throws(() => buildLibraryExecutionExpression(operation), /Invalid input/u);
  });
  void it("transfers exact File bytes without a save dialog and preserves method receivers", async () => {
    let calls = 0;
    const api = { marker: true, getDsnFile(name: string): Promise<File> { assert.equal(this.marker, true); assert.equal(name, "board"); calls += 1; return Promise.resolve(new File([new Uint8Array([0, 1, 255, 34])], "board.dsn", { type: "application/octet-stream" })); } };
    const result = await execute(buildLibraryExecutionExpression(exportOperation), { pcb_ManufactureData: api });
    const file = decodeLibraryFileResult(result, 1000);
    assert.deepEqual(file.bytes, Buffer.from([0, 1, 255, 34]));
    assert.equal(calls, 1);
    assert.equal(file.sha256, createHash("sha256").update(file.bytes).digest("hex"));
    await assert.rejects(execute(buildLibraryExecutionExpression(exportOperation), { pcb_ManufactureData: { getDsnFile: (): Promise<unknown> => Promise.resolve({ name: "fake", size: 1, arrayBuffer: (): Promise<ArrayBuffer> => Promise.resolve(new ArrayBuffer(1)) }) } }), /FILE_INVALID/u);
    await assert.rejects(execute(buildLibraryExecutionExpression({ ...exportOperation, maxBytes: 1 }), { pcb_ManufactureData: api }), /FILE_INVALID/u);
  });
  void it("rejects truncated chunks, oversized requests, model generation and raw code before calls", () => {
    const bytes = Buffer.from("small export");
    const payload = { kind: "file-export", name: "board.dsn", mime: "", bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), chunks: [bytes.toString("base64")] };
    assert.throws(() => decodeLibraryFileResult(encodeExactReadEnvelope({ ...payload, chunks: ["AA=="] }), 100), /truncated/u);
    assert.throws(() => decodeLibraryFileResult(encodeExactReadEnvelope({ ...payload, sha256: "0".repeat(64) }), 100), /hash/u);
    assert.throws(() => buildLibraryExecutionExpression({ ...exportOperation, maxBytes: 3 * 1024 * 1024 }), /2 MiB/u);
    assert.throws(() => buildLibraryExecutionExpression({ ...exportOperation, code: "caller code" }));
    assert.throws(() => libraryExecutionKind({ id: "model", action: "export.pcb.model3d", fileName: "model", maxBytes: 100, fileType: "step", elements: [], modelMode: "Parts", autoGenerateModels: true }), /mutation/u);
    assert.throws(() => libraryExecutionKind({ id: "project", action: "project.open", target: { uuid: "project" } }), /proof profile/u);
  });
  void it("reads bounded metadata and rejects identity/family contradictions", async () => {
    const operation = libraryOperationSchema.parse({ id: "get", action: "library.footprint.get", libraryUuid: "library", target: { uuid: "asset" } });
    const metadata = { uuid: "asset", libraryUuid: "library", libraryType: "4", name: "Footprint", deep: { a: { b: { c: { d: { value: "complete" } } } } } };
    const api = { get(uuid: string, library: string): Promise<unknown> { assert.equal(uuid, "asset"); assert.equal(library, "library"); return Promise.resolve(metadata); } };
    const payload = decodeExactReadEnvelope(await execute(buildLibraryExecutionExpression(operation), { lib_Footprint: api }));
    assert.deepEqual(payload, { kind: "metadata-read", metadata });
    assert.deepEqual(validateLibraryMetadata(metadata, operation), metadata);
    assert.throws(() => validateLibraryMetadata({ ...metadata, uuid: "other" }, operation), /identity/u);
    assert.throws(() => validateLibraryMetadata({ ...metadata, libraryType: "2" }, operation), /family/u);
    const local = libraryOperationSchema.parse({ ...operation, libraryUuid: "project" });
    const checkpoint = { ...history([document("asset", "FOOTPRINT", { META: { title: "Footprint", description: "local" } })]), projectOwnerUuid: "owner-not-collection" };
    const native = { ...metadata, libraryUuid: "owner-not-collection", description: "local" };
    assert.equal(verifyProjectLibraryMetadata(local, native, checkpoint).collectionUuid, "project");
    assert.throws(() => verifyProjectLibraryMetadata(local, { ...native, libraryUuid: "wrong" }, checkpoint), /owner/u);
    assert.throws(() => verifyProjectLibraryMetadata(local, { ...native, name: "other" }, checkpoint), /name/u);
    assert.throws(() => verifyProjectLibraryMetadata(local, native, { ...checkpoint, documents: [] }), /membership/u);
  });
  void it("binds actual SDK symbol names to exact native search and durable display titles", async () => {
    const operation = libraryOperationSchema.parse({ id: "get", action: "library.symbol.get", libraryUuid: "project", target: { uuid: "symbol" } });
    const checkpoint = { ...history([document("symbol", "SYMBOL", { META: { title: "MixedCase", description: "local" } })]), projectOwnerUuid: "owner" };
    const original = JSON.stringify(checkpoint);
    const metadata = { uuid: "symbol", libraryUuid: "owner", libraryType: "2", name: "mixedcase", description: "local" };
    const evidence = { uuid: "symbol", projectUuid: "project", ownerUuid: "owner", searchTitle: "mixedcase", displayTitle: "MixedCase" };
    const calls: unknown[] = [];
    const nativeGlobal = { gVars: { currentProject: { projectId: "project" }, messageBus: { rpcCall(topic: string, args: unknown[]): Promise<unknown> {
      calls.push([topic, ...args]);
      return Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, title: "mixedcase", display_title: "MixedCase" } });
    } } }, top: {} };
    const payload = decodeExactReadEnvelope(await execute(buildLibraryExecutionExpression(operation, true), { lib_Symbol: { get: (): Promise<unknown> => Promise.resolve(metadata) } }, nativeGlobal));
    assert.deepEqual(payload, { kind: "metadata-read", metadata, projectSymbolMetadata: evidence });
    assert.deepEqual(calls, [["/PrjDB/symbol/getData", "symbol", "project"]]);
    assert.equal(verifyProjectLibraryMetadata(operation, metadata, checkpoint, evidence).symbolTitleEvidence?.sourceTitle, "MixedCase");
    assert.equal(metadata.name, "mixedcase");
    assert.equal(JSON.stringify(checkpoint), original);
    for (const patch of [{ uuid: "SYMBOL" }, { ownerUuid: "OWNER" }, { projectUuid: "PROJECT" }, { displayTitle: "mixedcase" }, { searchTitle: "another" }]) {
      assert.throws(() => verifyProjectLibraryMetadata(operation, metadata, checkpoint, { ...evidence, ...patch }), /metadata/u);
    }
    assert.throws(() => verifyProjectLibraryMetadata(operation, metadata, checkpoint), /evidence/u);
  });
  void it("proves a local empty-footprint creation against every project record", () => {
    const before = history([document("board", "PCB", { CANVAS: { originX: 0, originY: 0 } })]);
    const asset = document("footprint", "FOOTPRINT", { META: { title: "New", description: "test" }, CANVAS: { originX: 0, originY: 0 } });
    const after = history([...before.documents, asset]);
    const operation = { id: "create", action: "library.footprint.create", libraryUuid: "project", name: "New", description: "test" };
    assert.equal(verifyProjectLibraryEffect(operation, before, after, "footprint").reopened, false);
    assert.throws(() => { assertProjectLibraryWriteTarget(operation, after); }, /already exists/u);
    assert.throws(() => verifyProjectLibraryEffect(operation, before, history([asset]), "footprint"), /unrelated/u);
    const metadataCollateral = structuredClone(before.documents);
    const other = metadataCollateral[0];
    assert.ok(other);
    other.metadata["updateTime"] = 2;
    assert.throws(() => verifyProjectLibraryEffect(operation, before, history([...metadataCollateral, asset]), "footprint"), /unrelated/u);
    const populated = document("footprint", "FOOTPRINT", { META: { title: "New", description: "test" }, p1: { x: 99 } });
    assert.throws(() => verifyProjectLibraryEffect(operation, before, history([...before.documents, populated]), "footprint"), /empty native/u);
  });
  void it("proves name/description patches without changing pads or bindings", () => {
    const before = history([document("footprint", "FOOTPRINT", { META: { title: "Old", description: "old", source: "bound" }, p1: { x: 1, number: "1" } })]);
    const after = history([document("footprint", "FOOTPRINT", { META: { title: "New", description: "old", source: "bound" }, p1: { x: 1, number: "1" } })]);
    const operation = { id: "modify", action: "library.footprint.modify", libraryUuid: "project", target: { uuid: "footprint" }, patch: { name: "New" } };
    verifyProjectLibraryEffect(operation, before, after);
    const editHeader = structuredClone(after.documents);
    const target = editHeader[0];
    assert.ok(target);
    target.metadata["client"] = "f".repeat(16); target.metadata["updateTime"] = 2; target.metadata["version"] = "2";
    verifyProjectLibraryEffect(operation, before, history(editHeader));
    target.metadata["client"] = "invalid";
    assert.throws(() => verifyProjectLibraryEffect(operation, before, history(editHeader)), /edit header/u);
    assert.throws(() => { assertProjectLibraryWriteTarget({ ...operation, libraryUuid: "cloud" }, before); }, /local footprint/u);
    const collateral = history([document("footprint", "FOOTPRINT", { META: { title: "New", description: "old", source: "bound" }, p1: { x: 2, number: "1" } })]);
    assert.throws(() => verifyProjectLibraryEffect(operation, before, collateral), /geometry/u);
    assert.throws(() => libraryExecutionKind({ ...operation, patch: { description: null } }), /null-description/u);
  });
  void it("retains inactive footprints in proofs but never opens, binds or edits them; owner equality remains exact", () => {
    const original = document("deleted", "FOOTPRINT", { META: { title: "New" } });
    const asset = { ...original, records: [...original.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] };
    const before = { ...history([asset]), projectOwnerUuid: "owner" };
    const create = { id: "create", action: "library.footprint.create", libraryUuid: "project", name: "New" };
    assert.doesNotThrow(() => { assertProjectLibraryWriteTarget(create, before); });
    assert.throws(() => projectLibraryOpenTarget({ id: "open", action: "library.footprint.open", libraryUuid: "project", target: { uuid: "deleted" } }, before), /exact current-project/u);
    assert.throws(() => { assertProjectLibraryWriteTarget({ id: "modify", action: "library.footprint.modify", libraryUuid: "project", target: { uuid: "deleted" }, patch: { name: "Other" } }, before); }, /absent/u);
    assert.throws(() => verifyProjectLibraryMetadata({ id: "get", action: "library.footprint.get", libraryUuid: "project", target: { uuid: "deleted" } }, { uuid: "deleted", libraryUuid: "owner", name: "New" }, before), /membership/u);
    const after = { ...before, documents: [...before.documents, document("created", "FOOTPRINT", { META: { title: "New" } })] };
    verifyProjectLibraryEffect(create, before, after, "created");
    assert.throws(() => verifyProjectLibraryEffect(create, before, { ...after, projectOwnerUuid: "other" }, "created"), /owner/u);
    const afterWithoutOwner = history(after.documents), withoutOwner = history(before.documents);
    verifyProjectLibraryEffect(create, withoutOwner, afterWithoutOwner, "created");
    assert.throws(() => verifyProjectLibraryEffect(create, withoutOwner, after, "created"), /owner/u);
    const drift = structuredClone(after); const deleted = drift.documents[0]; assert.ok(deleted); deleted.metadata["updateTime"] = 9;
    assert.throws(() => verifyProjectLibraryEffect(create, before, drift, "created"), /unrelated/u);
  });
});
