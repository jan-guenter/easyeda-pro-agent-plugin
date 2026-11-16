/** Closed native renderer continuation vocabulary. No public producer,
 * generated fixture or full-writer origin can enter this envelope. */
import {z} from "zod";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {validateCurrentFootprintInverseNativeDeleteLocalCommand as local,currentFootprintInverseNativeDeleteLocalNativeCases as localCases} from "./current-footprint-inverse-native-delete-local-protocol.ts";
import {validateCurrentFootprintInverseNativeDeleteProducerCommand as producer,currentFootprintInverseNativeDeleteProducerCases as producerCases} from "./current-footprint-inverse-native-delete-producer-protocol.ts";
import {currentFootprintInverseNativeDeletePublicationCallbackCases as callbackCases,validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand as validateCallback} from "./current-footprint-inverse-native-delete-publication-callback-protocol.ts";
import {validateCurrentFootprintInverseNativeDeletePublicationTimerCommand as timer,currentFootprintInverseNativeDeletePublicationTimerCases as timerCases} from "./current-footprint-inverse-native-delete-publication-timer-protocol.ts";

const kinds=["local","producer","callback","timer"]as const;const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const envelope=z.strictObject({phase:z.literal("inverse-native-delete-flow"),kind:z.enum(kinds),command:z.unknown()});
const helper=z.strictObject({phase:z.literal("inverse-native-delete-flow-helper"),kind:z.enum(kinds),key:z.string().regex(/^[A-Za-z0-9_.:/-]{1,160}$/u),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})});
type Normal=Readonly<{phase:"inverse-native-delete-flow";kind:"local";command:ReturnType<typeof local>}>|Readonly<{phase:"inverse-native-delete-flow";kind:"producer";command:ReturnType<typeof producer>}>|Readonly<{phase:"inverse-native-delete-flow";kind:"callback";command:ReturnType<typeof validateCallback>}>|Readonly<{phase:"inverse-native-delete-flow";kind:"timer";command:ReturnType<typeof timer>}>;
export type CurrentFootprintInverseNativeDeleteFlowCommand=Normal|Readonly<z.infer<typeof helper>>;
export function validateCurrentFootprintInverseNativeDeleteFlowCommand(input:unknown):CurrentFootprintInverseNativeDeleteFlowCommand{
 const raw=capture(input);const h=helper.safeParse(raw);if(h.success){return freezeDeep(h.data);}const value=envelope.parse(raw);
 if(value.kind==="local"){return freezeDeep({...value,kind:"local",command:local(value.command)});}if(value.kind==="producer"){return freezeDeep({...value,kind:"producer",command:producer(value.command)});}if(value.kind==="callback"){return freezeDeep({...value,kind:"callback",command:validateCallback(value.command)});}return freezeDeep({...value,kind:"timer",command:timer(value.command)});
}
function selected(c:Normal):ReturnType<typeof local>|ReturnType<typeof producer>["command"]|ReturnType<typeof validateCallback>["command"]|ReturnType<typeof timer>{return c.kind==="producer"||c.kind==="callback"?c.command.command:c.command;}
export function currentFootprintInverseNativeDeleteFlowKey(input:CurrentFootprintInverseNativeDeleteFlowCommand):string{
 const c=validateCurrentFootprintInverseNativeDeleteFlowCommand(input);if(c.phase==="inverse-native-delete-flow-helper"){return `helper/${c.kind}/${c.key}`;}
 const command=selected(c);const role="role"in command?command.role:"";const caller="cacheRole"in command?command.cacheRole:"";
 let lane="";if(c.kind==="producer"){lane=c.command.role;}else if(c.kind==="callback"){lane=c.command.lane;}return `${c.kind}/${lane}/${command.phase}/${role}/${caller}`;
}
export function currentFootprintInverseNativeDeleteFlowProgram(input:CurrentFootprintInverseNativeDeleteFlowCommand):string|null{const c=validateCurrentFootprintInverseNativeDeleteFlowCommand(input);if(c.phase==="inverse-native-delete-flow-helper"){return null;}const command=selected(c);if(command.method==="Runtime.callFunctionOn"){return command.params.functionDeclaration;}return command.method==="Debugger.evaluateOnCallFrame"?command.params.expression:null;}
export function currentFootprintInverseNativeDeleteFlowHelper(input:CurrentFootprintInverseNativeDeleteFlowCommand,scriptId:string):CurrentFootprintInverseNativeDeleteFlowCommand{
 const c=validateCurrentFootprintInverseNativeDeleteFlowCommand(input);if(c.phase!=="inverse-native-delete-flow"||currentFootprintInverseNativeDeleteFlowProgram(c)===null){throw new Error("INVERSE_NATIVE_DELETE_FLOW_HELPER");}return validateCurrentFootprintInverseNativeDeleteFlowCommand({phase:"inverse-native-delete-flow-helper",kind:c.kind,key:currentFootprintInverseNativeDeleteFlowKey(c).slice(c.kind.length+1),method:"Debugger.getScriptSource",params:{scriptId}});
}
export function qualifyCurrentFootprintInverseNativeDeleteFlowHelper(input:unknown,c:CurrentFootprintInverseNativeDeleteFlowCommand):void{const p=currentFootprintInverseNativeDeleteFlowProgram(c);if(p===null){throw new Error("INVERSE_NATIVE_DELETE_FLOW_HELPER");}z.strictObject({scriptSource:z.literal(p.startsWith("[")?p:`(${p})`)}).parse(capture(input));}
export function currentFootprintInverseNativeDeleteFlowCases():readonly CurrentFootprintInverseNativeDeleteFlowCommand[]{
 const rows:unknown[]=[...localCases().map(command=>({phase:"inverse-native-delete-flow",kind:"local",command})),...producerCases().map(command=>({phase:"inverse-native-delete-flow",kind:"producer",command})),...callbackCases().filter(c=>c.command.method!=="Debugger.getScriptSource").map(command=>({phase:"inverse-native-delete-flow",kind:"callback",command})),...timerCases().filter(c=>c.method!=="Debugger.getScriptSource").map(command=>({phase:"inverse-native-delete-flow",kind:"timer",command}))];
 const fixed=rows.map(c=>validateCurrentFootprintInverseNativeDeleteFlowCommand(c));return freezeDeep([...fixed,...fixed.filter(c=>currentFootprintInverseNativeDeleteFlowProgram(c)!==null).map(c=>currentFootprintInverseNativeDeleteFlowHelper(c,"original_ref"))]);
}
export function currentFootprintInverseNativeDeleteFlowTemplate(input:CurrentFootprintInverseNativeDeleteFlowCommand):Readonly<{key:string;method:string;template:string;values:Readonly<Record<string,string|number>>;names:readonly string[]}>{
 const outer=validateCurrentFootprintInverseNativeDeleteFlowCommand(input);const c=outer.phase==="inverse-native-delete-flow-helper"?outer:selected(outer);const values:Record<string,string|number>={};const params:Record<string,unknown>={...c.params};
 const field=(key:string,value:string):string=>{values[key]=value;return `__inverse_native_delete_flow_${key}__`;};
 if(c.method==="Runtime.callFunctionOn"){if(!("objectId"in c.params)){throw new Error("INVERSE_NATIVE_DELETE_FLOW_RECEIVER");}params["objectId"]=field("objectId",c.params.objectId);params["arguments"]=c.params.arguments.map((arg,index)=>"objectId"in arg?{objectId:field(`arg${String(index)}`,arg.objectId)}:{value:field(`value${String(index)}`,z.string().parse(arg.value))});}
 else if(c.method==="Runtime.getProperties"){params["objectId"]=field("objectId",c.params.objectId);}else if(c.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",c.params.callFrameId);}else if(c.method==="Debugger.setBreakpoint"){params["location"]={...c.params.location,scriptId:field("scriptId",c.params.location.scriptId)};}else if(c.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",c.params.breakpointId);}else if(c.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",c.params.scriptId);}
 return freezeDeep({key:currentFootprintInverseNativeDeleteFlowKey(outer),method:c.method,template:JSON.stringify({method:c.method,params}),values,names:Object.keys(values)});
}
type WireBase=Readonly<{id:number;sessionId:string;inverseNativeDeleteFlow:true}>;
type Wire=(ReturnType<typeof local>&WireBase&Readonly<{flowKind:"local"}>)|(ReturnType<typeof producer>["command"]&WireBase&Readonly<{flowKind:"producer";flowRole:ReturnType<typeof producer>["role"]}>)|(ReturnType<typeof validateCallback>["command"]&WireBase&Readonly<{flowKind:"callback";flowLane:ReturnType<typeof validateCallback>["lane"]}>)|(ReturnType<typeof timer>&WireBase&Readonly<{flowKind:"timer"}>)|(Readonly<z.infer<typeof helper>>&WireBase);
export function currentFootprintInverseNativeDeleteFlowWire(input:CurrentFootprintInverseNativeDeleteFlowCommand,id:number,sessionId:string):Wire{
 if(!Number.isSafeInteger(id)||id<1){throw new Error("INVERSE_NATIVE_DELETE_FLOW_ID");}handle.parse(sessionId);const c=validateCurrentFootprintInverseNativeDeleteFlowCommand(input);
 const common={id,sessionId,inverseNativeDeleteFlow:true}as const;
 if(c.phase==="inverse-native-delete-flow-helper"){return freezeDeep({...c,...common});}
 if(c.kind==="producer"){return freezeDeep({...c.command.command,...common,flowKind:"producer",flowRole:c.command.role});}
 if(c.kind==="callback"){return freezeDeep({...c.command.command,...common,flowKind:"callback",flowLane:c.command.lane});}
 if(c.kind==="local"){return freezeDeep({...c.command,...common,flowKind:"local"});}return freezeDeep({...c.command,...common,flowKind:"timer"});
}

export function currentFootprintInverseNativeDeleteFlowNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteFlowCommand,sessionId:string):Readonly<Record<string,string|number>>{
 if(bytes.length>65_536||bytes.at(-1)!==0){throw new Error("INVERSE_NATIVE_DELETE_FLOW_FRAME");}const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive()}).parse(capture(raw)).id;const c=validateCurrentFootprintInverseNativeDeleteFlowCommand(input);if(bytes.toString("utf8")!==`${JSON.stringify(currentFootprintInverseNativeDeleteFlowWire(c,id,sessionId))}\0`){throw new Error("INVERSE_NATIVE_DELETE_FLOW_FRAME");}const row=currentFootprintInverseNativeDeleteFlowTemplate(c);return freezeDeep({action:"footprint-inverse-native-delete-flow",requestId:id,phase:row.key,method:row.method,...row.values});
}
