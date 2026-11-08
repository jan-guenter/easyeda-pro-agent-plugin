/** One immutable abandonment publication from an original failed-closure
 * token. JSON/history never issues the token or a native control. */
import { publishManagedAttachmentExclusive,readExactBinaryArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson,sha256Json,sha256Text } from "./core.ts";
import { requireOriginalCurrentSchematicRelevanceDisplayWritePlan } from "./current-schematic-relevance-display-write-plan.ts";
import type { CurrentSchematicRelevanceDisplayWritePlan } from "./current-schematic-relevance-display-write-plan.ts";
import type { GeneratedSchematicRelevanceDisplayJournal } from "./generated-schematic-relevance-display-journal.ts";
import type { CurrentSchematicRelevanceDisplayWriteFailureClosure,CurrentSchematicRelevanceDisplayWriteFailureClosureBindings } from "./current-schematic-relevance-display-write-abandonment-origin.ts";
import { currentSchematicRelevanceDisplayWriteAbandonmentBodySchema,currentSchematicRelevanceDisplayWriteAbandonmentSchema,currentSchematicRelevanceDisplayWriteFailureClosureValueSchema,freshCurrentSchematicRelevanceAbandonmentJournal,inspectCurrentSchematicRelevanceDisplayWriteAbandonment } from "./current-schematic-relevance-display-write-abandonment-data.ts";
import type { CurrentSchematicRelevanceDisplayWriteAbandonmentInspection } from "./current-schematic-relevance-display-write-abandonment-data.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ABANDONMENT_MAX_BYTES,currentSchematicRelevanceDisplayWriteAbandonmentPath,readCurrentSchematicRelevanceDisplayWriteAbandonmentFile } from "./current-schematic-relevance-display-write-abandonment-file.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure } from "./current-schematic-relevance-display-write-workflow.ts";

interface Workflow {readonly requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure:typeof requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure}
interface State {readonly plan:CurrentSchematicRelevanceDisplayWritePlan;readonly journal:GeneratedSchematicRelevanceDisplayJournal;original:Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection>|null;settlement:Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection>|null;
  workflow:Workflow|null;lookup:Workflow["requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure"]|null;bindings:CurrentSchematicRelevanceDisplayWriteFailureClosureBindings|null;valueText:string|null;artifact:ArtifactDescriptor|null}
const publications=new WeakMap<CurrentSchematicRelevanceDisplayWriteFailureClosure,State>();
function need(v:boolean):asserts v{if(!v){throw new Error("SCHEMATIC_RELEVANCE_ABANDONMENT_ORIGINAL_PUBLICATION");}}
export class CurrentSchematicRelevanceDisplayWriteAbandonmentPublication {
  readonly #token:CurrentSchematicRelevanceDisplayWriteFailureClosure;readonly #state:State;
  public constructor(token:CurrentSchematicRelevanceDisplayWriteFailureClosure,plan:CurrentSchematicRelevanceDisplayWritePlan,journal:GeneratedSchematicRelevanceDisplayJournal){
    requireOriginalCurrentSchematicRelevanceDisplayWritePlan(plan);const old=publications.get(token);if(old===undefined){this.#state={plan,journal,original:null,settlement:null,workflow:null,lookup:null,bindings:null,valueText:null,artifact:null};publications.set(token,this.#state);}
    else{need(old.plan===plan&&old.journal===journal);this.#state=old;}this.#token=token;Object.freeze(this);
  }
  async #current():Promise<void>{const s=this.#state;requireOriginalCurrentSchematicRelevanceDisplayWritePlan(s.plan);need(s.workflow!==null&&s.lookup!==null&&s.bindings!==null&&s.workflow.requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure===s.lookup);
    const actual=s.lookup(this.#token,s.plan,s.journal);need(actual===s.bindings&&actual.plan===s.plan&&actual.journal===s.journal&&canonicalJson(actual.value)===s.valueText);await actual.assertCurrent();
    need(s.workflow.requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure===s.lookup&&s.lookup(this.#token,s.plan,s.journal)===actual&&canonicalJson(actual.value)===s.valueText);requireOriginalCurrentSchematicRelevanceDisplayWritePlan(s.plan);
  }
  /** Repeated calls join the same original write Promise, including rejection.
   * They cannot replace, rewrite or retry a historical sidecar. */
  public publish():Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection>{this.#state.original??=this.#publish();return this.#state.original;}
  async #publish():Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection>{
    const s=this.#state;const workflow=await import("./current-schematic-relevance-display-write-workflow.ts");const lookup=workflow.requireOriginalCurrentSchematicRelevanceDisplayWriteFailureClosure;
    const bindings=lookup(this.#token,s.plan,s.journal);need(bindings.plan===s.plan&&bindings.journal===s.journal);currentSchematicRelevanceDisplayWriteFailureClosureValueSchema.parse(bindings.value);
    s.workflow=workflow;s.lookup=lookup;s.bindings=bindings;s.valueText=canonicalJson(bindings.value);await this.#current();
    const original=await freshCurrentSchematicRelevanceAbandonmentJournal(s.plan.operationId);await this.#current();const originalPlan=requireOriginalCurrentSchematicRelevanceDisplayWritePlan(s.plan);need(canonicalJson(original.plan["arguments"])===canonicalJson(originalPlan.argumentsValue)&&canonicalJson(original.plan["checkpoint"])===canonicalJson(originalPlan.prepared.preparationCheckpoint));
    const existing=await inspectCurrentSchematicRelevanceDisplayWriteAbandonment(s.plan.operationId);await this.#current();
    if(existing!==undefined){const retained=await readCurrentSchematicRelevanceDisplayWriteAbandonmentFile(s.plan.operationId);await this.#current();const envelope=currentSchematicRelevanceDisplayWriteAbandonmentSchema.parse(JSON.parse(retained.text) as unknown);need(canonicalJson(envelope.body.originalClosure)===s.valueText);need(canonicalJson(retained.artifact)===canonicalJson(existing.artifact)&&envelope.bodySha256===existing.bodySha256);s.artifact=retained.artifact;return this.#inspectOriginal();}
    const body=freezeDeep(currentSchematicRelevanceDisplayWriteAbandonmentBodySchema.parse({operationId:s.plan.operationId,recordedAt:new Date().toISOString(),originalStoredJournalSha256:original["journalSha256"],originalEntireJournalSha256:sha256Json(original),originalPlanSha256:sha256Json(original.plan),originalJournal:original,originalClosure:bindings.value,
      producerContract:"original-failed-disposable-schematic-relevance:all-factory-calls-publication-helpers-captures-settled.v1",classification:"historical-abandonment-verified",historicalQuarantineRelinquished:true,authorityRestored:false,executionAuthorized:false}));
    const envelope=freezeDeep(currentSchematicRelevanceDisplayWriteAbandonmentSchema.parse({schema:"easyeda-pro-control.sch209-relevance-display-write-abandonment.v1",body,bodySha256:sha256Json(body)}));const text=`${JSON.stringify(envelope)}\n`;const bytes=Buffer.from(text,"utf8");need(bytes.length<=CURRENT_SCHEMATIC_RELEVANCE_ABANDONMENT_MAX_BYTES);
    s.artifact=Object.freeze({path:currentSchematicRelevanceDisplayWriteAbandonmentPath(s.plan.operationId),bytes:bytes.length,sha256:sha256Text(text)});await this.#current();
    const before=await freshCurrentSchematicRelevanceAbandonmentJournal(s.plan.operationId);await this.#current();need(sha256Json(before)===body.originalEntireJournalSha256);
    const published=await publishManagedAttachmentExclusive(s.artifact.path,"Original failed disposable schematic Relevance abandonment",bytes,"sch209-relevance-display-write-abandonment.v1",async()=>{await this.#current();const current=await freshCurrentSchematicRelevanceAbandonmentJournal(s.plan.operationId);await this.#current();need(sha256Json(current)===body.originalEntireJournalSha256);});
    await this.#current();need(published.path===s.artifact.path&&published.sha256===s.artifact.sha256&&published.bytes===s.artifact.bytes);return this.#inspectOriginal();
  }
  async #inspectOriginal():Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection>{const s=this.#state;await this.#current();need(s.artifact!==null);await readExactBinaryArtifact(s.artifact);await this.#current();const result=await inspectCurrentSchematicRelevanceDisplayWriteAbandonment(s.plan.operationId);await this.#current();need(result!==undefined&&canonicalJson(result.artifact)===canonicalJson(s.artifact));return result;}
  /** One read-only settlement after the original write settles. Absence or
   * changed bytes stay quarantined; this method never writes again. */
  public settle():Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection>{const s=this.#state;need(s.original!==null);s.settlement??=(async():Promise<CurrentSchematicRelevanceDisplayWriteAbandonmentInspection>=>{try{await s.original;}catch{
    // Retain the exact prepared descriptor; inspect only.
  }return this.#inspectOriginal();})();return s.settlement;}
}
export type { CurrentSchematicRelevanceDisplayWriteAbandonmentInspection } from "./current-schematic-relevance-display-write-abandonment-data.ts";
