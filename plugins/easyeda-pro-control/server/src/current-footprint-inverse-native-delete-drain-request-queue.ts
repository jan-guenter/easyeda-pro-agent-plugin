/** Inert V4-only four-reader scheduling. The V3 queue stays byte-exact. This class owns no native transport,
 * origin registry, receiver, request number or execution permission. Core
 * supplies its original sends; equal metadata cannot create such a closure. */
import{types}from"node:util";

type Family="local"|"returned"|"upload"|"drain";
export interface CurrentFootprintInverseNativeDeleteDrainRequestGroup{
 readonly family:Family;readonly helper:string|null;readonly helperFor:string|null;
}
interface Work{
 readonly group:CurrentFootprintInverseNativeDeleteDrainRequestGroup;
 readonly current:()=>void;readonly send:()=>Promise<unknown>;
 readonly result:ReturnType<typeof Promise.withResolvers<unknown>>;
}
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_REQUEST_QUEUE");}}
const same=(a:Readonly<{family:Family;key:string}>,b:CurrentFootprintInverseNativeDeleteDrainRequestGroup):boolean=>a.family===b.family&&a.key===b.helperFor;
export class CurrentFootprintInverseNativeDeleteDrainRequestQueue{
 readonly #waiting:Work[]=[];#active:Work|null=null;#helper:Readonly<{family:Family;key:string}>|null=null;
 #pending:Promise<void>|null=null;#ended=false;#failed=false;#failure:unknown;
 public constructor(){Object.freeze(this);}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;}this.#helper=null;for(const work of this.#waiting.splice(0)){work.result.reject(this.#failure);}}
 #select():number{if(this.#helper===null){return this.#waiting.length===0?-1:0;}return this.#waiting.findIndex(work=>this.#helper!==null&&same(this.#helper,work.group));}
 public enqueue(group:CurrentFootprintInverseNativeDeleteDrainRequestGroup,current:()=>void,send:()=>Promise<unknown>):Promise<unknown>{
  need(group.family==="local"||group.family==="returned"||group.family==="upload"||group.family==="drain");need(group.helper===null||group.helperFor===null);
  for(const key of[group.helper,group.helperFor]){need(key===null||/^[A-Za-z\d_.:/-]{1,160}$/u.test(key));}
  need(this.#active?.group.family!==group.family&&!this.#waiting.some(work=>work.group.family===group.family)&&this.#waiting.length<4);
  const result=Promise.withResolvers<unknown>();
  if(this.#failed){result.reject(this.#failure);return result.promise;}
  if(this.#ended){result.reject(new Error("INVERSE_NATIVE_DELETE_DRAIN_QUEUE_ORIGINAL_EXIT"));return result.promise;}
  try{current();}catch(error){this.#fail(error);result.reject(error);return result.promise;}if(group.helperFor!==null){need(this.#helper!==null&&same(this.#helper,group));}
  this.#waiting.push(Object.freeze({group:Object.freeze({...group}),current,send,result}));this.#pump();return result.promise;
 }
 #pump():void{
  if(this.#pending!==null||this.#ended||this.#failed){return;}const index=this.#select();if(index<0){return;}
  const work=this.#waiting.splice(index,1)[0];need(work!==undefined&&this.#active===null);
  const done=Promise.withResolvers<undefined>();this.#pending=done.promise;this.#active=work;
  void(async():Promise<void>=>{try{
   work.current();const group=work.group;
   if(group.helper!==null){need(this.#helper===null);this.#helper=Object.freeze({family:group.family,key:group.helper});}
   else if(group.helperFor===null){need(this.#helper===null);}else{need(this.#helper!==null&&same(this.#helper,group));}
   const pending=work.send();need(types.isPromise(pending));const value=await pending;
   if(this.#ended){work.result.reject(this.#failed?this.#failure:new Error("INVERSE_NATIVE_DELETE_DRAIN_QUEUE_ORIGINAL_EXIT"));return;}
   if(this.#failed){work.result.reject(this.#failure);return;}
   work.current();if(group.helperFor!==null){need(this.#helper!==null&&same(this.#helper,group));this.#helper=null;}work.result.resolve(value);
  }catch(error){this.#fail(error);work.result.reject(this.#failure);}finally{
   this.#active=null;this.#pending=null;
   // oxlint-disable-next-line unicorn/no-useless-undefined -- The original retained drain has an explicit undefined fulfillment type.
   done.resolve(undefined);this.#pump();
  }})();
 }
 public async settleAfterOriginalExit(assertOriginalExit:()=>void):Promise<void>{
  assertOriginalExit();this.#ended=true;for(const work of this.#waiting.splice(0)){work.result.reject(new Error("INVERSE_NATIVE_DELETE_DRAIN_QUEUE_ORIGINAL_EXIT"));}
  const pending=this.#pending;if(pending!==null){await pending;}assertOriginalExit();
 }
 public retained():Readonly<{waiting:number;active:boolean;helperPending:boolean;failed:boolean;ended:boolean}>{return Object.freeze({waiting:this.#waiting.length,active:this.#active!==null,helperPending:this.#helper!==null,failed:this.#failed,ended:this.#ended});}
}
Object.freeze(CurrentFootprintInverseNativeDeleteDrainRequestQueue.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteDrainRequestQueue);
