import { createHash } from "node:crypto";
import { z } from "zod";
import { publicSdkReadDescriptors, publicSdkReadRequestSchema } from "./public-sdk-read.ts";

export const publicSdkCatalogQuerySchema = z.object({
  method: z.string().min(1).max(160).optional(),
  search: z.string().min(1).max(100).optional(),
  includeSchemas: z.boolean().default(false),
  offset: z.number().int().min(0).max(10_000).default(0),
  limit: z.number().int().min(1).max(100).default(25),
}).strict();
export const publicSdkValidationQuerySchema = z.object({ request: z.unknown() }).strict();
const MAX_ENTRIES_BYTES = 196_608;

/** This uses the execution module's descriptors and parser, not a second schema. */
export function queryPublicSdkReads(input: unknown = {}): Record<string, unknown> {
  const query = publicSdkCatalogQuerySchema.parse(input);
  const all = publicSdkReadDescriptors();
  const search = query.search?.toLowerCase();
  const matched = all.filter((entry) => (query.method === undefined || entry.path === query.method) &&
    (search === undefined || entry.path.toLowerCase().includes(search)));
  const entries: Record<string, unknown>[] = [];
  for (const entry of matched.slice(query.offset, query.offset + query.limit)) {
    const { inputSchema, ...descriptor } = entry;
    const result = { ...descriptor, ...(query.includeSchemas ? { inputSchema,
      inputSchemaSha256: createHash("sha256").update(JSON.stringify(inputSchema)).digest("hex") } : {}) };
    if (Buffer.byteLength(JSON.stringify([...entries, result]), "utf8") > MAX_ENTRIES_BYTES) {
      if (entries.length === 0) { throw new Error("Individual SDK-read schema exceeds the inline catalog budget."); }
      break;
    }
    entries.push(result);
  }
  const nextOffset = query.offset + entries.length;
  let authority = "public-sdk-observation-not-complete-design-proof";
  if (matched.some((entry) => entry.implementation.kind === "native-task-equivalent")) {
    authority = matched.every((entry) => entry.implementation.kind === "native-task-equivalent")
      ? "native-id-observation-not-complete-source-connectivity-or-persistence-proof"
      : "mixed-sdk-observations-not-complete-source-connectivity-or-persistence-proof";
  }
  return { schema: "easyeda-pro-control.public-sdk-read-catalog.v1", offline: true, executionAuthorized: false,
    tool: "easyeda_control_sdk_read", total: all.length, matched: matched.length, entries,
    offset: query.offset, returned: entries.length, nextOffset: nextOffset < matched.length ? nextOffset : null,
    limits: { maxEntriesBytes: MAX_ENTRIES_BYTES },
    authority,
    liveValidation: "Per-method evidence is separate; offline tests do not establish connected validation.",
  };
}

export function validatePublicSdkArguments(input: unknown): Record<string, unknown> {
  const { request } = publicSdkValidationQuerySchema.parse(input);
  const result = publicSdkReadRequestSchema.safeParse(request);
  if (result.success) {
    const encoded = JSON.stringify(result.data);
    const bytes = Buffer.byteLength(encoded, "utf8");
    return { valid: true, offline: true, executionAuthorized: false, nativePreflightPerformed: false,
      normalizedRequestBytes: bytes, normalizedRequestSha256: createHash("sha256").update(encoded).digest("hex"),
      ...(bytes <= MAX_ENTRIES_BYTES ? { normalizedRequest: result.data } : { normalizedRequestOmitted: true }) };
  }
  return { valid: false, offline: true, executionAuthorized: false, nativePreflightPerformed: false,
    issueCount: result.error.issues.length,
    issues: result.error.issues.slice(0, 32).map((issue) => ({ code: issue.code,
      path: issue.path.slice(0, 16).map((part) => String(part).slice(0, 256)),
      message: issue.message.slice(0, 1024) })) };
}
