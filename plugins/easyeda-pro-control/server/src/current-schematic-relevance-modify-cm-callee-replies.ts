/** Source and uninvoked function metadata only. All receiver, effect and
 * continuation claims remain false until the original runtime binds them. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE } from "./current-schematic-relevance-modify-cm-callee-source.ts";
import type { CurrentSchematicRelevanceModifyCmCalleeRole as Role } from "./current-schematic-relevance-modify-cm-callee-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "number", "string"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(65_536).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const field = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const packet = z.strictObject({ result: z.array(field).min(2).max(13), internalProperties: z.array(internal).length(3) });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
type Field = z.infer<typeof field>;

export interface CurrentSchematicRelevanceModifyCmCalleeMetadata {
  readonly scopes: string;
  readonly functionPrototype: string;
  readonly prototype: string | null;
  readonly staticMethods: Readonly<Record<string, string>>;
  readonly originalConsistencyVerified: false;
  readonly originalSheetVerified: false;
  readonly callbackReceiverVerified: false;
  readonly continuationAuthorized: false;
  readonly workerCompleted: false;
  readonly modifyCompleted: false;
  readonly saveAuthorized: false;
}

/** Stop on any source/metadata mismatch before retaining descriptive handles. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_CM_CALLEE"); } }

/** Match V8's exact description; static definitions omit the source's leading
 * static keyword, while class constructors retain the complete class body. */
export function requireCurrentSchematicRelevanceModifyCmCalleeDescription(value: string, role: Role): void {
  const row = SOURCE.roles[role];
  need(value.isWellFormed() && Buffer.byteLength(value) === row.descriptionBytes && createHash("sha256").update(value).digest("hex") === row.descriptionSha256);
}

/** Require an own immutable scalar name/length field without accessor reads. */
function scalar(fields: ReadonlyMap<string, Field>, key: "name" | "length", expected: string | number): void {
  const value = fields.get(key);
  need(value !== undefined && !value.writable && !value.enumerable && value.configurable && value.value.type === (key === "name" ? "string" : "number") && value.value.value === expected && value.value.subtype === undefined && value.value.objectId === undefined);
}

/** Validate the full default-class static roster rather than applying the
 * older three-own-field class assumption. Each handle still needs its own
 * source/function and original-object identity proof before invocation. */
function statics(fields: ReadonlyMap<string, Field>, role: Role): Readonly<Record<string, string>> {
  const result: Record<string, string> = {}, row = SOURCE.roles[role];
  if (row.kind !== "class") { return Object.freeze(result); }
  for (const method of row.staticMethods) {
    const own = fields.get(method.name);
    need(own !== undefined && own.writable && !own.enumerable && own.configurable && own.value.type === "function" && own.value.subtype === undefined && own.value.className === (method.async ? "AsyncFunction" : "Function") && own.value.objectId !== undefined && own.value.value === undefined);
    result[method.name] = own.value.objectId;
  }
  return Object.freeze(result);
}

/** Validate all own fields and original V8 coordinates without constructing a
 * class or calling a predicate. In particular, dT owns ten static methods and
 * EE is an ordinary sloppy function with own arguments/caller/prototype. */
export function decodeCurrentSchematicRelevanceModifyCmCalleeFunction(input: unknown, role: Role, scriptId: string): CurrentSchematicRelevanceModifyCmCalleeMetadata {
  handle.parse(scriptId);
  const profile = SOURCE.roles[role], reply = packet.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item]));
  const regular = profile.kind === "function";
  const ownPrototype = regular || profile.kind === "class";
  const expected = ["name", "length", ...(ownPrototype ? ["prototype"] : []), ...(regular ? ["arguments", "caller"] : []), ...(profile.kind === "class" ? profile.staticMethods.map(item => item.name) : [])];
  need(fields.size === expected.length && reply.result.length === expected.length && expected.every(key => fields.has(key)));
  scalar(fields, "name", profile.name); scalar(fields, "length", profile.arity);
  let prototype: string | null = null;
  if (ownPrototype) {
    const value = fields.get("prototype");
    need(value !== undefined && value.writable === regular && !value.enumerable && !value.configurable && value.value.type === "object" && value.value.subtype === undefined && value.value.objectId !== undefined && value.value.value === undefined);
    prototype = value.value.objectId;
  }
  if (regular) {
    for (const key of ["arguments", "caller"]) {
      const value = fields.get(key);
      need(value !== undefined && !value.writable && !value.enumerable && !value.configurable && value.value.type === "object" && value.value.subtype === "null" && value.value.value === null && value.value.objectId === undefined);
    }
  }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value])); need(internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  const actual = point.parse(location?.value);
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && actual.scriptId === scriptId && actual.lineNumber === profile.lineNumber && actual.columnNumber === profile.columnNumber);
  need(parent?.type === "function" && parent.className === "Function" && parent.subtype === undefined && parent.value === undefined && parent.objectId !== undefined);
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scopes: scopes.objectId, functionPrototype: parent.objectId, prototype, staticMethods: statics(fields, role), originalConsistencyVerified: false, originalSheetVerified: false, callbackReceiverVerified: false, continuationAuthorized: false, workerCompleted: false, modifyCompleted: false, saveAuthorized: false });
}
