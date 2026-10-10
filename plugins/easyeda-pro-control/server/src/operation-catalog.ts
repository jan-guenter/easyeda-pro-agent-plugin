import { createHash } from "node:crypto";
import { z } from "zod";
import { designActionSchema } from "./design-action.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { listLibraryExecutionCapabilities } from "./library-execution.ts";
import { SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL } from "./exact-readers.ts";

const familySchema = z.enum(["design", "library"]);
export const operationCatalogQuerySchema = z.object({
  family: familySchema,
  operationAction: z.string().min(1).max(128).optional(),
  prefix: z.string().min(1).max(128).optional(),
  offset: z.number().int().min(0).max(10_000).default(0),
  limit: z.number().int().min(1).max(100).default(25),
  includeSchemas: z.boolean().default(false),
}).strict();
export const operationValidationRequestSchema = z.object({
  family: familySchema,
  operation: z.unknown(),
}).strict();

interface OperationEntry {
  readonly action: string;
  readonly parser: z.ZodType;
}
const MAX_CATALOG_BYTES = 196_608;
function collectOperations(parser: z.ZodType): OperationEntry[] {
  if (parser instanceof z.ZodUnion) {
    return parser.options.flatMap((option) => {
      if (!(option instanceof z.ZodType)) { throw new TypeError("Operation catalog parser must use the shared Zod instance."); }
      return collectOperations(option);
    });
  }
  if (parser instanceof z.ZodObject) {
    const discriminator: unknown = parser.shape["action"];
    if (discriminator instanceof z.ZodLiteral && typeof discriminator.value === "string") {
      return [{ action: discriminator.value, parser }];
    }
  }
  throw new Error("Operation catalog requires strict literal-discriminated schemas.");
}
function schemaEntries(family: "design" | "library"): OperationEntry[] {
  const entries = collectOperations(family === "design" ? designActionSchema : libraryOperationSchema)
    .toSorted((left, right) => left.action.localeCompare(right.action, "en"));
  if (new Set(entries.map((entry) => entry.action)).size !== entries.length) {
    throw new Error("Operation catalog contains duplicate action discriminators.");
  }
  return entries;
}

/** Offline documentation of the SAME strict operation parsers used by editing.
 * JSON Schema omits custom refinements; it never authorizes native execution.
 */
export function queryOperationCatalog(input: unknown): Record<string, unknown> {
  const query = operationCatalogQuerySchema.parse(input);
  const all = schemaEntries(query.family);
  const matched = all.filter((entry) =>
    (query.operationAction === undefined || entry.action === query.operationAction) &&
    (query.prefix === undefined || entry.action.startsWith(query.prefix)));
  const libraryStatuses = new Map(listLibraryExecutionCapabilities().map((entry) => [entry["action"], entry]));
  const entries: Record<string, unknown>[] = [];
  for (const entry of matched.slice(query.offset, query.offset + query.limit)) {
    const schema = query.includeSchemas ? z.toJSONSchema(entry.parser, { io: "input", target: "draft-7" }) : undefined;
    const descriptor: Record<string, unknown> = {
      action: entry.action,
      status: query.family === "library" ? libraryStatuses.get(entry.action)?.["status"] : "typed-operation-specific-native-preflight",
      ...(query.family === "library" && libraryStatuses.get(entry.action)?.["executionRefusal"] !== undefined ? {
        executionRefusal: libraryStatuses.get(entry.action)?.["executionRefusal"],
      } : {}),
      liveValidation: "operation-specific;see-capability-matrix",
      ...(query.family === "design" && entry.action.startsWith("sch.") ? {
        executionRestrictions: [{ documentType: 1, reason: SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL }],
      } : {}),
      ...(schema === undefined ? {} : { inputSchema: schema,
        inputSchemaSha256: createHash("sha256").update(JSON.stringify(schema)).digest("hex") }),
    };
    if (Buffer.byteLength(JSON.stringify([...entries, descriptor]), "utf8") > MAX_CATALOG_BYTES) {
      if (entries.length === 0) { throw new Error("Individual operation schema exceeds the inline bound; request its descriptor without includeSchemas."); }
      break;
    }
    entries.push(descriptor);
  }
  const nextOffset = query.offset + entries.length;
  return {
    schema: "easyeda-pro-control.operation-catalog.v1", source: "strict-execution-parsers", family: query.family,
    offline: true, executionAuthorized: false, total: all.length, matched: matched.length,
    offset: query.offset, returned: entries.length, hasMore: nextOffset < matched.length,
    nextOffset: nextOffset < matched.length ? nextOffset : null,
    entries, maxEntriesBytes: MAX_CATALOG_BYTES,
    schemaLimitations: "JSON Schema is structural documentation; custom refinements and native preflight still apply. Use offline validation for refinements, then the existing typed executor for actual context/source/persistence proof.",
    units: "PCB native mil; schematic native 10mil; explicitly named mm fields are mm. Consult the exact action and target editor.",
  };
}

/** Validate an operation without touching EasyEDA, journals, files or IDs. */
export function validateCatalogOperation(input: unknown): Record<string, unknown> {
  const request = operationValidationRequestSchema.parse(input);
  const result = (request.family === "design" ? designActionSchema : libraryOperationSchema).safeParse(request.operation);
  if (result.success) {
    const serialized = JSON.stringify(result.data);
    const normalizedOperationBytes = Buffer.byteLength(serialized, "utf8");
    return { family: request.family, valid: true,
      ...(normalizedOperationBytes <= MAX_CATALOG_BYTES ? { normalizedOperation: result.data } : {}),
      normalizedOperationBytes, normalizedOperationSha256: createHash("sha256").update(serialized).digest("hex"),
      normalizedOperationOmitted: normalizedOperationBytes > MAX_CATALOG_BYTES,
      offline: true, executionAuthorized: false, nativePreflightPerformed: false };
  }
  return { family: request.family, valid: false, offline: true, executionAuthorized: false,
    nativePreflightPerformed: false, issueCount: result.error.issues.length,
    issues: result.error.issues.slice(0, 32).map((issue) => ({
      code: issue.code, path: issue.path.slice(0, 16).map((part) => String(part).slice(0, 256)),
      pathTruncated: issue.path.length > 16 || issue.path.some((part) => String(part).length > 256),
      message: issue.message.slice(0, 1024),
    })) };
}
