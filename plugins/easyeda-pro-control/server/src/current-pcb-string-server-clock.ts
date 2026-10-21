/** Dormant, fixed String worker server-time request. This is an actual RPC with
 * reply subscription/counter effects, not a throwOnSideEffect observation. It
 * never calls Save, and its response is NOT the future Save's own clock reply.
 * Deliberately conservative: the scalar must fall inside the local request
 * bracket. Date.now()+Jd outside that bracket refuses; this does not estimate
 * Jd, prove it is zero, or allow native bounds to cover an arbitrary offset. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentPcbStringActorClockIdentitySchema } from "./current-pcb-string-actor-clock.ts";
import type { CurrentPcbStringActorClockIdentity } from "./current-pcb-string-actor-clock.ts";
import { decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_SERVER_CLOCK_TOPIC = "/pro-mgr/serverTime/now";
export const CURRENT_PCB_STRING_SERVER_CLOCK_TIMEOUT_MS = 10_000;
// WORKERb849bd12 Mb.rpcCall@8711/273chars. Lg.saveCanvas@2144972 uses its original wsBus and
// This method with one topic argument, before asyncCompressFull/updateTime.
// oxlint-disable-next-line no-template-curly-in-string -- Preserve the pinned vendor method's own template literal as inert source bytes.
export const CURRENT_PCB_STRING_SERVER_CLOCK_RPC = 'rpcCall(e,t,s=0){let r=new Promise((i,n)=>{let a=`${VP}-${e}-${this.uuid}-${this.rpcTicket++}`;this.subscribeOnce(a,o=>{o.success?i(o.result):n(new Error(o.err))}),this.push(e,{message:t,replyTopic:a})});return s>0?Promise.race([r,new Promise((i,n)=>{setTimeout(n,s)})]):r}';
export const CURRENT_PCB_STRING_SERVER_CLOCK_FUNCTION = `async function(target,expectedUserText){
"use strict";
const bad=()=>{throw new Error("PCB_STRING_SERVER_CLOCK_STATE");};
const root=globalThis,apply=Reflect.apply,retained=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();if(retained.length>=128)bad();retained.push([o,k,d.value]);return d.value;};
const plain=o=>{if(o===null||typeof o!=="object"||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const named=(o,name)=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();const p=Object.getPrototypeOf(o),c=own(p,"constructor");if(own(c,"name")!==name||own(c,"prototype")!==p)bad();return p;};
plain(target);if(Reflect.ownKeys(target).join(",")!=="projectUuid,branchUuid,documentUuid,windowTabId")bad();
if(!/^[a-f0-9]{64}$/.test(own(target,"projectUuid"))||!/^[a-f0-9]{32}$/.test(own(target,"branchUuid"))||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(own(target,"documentUuid"))||!/^[A-Za-z0-9_-]{1,128}$/.test(own(target,"windowTabId")))bad();
if(typeof expectedUserText!=="string"||expectedUserText.length>16384||!expectedUserText.isWellFormed())bad();
const project=own(root,"PROJECT"),pp=named(project,"Lg"),gp=Object.getPrototypeOf(pp);
if(own(own(gp,"constructor"),"name")!=="Gd"||Object.getPrototypeOf(gp)!==Object.prototype||own(root,"_TAB_ID_")!==target.windowTabId||own(project,"uuid")!==target.projectUuid||own(project,"_branchUuid")!==target.branchUuid||own(project,"_isV2Format")!==false)bad();
const user=plain(own(project,"user")),userKeys=Reflect.ownKeys(user);
if(userKeys.length!==4||userKeys.some(k=>typeof k!=="string"||!["uuid","nickname","username","avatar"].includes(k)))bad();
for(const k of userKeys){const d=Object.getOwnPropertyDescriptor(user,k),v=own(user,k);if(!d||d.enumerable!==true||typeof v!=="string"||!v.isWellFormed()||v.length>(k==="avatar"?4096:k==="uuid"?32:1024))bad();}
if(!/^[a-f0-9]{32}$/.test(user.uuid)||JSON.stringify(user)!==expectedUserText)bad();
const bus=own(project,"wsBus"),bp=named(bus,"JP"),kp=Object.getPrototypeOf(bp),mp=Object.getPrototypeOf(kp);
if(own(root,"/"+target.windowTabId+"/notify")!==bus||own(own(kp,"constructor"),"name")!=="KP"||own(own(mp,"constructor"),"name")!=="Mb"||Object.getPrototypeOf(mp)!==Object.prototype||[bus,bp,kp].some(p=>Object.hasOwn(p,"rpcCall")))bad();
const rpc=own(mp,"rpcCall"),functionSource=own(Function.prototype,"toString"),busUuid=own(bus,"uuid");
if(typeof rpc!=="function"||apply(functionSource,rpc,[])!==${JSON.stringify(CURRENT_PCB_STRING_SERVER_CLOCK_RPC)}||typeof busUuid!=="string"||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(busUuid))bad();
const ticketDescriptor=Object.getOwnPropertyDescriptor(bus,"rpcTicket");if(!ticketDescriptor||!Object.hasOwn(ticketDescriptor,"value"))bad();
const ticketBefore=ticketDescriptor.value;if(!Number.isSafeInteger(ticketBefore)||Object.is(ticketBefore,-0)||ticketBefore<0||ticketBefore>=Number.MAX_SAFE_INTEGER)bad();
const nativeDate=own(root,"Date"),now=own(nativeDate,"now"),dp=own(nativeDate,"prototype"),iso=own(dp,"toISOString"),zone=own(dp,"getTimezoneOffset"),set=own(root,"setTimeout"),clear=own(root,"clearTimeout");
if([nativeDate,now,iso,zone,set,clear].some(v=>typeof v!=="function"))bad();
let expired=false,timer;
const check=()=>{if(expired||Object.getPrototypeOf(project)!==pp||Object.getPrototypeOf(pp)!==gp||Object.getPrototypeOf(bus)!==bp||Object.getPrototypeOf(bp)!==kp||Object.getPrototypeOf(kp)!==mp||[bus,bp,kp].some(p=>Object.hasOwn(p,"rpcCall")))bad();for(const [o,k,v]of retained){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||d.value!==v)bad();}if(JSON.stringify(user)!==expectedUserText||Reflect.ownKeys(user).join(",")!==userKeys.join(","))bad();};
const stamp=()=>{check();const milliseconds=apply(now,nativeDate,[]),date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0)||!Number.isSafeInteger(timezoneOffsetMinutes)||Object.is(timezoneOffsetMinutes,-0)||Math.abs(timezoneOffsetMinutes)>840)bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};
try{
const before=stamp();
const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error("PCB_STRING_SERVER_CLOCK_TIMEOUT"));},10000]);});
const serverTimeMs=await Promise.race([apply(rpc,bus,[${JSON.stringify(CURRENT_PCB_STRING_SERVER_CLOCK_TOPIC)}]),timeout]);
check();const after=stamp(),ticket=Object.getOwnPropertyDescriptor(bus,"rpcTicket");
if(!ticket||!Object.hasOwn(ticket,"value")||ticket.value!==ticketBefore+1||!Number.isSafeInteger(serverTimeMs)||Object.is(serverTimeMs,-0)||serverTimeMs<before.milliseconds||serverTimeMs>after.milliseconds||after.milliseconds-before.milliseconds>10000||before.timezoneOffsetMinutes!==after.timezoneOffsetMinutes)bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-server-clock.v1",identity:target,workerUserText:expectedUserText,busUuid,rpcTicketBefore:ticketBefore,rpcTicketAfter:ticket.value,serverTimeMs,clock:{before,after}});
}finally{if(timer!==undefined)apply(clear,root,[timer]);}
}`;
const time = z.number().int().min(0).max(8_640_000_000_000_000).refine(value => !Object.is(value, -0));
const ticket = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const stamp = z.object({ milliseconds: time, iso: z.string().max(32),
  timezoneOffsetMinutes: z.number().int().min(-840).max(840).refine(value => !Object.is(value, -0)) }).strict()
  .refine(value => new Date(value.milliseconds).toISOString() === value.iso);
const sample = z.object({ schema: z.literal("easyeda-pro-control.pcb-string-server-clock.v1"),
  identity: currentPcbStringActorClockIdentitySchema, workerUserText: z.string().max(16_384),
  busUuid: z.string().regex(/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/u),
  rpcTicketBefore: ticket.max(Number.MAX_SAFE_INTEGER - 1), rpcTicketAfter: ticket,
  serverTimeMs: time, clock: z.object({ before: stamp, after: stamp }).strict(),
}).strict().refine(value => value.rpcTicketAfter === value.rpcTicketBefore + 1 &&
  value.clock.before.milliseconds <= value.serverTimeMs && value.serverTimeMs <= value.clock.after.milliseconds &&
  value.clock.after.milliseconds - value.clock.before.milliseconds <= CURRENT_PCB_STRING_SERVER_CLOCK_TIMEOUT_MS &&
  value.clock.before.timezoneOffsetMinutes === value.clock.after.timezoneOffsetMinutes);
export type CurrentPcbStringServerClockSample = Readonly<z.infer<typeof sample>>;
export interface CurrentPcbStringServerClockCommand {
  readonly saveClockPhase: "server-time";
  readonly method: "Runtime.callFunctionOn";
  readonly params: Readonly<{ functionDeclaration: string; uniqueContextId: string;
    arguments: readonly [Readonly<{ value: CurrentPcbStringActorClockIdentity }>, Readonly<{ value: string }>];
    returnByValue: true; throwOnSideEffect: false; silent: true; awaitPromise: true; generatePreview: false; userGesture: false }>;
}
export function currentPcbStringServerClockCommand(uniqueContextId: string, identity: CurrentPcbStringActorClockIdentity,
  workerUserText: string): CurrentPcbStringServerClockCommand {
  if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(uniqueContextId) || workerUserText.length > 16_384 || !workerUserText.isWellFormed()) {
    throw new Error("PCB_STRING_SERVER_CLOCK_INPUT");
  }
  const target = currentPcbStringActorClockIdentitySchema.parse(identity);
  return freezeDeep({ saveClockPhase: "server-time", method: "Runtime.callFunctionOn", params: {
    functionDeclaration: CURRENT_PCB_STRING_SERVER_CLOCK_FUNCTION, uniqueContextId,
    arguments: [{ value: target }, { value: workerUserText }], returnByValue: true, throwOnSideEffect: false,
    silent: true, awaitPromise: true, generatePreview: false, userGesture: false,
  } });
}
export function decodeCurrentPcbStringServerClock(reply: unknown, identity: CurrentPcbStringActorClockIdentity,
  workerUserText: string): CurrentPcbStringServerClockSample {
  const result = decodeCurrentPcbStringObservation(reply, sample);
  if (canonicalJson(result.identity) !== canonicalJson(identity) || result.workerUserText !== workerUserText) {
    throw new Error("PCB_STRING_SERVER_CLOCK_TARGET");
  }
  return result;
}
