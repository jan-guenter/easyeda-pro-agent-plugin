/** SCH native metadata observations and original-SQL comparisons only.
 * No original worker, lifecycle, subscriber or writer authority is issued.
 */
import { types } from "node:util";
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { assertOriginalCurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS,
  currentSchematicRenamePeerSchema, currentSchematicRenamePreflightRequestSchema, parseCurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import { currentSymbolRuntimeObservationSchema } from "./current-symbol-runtime-observation.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

export const CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS = 10_000;
export const CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS = Object.freeze({ permissionVerified: false, backendActorVerified: false,
  backendClockVerified: false, startupQualified: false, workerIdentityVerified: false, producerBindingVerified: false,
  sourceMembershipVerified: false, queueCompletionVerified: false, schematicSubscriberCompletionVerified: false,
  generationClosureVerified: false, persistentUploadReplayExcluded: false, persistenceVerified: false,
  writerAuthority: false, executionAuthorized: false, mutationDispatched: false, explicitSaveDispatched: false, reopened: false } as const);
const limitations = z.object({ permissionVerified: z.literal(false), backendActorVerified: z.literal(false), backendClockVerified: z.literal(false),
  startupQualified: z.literal(false), workerIdentityVerified: z.literal(false), producerBindingVerified: z.literal(false),
  sourceMembershipVerified: z.literal(false), queueCompletionVerified: z.literal(false), schematicSubscriberCompletionVerified: z.literal(false),
  generationClosureVerified: z.literal(false), persistentUploadReplayExcluded: z.literal(false), persistenceVerified: z.literal(false),
  writerAuthority: z.literal(false), executionAuthorized: z.literal(false), mutationDispatched: z.literal(false),
  explicitSaveDispatched: z.literal(false), reopened: z.literal(false) });
export const currentSchematicRenameObservationSchema = limitations.extend({ ok: z.literal(true), kind: z.literal("current-schematic-rename-preflight"),
  ...currentSchematicRenamePreflightRequestSchema.shape, samples: z.literal(2), currentTabId: z.enum(["tab_page1", "0"]),
  peers: z.array(currentSchematicRenamePeerSchema).min(1).max(CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS),
  nativeNameAvailableObserved: z.literal(true), completeNativeSchematicMapObserved: z.literal(true), expectedBeforeMatched: z.literal(true),
  noEditorTabsObserved: z.literal(true), hiddenEditorsAbsentObserved: z.literal(true), dirtyTabsAbsentObserved: z.literal(true),
  cachedProjectReadOnlyAbsentObserved: z.literal(true), concurrentStrictModeAbsentObserved: z.literal(true),
  clientTicketObservation: z.object({ client: z.string().regex(/^[a-f0-9]{16}$/u), maxTicket: currentSchematicRenamePeerSchema.shape.ticket,
    samples: z.literal(4) }).strict(), runtimeObservation: currentSymbolRuntimeObservationSchema,
}).strict().refine(value => {
  const selected = value.peers.find(peer => peer.uuid === value.target.schematicUuid);
  return selected !== undefined && canonicalJson(selected) === canonicalJson({ uuid: value.target.schematicUuid, ...value.expectedBefore }) &&
    value.peers.every((peer, index) => peer.name === peer.displayName.toLowerCase() && peer.name !== value.desiredTitle.toLowerCase() &&
      peer.ticket <= value.clientTicketObservation.maxTicket && (index === 0 || peer.uuid > (value.peers[index - 1]?.uuid ?? peer.uuid)));
});
export type CurrentSchematicRenameObservation = z.infer<typeof currentSchematicRenameObservationSchema>;
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current schematic observation: ${message}`); }
}
function copyData(value: unknown, budget: { nodes: number; bytes: number }, depth = 0): unknown {
  budget.nodes += 1; need(depth <= 8 && budget.nodes <= 65_536, "data bound exceeded");
  if (value === null || typeof value === "boolean" || typeof value === "number") { return value; }
  if (typeof value === "string") { budget.bytes += Buffer.byteLength(value); need(budget.bytes <= CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, "data bound exceeded"); return value; }
  need(value !== null && typeof value === "object" && !types.isProxy(value), "plain own data required");
  const array = Array.isArray(value), prototype: unknown = Object.getPrototypeOf(value);
  need(array ? prototype === Array.prototype : prototype === Object.prototype || prototype === null, "data prototype differs");
  const keys = Reflect.ownKeys(value); need(keys.length <= CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS + 1, "data bound exceeded");
  if (array) {
    const length = Object.getOwnPropertyDescriptor(value, "length");
    need(length !== undefined && Object.hasOwn(length, "value") && typeof length.value === "number" && Number.isSafeInteger(length.value) && length.value >= 0 &&
      keys.length === length.value + 1, "dense array required");
    const result: unknown[] = [];
    for (let index = 0; index < length.value; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "array accessors refused");
      result.push(copyData(descriptor.value as unknown, budget, depth + 1));
    }
    return result;
  }
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    need(typeof key === "string" && key.length <= 128, "data key refused");
    budget.bytes += Buffer.byteLength(key); need(budget.bytes <= CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, "data bound exceeded");
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "data accessors refused");
    Object.defineProperty(result, key, { enumerable: true, value: copyData(descriptor.value as unknown, budget, depth + 1) });
  }
  return result;
}
export function validateCurrentSchematicRenameObservation(request: unknown, raw: unknown): CurrentSchematicRenameObservation {
  const selected = parseCurrentSchematicRenamePreflightRequest(copyData(request, { nodes: 0, bytes: 0 }));
  const result = currentSchematicRenameObservationSchema.parse(copyData(raw, { nodes: 0, bytes: 0 }));
  need(canonicalJson(result.target) === canonicalJson(selected.target) && canonicalJson(result.expectedBefore) === canonicalJson(selected.expectedBefore) &&
    result.desiredTitle === selected.desiredTitle, "request differs");
  need(Buffer.byteLength(JSON.stringify(result)) <= CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, "result bound exceeded"); return freezeDeep(result);
}
export function decodeCurrentSchematicRenameObservation(raw: unknown, request: unknown): CurrentSchematicRenameObservation {
  const captured = copyData(raw, { nodes: 0, bytes: 0 }); assertUpstreamReplySettled(captured);
  const envelope = z.object({ schema: z.literal(EXACT_READ_ENVELOPE_SCHEMA), utf8Bytes: z.number().int().nonnegative(),
    json: z.string().min(1).max(CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES) }).strict().parse(extractToolPayload(captured));
  need(Buffer.byteLength(JSON.stringify(envelope)) <= CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, "envelope bound exceeded");
  return validateCurrentSchematicRenameObservation(request, decodeExactReadEnvelope(envelope));
}
/** This is a relation between original historical SQL and supplied observations,
 * not proof that the supplied actor/client/clocks came from a retained producer.
 * The runtime wrapper separately obtains the fixed program's actual return.
 */
export function compareCurrentSchematicRenameObservation(metadata: CurrentSchematicNativeMetadata, before: Inventory,
  raw: unknown): Readonly<Record<string, unknown>> {
  assertOriginalCurrentSchematicNativeMetadata(metadata, before);
  const observation = validateCurrentSchematicRenameObservation(metadata.request, raw);
  need(canonicalJson(observation.peers) === canonicalJson(metadata.peers) && observation.clientTicketObservation.maxTicket === metadata.maximumTicket,
    "complete original SQL metadata or maximum ticket differs");
  assertOriginalCurrentSchematicNativeMetadata(metadata, before);
  return Object.freeze({ profile: "private.current-schematic-rename-observation-comparison.v1", sqlSha256: before.logicalSha256,
    projectionSha256: metadata.projectionSha256, observationSha256: sha256Json(observation), historicalMetadataMatched: true,
    ...CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS });
}
