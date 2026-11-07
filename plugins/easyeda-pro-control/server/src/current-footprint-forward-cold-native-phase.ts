/** New-purpose managed birth and fixed native phase composition. This emits
 * source only; it authenticates no original UI issuer or whole writer budget. */
import { currentFootprintCopyClockRegistrationV2NativeSource } from "./current-footprint-copy-clock-registration-v2-native.ts";
import { currentFootprintCopyClockRpcV2NativeSource } from "./current-footprint-copy-clock-rpc-v2-native.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_LIMITS as LIMITS, CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_MAIN_LIMITS as MAIN } from "./current-footprint-forward-cold-native-limits.ts";
import { CURRENT_FOOTPRINT_COPY_ALLOCATION_NATIVE_ORDER as ORDER } from "./current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_PHASES, currentFootprintForwardColdNativeSource } from "./current-footprint-forward-cold-wire.ts";
import { CURRENT_FOOTPRINT_DETACHED_CACHE_REQUESTS as DETACHED } from "./current-footprint-detached-cache-profile.ts";

/** Compile in the same fixed source graph as the mechanically derived core.
 * Every owner field below belongs to this original partial instance. */
export function currentFootprintForwardColdNativePhaseSource(): string {
  return `${currentFootprintCopyClockRegistrationV2NativeSource()}\n${currentFootprintCopyClockRpcV2NativeSource()}\n${currentFootprintForwardColdNativeSource()}\n
public static class EasyedaFootprintForwardExecutionLimits {
public const int Requests=${String(LIMITS.requestLimit)},NormalRequests=${String(LIMITS.requestLimit)},NormalClass=${String(LIMITS.normalClass)},CleanupClass=${String(LIMITS.cleanupClass)};
public const int MainNormal=${String(MAIN.normalRequestLimit)},MainCleanup=${String(MAIN.cleanupRequestLimit)},MainRequests=${String(MAIN.requestLimit)};
public const int RegistrationRequests=${String(LIMITS.registration)},RpcNormal=${String(LIMITS.rpcNormal)},RpcCleanup=${String(LIMITS.rpcCleanup)},RpcRequests=${String(LIMITS.rpcTotal)};
public const long NormalMilliseconds=${String(LIMITS.normalMilliseconds)}L,TotalMilliseconds=${String(LIMITS.totalMilliseconds)}L;
public static bool AllowsExecutionRequestId(long id){return id>=1&&id<=Requests;}
}
internal sealed partial class EasyedaOriginalMainTransport {
internal enum ForwardExecutionMainBirth { V2 }
internal EasyedaOriginalMainTransport(ForwardExecutionMainBirth birth,System.Diagnostics.Stopwatch originalElapsed){
Need(birth==ForwardExecutionMainBirth.V2&&originalElapsed!=null,"forward-execution-purpose-clock");
forwardExecutionMain=true;elapsed=originalElapsed;normalLimit=EasyedaFootprintForwardExecutionLimits.MainNormal;cleanupLimit=EasyedaFootprintForwardExecutionLimits.MainCleanup;
}
internal bool ForwardExecutionProfile {get{return forwardExecutionMain;}}
internal static void VerifyForwardExecutionProfileSmoke(){
var clock=System.Diagnostics.Stopwatch.StartNew();var value=new EasyedaOriginalMainTransport(ForwardExecutionMainBirth.V2,clock);
Need(value.forwardExecutionMain&&System.Object.ReferenceEquals(value.elapsed,clock)&&value.NeverAttached&&value.normalLimit==87&&value.cleanupLimit==41&&value.normalLimit+value.cleanupLimit==128,"forward-execution-main-birth");
value.requests=52;value.normalRequests=42;value.cleanupRequests=10;value.RequireCompletionCapacity(52);
Need(value.requests==52&&value.normalRequests==42&&value.cleanupRequests==10,"forward-execution-capacity-no-consume");
value.requests=53;value.cleanupRequests=11;bool refused=false;try{value.RequireCompletionCapacity(53);}catch(System.InvalidOperationException){refused=true;}Need(refused,"forward-execution-main-tail-reserve");
foreach(var old in new[]{new EasyedaOriginalMainTransport(),new EasyedaOriginalMainTransport(true,clock),new EasyedaOriginalMainTransport(true,clock,true)}){Need(!old.forwardExecutionMain,"forward-execution-main-old-purpose");old.Release();}
value.Release();
}
}
public sealed partial class EasyedaDiagnosticOwner {
enum ForwardExecutionBirth { V2 }
EasyedaDiagnosticOwner(ForwardExecutionBirth birth) {
if(birth!=ForwardExecutionBirth.V2)throw Error("forward-execution-birth-marker");
forwardExecution=true;footprintCreateClockPurpose=true;
workerStartup=true;workerStartup209=true;workerStartupFootprint209=true;workerStartupFootprintCopy209=true;
workerStartupFootprintMain209=true;workerStartupFootprintForward209=true;workerStartupFootprintCombined209=true;
footprintElapsed=Stopwatch.StartNew();originalMain=new EasyedaOriginalMainTransport(EasyedaOriginalMainTransport.ForwardExecutionMainBirth.V2,footprintElapsed);
RequireForwardExecutionUnallocated();
}
public static EasyedaDiagnosticOwner CreateFootprintForwardExecution209(){return new EasyedaDiagnosticOwner(ForwardExecutionBirth.V2);}
public void RequireForwardExecutionUnallocated(){
if(!forwardExecution||!footprintCreateClockPurpose||!workerStartup||!workerStartup209||!workerStartupFootprint209||!workerStartupFootprintCopy209||!workerStartupFootprintMain209||!workerStartupFootprintForward209||!workerStartupFootprintCombined209||originalMain==null||!originalMain.ForwardExecutionProfile||!originalMain.NeverAttached||footprintElapsed==null||
job!=IntPtr.Zero||root!=IntPtr.Zero||rootThread!=IntPtr.Zero||browserRead!=IntPtr.Zero||browserWrite!=IntPtr.Zero||parentRead!=IntPtr.Zero||parentWrite!=IntPtr.Zero||rootPid!=0||rootCreated!=0||nextRequest!=1||forwardNormalRequests!=0||forwardCleanupRequests!=0||launchAttempted||launchCompleted||launchSettled||creationPhase!=CreationPhase.NotEntered||released||footprintCreateClockBegun||footprintClockRpcBegun||mainCompletionBegun)throw Error("forward-execution-unallocated");
}
public void AdmitForwardExecutionAction(string action){
if(!forwardExecution||!footprintCreateClockPurpose)throw Error("forward-execution-purpose");
switch(action){
case "identity":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "launch":
case "main-attach":case "main-reprove":case "main-close-detach":case "main-poll":case "main-send":
case "main-request-send":case "main-completion-begin":case "main-completion-send":case "main-completion-retire":
case "worker-startup-reprove":case "worker-startup-parent":case "footprint-copy-parent":case "footprint-copy-worker":case "footprint-cache-construction":case "worker-startup-send":case "send":case "poll":
case "footprint-copy-windows-clock":case "window":case "normal-close":case "termination":case "combined-abort":case "saved-cache-native":case "saved-cache-accessor":
case "restore-window-for-capture":case "resize-window-for-capture":case "window-capture-readiness":case "renderer-viewport-send":case "capture-window":
case "footprint-copy-allocation-send":case "footprint-copy-native-create":case "footprint-copy-create-clock-retire":
case "footprint-copy-clock-registration-v2":case "footprint-clock-rpc-v2-send":break;
case "footprint-forward-cold-send":case "footprint-forward-cold-begin":case "footprint-forward-allocated-clock-begin":break;
default:throw Error("forward-execution-provider-unmounted");}
AdmitCombinedAction(action);
}
bool forwardColdTailBegun;
public void BeginForwardAllocatedClock(int first,int coldNormal,int coldCleanup){
if(!forwardExecution||coldNormal<0||coldNormal>${String(DETACHED.normal - DETACHED.arm)}||coldCleanup<0||coldCleanup>${String(DETACHED.cleanup)}||first<1||first>EasyedaFootprintForwardExecutionLimits.Requests||first+EasyedaFootprintCopyAllocatedCreateClockLedger.Requests-1+coldNormal+coldCleanup>EasyedaFootprintForwardExecutionLimits.Requests||
forwardNormalRequests+EasyedaFootprintCopyAllocatedCreateClockLedger.ClockNormal+8+coldNormal>EasyedaFootprintForwardExecutionLimits.NormalClass||forwardCleanupRequests+EasyedaFootprintCopyAllocatedCreateClockLedger.ClockCleanup+3+coldCleanup>EasyedaFootprintForwardExecutionLimits.CleanupClass)throw Error("forward-cold-clock-reservation");
BeginFootprintCopyAllocatedCreateClock(first);
}
void RequireForwardColdTail(){if(!forwardExecution||!forwardColdTailBegun||!footprintCreateClockBegun||!footprintCreateClockRetired||footprintCreateClockActive||footprintClockRpcActive||footprintCreateClockLedger==null||footprintCreateClockLedger.CreateId<1||footprintCreateClockLedger.Failed)throw Error("forward-cold-tail-original");}
public void BeginForwardColdTail(){
if(forwardColdTailBegun||!forwardExecution||!footprintCreateClockBegun||!footprintCreateClockRetired||footprintCreateClockActive||footprintCreateClockLedger==null||footprintCreateClockLedger.CreateId<1||footprintCreateClockLedger.Failed)throw Error("forward-cold-tail-begin");
AssertLive();forwardColdTailBegun=true;RequireForwardColdTail();
}
static string ForwardColdField(System.Collections.IDictionary fields,string name){string value=fields[name] as string;if(value==null||!System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("forward-cold-field");return "\\""+value+"\\"";}
static string ForwardColdTailMessage(int id,string phase,string method,System.Collections.IDictionary fields){
string selected=phase=="tail-properties"?"Runtime.getProperties":phase=="tail-remove"?"Debugger.removeBreakpoint":phase=="tail-resume"?"Debugger.resume":null;
if(selected==null||method!=selected||fields==null||fields.Count!=(phase=="tail-resume"?1:2)||!fields.Contains("sessionId")||phase=="tail-properties"&&!fields.Contains("objectId")||phase=="tail-remove"&&!fields.Contains("breakpointId"))throw Error("forward-cold-tail-shape");
string parameters=phase=="tail-properties"?"{\\"objectId\\":"+ForwardColdField(fields,"objectId")+",\\"ownProperties\\":true,\\"generatePreview\\":false}":phase=="tail-remove"?"{\\"breakpointId\\":"+ForwardColdField(fields,"breakpointId")+"}":"{}";
return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\""+method+"\\",\\"sessionId\\":"+ForwardColdField(fields,"sessionId")+",\\"params\\":"+parameters+"}";
}
public void SendFootprintForwardCold(int id,string phase,string method,System.Collections.IDictionary fields){
if(!forwardExecution||!workerStartupFootprintCopy209||footprintCopyWorkerSession==null||fields==null||fields["sessionId"] as string!=footprintCopyWorkerSession||footprintCreateClockActive)throw Error("forward-cold-original-worker");
bool admitted=false;foreach(string value in new string[]{${CURRENT_FOOTPRINT_FORWARD_COLD_PHASES.map(value => JSON.stringify(value)).join(",")}})if(value==phase)admitted=true;
bool tail=phase=="tail-properties"||phase=="tail-remove"||phase=="tail-resume";if(!admitted&&!tail||tail&&!forwardColdTailBegun)throw Error("forward-cold-phase");
bool cleanup=phase=="detached-release"||phase=="tail-remove"||phase=="tail-resume";CheckFootprintWork(id,cleanup);
string message=tail?ForwardColdTailMessage(id,phase,method,fields):EasyedaFootprintForwardColdProtocol.Encode(id,phase,method,fields);
SendMessage(id,message,cleanup,forwardColdTailBegun?RendererWriteRole.ForwardCold:RendererWriteRole.Existing);
}
bool registrationV2Started,registrationV2WrapperSource,registrationV2CallbackSource,registrationV2Callback,registrationV2Bindings,registrationV2Released;
int registrationV2Requests,registrationV2Samples;
public void SendFootprintClockRegistrationV2(int id,string phase,string method,System.Collections.IDictionary fields){
bool release=phase=="release";
if(!forwardExecution||!workerStartupFootprintCopy209||!startupOpeningConsumed||startupActorContext==null||startupOpeningIdentity==null||!footprintUiStarted||footprintUiReleased||registrationV2Released||fields==null||registrationV2Requests>=EasyedaFootprintForwardExecutionLimits.RegistrationRequests-(release?0:1))throw Error("forward-registration-v2-purpose");
CheckFootprintWork(id,release);string[] context=startupActorContext.Split('\\n'),target=startupOpeningIdentity.Split('\\n');
if(context.Length!=2||target.Length!=7||fields.Contains("projectUuid")&&(string)fields["projectUuid"]!=target[3]||fields.Contains("branchUuid")&&(string)fields["branchUuid"]!=target[4])throw Error("forward-registration-v2-target");
if(phase=="initial"){if(registrationV2Started)throw Error("forward-registration-v2-consumed");}else if(!registrationV2Started)throw Error("forward-registration-v2-sequence");
if(phase=="wrapper-source"&&registrationV2WrapperSource||phase=="callback-source"&&(!registrationV2Callback||registrationV2CallbackSource)||phase=="callback"&&(!registrationV2WrapperSource||registrationV2Callback)||phase=="bindings"&&(!registrationV2CallbackSource||registrationV2Bindings)||phase=="sample"&&(!registrationV2Bindings||registrationV2Samples>=5))throw Error("forward-registration-v2-sequence");
string message=EasyedaFootprintCopyClockRegistrationV2Protocol.Encode(id,phase,method,context[0],fields);
registrationV2Requests++;if(phase=="initial")registrationV2Started=true;if(phase=="wrapper-source")registrationV2WrapperSource=true;if(phase=="callback-source")registrationV2CallbackSource=true;if(phase=="callback")registrationV2Callback=true;if(phase=="bindings")registrationV2Bindings=true;if(phase=="sample")registrationV2Samples++;if(release)registrationV2Released=true;
SendMessage(id,message);
}
public void SendFootprintClockRpcV2(int id,string phase,string method,string realm,System.Collections.IDictionary fields){
try{if(!forwardExecution||!footprintCreateClockPurpose||!footprintCreateClockActive||footprintCreateClockLedger==null||!registrationV2Bindings||registrationV2Released||startupActorContext==null||footprintCopyWorkerSession==null)throw Error("forward-rpc-v2-purpose");
AssertLive();bool cleanup=phase=="rpc-remove"||phase=="rpc-resume"||phase=="rpc-release";CheckFootprintWork(id,cleanup);
string text=EasyedaFootprintCopyClockRpcV2Protocol.Encode(id,phase,method,realm,footprintCopyWorkerSession,startupActorContext.Split('\\n')[0],fields);
footprintCreateClockLedger.Clock(id,cleanup);SendMessage(id,text,cleanup,RendererWriteRole.ClockRpc);
}catch{if(footprintCreateClockLedger!=null)footprintCreateClockLedger.Fail();throw;}
}
public static void VerifyFootprintForwardExecutionGraphSmoke(){
var born=CreateFootprintForwardExecution209();born.RequireForwardExecutionUnallocated();
if(born.FootprintRequestLimit!=EasyedaFootprintForwardExecutionLimits.Requests||born.forwardNormalRequests!=0||born.forwardCleanupRequests!=0)throw Error("forward-execution-graph-birth");
foreach(var old in new[]{new EasyedaDiagnosticOwner(),CreateWorkerStartupFootprintCombined209(),CreateWorkerStartupFootprintForward209()}){
bool refused=false;try{old.RequireForwardExecutionUnallocated();}catch(InvalidOperationException){refused=true;}if(!refused||old.root!=IntPtr.Zero||old.job!=IntPtr.Zero||old.launchAttempted)throw Error("forward-execution-graph-old-birth");if(old.originalMain!=null)old.originalMain.Release();}
foreach(string action in new[]{"footprint-clock-rpc-send","footprint-clock-rpc-begin","footprint-copy-clock","footprint-copy-allocated-create-clock-begin"}){bool refused=false;try{born.AdmitForwardExecutionAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("forward-execution-graph-alias");}
EasyedaOriginalMainTransport.VerifyForwardExecutionProfileSmoke();
EasyedaFootprintCopyClockRegistrationV2Protocol.VerifySmoke();EasyedaFootprintCopyClockRpcV2Protocol.VerifySmoke();
string[] phases=new string[]{${ORDER.map(value => JSON.stringify(value)).join(",")}};
var ledger=EasyedaFootprintCopyAllocatedCreateClockLedger.ForwardExecutionBirth(EasyedaFootprintForwardExecutionLimits.Requests-EasyedaFootprintCopyAllocatedCreateClockLedger.Requests+1);
ledger.Allocation(ledger.Next,phases[0],false);for(int i=0;i<13;i++)ledger.Clock(ledger.Next,false);ledger.Create(ledger.Next);
for(int i=1;i<9;i++)ledger.Allocation(ledger.Next,phases[i],i>=7);for(int i=13;i<EasyedaFootprintCopyAllocatedCreateClockLedger.ClockNormal;i++)ledger.Clock(ledger.Next,false);
for(int i=0;i<10;i++)ledger.Clock(ledger.Next,true);ledger.Allocation(ledger.Next,phases[9],true);for(int i=10;i<EasyedaFootprintCopyAllocatedCreateClockLedger.ClockCleanup;i++)ledger.Clock(ledger.Next,true);
if(ledger.Next!=EasyedaFootprintForwardExecutionLimits.Requests+1||ledger.CreateId!=EasyedaFootprintForwardExecutionLimits.Requests-63)throw Error("forward-execution-graph-ledger");ledger.Retire(false);
EasyedaFootprintForwardColdProtocol.VerifySmoke();
born.originalMain.Release();
}
}\n`;
}
