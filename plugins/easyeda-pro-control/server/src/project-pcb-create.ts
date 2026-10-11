import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { ExpectedContext } from "./engine.ts";
import { appendClosedContainerMetadataRecords, emptyNativeDocumentRecordChain, nativeDocumentRecordHistoryProjection, validateNativeDocumentRecordHistory } from "./native-document-record-history.ts";

export const PROJECT_PCB_CREATE_PROFILE = "easyeda-pro-control.closed-empty-free-pcb-create.v1";
const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
export const projectPcbCreatedIdSchema = z.string().regex(/^[a-f0-9]{16}$/u);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const board = z.union([z.literal(""), identifier]);
const pcbMeta = z.object({ title, parent: z.literal(""), source: z.literal(""), board, zIndex: z.null() }).strict();
const sibling = z.object({ uuid: identifier, title, board }).strict();
export const projectPcbCreatePlanSchema = z.object({ profile: z.literal(PROJECT_PCB_CREATE_PROFILE), projectUuid: identifier,
  ownerUuid: identifier, branchUuid: identifier, activeUuid: identifier, activeTabId: z.string().min(1).max(512),
  headerEditVersion: z.string().min(1).max(128).nullable(), desiredTitle: title,
  siblings: z.array(sibling).min(1).max(1024),
  baselineDocumentIds: z.array(identifier).min(1).max(100_000), beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict().refine((value) => Buffer.byteLength(`${JSON.stringify(value)}\n`, "utf8") <= 2_097_152,
  "PCB creation plan exceeds its immutable recovery artifact bound.");
export type ProjectPcbCreatePlan = z.infer<typeof projectPcbCreatePlanSchema>;
const ordinarySymbolTypes = new Set([2, 18, 19, 20, 21, 22, 25, 31]);
const lineageMetadata = z.record(z.string(), z.json());
const lineageHeader = z.object({ ticket: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), metadata: lineageMetadata }).strict();
const headerHistorySchema = z.object({ profile: z.literal("easyeda.native-history.schematic-header-lineage.v1"),
  checkpointSha256: z.string().regex(/^[a-f0-9]{64}$/u), documentUuid: identifier,
  headers: z.array(lineageHeader).min(1).max(4096),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict();

export function projectPcbCreateOperation(input: unknown): Extract<ReturnType<typeof libraryOperationSchema.parse>, { action: "document.pcb.create" }> {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "document.pcb.create" || Object.hasOwn(operation, "boardName")) { throw new Error("Closed free PCB creation requires an absent boardName; board attachment is not admitted."); }
  return operation;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const entries = document.records.filter((record) => record.id === "META" || record.type === "META");
  if (entries.length !== 1 || entries[0]?.id !== "META" || entries[0].type !== "META") { throw new Error("PCB creation requires exactly one META record per ordinary document."); }
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
  if (document?.docType !== type || isNativeDocumentDeleted(document)) { throw new Error("PCB creation requires exact ordinary checkpoint membership."); }
  return document;
}
function validateHistory(history: NativeHistorySnapshot): void {
  const known = new Set<string>();
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || history.documents.length === 0) { throw new Error("PCB creation checkpoint is incomplete."); }
  for (const document of history.documents) {
    if (known.has(document.uuid) || document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType ||
      document.semanticSha256 !== sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
        records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) || new Set(document.records.map((record) => record.id)).size !== document.records.length) {
      throw new Error("PCB creation checkpoint document integrity failed.");
    }
    known.add(document.uuid);
    validateNativeDocumentRecordHistory(document, history.checkpointSha256);
    if (Object.hasOwn(document, "headerHistory")) {
      const lineage = headerHistorySchema.parse(document.headerHistory), { sha256, ...body } = lineage;
      if (document.docType !== "SCH_PAGE" || lineage.documentUuid !== document.uuid || lineage.checkpointSha256 !== history.checkpointSha256 ||
        sha256 !== sha256Json(body) || canonicalJson(lineage.headers.at(-1)?.metadata) !== canonicalJson(document.metadata) ||
        lineage.headers.some((header, index) => index > 0 && header.ticket <= (lineage.headers[index - 1]?.ticket ?? Number.MAX_SAFE_INTEGER))) {
        throw new Error("PCB creation schematic header provenance is invalid.");
      }
    }
    if (Object.keys(document).some((key) => !["uuid", "docType", "metadata", "records", "semanticSha256", "headerHistory", "atomHeaderHistory", "documentRecordHistory"].includes(key)) ||
      document.records.some((record) => !Number.isSafeInteger(record.ticket) || record.ticket < 0 || (record.client !== null && typeof record.client !== "string") ||
        (Object.hasOwn(record, "firstTicket") !== Object.hasOwn(record, "firstClient")) ||
        (Object.hasOwn(record, "firstTicket") && (document.docType !== "SCH_PAGE" || record.type !== "ATTR" || !Number.isSafeInteger(record.firstTicket) || (record.firstTicket ?? -1) < 0 ||
          (record.firstTicket ?? Infinity) > record.ticket || (record.firstClient !== null && typeof record.firstClient !== "string"))) ||
        Object.keys(record).some((key) => !["id", "type", "ticket", "client", "firstTicket", "firstClient", "body"].includes(key)))) {
      throw new Error("PCB creation record envelope is unsupported.");
    }
    if (Object.hasOwn(document, "atomHeaderHistory")) { throw new Error("PCB creation does not admit imported library atom-header provenance."); }
    if (!isNativeDocumentDeleted(document)) {
      if (["INSTANCE", "VARIANT", "COMPONENT_GROUP", "COMPONENT_GROUP_DATA"].includes(document.docType)) { throw new Error("PCB creation excludes hierarchy, reuse blocks and variants."); }
      const symbolType = document.docType === "SYMBOL" ? metadata(document)["docType"] : undefined;
      if (document.docType === "SYMBOL" && (typeof symbolType !== "number" || !ordinarySymbolTypes.has(symbolType))) { throw new Error("PCB creation excludes CBB and unknown symbol types."); }
      if (["PCB", "SCH", "SCH_PAGE"].includes(document.docType)) {
        const value = metadata(document);
        if (value["source"] !== "" || Object.hasOwn(value, "blockSymbolUuid") || (document.docType === "PCB" && value["parent"] !== "")) { throw new Error("PCB creation excludes inherited and reuse-block documents."); }
        if (document.docType === "SCH_PAGE") { exactDocument(history, identifier.parse(value["schematic"]), "SCH"); }
      }
    }
  }
  if (history.semanticSha256 !== sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) { throw new Error("PCB creation complete checkpoint integrity failed."); }
}
export function assertProjectPcbCreateContext(input: ProjectPcbCreatePlan, context: ExpectedContext): void {
  const plan = projectPcbCreatePlanSchema.parse(input);
  if ((context.project.uuid ?? context.project.projectUuid) !== plan.projectUuid ||
    (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
    (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
    (context.document.uuid ?? context.document.documentUuid) !== plan.activeUuid || context.document.documentType !== 3 || context.document.tabId !== plan.activeTabId ||
    plan.activeTabId !== `${plan.activeUuid}@${plan.projectUuid}` || context.document["parentProjectUuid"] !== plan.projectUuid || context.document["parentLibraryUuid"] !== undefined) {
    throw new Error("PCB creation requires one exact owned clean PCB editor.");
  }
}

/** Match pinned G_e/H_e public naming, not the worker's different doc-ID count.
 * The operation creates a closed, unbound META-only PCB; no canvas is opened.
 */
export function prepareProjectPcbCreate(input: unknown, history: NativeHistorySnapshot, context: ExpectedContext): ProjectPcbCreatePlan {
  projectPcbCreateOperation(input); validateHistory(history);
  const active = exactDocument(history, context.document.uuid ?? context.document.documentUuid ?? "", "PCB");
  const siblings: ProjectPcbCreatePlan["siblings"] = [];
  let maximumSuffix = 0;
  for (const document of history.documents.filter((entry) => entry.docType === "PCB" && !isNativeDocumentDeleted(entry))) {
    const value = pcbMeta.parse(metadata(document));
    if (value.board !== "") { exactDocument(history, value.board, "BOARD"); }
    siblings.push({ uuid: document.uuid, title: value.title, board: value.board });
    const suffix = /^PCB[\s_]*(\d+)$/iu.exec(value.title)?.[1];
    if (suffix !== undefined) {
      const number = Number(suffix);
      if (!Number.isSafeInteger(number) || number >= Number.MAX_SAFE_INTEGER) { throw new Error("Native PCB-name counter is outside the exact integer range."); }
      maximumSuffix = Math.max(maximumSuffix, number);
    }
  }
  const plan = projectPcbCreatePlanSchema.parse({ profile: PROJECT_PCB_CREATE_PROFILE, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    branchUuid: history.branchUuid, activeUuid: active.uuid, activeTabId: context.document.tabId,
    headerEditVersion: Object.hasOwn(active.metadata, "editVersion") ? active.metadata["editVersion"] : null,
    desiredTitle: `PCB${String(maximumSuffix + 1)}`, siblings, baselineDocumentIds: history.documents.map((document) => document.uuid), beforeProjectSha256: completeHash(history) });
  assertProjectPcbCreateContext(plan, context); return plan;
}
function assertOriginal(plan: ProjectPcbCreatePlan, before: NativeHistorySnapshot): void {
  const expected = prepareProjectPcbCreate({ id: "verify-pcb-create", action: "document.pcb.create" }, before,
    { project: { uuid: plan.projectUuid, path: "/unused-proof-context" }, document: { uuid: plan.activeUuid, documentType: 3, tabId: plan.activeTabId, parentProjectUuid: plan.projectUuid } });
  if (canonicalJson(plan) !== canonicalJson(expected)) { throw new Error("PCB creation plan differs from the complete original checkpoint."); }
}
export function isProjectPcbCreateProjectUnchanged(input: ProjectPcbCreatePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): boolean {
  const plan = projectPcbCreatePlanSchema.parse(input); assertOriginal(plan, before); validateHistory(after);
  return after.projectUuid === plan.projectUuid && after.projectOwnerUuid === plan.ownerUuid && after.branchUuid === plan.branchUuid && completeHash(after) === plan.beforeProjectSha256;
}
export function verifyProjectPcbCreateEffect(input: ProjectPcbCreatePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot, returnedId: unknown): Record<string, unknown> {
  const plan = projectPcbCreatePlanSchema.parse(input);
  const originalId = projectPcbCreatedIdSchema.parse(returnedId);
  assertOriginal(plan, before); validateHistory(after);
  if (after.projectUuid !== plan.projectUuid || after.projectOwnerUuid !== plan.ownerUuid || after.branchUuid !== plan.branchUuid) { throw new Error("PCB creation project, owner or branch changed."); }
  const baselineIds = new Set(plan.baselineDocumentIds);
  const additions = after.documents.filter((entry) => !baselineIds.has(entry.uuid)), created = additions[0];
  if (additions.length !== 1 || created?.uuid !== originalId || created.docType !== "PCB" || isNativeDocumentDeleted(created)) { throw new Error("PCB creation requires exactly one new PCB matching its retained native return."); }
  if (canonicalJson(before.documents.map((entry) => projection(entry))) !== canonicalJson(after.documents.filter((entry) => baselineIds.has(entry.uuid)).map((entry) => projection(entry)))) {
    throw new Error("PCB creation changed pre-existing documents, headers, record clocks or project membership.");
  }
  const header = z.object({ uuid: z.literal(originalId), docType: z.literal("PCB"), client: projectPcbCreatedIdSchema,
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
    canonicalJson(meta.body) !== canonicalJson({ title: plan.desiredTitle, parent: "", source: "", board: "", zIndex: null })) {
    throw new Error("PCB creation changed unreviewed header, META clock, defaults or canvas records.");
  }
  if (canonicalJson(nativeDocumentRecordHistoryProjection(created)) !== canonicalJson(appendClosedContainerMetadataRecords(emptyNativeDocumentRecordChain(originalId), created))) {
    throw new Error("PCB creation raw record history is not exactly the pinned DOCHEAD and META pair.");
  }
  return { profile: PROJECT_PCB_CREATE_PROFILE, targetId: created.uuid, createdId: created.uuid, identityEvidence: "retained-native-return",
    beforeProjectSha256: plan.beforeProjectSha256, afterProjectSha256: completeHash(after), documentCount: after.documents.length,
    effectVerified: true, adapterKind: "native-task-equivalent", emptyPcb: true, freePcb: true, canvasInitialized: false, editorOpened: false,
    saveInvoked: false, reopened: false, currentGenerationLiveValidated: false, automaticInverseAvailable: false };
}
