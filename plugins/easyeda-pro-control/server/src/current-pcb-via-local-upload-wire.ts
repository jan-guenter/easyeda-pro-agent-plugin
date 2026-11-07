import { currentPcbViaLocalUploadNativeCases, validateCurrentPcbViaLocalUploadCommand } from "./current-pcb-via-local-upload-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentPcbViaLocalUploadTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string,string>>; template: string }> {
  const command = validateCurrentPcbViaLocalUploadCommand(input), values: Record<string,string> = {};
  const field = (name: string,value: string): string => { if (Object.hasOwn(values,name)) { throw new Error("VIA_LOCAL_FIELD"); } values[name]=value; return `__via_local_${name}__`; };
  const params: Record<string,unknown> = {...command.params}; if(command.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}else if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId",command.params.objectId); }
  if (command.method === "Runtime.callFunctionOn") { params["arguments"] = command.params.arguments.map((argument,index) => "objectId" in argument ? {objectId:field(`argument${String(index)}`,argument.objectId)} : {value:field(index===0?"key":"body",argument.value)}); }
  return freezeDeep({phase:`${command.phase}-${command.role}`,method:command.method,fields:Object.keys(values),values,template:JSON.stringify({method:command.method,params})});
}
export function currentPcbViaLocalUploadWire(input: unknown,id: number): Readonly<{command:ReturnType<typeof validateCurrentPcbViaLocalUploadCommand>;request:Readonly<Record<string,string|number>>}> {
  if (!Number.isSafeInteger(id)||id<1||id>2_147_483_647) { throw new Error("VIA_LOCAL_ID"); } const command=validateCurrentPcbViaLocalUploadCommand(input),row=currentPcbViaLocalUploadTemplate(command);
  return freezeDeep({command,request:{action:"pcb-via-local-upload",requestId:id,phase:row.phase,method:row.method,...row.values}});
}
export function currentPcbViaLocalUploadTemplates(): readonly ReturnType<typeof currentPcbViaLocalUploadTemplate>[] { return freezeDeep(currentPcbViaLocalUploadNativeCases().map(value=>currentPcbViaLocalUploadTemplate(value))); }
