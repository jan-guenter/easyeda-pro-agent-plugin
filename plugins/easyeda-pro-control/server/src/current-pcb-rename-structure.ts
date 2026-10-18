/** Pure, bounded project-structure text relation. This module grants no writer authority. */
import { createHash } from "node:crypto";
import { z } from "zod";

// Reviewed project-worker.js 3.2.184.355087e9, SHA-256
// Digest b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928.
// UTF-16 source offsets: nr serializers 1810933; PCB model 1899896;
// Method setEditData 1857162; uploadStructure 2104005; setProfile 1770335.
// Serializer nr.pcb preserves zIndex/docType presence and order. A newer DOCHEAD
// Changes version/updateTime; the following META changes title. No other tree
// Field is modeled here. This does not admit the native producer or callbacks.
const MAX_MEMBERS = 4096, MAX_TEXT_BYTES = 2_097_152;
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const ownerIdentifier = z.string().regex(/^[a-f0-9]{32}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000);
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
const version = z.string().min(1).max(128);
const boardReference = z.union([z.literal(""), identifier]);
const zIndex = z.number().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER).nullable().optional();
// These optional scalar fields are preserved, not interpreted as SDK enums.
// Complete-history admission must establish each document's actual type.
const docType = integer.max(255).optional();
const board = z.object({ uuid: identifier, title, zIndex }).strict();
const schematic = z.object({ uuid: identifier, name: title, board: boardReference, source: z.literal(""), version, updateTime: time }).strict();
const sheet = z.object({ uuid: identifier, title, schematic_uuid: identifier, docType, zIndex, source: z.literal(""), version, updateTime: time }).strict();
const pcb = z.object({ uuid: identifier, title, board: boardReference, zIndex, docType, parent_uuid: z.literal(""), source: z.literal(""), version, updateTime: time }).strict();
const panel = z.object({ uuid: identifier, title, zIndex, docType }).strict();
const accountText = z.string().max(4096).nullable();
const structureSchema = z.object({
  boards: z.record(identifier, board), schematics: z.record(identifier, schematic), sheets: z.record(identifier, sheet),
  pcbs: z.record(identifier, pcb), panels: z.record(identifier, panel), blockSymbols: z.object({}).strict(),
  owner: z.object({ uuid: ownerIdentifier, username: accountText, nickname: accountText, avatar: accountText }).strict(),
}).strict();
const beforeSchema = z.object({ title, version, updateTime: time }).strict();
const inputSchema = z.object({ structureText: z.string().min(1).max(MAX_TEXT_BYTES), targetUuid: identifier, expectedOwnerUuid: ownerIdentifier,
  expectedBefore: beforeSchema, desiredTitle: title, documentTime: time }).strict();
type Structure = z.infer<typeof structureSchema>;

export interface CurrentPcbRenameStructureProjection {
  readonly profile: "private.current-pcb-rename-structure.v1";
  readonly targetUuid: string;
  readonly beforeStructureText: string;
  readonly afterStructureText: string;
  readonly beforeStructureSha256: string;
  readonly afterStructureSha256: string;
  readonly documentCount: number;
  readonly documentTime: number;
  readonly executionAuthorized: false;
  readonly producerBindingVerified: false;
  readonly completeHistoryVerified: false;
  readonly clockProvenanceVerified: false;
  readonly fullSqlVerified: false;
}
export interface CurrentPcbRenameStructureComparison {
  readonly profile: "private.current-pcb-rename-structure-comparison.v1";
  readonly exactStructureText: true;
  readonly afterStructureSha256: string;
  readonly executionAuthorized: false;
  readonly fullSqlVerified: false;
}
const projections = new WeakSet<object>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB rename structure: ${message}`); }
}
function dataFields(value: unknown, names: readonly string[]): Record<string, unknown> {
  need(typeof value === "object" && value !== null && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain input required");
  const keys = Reflect.ownKeys(value);
  need(keys.length === names.length && keys.every((key) => typeof key === "string" && names.includes(key)), "input keys differ");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors refused");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
function digest(value: string): string { return createHash("sha256").update(value, "utf8").digest("hex"); }
function parseStructure(text: string): Structure {
  need(Buffer.byteLength(text, "utf8") <= MAX_TEXT_BYTES && Buffer.from(text, "utf8").toString("utf8") === text, "structure byte bound or UTF8 differs");
  const value: unknown = JSON.parse(text);
  const parsed = structureSchema.parse(value);
  // The native serializer uses these fixed key orders and JSON.stringify with
  // No whitespace. Equality also rejects duplicate keys, alternate numeric or
  // String encodings, and fields omitted or normalized by parsing.
  need(JSON.stringify(parsed) === text, "structure is not exact native-shaped serialization");
  return parsed;
}
function verifyCollection(collection: Readonly<Record<string, { readonly uuid: string }>>, known: Set<string>): void {
  for (const [key, value] of Object.entries(collection)) {
    need(key === value.uuid && !known.has(key), "document identity is ambiguous");
    known.add(key);
    need(known.size <= MAX_MEMBERS, "structure membership bound exceeded");
  }
}
function verifyMembership(structure: Structure): number {
  const known = new Set<string>();
  for (const collection of [structure.boards, structure.schematics, structure.sheets, structure.pcbs, structure.panels]) {
    verifyCollection(collection, known);
  }
  for (const value of [...Object.values(structure.schematics), ...Object.values(structure.pcbs)]) {
    need(value.board === "" || Object.hasOwn(structure.boards, value.board), "board identity is missing");
  }
  for (const value of Object.values(structure.sheets)) {
    need(Object.hasOwn(structure.schematics, value.schematic_uuid), "schematic identity is missing");
  }
  return known.size;
}

/** Model only an ordinary, non-inherited PCB title plus its newer DOCHEAD clock.
 * The coordinator must independently bind complete history, native producer,
 * clock window, SQL rows, callback completion, naming policy and original owner.
 */
export function prepareCurrentPcbRenameStructure(input: unknown): CurrentPcbRenameStructureProjection {
  const fields = dataFields(input, ["structureText", "targetUuid", "expectedOwnerUuid", "expectedBefore", "desiredTitle", "documentTime"]);
  const captured = inputSchema.parse({ ...fields, expectedBefore: dataFields(fields["expectedBefore"], ["title", "version", "updateTime"]) });
  const structure = parseStructure(captured.structureText);
  const documentCount = verifyMembership(structure);
  need(structure.owner.uuid === captured.expectedOwnerUuid, "owner identity differs");
  const target = structure.pcbs[captured.targetUuid];
  need(target !== undefined && target.uuid === captured.targetUuid, "target PCB identity is missing");
  need(target.title === captured.expectedBefore.title && target.version === captured.expectedBefore.version && target.updateTime === captured.expectedBefore.updateTime, "target baseline differs");
  need(captured.desiredTitle !== target.title, "unchanged title refused");
  need(captured.documentTime > target.updateTime, "document clock must be strictly newer");
  target.title = captured.desiredTitle; target.version = String(captured.documentTime); target.updateTime = captured.documentTime;
  const afterStructureText = JSON.stringify(structure);
  need(Buffer.byteLength(afterStructureText, "utf8") <= MAX_TEXT_BYTES, "projected structure byte bound exceeded");
  const projection: CurrentPcbRenameStructureProjection = Object.freeze({ profile: "private.current-pcb-rename-structure.v1", targetUuid: captured.targetUuid,
    beforeStructureText: captured.structureText, afterStructureText, beforeStructureSha256: digest(captured.structureText), afterStructureSha256: digest(afterStructureText),
    documentCount, documentTime: captured.documentTime, executionAuthorized: false, producerBindingVerified: false,
    completeHistoryVerified: false, clockProvenanceVerified: false, fullSqlVerified: false });
  projections.add(projection);
  return projection;
}

/** Byte equality only. Matching text cannot establish SQL row/ticket effects. */
export function verifyCurrentPcbRenameStructure(projection: CurrentPcbRenameStructureProjection, observedText: unknown): CurrentPcbRenameStructureComparison {
  need(projections.has(projection), "original pure projection required");
  need(typeof observedText === "string" && observedText === projection.afterStructureText, "complete structure text differs");
  return Object.freeze({ profile: "private.current-pcb-rename-structure-comparison.v1", exactStructureText: true,
    afterStructureSha256: projection.afterStructureSha256, executionAuthorized: false, fullSqlVerified: false });
}
