import {validateCurrentFootprintInverseNativeDeleteExecutionDependenciesCommand as dependencies} from "./current-footprint-inverse-native-delete-execution-dependencies-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionDependenciesCommand as Dependencies} from "./current-footprint-inverse-native-delete-execution-dependencies-protocol.ts";
import {validateCurrentFootprintInverseNativeDeleteExecutionCallbackCommand as callbackCommand} from "./current-footprint-inverse-native-delete-execution-callback-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionCallbackCommand as Callback} from "./current-footprint-inverse-native-delete-execution-callback-protocol.ts";
import {validateCurrentFootprintInverseNativeDeleteExecutionManagerCommand as manager} from "./current-footprint-inverse-native-delete-execution-manager-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionManagerCommand as Manager} from "./current-footprint-inverse-native-delete-execution-manager-protocol.ts";
import {validateCurrentFootprintInverseNativeDeleteExecutionChannelCommand as channel} from "./current-footprint-inverse-native-delete-execution-channel-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionChannelCommand as Channel} from "./current-footprint-inverse-native-delete-execution-channel-protocol.ts";
import {z} from "zod";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export type CurrentFootprintInverseNativeDeleteExecutionTransferRead=Readonly<{stage:"dependencies";command:Dependencies}|{stage:"callback";command:Callback}|{stage:"manager";command:Manager}|{stage:"channel";command:Channel}>;
const schema=z.strictObject({stage:z.enum(["dependencies","callback","manager","channel"]),command:z.unknown()});
export function validateCurrentFootprintInverseNativeDeleteExecutionTransferRead(input:unknown):CurrentFootprintInverseNativeDeleteExecutionTransferRead{const raw=schema.parse(capture(input));
if(raw.stage==="dependencies"){return freezeDeep({stage:raw.stage,command:dependencies(raw.command)});}
if(raw.stage==="callback"){return freezeDeep({stage:raw.stage,command:callbackCommand(raw.command)});}
if(raw.stage==="manager"){return freezeDeep({stage:raw.stage,command:manager(raw.command)});}
return freezeDeep({stage:raw.stage,command:channel(raw.command)});}
type Wire<T>=T extends CurrentFootprintInverseNativeDeleteExecutionTransferRead?T["command"]&Readonly<{stage:T["stage"];id:number;sessionId:string;inverseNativeDeleteExecutionTransfer:true}>:never;
export function currentFootprintInverseNativeDeleteExecutionTransferWire(input:CurrentFootprintInverseNativeDeleteExecutionTransferRead,id:number,sessionId:string):Wire<CurrentFootprintInverseNativeDeleteExecutionTransferRead>{if(!Number.isSafeInteger(id)||id<1||!/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_WIRE");}const c=validateCurrentFootprintInverseNativeDeleteExecutionTransferRead(input);
if(c.stage==="dependencies"){return freezeDeep({...c.command,stage:c.stage,id,sessionId,inverseNativeDeleteExecutionTransfer:true});}
if(c.stage==="callback"){return freezeDeep({...c.command,stage:c.stage,id,sessionId,inverseNativeDeleteExecutionTransfer:true});}
if(c.stage==="manager"){return freezeDeep({...c.command,stage:c.stage,id,sessionId,inverseNativeDeleteExecutionTransfer:true});}
return freezeDeep({...c.command,stage:c.stage,id,sessionId,inverseNativeDeleteExecutionTransfer:true});}
export function currentFootprintInverseNativeDeleteExecutionTransferNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteExecutionTransferRead,sessionId:string):Readonly<Record<string,string|number>>{
 if(bytes.length>65_536||bytes.at(-1)!==0){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_FRAME");}const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive()}).parse(capture(raw)).id;const packet=validateCurrentFootprintInverseNativeDeleteExecutionTransferRead(input);if(bytes.toString("utf8")!==`${JSON.stringify(currentFootprintInverseNativeDeleteExecutionTransferWire(packet,id,sessionId))}\0`){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_BYTES");}const c=packet.command;const fields:Record<string,string|number>={action:`footprint-inverse-native-delete-execution-${packet.stage}`,requestId:id,phase:c.phase,method:c.method};if("role"in c){fields["role"]=c.role;}if(c.method==="Debugger.getScriptSource"){fields["scriptId"]=c.params.scriptId;}else if(c.method==="Debugger.evaluateOnCallFrame"){fields["callFrameId"]=c.params.callFrameId;}else if(c.method==="Debugger.removeBreakpoint"){fields["breakpointId"]=c.params.breakpointId;}else if(c.method!=="Debugger.resume"){fields["objectId"]=c.params.objectId;if(c.method==="Runtime.callFunctionOn"){for(const[index,arg]of c.params.arguments.entries()){if("objectId"in arg){fields[`reference${String(index)}`]=arg.objectId;}else{Object.assign(fields,arg.value);}}}}return Object.freeze(fields);
}