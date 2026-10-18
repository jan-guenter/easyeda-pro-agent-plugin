/** Supplied SCH child/AST projections only; no native receiver or writer token. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentSchematicRenamePreflightRequestSchema } from "./current-schematic-rename-preflight.ts";
import { currentSchematicStoredHeaderSchema } from "./current-schematic-stored-header.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_CHILD_MAX_COUNT = 128;
const MAX_BYTES = 524_288;
const id = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const title = currentSchematicRenamePreflightRequestSchema.shape.desiredTitle;
const finite = z.number().refine(value => !Object.is(value, -0));
const integer = finite.int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const version = z.string().min(1).max(128);
const time = integer.max(8_640_000_000_000_000);
// Worker vg.get1919022 / nr.sheet1810830 use title/display_title and
// Schematic_uuid, unlike the SCH container's name/display_name/board fields.
export const currentSchematicChildStoredHeaderSchema = currentSchematicStoredHeaderSchema.extend({ docType: z.literal("SCH_PAGE") }).strict();
export const currentSchematicChildKvSchema = z.object({ uuid: id, project_uuid: z.string().regex(/^[a-f0-9]{64}$/u),
  schematic_uuid: id, title, display_title: title, docType: z.literal(1), zIndex: finite, source: z.literal(""),
  version, updateTime: time.positive(), ticket: integer }).strict();
const childAstSchema = z.object({ uuid: id, title, displayTitle: title, zIndex: finite }).strict();
export const currentSchematicChildAstSchema = z.object({ uuid: id, title, displayTitle: title, board: z.union([z.literal(""), id]),
  version, updateTime: time.positive(), blockSymbolUuid: z.literal(""),
  sort: z.array(id).max(CURRENT_SCHEMATIC_CHILD_MAX_COUNT), sheets: z.record(id, childAstSchema) }).strict();
const emptyPending = z.union([z.null(), z.array(id).length(0)]);
const inactiveCbb = z.union([z.literal(false), z.null(), z.literal(0)]).optional();
const sampleSchema = z.object({ childKv: z.record(id, currentSchematicChildKvSchema),
  manager: z.object({ prjUuid: z.string().regex(/^[a-f0-9]{64}$/u), batchDepth: z.literal(0), _isClose: z.literal(false),
    CBB: inactiveCbb,
    pendingSchematics: emptyPending, pendingSheets: emptyPending }).strict(),
  ast: z.object({ isBuild: z.literal(true), isPass: z.literal(false), transId: integer.positive(), lastModify: finite.nonnegative(),
    schematic: currentSchematicChildAstSchema }).strict(),
  tempAst: z.object({ isBuild: z.literal(false), isPass: z.literal(false), transId: integer.positive(),
    schematic: currentSchematicChildAstSchema }).strict(),
}).strict().refine(value => Object.keys(value.childKv).length <= CURRENT_SCHEMATIC_CHILD_MAX_COUNT &&
  value.ast.transId === value.tempAst.transId &&
  (value.manager.pendingSchematics === null) === (value.manager.pendingSheets === null) &&
  !Object.is(value.manager.batchDepth, -0) && !Object.is(value.manager.CBB, -0));
const observationSchema = z.object({ profile: z.literal("private.current-schematic-child-roster-observation.v1"),
  target: currentSchematicRenamePreflightRequestSchema.shape.target, samples: z.tuple([sampleSchema, sampleSchema]) }).strict()
  .refine(value => canonicalJson(value.samples[0]) === canonicalJson(value.samples[1]), "two supplied settled samples must agree");
export type CurrentSchematicChildKv = z.infer<typeof currentSchematicChildKvSchema>;
export type CurrentSchematicChildAst = z.infer<typeof currentSchematicChildAstSchema>;
export type CurrentSchematicChildObservation = z.infer<typeof observationSchema>;
export const CURRENT_SCHEMATIC_CHILD_LIMITATIONS = Object.freeze({ originalOwnerVerified: false, producerBindingVerified: false,
  astReceiverIdentityVerified: false, completeAstSourceBindingVerified: false, docIdBindingVerified: false,
  startupQualified: false, childInitializationExcluded: false, queueCompletionVerified: false,
  schematicSubscriberCompletionVerified: false, generationClosureVerified: false, persistentUploadReplayExcluded: false,
  persistenceVerified: false, writerAuthority: false, executionAuthorized: false, reopened: false } as const);

function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current schematic child data: ${message}`); }
}
function copy(value: unknown, budget: { nodes: number; bytes: number }, depth = 0): unknown {
  budget.nodes += 1; need(depth <= 10 && budget.nodes <= 32_768, "bound exceeded");
  if (value === null || typeof value === "boolean") { return value; }
  if (typeof value === "number") { need(Number.isFinite(value) && !Object.is(value, -0), "finite non-negative-zero number required"); return value; }
  if (typeof value === "string") { budget.bytes += Buffer.byteLength(value); need(budget.bytes <= MAX_BYTES, "bound exceeded"); return value; }
  need(value !== null && typeof value === "object" && !types.isProxy(value), "plain own data required");
  const array = Array.isArray(value), prototype: unknown = Object.getPrototypeOf(value);
  need(array ? prototype === Array.prototype : prototype === Object.prototype || prototype === null, "prototype differs");
  const keys = Reflect.ownKeys(value); need(keys.length <= CURRENT_SCHEMATIC_CHILD_MAX_COUNT + 1, "key bound exceeded");
  if (array) {
    const descriptor = Object.getOwnPropertyDescriptor(value, "length");
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "number" &&
      Number.isSafeInteger(descriptor.value) && descriptor.value >= 0 && keys.length === descriptor.value + 1, "dense array required");
    const result: unknown[] = [];
    for (let index = 0; index < descriptor.value; index += 1) {
      const entry = Object.getOwnPropertyDescriptor(value, String(index)); need(entry !== undefined && Object.hasOwn(entry, "value"), "array accessor refused");
      result.push(copy(entry.value as unknown, budget, depth + 1));
    }
    return result;
  }
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    need(typeof key === "string" && key.length <= 128, "key refused"); budget.bytes += Buffer.byteLength(key); need(budget.bytes <= MAX_BYTES, "bound exceeded");
    const entry = Object.getOwnPropertyDescriptor(value, key); need(entry !== undefined && Object.hasOwn(entry, "value"), "accessor refused");
    Object.defineProperty(result, key, { enumerable: true, value: copy(entry.value as unknown, budget, depth + 1) });
  }
  return result;
}
/** No getters, Proxy traps, sparse arrays or coercion are evaluated. These are
 * projections, not full ASTs: native doc_id/uniqueNumber and geometry are absent.
 * Empty pending arrays stand for supplied empty-set observations, not Set identity.
 */
export function parseCurrentSchematicChildObservation(raw: unknown): CurrentSchematicChildObservation {
  const result = observationSchema.parse(copy(raw, { nodes: 0, bytes: 0 }));
  need(Buffer.byteLength(JSON.stringify(result)) <= MAX_BYTES, "encoded bound exceeded"); return freezeDeep(result);
}
/** Defensive transport copy only, not acceptance of a child observation. */
export function copyCurrentSchematicChildTransport(raw: unknown): unknown {
  return copy(raw, { nodes: 0, bytes: 0 });
}
