/** Dormant fixed raw-String observation leaf. This is not registered transport.
 * The caller must retain the source/location-admitted Save-handler scope and
 * original callback handle. Supplied scope-shaped objects grant no authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_RESULT_BYTES = 65_536;
const MAX_STRINGS = 16;

/** Runtime.callFunctionOn, returnByValue:true, throwOnSideEffect:true,
 * silent:true, awaitPromise:false, generatePreview:false, userGesture:false.
 * Sole argument is the original internally retained callback remote handle.
 * No getters, vendor methods, source export, shape reconstruction or mutation.
 * Source: PCB217199c8, bo/U4@3988808, rd@3980353, U8@3967919,
 * ib@3968202, nP@3424326, iu@7946809, Jr/t7@7959342.
 */
export const CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION = `function(originalCallback){
"use strict";
const bad=()=>{throw new Error("PCB_DIAGNOSTIC_RAW_STRINGS_STATE");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
const number=v=>{if(typeof v!=="number"||!Number.isFinite(v)||Object.is(v,-0)||Math.abs(v)>1e11)bad();return v;};
const integer=v=>{number(v);if(!Number.isSafeInteger(v))bad();return v;};
const flag=v=>{if(typeof v!=="boolean")bad();return v;};
const text=(v,n)=>{if(typeof v!=="string"||v.length>n||!v.isWellFormed())bad();return v;};
const id=v=>{text(v,32);if(!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad();return v;};
const marker=(o,k,copy)=>{let d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.getOwnPropertyDescriptor(p,k))bad();p=Object.getPrototypeOf(p);}return {kind:"absent"};}if(!Object.hasOwn(d,"value"))bad();const v=d.value;if(v===undefined)return {kind:"undefined"};if(v===null)return {kind:"null"};return {kind:"value",value:copy(v)};};
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object"));
const klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,"prototype"))bad();return o;};
const envClass=klass("x"),managerClass=klass("bo"),env=instance(own(envClass,"env"),envClass),manager=instance(own(managerClass,"manager"),managerClass);
const viewManager=instance(own(scope,"Jr"),klass("t7"));
if(own(env,"_doctype")!==3||own(viewManager,"mgr")!==manager)bad();
const documentUuid=id(own(env,"_id")),map=object(own(manager,"map"));
if(Object.getPrototypeOf(map)!==Map.prototype||Reflect.ownKeys(map).length!==0)bad();
const sizeDescriptor=Object.getOwnPropertyDescriptor(Map.prototype,"size");
if(!sizeDescriptor||typeof sizeDescriptor.get!=="function"||sizeDescriptor.set!==undefined)bad();
const size=()=>Reflect.apply(sizeDescriptor.get,map,[]);
const count=integer(size());if(count<0||count>${MAX_STRINGS})bad();
const point=v=>{instance(v,klass("S"));return {x:number(own(v,"x")),y:number(own(v,"y"))};};
const color=v=>{instance(v,klass("ee"));return {r:number(own(v,"r")),g:number(own(v,"g")),b:number(own(v,"b")),alpha:number(own(v,"alpha"))};};
const noParent=()=>{bad();};
const box=v=>{instance(v,klass("Ls"));return {layerId:integer(own(v,"_layerId")),locked:flag(own(v,"_locked")),leftLow:point(own(v,"_leftLow")),leftUp:point(own(v,"_leftUp")),rightLow:point(own(v,"_rightLow")),rightUp:point(own(v,"_rightUp"))};};
const watcher=(v,model)=>{instance(v,klass("yr"));if(own(v,"model")!==model)bad();return "reciprocal-yr";};
const scalar=v=>typeof v==="string"?text(v,128):integer(v);
const base=v=>{
object(v);const prototype=Object.getPrototypeOf(v),kind=prototype===own(klass("U8"),"prototype")?"U8":prototype===own(klass("ib"),"prototype")?"ib":null;if(kind===null)bad();
return {kind,num:integer(own(v,"num")),type:integer(own(v,"type")),origin:integer(own(v,"origin")),strokeWidth:number(own(v,"strokeWidth")),mirror:flag(own(v,"mirror")),showKey:flag(own(v,"showKey")),showValue:flag(own(v,"showValue")),fontFamily:text(own(v,"fontFamily"),256),fontSize:number(own(v,"fontSize")),reverse:flag(own(v,"reverse")),reverseExpansion:number(own(v,"reverseExpansion")),positionIsNull:flag(own(v,"positionIsNull")),silkColor:marker(v,"silkColor",color),layerId:marker(v,"_layerId",integer),locked:marker(v,"_locked",flag)};
};
const models=[],originals=[],seen=new Set(),iterator=Reflect.apply(own(Map.prototype,"entries"),map,[]),next=own(Object.getPrototypeOf(iterator),"next");
if(typeof next!=="function")bad();
for(let index=0;index<count;index++){
const entry=Reflect.apply(next,iterator,[]);if(own(entry,"done")!==false)bad();
const pair=own(entry,"value");if(!Array.isArray(pair)||Object.getPrototypeOf(pair)!==Array.prototype||own(pair,"length")!==2||Reflect.ownKeys(pair).length!==3)bad();
const model=instance(own(pair,"1"),klass("rd")),globalIndex=id(own(model,"_globalIndex"));
if(own(pair,"0")!==globalIndex||seen.has(globalIndex)||own(model,"modelType")!=="Text")bad();seen.add(globalIndex);
const nativeBase=own(model,"base"),position=own(model,"_position"),stateWatcher=marker(model,"_stateWatcher",v=>watcher(v,model));
const snapshot={globalIndex,modelType:"Text",zIndex:marker(model,"_zIndex",integer),partition:marker(model,"_partition",v=>text(v,128)),groupId:marker(model,"_groupID",scalar),parent:marker(model,"_parent",noParent),number:marker(model,"_number",integer),dataState:integer(own(model,"_dataState")),matrixChange:flag(own(model,"_matrixChange")),key:text(own(model,"_key"),256),value:text(own(model,"_value"),1024),position:point(position),rotation:number(own(model,"_rotation")),base:base(nativeBase),box:marker(model,"_box",box),stateWatcher};
if(snapshot.key!==""||snapshot.base.kind==="U8"&&(snapshot.base.layerId.kind!=="absent"||snapshot.base.locked.kind!=="absent")||snapshot.base.kind==="ib"&&(snapshot.base.layerId.kind!=="value"||snapshot.base.locked.kind!=="value"))bad();
models.push(snapshot);originals.push([globalIndex,model,nativeBase,position]);
}
if(own(Reflect.apply(next,iterator,[]),"done")!==true||size()!==count)bad();
for(const item of originals){if(Reflect.apply(own(Map.prototype,"get"),map,[item[0]])!==item[1]||own(item[1],"base")!==item[2]||own(item[1],"_position")!==item[3])bad();}
if(own(envClass,"env")!==env||own(managerClass,"manager")!==manager||own(manager,"map")!==map||own(scope,"Jr")!==viewManager||own(viewManager,"mgr")!==manager||own(env,"_id")!==documentUuid||own(env,"_doctype")!==3)bad();
const output=JSON.stringify({schema:"easyeda-pro-control.pcb-diagnostic-raw-strings.v1",documentUuid,managerModelCount:count,models});
let bytes=0;for(let index=0;index<output.length;index++){const c=output.charCodeAt(index);if(c<128)bytes++;else if(c<2048)bytes+=2;else if(c>=55296&&c<=56319){bytes+=4;index++;}else bytes+=3;if(bytes>${CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_RESULT_BYTES})bad();}
return output;
}`;
export const CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION_SHA256 = createHash("sha256")
  .update(CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION).digest("hex");

const finite = z.number().min(-1e11).max(1e11).refine(value => !Object.is(value, -0));
const integer = finite.refine(Number.isSafeInteger);
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const rawText = z.string().refine(value => value.isWellFormed());
const missing = z.object({ kind: z.enum(["absent", "undefined", "null"]) }).strict();
function marked<T extends z.ZodType>(value: T): z.ZodUnion<readonly [typeof missing, z.ZodObject<{
  kind: z.ZodLiteral<"value">; value: T;
}, z.core.$strict>]> {
  return z.union([missing, z.object({ kind: z.literal("value"), value }).strict()]);
}
const point = z.object({ x: finite, y: finite }).strict();
const color = z.object({ r: finite, g: finite, b: finite, alpha: finite }).strict();
const groupId = z.union([rawText.max(128), integer]);
const box = z.object({ layerId: integer, locked: z.boolean(), leftLow: point, leftUp: point, rightLow: point, rightUp: point }).strict();
const base = z.object({
  kind: z.enum(["U8", "ib"]), num: integer, type: integer, origin: integer, strokeWidth: finite,
  mirror: z.boolean(), showKey: z.boolean(), showValue: z.boolean(), fontFamily: rawText.max(256),
  fontSize: finite, reverse: z.boolean(), reverseExpansion: finite, positionIsNull: z.boolean(),
  silkColor: marked(color),
  layerId: marked(integer), locked: marked(z.boolean()),
}).strict().refine(value => value.kind === "U8" ? value.layerId.kind === "absent" && value.locked.kind === "absent" :
  value.layerId.kind === "value" && value.locked.kind === "value");
const model = z.object({
  globalIndex: identifier, modelType: z.literal("Text"), zIndex: marked(integer), partition: marked(rawText.max(128)),
  groupId: marked(groupId), parent: missing, number: marked(integer),
  dataState: integer, matrixChange: z.boolean(), key: z.literal(""), value: rawText.max(1024),
  position: point, rotation: finite, base,
  box: marked(box),
  stateWatcher: marked(z.literal("reciprocal-yr")),
}).strict();
const state = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-raw-strings.v1"),
  documentUuid: identifier, managerModelCount: z.number().int().min(0).max(MAX_STRINGS),
  models: z.array(model).max(MAX_STRINGS) }).strict().refine(value =>
  value.models.length === value.managerModelCount && new Set(value.models.map(item => item.globalIndex)).size === value.models.length);
const LIMITS = Object.freeze({ originalScopeVerified: false, liveReceiverVerified: false, sourceOwnershipVerified: false,
  completeModelMembershipVerified: false, completeGeometryVerified: false, completeLiveBaselineVerified: false,
  emptyRootPcbVerified: false, queueCompletionVerified: false, persistenceVerified: false, writerSupported: false,
  executionAuthorized: false, nativeIntrinsicsVerified: false, continuousObservation: false } as const);
export type CurrentPcbDiagnosticRawStrings = Readonly<z.infer<typeof state>> & typeof LIMITS;

function refuse(): never { throw new Error("PCB_DIAGNOSTIC_RAW_STRINGS_REPLY"); }
function record(input: unknown, fields: readonly string[]): Readonly<Record<string, unknown>> {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input)) { return refuse(); }
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null || keys.length !== fields.length ||
      keys.some(key => typeof key !== "string" || !fields.includes(key))) { return refuse(); }
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    result[key] = descriptor.value as unknown;
  }
  return result;
}
/** Validates bounded supplied bytes only. A decoded sample is not a live
 * ownership token, a whole-PCB baseline or source/persistence evidence. */
export function decodeCurrentPcbDiagnosticRawStringsReply(input: unknown): CurrentPcbDiagnosticRawStrings {
  const reply = record(input, ["result"]), result = record(reply["result"], ["type", "value"]);
  const raw = result["value"];
  if (result["type"] !== "string" || typeof raw !== "string" || !raw.isWellFormed() ||
      Buffer.byteLength(raw, "utf8") > CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_RESULT_BYTES) { return refuse(); }
  try {
    const parsed = decodeCurrentPcbDiagnosticJson(Buffer.from(raw, "utf8"));
    return freezeDeep({ ...state.parse(parsed), ...LIMITS });
  }
  catch { return refuse(); }
}
