import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { ExpectedContext } from "./engine.ts";
import { appendClosedContainerMetadataRecords, nativeDocumentRecordHistoryProjection, validateNativeDocumentRecordHistory } from "./native-document-record-history.ts";

export const DOCUMENT_CONTAINER_RENAME_PROFILE = "easyeda-pro-control.closed-document-rename.v1";
const identifier = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const board = z.union([z.literal(""), identifier]);
const schematicMeta = z.object({ title, source: z.literal(""), board, zIndex: z.null() }).strict();
const pcbMeta = schematicMeta.extend({ parent: z.literal("") }).strict();
export const documentContainerRenamePlanSchema = z.object({
  profile: z.literal(DOCUMENT_CONTAINER_RENAME_PROFILE), kind: z.enum(["pcb", "schematic"]),
  projectUuid: identifier, ownerUuid: identifier, branchUuid: identifier, targetUuid: identifier,
  activeUuid: identifier, activeTabId: z.string().min(1).max(512),
  beforeTitle: title, desiredTitle: title, boardUuid: board,
  childUuids: z.array(identifier).max(1024), siblingTitles: z.array(title).max(1024),
  headerEditVersion: z.string().min(1).max(128).nullable(),
  beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict();
export type DocumentContainerRenamePlan = z.infer<typeof documentContainerRenamePlanSchema>;
const unchangedSymbolTypes = new Set([2, 18, 19, 20, 21, 22, 25, 31]);
const lineageMetadata = z.record(z.string(), z.json());
const lineageHeader = z.object({ ticket: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), metadata: lineageMetadata }).strict();
const headerHistorySchema = z.object({ profile: z.literal("easyeda.native-history.schematic-header-lineage.v1"),
  checkpointSha256: z.string().regex(/^[a-f0-9]{64}$/u), documentUuid: identifier,
  headers: z.array(lineageHeader).min(1).max(4096),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict();

function validateHeaderHistory(document: NativeDocumentSnapshot, history: NativeHistorySnapshot): void {
  if (!Object.hasOwn(document, "headerHistory")) { return; }
  const lineage = headerHistorySchema.parse(document.headerHistory);
  const { sha256, ...body } = lineage;
  if (document.docType !== "SCH_PAGE" || lineage.documentUuid !== document.uuid || lineage.checkpointSha256 !== history.checkpointSha256 || sha256 !== sha256Json(body) ||
    canonicalJson(lineage.headers.at(-1)?.metadata) !== canonicalJson(document.metadata) ||
    lineage.headers.some((header, index) => index > 0 && header.ticket <= (lineage.headers[index - 1]?.ticket ?? Number.MAX_SAFE_INTEGER))) {
    throw new Error("Document rename schematic header provenance is invalid.");
  }
}

export function documentContainerRenameOperation(input: unknown): Extract<ReturnType<typeof libraryOperationSchema.parse>, { action: "document.pcb.rename" | "document.schematic.rename" }> {
  const operation = libraryOperationSchema.parse(input);
  if ((operation.action !== "document.pcb.rename" && operation.action !== "document.schematic.rename") || !("uuid" in operation.target)) {
    throw new Error("Document rename requires one exact existing PCB or schematic identity.");
  }
  title.parse(operation.name);
  return operation;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const entries = document.records.filter((record) => record.id === "META" || record.type === "META");
  if (entries.length !== 1 || entries[0]?.id !== "META" || entries[0].type !== "META") { throw new Error("Document rename requires exactly one META record."); }
  return entries[0].body;
}
function exactDocument(history: NativeHistorySnapshot, uuid: string, type: string): NativeDocumentSnapshot {
  const matches = history.documents.filter((document) => document.uuid === uuid);
  if (matches.length !== 1 || matches[0]?.docType !== type || isNativeDocumentDeleted(matches[0])) { throw new Error("Document rename identity is not an exact active checkpoint member."); }
  return matches[0];
}
function validateHistory(history: NativeHistorySnapshot): void {
  const known = new Set<string>();
  if (history.profile !== "easyeda.native-history.linear-gcm-gzip.v1" || history.documents.length === 0) { throw new Error("Document rename checkpoint is incomplete."); }
  for (const document of history.documents) {
    if (known.has(document.uuid) || document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType ||
      document.semanticSha256 !== sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
        records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) ||
      new Set(document.records.map((record) => record.id)).size !== document.records.length) { throw new Error("Document rename checkpoint document integrity failed."); }
    known.add(document.uuid);
    validateNativeDocumentRecordHistory(document, history.checkpointSha256);
    validateHeaderHistory(document, history);
    if (Object.keys(document).some((key) => !["uuid", "docType", "metadata", "records", "semanticSha256", "headerHistory", "atomHeaderHistory", "documentRecordHistory"].includes(key)) ||
      document.records.some((record) => !Number.isSafeInteger(record.ticket) || record.ticket < 0 ||
        (record.client !== null && typeof record.client !== "string") ||
        (Object.hasOwn(record, "firstTicket") !== Object.hasOwn(record, "firstClient")) ||
        (Object.hasOwn(record, "firstTicket") && (document.docType !== "SCH_PAGE" || record.type !== "ATTR" || !Number.isSafeInteger(record.firstTicket) || (record.firstTicket ?? -1) < 0 || (record.firstTicket ?? Infinity) > record.ticket || (record.firstClient !== null && typeof record.firstClient !== "string"))) ||
        Object.keys(record).some((key) => !["id", "type", "ticket", "client", "firstTicket", "firstClient", "body"].includes(key)))) {
      throw new Error("Document rename record envelope is unsupported.");
    }
    // The executor uses the strict history reader. Do not accept an alternate
    // Imported-atom projection without its separately sealed occurrence proof.
    if (Object.hasOwn(document, "atomHeaderHistory")) { throw new Error("Document rename does not admit imported library atom-header provenance."); }
    if (!isNativeDocumentDeleted(document)) {
      if (["INSTANCE", "VARIANT", "COMPONENT_GROUP", "COMPONENT_GROUP_DATA"].includes(document.docType)) { throw new Error("Document rename excludes hierarchy, reuse blocks and variants."); }
      const symbolType = document.docType === "SYMBOL" ? metadata(document)["docType"] : undefined;
      if (document.docType === "SYMBOL" && (typeof symbolType !== "number" || !unchangedSymbolTypes.has(symbolType))) { throw new Error("Document rename excludes CBB and unknown symbol types."); }
      if (["PCB", "SCH", "SCH_PAGE"].includes(document.docType)) {
        const value = metadata(document);
        if (value["source"] !== "" || Object.hasOwn(value, "blockSymbolUuid") || (document.docType === "PCB" && value["parent"] !== "")) {
          throw new Error("Document rename excludes inherited and reuse-block documents.");
        }
      }
    }
  }
  if (history.semanticSha256 !== sha256Json(history.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 })))) {
    throw new Error("Document rename complete checkpoint integrity failed.");
  }
}

export function assertDocumentContainerRenameContext(input: DocumentContainerRenamePlan, context: ExpectedContext): void {
  const plan = documentContainerRenamePlanSchema.parse(input);
  if ((context.project.uuid ?? context.project.projectUuid) !== plan.projectUuid ||
    (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
    (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
    (context.document.uuid ?? context.document.documentUuid) !== plan.activeUuid || context.document.tabId !== plan.activeTabId || plan.activeTabId !== `${plan.activeUuid}@${plan.projectUuid}` ||
    context.document.documentType !== 3 || context.document["parentProjectUuid"] !== plan.projectUuid || context.document["parentLibraryUuid"] !== undefined ||
    plan.activeUuid === plan.targetUuid || plan.childUuids.includes(plan.activeUuid)) {
    throw new Error("Closed document rename requires one other exact owned clean PCB editor.");
  }
}

/** The pinned writers serialize a fixed META field set and force zIndex=null.
 * Reject every baseline they cannot preserve before preparing a native call.
 */
export function prepareDocumentContainerRename(input: unknown, history: NativeHistorySnapshot, context: ExpectedContext): DocumentContainerRenamePlan {
  const operation = documentContainerRenameOperation(input);
  validateHistory(history);
  if (!("uuid" in operation.target)) { throw new Error("Document rename target identity is missing."); }
  const kind = operation.action === "document.pcb.rename" ? "pcb" : "schematic", type = kind === "pcb" ? "PCB" : "SCH";
  const target = exactDocument(history, operation.target.uuid, type);
  const before = (kind === "pcb" ? pcbMeta : schematicMeta).parse(metadata(target));
  const headerKeys = new Set(["uuid", "docType", "client", "updateTime", "version", "user", "editVersion"]);
  if (Object.keys(target.metadata).some((key) => !headerKeys.has(key))) { throw new Error("Document rename would drop unreviewed DOCHEAD fields."); }
  const headerEditVersion = Object.hasOwn(target.metadata, "editVersion") ? z.string().min(1).max(128).parse(target.metadata["editVersion"]) : null;
  if (before.board !== "") { exactDocument(history, before.board, "BOARD"); }
  const active = exactDocument(history, context.document.uuid ?? context.document.documentUuid ?? "", "PCB");
  const childUuids: string[] = [], siblingTitles: string[] = [];
  for (const document of history.documents.filter((entry) => !isNativeDocumentDeleted(entry))) {
    if (document.docType === type && document.uuid !== target.uuid) {
      const peerTitle = title.parse(metadata(document)["title"]);
      siblingTitles.push(peerTitle);
      if (peerTitle.toLowerCase() === operation.name.toLowerCase()) { throw new Error("A peer document already has that normalized title."); }
    }
    if (kind === "schematic" && document.docType === "SCH_PAGE") {
      const parent = identifier.parse(metadata(document)["schematic"]);
      exactDocument(history, parent, "SCH");
      if (parent === target.uuid) { childUuids.push(document.uuid); }
    }
  }
  if (operation.name === before.title) { throw new Error("Document rename refuses an unchanged title."); }
  const plan = documentContainerRenamePlanSchema.parse({ profile: DOCUMENT_CONTAINER_RENAME_PROFILE, kind,
    projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid, branchUuid: history.branchUuid, targetUuid: target.uuid,
    activeUuid: active.uuid, activeTabId: context.document.tabId, beforeTitle: before.title, desiredTitle: operation.name,
    boardUuid: before.board, childUuids: childUuids.toSorted(), siblingTitles, headerEditVersion, beforeProjectSha256: completeProjectHash(history) });
  assertDocumentContainerRenameContext(plan, context);
  return plan;
}
function projection(document: NativeDocumentSnapshot): unknown {
  // A new checkpoint rebinds the lineage receipt, not its retained headers.
  // Preserve all record clocks/insertion provenance, unlike semantic-only hashes.
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata, records: document.records, documentRecordHistory: nativeDocumentRecordHistoryProjection(document),
    ...(document.headerHistory === undefined ? {} : { headerHistory: { profile: document.headerHistory.profile, documentUuid: document.headerHistory.documentUuid, headers: document.headerHistory.headers } }) };
}
function completeProjectHash(history: NativeHistorySnapshot): string { return sha256Json(history.documents.map((document) => projection(document))); }
/** Recovery cannot classify an envelope-only change as semantic no-mutation. */
export function isDocumentContainerRenameProjectUnchanged(input: DocumentContainerRenamePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): boolean {
  const plan = documentContainerRenamePlanSchema.parse(input);
  validateHistory(before); validateHistory(after);
  if (completeProjectHash(before) !== plan.beforeProjectSha256 || before.projectUuid !== plan.projectUuid || before.branchUuid !== plan.branchUuid || before.projectOwnerUuid !== plan.ownerUuid) {
    throw new Error("Document rename full original checkpoint binding changed.");
  }
  return after.projectUuid === plan.projectUuid && after.branchUuid === plan.branchUuid && after.projectOwnerUuid === plan.ownerUuid && completeProjectHash(after) === plan.beforeProjectSha256;
}
export function verifyDocumentContainerRenameEffect(input: DocumentContainerRenamePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): Record<string, unknown> {
  const plan = documentContainerRenamePlanSchema.parse(input);
  const expectedPlan = prepareDocumentContainerRename({ id: "verify-document-rename", action: `document.${plan.kind}.rename`, target: { uuid: plan.targetUuid }, name: plan.desiredTitle }, before,
    { project: { uuid: plan.projectUuid, path: "/unused-proof-context" }, document: { uuid: plan.activeUuid, tabId: plan.activeTabId, documentType: 3, parentProjectUuid: plan.projectUuid } });
  if (canonicalJson(plan) !== canonicalJson(expectedPlan)) { throw new Error("Document rename plan differs from its complete original checkpoint."); }
  validateHistory(after);
  if (after.projectUuid !== plan.projectUuid || after.branchUuid !== plan.branchUuid || after.projectOwnerUuid !== plan.ownerUuid) { throw new Error("Document rename project, branch or owner changed."); }
  const type = plan.kind === "pcb" ? "PCB" : "SCH";
  const current = exactDocument(after, plan.targetUuid, type), old = exactDocument(before, plan.targetUuid, type);
  const peers = (history: NativeHistorySnapshot): unknown[] => history.documents.filter((document) => document.uuid !== plan.targetUuid).map((document) => projection(document));
  if (canonicalJson(peers(before)) !== canonicalJson(peers(after))) { throw new Error("Document rename changed children, peers or project membership."); }
  const changedKeys = [...new Set([...Object.keys(old.metadata), ...Object.keys(current.metadata)])].filter((key) =>
    Object.hasOwn(old.metadata, key) !== Object.hasOwn(current.metadata, key) || canonicalJson({ value: old.metadata[key] }) !== canonicalJson({ value: current.metadata[key] }));
  const time = current.metadata["updateTime"];
  if (changedKeys.some((key) => !["client", "updateTime", "version", "user"].includes(key)) || Object.hasOwn(current.metadata, "user") || typeof time !== "number" || !Number.isSafeInteger(time) || time < 0 ||
    (typeof old.metadata["updateTime"] === "number" && time < old.metadata["updateTime"]) || current.metadata["version"] !== String(time) ||
    typeof current.metadata["client"] !== "string" || !/^[a-f0-9]{16}$/u.test(current.metadata["client"])) { throw new Error("Document rename changed unreviewed header fields."); }
  const newMeta = current.records.find((record) => record.id === "META"), oldMeta = old.records.find((record) => record.id === "META");
  let maximumTicket = 0;
  for (const document of before.documents) {
    maximumTicket = Math.max(maximumTicket, nativeDocumentRecordHistoryProjection(document).maximumTicket);
    for (const record of document.records) { maximumTicket = Math.max(maximumTicket, record.ticket); }
    for (const header of document.headerHistory?.headers ?? []) { maximumTicket = Math.max(maximumTicket, header.ticket); }
  }
  // The vi.newTicket getter advances the global clock; DOCHEAD and META use
  // The same next ticket. The raw occurrence proof retains tombstone maxima;
  // An intervening worker clock may still advance without a project record.
  if (oldMeta === undefined || newMeta === undefined || newMeta.ticket <= maximumTicket || newMeta.client !== current.metadata["client"]) {
    throw new Error("Document rename META clock or inherited client is invalid.");
  }
  const expectedMeta = { ...oldMeta, ticket: newMeta.ticket, client: newMeta.client, body: { ...oldMeta.body, title: plan.desiredTitle } };
  if (canonicalJson(nativeDocumentRecordHistoryProjection(current)) !== canonicalJson(appendClosedContainerMetadataRecords(nativeDocumentRecordHistoryProjection(old), current))) {
    throw new Error("Document rename raw record history is not exactly the pinned DOCHEAD and META suffix.");
  }
  const expected = { ...old, metadata: current.metadata, records: old.records.map((record) => record.id === "META" ? expectedMeta : record), documentRecordHistory: validateNativeDocumentRecordHistory(current, after.checkpointSha256) };
  if (canonicalJson(projection(expected)) !== canonicalJson(projection(current))) { throw new Error("Document rename changed geometry or unrequested metadata."); }
  return { profile: DOCUMENT_CONTAINER_RENAME_PROFILE, targetId: plan.targetUuid, kind: plan.kind, childCount: plan.childUuids.length,
    beforeProjectSha256: plan.beforeProjectSha256, afterProjectSha256: completeProjectHash(after), documentCount: after.documents.length,
    effectVerified: true, reopened: false, currentGenerationLiveValidated: false, saveInvoked: false,
    adapterKind: "native-task-equivalent", editorTitleRefreshVerified: false };
}

/** An explicit separate transaction, never redispatch or automatic rollback. */
export function documentContainerRenameInverse(input: DocumentContainerRenamePlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot, operationId: string): ReturnType<typeof documentContainerRenameOperation> {
  const plan = documentContainerRenamePlanSchema.parse(input);
  verifyDocumentContainerRenameEffect(plan, before, after);
  return documentContainerRenameOperation({ id: operationId, action: `document.${plan.kind}.rename`, target: { uuid: plan.targetUuid }, name: plan.beforeTitle });
}
