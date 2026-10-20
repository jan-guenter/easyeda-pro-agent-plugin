/** Dormant single-Save call contract. The caller supplies the create result;
 * matching it does not establish a live owner, Save eligibility or persistence. */
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { compareCurrentPcbStringCreateObservation, requireOriginalCurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import type { CurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import { DORMANT_CURRENT_PCB_STRING_NATIVE_CONTEXT } from "./current-pcb-string-create-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_SAVE_RESULT_MAX_BYTES = 8192;
const LIMITS = Object.freeze({ liveExecutionVerified: false, originalOwnerVerified: false,
  originalCreateVerified: false, saveEligibilityVerified: false, completeParticipantSetVerified: false,
  completePublicationIntervalVerified: false, queueCompletionVerified: false,
  completeEffectVerified: false, fullSqlVerified: false, reopened: false, persistenceVerified: false,
  repeatAcrossInvocationsPrevented: false, writerSupported: false, executionAuthorized: false } as const);
export interface CurrentPcbStringSaveObservationPlan extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-save-observation-plan.v1";
  readonly dormant: true;
  readonly planSha256: string;
  readonly createPlanSha256: string;
  readonly primitiveId: string;
  readonly target: CurrentPcbStringCreateObservationPlan["target"];
}
const originals = new WeakSet<CurrentPcbStringSaveObservationPlan>();
function need(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`Dormant PCB String Save observation: ${message}.`); }
}

export function planCurrentPcbStringSaveObservation(createPlan: CurrentPcbStringCreateObservationPlan,
  suppliedCreateResult: unknown): CurrentPcbStringSaveObservationPlan {
  requireOriginalCurrentPcbStringCreateObservationPlan(createPlan);
  const created = compareCurrentPcbStringCreateObservation(createPlan, suppliedCreateResult);
  need(created.completed && created.acknowledgedPrimitiveId !== null, "complete supplied create result required");
  const data = { createPlanSha256: createPlan.planSha256, primitiveId: created.acknowledgedPrimitiveId, target: createPlan.target };
  const plan: CurrentPcbStringSaveObservationPlan = freezeDeep({
    profile: "private.current-pcb-string-save-observation-plan.v1", dormant: true,
    planSha256: sha256Json(data), ...data, ...LIMITS,
  });
  originals.add(plan); return plan;
}

export function dormantCurrentPcbStringSaveArguments(plan: CurrentPcbStringSaveObservationPlan,
  windowTabId: string): readonly Readonly<{ value: unknown }>[] {
  need(originals.has(plan), "original dormant plan required");
  need(typeof windowTabId === "string" && /^[A-Za-z\d_-]{1,128}$/u.test(windowTabId), "exact original window selector required");
  return freezeDeep([{ value: { target: plan.target, primitiveId: plan.primitiveId, planSha256: plan.planSha256 } },
    { value: windowTabId }]);
}

/** PCB217199c8@10798668 registers pcb/saveCompiler. It saves each loaded custom
 * footprint compiler, the main compiler and dynamic copper. This fixed call
 * therefore requires those complete participant exclusions BEFORE dispatch.
 * They are not inferred from target identity or success:true.
 *
 * This is the canvas Save service used by UI3823ed6e@15190682, not the UI's
 * separate save action/preview/log/keepalive lifecycle. Workerb849bd12@2031178
 * can acknowledge a local-cache write before backend upload. The result below
 * is a call acknowledgment only. It never authorizes a second Save.
 *
 * No live path imports or dispatches this program. Per-generation durable
 * one-shot consumption and full closed-SQL/reopen remain separate requirements. */
export const DORMANT_CURRENT_PCB_STRING_SAVE_FUNCTION = `async function(plan,expectedWindowTabId){
let timer,clear,stage='setup',saveAttempted=false,saveAcknowledgment=null,beforeIdentity=false,afterIdentity=false,deadlineExpired=false,completed=false,expired=false;
try{
const root=globalThis,apply=Reflect.apply,target=plan.target;
const bad=()=>{throw new Error('DORMANT_CURRENT_PCB_STRING_SAVE_FAILED');};
${DORMANT_CURRENT_PCB_STRING_NATIVE_CONTEXT}
const run=async()=>{
 stage='before-identity';await identity();check();beforeIdentity=true;
 stage='save';check();if(saveAttempted)bad();saveAttempted=true;
 const reply=await apply(rpc,channel,['pcb/saveCompiler','',0]);
 const acknowledgment=unwrap(reply),success=own(acknowledgment,'success');
 if(typeof success!=='boolean')bad();
 // Preserve acknowledgment before rejecting shape/context drift. Native work
 // may remain even for a missing, false, malformed or timed-out acknowledgment.
 saveAcknowledgment=success;
 if(!success)bad();exact(acknowledgment,['success']);check();
 stage='after-identity';await identity();check();afterIdentity=true;stage='final-check';
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;deadlineExpired=true;reject(new Error('DORMANT_CURRENT_PCB_STRING_SAVE_FAILED'));},15000]);});
await Promise.race([run(),timeout]);check();completed=true;
}catch{}finally{
 expired=true;
 if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{stage='cleanup';completed=false;}}
}
if(completed)stage='complete';
const output=JSON.stringify({profile:'private.current-pcb-string-save-dormant-result.v1',planSha256:plan.planSha256,primitiveId:plan.primitiveId,
completed,stage,saveAttempted,saveAcknowledgment,beforeIdentity,afterIdentity,deadlineExpired});
if(output.length>${CURRENT_PCB_STRING_SAVE_RESULT_MAX_BYTES})throw new Error('DORMANT_CURRENT_PCB_STRING_SAVE_RESULT_BOUND');return output;
}`;

const schema = z.object({ profile: z.literal("private.current-pcb-string-save-dormant-result.v1"),
  planSha256: z.string().regex(/^[a-f\d]{64}$/u), primitiveId: z.string().regex(/^[a-f\d]{16}$/u),
  completed: z.boolean(), stage: z.enum(["setup", "before-identity", "save", "after-identity", "final-check", "complete", "cleanup"]),
  saveAttempted: z.boolean(), saveAcknowledgment: z.boolean().nullable(),
  beforeIdentity: z.boolean(), afterIdentity: z.boolean(), deadlineExpired: z.boolean() }).strict();

export function compareCurrentPcbStringSaveObservation(plan: CurrentPcbStringSaveObservationPlan, supplied: unknown):
  Readonly<z.infer<typeof schema> & typeof LIMITS & { suppliedResultMatchesContract: true }> {
  need(originals.has(plan), "original dormant plan required");
  need(typeof supplied === "string" && supplied.isWellFormed() &&
    Buffer.byteLength(supplied) <= CURRENT_PCB_STRING_SAVE_RESULT_MAX_BYTES, "bounded JSON required");
  const raw = decodeCurrentPcbDiagnosticJson(Buffer.from(supplied)), result = schema.parse(raw);
  need(result.planSha256 === plan.planSha256 && result.primitiveId === plan.primitiveId, "plan binding differs");
  need(!result.saveAttempted || result.beforeIdentity, "Save attempted before identity");
  need(result.saveAcknowledgment === null || result.saveAttempted, "acknowledgment without Save");
  need(!result.afterIdentity || result.saveAttempted && result.saveAcknowledgment === true, "post-Save identity without acknowledgment");
  need(!result.completed || result.stage === "complete" && !result.deadlineExpired &&
    result.beforeIdentity && result.saveAttempted && result.saveAcknowledgment === true && result.afterIdentity, "completion relation differs");
  need(result.completed || result.stage !== "complete", "incomplete result marked complete");
  if (["setup", "before-identity"].includes(result.stage)) {
    need(!result.beforeIdentity && !result.saveAttempted && !result.afterIdentity, "early stage contains Save evidence");
  } else if (result.stage !== "cleanup") {
    need(result.beforeIdentity && result.saveAttempted, "Save stage missing intent");
    need(result.stage === "save" || result.saveAcknowledgment === true, "post-Save stage missing acknowledgment");
    need(result.afterIdentity === ["final-check", "complete"].includes(result.stage), "identity stage differs");
  }
  return freezeDeep({ ...result, suppliedResultMatchesContract: true, ...LIMITS });
}
