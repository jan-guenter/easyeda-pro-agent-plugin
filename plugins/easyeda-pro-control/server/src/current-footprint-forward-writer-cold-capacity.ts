/** Complete-only readonly successor reservation. Original Core joins this data
 * token to its actual preaction copy and capacity before the sole Create. */
import {CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY as HELD} from "./current-footprint-copy-held-saved-capacity.ts";
import {CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS as SOURCE} from "./current-footprint-copy-source-read.ts";
import {currentFootprintCopyV2Rows} from "./current-footprint-copy-v2-plan.ts";
import type {CurrentFootprintCopyV2Plan} from "./current-footprint-copy-v2-plan.ts";
import type {CurrentFootprintForwardWriterCompleteCapacity} from "./current-footprint-forward-writer-complete-capacity.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export interface CurrentFootprintForwardWriterColdCapacity{
 readonly profile:"private.current-footprint-forward-writer-cold-capacity.v1";readonly native:typeof HELD;
 readonly maximumSavedContentBytes:number;readonly maximumSavedObservationBytes:number;readonly maximumSavedFrameBytes:number;
 readonly maximumSavedPacketArtifactBytes:number;readonly maximumSavedRawAndPacketArtifactBytes:number;
 readonly closedSuccessorRawRows:number;readonly nativeCreateRequests:0;readonly explicitSaveAttempts:0;
 readonly originalReferencesRetained:true;readonly suppliedObservationsOnly:true;readonly executionAuthorized:false;
}
const originals=new WeakMap<object,Readonly<{capacity:CurrentFootprintForwardWriterCompleteCapacity;copy:CurrentFootprintCopyV2Plan}>>();
function need(value:boolean):asserts value{if(!value){throw new Error("FORWARD_WRITER_COLD_CAPACITY");}}
/** The maximum request already contains both complete DOCHEAD strings and all
 * canvas/tombstone rows. Saved getters omit one losing META and add actors to
 * both headers. Reserving two largest original users plus1024 fixed bytes
 * covers both raw-history and cache header spellings/ticket digit growth. */
export function deriveCurrentFootprintForwardWriterColdCapacity(capacity:CurrentFootprintForwardWriterCompleteCapacity,copy:CurrentFootprintCopyV2Plan):CurrentFootprintForwardWriterColdCapacity{
 currentFootprintCopyV2Rows(copy);
 need(capacity.closedSuccessorRawRows>=1&&capacity.closedSuccessorRawRows<=512&&copy.canvasRecords<=4096&&capacity.maximumActorUtf8Bytes>0&&capacity.maximumBodyUtf8Bytes>0);
 const maximumSavedContentBytes=capacity.maximumBodyUtf8Bytes+2*capacity.maximumActorUtf8Bytes+1024;
 need(Number.isSafeInteger(maximumSavedContentBytes)&&maximumSavedContentBytes<=SOURCE.contentBytes);
 const maximumSavedObservationBytes=2*maximumSavedContentBytes+4096;
 const maximumSavedFrameBytes=2*maximumSavedObservationBytes+4096;
 const maximumSavedPacketArtifactBytes=2*maximumSavedContentBytes+65_536;
 const maximumSavedRawAndPacketArtifactBytes=2*maximumSavedFrameBytes+maximumSavedPacketArtifactBytes;
 const result:CurrentFootprintForwardWriterColdCapacity=freezeDeep({profile:"private.current-footprint-forward-writer-cold-capacity.v1",native:HELD,maximumSavedContentBytes,maximumSavedObservationBytes,maximumSavedFrameBytes,maximumSavedPacketArtifactBytes,maximumSavedRawAndPacketArtifactBytes,closedSuccessorRawRows:capacity.closedSuccessorRawRows,nativeCreateRequests:0,explicitSaveAttempts:0,originalReferencesRetained:true,suppliedObservationsOnly:true,executionAuthorized:false});
 originals.set(result,Object.freeze({capacity,copy}));return result;
}
export function requireOriginalCurrentFootprintForwardWriterColdCapacity(token:CurrentFootprintForwardWriterColdCapacity,capacity:CurrentFootprintForwardWriterCompleteCapacity,copy:CurrentFootprintCopyV2Plan):void{
 const held=originals.get(token);need(held!==undefined&&held.capacity===capacity&&held.copy===copy&&token.native===HELD);currentFootprintCopyV2Rows(copy);
}
