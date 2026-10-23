/** Startup-purpose actor/local-clock reads. They do not observe a PCB realm,
 * backend request, Windows clock, server RPC or future Save. The worker read
 * requires the constructor-captured PROJECT and workerBus as its receiver and
 * argument; matching global identity fields cannot replace those objects. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS } from "./current-pcb-string-observation-core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const exactId = (expression: RegExp): z.ZodString => z.string().refine(value => expression.exec(value)?.[0] === value);
export const currentPcbWorkerStartupActorIdentitySchema = z.object({
  projectUuid: exactId(/^[a-f\d]{64}$/u), branchUuid: exactId(/^[a-f\d]{32}$/u),
  windowTabId: exactId(/^[A-Za-z\d_-]{1,128}$/u),
}).strict();
export type CurrentPcbWorkerStartupActorIdentity = Readonly<z.infer<typeof currentPcbWorkerStartupActorIdentitySchema>>;
const text = (maximum: number): z.ZodString => z.string().max(maximum).refine(value => value.isWellFormed());
const actor = z.object({ uuid: exactId(/^[a-f\d]{32}$/u), username: text(1024), nickname: text(1024) }).strict();
const user = actor.extend({ avatar: text(4096) }).strict();
const milliseconds = z.number().int().min(0).max(8_640_000_000_000_000).refine(value => !Object.is(value, -0));
const offset = z.number().int().min(-840).max(840).refine(value => !Object.is(value, -0));
const stamp = z.object({ milliseconds, iso: z.string().max(32), timezoneOffsetMinutes: offset }).strict()
  .refine(value => new Date(value.milliseconds).toISOString() === value.iso);
const clock = z.object({ before: stamp, after: stamp }).strict().refine(value =>
  value.after.milliseconds >= value.before.milliseconds && value.after.milliseconds - value.before.milliseconds <= 1000 &&
  value.before.timezoneOffsetMinutes === value.after.timezoneOffsetMinutes);
const base = { schema: z.literal("easyeda-pro-control.pcb-worker-startup-actor.v1"),
  identity: currentPcbWorkerStartupActorIdentitySchema, workerUser: user, workerUserText: text(16_384), clock };
export const currentPcbWorkerStartupActorSampleSchema = z.discriminatedUnion("phase", [
  z.object({ ...base, phase: z.literal("ui"), cachedActor: actor, startupActor: actor }).strict(),
  z.object({ ...base, phase: z.literal("worker"), originalProjectReceiverMatched: z.literal(true),
    originalWorkerBusMatched: z.literal(true) }).strict(),
]);
export type CurrentPcbWorkerStartupActorSample = Readonly<z.infer<typeof currentPcbWorkerStartupActorSampleSchema>>;

const COMMON = `${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
const root=globalThis,apply=Reflect.apply;
const exactId=(v,re)=>{const m=typeof v==="string"?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};
const text=(v,max)=>{if(typeof v!=="string"||v.length>max||!v.isWellFormed())bad();return v;};
const actor=o=>({uuid:exactId(own(o,"uuid"),/^[a-f0-9]{32}$/),username:text(own(o,"username"),1024),nickname:text(own(o,"nickname"),1024)});
const nativeDate=own(root,"Date"),now=own(nativeDate,"now"),datePrototype=own(nativeDate,"prototype"),iso=own(datePrototype,"toISOString"),zone=own(datePrototype,"getTimezoneOffset");
if([nativeDate,now,iso,zone].some(v=>typeof v!=="function"))bad();
const stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};
const before=stamp();
const finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};
`;

/** Same source-reviewed cached/startup account fields as the separate String
 * observer. This fixed zero-argument reader observes its original UI realm. */
export const CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION = `function(){
${COMMON}
const host=object(own(root,"gVars")),ui=object(own(root,"UI")),project=object(own(host,"currentProject"));
if(own(ui,"gVars")!==host||own(project,"isV2Format")!==false||own(host,"isHistoryMode")!==false)bad();
const identity={projectUuid:exactId(own(project,"projectId"),/^[a-f0-9]{64}$/),branchUuid:exactId(own(project,"branchUuid"),/^[a-f0-9]{32}$/),windowTabId:exactId(own(root,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/)};
const cached=object(own(object(own(host,"globalVariableCookieData")),"userInfo")),startup=object(own(host,"loginedUserInfo"));
const cachedActor=actor(cached),startupActor=actor(startup);
if(JSON.stringify(cachedActor)!==JSON.stringify(startupActor))bad();
const workerUser={uuid:startupActor.uuid,nickname:startupActor.nickname,username:startupActor.username,avatar:text(own(startup,"avatar"),4096)};
return JSON.stringify({schema:"easyeda-pro-control.pcb-worker-startup-actor.v1",phase:"ui",identity,cachedActor,startupActor,workerUser,workerUserText:JSON.stringify(workerUser),clock:finish()});
}`;

/** The original constructor receiver and bus must both remain installed. This
 * observes the current retained user, not that user's future use by Save. */
export const CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION = `function(bus){
${COMMON}
const project=named(this,"Lg"),pp=Object.getPrototypeOf(project),gp=Object.getPrototypeOf(pp);
if(own(root,"PROJECT")!==project||own(project,"workerBus")!==bus||own(own(gp,"constructor"),"name")!=="Gd"||Object.getPrototypeOf(gp)!==Object.prototype||own(project,"_isV2Format")!==false)bad();
const identity={projectUuid:exactId(own(project,"uuid"),/^[a-f0-9]{64}$/),branchUuid:exactId(own(project,"_branchUuid"),/^[a-f0-9]{32}$/),windowTabId:exactId(own(root,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/)};
const source=plain(own(project,"user")),order=Reflect.ownKeys(source);
if(order.length!==4||order.some(k=>typeof k!=="string"||!["uuid","nickname","username","avatar"].includes(k)))bad();
const projected=actor(source),avatar=text(own(source,"avatar"),4096),workerUser={};
for(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||d.enumerable!==true)bad();workerUser[key]=key==="avatar"?avatar:projected[key];}
const clock=finish();
if(Object.getPrototypeOf(project)!==pp||Object.getPrototypeOf(pp)!==gp||Object.getPrototypeOf(gp)!==Object.prototype||Reflect.ownKeys(source).join(",")!==order.join(","))bad();
for(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||!Object.hasOwn(d,"value")||d.enumerable!==true)bad();}
verify();
return JSON.stringify({schema:"easyeda-pro-control.pcb-worker-startup-actor.v1",phase:"worker",identity,originalProjectReceiverMatched:true,originalWorkerBusMatched:true,workerUser,workerUserText:JSON.stringify(workerUser),clock});
}`;

export interface CurrentPcbWorkerStartupUiActorCommand {
  readonly method: "Runtime.callFunctionOn";
  readonly sessionId: string;
  readonly params: Readonly<{ functionDeclaration: typeof CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION;
    uniqueContextId: string; arguments: readonly []; returnByValue: true; throwOnSideEffect: true;
    silent: true; awaitPromise: false; generatePreview: false; userGesture: false }>;
}
export function currentPcbWorkerStartupUiActorCommand(sessionId: string, uniqueContextId: string): CurrentPcbWorkerStartupUiActorCommand {
  const token = exactId(/^[A-Za-z\d_.:-]{1,128}$/u);
  return freezeDeep({ method: "Runtime.callFunctionOn", sessionId: token.parse(sessionId), params: {
    functionDeclaration: CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION, uniqueContextId: token.parse(uniqueContextId),
    arguments: [], returnByValue: true, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false,
  } });
}
export function decodeCurrentPcbWorkerStartupActor(raw: unknown): CurrentPcbWorkerStartupActorSample {
  try {
    const reply = z.object({ result: z.object({ type: z.literal("string"), value: text(16_384) }).strict() }).strict()
      .parse(captureCurrentPcbStringClockReply(raw).value);
    if (Buffer.byteLength(reply.result.value) > 16_384) { throw new Error("reply bound"); }
    const sample = currentPcbWorkerStartupActorSampleSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(reply.result.value)));
    const originalUser = decodeCurrentPcbDiagnosticJson(Buffer.from(sample.workerUserText));
    if (canonicalJson(user.parse(originalUser)) !== canonicalJson(sample.workerUser) || JSON.stringify(originalUser) !== sample.workerUserText) {
      throw new Error("ordered user differs");
    }
    if (sample.phase === "ui" && (canonicalJson(sample.cachedActor) !== canonicalJson(sample.startupActor) ||
        sample.workerUserText !== JSON.stringify({ uuid: sample.startupActor.uuid, nickname: sample.startupActor.nickname,
          username: sample.startupActor.username, avatar: sample.workerUser.avatar }))) { throw new Error("UI user differs"); }
    return freezeDeep(sample);
  } catch { throw new Error("PCB_WORKER_STARTUP_ACTOR_REPLY"); }
}
