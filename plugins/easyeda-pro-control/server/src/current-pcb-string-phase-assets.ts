/** Phase-specific default-text base/cache relation. No transport, writer, Save,
 * vendor getter, lazy constructor or glyph generator is invoked. PCB217199c8:
 * Ni3172840, U83967919, F43968479/df3973852, i_3978571,
 * yie/Am3979345, rd3980349.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION, decodeCurrentPcbStringEmptyAssets } from "./current-pcb-string-empty-assets.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import type { CURRENT_PCB_STRING_OBSERVATION_LIMITS } from "./current-pcb-string-observation-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

// F4.get's complete fixed scalar key, including ee.toString's black spelling.
// Wj is the native MD5 cache-key implementation, not a security identity.
export const CURRENT_PCB_STRING_DEFAULT_BASE_KEY = "0/false/true/default/12/3/0.8/false/0/false/false/#000000/";
export const CURRENT_PCB_STRING_DEFAULT_BASE_ID = "ecf7a782c8fad079e96715e80471d2d2";
type Phase = "baseline" | "created" | "saved";
function program(phase: Phase): string {
  const count = phase === "baseline" ? 0 : 1;
  return `function(originalCallback,constructors){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),"prototype"))bad();return o;};
const env=instance(own(klass("x"),"env"),"x"),documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,"_doctype")!==3)bad();
const strings=instance(own(klass("bo"),"manager"),"bo"),stringMap=own(strings,"map");
if(size(stringMap,Map.prototype)!==${count})bad();
const textBase=own(klass("df"),"mgr");let textBaseManager=null,primitiveId=null,base=null,model=null;
const exactKeys=(o,wanted)=>{const actual=Reflect.ownKeys(o);if(actual.length!==wanted.length||actual.some(k=>typeof k!=="string"||!wanted.includes(k)))bad();};
const get=own(Map.prototype,"get");if(typeof get!=="function")bad();
const baseId=${JSON.stringify(CURRENT_PCB_STRING_DEFAULT_BASE_ID)},baseKey=${JSON.stringify(CURRENT_PCB_STRING_DEFAULT_BASE_KEY)};
if(textBase!==null){
instance(textBase,"df");exactKeys(textBase,["map","_last","uuidMap"]);
if(own(textBase,"_last")!==undefined)bad();
const map=own(textBase,"map"),uuidMap=plain(own(textBase,"uuidMap"));
if(size(map,Map.prototype)!==${count})bad();
if(${count}===0){emptyObject(uuidMap);textBaseManager={count:0,baseId:null,baseKey:null,last:"undefined"};}
else{
exactKeys(uuidMap,[baseKey]);if(own(uuidMap,baseKey)!==baseId)bad();
base=instance(Reflect.apply(get,map,[baseId]),"U8");
const expected={num:1,type:0,origin:3,strokeWidth:.8,mirror:false,showKey:false,showValue:true,fontFamily:"default",fontSize:12,reverse:false,reverseExpansion:0,positionIsNull:false};
exactKeys(base,[...Object.keys(expected),"silkColor"]);for(const key of Object.keys(expected))if(!Object.is(own(base,key),expected[key]))bad();
const color=instance(own(base,"silkColor"),"ee");exactKeys(color,["r","g","b","alpha"]);
for(const key of ["r","g","b"])if(!Object.is(own(color,key),0))bad();if(!Object.is(own(color,"alpha"),1))bad();
const iterator=Reflect.apply(own(Map.prototype,"entries"),stringMap,[]),next=own(Object.getPrototypeOf(iterator),"next");
if(typeof next!=="function")bad();const entry=Reflect.apply(next,iterator,[]);if(own(entry,"done")!==false)bad();
const pair=own(entry,"value");if(arraySize(pair)!==2)bad();primitiveId=id(own(pair,"0"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
model=instance(own(pair,"1"),"rd");if(own(model,"_globalIndex")!==primitiveId||own(model,"modelType")!=="Text"||own(model,"base")!==base)bad();
if(own(Reflect.apply(next,iterator,[]),"done")!==true)bad();
if(Reflect.apply(get,map,[baseId])!==base||Reflect.apply(get,stringMap,[primitiveId])!==model)bad();
textBaseManager={count:1,baseId,baseKey,last:"undefined"};
}}
if(${count}===1&&textBaseManager===null)bad();
const emptyAssetsJson=(${CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION}).call(this,originalCallback,constructors);
verify();if(base!==null&&(Reflect.apply(get,own(textBase,"map"),[baseId])!==base||Reflect.apply(get,stringMap,[primitiveId])!==model))bad();
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-phase-assets.v1",phase:${JSON.stringify(phase)},documentUuid,primitiveId,textBaseManager,emptyAssetsJson});
}`;
}
export const CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS = Object.freeze({
  baseline: program("baseline"), created: program("created"), saved: program("saved"),
});
export const CURRENT_PCB_STRING_PHASE_ASSETS_SHA256 = Object.freeze({
  baseline: createHash("sha256").update(CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS.baseline).digest("hex"),
  created: createHash("sha256").update(CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS.created).digest("hex"),
  saved: createHash("sha256").update(CURRENT_PCB_STRING_PHASE_ASSETS_FUNCTIONS.saved).digest("hex"),
});
const identifier = z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const zero = z.object({ count: z.literal(0), baseId: z.null(), baseKey: z.null(), last: z.literal("undefined") }).strict();
const one = z.object({ count: z.literal(1), baseId: z.literal(CURRENT_PCB_STRING_DEFAULT_BASE_ID),
  baseKey: z.literal(CURRENT_PCB_STRING_DEFAULT_BASE_KEY), last: z.literal("undefined") }).strict();
const schema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-phase-assets.v1"),
  phase: z.enum(["baseline", "created", "saved"]), documentUuid: identifier, primitiveId: identifier.nullable(),
  textBaseManager: z.union([zero, one, z.null()]), emptyAssetsJson: z.string().max(8192),
}).strict().refine(value => value.phase === "baseline" ? value.primitiveId === null && value.textBaseManager?.count !== 1 :
  value.primitiveId !== null && value.textBaseManager?.count === 1);
const LIMITS = Object.freeze({ phaseLabelProvesDispatch: false, completeStoredAssetsVerified: false,
  pendingAssetLoadsVerified: false, completeGeometryVerified: false, nativeSaveEffectVerified: false,
  persistenceVerified: false, continuousObservation: false, connectedValidation: false, writerSupported: false } as const);
export type CurrentPcbStringPhaseAssets = Readonly<z.infer<typeof schema>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS &
  typeof LIMITS & Readonly<{ assets: ReturnType<typeof decodeCurrentPcbStringEmptyAssets> }>;
export function decodeCurrentPcbStringPhaseAssets(input: unknown): CurrentPcbStringPhaseAssets {
  const state = decodeCurrentPcbStringObservation(input, schema);
  const assets = decodeCurrentPcbStringEmptyAssets({ result: { type: "string", value: state.emptyAssetsJson } });
  if (assets.documentUuid !== state.documentUuid) { throw new Error("PCB_STRING_PHASE_ASSETS_DOCUMENT"); }
  return freezeDeep({ ...state, assets, ...LIMITS });
}
function need(value: boolean): asserts value {
  if (!value) { throw new Error("PCB_STRING_PHASE_ASSETS_RELATION"); }
}
function rawRelation(input: unknown, state: CurrentPcbStringPhaseAssets): string {
  const raw = decodeCurrentPcbDiagnosticRawStringsReply(input);
  const model = raw.models[0];
  need(raw.documentUuid === state.documentUuid && raw.managerModelCount === 1 && model !== undefined &&
    model.globalIndex === state.primitiveId && model.modelType === "Text" && model.key === "" &&
    /^[\u0020-\u007E]{1,256}$/u.test(model.value) && /[\u0021-\u007E]/u.test(model.value));
  const { base } = model;
  need(base.kind === "U8" && base.num === 1 && base.type === 0 && base.origin === 3 && base.strokeWidth === 0.8 &&
    !base.mirror && !base.showKey && base.showValue && base.fontFamily === "default" && base.fontSize === 12 &&
    !base.reverse && base.reverseExpansion === 0 && !base.positionIsNull && base.layerId.kind === "absent" &&
    base.locked.kind === "absent" && base.silkColor.kind === "value" && base.silkColor.value.r === 0 &&
    base.silkColor.value.g === 0 && base.silkColor.value.b === 0 && base.silkColor.value.alpha === 1);
  return sha256Text(canonicalJson(raw));
}

/** Only a supplied-data relation. Phase labels are generated program constants,
 * not proof that create or Save ran. The caller still needs original-owner,
 * whole-model, producer, geometry, complete stored-asset and persistence proof.
 */
export interface CurrentPcbStringPhaseAssetRelation extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-phase-assets-relation.v1";
  readonly suppliedPhaseAssetRelationMatches: true;
  readonly documentUuid: string;
  readonly primitiveId: string;
  readonly baselineTextBaseInitialized: boolean;
  readonly beforeBaseCount: 0;
  readonly afterBaseCount: 1;
  readonly baselineProjectionSha256: string;
  readonly createdProjectionSha256: string;
  readonly savedProjectionSha256: string;
  readonly createdRawProjectionSha256: string;
  readonly savedRawProjectionSha256: string;
  readonly relationSha256: string;
  readonly executionAuthorized: false;
}
export function compareCurrentPcbStringPhaseAssets(baselineReply: unknown, createdReply: unknown, savedReply: unknown,
  createdRawReply: unknown, savedRawReply: unknown): CurrentPcbStringPhaseAssetRelation {
  const baseline = decodeCurrentPcbStringPhaseAssets(baselineReply), created = decodeCurrentPcbStringPhaseAssets(createdReply),
    saved = decodeCurrentPcbStringPhaseAssets(savedReply);
  need(baseline.phase === "baseline" && created.phase === "created" && saved.phase === "saved" &&
    baseline.documentUuid === created.documentUuid && created.documentUuid === saved.documentUuid &&
    created.primitiveId !== null && created.primitiveId === saved.primitiveId);
  need(canonicalJson(baseline.assets) === canonicalJson(created.assets) && canonicalJson(created.assets) === canonicalJson(saved.assets));
  const relation = { documentUuid: created.documentUuid, primitiveId: created.primitiveId,
    baselineTextBaseInitialized: baseline.textBaseManager !== null, beforeBaseCount: 0, afterBaseCount: 1,
    baselineProjectionSha256: sha256Text(canonicalJson(baseline)), createdProjectionSha256: sha256Text(canonicalJson(created)),
    savedProjectionSha256: sha256Text(canonicalJson(saved)), createdRawProjectionSha256: rawRelation(createdRawReply, created),
    savedRawProjectionSha256: rawRelation(savedRawReply, saved) } as const;
  return freezeDeep({ profile: "private.current-pcb-string-phase-assets-relation.v1", suppliedPhaseAssetRelationMatches: true,
    ...relation, relationSha256: sha256Text(canonicalJson(relation)), ...LIMITS, executionAuthorized: false });
}
