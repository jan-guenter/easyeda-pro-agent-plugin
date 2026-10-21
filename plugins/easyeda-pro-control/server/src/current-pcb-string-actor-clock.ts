/** Fixed String actor/local-clock samples; no rename owner or backend clock.
 * UI3823ed6e loginUser/get@16957413 builds uuid,nickname,username,avatar.
 * WORKERb849bd12 subscribe@2115431 retains that reply as this.user;
 * saveCanvas@2144978 passes this.user verbatim to asyncCompressFull.
 * A local Date bracket does not observe that Save's serverTime RPC. */
import { z } from "zod";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS, decodeCurrentPcbStringObservation } from "./current-pcb-string-observation-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_ACTOR_CLOCK_PHASES = Object.freeze(["ui", "worker", "pcb"] as const);
export type CurrentPcbStringActorClockPhase = typeof CURRENT_PCB_STRING_ACTOR_CLOCK_PHASES[number];
export const currentPcbStringActorClockIdentitySchema = z.object({
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u),
}).strict();
export type CurrentPcbStringActorClockIdentity = Readonly<z.infer<typeof currentPcbStringActorClockIdentitySchema>>;
const string = (maximum: number): z.ZodString => z.string().max(maximum).refine(value => value.isWellFormed());
const actor = z.object({ uuid: z.string().regex(/^[a-f\d]{32}$/u), username: string(1024), nickname: string(1024) }).strict();
const user = actor.extend({ avatar: string(4096) }).strict();
const time = z.number().int().min(0).max(8_640_000_000_000_000).refine(value => !Object.is(value, -0));
const offset = z.number().int().min(-840).max(840).refine(value => !Object.is(value, -0));
const stamp = z.object({ milliseconds: time, iso: z.string().max(32), timezoneOffsetMinutes: offset }).strict()
  .refine(value => new Date(value.milliseconds).toISOString() === value.iso);
const clock = z.object({ before: stamp, after: stamp }).strict().refine(value =>
  value.after.milliseconds >= value.before.milliseconds && value.after.milliseconds - value.before.milliseconds <= 1000 &&
  value.before.timezoneOffsetMinutes === value.after.timezoneOffsetMinutes);
const base = { schema: z.literal("easyeda-pro-control.pcb-string-actor-clock.v1"), clock };
const ui = z.object({ ...base, phase: z.literal("ui"), identity: currentPcbStringActorClockIdentitySchema,
  cachedActor: actor, startupActor: actor, workerUser: user, workerUserText: z.string().max(16_384) }).strict();
const worker = z.object({ ...base, phase: z.literal("worker"), identity: currentPcbStringActorClockIdentitySchema,
  workerUser: user, workerUserText: z.string().max(16_384) }).strict();
const pcb = z.object({ ...base, phase: z.literal("pcb") }).strict();
const observation = z.discriminatedUnion("phase", [ui, worker, pcb]);
export type CurrentPcbStringActorClockSample = Readonly<z.infer<typeof observation>>;

const COMMON = `${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
const root=globalThis,apply=Reflect.apply,nativeDate=own(root,"Date"),now=own(nativeDate,"now"),datePrototype=own(nativeDate,"prototype"),iso=own(datePrototype,"toISOString"),zone=own(datePrototype,"getTimezoneOffset");
if([nativeDate,now,iso,zone].some(v=>typeof v!=="function"))bad();
const stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};
const before=stamp();
const text=(v,max)=>{if(typeof v!=="string"||v.length>max||!v.isWellFormed())bad();return v;};
const actor=o=>({uuid:id(own(o,"uuid"),/^[a-f0-9]{32}$/),username:text(own(o,"username"),1024),nickname:text(own(o,"nickname"),1024)});
const finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};
`;
const TARGET = `
plain(target);if(Reflect.ownKeys(target).join(",")!=="projectUuid,branchUuid,documentUuid,windowTabId")bad();
id(own(target,"projectUuid"),/^[a-f0-9]{64}$/);id(own(target,"branchUuid"),/^[a-f0-9]{32}$/);id(own(target,"documentUuid"),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);id(own(target,"windowTabId"),/^[A-Za-z0-9_-]{1,128}$/);
if(own(root,"_TAB_ID_")!==target.windowTabId)bad();
`;
/** No actor handler, application method, RPC or timer is invoked. The admitted
 * UI context owns the exact cached/startup fields used by the current producer.
 * It does not prove the future callback receiver or delivery to a worker. */
export const CURRENT_PCB_STRING_UI_ACTOR_CLOCK_FUNCTION = `function(target){
${COMMON}${TARGET}
const host=object(own(root,"gVars")),ui=object(own(root,"UI")),project=object(own(host,"currentProject"));
if(own(ui,"gVars")!==host||own(project,"projectId")!==target.projectUuid||own(project,"branchUuid")!==target.branchUuid||own(project,"isV2Format")!==false||own(host,"isHistoryMode")!==false)bad();
const cached=object(own(object(own(host,"globalVariableCookieData")),"userInfo")),startup=object(own(host,"loginedUserInfo"));
const cachedActor=actor(cached),startupActor=actor(startup);
if(JSON.stringify(cachedActor)!==JSON.stringify(startupActor))bad();
const workerUser={uuid:startupActor.uuid,nickname:startupActor.nickname,username:startupActor.username,avatar:text(own(startup,"avatar"),4096)};
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-actor-clock.v1",phase:"ui",identity:target,cachedActor,startupActor,workerUser,workerUserText:JSON.stringify(workerUser),clock:finish()});
}`;
/** PROJECT.user is the worker's retained value, not a fresh login RPC. Preserve
 * its exact four-field JSON order; do not reconstruct a matching canonical user. */
export const CURRENT_PCB_STRING_WORKER_ACTOR_CLOCK_FUNCTION = `function(target){
${COMMON}${TARGET}
const project=named(own(root,"PROJECT"),"Lg"),gp=Object.getPrototypeOf(Object.getPrototypeOf(project));
if(own(own(gp,"constructor"),"name")!=="Gd"||Object.getPrototypeOf(gp)!==Object.prototype||own(project,"uuid")!==target.projectUuid||own(project,"_branchUuid")!==target.branchUuid)bad();
const source=plain(own(project,"user")),order=Reflect.ownKeys(source);
if(order.length!==4||order.some(k=>typeof k!=="string"||!["uuid","nickname","username","avatar"].includes(k)))bad();
const projected=actor(source),avatar=text(own(source,"avatar"),4096),workerUser={};
for(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||d.enumerable!==true)bad();workerUser[key]=key==="avatar"?avatar:projected[key];}
if(Reflect.ownKeys(source).join(",")!==order.join(","))bad();
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-actor-clock.v1",phase:"worker",identity:target,workerUser,workerUserText:JSON.stringify(workerUser),clock:finish()});
}`;
/** The original native owner must select the already-source-admitted PCB
 * uniqueContextId. This local clock alone contains no document/actor claim. */
export const CURRENT_PCB_STRING_PCB_CLOCK_FUNCTION = `function(){${COMMON}
return JSON.stringify({schema:"easyeda-pro-control.pcb-string-actor-clock.v1",phase:"pcb",clock:finish()});
}`;

export const CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS = Object.freeze({
  ui: CURRENT_PCB_STRING_UI_ACTOR_CLOCK_FUNCTION, worker: CURRENT_PCB_STRING_WORKER_ACTOR_CLOCK_FUNCTION,
  pcb: CURRENT_PCB_STRING_PCB_CLOCK_FUNCTION,
});
export interface CurrentPcbStringActorClockCommand {
  readonly actorClockPhase: CurrentPcbStringActorClockPhase;
  readonly method: "Runtime.callFunctionOn";
  readonly params: Readonly<{ functionDeclaration: string; uniqueContextId: string;
    arguments: readonly Readonly<{ value: CurrentPcbStringActorClockIdentity }>[];
    returnByValue: true; throwOnSideEffect: true; silent: true; awaitPromise: false; generatePreview: false; userGesture: false }>;
}
export function currentPcbStringActorClockCommand(phase: CurrentPcbStringActorClockPhase, uniqueContextId: string,
  identity: CurrentPcbStringActorClockIdentity): CurrentPcbStringActorClockCommand {
  const selected = z.enum(CURRENT_PCB_STRING_ACTOR_CLOCK_PHASES).parse(phase);
  const target = currentPcbStringActorClockIdentitySchema.parse(identity);
  if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(uniqueContextId)) { throw new Error("PCB_STRING_ACTOR_CLOCK_CONTEXT"); }
  return freezeDeep({ actorClockPhase: selected, method: "Runtime.callFunctionOn", params: {
    functionDeclaration: CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS[selected], uniqueContextId,
    arguments: selected === "pcb" ? [] : [{ value: target }], returnByValue: true, throwOnSideEffect: true,
    silent: true, awaitPromise: false, generatePreview: false, userGesture: false,
  } });
}
export function decodeCurrentPcbStringActorClock(input: unknown): CurrentPcbStringActorClockSample {
  const result = decodeCurrentPcbStringObservation(input, observation);
  if (result.phase !== "pcb") {
    // Zod preserves schema order rather than original wire order. Decode and
    // Compare the separately retained user text, whose order Save serializes.
    const raw: unknown = JSON.parse(result.workerUserText);
    const parsed = user.parse(raw);
    if (JSON.stringify(parsed) !== JSON.stringify(result.workerUser) || JSON.stringify(raw) !== result.workerUserText) {
      throw new Error("PCB_STRING_ACTOR_CLOCK_USER");
    }
    if (result.phase === "ui" && (JSON.stringify(result.cachedActor) !== JSON.stringify(result.startupActor) ||
        result.workerUserText !== JSON.stringify({ uuid: result.startupActor.uuid, nickname: result.startupActor.nickname,
          username: result.startupActor.username, avatar: result.workerUser.avatar }))) { throw new Error("PCB_STRING_ACTOR_CLOCK_USER"); }
  }
  return result;
}
