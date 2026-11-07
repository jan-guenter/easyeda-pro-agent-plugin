/** Same original owner/plan/closed capture and completed source facts only.
 * This data proof grants no live continuation, saved target or reopen owner. */
import { canonicalJson } from "./core.ts";
import { originalCurrentPcbViaWriteClosedEffects } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { requireOriginalCurrentPcbViaWriteClosedSnapshot } from "./current-pcb-via-write-closed-snapshot.ts";
import type { CurrentPcbViaWriteClosedSnapshot } from "./current-pcb-via-write-closed-snapshot.ts";
import { compareGeneratedProjectClosedSqlDelta } from "./generated-project-closed-sql-delta.ts";
import type { GeneratedProjectClosedSqlDelta } from "./generated-project-closed-sql-delta.ts";

export interface CurrentPcbViaWriteClosedSqlProof {
  readonly schema:"private.current-pcb-via-write-closed-sql-proof.v1";
  readonly sourceSha256:string; readonly logicalSha256:string; readonly bodySha256:string; readonly structureSha256:string;
  readonly completeSqlVerified:true; readonly exactOriginalSaveDataVerified:true;
  readonly persistenceVerified:false; readonly reopenedVerified:false; readonly liveContinuationAuthorized:false;
}
interface Original {readonly owner:CurrentPcbViaWriteOwner;readonly plan:CurrentPcbViaWritePlan;readonly termination:object;readonly snapshot:CurrentPcbViaWriteClosedSnapshot;
  readonly effects:ReturnType<typeof originalCurrentPcbViaWriteClosedEffects>;readonly delta:GeneratedProjectClosedSqlDelta;readonly text:string;}
const issued=new WeakMap<CurrentPcbViaWriteClosedSqlProof,Original>();
const attempts=new WeakMap<CurrentPcbViaWriteOwner,Readonly<{plan:CurrentPcbViaWritePlan;snapshot:CurrentPcbViaWriteClosedSnapshot;effects:ReturnType<typeof originalCurrentPcbViaWriteClosedEffects>;termination:object;promise:Promise<CurrentPcbViaWriteClosedSqlProof>}>>();
function need(value:boolean):asserts value {if(!value){throw new Error("PCB_VIA_CLOSED_SQL_ORIGINAL_PROOF");}}
/** A repeat joins the retained original comparison Promise. It never opens a
 * new source, repeats a write or creates a replacement capture. */
export function qualifyOriginalCurrentPcbViaWriteClosedSql(owner:CurrentPcbViaWriteOwner,plan:CurrentPcbViaWritePlan,termination:object,snapshot:CurrentPcbViaWriteClosedSnapshot):Promise<CurrentPcbViaWriteClosedSqlProof>{
  const initial=requireOriginalCurrentPcbViaWritePlan(plan);const captured=requireOriginalCurrentPcbViaWriteClosedSnapshot(snapshot,owner,plan);const effects=originalCurrentPcbViaWriteClosedEffects(owner,plan,termination);
  const current=():void=>{need(requireOriginalCurrentPcbViaWritePlan(plan)===initial&&requireOriginalCurrentPcbViaWriteClosedSnapshot(snapshot,owner,plan).inventory===captured.inventory&&originalCurrentPcbViaWriteClosedEffects(owner,plan,termination)===effects);};current();
  const prior=attempts.get(owner);if(prior!==undefined){need(prior.plan===plan&&prior.snapshot===snapshot&&prior.effects===effects&&prior.termination===termination);return prior.promise;}
  const promise=(async():Promise<CurrentPcbViaWriteClosedSqlProof>=>{const delta=await compareGeneratedProjectClosedSqlDelta(initial.inventory,captured.inventory,effects.body.dataStr,effects.history,effects.structure);current();
    need(effects.body.documentUuid===plan.target.documentUuid&&effects.body.headTicket===effects.structure.ticket&&delta.bodySha256===effects.body.bodySha256);
    const proof:CurrentPcbViaWriteClosedSqlProof=Object.freeze({schema:"private.current-pcb-via-write-closed-sql-proof.v1",sourceSha256:snapshot.sourceSha256,logicalSha256:delta.afterLogicalSha256,bodySha256:delta.bodySha256,structureSha256:delta.structureSha256,completeSqlVerified:true,exactOriginalSaveDataVerified:true,persistenceVerified:false,reopenedVerified:false,liveContinuationAuthorized:false});
    issued.set(proof,Object.freeze({owner,plan,termination,snapshot,effects,delta,text:canonicalJson(proof)}));return proof;})();attempts.set(owner,Object.freeze({plan,snapshot,effects,termination,promise}));return promise;
}
export function requireOriginalCurrentPcbViaWriteClosedSql(proof:CurrentPcbViaWriteClosedSqlProof,owner:CurrentPcbViaWriteOwner,plan:CurrentPcbViaWritePlan):GeneratedProjectClosedSqlDelta{
  const original=issued.get(proof);need(original!==undefined&&original.owner===owner&&original.plan===plan&&original.text===canonicalJson(proof));requireOriginalCurrentPcbViaWritePlan(plan);
  need(requireOriginalCurrentPcbViaWriteClosedSnapshot(original.snapshot,owner,plan).inventory.logicalSha256===proof.logicalSha256&&originalCurrentPcbViaWriteClosedEffects(owner,plan,original.termination)===original.effects);return original.delta;
}
