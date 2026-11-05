import { readFile, writeFile } from "node:fs/promises";
import { CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION, CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION,
  CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION } from "../server/src/current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_SPATIAL_READ_FUNCTION, CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION } from "../server/src/current-pcb-209-spatial-read-program.ts";
import { packedNativeProgram } from "./native-program-packing.ts";
import { CURRENT_PCB_SPATIAL_PROFILE, CURRENT_PCB_SPATIAL_REQUEST_DERIVATION,
  CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION } from "../server/src/current-pcb-spatial-profile.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES } from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";

const programs = [
  ["SpatialWrapperFunction", CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION], ["SpatialHandlerFunction", CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION],
  ["SpatialBindingsFunction", CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION], ["SpatialFunctionsFunction", CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION],
  ["SpatialReadFunction", CURRENT_PCB_209_SPATIAL_READ_FUNCTION],
  ["SpatialTrackBindingsFunction", CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION],
  ["SpatialTrackReadFunction", CURRENT_PCB_209_SPATIAL_TRACK_READ_FUNCTION],
] as const;
const native = String.raw`
  const int Spatial209Requests=${CURRENT_PCB_SPATIAL_PROFILE.requestLimit},Spatial209NormalRequests=${CURRENT_PCB_SPATIAL_PROFILE.normalRequestLimit};
  const int Spatial209Functions=${CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.calleeProperties},Spatial209StageRequests=${CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.spatialStage},Spatial209WorkflowRequests=${CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.fullWorkflow};
  const int Spatial209TrackFunctions=${CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION.calleeProperties},Spatial209TrackStageRequests=${CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION.spatialStage},Spatial209TrackWorkflowRequests=${CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION.fullWorkflow};
  string spatialParentSession,spatialPcbSession,spatialSourceSession,spatialContext;
  const int Spatial209ReadLimit=${CURRENT_PCB_SPATIAL_PROFILE.maximumReads};
  int spatialStage,spatialReads;bool spatialReleased,spatialAttachmentAttempted,spatialTrack;
  public void AdmitSpatialAction(string action) {
    if(!spatial209)return;
    foreach(string allowed in new string[]{"identity","launch","send","spatial209","poll","window","normal-close","termination","release","release-unlaunched","release-no-process","no-process-proof"})if(action==allowed)return;
    throw Error("spatial209-action");
  }
  static string SpatialOriginalId(int id,string encoded) {
    const string prefix="{\"id\":1,";
    if(id<1||id>Spatial209NormalRequests||encoded==null||!encoded.StartsWith(prefix,StringComparison.Ordinal)||!encoded.EndsWith("}\0",StringComparison.Ordinal))throw Error("spatial209-envelope");
    string result="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length);
    if(Encoding.UTF8.GetByteCount(result)>65536)throw Error("spatial209-envelope-size");return result;
  }
  void SpatialSession(string session) {
    if(session==null||!System.Text.RegularExpressions.Regex.IsMatch(session,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("spatial209-original-session");
    if(spatialParentSession==null)spatialParentSession=session;else if(session!=spatialParentSession)throw Error("spatial209-original-session");
  }
  void SpatialDiscovery(string method,string session) {
    if(!spatial209)throw Error("spatial209-purpose");
    bool allowed=false;foreach(string candidate in new[]{"Browser.getVersion","Target.getTargets","Target.attachToTarget","Page.enable","Page.getFrameTree","Runtime.enable","Debugger.enable","Debugger.getScriptSource","DOM.getFrameOwner","DOM.describeNode"})if(method==candidate)allowed=true;
    if(!allowed)throw Error("spatial209-discovery");
    if(method=="Target.attachToTarget") {if(spatialAttachmentAttempted||spatialStage>0)throw Error("spatial209-attachment");spatialAttachmentAttempted=true;return;}
    if(method=="Runtime.evaluate"||method=="Runtime.getProperties"||method=="Runtime.releaseObjectGroup"||method=="Target.setAutoAttach")throw Error("spatial209-discovery");
    if(session!=null)SpatialSession(session);
    if(method=="Debugger.getScriptSource")spatialSourceSession=session;
  }
  static string SpatialText(System.Collections.IDictionary fields,string key,int maximum) {
    object value=fields[key];string text=value as string;
    if(text==null||text.Length>maximum||!System.Text.RegularExpressions.Regex.IsMatch(text,@"\A[A-Za-z0-9_.:-]+\z"))throw Error("spatial209-handle");return text;
  }
  static double SpatialNumber(System.Collections.IDictionary fields,string key) {
    object value=fields[key];if(!(value is int)&&!(value is long)&&!(value is double)&&!(value is decimal))throw Error("spatial209-number");
    double number=Convert.ToDouble(value,CultureInfo.InvariantCulture);
    if(Double.IsNaN(number)||Double.IsInfinity(number)||Math.Abs(number)>10000000||number==0&&Double.IsNegativeInfinity(1/number))throw Error("spatial209-number");return number;
  }
  static string SpatialQuery(System.Collections.IDictionary fields,List<string> expected) {
    string kind=fields["queryKind"] as string;expected.Add("queryKind");
    if(kind=="point") {
      expected.Add("xMil");expected.Add("yMil");
      return "{\"kind\":\"point\",\"xMil\":"+SpatialNumber(fields,"xMil").ToString("G17",CultureInfo.InvariantCulture)+",\"yMil\":"+SpatialNumber(fields,"yMil").ToString("G17",CultureInfo.InvariantCulture)+"}";
    }
    if(kind!="region")throw Error("spatial209-kind");
    string mode=fields["queryMode"] as string;if(mode!="inside"&&mode!="intersects")throw Error("spatial209-mode");
    expected.AddRange(new string[]{"queryMode","leftMil","rightMil","bottomMil","topMil"});
    double left=SpatialNumber(fields,"leftMil"),right=SpatialNumber(fields,"rightMil"),bottom=SpatialNumber(fields,"bottomMil"),top=SpatialNumber(fields,"topMil");
    if(left>=right||bottom>=top)throw Error("spatial209-region");
    return "{\"kind\":\"region\",\"mode\":"+JsonString(mode)+",\"leftMil\":"+left.ToString("G17",CultureInfo.InvariantCulture)+",\"rightMil\":"+right.ToString("G17",CultureInfo.InvariantCulture)+",\"bottomMil\":"+bottom.ToString("G17",CultureInfo.InvariantCulture)+",\"topMil\":"+top.ToString("G17",CultureInfo.InvariantCulture)+"}";
  }
  public static string Spatial209ProtocolMessage(int id,string method,string session,string phase,System.Collections.IDictionary fields) {
    if(id<1||id>Spatial209Requests||session==null||!System.Text.RegularExpressions.Regex.IsMatch(session,@"\A[A-Za-z0-9_.:-]{1,128}\z")||fields==null)throw Error("spatial209-fields");
    if(id>Spatial209NormalRequests&&phase!="release")throw Error("spatial209-cleanup-reserve");
    const string group="easyeda-pro-control-pcb209-spatial-v1";
    string effects="\"throwOnSideEffect\":"+(phase=="read"||phase=="bindings"||phase=="read-track"||phase=="bindings-track"?"false":"true")+",\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    string parameters;List<string> expected=new List<string>();
    if(phase=="wrapper"&&method=="Runtime.evaluate") {
      expected.Add("uniqueContextId");string context=SpatialText(fields,"uniqueContextId",128);
      parameters=effects+",\"expression\":"+JsonString(SpatialWrapperFunction)+",\"uniqueContextId\":"+JsonString(context)+",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":false,\"timeout\":1000,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false";
    } else if(phase=="properties"&&method=="Runtime.getProperties") {
      expected.Add("objectId");parameters="\"objectId\":"+JsonString(SpatialText(fields,"objectId",256))+",\"ownProperties\":true,\"accessorPropertiesOnly\":false,\"generatePreview\":false";
    } else if(phase=="release"&&method=="Runtime.releaseObjectGroup")parameters="\"objectGroup\":"+JsonString(group);
    else if(method=="Runtime.callFunctionOn"&&(phase=="handler"||phase=="bindings"||phase=="bindings-track"||phase=="functions"||phase=="read"||phase=="read-track")) {
      expected.Add("objectId");string scope=SpatialText(fields,"objectId",256);
      string program=phase=="handler"?SpatialHandlerFunction:phase=="bindings"?SpatialBindingsFunction:phase=="bindings-track"?SpatialTrackBindingsFunction:phase=="functions"?SpatialFunctionsFunction:phase=="read-track"?SpatialTrackReadFunction:SpatialReadFunction;
      parameters=effects+",\"objectId\":"+JsonString(scope)+",\"functionDeclaration\":"+JsonString(program)+",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":"+(phase=="read"||phase=="read-track"?"true":"false");
      if(phase=="bindings"||phase=="bindings-track") {expected.Add("callbackObjectId");parameters+=",\"arguments\":[{\"objectId\":"+JsonString(SpatialText(fields,"callbackObjectId",256))+"}]";}
      if(phase=="read"||phase=="read-track")parameters+=",\"arguments\":[{\"value\":"+SpatialQuery(fields,expected)+"}]";
    } else throw Error("spatial209-phase");
    if(fields.Count!=expected.Count)throw Error("spatial209-extra-fields");foreach(object key in fields.Keys)if(!(key is string)||!expected.Contains((string)key))throw Error("spatial209-extra-fields");
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+parameters+"},\"sessionId\":"+JsonString(session)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>65536)throw Error("spatial209-send-size");return message;
  }
  void SpatialSequence(int id,string session,string phase,System.Collections.IDictionary fields) {
    if(!spatial209)throw Error("spatial209-purpose");
    if(spatialReleased||spatialPcbSession==null||session!=spatialPcbSession||session!=spatialSourceSession||session!=spatialParentSession)throw Error("spatial209-original-context");
    if(phase=="release") {if(spatialStage==0)throw Error("spatial209-sequence");spatialReleased=true;return;}
    if(id>Spatial209NormalRequests)throw Error("spatial209-cleanup-reserve");
    if(phase=="properties") {if(spatialStage<1||spatialStage>4)throw Error("spatial209-sequence");return;}
    if(phase=="read"||phase=="read-track") {if((phase=="read-track")!=spatialTrack||spatialStage<4||spatialStage>5||spatialReads>=(spatialTrack?15:Spatial209ReadLimit))throw Error("spatial209-read-sequence");spatialReads++;spatialStage=5;return;}
    string[] sequence={"wrapper","handler","bindings","functions"};
    if(spatialStage>=sequence.Length||sequence[spatialStage]!=(phase=="bindings-track"?"bindings":phase))throw Error("spatial209-sequence");
    if(phase=="bindings-track")spatialTrack=true;
    if(phase=="wrapper") {if(spatialContext!=null)throw Error("spatial209-context-consumed");spatialContext=SpatialText(fields,"uniqueContextId",128);}
    spatialStage++;
  }
  public void SendSpatial209(int id,string method,string session,string phase,System.Collections.IDictionary fields) {
    if(!spatial209)throw Error("spatial209-purpose");
    string message=Spatial209ProtocolMessage(id,method,session,phase,fields);
    SpatialSequence(id,session,phase,fields);SendMessage(id,message);
  }
  public static void VerifySpatial209Smoke() {
    EasyedaDiagnosticOwner owner=CreateSpatial209();
    if(Spatial209StageRequests!=7+1+1+Spatial209Functions+16+1||Spatial209WorkflowRequests!=103+Spatial209StageRequests||Spatial209WorkflowRequests>Spatial209Requests)throw Error("spatial209-derivation-smoke");
    if(Spatial209TrackStageRequests!=7+1+1+Spatial209TrackFunctions+15+1||Spatial209TrackWorkflowRequests!=103+Spatial209TrackStageRequests||Spatial209TrackWorkflowRequests>Spatial209Requests)throw Error("spatial209-track-derivation-smoke");
    if(!owner.spatial209||owner.stringPrecreate||owner.workerStartup||owner.layers209||owner.visual209||owner.EffectiveRequestLimit!=Spatial209Requests)throw Error("spatial209-birth-smoke");
    var empty=new System.Collections.Hashtable(StringComparer.Ordinal);
    foreach(EasyedaDiagnosticOwner old in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateVisual209(),CreateStringPrecreate(),CreateWorkerStartup209()}) {
      bool refused=false;try{old.SendSpatial209(1,"Runtime.releaseObjectGroup","s","release",empty);}catch(Exception error){refused=error.Message=="pcb-diagnostic-spatial209-purpose";}if(!refused)throw Error("spatial209-purpose-smoke");
    }
    Spatial209ProtocolMessage(384,"Runtime.releaseObjectGroup","s","release",empty);
    foreach(int id in new[]{0,385}) {bool refused=false;try{Spatial209ProtocolMessage(id,"Runtime.releaseObjectGroup","s","release",empty);}catch{refused=true;}if(!refused)throw Error("spatial209-budget-smoke");}
    bool legacy=false;try{ProtocolMessage(104,"Browser.getVersion",null,null,null,null);}catch{legacy=true;}if(!legacy)throw Error("spatial209-legacy-cap-smoke");
    foreach(string action in new[]{"worker-startup-parent","saved-cache-send","renderer-viewport-send","main-send","head-age-abort"}){bool refused=false;try{owner.AdmitSpatialAction(action);}catch{refused=true;}if(!refused)throw Error("spatial209-action-smoke");}
    var fields=new System.Collections.Hashtable(StringComparer.Ordinal);fields.Add("objectId","bundle");fields.Add("queryKind","point");fields.Add("xMil",0);fields.Add("yMil",1);
    string encoded=Spatial209ProtocolMessage(383,"Runtime.callFunctionOn","s","read",fields);
    if(encoded.IndexOf("\"throwOnSideEffect\":false",StringComparison.Ordinal)<0||encoded.IndexOf("\"awaitPromise\":false",StringComparison.Ordinal)<0)throw Error("spatial209-fixed-flags-smoke");
    fields["xMil"]=0.1m;fields["yMil"]=-0.25m;
    Spatial209ProtocolMessage(383,"Runtime.callFunctionOn","s","read",fields);
    fields["xMil"]="0";bool coercion=false;try{Spatial209ProtocolMessage(1,"Runtime.callFunctionOn","s","read",fields);}catch{coercion=true;}if(!coercion)throw Error("spatial209-number-smoke");
    fields.Remove("queryKind");fields.Remove("xMil");fields.Remove("yMil");
    bool reserve=false;try{Spatial209ProtocolMessage(384,"Runtime.getProperties","s","properties",fields);}catch{reserve=true;}if(!reserve)throw Error("spatial209-reserve-smoke");
    fields.Add("functionDeclaration","caller-code");bool code=false;try{Spatial209ProtocolMessage(1,"Runtime.getProperties","s","properties",fields);}catch{code=true;}if(!code)throw Error("spatial209-code-smoke");
    fields.Remove("functionDeclaration");fields.Add("throwOnSideEffect",false);bool flags=false;try{Spatial209ProtocolMessage(1,"Runtime.getProperties","s","properties",fields);}catch{flags=true;}if(!flags)throw Error("spatial209-flags-smoke");fields.Remove("throwOnSideEffect");
    fields.Add("callbackObjectId","original-wrapper");
    string binding=Spatial209ProtocolMessage(1,"Runtime.callFunctionOn","s","bindings",fields);
    if(binding.IndexOf("\"throwOnSideEffect\":false",StringComparison.Ordinal)<0)throw Error("spatial209-bindings-effect-smoke");fields.Remove("callbackObjectId");
    foreach(string phase in new[]{"handler","functions"})if(Spatial209ProtocolMessage(1,"Runtime.callFunctionOn","s",phase,fields).IndexOf("\"throwOnSideEffect\":true",StringComparison.Ordinal)<0)throw Error("spatial209-qualification-effects-smoke");
    owner.spatialParentSession="s";owner.spatialPcbSession="s";owner.spatialSourceSession="s";
    var context=new System.Collections.Hashtable(StringComparer.Ordinal);context.Add("uniqueContextId","original-context");
    owner.SpatialSequence(1,"s","wrapper",context);owner.SpatialSequence(2,"s","handler",empty);owner.SpatialSequence(3,"s","bindings",empty);owner.SpatialSequence(4,"s","functions",empty);
    fields.Add("queryKind","point");fields.Add("xMil",0);fields.Add("yMil",1);
    for(int index=0;index<Spatial209ReadLimit;index++){Spatial209ProtocolMessage(5+index,"Runtime.callFunctionOn","s","read",fields);owner.SpatialSequence(5+index,"s","read",fields);}
    bool extraRead=false;try{owner.SpatialSequence(21,"s","read",fields);}catch{extraRead=true;}if(!extraRead)throw Error("spatial209-read-limit-smoke");
    bool afterRead=false;try{owner.SpatialSequence(21,"s","properties",fields);}catch{afterRead=true;}if(!afterRead)throw Error("spatial209-properties-after-read-smoke");
    bool foreign=false;try{owner.SpatialSequence(21,"foreign","release",empty);}catch{foreign=true;}if(!foreign)throw Error("spatial209-session-smoke");
    owner.SpatialSequence(384,"s","release",empty);
    bool replay=false;try{owner.SpatialSequence(384,"s","release",empty);}catch{replay=true;}if(!replay)throw Error("spatial209-release-once-smoke");
  }
`;

const numericSmoke = String.raw`    # Exercise the actual PowerShell5.1 JSON decoder and .NET numeric binder.
    # Decimal fractions remain numbers; all six coordinates round-trip as doubles.
    foreach ($spatialNumberSmokeJson in @(
      '{"queryKind":"point","xMil":0.1,"yMil":0.84551240822557006}',
      '{"queryKind":"region","queryMode":"intersects","leftMil":-0.1,"rightMil":0.1,"bottomMil":-0.84551240822557006,"topMil":0.84551240822557006}'
    )) {
      $spatialNumberSmokeRequest=ConvertFrom-Json -InputObject $spatialNumberSmokeJson
      $spatialNumberSmokeFields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
      $spatialNumberSmokeFields.Add('objectId','original-bundle')
      foreach ($property in $spatialNumberSmokeRequest.PSObject.Properties) {$spatialNumberSmokeFields.Add($property.Name,$property.Value)}
      $spatialNumberSmokeMessage=[EasyedaDiagnosticOwner]::Spatial209ProtocolMessage(383,'Runtime.callFunctionOn','s','read',$spatialNumberSmokeFields)
      if ($spatialNumberSmokeMessage[$spatialNumberSmokeMessage.Length-1] -ne [char]0) {throw 'pcb-diagnostic-spatial209-number-smoke-envelope'}
      $spatialNumberSmokeDecoded=ConvertFrom-Json -InputObject $spatialNumberSmokeMessage.Substring(0,$spatialNumberSmokeMessage.Length-1)
      $spatialNumberSmokeQuery=$spatialNumberSmokeDecoded.params.arguments[0].value
      if ($spatialNumberSmokeQuery.kind -cne $spatialNumberSmokeRequest.queryKind) {throw 'pcb-diagnostic-spatial209-number-smoke-kind'}
      foreach ($field in @('xMil','yMil','leftMil','rightMil','bottomMil','topMil')) {
        if ($null -ne $spatialNumberSmokeRequest.PSObject.Properties[$field]) {
          $spatialNumberSmokeBefore=[Convert]::ToDouble($spatialNumberSmokeRequest.$field,[Globalization.CultureInfo]::InvariantCulture)
          $spatialNumberSmokeAfter=[Convert]::ToDouble($spatialNumberSmokeQuery.$field,[Globalization.CultureInfo]::InvariantCulture)
          if ([BitConverter]::DoubleToInt64Bits($spatialNumberSmokeBefore) -ne [BitConverter]::DoubleToInt64Bits($spatialNumberSmokeAfter)) {throw 'pcb-diagnostic-spatial209-number-smoke-roundtrip'}
        }
      }
    }
`;

const action = process.argv[2];
if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
// oxlint-disable-next-line node/no-top-level-await -- This bounded generator is an explicit ESM command, never a runtime import.
const source = await readFile(path, "utf8");
const begin = "// BEGIN GENERATED PCB209 SPATIAL PROTOCOL", end = "// END GENERATED PCB209 SPATIAL PROTOCOL";
const start = source.indexOf(begin), stop = source.indexOf(end);
if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("Spatial protocol markers must occur once"); }
const generated = `${begin}\n${programs.map(([name, program]) => packedNativeProgram(name, program)).join("\n")}\n${native}  ${end}`;
let next = source.slice(0, start) + generated + source.slice(stop + end.length);
const numericBegin = "    # BEGIN GENERATED PCB209 SPATIAL NUMBER SMOKE", numericEnd = "    # END GENERATED PCB209 SPATIAL NUMBER SMOKE";
const numericStart = next.indexOf(numericBegin), numericStop = next.indexOf(numericEnd);
if (numericStart === -1 || numericStop < numericStart || next.includes(numericBegin, numericStart + numericBegin.length) || next.includes(numericEnd, numericStop + numericEnd.length)) {
  throw new Error("Spatial numeric smoke markers must occur once");
}
next = `${next.slice(0, numericStart)}${numericBegin}\n${numericSmoke}${numericEnd}${next.slice(numericStop + numericEnd.length)}`;
if (Buffer.byteLength(next) > CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES || CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.headroom < 0) {
  throw new Error("Spatial fixed helper source or complete-workflow reservation exceeds its fixed ceiling");
}
// oxlint-disable-next-line node/no-top-level-await -- Explicit generation writes only the reviewed bounded marker region.
if (action === "--write") { await writeFile(path, next); }
else if (next !== source) { throw new Error("Generated spatial native protocol differs"); }
