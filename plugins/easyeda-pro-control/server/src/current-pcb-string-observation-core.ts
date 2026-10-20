/** Fixed-program helpers for dormant String observations. No transport or owner. */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_OBSERVATION_BYTES = 16_384;
export const CURRENT_PCB_STRING_OBSERVATION_LIMITS = Object.freeze({
  originalOwnerVerified: false, nativeIntrinsicsVerified: false, projectWorkerAssociationVerified: false,
  completeLiveBaselineVerified: false, queueCompletionVerified: false, publicationDelivered: false,
  saveAuthorized: false, executionAuthorized: false,
} as const);
export const currentPcbStringMarkerSchema = z.enum(["absent", "undefined", "null", "present"]);
export const currentPcbStringCountSchema = z.number().int().min(0).max(65_536).refine(value => !Object.is(value, -0));

/** Each reader runs with throwOnSideEffect. Descriptor checks cannot independently
 * exclude proxies or prove pristine intrinsics. Absent fields reject inherited
 * substitutes. Rechecks cover retained references, not asynchronous completion. */
export const CURRENT_PCB_STRING_OBSERVATION_GUARDS = `
"use strict";
const bad=()=>{throw new Error("PCB_STRING_OBSERVATION_STATE");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return "absent";}const v=own(o,k);return v===undefined?"undefined":v===null?"null":"present";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!=="boolean")bad();return v;};
const id=(v,re)=>{if(typeof v!=="string"||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!=="string"))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,"length")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!=="length")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,"value")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};
`;

function record(input: unknown, fields: readonly string[]): Readonly<Record<string, unknown>> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) {
    throw new Error("PCB_STRING_OBSERVATION_REPLY");
  }
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== fields.length ||
      keys.some(key => typeof key !== "string" || !fields.includes(key))) { throw new Error("PCB_STRING_OBSERVATION_REPLY"); }
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("PCB_STRING_OBSERVATION_REPLY"); }
    result[key] = descriptor.value as unknown;
  }
  return result;
}

/** Only fixed-reader callers supply the schema. Remote exceptions, handles,
 * duplicate JSON keys and hostile result descriptors all refuse. */
export function decodeCurrentPcbStringObservation<T extends z.ZodType<Record<string, unknown>>>(input: unknown, schema: T):
Readonly<z.infer<T>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS {
  const wrapper = record(input, ["result"]);
  const result = record(wrapper["result"], ["type", "value"]);
  const raw = result["value"];
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw) > CURRENT_PCB_STRING_OBSERVATION_BYTES) { throw new Error("PCB_STRING_OBSERVATION_REPLY"); }
  try {
    const parsed = decodeCurrentPcbDiagnosticJson(Buffer.from(raw)), state = schema.parse(parsed);
    return freezeDeep({ ...state, ...CURRENT_PCB_STRING_OBSERVATION_LIMITS });
  } catch { throw new Error("PCB_STRING_OBSERVATION_REPLY"); }
}
