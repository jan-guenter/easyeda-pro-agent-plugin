import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "./current-disposable-open-profile.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

export const CURRENT_SYMBOL_METADATA_MAX_BYTES = 384 * 1024;
const method = "eda.lib_Symbol.get";
const documentId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const projectId = z.string().regex(/^[a-f0-9]{64}$/u);
const ownerId = z.string().regex(/^[a-f0-9]{32}$/u);
const targetSchema = currentPcbLayersRequestSchema.shape.target.refine((value) => /^[a-f0-9]{64}$/u.test(value.projectUuid),
  "This reader supports existing local path-hash projects only.");
export const currentSymbolMetadataRequestSchema = z.object({ method: z.literal(method),
  arguments: z.object({ symbolUuid: documentId }).strict(), target: targetSchema }).strict()
  .refine((value) => value.arguments.symbolUuid !== value.target.documentUuid, "The symbol and active PCB must be different documents.");
export type CurrentSymbolMetadataRequest = z.infer<typeof currentSymbolMetadataRequestSchema>;
export function parseCurrentSymbolMetadataRequest(input: unknown): CurrentSymbolMetadataRequest { return currentSymbolMetadataRequestSchema.parse(input); }
export const currentSymbolMetadataQuerySchema = z.object({ method: z.literal(method).optional(), includeSchemas: z.boolean().default(false) }).strict();

// The fixed native metadata reader counts UTF-16 units, not Zod code points.
const nativeText = (maximum: number): z.ZodString => z.string().max(maximum)
  .refine((value) => value.length <= maximum, "Symbol metadata exceeds its UTF-16 unit bound.");
const tagsJson = nativeText(131_072).refine((value) => {
  try { return z.array(nativeText(512)).max(256).safeParse(JSON.parse(value) as unknown).success; }
  catch { return false; }
}, "Native custom_tags must encode a bounded string array.");
const valueSchema = z.object({ uuid: documentId, projectUuid: projectId, ownerUuid: ownerId,
  name: nativeText(512), description: nativeText(65_536), tagsJson, source: nativeText(4096), version: nativeText(128),
  ticket: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0), "Signed zero is unsupported.") }).strict();
export const currentSymbolMetadataResultSchema = z.object({ ok: z.literal(true), kind: z.literal("current-symbol-metadata-observation"),
  method: z.literal(method), target: targetSchema, value: valueSchema, samples: z.literal(2),
  implementationKind: z.literal("native-task-equivalent"), targetClosedInRegistry: z.literal(true), hiddenEditorsVerified: z.literal(false),
  workerIdentityVerified: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false), sourceMembershipVerified: z.literal(false) }).strict();

const limitations = [
  "One existing project-local symbol identified by symbolUuid, with an explicit active ordinary PCB project/branch/document/tab. Only 64-hex local path-hash project identities are admitted. Cloud libraries, external libraries, historical and V2 projects refuse.",
  "Two matching metadata samples correlate symbol and project owner, preserve raw name/description/custom_tags/source/version/ticket, and retain the outer native RPC receiver and complete current tab registry across awaits. The source field is a template identifier, not symbol drawing content. Public SDK result parity is not claimed.",
  "Values preserve the native getter projection, not original META storage. Its source and version fields already use value || empty-string fallback; this reader cannot distinguish an original absent/falsy value from an explicit empty string. Native custom_tags JSON text and display_title spelling remain unchanged.",
  "Target absence is established only in the bounded registered editor tree. Hidden, unregistered or export editors are not independently excluded. This read does not establish a safe-to-write precondition, an atomic lock, worker identity or absence of switching away and back between samples.",
  "Only fixed project-qualified metadata RPCs and native PCB identity reads are dispatched. The symbol getter omits its optional canvas request. No drawing source load, library enrichment, cloud fetch, navigation, Save, mutation or storage-completion request is made.",
  "At most 128 containers, 255 tree nodes, 256 tabs and 393216 UTF-8 result bytes. Strings and native tag JSON are bounded, missing/accessor-backed/non-finite values refuse without coercion. Bounds do not cancel preceding vendor RPC work. Source/offline evidence is not connected validation.",
] as const;

export function queryCurrentSymbolMetadata(input: unknown = {}): Record<string, unknown> {
  const query = currentSymbolMetadataQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{ path: method, method,
    parameters: ["symbolUuid"], effect: "current-project-symbol-metadata-read", implementationKind: "native-task-equivalent",
    liveValidation: "not-recorded", limitations: [...limitations],
    provenance: { apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
      apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
      implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, implementationKind: "native-task-equivalent", liveValidation: "not-recorded" },
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentSymbolMetadataRequestSchema), resultSchema: z.toJSONSchema(currentSymbolMetadataResultSchema) } : {}) }] };
}
export function validateCurrentSymbolMetadataArguments(input: unknown): Record<string, unknown> {
  const result = currentSymbolMetadataRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}
export function validateCurrentSymbolMetadataResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseCurrentSymbolMetadataRequest(input);
  const payload = currentSymbolMetadataResultSchema.parse(raw);
  if (payload.method !== request.method || canonicalJson(payload.target) !== canonicalJson(request.target) ||
      payload.value.uuid !== request.arguments.symbolUuid || payload.value.projectUuid !== request.target.projectUuid) {
    throw new Error("Project symbol metadata differs from its exact target request.");
  }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > CURRENT_SYMBOL_METADATA_MAX_BYTES) { throw new Error("Project symbol metadata exceeds its byte bound."); }
  return { ...payload, effect: "current-project-symbol-metadata-read", authority: "observed-project-metadata-only;not-write-or-persistence-authority",
    liveValidation: "not-recorded", limitations: [...limitations] };
}
