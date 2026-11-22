/** Descriptor-only receivers for this original worker's fixed source holds.
 * Original Inspector events and callable metadata are supplied independently. */
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CHECK as CHECK}from"./current-footprint-inverse-native-delete-drain-programs.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES}from"./current-project-save-producer-source.ts";

const roles=["historyReply","detachedEntry","syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","batchReturned","bufferDone","detachedReturned","syncFull","syncLast","syncHistory","syncMerged","syncFinalizing","syncReturned","headEntry","headPromise","headSuccess"]as const;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_RECEIVERS=Object.freeze(Object.fromEntries(roles.map(role=>{
 const first=["headEntry","headPromise","headSuccess"].includes(role)?'if(own(frame,"0")!==own(p,"cache")&&own(frame,"0")!==own(p,"localCache"))bad();':'if(own(frame,"0")!==p)bad();';
 return[role,`function(frame,project,reflection,recipe,dependencies){${CHECK}if(project!==p)bad();dense(frame,${String(SITES[role].length)});${first}return frame;}`];
})));
