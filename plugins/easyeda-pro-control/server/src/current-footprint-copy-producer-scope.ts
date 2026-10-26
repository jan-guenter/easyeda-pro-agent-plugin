/** Unmounted current209 lexical selectors. They read own data descriptors and
 * compare native identities; none of the captured producers is invoked. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_LEXICAL_PROFILES = freezeDeep([
  { name: "Jo", arity: 0, async: false, class: true, line: 106, column: 11_694, bytes: 2974, hash: "93c5ec17ed7d6e41c8f1b81cd45614c0e337311645b2fed49ff4bb1386b08ba0" },
  { name: "getProLibSource", arity: 1, async: true, class: false, line: 106, column: 14_437, bytes: 251, hash: "05b6dcadcf112239ef700cfb7ce958343a6cd3913ecf30080ad0ec1162b58167" },
  { name: "qe", arity: 0, async: true, class: false, line: 108, column: 9674, bytes: 93, hash: "891be3132a4d163bbede847d96e1c03351acac41e990064bcb619aee63286ea4" },
  { name: "Qe", arity: 0, async: false, class: false, line: 4, column: 1915, bytes: 125, hash: "bd26e2e718003585daa64a23a098dabdee5d73bdf0cb0a05b8d9e8b8ffdf4017" },
  { name: "Ke", arity: 0, async: false, class: true, line: 56, column: 1336, bytes: 291, hash: "57b9a4fafb7a173b03bc25c402368ab4583edfb2be46606cb07054d7d3162ec8" },
  { name: "Ni", arity: 3, async: false, class: false, line: 8, column: 2122, bytes: 551, hash: "1c6955e2672c9b466745f9797fadd6e9d4c7457ff1a9e9ffffe0b7bc8f326728" },
  { name: "cg", arity: 1, async: false, class: false, line: 109, column: 1853, bytes: 148, hash: "309b1a971cfb75b19acb84450acad146788f253e5844ca0d3bbdecc88ee8ee3f" },
] as const);

const selector = String.raw`"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_PRODUCER_SCOPE");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const ai=own(this,"ai"),ve=own(this,"ve"),Oe=own(this,"Oe"),Ie=own(this,"Ie");
const selected=[ai,own(ai,"getProLibSource"),own(this,"qe"),own(this,"Qe"),own(this,"Ke"),own(this,"Ni"),own(this,"cg"),ve,Oe,Ie];
for(let i=0;i<7;i++)if(typeof selected[i]!=="function")bad();
if(own(ve,"FOOTPRINT")!=="FOOTPRINT"||own(ve,"FONT")!=="FONT"||own(ve,"BLOB")!=="BLOB"||own(Oe,"FOOTPRINT")!==4||Ie!=="|\n")bad();
const verify=()=>{for(const [o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}};`;

/** The first seven entries are source-qualified functions; the final three
 * retain enum objects and separator for identity reproof from each fresh scope.
 * A scope wrapper is never reused across awaited observations. */
export const CURRENT_FOOTPRINT_COPY_LEXICAL_CALLS = freezeDeep({
  capture: { program: `function(){${selector}\nverify();return selected;}`, arguments: 0, returnByValue: false },
  recheck: { program: `function(original){${selector}\nif(!Array.isArray(original)||Object.getPrototypeOf(original)!==Array.prototype||own(original,"length")!==10||Reflect.ownKeys(original).length!==11)bad();for(let i=0;i<10;i++)if(!Object.is(own(original,String(i)),selected[i]))bad();verify();return true;}`, arguments: 1, returnByValue: true },
});
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const point = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), point]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function refuse(): never { throw new Error("FOOTPRINT_COPY_PRODUCER_METADATA"); }
function data(input: unknown): unknown { return captureCurrentPcbStringClockReply(input).value; }

/** Only the leading IIFE closure is selected. Later scopes cannot supply a
 * missing lexical binding and no global scope is enumerated. */
export function decodeCurrentFootprintCopyProducerScope(input: unknown): string {
  try {
    const reply = z.object({ result: z.array(property).min(2).max(8) }).strict().parse(data(input));
    const ids = new Set<string>();
    for (const [index, item] of reply.result.entries()) {
      const value = item.value;
      if (item.name !== String(index) || !item.writable || !item.configurable || !item.enumerable ||
          value.type !== "object" || value.subtype !== "internal#scope" || value.className !== "Object" ||
          value.objectId === undefined || value.value !== undefined || ids.has(value.objectId)) { return refuse(); }
      ids.add(value.objectId);
    }
    if (reply.result[0]?.value.description !== "Closure" || reply.result.at(-1)?.value.description !== "Global") { return refuse(); }
    return reply.result[0].value.objectId ?? refuse();
  } catch { return refuse(); }
}

export function decodeCurrentFootprintCopyProducerArray(input: unknown): readonly string[] {
  try {
    const reply = z.object({ result: z.array(property).length(11), internalProperties: z.array(internal).length(1) }).strict().parse(data(input));
    const fields = new Map(reply.result.map(item => [item.name, item]));
    if (fields.size !== 11) { return refuse(); }
    const length = fields.get("length");
    if (length?.value.type !== "number" || length.value.value !== 10 || length.value.objectId !== undefined ||
        !length.writable || length.enumerable || length.configurable) { return refuse(); }
    const ids = CURRENT_FOOTPRINT_COPY_LEXICAL_PROFILES.map((expected, index) => {
      const item = fields.get(String(index)), value = item?.value;
      if (item === undefined || !item.writable || !item.enumerable || !item.configurable || value?.type !== "function" ||
          value.className !== (expected.async ? "AsyncFunction" : "Function") || value.objectId === undefined ||
          value.subtype !== undefined || value.value !== undefined || value.description === undefined ||
          Buffer.byteLength(value.description) !== expected.bytes || createHash("sha256").update(value.description).digest("hex") !== expected.hash) { return refuse(); }
      return value.objectId;
    });
    for (const index of [7, 8]) {
      const item = fields.get(String(index));
      if (item === undefined || !item.writable || !item.enumerable || !item.configurable || item.value.type !== "object" ||
          item.value.className !== "Object" || item.value.description !== "Object" || item.value.objectId === undefined ||
          item.value.subtype !== undefined || item.value.value !== undefined) { return refuse(); }
      ids.push(item.value.objectId);
    }
    const parent = reply.internalProperties[0];
    const separator = fields.get("9");
    if (new Set(ids).size !== 9 || separator === undefined || !separator.writable || !separator.enumerable || !separator.configurable ||
        separator.value.type !== "string" || separator.value.value !== "|\n" || separator.value.objectId !== undefined ||
        parent?.name !== "[[Prototype]]" || parent.value.type !== "object" || parent.value.subtype !== "array" ||
        parent.value.className !== "Array" || parent.value.description !== "Array(0)" || parent.value.objectId === undefined) { return refuse(); }
    return Object.freeze(ids.slice(0, 7));
  } catch { return refuse(); }
}

/** Location/name/arity qualification is separate from the function description
 * checked above. This never treats copied descriptors as a retained owner. */
export function decodeCurrentFootprintCopyProducerFunction(input: unknown, scriptId: string, index: number): void {
  try {
    token.parse(scriptId);
    const expected = Number.isInteger(index) && !Object.is(index, -0) ? CURRENT_FOOTPRINT_COPY_LEXICAL_PROFILES[index] : undefined;
    if (expected === undefined) { return refuse(); }
    const reply = z.object({ result: z.array(property).min(2).max(10), internalProperties: z.array(internal).length(3) }).strict().parse(data(input));
    const fields = new Map(reply.result.map(item => [item.name, item]));
    if (fields.size !== reply.result.length) { return refuse(); }
    for (const name of ["name", "length"] as const) {
      const item = fields.get(name), value = name === "name" ? expected.name : expected.arity;
      if (item === undefined || item.writable || item.enumerable || !item.configurable || item.value.value !== value ||
          Object.is(item.value.value, -0) || item.value.type !== (name === "name" ? "string" : "number") || item.value.objectId !== undefined) { return refuse(); }
    }
    const allowed = expected.async ? ["name", "length"] : ["name", "length", "prototype"];
    if (index === 0) { allowed.push("getOldLibByNet", "transform", "getOtherLibByNet", "getOtherLibByWorker", "getProjectLibByWorker", "getExtendLib", "getProLibSource"); }
    if (fields.size !== allowed.length || allowed.some(name => !fields.has(name))) { return refuse(); }
    for (const [name, item] of fields) {
      if (name !== "name" && name !== "length" && (item.enumerable || item.value.objectId === undefined || item.value.value !== undefined ||
          (name === "prototype" ? item.configurable || item.writable === expected.class || item.value.type !== "object" :
            !item.configurable || !item.writable || item.value.type !== "function"))) { return refuse(); }
    }
    const entries = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = entries.get("[[FunctionLocation]]");
    const prototype = entries.get("[[Prototype]]");
    const scopes = entries.get("[[Scopes]]");
    const position = location?.value;
    if (entries.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        position === null || typeof position !== "object" || position.scriptId !== scriptId || position.lineNumber !== expected.line || position.columnNumber !== expected.column ||
        prototype?.type !== (expected.async ? "object" : "function") || prototype.objectId === undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.objectId === undefined ||
        scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return refuse(); }
  } catch { return refuse(); }
}
