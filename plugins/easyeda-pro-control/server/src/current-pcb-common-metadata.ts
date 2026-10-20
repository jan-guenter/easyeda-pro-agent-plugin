/** Dormant descriptor-only compiler document detail in PCB217199c8.
 * Zu@getDocDetail3194711 returns docDetail assigned by onDocDetail3199775.
 * O8e@3122060 selects five META fields; this module never calls those methods.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { sha256Json, sha256Text } from "./core.ts";
import { CURRENT_PCB_COMMON_GRAPH_LIMITS, CURRENT_PCB_COMMON_PLAIN_GRAPH_PROGRAM,
  currentPcbCommonGraphSchema, decodeCurrentPcbCommonGraph } from "./current-pcb-common-graph.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const META_FIELDS = ["title", "parent", "source", "board", "zIndex"] as const;

/** One callFunctionOn on the source/location-qualified original Save handler's
 * scope zero, with its retained callback as the sole argument. Require silent,
 * throwOnSideEffect and returnByValue; awaitPromise/userGesture/preview false.
 * This does not expose caller JavaScript or independently qualify that scope.
 */
export const CURRENT_PCB_COMMON_METADATA_FUNCTION = `function(originalCallback){
"use strict";const bad=()=>{throw new Error("PCB_COMMON_METADATA");};
const retained=[],prototypes=[],absent=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||retained.length>=32768)bad();retained.push([o,k,d]);return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,n)=>{object(o);const p=own(klass(n),"prototype");if(Object.getPrototypeOf(o)!==p)bad();prototypes.push([o,p]);return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();prototypes.push([o,p]);return o;};
const noOwn=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const id=(v,p)=>{if(typeof v!=="string"||!p.test(v))bad();return v;};
const env=instance(own(klass("x"),"env"),"x"),compiler=instance(own(env,"_compiler"),"Zu");
const base=instance(own(compiler,"base"),"A8e"),consistency=instance(own(base,"consistencyManager"),"sCe");
const documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),projectUuid=id(own(base,"path"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/);
const compilerUniqueId=id(own(consistency,"unique"),/^[a-f0-9]{16}$/);
if(own(env,"_doctype")!==3||own(env,"_tabId")!==documentUuid+"@"+projectUuid||own(compiler,"uuid")!==documentUuid||
own(base,"uuid")!==documentUuid||own(compiler,"project")!==projectUuid||own(compiler,"isProject")!==true||
own(base,"isProject")!==true||own(base,"_headType")!=="PCB"||own(compiler,"consistencyManager")!==consistency)bad();
noOwn(env,["compiler","projectId"]);noOwn(compiler,["getDocDetail"]);
const channel=instance(own(env,"compilerChannel"),"mCe");if(own(base,"channel")!==channel)bad();
const registry=plain(own(channel,"compiler")),map=own(registry,"PCB");
${CURRENT_PCB_COMMON_PLAIN_GRAPH_PROGRAM}
const entries=graphCollection(map,Map.prototype),matches=entries.filter(e=>e[0]===compilerUniqueId||e[1]===base);
if(matches.length!==1||matches[0][0]!==compilerUniqueId||matches[0][1]!==base)bad();
const detail=plain(own(compiler,"docDetail"));for(const name of ${JSON.stringify(META_FIELDS)})own(detail,name);
const graph={roots:[["docDetail",graphValue(detail)]],nodes:graphNodes};
graphVerify();
for(const [o,k,p] of retained){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}
for(const [o,p] of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k] of absent)if(Object.getOwnPropertyDescriptor(o,k))bad();
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const text=JSON.stringify({schema:"easyeda-pro-control.pcb-common-metadata.v1",documentUuid,projectUuid,compilerUniqueId,ownerPublicShadowsAbsent:true,graph});
if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}return text;
}`;

type Graph = z.infer<typeof currentPcbCommonGraphSchema>;
type Value = Graph["roots"][number][1];
type ObjectNode = Extract<Graph["nodes"][number], { kind: "object" }>;
function detailNode(graph: Graph): ObjectNode | undefined {
  const root = graph.roots[0];
  if (graph.roots.length !== 1 || root?.[0] !== "docDetail" || root[1][0] !== "ref") { return undefined; }
  const node = graph.nodes[root[1][1]];
  return node?.kind === "object" && (node.className === "plain" || node.className === "null") ? node : undefined;
}
const metadataSchema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-common-metadata.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  compilerUniqueId: z.string().regex(/^[a-f\d]{16}$/u), ownerPublicShadowsAbsent: z.literal(true),
  graph: currentPcbCommonGraphSchema.refine(graph => {
    const detail = detailNode(graph);
    return detail !== undefined && detail.enumerableKeys !== undefined && detail.jsonToJSONAbsent !== undefined &&
      graph.nodes.every(node => node.kind !== "object" || node.className === "plain" || node.className === "null") &&
      META_FIELDS.every(name => detail.fields.some(field => field[0] === name));
  }),
}).strict();
export type CurrentPcbCommonMetadata = Readonly<z.infer<typeof metadataSchema>> & typeof CURRENT_PCB_COMMON_GRAPH_LIMITS;
export function decodeCurrentPcbCommonMetadata(input: unknown): CurrentPcbCommonMetadata {
  return decodeCurrentPcbCommonGraph(input, metadataSchema);
}
export const CURRENT_PCB_COMMON_METADATA_PROGRAM_SHA256 = createHash("sha256").update(CURRENT_PCB_COMMON_METADATA_FUNCTION).digest("hex");

const ENCODING_LIMITS = Object.freeze({ ...CURRENT_PCB_COMMON_GRAPH_LIMITS, atomicSnapshotVerified: false,
  completeStoredBaselineVerified: false, nativeNoMutationVerified: false, completeEffectVerified: false,
  headerSourceMatched: false } as const);
export interface CurrentPcbCommonMetadataEncoding extends Readonly<typeof ENCODING_LIMITS> {
  readonly profile: "private.current-pcb-common-metadata-encoding.v1";
  readonly documentUuid: string; readonly projectUuid: string; readonly compilerUniqueId: string;
  readonly dataType: "META"; readonly id: "META"; readonly bodyText: string; readonly bodySha256: string;
  readonly rawGraphSha256: string;
}
function scalar(value: Value | undefined): string | number | boolean | null | undefined {
  if (value?.[0] === "string" || value?.[0] === "boolean") { return value[1]; }
  if (value?.[0] === "number") { return Number(value[1]); }
  if (value?.[0] === "null") { return null; }
  if (value?.[0] === "undefined") { return undefined; }
  throw new Error("PCB_COMMON_METADATA_ENCODING: own scalar fields required");
}
function nativeIndex(value: ReturnType<typeof scalar>): Exclude<ReturnType<typeof scalar>, undefined> {
  // O8e uses ||, not ??: zero, false and empty text all become null. The
  // Decoded scalar subset excludes NaN, so these are every native falsy case.
  return value === undefined || value === null || value === false || value === "" || value === 0 ? null : value;
}

/** Pure selected META-body relation, not DOCHEAD or ordinary-root admission.
 * O8e.metaData reads named own fields even when non-enumerable. Preserve the
 * exact order, own-undefined omission and zIndex||null branch. Unknown fields
 * stay in the raw graph hash. Structured values refuse instead of calling any
 * serializer. Missing fields refuse rather than assuming inherited absence.
 */
export function encodeCurrentPcbCommonMetadata(input: unknown): CurrentPcbCommonMetadataEncoding {
  const observed = decodeCurrentPcbCommonMetadata(input);
  const detail = detailNode(observed.graph);
  if (detail === undefined) { throw new Error("PCB_COMMON_METADATA_ENCODING: document detail required"); }
  const values = META_FIELDS.map(name => scalar(detail.fields.find(field => field[0] === name)?.[1]));
  const bodyText = JSON.stringify({ title: values[0], parent: values[1], source: values[2], board: values[3], zIndex: nativeIndex(values[4]) });
  return freezeDeep({ profile: "private.current-pcb-common-metadata-encoding.v1", documentUuid: observed.documentUuid,
    projectUuid: observed.projectUuid, compilerUniqueId: observed.compilerUniqueId, dataType: "META", id: "META",
    bodyText, bodySha256: sha256Text(bodyText), rawGraphSha256: sha256Json(observed.graph), ...ENCODING_LIMITS });
}
