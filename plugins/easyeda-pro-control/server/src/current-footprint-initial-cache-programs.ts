/** Separate bounded footprint head comparison. Shared strings are inert
 * descriptor guards; no generated-project origin or native grant is accepted. */
import { CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as BASE, CURRENT_GENERATED_INITIAL_DATA_ENCODER } from "./current-generated-initial-cache-programs.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export const CURRENT_FOOTPRINT_INITIAL_CACHE_ENCODER_LIMITS = Object.freeze({ nodes: 1024, depth: 12, array: 256, object: 32, string: 8192 });
function replace(source: string, before: string, after: string): string { if (source.split(before).length !== 2) { throw new Error("FOOTPRINT_INITIAL_CACHE_ENCODER_SOURCE"); } return source.replace(before, after); }
// The native parser's DOCHEAD fallback creates own undefined actor fields.
// Preserve native JSON behavior: omit undefined object values, use null for
// Undefined array values, still retain/reprove every original own descriptor.
let encoder = CURRENT_GENERATED_INITIAL_DATA_ENCODER;
for (const [before, after] of [["++count>128", "++count>1024"], ["depth>7", "depth>12"], ["n>4", "n>256"], ["keys.length>20", "keys.length>32"],
  ['if(v===null)return"null";', 'if(v===undefined)return undefined;if(v===null)return"null";'],
  ['values.push(encode(own(v,String(i)),depth+1))', 'values.push(encode(own(v,String(i)),depth+1)??"null")'],
  ["values.push(quote(k)+':'+encode(own(v,k),depth+1));", "const encoded=encode(own(v,k),depth+1);if(encoded!==undefined)values.push(quote(k)+':'+encoded);"]] as const) { encoder = replace(encoder, before, after); }
export const CURRENT_FOOTPRINT_INITIAL_CACHE_PROGRAMS = Object.freeze({ document: BASE.document, head: replace(BASE.head, CURRENT_GENERATED_INITIAL_DATA_ENCODER, encoder), promise: BASE.promise, success: BASE.success });
/** Before native enrollment, qualify the entire expected JSON graph against
 * the same finite data domain. Actual original references still need proof. */
function visit(value: unknown): void {
  if (value === null || typeof value !== "object") { return; }
  if (Object.hasOwn(value, "toJSON")) { throw new Error("FOOTPRINT_INITIAL_HEAD_TO_JSON"); }
  for (const item of Object.values(value)) { visit(item); }
}
export function requireCurrentFootprintInitialCacheHeadData(body: string): void {
  if (Buffer.byteLength(body) > 8192) { throw new Error("FOOTPRINT_INITIAL_HEAD_BOUND"); }
  const parsed: unknown = JSON.parse(body); const captured = captureCurrentPcbStringClockReply(parsed);
  if (captured.text !== body) { throw new Error("FOOTPRINT_INITIAL_HEAD_ENCODING"); }
  visit(captured.value);
}
