/** Fixed original SDK prefix. The service entry stays held before its handler;
 * this prefix authorizes no handler continuation or deletion completion. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

const checks = String.raw`"use strict";const seen=[],bad=()=>{throw "FOOTPRINT_INVERSE_PUBLIC_CALL_BINDING";};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const dense=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let j=0;j<n;j++)own(o,j);};
const same=()=>{for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}return true;};
const sdk=(original,callees)=>{dense(original,8);dense(callees,18);if(typeof own(original,7)!=="function"||own(original,7)()!==true||typeof own(callees,17)!=="function"||own(callees,17)()!==true)bad();const lib=own(original,1),bus=own(original,5);if(own(globalThis,"_EXTAPI_ROOT_")!==own(original,0)||own(own(original,0),"lib_Footprint")!==lib||own(globalThis,"_MSG_BUS2_EXTAPI_")!==bus||own(own(original,3),"extensionApiMessageBus2")!==bus||own(bus,"unsafe")!==true)bad();return{lib,bus};};`;
const invoke = String.raw`function(originalCallees,target){${checks}if(typeof target!=="string"||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(target))bad();const{lib,bus}=sdk(this,originalCallees),callTicket=own(bus,"rpcTicket"),callUuid=own(bus,"uuid");if(!Number.isSafeInteger(callTicket)||callTicket<0||typeof callUuid!=="string"||!/^[A-Za-z0-9_.:-]{1,128}$/.test(callUuid)||lib.delete!==own(this,2))bad();same();return lib.delete(target,"Project");}`;
// Every object dereferenced by entry has already had its own correlated
// Runtime.getProperties packet qualified as non-Proxy by the original host.
const entry = String.raw`function(original,callees,task,handler,dispatch,target){${checks}dense(this,5);dense(task,3);dense(handler,1);dense(dispatch,2);const{bus}=sdk(original,callees),packet=own(this,1),message=own(packet,"message"),reply=own(packet,"replyTopic"),ticket=own(dispatch,0),uuid=own(dispatch,1),topic="extensionApi.LIB_Footprint.delete";if(own(this,0)!==bus||own(this,2)!==topic||own(this,3)!==own(handler,0)||own(this,4)!==own(task,1)||own(own(task,0),"callback")!==own(task,1)||own(own(task,0),"unsafe")!==true||own(own(task,0),"isRunning")!==true||!Number.isSafeInteger(ticket)||ticket<0||own(bus,"rpcTicket")!==ticket+1||own(bus,"uuid")!==uuid||typeof reply!=="string"||reply!=="_MSG_BUS_RPC_-"+topic+"-"+uuid+"-"+ticket||Object.getPrototypeOf(packet)!==Object.prototype||Reflect.ownKeys(packet).length!==2||Object.getPrototypeOf(message)!==Object.prototype||Reflect.ownKeys(message).length!==2||own(message,"footprintUuid")!==target||own(message,"libraryUuid")!=="Project")bad();same();return[packet,message,reply,same];}`;
const reprove = String.raw`function(){${checks}dense(this,4);const guard=own(this,3);if(typeof guard!=="function"||guard()!==true)bad();return true;}`;
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_PROGRAMS = freezeDeep({ invoke, entry, reprove } as const);
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_EXPRESSIONS = Object.freeze({ entry: "[this,n,e,t,i]", dispatch: "[callTicket,callUuid]", returned: "[this,n,e,t,i,r,s,a]" } as const);
const invokeLines = invoke.split("\n"); const invokeLast = invokeLines.at(-1);
if (invokeLast === undefined || !invokeLast.includes("lib.delete(target")) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_SITE"); }
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_SITES = freezeDeep({
  entry: { lineNumber: 1, columnNumber: 99_832 }, returned: { lineNumber: 1, columnNumber: 99_878 },
  function: { lineNumber: 1, columnNumber: 99_812 },
  dispatch: { functionLine: 0, functionColumn: 9, lineNumber: invokeLines.length - 1, columnNumber: invokeLast.indexOf("lib.delete(target") + "lib.delete".length },
  callers: [
    { name: "execute", lineNumber: 1, columnNumber: 99_554, functionColumn: 99_519 },
    { name: "push", lineNumber: 1, columnNumber: 100_851, functionColumn: 100_758 },
    { name: "", lineNumber: 1, columnNumber: 100_310, functionColumn: 100_175 },
    { name: "rpcCall", lineNumber: 1, columnNumber: 100_163, functionColumn: 100_147 },
    { name: "delete", lineNumber: 37, columnNumber: 28_153, functionColumn: 28_108 },
  ],
} as const);
