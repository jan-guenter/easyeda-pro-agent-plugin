/** Inert data profile only. No original owner, SQL reader or issuer exists. */
import { sha256Text } from "../../src/core.ts";
import type { compareCurrentPcbViaLiveHistoryCacheData } from "../../src/current-pcb-via-live-history-cache-data.ts";

export function viaLiveHistoryCacheInput(mode: "append" | "mutable"): Parameters<typeof compareCurrentPcbViaLiveHistoryCacheData>[0] {
  const projectUuid="a".repeat(64);const branchUuid="b".repeat(32);const documentUuid="c".repeat(32);const old="d".repeat(32);const next=mode==="append"?"e".repeat(32):old;
  const initialActor={uuid:"1".repeat(32),username:"",nickname:"",updateTime:1};const actor={...initialActor,updateTime:2};
  const row={id:1,uuid:old,parent:null,key:"f".repeat(32),is_lock:0 as const,num:0 as const,snapshot_num:0 as const,created_at:"2026-11-01 00:00:00",updated_at:"2026-11-01 00:00:00",lock_time:"1970-01-01 08:00:00",iv:old};
  const initialIndex=[{...row,dataStrUrl:`/api/v4/histories/dataStr?path=${projectUuid}&uuid=${old}`,editHead:[initialActor],docs:[{[documentUuid]:0}],docIds:[[documentUuid]]}];
  const body=`{"type":"DOCHEAD","ticket":4}||${JSON.stringify({docType:"PCB",client:"fixed",uuid:documentUuid,updateTime:3,version:"3",editVersion:"3.2.209"})}|\n{"type":"VIA","ticket":3,"id":"2222222222222222"}||{"centerX":1}`;
  const plaintext=`{"type":"EDIT_HEAD"}||${JSON.stringify(actor)}|\n${body}`;const head=mode==="mutable"?{...row,num:1 as const}:{...row,id:2,uuid:next,parent:old,key:"0".repeat(32),created_at:"2026-11-07 01:02:03",updated_at:"2026-11-07 01:02:04",iv:next};
  const initialBody=JSON.stringify(initialIndex),initialBranchBody=JSON.stringify({uuid:branchUuid,delete_status:0,name:"main",project_uuid:projectUuid,branch_uuid:branchUuid,history_uuid:old,description:"",node:false,created_at:row.created_at,updated_at:row.updated_at,parent_uuid:null,parent_name:null,creator_nickname:"",creator_uuid:initialActor.uuid,modifier_nickname:"",default:true,project_histories_id:1});
  return{projectUuid,branchUuid,documentUuid,clock:3,body,plaintext,
    initial:{projectUuid,branchUuid,historyUuid:old,namespace:`project_${projectUuid}_v6`,initialSourceSha256:"3".repeat(64),initialLogicalSha256:"4".repeat(64),projectionSourceSha256:"5".repeat(64),documents:[{documentUuid,url:`https://client/dataStr/${old}-${documentUuid}`,body:"initial-original-data",sha256:sha256Text("initial-original-data")}],headIndex:{url:`https://client/index/v1/${branchUuid}`,body:initialBody,sha256:sha256Text(initialBody)},nativeWorkerOwnershipVerified:false,cacheContinuationAuthorized:false,completeUploadFrontierVerified:false},
    initialBranch:{projectUuid,branchUuid,historyUuid:old,body:initialBranchBody,importLocalOffsetMinutes:0,nativeCurrentTimezoneVerified:false,writerClockAuthority:false,continuationAuthorized:false},
    effects:{schema:"private.current-project-history-sql-effects.v1",projectUuid,branchUuid,initialLogicalSha256:"4".repeat(64),mode,historyUuid:next,parentHistoryUuid:old,keyHex:head.key,chunkUuid:mode==="mutable"?`${next}-1`:next,dataBase64:"YQ==",plaintextSha256:sha256Text(plaintext),bodySha256:sha256Text(body),historyNum:mode==="mutable"?1:0,actor,projectUpdatedAt:"2026-11-07 01:02:05",projectModifierUuid:actor.uuid,nativeCallbacks:[],originalServiceAwaitCompleted:true,selectedSqlStillFenced:true},
    native:{projectUuid,branchUuid,historyUuid:next,rows:mode==="mutable"?[head]:[head,row]}};
}
