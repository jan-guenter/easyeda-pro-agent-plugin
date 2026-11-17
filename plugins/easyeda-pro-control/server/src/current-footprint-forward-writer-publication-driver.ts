/** Same original four callback points, distinct ready-state component. It
 * never rearms a point, invokes a callback or reopens a startup receipt. */
import {captureCurrentFootprintForwardExecutionPrototypes,requireCurrentFootprintForwardExecutionPrototypes} from "./current-footprint-forward-execution-opening-identity.ts";
import {z} from "zod";
// oxlint-disable-next-line import/no-cycle -- Original Core custody is resolved only by this later original driver construction.
import {requireOriginalCurrentFootprintForwardWriterPublicationOrigin} from "./current-footprint-forward-writer-publication-origin.ts";
import type {CurrentFootprintForwardWriterPublicationBindings,CurrentFootprintForwardWriterPublicationOrigin} from "./current-footprint-forward-writer-publication-origin.ts";
// oxlint-disable-next-line import/no-cycle -- The same later original driver resolves callbacks only after Core installs its private registry.
import {CurrentFootprintForwardWriterPublicationCallbacks} from "./current-footprint-forward-writer-publication-callbacks.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES} from "./current-footprint-forward-writer-frontier-protocol.ts";
import {validateCurrentFootprintForwardWriterPublicationCommand} from "./current-footprint-forward-writer-publication-protocol.ts";
import type {CurrentFootprintForwardWriterPublicationCommand} from "./current-footprint-forward-writer-publication-protocol.ts";
import type {CurrentFootprintForwardWriterStartupFrontierEvent as Event} from "./current-footprint-forward-writer-frontier-origin.ts";

const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(z.looseObject({callFrameId:handle})).min(1).max(64)});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_WRITER_PUBLICATION_${code}`);}}
type Receipt=Readonly<{publicationQuiescent:true;executionAuthorized:false;completeProducerFrontierVerified:false}>;
export class CurrentFootprintForwardWriterPublicationDriver{
 readonly #origin:CurrentFootprintForwardWriterPublicationOrigin;readonly #owner:object;readonly #operation:object;readonly #binding:CurrentFootprintForwardWriterPublicationBindings;
 readonly #points=new Map<string,string>();readonly #callbacks:CurrentFootprintForwardWriterPublicationCallbacks;
 readonly #events:Event[]=[];#waiter:ReturnType<typeof Promise.withResolvers<Event>>|null=null;
 #tail:Promise<void>=Promise.resolve();#active:Readonly<{role:string;event:Event}>|null=null;#resumeAttempted=false;
 #finishPending:Promise<Receipt>|null=null;
 #bodyBound=false;#failed=false;#closed=false;#completionAttempted=false;#queueOpened=false;#complete=false;
 public constructor(origin:CurrentFootprintForwardWriterPublicationOrigin,owner:object,operation:object){
  this.#origin=origin;this.#owner=owner;this.#operation=operation;this.#binding=requireOriginalCurrentFootprintForwardWriterPublicationOrigin(origin,owner,operation);
  for(const role of CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES){const id=handle.parse(this.#binding.originalPoint(role));need(!this.#points.has(id),"ORIGINAL_POINT_ALIAS");this.#points.set(id,role);}
  need(this.#points.size===4,"ORIGINAL_POINT_ROSTER");this.#callbacks=new CurrentFootprintForwardWriterPublicationCallbacks(origin,owner,operation);Object.freeze(this);
 }
 #current():void{need(!this.#failed&&!this.#closed&&requireOriginalCurrentFootprintForwardWriterPublicationOrigin(this.#origin,this.#owner,this.#operation)===this.#binding,"ORIGINAL");this.#binding.assertCurrent();}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#binding.fail(cause);}}
 public bindOriginalBody():void{this.#current();need(!this.#bodyBound&&!this.#completionAttempted&&this.#active===null,"BODY_ONCE");this.#bodyBound=true;}
 public acceptsPause(input:unknown):boolean{try{return this.#points.has(paused.parse(input).hitBreakpoints[0]);}catch{return false;}}
 #enqueue(event:Event):void{const waiter=this.#waiter;if(waiter!==null){this.#waiter=null;waiter.resolve(event);return;}need(this.#events.length<2,"EVENT_QUEUE");this.#events.push(event);}
 public paused(input:unknown):void{
  try{this.#current();need(this.#bodyBound&&!this.#queueOpened&&!this.#complete&&this.#active===null,"HELD_ONCE");const value=paused.parse(input);const role=this.#points.get(value.hitBreakpoints[0]);need(role!==undefined,"ORIGINAL_POINT");
   const event:Event=Object.freeze({method:"Debugger.paused",sessionId:this.#binding.actual.sessionId,params:input});this.#active=Object.freeze({role,event});this.#resumeAttempted=false;this.#enqueue(event);
   const prior=this.#tail,work=(async():Promise<void>=>{await prior;this.#current();await this.#callbacks.serviceOriginalHeld();this.#current();})();this.#tail=work;
   void(async():Promise<void>=>{try{await work;}catch(error){this.#fail(error);}})();
  }catch(error){this.#fail(error);}
 }
 public hasActivePause():boolean{return this.#active!==null;}
 public resumed():void{try{this.#current();need(this.#active!==null&&this.#resumeAttempted,"ORIGINAL_RESUMED");this.#active=null;this.#enqueue(Object.freeze({method:"Debugger.resumed",sessionId:this.#binding.actual.sessionId,params:Object.freeze({})}));}catch(error){this.#fail(error);}}
 public nextEvent():Promise<Event>{
  this.#current();need(this.#waiter===null,"READ_ONCE");const event=this.#events.shift();if(event!==undefined){return Promise.resolve(event);}
  const waiter=Promise.withResolvers<Event>();this.#waiter=waiter;void(async():Promise<void>=>{try{await waiter.promise;}catch{
   // The original callback and exit join retain this same rejection.
  }})();return waiter.promise;
 }
 public requireRequest(input:CurrentFootprintForwardWriterPublicationCommand):void{
  this.#current();const value=validateCurrentFootprintForwardWriterPublicationCommand(input);const command=value.command;need(this.#bodyBound&&!this.#complete,"BODY_REQUIRED");
  if(value.lane==="queue"){need(this.#completionAttempted&&this.#queueOpened&&this.#active===null,"ORIGINAL_QUEUE_BOUNDARY");return;}
  const active=this.#active;need(!this.#queueOpened&&active!==null&&!this.#resumeAttempted,"ORIGINAL_HELD_REQUEST");
  if(command.method==="Debugger.resume"){need("role" in command&&command.role===active.role,"ORIGINAL_RESUME_ROLE");this.#resumeAttempted=true;}
 }
 /** Core separately proves both original parser and post-sync returns. */
 public finish():Promise<Receipt>{
  try{this.#current();need(this.#bodyBound&&!this.#completionAttempted,"FINISH_ONCE");this.#completionAttempted=true;
   const completion=Promise.withResolvers<Receipt>();this.#finishPending=completion.promise;
   void(async():Promise<void>=>{try{completion.resolve(await this.#finishOriginal());}catch(error){completion.reject(error);}})();return completion.promise;
  }catch(error){
   // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Preserve the original synchronous custody failure in the existing Promise API.
   return Promise.reject(error);
  }
 }
 async #finishOriginal():Promise<Receipt>{
  try{await this.#tail;this.#current();need(this.#active===null,"NO_HELD_CALLBACK");this.#queueOpened=true;await this.#callbacks.verifyOriginalQueue();this.#current();await this.#binding.control("complete");this.#current();
   const result=Object.freeze({publicationQuiescent:true as const,executionAuthorized:false as const,completeProducerFrontierVerified:false as const});
   await this.#binding.journal("publication-result",result);this.#current();this.#complete=true;return result;
  }catch(error){this.#fail(error);throw error;}
 }
 public async endAfterOriginalExit():Promise<void>{
  need(!this.#closed,"EXIT_ONCE");await this.#binding.assertOriginalGenerationExited();this.#closed=true;this.#waiter?.reject(new Error("FORWARD_WRITER_PUBLICATION_ORIGINAL_EXIT"));this.#waiter=null;
  await Promise.allSettled([this.#tail,...(this.#finishPending===null?[]:[this.#finishPending])]);this.#events.length=0;this.#active=null;
 }
 public status():Readonly<Record<string,unknown>>{return Object.freeze({bodyBound:this.#bodyBound,failed:this.#failed,closed:this.#closed,completed:this.#complete,heldRole:this.#active?.role??null,callbacks:this.#callbacks.status(),executionAuthorized:false});}
}
Object.freeze(CurrentFootprintForwardWriterPublicationDriver.prototype);Object.freeze(CurrentFootprintForwardWriterPublicationDriver);

/** Eager defining-module snapshot avoids cyclic import TDZ and first-use trust. */
const originalClassPrototype=captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterPublicationDriver.prototype);
export function assertOriginalCurrentFootprintForwardWriterPublicationDriverClass():void{requireCurrentFootprintForwardExecutionPrototypes(originalClassPrototype);}
