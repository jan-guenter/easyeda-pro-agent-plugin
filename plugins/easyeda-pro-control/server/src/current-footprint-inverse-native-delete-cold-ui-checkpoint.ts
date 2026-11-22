// oxlint-disable-next-line import/no-cycle -- Only the same constructed coordinator can issue this intent; the lookup occurs after its durable stage publication.
import {requireOriginalCurrentFootprintInverseNativeDeleteColdUiIntent} from "./current-footprint-inverse-native-delete-cold-ui-generation.ts";
/** A new UI birth follows the completed cold-manager generation. No active
 * cold owner, supplied source or historical result DTO can issue this token. */
import {canonicalJson} from "./core.ts";
import {compareCompleteClosedSql} from "./closed-sql-equality.ts";
import {readExactSqlInventory,readerCompletion} from "./sqlite-inventory.ts";
import {requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence} from "./current-footprint-inverse-native-delete-cold-absence.ts";
import type {CurrentFootprintInverseNativeDeleteColdAbsence} from "./current-footprint-inverse-native-delete-cold-absence.ts";
import {requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot} from "./current-footprint-inverse-v4-closed-snapshot.ts";
import {verifyCurrentFootprintInverseNativeDeleteColdUiPreopenSource} from "./current-footprint-copy-preopen-source.ts";
import {originalCurrentFootprintInverseNativeDeleteColdSource} from "./current-pcb-diagnostic-owner.ts";
import type {CurrentFootprintInverseNativeDeleteColdOwner} from "./current-pcb-diagnostic-owner.ts";

export interface CurrentFootprintInverseNativeDeleteColdUiCheckpoint{readonly profile:"private.current-footprint-inverse-native-delete-cold-ui-checkpoint.v1"}
type Prior=ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence>;
interface Original{
 readonly intent:object;readonly continuation:ReturnType<typeof requireOriginalCurrentFootprintInverseNativeDeleteColdUiIntent>;
 readonly predecessor:CurrentFootprintInverseNativeDeleteColdOwner;readonly absence:CurrentFootprintInverseNativeDeleteColdAbsence;readonly original:Prior;
 readonly source:ReturnType<typeof originalCurrentFootprintInverseNativeDeleteColdSource>;
 readonly snapshot:ReturnType<typeof requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot>;
 readonly inventory:Awaited<ReturnType<typeof readExactSqlInventory>>;readonly completion:ReturnType<typeof readerCompletion>;
 readonly data:Prior["before"]["data"];readonly text:string;
}
const issued=new WeakMap<CurrentFootprintInverseNativeDeleteColdUiCheckpoint,Original>();
const attempts=new WeakMap<CurrentFootprintInverseNativeDeleteColdAbsence,Readonly<{predecessor:CurrentFootprintInverseNativeDeleteColdOwner;pending:Promise<CurrentFootprintInverseNativeDeleteColdUiCheckpoint>}>>();
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_CHECKPOINT");}}
function current(original:Pick<Original,"intent"|"continuation"|"predecessor"|"absence"|"original"|"source"|"snapshot">):void{
 const continuation=requireOriginalCurrentFootprintInverseNativeDeleteColdUiIntent(original.intent);need(continuation===original.continuation);
 const prior=requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(original.absence,original.predecessor);
 need(prior===original.original&&originalCurrentFootprintInverseNativeDeleteColdSource(original.predecessor)===original.source&&requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot(original.predecessor,prior.inventory)===original.snapshot);
 const status=original.predecessor.status();need(status.released&&status.helperClosed);
}
export function prepareCurrentFootprintInverseNativeDeleteColdUiCheckpoint(intent:object):Promise<CurrentFootprintInverseNativeDeleteColdUiCheckpoint>{
 const continuation=requireOriginalCurrentFootprintInverseNativeDeleteColdUiIntent(intent);continuation.assertNormal();const{absence,predecessor}=continuation;
 const original=requireOriginalCurrentFootprintInverseNativeDeleteColdAbsence(absence,predecessor);
 const source=originalCurrentFootprintInverseNativeDeleteColdSource(predecessor);const snapshot=requireCurrentFootprintInverseNativeDeleteColdClosedSnapshot(predecessor,original.inventory);
 const retained={intent,continuation,predecessor,absence,original,source,snapshot};current(retained);
 const prior=attempts.get(absence);if(prior!==undefined){need(prior.predecessor===predecessor);return prior.pending;}
 const gate=Promise.withResolvers<null>();const pending=(async():Promise<CurrentFootprintInverseNativeDeleteColdUiCheckpoint>=>{
  await gate.promise;current(retained);continuation.assertNormal();await continuation.journal.assertStage("checkpoint-intent");current(retained);await verifyCurrentFootprintInverseNativeDeleteColdUiPreopenSource(predecessor,original.inventory);current(retained);
  const inventory=await readExactSqlInventory({checkpointPath:snapshot.checkpoint.checkpoint,expectedSha256:snapshot.checkpoint.checkpointSha256,runtime:source.runtime});current(retained);
  const completion=readerCompletion(inventory);need(inventory!==original.inventory&&completion!==readerCompletion(original.inventory)&&completion.observedChildClose&&completion.exitCode===0&&completion.exitSignal===null);
  await compareCompleteClosedSql(original.inventory,inventory);current(retained);
  const data=original.before.data;const checkpoint:CurrentFootprintInverseNativeDeleteColdUiCheckpoint=Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-ui-checkpoint.v1"});
  issued.set(checkpoint,Object.freeze({...retained,inventory,completion,data,text:canonicalJson(data)}));requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint(checkpoint);return checkpoint;
 })();attempts.set(absence,Object.freeze({predecessor,pending}));gate.resolve(null);return pending;
}
export function requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint(checkpoint:CurrentFootprintInverseNativeDeleteColdUiCheckpoint):Readonly<Original>{
 const original=issued.get(checkpoint);need(original!==undefined);current(original);need(readerCompletion(original.inventory)===original.completion&&canonicalJson(original.data)===original.text);return original;
}
export async function verifyCurrentFootprintInverseNativeDeleteColdUiCheckpoint(checkpoint:CurrentFootprintInverseNativeDeleteColdUiCheckpoint):Promise<object>{
 const original=requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint(checkpoint);
 const observed=await verifyCurrentFootprintInverseNativeDeleteColdUiPreopenSource(original.predecessor,original.original.inventory);
 need(requireOriginalCurrentFootprintInverseNativeDeleteColdUiCheckpoint(checkpoint)===original);return observed;
}
