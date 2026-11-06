/** Exact data relation for a held original worker Save body. Its source/clock
 * provenance is supplied separately by the distinct original SCH observer;
 * parsing data cannot release the main SQL fence or establish persistence. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { parseNativeRecords } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
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
