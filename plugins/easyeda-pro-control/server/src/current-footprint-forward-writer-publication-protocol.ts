/** Separate ready-state publication syntax. Shared startup tables are data
 * only; neither their isReady=false proofs nor their owner ledgers transfer. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as STARTUP} from "./current-project-save-structure-programs.ts";
import {currentFootprintForwardWriterFrontierTemplate,validateCurrentFootprintForwardWriterFrontierCommand} from "./current-footprint-forward-writer-frontier-protocol.ts";

function ready(source:string):string{
 const before='own(project,"isReady")!==false';
 if(source.split(before).length!==2){throw new Error("FORWARD_PUBLICATION_FIXED_READY_SOURCE");}
 return source.replace(before,'own(project,"isReady")!==true');
}
export const CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS=Object.freeze({
 startupEntry:ready(STARTUP.startupEntry),startupReturn:ready(STARTUP.startupReturn),
 startupFinalizer:STARTUP.startupFinalizer.replace('own(globalThis,"PROJECT")!==project','own(globalThis,"PROJECT")!==project||own(project,"isReady")!==true'),
});
const envelope=z.strictObject({phase:z.literal("forward-copy-publication"),lane:z.enum(["callback","queue"]),command:z.unknown()});
type ProgramRole=keyof typeof CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS;
function programRole(phase:unknown):ProgramRole|null{
 if(phase==="project-save-structure-startupEntry"){return "startupEntry";}
 if(phase==="project-save-structure-startupReturn"){return "startupReturn";}
 if(phase==="project-save-structure-startupFinalizer"){return "startupFinalizer";}
 return null;
}
export type CurrentFootprintForwardWriterPublicationCommand=Readonly<{
 phase:"forward-copy-publication";lane:"callback"|"queue";
 command:ReturnType<typeof validateCurrentFootprintForwardWriterFrontierCommand>["command"];
}>;
/** Own-data capture precedes the disjoint fixed ready program selection. */
export function validateCurrentFootprintForwardWriterPublicationCommand(input:unknown):CurrentFootprintForwardWriterPublicationCommand{
 const value=envelope.parse(captureCurrentPcbStringClockReply(input).value);
 const command=z.record(z.string(),z.unknown()).parse(value.command);
 const phase=command["phase"];const role=programRole(phase);let normalized=value.command;
 if(role!==null){
  const params=z.record(z.string(),z.unknown()).parse(command["params"]);
  if(params["functionDeclaration"]!==CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS[role]){throw new Error("FORWARD_PUBLICATION_READY_PROGRAM");}
  normalized={...command,params:{...params,functionDeclaration:STARTUP[role]}};
 }
 const fixed=validateCurrentFootprintForwardWriterFrontierCommand({phase:"forward-startup-frontier",lane:value.lane,command:normalized});
 if(fixed.command.method==="Debugger.setBreakpoint"||fixed.command.method==="Debugger.removeBreakpoint"){throw new Error("FORWARD_PUBLICATION_NO_NEW_ARMS");}
 if(role!==null){
  const readyCommand=fixed.command;
  if(readyCommand.phase!=="project-save-structure-startupEntry"&&readyCommand.phase!=="project-save-structure-startupReturn"&&readyCommand.phase!=="project-save-structure-startupFinalizer"){throw new Error("FORWARD_PUBLICATION_FIXED_ROLE");}
  return freezeDeep({...value,command:{...readyCommand,params:{...readyCommand.params,functionDeclaration:CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS[role]}}});
 }
 return freezeDeep({...value,command:fixed.command});
}
export function currentFootprintForwardWriterPublicationTemplate(input:unknown):ReturnType<typeof currentFootprintForwardWriterFrontierTemplate>{
 const value=validateCurrentFootprintForwardWriterPublicationCommand(input);const command=value.command;
 let normalized:unknown=command;
 const role=programRole(command.phase);
 if(role!==null){
  normalized={...command,params:{...command.params,functionDeclaration:STARTUP[role]}};
 }
 const row=currentFootprintForwardWriterFrontierTemplate({phase:"forward-startup-frontier",lane:value.lane,command:normalized});
 return freezeDeep({...row,template:role===null?row.template:row.template.replace(JSON.stringify(STARTUP[role]),JSON.stringify(CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS[role]))});
}
