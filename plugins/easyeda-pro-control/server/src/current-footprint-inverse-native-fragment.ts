import { CURRENT_FOOTPRINT_INVERSE_DELETE_BINDING_DISPATCH,currentFootprintInverseDeleteBindingNativeSource } from "./current-footprint-inverse-delete-binding-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_LIBRARY_REFRESH_DISPATCH,currentFootprintInverseLibraryRefreshNativeSource } from "./current-footprint-inverse-library-refresh-native.ts";
import { applyCurrentProjectLibraryRefreshNativeFragment } from "./current-project-library-refresh-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_DISPATCH, currentFootprintInverseMainHistoryNativeSource } from "./current-footprint-inverse-main-history-native.ts";
import { currentFootprintInverseStartupCallbackNativeSource, currentFootprintInverseStartupQueueNativeSource } from "./current-footprint-inverse-startup-callback-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_TIMER_DISPATCH, currentFootprintInverseTimerNativeSource } from "./current-footprint-inverse-timer-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_CACHE_DISPATCH, CURRENT_FOOTPRINT_INVERSE_INVALIDATION_DISPATCH, currentFootprintInverseCacheNative } from "./current-footprint-inverse-cache-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_CONSTRUCTION_REQUESTS as CONSTRUCTION } from "./current-footprint-inverse-construction-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS, currentProjectSaveStructureNativeCases } from "./current-project-save-structure-protocol.ts";
import { currentPcbViaSavedLoadBootstrapCases } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
/** New original inverse birth. Existing purposes/ceilings/codebooks remain
 * unchanged; this initial native stage grants no delete or clock invocation. */
// oxlint-disable-next-line import/max-dependencies -- The sole fixed inverse native assembler must compose each separately bounded phase and exact aggregate limits.
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_API_DISPATCH,currentFootprintInversePublicApiNativeSource } from "./current-footprint-inverse-public-api-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_DISPATCH,currentFootprintInverseDeleteEncoderNativeSource } from "./current-footprint-inverse-delete-encoder-native.ts";
import { currentFootprintInverseRegistrationParams } from "./current-footprint-inverse-registration.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { CURRENT_FOOTPRINT_INVERSE_ACTION_LIMITS as ACTIONS, CURRENT_FOOTPRINT_INVERSE_DISCOVERY_METHODS as METHODS, CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS as PRODUCER, CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE, currentFootprintInverseColdLoadNativeSource, currentFootprintInverseInitialCacheNativeSource, currentFootprintInverseInitialSyncNativeSource, currentFootprintInverseModelStepNativeSource, currentFootprintInverseNoPublicationNativeSource, currentFootprintInverseProducerArmOrder } from "./current-footprint-inverse-native-profile.ts";

const BEGIN = "// BEGIN GENERATED ORIGINAL FOOTPRINT INVERSE BIRTH", END = "// END GENERATED ORIGINAL FOOTPRINT INVERSE BIRTH";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("FOOTPRINT_INVERSE_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`FOOTPRINT_INVERSE_NATIVE_ANCHOR:${before.slice(0, 80)}`); } return source.replace(before, after);
}
function native(): string {
  const path = String.raw`C:\Synthetic\Footprint_Validation.eprj2`, project = createHash("sha256").update(path).digest("hex");
  const expected = JSON.stringify({ id: PROFILE.renderer.total, method: "Runtime.callFunctionOn", params: currentFootprintInverseRegistrationParams("original", { rawWindowsPath: path, projectUuid: project, branchUuid: "a".repeat(32), documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) }), sessionId: "parent" });
  const expectedHash = createHash("sha256").update(`${expected}\0`).digest("hex");
  const workerCases = currentPcbViaSavedLoadBootstrapCases();
  const workerHash = createHash("sha256").update(workerCases.map(command => `${JSON.stringify({ id: PROFILE.renderer.total, method: command.method, params: command.params, sessionId: command.phase === "saved-load-run-browser" ? "original-browser" : "original-page" })}\0`).join("")).digest("hex");
  const order = workerCases.map(command => `${command.phase}${"role" in command ? `-${command.role}` : ""}`);
  const armRoles = currentProjectSaveStructureNativeCases().filter(command => command.phase === "project-save-structure-arm").map(command => command.role), constructorRoles = CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS;
  const constructionNative = String.raw`bool footprintInverseCtorBound,footprintInverseCtorInstrumentRemoved,footprintInverseCtorStarted,footprintInverseCtorSource;int footprintInverseCtorNormal,footprintInverseCtorCleanup,footprintInverseCtorHelpers,footprintInverseCtorHeldCount;string footprintInverseCtorInstrument,footprintInverseCtorHeld;readonly System.Collections.Generic.HashSet<string> footprintInverseCtorArms=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
static bool FootprintInverseConstructor(string role){foreach(string value in new[]{${constructorRoles.map(role => JSON.stringify(role)).join(",")}})if(value==role)return true;return false;}
public void SendFootprintInverseConstruction(int id,string phase,string method,System.Collections.IDictionary fields){if(!footprintInverse209||footprintInverseAborted||!footprintInverseSourceBound||fields==null)throw Error("footprint-inverse-construction-original");AssertLive();if(phase=="bind"){if(id!=0||method!="bind"||footprintInverseCtorBound||fields.Count!=1||!fields.Contains("instrumentationBreakpointId"))throw Error("footprint-inverse-construction-bind");footprintInverseCtorInstrument=fields["instrumentationBreakpointId"] as string;if(!System.Text.RegularExpressions.Regex.IsMatch(footprintInverseCtorInstrument??"",@"\A[A-Za-z0-9_.:-]{1,256}\z"))throw Error("footprint-inverse-construction-instrument");footprintInverseCtorBound=true;return;}if(!footprintInverseCtorBound)throw Error("footprint-inverse-construction-unbound");
if(phase.StartsWith("held-",StringComparison.Ordinal)){string role=phase.Substring(5);if(id!=0||method!="held"||fields.Count!=0||!footprintInverseCtorStarted||footprintInverseCtorHeld!=null||!FootprintInverseConstructor(role)&&role!="bootstrap"||++footprintInverseCtorHeldCount>${String(CONSTRUCTION.heldEvents)})throw Error("footprint-inverse-construction-held");footprintInverseCtorHeld=role;return;}
string text;if(phase=="inverse-construction-instrument"){if(method!="Debugger.removeBreakpoint"||footprintInverseCtorInstrumentRemoved||footprintInverseCtorStarted||footprintInverseCtorArms.Count!=${String(armRoles.length)}||fields.Count!=1||fields["breakpointId"] as string!=footprintInverseCtorInstrument)throw Error("footprint-inverse-construction-instrument-once");footprintInverseCtorInstrumentRemoved=true;text="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Debugger.removeBreakpoint\",\"params\":{\"breakpointId\":"+JsonString(footprintInverseCtorInstrument)+"},\"sessionId\":"+JsonString(footprintInversePageSession)+"}\0";}
else if(phase=="inverse-construction-start"){if(method!="Debugger.resume"||!footprintInverseCtorInstrumentRemoved||footprintInverseCtorStarted||fields.Count!=0)throw Error("footprint-inverse-construction-start-once");footprintInverseCtorStarted=true;text="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Debugger.resume\",\"params\":{},\"sessionId\":"+JsonString(footprintInversePageSession)+"}\0";}
else if(phase=="inverse-construction-helper"){string script=fields["scriptId"] as string;if(method!="Debugger.getScriptSource"||!footprintInverseCtorStarted||fields.Count!=1||!System.Text.RegularExpressions.Regex.IsMatch(script??"",@"\A[A-Za-z0-9_.:-]{1,256}\z")||++footprintInverseCtorHelpers>${String(CONSTRUCTION.helperSources)})throw Error("footprint-inverse-construction-helper");text="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Debugger.getScriptSource\",\"params\":{\"scriptId\":"+JsonString(script)+"},\"sessionId\":"+JsonString(footprintInversePageSession)+"}\0";}
else {bool cleanup=phase=="project-save-structure-remove";if(cleanup){if(++footprintInverseCtorCleanup>${String(CONSTRUCTION.sharedCleanup)}||footprintInverseCtorHeld!="bootstrap")throw Error("footprint-inverse-construction-cleanup");}else if(++footprintInverseCtorNormal>${String(CONSTRUCTION.sharedNormal)})throw Error("footprint-inverse-construction-budget");
if(phase=="project-save-structure-source"){if(footprintInverseCtorSource||footprintInverseCtorStarted||fields["scriptId"] as string!=footprintInverseWorkerScript)throw Error("footprint-inverse-construction-source");footprintInverseCtorSource=true;}
else if(phase.StartsWith("project-save-structure-arm-",StringComparison.Ordinal)){string role=phase.Substring("project-save-structure-arm-".Length);bool allowed=false;foreach(string value in new[]{${armRoles.map(role => JSON.stringify(role)).join(",")}})if(role==value)allowed=true;if(!footprintInverseCtorSource||footprintInverseCtorStarted||!allowed||fields["scriptId"] as string!=footprintInverseWorkerScript||!footprintInverseCtorArms.Add(role))throw Error("footprint-inverse-construction-arm");}
else if(phase.StartsWith("project-save-structure-resume-",StringComparison.Ordinal)){string role=phase.Substring("project-save-structure-resume-".Length);if(!footprintInverseCtorStarted||footprintInverseCtorHeld!=role||!FootprintInverseConstructor(role))throw Error("footprint-inverse-construction-resume");footprintInverseCtorHeld=null;}
else if(!footprintInverseCtorStarted||phase=="project-save-structure-release"||!phase.StartsWith("project-save-structure-",StringComparison.Ordinal))throw Error("footprint-inverse-construction-phase");
text=EasyedaPcbViaWorkerProtocol.Encode(id,footprintInversePageSession,phase,method,fields);}SendMessage(id,text);}
`;
  const producerNative=String.raw`static readonly string[] FootprintInverseProducerOrder=new[]{${currentFootprintInverseProducerArmOrder().map(value=>JSON.stringify(value)).join(",")}};
int footprintInverseProducerStep,footprintInverseProducerHelpers;
public static string FootprintInverseProducerProtocolMessage(int id,string session,string context,int step,string phase,string method,System.Collections.IDictionary fields){if(step<0||step>=FootprintInverseProducerOrder.Length||FootprintInverseProducerOrder[step]!=phase)throw Error("footprint-inverse-producer-order");return phase.StartsWith("inverse-producer-gate-",StringComparison.Ordinal)?FootprintInverseNoPublicationMessage(id,session,phase,method,fields):phase.StartsWith("project-save-producer-guard-",StringComparison.Ordinal)?EasyedaProjectSaveProducerGuardProtocol.Encode(id,session,phase,method,fields):EasyedaProjectSaveProducerProtocol.Encode(id,session,context,phase,method,fields);}
public void SendFootprintInverseProducerArm(int id,string phase,string method,System.Collections.IDictionary fields){if(!footprintInverse209||footprintInverseAborted||!footprintInverseSourceBound||!footprintInverseCtorStarted||footprintInverseCtorHeld!="bootstrap"||fields==null)throw Error("footprint-inverse-producer-bootstrap");AssertLive();string text;
if(phase=="inverse-producer-helper"){string script=fields["scriptId"] as string;if(method!="Debugger.getScriptSource"||fields.Count!=1||!System.Text.RegularExpressions.Regex.IsMatch(script??"",@"\A[A-Za-z0-9_.:-]{1,256}\z")||++footprintInverseProducerHelpers>${String(PRODUCER.helperSources)})throw Error("footprint-inverse-producer-helper");text="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Debugger.getScriptSource\",\"params\":{\"scriptId\":"+JsonString(script)+"},\"sessionId\":"+JsonString(footprintInversePageSession)+"}\0";}
else{if(fields.Contains("scriptId")&&fields["scriptId"] as string!=footprintInverseWorkerScript)throw Error("footprint-inverse-producer-script");text=FootprintInverseProducerProtocolMessage(id,footprintInversePageSession,footprintInverseWorkerContext,footprintInverseProducerStep,phase,method,fields);footprintInverseProducerStep++;}SendMessage(id,text);}
public static void VerifyFootprintInverseProducerArmSmoke(){if(FootprintInverseProducerOrder.Length!=${String(PRODUCER.normal)})throw Error("footprint-inverse-producer-order-count");var fields=new System.Collections.Hashtable();string text=FootprintInverseProducerProtocolMessage(79,"original-worker","original-context",0,FootprintInverseProducerOrder[0],"Runtime.callFunctionOn",fields);if(!text.StartsWith("{\"id\":79,",StringComparison.Ordinal)||text.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0||text.IndexOf("\"sessionId\":\"original-worker\"",StringComparison.Ordinal)<0)throw Error("footprint-inverse-producer-bound-source");foreach(int step in new[]{-1,${String(PRODUCER.normal)}}){bool denied=false;try{FootprintInverseProducerProtocolMessage(79,"original-worker","original-context",step,FootprintInverseProducerOrder[0],"Runtime.callFunctionOn",fields);}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-producer-order-refusal");}bool resumeDenied=false;try{FootprintInverseProducerProtocolMessage(79,"original-worker","original-context",0,FootprintInverseProducerOrder[0],"Debugger.resume",fields);}catch(InvalidOperationException){resumeDenied=true;}if(!resumeDenied)throw Error("footprint-inverse-producer-no-resume");}
`;
  const conditionHash=createHash("sha256").update(`${JSON.stringify({id:79,method:"Debugger.getScriptSource",params:{scriptId:"original-condition"},sessionId:"original-worker"})}\0`).digest("hex");
  const conditionNative=String.raw`int footprintInverseConditionBound,footprintInverseConditionReads;
public void BindFootprintInverseConditions(int records){if(!footprintInverse209||footprintInverseAborted||!footprintInverseSourceBound||footprintInverseCtorStarted||footprintInverseConditionBound!=0||records<1||records>512)throw Error("footprint-inverse-condition-bind");AssertLive();footprintInverseConditionBound=records;}
public static string FootprintInverseConditionMessage(int id,string session,string script){if(id<1||!System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\A[A-Za-z0-9_.:-]{1,256}\z")||!System.Text.RegularExpressions.Regex.IsMatch(script??"",@"\A[A-Za-z0-9_.:-]{1,256}\z"))throw Error("footprint-inverse-condition-envelope");return "{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Debugger.getScriptSource\",\"params\":{\"scriptId\":"+JsonString(script)+"},\"sessionId\":"+JsonString(session)+"}\0";}
public void SendFootprintInverseConditionSource(int id,string script){if(id<1||id>RequestLimit||!footprintInverse209||footprintInverseAborted||!footprintInverseSourceBound||!footprintInverseCtorStarted||footprintInverseConditionBound<1||footprintInverseConditionReads>=2*footprintInverseConditionBound+2)throw Error("footprint-inverse-condition-original");AssertLive();string text=FootprintInverseConditionMessage(id,footprintInversePageSession,script);footprintInverseConditionReads++;SendMessage(id,text);}
public static void VerifyFootprintInverseConditionSmoke(){string text=FootprintInverseConditionMessage(79,"original-worker","original-condition");using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=${JSON.stringify(conditionHash)})throw Error("footprint-inverse-condition-wire");bool denied=false;try{FootprintInverseConditionMessage(79,"original-worker","not an ID");}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-condition-selector-refusal");}
`;
  const workerNative = String.raw`static readonly string[] FootprintInverseWorkerOrder=new[]{${order.map(value => JSON.stringify(value)).join(",")}};
int footprintInverseActorStep,footprintInverseWorkerStep;bool footprintInverseParentArmed,footprintInverseWorkerBound,footprintInverseSourceBound,footprintInverseProjectAttempted;string footprintInverseWorkerTarget,footprintInverseBrowserSession,footprintInversePageSession,footprintInverseWorkerScript,footprintInverseWorkerContext;
public void SendFootprintInverseActors(int id,string stage){string[] stages={"before","arm","after"};if(!footprintInverse209||footprintInverseAborted||footprintInverseConstructionComplete||id!=footprintInverseActorStep+1||id>3||stages[id-1]!=stage)throw Error("footprint-inverse-actor-order");string text=SavedViaReadbackEarlyActorProtocolMessage(id,stage);footprintInverseActorStep++;SendMessage(id,text);}
public void SendFootprintInverseParent(int id,string session){if(!footprintInverse209||footprintInverseAborted||footprintInverseActorStep!=3||!footprintInversePathRegistrationConsumed||!footprintInverseCacheUntracked||footprintInverseParentArmed||session!=footprintInverseUiSession)throw Error("footprint-inverse-parent-once");footprintInverseParentArmed=true;string text="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\"Target.setAutoAttach\",\"params\":{\"autoAttach\":true,\"waitForDebuggerOnStart\":true,\"flatten\":true,\"filter\":[{\"type\":\"worker\",\"exclude\":false},{\"exclude\":true}]},\"sessionId\":"+JsonString(session)+"}\0";SendMessage(id,text);}
public void BindFootprintInverseWorker(string target,string browser,string page,string project,string tab){if(!footprintInverse209||footprintInverseAborted||!footprintInverseParentArmed||!footprintInverseProjectAttempted||footprintInverseWorkerBound||project!=footprintInverseProject||!System.Text.RegularExpressions.Regex.IsMatch(tab??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||!System.Text.RegularExpressions.Regex.IsMatch(target??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||!System.Text.RegularExpressions.Regex.IsMatch(browser??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||!System.Text.RegularExpressions.Regex.IsMatch(page??"",@"\A[A-Za-z0-9_.:-]{1,128}\z")||browser==page||browser==footprintInverseUiSession||page==footprintInverseUiSession)throw Error("footprint-inverse-worker-pair");footprintInverseWorkerTarget=target;footprintInverseBrowserSession=browser;footprintInversePageSession=page;footprintInverseWorkerBound=true;}
public void SendFootprintInverseWorker(int id,string phase,string method,System.Collections.IDictionary fields){if(!footprintInverse209||footprintInverseAborted||!footprintInverseWorkerBound||footprintInverseSourceBound)throw Error("footprint-inverse-worker-original");string session=phase=="saved-load-run-browser"?footprintInverseBrowserSession:footprintInversePageSession;string text=FootprintInverseWorkerProtocolMessage(id,session,footprintInverseWorkerStep,phase,method,fields);if(phase=="saved-load-source-project")footprintInverseWorkerScript=(string)fields["scriptId"];footprintInverseWorkerStep++;SendMessage(id,text);}
public static string FootprintInverseWorkerProtocolMessage(int id,string session,int step,string phase,string method,System.Collections.IDictionary fields){string[] order=FootprintInverseWorkerOrder;if(step<0||step>=order.Length||order[step]!=phase)throw Error("footprint-inverse-worker-order");return EasyedaPcbViaSavedLoadWorkerProtocol.Encode(id,session,phase,method,fields);}
public static void VerifyFootprintInverseWorkerSmoke(){string[] order=FootprintInverseWorkerOrder,methods=new[]{${workerCases.map(command => JSON.stringify(command.method)).join(",")}};var all=new System.Text.StringBuilder();for(int i=0;i<order.Length;i++){var fields=new System.Collections.Hashtable();if(methods[i]=="Debugger.getScriptSource")fields.Add("scriptId","saved_load_scriptId");all.Append(FootprintInverseWorkerProtocolMessage(${String(PROFILE.renderer.total)},order[i]=="saved-load-run-browser"?"original-browser":"original-page",i,order[i],methods[i],fields));}using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(all.ToString()))).Replace("-","").ToLowerInvariant()!="${workerHash}")throw Error("footprint-inverse-worker-byte-parity");bool denied=false;try{FootprintInverseWorkerProtocolMessage(1,"page",22,"saved-load-resume-project","Debugger.resume",new System.Collections.Hashtable());}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-project-resume-refusal");var fresh=CreateFootprintInverse209();for(int i=0;i<${String(PROFILE.main.reproofs)};i++)fresh.AdmitFootprintInverseAction("main-reprove");denied=false;try{fresh.AdmitFootprintInverseAction("main-reprove");}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-reproof-budget");fresh.AdmitFootprintInverseAction("footprint-inverse-abort");fresh.AdmitFootprintInverseAction("termination");fresh.AdmitFootprintInverseAction("release");fresh.originalMain.Release();}
public void BindFootprintInverseSource(string script,string context){if(!footprintInverse209||footprintInverseAborted||!footprintInverseWorkerBound||footprintInverseSourceBound||footprintInverseWorkerStep!=${String(order.length)}||script!=footprintInverseWorkerScript||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\A[A-Za-z0-9_.:-]{1,256}\z"))throw Error("footprint-inverse-source-once");footprintInverseSourceBound=true;footprintInverseWorkerContext=context;}
public void SendFootprintInverseProject(int id,string session,string context){if(!footprintInverse209||footprintInverseAborted||!footprintInversePathRegistrationConsumed||!footprintInverseParentArmed||footprintInverseProjectAttempted||session!=footprintInverseUiSession||context!=footprintInverseUiContext)throw Error("footprint-inverse-project-once");footprintInverseProjectAttempted=true;string text=OpeningProtocolMessageCore(false,1,session,context,"open-project",footprintInversePath,footprintInverseProject,footprintInverseBranch,footprintInverseDocument,footprintInverseSource,false);SendMessage(id,FootprintInversePhysicalId(id,text));}
`;
  const registrationNative = String.raw`static string FootprintInversePhysicalId(int id,string encoded){const string prefix="{\"id\":1,";if(id<1||id>${String(PROFILE.renderer.total)}||encoded==null||!encoded.StartsWith(prefix,StringComparison.Ordinal)||!encoded.EndsWith("}\0",StringComparison.Ordinal))throw Error("footprint-inverse-envelope");return "{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length);}
public void SendFootprintInversePreflight(int id,string session,string context,string path,string project,string branch,string document,string source){if(!footprintInverse209||footprintInverseAborted||!footprintInverseConstructionComplete||footprintInversePreflightConsumed)throw Error("footprint-inverse-preflight-once");footprintInversePreflightConsumed=true;string text=OpeningProtocolMessageCore(false,1,session,context,"preflight",path,project,branch,document,source,false);footprintInverseUiSession=session;footprintInverseUiContext=context;footprintInversePath=path;footprintInverseProject=project;footprintInverseBranch=branch;footprintInverseDocument=document;footprintInverseSource=source;SendMessage(id,FootprintInversePhysicalId(id,text));}
public static string FootprintInverseRegistrationProtocolMessage(int id,string session,string context,string path,string project,string branch,string document,string source){if(path==null||path.Length>1024||document==null||!System.Text.RegularExpressions.Regex.IsMatch(document,@"\A(?:[a-f0-9]{16}|[a-f0-9]{32})\z"))throw Error("footprint-inverse-registration-fields");string message=OpeningProtocolMessageCore(false,1,session,context,"preflight",path,project,branch,document,source,false);string before=JsonString(OpeningFunction),after=JsonString(FootprintInverseRegistrationFunction),argument="{\"value\":\"preflight\"}",selected="{\"value\":\"register-generated-fixture\"}";if(message.Split(new[]{before},StringSplitOptions.None).Length!=2||message.Split(new[]{argument},StringSplitOptions.None).Length!=2)throw Error("footprint-inverse-registration-template");message=message.Replace(before,after).Replace(argument,selected);if(System.Text.Encoding.UTF8.GetByteCount(message)>65536)throw Error("footprint-inverse-registration-bound");return FootprintInversePhysicalId(id,message);}
public void SendFootprintInverseRegistration(int id,string session,string context){if(!footprintInverse209||footprintInverseAborted||!footprintInverseConstructionComplete||!footprintInversePreflightConsumed||footprintInversePathRegistrationConsumed||session!=footprintInverseUiSession||context!=footprintInverseUiContext)throw Error("footprint-inverse-registration-once");footprintInversePathRegistrationConsumed=true;SendMessage(id,FootprintInverseRegistrationProtocolMessage(id,session,context,footprintInversePath,footprintInverseProject,footprintInverseBranch,footprintInverseDocument,footprintInverseSource));}
`;
  return `${BEGIN}
internal enum EasyedaFootprintInverseBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(EasyedaFootprintInverseBirth birth):this(){Need(birth==EasyedaFootprintInverseBirth.Original,"footprint-inverse-main-birth");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}
}
public sealed partial class EasyedaDiagnosticOwner {
bool footprintInverse209,footprintInverseAborted,footprintInverseRegistrationRemoved,footprintInverseConstructionComplete,footprintInversePreflightConsumed,footprintInversePathRegistrationConsumed;int footprintInverseControls,footprintInverseDiscovery;
string footprintInverseUiSession,footprintInverseUiContext,footprintInversePath,footprintInverseProject,footprintInverseBranch,footprintInverseDocument,footprintInverseSource;
EasyedaDiagnosticOwner(EasyedaFootprintInverseBirth birth):this(){if(birth!=EasyedaFootprintInverseBirth.Original)throw Error("footprint-inverse-birth");footprintInverse209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(EasyedaFootprintInverseBirth.Original);}
public static EasyedaDiagnosticOwner CreateFootprintInverse209(){return new EasyedaDiagnosticOwner(EasyedaFootprintInverseBirth.Original);}
readonly System.Collections.Generic.Dictionary<string,int> footprintInverseActionCounts=new System.Collections.Generic.Dictionary<string,int>(StringComparer.Ordinal);
public void AdmitFootprintInverseAction(string action){if(!footprintInverse209)throw Error("footprint-inverse-purpose");int limit;switch(action){${Object.entries(ACTIONS).map(([action, limit]) => `case "${action}":limit=${String(limit)};break;`).join("")}default:throw Error("footprint-inverse-provider-unmounted");}int count;footprintInverseActionCounts.TryGetValue(action,out count);count++;footprintInverseActionCounts[action]=count;footprintInverseControls++;if(count>limit||footprintInverseControls>${String(PROFILE.controls)})throw Error("footprint-inverse-control-budget");if(footprintInverseAborted&&action!="identity"&&action!="termination"&&action!="release")throw Error("footprint-inverse-cleanup-only");}
void FootprintInverseDiscovery(string method,string session){bool allowed=false;foreach(string candidate in new[]{${METHODS.map(method => `"${method}"`).join(",")}})if(method==candidate)allowed=true;if(!allowed||++footprintInverseDiscovery>${String(PROFILE.renderer.generic)})throw Error("footprint-inverse-discovery-only");if(session!=null&&!System.Text.RegularExpressions.Regex.IsMatch(session,@"\\A[A-Za-z0-9_.:-]{1,128}\\z"))throw Error("footprint-inverse-session");}
void SendFootprintInverseMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(!footprintInverse209||footprintInverseAborted||id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("footprint-inverse-main-id");if(phase.StartsWith("sql-fence-",StringComparison.Ordinal)){string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(text,false);AssertLive();return;}if(footprintInverseConstructionComplete)throw Error("footprint-inverse-main-construction-consumed");string encoded=EasyedaFootprintCopyMainBackendProtocol.Encode(id,phase,method,fields);mainRequest=id;if(phase=="remove")footprintInverseRegistrationRemoved=true;if(phase=="resume"&&footprintInverseRegistrationRemoved)footprintInverseConstructionComplete=true;originalMain.SendFixed(encoded,phase=="release"||phase=="remove"||phase=="resume");AssertLive();}
${registrationNative}
${workerNative}${conditionNative}
${constructionNative}
${producerNative}
${currentFootprintInverseNoPublicationNativeSource()}
${currentFootprintInverseCacheNative()}
public void AbortFootprintInverse(){if(!footprintInverse209||footprintInverseAborted||job==IntPtr.Zero||root==IntPtr.Zero||released)throw Error("footprint-inverse-original-abort");AssertLive();footprintInverseAborted=true;if(!TerminateJobObject(job,1))throw Error("footprint-inverse-abort");}
public static void VerifyFootprintInverseSmoke(){var value=CreateFootprintInverse209();if(!value.footprintInverse209||!value.workerStartupFootprintMain209||value.pcbViaWrite209||value.schematicDisplayWrite209||value.workerStartupFootprintCombined209||value.workerStartupFootprintCopy209||value.workerStartupFootprintForward209||value.layers209||value.visual209||value.spatial209||value.originalMain==null||!value.originalMain.NeverAttached||value.RequestLimit!=${String(PROFILE.renderer.total)})throw Error("footprint-inverse-purpose-smoke");foreach(string method in new[]{${METHODS.map(method => `"${method}"`).join(",")}})value.FootprintInverseDiscovery(method,null);foreach(string method in new[]{"Runtime.evaluate","Runtime.callFunctionOn","Debugger.resume"}){bool refused=false;try{value.FootprintInverseDiscovery(method,null);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("footprint-inverse-discovery-refusal");}foreach(string action in new[]{"footprint-delete-trigger-send","footprint-delete-clock-send","pcb-via-native","schematic-display-native","footprint-copy-native-create"}){bool refused=false;try{value.AdmitFootprintInverseAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("footprint-inverse-writer-refusal");}bool denied=false;try{value.AbortFootprintInverse();}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-no-job-abort");foreach(System.Action action in new System.Action[]{()=>value.PermitFootprintInverseColdBootstrap(),()=>value.StartFootprintInverseCold(1),()=>value.HoldFootprintInverseCold("branch")}){bool blocked=false;try{action();}catch(InvalidOperationException){blocked=true;}if(!blocked)throw Error("footprint-inverse-unissued-startup-refusal");}VerifyFootprintInverseRegistrationSmoke();VerifyFootprintInverseWorkerSmoke();VerifyFootprintInverseProducerArmSmoke();VerifyFootprintInverseNoPublicationSmoke();EasyedaFootprintInverseColdProtocol.VerifySmoke();VerifyFootprintInverseColdStepSmoke();VerifyFootprintInverseStartupCallbackSmoke();VerifyFootprintInverseConditionSmoke();VerifyFootprintInverseStartupQueueSmoke();VerifyFootprintInverseMainHistorySmoke();VerifyFootprintInverseInitialCacheSmoke();VerifyFootprintInverseInitialSyncSmoke();VerifyFootprintInverseModelStepSmoke();VerifyFootprintInverseCacheSmoke();value.originalMain.Release();}
public static void VerifyFootprintInverseRegistrationSmoke(){string path=@"${path}",project="${project}";string text=FootprintInverseRegistrationProtocolMessage(${String(PROFILE.renderer.total)},"parent","original",path,project,new string('a',32),new string('b',16),new string('c',64));using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!="${expectedHash}")throw Error("footprint-inverse-registration-byte-parity");foreach(int id in new[]{0,${String(PROFILE.renderer.total + 1)}}){bool denied=false;try{FootprintInverseRegistrationProtocolMessage(id,"parent","original",path,project,new string('a',32),new string('b',16),new string('c',64));}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-registration-id-bound");}foreach(string document in new[]{"bad",new string('b',17),new string('b',16)+"!"}){bool denied=false;try{FootprintInverseRegistrationProtocolMessage(1,"parent","original",path,project,new string('a',32),document,new string('c',64));}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("footprint-inverse-registration-document-bound");}}
}
${currentFootprintInverseColdLoadNativeSource()}${currentFootprintInverseStartupCallbackNativeSource()}${currentFootprintInverseTimerNativeSource()}${currentFootprintInverseLibraryRefreshNativeSource()}${currentFootprintInverseDeleteBindingNativeSource()}${currentFootprintInverseDeleteEncoderNativeSource()}${currentFootprintInversePublicApiNativeSource()}${currentFootprintInverseStartupQueueNativeSource()}${currentFootprintInverseMainHistoryNativeSource()}${currentFootprintInverseInitialCacheNativeSource()}${currentFootprintInverseInitialSyncNativeSource()}${currentFootprintInverseModelStepNativeSource()}
${END}`; }
const producerDispatch=`        'footprint-inverse-producer-arm' {
          if (-not $FootprintInverse209) {throw 'footprint-inverse-producer-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-producer-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-producer-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          $owner.SendFootprintInverseProducerArm([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
const coldDispatch = `        'footprint-inverse-initial-sync' {
          if (-not $FootprintInverse209) {throw 'footprint-inverse-initial-sync-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-initial-sync-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-initial-sync-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          if ($request.phase -ceq 'bind') {
            if ($request.requestId -ne 0 -or $request.method -cne 'bind' -or $fields.Count -ne 0) {throw 'footprint-inverse-initial-sync-bind-fields'}
            $owner.BindFootprintInverseInitialSync()
          } elseif ($request.phase -ceq 'complete') {
            if ($request.requestId -ne 0 -or $request.method -cne 'complete' -or $fields.Count -ne 0) {throw 'footprint-inverse-initial-sync-complete-fields'}
            $owner.CompleteFootprintInverseInitialSync()
          } elseif ($request.phase.StartsWith('held-',[StringComparison]::Ordinal)) {
            if ($request.requestId -ne 0 -or $request.method -cne 'held' -or $fields.Count -ne 0) {throw 'footprint-inverse-initial-sync-held-fields'}
            $owner.HoldFootprintInverseInitialSync($request.phase.Substring(5))
          } else {
            foreach ($name in $fields.Keys) {if ($name -cin @('nodes','depth','array','keys','string','rows')) {if (($fields[$name] -isnot [int] -and $fields[$name] -isnot [long]) -or $fields[$name] -lt 0 -or $fields[$name] -gt 8192) {throw 'footprint-inverse-initial-sync-number'}} elseif ($name -cnotin @('objectId','callFrameId','scriptId','argument0','argument1','argument2','argument3','argument4','key','body') -or $fields[$name] -isnot [string]) {throw 'footprint-inverse-initial-sync-substitution'}}
            $owner.SendFootprintInverseInitialSync([int]$request.requestId,$request.phase,$request.method,$fields)
          }
          $result=@{written=$true}
        }
        'footprint-inverse-initial-cache' {
          if (-not $FootprintInverse209) {throw 'footprint-inverse-initial-cache-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-initial-cache-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-initial-cache-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          if ($request.phase -ceq 'bind') {
            if ($request.requestId -ne 0 -or $request.method -cne 'bind' -or $fields.Count -ne 1 -or -not $fields.ContainsKey('jobs') -or ($fields.jobs -isnot [int] -and $fields.jobs -isnot [long]) -or $fields.jobs -lt 2 -or $fields.jobs -gt 8) {throw 'footprint-inverse-initial-cache-bind-fields'}
            $owner.BindFootprintInverseInitialCache([int]$fields.jobs)
          } elseif ($request.phase -ceq 'complete') {
            if ($request.requestId -ne 0 -or $request.method -cne 'complete' -or $fields.Count -ne 0) {throw 'footprint-inverse-initial-cache-complete-fields'}
            $owner.CompleteFootprintInverseInitialCache()
          } elseif ($request.phase.StartsWith('held-',[StringComparison]::Ordinal)) {
            if ($request.requestId -ne 0 -or $request.method -cne 'held' -or $fields.Count -ne 0) {throw 'footprint-inverse-initial-cache-held-fields'}
            $owner.HoldFootprintInverseInitialCache($request.phase.Substring(5))
          } else {
            foreach ($name in $fields.Keys) {if ($name -cin @('nodes','depth','array','keys','string')) {if (($fields[$name] -isnot [int] -and $fields[$name] -isnot [long]) -or $fields[$name] -lt 0 -or $fields[$name] -gt 8192) {throw 'footprint-inverse-initial-cache-number'}} elseif ($name -cnotin @('objectId','callFrameId','scriptId','argument0','argument1','argument2','argument3','argument4','key','body') -or $fields[$name] -isnot [string]) {throw 'footprint-inverse-initial-cache-substitution'}}
            $owner.SendFootprintInverseInitialCache([int]$request.requestId,$request.phase,$request.method,$fields)
          }
          $result=@{written=$true}
        }
        'footprint-inverse-startup-queue' {
          if (-not $FootprintInverse209 -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-startup-queue-purpose'}
          if ($request.requestId -eq 0) {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid') {throw 'footprint-inverse-startup-queue-open-fields'}
            $owner.OpenFootprintInverseStartupQueue()
          } else {
            $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
            foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-startup-queue-fields'}}
            if ($request.phase -isnot [string] -or $request.method -isnot [string]) {throw 'footprint-inverse-startup-queue-type'}
            $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
            foreach ($property in $fields.Keys) {if ($property -cnotin @('objectId','scriptId','argument0','argument1','argument2') -or $fields[$property] -isnot [string] -or $fields[$property] -cnotmatch '\\A[A-Za-z0-9_.:-]{1,256}\\z') {throw 'footprint-inverse-startup-queue-substitution'}}
            $owner.SendFootprintInverseStartupQueue([int]$request.requestId,$request.phase,$request.method,$fields)
          }
          $result=@{written=$true}
        }
        'footprint-inverse-condition-source' {
          if (-not $FootprintInverse209 -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-condition-purpose'}
          if ($request.requestId -eq 0) {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,records,requestId,rootCreated,rootPid' -or ($request.records -isnot [int] -and $request.records -isnot [long]) -or $request.records -lt 1 -or $request.records -gt 512) {throw 'footprint-inverse-condition-bind-fields'}
            $owner.BindFootprintInverseConditions([int]$request.records)
          } else {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,scriptId' -or $request.scriptId -isnot [string]) {throw 'footprint-inverse-condition-source-fields'}
            $owner.SendFootprintInverseConditionSource([int]$request.requestId,$request.scriptId)
          }
          $result=@{written=$true}
        }
        'footprint-inverse-startup-callback' {
          if (-not $FootprintInverse209) {throw 'footprint-inverse-startup-callback-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-startup-callback-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-startup-callback-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          if ($request.phase -ceq 'bind') {
            if ($request.requestId -ne 0 -or $request.method -cne 'bind' -or $fields.Count -ne 1 -or -not $fields.ContainsKey('records') -or ($fields.records -isnot [int] -and $fields.records -isnot [long]) -or $fields.records -lt 1 -or $fields.records -gt 512) {throw 'footprint-inverse-startup-source-bound'}
            $owner.BindFootprintInverseStartupCallbacks([int]$fields.records)
          } elseif ($request.phase.StartsWith('held-',[StringComparison]::Ordinal)) {
            if ($request.requestId -ne 0 -or $request.method -cne 'held' -or $fields.Count -ne 0) {throw 'footprint-inverse-startup-held-fields'}
            $owner.HoldFootprintInverseStartupCallback($request.phase.Substring(5))
          } else {
            foreach ($property in $fields.Keys) {if ($property -cnotin @('callFrameId','objectId','scriptId','argument0','argument1','argument2','argument3') -or $fields[$property] -isnot [string] -or $fields[$property] -cnotmatch '\\A[A-Za-z0-9_.:-]{1,256}\\z') {throw 'footprint-inverse-startup-substitution'}}
            $owner.SendFootprintInverseStartupCallback([int]$request.requestId,$request.phase,$request.method,$fields)
          }
          $result=@{written=$true}
        }
        'footprint-inverse-model-step' {
          if (-not $FootprintInverse209 -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-model-step-fields'}
          if ($request.requestId -eq 0) {
            if ($request.phase -ceq 'idle' -and (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -ceq 'action,helperInstance,id,jobId,phase,requestId,rootCreated,rootPid') {$owner.EnrollFootprintInverseStartupIdle()}
            elseif ($request.phase -ceq 'permit' -and (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -ceq 'action,helperInstance,id,jobId,phase,requestId,rootCreated,rootPid,stepRole' -and $request.stepRole -is [string]) {$owner.PermitFootprintInverseModelStep($request.stepRole)}
            else {throw 'footprint-inverse-model-step-control'}
          } else {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,stepRole' -or $request.stepRole -isnot [string]) {throw 'footprint-inverse-model-step-fields'}
            $owner.SendFootprintInverseModelStep([int]$request.requestId,$request.stepRole)
          }
          $result=@{written=$true}
        }
        'footprint-inverse-cold-step' {
          if (-not $FootprintInverse209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,stepRole' -or $request.stepRole -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1) {throw 'footprint-inverse-cold-step-fields'}
          $owner.SendFootprintInverseColdStep([int]$request.requestId,$request.stepRole);$result=@{written=$true}
        }
        'footprint-inverse-startup' {
          if (-not $FootprintInverse209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,method,phase,requestId,rootCreated,rootPid' -or $request.phase -cne 'project-save-structure-resume-bootstrap' -or $request.method -cne 'Debugger.resume' -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1) {throw 'footprint-inverse-startup-fields'}
          $owner.StartFootprintInverseCold([int]$request.requestId);$result=@{written=$true}
        }
        'footprint-inverse-cold' {
          if (-not $FootprintInverse209) {throw 'footprint-inverse-cold-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-cold-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-cold-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          if ($request.phase -ceq 'bind') {
            if ($request.requestId -ne 0 -or $request.method -cne 'bind' -or $fields.Count -ne 1 -or -not $fields.ContainsKey('chunks') -or ($fields.chunks -isnot [int] -and $fields.chunks -isnot [long]) -or $fields.chunks -lt 1 -or $fields.chunks -gt 8) {throw 'footprint-inverse-cold-bind-fields'}
            $owner.BindFootprintInverseCold([int]$fields.chunks)
          } elseif ($request.phase -ceq 'bootstrap-permit') {
            if ($request.requestId -ne 0 -or $request.method -cne 'permit' -or $fields.Count -ne 0) {throw 'footprint-inverse-cold-permit-fields'}
            $owner.PermitFootprintInverseColdBootstrap()
          } elseif ($request.phase.StartsWith('held-',[StringComparison]::Ordinal)) {
            if ($request.requestId -ne 0 -or $request.method -cne 'held' -or $fields.Count -ne 0) {throw 'footprint-inverse-cold-held-fields'}
            $owner.HoldFootprintInverseCold($request.phase.Substring(5))
          } else {$owner.SendFootprintInverseCold([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
const constructionDispatch = `        'footprint-inverse-construction' {
          if (-not $FootprintInverse209) {throw 'footprint-inverse-construction-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-construction-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-construction-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          $owner.SendFootprintInverseConstruction([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
const workerDispatch = `        'footprint-inverse-actors' {
          if (-not $FootprintInverse209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,actorStage,helperInstance,id,jobId,requestId,rootCreated,rootPid' -or $request.actorStage -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-actor-fields'}
          $owner.SendFootprintInverseActors([int]$request.requestId,$request.actorStage);$result=@{written=$true}
        }
        'footprint-inverse-parent' {
          if (-not $FootprintInverse209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,sessionId' -or $request.sessionId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-parent-fields'}
          $owner.SendFootprintInverseParent([int]$request.requestId,$request.sessionId);$result=@{written=$true}
        }
        'footprint-inverse-worker-bind' {
          if (-not $FootprintInverse209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,browserSessionId,helperInstance,id,jobId,pageSessionId,projectUuid,rootCreated,rootPid,targetId,windowTabId') {throw 'footprint-inverse-worker-bind-fields'}
          foreach ($field in @('targetId','browserSessionId','pageSessionId','projectUuid','windowTabId')) {if ($request.$field -isnot [string]) {throw 'footprint-inverse-worker-bind-type'}}
          $owner.BindFootprintInverseWorker($request.targetId,$request.browserSessionId,$request.pageSessionId,$request.projectUuid,$request.windowTabId);$result=@{bound=$true}
        }
        'footprint-inverse-source-bind' {
          if (-not $FootprintInverse209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,scriptId,uniqueContextId' -or $request.scriptId -isnot [string] -or $request.uniqueContextId -isnot [string]) {throw 'footprint-inverse-source-fields'}
          $owner.BindFootprintInverseSource($request.scriptId,$request.uniqueContextId);$result=@{bound=$true}
        }
        'footprint-inverse-project' {
          if (-not $FootprintInverse209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,sessionId,uniqueContextId' -or $request.sessionId -isnot [string] -or $request.uniqueContextId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-project-fields'}
          $owner.SendFootprintInverseProject([int]$request.requestId,$request.sessionId,$request.uniqueContextId);$result=@{written=$true}
        }
        'footprint-inverse-worker' {
          if (-not $FootprintInverse209) {throw 'footprint-inverse-worker-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-worker-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-worker-type'}
          $fields=@{};foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          $owner.SendFootprintInverseWorker([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
const dispatch = `        'footprint-inverse-preflight' {
          if (-not $FootprintInverse209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,sessionId,targetBranchUuid,targetDocumentUuid,targetExpectedSourceSha256,targetProjectUuid,targetRawWindowsPath,uniqueContextId') {throw 'footprint-inverse-preflight-fields'}
          foreach ($field in @('sessionId','uniqueContextId','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','targetProjectUuid','targetRawWindowsPath')) {if ($request.$field -isnot [string]) {throw 'footprint-inverse-preflight-type'}}
          if ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) {throw 'footprint-inverse-preflight-id'}
          $owner.SendFootprintInversePreflight([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256);$result=@{written=$true}
        }
        'footprint-inverse-cache-guard' {
          if (-not $FootprintInverse209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,sessionId,targetBranchUuid,targetDocumentUuid,targetExpectedSourceSha256,targetProjectUuid,targetRawWindowsPath,uniqueContextId') {throw 'footprint-inverse-preflight-fields'}
          foreach ($field in @('sessionId','uniqueContextId','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','targetProjectUuid','targetRawWindowsPath')) {if ($request.$field -isnot [string]) {throw 'footprint-inverse-preflight-type'}}
          if ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) {throw 'footprint-inverse-preflight-id'}
          $owner.SendFootprintInverseCacheGuard([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256);$result=@{written=$true}
        }
        'footprint-inverse-cache-delete-guard' {
          if (-not $FootprintInverse209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,namespaceOrdinal,requestId,rootCreated,rootPid,sessionId,targetBranchUuid,targetDocumentUuid,targetExpectedSourceSha256,targetProjectUuid,targetRawWindowsPath,uniqueContextId') {throw 'footprint-inverse-preflight-fields'}
          foreach ($field in @('sessionId','uniqueContextId','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','targetProjectUuid','targetRawWindowsPath')) {if ($request.$field -isnot [string]) {throw 'footprint-inverse-preflight-type'}}
          if ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) {throw 'footprint-inverse-preflight-id'}
          if (($request.namespaceOrdinal -isnot [int] -and $request.namespaceOrdinal -isnot [long]) -or $request.namespaceOrdinal -lt 0 -or $request.namespaceOrdinal -gt 1) {throw 'footprint-inverse-delete-ordinal'}
          $owner.SendFootprintInverseCacheLateGuard([int]$request.requestId,$request.sessionId,$request.uniqueContextId,[int]$request.namespaceOrdinal,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256);$result=@{written=$true}
        }
        'footprint-inverse-cache-loading-guard' {
          if (-not $FootprintInverse209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,sessionId,targetBranchUuid,targetDocumentUuid,targetExpectedSourceSha256,targetProjectUuid,targetRawWindowsPath,uniqueContextId') {throw 'footprint-inverse-preflight-fields'}
          foreach ($field in @('sessionId','uniqueContextId','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','targetProjectUuid','targetRawWindowsPath')) {if ($request.$field -isnot [string]) {throw 'footprint-inverse-preflight-type'}}
          if ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) {throw 'footprint-inverse-preflight-id'}
          $owner.SendFootprintInverseCacheLateGuard([int]$request.requestId,$request.sessionId,$request.uniqueContextId,2,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256);$result=@{written=$true}
        }
        'footprint-inverse-register' {
          if (-not $FootprintInverse209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,sessionId,uniqueContextId' -or $request.sessionId -isnot [string] -or $request.uniqueContextId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-registration-fields'}
          $owner.SendFootprintInverseRegistration([int]$request.requestId,$request.sessionId,$request.uniqueContextId);$result=@{written=$true}
        }
        'footprint-inverse-abort' {
          if (-not $FootprintInverse209 -or -not $launched) {throw 'footprint-inverse-abort-purpose'}
          $owner.AbortFootprintInverse(); $result=@{terminationDispatched=$true}
        }
${CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_DISPATCH}${workerDispatch}${constructionDispatch}${producerDispatch}${coldDispatch}${CURRENT_FOOTPRINT_INVERSE_TIMER_DISPATCH}${CURRENT_FOOTPRINT_INVERSE_CACHE_DISPATCH}${CURRENT_FOOTPRINT_INVERSE_INVALIDATION_DISPATCH}`;
const readyBegin = "  # BEGIN ORIGINAL FOOTPRINT INVERSE READY", readyEnd = "  # END ORIGINAL FOOTPRINT INVERSE READY";
function ready(): string { return `${readyBegin}
  if ($FootprintInverse209 -and -not $CompileOnly) {
    if ($InverseReadyChallenge -cnotmatch '\\A[a-f0-9]{32}\\z') {throw 'footprint-inverse-ready-challenge'}
    $inverseReadyState=$owner.NoProcessCreationState()
    if ($inverseReadyState -cne 'not-entered' -or $owner.RootPid -ne 0 -or $owner.RootCreated -cne '0') {throw 'footprint-inverse-ready-state'}
    @{schema='easyeda-pro-control.footprint-combined-ready.v1';challenge=$InverseReadyChallenge;helperInstance=$owner.HelperInstance;jobId=$owner.JobId;creationState=$inverseReadyState;processCreated=$false;emptyJob=$true;pipesChecked=$true} | ConvertTo-Json -Compress
  }
${readyEnd}`; }
export function prepareCurrentFootprintInverseNativeSwitch(input: string): string {
  return one(input, "[switch]$WorkerStartup,", "[switch]$FootprintInverse209,[string]$InverseReadyChallenge,[switch]$WorkerStartup,");
}
export function applyCurrentFootprintInverseNativeFragment(input: string): string {
  let source = applyCurrentProjectLibraryRefreshNativeFragment(prepareCurrentFootprintInverseNativeSwitch(input)).replace(/if\(footprintInverse209\)return \d+; /u, "").replace(/^ {10}if \(\$FootprintInverse209\) \{\$requestLimit=\d+\}\n/mu, "").replace("if(footprintInverse209)return 16; ", "").replace("          if ($FootprintInverse209) {$requestLimit=16}\n", "");
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "FootprintInverse209");
  const conflict = `if ($FootprintInverse209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-footprint-inverse-purpose'}`;
  const priorConflict = source.split("\n").filter(line => line.startsWith("if ($FootprintInverse209 -and ("));
  if (priorConflict.length > 1) { throw new Error("FOOTPRINT_INVERSE_NATIVE_CONFLICT_DUPLICATE"); }
  source = priorConflict[0] === undefined ? one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}\n`) : source.replace(priorConflict[0], conflict);
  source = one(source, " -or $PcbViaSavedReadback209\n", " -or $FootprintInverse209 -or $PcbViaSavedReadback209\n");
  source = one(source, "elseif ($Visual209)", "elseif ($FootprintInverse209) {[EasyedaDiagnosticOwner]::CreateFootprintInverse209()} elseif ($Visual209)");
  source = one(source, "if(savedViaReadback209)return", `if(footprintInverse209)return ${String(PROFILE.renderer.total)}; if(savedViaReadback209)return`);
  source = one(source, "if(savedViaReadback209)throw Error(\"saved-readback-retain-main-until-exit\");", "if(savedViaReadback209)throw Error(\"saved-readback-retain-main-until-exit\");\n    if(footprintInverse209)throw Error(\"footprint-inverse-retain-main-until-exit\");");
  source = one(source, "if(savedViaReadback209){SendSavedViaReadbackMain(id,phase,method,fields);return;}", "if(savedViaReadback209){SendSavedViaReadbackMain(id,phase,method,fields);return;}\n    if(footprintInverse209){SendFootprintInverseMain(id,phase,method,fields);return;}");
  source = one(source, "if(savedViaReadback209)SavedViaReadbackDiscovery(method,OptionalText(sessionId));", "if(savedViaReadback209)SavedViaReadbackDiscovery(method,OptionalText(sessionId));\n    if(footprintInverse209){FootprintInverseDiscovery(method,OptionalText(sessionId));}");
  const savedLimit = source.split("\n").find(line => line.startsWith("          if ($PcbViaSavedReadback209) {$requestLimit="));
  if (savedLimit === undefined) { throw new Error("FOOTPRINT_INVERSE_NATIVE_LIMIT_ANCHOR"); }
  const ownLimit = `          if ($FootprintInverse209) {$requestLimit=${String(PROFILE.renderer.total)}}`;
  if (!source.includes(ownLimit)) { source = one(source, savedLimit, `${ownLimit}\n${savedLimit}`); }
  else if (source.split(ownLimit).length !== 2) { throw new Error("FOOTPRINT_INVERSE_NATIVE_LIMIT_DUPLICATE"); }
  source = one(source, "      if ($PcbViaSavedReadback209) {$owner.AdmitSavedViaReadbackAction($request.action)}", "      if ($FootprintInverse209) {$owner.AdmitFootprintInverseAction($request.action)}\n      if ($PcbViaSavedReadback209) {$owner.AdmitSavedViaReadbackAction($request.action)}");
  const largeLine="      $inverseStartupCacheSyncData=$FootprintInverse209 -and $request.method -ceq 'Runtime.callFunctionOn' -and (($request.action -ceq 'footprint-inverse-initial-cache' -and $request.phase -cmatch '\\Ainverse-initial-cache-(?:flow|head)-[0-7]\\z') -or ($request.action -ceq 'footprint-inverse-initial-sync' -and $request.phase -ceq 'inverse-initial-sync-capture'))\n";
  const largeJoin="      $largeOpening=$largeOpening -or $inverseStartupCacheSyncData\n";
  if(!source.includes(largeLine+largeJoin)){const anchor="      if ([Text.Encoding]::UTF8.GetByteCount($line.ToString())";if(source.split(anchor).length!==2){throw new Error("FOOTPRINT_INVERSE_STARTUP_DATA_SIZE_GUARD");}source=source.replace(anchor,()=>largeLine+largeJoin+anchor);}
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-main-observe' {");
  source=installOwnedNativeDispatch(source,CURRENT_FOOTPRINT_INVERSE_LIBRARY_REFRESH_DISPATCH,"        'pcb-via-main-observe' {");
  source=installOwnedNativeDispatch(source,CURRENT_FOOTPRINT_INVERSE_DELETE_BINDING_DISPATCH,"        'pcb-via-main-observe' {");
  source=installOwnedNativeDispatch(source,CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_DISPATCH,"        'pcb-via-main-observe' {");
  source=installOwnedNativeDispatch(source,CURRENT_FOOTPRINT_INVERSE_PUBLIC_API_DISPATCH,"        'pcb-via-main-observe' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyFootprintInverseSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyFootprintInverseTimerSmoke()", "    [EasyedaDiagnosticOwner]::VerifyFootprintInverseSmoke()");
  source=installNativeCompileOnlyHook(source,"    [EasyedaDiagnosticOwner]::VerifyFootprintInverseLibraryRefreshSmoke()","    [EasyedaDiagnosticOwner]::VerifyFootprintInverseTimerSmoke()");
  source=installNativeCompileOnlyHook(source,"    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteBindingSmoke()","    [EasyedaDiagnosticOwner]::VerifyFootprintInverseLibraryRefreshSmoke()");
  source=installNativeCompileOnlyHook(source,"    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteEncoderSmoke()","    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteBindingSmoke()");
  source=installNativeCompileOnlyHook(source,"    [EasyedaDiagnosticOwner]::VerifyFootprintInversePublicApiSmoke()","    [EasyedaDiagnosticOwner]::VerifyFootprintInverseDeleteEncoderSmoke()");
  const start = source.indexOf(BEGIN), stop = source.indexOf(END);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(BEGIN, start + BEGIN.length) || source.includes(END, stop + END.length)) { throw new Error("FOOTPRINT_INVERSE_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + END.length); }
  else { source = one(source, "\n'@\n", `\n${native()}\n'@\n`); }
  const readyStart = source.indexOf(readyBegin), readyStop = source.indexOf(readyEnd);
  if (readyStart !== -1 || readyStop !== -1) { if (readyStart === -1 || readyStop < readyStart || source.includes(readyBegin, readyStart + readyBegin.length) || source.includes(readyEnd, readyStop + readyEnd.length)) { throw new Error("FOOTPRINT_INVERSE_READY_MARKERS"); } source = source.slice(0, readyStart) + ready() + source.slice(readyStop + readyEnd.length); }
  else { source = one(source, "  $owner.Initialize()\n", `  $owner.Initialize()\n${ready()}\n`); }
  return source;
}
