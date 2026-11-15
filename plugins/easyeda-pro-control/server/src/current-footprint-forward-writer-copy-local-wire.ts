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

/** Exact worst physical envelope for both body-bearing commands. A fixed
 * width UUID/time substitution is a size bound, never an actual created body. */
export function requireCurrentFootprintForwardWriterCopyLocalBodyCapacity(body:string):number{
 if(!body.isWellFormed()||body.length===0||Buffer.byteLength(body)>8192){throw new Error("FORWARD_COPY_LOCAL_BODY_CAPACITY");}
 let maximum=0;let checked=0;
 for(const row of currentFootprintForwardWriterCopyLocalTemplates()){
  if(row.fields.includes("body")){
   let text=row.template;
   for(const name of row.fields){
    let value="a".repeat(256);
    if(name==="body"){value=body;}
    else if(name==="key"){value="https://client/upload/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?key=bbbbbbbbbbbbbbbb";}
    text=text.replaceAll(JSON.stringify(`__forward_copy_local_${name}__`),()=>JSON.stringify(value));
   }
   const message=`{"id":2147483647,${text.slice(1,-1)},"sessionId":${JSON.stringify("a".repeat(256))}}\0`;
   maximum=Math.max(maximum,Buffer.byteLength(message));checked+=1;
  }
 }
 if(checked!==2||maximum>16_384){throw new Error("FORWARD_COPY_LOCAL_BODY_CAPACITY");}
 return maximum;
}
