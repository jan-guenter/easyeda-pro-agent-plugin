/** Complete-only fixed workflow reservation, including the original natural
 * timer, durable workflow journal and disjoint held cold successor. This pure
 * budget grants no execution: Core requires the actual original workflow, five
 * retained references and its current durable Create-intent prefix. Historical
 * profiles and ordinary-project admission remain unchanged. */
import {CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_REQUESTS as SQL} from "./current-footprint-forward-writer-main-mutation-budget.ts";
import {currentFootprintForwardWriterProfile} from "./current-footprint-forward-writer-profile.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_REQUESTS as OLD_FRONTIER} from "./current-footprint-forward-writer-frontier-budget.ts";
import {CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY as PREVIOUS} from "./current-footprint-copy-forward-capacity.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_BUDGET as FLOW} from "./current-footprint-forward-writer-workflow-budget.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_WORKFLOW_V2_BUDGET as FLOW_V2} from "./current-footprint-forward-writer-workflow-v2-budget.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BUDGET as TIMER} from "./current-footprint-forward-writer-ticket-timer-contract.ts";

// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve the exact immutable inherited scope and new fixed stage types without widening the birth discriminator.
function derive(){
 const previous=currentFootprintForwardWriterProfile();
 const joint=Object.freeze({callbackRuns:752,rendererRequests:21*752+38,controls:3*752+10,events:15*752+40,records:6*752+24});
 const tail=Object.freeze({rendererRequests:242,events:200,controls:4});
 const reflection=Object.freeze({rendererRequests:25,events:5,controls:2});
 const mainExtra=Object.freeze({normal:27+SQL.normal,cleanup:6+SQL.cleanup,total:33+SQL.total});
 const wrappers=Object.freeze(["observation","publication-setup","body","local","upload","drain","post","delete","settlement-first","settlement-second","final-frontier","own-reflection","timer-prepare","timer-before-create","timer-finish"]);
 const wrapperControls=wrappers.length*32*2*2;
 const rendererExtra=joint.rendererRequests+tail.rendererRequests+reflection.rendererRequests+TIMER.rendererRequests-OLD_FRONTIER.rendererCommands;
 const normal=previous.renderer.normalClassLimit+rendererExtra;
 const cleanup=previous.renderer.cleanupClassLimit;
 const normalControls=previous.controls.normal+32*rendererExtra+2*mainExtra.total+wrapperControls+joint.controls-OLD_FRONTIER.controls+tail.controls+reflection.controls+TIMER.controls;
 const cleanupControls=previous.controls.cleanup+2*mainExtra.cleanup+wrapperControls;
 const controls=Object.freeze({normal:normalControls,cleanup:cleanupControls,total:normalControls+cleanupControls});
 const extraControls=controls.total-previous.controls.total;
 const extraStdout=(rendererExtra+mainExtra.total+extraControls)*PREVIOUS.controls.replyHeaderBytes;
 const workflowArtifactBytes=FLOW.records*FLOW.normalRecordBytes;
 const artifactBytes=joint.records*4096+TIMER.records*TIMER.recordBytes+workflowArtifactBytes;
 const journalBytes=joint.records*(4096+8192+512)+2*65_536+TIMER.manifestBytes+FLOW.manifestBytes;
 return freezeDeep({...previous,
  profile:"private.current-footprint-forward-writer-complete-birth.v2",graphKind:"complete-v2",nativeSwitch:"-WorkerStartupFootprintForwardWriterComplete209",
  renderer:{...previous.renderer,normalClassLimit:normal,cleanupClassLimit:cleanup,normalRequestLimit:normal+cleanup,requestLimit:normal+cleanup,normalIdCeiling:normal+cleanup,eventCount:previous.renderer.eventCount+joint.events-OLD_FRONTIER.eventCount+tail.events+reflection.events+TIMER.events},
  main:{...previous.main,normalRequestLimit:previous.main.normalRequestLimit+mainExtra.normal,cleanupRequestLimit:previous.main.cleanupRequestLimit+mainExtra.cleanup,ordinaryNormalRequestLimit:previous.main.ordinaryNormalRequestLimit+mainExtra.normal,requestLimit:previous.main.requestLimit+mainExtra.total},
  controls,
  stages:{...previous.stages,complete:{joint,tail,reflection,timer:TIMER,workflow:FLOW,workflowArtifactBytes,sql:SQL,mainExtra,wrappers,wrapperControls,naturalTicketTimerBudgetReserved:true}},
  output:{...previous.output,helperStdoutBytes:previous.output.helperStdoutBytes+extraStdout,artifactBytes:previous.output.artifactBytes-OLD_FRONTIER.artifactBytes+artifactBytes,journalBytes:previous.output.journalBytes-OLD_FRONTIER.journalBytes+journalBytes,retainedBytes:previous.output.retainedBytes-OLD_FRONTIER.retainedBytes+artifactBytes+journalBytes},
  writerHelperStdoutBytes:previous.writerHelperStdoutBytes+extraStdout,
  pendingContinuationBudgets:[],
  pendingOriginalProviders:[],
  wholeWriterReserved:true,executionAuthorized:false,saveAuthorized:false,
 } as const);
}
let retained:ReturnType<typeof derive>|null=null;
export function currentFootprintForwardWriterCompleteV2Profile():ReturnType<typeof derive>{retained??=derive();return retained;}

export const CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_CURRENT_BIRTH_PROFILE="private.current-footprint-forward-writer-complete-birth.v3";
let current:ReturnType<typeof deriveCurrent>|null=null;
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve every historical field while exposing the distinct current V3 discriminator.
function deriveCurrent(){
 const previous=currentFootprintForwardWriterCompleteV2Profile(), workflow=FLOW_V2;
 const workflowArtifactBytes=workflow.records*workflow.normalRecordBytes;
 const artifacts=workflowArtifactBytes-previous.stages.complete.workflowArtifactBytes;
 const journals=workflow.manifestBytes-previous.stages.complete.workflow.manifestBytes;
 return freezeDeep({...previous,profile:CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_CURRENT_BIRTH_PROFILE,
  controls:{...previous.controls,normal:previous.controls.normal+1,total:previous.controls.total+1},
  writerHelperStdoutBytes:previous.writerHelperStdoutBytes+PREVIOUS.controls.replyHeaderBytes,
  stages:{...previous.stages,complete:{...previous.stages.complete,tail:{...previous.stages.complete.tail,controls:previous.stages.complete.tail.controls+1},workflow,workflowArtifactBytes}},
  output:{...previous.output,helperStdoutBytes:previous.output.helperStdoutBytes+PREVIOUS.controls.replyHeaderBytes,artifactBytes:previous.output.artifactBytes+artifacts,journalBytes:previous.output.journalBytes+journals,retainedBytes:previous.output.retainedBytes+artifacts+journals},
 } as const);
}
export function currentFootprintForwardWriterCompleteProfile():ReturnType<typeof deriveCurrent>{current??=deriveCurrent();return current;}
