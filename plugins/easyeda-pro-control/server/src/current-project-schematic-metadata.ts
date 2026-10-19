import { types } from "node:util";
import { z } from "zod";
import { assertUpstreamReplySettled, canonicalJson, extractToolPayload } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "./current-disposable-open-profile.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES = 512 * 1024;
export const CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS = 10_000;
export const CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_ITEMS = 128;
const methods = ["eda.dmt_Schematic.getSchematicInfo", "eda.dmt_Schematic.getAllSchematicsInfo"] as const;
const documentId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const projectTargetSchema = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u) }).strict();
const selectedTargetSchema = projectTargetSchema.extend({ schematicUuid: documentId }).strict();
export const currentProjectSchematicMetadataRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal(methods[0]), target: selectedTargetSchema }).strict(),
  z.object({ method: z.literal(methods[1]), target: projectTargetSchema }).strict(),
]);
export const currentProjectSchematicMetadataQuerySchema = z.object({ method: z.enum(methods).optional(), includeSchemas: z.boolean().default(false) }).strict();
export type CurrentProjectSchematicMetadataRequest = z.infer<typeof currentProjectSchematicMetadataRequestSchema>;
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const metadata = { uuid: documentId, source: z.string().max(4096), version: z.string().max(128), ticket: integer,
  updateTime: integer.max(8_640_000_000_000_000) };
const childSchema = z.object({ ...metadata, schematicUuid: documentId, title: z.string().max(512), displayTitle: z.string().max(512),
  docType: z.literal(1), zIndex: z.number().refine(value => !Object.is(value, -0)) }).strict();
const schematicSchema = z.object({ ...metadata, name: z.string().max(512), displayName: z.string().max(512), boardUuid: z.string().max(128),
  children: z.array(childSchema).max(CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_ITEMS) }).strict();
export const currentProjectSchematicMetadataResultSchema = z.object({ ok: z.literal(true), kind: z.literal("current-project-schematic-metadata-observation"),
  method: z.enum(methods), target: z.union([selectedTargetSchema, projectTargetSchema]), ownerUuid: projectTargetSchema.shape.branchUuid,
  schematics: z.array(schematicSchema).max(CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_ITEMS),
  observedSchematicCount: integer.max(CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_ITEMS), observedSheetCount: integer.max(CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_ITEMS),
  samples: z.literal(2), currentTabId: z.enum(["tab_page1", "0"]), implementationKind: z.literal("native-task-equivalent"),
  completeNativeSchematicMapObserved: z.literal(true), completeNativeSheetMapObserved: z.literal(true), parentMembershipObserved: z.literal(true),
  noEditorTabsObserved: z.literal(true), hiddenEditorsAbsentObserved: z.literal(true), dirtyTabsAbsentObserved: z.literal(true),
  cachedProjectReadOnlyAbsentObserved: z.literal(true), concurrentStrictModeAbsentObserved: z.literal(true),
  workerIdentityVerified: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false), sourceMembershipVerified: z.literal(false),
  permissionVerified: z.literal(false), startupCompletionVerified: z.literal(false), mutationDispatched: z.literal(false), explicitSaveDispatched: z.literal(false) }).strict();
export type CurrentProjectSchematicMetadataResult = z.infer<typeof currentProjectSchematicMetadataResultSchema>;

const limitations = [
  "Exact loaded local path-hash project/branch with Start Page and optional hidden blank placeholder only. Editor tabs, hidden/export frames, dirty tabs, restoration, document URL commands, read-only/concurrent/historical/archived/store/CBB/V2 state refuse.",
  "Two matching complete native schematic and sheet metadata maps are bracketed by project-owner checks. Every observed sheet must name an observed schematic. Selected lookup additionally matches exact getData. Sorted UUID order is comparison order, not visual sheet order; native zIndex is preserved.",
  "Native-task-equivalent metadata, not public IDMT_SchematicItem parity. Name/displayName and child title/displayTitle remain independent native strings without locale normalization. Source/version/board already use native value || empty-string fallback. Creator/modifier/createTime, derived doc_id, public board names and title blocks are not returned.",
  "Only project getData, schematic getAllKVDatas/getData and sheet getAllKVDatas RPCs with explicit project identity are allowed. No array getter with caught-error fallback, public tree traversal, canvas/getNeedData, clock/client, name availability, permission request, cloud lookup, mutation, Save or navigation.",
  "At most 128 schematic containers and 128 sheets, 128 UI containers/255 tree nodes/256 tabs. The complete combined metadata sample is bounded to 524288 UTF-8 bytes before selected filtering, and the result envelope has the same separate bound. Bounds apply after native enumeration and do not cancel it. Ten-second timeout forbids later reads but cannot cancel an outstanding native call.",
  "Observed map completeness is not saved-source membership, a worker lease, continuous exclusion, startup/queue completion or writer authority. The route does not inspect schematic AST holders or establish title-block/circuit/connectivity data. Connected validation is not recorded.",
] as const;

function fields(input: unknown, names: readonly string[]): Record<string, unknown> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input) ||
    (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== names.length) {
    throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_SHAPE");
  }
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_SHAPE"); }
    result[name] = descriptor.value as unknown;
  }
  return result;
}
export function parseCurrentProjectSchematicMetadataRequest(input: unknown): CurrentProjectSchematicMetadataRequest {
  const value = fields(input, ["method", "target"]);
  const targetFields = value["method"] === methods[0] ? ["projectUuid", "branchUuid", "schematicUuid"] : ["projectUuid", "branchUuid"];
  return currentProjectSchematicMetadataRequestSchema.parse({ method: value["method"], target: fields(value["target"], targetFields) });
}
export function queryCurrentProjectSchematicMetadata(input: unknown = {}): Record<string, unknown> {
  const query = currentProjectSchematicMetadataQuerySchema.parse(input), selected = methods.filter(method => query.method === undefined || method === query.method);
  const entries: Record<string, unknown>[] = [];
  for (const method of selected) {
    entries.push({ path: method, method, parameters: method === methods[0] ? ["schematicUuid"] : [],
      effect: "current-project-only-schematic-metadata-read", implementationKind: "native-task-equivalent", liveValidation: "not-recorded", limitations: [...limitations],
      provenance: { apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
        apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256, implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION,
        implementationKind: "native-task-equivalent", liveValidation: "not-recorded" },
      ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentProjectSchematicMetadataRequestSchema), resultSchema: z.toJSONSchema(currentProjectSchematicMetadataResultSchema) } : {}) });
  }
  return { offline: true, invocationEnabledByDiscovery: false, total: selected.length, entries };
}
export function validateCurrentProjectSchematicMetadataArguments(input: unknown): Record<string, unknown> {
  try { return { valid: true, request: parseCurrentProjectSchematicMetadataRequest(input), executionAuthorized: false }; }
  catch (error) {
    return { valid: false, executionAuthorized: false, issues: error instanceof z.ZodError
      ? error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) }))
      : [{ path: [], message: "Expected exact own-data method and target fields." }] };
  }
}
function resultFor(input: unknown, raw: unknown): CurrentProjectSchematicMetadataResult {
  const request = parseCurrentProjectSchematicMetadataRequest(input), result = currentProjectSchematicMetadataResultSchema.parse(raw);
  if (result.method !== request.method || canonicalJson(result.target) !== canonicalJson(request.target)) { throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_TARGET"); }
  const schematicIds = result.schematics.map(value => value.uuid), sheets = result.schematics.flatMap(value => value.children);
  const sheetIds = sheets.map(value => value.uuid);
  if (new Set([...schematicIds, ...sheetIds]).size !== schematicIds.length + sheetIds.length ||
    schematicIds.some((uuid, index) => index > 0 && uuid <= (schematicIds[index - 1] ?? "")) ||
    result.schematics.some(value => value.children.some((child, index) => child.schematicUuid !== value.uuid ||
      (index > 0 && child.uuid <= (value.children[index - 1]?.uuid ?? "")))) ||
    result.observedSchematicCount < schematicIds.length || result.observedSheetCount < sheets.length) { throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_MEMBERSHIP"); }
  if (request.method === methods[0]) {
    if (schematicIds.length !== 1 || schematicIds[0] !== request.target.schematicUuid) { throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_TARGET"); }
  } else if (result.observedSchematicCount !== schematicIds.length || result.observedSheetCount !== sheets.length) { throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_MEMBERSHIP"); }
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES) { throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_BOUND"); }
  return freezeDeep(result);
}
export function validateCurrentProjectSchematicMetadataResult(input: unknown, raw: unknown): Record<string, unknown> {
  return { ...resultFor(input, raw), effect: "current-project-only-schematic-metadata-read", authority: "observed-project-metadata-only;not-write-or-persistence-authority",
    liveValidation: "not-recorded", limitations: [...limitations] };
}
export function decodeCurrentProjectSchematicMetadataReply(raw: unknown, input: unknown): CurrentProjectSchematicMetadataResult {
  assertUpstreamReplySettled(raw);
  const envelope = fields(extractToolPayload(raw), ["schema", "utf8Bytes", "json"]);
  if (envelope["schema"] !== EXACT_READ_ENVELOPE_SCHEMA || typeof envelope["json"] !== "string" || envelope["json"].length === 0 ||
    envelope["json"].length > CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES || !Number.isSafeInteger(envelope["utf8Bytes"]) ||
    Buffer.byteLength(envelope["json"], "utf8") > CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES ||
    Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES) { throw new Error("CURRENT_PROJECT_SCHEMATIC_METADATA_ENVELOPE"); }
  return resultFor(input, decodeExactReadEnvelope(envelope));
}
