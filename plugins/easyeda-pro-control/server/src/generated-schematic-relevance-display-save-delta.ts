/** Distinct seven-row baseline and actual-pending body projection. Parsing
 * these data cannot enroll a writer or release any native worker/SQL hold. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { parseNativeRecords } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { generatedSchematicDisplayPendingSaveBodyValueSchema } from "./generated-schematic-display-save-delta.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayProjectedEffect } from "./generated-schematic-relevance-display-effect-data.ts";

export const generatedSchematicRelevanceDisplayPendingSaveBodyValueSchema = z.strictObject({
  ...generatedSchematicDisplayPendingSaveBodyValueSchema.shape, schema: z.literal("private.generated-schematic-relevance-display-save-body-value.v1"),
}).superRefine((value, context) => {
  const parsed = generatedSchematicDisplayPendingSaveBodyValueSchema.safeParse({ ...value, schema: "private.generated-schematic-display-save-body-value.v2" });
  if (!parsed.success) { for (const issue of parsed.error.issues) { context.addIssue({ code: "custom", path: [...issue.path], message: issue.message }); } }
});
export type GeneratedSchematicRelevanceDisplayPendingSaveBodyValue = z.infer<typeof generatedSchematicRelevanceDisplayPendingSaveBodyValueSchema>;
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_RELEVANCE_DISPLAY_SAVE_${reason}`); } }
const actor = z.strictObject({ uuid: z.string().min(1).max(128).refine(value => value.isWellFormed()), username: z.string().max(1024), nickname: z.string().max(1024) });
export function compareGeneratedSchematicRelevanceDisplayPendingSaveDelta(args: GeneratedSchematicRelevanceDisplayNativeArguments,
  history: NativeHistorySnapshot, effect: GeneratedSchematicRelevanceDisplayProjectedEffect, input: GeneratedSchematicRelevanceDisplayPendingSaveBodyValue): Readonly<{
    schema: "private.generated-schematic-relevance-display-save-delta.v1"; documentUuid: string; textId: string; textTicket: number; headTicket: number;
    maximumTicketBeforeSave: number; body: string; bodySha256: string; workerEditVersion: string | null; normalizedTextZIndex: number;
    actualPendingDataMatched: true; originalPendingNodeProvenanceVerified: false; originalClockProvenanceVerified: false; originalEffectProvenanceVerified: false;
    selectedSqlAuthorized: false; persistenceVerified: false;
  }> {
  const value = generatedSchematicRelevanceDisplayPendingSaveBodyValueSchema.parse(input); const pending = value.pending; const { target, operation } = args;
  need(value.documentUuid === target.pageUuid && value.projectUuid === target.projectUuid && history.projectUuid === target.projectUuid && history.branchUuid === target.branchUuid && history.documents.length === 2, "IDENTITY");
  const page = history.documents.find(document => document.uuid === target.pageUuid), parent = history.documents.find(document => document.uuid === target.schematicUuid);
  const wire = operation.peers.find(row => row.type === "WIRE"); const attribute = operation.peers.find(row => row.type === "ATTR");
  need(parent?.docType === "SCH" && page?.docType === "SCH_PAGE" && parent.records.length === 1 && parent.records[0]?.type === "META" && page.records.length === 7 &&
    page.records.filter(row => row.id === operation.textId && row.type === "TEXT").length === 1 && page.records.some(row => row.id === "META" && row.type === "META" && row.body["schematic"] === target.schematicUuid) &&
    wire !== undefined && attribute !== undefined && page.records.some(row => row.type === "ATTR" && row.id === attribute.id && row.body["parentId"] === wire.id), "SEVEN_ROW_BASELINE");
  need(effect.schema === "private.generated-schematic-relevance-display-effect.v1" && effect.operationId === operation.operationId && effect.documentUuid === target.pageUuid && effect.textId === operation.textId &&
    effect.rootIndices.length === 3 && canonicalJson(effect.rootIndices.map(row => row.id).toSorted()) === canonicalJson(operation.rootIds) && new Set(effect.rootIndices.map(row => row.zIndex)).size === 3 &&
    effect.rootIndices.every(row => Number.isSafeInteger(row.zIndex) && row.zIndex >= 0 && row.zIndex <= 2 && !Object.is(row.zIndex, -0)), "NORMALIZED_BASELINE");
  const index = effect.rootIndices.find(row => row.id === operation.textId); need(index !== undefined, "TEXT_INDEX");
  const expectedText = { ...operation.afterBody, zIndex: index.zIndex }, maximum = Math.max(...page.records.map(record => record.ticket));
  need(Number.isSafeInteger(maximum) && maximum > 0 && pending.maximumTicket >= maximum && pending.ticket > maximum && pending.ticket <= pending.maximumTicket &&
    pending.canvasUuid === target.pageUuid && pending.primitiveId === operation.textId && pending.dataType === "TEXT", "ACTUAL_PENDING_NODE");
  need(value.body.isWellFormed() && Buffer.byteLength(value.body) <= 16_384 && !value.body.endsWith("|\n"), "BODY_ENCODING");
  const rows = parseNativeRecords(value.body), [head, text] = rows;
  need(rows.length === 2 && head !== undefined && text !== undefined && canonicalJson(head.header) === canonicalJson({ type: "DOCHEAD", ticket: value.headTicket }) &&
    canonicalJson(text.header) === canonicalJson({ type: "TEXT", ticket: pending.ticket, id: operation.textId }), "EXACT_HEADERS");
  const data = parseNativeRecords(`${JSON.stringify({ type: "TEXT", ticket: pending.ticket, id: operation.textId })}||${pending.data}`);
  need(data.length === 1 && canonicalJson(data[0]?.body) === canonicalJson(expectedText) && canonicalJson(text.body) === canonicalJson(expectedText) &&
    operation.beforeBody["value"] === "Disposable schematic fixture" && operation.afterBody["value"] === operation.beforeBody["value"] && operation.beforeBody["locked"] === false && operation.afterBody["locked"] === false, "COMPLETE_TEXT");
  let user: unknown;
  if (!value.userUndefined) { need(value.userJson !== null, "EFFECTIVE_USER"); const parsed: unknown = JSON.parse(value.userJson); actor.parse(parsed); user = parsed; }
  const expectedHead = { docType: "SCH_PAGE", client: value.client, uuid: target.pageUuid, updateTime: value.clock, version: String(value.clock),
    ...(pending.workerEditVersion !== null && pending.workerEditVersion.length > 0 ? { editVersion: pending.workerEditVersion } : {}), ...(user === undefined ? {} : { user }) };
  const expected = `${JSON.stringify({ type: "DOCHEAD", ticket: value.headTicket })}||${JSON.stringify(expectedHead)}|\n${JSON.stringify({ type: "TEXT", ticket: pending.ticket, id: operation.textId })}||${pending.data}`;
  need(value.body === expected, "RAW_BODY");
  return freezeDeep({ schema: "private.generated-schematic-relevance-display-save-delta.v1", documentUuid: target.pageUuid, textId: operation.textId, textTicket: pending.ticket,
    headTicket: value.headTicket, maximumTicketBeforeSave: pending.maximumTicket, body: value.body, bodySha256: sha256Text(value.body), workerEditVersion: pending.workerEditVersion,
    normalizedTextZIndex: index.zIndex, actualPendingDataMatched: true, originalPendingNodeProvenanceVerified: false, originalClockProvenanceVerified: false,
    originalEffectProvenanceVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
}
