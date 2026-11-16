/** V4-only full-source classifier for original conditional-script events.
 * A false evaluation has no corresponding pause. Classification therefore
 * uses the complete fixed predicate, never URL or the next breakpoint hit. */
import{types}from"node:util";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROUTER_MAXIMUM_EVENTS as MAX_EVENTS}from"./current-footprint-inverse-native-delete-caller-budget.ts";
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";

type Family="clock"|"caller"|"drain";
const source=z.strictObject({scriptSource:z.string().max(8192).refine(text=>text.isWellFormed()&&Buffer.byteLength(text)<=8192)});
const token=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export interface CurrentFootprintInverseNativeDeleteCallerConditionRouterBindings{
 readonly sessions:Readonly<{worker:string;ui:string}>;readonly contexts:Readonly<{worker:number;ui:number}>;
 readonly current:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalExit:()=>void;
 /** Only the original Core's actual issued helper slot can select this fast
  * path; reservation or a matching source URL alone cannot select a helper. */
 readonly originalHelper:(event:DiagnosticEvent)=>boolean;
 readonly requestSource:(event:DiagnosticEvent,ordinal:number)=>Promise<unknown>;
 readonly classify:(text:string,realm:"worker"|"ui")=>readonly Family[];
 readonly deliverCondition:(family:Family,event:DiagnosticEvent,text:string)=>void;
 readonly deliver:(event:DiagnosticEvent)=>boolean;readonly fail:(cause:unknown)=>void;
}
interface Work{readonly event:DiagnosticEvent;readonly condition:boolean}
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_CALLER_CONDITION_ROUTER");}}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteCallerConditionRouter{
 readonly #b:CurrentFootprintInverseNativeDeleteCallerConditionRouterBindings;readonly #waiting:Work[]=[];readonly #seen=new Set<string>();
 readonly #receipts:Readonly<{event:DiagnosticEvent;source:unknown;family:Family}>[]=[];
 #pending:Promise<void>|null=null;#failed=false;#cause:unknown;#ended=false;#reads=0;#events=0;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteCallerConditionRouterBindings){this.#b=Object.freeze({...bindings});originals.add(this);Object.freeze(this);}
 #current():void{if(this.#failed){throw this.#cause;}this.#b.current();need(!this.#ended);}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#cause=cause;this.#waiting.splice(0);try{this.#b.fail(cause);}catch{
 // Keep the actual original failure, including undefined, through teardown.
 }}}
 #realm(event:DiagnosticEvent):"worker"|"ui"|null{if(event.sessionId===this.#b.sessions.worker){return"worker";}return event.sessionId===this.#b.sessions.ui?"ui":null;}
 /** The stream reader calls this synchronously for its original event only.
  * Known issued helpers bypass queued classification to avoid stranding the
  * helper/source atomic section needed by the classifier's original request. */
 public observe(event:DiagnosticEvent):boolean{
  const realm=this.#realm(event);if(realm===null){return false;}
  try{this.#current();this.#b.assertOriginalEvent(event);if(this.#b.originalHelper(event)){return true;}
   const condition=event.method==="Debugger.scriptParsed";
   if(!condition&&this.#pending===null&&this.#waiting.length===0){return this.#b.deliver(event);}
   if(!condition&&!["Debugger.paused","Debugger.resumed","Debugger.breakpointResolved"].includes(event.method)){return false;}
   need((this.#events+=1)<=MAX_EVENTS&&this.#waiting.length<MAX_EVENTS);
   if(condition){need(event.params["executionContextId"]===this.#b.contexts[realm]);const id=token.parse(event.params["scriptId"]);need(!this.#seen.has(`${realm}:${id}`));this.#seen.add(`${realm}:${id}`);}
   this.#waiting.push(Object.freeze({event,condition}));this.#pump();return true;
  }catch(error){this.#fail(error);throw error;}
 }
 #pump():void{
  if(this.#pending!==null||this.#failed||this.#ended||this.#waiting.length===0){return;}
  const done=Promise.withResolvers<undefined>();this.#pending=done.promise;
  void(async():Promise<void>=>{try{while(this.#waiting.length>0){
   this.#current();const work=this.#waiting.shift();need(work!==undefined);const event=work.event;this.#b.assertOriginalEvent(event);
   if(work.condition){
   const realm=this.#realm(event);need(realm!==null&&(this.#reads+=1)<=16);const pending=this.#b.requestSource(event,this.#reads-1);need(types.isPromise(pending));const raw=await pending;this.#current();this.#b.assertOriginalEvent(event);
   const text=source.parse(raw).scriptSource;const matched=this.#b.classify(text,realm);need(matched.length===1);const family=matched[0];need(family!==undefined&&(family==="clock"||family==="caller"||family==="drain"));
   this.#receipts.push(Object.freeze({event,source:raw,family}));this.#b.deliverCondition(family,event,text);this.#current();}else{need(this.#b.deliver(event));}
  }}catch(error){this.#fail(error);}finally{this.#pending=null;
   // oxlint-disable-next-line unicorn/no-useless-undefined -- This original retained pump has an explicit undefined fulfillment type.
   done.resolve(undefined);this.#pump();
  }})();
 }
 public async joinCurrent():Promise<void>{this.#current();while(this.#pending!==null){const pending=this.#pending;await pending;this.#current();}need(this.#waiting.length===0);}
 public retained():Readonly<{reads:number;receipts:number;queued:number;pending:boolean;failed:boolean;ended:boolean}>{return Object.freeze({reads:this.#reads,receipts:this.#receipts.length,queued:this.#waiting.length,pending:this.#pending!==null,failed:this.#failed,ended:this.#ended});}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#ended=true;this.#waiting.splice(0);const pending=this.#pending;if(pending!==null){await pending;}this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteCallerConditionRouter.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteCallerConditionRouter);
export function assertOriginalCurrentFootprintInverseNativeDeleteCallerConditionRouter(value:CurrentFootprintInverseNativeDeleteCallerConditionRouter):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteCallerConditionRouter.prototype&&Reflect.ownKeys(value).length===0);}
