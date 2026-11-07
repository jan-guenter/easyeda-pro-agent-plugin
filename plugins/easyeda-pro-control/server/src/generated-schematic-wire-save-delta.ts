/** Separate LINE pending-body data contract. Shared VIA/TEXT pending schemas
 * remain unchanged. Parsed data supplies no original worker or Main authority. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { parseNativeRecords } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentProjectCanvasPendingValueSchema } from "./current-project-canvas-pending-value.ts";
import { generatedSchematicDisplaySaveBodyValueSchema } from "./generated-schematic-display-save-delta.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";

const pending = z.strictObject({ ...currentProjectCanvasPendingValueSchema.shape, dataType: z.literal("LINE") })
  .refine(value => value.ticket <= value.maximumTicket && value.priorUserUndefined === (value.priorUserJson === null));
export const generatedSchematicWirePendingSaveBodyValueSchema = z.strictObject({ ...generatedSchematicDisplaySaveBodyValueSchema.shape,
  schema: z.literal("private.generated-schematic-wire-save-body-value.v1"), pending,
}).refine(value => value.userUndefined === (value.userJson === null) && value.headTicket === value.pending.maximumTicket + 1);
export type GeneratedSchematicWirePendingSaveBodyValue = z.infer<typeof generatedSchematicWirePendingSaveBodyValueSchema>;
const actor = z.strictObject({ uuid: z.string().min(1).max(128).refine(value => value.isWellFormed()), username: z.string().max(1024), nickname: z.string().max(1024) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCH209_WIRE_SAVE_${code}`); } }
/** Exact original pending geometry and observed tickets, including raw actor
 * property order. An added Relevance, META, root or second LINE is refused. */
export function compareGeneratedSchematicWirePendingSaveDelta(args: GeneratedSchematicWireEditNativeArguments, history: NativeHistorySnapshot, input: unknown): Readonly<{
  schema: "private.generated-schematic-wire-save-delta.v1"; documentUuid: string; wireId: string; lineId: string; lineTicket: number; headTicket: number;
  maximumTicketBeforeSave: number; body: string; bodySha256: string; workerEditVersion: string | null; actualPendingDataMatched: true;
  originalPendingNodeProvenanceVerified: false; originalClockProvenanceVerified: false; originalEffectProvenanceVerified: false; selectedSqlAuthorized: false; persistenceVerified: false;
}> {
  const value = generatedSchematicWirePendingSaveBodyValueSchema.parse(input), { target, operation } = args;
  const node = value.pending;
  need(value.documentUuid === target.pageUuid && value.projectUuid === target.projectUuid && history.projectUuid === target.projectUuid && history.branchUuid === target.branchUuid && history.documents.length === 2, "IDENTITY");
  const page = history.documents.find(document => document.uuid === target.pageUuid); const parent = history.documents.find(document => document.uuid === target.schematicUuid);
  need(parent?.docType === "SCH" && parent.records.length === 1 && parent.records[0]?.type === "META" && page?.docType === "SCH_PAGE" && page.records.length === 7 &&
    page.records.filter(row => row.type === "WIRE" && row.id === operation.wireId).length === 1 &&
    page.records.filter(row => row.type === "LINE" && row.id === operation.lineId && canonicalJson(row.body) === canonicalJson(operation.beforeBody)).length === 1 &&
    page.records.some(row => row.id === "META" && row.type === "META" && row.body["schematic"] === target.schematicUuid) &&
    page.records.filter(row => row.type === "ATTR" && row.body["parentId"] === operation.wireId && row.body["key"] === "Relevance" && row.body["value"] === "[]").length === 1, "PAIRED_BASELINE");
  const maximum = Math.max(...page.records.map(row => row.ticket));
  need(Number.isSafeInteger(maximum) && maximum > 0 && node.maximumTicket >= maximum && node.ticket > maximum && node.ticket <= node.maximumTicket &&
    node.primitiveId === operation.lineId && node.canvasUuid === target.pageUuid && node.client === value.client, "ACTUAL_PENDING_NODE");
  need(value.body.isWellFormed() && Buffer.byteLength(value.body) <= 16_384 && !value.body.endsWith("|\n"), "BODY_BOUND");
  const [head, line, ...extra] = parseNativeRecords(value.body);
  need(head !== undefined && line !== undefined && extra.length === 0 && canonicalJson(head.header) === canonicalJson({ type: "DOCHEAD", ticket: value.headTicket }) &&
    canonicalJson(line.header) === canonicalJson({ type: "LINE", ticket: node.ticket, id: operation.lineId }) && canonicalJson(line.body) === canonicalJson(operation.afterBody), "EXACT_TWO_ROWS");
  const data = parseNativeRecords(`${JSON.stringify({ type: "LINE", ticket: node.ticket, id: operation.lineId })}||${node.data}`);
  need(data.length === 1 && canonicalJson(data[0]?.body) === canonicalJson(operation.afterBody), "PENDING_LINE_BODY");
  let user: unknown;
  if (!value.userUndefined) { need(value.userJson !== null, "ACTOR"); const decoded: unknown = JSON.parse(value.userJson); actor.parse(decoded); user = decoded; }
  const expectedHead = { docType: "SCH_PAGE", client: value.client, uuid: target.pageUuid, updateTime: value.clock, version: String(value.clock),
    ...(node.workerEditVersion !== null && node.workerEditVersion.length > 0 ? { editVersion: node.workerEditVersion } : {}), ...(user === undefined ? {} : { user }) };
  const expected = `${JSON.stringify({ type: "DOCHEAD", ticket: value.headTicket })}||${JSON.stringify(expectedHead)}|\n${JSON.stringify({ type: "LINE", ticket: node.ticket, id: operation.lineId })}||${node.data}`;
  need(value.body === expected, "RAW_BODY");
  return freezeDeep({ schema: "private.generated-schematic-wire-save-delta.v1", documentUuid: target.pageUuid, wireId: operation.wireId, lineId: operation.lineId,
    lineTicket: node.ticket, headTicket: value.headTicket, maximumTicketBeforeSave: node.maximumTicket, body: value.body, bodySha256: sha256Text(value.body), workerEditVersion: node.workerEditVersion,
    actualPendingDataMatched: true, originalPendingNodeProvenanceVerified: false, originalClockProvenanceVerified: false, originalEffectProvenanceVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
}
