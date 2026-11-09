/** Fixed own7 wrapper wait. No owner or completion permission is issued. */
const previous='const result=await original;ownedAction=null;originalPromiseSettled=true;';
const gated='const result=await original;originalPromiseSettled=true;if(result!==true)bad("ACTION_REJECTED");debugger;let originalCompletionResolve=null;const originalCompletionWait=new Promise(resolve=>{originalCompletionResolve=resolve});const originalCompletionContext=[this,tuple,b,state,before,ownedAction,original,result,originalCompletionWait,originalCompletionResolve];debugger;const originalCompletionResult=await originalCompletionWait;if(originalCompletionResult!==true)bad("COMPLETION_GATE");ownedAction=null;';
/** Replace the one original await tail with a separate pending wrapper wait, retaining the actual action result and resolver in its own context. */
export const CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_REPLACEMENT=Object.freeze([previous,gated]as const);
/** Replace exactly one source-pinned await tail with the held SDK completion
 * wait. Missing or duplicate anchors refuse instead of modifying another
 * callback; the retained resolver still requires original worker completion. */
export function applyCurrentSchematicRelevanceSdkGate(source:string):string{if(source.split(previous).length!==2){throw new Error("SCH_SDK_GATE_FIXED_AWAIT");}return source.replace(previous,gated);}
