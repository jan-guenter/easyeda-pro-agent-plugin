import { createHash } from "node:crypto";
import { z } from "zod";
import { designActionSchema } from "./design-action.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { listLibraryExecutionCapabilities } from "./library-execution.ts";
import { SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL } from "./exact-readers.ts";
import { FLAT_DISPLAY_TRANSACTION_PROFILE } from "./flat-display-binding.ts";
import { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE } from "./flat-display-library-peers.ts";
import { FLAT_WIRE_TRANSACTION_PROFILE } from "./flat-wire-binding.ts";

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
      ...(query.family === "library" ? { executionCapabilities: libraryStatuses.get(entry.action) } : {}),
      ...(query.family === "library" && libraryStatuses.get(entry.action)?.["executionRefusal"] !== undefined ? {
        executionRefusal: libraryStatuses.get(entry.action)?.["executionRefusal"],
      } : {}),
      liveValidation: "operation-specific;see-capability-matrix",
      ...(query.family === "design" && entry.action.startsWith("sch.") ? {
        executionRestrictions: [{ documentType: 1, reason: SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL,
          ...(entry.action === "sch.layout.batch" ? { exception: {
            profile: FLAT_DISPLAY_TRANSACTION_PROFILE,
            profiles: [FLAT_DISPLAY_TRANSACTION_PROFILE, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE],
            profileSelection: "facade-only: v1 without imported firstTicket provenance; v2 only when unchanged imported SYMBOL/FOOTPRINT peers have complete checkpoint-bound occurrence proofs",
            allowedSteps: ["sch.attribute.display", "sch.text.display"],
            targets: "existing stored records with literal primitiveId selectors",
            scope: "one ordinary fully represented page; complete checkpoint-bound project membership and flat topology",
            requiredProof: "exact nonempty display effect and inverse, unchanged peers, one-shot Save/reopen and complete durable delta",
            importedLibraryPeers: {
              profile: FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE,
              documentTypes: ["SYMBOL", "FOOTPRINT"],
              proof: "reread the sealed original immutable checkpoint at every lifecycle boundary; preserve all atom/header/body encodings, clocks, client presence, tombstones, occurrence order and peer semantic bodies",
              libraryEdits: false, historyCompaction: false,
              sources: ["native-history.ts", "native-atom-header-history.ts", "native-library-header-evidence.ts", "flat-display-library-peers.ts", "flat-display-storage.ts", "design-execution.ts"],
              tests: ["native-history-first-ticket.test.ts", "native-history-first-ticket-adversarial.test.ts", "flat-display-imported-peer-adversarial.test.ts", "flat-display-imported-lifecycle.test.ts", "flat-display-runtime.test.ts"],
              validation: "offline-synthetic-regression;current-generation-live-unclaimed",
            },
            electricalEdits: false,
            executionAuthorized: false,
            liveValidation: "generation-and-operation-specific;see-capability-matrix",
          } } : {}),
          ...(entry.action === "sch.wire.modify" ? { exception: {
            profile: FLAT_WIRE_TRANSACTION_PROFILE,
            profileSelection: "facade-only plan.flatWire; mutually exclusive with display profiles; historical journals are not migrated",
            targets: "one existing unlocked named WIRE with literal primitiveId; preserve every LINE ID/count/style and every ATTR field",
            geometry: "integer endpoints of nonzero orthogonal LINE segments only; unchanged category-derived child order",
            requiredProof: "complete checkpoint-bound flat topology and contact-incidence multiset; fixed pin and foreign-wire contact coordinates; exact generated-marker indexes and complete durable peer proof",
            markerRestrictions: "no shared-WIRE endpoints or pin-bearing junctions",
            inverse: "original ID-to-segment association only while a fresh complete durable checkpoint remains the baseline",
            lifecycle: "no-repeat Save/reopen or retained original successful Save acknowledgment; no compiler, annotation or Save All",
            electricalConnectivityChanges: false,
            executionAuthorized: false,
            liveValidation: "offline-regression;current-generation-live-unclaimed",
          } } : {}),
        }],
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
