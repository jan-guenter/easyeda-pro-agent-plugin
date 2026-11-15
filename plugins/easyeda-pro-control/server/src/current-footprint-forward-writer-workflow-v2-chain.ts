/** Original v2 fact-chain validation only. This function neither publishes a
 * record nor issues/consumes a live owner or native release attempt. */
import { canonicalJson,sha256Json } from "./core.ts";
import { currentFootprintForwardWriterWorkflowRecordSchema as V1_RECORD } from "./current-footprint-forward-writer-workflow-contract.ts";
import type { CurrentFootprintForwardWriterWorkflowRecord as V1Entry } from "./current-footprint-forward-writer-workflow-contract.ts";
import { assertCurrentFootprintForwardWriterWorkflowChain as assertV1Chain } from "./current-footprint-forward-writer-workflow-journal.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_BUDGET as BUDGET,currentFootprintForwardWriterWorkflowV2EvidenceSchemas as EVIDENCE,
 currentFootprintForwardWriterWorkflowV2RecordSchema } from "./current-footprint-forward-writer-workflow-v2-contract.ts";
import type { CurrentFootprintForwardWriterWorkflowV2Record as Entry } from "./current-footprint-forward-writer-workflow-v2-contract.ts";

type Cleanup=ReturnType<typeof EVIDENCE["cleanup-intent"]["parse"]>;
type Result=ReturnType<typeof EVIDENCE["cleanup-result"]["parse"]>;
type Generation=Cleanup["generation"];
interface FailedRelease {readonly intent:number;readonly result:number;retried:boolean}
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_WRITER_WORKFLOW_V2_${code}`);}}
/** Pure validation projection, never a rewrite of retained/persisted records.
 * Only the already-validated failed release pair is omitted for applying the
 * unchanged historical stage/exit/join grammar to its one v2 successor. */
function historical(records:readonly Entry[],omitted:ReadonlySet<number>):readonly V1Entry[]{
 const output:V1Entry[]=[];
 for(const [index,record]of records.entries()){
  if(!omitted.has(index)){
   let evidence=record.evidence;
   if((record.kind==="cleanup-intent"||record.kind==="cleanup-result")&&record.evidence["action"]==="release"&&record.evidence["attempt"]===2){
    const {preDispatchProof:_proof,...rest}=record.evidence;evidence={...rest,attempt:1};
   }
   const previous=output.at(-1);
   const parsed=V1_RECORD.parse({...record,schema:"easyeda-pro-control.footprint-forward-flow-record.v1",sequence:output.length,
    previousSha256:output.length===0?null:sha256Json(previous),evidence});
   output.push(parsed);
  }
 }
 return output;
}
export function assertCurrentFootprintForwardWriterWorkflowV2Chain(input:readonly Entry[]):void{
 need(input.length<=BUDGET.records,"CHAIN_BOUND");
 const records=input.map(record=>currentFootprintForwardWriterWorkflowV2RecordSchema.parse(record));
 const omitted=new Set<number>();const releases=new Map<Generation,FailedRelease>();
 let pending:Readonly<{index:number;evidence:Cleanup}>|null=null;
 let normal=0;let cleanup=0;let normalBytes=0;let cleanupBytes=0;
 for(const [index,record]of records.entries()){
  const previous=records[index-1];
  need(record.sequence===index&&record.previousSha256===(previous===undefined?null:sha256Json(previous))&&(previous===undefined||record.operationId===previous.operationId),"ORIGINAL_CHAIN");
  const bytes=Buffer.byteLength(JSON.stringify(record))+1;
  const isCleanup=record.kind==="cleanup-intent"||record.kind==="cleanup-result"||record.kind==="terminal-failure";
  need(bytes<=(isCleanup?BUDGET.cleanupRecordBytes:BUDGET.normalRecordBytes),"RECORD_BOUND");
  if(isCleanup){cleanup+=1;cleanupBytes+=bytes;}else{normal+=1;normalBytes+=bytes;}
  need(normal<=BUDGET.normalRecords&&cleanup<=BUDGET.cleanupRecords&&normalBytes<=BUDGET.normalBytes&&cleanupBytes<=BUDGET.cleanupBytes,"CLASS_RESERVATION");
  if(record.kind==="cleanup-intent"){
   const evidence=EVIDENCE["cleanup-intent"].parse(record.evidence);need(pending===null,"CLEANUP_PREDECESSOR");
   if(evidence.action==="release"&&evidence.attempt===2){
    const first=releases.get(evidence.generation);need(first!==undefined&&!first.retried&&"preDispatchProof"in evidence,"PRE_DISPATCH_RELEASE_PREDECESSOR");
    // Prove that the failed first pair itself obeyed all original termination,
    // Observer joins and cleanup ordering before using its recovery successor.
    assertV1Chain(historical(records.slice(0,index),omitted));
    omitted.add(first.intent);omitted.add(first.result);first.retried=true;
   }
   pending={index,evidence};
  }else if(record.kind==="cleanup-result"){
   const value:Result=EVIDENCE["cleanup-result"].parse(record.evidence);need(pending!==null&&pending.evidence.generation===value.generation&&pending.evidence.action===value.action&&pending.evidence.attempt===value.attempt,"ORIGINAL_CLEANUP_RESULT");
   if(value.action==="release"&&value.attempt===2){
    need("preDispatchProof"in value&&"preDispatchProof"in pending.evidence&&canonicalJson(value.preDispatchProof)===canonicalJson(pending.evidence.preDispatchProof),"ORIGINAL_RELEASE_PROOF_PROJECTION");
   }else if(value.action==="release"&&value.outcome==="failed"){
    need(!releases.has(value.generation),"FAILED_RELEASE_ONCE");releases.set(value.generation,{intent:pending.index,result:index,retried:false});
   }
   pending=null;
  }
 }
 assertV1Chain(historical(records,omitted));
}
