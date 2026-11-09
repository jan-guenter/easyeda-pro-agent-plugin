/** Separate private startup-refusal data. Only original parsed pause locations,
 * fixed selection fields and the existing progress counters can leave here.
 * This projection has no transport, source qualification or resume capability. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "./current-footprint-copy-main-backend-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const count = z.number().int().min(0).max(64);
const coordinate = z.number().int().min(0).max(SOURCE.bytes);
const frameIndexSchema = z.number().int().min(0).max(63);
const frameLocation = z.strictObject({ frameIndex: frameIndexSchema, lineNumber: coordinate, columnNumber: coordinate });
const transactionDepth = z.union([z.literal(0), z.literal(1)]);
const locationsSchema = z.strictObject({
  totalFrames: count.min(1), omittedForeignScript: count, omittedOutsideSource: count,
  locations: z.array(frameLocation).max(64),
}).refine(value => value.locations.length + value.omittedForeignScript + value.omittedOutsideSource === value.totalFrames &&
  value.locations.every((item, index) => item.frameIndex < value.totalFrames && (index === 0 || item.frameIndex > (value.locations[index - 1]?.frameIndex ?? item.frameIndex))));
export type CurrentSelectedFileMainSqlStartupPauseLocations = z.infer<typeof locationsSchema>;
const selectionSite = z.enum(["run", "prepare", "prepared", "statementRun", "finalize"]);
const selection = z.union([
  z.strictObject({ state: z.literal("not-attempted") }),
  z.strictObject({ state: z.literal("reply-refused") }),
  z.strictObject({ state: z.literal("returned"), recognized: z.literal(false) }),
  z.strictObject({ state: z.literal("returned"), recognized: z.literal(true), role: z.enum(["jb", "dc"]), site: selectionSite,
    parametersEmpty: z.boolean(), transactionDepth, sqlPresent: z.boolean() }),
]);
const progress = z.strictObject({ currentVersionObserved: z.boolean(), jbCallsConsumed: z.number().int().min(0).max(44), dcCallsConsumed: z.number().int().min(0).max(4),
  profileSqlOnly: z.literal(true), cookieUpdatesAdmitted: z.literal(false), selectedProjectWriteGrant: z.literal(false), nativeCompletionProven: z.literal(false) });
/** Strict optional-artifact contract, kept separate from every historical v1
 * result. There are no SQL/path values, handles, names, URLs or error fields. */
export const currentSelectedFileMainSqlStartupRefusalContextSchema = z.strictObject({
  profile: z.literal("private.selected-file-main-sql-startup-refusal-context.v1"),
  site: z.enum(["keeperBirth", "keeperBound", "contextBirth", "contextBound", "initializerBirth", "initializerBound", "queryAll", "queryOne", "run", "finalize", "statementEach", "statementRun", "prepare", "prepared", "wrapClose", "keeperClose", "initializerSerialize", "initializerPragma", "initializerClose", "startupVersion", "startupJB", "startupDC", "driver"]),
  reason: z.enum(["tracker-absent", "statement-operation-not-admitted", "profile-not-recognized", "site-outside-startup-profile", "selection-unrecognized", "selection-sequence-refused", "selection-reply-refused"]),
  sourceSha256: z.literal(SOURCE.sha256), callFrames: locationsSchema, selection, progress,
  sourceQualified: z.literal(true), originalFailureRetained: z.literal(true), additionalRequests: z.literal(0),
  selectionReevaluated: z.literal(false), callStackReevaluated: z.literal(false),
  resumeAuthorized: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => {
  if (value.reason === "selection-unrecognized") { return value.selection.state === "returned" && !value.selection.recognized; }
  if (value.reason === "selection-sequence-refused") { return value.selection.state === "returned" && value.selection.recognized && value.selection.site === value.site; }
  if (value.reason === "selection-reply-refused") { return value.selection.state === "reply-refused"; }
  return value.selection.state === "not-attempted";
});
export type CurrentSelectedFileMainSqlStartupRefusalContext = z.infer<typeof currentSelectedFileMainSqlStartupRefusalContextSchema>;
type Reason = CurrentSelectedFileMainSqlStartupRefusalContext["reason"];
type Site = CurrentSelectedFileMainSqlStartupRefusalContext["site"];
type Selection = z.infer<typeof selection>;
/** Refuse malformed optional data without reading an Error or invoking hooks. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SELECTED_SQL_STARTUP_REFUSAL_CONTEXT"); } }
/** Inspect plain own data descriptors only. Unknown fields and accessors fail
 * before any sensitive value can be copied, stringified or hashed. */
function fields(input: unknown, names: readonly string[]): object {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input));
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  need((prototype === null || prototype === Object.prototype) && keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)));
  for (const name of names) { const descriptor = Object.getOwnPropertyDescriptor(input, name); need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true); }
  return input;
}
/** Read only a field whose own data descriptor has already been checked. */
function own(input: object, name: string): unknown { return Object.getOwnPropertyDescriptor(input, name)?.value as unknown; }
/** Project the exact parsed selection without serializing or hashing its SQL.
 * Neither recognition nor a failed sequence check establishes a safe call. */
function selected(input: unknown): Selection {
  need(input !== null && typeof input === "object" && !types.isProxy(input));
  const recognized = Object.getOwnPropertyDescriptor(input, "recognized"); need(recognized !== undefined && Object.hasOwn(recognized, "value"));
  if (recognized.value === false) { fields(input, ["recognized"]); return { state: "returned", recognized: false }; }
  const value = fields(input, ["recognized", "role", "site", "sql", "parametersEmpty", "transactionDepth", "designWriteGrant", "nativeCompletionProven"]);
  need(own(value, "recognized") === true && own(value, "designWriteGrant") === false && own(value, "nativeCompletionProven") === false);
  const sql = own(value, "sql"); need(sql === null || typeof sql === "string" && sql.length > 0 && sql.length <= 65_536);
  return selection.parse({ state: "returned", recognized: true, role: own(value, "role"), site: own(value, "site"),
    parametersEmpty: own(value, "parametersEmpty"), transactionDepth: own(value, "transactionDepth"), sqlPresent: sql !== null });
}
/** Consume only a fresh locations-only projection of an already parsed CDP
 * event. Script IDs are compared locally and never serialized. Source bounds
 * come from this runner's already qualified original app source, not a packet. */
export function captureCurrentSelectedFileMainSqlStartupPauseLocations(input: unknown, appScriptId: string, source: string): CurrentSelectedFileMainSqlStartupPauseLocations {
  need(typeof appScriptId === "string" && appScriptId.length > 0 && appScriptId.length <= 256 && typeof source === "string" && source.length > 0 && Buffer.byteLength(source) <= SOURCE.bytes);
  need(input !== null && typeof input === "object" && !types.isProxy(input) && Array.isArray(input) && Object.getPrototypeOf(input) === Array.prototype);
  const length: unknown = Object.getOwnPropertyDescriptor(input, "length")?.value;
  need(typeof length === "number" && Number.isSafeInteger(length) && length >= 1 && length <= 64 && Reflect.ownKeys(input).length === length + 1);
  const lines = source.split(/\r\n|[\n\r\u2028\u2029]/u), locations: { frameIndex: number; lineNumber: number; columnNumber: number }[] = [];
  let omittedForeignScript = 0, omittedOutsideSource = 0;
  for (let frameIndex = 0; frameIndex < length; frameIndex += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(input, String(frameIndex)); need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true);
    const value = fields(descriptor.value, ["scriptId", "lineNumber", "columnNumber"]);
    const columnNumber = own(value, "columnNumber"), lineNumber = own(value, "lineNumber"), scriptId = own(value, "scriptId");
    need(typeof scriptId === "string" && scriptId.length > 0 && scriptId.length <= 256 && typeof lineNumber === "number" && Number.isSafeInteger(lineNumber) && lineNumber >= 0 && !Object.is(lineNumber, -0) &&
      typeof columnNumber === "number" && Number.isSafeInteger(columnNumber) && columnNumber >= 0 && !Object.is(columnNumber, -0));
    if (scriptId !== appScriptId) { omittedForeignScript += 1; }
    else if (lineNumber >= lines.length || columnNumber > (lines[lineNumber]?.length ?? -1) || lineNumber === lines.length - 1 && columnNumber === lines[lineNumber]?.length) { omittedOutsideSource += 1; }
    else { locations.push({ frameIndex, lineNumber, columnNumber }); }
  }
  return freezeDeep(locationsSchema.parse({ totalFrames: length, omittedForeignScript, omittedOutsideSource, locations }));
}
/** Capture the first refusal synchronously. Projection failure is handled by
 * the original runner, leaving its context null and its first error intact. */
export function createCurrentSelectedFileMainSqlStartupRefusalContext(site: Site, reason: Reason, input: unknown,
  snapshot: unknown, callFrames: CurrentSelectedFileMainSqlStartupPauseLocations): CurrentSelectedFileMainSqlStartupRefusalContext {
  let classification: Selection = { state: "not-attempted" };
  if (reason === "selection-reply-refused") { classification = { state: "reply-refused" }; }
  else if (input !== null) { classification = selected(input); }
  return freezeDeep(currentSelectedFileMainSqlStartupRefusalContextSchema.parse({
    profile: "private.selected-file-main-sql-startup-refusal-context.v1", site, reason, sourceSha256: SOURCE.sha256,
    callFrames: captureCurrentPcbStringClockReply(callFrames).value, selection: classification, progress: captureCurrentPcbStringClockReply(snapshot).value,
    sourceQualified: true, originalFailureRetained: true, additionalRequests: 0, selectionReevaluated: false, callStackReevaluated: false,
    resumeAuthorized: false, executionAuthorized: false, saveAuthorized: false,
  }));
}
