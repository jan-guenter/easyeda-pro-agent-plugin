/** Dormant append-only worker instrumentation. No command registration, owner
 * issuance, native publication, create or Save. WORKERb849bd12: KP@9714,
 * wu@7925, JP@11669, project batch subscriber@2112925.
 *
 * KP's unsafe task receives the same object AFTER the original native handler.
 * That handler adds document.length=0. This is a delivered subscription payload,
 * not the pristine renderer publication or proof that remoteChange succeeded.
 * Descriptor checks cannot detect Proxy traps during callback execution. A
 * future owner must separately admit publishers, including JP local self-post.
 */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { compareCurrentPcbStringPublication } from "./current-pcb-string-publication.ts";
import type { CurrentPcbStringPublicationPlan } from "./current-pcb-string-publication.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_CAPTURE_TOPIC = "/pro-mgr/worker/batchPendData";
export const CURRENT_PCB_STRING_CAPTURE_BOUNDS = Object.freeze({
  messages: 16, payloadBytes: 8192, totalPayloadBytes: 65_536, nodes: 2048, depth: 8, replyBytes: 196_608,
});
export const CURRENT_PCB_STRING_CAPTURE_LIMITS = Object.freeze({
  originalOwnerVerified: false, originalPublicationVerified: false, exclusivePublisherVerified: false,
  workerHandlerSucceeded: false, queueCompletionVerified: false, deliveryCompletionVerified: false,
  createAuthorized: false, saveAuthorized: false, executionAuthorized: false,
} as const);

/** Literal method bodies from the pinned worker; source equality is an extra
 * admission check, not a replacement for original worker/context ownership. */
export const CURRENT_PCB_STRING_CAPTURE_NATIVE = Object.freeze({
  subscribe: 'subscribe(e,t){console.debug("BC",this.uuid,"SUBSCRIBE",e);let s=new wu(t,!0);return Ac(this.subscribed,e).push(s),s}',
  cancel: "cancel(){this.callback=null,this.isRunning=!1}",
  running: "running(){return this.isRunning}",
  execute: "async execute(e){try{e=this.unsafe?e:op(e),this.callback(e)}catch(t){console.error(t)}}",
  received: 'onReceivedPublish(e,t,s){console.debug("BCMSG(",this.uuid,")","from",e,"PUBLISH",t,"message",s);let r=this.subscribed[t];if(r){let i;for(let n of r)n.running()?n.execute(s):(i=i||new Array,i.push(n));if(i)for(let n of i)Hg(r,n);r.length===0&&delete this.subscribed[t]}}',
  callback: "s=>{let[r,i,n]=s;for(let a in r){for(let[o,c,l,u]of r[a].pend)this.consistencyManager.remoteChange(c,i,a,o,u,l,r[a].type,void 0,void 0,!0,void 0,n);r[a].length=0}}",
});

/** Evaluate exactly once on an already admitted original project worker, with
 * returnByValue:false. Retain its returned remote objectId; never rediscover the
 * handle through globals. This instrumenting call cannot use throwOnSideEffect.
 * It only appends an observer, and never changes the native peer execution order.
 */
export const CURRENT_PCB_STRING_PUBLICATION_CAPTURE_ARM_EXPRESSION = `(()=>{
"use strict";
const bad=()=>{throw new Error("PCB_STRING_CAPTURE_STATE");};
const topic=${JSON.stringify(CURRENT_PCB_STRING_CAPTURE_TOPIC)},native=${JSON.stringify(CURRENT_PCB_STRING_CAPTURE_NATIVE)};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const source=own(Function.prototype,"toString");
const method=(p,k,text)=>{const f=own(p,k);if(typeof f!=="function"||Reflect.apply(source,f,[])!==text)bad();return f;};
const named=(o,name)=>{const p=Object.getPrototypeOf(o),c=own(p,"constructor");if(own(c,"name")!==name||own(c,"prototype")!==p)bad();return p;};
const plain=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const dense=(a,n)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||own(a,"length")!==n)bad();const k=Reflect.ownKeys(a);if(k.length!==n+1||k[n]!=="length")bad();for(let i=0;i<n;i++)own(a,String(i));return a;};
const id=(v,re)=>{if(typeof v!=="string"||v.length>128||!re.test(v))bad();return v;};
const project=own(globalThis,"PROJECT");named(project,"Lg");
const projectUuid=id(own(project,"uuid"),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid=id(own(project,"_branchUuid"),/^[a-f0-9]{32}$/);
const windowTabId=id(own(globalThis,"_TAB_ID_"),/^[A-Za-z0-9_-]{1,128}$/),channelName="/"+windowTabId+"/project/"+projectUuid;
const bus=own(project,"workerBus"),busPrototype=named(bus,"JP"),parent=Object.getPrototypeOf(busPrototype);
if(own(own(parent,"constructor"),"name")!=="KP"||own(globalThis,channelName)!==bus)bad();
const subscribe=method(parent,"subscribe",native.subscribe),received=method(parent,"onReceivedPublish",native.received);
if(Object.hasOwn(bus,"subscribe")||Object.hasOwn(bus,"onReceivedPublish"))bad();
const bc=own(bus,"bc"),busUuid=id(own(bus,"uuid"),/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
const subscriptions=plain(own(bus,"subscribed")),peers=dense(own(subscriptions,topic),1),originalTask=own(peers,"0");
const taskShape=o=>{const k=Reflect.ownKeys(o);if(k.length!==3||k.some(v=>!["callback","unsafe","isRunning"].includes(v)))bad();
for(const key of k){const d=Object.getOwnPropertyDescriptor(o,key);if(!d||!Object.hasOwn(d,"value")||d.enumerable!==true||d.writable!==true||d.configurable!==true)bad();}};
taskShape(originalTask);
const taskPrototype=named(originalTask,"wu"),cancel=method(taskPrototype,"cancel",native.cancel);
const running=method(taskPrototype,"running",native.running),execute=method(taskPrototype,"execute",native.execute);
const originalCallback=own(originalTask,"callback");if(typeof originalCallback!=="function"||Reflect.apply(source,originalCallback,[])!==native.callback||
own(originalTask,"unsafe")!==true||own(originalTask,"isRunning")!==true)bad();
const identity=Object.freeze({projectUuid,branchUuid,windowTabId,channelName});
let task=null,armed=false,finished=false,cleanup="not-attempted",firstFailure=null,overflow=false,lateCallbackObserved=false,observedCallbacks=0,totalPayloadBytes=0;
const events=[];let snapshot="";
const utf8=s=>{if(!s.isWellFormed())bad();let n=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);n+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;}return n;};
const update=()=>{snapshot=JSON.stringify({schema:"easyeda-pro-control.pcb-string-publication-capture.v1",identity,topic,armed,finished,cleanup,
firstFailure,overflow,lateCallbackObserved,observedCallbacks,callbackCountExact:!overflow&&!lateCallbackObserved,totalPayloadBytes,events,
observedSubscriptionIntervalComplete:armed&&finished&&cleanup==="cancelled-tombstone-retained"&&firstFailure===null&&!overflow&&!lateCallbackObserved});};
const owner=()=>{
if(own(globalThis,"PROJECT")!==project||own(project,"uuid")!==projectUuid||own(project,"_branchUuid")!==branchUuid||
own(globalThis,"_TAB_ID_")!==windowTabId||own(globalThis,channelName)!==bus||own(project,"workerBus")!==bus||
Object.getPrototypeOf(bus)!==busPrototype||Object.getPrototypeOf(busPrototype)!==parent||
own(bus,"bc")!==bc||own(bus,"uuid")!==busUuid||Object.hasOwn(bus,"subscribe")||Object.hasOwn(bus,"onReceivedPublish")||
own(bus,"subscribed")!==subscriptions||own(subscriptions,topic)!==peers||own(parent,"subscribe")!==subscribe||
own(parent,"onReceivedPublish")!==received||own(taskPrototype,"cancel")!==cancel||own(taskPrototype,"running")!==running||
own(taskPrototype,"execute")!==execute||Object.getPrototypeOf(originalTask)!==taskPrototype||
own(originalTask,"callback")!==originalCallback||own(originalTask,"unsafe")!==true||own(originalTask,"isRunning")!==true)bad();
};
const membership=()=>{
owner();taskShape(originalTask);taskShape(task);dense(peers,2);if(own(peers,"0")!==originalTask||own(peers,"1")!==task||Object.getPrototypeOf(task)!==taskPrototype||
own(task,"unsafe")!==true||own(task,"callback")!==(finished?null:capture)||own(task,"isRunning")!==!finished)bad();
};
const copyPayload=value=>{
let nodes=0;
const copy=(v,depth)=>{
if(++nodes>2048||depth>8)bad();
if(v===null||typeof v==="boolean")return v;
if(typeof v==="string"){if(v.length>8192||!v.isWellFormed())bad();return v;}
if(typeof v==="number"){if(!Number.isFinite(v)||Object.is(v,-0))bad();return v;}
if(Array.isArray(v)){const n=own(v,"length");if(!Number.isSafeInteger(n)||n<0||n>256)bad();dense(v,n);const r=[];for(let i=0;i<n;i++)r.push(copy(own(v,String(i)),depth+1));return r;}
plain(v);const k=Reflect.ownKeys(v);if(k.length>128)bad();const r=Object.create(null);
for(const key of k){if(typeof key!=="string"||key.length>128||!key.isWellFormed())bad();const d=Object.getOwnPropertyDescriptor(v,key);if(!d||!Object.hasOwn(d,"value")||d.enumerable!==true)bad();Object.defineProperty(r,key,{value:copy(d.value,depth+1),enumerable:true});}return r;
};
const text=JSON.stringify(copy(value,0)),bytes=utf8(text);if(bytes>8192||totalPayloadBytes+bytes>65536)bad();return {text,bytes};
};
const capture=function(...args){
if(finished){lateCallbackObserved=true;firstFailure=firstFailure||"LATE_CALLBACK";update();return;}
if(observedCallbacks>=16){observedCallbacks=17;overflow=true;firstFailure=firstFailure||"CAPACITY";update();return;}
observedCallbacks++;let code="OWNER";
try{membership();code="PAYLOAD";if(args.length!==1)bad();const copied=copyPayload(args[0]);totalPayloadBytes+=copied.bytes;
events.push(Object.freeze({sequence:observedCallbacks,status:"payload",payloadJson:copied.text,error:null}));}
catch{firstFailure=firstFailure||code;events.push(Object.freeze({sequence:observedCallbacks,status:"error",payloadJson:null,error:code}));}
update();
};
const handle=Object.create(null);
const read=function(){if(this!==handle)bad();if(armed&&cleanup!=="unresolved")membership();return snapshot;};
const finish=function(){
if(this!==handle)bad();if(finished||cleanup!=="not-attempted")bad();
try{membership();Reflect.apply(cancel,task,[]);finished=true;membership();cleanup="cancelled-tombstone-retained";}
catch{cleanup="unresolved";firstFailure=firstFailure||"CLEANUP";}
update();return snapshot;
};
Object.defineProperties(handle,{read:{value:read,enumerable:true},finish:{value:finish,enumerable:true}});
Object.freeze(handle);
owner();
try{task=Reflect.apply(subscribe,bus,[topic,capture]);armed=true;membership();}
catch{firstFailure="ARM";cleanup="unresolved";}
update();return handle;
})()`;

/** Both calls require the exact objectId returned by the original arm. A copied
 * JSON value, a newly evaluated lookalike or another context is not that handle.
 * Read is synchronous/read-only and MUST use throwOnSideEffect:true. Finish is
 * explicitly instrumenting: original cancel leaves an inert native tombstone.
 * No splice, peer cancellation, extra publish or arbitrary method is permitted.
 */
function handleCall(method: "read" | "finish"): string {
  return `function(){"use strict";const d=Object.getOwnPropertyDescriptor(this,${JSON.stringify(method)});
if(Object.getPrototypeOf(this)!==null||!Object.isFrozen(this)||Reflect.ownKeys(this).length!==2||!d||
!Object.hasOwn(d,"value")||typeof d.value!=="function")throw new Error("PCB_STRING_CAPTURE_HANDLE");
return Reflect.apply(d.value,this,[]);}`;
}
export const CURRENT_PCB_STRING_PUBLICATION_CAPTURE_READ_FUNCTION = handleCall("read");
export const CURRENT_PCB_STRING_PUBLICATION_CAPTURE_FINISH_FUNCTION = handleCall("finish");

const integer = z.number().int().min(0).refine(value => !Object.is(value, -0));
const failure = z.enum(["ARM", "OWNER", "PAYLOAD", "CAPACITY", "LATE_CALLBACK", "CLEANUP"]);
const eventSchema = z.object({ sequence: integer.min(1).max(16), status: z.enum(["payload", "error"]),
  payloadJson: z.string().max(8192).nullable(), error: z.enum(["OWNER", "PAYLOAD"]).nullable() }).strict();
function validPayloadJson(text: string): boolean {
  try { decodeCurrentPcbDiagnosticJson(Buffer.from(text)); return true; } catch { return false; }
}
const schema = z.object({
  schema: z.literal("easyeda-pro-control.pcb-string-publication-capture.v1"),
  identity: z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
    branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u),
    channelName: z.string().max(203) }).strict(),
  topic: z.literal(CURRENT_PCB_STRING_CAPTURE_TOPIC), armed: z.boolean(), finished: z.boolean(),
  cleanup: z.enum(["not-attempted", "cancelled-tombstone-retained", "unresolved"]), firstFailure: failure.nullable(),
  overflow: z.boolean(), lateCallbackObserved: z.boolean(), observedCallbacks: integer.max(17), callbackCountExact: z.boolean(),
  totalPayloadBytes: integer.max(65_536), observedSubscriptionIntervalComplete: z.boolean(),
  events: z.array(eventSchema).max(16),
}).strict().superRefine((value, context) => {
  let bytes = 0;
  const reject = (): void => { context.addIssue({ code: "custom", message: "Capture relation differs." }); };
  if (value.identity.channelName !== `/${value.identity.windowTabId}/project/${value.identity.projectUuid}` ||
      value.observedCallbacks !== (value.overflow ? 17 : value.events.length) ||
      value.callbackCountExact !== (!value.overflow && !value.lateCallbackObserved) ||
      value.overflow && value.events.length !== 16 || value.lateCallbackObserved && (!value.finished || value.firstFailure === null)) { reject(); }
  for (const [index, event] of value.events.entries()) {
    if (event.sequence !== index + 1) { reject(); }
    if (event.status === "payload") {
      if (event.payloadJson === null || event.error !== null || !event.payloadJson.isWellFormed()) { reject(); }
      else {
        const n = Buffer.byteLength(event.payloadJson); bytes += n;
        if (n > 8192 || !validPayloadJson(event.payloadJson)) { reject(); }
      }
    } else if (event.payloadJson !== null || event.error === null || value.firstFailure === null) { reject(); }
  }
  const complete = value.armed && value.finished && value.cleanup === "cancelled-tombstone-retained" &&
    value.firstFailure === null && !value.overflow && !value.lateCallbackObserved;
  if (value.totalPayloadBytes !== bytes || value.observedSubscriptionIntervalComplete !== complete ||
      value.cleanup === "cancelled-tombstone-retained" && (!value.armed || !value.finished) ||
      value.finished && value.cleanup === "not-attempted" ||
      !value.armed && (value.firstFailure !== "ARM" || value.cleanup !== "unresolved" || value.events.length > 0 || value.finished) ||
      value.overflow && value.firstFailure === null) { reject(); }
});
export type CurrentPcbStringPublicationCapture = Readonly<z.infer<typeof schema>> & typeof CURRENT_PCB_STRING_CAPTURE_LIMITS &
  Readonly<{ suppliedSnapshotSha256: string; deliveredPayloadSha256s: readonly (string | null)[] }>;

function field(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value)) {
    throw new Error("PCB_STRING_CAPTURE_REPLY");
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  const actual = Reflect.ownKeys(value);
  if (prototype !== null && prototype !== Object.prototype || actual.length !== keys.length ||
      actual.some(key => typeof key !== "string" || !keys.includes(key))) { throw new Error("PCB_STRING_CAPTURE_REPLY"); }
  const output: Record<string, unknown> = {};
  for (const key of keys) {
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (d === undefined || !Object.hasOwn(d, "value")) { throw new Error("PCB_STRING_CAPTURE_REPLY"); }
    output[key] = d.value as unknown;
  }
  return output;
}

/** A decoded supplied snapshot is not original remote-handle evidence. The
 * future original owner must retain arm context/objectId and bracket the actual
 * create/Save interval. All native/lifecycle authority flags remain false. */
export function decodeCurrentPcbStringPublicationCapture(input: unknown): CurrentPcbStringPublicationCapture {
  const wrapper = field(input, ["result"]);
  const result = field(wrapper["result"], ["type", "value"]), text = result["value"];
  if (result["type"] !== "string" || typeof text !== "string" || !text.isWellFormed() ||
      Buffer.byteLength(text) > CURRENT_PCB_STRING_CAPTURE_BOUNDS.replyBytes) { throw new Error("PCB_STRING_CAPTURE_REPLY"); }
  try {
    const parsed = schema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(text)));
    const deliveredPayloadSha256s = parsed.events.map(event => event.payloadJson === null ? null :
      createHash("sha256").update(event.payloadJson).digest("hex"));
    return freezeDeep({ ...parsed, suppliedSnapshotSha256: createHash("sha256").update(text).digest("hex"),
      deliveredPayloadSha256s, ...CURRENT_PCB_STRING_CAPTURE_LIMITS });
  } catch { throw new Error("PCB_STRING_CAPTURE_REPLY"); }
}

const pendingRecord = z.tuple([z.string(), z.number(), z.literal("STRING"), z.string()]);
const deliveredDocument = z.object({ type: z.literal("PCB"), pend: z.tuple([pendingRecord]), length: integer.max(0) }).strict();
const deliveredPayload = z.tuple([z.record(z.string(), deliveredDocument), z.string(), z.string(), z.string()]);

/** This supplied-data relation removes ONLY the native worker handler's added
 * document.length=0, then uses the original publication plan comparator. The
 * unprojected delivered bytes/hash remain in capture. This does not prove what
 * was sent, that native remoteChange succeeded, who sent it, or queue completion.
 */
export function compareCapturedCurrentPcbStringPublication(plan: CurrentPcbStringPublicationPlan, raw: unknown):
  Readonly<{ suppliedDeliveredPayloadMatchesPrediction: true; capture: CurrentPcbStringPublicationCapture;
    publicationProjectionSha256: string }> {
  const capture = decodeCurrentPcbStringPublicationCapture(raw), event = capture.events[0];
  if (!capture.observedSubscriptionIntervalComplete || capture.events.length !== 1 || event?.payloadJson === null ||
      event?.payloadJson === undefined || event.status !== "payload") { throw new Error("PCB_STRING_CAPTURE_PUBLICATION"); }
  const payload = deliveredPayload.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(event.payloadJson)));
  const documents = payload[0], keys = Object.keys(documents);
  // Original-plan identity is checked before any plan field is trusted.
  if (plan === null || typeof plan !== "object" || types.isProxy(plan)) { throw new Error("PCB_STRING_CAPTURE_PUBLICATION"); }
  const descriptor = Object.getOwnPropertyDescriptor(plan, "expectedPayload");
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("PCB_STRING_CAPTURE_PUBLICATION"); }
  compareCurrentPcbStringPublication(plan, descriptor.value as unknown);
  if (keys.length !== 1 || keys[0] !== plan.documentUuid) { throw new Error("PCB_STRING_CAPTURE_PUBLICATION"); }
  const document = documents[plan.documentUuid];
  if (document === undefined) { throw new Error("PCB_STRING_CAPTURE_PUBLICATION"); }
  const projected = [{ [plan.documentUuid]: { type: document.type, pend: document.pend } }, payload[1], payload[2], payload[3]];
  const compared = compareCurrentPcbStringPublication(plan, projected);
  return Object.freeze({ suppliedDeliveredPayloadMatchesPrediction: true, capture,
    publicationProjectionSha256: compared.payloadProjectionSha256 });
}

export const CURRENT_PCB_STRING_PUBLICATION_CAPTURE_HASHES = Object.freeze({
  arm: createHash("sha256").update(CURRENT_PCB_STRING_PUBLICATION_CAPTURE_ARM_EXPRESSION).digest("hex"),
  read: createHash("sha256").update(CURRENT_PCB_STRING_PUBLICATION_CAPTURE_READ_FUNCTION).digest("hex"),
  finish: createHash("sha256").update(CURRENT_PCB_STRING_PUBLICATION_CAPTURE_FINISH_FUNCTION).digest("hex"),
});
