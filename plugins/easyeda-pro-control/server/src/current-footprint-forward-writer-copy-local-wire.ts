import { currentFootprintForwardWriterCopyLocalNativeCases, validateCurrentFootprintForwardWriterCopyLocalCommand } from "./current-footprint-forward-writer-copy-local-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintForwardWriterCopyLocalTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string,string>>; template: string }> {
  const command = validateCurrentFootprintForwardWriterCopyLocalCommand(input), values: Record<string,string> = {};
  const field = (name: string,value: string): string => { if (Object.hasOwn(values,name)) { throw new Error("FORWARD_COPY_LOCAL_FIELD"); } values[name]=value; return `__forward_copy_local_${name}__`; };
  const params: Record<string,unknown> = {...command.params}; if(command.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}else if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId",command.params.objectId); }
  if (command.method === "Runtime.callFunctionOn") { params["arguments"] = command.params.arguments.map((argument,index) => "objectId" in argument ? {objectId:field(`argument${String(index)}`,argument.objectId)} : {value:field(index===0?"key":"body",argument.value)}); }
  return freezeDeep({phase:`${command.phase}-${command.role}`,method:command.method,fields:Object.keys(values),values,template:JSON.stringify({method:command.method,params})});
}
export function currentFootprintForwardWriterCopyLocalWire(input: unknown,id: number): Readonly<{command:ReturnType<typeof validateCurrentFootprintForwardWriterCopyLocalCommand>;request:Readonly<Record<string,string|number>>}> {
  if (!Number.isSafeInteger(id)||id<1||id>2_147_483_647) { throw new Error("FORWARD_COPY_LOCAL_ID"); } const command=validateCurrentFootprintForwardWriterCopyLocalCommand(input),row=currentFootprintForwardWriterCopyLocalTemplate(command);
  return freezeDeep({command,request:{action:"footprint-forward-copy-local",requestId:id,phase:row.phase,method:row.method,...row.values}});
}
export function currentFootprintForwardWriterCopyLocalTemplates(): readonly ReturnType<typeof currentFootprintForwardWriterCopyLocalTemplate>[] { return freezeDeep(currentFootprintForwardWriterCopyLocalNativeCases().map(value=>currentFootprintForwardWriterCopyLocalTemplate(value))); }
