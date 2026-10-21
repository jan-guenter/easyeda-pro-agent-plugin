/** Empty-only additional String baseline exclusions. The fixed original scope
 * reader observes ratline models/views, network and cluster indexes plus raw
 * network notification state. It does not cover latent eL move closure,
 * startup/subscribers, source/assets, model geometry or queued message delivery.
 * PCB217199c8 offsets: w4@3917595, mpe@8149271, pP@4360581,
 * USe/HSe/h0@4351995, Yde@7963914 and U5@5436598.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS } from "./current-pcb-constructor-scope.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_LAZY_OWNER_GUARDS, currentPcbLazyOwnerSchema } from "./current-pcb-lazy-owner.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, currentPcbStringMarkerSchema,
  decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import type { CURRENT_PCB_STRING_OBSERVATION_LIMITS } from "./current-pcb-string-observation-core.ts";

/** One fixed callFunctionOn on original handler scope zero, with retained
 * callback and admitted precreate constructor tuple, throwOnSideEffect:true. No native method,
 * getter, timer, manager constructor or mutation is invoked. Any nonempty
 * selected collection refuses rather than discarding its members. */
function producerProgram(version: 1 | 2): string { return `function(originalCallback,constructors){
${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
const scope=object(own(this,"object")),klass=n=>{const c=own(scope,n);if(typeof c!=="function")bad();return c;};
${CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.precreate}
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,"prototype"))bad();return o;};
const ec=klass("x"),env=instance(own(ec,"env"),ec),documentUuid=id(own(env,"_id"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,"_doctype")!==3)bad();
const emptyArray=o=>{if(arraySize(o)!==0)bad();return [];};
const nullish=(o,k)=>{const m=marker(o,k);if(m==="present")bad();return m;};
${version === 2 ? `${CURRENT_PCB_LAZY_OWNER_GUARDS}
const modelClass=klass("MI"),modelOwner=lazyOwner(modelClass);` : 'const modelClass=klass("MI"),models=instance(own(modelClass,"manager"),modelClass);'}
const views=constructorInstance(own(scope,"jo"),"mpe");
${version === 2 ? 'let model={manager:modelOwner.marker,state:null};if(modelOwner.marker==="present"){const models=instance(modelOwner.value,modelClass);model={manager:"present",state:' : 'const model='}{netKeys:emptyMap(own(models,"map")),idKeys:emptyMap(own(models,"idMap")),
lastRatline:nullish(models,"_lastRatline"),last:nullish(models,"_last")}${version === 2 ? '};}' : ';'}
const view={netKeys:emptyMap(own(views,"map")),idKeys:emptyMap(own(views,"idMap")),
highlightNets:emptySet(own(views,"highLightNets")),clickHighlight:emptySet(own(views,"clickHighlightRatlines")),
hoverHighlight:emptySet(own(views,"hoverHighlightRatlines"))};
const network=constructorInstance(own(scope,"ze"),"Yde"),updates=plain(own(network,"updateNets"));
if(keys(updates).length!==3)bad();
const notification=instance(own(network,"debounce"),klass("U5"));
const net={keys:emptyMap(own(network,"map")),noneKeys:emptyMap(own(network,"noneNetMap")),
lengthKeys:emptyMap(own(network,"netLength")),modifyKeys:emptyMap(own(network,"netModify")),
rubbish:emptySet(own(network,"rubbish")),options:emptyArray(own(network,"netOptions")),
add:emptyArray(own(updates,"addNet")),delete:emptyArray(own(updates,"deleteNet")),
updateLengthKeys:emptyObject(own(updates,"updateNetLength")),grayKeys:emptyObject(own(network,"ratlineVisibleBeforeGray")),
viewGroups:null,viewGroupsMarker:marker(network,"_viewGroupIds"),updateLeftTree:nullish(network,"updateLeftTree"),
notification:{func:nullish(notification,"func"),animationFrame:nullish(notification,"animationFrameId"),
lastTime:own(notification,"lastTime"),delay:own(notification,"delay")}};
if(net.viewGroupsMarker==="present")net.viewGroups=emptyArray(own(network,"_viewGroupIds"));
if(net.notification.lastTime!==-1||net.notification.delay!==0)bad();
const clusters={networkKeys:emptyMap(own(klass("Xh"),"map")),
wireClusterKeys:emptyMap(own(constructorInstance(own(scope,"h_"),"HSe"),"map")),
jumpWireKeys:emptyMap(own(constructorInstance(own(scope,"aE"),"USe"),"map")),
useWireClusterCache:flag(own(klass("h0"),"useWireClusterCache")),emptyNetChange:flag(own(klass("h0"),"emptyNetChange"))};
verifyConstructorAssociations();${version === 2 ? "verifyLazyOwners();" : ""}verify();if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==originalCallback)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-empty-producers.v${version}",documentUuid,model,view,net,clusters});
}`; }
export const CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION = producerProgram(1);
export const CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION = producerProgram(2);

const empty = z.array(z.never()).length(0);
const nullish = z.enum(["absent", "undefined", "null"]);
const delay = z.literal(0).refine(value => !Object.is(value, -0));
const notification = z.object({ func: nullish, animationFrame: nullish, lastTime: z.literal(-1), delay }).strict();
const schema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-empty-producers.v1"),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  model: z.object({ netKeys: empty, idKeys: empty, lastRatline: nullish, last: nullish }).strict(),
  view: z.object({ netKeys: empty, idKeys: empty, highlightNets: empty, clickHighlight: empty, hoverHighlight: empty }).strict(),
  net: z.object({ keys: empty, noneKeys: empty, lengthKeys: empty, modifyKeys: empty, rubbish: empty, options: empty,
    add: empty, delete: empty, updateLengthKeys: empty, grayKeys: empty,
    viewGroups: empty.nullable(), viewGroupsMarker: currentPcbStringMarkerSchema, updateLeftTree: nullish,
    notification,
  }).strict().refine(value => (value.viewGroupsMarker === "present") === (value.viewGroups !== null)),
  clusters: z.object({ networkKeys: empty, wireClusterKeys: empty, jumpWireKeys: empty,
    useWireClusterCache: z.boolean(), emptyNetChange: z.boolean() }).strict(),
}).strict();
const schemaV2 = z.object({ ...schema.shape,
  schema: z.literal("easyeda-pro-control.pcb-string-empty-producers.v2"),
  model: currentPcbLazyOwnerSchema(schema.shape.model),
}).strict();

export type CurrentPcbStringEmptyProducers = Readonly<z.infer<typeof schema>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS;
export type CurrentPcbStringEmptyProducersV2 = Readonly<z.infer<typeof schemaV2>> & typeof CURRENT_PCB_STRING_OBSERVATION_LIMITS;
export function decodeCurrentPcbStringEmptyProducers(input: unknown): CurrentPcbStringEmptyProducers {
  return decodeCurrentPcbStringObservation(input, schema);
}
export function decodeCurrentPcbStringEmptyProducersV2(input: unknown): CurrentPcbStringEmptyProducersV2 {
  return decodeCurrentPcbStringObservation(input, schemaV2);
}

export const CURRENT_PCB_STRING_EMPTY_PRODUCERS_SHA256 =
  createHash("sha256").update(CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION).digest("hex");
