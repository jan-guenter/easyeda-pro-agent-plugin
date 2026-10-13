import { z } from "zod";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { ExpectedContext } from "./engine.ts";
import { appendClosedContainerMetadataRecords, emptyNativeDocumentRecordChain, nativeDocumentRecordHistoryProjection, validateNativeDocumentRecordHistory } from "./native-document-record-history.ts";

export const PROJECT_SCHEMATIC_CREATE_PROFILE = "easyeda-pro-control.closed-empty-free-schematic-create.v1";
const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
export const projectSchematicCreatedIdSchema = z.string().regex(/^[a-f0-9]{16}$/u);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const board = z.union([z.literal(""), identifier]);
const schematicMeta = z.object({ title, source: z.literal(""), board, zIndex: z.null() }).strict();
const sibling = z.object({ uuid: identifier, title, board }).strict();
export const projectSchematicCreatePlanSchema = z.object({ profile: z.literal(PROJECT_SCHEMATIC_CREATE_PROFILE), projectUuid: identifier,
  ownerUuid: identifier, branchUuid: identifier, activeUuid: identifier, activeTabId: z.string().min(1).max(512),
  headerEditVersion: z.string().min(1).max(128).nullable(), desiredTitle: title,
  siblings: z.array(sibling).max(1024),
  baselineDocumentIds: z.array(identifier).min(1).max(100_000), beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict().refine((value) => Buffer.byteLength(`${JSON.stringify(value)}\n`, "utf8") <= 2_097_152,
  "schematic creation plan exceeds its immutable recovery artifact bound.");
export type ProjectSchematicCreatePlan = z.infer<typeof projectSchematicCreatePlanSchema>;
const ordinarySymbolTypes = new Set([2, 18, 19, 20, 21, 22, 25, 31]);
const lineageMetadata = z.record(z.string(), z.json());
const lineageHeader = z.object({ ticket: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), metadata: lineageMetadata }).strict();
const headerHistorySchema = z.object({ profile: z.literal("easyeda.native-history.schematic-header-lineage.v1"),
  checkpointSha256: z.string().regex(/^[a-f0-9]{64}$/u), documentUuid: identifier,
  headers: z.array(lineageHeader).min(1).max(4096),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict();

export function projectSchematicCreateOperation(input: unknown): Extract<ReturnType<typeof libraryOperationSchema.parse>, { action: "document.schematic.create" }> {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "document.schematic.create" || Object.hasOwn(operation, "boardName")) { throw new Error("Closed free schematic creation requires an absent boardName; board attachment is not admitted."); }
  return operation;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const entries = document.records.filter((record) => record.id === "META" || record.type === "META");
  if (entries.length !== 1 || entries[0]?.id !== "META" || entries[0].type !== "META") { throw new Error("schematic creation requires exactly one META record per ordinary document."); }
  return entries[0].body;
}
function projection(document: NativeDocumentSnapshot): unknown {
  // Rebinding a checkpoint receipt must not hide changed record clocks or
  // Earlier schematic headers. Only the receipt binding itself is excluded.
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: document.records, documentRecordHistory: nativeDocumentRecordHistoryProjection(document),
    ...(document.headerHistory === undefined ? {} : { headerHistory: { profile: document.headerHistory.profile, documentUuid: document.headerHistory.documentUuid, headers: document.headerHistory.headers } }) };
}
function completeHash(history: NativeHistorySnapshot): string { return sha256Json(history.documents.map((document) => projection(document))); }
function exactDocument(history: NativeHistorySnapshot, uuid: string, type: string): NativeDocumentSnapshot {
  const document = history.documents.find((entry) => entry.uuid === uuid);
  if (document?.docType !== type || isNativeDocumentDeleted(document)) { throw new Error("schematic creation requires exact ordinary checkpoint membership."); }
  return document;
}
function assertOrdinaryPageReferences(documents: ReadonlyMap<string, NativeDocumentSnapshot>, document: NativeDocumentSnapshot): void {
  // The pinned xTe subscriber revisits pages only through block-symbol
  // References. Resolve every component's persisted Symbol attribute instead
  // Of treating a missing local block definition as proof of an ordinary part.
  const referenceIndex = new Map<string, NativeDocumentSnapshot["records"][number][]>();
  for (const record of document.records) {
    if (record.type === "ATTR" && record.body["key"] === "Symbol") {
      const parent = identifier.parse(record.body["parentId"]), references = referenceIndex.get(parent) ?? [];
      references.push(record); referenceIndex.set(parent, references);
    }
  }
  for (const component of document.records.filter((record) => record.type === "COMPONENT")) {
    const references = referenceIndex.get(component.id) ?? [];
    const symbolId = identifier.parse(references[0]?.body["value"]);
    if (references.length !== 1) { throw new Error("Schematic creation requires one exact local symbol reference per component."); }
    const symbol = documents.get(symbolId);
    if (symbol?.docType !== "SYMBOL" || isNativeDocumentDeleted(symbol)) { throw new Error("Schematic creation requires exact ordinary checkpoint membership."); }
    const type = metadata(symbol)["docType"];
    const attrs = component.body["attrs"];
    // T9._handleSymbolData Reflect.set's every inline attrs key onto the
    // Model after construction; even an ordinary library type can therefore
    // Become block_symbol. No unreviewed model setter is admitted here.
    if (typeof type !== "number" || !ordinarySymbolTypes.has(type) ||
      (attrs !== undefined && (!isRecord(attrs) || Object.keys(attrs).length > 0))) {
      throw new Error("Schematic creation excludes block-symbol and contradictory or unsupported inline component attributes.");
    }
  }
  if (document.records.some((record) => ["BLOCK_SYMBOL", "INSTANCE"].includes(record.type))) { throw new Error("Schematic creation excludes hierarchy records."); }
}
function validateHistory(history: NativeHistorySnapshot): void {
  const documents = new Map(history.documents.map((document) => [document.uuid, document]));
  const known = new Set<string>();
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || history.documents.length === 0) { throw new Error("schematic creation checkpoint is incomplete."); }
  for (const document of history.documents) {
    if (known.has(document.uuid) || document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType ||
      document.semanticSha256 !== sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
        records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) || new Set(document.records.map((record) => record.id)).size !== document.records.length) {
      throw new Error("schematic creation checkpoint document integrity failed.");
    }
    known.add(document.uuid);
    validateNativeDocumentRecordHistory(document, history.checkpointSha256);
    if (Object.hasOwn(document, "headerHistory")) {
      const lineage = headerHistorySchema.parse(document.headerHistory), { sha256, ...body } = lineage;
      if (document.docType !== "SCH_PAGE" || lineage.documentUuid !== document.uuid || lineage.checkpointSha256 !== history.checkpointSha256 ||
        sha256 !== sha256Json(body) || canonicalJson(lineage.headers.at(-1)?.metadata) !== canonicalJson(document.metadata) ||
        lineage.headers.some((header, index) => index > 0 && header.ticket <= (lineage.headers[index - 1]?.ticket ?? Number.MAX_SAFE_INTEGER))) {
        throw new Error("schematic creation schematic header provenance is invalid.");
      }
    }
    if (Object.keys(document).some((key) => !["uuid", "docType", "metadata", "records", "semanticSha256", "headerHistory", "atomHeaderHistory", "documentRecordHistory"].includes(key)) ||
      document.records.some((record) => !Number.isSafeInteger(record.ticket) || record.ticket < 0 || (record.client !== null && typeof record.client !== "string") ||
        (Object.hasOwn(record, "firstTicket") !== Object.hasOwn(record, "firstClient")) ||
        (Object.hasOwn(record, "firstTicket") && (document.docType !== "SCH_PAGE" || record.type !== "ATTR" || !Number.isSafeInteger(record.firstTicket) || (record.firstTicket ?? -1) < 0 ||
          (record.firstTicket ?? Infinity) > record.ticket || (record.firstClient !== null && typeof record.firstClient !== "string"))) ||
        Object.keys(record).some((key) => !["id", "type", "ticket", "client", "firstTicket", "firstClient", "body"].includes(key)))) {
      throw new Error("schematic creation record envelope is unsupported.");
    }
    if (Object.hasOwn(document, "atomHeaderHistory")) { throw new Error("schematic creation does not admit imported library atom-header provenance."); }
    if (!isNativeDocumentDeleted(document)) {
      if (["INSTANCE", "VARIANT", "COMPONENT_GROUP", "COMPONENT_GROUP_DATA"].includes(document.docType)) { throw new Error("schematic creation excludes hierarchy, reuse blocks and variants."); }
      const symbolType = document.docType === "SYMBOL" ? metadata(document)["docType"] : undefined;
      if (document.docType === "SYMBOL" && (typeof symbolType !== "number" || !ordinarySymbolTypes.has(symbolType))) { throw new Error("schematic creation excludes CBB and unknown symbol types."); }
      if (["PCB", "SCH", "SCH_PAGE"].includes(document.docType)) {
        const value = metadata(document);
        if (value["source"] !== "" || Object.hasOwn(value, "blockSymbolUuid") || (document.docType === "PCB" && value["parent"] !== "")) { throw new Error("schematic creation excludes inherited and reuse-block documents."); }
        if (document.docType === "SCH_PAGE") {
          exactDocument(history, identifier.parse(value["schematic"]), "SCH");
          assertOrdinaryPageReferences(documents, document);
        }
      }
    }
  }
  if (history.semanticSha256 !== sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) { throw new Error("schematic creation complete checkpoint integrity failed."); }
}
export function assertProjectSchematicCreateContext(input: ProjectSchematicCreatePlan, context: ExpectedContext): void {
  const plan = projectSchematicCreatePlanSchema.parse(input);
  if ((context.project.uuid ?? context.project.projectUuid) !== plan.projectUuid ||
    (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
    (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
    (context.document.uuid ?? context.document.documentUuid) !== plan.activeUuid || context.document.documentType !== 3 || context.document.tabId !== plan.activeTabId ||
    plan.activeTabId !== `${plan.activeUuid}@${plan.projectUuid}` || context.document["parentProjectUuid"] !== plan.projectUuid || context.document["parentLibraryUuid"] !== undefined) {
    throw new Error("schematic creation requires one exact owned clean PCB editor.");
  }
}

/** Match pinned ED/$Ke public naming, not the worker's different doc-ID count.
 * The operation creates a closed, unbound META-only schematic; no canvas is opened.
 */
export function prepareProjectSchematicCreate(input: unknown, history: NativeHistorySnapshot, context: ExpectedContext): ProjectSchematicCreatePlan {
  projectSchematicCreateOperation(input); validateHistory(history);
  const active = exactDocument(history, context.document.uuid ?? context.document.documentUuid ?? "", "PCB");
  const siblings: ProjectSchematicCreatePlan["siblings"] = [];
  let maximumSuffix = 0;
  for (const document of history.documents.filter((entry) => entry.docType === "SCH" && !isNativeDocumentDeleted(entry))) {
    const value = schematicMeta.parse(metadata(document));
    if (value.board !== "") { exactDocument(history, value.board, "BOARD"); }
    siblings.push({ uuid: document.uuid, title: value.title, board: value.board });
    const suffix = /^Schematic[\s_]*(\d+)$/iu.exec(value.title)?.[1];
    if (suffix !== undefined) {
      const number = Number(suffix);
      if (!Number.isSafeInteger(number) || number >= Number.MAX_SAFE_INTEGER) { throw new Error("Native schematic-name counter is outside the exact integer range."); }
      maximumSuffix = Math.max(maximumSuffix, number);
    }
  }
  const plan = projectSchematicCreatePlanSchema.parse({ profile: PROJECT_SCHEMATIC_CREATE_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    branchUuid: history.branchUuid, activeUuid: active.uuid, activeTabId: context.document.tabId,
    headerEditVersion: Object.hasOwn(active.metadata, "editVersion") ? active.metadata["editVersion"] : null,
    desiredTitle: `Schematic${String(maximumSuffix + 1)}`, siblings, baselineDocumentIds: history.documents.map((document) => document.uuid), beforeProjectSha256: completeHash(history) });
  assertProjectSchematicCreateContext(plan, context); return plan;
}
function assertOriginal(plan: ProjectSchematicCreatePlan, before: NativeHistorySnapshot): void {
  const expected = prepareProjectSchematicCreate({ id: "verify-schematic-create", action: "document.schematic.create" }, before,
    { project: { uuid: plan.projectUuid, path: "/unused-proof-context" }, document: { uuid: plan.activeUuid, documentType: 3, tabId: plan.activeTabId, parentProjectUuid: plan.projectUuid } });
  if (canonicalJson(plan) !== canonicalJson(expected)) { throw new Error("schematic creation plan differs from the complete original checkpoint."); }
}
export function isProjectSchematicCreateProjectUnchanged(input: ProjectSchematicCreatePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): boolean {
  const plan = projectSchematicCreatePlanSchema.parse(input); assertOriginal(plan, before); validateHistory(after);
  return after.projectUuid === plan.projectUuid && after.projectOwnerUuid === plan.ownerUuid && after.branchUuid === plan.branchUuid && completeHash(after) === plan.beforeProjectSha256;
}
export function verifyProjectSchematicCreateEffect(input: ProjectSchematicCreatePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot, returnedId: unknown): Record<string, unknown> {
  const plan = projectSchematicCreatePlanSchema.parse(input);
  const originalId = projectSchematicCreatedIdSchema.parse(returnedId);
  assertOriginal(plan, before); validateHistory(after);
  if (after.projectUuid !== plan.projectUuid || after.projectOwnerUuid !== plan.ownerUuid || after.branchUuid !== plan.branchUuid) { throw new Error("schematic creation project, owner or branch changed."); }
  const baselineIds = new Set(plan.baselineDocumentIds);
  const additions = after.documents.filter((entry) => !baselineIds.has(entry.uuid)), created = additions[0];
  if (additions.length !== 1 || created?.uuid !== originalId || created.docType !== "SCH" || isNativeDocumentDeleted(created)) { throw new Error("schematic creation requires exactly one new schematic matching its retained native return."); }
  if (canonicalJson(before.documents.map((entry) => projection(entry))) !== canonicalJson(after.documents.filter((entry) => baselineIds.has(entry.uuid)).map((entry) => projection(entry)))) {
    throw new Error("schematic creation changed pre-existing documents, headers, record clocks or project membership.");
  }
  const header = z.object({ uuid: z.literal(originalId), docType: z.literal("SCH"), client: projectSchematicCreatedIdSchema,
    updateTime: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), version: z.string(), editVersion: z.string().optional() }).strict().parse(created.metadata);
  const meta = created.records[0];
  let maximumTicket = 0;
  for (const document of before.documents) {
    maximumTicket = Math.max(maximumTicket, nativeDocumentRecordHistoryProjection(document).maximumTicket);
    for (const record of document.records) { maximumTicket = Math.max(maximumTicket, record.ticket); }
    for (const item of document.headerHistory?.headers ?? []) { maximumTicket = Math.max(maximumTicket, item.ticket); }
  }
  if (header.version !== String(header.updateTime) || (header.editVersion ?? null) !== plan.headerEditVersion || created.records.length !== 1 ||
    meta?.id !== "META" || meta.type !== "META" || meta.client !== header.client || meta.ticket <= maximumTicket ||
    canonicalJson(meta.body) !== canonicalJson({ title: plan.desiredTitle, source: "", board: "", zIndex: null })) {
    throw new Error("schematic creation changed unreviewed header, META clock, defaults or canvas records.");
  }
  if (canonicalJson(nativeDocumentRecordHistoryProjection(created)) !== canonicalJson(appendClosedContainerMetadataRecords(emptyNativeDocumentRecordChain(originalId), created))) {
    throw new Error("schematic creation raw record history is not exactly the pinned DOCHEAD and META pair.");
  }
  return { profile: PROJECT_SCHEMATIC_CREATE_PROFILE, targetId: created.uuid, createdId: created.uuid, identityEvidence: "retained-native-return",
    beforeProjectSha256: plan.beforeProjectSha256, afterProjectSha256: completeHash(after), documentCount: after.documents.length,
    effectVerified: true, adapterKind: "native-task-equivalent", emptySchematic: true, freeSchematic: true, canvasInitialized: false, editorOpened: false,
    saveInvoked: false, reopened: false, currentGenerationLiveValidated: false, automaticInverseAvailable: false };
}
