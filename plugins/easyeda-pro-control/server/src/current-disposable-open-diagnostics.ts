import { z } from "zod";

export const CURRENT_OPEN_NATIVE_STAGES = [
  "setup", "before-registration", "pre-dispatch", "open-project", "project-acknowledgement",
  "open-document", "document-acknowledgement", "after-registration", "native-observation", "output", "cleanup",
] as const;
export const CURRENT_OPEN_NATIVE_CODES = [
  "GUARD", "FIELD", "OBJECT", "TEXT", "ARRAY", "METHOD", "BINDING", "URL", "ACK", "OUTPUT", "EXCEPTION", "TIMEOUT",
] as const;
export const CURRENT_OPEN_HOST_STAGES = [
  "owner-check", "dispatch-guards", "scope", "runtime-admission", "reserve-navigation", "build-program",
  "write-intent", "tracked-dispatch", "before-dispatch", "checkpoint-reproof", "decode-result", "validate-result",
  "retain-result", "settled-result", "post-admission", "project-acknowledgement", "write-completion",
] as const;
export const currentOpenFailureDiagnosticSchema = z.object({
  schema: z.literal("easyeda-pro-control.current-open-failure.v1"),
  phase: z.enum(["preflight", "open-project", "open-document", "observe"]),
  hostStage: z.enum(CURRENT_OPEN_HOST_STAGES),
  category: z.enum(["native-guard", "native-exception", "native-timeout", "bridge-timeout", "upstream-failure", "output-bound", "result-invalid", "project-acknowledgement", "unknown"]),
  nativeStage: z.enum(CURRENT_OPEN_NATIVE_STAGES).nullable(),
  nativeCode: z.enum(CURRENT_OPEN_NATIVE_CODES).nullable(),
}).strict();
export type CurrentOpenFailureDiagnostic = z.infer<typeof currentOpenFailureDiagnosticSchema>;
export type CurrentOpenFailureContext = Pick<CurrentOpenFailureDiagnostic, "phase" | "hostStage">;
type NativeDiagnostic = Pick<CurrentOpenFailureDiagnostic, "nativeStage" | "nativeCode">;

const nativeMessages = new Map<string, string>();
const nativeCategories = new Map<string, NativeDiagnostic>();
const wrappedCategories = new Map<string, NativeDiagnostic>();
for (const stage of CURRENT_OPEN_NATIVE_STAGES) {
  for (const code of CURRENT_OPEN_NATIVE_CODES) {
    const category = `native-current-disposable-open:${stage}:${code}`;
    const fields = { nativeStage: stage, nativeCode: code };
    nativeMessages.set(`CURRENT_DISPOSABLE_OPEN_FAILED:${stage}:${code}`, category);
    nativeCategories.set(category, fields);
    for (const prefix of ["The upstream EasyEDA tool reported failure", "The upstream EasyEDA tool reported failure or unavailability"]) {
      wrappedCategories.set(`${prefix} [${category}].`, fields);
    }
    if (code === "TIMEOUT") {
      wrappedCategories.set(`The native lifecycle deadline expired without proving execution ended [${category};execution-unsettled].`, fields);
    }
  }
}

/** Whole-message lookup only. Unknown suffixes and arbitrary native text never
 * become diagnostics or influence the dispatch/retirement state machine.
 */
export function currentOpenNativeFailureCategory(message: unknown): string | null {
  return typeof message === "string" && message.length <= 256 ? nativeMessages.get(message) ?? null : null;
}
export function isCurrentOpenNativeTimeoutCategory(category: string): boolean {
  return nativeCategories.get(category)?.nativeCode === "TIMEOUT";
}

function ownMessage(error: unknown): string | undefined {
  try {
    if (error === null || typeof error !== "object" && typeof error !== "function") { return undefined; }
    const descriptor = Object.getOwnPropertyDescriptor(error, "message");
    const message: unknown = descriptor !== undefined && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined;
    return typeof message === "string" && message.length <= 512 ? message : undefined;
  } catch { return undefined; }
}

const hostCategories = new Map<string, CurrentOpenFailureDiagnostic["category"]>([
  ["The upstream bridge timed out without proving native execution ended [bridge-timeout;execution-unsettled].", "bridge-timeout"],
  ["The native lifecycle deadline expired without proving execution ended [native-lifecycle-timeout;execution-unsettled].", "native-timeout"],
  ["Current disposable-open reply exceeds its bound.", "output-bound"],
  ["Disposable opening result exceeds its byte bound.", "output-bound"],
  ["Disposable opening result contradicts its exact target and phase.", "result-invalid"],
  ["Disposable opening result has an invalid public method acknowledgement.", "result-invalid"],
  ["Project opening did not acknowledge the exact target project.", "project-acknowledgement"],
]);
for (const category of ["native-api-error", "payload-too-large", "invalid-input", "unavailable", "unstable-read", "invalid-envelope", "unclassified-upstream-failure"]) {
  for (const prefix of ["The upstream EasyEDA tool reported failure", "The upstream EasyEDA tool reported failure or unavailability"]) {
    hostCategories.set(`${prefix} [${category}].`, "upstream-failure");
  }
}

export function describeCurrentOpenFailure(error: unknown, context: CurrentOpenFailureContext): CurrentOpenFailureDiagnostic {
  const message = ownMessage(error);
  const category = currentOpenNativeFailureCategory(message);
  const native = category === null ? wrappedCategories.get(message ?? "") : nativeCategories.get(category);
  let classification: CurrentOpenFailureDiagnostic["category"] = hostCategories.get(message ?? "") ?? "unknown";
  if (native !== undefined) {
    classification = "native-guard";
    if (native.nativeCode === "TIMEOUT") { classification = "native-timeout"; }
    else if (native.nativeCode === "EXCEPTION") { classification = "native-exception"; }
  }
  return currentOpenFailureDiagnosticSchema.parse({ schema: "easyeda-pro-control.current-open-failure.v1", ...context,
    category: classification, nativeStage: native?.nativeStage ?? null, nativeCode: native?.nativeCode ?? null });
}
