/** Fixed source-qualified constructors for source-owned instances whose class
 * bindings V8 may omit from the Save closure. No constructor is called. Exact
 * script admission plus function location qualifies the body; name alone does
 * not. Profiles describe PCB217199c8, not an arbitrary class/owner selector.
 */
import { types } from "node:util";
import { z } from "zod";
import { currentPcbConstructorFailure, currentPcbConstructorFailureDetail, currentPcbConstructorFailureSchema } from "./current-pcb-constructor-failure.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_TEARDROP_OWNER_FRAGMENT } from "./current-pcb-teardrop-owner-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const NO_STATIC_FIELDS: Readonly<Record<string, number>> = Object.freeze({});
const TURN_STATIC_FIELDS: Readonly<Record<string, number>> = Object.freeze({
  FLIP_PROGRESS_RANGE: 0.8, FLIP_PROGRESS_START: 0.1, MAX_QUEUE_SIZE: 20, PROGRESS_UPDATE_INTERVAL: 10,
});
export const CURRENT_PCB_CONSTRUCTOR_PROFILES = freezeDeep({
  kde: { name: "kde", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Xe",
    lineNumber: 4627, columnNumber: 318_905, classStart: 7_922_242, classEnd: 7_925_628,
    constructorOffset: 7_922_259, sourceBytes: 3386, sourceSha256: "dcc4464b0da5bd2fd7060e37f6c0f5b8eaa931d76e127669491ad57690911d27" },
  Sfe: { name: "Sfe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Zec",
    lineNumber: 4630, columnNumber: 17_287, classStart: 9_092_139, classEnd: 9_097_834,
    constructorOffset: 9_092_156, sourceBytes: 5695, sourceSha256: "0aff9b9a95b70517d57bff33b4dc612e5413dacc8c52cbde092902ed21909ab1" },
  mpe: { name: "mpe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "jo",
    lineNumber: 4627, columnNumber: 545_949, classStart: 8_149_275, classEnd: 8_152_896,
    constructorOffset: 8_149_303, sourceBytes: 3621, sourceSha256: "074a812ccd7ce932dad23b5728c0921aeb7acdb0a6ca31f34447d2c3e786fc4d" },
  Yde: { name: "Yde", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "ze",
    lineNumber: 4627, columnNumber: 360_596, classStart: 7_963_922, classEnd: 7_969_994,
    constructorOffset: 7_963_950, sourceBytes: 6072, sourceSha256: "7ec033b0b25943300f005a4c33e92ba8b0891b6caf420a6d99ff03ca1016f712" },
  HSe: { name: "HSe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "h_",
    lineNumber: 3641, columnNumber: 496_349, classStart: 4_352_370, classEnd: 4_352_484,
    constructorOffset: 4_352_387, sourceBytes: 114, sourceSha256: "83ab14b30051411faafecb86c09c5bd755fd5cec1ad229e13e1a4220f788ff3b" },
  USe: { name: "USe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "aE",
    lineNumber: 3641, columnNumber: 495_949, classStart: 4_351_970, classEnd: 4_352_365,
    constructorOffset: 4_351_987, sourceBytes: 395, sourceSha256: "db3cd6007d938af6b962a8c2fc2bb2b94d65cd5a43f3795d20616315b081b2eb" },
  Yme: { name: "Yme", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Me",
    lineNumber: 91_819, columnNumber: 19_324, classStart: 10_162_265, classEnd: 10_173_663,
    constructorOffset: 10_162_282, sourceBytes: 11_398, sourceSha256: "a893d9de2b624033405f92faed96c9729a9807de0b7bc1bafc54539e764c0387" },
  Nfe: { name: "Nfe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "ce",
    lineNumber: 4630, columnNumber: 119_942, classStart: 9_194_794, classEnd: 9_208_479,
    constructorOffset: 9_194_811, sourceBytes: 13_685, sourceSha256: "3559f6df2d12906a458ce9b527ba3f263ab2d2a5bbfc4880efe3df266ad37fb9" },
  Epe: { name: "Epe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "rt",
    lineNumber: 4627, columnNumber: 618_972, classStart: 8_222_309, classEnd: 8_230_254,
    constructorOffset: 8_222_326, sourceBytes: 7945, sourceSha256: "67d0d67dadd36e3c6a732a5254e385bb2f958c58f69f2f096354869fa5254409" },
  GSe: { name: "GSe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "id",
    lineNumber: 3641, columnNumber: 387_988, classStart: 4_244_026, classEnd: 4_244_134,
    constructorOffset: 4_244_026, sourceBytes: 108, sourceSha256: "55137181bc2f0dc7cbdfabed5256009ebaa7f15798742166c883890c426a6f4d" },
  Jse: { name: "Jse", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Si",
    lineNumber: 3641, columnNumber: 1_991_682, classStart: 5_847_703, classEnd: 5_856_091,
    constructorOffset: 5_847_720, sourceBytes: 8388, sourceSha256: "cd5a5a28e6c03674d2137fa84edaf62e424cf1e1c60d8336b6ad87464ef3c097" },
  Lpe: { name: "Lpe", parameterCount: 1, staticFields: NO_STATIC_FIELDS, owner: "$0",
    lineNumber: 4627, columnNumber: 696_135, classStart: 8_299_461, classEnd: 8_307_862,
    constructorOffset: 8_299_489, sourceBytes: 8401, sourceSha256: "0c3f93fe8ec922fb255ebd29710f1cfead21ca9056e6caa7179c98023f79371e" },
  Kme: { name: "Kme", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Pi",
    lineNumber: 91_819, columnNumber: 44_548, classStart: 10_187_489, classEnd: 10_188_620,
    constructorOffset: 10_187_506, sourceBytes: 1131, sourceSha256: "0b6dbc126ac0759270fadb6a3c6dc4d0a459d1573dbb40f94e4ff7b27efce263" },
  fpe: { name: "fpe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Sr",
    lineNumber: 4627, columnNumber: 542_047, classStart: 8_145_384, classEnd: 8_149_266,
    constructorOffset: 8_145_401, sourceBytes: 3882, sourceSha256: "8ebe140de749f7a7acda82bc3bd021ed517cb06aaba63d22b0544db95024385a" },
  P1e: { name: "P1e", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "cm",
    lineNumber: 91_968, columnNumber: 2427, classStart: 10_791_266, classEnd: 10_792_645,
    constructorOffset: 10_791_283, sourceBytes: 1379, sourceSha256: "3875b613153b8a857ba5ba539ff69bf3fa63eca6a1f0001dc929c74d2d5eaecb" },
  mge: { name: "mge", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "nu",
    lineNumber: 91_819, columnNumber: 138_224, classStart: 10_281_165, classEnd: 10_285_586,
    constructorOffset: 10_281_182, sourceBytes: 4421, sourceSha256: "02c535bcc0900172ee05cd45b96f3a5eb0c8c6cd0769e0c48a3d4a9461e9a2c4" },
  tge: { name: "tge", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Us",
    lineNumber: 91_819, columnNumber: 59_398, classStart: 10_202_339, classEnd: 10_207_569,
    constructorOffset: 10_202_356, sourceBytes: 5230, sourceSha256: "ab4a93b6ceb61e3a525ab92c928b2c9e06ee663ee187af7c4c9e3c51729d3093" },
  $me: { name: "Sy", parameterCount: 0, staticFields: TURN_STATIC_FIELDS, owner: "Xo",
    lineNumber: 91_819, columnNumber: 36_564, classStart: 10_179_502, classEnd: 10_187_365,
    constructorOffset: 10_179_522, sourceBytes: 7863, sourceSha256: "08e89830bcd3b649158376b92e97d542c8a9990344e6a1b04215168026483502" },
  Spe: { name: "Spe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "dl",
    lineNumber: 4627, columnNumber: 618_724, classStart: 8_222_061, classEnd: 8_222_300,
    constructorOffset: 8_222_078, sourceBytes: 239, sourceSha256: "a176bb4bfdffd45bb398ae0dca7a8618d330fc99a2b226fbb7bc975cfd132473" },
  Ume: { name: "Ume", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Yr",
    lineNumber: 91_819, columnNumber: 7602, classStart: 10_150_543, classEnd: 10_153_421,
    constructorOffset: 10_150_560, sourceBytes: 2878, sourceSha256: "c6c2e86b6779d4a7f46ac4be7278f1e95cd4b268636380fdbc5489af050c00eb" },
  cge: { name: "cge", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "ru",
    lineNumber: 91_819, columnNumber: 116_173, classStart: 10_259_103, classEnd: 10_272_647,
    constructorOffset: 10_259_131, sourceBytes: 13_546, sourceSha256: "7b4bbba269bed6870dbae2dad42c2ad1e86b6eb9424140b7bb05dd574842e036" },
  Tfe: { name: "Tfe", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Wn",
    lineNumber: 4630, columnNumber: 15_616, classStart: 9_090_457, classEnd: 9_091_778,
    constructorOffset: 9_090_485, sourceBytes: 1321, sourceSha256: "11923518703ed56f958839434140408a6523d63c01ed71c6aefc3c66b79ffcc4" },
  Qme: { name: "Qme", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Yh",
    lineNumber: 91_819, columnNumber: 56_726, classStart: 10_199_684, classEnd: 10_201_277,
    constructorOffset: 10_199_684, sourceBytes: 1593, sourceSha256: "7d1b0d0a24413d9141125f6ad92c4efbe0495b2ae627384ea0283c3ac7b769ca" },
  jde: { name: "jde", parameterCount: 0, staticFields: NO_STATIC_FIELDS, owner: "Ft",
    lineNumber: 4627, columnNumber: 366_670, classStart: 7_970_024, classEnd: 7_971_115,
    constructorOffset: 7_970_024, sourceBytes: 1091, sourceSha256: "f7d96ad152cb49b6a5633a0e9325882157360d1e92968a40eedca3af3e2a327c" },
});
export type CurrentPcbConstructorName = keyof typeof CURRENT_PCB_CONSTRUCTOR_PROFILES;
const ROOT_CONSTRUCTORS = ["Jse", "Lpe", "Kme", "fpe", "P1e", "mge", "tge", "$me", "Spe", "Ume", "cge", "Tfe", "Qme", "jde"] as const;
export const CURRENT_PCB_CONSTRUCTOR_BUNDLES = freezeDeep({
  diagnostic: ["kde", "Sfe", ...ROOT_CONSTRUCTORS], precreate: ["kde", "Sfe", "mpe", "Yde", "HSe", "USe", ...ROOT_CONSTRUCTORS],
  common: ["Yme", "Nfe", "Epe", "GSe"],
} as const);
export type CurrentPcbConstructorBundleKind = keyof typeof CURRENT_PCB_CONSTRUCTOR_BUNDLES;

function selector(kind: CurrentPcbConstructorBundleKind): string {
  const owners = CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind].map(key => {
    const profile = CURRENT_PCB_CONSTRUCTOR_PROFILES[key];
    return [key, profile.name, profile.owner, profile.parameterCount, profile.staticFields];
  });
  return `function(originalCallback${kind === "common" ? "" : ",teardropProof"}){"use strict";
let profile=null,stage="callback",reason="unexpected";
const bad=r=>{reason=r;throw new Error("PCB_CONSTRUCTOR_SCOPE");};
const held=[],own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad("object");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad("own");held.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad("object");return o;};
try{
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad("callback");
stage="scope";const scope=own(this,"object"),owners=${JSON.stringify(owners)},selected=[],instances=[];
${kind === "common" ? "" : `profile="Sfe";stage="owner";${CURRENT_PCB_TEARDROP_OWNER_FRAGMENT}`}
for(const [label,name,key,arity,statics] of owners){profile=label;stage="owner";const o=${kind === "common" ? "own(scope,key)" : 'label==="Sfe"?teardropOwner:own(scope,key)'};if(o===null||typeof o!=="object"||Array.isArray(o))bad("object");stage="constructor";const p=Object.getPrototypeOf(o),c=own(p,"constructor");if(typeof c!=="function")bad("function");stage="metadata";if(own(c,"name")!==name)bad("name");if(own(c,"length")!==arity)bad("arity");if(own(c,"prototype")!==p)bad("prototype");stage="statics";for(const key of Object.keys(statics))if(own(c,key)!==statics[key])bad("static");selected.push(c);instances.push([o,p]);}
profile=null;stage="reproof";for(const [o,p] of instances)if(Object.getPrototypeOf(o)!==p)bad("prototype");
for(const [o,k,v] of held){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,v))bad("own");}
${kind === "common" ? "" : "verifyTeardropOwner();"}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad("callback");
return selected;
}catch{return JSON.stringify({schema:"easyeda-pro-control.pcb-constructor-failure.v1",bundle:${JSON.stringify(kind)},profile,stage,reason});}}`;
}
export const CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS = Object.freeze({
  diagnostic: selector("diagnostic"), precreate: selector("precreate"), common: selector("common"),
});

/** Internal fixed leaf fragment. Caller defines own/object/bad/scope and takes
 * the retained admitted tuple as `constructors`. Diagnostic may receive the
 * precreate superset; no lexical-name fallback or constructor call exists. */
function association(kind: CurrentPcbConstructorBundleKind): string {
  const names = CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind];
  const lengths = kind === "diagnostic" ? [16, 20] : [names.length];
  const roster = kind === "diagnostic" ? CURRENT_PCB_CONSTRUCTOR_BUNDLES.precreate : names;
  const profiles = Object.fromEntries(roster.map(key => {
    const profile = CURRENT_PCB_CONSTRUCTOR_PROFILES[key];
    return [key, [profile.name, profile.parameterCount, profile.staticFields]];
  }));
  const namesExpression = kind === "diagnostic" ?
    `constructorLength===20?${JSON.stringify(CURRENT_PCB_CONSTRUCTOR_BUNDLES.precreate)}:${JSON.stringify(names)}` : JSON.stringify(names);
  return `
const constructorHeld=[],constructorProfiles=${JSON.stringify(profiles)};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,"length"),constructorKeys=Reflect.ownKeys(constructors);
if(!${JSON.stringify(lengths)}.includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!=="length")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!=="function")bad();
const constructorNames=${namesExpression};
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,"name")!==label||own(c,"length")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,"value")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,"prototype");if(Object.getPrototypeOf(o)!==p||own(p,"constructor")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,"length")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,"prototype")!==p||own(p,"constructor")!==c)bad();constructorMetadata(c,name);}};
`;
}
export const CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS = Object.freeze({
  diagnostic: association("diagnostic"), precreate: association("precreate"), common: association("common"),
});

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(16_384).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(),
  className: text.optional(), description: text.optional(), objectId: token.optional(),
  value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(),
  enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function refuse(): never { throw new Error("PCB_CONSTRUCTOR_SCOPE"); }

function data(input: unknown): unknown { return copyData(input, 0, { nodes: 0, bytes: 0 }); }
function copyData(input: unknown, depth: number, budget: { nodes: number; bytes: number }): unknown {
  budget.nodes += 1;
  if (budget.nodes > 2048 || depth > 10) { return refuse(); }
  if (input === null || typeof input === "boolean" || typeof input === "number") { return input; }
  if (typeof input === "string") {
    budget.bytes += Buffer.byteLength(input);
    if (input.length > 16_384 || !input.isWellFormed() || budget.bytes > 262_144) { return refuse(); }
    return input;
  }
  if (typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input), keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) { return refuse(); }
  if (keys.length > 64 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const items: unknown[] = [], result: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string") { return refuse(); }
    budget.bytes += Buffer.byteLength(key); if (budget.bytes > 262_144) { return refuse(); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = copyData(descriptor.value as unknown, depth + 1, budget);
      if (array) { if (key !== String(items.length)) { return refuse(); } items.push(value); }
      else { Object.defineProperty(result, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); }
  return array ? items : result;
}

/** Partial tuple selection only; every returned function handle still needs
 * getProperties qualification against the admitted original script. */
export function decodeCurrentPcbConstructorBundle(input: unknown, kind: CurrentPcbConstructorBundleKind): string {
  try {
    const result = z.object({ result: remote }).strict().parse(data(input)).result;
    if (result.type === "string" && typeof result.value === "string" && result.objectId === undefined &&
        result.className === undefined && result.subtype === undefined && Buffer.byteLength(result.value) <= 1024) {
      const detail = currentPcbConstructorFailureSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(result.value)));
      if (detail.bundle !== kind) { return refuse(); } throw currentPcbConstructorFailure(detail);
    }
    if (result.type !== "object" || result.subtype !== "array" || result.className !== "Array" ||
        result.description !== `Array(${CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind].length})` || result.value !== undefined ||
        result.objectId === undefined) { return refuse(); }
    return result.objectId;
  } catch (error) {
    if (currentPcbConstructorFailureDetail(error) !== null) { throw error; }
    throw currentPcbConstructorFailure({ schema: "easyeda-pro-control.pcb-constructor-failure.v1", bundle: kind,
      profile: null, stage: "decode", reason: "reply" });
  }
}

export function decodeCurrentPcbConstructorTuple(input: unknown, kind: CurrentPcbConstructorBundleKind): readonly string[] {
  try {
    const names = CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind];
    const length = names.length;
    const reply = z.object({ result: z.array(property).length(length + 1), internalProperties: z.array(internal).length(1) }).strict().parse(data(input));
    const map = new Map(reply.result.map(item => [item.name, item]));
    const size = map.get("length");
    const prototype = reply.internalProperties[0];
    if (map.size !== length + 1 || size?.value.type !== "number" || size.value.value !== length ||
        size.value.objectId !== undefined || size.value.subtype !== undefined || size.value.className !== undefined ||
        !size.writable || size.configurable || size.enumerable ||
        prototype?.name !== "[[Prototype]]" || prototype.value.type !== "object" || prototype.value.subtype !== "array" ||
        prototype.value.className !== "Array" || prototype.value.value !== undefined || prototype.value.objectId === undefined) { return refuse(); }
    const handles: string[] = [];
    for (let index = 0; index < length; index += 1) {
      const item = map.get(String(index));
      if (item?.value.type !== "function" || item.value.className !== "Function" || item.value.subtype !== undefined ||
          item.value.objectId === undefined || item.value.value !== undefined || !item.writable || !item.configurable || !item.enumerable ||
          handles.includes(item.value.objectId)) { return refuse(); }
      handles.push(item.value.objectId);
    }
    return Object.freeze(handles);
  } catch { return refuse(); }
}

/** The complete pinned script must already be admitted. This checks its exact
 * constructor location and own class metadata; supplied metadata alone grants
 * no original lexical-binding identity, transport or execution permission. */
export function decodeCurrentPcbConstructorProperties(input: unknown, scriptId: string, name: CurrentPcbConstructorName):
Readonly<{ prototypeId: string; lexicalBindingVerified: false; executionAuthorized: false }> {
  try {
    token.parse(scriptId);
    const expected = CURRENT_PCB_CONSTRUCTOR_PROFILES[name];
    const staticFields = Object.entries(expected.staticFields);
    const reply = z.object({ result: z.array(property).length(3 + staticFields.length), internalProperties: z.array(internal).length(3) }).strict().parse(data(input));
    const values = new Map(reply.result.map(item => [item.name, item]));
    const length = values.get("length");
    const label = values.get("name");
    const ownerPrototype = values.get("prototype");
    if (values.size !== 3 + staticFields.length || length?.value.type !== "number" || length.value.value !== expected.parameterCount || Object.is(length.value.value, -0) ||
        length.value.objectId !== undefined || length.value.subtype !== undefined || length.value.className !== undefined ||
        length.writable || !length.configurable || length.enumerable ||
        label?.value.type !== "string" || label.value.value !== expected.name || label.value.objectId !== undefined ||
        label.value.subtype !== undefined || label.value.className !== undefined ||
        label.writable || !label.configurable || label.enumerable || ownerPrototype?.value.type !== "object" ||
        ownerPrototype.value.className !== "Object" || ownerPrototype.value.objectId === undefined ||
        ownerPrototype.value.value !== undefined || ownerPrototype.value.subtype !== undefined ||
        ownerPrototype.writable || ownerPrototype.configurable || ownerPrototype.enumerable) { return refuse(); }
    for (const [field, value] of staticFields) {
      const item = values.get(field);
      if (item?.value.type !== "number" || !Object.is(item.value.value, value) || item.value.objectId !== undefined ||
          item.value.subtype !== undefined || item.value.className !== undefined ||
          !item.writable || !item.configurable || !item.enumerable) { return refuse(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = internals.get("[[FunctionLocation]]");
    const prototype = internals.get("[[Prototype]]");
    const scopes = internals.get("[[Scopes]]");
    const point = location?.value;
    if (internals.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        point === null || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        prototype?.type !== "function" || prototype.className !== "Function" || prototype.objectId === undefined || prototype.value !== undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" ||
        scopes.objectId === undefined || scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return refuse(); }
    return Object.freeze({ prototypeId: ownerPrototype.value.objectId, lexicalBindingVerified: false, executionAuthorized: false });
  } catch { return refuse(); }
}
