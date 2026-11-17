/** Original full-writer closed projection only. Pure SQL/source projections
 * are joined to the actual completed Create/clock/Main and original reader;
 * matching content cannot create a cold allocation or a live continuation. */
import { currentFootprintCopyV2SavedActor, currentFootprintCopyV2SavedSqlSource } from "./current-footprint-copy-v2-saved-source.ts";
import type {CurrentFootprintCopyV2SavedProjection} from "./current-footprint-copy-v2-saved-source.ts";
import {decodeCurrentFootprintCopyV2NativeResult} from "./current-footprint-copy-v2-native-result.ts";
import {readerCompletion} from "./sqlite-inventory.ts";
import type { SqlCell, readExactSqlInventory } from "./sqlite-inventory.ts";
import {requireCurrentFootprintForwardWriterClosedSnapshot} from "./current-footprint-copy-closed-snapshot.ts";
import { assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner, originalCurrentFootprintForwardWriterColdCapacity, originalCurrentFootprintForwardWriterNativeTarget } from "./current-pcb-diagnostic-owner.ts";
import type {CurrentFootprintForwardWriterNativeOwner} from "./current-pcb-diagnostic-owner.ts";
import {requireOriginalCurrentFootprintForwardWriterSavedContinuation} from "./current-footprint-forward-writer-paired-scheduler.ts";
import type {CurrentFootprintForwardWriterPairedObservation} from "./current-footprint-forward-writer-paired-scheduler.ts";

type Inventory=Awaited<ReturnType<typeof readExactSqlInventory>>;
function need(value:boolean):asserts value{if(!value){throw new Error("FORWARD_WRITER_SAVED_ORIGINAL_PROJECTION");}}
function text(cell:SqlCell|undefined):string{
 need(cell?.kind==="text");const bytes=Buffer.from(cell.hex,"hex"),value=bytes.toString("utf8");need(Buffer.from(value).equals(bytes));return value;
}
/** The original completed reader, source plan, actual UUID and both clocks
 * stay exact references. Main's actual observed actor/time/history are joined
 * to the completed SQL effect before any readonly native helper is allocated. */
export function requireOriginalCurrentFootprintForwardWriterSavedProjection(writer:CurrentFootprintForwardWriterNativeOwner,paired:CurrentFootprintForwardWriterPairedObservation,projection:CurrentFootprintCopyV2SavedProjection,after:Inventory):void{
 assertOriginalCurrentFootprintForwardWriterCompleteNativeOwner(writer);
 const continuation=requireOriginalCurrentFootprintForwardWriterSavedContinuation(paired,writer),target=originalCurrentFootprintForwardWriterNativeTarget(writer);
 requireCurrentFootprintForwardWriterClosedSnapshot(writer,after);const completed=readerCompletion(after),saved=currentFootprintCopyV2SavedSqlSource(projection);
 need(continuation.paired===paired&&saved.source.copyPlan===continuation.copyPlan&&saved.before===target.before&&saved.after===after);
 const result=decodeCurrentFootprintCopyV2NativeResult(continuation.copyPlan,paired.serializedCreateResult),samples=paired.clocks.samples;
 need(result.returnedUuid===projection.targetUuid&&samples.length===2&&samples[0]?.ordinal===1&&samples[1]?.ordinal===2&&samples[0].documentUuid===result.returnedUuid&&samples[1].documentUuid===result.returnedUuid&&samples[0].updateTime===saved.source.documentClocks[0]&&samples[1].updateTime===saved.source.documentClocks[1]&&result.envelope.result["createTime"]===samples[0].updateTime&&result.envelope.result["updateTime"]===samples[1].updateTime);
 need(currentFootprintCopyV2SavedActor(projection)["uuid"]===paired.main.value.backendActorUuid&&saved.source.projectUpdatedAtLiteral===paired.main.value.observedProjectUpdatedAt&&paired.main.value.backendActorUuid===paired.main.value.observedProjectModifierUuid&&paired.timer.naturalSelfReturnsJoined&&paired.originalTimerTailJoined);
 const branches=after.tables.filter(table=>table.name==="branches");need(branches.length===1);const table=branches[0];need(table!==undefined);const uuid=table.columns.findIndex(column=>column["name"]==="uuid");const history=table.columns.findIndex(column=>column["name"]==="history_uuid");need(uuid!==-1&&history!==-1);
 const rows=table.rows.filter(row=>text(row.cells[uuid])===continuation.copyPlan.source.branchUuid);need(rows.length===1&&text(rows[0]?.cells[history])===paired.main.value.historyUuid);
 const capacity=originalCurrentFootprintForwardWriterColdCapacity(writer);need(capacity.closedSuccessorRawRows<=512&&capacity.maximumSavedContentBytes<=2_097_152&&saved.source.append.plaintextSha256===projection.creationPlaintextSha256);
 need(readerCompletion(after)===completed);
}
