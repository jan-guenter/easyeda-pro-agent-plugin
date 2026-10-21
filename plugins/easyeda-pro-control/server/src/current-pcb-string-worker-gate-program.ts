/** Dormant descriptor-only gate and publisher-method association. Complete
 * worker source, original handles/context and effect checking remain required.
 * No native method, accessor, callback or publisher is invoked. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";

const ASSOCIATION = `${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
const descriptors=[],prototypes=[];
const proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const desc=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};
const nativeMethod=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||!d.writable||!d.configurable||d.enumerable)bad();return d.value;};
const project=object(own(globalThis,"PROJECT"));if(this!==project)bad();
named(project,"Lg");const lp=proto(project);named(lp,"Gd");const gp=proto(lp);if(proto(gp)!==Object.prototype)bad();
for(const key of ["isReadOnly","isV2Format","canWsPublish"])absent(project,key);
absent(lp,"isReadOnly");absent(lp,"isV2Format");
const format=desc(gp,"isV2Format");if(!format||Object.hasOwn(format,"value")||typeof format.get!=="function"||typeof format.set!=="function"||!format.configurable||format.enumerable)bad();
const bus=object(own(project,"workerBus"));named(bus,"JP");const jp=proto(bus);named(jp,"KP");const kp=proto(jp);named(kp,"Mb");const mp=proto(kp);if(proto(mp)!==Object.prototype)bad();
for(const key of ["publish","broadcastPublish","post","onMessage","onReceivedPublish"])absent(bus,key);
absent(jp,"publish");absent(jp,"onReceivedPublish");
const methods=[nativeMethod(gp,"isReadOnly"),format.get,nativeMethod(lp,"canWsPublish"),nativeMethod(kp,"publish"),nativeMethod(jp,"broadcastPublish"),nativeMethod(jp,"post"),nativeMethod(jp,"onMessage"),nativeMethod(kp,"onReceivedPublish")];
const recheck=()=>{verify();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!d){if(n!==undefined)bad();continue;}if(!n||n.enumerable!==d.enumerable||n.configurable!==d.configurable||Object.hasOwn(n,"value")!==Object.hasOwn(d,"value")||n.value!==d.value||n.writable!==d.writable||n.get!==d.get||n.set!==d.set)bad();}};
`;

/** Original PROJECT is the receiver. Returning only this fixed tuple does not
 * qualify its methods; host code must check every body and function location. */
export const CURRENT_PCB_STRING_WORKER_GATE_SELECTOR = `function(){${ASSOCIATION}
recheck();return methods;}`;

/** The gateScope is a newly acquired leading closure of tuple member2. jr comes
 * from the pinned L1.IS_PRIVATE destructuring, not an offline/network setting.
 * A source-allowed missing isSyncing remains missing in the returned record. */
export const CURRENT_PCB_STRING_WORKER_GATE_PROGRAM = `function(originalMethods,gateScope){${ASSOCIATION}
if(arraySize(originalMethods)!==8)bad();for(let i=0;i<8;i++)if(own(originalMethods,String(i))!==methods[i])bad();
const captured=object(own(gateScope,"object")),privateMode=flag(own(captured,"jr"));
const syncDescriptor=desc(project,"isSyncing");let syncing;
if(syncDescriptor===undefined){for(let p=proto(project),n=0;p!==null;p=proto(p)){if(++n>8)bad();absent(p,"isSyncing");}syncing={state:"absent",value:null};}
else{const value=own(project,"isSyncing");syncing=value===undefined?{state:"undefined",value:null}:{state:"boolean",value:flag(value)};}
const isTemporary=flag(own(project,"isTemporary")),isHistoryBack=flag(own(project,"isHistoryBack")),isV2Format=flag(own(project,"_isV2Format")),isReady=flag(own(project,"isReady"));
const isReadOnly=isTemporary||isHistoryBack||isV2Format,syncingTrue=syncing.value===true;
const state={schema:"easyeda-pro-control.pcb-string-worker-gates.v1",
identity:{projectUuid:id(own(project,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(project,"_branchUuid"),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/)},
raw:{isTemporary,isHistoryBack,isV2Format,isReady,isSyncing:syncing,privateMode},
predicates:{isReadOnly,canWsPublish:privateMode&&isReady&&!isReadOnly&&!syncingTrue,cooperationCallbackGateOpen:!isReadOnly,structureCallbackStateGateOpen:isReady&&!isReadOnly&&!syncingTrue},
privateModeSource:"jr=L1.IS_PRIVATE",gateMethodReferencesMatched:true,
publisher:{senderUuid:id(own(bus,"uuid"),/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/),methodChainReferencesMatched:true,nativeChannelVerified:false,nativeOnMessageReceiverVerified:false,completePublishersVerified:false},
hiddenCallbackReceiversVerified:false,writeDestinationsContained:false,atomicSample:false};recheck();return JSON.stringify(state);}`;

export const CURRENT_PCB_STRING_WORKER_GATE_HASHES = Object.freeze({
  selector: createHash("sha256").update(CURRENT_PCB_STRING_WORKER_GATE_SELECTOR).digest("hex"),
  observation: createHash("sha256").update(CURRENT_PCB_STRING_WORKER_GATE_PROGRAM).digest("hex"),
});
const syncState = z.discriminatedUnion("state", [
  z.object({ state: z.literal("absent"), value: z.null() }).strict(),
  z.object({ state: z.literal("undefined"), value: z.null() }).strict(),
  z.object({ state: z.literal("boolean"), value: z.boolean() }).strict(),
]);
const schema = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-worker-gates.v1"),
  identity: z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
    branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict(),
  raw: z.object({ isTemporary: z.boolean(), isHistoryBack: z.boolean(), isV2Format: z.boolean(), isReady: z.boolean(),
    isSyncing: syncState, privateMode: z.boolean() }).strict(),
  predicates: z.object({ isReadOnly: z.boolean(), canWsPublish: z.boolean(), cooperationCallbackGateOpen: z.boolean(),
    structureCallbackStateGateOpen: z.boolean() }).strict(),
  privateModeSource: z.literal("jr=L1.IS_PRIVATE"), gateMethodReferencesMatched: z.literal(true),
  publisher: z.object({ senderUuid: z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/u),
    methodChainReferencesMatched: z.literal(true), nativeChannelVerified: z.literal(false),
    nativeOnMessageReceiverVerified: z.literal(false), completePublishersVerified: z.literal(false) }).strict(),
  hiddenCallbackReceiversVerified: z.literal(false), writeDestinationsContained: z.literal(false), atomicSample: z.literal(false),
}).strict().superRefine((state, context) => {
  const { raw, predicates } = state, readOnly = raw.isTemporary || raw.isHistoryBack || raw.isV2Format;
  const stateGate = raw.isReady && !readOnly && raw.isSyncing.value !== true;
  if (predicates.isReadOnly !== readOnly || predicates.canWsPublish !== (raw.privateMode && stateGate) ||
      predicates.cooperationCallbackGateOpen !== !readOnly || predicates.structureCallbackStateGateOpen !== stateGate) {
    context.addIssue({ code: "custom", message: "Worker predicate differs from its raw source-supported values." });
  }
});
export function decodeCurrentPcbStringWorkerGates(input: unknown): ReturnType<typeof decodeCurrentPcbStringObservation<typeof schema>> {
  return decodeCurrentPcbStringObservation(input, schema);
}
