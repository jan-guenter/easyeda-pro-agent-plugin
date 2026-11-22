/** Complete cold-manager absence after this new generation's original Job,
 * observers and helper have ended. No supplied inventory or source is accepted. */
import {canonicalJson} from "./core.ts";
import {compareCompleteClosedSql} from "./closed-sql-equality.ts";
import {readerCompletion} from "./sqlite-inventory.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint} from "./current-footprint-inverse-native-delete-cold-checkpoint.ts";
import type {CurrentFootprintInverseNativeDeleteColdReadResult} from "./current-footprint-inverse-native-delete-cold-read-origin.ts";
import {assertOriginalCurrentFootprintInverseNativeDeleteColdOwner,assertOriginalCurrentFootprintInverseNativeDeleteColdTermination,requireOriginalCurrentFootprintInverseNativeDeleteColdReadResultAfterOriginalExit} from "./current-footprint-inverse-v4-native-owner.ts";
import type {CurrentFootprintInverseNativeDeleteColdOwner} from "./current-footprint-inverse-v4-native-owner.ts";
import {captureCurrentFootprintInverseNativeDeleteColdClosedSnapshot,requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot} from "./current-footprint-inverse-v4-closed-snapshot.ts";

export interface CurrentFootprintInverseNativeDeleteColdAbsence{
 readonly profile:"private.current-footprint-inverse-native-delete-cold-absence.v1";
 readonly targetUuid:string;readonly maximumTicket:number;
 readonly nativeManagerColdAbsenceVerified:true;readonly nativeManagerGetInvocations:2;
 readonly originalColdRootAndWholeJobExited:true;readonly originalColdHelperReleased:true;
 readonly coldGenerationClosureVerified:true;readonly completeClosedSqlCompared:true;readonly logicalSqlUnchangedAfterColdRead:true;
 readonly replayNamespacesAbsentAtOpenFrontier:true;readonly continuousReplayExclusion:false;
 readonly publicSdkParity:false;readonly nativeUiTaskAbsenceVerified:false;
 readonly saveRequests:0;readonly wholeInverseVerified:false;readonly executionAuthorized:false;
}
type Read=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteColdReadResultAfterOriginalExit>;
type Before=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint>;
interface Original{
 readonly read:CurrentFootprintInverseNativeDeleteColdReadResult;readonly owner:CurrentFootprintInverseNativeDeleteColdOwner;readonly termination:object;
 readonly bindings:Read;readonly before:Before;readonly inventory:Awaited<ReturnType<typeof captureCurrentFootprintInverseNativeDeleteColdClosedSnapshot>>;
 readonly result:CurrentFootprintInverseNativeDeleteColdAbsence;readonly text:string;
}
const attempts=new WeakMap<CurrentFootprintInverseNativeDeleteColdReadResult,Readonly<{owner:CurrentFootprintInverseNativeDeleteColdOwner;termination:object;pending:Promise<CurrentFootprintInverseNativeDeleteColdAbsence>}>>();
const issued=new WeakMap<CurrentFootprintInverseNativeDeleteColdAbsence,Original>();
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_COLD_ABSENCE_CUSTODY");}}
function current(read:CurrentFootprintInverseNativeDeleteColdReadResult,owner:CurrentFootprintInverseNativeDeleteColdOwner,termination:object,bindings:Read,before:Before):void{
 assertOriginalCurrentFootprintInverseNativeDeleteColdOwner(owner);assertOriginalCurrentFootprintInverseNativeDeleteColdTermination(owner,termination);
 const status=owner.status();need(status.released&&status.helperClosed);
 const same=requireOriginalCurrentFootprintInverseNativeDeleteColdReadResultAfterOriginalExit(read,owner),source=requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint(bindings.checkpoint);
 need(same.checkpoint===bindings.checkpoint&&same.data===bindings.data&&same.first===bindings.first&&same.fresh===bindings.fresh&&same.preopen===bindings.preopen&&source.owner===before.owner&&source.inventory===before.inventory&&source.data===before.data&&source.persistence===before.persistence);
}
/** Retain the full original capture and independent reader before first await.
 * Failure consumes this one-shot closure; neither matching JSON nor a repeated
 * call can allocate a new reader, native generation or replay. */
export function captureCurrentFootprintInverseNativeDeleteColdAbsence(read:CurrentFootprintInverseNativeDeleteColdReadResult,owner:CurrentFootprintInverseNativeDeleteColdOwner,termination:object):Promise<CurrentFootprintInverseNativeDeleteColdAbsence>{
 const bindings=requireOriginalCurrentFootprintInverseNativeDeleteColdReadResultAfterOriginalExit(read,owner);
 const before=requireOriginalCurrentFootprintInverseNativeDeleteColdCheckpoint(bindings.checkpoint);
 current(read,owner,termination,bindings,before);
 const prior=attempts.get(read);if(prior!==undefined){need(prior.owner===owner&&prior.termination===termination);return prior.pending;}
 const gate=Promise.withResolvers<null>();
 const pending=(async():Promise<CurrentFootprintInverseNativeDeleteColdAbsence>=>{
  await gate.promise;current(read,owner,termination,bindings,before);
  const inventory=await captureCurrentFootprintInverseNativeDeleteColdClosedSnapshot(owner,termination);current(read,owner,termination,bindings,before);
  const completed=readerCompletion(inventory);need(inventory!==before.inventory&&completed!==readerCompletion(before.inventory)&&completed.observedChildClose&&completed.exitCode===0&&completed.exitSignal===null);
  await compareCompleteClosedSql(before.inventory,inventory);current(read,owner,termination,bindings,before);
  need(bindings.data.sourceGetterDispatched&&bindings.data.originalNativeManagerGetInvocations===2&&bindings.data.nativeManagerReturnedMissing&&bindings.data.targetUuid===before.data.source.targetUuid&&bindings.data.maximumTicket===before.data.source.maximumTicket);
  const result:CurrentFootprintInverseNativeDeleteColdAbsence=freezeDeep({profile:"private.current-footprint-inverse-native-delete-cold-absence.v1",
   targetUuid:bindings.data.targetUuid,maximumTicket:bindings.data.maximumTicket,nativeManagerColdAbsenceVerified:true,nativeManagerGetInvocations:2,
   originalColdRootAndWholeJobExited:true,originalColdHelperReleased:true,coldGenerationClosureVerified:true,completeClosedSqlCompared:true,logicalSqlUnchangedAfterColdRead:true,
   replayNamespacesAbsentAtOpenFrontier:true,continuousReplayExclusion:false,publicSdkParity:false,nativeUiTaskAbsenceVerified:false,saveRequests:0,wholeInverseVerified:false,executionAuthorized:false});
  issued.set(result,Object.freeze({read,owner,termination,bindings,before,inventory,result,text:canonicalJson(result)}));requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(result,owner);return result;
 })();
 attempts.set(read,Object.freeze({owner,termination,pending}));gate.resolve(null);return pending;
}
/** Historical completed facts only. This lookup creates no live native owner. */
export function requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(result:CurrentFootprintInverseNativeDeleteColdAbsence,owner:CurrentFootprintInverseNativeDeleteColdOwner):Readonly<Original>{
 const original=issued.get(result);need(original!==undefined&&original.owner===owner&&original.result===result&&canonicalJson(result)===original.text);
 current(original.read,owner,original.termination,original.bindings,original.before);requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot(owner,original.inventory);return original;
}
