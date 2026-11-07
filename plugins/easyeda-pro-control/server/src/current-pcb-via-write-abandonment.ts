/** One immutable abandonment publication from an original failed-closure
 * token. JSON/history never issues the token or a native control. */
import { publishManagedAttachmentExclusive,readExactBinaryArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson,sha256Json,sha256Text } from "./core.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWriteJournal } from "./current-pcb-via-write-journal.ts";
import type { CurrentPcbViaWriteFailureClosure,CurrentPcbViaWriteFailureClosureBindings } from "./current-pcb-via-write-abandonment-origin.ts";
import { currentPcbViaWriteAbandonmentBodySchema,currentPcbViaWriteAbandonmentSchema,currentPcbViaWriteFailureClosureValueSchema,freshCurrentPcbViaAbandonmentJournal,inspectCurrentPcbViaWriteAbandonment } from "./current-pcb-via-write-abandonment-data.ts";
import type { CurrentPcbViaWriteAbandonmentInspection } from "./current-pcb-via-write-abandonment-data.ts";
import { CURRENT_PCB_VIA_ABANDONMENT_MAX_BYTES,currentPcbViaWriteAbandonmentPath,readCurrentPcbViaWriteAbandonmentFile } from "./current-pcb-via-write-abandonment-file.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { requireOriginalCurrentPcbViaWriteFailureClosure } from "./current-pcb-via-write-workflow.ts";

interface Workflow {readonly requireOriginalCurrentPcbViaWriteFailureClosure:typeof requireOriginalCurrentPcbViaWriteFailureClosure}
interface State {readonly plan:CurrentPcbViaWritePlan;readonly journal:CurrentPcbViaWriteJournal;original:Promise<CurrentPcbViaWriteAbandonmentInspection>|null;settlement:Promise<CurrentPcbViaWriteAbandonmentInspection>|null;
  workflow:Workflow|null;lookup:Workflow["requireOriginalCurrentPcbViaWriteFailureClosure"]|null;bindings:CurrentPcbViaWriteFailureClosureBindings|null;valueText:string|null;artifact:ArtifactDescriptor|null}
const publications=new WeakMap<CurrentPcbViaWriteFailureClosure,State>();
function need(v:boolean):asserts v{if(!v){throw new Error("PCB_VIA_ABANDONMENT_ORIGINAL_PUBLICATION");}}
export class CurrentPcbViaWriteAbandonmentPublication {
  readonly #token:CurrentPcbViaWriteFailureClosure;readonly #state:State;
  public constructor(token:CurrentPcbViaWriteFailureClosure,plan:CurrentPcbViaWritePlan,journal:CurrentPcbViaWriteJournal){
    requireOriginalCurrentPcbViaWritePlan(plan);const old=publications.get(token);if(old===undefined){this.#state={plan,journal,original:null,settlement:null,workflow:null,lookup:null,bindings:null,valueText:null,artifact:null};publications.set(token,this.#state);}
    else{need(old.plan===plan&&old.journal===journal);this.#state=old;}this.#token=token;Object.freeze(this);
  }
  async #current():Promise<void>{const s=this.#state;requireOriginalCurrentPcbViaWritePlan(s.plan);need(s.workflow!==null&&s.lookup!==null&&s.bindings!==null&&s.workflow.requireOriginalCurrentPcbViaWriteFailureClosure===s.lookup);
    const actual=s.lookup(this.#token,s.plan,s.journal);need(actual===s.bindings&&actual.plan===s.plan&&actual.journal===s.journal&&canonicalJson(actual.value)===s.valueText);await actual.assertCurrent();
    need(s.workflow.requireOriginalCurrentPcbViaWriteFailureClosure===s.lookup&&s.lookup(this.#token,s.plan,s.journal)===actual&&canonicalJson(actual.value)===s.valueText);requireOriginalCurrentPcbViaWritePlan(s.plan);
  }
  /** Repeated calls join the same original write Promise, including rejection.
   * They cannot replace, rewrite or retry a historical sidecar. */
  public publish():Promise<CurrentPcbViaWriteAbandonmentInspection>{this.#state.original??=this.#publish();return this.#state.original;}
  async #publish():Promise<CurrentPcbViaWriteAbandonmentInspection>{
    const s=this.#state;const workflow=await import("./current-pcb-via-write-workflow.ts");const lookup=workflow.requireOriginalCurrentPcbViaWriteFailureClosure;
    const bindings=lookup(this.#token,s.plan,s.journal);need(bindings.plan===s.plan&&bindings.journal===s.journal);currentPcbViaWriteFailureClosureValueSchema.parse(bindings.value);
    s.workflow=workflow;s.lookup=lookup;s.bindings=bindings;s.valueText=canonicalJson(bindings.value);await this.#current();
    const original=await freshCurrentPcbViaAbandonmentJournal(s.plan.operationId);await this.#current();need(canonicalJson(original.plan["plan"])===canonicalJson(s.plan));
    const existing=await inspectCurrentPcbViaWriteAbandonment(s.plan.operationId);await this.#current();
    if(existing!==undefined){const retained=await readCurrentPcbViaWriteAbandonmentFile(s.plan.operationId);await this.#current();const envelope=currentPcbViaWriteAbandonmentSchema.parse(JSON.parse(retained.text) as unknown);need(canonicalJson(envelope.body.originalClosure)===s.valueText);need(canonicalJson(retained.artifact)===canonicalJson(existing.artifact)&&envelope.bodySha256===existing.bodySha256);s.artifact=retained.artifact;return this.#inspectOriginal();}
    const body=freezeDeep(currentPcbViaWriteAbandonmentBodySchema.parse({operationId:s.plan.operationId,recordedAt:new Date().toISOString(),originalStoredJournalSha256:original["journalSha256"],originalEntireJournalSha256:sha256Json(original),originalPlanSha256:sha256Json(s.plan),originalJournal:original,originalClosure:bindings.value,
      producerContract:"original-failed-disposable-via:all-factory-calls-publication-helpers-captures-settled.v1",classification:"historical-abandonment-verified",historicalQuarantineRelinquished:true,authorityRestored:false,executionAuthorized:false}));
    const envelope=freezeDeep(currentPcbViaWriteAbandonmentSchema.parse({schema:"easyeda-pro-control.pcb209-via-write-abandonment.v1",body,bodySha256:sha256Json(body)}));const text=`${JSON.stringify(envelope)}\n`;const bytes=Buffer.from(text,"utf8");need(bytes.length<=CURRENT_PCB_VIA_ABANDONMENT_MAX_BYTES);
    s.artifact=Object.freeze({path:currentPcbViaWriteAbandonmentPath(s.plan.operationId),bytes:bytes.length,sha256:sha256Text(text)});await this.#current();
    const before=await freshCurrentPcbViaAbandonmentJournal(s.plan.operationId);await this.#current();need(sha256Json(before)===body.originalEntireJournalSha256);
    const published=await publishManagedAttachmentExclusive(s.artifact.path,"Original failed disposable Via abandonment",bytes,"pcb209-via-write-abandonment.v1",async()=>{await this.#current();const current=await freshCurrentPcbViaAbandonmentJournal(s.plan.operationId);await this.#current();need(sha256Json(current)===body.originalEntireJournalSha256);});
    await this.#current();need(published.path===s.artifact.path&&published.sha256===s.artifact.sha256&&published.bytes===s.artifact.bytes);return this.#inspectOriginal();
  }
  async #inspectOriginal():Promise<CurrentPcbViaWriteAbandonmentInspection>{const s=this.#state;await this.#current();need(s.artifact!==null);await readExactBinaryArtifact(s.artifact);await this.#current();const result=await inspectCurrentPcbViaWriteAbandonment(s.plan.operationId);await this.#current();need(result!==undefined&&canonicalJson(result.artifact)===canonicalJson(s.artifact));return result;}
  /** One read-only settlement after the original write settles. Absence or
   * changed bytes stay quarantined; this method never writes again. */
  public settle():Promise<CurrentPcbViaWriteAbandonmentInspection>{const s=this.#state;need(s.original!==null);s.settlement??=(async():Promise<CurrentPcbViaWriteAbandonmentInspection>=>{try{await s.original;}catch{
    // Retain the exact prepared descriptor; inspect only.
  }return this.#inspectOriginal();})();return s.settlement;}
}
export type { CurrentPcbViaWriteAbandonmentInspection } from "./current-pcb-via-write-abandonment-data.ts";
