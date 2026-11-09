/** Origin-free native serialized-origin syntax. A host must supply its own
 * original I11 receipt and qualify every new object/function before use.
 * These values issue no owner, sender, receiver or delivery authority. */
import { z } from "zod";
import { CURRENT_NATIVE_OWN_DATA_CHECK } from "./current-native-own-data-intrinsics.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const common = `"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}`;
const begin = `function(){${common}return[root,[]];}`;
/** `owner` is the original root, or a metadata-qualified parent returned by
 * the preceding step. The returned parent is opaque until its own metadata. */
const step = `function(owner,before){${common}const n=value(before,"length");dense(before,n);if(n>7)bad();if(n===0){if(owner!==root)bad();}else{const prior=value(before,""+(n-1));dense(prior,5);if(value(prior,"1")!==owner||value(prior,"4")()!==true)bad();}if(owner===null||(typeof owner!=="object"&&typeof owner!=="function"))bad();const p=proto(owner),d=get(owner,"origin");let getter=null,setter=null;if(d!==undefined){if(has(d,"value")||typeof d.get!=="function"||d.set!==undefined&&typeof d.set!=="function")bad();getter=d.get;setter=d.set===undefined?null:d.set;}const guard=()=>{if(proto(owner)!==p)bad();const after=get(owner,"origin");if(d===undefined?after!==undefined:!after||has(after,"value")||after.get!==getter||(after.set===undefined?null:after.set)!==setter||after.enumerable!==d.enumerable||after.configurable!==d.configurable)bad();return true;};return[owner,p,getter,setter,guard];}`;
const append = `function(before,snapshot){${common}const n=value(before,"length");dense(before,n);dense(snapshot,5);if(n>7||value(snapshot,"4")()!==true||n===0&&value(snapshot,"0")!==root)bad();if(n>0){const last=value(before,""+(n-1));dense(last,5);if(value(last,"1")!==value(snapshot,"0"))bad();}const out=[null,null,null,null,null,null,null,null];for(let j=0;j<n;j++)out[j]=value(before,""+j);out[n]=snapshot;out.length=n+1;return out;}`;
const prove = String.raw`const n=value(chain,"length");dense(chain,n);if(n<1||n>8||typeof getter!=="function")bad();let owner=root;for(let j=0;j<n;j++){const item=value(chain,""+j);dense(item,5);if(value(item,"0")!==owner||value(item,"4")()!==true||j<n-1&&value(item,"2")!==null)bad();owner=value(item,"1");if(j===n-1&&value(item,"2")!==getter)bad();}if(proto(getter)!==functionProto||get(getter,"apply")!==undefined)bad();const result=invoke(getter,root,[]);if(typeof result!=="string"||result.length<1||result.length>4096)bad();for(let j=0;j<result.length;j++)if(result[j]==="\u0000")bad();`;
const read = `function(chain,getter){${common}${prove}return result;}`;
const reprove = `function(chain,getter,original){${common}${prove}if(result!==original)bad();return true;}`;
export const CURRENT_NATIVE_SERIALIZED_ORIGIN_PROGRAMS = freezeDeep({ begin, step, append, read, reprove } as const);
export const CURRENT_NATIVE_SERIALIZED_ORIGIN_LIMITS = Object.freeze({ prototypeOwners: 8, codeUnits: 4096, ownershipIssued: false } as const);
const remote = z.strictObject({ type: z.literal("function"), className: z.literal("Function"), description: z.string(), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) });
/** Actual CDP description is checked independently of mutable own name/length.
 * Native MessageEvent/URL origin getters still need the correct original
 * global receiver; a compatible description alone cannot grant a read. */
export function currentNativeSerializedOriginCallable(input: unknown, role: "get" | "set"): string { const value = remote.parse(capture(input)); if (value.description !== `function ${role} origin() { [native code] }`) { throw new Error("NATIVE_SERIALIZED_ORIGIN_CALLABLE"); } return value.objectId; }
export function qualifyCurrentNativeSerializedOriginFunction(input: unknown, actualRemote: unknown, role: "get" | "set"): void { currentNativeSerializedOriginCallable(actualRemote, role); decodeCurrentNativeFunctionMetadata(input, { name: `${role} origin`, arity: role === "get" ? 0 : 1, constructor: false }); }

const objectRemote = z.strictObject({ type: z.enum(["object", "function", "undefined", "number", "string", "boolean", "symbol"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: z.string().optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: objectRemote.optional(), get: objectRemote.optional(), set: objectRemote.optional(), symbol: objectRemote.optional(), writable: z.boolean().optional(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const parent = z.strictObject({ name: z.literal("[[Prototype]]"), value: objectRemote });
/** This qualifies a returned opaque prototype for descriptor traversal only.
 * It never certifies the selected getter as native or calls any member. */
export function qualifyCurrentNativeSerializedOriginPrototype(input: unknown, actualRemote: unknown): void {
  const object = objectRemote.parse(capture(actualRemote)); if (object.type !== "object" || object.objectId === undefined || object.subtype !== undefined || object.value !== undefined) { throw new Error("NATIVE_SERIALIZED_ORIGIN_PROTOTYPE"); }
  const packet = z.strictObject({ result: z.array(property).max(512), internalProperties: z.array(parent).max(1).optional() }).parse(capture(input)); const names = new Set<string>(); for (const item of packet.result) { if (names.has(item.name) || [item.value, item.get, item.set].some(value => value?.subtype === "proxy")) { throw new Error("NATIVE_SERIALIZED_ORIGIN_PROTOTYPE"); } names.add(item.name); }
}
