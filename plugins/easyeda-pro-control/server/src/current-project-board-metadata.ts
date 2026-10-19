import { types } from "node:util";
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "./current-disposable-open-profile.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

export const CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES = 64 * 1024;
export const CURRENT_PROJECT_BOARD_METADATA_MAX_ITEMS = 128;
export const CURRENT_PROJECT_BOARD_METADATA_TIMEOUT_MS = 10_000;
const selectedMethod = "eda.dmt_Board.getBoardInfo";
const inventoryMethod = "eda.dmt_Board.getAllBoardsInfo";
const boardId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const projectId = z.string().regex(/^[a-f0-9]{64}$/u);
const branchId = z.string().regex(/^[a-f0-9]{32}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const projectTargetSchema = z.object({ projectUuid: projectId, branchUuid: branchId }).strict();
const selectedTargetSchema = projectTargetSchema.extend({ boardUuid: boardId }).strict();
export const currentProjectBoardMetadataRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal(selectedMethod), target: selectedTargetSchema }).strict(),
  z.object({ method: z.literal(inventoryMethod), target: projectTargetSchema }).strict(),
]);
export const currentProjectBoardMetadataQuerySchema = z.object({ method: z.enum([selectedMethod, inventoryMethod]).optional(), includeSchemas: z.boolean().default(false) }).strict();
export type CurrentProjectBoardMetadataRequest = z.infer<typeof currentProjectBoardMetadataRequestSchema>;
const valueSchema = z.object({ uuid: boardId, title: z.string().max(512),
  zIndex: z.number().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0)), ticket: integer }).strict();
const commonSchema = z.object({ ok: z.literal(true), kind: z.literal("current-project-board-metadata-observation"),
  ownerUuid: branchId, observedBoardCount: integer.max(CURRENT_PROJECT_BOARD_METADATA_MAX_ITEMS), completeNativeBoardMapObserved: z.literal(true),
  samples: z.literal(2), currentTabId: z.enum(["tab_page1", "0"]), implementationKind: z.literal("native-task-equivalent"),
  noEditorTabsObserved: z.literal(true), hiddenEditorsAbsentObserved: z.literal(true), dirtyTabsAbsentObserved: z.literal(true),
  cachedProjectReadOnlyAbsentObserved: z.literal(true), concurrentStrictModeAbsentObserved: z.literal(true),
  workerIdentityVerified: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false), sourceMembershipVerified: z.literal(false),
  childMembershipVerified: z.literal(false), publicWrapperParityVerified: z.literal(false), permissionVerified: z.literal(false),
  mutationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false) }).strict();
export const currentProjectBoardMetadataResultSchema = commonSchema.extend({ method: z.literal(selectedMethod), target: selectedTargetSchema,
  value: valueSchema, selectedGetMatchesMapObserved: z.literal(true) }).strict();
export const currentProjectBoardInventoryResultSchema = commonSchema.extend({ method: z.literal(inventoryMethod), target: projectTargetSchema,
  boards: z.array(valueSchema).max(CURRENT_PROJECT_BOARD_METADATA_MAX_ITEMS) }).strict();
export type CurrentProjectBoardMetadataResult = z.infer<typeof currentProjectBoardMetadataResultSchema>;
export type CurrentProjectBoardInventoryResult = z.infer<typeof currentProjectBoardInventoryResultSchema>;
const observationSchema = z.discriminatedUnion("method", [currentProjectBoardMetadataResultSchema, currentProjectBoardInventoryResultSchema]);
type Observation = CurrentProjectBoardMetadataResult | CurrentProjectBoardInventoryResult;

const limitations = [
  "Exact loaded local path-hash project/branch, with only the native Start Page and optional hidden blank placeholder. Editor tabs, hidden/export editors, pending restoration, document URL commands, historical, archived, store, CBB and V2 projects refuse.",
  "Two complete matching project-qualified board metadata maps, each bracketed by project identity/owner checks. Selected mode requires the UUID-selected native GET to match its map member in each sample. The outer RPC receiver and no-editor registry/DOM owners are retained across awaits. No continuous exclusion, lock, worker identity or writer authority is established.",
  "Native-equivalent uuid/title/zIndex/ticket metadata only, not IDMT_BoardItem or public wrapper parity. getBoardInfo selects explicit boardUuid, not the public boardName argument. Raw native title is preserved; duplicate titles are allowed. UUID order is deterministic comparison order, not visual tree order. Child schematic/PCB documents and parent membership are not read or proved.",
  "Only /PrjDB/project/getData, /PrjDB/board/getAllKVData and selected /PrjDB/board/getData with explicit project identity are dispatched. No child/tree/canvas request, public wrapper, caught-error fallback, cloud fetch, clock/client call, navigation, storage-completion request, mutation or explicit Save is made.",
  "Both modes require at most 128 boards and 65536 UTF-8 bytes for the complete native map before selection. Bounds apply after native enumeration and cannot cancel it. Missing/extra native metadata fields, accessors, malformed IDs, non-finite/coerced values and negative zero refuse. Project guard bounds remain 128 containers, 255 tree nodes and 256 tabs. The ten-second deadline prevents later reads but cannot cancel an outstanding native request. Offline tests/discovery are not connected validation.",
] as const;

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_PROJECT_BOARD_METADATA_SHAPE");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_PROJECT_BOARD_METADATA_SHAPE"); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}
export function parseCurrentProjectBoardMetadataRequest(input: unknown): CurrentProjectBoardMetadataRequest {
  const value = fields(input, ["method", "target"]);
  const targetFields = value["method"] === inventoryMethod ? ["projectUuid", "branchUuid"] : ["projectUuid", "branchUuid", "boardUuid"];
  return currentProjectBoardMetadataRequestSchema.parse({ method: value["method"], target: fields(value["target"], targetFields) });
}
export function queryCurrentProjectBoardMetadata(input: unknown = {}): Record<string, unknown> {
  const query = currentProjectBoardMetadataQuerySchema.parse(input);
  const selected = [selectedMethod, inventoryMethod].filter(path => query.method === undefined || path === query.method);
  return { offline: true, invocationEnabledByDiscovery: false, total: selected.length, entries: selected.map(path => {
    const entry = {
    path, method: path, parameters: path === selectedMethod ? ["boardUuid"] : [], effect: "current-project-only-board-metadata-read",
    implementationKind: "native-task-equivalent", liveValidation: "not-recorded", limitations: [...limitations],
    provenance: { apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
      apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
      implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, implementationKind: "native-task-equivalent", liveValidation: "not-recorded" },
    };
    if (query.includeSchemas) { Object.assign(entry, { inputSchema: z.toJSONSchema(currentProjectBoardMetadataRequestSchema), resultSchema: z.toJSONSchema(observationSchema) }); }
    return entry;
  }) };
}
export function validateCurrentProjectBoardMetadataArguments(input: unknown): Record<string, unknown> {
  try { return { valid: true, request: parseCurrentProjectBoardMetadataRequest(input), executionAuthorized: false }; }
  catch (error) {
    return { valid: false, executionAuthorized: false, issues: error instanceof z.ZodError
      ? error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) }))
      : [{ path: [], message: "Expected exact own-data method and target fields." }] };
  }
}
function resultFor(input: unknown, raw: unknown): Observation {
  const request = parseCurrentProjectBoardMetadataRequest(input), result = observationSchema.parse(raw);
  if (result.method !== request.method || canonicalJson(result.target) !== canonicalJson(request.target)) { throw new Error("CURRENT_PROJECT_BOARD_METADATA_TARGET"); }
  if (result.method === selectedMethod) {
    if (result.value.uuid !== result.target.boardUuid || result.observedBoardCount < 1) { throw new Error("CURRENT_PROJECT_BOARD_METADATA_MEMBERSHIP"); }
    Object.freeze(result.value);
  } else {
    if (result.observedBoardCount !== result.boards.length || result.boards.some((value, index) =>
      index > 0 && value.uuid <= (result.boards[index - 1]?.uuid ?? ""))) { throw new Error("CURRENT_PROJECT_BOARD_METADATA_MEMBERSHIP"); }
    for (const value of result.boards) { Object.freeze(value); } Object.freeze(result.boards);
  }
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES) { throw new Error("CURRENT_PROJECT_BOARD_METADATA_BOUND"); }
  Object.freeze(result.target); return Object.freeze(result);
}
export function validateCurrentProjectBoardMetadataResult(input: unknown, raw: unknown): Record<string, unknown> {
  return { ...resultFor(input, raw), effect: "current-project-only-board-metadata-read", authority: "observed-project-metadata-only;not-write-or-persistence-authority",
    liveValidation: "not-recorded", limitations: [...limitations] };
}
export function decodeCurrentProjectBoardMetadataReply(raw: unknown, input: Extract<CurrentProjectBoardMetadataRequest, { method: typeof selectedMethod }>): CurrentProjectBoardMetadataResult;
export function decodeCurrentProjectBoardMetadataReply(raw: unknown, input: Extract<CurrentProjectBoardMetadataRequest, { method: typeof inventoryMethod }>): CurrentProjectBoardInventoryResult;
export function decodeCurrentProjectBoardMetadataReply(raw: unknown, input: unknown): Observation;
export function decodeCurrentProjectBoardMetadataReply(raw: unknown, input: unknown): Observation {
  assertUpstreamReplySettled(raw);
  const envelope = fields(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" || envelope["json"].length === 0 ||
      envelope["json"].length > CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES || !Number.isSafeInteger(envelope["utf8Bytes"]) ||
      Buffer.byteLength(envelope["json"], "utf8") > CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES ||
      Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES) { throw new Error("CURRENT_PROJECT_BOARD_METADATA_ENVELOPE"); }
  return resultFor(input, decodeExactReadEnvelope(envelope));
}
