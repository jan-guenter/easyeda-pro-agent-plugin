/** Private data about the first refused startup pause. The original runner
 * supplies the source-qualified site and performs only its existing fixed
 * frame/property reads. No SQL, path text, object identity or grant is returned. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "./current-selected-file-main-sql-fence-source.ts";
import type { CurrentSelectedFileMainSqlFenceSite } from "./current-selected-file-main-sql-fence-source.ts";

export type CurrentSelectedFileMainSqlStartupDiagnosticSite = Exclude<CurrentSelectedFileMainSqlFenceSite, "import" | "afterImports">;
export type CurrentSelectedFileMainSqlStartupRefusal = "tracker-absent" | "statement-operation-not-admitted" | "profile-not-recognized" | "site-outside-startup-profile";
type SlotKind = "undefined" | "null" | "string" | "number" | "boolean" | "function" | "array" | "object" | "other";
type PathKind = "not-applicable" | "not-string" | "empty" | "memory" | "selected" | "other";
type SqlKind = "not-applicable" | "not-string" | "select" | "insert" | "update" | "delete" | "create" | "pragma" | "transaction" | "other";
export interface CurrentSelectedFileMainSqlStartupFrameSummary {
  readonly slotKinds: readonly SlotKind[];
  readonly pathKind: PathKind;
  readonly sqlKind: SqlKind;
}
export interface CurrentSelectedFileMainSqlStartupDiagnostic {
  readonly profile: "private.selected-file-main-sql-startup-diagnostic.v1";
  readonly site: CurrentSelectedFileMainSqlStartupDiagnosticSite;
  readonly refusal: CurrentSelectedFileMainSqlStartupRefusal;
  readonly originalPhase: string;
  readonly frameState: "not-read" | "captured" | "frame-refused" | "properties-refused";
  readonly summary: CurrentSelectedFileMainSqlStartupFrameSummary | null;
  readonly diagnosticRequests: number;
  readonly sourceQualified: true;
  readonly originalFailureRetained: true;
  readonly predicateBranchVerified: false;
  readonly resumeAuthorized: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}

const slotKind = z.enum(["undefined", "null", "string", "number", "boolean", "function", "array", "object", "other"]);
/** Strict data-only boundary for an operation-owned sibling artifact. There
 * is no raw SQL, private path, parameter value, handle or error-object field. */
export const currentSelectedFileMainSqlStartupDiagnosticSchema = z.strictObject({
  profile: z.literal("private.selected-file-main-sql-startup-diagnostic.v1"),
  site: z.enum(["keeperBirth", "keeperBound", "contextBirth", "contextBound", "initializerBirth", "initializerBound", "queryAll", "queryOne", "run", "finalize", "statementEach", "statementRun", "prepare", "prepared", "wrapClose", "keeperClose", "initializerSerialize", "initializerPragma", "initializerClose", "startupVersion", "startupJB", "startupDC", "driver"]),
  refusal: z.enum(["tracker-absent", "statement-operation-not-admitted", "profile-not-recognized", "site-outside-startup-profile"]),
  originalPhase: z.string().min(1).max(64).regex(/^[a-z][a-z\d-]*$(?![\s\S])/u),
  frameState: z.enum(["not-read", "captured", "frame-refused", "properties-refused"]),
  summary: z.strictObject({ slotKinds: z.array(slotKind).min(1).max(13),
    pathKind: z.enum(["not-applicable", "not-string", "empty", "memory", "selected", "other"]),
    sqlKind: z.enum(["not-applicable", "not-string", "select", "insert", "update", "delete", "create", "pragma", "transaction", "other"]) }).nullable(),
  diagnosticRequests: z.number().int().min(0).max(2), sourceQualified: z.literal(true), originalFailureRetained: z.literal(true),
  predicateBranchVerified: z.literal(false), resumeAuthorized: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => (value.frameState === "captured") === (value.summary !== null) &&
  (value.summary === null || value.summary.slotKinds.length === SOURCE.sites[value.site].expression.slice(1, -1).split(",").length) &&
  (value.frameState !== "captured" || value.diagnosticRequests === 2) &&
  (value.frameState !== "not-read" || value.diagnosticRequests === 0));

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const remote = z.object({ type: z.string().max(32), subtype: z.string().max(64).optional(), className: z.string().max(128).optional(),
  description: z.string().max(8192).optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().max(64).optional() }).strict();
type Remote = z.infer<typeof remote>;
const property = z.object({ name: z.string().max(32), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const prototype = z.object({ name: z.literal("[[Prototype]]"), value: remote }).strict();
const reply = z.object({ result: z.array(property).min(2).max(14), internalProperties: z.tuple([prototype]) }).strict();
const pathSites = new Set<CurrentSelectedFileMainSqlStartupDiagnosticSite>(["keeperBirth", "keeperBound", "keeperClose", "contextBirth", "contextBound", "initializerBirth", "initializerBound", "initializerSerialize", "initializerPragma", "initializerClose", "startupVersion", "startupDC"]);
const sqlSites = new Set<CurrentSelectedFileMainSqlStartupDiagnosticSite>(["queryAll", "queryOne", "run", "prepare", "prepared"]);
function need(value: boolean): asserts value { if (!value) { throw new Error("SELECTED_SQL_STARTUP_DIAGNOSTIC_METADATA"); } }
function kind(value: Remote): SlotKind {
  if (value.type === "undefined") { need(value.objectId === undefined && value.value === undefined); return "undefined"; }
  if (value.type === "string") { need(typeof value.value === "string" && value.objectId === undefined); return "string"; }
  if (value.type === "number") { need((typeof value.value === "number" || value.unserializableValue !== undefined) && value.objectId === undefined); return "number"; }
  if (value.type === "boolean") { need(typeof value.value === "boolean" && value.objectId === undefined); return "boolean"; }
  if (value.type === "object" && value.subtype === "null") { need(value.value === null && value.objectId === undefined); return "null"; }
  if (value.type === "object" || value.type === "function") {
    need(value.objectId !== undefined && value.value === undefined);
    if (value.type === "function") { return "function"; }
    return value.subtype === "array" ? "array" : "object";
  }
  return "other";
}
function pathKind(value: Remote | undefined, selectedPath: string): PathKind {
  if (value?.type !== "string" || typeof value.value !== "string") { return "not-string"; }
  if (value.value === "") { return "empty"; }
  if (value.value === ":memory:") { return "memory"; }
  return value.value === selectedPath ? "selected" : "other";
}
function sqlKind(value: Remote | undefined): SqlKind {
  if (value?.type !== "string" || typeof value.value !== "string") { return "not-string"; }
  const first = /^[A-Za-z]+/u.exec(value.value.trimStart())?.[0]?.toLowerCase();
  if (first === "select" || first === "insert" || first === "update" || first === "delete" || first === "create" || first === "pragma") { return first; }
  if (first === "begin" || first === "commit" || first === "rollback" || first === "end") { return "transaction"; }
  return "other";
}
/** Summarize the fresh array's exact own descriptors. Child objects are not
 * traversed and this data cannot establish why the breakpoint predicate held. */
export function decodeCurrentSelectedFileMainSqlStartupFrame(input: unknown, site: CurrentSelectedFileMainSqlStartupDiagnosticSite, selectedPath: string): CurrentSelectedFileMainSqlStartupFrameSummary {
  const count = SOURCE.sites[site].expression.slice(1, -1).split(",").length, parsed = reply.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(parsed.result.map(item => [item.name, item])), length = fields.get("length"), parent = parsed.internalProperties[0].value;
  need(fields.size === count + 1 && parsed.result.length === count + 1 && length !== undefined && length.value.type === "number" && length.value.value === count &&
    length.value.objectId === undefined && length.writable && !length.enumerable && !length.configurable &&
    parent.type === "object" && parent.subtype === "array" && parent.className === "Array" && parent.objectId !== undefined && parent.value === undefined);
  const values: Remote[] = [];
  for (let index = 0; index < count; index += 1) {
    const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable); values.push(field.value);
  }
  return Object.freeze({ slotKinds: Object.freeze(values.map(value => kind(value))),
    pathKind: pathSites.has(site) ? pathKind(values[0], selectedPath) : "not-applicable",
    sqlKind: sqlSites.has(site) ? sqlKind(values[1]) : "not-applicable" });
}

/** The refusal category describes the original scheduler branch only. It
 * neither reruns the condition nor classifies an unknown SQL call as safe. */
export function currentSelectedFileMainSqlStartupRefusal(site: CurrentSelectedFileMainSqlStartupDiagnosticSite, trackerPresent: boolean): CurrentSelectedFileMainSqlStartupRefusal {
  if (site === "statementRun" || site === "finalize") { return "statement-operation-not-admitted"; }
  if (site === "run" || site === "prepare" || site === "prepared") { return trackerPresent ? "profile-not-recognized" : "tracker-absent"; }
  return "site-outside-startup-profile";
}
