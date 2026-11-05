/** Current209 ordinary type-1 page observations. Existing DTO compilers retain
 * their complete tree, family, source-ID and scalar reproof predicates. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { schematicTextReadRequestSchema, validateSchematicTextStates } from "./schematic-text-read.ts";
import { schematicNetGroupReadRequestSchema, validateSchematicNetGroupStates } from "./schematic-netgroup-read.ts";
import { schematicPrimitiveStateSchema, validateSchematicPrimitiveStates } from "./schematic-primitive-read.ts";

export const CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES = 2_097_152;
const documentId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
export const currentSchematicPageReadTargetSchema = z.strictObject({
  projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  documentUuid: documentId, schematicUuid: documentId, tabId: z.string().min(81).max(97),
}).refine(value => value.tabId === `${value.documentUuid}@${value.projectUuid}`, "Tab identity must equal document@project.");
const selectedOperationSchema = z.strictObject({ method: z.literal("eda.sch_SelectControl.getSelectedPrimitives"), arguments: z.strictObject({}) });
export const currentSchematicPageReadOperationSchema = z.union([schematicTextReadRequestSchema, schematicNetGroupReadRequestSchema, selectedOperationSchema]);
export const currentSchematicPageReadRequestSchema = z.strictObject({ target: currentSchematicPageReadTargetSchema,
  operation: currentSchematicPageReadOperationSchema });
export type CurrentSchematicPageReadRequest = z.infer<typeof currentSchematicPageReadRequestSchema>;
export const currentSchematicPageReadResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.current-schematic-page-read.v1"), target: currentSchematicPageReadTargetSchema,
  method: z.string(), value: z.array(schematicPrimitiveStateSchema).max(256),
  samples: z.literal(2), sourceIdsUnchanged: z.literal(true), originalPageRechecked: z.literal(true),
  implementationKind: z.literal("native-task-equivalent"), completeSourceVerified: z.literal(false),
  connectivityVerified: z.literal(false), persistenceVerified: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
});

export function validateCurrentSchematicPageReadResult(input: unknown, value: unknown): z.infer<typeof currentSchematicPageReadResultSchema> {
  const request = currentSchematicPageReadRequestSchema.parse(input), result = currentSchematicPageReadResultSchema.parse(value);
  if (canonicalJson(result.target) !== canonicalJson(request.target) || result.method !== request.operation.method ||
    Buffer.byteLength(canonicalJson(result)) > CURRENT_SCHEMATIC_PAGE_READ_MAX_BYTES) { throw new Error("SCH209_PAGE_RESULT_BINDING"); }
  if (request.operation.method === "eda.sch_SelectControl.getSelectedPrimitives") {
    if (result.value.length > 0) { validateSchematicPrimitiveStates(result.value, { method: "eda.sch_Primitive.getPrimitivesByPrimitiveId",
      arguments: { ids: result.value.map(row => row.primitiveId) } }); }
  } else if (request.operation.method.includes("PrimitiveText")) { validateSchematicTextStates(result.value, request.operation); }
  else { validateSchematicNetGroupStates(result.value, request.operation); }
  return result;
}

export function queryCurrentSchematicPageRead(input: unknown = {}): Record<string, unknown> {
  const request = z.strictObject({ includeSchemas: z.boolean().default(false) }).parse(input);
  return { offline: true, tool: "easyeda_control_pcb209_opening", wrapperAction: "schematic-page-read",
    scope: "already-active-ordinary-type-1-page-only", connectedValidation: false,
    methods: [...[...schematicTextReadRequestSchema.options, ...schematicNetGroupReadRequestSchema.options].map(option => option.shape.method.value),
      "eda.sch_SelectControl.getSelectedPrimitives"],
    executionAuthorized: false, saveAuthorized: false, completeSourceVerified: false,
    limitations: [
      "Requires one exact already-active ordinary type-1 SCH_PAGE, parent schematic, project, branch and tab on the pinned209 UI/SCH implementation. No page or project is opened by this observation route.",
      "Text/Wire/Bus DTOs reuse the complete supported root-family, connected tree, source-ID index and scalar checks. Source-ID membership is unchanged across the two synchronous observations; complete raw source, connectivity, saved membership and persistence are not proved. GetSourceCode, compiler, serializer, public family getters, network and Save are not invoked.",
      "Selected objects resolve only from complete Text and NetGroup wire/bus DTO rosters under the same retained page. Native selected line children promote to their root group, duplicate promoted IDs collapse in selection order. Missing, unknown, inherited or unsupported selected families refuse the whole result; no partial objects or empty fallback is returned.",
      "Coordinates retain native schematic units and Y direction. Text alignment and nullable style fields remain raw. Locked models may be observed. Symbols, placed-component pins, arbitrary annotations and expanded electrical topology are excluded. These DTOs do not authorize later edits.",
      "Output is bounded to256 DTOs and2MiB; family limits and complete tree bounds remain unchanged. Signed-zero/non-finite numeric results and malformed strings refuse transport. The read is synchronous but supplies no persistent lock against later user changes.",
    ], ...(request.includeSchemas ? { inputSchema: z.toJSONSchema(currentSchematicPageReadRequestSchema) } : {}) };
}

export function validateCurrentSchematicPageReadArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSchematicPageReadRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
