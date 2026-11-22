import {coldUiAbsenceResultSchema} from "./current-footprint-inverse-native-delete-cold-ui-contract.ts";
/** Complete cold-manager absence after this new generation's original Job,
 * observers and helper have ended. No supplied inventory or source is accepted. */
import {canonicalJson} from "./core.ts";
import {compareCompleteClosedSql} from "./closed-sql-equality.ts";
import {readerCompletion} from "./sqlite-inventory.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
// oxlint-disable-next-line import/no-cycle -- Historical private token lookup after original Job and helper closure; initialization issues no continuation.
import {requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint} from "./current-footprint-inverse-native-delete-cold-ui-checkpoint.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiOwner,CurrentFootprintInverseNativeDeleteColdUiReadResult} from "./current-pcb-diagnostic-owner.ts";
import {assertOriginalCurrentFootprintInverseNativeDeleteColdUiOwner,assertOriginalCurrentFootprintInverseNativeDeleteColdUiTermination,requireOriginalCurrentFootprintInverseNativeDeleteColdUiReadResultAfterOriginalExit} from "./current-pcb-diagnostic-owner.ts";
import {captureCurrentFootprintInverseNativeDeleteColdUiClosedSnapshot,requireCurrentFootprintInverseNativeDeleteColdUiClosedSnapshot} from "./current-footprint-inverse-v4-closed-snapshot.ts";

export interface CurrentFootprintInverseNativeDeleteColdUiAbsence{
 readonly profile:"private.current-footprint-inverse-native-delete-cold-ui-absence.v1";
 readonly targetUuid:string;readonly maximumTicket:number;
 readonly nativeManagerColdAbsenceVerified:true;readonly originalUiTaskColdAbsenceVerified:true;readonly originalUiInvocations:1;
 readonly originalColdRootAndWholeJobExited:true;readonly originalColdHelperReleased:true;
 readonly coldGenerationClosureVerified:true;readonly completeClosedSqlCompared:true;readonly logicalSqlUnchangedAfterColdRead:true;
 readonly replayNamespacesAbsentAtOpenFrontier:true;readonly continuousReplayExclusion:false;
 readonly publicSdkParity:false;readonly nativeUiTaskAbsenceVerified:true;
 readonly saveRequests:0;readonly wholeInverseVerified:false;readonly executionAuthorized:false;
}
type Read=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteColdUiReadResultAfterOriginalExit>;
type Before=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint>;
interface Original{
 readonly read:CurrentFootprintInverseNativeDeleteColdUiReadResult;readonly owner:CurrentFootprintInverseNativeDeleteColdUiOwner;readonly termination:object;
 readonly bindings:Read;readonly before:Before;readonly inventory:Awaited<ReturnType<typeof captureCurrentFootprintInverseNativeDeleteColdUiClosedSnapshot>>;
 readonly result:CurrentFootprintInverseNativeDeleteColdUiAbsence;readonly text:string;
}
const attempts=new WeakMap<CurrentFootprintInverseNativeDeleteColdUiReadResult,Readonly<{owner:CurrentFootprintInverseNativeDeleteColdUiOwner;termination:object;pending:Promise<CurrentFootprintInverseNativeDeleteColdUiAbsence>}>>();
const issued=new WeakMap<CurrentFootprintInverseNativeDeleteColdUiAbsence,Original>();
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_ABSENCE_CUSTODY");}}
function current(read:CurrentFootprintInverseNativeDeleteColdUiReadResult,owner:CurrentFootprintInverseNativeDeleteColdUiOwner,termination:object,bindings:Read,before:Before):void{
 assertOriginalCurrentFootprintInverseNativeDeleteColdUiOwner(owner);assertOriginalCurrentFootprintInverseNativeDeleteColdUiTermination(owner,termination);
 const status=owner.status();need(status.released&&status.helperClosed);
 const same=requireOriginalCurrentFootprintInverseNativeDeleteColdUiReadResultAfterOriginalExit(read,owner),source=requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint(bindings.checkpoint);
 need(same.checkpoint===bindings.checkpoint&&same.data===bindings.data&&same.first===bindings.first&&same.fresh===bindings.fresh&&same.preopen===bindings.preopen&&source.predecessor===before.predecessor&&source.inventory===before.inventory&&source.data===before.data&&source.original===before.original);
}
/** Retain the full original capture and independent reader before first await.
 * Failure consumes this one-shot closure; neither matching JSON nor a repeated
 * call can allocate a new reader, native generation or replay. */
export function captureCurrentFootprintInverseNativeDeleteColdUiAbsence(read:CurrentFootprintInverseNativeDeleteColdUiReadResult,owner:CurrentFootprintInverseNativeDeleteColdUiOwner,termination:object):Promise<CurrentFootprintInverseNativeDeleteColdUiAbsence>{
 const bindings=requireOriginalCurrentFootprintInverseNativeDeleteColdUiReadResultAfterOriginalExit(read,owner);
 const before=requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint(bindings.checkpoint);
 current(read,owner,termination,bindings,before);
 const prior=attempts.get(read);if(prior!==undefined){need(prior.owner===owner&&prior.termination===termination);return prior.pending;}
 const gate=Promise.withResolvers<null>();
 const pending=(async():Promise<CurrentFootprintInverseNativeDeleteColdUiAbsence>=>{
  await gate.promise;current(read,owner,termination,bindings,before);
  const inventory=await captureCurrentFootprintInverseNativeDeleteColdUiClosedSnapshot(owner,termination);current(read,owner,termination,bindings,before);
  const completed=readerCompletion(inventory);need(inventory!==before.inventory&&completed!==readerCompletion(before.inventory)&&completed.observedChildClose&&completed.exitCode===0&&completed.exitSignal===null);
  await compareCompleteClosedSql(before.inventory,inventory);current(read,owner,termination,bindings,before);
  need(before.absence.nativeManagerColdAbsenceVerified&&bindings.data.actualWorkerGetDataReturnedMissing&&bindings.data.actualReadyManagerGetDataReturnedMissing&&bindings.data.originalFulfilledServiceCallbackMatched&&bindings.data.originalResolverCallbackMatched&&bindings.data.originalOuterPromiseRaceFulfilledUndefined&&bindings.data.defaultTimeoutRequiresOriginalJobExit);
  const result:CurrentFootprintInverseNativeDeleteColdUiAbsence=freezeDeep(coldUiAbsenceResultSchema.parse({profile:"private.current-footprint-inverse-native-delete-cold-ui-absence.v1",
   targetUuid:before.data.source.targetUuid,maximumTicket:before.data.source.maximumTicket,nativeManagerColdAbsenceVerified:true,originalUiTaskColdAbsenceVerified:true,originalUiInvocations:1,
   originalColdRootAndWholeJobExited:true,originalColdHelperReleased:true,coldGenerationClosureVerified:true,completeClosedSqlCompared:true,logicalSqlUnchangedAfterColdRead:true,
   replayNamespacesAbsentAtOpenFrontier:true,continuousReplayExclusion:false,publicSdkParity:false,nativeUiTaskAbsenceVerified:true,saveRequests:0,wholeInverseVerified:false,executionAuthorized:false}));
  issued.set(result,Object.freeze({read,owner,termination,bindings,before,inventory,result,text:canonicalJson(result)}));requireOriginalCurrentFootprintInverseNativeDeleteColdUiAbsence(result,owner);return result;
 })();
 attempts.set(read,Object.freeze({owner,termination,pending}));gate.resolve(null);return pending;
}
/** Historical completed facts only. This lookup creates no live native owner. */
export function requireOriginalCurrentFootprintInverseNativeDeleteColdUiAbsence(result:CurrentFootprintInverseNativeDeleteColdUiAbsence,owner:CurrentFootprintInverseNativeDeleteColdUiOwner):Readonly<Original>{
 const original=issued.get(result);need(original!==undefined&&original.owner===owner&&original.result===result&&canonicalJson(result)===original.text);
 current(original.read,owner,original.termination,original.bindings,original.before);requireCurrentFootprintInverseNativeDeleteColdUiClosedSnapshot(owner,original.inventory);return original;
}
