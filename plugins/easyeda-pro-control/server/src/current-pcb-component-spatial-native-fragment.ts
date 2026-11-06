/** Deterministic separate original Component birth and finite419-ID codebook. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION, CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION, CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION } from "./current-pcb-209-spatial-capture-program.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION } from "./current-pcb-209-component-point-capture.ts";
import { CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION } from "./current-pcb-209-component-point-read-program.ts";
import { GENERATED_COMPONENT_FIXTURE_REGISTRATION_FUNCTION } from "./managed-component-fixture-registration-program.ts";
import { CURRENT_PCB_COMPONENT_SPATIAL_REQUEST_DERIVATION as COST, CURRENT_PCB_COMPONENT_SPATIAL_PROFILE as PROFILE } from "./current-pcb-component-spatial-profile.ts";

const begin = "// BEGIN GENERATED COMPONENT SPATIAL419", end = "// END GENERATED COMPONENT SPATIAL419";
function packed(name: string, text: string): string {
  const bytes = Buffer.from(text); if (bytes.length > 65_536) { throw new Error("COMPONENT_NATIVE_PROGRAM_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic bounded build-time packing only.
  const compressed = gzipSync(bytes, { level: 9 });
  return `static readonly string ${name}=UnpackFixedProgram("${compressed.toString("base64")}",${String(bytes.length)},"${createHash("sha256").update(bytes).digest("hex")}","${createHash("sha256").update(compressed).digest("hex")}");`;
}
export function currentPcbComponentSpatialNativeSource(): string {
  if (COST.calleeProperties !== 290 || COST.fullWorkflow !== 419 || COST.spatialStage !== 316 || PROFILE.normalRequestLimit !== 418) { throw new Error("COMPONENT_NATIVE_DERIVATION"); }
  return `${begin}\npublic sealed partial class EasyedaDiagnosticOwner {\n${[
    ["ComponentWrapperFunction", CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION], ["ComponentHandlerFunction", CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION],
    ["ComponentFunctionsFunction", CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION], ["ComponentBindingsFunction", CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION],
    ["ComponentReadFunction", CURRENT_PCB_209_COMPONENT_POINT_READ_FUNCTION], ["ComponentRegistrationFunction", GENERATED_COMPONENT_FIXTURE_REGISTRATION_FUNCTION],
  ].map(([name, program]) => packed(name ?? "", program ?? "")).join("\n")}
${String.raw`
bool componentSpatial209,componentRegistrationConsumed,componentAttachmentAttempted,componentReleased,componentAbortAttempted;
string componentParentSession,componentPcbSession,componentSourceSession,componentContext,componentProject,componentDocument;
int componentStage,componentReads;
enum ComponentSpatialBirth { SourceQualified }
EasyedaDiagnosticOwner(ComponentSpatialBirth purpose){if(purpose!=ComponentSpatialBirth.SourceQualified)throw Error("component-birth");componentSpatial209=true;generatedFixture209=true;}
public static EasyedaDiagnosticOwner CreateComponentSpatial209(){return new EasyedaDiagnosticOwner(ComponentSpatialBirth.SourceQualified);}
public void AdmitComponentAction(string action){if(!componentSpatial209)return;if(componentAbortAttempted&&action!="identity"&&action!="termination"&&action!="release")throw Error("component-cleanup-only");foreach(string allowed in new[]{"identity","launch","send","component-spatial419","component-register419","component-abort","poll","window","normal-close","termination","release","release-unlaunched","release-no-process","no-process-proof"})if(action==allowed)return;throw Error("component-action");}
public void AbortComponentSpatial(){
if(!componentSpatial209||componentAbortAttempted||released||root==IntPtr.Zero||job==IntPtr.Zero||rootCreated==0)throw Error("component-abort-owner");
componentAbortAttempted=true;AssertLimits();long created,exited,kernel,user;bool member;
if(GetProcessId(root)!=rootPid||!GetProcessTimes(root,out created,out exited,out kernel,out user)||created!=rootCreated||!IsProcessInJob(root,job,out member)||!member)throw Error("component-abort-identity");
Native(TerminateJobObject(job,0x45444350));
}
static string ComponentOriginalId(int id,string encoded){const string prefix="{\"id\":1,";if(id<1||id>418||encoded==null||!encoded.StartsWith(prefix,StringComparison.Ordinal)||!encoded.EndsWith("}\0",StringComparison.Ordinal))throw Error("component-envelope");string text="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length);if(Encoding.UTF8.GetByteCount(text)>65536)throw Error("component-envelope-bound");return text;}
void ComponentSession(string session){if(session==null||!System.Text.RegularExpressions.Regex.IsMatch(session,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("component-session");if(componentParentSession==null)componentParentSession=session;else if(componentParentSession!=session)throw Error("component-original-session");}
void ComponentDiscovery(string method,string session){if(!componentSpatial209)throw Error("component-purpose");bool allowed=false;foreach(string candidate in new[]{"Browser.getVersion","Target.getTargets","Target.attachToTarget","Page.enable","Page.getFrameTree","Runtime.enable","Debugger.enable","Debugger.getScriptSource","DOM.getFrameOwner","DOM.describeNode"})if(method==candidate)allowed=true;if(!allowed)throw Error("component-discovery");if(method=="Target.attachToTarget"){if(componentAttachmentAttempted||componentStage>0)throw Error("component-attachment");componentAttachmentAttempted=true;return;}if(session!=null)ComponentSession(session);if(method=="Debugger.getScriptSource")componentSourceSession=session;}
static string ComponentScene(System.Collections.IDictionary fields,List<string> expected){
string[] names={"projectUuid","documentUuid","footprintUuid","componentId","padId","ownedPadId","footprintAttrId","designatorAttrId","placedFootprintAttrId","placedDesignatorAttrId"};
expected.Add("schema");if(!(fields["schema"] is string)||((string)fields["schema"])!="private.pcb209-generated-component-scene.v1")throw Error("component-scene-schema");
var values=new List<string>();values.Add("\"schema\":\"private.pcb209-generated-component-scene.v1\"");
foreach(string key in names){expected.Add(key);string value=fields[key] as string;int length=key=="projectUuid"?64:key=="documentUuid"||key=="footprintUuid"||key=="ownedPadId"?32:16;if(value==null||value.Length!=length||!System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[a-f0-9]+\z"))throw Error("component-scene-id");values.Add(JsonString(key)+":"+JsonString(value));}
if((string)fields["ownedPadId"]!=(string)fields["componentId"]+(string)fields["padId"])throw Error("component-scene-parent");return "{"+String.Join(",",values)+"}";
}
public static string ComponentSpatialProtocolMessage(int id,string method,string session,string phase,System.Collections.IDictionary fields){
if(id<1||id>419||id==419&&phase!="release"||session==null||!System.Text.RegularExpressions.Regex.IsMatch(session,@"\A[A-Za-z0-9_.:-]{1,128}\z")||fields==null)throw Error("component-fields");
const string group="easyeda-pro-control-pcb209-spatial-v1";string effects="\"throwOnSideEffect\":"+(phase=="bindings-component"||phase=="read-component"?"false":"true")+",\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
var expected=new List<string>();string parameters;
if(phase=="wrapper"&&method=="Runtime.evaluate"){expected.Add("uniqueContextId");parameters=effects+",\"expression\":"+JsonString(ComponentWrapperFunction)+",\"uniqueContextId\":"+JsonString(SpatialText(fields,"uniqueContextId",128))+",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":false,\"timeout\":1000,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false";}
else if(phase=="properties"&&method=="Runtime.getProperties"){expected.Add("objectId");parameters="\"objectId\":"+JsonString(SpatialText(fields,"objectId",256))+",\"ownProperties\":true,\"accessorPropertiesOnly\":false,\"generatePreview\":false";}
else if(phase=="release"&&method=="Runtime.releaseObjectGroup")parameters="\"objectGroup\":"+JsonString(group);
else if(method=="Runtime.callFunctionOn"&&(phase=="handler"||phase=="functions"||phase=="bindings-component"||phase=="read-component")){
expected.Add("objectId");string program=phase=="handler"?ComponentHandlerFunction:phase=="functions"?ComponentFunctionsFunction:phase=="bindings-component"?ComponentBindingsFunction:ComponentReadFunction;
parameters=effects+",\"objectId\":"+JsonString(SpatialText(fields,"objectId",256))+",\"functionDeclaration\":"+JsonString(program)+",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":"+(phase=="read-component"?"true":"false");
if(phase=="bindings-component"){expected.Add("callbackObjectId");string callback=SpatialText(fields,"callbackObjectId",256),scene=ComponentScene(fields,expected);parameters+=",\"arguments\":[{\"objectId\":"+JsonString(callback)+"},{\"value\":"+scene+"}]";}
if(phase=="read-component"){expected.AddRange(new[]{"queryKind","xMil","yMil"});if(!(fields["queryKind"] is string)||(string)fields["queryKind"]!="point")throw Error("component-point-only");parameters+=",\"arguments\":[{\"value\":{\"kind\":\"point\",\"xMil\":"+SpatialNumber(fields,"xMil").ToString("G17",CultureInfo.InvariantCulture)+",\"yMil\":"+SpatialNumber(fields,"yMil").ToString("G17",CultureInfo.InvariantCulture)+"}}]";}
}else throw Error("component-phase");
if(fields.Count!=expected.Count)throw Error("component-extra-fields");foreach(object key in fields.Keys)if(!(key is string)||!expected.Contains((string)key))throw Error("component-extra-fields");
string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+parameters+"},\"sessionId\":"+JsonString(session)+"}\0";if(Encoding.UTF8.GetByteCount(message)>65536)throw Error("component-send-bound");return message;
}
void ComponentSequence(int id,string session,string phase,System.Collections.IDictionary fields){if(!componentSpatial209)throw Error("component-purpose");if(componentReleased||componentPcbSession==null||session!=componentPcbSession||session!=componentParentSession||session!=componentSourceSession)throw Error("component-original-context");if(phase=="release"){if(componentStage==0)throw Error("component-sequence");componentReleased=true;return;}if(id>418)throw Error("component-cleanup-reserve");if(phase=="properties"){if(componentStage<1||componentStage>4)throw Error("component-sequence");return;}if(phase=="read-component"){if(componentStage<4||componentStage>5||componentReads>=16)throw Error("component-read-sequence");componentReads++;componentStage=5;return;}string[] steps={"wrapper","handler","bindings-component","functions"};if(componentStage>=steps.Length||steps[componentStage]!=phase)throw Error("component-sequence");if(phase=="wrapper"){if(componentContext!=null)throw Error("component-context-consumed");componentContext=SpatialText(fields,"uniqueContextId",128);}if(phase=="bindings-component"&&((string)fields["projectUuid"]!=componentProject||(string)fields["documentUuid"]!=componentDocument))throw Error("component-scene-target");componentStage++;}
public void SendComponentSpatial(int id,string method,string session,string phase,System.Collections.IDictionary fields){if(!componentSpatial209)throw Error("component-purpose");string message=ComponentSpatialProtocolMessage(id,method,session,phase,fields);ComponentSequence(id,session,phase,fields);SendMessage(id,message);}
public static string ComponentRegistrationProtocolMessage(int id,string session,string context,string path,string project,string branch,string document,string source){
if(path==null||!System.Text.RegularExpressions.Regex.IsMatch(path,@"\\Codex_component_circular_pad_[a-f0-9]{16}\.eprj2\z"))throw Error("component-registration-path");
string message=OpeningProtocolMessageCore(false,1,session,context,"preflight",path,project,branch,document,source,false),original=JsonString(OpeningFunction),replacement=JsonString(ComponentRegistrationFunction),argument="{\"value\":\"preflight\"}",selected="{\"value\":\"register-generated-fixture\"}";
if(message.Split(new[]{original},StringSplitOptions.None).Length!=2||message.Split(new[]{argument},StringSplitOptions.None).Length!=2)throw Error("component-registration-template");return ComponentOriginalId(id,message.Replace(original,replacement).Replace(argument,selected));}
public void SendComponentRegistration(int id,string session,string context,string path,string project,string branch,string document,string source){if(!componentSpatial209||componentRegistrationConsumed||componentStage>0)throw Error("component-registration-purpose");componentRegistrationConsumed=true;ComponentSession(session);string message=ComponentRegistrationProtocolMessage(id,session,context,path,project,branch,document,source);generatedFixtureRegistrationConsumed=true;generatedFixtureTuple=GeneratedFixtureTuple(session,context,path,project,branch,document,source);componentProject=project;componentDocument=document;SendMessage(id,message);}
public static void VerifyComponentSpatialSmoke(){var owner=CreateComponentSpatial209();if(!owner.componentSpatial209||owner.spatial209||owner.layers209||owner.workerStartup||owner.pcbViaWrite209||owner.schematicDisplayWrite209||owner.RequestLimit!=419)throw Error("component-birth-smoke");var empty=new System.Collections.Hashtable(StringComparer.Ordinal);ComponentSpatialProtocolMessage(419,"Runtime.releaseObjectGroup","s","release",empty);bool refused=false;try{ComponentSpatialProtocolMessage(419,"Runtime.getProperties","s","properties",empty);}catch{refused=true;}if(!refused)throw Error("component-reserve-smoke");foreach(var old in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixtureSpatial209(),CreatePcbViaWrite209()}){refused=false;try{old.SendComponentSpatial(1,"Runtime.releaseObjectGroup","s","release",empty);}catch{refused=true;}if(!refused)throw Error("component-old-owner-smoke");}foreach(string action in new[]{"spatial209","worker-startup-parent","main-send","renderer-viewport-send"}){refused=false;try{owner.AdmitComponentAction(action);}catch{refused=true;}if(!refused)throw Error("component-action-smoke");}
var fields=new System.Collections.Hashtable(StringComparer.Ordinal);fields.Add("objectId","bundle");fields.Add("callbackObjectId","wrapper");fields.Add("schema","private.pcb209-generated-component-scene.v1");string[] ids={"projectUuid","documentUuid","footprintUuid","componentId","padId","ownedPadId","footprintAttrId","designatorAttrId","placedFootprintAttrId","placedDesignatorAttrId"};foreach(string key in ids)fields.Add(key,new string('a',key=="projectUuid"?64:key=="documentUuid"||key=="footprintUuid"||key=="ownedPadId"?32:16));
string binding=ComponentSpatialProtocolMessage(418,"Runtime.callFunctionOn","s","bindings-component",fields);if(binding.IndexOf(JsonString(ComponentBindingsFunction),StringComparison.Ordinal)<0||binding.IndexOf("\"schema\":\"private.pcb209-generated-component-scene.v1\"",StringComparison.Ordinal)<0)throw Error("component-bindings-smoke");
fields["ownedPadId"]=new string('b',32);refused=false;try{ComponentSpatialProtocolMessage(1,"Runtime.callFunctionOn","s","bindings-component",fields);}catch{refused=true;}if(!refused)throw Error("component-parent-smoke");fields["ownedPadId"]=new string('a',32);
owner.componentParentSession="s";owner.componentPcbSession="s";owner.componentSourceSession="s";owner.componentProject=new string('a',64);owner.componentDocument=new string('a',32);var context=new System.Collections.Hashtable();context.Add("uniqueContextId","context");owner.ComponentSequence(1,"s","wrapper",context);owner.ComponentSequence(2,"s","handler",empty);owner.ComponentSequence(3,"s","bindings-component",fields);owner.ComponentSequence(4,"s","functions",empty);
var point=new System.Collections.Hashtable();point.Add("objectId","bundle");point.Add("queryKind","point");point.Add("xMil",0.1m);point.Add("yMil",-0.25m);string read=ComponentSpatialProtocolMessage(418,"Runtime.callFunctionOn","s","read-component",point);if(read.IndexOf(JsonString(ComponentReadFunction),StringComparison.Ordinal)<0||read.IndexOf("\"throwOnSideEffect\":false",StringComparison.Ordinal)<0)throw Error("component-read-smoke");for(int i=0;i<16;i++)owner.ComponentSequence(i+5,"s","read-component",point);
refused=false;try{owner.ComponentSequence(21,"s","read-component",point);}catch{refused=true;}if(!refused)throw Error("component-read-limit-smoke");point["queryKind"]="region";refused=false;try{ComponentSpatialProtocolMessage(1,"Runtime.callFunctionOn","s","read-component",point);}catch{refused=true;}if(!refused)throw Error("component-region-smoke");
refused=false;try{owner.ComponentSequence(419,"foreign","release",empty);}catch{refused=true;}if(!refused)throw Error("component-original-release-smoke");owner.ComponentSequence(419,"s","release",empty);refused=false;try{owner.ComponentSequence(419,"s","release",empty);}catch{refused=true;}if(!refused)throw Error("component-release-once-smoke");
foreach(var old in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixtureSpatial209(),CreatePcbViaWrite209()}){refused=false;try{old.AbortComponentSpatial();}catch{refused=true;}if(!refused)throw Error("component-old-abort-smoke");}
var unbound=CreateComponentSpatial209();refused=false;try{unbound.AbortComponentSpatial();}catch{refused=true;}if(!refused||unbound.componentAbortAttempted)throw Error("component-unbound-abort-smoke");
unbound.componentAbortAttempted=true;foreach(string action in new[]{"send","poll","window","normal-close","component-abort","component-spatial419","component-register419"}){refused=false;try{unbound.AdmitComponentAction(action);}catch{refused=true;}if(!refused)throw Error("component-aborted-action-smoke");}foreach(string action in new[]{"identity","termination","release"})unbound.AdmitComponentAction(action);
string path=@"C:\SyntheticTemp\Codex_component_circular_pad_1111111111111111.eprj2",project;using(SHA256 hash=SHA256.Create()){project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();}string registration=ComponentRegistrationProtocolMessage(418,"s","context",path,project,new string('a',32),new string('b',32),new string('c',64));if(registration.IndexOf(JsonString(ComponentRegistrationFunction),StringComparison.Ordinal)<0)throw Error("component-registration-smoke");
}
`}
}\n${end}`;
}
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("COMPONENT_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`COMPONENT_NATIVE_ANCHOR:${before.slice(0, 96)}`); } return source.replace(before, after);
}
const dispatch = String.raw`        'component-abort' {
          if (-not $ComponentSpatial209 -or $request.confirmAbortOriginalComponentJob -isnot [bool] -or $request.confirmAbortOriginalComponentJob -ne $true -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,confirmAbortOriginalComponentJob,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-component-abort-fields'}
          if ($request.helperInstance -isnot [string] -or $request.jobId -isnot [string] -or $request.rootCreated -isnot [string] -or ($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid) {throw 'pcb-diagnostic-component-abort-binding'}
          $owner.AbortComponentSpatial();$result=@{terminationDispatched=$true}
        }
        'component-spatial419' {
          if (-not $ComponentSpatial209 -or -not $launched -or $request.method -isnot [string] -or $request.sessionId -isnot [string] -or $request.spatialPhase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 419) {throw 'pcb-diagnostic-component-fields'}
          $baseFields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid','sessionId','spatialPhase');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-component-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendComponentSpatial([int]$request.requestId,$request.method,$request.sessionId,$request.spatialPhase,$fields);$result=@{written=$true}
        }
        'component-register419' {
          if (-not $ComponentSpatial209 -or -not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 418) {throw 'pcb-diagnostic-component-register-fields'}
          $fields=@('action','helperInstance','id','jobId','requestId','rootCreated','rootPid','sessionId','uniqueContextId','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256')
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($fields | Sort-Object) -join ',')) {throw 'pcb-diagnostic-component-register-roster'}
          foreach ($field in @('sessionId','uniqueContextId','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256')) {if ($request.$field -isnot [string]) {throw 'pcb-diagnostic-component-register-type'}}
          $owner.SendComponentRegistration([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256);$result=@{written=$true}
        }
`;
/** Install only the new fixed switch before other fragments collect purpose rosters. */
export function prepareCurrentPcbComponentSpatialNativeSwitch(input: string): string {
  return one(input, "[switch]$GeneratedFixtureSpatial209,", "[switch]$GeneratedFixtureSpatial209,[switch]$ComponentSpatial209,");
}
/** Root regenerates shared helper and pins. This edits only the supplied copy. */
export function applyCurrentPcbComponentSpatialNativeFragment(input: string): string {
  let source = prepareCurrentPcbComponentSpatialNativeSwitch(input);
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "ComponentSpatial209");
  const registrationSwitches = [...switches.filter(name => name !== "GeneratedFixture209" && name !== "SchematicDisplayWrite209"), "ComponentSpatial209"];
  const registrationConflict = `if ($GeneratedFixture209 -and (${registrationSwitches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-generated-fixture-purpose'}\n`;
  const priorRegistration = source.split("\n").filter(line => line.startsWith("if ($GeneratedFixture209 -and ("));
  if (priorRegistration.length !== 1 || priorRegistration[0] === undefined) { throw new Error("COMPONENT_NATIVE_REGISTRATION_CONFLICT"); }
  source = source.replace(`${priorRegistration[0]}\n`, registrationConflict);
  const conflict = `if ($ComponentSpatial209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-component-purpose'}\n`;
  const previous = source.split("\n").filter(line => line.startsWith("if ($ComponentSpatial209 -and ("));
  if (previous.length > 1) { throw new Error("COMPONENT_NATIVE_CONFLICT"); }
  source = previous[0] === undefined ? one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`) : source.replace(`${previous[0]}\n`, conflict);
  source = one(source, "else {New-Object EasyedaDiagnosticOwner}", "elseif ($ComponentSpatial209) {[EasyedaDiagnosticOwner]::CreateComponentSpatial209()} else {New-Object EasyedaDiagnosticOwner}");
  source = one(source, "spatial209?384:workerStartup?", "spatial209?384:componentSpatial209?419:workerStartup?");
  source = one(source, "  public void SendDom(int id,string method,string sessionId,object frameId,object backendNodeId) {", "  public void SendDom(int id,string method,string sessionId,object frameId,object backendNodeId) {\n    if(componentSpatial209){ComponentDiscovery(method,sessionId);SendMessage(id,ComponentOriginalId(id,DomProtocolMessageCore(1,method,sessionId,frameId,backendNodeId,false)));return;}");
  source = one(source, "  public void Send(int id,string method,object targetId,object sessionId,object scriptId,object uniqueContextId) {", "  public void Send(int id,string method,object targetId,object sessionId,object scriptId,object uniqueContextId) {\n    if(componentSpatial209){ComponentDiscovery(method,OptionalText(sessionId));SendMessage(id,ComponentOriginalId(id,ProtocolMessageCore(1,method,OptionalText(targetId),OptionalText(sessionId),OptionalText(scriptId),OptionalText(uniqueContextId),false)));return;}");
  source = one(source, "    RequireGeneratedFixtureOpening(sessionId,uniqueContextId,path,project,branch,document,source);", "    RequireGeneratedFixtureOpening(sessionId,uniqueContextId,path,project,branch,document,source);\n    if(componentSpatial209){ComponentSession(sessionId);if(componentStage>0)throw Error(\"component-navigation-consumed\");SendMessage(id,ComponentOriginalId(id,OpeningProtocolMessageCore(false,1,sessionId,uniqueContextId,phase,path,project,branch,document,source,false)));return;}");
  source = one(source, "    if(pcbViaWrite209){ViaSession(sessionId);if(phase==\"observe\")viaPcbSession=sessionId;}", "    if(pcbViaWrite209){ViaSession(sessionId);if(phase==\"observe\")viaPcbSession=sessionId;}\n    if(componentSpatial209){ComponentSession(sessionId);if(project!=componentProject||document!=componentDocument)throw Error(\"component-opening-target\");if(componentStage>0&&phase!=\"observe\")throw Error(\"component-navigation-consumed\");if(phase==\"observe\"){if(componentPcbSession!=null&&componentPcbSession!=sessionId)throw Error(\"component-original-pcb\");componentPcbSession=sessionId;}SendMessage(id,ComponentOriginalId(id,OpeningProtocolMessageCore(true,1,sessionId,uniqueContextId,phase,path,project,branch,document,source,false)));return;}");
  source = one(source, "      if ($Spatial209) {$owner.AdmitSpatialAction($request.action)}", "      if ($ComponentSpatial209) {$owner.AdmitComponentAction($request.action)}\n      if ($Spatial209) {$owner.AdmitSpatialAction($request.action)}");
  source = one(source, "elseif ($Spatial209) {383} elseif ($StringPrecreate)", "elseif ($Spatial209) {383} elseif ($ComponentSpatial209) {418} elseif ($StringPrecreate)");
  source = installOwnedNativeDispatch(source, dispatch, "        'spatial209' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyComponentSpatialSmoke()", "    [EasyedaDiagnosticOwner]::VerifySpatial209Smoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end), value = currentPcbComponentSpatialNativeSource();
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("COMPONENT_NATIVE_MARKERS"); } source = source.slice(0, start) + value + source.slice(stop + end.length); }
  else { source = one(source, "\n'@\n", `\n${value}\n'@\n`); }
  return source;
}
