/** Narrow ordinary metadata contract; runtime ownership is checked separately. */
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { currentSymbolMetadataPreparationRequestSchema } from "./current-symbol-metadata-preparation.ts";

export const CURRENT_SYMBOL_OPERATION_PURPOSE = "ordinary-symbol-metadata";
const operationId = z.string().min(8).max(96).regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);

/** Exact next-phase acknowledgement only. The original runtime owner must
 * separately prove that this is its next phase; parsing never grants authority.
 */
export const currentSymbolOperationStepSchema = z.discriminatedUnion("expectedPhase", [
  z.object({ expectedPhase: z.literal("forward-write"), confirmWrite: z.literal(true), acceptMetadataMutation: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["forward-close", "forward-verification-close", "cleanup-close"]),
    confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["forward-verification-start", "forward-verification-open"]), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["forward-observe-termination", "forward-verification-admit", "forward-verification-caches",
    "forward-verification-read", "forward-verification-finish", "cleanup-observe-termination"]) }).strict(),
]);
export type CurrentSymbolOperationStep = z.infer<typeof currentSymbolOperationStepSchema>;
export type CurrentSymbolOperationPhase = CurrentSymbolOperationStep["expectedPhase"];

export const currentSymbolOperationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("open"), operationId, ...currentDisposableOpenTargetSchema.shape, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe"), operationId }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
  z.object({ action: z.literal("request-normal-close"), operationId, confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("retire-after-termination"), operationId, confirmRetire: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-begin"), operationId, openingOperationId: operationId,
    preparation: currentSymbolMetadataPreparationRequestSchema.omit({ observationProjection: true }),
    confirmNormalClose: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-observe-termination"), operationId }).strict(),
  z.object({ action: z.literal("baseline-prepare-clock"), operationId, acceptScratchProcessEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-relaunch"), operationId, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-admit"), operationId }).strict(),
  z.object({ action: z.literal("baseline-observe-caches"), operationId }).strict(),
  z.object({ action: z.literal("baseline-open-project"), operationId, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-observe-clock"), operationId }).strict(),
  z.object({ action: z.literal("baseline-finish-close"), operationId, confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-observe-finish"), operationId }).strict(),
  z.object({ action: z.literal("baseline-inspect"), operationId }).strict(),
  z.object({ action: z.literal("metadata-begin"), operationId, confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("metadata-advance"), operationId, step: currentSymbolOperationStepSchema }).strict(),
  z.object({ action: z.literal("metadata-inspect"), operationId }).strict(),
]).refine((value) => value.action !== "open" || sha256Text(value.rawWindowsPath) === value.projectUuid,
  "Project identity must hash the exact raw Windows path.")
  .refine((value) => value.action !== "baseline-begin" || value.operationId !== value.openingOperationId,
    "The baseline needs a distinct operation ID.");
export type CurrentSymbolOperationRequest = z.infer<typeof currentSymbolOperationRequestSchema>;
export function parseCurrentSymbolOperationRequest(input: unknown): CurrentSymbolOperationRequest { return currentSymbolOperationRequestSchema.parse(input); }
export const currentSymbolOperationQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();

const limitations = [
  "The separate easyeda_control_project_symbol_metadata route accepts this forward-only contract. Installed123000 passed one ordinary unused META-only forward lifecycle on a disposable fixture, including exact closed SQL, reopened content and final closure. Installed101500 separately passed the disposable forward/inverse lifecycle. These historical cases do not validate every shape or a later runtime. Registration, schema acceptance and discovery grant no execution authority; exact original-owner runtime checks remain mandatory.",
  "One exact already registered local .eprj2 project and checkpoint-member PCB in its default branch. Preserve the exact raw Windows path hash, source hash, sealed branch and original retained launch; opening starts from an empty editor.",
  "Before the first ordinary navigation, derive the supported startup expectation from the preserved checkpoint. Recheck that expectation against the complete closed baseline, then require live startup qualification before writing. No disposable acceptance or unqualified schematic-startup bypass is accepted.",
  "Ordinary opening can migrate storage, replay caches, restore tabs, update shared metadata and automatically Save. Each opening or closure stage requires its own explicit acknowledgement. No unchanged-storage promise, explicit Save, Save/Discard choice, forced exit or file restoration is provided.",
  "A stopped ordinary opener can request-normal-close once through its own original retained Job, without bridge dispatch or a replacement PID/window. Quarantine remains until retire-after-termination proves original termination and session closure. Acknowledgement is not termination or saved-content proof; ambiguity consumes the close attempt.",
  "baseline-begin seals one closed ordinary symbol and only a name and/or non-null description patch. The target must be unreferenced by active schematic pages; native linked-sheet propagation is unsupported. Preserve tags, source and peer content. Checkpoint descriptors are evidence inputs, never replacement ownership or permission to mutate.",
  "The complete original target history must be META-only, including every tombstoned occurrence. Drawn symbols and historical canvas records are unsupported even if the current symbol looks empty. Pre-dispatch proof budgets reserve the ordinary write's raw history, saved-content and logical SQL limits; physical allocation, heap and deadlines remain runtime limitations.",
  "Bind ordinary purpose in the original opening plan, generation and baseline owner. Keep the original retained owner through one write, normal closure, complete closed SQL comparison, cache-excluded project-only reopening, saved-content verification and final closed SQL equality. Copied JSON and disposable owners cannot provide that authority.",
  "metadata-begin retains the original ready baseline. Every metadata-advance keeps that baseline operation ID and supplies the exact next expectedPhase and only its required acknowledgements. No continuation accepts a replacement target, patch, runtime fingerprint, timestamp window, code or verifier.",
  "Forward-only completion retires the successful verifier without retaining an inverse. No inverse, rollback, restoration or mutation replay is exposed. A lost response or ambiguous failure consumes its stage; only explicitly pending observations may repeat, and failures permit only available original-owner cleanup or inspection.",
  "Keep exact runtime/source pins, supported startup shapes, inactive-cache checks, fresh Windows/document clocks and the unchanged 61000 ms unlocked-head age gate. Neither elapsed agent time nor a supplied boolean qualifies a clock or widens a fixed timestamp window.",
  "The older closed-symbol coordinator, generic library.symbol.modify and unrelated design writers remain blocked. This separate purpose-bound route does not enable them or expose the disposable inverse workflow.",
] as const;

export function queryCurrentSymbolOperation(input: unknown = {}): Record<string, unknown> {
  const query = currentSymbolOperationQuerySchema.parse(input);
  return { offline: true, tool: "easyeda_control_project_symbol_metadata", purpose: CURRENT_SYMBOL_OPERATION_PURPOSE, registrationEnabled: true, invocationEnabledByDiscovery: false,
    executionAuthorized: false, writerReady: false, connectedValidation: false,
    historicalConnectedValidation: "installed123000-ordinary-unused-meta-only-forward-only",
    forwardOnly: true, inverseSupported: false, replayAllowed: false,
    actions: ["open", "observe", "inspect", "request-normal-close", "retire-after-termination", "baseline-begin", "baseline-observe-termination", "baseline-prepare-clock",
      "baseline-relaunch", "baseline-admit", "baseline-observe-caches", "baseline-open-project", "baseline-observe-clock", "baseline-finish-close",
      "baseline-observe-finish", "baseline-inspect", "metadata-begin", "metadata-advance", "metadata-inspect"],
    limitations: [...limitations], ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentSymbolOperationRequestSchema),
      stepSchema: z.toJSONSchema(currentSymbolOperationStepSchema) } : {}) };
}

export function validateCurrentSymbolOperationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSymbolOperationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, registrationEnabled: true, executionAuthorized: false } : {
    valid: false, registrationEnabled: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
