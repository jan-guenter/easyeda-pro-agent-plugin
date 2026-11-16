/** Fixed next-query sender syntax. Only pure historical CDP shape algorithms
 * are shared; the outer native kind/phase, Core origin and native ledger are
 * distinct. Matching data cannot create a call, worker Job or DEL grant. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SENDER_PROGRAMS as P } from "./current-footprint-inverse-native-reference-roster.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_SENDER_PROGRAMS as PCB } from "./current-footprint-inverse-native-reference-pcb-sender-programs.ts";
import { currentFootprintInverseNativeReferencePcbSenderCases as cases, currentFootprintInverseNativeReferencePcbSenderTemplate as template, validateCurrentFootprintInverseNativeReferencePcbSenderCommand as validate } from "./current-footprint-inverse-native-reference-pcb-sender-protocol.ts";
import type { CurrentFootprintInverseNativeReferencePcbSenderCommand as Inner } from "./current-footprint-inverse-native-reference-pcb-sender-protocol.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_KINDS=Object.freeze(["schematic","footprint-derived","device-all"] as const);
export type CurrentFootprintInverseNativeReferenceNextKind=typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_KINDS[number];
export type CurrentFootprintInverseNativeReferenceNextSenderInner=Inner;
export interface CurrentFootprintInverseNativeReferenceNextSenderCommand {readonly queryKind:CurrentFootprintInverseNativeReferenceNextKind;readonly command:Inner}
const shape=z.strictObject({queryKind:z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_KINDS),command:z.unknown()});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_REFERENCE_NEXT_SENDER_COMMAND");}}
/** Qualify a selected immutable next-query program against the complete
 * original structural grammar. The normalized program is never emitted. */
export function validateCurrentFootprintInverseNativeReferenceNextSenderInner(kind:CurrentFootprintInverseNativeReferenceNextKind,input:unknown):Inner{
 z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_KINDS).parse(kind);const raw=capture(input);
 const packet=z.looseObject({phase:z.string(),role:z.string().optional(),method:z.string(),params:z.looseObject({functionDeclaration:z.string().optional()})}).parse(raw);
 let original:string|undefined;let normalized:unknown=raw;
 if(packet.method==="Runtime.callFunctionOn"){
  const role=packet.phase==="inverse-native-reference-pcb-sender-invoke"?"invokeOnce":packet.role;
  const key=z.enum(["roots","context","bus","methods","queue","task","members","taskMethods","prepare","before","invokeOnce","entry"]).parse(role);original=packet.params.functionDeclaration;need(original===P[kind][key]);normalized={...packet,params:{...packet.params,functionDeclaration:PCB[key]}};
 }
 const checked=validate(normalized);if(checked.phase==="inverse-native-reference-pcb-sender-call"){need(original!==undefined);return freezeDeep({...checked,params:{...checked.params,functionDeclaration:original}});}if(checked.phase==="inverse-native-reference-pcb-sender-invoke"){need(original===PCB.invokeOnce);}return checked;
}
/** This envelope is new and strict even though its inner vocabulary shares
 * immutable syntax. It is inert until the original owner admits this query. */
export function validateCurrentFootprintInverseNativeReferenceNextSenderCommand(input:unknown):CurrentFootprintInverseNativeReferenceNextSenderCommand{
 const raw=shape.parse(capture(input));return freezeDeep({queryKind:raw.queryKind,command:validateCurrentFootprintInverseNativeReferenceNextSenderInner(raw.queryKind,raw.command)});
}
/** Only passive source/preparation commands are admitted before the
 * original intent owns the separate invocation/held-entry continuation. */
export function validateCurrentFootprintInverseNativeReferenceNextSenderReadCommand(kind:CurrentFootprintInverseNativeReferenceNextKind,input:unknown):Inner{
 const c=validateCurrentFootprintInverseNativeReferenceNextSenderInner(kind,input);need(c.phase==="inverse-native-reference-pcb-sender-source"||c.phase==="inverse-native-reference-pcb-sender-properties"||c.phase==="inverse-native-reference-pcb-sender-helper"||c.phase==="inverse-native-reference-pcb-sender-call"&&c.role!=="entry");return c;
}
/** Correlate the source of this actual dispatch, including its selected query. */
export function qualifyCurrentFootprintInverseNativeReferenceNextSenderHelper(input:unknown,kind:CurrentFootprintInverseNativeReferenceNextKind,inner:Inner):void{
 const command=validateCurrentFootprintInverseNativeReferenceNextSenderInner(kind,inner);
 const source=z.strictObject({scriptSource:z.string().max(16_386)}).parse(capture(input));
 let expected:string|null=null;if(command.method==="Runtime.callFunctionOn"){expected=`(${command.params.functionDeclaration})`;}else if(command.method==="Debugger.evaluateOnCallFrame"){expected=command.params.expression;}
 need(expected!==null&&source.scriptSource===expected);
}
const phases=Object.freeze({
 "inverse-native-reference-pcb-sender-source":"inverse-native-reference-next-sender-source",
 "inverse-native-reference-pcb-sender-call":"inverse-native-reference-next-sender-call",
 "inverse-native-reference-pcb-sender-invoke":"inverse-native-reference-next-sender-invoke",
 "inverse-native-reference-pcb-sender-properties":"inverse-native-reference-next-sender-properties",
 "inverse-native-reference-pcb-sender-helper":"inverse-native-reference-next-sender-helper",
 "inverse-native-reference-pcb-sender-arm":"inverse-native-reference-next-sender-arm",
 "inverse-native-reference-pcb-sender-frame":"inverse-native-reference-next-sender-frame",
} as const);
type WireShape<C> = C extends Inner ? Omit<C,"phase">&Readonly<{phase:typeof phases[keyof typeof phases];queryKind:CurrentFootprintInverseNativeReferenceNextKind;id:number;sessionId:string;inverseNativeReferenceNextSender:true}>:never;
/** Exact byte transport uses a new marker and phase; no old slot is reused. */
export function currentFootprintInverseNativeReferenceNextSenderWire(input:CurrentFootprintInverseNativeReferenceNextSenderCommand,id:number,sessionId:string):WireShape<Inner>{
 need(Number.isSafeInteger(id)&&id>0);z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u).parse(sessionId);const c=validateCurrentFootprintInverseNativeReferenceNextSenderCommand(input);
 return freezeDeep({...c.command,phase:phases[c.command.phase],queryKind:c.queryKind,id,sessionId,inverseNativeReferenceNextSender:true});
}
/** Reconstruct the complete exact packet before selecting fixed native fields. */
export function currentFootprintInverseNativeReferenceNextSenderNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeReferenceNextSenderCommand,sessionId:string):Readonly<Record<string,string|number>>{
 need(bytes.length<=65_536&&bytes.at(-1)===0);const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive()}).parse(capture(raw)).id;
 const c=validateCurrentFootprintInverseNativeReferenceNextSenderCommand(input);need(bytes.toString("utf8")===`${JSON.stringify(currentFootprintInverseNativeReferenceNextSenderWire(c,id,sessionId))}\0`);
 const inner=c.command;const fields:Record<string,string|number>={action:"footprint-inverse-native-reference-next-sender",requestId:id,phase:inner.phase.replace("inverse-native-reference-pcb-sender-","inverse-native-reference-next-sender-"),method:inner.method,queryKind:c.queryKind};if("role" in inner){fields["role"]=inner.role;}
 if(inner.method==="Runtime.callFunctionOn"){fields["objectId"]=inner.params.objectId;for(const[i,arg]of inner.params.arguments.entries()){if("objectId" in arg){fields[`reference${String(i)}`]=arg.objectId;}else{Object.assign(fields,arg.value);}}}
 else if(inner.method==="Debugger.evaluateOnCallFrame"){fields["callFrameId"]=inner.params.callFrameId;}else if(inner.method==="Debugger.getScriptSource"){fields["scriptId"]=inner.params.scriptId;}else{fields["objectId"]=inner.params.objectId;}return Object.freeze(fields);
}
/** Complete fixed cases, with fresh selected source for each of three queries. */
export function currentFootprintInverseNativeReferenceNextSenderCases():readonly CurrentFootprintInverseNativeReferenceNextSenderCommand[]{
 const out:CurrentFootprintInverseNativeReferenceNextSenderCommand[]=[];for(const queryKind of CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_KINDS){for(const command of cases()){const chosen=command.method==="Runtime.callFunctionOn"?{...command,params:{...command.params,functionDeclaration:P[queryKind]["role" in command?command.role:"invokeOnce"]}}:command;out.push(validateCurrentFootprintInverseNativeReferenceNextSenderCommand({queryKind,command:chosen}));}}return freezeDeep(out);
}
/** Source-only native templates preserve the fixed old scalar placeholders.
 * The next ledger selects its own query table before using this algorithm. */
export function currentFootprintInverseNativeReferenceNextSenderTemplate(input:CurrentFootprintInverseNativeReferenceNextSenderCommand):ReturnType<typeof template>{
 const c=validateCurrentFootprintInverseNativeReferenceNextSenderCommand(input);const inner=c.command;
 const base=inner.method==="Runtime.callFunctionOn"?{...inner,params:{...inner.params,functionDeclaration:PCB["role" in inner?inner.role:"invokeOnce"]}}:inner;return template(validate(base));
}
export { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_SENDER_CALLS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_SENDER_CALLS, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_SENDER_FLAGS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_SENDER_FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_SENDER_READ_REQUESTS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_SENDER_READ_REQUESTS, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_SENDER_REQUESTS as CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_SENDER_REQUESTS } from "./current-footprint-inverse-native-reference-pcb-sender-protocol.ts";
