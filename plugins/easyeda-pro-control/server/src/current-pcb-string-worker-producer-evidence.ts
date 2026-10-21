/** Private original-runner evidence: exact reader text and fixed failure labels.
 * A copied JSON report is not an original observation or an owner capability. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_PCB_STRING_OBSERVATION_BYTES } from "./current-pcb-string-observation-core.ts";
import type { CurrentPcbStringWorkerProducerCommand } from "./current-pcb-string-worker-producer-commands.ts";

export type CurrentPcbStringWorkerProducerSample = "gates" | "upload-structure" | "structure" | "debounce" |
  "cooperation" | "upload" | "buffered-environment";
export interface CurrentPcbStringWorkerProducerReply { readonly result: Readonly<{ type: "string"; value: string }> }
export type CurrentPcbStringWorkerProducerReplies = Readonly<Partial<Record<CurrentPcbStringWorkerProducerSample, CurrentPcbStringWorkerProducerReply>>>;
const SAMPLES = Object.freeze(["gates", "upload-structure", "structure", "debounce", "cooperation", "upload", "buffered-environment"] as const);
export type CurrentPcbStringWorkerProducerPhase = CurrentPcbStringWorkerProducerCommand["workerProducerPhase"] |
  "owner" | "owner-final" | "identity" | "bounds";
export const currentPcbStringWorkerProducerFailureSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-worker-producer-failure.v1"),
  phase: z.enum(["project", "gate-select", "gates", "upload-structure-select", "upload-structure", "upload-structure-callback",
    "structure-select", "structure", "debounce-select", "debounce", "structure-callback", "cooperation-select", "cooperation",
    "cooperation-callback", "upload-select", "upload", "upload-callback", "buffer-callback", "drain-callback", "buffered-environment",
    "properties", "release", "owner", "owner-final", "identity", "bounds"]),
  requests: z.number().int().min(0).max(57).refine(value => !Object.is(value, -0)),
  cleanup: z.enum(["not-started", "released", "failed"]),
  retainedSamples: z.array(z.enum(SAMPLES)).max(7).refine(values => new Set(values).size === values.length),
  executionAuthorized: z.literal(false),
}).strict();
export type CurrentPcbStringWorkerProducerFailure = Readonly<z.infer<typeof currentPcbStringWorkerProducerFailureSchema>>;
const failures = new WeakMap<object, Readonly<{ detail: CurrentPcbStringWorkerProducerFailure; replies: CurrentPcbStringWorkerProducerReplies }>>();

function record(value: unknown, keys: readonly string[]): Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value)) { throw new Error("PCB_STRING_WORKER_PRODUCER_REPLY"); }
  const actual = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null || actual.length !== keys.length ||
      actual.some(key => typeof key !== "string" || !keys.includes(key))) { throw new Error("PCB_STRING_WORKER_PRODUCER_REPLY"); }
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("PCB_STRING_WORKER_PRODUCER_REPLY"); }
    result[key] = descriptor.value as unknown;
  }
  return result;
}
export function retainCurrentPcbStringWorkerProducerReply(input: unknown): CurrentPcbStringWorkerProducerReply {
  const wrapper = record(input, ["result"]);
  const result = record(wrapper["result"], ["type", "value"]), value = result["value"];
  if (result["type"] !== "string" || typeof value !== "string" || !value.isWellFormed() ||
      Buffer.byteLength(value) > CURRENT_PCB_STRING_OBSERVATION_BYTES) { throw new Error("PCB_STRING_WORKER_PRODUCER_REPLY"); }
  return Object.freeze({ result: Object.freeze({ type: "string", value }) });
}

/** Preserve the original primary error as cause and first error, separately
 * from cleanup/current-owner failures. Public diagnostics use only detail. */
export function currentPcbStringWorkerProducerFailure(phase: CurrentPcbStringWorkerProducerPhase, requests: number,
  cleanup: CurrentPcbStringWorkerProducerFailure["cleanup"], errors: readonly unknown[], replies: CurrentPcbStringWorkerProducerReplies): AggregateError {
  const parsed = currentPcbStringWorkerProducerFailureSchema.parse({
    schema: "easyeda-pro-control.pcb-string-worker-producer-failure.v1", phase, requests, cleanup,
    retainedSamples: SAMPLES.filter(phaseName => Object.hasOwn(replies, phaseName)), executionAuthorized: false,
  });
  Object.freeze(parsed.retainedSamples); const detail = Object.freeze(parsed);
  const error = new AggregateError(errors, `PCB_STRING_WORKER_PRODUCER_FAILED:${phase}:${cleanup}`, { cause: errors[0] });
  failures.set(error, Object.freeze({ detail, replies: Object.freeze({ ...replies }) })); return error;
}
export function currentPcbStringWorkerProducerFailureDetail(input: unknown): CurrentPcbStringWorkerProducerFailure | null {
  return input !== null && typeof input === "object" ? failures.get(input)?.detail ?? null : null;
}
export function requireOriginalCurrentPcbStringWorkerProducerFailureReplies(input: unknown): CurrentPcbStringWorkerProducerReplies {
  const retained = input !== null && typeof input === "object" ? failures.get(input) : undefined;
  if (retained === undefined) { throw new Error("PCB_STRING_WORKER_PRODUCER_ORIGIN"); } return retained.replies;
}
