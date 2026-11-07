/** Original native custody substitutes context/session. No timer ID is data. */
import { currentProjectSyncQuiesceNativeCases,validateCurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentProjectSyncQuiesceTemplate(input:unknown):Readonly<{phase:string;method:string;fields:readonly string[];values:Readonly<Record<string,string>>;template:string}> {
  const command=validateCurrentProjectSyncQuiesceCommand(input),values:Record<string,string>={};const field=(name:string,value:string):string=>{if(Object.hasOwn(values,name)){throw new Error("SYNC_QUIESCE_FIELD_ALIAS");}values[name]=value;return`__sync_quiesce_${name}__`;};
  const params:Record<string,unknown>={...command.params};
  if(command.phase==="sync-quiesce-capture"){params["uniqueContextId"]="__sync_quiesce_boundContext__";}
  else if(command.phase==="sync-quiesce-arm"){params["location"]={...command.params.location,scriptId:field("scriptId",command.params.location.scriptId)};}
  else if(command.phase==="sync-quiesce-frame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
  else if(command.phase==="sync-quiesce-remove-returned"){params["breakpointId"]=field("breakpointId",command.params.breakpointId);}
  else if(command.method!=="Debugger.resume"){params["objectId"]=field("objectId",command.params.objectId);}
  if(command.method==="Runtime.callFunctionOn"){params["arguments"]=command.params.arguments.map((arg,index)=>({objectId:field(`argument${String(index)}`,arg.objectId)}));}
  let suffix:string|null=null;if("index" in command){suffix=String(command.index);}else if("role" in command){suffix=command.role;}
  return freezeDeep({phase:command.phase+(suffix===null?"":`-${suffix}`),method:command.method,fields:Object.keys(values),values,template:JSON.stringify({method:command.method,params})});
}
export function currentProjectSyncQuiesceWire(input:unknown,id:number,purpose:"via"):Readonly<{command:ReturnType<typeof validateCurrentProjectSyncQuiesceCommand>;request:Readonly<Record<string,string|number>>}> {
  if(purpose!=="via"||!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("SYNC_QUIESCE_WIRE_OWNER");}const command=validateCurrentProjectSyncQuiesceCommand(input),row=currentProjectSyncQuiesceTemplate(command);
  return freezeDeep({command,request:{action:"pcb-via-sync-quiesce",requestId:id,phase:row.phase,method:row.method,...row.values}});
}
export function currentProjectSyncQuiesceTemplates():readonly ReturnType<typeof currentProjectSyncQuiesceTemplate>[] {return freezeDeep(currentProjectSyncQuiesceNativeCases().map(value=>currentProjectSyncQuiesceTemplate(value)));}
