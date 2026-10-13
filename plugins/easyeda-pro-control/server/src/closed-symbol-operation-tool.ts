/** Strict ordinary public envelope. The fixed validation gate remains closed. */
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { boundedOwnData } from "./closed-symbol-disposable-tool.ts";
import { closedSymbolFailureDiagnosticText } from "./closed-symbol-failure-diagnostic.ts";
import type { ClosedSymbolFailureDiagnostic } from "./closed-symbol-failure-diagnostic.ts";
import { exactData } from "./closed-symbol-validation-request.ts";
import { parseClosedSymbolOperationRequest } from "./closed-symbol-operation-request.ts";
import type { ClosedSymbolOperationRequest } from "./closed-symbol-operation-request.ts";

const projectUuid = z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u);
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const documentUuid = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const patchInput = z.object({ name: z.string().min(1).max(512), description: z.string().max(65_536) }).strict();
const targetInput = z.object({ uuid: documentUuid }).strict();
const request = z.object({ action: z.literal("execute-closed-symbol"), confirmWrite: z.literal(true),
  target: z.object({ projectPath: z.string().max(2058).regex(/^(?:\/|[A-Za-z]:[\\/])[^\0\r\n]{1,2048}\.eprj2$/u),
    projectUuid, branchUuid: uuid, ownerUuid: uuid, symbolUuid: documentUuid, companionPcbUuid: documentUuid }).strict(),
  operation: z.object({ id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u), action: z.literal("library.symbol.modify"), libraryUuid: projectUuid,
    target: targetInput, patch: patchInput }).strict(),
}).strict();
export const closedSymbolOperationInputSchema = z.object({ request }).strict();
export function parseClosedSymbolOperationInput(input: unknown): Readonly<{ originalRequest: unknown; request: ClosedSymbolOperationRequest }> {
  const outer = exactData(input, ["request"]);
  const originalRequest = outer["request"];
  return Object.freeze({ originalRequest, request: parseClosedSymbolOperationRequest(originalRequest) });
}

const descriptor = z.object({ path: z.string().min(1).max(4096).startsWith("/").regex(/^[^\0\r\n]*$/u),
  bytes: z.number().int().min(1).max(131_072), sha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict();
const common = { profile: z.literal("easyeda-pro-control.closed-symbol-operation-result.v1"), action: z.literal("execute-closed-symbol"),
  replayAllowed: z.literal(false), executionAuthorized: z.literal(false), saved: z.literal(false), reopened: z.literal(false) };
const completed = z.object({ ...common, outcome: z.literal("completed"), actionId: z.string().max(128), operationId: z.string().regex(/^easyeda-[a-z0-9-]{1,100}$/u),
  headEligibility: z.enum(["locked", "aged-unlocked"]), intentArtifact: descriptor, terminalArtifact: descriptor,
  bodySha256: z.string().regex(/^[a-f0-9]{64}$/u), completionProved: z.literal(true), explicitSavePerformed: z.literal(false), targetEditorOpened: z.literal(false) }).strict();
const stopped = z.object({ ...common, outcome: z.literal("stopped"), actionId: z.string().max(128).nullable(), operationId: z.string().regex(/^easyeda-[a-z0-9-]{1,100}$/u).nullable(),
  phase: z.enum(["request", "validation", "reservation", "facade", "entry-import", "construction", "entry", "projection", "queue", "admission", "sql-runtime", "expectation", "intent", "coordinator", "terminal"]),
  attemptReserved: z.boolean(), intentArtifact: descriptor.nullable(), terminalArtifact: descriptor.nullable(), completionProved: z.literal(false),
  nextSafeAction: z.literal("Inspect retained evidence. Do not repeat this request or any native phase.") }).strict();
export const closedSymbolOperationOutputSchema = z.object({ result: z.discriminatedUnion("outcome", [completed, stopped]) }).strict();
export type ClosedSymbolOperationResult = z.infer<typeof closedSymbolOperationOutputSchema>["result"];
export const CLOSED_SYMBOL_OPERATION_COMMON = Object.freeze({ profile: "easyeda-pro-control.closed-symbol-operation-result.v1", action: "execute-closed-symbol",
  replayAllowed: false, executionAuthorized: false, saved: false, reopened: false } as const);

export function closedSymbolOperationStopped(input: Pick<z.infer<typeof stopped>, "phase" | "attemptReserved"> &
  Partial<Pick<z.infer<typeof stopped>, "actionId" | "operationId" | "intentArtifact" | "terminalArtifact">>): ClosedSymbolOperationResult {
  return stopped.parse({ ...CLOSED_SYMBOL_OPERATION_COMMON, outcome: "stopped", actionId: null, operationId: null, intentArtifact: null,
    terminalArtifact: null, completionProved: false, nextSafeAction: "Inspect retained evidence. Do not repeat this request or any native phase.", ...input });
}
export function formatClosedSymbolOperationResult(input: unknown, diagnostic?: ClosedSymbolFailureDiagnostic): CallToolResult {
  const structuredContent = closedSymbolOperationOutputSchema.parse({ result: boundedOwnData(input) });
  const encoded = JSON.stringify(structuredContent), jsonBytes = Buffer.byteLength(encoded);
  if (jsonBytes > 16_384) { throw new Error("Closed-symbol operation result exceeds 16 KiB."); }
  const ok = structuredContent.result.outcome === "completed";
  return { isError: !ok, structuredContent, content: [{ type: "text", text: JSON.stringify({ ok, structuredContent: true, jsonBytes, sha256: sha256Text(encoded) }) },
    ...ok ? [] : closedSymbolFailureDiagnosticText(diagnostic)] };
}
