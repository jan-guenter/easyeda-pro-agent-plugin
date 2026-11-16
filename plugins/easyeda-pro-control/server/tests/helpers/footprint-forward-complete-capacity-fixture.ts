/** Synthetic SQL and inert original-source parsing; no native owners. */
import { sha256Text } from "../../src/core.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "../../src/current-footprint-saved-flow-cache-data.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../../src/current-footprint-copy-v2-plan.ts";
import { prepareCurrentFootprintSourcePlan } from "../../src/current-footprint-source-plan.ts";
import { requireCurrentFootprintForwardWriterMainRequestReservation, reserveCurrentFootprintForwardWriterMainRequestPlan } from "../../src/current-footprint-forward-writer-main-request-plan.ts";
import { deriveCurrentFootprintMutationPublicationData } from "../../src/current-footprint-mutation-publication-data.ts";
import { qualifyCurrentFootprintMutationPublicationSource } from "../../src/current-footprint-mutation-publication-source.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./symbol-sql-fixture.ts";
import { readConfiguredEasyedaAssets } from "./installed-easyeda-source.ts";

const defaultLabels=Object.freeze({username:"synthetic-user",nickname:"Synthetic"});
function quote(value:string):string{return `'${value.replaceAll("'","''")}'`;}
export async function completeCapacityFixture(labels:Readonly<{username:string;nickname:string}>=defaultLabels):Promise<Readonly<{
 reservation:ReturnType<typeof reserveCurrentFootprintForwardWriterMainRequestPlan>;
 publication:ReturnType<typeof deriveCurrentFootprintMutationPublicationData>;
 input:ReturnType<typeof captureCurrentFootprintSavedFlowCacheInput>;
 flow:ReturnType<typeof deriveCurrentFootprintSavedFlowCacheData>;
 maximum:ReturnType<typeof requireCurrentFootprintForwardWriterMainRequestReservation>;
}>> {
 const projectUuid="1".repeat(64);
 const branchUuid=IDS.branch;
 const client="a".repeat(16);
 const sql=await fixture({project:projectUuid,branch:branchUuid,target:IDS.target});
 const head=(ticket:number):string=>`${JSON.stringify({type:"DOCHEAD",ticket})}||${JSON.stringify({docType:"FOOTPRINT",client,uuid:IDS.target,updateTime:300,version:"300",editVersion:"3.2.209",user:{uuid:IDS.actor,username:"synthetic-user",nickname:"Synthetic"}})}`;
 const meta='{"type":"META","ticket":30,"id":"META"}||{"title":"Source","description":"","tags":[],"source":"original"}';
 const pad='{"type":"PAD","ticket":20,"id":"pad"}||{"number":"1"}';
 const plaintext=['{"type":"EDIT_HEAD"}||{}',head(100),meta,pad].join("|\n");
 mutate(sql.path,`UPDATE history_data SET dataStr='${encrypted(plaintext,IDS.oldHead,IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'; UPDATE users SET username=${quote(labels.username)},nickname=${quote(labels.nickname)}`);
 const before=await inventory(sql.path);
 const source=await prepareCurrentFootprintSourcePlan(before,{projectUuid,branchUuid,footprintUuid:IDS.target});
 const copy=await prepareCurrentFootprintCopyV2Plan(before,source,{client,content:[head(101),meta,head(100),pad].join("|\n")});
 const reservation=reserveCurrentFootprintForwardWriterMainRequestPlan(copy,{projectUuid,branchUuid,projectKey:projectUuid,path:"inert-capacity"},{minimum:1_700_000_000_000,maximum:1_700_000_000_010});
 const maximum=requireCurrentFootprintForwardWriterMainRequestReservation(reservation);
 const split=maximum.dataStr.indexOf('{"type":"DOCHEAD"',1);
 if(split<2){throw new Error("SYNTHETIC_COPY_SECOND_HEADER");}
 const assets=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);
 const worker=assets?.[0];
 if(worker===undefined){throw new Error("INSTALLED_EASYEDA_SOURCE_REQUIRED");}
 const publication=deriveCurrentFootprintMutationPublicationData(qualifyCurrentFootprintMutationPublicationSource(worker),[maximum.dataStr.slice(0,split-2),maximum.dataStr.slice(split)]);
 const input=captureCurrentFootprintSavedFlowCacheInput({projectUuid,branchUuid,headHistoryUuid:IDS.oldHead,heads:[{id:5,uuid:IDS.oldHead,parent:null,key:IDS.oldKey,is_lock:1,num:0,snapshot_num:0,created_at:"2020-01-01 00:00:00",updated_at:"2020-01-01 00:00:00",lock_time:"1970-01-01 08:00:00"}],chunks:[{historyUuid:IDS.oldHead,ordinal:0,plaintext,plaintextSha256:sha256Text(plaintext)}]});
 return {reservation,publication,input,flow:deriveCurrentFootprintSavedFlowCacheData(input),maximum};
}
