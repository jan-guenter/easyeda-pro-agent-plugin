/** Separate exact common private owner FIELD spellings for the legacy inverse
 * build. The original467-field proof runs first and is unchanged. This second
 * token-only projection changes no literal, row, public member or runtime guard. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "./current-pcb-diagnostic-csharp-spacing.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Token=ReturnType<typeof tokenize>[number];
export const CURRENT_FOOTPRINT_INVERSE_COMMON_PRIVATE_FIELDS = freezeDeep([
  {
    "field": "workerStartupFootprintCombined209",
    "uses": 26,
    "contextSha256": "ab58ffb7519c3e74b6d6dc4f98e0000b9d0e32f91b015132f485c04fc1bc7e9c",
    "emitted": "ifc0"
  },
  {
    "field": "workerStartupFootprintHeldSaved209",
    "uses": 24,
    "contextSha256": "e7123955d7f574c6641402e1716257567ae5af5fbe4d0f204f711d5a6f3d0340",
    "emitted": "ifc1"
  },
  {
    "field": "workerStartupRatlineContinuation209",
    "uses": 23,
    "contextSha256": "09c3225ab8f286f3b1ff8133c6196b8736b49afb7540d26e1aace2939281b02f",
    "emitted": "ifc2"
  },
  {
    "field": "workerStartupFootprintCopy209",
    "uses": 25,
    "contextSha256": "baa94f82bc616d67b6b52982f70c4dd46834be57c928a6a578435dde01e050f0",
    "emitted": "ifc3"
  },
  {
    "field": "footprintCopyWorkerSession",
    "uses": 28,
    "contextSha256": "615e6ab213992dfb49d0425b149f610e61173e0d74e65fc78a9a26473daf4c58",
    "emitted": "ifc4"
  },
  {
    "field": "workerStartupFootprintForward209",
    "uses": 22,
    "contextSha256": "4e7e587045ce95c46e6f5b2526e44eac7c51a9be697d8d1995e059349974cff3",
    "emitted": "ifc5"
  },
  {
    "field": "footprintCreateClockLedger",
    "uses": 26,
    "contextSha256": "9608ee074ec8f1ee7a162e7efaefb2fdf0f58a16ff211bed2db44232e37d7376",
    "emitted": "ifc6"
  },
  {
    "field": "startupActorContext",
    "uses": 37,
    "contextSha256": "efd8692948ea7e75777cd3da07099b3910f69346ba7108e2dda4ec5d10741015",
    "emitted": "ifc7"
  }
] as const);
const FIELDS = CURRENT_FOOTPRINT_INVERSE_COMMON_PRIVATE_FIELDS;
const originalNames = new Map<string, typeof FIELDS[number]>(FIELDS.map(row => [row.field, row]));
const emittedNames = new Set<string>(FIELDS.map(row => row.emitted));
need(createHash("sha256").update(JSON.stringify(FIELDS)).digest("hex") === "364a8a319560319e441f121ad621bffe001123aa3b7d627a03d0c473f15e1492");
const forbidden = new Set(["public", "protected", "internal"]);
const primitive = new Set(["bool", "int", "string", "long", "short", "byte", "object", "char", "uint", "ulong", "var"]);
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_COMMON_PRIVATE_FIELD_EMITTER"); } }
/** Normalize escaped identifiers for collision checks while retaining their
 * exact original token bytes for the actual replacement proof. */
function name(token: Token | undefined): string | null { return token?.kind === "identifier" ? token.text.replace(/^@/u, "") : null; }
interface ClassScope { readonly name: string; readonly kind: "class" | "struct" | "enum"; readonly depth: number; member: number }
/** Distinguish one private class-level FIELD from its references, rejecting
 * attributes, public modifiers and primitive local/parameter shadowing. */
function privateField(active: readonly Token[], index: number, scope: ClassScope, depth: number): boolean {
  const next = active[index + 1]?.text; const previous = active[index - 1];
  if (depth === scope.depth) { need(next === "=" || next === "," || next === ";"); const prefix = active.slice(scope.member, index); need(prefix.length > 0 && !prefix.some(item => forbidden.has(item.text) || item.text === "[")); return true; }
  need(!(previous?.kind === "identifier" && primitive.has(previous.text) && (next === "=" || next === "," || next === ";" || next === ")" || next === "in"))); return false;
}
/** Prove every selected spelling is one private owner FIELD, with its exact
 * declaration/reference census. A fresh name, local shadow, anonymous key,
 * foreign owner, use outside the fully regenerated inverse block or serializer/
 * reflection construct permanently refuses. */
function inspect(source: string): readonly Token[] {
  need(FIELDS.length === 8 && originalNames.size === 8 && emittedNames.size === 8 && FIELDS.reduce((sum, row) => sum + row.uses, 0) === 211);
  const beginMarker = "// BEGIN GENERATED ORIGINAL FOOTPRINT INVERSE BIRTH", endMarker = "// END GENERATED ORIGINAL FOOTPRINT INVERSE BIRTH";
  const begin = source.indexOf(beginMarker), end = source.indexOf(endMarker);
  need(begin !== -1 && end > begin && source.split(beginMarker).length === 2 && source.split(endMarker).length === 2);
  const all = tokenize(source); const active = all.filter(token => token.kind !== "space" && token.kind !== "comment");
  const counts = new Map<string, number>(); const declarations = new Map<string, number>(); const scopes: ClassScope[] = []; const anonymous: number[] = []; const contexts = new Map<string, string[][]>();
  let depth = 0; let pending: Readonly<{ name: string; kind: ClassScope["kind"] }> | null = null; let timezoneCalls = 0;
  for (const [index, token] of active.entries()) {
    const own = name(token);
    if (own !== null) {
      need(!emittedNames.has(own));
      const timezone = own === "ToSerializedString" && active[index - 1]?.text === "." && active[index - 2]?.text === "zone" && active[index + 1]?.text === "(" && active[index + 2]?.text === ")";
      if (timezone) { timezoneCalls += 1; }
      need(timezone || !/serializ|reflect|GetField|GetMember|GetPropert|TypeDescriptor|GetRuntimeField|GetMethod|InvokeMember|GetRuntimeMethod|GetType|TypeInfo|dynamic|Formatter|nameof|BindingFlags/iu.test(own));
    }
    if (token.text === "class" || token.text === "struct" || token.text === "enum") { const typeName = name(active[index + 1]); need(typeName !== null); pending = { name: typeName, kind: token.text }; }
    if (token.text === "{") {
      depth += 1;
      if (pending !== null) { scopes.push({ ...pending, depth, member: index + 1 }); pending = null; }
      else if (active[index - 1]?.text === "new") { anonymous.push(depth); }
    } else if (token.text === "}") {
      if (anonymous.at(-1) === depth) { anonymous.pop(); }
      if (scopes.at(-1)?.depth === depth) { scopes.pop(); }
      depth -= 1; const scope = scopes.at(-1); if (scope?.depth === depth) { scope.member = index + 1; } need(depth >= 0);
    } else {
      const scope = scopes.at(-1);
      if (scope !== undefined && token.text === ";" && depth === scope.depth) { scope.member = index + 1; }
      else if (own !== null) {
        const row = originalNames.get(own);
        if (row !== undefined) {
          need(token.text === own && scope !== undefined && scope.name === "EasyedaDiagnosticOwner" && scope.kind === "class");
          counts.set(own, (counts.get(own) ?? 0) + 1);
          const context = contexts.get(own) ?? []; context.push(active.slice(Math.max(0, index - 4), index + 5).map(item => item.kind === "string" || item.kind === "verbatim" || item.kind === "char" ? `[${item.kind}]` : item.text)); contexts.set(own, context);
          const next = active[index + 1]?.text; const previous = active[index - 1];
          need(!(anonymous.at(-1) === depth && (previous?.text === "{" || previous?.text === ",") && (next === "=" || next === "," || next === "}")));
          const declared = privateField(active, index, scope, depth); declarations.set(own, (declarations.get(own) ?? 0) + (declared ? 1 : 0));
        }
      }
    }
  }
  need(depth === 0 && scopes.length === 0 && anonymous.length === 0 && timezoneCalls === 1); need(source.split("System.TimeZoneInfo zone = System.TimeZoneInfo.Local;").length === 2);
  for (const row of FIELDS) { const context = contexts.get(row.field); need(context !== undefined); need(declarations.get(row.field) === 1 && counts.get(row.field) === row.uses && createHash("sha256").update(JSON.stringify(context)).digest("hex") === row.contextSha256); }
  return all;
}
/** Emit only injective globally fresh FIELD tokens. Splicing retains every
 * byte between those tokens, including comments, literals and table payloads. */
export function compactCurrentFootprintInverseCommonPrivateFields(source: string): string {
  const tokens = inspect(source); const parts: string[] = []; let prior = 0;
  for (const token of tokens) { if (token.kind === "identifier") { const row = originalNames.get(token.text); if (row !== undefined) { parts.push(source.slice(prior, token.start), row.emitted); prior = token.end; } } }
  parts.push(source.slice(prior)); const result = parts.join("");
  const observed = tokenize(result); need(observed.length === tokens.length);
  for (const [index, token] of tokens.entries()) { const now = observed[index]; need(now !== undefined && now.kind === token.kind && now.text === (token.kind === "identifier" ? originalNames.get(token.text)?.emitted ?? token.text : token.text)); }
  return result;
}

/** Restore only this independently pinned spelling pass before complete warm
 * regeneration. The full declaration/use/context proof must reproduce every
 * original byte; durable data cannot select a field map or runtime source. */
export function expandCurrentFootprintInverseCommonPrivateFields(source:string):string{
 const tokens=tokenize(source);if(!tokens.some(token=>token.kind==="identifier"&&emittedNames.has(token.text))){return source;}
 const inverse=new Map<string,string>(FIELDS.map(row=>[row.emitted,row.field]));const parts:string[]=[];let prior=0;
 for(const token of tokens){if(token.kind==="identifier"){need(!originalNames.has(token.text));const original=inverse.get(token.text);if(original!==undefined){parts.push(source.slice(prior,token.start),original);prior=token.end;}}}
 parts.push(source.slice(prior));const restored=parts.join("");need(compactCurrentFootprintInverseCommonPrivateFields(restored)===source);return restored;
}
