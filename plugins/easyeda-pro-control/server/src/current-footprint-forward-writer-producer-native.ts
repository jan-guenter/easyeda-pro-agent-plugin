/** Fixed producer observation on the separately born forward writer. These
 * original-instance transitions contain no Debugger.resume or caller program. */
import { currentProjectSaveProducerNativeSource } from "./current-project-save-producer-native.ts";
import { currentProjectSaveProducerGuardNativeSource } from "./current-project-save-producer-guard-native.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_ROLES, CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS as REQUESTS, currentProjectSaveProducerRoleLimit } from "./current-project-save-producer-protocol.ts";
import { currentFootprintForwardWriterCacheNativeSource } from "./current-footprint-forward-writer-cache-native.ts";
import { currentFootprintForwardWriterProfile } from "./current-footprint-forward-writer-profile.ts";

/** Emit only the fixed producer tables and original full-birth transitions. */
export function currentFootprintForwardWriterProducerNativeSource(): string {
  const cache = currentFootprintForwardWriterProfile().stages.cache;
  const limits = CURRENT_PROJECT_SAVE_PRODUCER_ROLES.map(role => `case "${role}":return ${String(["headEntry", "headPromise", "headSuccess"].includes(role) ? cache.jobs : currentProjectSaveProducerRoleLimit(role))};`).join("");
  return `${currentProjectSaveProducerNativeSource()}\n${currentProjectSaveProducerGuardNativeSource()}\n${currentFootprintForwardWriterCacheNativeSource()}\npublic sealed partial class EasyedaDiagnosticOwner {
bool forwardWriterBirth,forwardWriterProducerEnrolled;
string forwardWriterProducerContext,forwardWriterProducerScript;
int forwardWriterProducerRequests,forwardWriterProducerProperties,forwardWriterProducerIntrinsicStep;
readonly System.Collections.Generic.HashSet<string> forwardWriterProducerGuards=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
readonly System.Collections.Generic.HashSet<string> forwardWriterProducerArms=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
readonly System.Collections.Generic.HashSet<int> forwardWriterProducerMetadata=new System.Collections.Generic.HashSet<int>();
readonly System.Collections.Generic.Dictionary<string,int> forwardWriterProducerRoles=new System.Collections.Generic.Dictionary<string,int>(StringComparer.Ordinal);
void RequireForwardWriterProducer(){if(!forwardWriterBirth||!forwardExecution||footprintCombinedAbortAttempted||protocolFailed||released||footprintCopyWorkerSession==null||forwardWriterProducerContext==null||forwardWriterProducerScript==null)throw Error("forward-writer-producer-original-owner");}
static bool ForwardWriterProducerHandle(string value){return value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z");}
public void BindForwardWriterProducer(string context,string script){if(!forwardWriterBirth||!forwardExecution||forwardWriterProducerContext!=null||footprintCopyWorkerSession==null||!startupOpeningConsumed||footprintCreateClockBegun||!ForwardWriterProducerHandle(context)||!ForwardWriterProducerHandle(script))throw Error("forward-writer-producer-original-bootstrap");AssertLive();forwardWriterProducerContext=context;forwardWriterProducerScript=script;}
public void SendForwardWriterProducerGuard(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterProducer();if(forwardWriterProducerEnrolled||forwardWriterProducerIntrinsicStep!=0||fields==null||fields["scriptId"] as string!=forwardWriterProducerScript||forwardWriterProducerGuards.Count>=10)throw Error("forward-writer-producer-guard-order");string encoded=EasyedaProjectSaveProducerGuardProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);CheckFootprintWork(id,false);AssertLive();if(!forwardWriterProducerGuards.Add(phase))throw Error("forward-writer-producer-guard-once");SendMessage(id,encoded);}
static int ForwardWriterProducerRoleLimit(string phase){if(phase.StartsWith("project-save-producer-cache-",StringComparison.Ordinal))return ${String(cache.jobs)};string role=null;foreach(string prefix in new[]{"project-save-producer-frame-","project-save-producer-join-"})if(phase.StartsWith(prefix,StringComparison.Ordinal))role=phase.Substring(prefix.Length);switch(role){${limits}default:return 3;}}
public void SendForwardWriterProducerObserve(int id,string phase,string method,System.Collections.IDictionary fields){
RequireForwardWriterProducer();if(fields==null||forwardWriterProducerRequests>=${String(REQUESTS.normal + cache.additionalObservation)})throw Error("forward-writer-producer-capacity");string encoded=EasyedaProjectSaveProducerProtocol.Encode(id,footprintCopyWorkerSession,forwardWriterProducerContext,phase,method,fields);
if(phase.StartsWith("project-save-producer-intrinsics-",StringComparison.Ordinal)){
if(forwardWriterProducerEnrolled||forwardWriterProducerGuards.Count!=10||forwardWriterProducerArms.Count!=0)throw Error("forward-writer-producer-intrinsics-order");
if(phase=="project-save-producer-intrinsics-constructors"){if(forwardWriterProducerIntrinsicStep!=0)throw Error("forward-writer-producer-constructors-once");forwardWriterProducerIntrinsicStep=1;}
else if(phase=="project-save-producer-intrinsics-properties-constructors"){if(forwardWriterProducerIntrinsicStep!=1)throw Error("forward-writer-producer-constructors-properties-once");forwardWriterProducerIntrinsicStep=2;}
else if(phase=="project-save-producer-intrinsics-members"){if(forwardWriterProducerIntrinsicStep!=2||forwardWriterProducerMetadata.Count!=3)throw Error("forward-writer-producer-members-once");forwardWriterProducerIntrinsicStep=3;}
else if(phase=="project-save-producer-intrinsics-properties-members"){if(forwardWriterProducerIntrinsicStep!=3)throw Error("forward-writer-producer-members-properties-once");forwardWriterProducerIntrinsicStep=4;}
else if(phase.StartsWith("project-save-producer-intrinsics-metadata-",StringComparison.Ordinal)){int slot=Int32.Parse(phase.Substring("project-save-producer-intrinsics-metadata-".Length),CultureInfo.InvariantCulture);if(slot<=3?forwardWriterProducerIntrinsicStep!=2:forwardWriterProducerIntrinsicStep!=4)throw Error("forward-writer-producer-metadata-order");if(!forwardWriterProducerMetadata.Add(slot))throw Error("forward-writer-producer-metadata-once");}
else if(phase=="project-save-producer-intrinsics-reprove"){if(forwardWriterProducerIntrinsicStep!=4||forwardWriterProducerMetadata.Count!=23)throw Error("forward-writer-producer-intrinsics-reprove");forwardWriterProducerIntrinsicStep=5;}
else throw Error("forward-writer-producer-intrinsics-phase");
}else if(phase.StartsWith("project-save-producer-arm-",StringComparison.Ordinal)){
if(forwardWriterProducerEnrolled||forwardWriterProducerIntrinsicStep!=5||fields["scriptId"] as string!=forwardWriterProducerScript||forwardWriterProducerArms.Count>=${String(REQUESTS.newArms)}||!forwardWriterProducerArms.Add(phase))throw Error("forward-writer-producer-arm-once");
}else{
if(!forwardWriterProducerEnrolled)throw Error("forward-writer-producer-prefix-required");
if(phase=="project-save-producer-properties"){if(forwardWriterProducerProperties>=${String(REQUESTS.properties + cache.additionalEvents)})throw Error("forward-writer-producer-properties-capacity");forwardWriterProducerProperties++;}
else{int used;forwardWriterProducerRoles.TryGetValue(phase,out used);if(used>=ForwardWriterProducerRoleLimit(phase))throw Error("forward-writer-producer-role-capacity");forwardWriterProducerRoles[phase]=used+1;}}
CheckFootprintWork(id,false);AssertLive();forwardWriterProducerRequests++;SendMessage(id,encoded);
}
public void EnrollForwardWriterProducer(){RequireForwardWriterProducer();if(forwardWriterFrontierRecords>0&&(forwardWriterFrontierArms.Count!=4||forwardWriterFrontierTimerStep!=17))throw Error("forward-writer-frontier-prefix-required");if(forwardWriterProducerEnrolled||forwardWriterProducerGuards.Count!=10||forwardWriterProducerArms.Count!=${String(REQUESTS.newArms)}||forwardWriterProducerIntrinsicStep!=5||footprintCreateClockBegun)throw Error("forward-writer-producer-original-enrollment");AssertLive();forwardWriterProducerEnrolled=true;}
public static void VerifyForwardWriterProducerSmoke(){EasyedaProjectSaveProducerProtocol.VerifySmoke();EasyedaProjectSaveProducerGuardProtocol.VerifySmoke();var o=CreateFootprintForwardWriter209();try{bool refused=false;try{o.BindForwardWriterProducer("context","script");}catch(InvalidOperationException){refused=true;}if(!refused||o.forwardWriterProducerContext!=null)throw Error("forward-writer-producer-unissued-smoke");refused=false;try{o.EnrollForwardWriterProducer();}catch(InvalidOperationException){refused=true;}if(!refused||o.forwardWriterProducerEnrolled)throw Error("forward-writer-producer-enrollment-smoke");}finally{o.originalMain.Release();}}
}`;
}
