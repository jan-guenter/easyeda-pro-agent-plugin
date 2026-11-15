/** Exact fixed prefix requests and interleaved native controls. Reused source
 * is an immutable algorithm; its GET state and origins never enter DEL. */
import {createHash} from "node:crypto";
import {currentFootprintInverseNativeGetTaskDependenciesNativeSource as dependencies} from "./current-footprint-inverse-native-get-task-dependencies-native.ts";
import {currentFootprintInverseNativeGetTaskCallbackNativeSource as callback} from "./current-footprint-inverse-native-get-task-callback-native.ts";
import {currentFootprintInverseNativeGetTaskManagerNativeSource as manager} from "./current-footprint-inverse-native-get-task-manager-native.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

function exact(emit:()=>string,begin:string,bytes:number,sha:string):readonly string[]{
 const full=emit();const start=full.indexOf(begin);const end=full.indexOf("public static void Verify",start);const source=full.slice(start,end);
 if(start===-1||end<=start||Buffer.byteLength(source)!==bytes||createHash("sha256").update(source).digest("hex")!==sha){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_ORDER_SOURCE");}
 const match=/static readonly string\[\] \w+Order=\{([^}]+)\};/u.exec(source);if(match?.[1]===undefined){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_ORDER");}
 return Object.freeze([...match[1].matchAll(/@"([^"]+)"/gu)].map(row=>{if(row[1]===undefined){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_ORDER_ROW");}return row[1].replaceAll("getData","deleteData");}));
}
const channel:string[]=[];
const frame=(role:string):void=>{channel.push(`frame:${role}`,"helper","properties");};
const call=(role:string,properties:number):void=>{channel.push(`call:${role}`,"helper",...Array.from({length:properties},()=>"properties"));};
frame("deleteData");call("route",2);call("channel-lineageUi",2);call("channel-roots",9);call("channel-parent",3);call("channel-parent",3);call("channel-classes",5);call("channel-methods",24);call("channel-module",7);call("channel-taskPrototype",3);call("channel-taskMethods",6);call("channel-nativePrototype",4);call("channel-eventTargetPrototype",3);call("channel-nativeMembers",5);call("channel-channel",3);call("send-prepare",2);channel.push("arm");frame("deleteData");call("before",0);channel.push("remove","resume");frame("inner");frame("caller");call("inner",0);
if(channel.length!==130){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_CHANNEL_ORDER");}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_TRANSFER_ORDER=freezeDeep({
 dependencies:exact(dependencies,"bool nativeGetTaskDependencies",2483,"6b2af61bcfee35df15d5f45cb2ad7af1102e90c17b04a4c60854de10580e418a"),
 callback:exact(callback,"bool ntcb",3379,"6034f84d223c58541a042d95418e67d0fae1cf76120fa1a20bd7ad9841e1a0b5"),
 manager:exact(manager,"bool ntm",4295,"ea4a1f8801e2c9c103b90430b5b24c863584437ffb1b5c9555cbe172771ba1b8"),
 channel
});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_TRANSFER_CONTROLS=freezeDeep({
 dependencies:["bind:0","complete:42"],
 callback:["bind:0","prepared:7","armed:8","resuming:14","held:15","complete:31"],
 manager:["bind:0","prepared:14","armed:15:wrapper","armed:16:body","armed:17:deleteData","resuming:23:wrapper","held:24:wrapper","resuming:30:body","held:31:body","resuming:40:deleteData","held:41:deleteData","complete:46"],
 channel:["bind:0","prepared:114","armed:115","resuming:121","held:122","complete:130"]
});
