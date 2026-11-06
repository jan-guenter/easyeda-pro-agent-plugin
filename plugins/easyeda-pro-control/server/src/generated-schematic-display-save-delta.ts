/** Exact data relation for a held original worker Save body. Its source/clock
 * provenance is supplied separately by the distinct original SCH observer;
 * parsing data cannot release the main SQL fence or establish persistence. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { parseNativeRecords } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentProjectCanvasPendingValueSchema } from "./current-project-canvas-pending-value.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";

const identifier = z.string().min(1).max(128).refine(value => value.isWellFormed());
const actor = z.strictObject({ uuid: identifier, username: z.string().max(1024), nickname: z.string().max(1024) });
export const generatedSchematicDisplaySaveBodyValueSchema = z.strictObject({
  documentUuid: z.string().regex(/^[a-f0-9]{32}$/u), projectUuid: z.string().regex(/^[a-f0-9]{64}$/u),
  uniqueId: identifier, client: identifier, clock: z.number().int().positive().max(8_640_000_000_000_000),
  headTicket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), body: z.string().min(1).max(16_384),
  userUndefined: z.boolean(), userJson: z.string().max(8192).nullable(),
});
export type GeneratedSchematicDisplaySaveBodyValue = z.infer<typeof generatedSchematicDisplaySaveBodyValueSchema>;
export interface GeneratedSchematicDisplaySaveDelta {
  readonly schema: "private.generated-schematic-display-save-delta.v1";
  readonly documentUuid: string; readonly textId: string; readonly textTicket: number; readonly headTicket: number;
  readonly body: string; readonly bodySha256: string; readonly workerEditVersion: string;
  readonly exactSoleTextBodyVerified: true; readonly originalClockProvenanceVerified: false;
  readonly originalEffectProvenanceVerified: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_DISPLAY_SAVE_DELTA_${reason}`); } }

/** Uses observed tickets rather than assuming that this action consumes one
 * ticket. The original observer must independently prove the actual pending
 * data, clock, uniqueId and request. Unknown META/CANVAS/peer records refuse.
 * The real SCH parent is required and never converted into a PCB document. */
export function compareGeneratedSchematicDisplaySaveDelta(argumentsValue: GeneratedSchematicDisplayNativeArguments,
  history: NativeHistorySnapshot, workerEditVersion: string, input: GeneratedSchematicDisplaySaveBodyValue): GeneratedSchematicDisplaySaveDelta {
  const value = generatedSchematicDisplaySaveBodyValueSchema.parse(input), { target, operation } = argumentsValue;
  need(value.documentUuid === target.pageUuid && value.projectUuid === target.projectUuid && history.projectUuid === target.projectUuid &&
    history.branchUuid === target.branchUuid && history.documents.length === 2, "IDENTITY");
  need(typeof workerEditVersion === "string" && workerEditVersion.length > 0 && workerEditVersion.length <= 128 &&
    workerEditVersion.isWellFormed() && !/[\p{Cc}\p{Z}]/u.test(workerEditVersion), "WORKER_VERSION");
  const page = history.documents.find(document => document.uuid === target.pageUuid), parent = history.documents.find(document => document.uuid === target.schematicUuid);
  need(parent?.docType === "SCH" && page?.docType === "SCH_PAGE" && parent.records.length === 1 && parent.records[0]?.type === "META", "PAIRED_DOCUMENTS");
  const initialText = page.records.filter(record => record.id === operation.textId);
  need(initialText.length === 1 && initialText[0]?.type === "TEXT" && page.records.length === 6 &&
    page.records.some(record => record.id === "META" && record.type === "META" && record.body["schematic"] === target.schematicUuid), "BASELINE");
  const baselineMaximum = Math.max(...page.records.map(record => record.ticket));
  need(Number.isSafeInteger(baselineMaximum) && baselineMaximum > 0 && baselineMaximum < Number.MAX_SAFE_INTEGER, "BASELINE_CLOCK");
  need(Buffer.byteLength(value.body, "utf8") <= 16_384 && value.body.isWellFormed() && !value.body.endsWith("|\n"), "BODY_ENCODING");
  const records = parseNativeRecords(value.body); need(records.length === 2, "SOLE_TEXT_RECORD"); const [head, text] = records;
  need(head !== undefined && text !== undefined && canonicalJson(head.header) === canonicalJson({ type: "DOCHEAD", ticket: value.headTicket }), "HEADER");
  const textTicket = text.header["ticket"];
  need(typeof textTicket === "number" && Number.isSafeInteger(textTicket) && textTicket > baselineMaximum && textTicket < value.headTicket &&
    canonicalJson(text.header) === canonicalJson({ type: "TEXT", ticket: textTicket, id: operation.textId }), "OBSERVED_TEXT_TICKET");
  let user: z.infer<typeof actor> | null = null;
  if (value.userUndefined) { need(value.userJson === null, "USER_UNDEFINED"); }
  else { need(value.userJson !== null, "USER"); const parsed: unknown = JSON.parse(value.userJson); user = actor.parse(parsed);
    need(canonicalJson(user) === canonicalJson(parsed), "USER_FIELDS"); }
  const expectedHead = { docType: "SCH_PAGE", client: value.client, uuid: target.pageUuid, updateTime: value.clock,
    version: String(value.clock), editVersion: workerEditVersion, ...(user === null ? {} : { user }) };
  need(canonicalJson(head.body) === canonicalJson(expectedHead) && canonicalJson(text.body) === canonicalJson(operation.afterBody) &&
    operation.beforeBody["value"] === "Disposable schematic fixture" && operation.afterBody["value"] === operation.beforeBody["value"] &&
    operation.beforeBody["locked"] === false && operation.afterBody["locked"] === false, "COMPLETE_BODY");
  return freezeDeep({ schema: "private.generated-schematic-display-save-delta.v1", documentUuid: target.pageUuid, textId: operation.textId,
    textTicket, headTicket: value.headTicket, body: value.body, bodySha256: sha256Text(value.body), workerEditVersion,
    exactSoleTextBodyVerified: true, originalClockProvenanceVerified: false, originalEffectProvenanceVerified: false,
    selectedSqlAuthorized: false, persistenceVerified: false });
}

/** Separate current proof shape. userJson describes the effective DOCHEAD
 * actor selected by the original worker as PROJECT.user || prior header user;
 * the independent pending snapshot also retains the raw prior value. */
export const generatedSchematicDisplayPendingSaveBodyValueSchema = generatedSchematicDisplaySaveBodyValueSchema.extend({
  schema: z.literal("private.generated-schematic-display-save-body-value.v2"), pending: currentProjectCanvasPendingValueSchema,
}).refine(value => value.userUndefined === (value.userJson === null) && value.headTicket === value.pending.maximumTicket + 1);
export type GeneratedSchematicDisplayPendingSaveBodyValue = z.infer<typeof generatedSchematicDisplayPendingSaveBodyValueSchema>;
export interface GeneratedSchematicDisplayPendingSaveDelta extends Omit<GeneratedSchematicDisplaySaveDelta, "schema" | "workerEditVersion"> {
  readonly schema: "private.generated-schematic-display-save-delta.v2";
  readonly maximumTicketBeforeSave: number; readonly workerEditVersion: string | null;
  readonly actualPendingDataMatched: true; readonly originalPendingNodeProvenanceVerified: false;
}
/** Compare actual pending Text data and tickets. The native owner must join
 * the original pending-node, effective-user, clock and effect objects. These
 * inert values cannot establish that join or release an original SQL hold. */
export function compareGeneratedSchematicDisplayPendingSaveDelta(argumentsValue: GeneratedSchematicDisplayNativeArguments,
  history: NativeHistorySnapshot, input: GeneratedSchematicDisplayPendingSaveBodyValue): GeneratedSchematicDisplayPendingSaveDelta {
  const value = generatedSchematicDisplayPendingSaveBodyValueSchema.parse(input); const { target, operation } = argumentsValue; const pending = value.pending;
  need(value.documentUuid === target.pageUuid && value.projectUuid === target.projectUuid && history.projectUuid === target.projectUuid &&
    history.branchUuid === target.branchUuid && history.documents.length === 2, "IDENTITY");
  const page = history.documents.find(document => document.uuid === target.pageUuid), parent = history.documents.find(document => document.uuid === target.schematicUuid);
  need(parent?.docType === "SCH" && page?.docType === "SCH_PAGE" && parent.records.length === 1 && parent.records[0]?.type === "META" &&
    page.records.length === 6 && page.records.filter(record => record.id === operation.textId && record.type === "TEXT").length === 1 &&
    page.records.some(record => record.id === "META" && record.type === "META" && record.body["schematic"] === target.schematicUuid), "PAIRED_BASELINE");
  const maximum = Math.max(...page.records.map(record => record.ticket));
  need(Number.isSafeInteger(maximum) && maximum > 0 && pending.maximumTicket >= maximum && pending.ticket > maximum && pending.ticket <= pending.maximumTicket &&
    pending.canvasUuid === target.pageUuid && pending.primitiveId === operation.textId && pending.dataType === "TEXT", "ACTUAL_PENDING_NODE");
  need(value.body.isWellFormed() && Buffer.byteLength(value.body) <= 16_384 && !value.body.endsWith("|\n"), "BODY_ENCODING");
  const rows = parseNativeRecords(value.body), [head, text] = rows;
  need(rows.length === 2 && head !== undefined && text !== undefined && canonicalJson(head.header) === canonicalJson({ type: "DOCHEAD", ticket: value.headTicket }) &&
    canonicalJson(text.header) === canonicalJson({ type: "TEXT", ticket: pending.ticket, id: operation.textId }), "EXACT_HEADERS");
  const dataRows = parseNativeRecords(`${JSON.stringify({ type: "TEXT", ticket: pending.ticket, id: operation.textId })}||${pending.data}`);
  need(dataRows.length === 1 && canonicalJson(dataRows[0]?.body) === canonicalJson(operation.afterBody) &&
    canonicalJson(text.body) === canonicalJson(operation.afterBody) && operation.beforeBody["value"] === "Disposable schematic fixture" &&
    operation.afterBody["value"] === operation.beforeBody["value"] && operation.beforeBody["locked"] === false && operation.afterBody["locked"] === false, "COMPLETE_TEXT");
  let user: unknown;
  if (!value.userUndefined) { need(value.userJson !== null, "EFFECTIVE_USER"); const parsed: unknown = JSON.parse(value.userJson); actor.parse(parsed); user = parsed; }
  const expectedHead = { docType: "SCH_PAGE", client: value.client, uuid: target.pageUuid, updateTime: value.clock, version: String(value.clock),
    ...(pending.workerEditVersion !== null && pending.workerEditVersion.length > 0 ? { editVersion: pending.workerEditVersion } : {}), ...(user === undefined ? {} : { user }) };
  const expected = `${JSON.stringify({ type: "DOCHEAD", ticket: value.headTicket })}||${JSON.stringify(expectedHead)}|\n${JSON.stringify({ type: "TEXT", ticket: pending.ticket, id: operation.textId })}||${pending.data}`;
  need(value.body === expected, "RAW_BODY");
  return freezeDeep({ schema: "private.generated-schematic-display-save-delta.v2", documentUuid: target.pageUuid, textId: operation.textId, textTicket: pending.ticket,
    headTicket: value.headTicket, maximumTicketBeforeSave: pending.maximumTicket, body: value.body, bodySha256: sha256Text(value.body), workerEditVersion: pending.workerEditVersion,
    actualPendingDataMatched: true, originalPendingNodeProvenanceVerified: false, exactSoleTextBodyVerified: true, originalClockProvenanceVerified: false,
    originalEffectProvenanceVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
}
