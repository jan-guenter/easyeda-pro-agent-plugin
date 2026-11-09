/** Completion observes the original private SDK wait only after the complete
 * Canvas/Echo lane. It admits no frames, breakpoint setup or debugger resume. */
import { validateCurrentSchematicRelevanceSdkGateCommand } from "./current-schematic-relevance-sdk-gate-protocol.ts";
import { currentSchematicRelevanceSdkGateWire } from "./current-schematic-relevance-sdk-gate-wire.ts";

export type CurrentSchematicRelevanceSdkCompletionCommand = ReturnType<typeof validateCurrentSchematicRelevanceSdkGateCommand>;
export const CURRENT_SCHEMATIC_RELEVANCE_SDK_COMPLETION_REQUESTS = Object.freeze({ beforeReads:32, afterReads:32, reads:64, helpers:65, releases:1, controls:4, total:134 } as const);
/** Preserve the historical fixed program/flags/arity validation, then narrow
 * it to this one wait reproof and its distinct once-only resolver control. */
export function currentSchematicRelevanceSdkCompletionWire(input:unknown,requestId:number):ReturnType<typeof currentSchematicRelevanceSdkGateWire>{
  const command=validateCurrentSchematicRelevanceSdkGateCommand(input);
  const selected=command.phase==="sdk-properties"||command.phase==="sdk-release"||command.phase==="sdk-call"&&["hooks","reflection-reprove","native-defaultInstance","native-hooks","run","native","context-same","wait"].includes(command.role);
  if(!selected){throw new Error("SCH_SDK_COMPLETION_FIXED_SCOPE");}
  const wire=currentSchematicRelevanceSdkGateWire(command,requestId);
  return Object.freeze({command:wire.command,request:Object.freeze({...wire.request,action:"schematic-relevance-sdk-completion"})});
}
