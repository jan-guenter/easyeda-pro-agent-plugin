/** Bounded original head-age CDP failures. Exception data is private evidence,
 * never a successful observation or authority to repeat the native call. */
import { z } from "zod";
import { canonicalJson, isRecord, sha256Text } from "./core.ts";
import { captureCurrentFootprintHeadAgeReply } from "./current-footprint-head-age-main.ts";

export const CURRENT_FOOTPRINT_HEAD_AGE_CDP_EXCEPTION_MAX_BYTES = 65_536;
export const CURRENT_FOOTPRINT_HEAD_AGE_CDP_PHASES = ["head-age-context-capture", "head-age-context-source", "head-age-context-bind", "head-age-capture", "head-age-observe"] as const;
export type CurrentFootprintHeadAgeCdpPhase = typeof CURRENT_FOOTPRINT_HEAD_AGE_CDP_PHASES[number];
const phaseSchema = z.enum(CURRENT_FOOTPRINT_HEAD_AGE_CDP_PHASES);
const CODE = "FOOTPRINT_HEAD_AGE_CDP_EXCEPTION";
export interface CurrentFootprintHeadAgeCdpException {
  readonly schema: "private.current-footprint-head-age-cdp-exception.v1";
  readonly phase: CurrentFootprintHeadAgeCdpPhase;
  readonly code: typeof CODE;
  readonly replySha256: string;
  readonly reply: unknown;
}
const issued = new WeakMap<object, CurrentFootprintHeadAgeCdpException>();
function refuse(phase: CurrentFootprintHeadAgeCdpPhase = "head-age-observe"): never { throw new Error(`FOOTPRINT_HEAD_AGE_CDP_REPLY_REFUSED:${phase}`); }
function need(value: boolean): asserts value { if (!value) { refuse(); } }
const resultSchema = z.object({ result: z.object({ type: z.literal("object"), value: z.unknown() }).strict() }).strict();
const exceptionSchema = z.object({ schema: z.literal("private.current-footprint-head-age-cdp-exception.v1"), phase: phaseSchema, code: z.literal(CODE),
  replySha256: z.string().regex(/^[a-f0-9]{64}$/u), reply: z.unknown() }).strict();
const remoteTypes = new Set(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]);
function optionalText(value: Readonly<Record<string, unknown>>, key: string, maximum: number): void {
  if (Object.hasOwn(value, key)) { need(typeof value[key] === "string" && value[key].length <= maximum); }
}
function remote(value: unknown): void {
  need(isRecord(value) && typeof value["type"] === "string" && remoteTypes.has(value["type"]));
  for (const key of ["subtype", "className"]) { optionalText(value, key, 128); }
  optionalText(value, "description", 16_384); optionalText(value, "objectId", 256); optionalText(value, "unserializableValue", 8192);
}
function stack(value: unknown): void {
  need(isRecord(value) && Array.isArray(value["callFrames"]) && value["callFrames"].length <= 512);
  optionalText(value, "description", 16_384);
  for (const frame of value["callFrames"]) {
    need(isRecord(frame) && typeof frame["functionName"] === "string" && typeof frame["scriptId"] === "string" && typeof frame["url"] === "string" &&
      typeof frame["lineNumber"] === "number" && Number.isSafeInteger(frame["lineNumber"]) && frame["lineNumber"] >= 0 &&
      typeof frame["columnNumber"] === "number" && Number.isSafeInteger(frame["columnNumber"]) && frame["columnNumber"] >= 0);
  }
  if (Object.hasOwn(value, "parent")) { stack(value["parent"]); }
}
function completeException(input: unknown): void {
  need(isRecord(input) && Object.keys(input).length === 2 && Object.hasOwn(input, "result") && Object.hasOwn(input, "exceptionDetails"));
  remote(input["result"]); const details = input["exceptionDetails"];
  need(isRecord(details) && typeof details["exceptionId"] === "number" && Number.isSafeInteger(details["exceptionId"]) && details["exceptionId"] > 0 &&
    typeof details["text"] === "string" && typeof details["lineNumber"] === "number" && Number.isSafeInteger(details["lineNumber"]) && details["lineNumber"] >= 0 &&
    typeof details["columnNumber"] === "number" && Number.isSafeInteger(details["columnNumber"]) && details["columnNumber"] >= 0);
  if (Object.hasOwn(details, "exception")) { remote(details["exception"]); }
  optionalText(details, "scriptId", 256); optionalText(details, "url", 4096);
  if (Object.hasOwn(details, "executionContextId")) { need(typeof details["executionContextId"] === "number" && Number.isSafeInteger(details["executionContextId"]) && details["executionContextId"] > 0); }
  if (Object.hasOwn(details, "stackTrace")) { stack(details["stackTrace"]); }
  // The ordinary private-record copier caps arrays at512. Keeping this raw
  // Envelope within that bound makes every accepted exception publishable.
  const arrays = (value: unknown): void => {
    if (Array.isArray(value)) { need(value.length <= 512); for (const child of value) { arrays(child); } }
    else if (isRecord(value)) { for (const child of Object.values(value)) { arrays(child); } }
  };
  arrays(input);
}
/** Validate historical evidence without issuing an Error or native custody.
 * Complete unknown CDP fields stay in the hash-bound private reply. */
export function captureCurrentFootprintHeadAgeCdpException(input: unknown): CurrentFootprintHeadAgeCdpException {
  try {
    const copied = captureCurrentFootprintHeadAgeReply(input).value; const parsed = exceptionSchema.parse(copied);
    completeException(parsed.reply);
    need(parsed.replySha256 === sha256Text(canonicalJson(parsed.reply)) && Buffer.byteLength(canonicalJson(parsed)) <= CURRENT_FOOTPRINT_HEAD_AGE_CDP_EXCEPTION_MAX_BYTES);
    return Object.freeze(parsed);
  } catch { return refuse(); }
}
/** The actual runner alone sends this fixed native phase. A complete bounded
 * exception is retained under its genuine thrown Error, not caller JSON. */
export function rejectCurrentFootprintHeadAgeCdpException(input: unknown, phase: CurrentFootprintHeadAgeCdpPhase): void {
  const selected = phaseSchema.safeParse(phase); if (!selected.success) { refuse(); }
  try {
    const reply = captureCurrentFootprintHeadAgeReply(input).value;
    if (isRecord(reply) && Object.hasOwn(reply, "exceptionDetails")) {
      const evidence = captureCurrentFootprintHeadAgeCdpException({ schema: "private.current-footprint-head-age-cdp-exception.v1", phase, code: CODE,
        replySha256: sha256Text(canonicalJson(reply)), reply });
      const failure = new Error(`${CODE}:${phase}:${evidence.replySha256}`); issued.set(failure, evidence); throw failure;
    }
  } catch (error) {
    if (typeof error === "object" && error !== null && issued.has(error)) { throw error; }
    return refuse(selected.data);
  }
}
export function isCurrentFootprintHeadAgeCdpPhase(input: string): input is CurrentFootprintHeadAgeCdpPhase { return phaseSchema.safeParse(input).success; }
export function decodeCurrentFootprintHeadAgeCdpReply(input: unknown): unknown {
  rejectCurrentFootprintHeadAgeCdpException(input, "head-age-observe");
  try { return resultSchema.parse(captureCurrentFootprintHeadAgeReply(input).value).result.value; }
  catch { return refuse(); }
}
/** No property read, accessor or proxy trap is needed to look up genuine
 * diagnostics. A forged Error, matching message or copied evidence returns null. */
export function currentFootprintHeadAgeCdpExceptionForError(error: unknown): CurrentFootprintHeadAgeCdpException | null {
  return typeof error === "object" && error !== null ? issued.get(error) ?? null : null;
}
