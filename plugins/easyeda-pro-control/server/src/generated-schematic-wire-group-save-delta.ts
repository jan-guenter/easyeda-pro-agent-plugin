/** Separate GROUP pending-body relation for WIRE/LINE/Relevance ATTR.
 * The old LINE-only contract stays closed. Data issues no original worker,
 * group publication, pending-node, Main, SQL, Save or persistence authority. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { parseNativeRecords } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { currentProjectCanvasPendingValueSchema } from "./current-project-canvas-pending-value.ts";
import { generatedSchematicDisplaySaveBodyValueSchema } from "./generated-schematic-display-save-delta.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const pending = z.strictObject({ ...currentProjectCanvasPendingValueSchema.shape, dataType: z.enum(["WIRE", "LINE", "ATTR"]) })
  .refine(value => value.ticket <= value.maximumTicket && value.priorUserUndefined === (value.priorUserJson === null));
export const generatedSchematicWireGroupPendingSaveBodyValueSchema = z.strictObject({
  ...generatedSchematicDisplaySaveBodyValueSchema.shape, schema: z.literal("private.generated-schematic-wire-group-save-body-value.v1"),
  pending: z.array(pending).length(3),
}).refine(value => value.userUndefined === (value.userJson === null));
export type GeneratedSchematicWireGroupPendingSaveBodyValue = z.infer<typeof generatedSchematicWireGroupPendingSaveBodyValueSchema>;
const text = (maximum: number): z.ZodString => z.string().max(maximum).refine(value => value.isWellFormed());
const actor = z.strictObject({ uuid: text(128).min(1), username: text(1024), nickname: text(1024) });
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_WIRE_GROUP_SAVE_${reason}`); } }

/** Match the complete actual pending traversal and raw Save body. The two
 * republished peer bodies must equal the paired baseline in every field;
 * their observed new tickets are explicit data, never silently ignored. */
export function compareGeneratedSchematicWireGroupPendingSaveDelta(args: GeneratedSchematicWireEditNativeArguments, history: NativeHistorySnapshot, input: unknown): Readonly<{
  schema: "private.generated-schematic-wire-group-save-delta.v1"; documentUuid: string; wireId: string; lineId: string; attributeId: string;
  wireTicket: number; lineTicket: number; attributeTicket: number; headTicket: number; maximumTicketBeforeSave: number;
  body: string; bodySha256: string; workerEditVersion: string | null; orderedIds: readonly string[];
  exactThreePendingBodiesMatched: true; republishedPeerBodiesPreserved: true; originalGroupUploadJoined: false;
  originalPendingNodeProvenanceVerified: false; originalClockProvenanceVerified: false; originalEffectProvenanceVerified: false;
  selectedSqlAuthorized: false; persistenceVerified: false; inverseAvailable: false;
}> {
  const value = generatedSchematicWireGroupPendingSaveBodyValueSchema.parse(input); const { target, operation } = args;
  need(value.documentUuid === target.pageUuid && value.projectUuid === target.projectUuid && history.projectUuid === target.projectUuid && history.branchUuid === target.branchUuid && history.documents.length === 2, "IDENTITY");
  const page = history.documents.find(document => document.uuid === target.pageUuid); const parent = history.documents.find(document => document.uuid === target.schematicUuid);
  need(parent?.docType === "SCH" && parent.records.length === 1 && parent.records[0]?.type === "META" && page?.docType === "SCH_PAGE" && page.records.length === 7 && page.records.some(row => row.id === "META" && row.type === "META" && row.body["schematic"] === target.schematicUuid), "PAIRED_BASELINE");
  const wire = page.records.filter(row => row.type === "WIRE" && row.id === operation.wireId); const line = page.records.filter(row => row.type === "LINE" && row.id === operation.lineId);
  const attrs = page.records.filter(row => row.type === "ATTR" && row.body["parentId"] === operation.wireId && row.body["key"] === "Relevance" && row.body["value"] === "[]");
  const planned = operation.peers.filter(row => row.type === "ATTR" && row.body["parentId"] === operation.wireId && row.body["key"] === "Relevance" && row.body["value"] === "[]");
  need(wire.length === 1 && line.length === 1 && attrs.length === 1 && planned.length === 1 && attrs[0]?.id === planned[0]?.id && canonicalJson(line[0]?.body) === canonicalJson(operation.beforeBody), "EXACT_GROUP_BASELINE");
  const group = wire[0]; const previous = line[0]; const attribute = attrs[0]; const first = value.pending[0];
  need(group !== undefined && previous !== undefined && attribute !== undefined && first !== undefined, "GROUP_ROSTER");
  const maximum = Math.max(...page.records.map(row => row.ticket));
  need(Number.isSafeInteger(maximum) && maximum > 0 && value.headTicket === first.maximumTicket + 1 && new Set(value.pending.map(node => node.primitiveId)).size === 3 && new Set(value.pending.map(node => node.ticket)).size === 3, "ACTUAL_PENDING_ROSTER");
  need(value.body.isWellFormed() && Buffer.byteLength(value.body) <= 16_384 && !value.body.endsWith("|\n"), "BODY_BOUND");
  const records = parseNativeRecords(value.body); need(records.length === 4, "EXACT_FOUR_ROWS");
  const head = records[0]; need(head !== undefined && canonicalJson(head.header) === canonicalJson({ type: "DOCHEAD", ticket: value.headTicket }), "HEAD");
  let wireTicket = 0; let lineTicket = 0; let attributeTicket = 0;
  for (const [index, node] of value.pending.entries()) {
    need(node.canvasUuid === target.pageUuid && node.client === value.client && node.maximumTicket === first.maximumTicket && node.ticket > maximum && node.ticket <= node.maximumTicket && node.workerEditVersion === first.workerEditVersion && node.priorVersion === first.priorVersion && node.priorUserUndefined === first.priorUserUndefined && node.priorUserJson === first.priorUserJson, "ORIGINAL_PENDING_DATA");
    const header = { type: node.dataType, ticket: node.ticket, id: node.primitiveId };
    const parsed = parseNativeRecords(`${JSON.stringify(header)}||${node.data}`); const actual = parsed[0]; const row = records[index + 1];
    need(parsed.length === 1 && actual !== undefined && row !== undefined && canonicalJson(row.header) === canonicalJson(header) && canonicalJson(row.body) === canonicalJson(actual.body), "ORDERED_PENDING_ROWS");
    if (node.dataType === "LINE") { need(node.primitiveId === operation.lineId && canonicalJson(actual.body) === canonicalJson(operation.afterBody), "EXACT_LINE_BODY"); lineTicket = node.ticket; }
    else if (node.dataType === "WIRE") { need(node.primitiveId === group.id && canonicalJson(actual.body) === canonicalJson(group.body), "UNCHANGED_WIRE_BODY"); wireTicket = node.ticket; }
    else { need(node.primitiveId === attribute.id && canonicalJson(actual.body) === canonicalJson(attribute.body), "UNCHANGED_RELEVANCE_BODY"); attributeTicket = node.ticket; }
  }
  need(wireTicket > 0 && lineTicket > 0 && attributeTicket > 0, "EXACT_THREE_TYPES");
  let user: unknown;
  if (!value.userUndefined) { need(value.userJson !== null, "ACTOR"); const decoded: unknown = JSON.parse(value.userJson); actor.parse(decoded); user = decoded; }
  const expectedHead = { docType: "SCH_PAGE", client: value.client, uuid: target.pageUuid, updateTime: value.clock, version: String(value.clock),
    ...(first.workerEditVersion !== null && first.workerEditVersion.length > 0 ? { editVersion: first.workerEditVersion } : {}), ...(user === undefined ? {} : { user }) };
  const body = [`${JSON.stringify({ type: "DOCHEAD", ticket: value.headTicket })}||${JSON.stringify(expectedHead)}`, ...value.pending.map(node => `${JSON.stringify({ type: node.dataType, ticket: node.ticket, id: node.primitiveId })}||${node.data}`)].join("|\n");
  need(value.body === body, "RAW_BODY");
  return freezeDeep({ schema: "private.generated-schematic-wire-group-save-delta.v1", documentUuid: target.pageUuid, wireId: group.id, lineId: previous.id, attributeId: attribute.id,
    wireTicket, lineTicket, attributeTicket, headTicket: value.headTicket, maximumTicketBeforeSave: first.maximumTicket, body, bodySha256: sha256Text(body), workerEditVersion: first.workerEditVersion, orderedIds: value.pending.map(node => node.primitiveId),
    exactThreePendingBodiesMatched: true, republishedPeerBodiesPreserved: true, originalGroupUploadJoined: false, originalPendingNodeProvenanceVerified: false, originalClockProvenanceVerified: false, originalEffectProvenanceVerified: false, selectedSqlAuthorized: false, persistenceVerified: false, inverseAvailable: false });
}
