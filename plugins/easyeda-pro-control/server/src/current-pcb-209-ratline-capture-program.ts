/** Fixed passive relation reads for original paused209 ratline callbacks.
 * These functions neither invoke an application callback nor alter a registry. */
const prelude = `"use strict";const bad=()=>{throw new Error("PCB209_RATLINE_CAPTURE_RELATION");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const number=v=>{if(!Number.isSafeInteger(v)||v<0)bad();return v;};
const empty=a=>{if(!Array.isArray(a)||own(a,"length")!==0||Reflect.ownKeys(a).length!==1)bad();};`;
export const CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS = Object.freeze({
  same: 'function(other){"use strict";return this===other;}',
  construction: 'function(worker,manager,capturedManager){"use strict";return this===worker&&manager===capturedManager;}',
  bridge: `function(worker,bus){${prelude}if(own(this,"worker")!==worker||own(this,"bus")!==bus)bad();return true;}`,
  factory: `function(worker,bridge,bus){${prelude}
const next=number(own(this,"id"));if(next<1)bad();const id=next-1,map=own(this,"map"),bridges=own(this,"busMap");
if(Object.getPrototypeOf(map)!==Map.prototype||Map.prototype.get.call(map,id)!==worker||Map.prototype.has.call(map,id)!==true||
Reflect.apply(Object.getOwnPropertyDescriptor(Map.prototype,"size").get,map,[])!==1||
Reflect.ownKeys(bridges).length!==1||own(bridges,String(id))!==bridge||own(bridge,"worker")!==worker||own(bridge,"bus")!==bus)bad();
return {nativeWorkerId:id};}`,
  removed: `function(){${prelude}const map=own(this,"map"),bridges=own(this,"busMap");
if(Object.getPrototypeOf(map)!==Map.prototype||Reflect.apply(Object.getOwnPropertyDescriptor(Map.prototype,"size").get,map,[])!==0||Reflect.ownKeys(bridges).length!==0)bad();return true;}`,
  name: `function(){${prelude}return number(own(this,"workerName"));}`,
  world: `function(){${prelude}if(Reflect.ownKeys(this).length!==4||own(this,"docType")!==3)bad();const env=own(this,"env");
if(Reflect.ownKeys(env).length!==2)bad();return {documentUuid:own(this,"uuid"),projectUuid:own(this,"projectId"),tabId:own(env,"tabId"),windowTabId:own(env,"windowTabId")};}`,
  canvas: `function(request,reply){${prelude}const docs=own(request,"doc");
if(Reflect.ownKeys(request).length!==1||!Array.isArray(docs)||own(docs,"length")!==1||Reflect.ownKeys(docs).length!==2||own(reply,"success")!==true)bad();
return {documentUuid:own(docs,"0")};}`,
  /* Keep the exact empty-only contract. Rejected queue shape is bounded evidence,
   * never payload content or permission to execute a serialized empty batch. */
  empty: `function(){"use strict";
const fail=(reason,details)=>{throw new Error("PCB209_RATLINE_CAPTURE_RELATION "+JSON.stringify({reason,...details}));};
if(!Array.isArray(this))fail("not-array",{});
const length=Object.getOwnPropertyDescriptor(this,"length");
if(!length||!Object.hasOwn(length,"value")||!Number.isSafeInteger(length.value)||length.value<0)fail("length-descriptor",{});
if(length.value!==0){
const first=Object.getOwnPropertyDescriptor(this,"0"),data=first!==undefined&&Object.hasOwn(first,"value"),value=data?first.value:undefined;
fail("nonzero-length",{length:length.value,firstSlot:first===undefined?"absent":!data?"accessor":value===null?"null":typeof value,
firstStringLength:typeof value==="string"?value.length:null,firstIsEmptyJson:value==="[]"});}
if(Reflect.ownKeys(this).length!==1)fail("extra-own-keys",{});
return true;}`,
  payload: `function(){${prelude}if(Reflect.ownKeys(this).length!==2)bad();empty(own(this,"ratlineRes"));return {ratlineRes:[],workerName:number(own(this,"workerName"))};}`,
});
export type CurrentPcb209RatlineCaptureProgram = typeof CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS[keyof typeof CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS];
