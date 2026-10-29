/** Fixed current209 manager reads. The caller retains the actual Tg and ja
 * objects at the original project constructor pause, before PROJECT assignment.
 * These synchronous own-data reads do not invoke getters or enable a writer. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentPcbWorkerStartupActorIdentitySchema } from "./current-pcb-worker-startup-actor.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Evaluated only on the original source-qualified Lg constructor-end frame.
 * Keep the first six original manager/consistency constructors, followed by the
 * original project and worker-channel classes. The initialized workerBus is the
 * original JP receiver; the later lazy wsBus is neither read nor initialized. */
export const CURRENT_FOOTPRINT_COPY_CONSTRUCTORS_EXPRESSION = `(()=>{
"use strict";const bad=()=>{throw new Error("FOOTPRINT_CONSTRUCTOR_BINDING");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
if(typeof Tg!=="function"||typeof ja!=="function")bad();
const footprintBase=Object.getPrototypeOf(Tg),consistencyBase=Object.getPrototypeOf(ja);
const projectPrototype=Object.getPrototypeOf(this),projectConstructor=own(projectPrototype,"constructor"),projectBase=Object.getPrototypeOf(projectConstructor);
if(typeof projectConstructor!=="function"||own(projectConstructor,"name")!=="Lg"||typeof projectBase!=="function"||own(projectBase,"name")!=="Gd"||own(projectConstructor,"prototype")!==projectPrototype||own(projectBase,"prototype")!==Object.getPrototypeOf(projectPrototype)||Object.getPrototypeOf(projectBase)!==Function.prototype||Object.getPrototypeOf(own(projectBase,"prototype"))!==Object.prototype)bad();
const bus=own(this,"workerBus"),busConstructors=[];let busPrototype=Object.getPrototypeOf(bus);
for(const name of ["JP","KP","Mb"]){const c=own(busPrototype,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==busPrototype)bad();busConstructors.push(c);busPrototype=Object.getPrototypeOf(busPrototype);}
if(busPrototype!==Object.prototype||Object.getPrototypeOf(busConstructors[0])!==busConstructors[1]||Object.getPrototypeOf(busConstructors[1])!==busConstructors[2]||Object.getPrototypeOf(busConstructors[2])!==Function.prototype)bad();
const constructors=[Tg,footprintBase,Object.getPrototypeOf(footprintBase),ja,consistencyBase,Object.getPrototypeOf(consistencyBase),projectConstructor,projectBase,...busConstructors];
const manager=own(this,"footprint"),consistency=own(this,"consistencyManager");
if(own(manager,"projectManager")!==this)bad();
for(const [object,offset]of [[manager,0],[consistency,3]]){let p=Object.getPrototypeOf(object);for(let i=0;i<3;i++){const c=constructors[offset+i];if(typeof c!=="function"||own(c,"prototype")!==p||own(p,"constructor")!==c)bad();p=Object.getPrototypeOf(p);}if(p!==Object.prototype)bad();}
return constructors;})()`;

const helpers = `"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_STATE");};
const retained=[],prototypes=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const own=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();retained.push([o,k,d.value]);return d.value;};
const chain=(o,names,constructors=null,offset=0)=>{object(o);let index=offset;let p=Object.getPrototypeOf(o);prototypes.push([o,p]);for(const name of names){object(p);const c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==p||constructors!==null&&own(constructors,String(index++))!==c)bad();const n=Object.getPrototypeOf(p);prototypes.push([p,n]);p=n;}if(p!==Object.prototype)bad();};
const verify=()=>{for(const [o,k,v]of retained){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||d.value!==v)bad();}for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();};`;

const selectManager = `function(){${helpers}
const manager=own(this,"footprint");chain(manager,["Tg","ar","Pi"]);
if(own(manager,"projectManager")!==this)bad();verify();return manager;}`;
const selectConsistency = `function(){${helpers}
const consistency=own(this,"consistencyManager");chain(consistency,["ja","Vc","zy"]);
verify();return consistency;}`;
const observe = `function(bus,manager,consistency,constructors){${helpers}
const id=(v,re)=>{const m=typeof v==="string"?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};
if(own(globalThis,"PROJECT")!==this||own(this,"workerBus")!==bus||own(this,"footprint")!==manager||own(this,"consistencyManager")!==consistency||own(manager,"projectManager")!==this)bad();
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,"length")!==11||Reflect.ownKeys(constructors).length!==12)bad();
chain(manager,["Tg","ar","Pi"],constructors,0);chain(consistency,["ja","Vc","zy"],constructors,3);chain(this,["Lg","Gd"],constructors,6);
chain(bus,["JP","KP","Mb"],constructors,8);
if(own(manager,"user")!==undefined)bad();
const client=id(own(manager,"client"),/^[a-f0-9]{16}$/);
if(own(consistency,"client")!==client)bad();
const maximumTicket=own(consistency,"maxTicket");
if(!Number.isSafeInteger(maximumTicket)||Object.is(maximumTicket,-0)||maximumTicket<0||maximumTicket>Number.MAX_SAFE_INTEGER-3)bad();
const identity={projectUuid:id(own(this,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(this,"_branchUuid"),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/)};
verify();return JSON.stringify({schema:"easyeda-pro-control.current-footprint-copy-state.v1",identity,client,maximumTicket,capturedUser:"own-undefined"});}`;

export const CURRENT_FOOTPRINT_COPY_STATE_CALLS = freezeDeep({
  "manager-select": { program: selectManager, arguments: 0, returnByValue: false },
  "consistency-select": { program: selectConsistency, arguments: 0, returnByValue: false },
  observe: { program: observe, arguments: 4, returnByValue: true },
});
const fields = {
  identity: currentPcbWorkerStartupActorIdentitySchema,
  client: z.string().length(16).regex(/^[a-f0-9]{16}$/u),
  maximumTicket: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 3).refine(value => !Object.is(value, -0)),
  capturedUser: z.literal("own-undefined"),
};
export const currentFootprintCopyStateSampleSchema = z.object({
  schema: z.literal("easyeda-pro-control.current-footprint-copy-state.v1"), ...fields,
}).strict();
export type CurrentFootprintCopyStateSample = Readonly<z.infer<typeof currentFootprintCopyStateSampleSchema>>;
export const currentFootprintCopyStatePacketSchema = z.object({
  profile: z.literal("private.current-footprint-copy-state.v1"), ...fields,
  samples: z.literal(2), originalConstructorManagerMatched: z.literal(true),
  atomicSnapshotVerified: z.literal(false), cacheBranchObserved: z.literal(false),
  executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict();
export type CurrentFootprintCopyStatePacket = Readonly<z.infer<typeof currentFootprintCopyStatePacketSchema>>;

export function decodeCurrentFootprintCopyState(raw: unknown): CurrentFootprintCopyStateSample {
  const captured = captureCurrentPcbStringClockReply(raw).value;
  const reply = z.object({ result: z.object({ type: z.literal("string"), value: z.string().max(2048) }).strict() }).strict().parse(captured);
  return freezeDeep(currentFootprintCopyStateSampleSchema.parse(JSON.parse(reply.result.value) as unknown));
}
