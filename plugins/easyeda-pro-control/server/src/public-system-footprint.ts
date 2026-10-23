import { z } from "zod";

export const PUBLIC_SYSTEM_FOOTPRINT_LIBRARY = "0819f05c4eef4c71ace90d822a990e87";
export const PUBLIC_SYSTEM_FOOTPRINT_ORIGIN = "https://pro.easyeda.com";
export const PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES = 1_048_576;
export const PUBLIC_SYSTEM_FOOTPRINT_MAX_RESULT_BYTES = 131_072;
export const PUBLIC_SYSTEM_FOOTPRINT_TIMEOUT_MS = 30_000;
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const safeText = (maximum: number): z.ZodString => z.string().max(maximum).refine((value) => value.isWellFormed() && !value.includes("\u0000"));

/** Caller identifiers never select a host, library, credential or filesystem. */
export const publicSystemFootprintRequestSchema = z.object({ footprintUuid: uuid, confirmNetwork: z.literal(true) }).strict();
export type PublicSystemFootprintRequest = z.infer<typeof publicSystemFootprintRequestSchema>;
export function parsePublicSystemFootprintRequest(input: unknown): PublicSystemFootprintRequest { return publicSystemFootprintRequestSchema.parse(input); }

const limitations = [
  "Vendor HTTP task-equivalent metadata lookup, not execution of eda.lib_Footprint.get or evidence of installed EasyEDA API coverage. EasyEDA, its bridge and runtime fingerprint are not used.",
  "One GET to fixed https://pro.easyeda.com/api/v2/components/{footprintUuid}, with the fixed system-library path header. Only the explicit public asset ID is sent. No cookies, authorization header, account credentials, design source, arbitrary URL or library selector; redirects and authentication fallback are refused.",
  "Network access requires confirmNetwork:true. The vendor can log the public request. No local project, library database, profile, cache or editor is opened or changed by this adapter.",
  "Requires a successful public response with exact asset UUID, system-library path and owner, docType 4 and public:true. Missing, inaccessible, malformed, foreign and unsuccessful responses refuse; a 404 is not proof of absence.",
  "Returns only UUID, library UUID/type, display name, description and classification IDs. Geometry, pads, connectivity, sources, 3D models and other response fields are deliberately omitted. Metadata is not validation of a footprint for manufacturing.",
  "One bounded observation, at most 1 MiB of decoded HTTP body and 128 KiB of result, with a 30-second request/body deadline. No retry, search, pagination or retained result cache. HTTP or vendor caching can still occur; backend freshness, complete assets and saved/reopened persistence are not verified.",
  "The endpoint is an internal vendor HTTP contract observed in the installed UI source, not a stability promise of the public extension SDK. Changes refuse without silently switching host, credentials, library or implementation.",
] as const;

export const publicSystemFootprintQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryPublicSystemFootprint(input: unknown = {}): Record<string, unknown> {
  const query = publicSystemFootprintQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{ operation: "catalog-footprint",
    implementationKind: "vendor-http-task-equivalent", publicSdkMethodExecuted: false, installedRuntimeAdmission: false,
    effect: "public-vendor-catalog-network-read", origin: PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
    invocationEnabledByDiscovery: false, ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(publicSystemFootprintRequestSchema) } : {}),
    limitations: [...limitations], provenance: { source: "pro-ui/3.2.198.2800f583/js/ui.js", getterUtf16Offset: 6_166_194,
      routeUtf16Offset: 6_073_155, sourceSha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
      originSource: "app.js 3.2.209.8a704eab UTF-16 offset 1333182", connectedSdkValidation: "not-performed" } }] };
}
export function validatePublicSystemFootprintArguments(input: unknown): Record<string, unknown> {
  const parsed = publicSystemFootprintRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

// Empty tag arrays are the observed vendor representation of no classification.
// Unknown response fields are deliberately projected away, not claimed complete.
const emptyTag = z.array(z.never()).length(0);
const tag = z.union([z.object({ uuid }), emptyTag]);
const ownerSchema = z.object({ uuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY) });
const resultSchema = z.object({
  uuid, path: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY), docType: z.literal(4), public: z.literal(true),
  owner: ownerSchema, display_title: safeText(512),
  description: safeText(65_536).optional(), tags: z.object({ parent_tag: tag, child_tag: tag }),
});
const responseSchema = z.object({ success: z.literal(true), code: z.literal(0), result: resultSchema });

/** Only the source-derived metadata projection is returned. Remote text is
 * untrusted catalog data, never instructions or proof of component correctness. */
export function validatePublicSystemFootprintResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parsePublicSystemFootprintRequest(input);
  const { result } = responseSchema.parse(raw);
  if (result.uuid !== request.footprintUuid) { throw new Error("PUBLIC_SYSTEM_FOOTPRINT_IDENTITY"); }
  const primary = result.tags.parent_tag, secondary = result.tags.child_tag;
  const output = { ok: true, kind: "public-system-footprint-metadata", implementationKind: "vendor-http-task-equivalent",
    publicSdkMethodExecuted: false, installedRuntimeAdmission: false, origin: PUBLIC_SYSTEM_FOOTPRINT_ORIGIN,
    footprint: { uuid: result.uuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "4", name: result.display_title,
      ...(result.description === undefined ? {} : { description: result.description }), classification: {
        ...(Array.isArray(primary) ? {} : { primaryClassificationUuid: primary.uuid }),
        ...(Array.isArray(secondary) ? {} : { secondaryClassificationUuid: secondary.uuid }) } },
    public: true, observationCount: 1, backendFreshnessVerified: false, completeAssetVerified: false,
    persistenceVerified: false, cadAuthority: false, connectedSdkValidation: "not-performed", limitations: [...limitations] };
  if (Buffer.byteLength(JSON.stringify(output), "utf8") > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESULT_BYTES) { throw new Error("PUBLIC_SYSTEM_FOOTPRINT_RESULT_SIZE"); }
  return output;
}
