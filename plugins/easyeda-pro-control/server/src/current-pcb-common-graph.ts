/** Bounded own-data graph used only by fixed PCB common-state readers.
 * References preserve aliasing, Map/Set order and undefined/-0 without calling
 * model getters, toJSON, serializers or constructors. This is not source data.
 */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_COMMON_GRAPH_BYTES = 524_288;
export const CURRENT_PCB_COMMON_GRAPH_CLASSES = [
  "S", "ee", "Ke", "WA", "Ff", "HA", "te", "Wre", "xI", "fj", "Ky", "nC", "cR", "E8",
  "i2", "tR", "rR", "Jx", "Yre", "zre", "aR", "eR", "O8", "Qx", "KCe", "lR", "sR", "hR", "zi", "Ll",
] as const;

/** Internal text fragment, not a program or caller-configurable serializer.
 * Fixed readers define own/object/klass/scope before this fragment. Original
 * class prototypes are selected by literal names from the admitted scope.
 * All runtime calls must retain throwOnSideEffect:true. Descriptor checks alone
 * cannot exclude Proxy traps or establish pristine intrinsics.
 */
function graphProgram(classNames: readonly string[]): string {
  return `
const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=${JSON.stringify(classNames)};
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),"prototype")]);
const graphString=v=>{if(typeof v!=="string"||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!=="string"))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,"toJSON");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,"entries"),o,[]),next=own(Object.getPrototypeOf(iterator),"next"),items=[];if(typeof next!=="function")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);if(own(e,"done")!==false)bad();const pair=own(e,"value");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,"0"),own(pair,"1")]);}if(own(Reflect.apply(next,iterator,[]),"done")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
if(depth>32)bad();if(v===null)return["null"];if(v===undefined)return["undefined"];
if(typeof v==="boolean")return["boolean",v];if(typeof v==="string")return["string",graphString(v)];
if(typeof v==="number"){if(!Number.isFinite(v))bad();return["number",Object.is(v,-0)?"-0":String(v)];}
if(typeof v!=="object")bad();if(graphSeen.has(v))return["ref",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:"map",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:"set",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,"length");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!=="length")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:"array",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?"null":p===Object.prototype?"plain":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:"object",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return["ref",index];};
const graphVerify=()=>{for(const h of graphHeld){if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){const present=Object.getOwnPropertyDescriptor(h[0],"toJSON")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};
`;
}
export const CURRENT_PCB_COMMON_GRAPH_PROGRAM = graphProgram(CURRENT_PCB_COMMON_GRAPH_CLASSES);
/** Fixed plain-data specialization for document metadata. It does not depend
 * On unrelated model classes being retained in V8's original lexical scope.
 * Custom instances refuse; descriptor, collection and graph limits are shared.
 */
export const CURRENT_PCB_COMMON_PLAIN_GRAPH_PROGRAM = graphProgram([]);

const indexSchema = z.number().int().min(0).max(4095).refine(value => !Object.is(value, -0));
const stringSchema = z.string().max(4096).refine(value => value.isWellFormed());
const scalarSchema = z.union([
  z.tuple([z.literal("null")]), z.tuple([z.literal("undefined")]),
  z.tuple([z.literal("boolean"), z.boolean()]), z.tuple([z.literal("string"), stringSchema]),
  z.tuple([z.literal("number"), z.string().max(32).refine(value =>
    value === "-0" || Number.isFinite(Number(value)) && String(Number(value)) === value)]),
  z.tuple([z.literal("ref"), indexSchema]),
]);
const fieldSchema = z.tuple([stringSchema, scalarSchema]);
const mapEntrySchema = z.tuple([scalarSchema, scalarSchema]);
const nodeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("object"), className: z.enum(["plain", "null", ...CURRENT_PCB_COMMON_GRAPH_CLASSES]),
    fields: z.array(fieldSchema).max(4096), enumerableKeys: z.array(stringSchema).max(4096).optional(),
    jsonToJSONAbsent: z.boolean().optional() }).strict(),
  z.object({ kind: z.literal("map"), entries: z.array(mapEntrySchema).max(4096) }).strict(),
  z.object({ kind: z.literal("set"), values: z.array(scalarSchema).max(4096) }).strict(),
  z.object({ kind: z.literal("array"), values: z.array(scalarSchema).max(4096), jsonToJSONAbsent: z.boolean().optional() }).strict(),
]);
export const currentPcbCommonGraphSchema = z.object({
  roots: z.array(z.tuple([stringSchema, scalarSchema])).min(1).max(64),
  nodes: z.array(nodeSchema).max(4096),
}).strict().superRefine((graph, context) => {
  let fieldCount = 0;
  const reachable = new Set<number>();
  const visit = (value: z.infer<typeof scalarSchema>): void => {
    if (value[0] !== "ref") { return; }
    const index = value[1];
    if (index >= graph.nodes.length) { context.addIssue({ code: "custom", message: "Missing graph reference" }); return; }
    reachable.add(index);
  };
  const unique = (keys: readonly string[]): void => {
    if (new Set(keys).size !== keys.length) { context.addIssue({ code: "custom", message: "Duplicate graph key" }); }
  };
  const nativeKey = (value: z.infer<typeof scalarSchema>): string => {
    // Map and Set normalize -0 to +0 before enumeration. A raw -0 key cannot
    // Come from these fixed intrinsic readers, even when no duplicate follows.
    if (value[0] === "number" && value[1] === "-0") {
      context.addIssue({ code: "custom", message: "Noncanonical collection zero" });
    }
    return JSON.stringify(value);
  };
  unique(graph.roots.map(entry => entry[0]));
  for (const [, value] of graph.roots) { visit(value); }
  for (const index of reachable) {
    const node = graph.nodes[index];
    if (node === undefined) { context.addIssue({ code: "custom", message: "Missing graph reference" }); return; }
    if (node.kind === "object") {
      unique(node.fields.map(entry => entry[0])); fieldCount += node.fields.length;
      if (node.enumerableKeys !== undefined) {
        unique(node.enumerableKeys);
        const enumerable = new Set(node.enumerableKeys);
        const expected = node.fields.filter(entry => enumerable.has(entry[0])).map(entry => entry[0]);
        if (expected.length !== node.enumerableKeys.length || expected.some((key, position) => key !== node.enumerableKeys?.[position])) {
          context.addIssue({ code: "custom", message: "Enumerable fields differ from captured field order" });
        }
      }
      if (node.jsonToJSONAbsent === true && node.fields.some(entry => entry[0] === "toJSON")) {
        context.addIssue({ code: "custom", message: "Contradictory toJSON absence" });
      }
      for (const [, value] of node.fields) { visit(value); }
    } else if (node.kind === "map") {
      unique(node.entries.map(entry => nativeKey(entry[0]))); fieldCount += node.entries.length * 2;
      for (const [key, value] of node.entries) { visit(key); visit(value); }
    } else {
      if (node.kind === "set") { unique(node.values.map(nativeKey)); }
      fieldCount += node.values.length;
      for (const value of node.values) { visit(value); }
    }
  }
  if (reachable.size !== graph.nodes.length || fieldCount > 32_768) {
    context.addIssue({ code: "custom", message: "Unreachable or oversized graph" });
  }
});

export const CURRENT_PCB_COMMON_GRAPH_LIMITS = Object.freeze({
  originalOwnerVerified: false, nativeIntrinsicsVerified: false, completeLiveBaselineVerified: false,
  storedSourceMatched: false, queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false,
} as const);

function record(value: unknown, fields: readonly string[]): Record<string, unknown> {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value)) {
    throw new Error("PCB_COMMON_GRAPH_REPLY");
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  const keys = Reflect.ownKeys(value);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== fields.length ||
      keys.some(key => typeof key !== "string" || !fields.includes(key))) { throw new Error("PCB_COMMON_GRAPH_REPLY"); }
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("PCB_COMMON_GRAPH_REPLY"); }
    result[key] = descriptor.value as unknown;
  }
  return result;
}

/** Shape validation grants no scope, source or original-process authority. */
export function decodeCurrentPcbCommonGraph<T extends z.ZodType<Record<string, unknown>>>(input: unknown, schema: T):
Readonly<z.infer<T>> & typeof CURRENT_PCB_COMMON_GRAPH_LIMITS {
  const wrapper = record(input, ["result"]);
  const result = record(wrapper["result"], ["type", "value"]);
  const raw = result["value"];
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw) > CURRENT_PCB_COMMON_GRAPH_BYTES) { throw new Error("PCB_COMMON_GRAPH_REPLY"); }
  try {
    const parsed = decodeCurrentPcbDiagnosticJson(Buffer.from(raw));
    return freezeDeep({ ...schema.parse(parsed), ...CURRENT_PCB_COMMON_GRAPH_LIMITS });
  } catch { throw new Error("PCB_COMMON_GRAPH_REPLY"); }
}
