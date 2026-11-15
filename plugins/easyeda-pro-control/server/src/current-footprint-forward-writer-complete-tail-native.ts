import {currentFootprintForwardWriterTicketTimerControlDispatch} from "./current-footprint-forward-writer-ticket-timer-native.ts";
/** Complete-v2 fixed tail syntax and fresh original-instance ledgers. This
 * source never alters or grants the historical six-role writer birth. */
import {currentFootprintForwardWriterStartupWsNativeSource} from "./current-footprint-forward-writer-startup-ws-protocol.ts";
import {currentFootprintForwardWriterOwnDataNativeSource} from "./current-footprint-forward-writer-own-data-native.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentFootprintForwardWriterCopyTailCodecsNativeSource } from "./current-footprint-forward-writer-copy-tail-codecs-native.ts";
import { currentFootprintForwardWriterFrontierCases,currentFootprintForwardWriterFrontierTemplate } from "./current-footprint-forward-writer-frontier-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS,currentFootprintForwardWriterPublicationTemplate } from "./current-footprint-forward-writer-publication-protocol.ts";
import { currentFootprintForwardWriterBranchTemplates } from "./current-footprint-forward-writer-branch-wire.ts";

export {CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS} from "./current-footprint-forward-writer-complete-action-class.ts";
const hash=(value:string|Uint8Array):string=>createHash("sha256").update(value).digest("hex");
type Row=Readonly<{phase:string;method:string;fields:readonly string[];template:string}>;
/** These fixed handle-only rows use the unchanged bounded table decoder. */
function table(name:string,rows:readonly Row[],marker:string,session:boolean):string{
 const bytes=Buffer.from(rows.map(row=>[row.phase,row.method,row.fields.join(","),row.template].join("\t")).join("\0"));
 if(rows.length===0||bytes.length>60_000||new Set(rows.map(row=>row.phase)).size!==rows.length){throw new Error("FORWARD_COMPLETE_TAIL_ROWS");}
 // oxlint-disable-next-line node/no-sync -- Deterministic compression of immutable build-time rows, never supplied source.
 const packed=gzipSync(bytes,{level:9});
 const pattern=`"${marker}_([A-Za-z0-9]+)__"`;
 const golden=rows.map(row=>hash(`{"id":79,${row.template.replaceAll(new RegExp(pattern,"gu"),'"original_handle"').slice(1,-1)}${session?',"sessionId":"original_handle"':""}}\0`));
 return `internal static class ${name} {
static void Need(bool value){if(!value)throw new InvalidOperationException("forward-complete-tail-codebook");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}",${String(bytes.length)},"${hash(bytes)}","${hash(packed)}",${String(rows.length)},4);
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(value);}
internal static string Encode(int id,string session,string context,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(string[] candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(string field in names)Need(fields.Contains(field));
string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"${marker}_([A-Za-z0-9]+)__\\"",match=>Handle(match.Groups[1].Value=="boundContext"?context:fields[match.Groups[1].Value]));
text="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)${session?String.raw`+",\"sessionId\":"+Handle(session)`:""}+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
internal static void VerifySmoke(){string[] hashes={${golden.map(value=>JSON.stringify(value)).join(",")}};for(int i=0;i<Rows.Length;i++){string[] row=Rows[i];var fields=new System.Collections.Hashtable();foreach(string field in row[2].Split(','))if(field.Length>0)fields.Add(field,"original_handle");string encoded=Encode(79,"original_handle","original_handle",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);bool denied=false;try{Encode(79,"original_handle","original_handle",row[0],"Runtime.evaluate",fields);}catch(InvalidOperationException){denied=true;}Need(denied);}}
}
`;
}
function tables():string{
 const fixed=currentFootprintForwardWriterFrontierCases();
 const ready=fixed.filter(value=>value.lane==="callback"&&["project-save-structure-startupEntry","project-save-structure-startupReturn","project-save-structure-startupFinalizer"].includes(value.command.phase));
 // Each publication command uses the maintained ready=true validator.
 return readyTables(fixed,ready.length);
}
function readyTables(fixed:ReturnType<typeof currentFootprintForwardWriterFrontierCases>,expected:number):string{
 if(expected!==3){throw new Error("FORWARD_COMPLETE_PUBLICATION_ROSTER");}
 const ready=fixed.filter(value=>value.lane==="callback"&&["project-save-structure-startupEntry","project-save-structure-startupReturn","project-save-structure-startupFinalizer"].includes(value.command.phase)).map(value=>{
  const command=value.command;let role:keyof typeof CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS="startupFinalizer";if(command.phase==="project-save-structure-startupEntry"){role="startupEntry";}else if(command.phase==="project-save-structure-startupReturn"){role="startupReturn";}
  return currentFootprintForwardWriterPublicationTemplate({phase:"forward-copy-publication",lane:"callback",command:{...command,params:{...command.params,functionDeclaration:CURRENT_FOOTPRINT_FORWARD_WRITER_PUBLICATION_CALLS[role]}}});
 });
 const arms=fixed.filter(value=>value.lane==="callback"&&["project-save-structure-arm-startupEntry","project-save-structure-arm-startupReturn"].includes(currentFootprintForwardWriterFrontierTemplate(value).phase)).map(value=>{
  const params=value.command.params,row=currentFootprintForwardWriterFrontierTemplate(value);
  if(!("condition" in params)||typeof params.condition!=="string"){throw new TypeError("FORWARD_COMPLETE_ARM_CONDITION");}
  const removed=`,"condition":${JSON.stringify(params.condition)}`;
  if(row.template.split(removed).length!==2){throw new Error("FORWARD_COMPLETE_ARM_SOURCE");}
  return {phase:row.phase,method:row.method,fields:row.fields,template:row.template.replace(removed,"")};
 });
 if(arms.length!==2){throw new Error("FORWARD_COMPLETE_ARM_ROSTER");}
 return `${table("EasyedaForwardWriterReadyPublicationRows",ready,"__fwf",true)+table("EasyedaForwardWriterCompleteArmRows",arms,"__fwf",true)+table("EasyedaForwardWriterCompleteBranchProtocol",currentFootprintForwardWriterBranchTemplates(),"__forward_branch",false)}
internal static class EasyedaForwardWriterPublicationProtocol {internal static string Encode(int id,string session,string context,string lane,string phase,string method,System.Collections.IDictionary fields){if(phase=="project-save-structure-startupEntry"||phase=="project-save-structure-startupReturn"||phase=="project-save-structure-startupFinalizer")return EasyedaForwardWriterReadyPublicationRows.Encode(id,session,context,phase,method,fields);return EasyedaForwardWriterFrontierProtocol.Encode(id,session,context,lane,phase,method,fields);}}
internal static class EasyedaForwardWriterCompleteFrontierProtocol {internal static string Encode(int id,string session,string context,string lane,string phase,string method,System.Collections.IDictionary fields){if(phase=="project-save-structure-arm-startupEntry"||phase=="project-save-structure-arm-startupReturn")return EasyedaForwardWriterCompleteArmRows.Encode(id,session,context,phase,method,fields);return EasyedaForwardWriterFrontierProtocol.Encode(id,session,context,lane,phase,method,fields);}}
`;
}
const OWNER=String.raw`
public sealed partial class EasyedaDiagnosticOwner {
bool forwardWriterCompleteBirth=false,forwardWriterCompleteTimerBaseline=false,forwardWriterCompletePublishTimerComplete=false;
int forwardWriterCompleteTimerArms=0;
int fullLocalStep,fullUploadStep,fullBranchWorkerStep,fullBranchMainStep,fullLiveStep,fullTailStep,fullDeleteStep;
bool fullDeleteCallResumed,fullDeleteReturnedResumed,fullPostComplete,fullDrainComplete,fullComplete;
string fullLocalBody,fullPostMerged;bool fullReplayBound;
int fullCopyBodyEscapedMaximum,fullCopyBodyRawMaximum;
void RequireForwardWriterCompleteBase(){RequireForwardWriterProducer();if(!forwardWriterCompleteBirth||!forwardWriterProducerEnrolled||!forwardWriterCacheCompleted||!forwardWriterInitialSyncComplete||!forwardWriterFrontierComplete||fullComplete)throw Error("forward-complete-original-owner");AssertLive();}
void RequireForwardWriterCompleteCreated(){RequireForwardWriterCompleteBase();var clock=footprintCreateClockLedger as EasyedaForwardWriterAllocatedClockLedger;if(!footprintCreateClockBegun||clock==null||clock.CreateId<1||clock.Failed)throw Error("forward-complete-original-create");}
void RequireForwardWriterCompletePrecreate(){RequireForwardWriterCompleteBase();if(fullCopyBodyEscapedMaximum<1||footprintCreateClockBegun||fullTailStep!=3||fullPublicationRecords<2||fullBranchMainStep!=10||fullBranchWorkerStep<5||fullBranchWorkerStep>6||!fullStartupWsConsumed||!fullOwnDataReady||!forwardWriterCompleteTimerBaseline||forwardWriterCompleteTimerArms!=3)throw Error("forward-complete-before-create");}
public void SendForwardWriterBranchQuery(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteBase();if(footprintCreateClockBegun||fullBranchMainStep<1||fullBranchMainStep>10||fullBranchWorkerStep>=6||phase!=EasyedaForwardWriterBranchQueryProtocol.Phase(fullBranchWorkerStep))throw Error("forward-complete-branch-query-order");string text=EasyedaForwardWriterBranchQueryProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);fullBranchWorkerStep++;SendForwardWriterNormalMessage(id,text);}
static readonly string[] FullBranchPhases={"forward-writer-branch-arm","forward-writer-branch-frame","forward-writer-branch-join-capture","forward-writer-branch-properties-packet","forward-writer-branch-properties-promise","forward-writer-branch-join-resolved","forward-writer-branch-join-value","forward-writer-branch-remove","forward-writer-branch-step","forward-writer-branch-release"};
static readonly string[] FullLivePhases={"inverse-main-history-arm","inverse-main-history-frame","inverse-main-history-join-capture","inverse-main-history-properties-packet","inverse-main-history-properties-promise","inverse-main-history-join-resolved","inverse-main-history-properties-projectSql","inverse-main-history-properties-table","inverse-main-history-properties-branches","inverse-main-history-join-value","inverse-main-history-remove","inverse-main-history-step","inverse-main-history-release"};
void SendForwardWriterCompleteMain(int id,string framed,bool cleanup){if(id!=mainRequest+1||id-stockMainRequests>EasyedaFootprintForwardExecutionLimits.MainRequests)throw Error("forward-complete-main-id");string message=ForwardWriterHistoryMessage(framed);MainPurpose();AssertLive();mainRequest=id;originalMain.SendFixed(message,cleanup);AssertLive();}
public void SendForwardWriterBranchMain(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteBase();if(fullBranchMainStep>=20||phase!=FullBranchPhases[fullBranchMainStep%10]||originalMain==null||!originalMain.ForwardExecutionProfile)throw Error("forward-complete-branch-main-order");if(fullBranchMainStep<10){if(footprintCreateClockBegun||mainCompletionBegun)throw Error("forward-complete-branch-precreate");}else{RequireForwardWriterCompleteCreated();if(!mainCompletionRetired||mainCompletionFailed)throw Error("forward-complete-branch-postcreate");}string framed=EasyedaForwardWriterCompleteBranchProtocol.Encode(id,null,null,phase,method,fields);bool cleanup=phase=="forward-writer-branch-remove"||phase=="forward-writer-branch-release";fullBranchMainStep++;SendForwardWriterCompleteMain(id,framed,cleanup);}
public void SendForwardWriterLiveHistory(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteCreated();if(!mainCompletionRetired||mainCompletionFailed||fullBranchMainStep<11||fullLiveStep>=13||phase!=FullLivePhases[fullLiveStep])throw Error("forward-complete-live-history-order");string framed=EasyedaForwardWriterMainHistoryProtocol.Encode(id,phase,method,fields);bool cleanup=phase=="inverse-main-history-remove"||phase=="inverse-main-history-release";fullLiveStep++;SendForwardWriterCompleteMain(id,framed,cleanup);}
public void SendForwardWriterCopyLocal(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteCreated();if(fullLocalStep>=21||phase!=EasyedaForwardWriterCopyLocalProtocol.Phase(fullLocalStep)||fullLocalStep>0&&!fullPublicationBodyBound)throw Error("forward-complete-local-order");string text=EasyedaForwardWriterCopyLocalProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);if(fields.Contains("body")){string body=fields["body"] as string;if(body==null||fullCopyBodyEscapedMaximum<1||System.Text.Encoding.UTF8.GetByteCount(body)>fullCopyBodyRawMaximum||EasyedaForwardWriterCopyLocalProtocol.RequireBodyCapacity(body)>fullCopyBodyEscapedMaximum)throw Error("forward-complete-body-capacity");}if(phase=="forward-copy-local-proof-localIngress"){if(fullLocalBody!=null)throw Error("forward-complete-local-body-once");fullLocalBody=fields["argument0"] as string;if(!ForwardWriterProducerHandle(fullLocalBody))throw Error("forward-complete-local-body");}fullLocalStep++;SendForwardWriterNormalMessage(id,text);}
public void SendForwardWriterCopyUpload(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteCreated();if(fullLocalStep!=21||fullUploadStep>=9||phase!=EasyedaPcbViaUploadRequestProtocol.Phase(fullUploadStep))throw Error("forward-complete-upload-order");string text=EasyedaPcbViaUploadRequestProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);fullUploadStep++;SendForwardWriterNormalMessage(id,text);}
public void SendForwardWriterCopyTailObservation(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteBase();if(fullTailStep>=10||phase!=EasyedaPcbViaSaveTailObservationProtocol.Phase(fullTailStep))throw Error("forward-complete-tail-order");if(fullTailStep<3){if(footprintCreateClockBegun||fields==null||fields["scriptId"] as string!=forwardWriterProducerScript)throw Error("forward-complete-tail-arm");}else{RequireForwardWriterCompleteCreated();if(fullUploadStep!=9||fullTailStep>=7&&!fullDeleteCallResumed)throw Error("forward-complete-tail-cause");}string text=EasyedaPcbViaSaveTailObservationProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);fullTailStep++;SendForwardWriterNormalMessage(id,text);}
public void SendForwardWriterCopyDelete(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteCreated();if(fullUploadStep!=9||fullDeleteStep>=4||phase!=EasyedaPcbViaSaveTailDeleteControlProtocol.Phase(fullDeleteStep)||(fullDeleteStep<2?fullTailStep!=7:fullTailStep!=10)||!fullDrainResumed.Contains("historyReply")||!fullDrainResumed.Contains("detachedEntry")||fullDrainJobs[0]!=3)throw Error("forward-complete-delete-order");string text=EasyedaPcbViaSaveTailDeleteControlProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);if(fullDeleteStep==1){if(fullDeleteCallResumed)throw Error("forward-complete-delete-call-once");fullDeleteCallResumed=true;}if(fullDeleteStep==3){if(!fullDeleteCallResumed||fullDeleteReturnedResumed)throw Error("forward-complete-delete-return-once");fullDeleteReturnedResumed=true;}fullDeleteStep++;SendForwardWriterNormalMessage(id,text);}
int fullPublicationRecords,fullPublicationCalls,fullPublicationReturns,fullPublicationFinalizers,fullPublicationHeldRequests,fullPublicationRequests,fullPublicationQueueRequests;
string fullPublicationHeld;bool fullPublicationBodyBound,fullPublicationQueueOpened,fullPublicationQueueSeen,fullPublicationComplete;
public void ControlForwardWriterPublication(string operation,string role,int records){RequireForwardWriterCompleteBase();
if(operation=="bind"){if(role!=null||footprintCreateClockBegun||fullPublicationRecords!=0||records<2||records>480||records%2!=0||forwardWriterFrontierRecords+records>752)throw Error("forward-complete-publication-bind");fullPublicationRecords=records;return;}
if(records!=0||fullPublicationRecords<2)throw Error("forward-complete-publication-original");
if(operation=="body-bound"){RequireForwardWriterCompleteCreated();if(role!=null||fullPublicationBodyBound||fullLocalStep!=1)throw Error("forward-complete-publication-body");fullPublicationBodyBound=true;}
else if(operation=="callback-held"){RequireForwardWriterCompleteCreated();if(!fullPublicationBodyBound||fullPublicationHeld!=null||fullPublicationQueueOpened)throw Error("forward-complete-publication-held");if(role=="startupEntry"){if(fullPublicationCalls!=fullPublicationReturns||fullPublicationCalls>=fullPublicationRecords)throw Error("forward-complete-publication-entry");fullPublicationCalls++;}else if(role=="startupReturn"){if(fullPublicationCalls!=fullPublicationReturns+1)throw Error("forward-complete-publication-return");fullPublicationReturns++;}else if(role=="initialFinally"||role=="queuedFinally"){if(fullPublicationFinalizers>=fullPublicationReturns)throw Error("forward-complete-publication-finalizer");fullPublicationFinalizers++;}else throw Error("forward-complete-publication-role");fullPublicationHeld=role;fullPublicationHeldRequests=0;}
else if(operation=="queue-open"){RequireForwardWriterCompleteCreated();if(role!=null||fullPublicationHeld!=null||fullPublicationQueueOpened||fullLocalStep!=21||!fullPostComplete||!fullDrainComplete||fullPublicationCalls!=fullPublicationReturns||fullPublicationCalls!=fullPublicationFinalizers)throw Error("forward-complete-publication-queue");fullPublicationQueueOpened=true;}
else if(operation=="complete"){if(role!=null||!fullPublicationQueueOpened||!fullPublicationQueueSeen||fullPublicationComplete||fullPublicationHeld!=null||fullPublicationQueueRequests<2*fullPublicationCalls+3)throw Error("forward-complete-publication-complete");fullPublicationComplete=true;}
else throw Error("forward-complete-publication-control");
}
public void SendForwardWriterPublication(int id,string lane,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteCreated();if(fullPublicationRecords<2||!fullPublicationBodyBound||fullPublicationComplete)throw Error("forward-complete-publication-original");
if(lane=="callback"){string role=fullPublicationHeld;if(role==null||!ForwardWriterFrontierCallbackPhase(phase,role)||fullPublicationQueueOpened||fullPublicationRequests>=18*fullPublicationRecords)throw Error("forward-complete-publication-callback");int limit=role=="startupEntry"?8:role=="startupReturn"?4:6;if(fullPublicationHeldRequests>=limit||method=="Debugger.resume"&&fullPublicationHeldRequests!=limit-1)throw Error("forward-complete-publication-held-count");string encoded=EasyedaForwardWriterPublicationProtocol.Encode(id,footprintCopyWorkerSession,forwardWriterProducerContext,lane,phase,method,fields);fullPublicationHeldRequests++;fullPublicationRequests++;if(method=="Debugger.resume")fullPublicationHeld=null;SendForwardWriterNormalMessage(id,encoded);}
else if(lane=="queue"){if(!fullPublicationQueueOpened||fullPublicationHeld!=null||fullPublicationQueueRequests>=3*fullPublicationRecords+3||(phase!="project-save-structure-properties"&&phase!="inverse-startup-queue-empty"))throw Error("forward-complete-publication-queue-command");if(phase=="inverse-startup-queue-empty"){if(fullPublicationQueueSeen)throw Error("forward-complete-publication-queue-once");fullPublicationQueueSeen=true;}string encoded=EasyedaForwardWriterPublicationProtocol.Encode(id,footprintCopyWorkerSession,forwardWriterProducerContext,lane,phase,method,fields);fullPublicationQueueRequests++;SendForwardWriterNormalMessage(id,encoded);}
else throw Error("forward-complete-publication-lane");
}
int fullDrainRequests,fullDrainResumes;readonly int[] fullDrainJobs=new int[3];
readonly System.Collections.Generic.HashSet<string> fullDrainResumed=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
readonly System.Collections.Generic.Dictionary<string,int> fullDrainCounts=new System.Collections.Generic.Dictionary<string,int>(StringComparer.Ordinal);
bool FullDrainHas(string phase){return fullDrainCounts.ContainsKey(phase);}
void FullDrainNeed(string phase){if(!FullDrainHas(phase))throw Error("forward-complete-drain-proof");}
void RequireForwardWriterCopyDrain(){RequireForwardWriterCompleteCreated();if(fullLocalStep!=21||fullUploadStep!=9||fullTailStep<3||fullDrainComplete)throw Error("forward-complete-drain-owner");}
void RequireFullDrainResume(string role,int slot){if(slot<0||slot>2)throw Error("forward-complete-drain-slot");if(role=="headEntry"||role=="headPromise"||role=="headSuccess"){int wanted=role=="headEntry"?0:role=="headPromise"?1:2;if(fullDrainJobs[slot]!=wanted)throw Error("forward-complete-drain-job-order");if(slot==0&&!fullDrainResumed.Contains("detachedEntry")||slot>0&&fullPostStep<5||slot==2&&fullDrainJobs[1]<2)throw Error("forward-complete-drain-cache-cause");string proof=role=="headEntry"?(slot==0?"localSave":slot==1?"flow":"head"):role;FullDrainNeed("via-drain-call-"+proof+"-"+slot.ToString(CultureInfo.InvariantCulture));return;}
if(slot!=0||fullDrainResumed.Contains(role))throw Error("forward-complete-drain-source-once");if(role!="historyReply"&&!fullDrainResumed.Contains("historyReply"))throw Error("forward-complete-drain-before-reply");string required=role=="syncDeferred"?"syncEntry":role=="historyQueued"?"syncDeferred":role=="historyFinally"||role=="cloudReturned"?"historyQueued":role=="cloudFinally"?"cloudReturned":role=="batchReturned"?"cloudFinally":role=="bufferDone"?"batchReturned":null;if(required!=null&&!fullDrainResumed.Contains(required))throw Error("forward-complete-drain-cause");if(role=="syncEntry"&&(!fullDrainResumed.Contains("detachedEntry")||fullDrainJobs[0]<2)||role=="detachedReturned"&&(!fullDeleteReturnedResumed||fullDeleteStep!=4))throw Error("forward-complete-drain-detached-cause");FullDrainNeed("via-drain-call-"+(role=="historyReply"?"capture":role)+"-0");if(role=="historyReply"){FullDrainNeed("via-drain-properties-replyFrame-0-0");FullDrainNeed("via-drain-properties-capture-0-0");}if(role=="historyQueued")FullDrainNeed("via-drain-properties-queued-0-0");if(role=="cloudReturned")FullDrainNeed("via-drain-properties-cloudFrame-0-0");if(role=="bufferDone"||role=="batchReturned"||role=="detachedReturned")FullDrainNeed("via-drain-call-retain-"+(role=="bufferDone"?"0":role=="batchReturned"?"1":"2"));
}
public void SendForwardWriterCopyDrain(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCopyDrain();if(fullDrainRequests>=69)throw Error("forward-complete-drain-budget");string encoded=EasyedaPcbViaSaveDrainProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);bool resume=phase.StartsWith("via-drain-resume-",StringComparison.Ordinal);string role=null;int slot=0;if(resume){int end=phase.LastIndexOf('-');role=phase.Substring("via-drain-resume-".Length,end-"via-drain-resume-".Length);slot=int.Parse(phase.Substring(end+1),CultureInfo.InvariantCulture);RequireFullDrainResume(role,slot);}int count;fullDrainCounts.TryGetValue(phase,out count);if(count>=(phase=="via-drain-call-final-0"?2:1))throw Error("forward-complete-drain-once");fullDrainCounts[phase]=count+1;fullDrainRequests++;if(resume){if(role=="headEntry"||role=="headPromise"||role=="headSuccess")fullDrainJobs[slot]++;else fullDrainResumed.Add(role);fullDrainResumes++;}SendForwardWriterNormalMessage(id,encoded);}
int fullPostStep,fullPostRequests;readonly System.Collections.Generic.HashSet<string> fullPostSeen=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
static readonly string[] FullPostRoles={"syncEntry","syncFull","syncLast","syncHistory","syncMerged","syncFinalizing","syncReturned"};
static readonly string[][] FullPostRequired={
 new[]{"frame-module","frame-caller","call-capture","properties-module-0","properties-capture-0","properties-callee-0","properties-callee-1","properties-callee-2","properties-callee-3","properties-callee-4","properties-callee-5","properties-callee-6","properties-callee-7","properties-callee-8","properties-callee-9","properties-callee-10","properties-callee-11"},
 new[]{"properties-full-0","call-full"},new[]{"properties-frame-0","properties-reply-0","call-branch"},new[]{"properties-frame-0","properties-reply-0","properties-result-0","call-history"},new[]{"call-merged","replay"},new[]{"call-index","call-finalizing","properties-graph-0"},new[]{"call-returned","call-retain"},new[]{"properties-task-0","properties-outer-0"}};
bool FullPostHas(string phase){return fullPostSeen.Contains(fullPostStep.ToString(CultureInfo.InvariantCulture)+":via-post-sync-"+phase);}
bool FullPostAllowed(string phase){if(fullPostStep<0||fullPostStep>=8)return false;foreach(string suffix in FullPostRequired[fullPostStep])if(phase=="via-post-sync-"+suffix)return true;if(fullPostStep==5)for(int i=0;i<24;i++)if(phase=="via-post-sync-properties-graph-"+i.ToString(CultureInfo.InvariantCulture))return true;return false;}
void RequireFullPostResume(){if(fullPostStep<0||fullPostStep>=7)throw Error("forward-complete-post-resume-stage");foreach(string required in FullPostRequired[fullPostStep])if(!FullPostHas(required))throw Error("forward-complete-post-proof");}
void RequireForwardWriterCopyPost(){RequireForwardWriterCompleteCreated();if(fullUploadStep!=9||!fullDrainResumed.Contains("cloudFinally")||fullLiveStep<1||fullPostComplete)throw Error("forward-complete-post-owner");}
public void SendForwardWriterCopyPost(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCopyPost();if(fullPostRequests>=67)throw Error("forward-complete-post-budget");bool resume=fullPostStep<7&&phase=="via-post-sync-resume-"+FullPostRoles[fullPostStep];if(resume){RequireFullPostResume();}else if(!FullPostAllowed(phase))throw Error("forward-complete-post-phase");if(phase=="via-post-sync-replay"){if(fields==null||fields.Count!=0||!fullReplayBound||fullLocalBody==null||fullPostMerged==null)throw Error("forward-complete-replay-bound");fields=new System.Collections.Hashtable();fields.Add("originalBody",fullLocalBody);fields.Add("merged",fullPostMerged);}string encoded=EasyedaForwardWriterCopyPostProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);string key=fullPostStep.ToString(CultureInfo.InvariantCulture)+":"+phase;if(!fullPostSeen.Add(key)){if(fullPostStep!=7||!fullPostSeen.Add(key+":retry"))throw Error("forward-complete-post-once");}if(phase=="via-post-sync-call-merged")fullPostMerged=fields["objectId"] as string;fullPostRequests++;if(resume)fullPostStep++;SendForwardWriterNormalMessage(id,encoded);}
public void ControlForwardWriterCopyTail(string operation,System.Collections.IDictionary fields){RequireForwardWriterCompleteBase();if(fields==null)throw Error("forward-complete-control-fields");
if(operation=="precreate-body"){if(footprintCreateClockBegun||fullCopyBodyEscapedMaximum!=0||fields.Count!=1)throw Error("forward-complete-body-precreate-once");string maximumBody=fields["body"] as string;int escaped=EasyedaForwardWriterCopyLocalProtocol.RequireBodyCapacity(maximumBody);fullCopyBodyRawMaximum=System.Text.Encoding.UTF8.GetByteCount(maximumBody);fullCopyBodyEscapedMaximum=escaped;return;}
RequireForwardWriterCompleteCreated();
if(operation=="replay-bound"){RequireForwardWriterCopyPost();if(fullPostStep!=4||fullReplayBound||fields.Count!=2||fields["originalBody"] as string!=fullLocalBody||fields["merged"] as string!=fullPostMerged||fullLocalBody==null||fullPostMerged==null)throw Error("forward-complete-replay-original");fullReplayBound=true;return;}
if(fields.Count!=0)throw Error("forward-complete-control-empty");
if(operation=="post-complete"){RequireForwardWriterCopyPost();if(fullPostStep!=7||fullLiveStep!=13||!FullPostHas("properties-task-0")||!FullPostHas("properties-outer-0"))throw Error("forward-complete-post-settlement");fullPostComplete=true;}
else if(operation=="drain-complete"){RequireForwardWriterCopyDrain();if(fullDrainResumes!=20||!fullPostComplete||fullDeleteStep!=4||!fullDeleteReturnedResumed||fullLiveStep!=13||fullDrainResumed.Count!=11||fullDrainJobs[0]!=3||fullDrainJobs[1]!=3||fullDrainJobs[2]!=3)throw Error("forward-complete-drain-settlement");for(int i=0;i<9;i++)FullDrainNeed("via-drain-properties-settled-"+i.ToString(CultureInfo.InvariantCulture)+"-1");FullDrainNeed("via-drain-call-final-0");fullDrainComplete=true;}
else if(operation=="final-complete"){if(!fullPublicationComplete||!fullDrainComplete||!fullPostComplete||fullLiveStep!=13||fullBranchMainStep!=20||!forwardWriterCompleteTimerBaseline||!forwardWriterCompletePublishTimerComplete)throw Error("forward-complete-natural-timer-required");fullComplete=true;}
else throw Error("forward-complete-control");
}

public static void VerifyForwardWriterCompleteTailLedgerSmoke(){var owner=CreateFootprintForwardWriter209();try{
Action<Action> deny=delegate(Action action){bool rejected=false;try{action();}catch(InvalidOperationException){rejected=true;}if(!rejected)throw Error("forward-complete-ledger-expected-refusal");};
owner.fullDrainCounts.Add("via-drain-call-historyQueued-0",1);deny(delegate{owner.RequireFullDrainResume("historyQueued",0);});owner.fullDrainCounts.Clear();
owner.fullDrainCounts.Add("via-drain-call-flow-1",1);deny(delegate{owner.RequireFullDrainResume("headEntry",1);});owner.fullDrainCounts.Clear();
string[] roles={"historyReply","detachedEntry","headEntry","headPromise","headSuccess","syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","headEntry","headPromise","headSuccess","headEntry","headPromise","headSuccess","batchReturned","bufferDone","detachedReturned"};
int[] slots={0,0,0,0,0,0,0,0,0,0,0,1,1,1,2,2,2,0,0,0};
for(int i=0;i<roles.Length;i++){string role=roles[i];int slot=slots[i];bool head=role=="headEntry"||role=="headPromise"||role=="headSuccess";string proof="via-drain-call-"+(role=="historyReply"?"capture":role=="headEntry"?(slot==0?"localSave":slot==1?"flow":"head"):role)+"-"+slot.ToString(CultureInfo.InvariantCulture);
if(i==11)owner.fullPostStep=5;if(role=="detachedReturned"){owner.fullDeleteStep=4;owner.fullDeleteReturnedResumed=true;}
if(role=="historyReply"){owner.fullDrainCounts["via-drain-properties-replyFrame-0-0"]=1;owner.fullDrainCounts["via-drain-properties-capture-0-0"]=1;}
if(role=="historyQueued")owner.fullDrainCounts["via-drain-properties-queued-0-0"]=1;
if(role=="cloudReturned")owner.fullDrainCounts["via-drain-properties-cloudFrame-0-0"]=1;
if(role=="bufferDone"||role=="batchReturned"||role=="detachedReturned")owner.fullDrainCounts["via-drain-call-retain-"+(role=="bufferDone"?"0":role=="batchReturned"?"1":"2")]=1;
deny(delegate{owner.RequireFullDrainResume(role,slot);});owner.fullDrainCounts[proof]=1;owner.RequireFullDrainResume(role,slot);
if(head)owner.fullDrainJobs[slot]++;else owner.fullDrainResumed.Add(role);owner.fullDrainResumes++;
if(!head)deny(delegate{owner.RequireFullDrainResume(role,slot);});
}
if(owner.fullDrainResumes!=20||owner.fullDrainResumed.Count!=11||owner.fullDrainJobs[0]!=3||owner.fullDrainJobs[1]!=3||owner.fullDrainJobs[2]!=3)throw Error("forward-complete-ledger-dag-smoke");deny(delegate{owner.RequireFullDrainResume("headEntry",3);});
for(int stage=0;stage<7;stage++){owner.fullPostStep=stage;owner.fullPostSeen.Clear();deny(delegate{owner.RequireFullPostResume();});foreach(string phase in FullPostRequired[stage]){if(!owner.FullPostAllowed("via-post-sync-"+phase))throw Error("forward-complete-post-allowed-smoke");owner.fullPostSeen.Add(stage.ToString(CultureInfo.InvariantCulture)+":via-post-sync-"+phase);}owner.RequireFullPostResume();if(owner.FullPostAllowed("Runtime.evaluate"))throw Error("forward-complete-post-arbitrary-smoke");}
owner.fullPostStep=7;deny(delegate{owner.RequireFullPostResume();});
if(FullBranchPhases.Length!=10||FullLivePhases.Length!=13)throw Error("forward-complete-main-roster-smoke");
}finally{owner.originalMain.Release();}}
public static void VerifyForwardWriterCompleteTailSmoke(){VerifyForwardWriterTicketTimerSmoke();VerifyForwardWriterStartupWsSmoke();VerifyForwardWriterOwnDataSmoke();EasyedaForwardWriterReadyPublicationRows.VerifySmoke();EasyedaForwardWriterCompleteArmRows.VerifySmoke();EasyedaForwardWriterCompleteBranchProtocol.VerifySmoke();EasyedaForwardWriterCopyLocalProtocol.VerifySmoke();EasyedaForwardWriterBranchQueryProtocol.VerifySmoke();EasyedaForwardWriterCopyPostProtocol.VerifySmoke();var owner=CreateFootprintForwardWriter209();try{Action[] denied={delegate{owner.RequireForwardWriterCompletePrecreate();},delegate{owner.ControlForwardWriterPublication("bind",null,2);},delegate{owner.SendForwardWriterCopyLocal(1,"none","Debugger.resume",new System.Collections.Hashtable());},delegate{owner.ControlForwardWriterCopyTail("final-complete",new System.Collections.Hashtable());}};foreach(Action action in denied){bool refused=false;try{action();}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("forward-complete-unissued-smoke");}if(owner.fullLocalStep!=0||owner.fullComplete)throw Error("forward-complete-smoke-no-grant");}finally{owner.originalMain.Release();}}
}
`;

function scalarCase(action:string,method:string,extras:readonly string[]=[]):string{
 const base=["action","helperInstance","id","jobId","rootCreated","rootPid","requestId","phase","method",...extras];
 const extraArgs=extras.map(field=>`$request.${field},`).join("");
 return `        '${action}' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647${extras.map(field=>` -or $request.${field} -isnot [string]`).join("")}){throw 'forward-complete-fields'}
          $baseFields=@(${base.map(field=>`'${field}'`).join(",")});$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.${method}([int]$request.requestId,${extraArgs}$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
}
function dispatch():string{
 const cases=[
 ["footprint-forward-own-data","SendForwardWriterOwnData"],
 ["footprint-forward-ticket-timer","SendForwardWriterTicketTimer"],
 ["footprint-forward-branch-query","SendForwardWriterBranchQuery"],
 ["footprint-forward-writer-branch","SendForwardWriterBranchMain"],
 ["footprint-forward-live-history","SendForwardWriterLiveHistory"],
 ["footprint-forward-copy-local","SendForwardWriterCopyLocal"],
 ["footprint-forward-copy-upload","SendForwardWriterCopyUpload"],
 ["footprint-forward-copy-drain","SendForwardWriterCopyDrain"],
 ["footprint-forward-copy-post-sync","SendForwardWriterCopyPost"],
 ["footprint-forward-copy-delete","SendForwardWriterCopyDelete"],
 ["footprint-forward-copy-tail-observe","SendForwardWriterCopyTailObservation"],
 ] as const;
 return currentFootprintForwardWriterTicketTimerControlDispatch()+String.raw`        'footprint-forward-startup-ws' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.callFrameId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,callFrameId,helperInstance,id,jobId,requestId,rootCreated,rootPid'){throw 'forward-startup-ws-fields'}
          $owner.SendForwardWriterStartupWs([int]$request.requestId,$request.callFrameId);$result=@{written=$true}
        }
`+cases.map(([action,method])=>scalarCase(action,method)).join("")+scalarCase("footprint-forward-copy-publication","SendForwardWriterPublication",["lane"])+String.raw`        'footprint-forward-own-data-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,rootCreated,rootPid'){throw 'forward-complete-own-data-control'}
          $owner.ControlForwardWriterOwnData($request.operation);$result=@{written=$true}
        }
        'footprint-forward-copy-publication-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]){throw 'forward-complete-publication-control'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','operation');$role=[System.Management.Automation.Language.NullString]::Value;$records=0
          if($request.operation -ceq 'bind'){
            $base+=@('records');if(($request.records -isnot [int] -and $request.records -isnot [long]) -or $request.records -lt 2 -or $request.records -gt 480){throw 'forward-complete-publication-records'};$records=[int]$request.records
          }elseif($request.operation -ceq 'callback-held'){
            $base+=@('role');if($request.role -isnot [string]){throw 'forward-complete-publication-role'};$role=$request.role
          }elseif(@('body-bound','queue-open','complete') -cnotcontains $request.operation){throw 'forward-complete-publication-operation'}
          if((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($base | Sort-Object) -join ',')){throw 'forward-complete-publication-shape'}
          $owner.ControlForwardWriterPublication($request.operation,$role,$records);$result=@{written=$true}
        }
        'footprint-forward-copy-tail-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]){throw 'forward-complete-tail-control'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','operation');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          if($request.operation -ceq 'precreate-body'){
            $base+=@('body');if($request.body -isnot [string]){throw 'forward-complete-body-capacity'};$fields.Add('body',$request.body)
          }elseif($request.operation -ceq 'replay-bound'){
            $base+=@('originalBody','merged');if($request.originalBody -isnot [string] -or $request.merged -isnot [string]){throw 'forward-complete-replay-handles'}
            $fields.Add('originalBody',$request.originalBody);$fields.Add('merged',$request.merged)
          }elseif(@('post-complete','drain-complete','final-complete') -cnotcontains $request.operation){throw 'forward-complete-tail-operation'}
          if((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($base | Sort-Object) -join ',')){throw 'forward-complete-tail-shape'}
          $owner.ControlForwardWriterCopyTail($request.operation,$fields);$result=@{completed=$true}
        }
`;
}


/** The new complete graph alone appends this seventh role. */
export function currentFootprintForwardWriterCompleteTailNativeSource():string{return currentFootprintForwardWriterCopyTailCodecsNativeSource()+tables()+OWNER+currentFootprintForwardWriterOwnDataNativeSource()+currentFootprintForwardWriterStartupWsNativeSource();}
export function currentFootprintForwardWriterCompleteTailDispatch():string{return dispatch();}
