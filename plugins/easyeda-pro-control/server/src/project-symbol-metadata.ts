import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryProjectRecordsHash } from "./library-persistence-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";

/** Candidate adapter, deliberately not registered with LibraryExecutor until
 * a disposable symbol passes complete durable and reopened verification.
 */
export const PROJECT_SYMBOL_METADATA_PROFILE = "easyeda-pro-control.project-symbol-metadata.v1";
const boundedId = z.string().min(1).max(256);
const planSchema = z.object({
  profile: z.literal(PROJECT_SYMBOL_METADATA_PROFILE),
  projectUuid: boundedId,
  branchUuid: boundedId,
  ownerUuid: boundedId,
  targetUuid: boundedId,
  beforeProjectSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  beforeTitle: z.string().min(1).max(512),
  beforeDescription: z.string().max(65_536),
  desiredTitle: z.string().min(1).max(512),
  desiredDescription: z.string().max(65_536),
}).strict();
export type ProjectSymbolMetadataPlan = z.infer<typeof planSchema>;

function symbol(history: NativeHistorySnapshot, uuid: string): NativeDocumentSnapshot {
  const entries = history.documents.filter((entry) => entry.uuid === uuid);
  const result = entries[0];
  if (entries.length !== 1 || result?.docType !== "SYMBOL" || isNativeDocumentDeleted(result)) {
    throw new Error("Symbol target must be one active SYMBOL in the complete project checkpoint.");
  }
  return result;
}
function metadata(document: NativeDocumentSnapshot): Record<string, unknown> {
  const entries = document.records.filter((entry) => entry.id === "META" || entry.type === "META");
  const result = entries[0];
  if (entries.length !== 1 || result?.id !== "META" || result.type !== "META") { throw new Error("Symbol requires one exact META record."); }
  return result.body;
}
function projectIdentity(history: NativeHistorySnapshot, plan: ProjectSymbolMetadataPlan): void {
  if (history.projectUuid !== plan.projectUuid || history.projectOwnerUuid !== plan.ownerUuid || history.branchUuid !== plan.branchUuid) {
    throw new Error("Symbol project, branch or owner differs from its prepared plan.");
  }
}
function normalizedTitle(value: string): string { return value.trim().toLowerCase(); }

export function prepareProjectSymbolMetadata(input: unknown, history: NativeHistorySnapshot): ProjectSymbolMetadataPlan {
  const operation = libraryOperationSchema.parse(input);
  if (operation.action !== "library.symbol.modify" || !("uuid" in operation.target) || operation.libraryUuid !== history.projectUuid || history.projectOwnerUuid === undefined || history.projectOwnerUuid.length === 0) {
    throw new Error("Symbol metadata editing requires an exact current-project symbol and owner.");
  }
  if (operation.patch.classification !== undefined || operation.patch.description === null) {
    throw new Error("Symbol metadata candidate accepts name and non-null description only; native classification/null behavior is not an exact patch.");
  }
  const target = symbol(history, operation.target.uuid);
  const before = metadata(target);
  if (before["docType"] !== 2 || typeof before["title"] !== "string" || typeof before["description"] !== "string") {
    throw new Error("Symbol metadata candidate requires ordinary META.docType 2 with stored title and description.");
  }
  const desiredTitle = operation.patch.name ?? before["title"];
  for (const document of history.documents) {
    if (document.docType === "SYMBOL" && document.uuid !== target.uuid && !isNativeDocumentDeleted(document)) {
      const title = metadata(document)["title"];
      if (typeof title !== "string") { throw new TypeError("Peer symbol title is missing from duplicate-name proof."); }
      if (normalizedTitle(title) === normalizedTitle(desiredTitle)) { throw new Error("A project symbol with that normalized name already exists."); }
    }
  }
  return planSchema.parse({ profile: PROJECT_SYMBOL_METADATA_PROFILE, projectUuid: history.projectUuid, branchUuid: history.branchUuid,
    ownerUuid: history.projectOwnerUuid, targetUuid: target.uuid, beforeProjectSha256: libraryProjectRecordsHash(history),
    beforeTitle: before["title"], beforeDescription: before["description"], desiredTitle, desiredDescription: operation.patch.description ?? before["description"] });
}

/** The pinned UI's LIB_Symbol.modify destructures classification without a
 * default and otherwise reuses its lowercased search title. Always supply a
 * fixed empty classification object and the checkpoint's exact display title.
 * This compiler is internal candidate code, not a caller-selectable SDK path.
 */
export function buildProjectSymbolMetadataExpression(input: ProjectSymbolMetadataPlan): string {
  const plan = planSchema.parse(input);
  return `(async()=>{let stage='host';try{
const PLAN=${JSON.stringify(plan)};
${DEVICE_NATIVE_HOST_GUARD}
const assertProject=async()=>{const project=await eda.dmt_Project.getCurrentProjectInfo();if(project?.uuid!==PLAN.projectUuid||host.currentProject?.projectId!==PLAN.projectUuid)throw new Error('PROJECT_DRIFT');};
await assertProject();
stage='before-read';
const before=(await bus.rpcCall('/PrjDB/symbol/getData',[PLAN.targetUuid,PLAN.projectUuid])).message;
await assertProject();
if(before?.uuid!==PLAN.targetUuid||before?.project_uuid!==PLAN.projectUuid||before?.owner?.uuid!==PLAN.ownerUuid||before?.docType!==2||before?.display_title!==PLAN.beforeTitle||before?.description!==PLAN.beforeDescription)throw new Error('SYMBOL_METADATA_DRIFT');
stage='modify';
const api=eda.lib_Symbol;
if(typeof api?.modify!=='function')throw new Error('METHOD_MISSING');
const result=await api.modify(PLAN.targetUuid,PLAN.projectUuid,PLAN.desiredTitle,{},PLAN.desiredDescription);
if(result!==true)throw new Error('ACK_INVALID');
stage='after-read';
await assertProject();
const after=(await bus.rpcCall('/PrjDB/symbol/getData',[PLAN.targetUuid,PLAN.projectUuid])).message;
await assertProject();
if(after?.uuid!==PLAN.targetUuid||after?.project_uuid!==PLAN.projectUuid||after?.owner?.uuid!==PLAN.ownerUuid||after?.docType!==2||after?.display_title!==PLAN.desiredTitle||after?.description!==PLAN.desiredDescription)throw new Error('SYMBOL_METADATA_DRIFT');
const payload={kind:'project-symbol-metadata',targetId:PLAN.targetUuid,createdId:null};
const json=JSON.stringify(payload);return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes:new TextEncoder().encode(json).byteLength,json};
}catch(_){throw new Error('Symbol metadata candidate refused at '+stage);}})()`;
}

function recordProjection(document: NativeDocumentSnapshot): unknown {
  return { uuid: document.uuid, docType: document.docType, metadata: document.metadata,
    records: document.records.map(({ id, type, body }) => ({ id, type, body })) };
}
function verifyHeader(before: Record<string, unknown>, after: Record<string, unknown>): void {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed = [...keys].filter((key) => canonicalJson({ value: before[key] }) !== canonicalJson({ value: after[key] }) || Object.hasOwn(before, key) !== Object.hasOwn(after, key));
  if (changed.length === 0) { return; }
  const time = after["updateTime"];
  if (changed.some((key) => !["client", "updateTime", "version"].includes(key)) || typeof after["client"] !== "string" || !/^[a-f0-9]{16}$/u.test(after["client"]) || typeof time !== "number" || !Number.isSafeInteger(time) || time < 0 || after["version"] !== String(time) || (typeof before["updateTime"] === "number" && time < before["updateTime"])) {
    throw new Error("Symbol header changed outside the reviewed metadata edit fields.");
  }
}

export function verifyProjectSymbolMetadataEffect(input: ProjectSymbolMetadataPlan, before: NativeHistorySnapshot, after: NativeHistorySnapshot): Record<string, unknown> {
  const plan = planSchema.parse(input);
  projectIdentity(before, plan); projectIdentity(after, plan);
  if (libraryProjectRecordsHash(before) !== plan.beforeProjectSha256) { throw new Error("Symbol baseline differs from the prepared complete-project checkpoint."); }
  const changed = symbol(after, plan.targetUuid), old = symbol(before, plan.targetUuid);
  const oldMeta = metadata(old);
  if (oldMeta["title"] !== plan.beforeTitle || oldMeta["description"] !== plan.beforeDescription || oldMeta["docType"] !== 2) { throw new Error("Symbol plan differs from checkpoint metadata."); }
  const peers = (history: NativeHistorySnapshot): unknown[] => history.documents.filter((document) => document.uuid !== plan.targetUuid).map((document) => recordProjection(document));
  if (canonicalJson(peers(before)) !== canonicalJson(peers(after))) { throw new Error("Symbol metadata edit changed unrelated project records."); }
  verifyHeader(old.metadata, changed.metadata);
  const expected = { ...old, metadata: changed.metadata, records: old.records.map((record) => record.id === "META" && record.type === "META" ?
    Object.assign(structuredClone(record), { body: { ...record.body, title: plan.desiredTitle, description: plan.desiredDescription } }) : record) };
  if (canonicalJson(recordProjection(expected)) !== canonicalJson(recordProjection(changed))) { throw new Error("Symbol metadata edit changed geometry, bindings or unrequested metadata."); }
  return { profile: PROJECT_SYMBOL_METADATA_PROFILE, targetId: plan.targetUuid, beforeProjectSha256: plan.beforeProjectSha256,
    afterProjectSha256: libraryProjectRecordsHash(after), documentCount: after.documents.length,
    effectVerified: true, persistenceEvidence: "supplied-history-comparison", reopened: false };
}
