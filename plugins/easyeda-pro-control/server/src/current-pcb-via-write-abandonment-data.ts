/** Historical closure sidecar qualification only. No source JSON can issue an
 * owner, restore a failed operation, replay an action or claim persistence. */
import { z } from "zod";
import { loadOperation, readExactBinaryArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor,OperationJournal } from "./artifacts.ts";
import { canonicalJson,isErrnoException,isRecord,normalizeEasyedaProjectPath,sha256Json,sha256Text } from "./core.ts";
import { currentPcbViaWriteHistoricalTerminal,entries } from "./current-pcb-via-write-journal-codec.ts";
import { currentPcbViaWriteRequestSchema } from "./current-pcb-via-write-plan.ts";
import { CURRENT_PCB_VIA_ABANDONMENT_MAX_BYTES,readCurrentPcbViaWriteAbandonmentFile } from "./current-pcb-via-write-abandonment-file.ts";

const hash=z.string().regex(/^[a-f\d]{64}$/u),id=z.string().min(20).max(96).regex(/^pcb209-via-write-[a-z\d][a-z\d-]*$/u);
const common={helperAllocated:z.literal(false),rootCreated:z.literal(false),exitClaimed:z.literal(false)};
export const currentPcbViaWriteGenerationClosureSchema=z.discriminatedUnion("outcome",[
  z.strictObject({outcome:z.literal("allocation-never-entered"),...common}),
  z.strictObject({outcome:z.literal("no-resource-allocated"),...common}),
  z.strictObject({outcome:z.literal("root-never-created"),helperAllocated:z.literal(true),helperReleased:z.literal(true),rootCreated:z.literal(false),exitClaimed:z.literal(false)}),
  z.strictObject({outcome:z.literal("root-exited"),helperAllocated:z.literal(true),helperReleased:z.literal(true),rootCreated:z.literal(true),originalRootExited:z.literal(true),originalJobEmpty:z.literal(true)}),
]);
export const currentPcbViaWriteFailureClosureValueSchema=z.strictObject({writer:currentPcbViaWriteGenerationClosureSchema,readback:currentPcbViaWriteGenerationClosureSchema.nullable(),capture:z.enum(["not-started","all-original-handles-closed"]),saved:z.literal(false),reopened:z.literal(false),completionClaimed:z.literal(false),ownerTransferred:z.literal(false),replayAllowed:z.literal(false)});
export const currentPcbViaWriteAbandonmentBodySchema=z.strictObject({operationId:id,recordedAt:z.iso.datetime(),originalStoredJournalSha256:hash,originalEntireJournalSha256:hash,originalPlanSha256:hash,originalJournal:z.record(z.string(),z.unknown()),
  originalClosure:currentPcbViaWriteFailureClosureValueSchema,producerContract:z.literal("original-failed-disposable-via:all-factory-calls-publication-helpers-captures-settled.v1"),
  classification:z.literal("historical-abandonment-verified"),historicalQuarantineRelinquished:z.literal(true),authorityRestored:z.literal(false),executionAuthorized:z.literal(false)});
export const currentPcbViaWriteAbandonmentSchema=z.strictObject({schema:z.literal("easyeda-pro-control.pcb209-via-write-abandonment.v1"),body:currentPcbViaWriteAbandonmentBodySchema,bodySha256:hash});
export interface CurrentPcbViaWriteAbandonmentInspection {
  readonly schema:"easyeda-pro-control.pcb209-via-write-abandonment-inspection.v1";readonly classification:"historical-abandonment-verified";readonly operationId:string;
  readonly originalStoredJournalSha256:string;readonly originalEntireJournalSha256:string;readonly bodySha256:string;readonly artifact:ArtifactDescriptor;
  readonly saved:false;readonly reopened:false;readonly completionClaimed:false;readonly ownerTransferred:false;readonly replayAllowed:false;readonly authorityRestored:false;readonly executionAuthorized:false;
}
function need(v:boolean):asserts v{if(!v){throw new Error("PCB_VIA_ABANDONMENT_EVIDENCE");}}
function bag(v:unknown):Record<string,unknown>{need(isRecord(v));return v;}
/** Preserves the exact narrow generated Via family, including source-derived
 * geometry. A historical arbitrary path/plan cannot clear this quarantine. */
export function requireCurrentPcbViaAbandonmentPlan(input:unknown,operationId:string):void{
  const p=bag(input),t=bag(p["target"]),v=bag(p["via"]);need(p["schema"]==="private.current-pcb-via-write-plan.v1"&&p["operationId"]===operationId&&Object.keys(p).length===9&&Object.keys(t).length===5&&Object.keys(v).length===9);
  const raw=z.string().max(4096).parse(t["rawWindowsPath"]);normalizeEasyedaProjectPath(raw);need(/\\Codex_(?:via_only|line_and_via)_[a-f\d]{16}\.eprj2$/u.test(raw)&&t["projectUuid"]===sha256Text(raw));
  for(const field of ["branchUuid","documentUuid"]){z.string().regex(/^[a-f\d]{32}$/u).parse(t[field]);}hash.parse(t["expectedSourceSha256"]);hash.parse(p["initialLogicalSha256"]);
  const request=currentPcbViaWriteRequestSchema.parse({schema:"easyeda-pro-control.pcb209-via-write-request.v1",operationId,via:{netName:v["netName"],xMil:v["xMil"],yMil:v["yMil"],holeDiameterMil:v["holeDiameterMil"],diameterMil:v["diameterMil"]}});
  need(v["viaType"]===0&&v["designRuleBlindViaName"]===""&&v["primitiveLock"]===false&&canonicalJson(v["solderMaskExpansion"])===canonicalJson({topSolderMask:0,bottomSolderMask:0})&&p["inverseAvailable"]===false&&p["footprintDocumentAllocationRequired"]===false&&p["footprintStructureWriterRequired"]===false);
  const a=request.via;need(canonicalJson(p["expectedNative"])===canonicalJson({family:"Via",net:"",x:a.xMil/10,y:a.yMil/10,radius:a.diameterMil/20,holeRadius:a.holeDiameterMil/20,type:0,startLayer:1,endLayer:2,expansionType:2,topExpansion:0,bottomExpansion:0,locked:false}));
}
export function requireCurrentPcbViaAbandonableJournal(operation:OperationJournal):void{
  need(!currentPcbViaWriteHistoricalTerminal(operation));const records=entries(operation);need(records.some(r=>r.kind==="failure"));const data=bag(operation.plan);requireCurrentPcbViaAbandonmentPlan(data["plan"],operation.operationId);
}
function bindClosure(operation:OperationJournal,value:z.infer<typeof currentPcbViaWriteFailureClosureValueSchema>):void{
  const records=entries(operation);const has=(kind:string):boolean=>records.some(r=>r.kind===kind);const writer=value.writer;
  if(!writer.rootCreated){need(!has("launch-result")&&!has("opening-result")&&!has("create-result"));}if(!writer.helperAllocated){need(!has("allocation-result"));}
  if(value.readback===null||!value.readback.rootCreated){need(!has("reopen-result")&&!has("reopen-exit-result")&&!has("reopened-sql-result"));}
  if(has("closed-sql-result")||has("reopened-sql-result")){need(value.capture==="all-original-handles-closed");}
  for(const noProcess of records){if(noProcess.kind==="no-process-release-result"){const g=noProcess.evidence["generation"]==="writer"?writer:value.readback;need(g!==null&&g.outcome==="root-never-created");}}
}
export async function freshCurrentPcbViaAbandonmentJournal(operationId:string):Promise<OperationJournal>{
  id.parse(operationId);const operation=await loadOperation(operationId);requireCurrentPcbViaAbandonableJournal(operation);
  for(const artifact of operation.artifacts??[]){await verifyExactManagedArtifact(artifact);}const final=await loadOperation(operationId);requireCurrentPcbViaAbandonableJournal(final);need(sha256Json(final)===sha256Json(operation));return final;
}
export async function inspectCurrentPcbViaWriteAbandonment(operationId:string,expected?:Readonly<{storedJournalSha256:string;entireStoredJournalSha256:string}>):Promise<CurrentPcbViaWriteAbandonmentInspection|undefined>{
  id.parse(operationId);let retained:Awaited<ReturnType<typeof readCurrentPcbViaWriteAbandonmentFile>>;
  try{retained=await readCurrentPcbViaWriteAbandonmentFile(operationId);}catch(error){if(isErrnoException(error)&&error.code==="ENOENT"){return undefined;}throw error;}
  need(retained.artifact.bytes<=CURRENT_PCB_VIA_ABANDONMENT_MAX_BYTES);const envelope=currentPcbViaWriteAbandonmentSchema.parse(JSON.parse(retained.text) as unknown);const body=envelope.body;
  need(retained.text===`${JSON.stringify(envelope)}\n`&&body.operationId===operationId&&sha256Json(body)===envelope.bodySha256);
  const operation=await freshCurrentPcbViaAbandonmentJournal(operationId);bindClosure(operation,body.originalClosure);
  need(canonicalJson(body.originalJournal)===canonicalJson(operation)&&body.originalStoredJournalSha256===operation["journalSha256"]&&body.originalEntireJournalSha256===sha256Json(operation)&&body.originalPlanSha256===sha256Json(bag(operation.plan)["plan"]));
  if(expected!==undefined){need(body.originalStoredJournalSha256===expected.storedJournalSha256&&body.originalEntireJournalSha256===expected.entireStoredJournalSha256);}
  await readExactBinaryArtifact(retained.artifact);const final=await freshCurrentPcbViaAbandonmentJournal(operationId);need(sha256Json(final)===body.originalEntireJournalSha256);await verifyExactManagedArtifact(retained.artifact);
  return Object.freeze({schema:"easyeda-pro-control.pcb209-via-write-abandonment-inspection.v1",classification:"historical-abandonment-verified",operationId,originalStoredJournalSha256:body.originalStoredJournalSha256,originalEntireJournalSha256:body.originalEntireJournalSha256,bodySha256:envelope.bodySha256,artifact:retained.artifact,saved:false,reopened:false,completionClaimed:false,ownerTransferred:false,replayAllowed:false,authorityRestored:false,executionAuthorized:false});
}
