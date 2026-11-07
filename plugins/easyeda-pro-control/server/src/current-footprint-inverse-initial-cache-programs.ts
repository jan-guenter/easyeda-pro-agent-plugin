/** Inverse saved-head limits are measured from the original complete graph.
 * Existing generated programs and their smaller limits remain byte-exact. */
import { CURRENT_GENERATED_INITIAL_DATA_ENCODER as ENCODER, CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as GENERATED } from "./current-generated-initial-cache-programs.ts";

function once(source: string, before: string, after: string): string {
  const at = source.indexOf(before); if (at === -1 || source.includes(before, at + before.length)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_TEMPLATE"); }
  return source.slice(0, at) + after + source.slice(at + before.length);
}
let encode = once(ENCODER, "count>128||depth>7", "count>nodes||depth>depthLimit");
encode = once(encode, "v.length>8192", "v.length>stringLimit");
encode = once(encode, "n>4", "n>arrayLimit");
encode = once(encode, "keys.length>20", "keys.length>keyLimit");
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_HEAD_ENCODER = encode;
const limits = 'for(const n of[nodes,depthLimit,arrayLimit,keyLimit,stringLimit])if(!Number.isSafeInteger(n)||n<0||n>8192)bad();if(nodes<1||depthLimit>32||arrayLimit>32||keyLimit>32)bad();';
let head = once(GENERATED.head, ENCODER, CURRENT_FOOTPRINT_INVERSE_INITIAL_HEAD_ENCODER);
head = once(head, "function(key,body){", "function(key,body,nodes,depthLimit,arrayLimit,keyLimit,stringLimit){");
head = once(head, "entry(this);", `entry(this);${limits}`);
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_PROGRAMS = Object.freeze({ flow: GENERATED.document, head, promise: GENERATED.promise, success: GENERATED.success });
