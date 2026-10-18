/** Pure complete-tree relation for one ordinary SCH-container title change. */
import { createHash } from "node:crypto";
import { z } from "zod";

// Reviewed project-worker.js 3.2.184.355087e9, SHA-256
// Digest b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928.
// UTF-16 offsets: nr1810933; Dg1909909; setEditData1857162; uploadStructure2104005.
// Serializer nr.schematic emits name, not title. DOCHEAD updates version/updateTime and
// META changes title. Child sheets and every other tree entry remain exact.
// This model does not prove the delayed SCH subscriber or structure job ran.
const MAX_MEMBERS = 4096, MAX_TEXT_BYTES = 2_097_152;
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const ownerIdentifier = z.string().regex(/^[a-f0-9]{32}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000);
const title = z.string().min(1).max(512).refine(value => value.trim() === value && !/\p{Cc}/u.test(value));
const boardReference = z.union([z.literal(""), identifier]), version = z.string().min(1).max(128);
const zIndex = z.number().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER).nullable().optional();
// Preserve optional scalar fields without treating them as validated SDK enums.
const docType = integer.max(255).optional();
const board = z.object({ uuid: identifier, title, zIndex }).strict();
const schematic = z.object({ uuid: identifier, name: title, board: boardReference, source: z.literal(""), version, updateTime: time }).strict();
const sheet = z.object({ uuid: identifier, title, schematic_uuid: identifier, docType, zIndex, source: z.literal(""), version, updateTime: time }).strict();
const pcb = z.object({ uuid: identifier, title, board: boardReference, zIndex, docType, parent_uuid: z.literal(""), source: z.literal(""), version, updateTime: time }).strict();
const panel = z.object({ uuid: identifier, title, zIndex, docType }).strict();
const accountText = z.string().max(4096).nullable();
const structureSchema = z.object({ boards: z.record(identifier, board), schematics: z.record(identifier, schematic), sheets: z.record(identifier, sheet),
  pcbs: z.record(identifier, pcb), panels: z.record(identifier, panel), blockSymbols: z.object({}).strict(),
  owner: z.object({ uuid: ownerIdentifier, username: accountText, nickname: accountText, avatar: accountText }).strict() }).strict();
const beforeSchema = z.object({ name: title, version, updateTime: time }).strict();
const inputSchema = z.object({ structureText: z.string().min(1).max(MAX_TEXT_BYTES), targetUuid: identifier, expectedOwnerUuid: ownerIdentifier,
  expectedBefore: beforeSchema, desiredTitle: title, documentTime: time }).strict();
type Structure = z.infer<typeof structureSchema>;
const LIMITS = Object.freeze({ executionAuthorized: false, producerBindingVerified: false, completeHistoryVerified: false,
  actorProvenanceVerified: false, clockProvenanceVerified: false, nativeNamePolicyVerified: false,
  queueCompletionVerified: false, fullSqlVerified: false, reopened: false } as const);
export interface CurrentSchematicRenameStructureProjection extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-schematic-rename-structure.v1";
  readonly targetUuid: string;
  readonly beforeStructureText: string;
  readonly afterStructureText: string;
  readonly beforeStructureSha256: string;
  readonly afterStructureSha256: string;
  readonly documentCount: number;
  readonly documentTime: number;
}
export interface CurrentSchematicRenameStructureComparison extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-schematic-rename-structure-comparison.v1";
  readonly exactStructureText: true;
  readonly afterStructureSha256: string;
}
const projections = new WeakSet<object>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current schematic rename structure: ${message}`); }
}
function fields(value: unknown, names: readonly string[]): Record<string, unknown> {
  need(typeof value === "object" && value !== null && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain input required");
  const keys = Reflect.ownKeys(value);
  need(keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)), "input keys differ");
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
  // Exact reserialization rejects unknown fields, duplicate keys, alternate
  // Encodings, missing values and changes to native member/key order.
  need(JSON.stringify(parsed) === text, "structure is not exact native-shaped serialization"); return parsed;
}
function verifyCollection(collection: Readonly<Record<string, { readonly uuid: string }>>, known: Set<string>): void {
  for (const [key, value] of Object.entries(collection)) {
    need(key === value.uuid && !known.has(key), "document identity is ambiguous"); known.add(key);
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

/** Ordinary source-empty containers only. This is complete structure text,
 * not complete document history. Every child sheet stays byte-identical;
 * unsupported hierarchy/reuse/unknown fields refuse instead of being removed.
 */
export function prepareCurrentSchematicRenameStructure(input: unknown): CurrentSchematicRenameStructureProjection {
  const raw = fields(input, ["structureText", "targetUuid", "expectedOwnerUuid", "expectedBefore", "desiredTitle", "documentTime"]);
  const captured = inputSchema.parse({ ...raw, expectedBefore: fields(raw["expectedBefore"], ["name", "version", "updateTime"]) });
  const structure = parseStructure(captured.structureText);
  const documentCount = verifyMembership(structure);
  need(structure.owner.uuid === captured.expectedOwnerUuid, "owner identity differs");
  const target = structure.schematics[captured.targetUuid];
  need(target !== undefined && target.uuid === captured.targetUuid, "target schematic identity is missing");
  need(target.name === captured.expectedBefore.name && target.version === captured.expectedBefore.version && target.updateTime === captured.expectedBefore.updateTime, "target baseline differs");
  need(captured.desiredTitle !== target.name, "unchanged title refused");
  need(captured.documentTime > target.updateTime, "document clock must be strictly newer");
  target.name = captured.desiredTitle; target.version = String(captured.documentTime); target.updateTime = captured.documentTime;
  const afterStructureText = JSON.stringify(structure);
  need(Buffer.byteLength(afterStructureText, "utf8") <= MAX_TEXT_BYTES, "projected structure byte bound exceeded");
  const projection: CurrentSchematicRenameStructureProjection = Object.freeze({ profile: "private.current-schematic-rename-structure.v1", targetUuid: captured.targetUuid,
    beforeStructureText: captured.structureText, afterStructureText, beforeStructureSha256: digest(captured.structureText), afterStructureSha256: digest(afterStructureText),
    documentCount, documentTime: captured.documentTime, ...LIMITS });
  projections.add(projection); return projection;
}

/** Byte equality only. Matching text cannot establish SQL row/ticket effects,
 * deferred subscriber completion, original ownership or saved verification.
 */
export function verifyCurrentSchematicRenameStructure(projection: CurrentSchematicRenameStructureProjection, observedText: unknown): CurrentSchematicRenameStructureComparison {
  need(projections.has(projection), "original pure projection required");
  need(typeof observedText === "string" && observedText === projection.afterStructureText, "complete structure text differs");
  return Object.freeze({ profile: "private.current-schematic-rename-structure-comparison.v1", exactStructureText: true,
    afterStructureSha256: projection.afterStructureSha256, ...LIMITS });
}
