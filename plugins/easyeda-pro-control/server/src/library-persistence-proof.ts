import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";

function documentValue(document: NativeDocumentSnapshot): unknown {
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: document.records.map(({ id, type, body }) => ({ id, type, body })) };
}
export function libraryProjectRecordsHash(history: NativeHistorySnapshot): string {
  return sha256Json(history.documents.map((document) => documentValue(document)));
}

export function projectLibraryOpenTarget(input: unknown, history: NativeHistorySnapshot): { uuid: string; documentType: number; metadataOwnerUuid?: string } {
  const operation = libraryOperationSchema.parse(input);
  if (!("target" in operation) || !("uuid" in operation.target)) { throw new Error("Editor open requires an exact existing document identity."); }
  const assetId = operation.target.uuid;
  const asset = history.documents.find((entry) => entry.uuid === assetId && !isNativeDocumentDeleted(entry));
  if (operation.action === "document.open" && asset !== undefined && ["PCB", "SCH_PAGE"].includes(asset.docType)) { return { uuid: assetId, documentType: asset.docType === "PCB" ? 3 : 1 }; }
  if ((operation.action === "library.footprint.open" || operation.action === "library.symbol.open") && operation.libraryUuid === history.projectUuid && asset?.docType === (operation.action === "library.footprint.open" ? "FOOTPRINT" : "SYMBOL") && typeof history.projectOwnerUuid === "string" && history.projectOwnerUuid.length > 0 && asset.records.some((entry) => entry.id === "META" && entry.type === "META")) {
    return { uuid: assetId, documentType: asset.docType === "FOOTPRINT" ? 4 : 2, metadataOwnerUuid: history.projectOwnerUuid };
  }
  throw new Error("Editor target is not an exact current-project PCB, schematic page or supported library asset.");
}
/** LIB_* get returns metadata.owner.uuid as libraryUuid, not the collection
 * path passed to the project-library lookup. Bind both meanings independently.
 */
export function verifyProjectLibraryMetadata(input: unknown, metadata: Record<string, unknown>, history: NativeHistorySnapshot, projectSymbolMetadata?: unknown): { collectionUuid: string; ownerUuid: string; assetUuid: string; proof: string; symbolTitleEvidence?: { sourceTitle: string; searchTitle: string; sha256: string } } {
  const operation = libraryOperationSchema.parse(input);
  if (!("libraryUuid" in operation) || operation.libraryUuid !== history.projectUuid || !("target" in operation) || !("uuid" in operation.target) || !operation.action.endsWith(".get")) { throw new Error("Project metadata proof requires the exact project collection and asset identity."); }
  const expectedTypes: Readonly<Record<string, string>> = { "library.footprint.get": "FOOTPRINT", "library.symbol.get": "SYMBOL", "library.device.get": "DEVICE" };
  const expectedType = expectedTypes[operation.action];
  const assetId = operation.target.uuid;
  const document = history.documents.find((entry) => entry.uuid === assetId && entry.docType === expectedType && !isNativeDocumentDeleted(entry));
  const meta = document?.records.find((entry) => entry.id === "META" && entry.type === "META");
  let expectedName = meta?.body["title"];
  let symbolTitleEvidence: { sourceTitle: string; searchTitle: string; sha256: string } | undefined;
  if (expectedType === "SYMBOL") {
    // Native symbol search titles use a mode/locale-dependent case projection.
    // Bind the actual native projection and raw display title independently;
    // Never fold WSL-side identifiers or alter the retained SDK/source values.
    const native = projectSymbolMetadata;
    if (!isRecord(native) || Object.keys(native).length !== 5 || native["uuid"] !== assetId || native["projectUuid"] !== history.projectUuid || native["ownerUuid"] !== history.projectOwnerUuid || typeof native["displayTitle"] !== "string" || native["displayTitle"] !== expectedName || typeof native["searchTitle"] !== "string" || native["searchTitle"].length > 512) { throw new Error("Symbol metadata lacks exact native search/display-title and project-owner evidence."); }
    expectedName = native["searchTitle"] || native["displayTitle"];
    symbolTitleEvidence = { sourceTitle: native["displayTitle"], searchTitle: native["searchTitle"], sha256: sha256Json(native) };
  }
  if (meta === undefined || metadata["uuid"] !== assetId || metadata["name"] !== expectedName || history.projectOwnerUuid === undefined || metadata["libraryUuid"] !== history.projectOwnerUuid) { throw new Error("Library metadata differs from checkpoint asset membership, name or project owner."); }
  if (meta.body["description"] !== undefined && metadata["description"] !== meta.body["description"]) { throw new Error("Library description differs from the project checkpoint."); }
  return { collectionUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid, assetUuid: assetId, proof: "hash-verified-project-owner-and-asset-metadata", ...(symbolTitleEvidence === undefined ? {} : { symbolTitleEvidence }) };
}
function same(left: unknown, right: unknown): boolean { return canonicalJson(left) === canonicalJson(right); }
function verifyTargetMetadata(before: Record<string, unknown>, after: Record<string, unknown>): void {
  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => Object.hasOwn(before, key) !== Object.hasOwn(after, key) || !same({ value: before[key] }, { value: after[key] }));
  if (fields.length === 0) { return; }
  const time = after["updateTime"];
  if (fields.some((key) => !["client", "updateTime", "version"].includes(key)) || typeof after["client"] !== "string" || !/^[a-f0-9]{16}$/u.test(after["client"]) || typeof time !== "number" || !Number.isSafeInteger(time) || time < 0 || after["version"] !== String(time) || (typeof before["updateTime"] === "number" && time < before["updateTime"])) { throw new Error("Target library metadata changed outside the reviewed native edit header."); }
}

export function assertProjectLibraryWriteTarget(input: unknown, history: NativeHistorySnapshot): void {
  const operation = libraryOperationSchema.parse(input);
  if ((operation.action !== "library.footprint.create" && operation.action !== "library.footprint.modify") || operation.libraryUuid !== history.projectUuid) { throw new Error("Library writes require the exact active project's local footprint library."); }
  if (operation.action === "library.footprint.modify") {
    if (!("uuid" in operation.target)) { throw new Error("Unresolved library target."); }
    const targetId = operation.target.uuid;
    const document = history.documents.find((entry) => entry.uuid === targetId && !isNativeDocumentDeleted(entry));
    if (document?.docType !== "FOOTPRINT" || !document.records.some(({ id, type }) => id === "META" && type === "META")) { throw new Error("Footprint target is absent from the complete project checkpoint."); }
  }
  const name = operation.action === "library.footprint.create" ? operation.name : operation.patch.name;
  if (name !== undefined && history.documents.some((document) => document.docType === "FOOTPRINT" && !isNativeDocumentDeleted(document) && document.records.some((record) => record.type === "META" && record.body["title"] === name) && (operation.action === "library.footprint.create" || !("uuid" in operation.target) || document.uuid !== operation.target.uuid))) {
    throw new Error("A project footprint with that exact name already exists.");
  }
}

/** The complete checkpoint comparison protects every other project/library document. */
export function verifyProjectLibraryEffect(input: unknown, before: NativeHistorySnapshot, after: NativeHistorySnapshot, createdId?: string): { profile: string; targetId: string; beforeSha256: string; afterSha256: string; reopened: false } {
  assertProjectLibraryWriteTarget(input, before);
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "library.footprint.create" && operation.action !== "library.footprint.modify") { throw new Error("Unreviewed library persistence profile."); }
  if (before.projectUuid !== after.projectUuid || before.branchUuid !== after.branchUuid || before.projectOwnerUuid !== after.projectOwnerUuid) { throw new Error("Project/branch/owner changed during library operation."); }
  let id = createdId;
  if (operation.action === "library.footprint.modify") { id = "uuid" in operation.target ? operation.target.uuid : undefined; }
  if (id === undefined || id.length === 0) { throw new Error("Missing exact changed asset identity."); }
  const old = before.documents.find((document) => document.uuid === id);
  const changed = after.documents.find((document) => document.uuid === id);
  if (changed?.docType !== "FOOTPRINT" || isNativeDocumentDeleted(changed)) { throw new Error("Persisted active footprint is missing."); }
  if (!same(before.documents.filter((document) => document.uuid !== id).map((document) => documentValue(document)), after.documents.filter((document) => document.uuid !== id).map((document) => documentValue(document)))) { throw new Error("Library operation altered unrelated project records."); }
  const meta = changed.records.find((record) => record.id === "META" && record.type === "META");
  if (meta === undefined) { throw new Error("Persisted library metadata missing."); }
  if (operation.action === "library.footprint.create") {
    if (old !== undefined || changed.records.some((record) => !["META", "CANVAS"].includes(record.type)) || meta.body["title"] !== operation.name || (operation.description !== undefined && meta.body["description"] !== operation.description)) { throw new Error("New footprint is not the requested empty native asset."); }
  } else {
    if (old === undefined) { throw new Error("Original library asset disappeared."); }
    verifyTargetMetadata(old.metadata, changed.metadata);
    const expectedRecords = old.records.map(({ id: recordId, type, body }) => {
      const expectedBody = { ...body };
      if (recordId === "META" && type === "META") {
        if (operation.patch.name !== undefined) { expectedBody["title"] = operation.patch.name; }
        if (operation.patch.description !== undefined) { expectedBody["description"] = operation.patch.description; }
      }
      return { id: recordId, type, body: expectedBody, ticket: 0, client: null };
    });
    const expectedDocument = documentValue({ ...old, metadata: changed.metadata, records: expectedRecords });
    if (!same(expectedDocument, documentValue(changed))) { throw new Error("Library patch changed geometry, bindings or unrequested metadata."); }
  }
  return { profile: "easyeda-pro-control.project-footprint-persistence.v1", targetId: id, beforeSha256: libraryProjectRecordsHash(before), afterSha256: libraryProjectRecordsHash(after), reopened: false };
}
