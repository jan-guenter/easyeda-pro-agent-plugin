import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "./current-disposable-open-profile.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

export const CURRENT_PROJECT_PCB_METADATA_MAX_BYTES = 64 * 1024;
export const CURRENT_PROJECT_PCB_METADATA_TIMEOUT_MS = 10_000;
const method = "eda.dmt_Pcb.getPcbInfo";
const documentId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const projectId = z.string().regex(/^[a-f0-9]{64}$/u);
const branchId = z.string().regex(/^[a-f0-9]{32}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const targetSchema = z.object({ projectUuid: projectId, branchUuid: branchId, pcbUuid: documentId }).strict();
export const currentProjectPcbMetadataRequestSchema = z.object({ method: z.literal(method), target: targetSchema }).strict();
export const currentProjectPcbMetadataQuerySchema = z.object({ method: z.literal(method).optional(), includeSchemas: z.boolean().default(false) }).strict();
export type CurrentProjectPcbMetadataRequest = z.infer<typeof currentProjectPcbMetadataRequestSchema>;
const valueSchema = z.object({ uuid: documentId, projectUuid: projectId, ownerUuid: branchId, title: z.string().max(512), displayTitle: z.string().max(512),
  parentUuid: z.union([z.literal(""), documentId]), source: z.string().max(4096), version: z.string().max(128), boardUuid: z.string().max(128),
  ticket: integer, updateTime: integer.max(8_640_000_000_000_000), docType: z.literal(3) }).strict();
export const currentProjectPcbMetadataResultSchema = z.object({ ok: z.literal(true), kind: z.literal("current-project-pcb-metadata-observation"),
  method: z.literal(method), target: targetSchema, value: valueSchema, samples: z.literal(2), currentTabId: z.enum(["tab_page1", "0"]),
  implementationKind: z.literal("native-task-equivalent"), noEditorTabsObserved: z.literal(true), hiddenEditorsAbsentObserved: z.literal(true),
  dirtyTabsAbsentObserved: z.literal(true), cachedProjectReadOnlyAbsentObserved: z.literal(true), concurrentStrictModeAbsentObserved: z.literal(true),
  workerIdentityVerified: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false), sourceMembershipVerified: z.literal(false),
  permissionVerified: z.literal(false), mutationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false) }).strict();
export type CurrentProjectPcbMetadataResult = z.infer<typeof currentProjectPcbMetadataResultSchema>;

const limitations = [
  "One existing PCB in the exact loaded local path-hash project and branch. Only the native Start Page and optional hidden blank placeholder are admitted. Editor tabs, hidden/export editors, pending restoration, document URL commands, historical, archived, store, CBB and V2 projects refuse.",
  "Two matching project-qualified PCB metadata samples, bracketed by four project identity/owner checks, retain the outer RPC receiver and complete no-editor registry/DOM owners across awaits. These observations are not continuous exclusion, a lock, worker identity, permission or writer authority.",
  "Native-equivalent metadata, not IDMT_PcbItem or public wrapper parity. Native title and display_title are retained separately without renormalization. Source, version and board already use native value || empty-string fallback; original absence/falsy values cannot be recovered. Parent/board membership is not proved. Creator, modifier, createTime and fixed empty description are not returned.",
  "Only /PrjDB/project/getData and /PrjDB/pcb/getData with explicit project identity are dispatched. No getNeedData/canvas request, public getAllPcbsInfo tree traversal, cloud fetch, clock/client call, navigation, storage-completion request, mutation or explicit Save is made.",
  "At most 128 containers, 255 tree nodes, 256 registry tabs and 65536 UTF-8 envelope bytes. Missing/accessor-backed/oversized/non-finite values refuse without coercion. The ten-second deadline prevents later reads but cannot cancel an already dispatched native request. Offline tests and discovery are not connected validation.",
] as const;

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_PROJECT_PCB_METADATA_SHAPE");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("CURRENT_PROJECT_PCB_METADATA_SHAPE"); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}
export function parseCurrentProjectPcbMetadataRequest(input: unknown): CurrentProjectPcbMetadataRequest {
  const value = fields(input, ["method", "target"]);
  return currentProjectPcbMetadataRequestSchema.parse({ method: value["method"], target: fields(value["target"], ["projectUuid", "branchUuid", "pcbUuid"]) });
}
export function queryCurrentProjectPcbMetadata(input: unknown = {}): Record<string, unknown> {
  const query = currentProjectPcbMetadataQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{ path: method, method, parameters: ["pcbUuid"],
    effect: "current-project-only-pcb-metadata-read", implementationKind: "native-task-equivalent", liveValidation: "not-recorded", limitations: [...limitations],
    provenance: { apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
      apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
      implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, implementationKind: "native-task-equivalent", liveValidation: "not-recorded" },
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentProjectPcbMetadataRequestSchema), resultSchema: z.toJSONSchema(currentProjectPcbMetadataResultSchema) } : {}) }] };
}
export function validateCurrentProjectPcbMetadataArguments(input: unknown): Record<string, unknown> {
  try { return { valid: true, request: parseCurrentProjectPcbMetadataRequest(input), executionAuthorized: false }; }
  catch (error) {
    return { valid: false, executionAuthorized: false, issues: error instanceof z.ZodError
      ? error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) }))
      : [{ path: [], message: "Expected exact own-data method and target fields." }] };
  }
}
function resultFor(input: unknown, raw: unknown): CurrentProjectPcbMetadataResult {
  const request = parseCurrentProjectPcbMetadataRequest(input), result = currentProjectPcbMetadataResultSchema.parse(raw);
  if (result.method !== request.method || canonicalJson(result.target) !== canonicalJson(request.target) ||
    result.value.uuid !== request.target.pcbUuid || result.value.projectUuid !== request.target.projectUuid) { throw new Error("CURRENT_PROJECT_PCB_METADATA_TARGET"); }
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > CURRENT_PROJECT_PCB_METADATA_MAX_BYTES) { throw new Error("CURRENT_PROJECT_PCB_METADATA_BOUND"); }
  Object.freeze(result.target); Object.freeze(result.value); return Object.freeze(result);
}
export function validateCurrentProjectPcbMetadataResult(input: unknown, raw: unknown): Record<string, unknown> {
  return { ...resultFor(input, raw), effect: "current-project-only-pcb-metadata-read", authority: "observed-project-metadata-only;not-write-or-persistence-authority",
    liveValidation: "not-recorded", limitations: [...limitations] };
}
export function decodeCurrentProjectPcbMetadataReply(raw: unknown, input: unknown): CurrentProjectPcbMetadataResult {
  assertUpstreamReplySettled(raw);
  const envelope = fields(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" || envelope["json"].length === 0 ||
    envelope["json"].length > CURRENT_PROJECT_PCB_METADATA_MAX_BYTES || !Number.isSafeInteger(envelope["utf8Bytes"]) ||
    Buffer.byteLength(envelope["json"], "utf8") > CURRENT_PROJECT_PCB_METADATA_MAX_BYTES ||
    Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_PROJECT_PCB_METADATA_MAX_BYTES) { throw new Error("CURRENT_PROJECT_PCB_METADATA_ENVELOPE"); }
  return resultFor(input, decodeExactReadEnvelope(envelope));
}
