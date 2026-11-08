/** Complete descriptive N-API3 constructor metadata, not a constructor or
 * native-payload grant. Original captured module/descriptor identities remain
 * the binding proof. Windows must match this exact shape or refuse. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export const CURRENT_SELECTED_FILE_MAIN_SQL_NAPI3_PROFILE = Object.freeze({
  profile: "private.selected-file-main-sql-napi3-metadata.v1",
  sqlite3: "5.0.2", napiVersion: 3, headerVersion: "3.0.2",
  databaseSourceSha256: "3778713244ecacaef7f6b75537d5c00e1cab28a79a7298d34729a9f5e115f979",
  statementSourceSha256: "7a12e9fd6efc9873025429cd9d86842ee01b4f0e730bda0402053900d30a94d0",
  napiHeaderSha256: "0210886aa663479fb287fdbcbefaafaed34a1712c8524dbe7e3be6c720e36468",
  napiInlineHeaderSha256: "63dce38fcf342c60333769baa7f301f9c59b91e9d9060e139a11bda6dfc9e676",
  databaseSymbols: 8, statementSymbols: 7,
  coreProfiles: Object.freeze(["caller-own-five", "caller-absent-three"] as const),
  externalPayloadIdentityProven: false, windowsAbiObserved: false, executionAuthorized: false,
} as const);
/** Later headers retain the Database open accessor's callback data as well as
 * its eight methods. This is a separate complete metadata shape, not ABI proof. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_NAPI3_ACCESSOR_PROFILE = Object.freeze({
  profile: "private.selected-file-main-sql-napi3-accessor-metadata.v1",
  sqlite3: "5.0.2", napiVersion: 3, headerVersion: "3.2.1",
  databaseSourceSha256: CURRENT_SELECTED_FILE_MAIN_SQL_NAPI3_PROFILE.databaseSourceSha256,
  statementSourceSha256: CURRENT_SELECTED_FILE_MAIN_SQL_NAPI3_PROFILE.statementSourceSha256,
  napiHeaderSha256: "1084a55623f0357f42ff55918bdd960c226fd90ddd1815b55ce094e55486689e",
  napiInlineHeaderSha256: "732f3d74b7c64c761a989455bca127d9c384651264ab27e5009d0bc78882bf81",
  databaseSymbols: 9, statementSymbols: 7,
  coreProfiles: CURRENT_SELECTED_FILE_MAIN_SQL_NAPI3_PROFILE.coreProfiles,
  externalPayloadIdentityProven: false, windowsAbiObserved: false, executionAuthorized: false,
} as const);
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const opaque = z.object({ type: z.literal("object"), className: z.literal("Object"), description: z.literal("Object"), objectId: handle }).strict();
const symbol = z.object({ type: z.literal("symbol"), description: z.literal("Symbol()"), objectId: handle }).strict();
const flags = { writable: z.literal(false), enumerable: z.literal(false), configurable: z.literal(false), isOwn: z.literal(true) };
const symbolProperty = z.object({ ...flags, name: z.literal("Symbol()"), value: opaque, symbol }).strict();
const scalarProperty = (name: string, value: z.ZodType, configurable: boolean): z.ZodType =>
  z.object({ ...flags, name: z.literal(name), value, configurable: z.literal(configurable) }).strict();
const zero = scalarProperty("length", z.object({ type: z.literal("number"), value: z.literal(0), description: z.literal("0") }).strict(), true);
const nullValue = z.object({ type: z.literal("object"), subtype: z.literal("null"), value: z.null() }).strict();
function core(role: "Database" | "Statement", callerOwn: boolean): z.ZodType {
  const nameValue = z.object({ type: z.literal("string"), value: z.literal(role) }).strict();
  const name = scalarProperty("name", nameValue, true);
  const prototype = z.object({ ...flags, name: z.literal("prototype"), writable: z.literal(true), value: opaque }).strict();
  if (callerOwn) { return z.tuple([zero, name, scalarProperty("arguments", nullValue, false), scalarProperty("caller", nullValue, false), prototype]); }
  return z.tuple([zero, name, prototype]);
}
const parent = z.object({ name: z.literal("[[Prototype]]"), value: z.object({ type: z.literal("function"), className: z.literal("Function"),
  description: z.literal("function () { [native code] }"), objectId: handle }).strict() }).strict();
const scopes = z.object({ name: z.literal("[[Scopes]]"), value: z.object({ type: z.literal("object"), subtype: z.literal("internal#scopeList"),
  className: z.literal("Array"), description: z.literal("Scopes[0]"), objectId: handle }).strict() }).strict();
const packet = z.object({ result: z.array(z.unknown()).max(14), internalProperties: z.tuple([parent, scopes]) }).strict();

export function matchesCurrentSelectedFileMainSqlFenceNapi3(input: unknown, role: "Database" | "Statement"): boolean {
  if (role !== "Database" && role !== "Statement") { return false; }
  let captured: unknown;
  try { captured = captureCurrentPcbStringClockReply(input).value; } catch { return false; }
  const parsed = packet.safeParse(captured); if (!parsed.success) { return false; }
  const fields = parsed.data.result;
  const profiles = role === "Database" ? [[3, 8], [5, 8], [3, 9], [5, 9]] as const : [[3, 7], [5, 7]] as const;
  const selected = profiles.find(([coreCount, count]) => fields.length === coreCount + count);
  if (selected === undefined) { return false; }
  const [coreCount, count] = selected;
  if (!core(role, coreCount === 5).safeParse(fields.slice(0, coreCount)).success) { return false; }
  const symbols = new Set<string>(), values = new Set<string>();
  for (const field of fields.slice(coreCount)) {
    const item = symbolProperty.safeParse(field); if (!item.success) { return false; }
    if (symbols.has(item.data.symbol.objectId) || values.has(item.data.value.objectId)) { return false; }
    symbols.add(item.data.symbol.objectId); values.add(item.data.value.objectId);
  }
  return symbols.size === count && values.size === count;
}

const names = new Set(["length", "name", "arguments", "caller", "prototype", "Symbol()", "[[Prototype]]", "[[Scopes]]"]);
const kinds = new Set(["object", "function", "symbol", "number", "string", "boolean", "undefined", "bigint"]);
const classes = new Set(["Object", "Function", "Array"]);
const subtypes = new Set(["null", "array", "internal#scopeList"]);
const descriptions = new Set(["0", "Object", "Symbol()", "Scopes[0]", "function () { [native code] }"]);
function record(input: unknown): input is Readonly<Record<string, unknown>> { return input !== null && typeof input === "object" && !Array.isArray(input); }
function category(input: unknown, allowed: ReadonlySet<string>): string {
  if (typeof input === "string" && allowed.has(input)) { return input; }
  return input === undefined ? "ABSENT" : "OTHER";
}
function scalarShape(value: unknown): string {
  if (value === undefined) { return "ABSENT"; } if (value === null) { return "NULL"; } if (value === 0) { return "ZERO"; }
  return value === "Database" || value === "Statement" ? value : "OTHER";
}
function remoteShape(input: unknown): unknown {
  if (!record(input)) { return "INVALID"; }
  return { fields: Object.keys(input).map(key => ["type", "subtype", "className", "description", "value", "objectId"].includes(key) ? key : "OTHER").toSorted(),
    type: category(input["type"], kinds), subtype: category(input["subtype"], subtypes), className: category(input["className"], classes),
    description: category(input["description"], descriptions), objectIdPresent: typeof input["objectId"] === "string",
    value: scalarShape(input["value"]) };
}
function fieldShape(input: unknown): unknown {
  if (!record(input)) { return "INVALID"; }
  return { fields: Object.keys(input).map(key => ["name", "value", "symbol", "writable", "enumerable", "configurable", "isOwn"].includes(key) ? key : "OTHER").toSorted(),
    name: category(input["name"], names), value: remoteShape(input["value"]), symbol: remoteShape(input["symbol"]),
    flags: ["writable", "enumerable", "configurable", "isOwn"].map(key => typeof input[key] === "boolean" ? input[key] : "ABSENT") };
}
/** Fingerprint only a finite public metadata vocabulary and descriptor flags.
 * Handles, unknown names/descriptions and all arbitrary values are excluded. */
export function currentSelectedFileMainSqlFenceNativeShape(input: unknown): Readonly<{ fields: number; fingerprint: string }> {
  let captured: unknown;
  try { captured = captureCurrentPcbStringClockReply(input).value; } catch { captured = null; }
  const results: readonly unknown[] = record(captured) && Array.isArray(captured["result"]) ? captured["result"] : [];
  const internals: readonly unknown[] = record(captured) && Array.isArray(captured["internalProperties"]) ? captured["internalProperties"] : [];
  const packetFields = record(captured) ? Object.keys(captured).map(key => ["result", "internalProperties"].includes(key) ? key : "OTHER").toSorted() : [];
  const normalized = { packetFields, fields: results.map(value => fieldShape(value)), internals: internals.map(value => fieldShape(value)) };
  return Object.freeze({ fields: results.length, fingerprint: createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 16).toUpperCase() });
}
