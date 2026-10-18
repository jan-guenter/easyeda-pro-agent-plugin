import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { currentProjectPcbMetadataResultSchema } from "./current-project-pcb-metadata.ts";
import { currentSymbolRuntimeObservationSchema } from "./current-symbol-runtime-observation.ts";

export const CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES = 524_288;
export const CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS = 10_000;
export const CURRENT_PCB_RENAME_PREFLIGHT_MAX_PEERS = 4096;
const id = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const targetSchema = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  pcbUuid: id, ownerUuid: z.string().regex(/^[a-f0-9]{32}$/u) }).strict();
const metadataSchema = currentProjectPcbMetadataResultSchema.shape.value.omit({ projectUuid: true, ownerUuid: true });
const beforeSchema = metadataSchema.omit({ uuid: true }).extend({ parentUuid: z.literal(""), source: z.literal("") }).strict();
const title = z.string().min(1).max(512).refine((value) => value.trim() === value && !/\p{Cc}/u.test(value));
export const currentPcbRenamePreflightRequestSchema = z.object({ target: targetSchema, expectedBefore: beforeSchema, desiredTitle: title }).strict()
  .refine((value) => value.desiredTitle !== value.expectedBefore.displayTitle);
export type CurrentPcbRenamePreflightRequest = z.infer<typeof currentPcbRenamePreflightRequestSchema>;
const limitations = {
  permissionVerified: false, backendActorVerified: false, backendClockVerified: false, startupQualified: false,
  workerIdentityVerified: false, producerBindingVerified: false, sourceMembershipVerified: false, persistenceVerified: false,
  writerAuthority: false, executionAuthorized: false, mutationDispatched: false, explicitSaveDispatched: false,
} as const;
const limitationSchema = z.object({ permissionVerified: z.literal(false), backendActorVerified: z.literal(false), backendClockVerified: z.literal(false),
  startupQualified: z.literal(false), workerIdentityVerified: z.literal(false), producerBindingVerified: z.literal(false),
  sourceMembershipVerified: z.literal(false), persistenceVerified: z.literal(false), writerAuthority: z.literal(false),
  executionAuthorized: z.literal(false), mutationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false) });
export const currentPcbRenamePreflightResultSchema = limitationSchema.extend({ ok: z.literal(true), kind: z.literal("current-pcb-rename-preflight"),
  target: targetSchema, expectedBefore: beforeSchema, desiredTitle: title, samples: z.literal(2), currentTabId: z.enum(["tab_page1", "0"]),
  peers: z.array(metadataSchema).min(1).max(CURRENT_PCB_RENAME_PREFLIGHT_MAX_PEERS),
  nativeNameAvailableObserved: z.literal(true), completeNativePcbMapObserved: z.literal(true), expectedBeforeMatched: z.literal(true),
  noEditorTabsObserved: z.literal(true), hiddenEditorsAbsentObserved: z.literal(true), dirtyTabsAbsentObserved: z.literal(true),
  cachedProjectReadOnlyAbsentObserved: z.literal(true), concurrentStrictModeAbsentObserved: z.literal(true),
  clientTicketObservation: z.object({ client: z.string().regex(/^[a-f0-9]{16}$/u), maxTicket: beforeSchema.shape.ticket, samples: z.literal(4) }).strict(),
  runtimeObservation: currentSymbolRuntimeObservationSchema,
}).strict().refine((value) => {
  const target = value.peers.find((peer) => peer.uuid === value.target.pcbUuid), uuids = value.peers.map((peer) => peer.uuid);
  return value.desiredTitle !== value.expectedBefore.displayTitle && new Set(uuids).size === uuids.length &&
    uuids.every((uuid, index) => index === 0 || uuid > (uuids[index - 1] ?? uuid)) && target !== undefined &&
    canonicalJson(target) === canonicalJson({ uuid: value.target.pcbUuid, ...value.expectedBefore }) &&
    value.peers.every((peer) => peer.ticket <= value.clientTicketObservation.maxTicket);
});
export type CurrentPcbRenamePreflightResult = z.infer<typeof currentPcbRenamePreflightResultSchema>;
const notes = [
  "Read-only preflight for an ordinary PCB with empty parent/source in one exact loaded local project/branch and no editor tabs or hidden frames. Supplied expectedBefore values must later be bound to an original prepared baseline; they are not history, ownership or permission proof.",
  "Two equal complete native PCB metadata maps use the non-swallowing getAllKVDatas route, preserve native title/display_title separately and match the target's explicit getData response. Map membership is observed, not full source/history membership. Native source/version/board fallback semantics remain lossy.",
  "The fixed getIdByTitle lookup applies the actual worker's name comparison. Only an exact empty-string reply means no match; a match, missing field, swallowed error or malformed reply refuses. No tryRename, suffix selection, public modifyPcbName, reuse-block propagation or write is called. Availability is an observation, not a lock or future writer admission.",
  "Four agreeing client/maxTicket observations and four dual-UI actor/renderer-notify clock samples retain their receivers. They do not prove the original worker constructor, captured PCB producer user/client, backend request actor, qualified backend clock, startup, queue completion or persistence.",
  "At most 4096 native PCB entries and 524288 UTF-8 envelope bytes, without truncation. The ten-second deadline prevents further reads after expiry but cannot cancel an already dispatched native request. No navigation, canvas request, explicit Save, APP evaluator or network getter is dispatched. Source tests are not connected validation.",
] as const;

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_PCB_RENAME_PREFLIGHT_SHAPE");
  }
  const value: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_PCB_RENAME_PREFLIGHT_SHAPE"); }
    value[name] = descriptor.value as unknown;
  }
  return value;
}
export function parseCurrentPcbRenamePreflightRequest(input: unknown): CurrentPcbRenamePreflightRequest {
  const value = fields(input, ["target", "expectedBefore", "desiredTitle"]);
  return currentPcbRenamePreflightRequestSchema.parse({ target: fields(value["target"], ["projectUuid", "branchUuid", "pcbUuid", "ownerUuid"]),
    expectedBefore: fields(value["expectedBefore"], ["title", "displayTitle", "parentUuid", "source", "version", "boardUuid", "ticket", "updateTime", "docType"]),
    desiredTitle: value["desiredTitle"] });
}
export function queryCurrentPcbRenamePreflight(input: unknown = {}): Record<string, unknown> {
  const query = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{ effect: "current-pcb-rename-preflight", liveValidation: "not-recorded",
    invocationEnabledByDiscovery: false, limitations: [...notes], ...(query.includeSchemas ? {
      inputSchema: z.toJSONSchema(currentPcbRenamePreflightRequestSchema), resultSchema: z.toJSONSchema(currentPcbRenamePreflightResultSchema),
    } : {}) }] };
}
export function validateCurrentPcbRenamePreflightArguments(input: unknown): Record<string, unknown> {
  try { return { valid: true, request: parseCurrentPcbRenamePreflightRequest(input), executionAuthorized: false }; }
  catch (error) {
    return { valid: false, executionAuthorized: false, issues: error instanceof z.ZodError
      ? error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) }))
      : [{ path: [], message: "Expected exact own-data target, expectedBefore and desiredTitle fields." }] };
  }
}
export function validateCurrentPcbRenamePreflightResult(input: unknown, raw: unknown): CurrentPcbRenamePreflightResult {
  const result = currentPcbRenamePreflightResultSchema.parse(raw), selected = parseCurrentPcbRenamePreflightRequest(input);
  if (canonicalJson(result.target) !== canonicalJson(selected.target) || canonicalJson(result.expectedBefore) !== canonicalJson(selected.expectedBefore) ||
    result.desiredTitle !== selected.desiredTitle || Buffer.byteLength(JSON.stringify(result), "utf8") > CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES) {
    throw new Error("CURRENT_PCB_RENAME_PREFLIGHT_TARGET");
  }
  for (const peer of result.peers) { Object.freeze(peer); }
  Object.freeze(result.peers); Object.freeze(result.target); Object.freeze(result.expectedBefore); Object.freeze(result.clientTicketObservation);
  for (const sample of result.runtimeObservation.clockSamples) { Object.freeze(sample); }
  Object.freeze(result.runtimeObservation.clockSamples); Object.freeze(result.runtimeObservation.actor); Object.freeze(result.runtimeObservation);
  return Object.freeze(result);
}
export function decodeCurrentPcbRenamePreflightReply(raw: unknown, expected: unknown): CurrentPcbRenamePreflightResult {
  assertUpstreamReplySettled(raw);
  const envelope = fields(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" || envelope["json"].length === 0 ||
    envelope["json"].length > CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES || !Number.isSafeInteger(envelope["utf8Bytes"]) ||
    Buffer.byteLength(envelope["json"], "utf8") > CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES ||
    Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES) { throw new Error("CURRENT_PCB_RENAME_PREFLIGHT_ENVELOPE"); }
  return validateCurrentPcbRenamePreflightResult(expected, decodeExactReadEnvelope(envelope));
}

export const CURRENT_PCB_RENAME_PREFLIGHT_LIMITATIONS = Object.freeze(limitations);
