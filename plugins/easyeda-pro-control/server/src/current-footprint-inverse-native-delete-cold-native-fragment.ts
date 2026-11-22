/** Source projection for the separate inverse cold successor helper. */
import {currentFootprintInverseNativeDeleteColdNativeSource} from "./current-footprint-inverse-native-delete-cold-native.ts";
import {currentFootprintInverseNativeDeleteColdOwnDataCases} from "./current-footprint-inverse-native-delete-cold-own-data-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE as PROFILE} from "./current-footprint-inverse-native-delete-cold-profile.ts";
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";

const begin="// BEGIN NATIVE DELETE COLD READONLY V1",end="// END NATIVE DELETE COLD READONLY V1";
function one(source:string,before:string,after:string):string{
 if(source.includes(after)){if(source.split(after).length!==2){throw new Error("INVERSE_NATIVE_DELETE_COLD_NATIVE_DUPLICATE");}return source;}
 if(source.split(before).length!==2){throw new Error("INVERSE_NATIVE_DELETE_COLD_NATIVE_ANCHOR");}return source.replace(before,after);
}
function native():string{
 const own=currentFootprintInverseNativeDeleteColdOwnDataCases().slice(0,20).map(command=>JSON.stringify(command.phase)).join(",");
 const get=["call:project","properties:projectFootprint","call:footprint","properties:footprintView","call:methods","properties:methods","properties:get","properties:getData","call:snapshot","properties:proof",
  "call:read","properties:read","properties:result","call:result","call:read","properties:read","properties:result","call:result","call:reprove"].map(value=>JSON.stringify(`inverse-native-delete-cold-get-${value}`)).join(",");
 return currentFootprintInverseNativeDeleteColdNativeSource()+String.raw`public sealed partial class EasyedaDiagnosticOwner{
readonly bool nativeDeleteColdReadonly;
public const int NativeDeleteColdRequests=${String(PROFILE.requestLimit)};
const int NativeDeleteColdNormal=${String(PROFILE.normalRequestLimit)},NativeDeleteColdCleanup=${String(PROFILE.cleanupRequestLimit)};
bool nativeDeleteColdBound,nativeDeleteColdOwnReady,nativeDeleteColdGetReady,nativeDeleteColdFailed,nativeDeleteColdHelperPending;
int nativeDeleteColdOwnStep,nativeDeleteColdOwnHelpers,nativeDeleteColdGetStep,nativeDeleteColdGetHelpers;
string nativeDeleteColdContext,nativeDeleteColdProject,nativeDeleteColdDocument,nativeDeleteColdReflection,nativeDeleteColdManager,nativeDeleteColdParent,nativeDeleteColdRows,nativeDeleteColdProof,nativeDeleteColdRead;
long nativeDeleteColdTicket;
static readonly string[] NativeDeleteColdOwnOrder={${own}},NativeDeleteColdGetOrder={${get}};
public static EasyedaDiagnosticOwner CreateFootprintInverseNativeDeleteCold209(){return new EasyedaDiagnosticOwner("footprint-inverse-native-delete-cold209",true);}
public void RequireNativeDeleteColdBirth(){if(!nativeDeleteColdReadonly||!workerStartupFootprintHeldSaved209||!workerStartupFootprintSaved209||workerStartupFootprintCopy209||footprintHeldCache209||launchCompleted||heldBound||job!=IntPtr.Zero||root!=IntPtr.Zero||nextRequest!=1||EffectiveRequestLimit!=NativeDeleteColdRequests)throw Error("inverse-native-delete-cold-original-birth");}
public static void VerifyNativeDeleteColdBirthSmoke(){
 Action<Action> refuse=action=>{
  bool refused=false;
  try{action();}catch(InvalidOperationException){refused=true;}
  if(!refused)throw Error("inverse-native-delete-cold-expected-refusal");
 };
 var owner=CreateFootprintInverseNativeDeleteCold209();
 var old=CreateWorkerStartupFootprintHeldSaved209();
 owner.RequireNativeDeleteColdBirth();
 refuse(()=>old.RequireNativeDeleteColdBirth());
 if(old.EffectiveRequestLimit!=HeldSavedRequests||owner.EffectiveRequestLimit!=NativeDeleteColdRequests||owner.EffectiveRequestLimit==old.EffectiveRequestLimit)
  throw Error("inverse-native-delete-cold-effective-limit");
 refuse(()=>old.AdmitHeldSavedAction("footprint-inverse-native-delete-cold-own-data",false));
 refuse(()=>owner.AdmitHeldSavedAction("footprint-copy-native-create",false));
 owner.AdmitHeldSavedAction("footprint-inverse-native-delete-cold-control",false);
 if(owner.heldNormalControls!=1)throw Error("inverse-native-delete-cold-control-accounting");
 owner.ChargeHeldSavedRenderer(1,"{\"id\":1,\"method\":\"Debugger.resume\"}");
 for(int id=2;id<=NativeDeleteColdNormal+1;id++)
  owner.ChargeHeldSavedRenderer(id,"{\"id\":"+id+",\"method\":\"Runtime.enable\"}");
 refuse(()=>owner.ChargeHeldSavedRenderer(NativeDeleteColdNormal+2,"{\"id\":"+(NativeDeleteColdNormal+2)+",\"method\":\"Runtime.enable\"}"));
 for(int id=NativeDeleteColdNormal+2;id<=NativeDeleteColdRequests;id++)
  owner.ChargeHeldSavedRenderer(id,"{\"id\":"+id+",\"method\":\"Runtime.releaseObjectGroup\"}");
 if(owner.heldNormalRequests!=NativeDeleteColdNormal||owner.heldCleanupRequests!=NativeDeleteColdCleanup)
  throw Error("inverse-native-delete-cold-request-accounting");
 refuse(()=>owner.ChargeHeldSavedRenderer(NativeDeleteColdRequests+1,"{\"id\":"+(NativeDeleteColdRequests+1)+",\"method\":\"Runtime.releaseObjectGroup\"}"));
}
void AssertNativeDeleteColdReadonly(){
 if(!nativeDeleteColdReadonly||!workerStartupFootprintHeldSaved209||footprintHeldCache209||!launchCompleted||!startupOpeningConsumed||!heldBound||!heldReleaseAcknowledged||heldFailed||heldAbortAttempted||nativeDeleteColdFailed||protocolFailed||footprintCopyWorkerSession==null)throw Error("inverse-native-delete-cold-original");
 AssertLive();
}
static string NativeDeleteColdHandle(object input){string value=input as string;if(!HandleToken(value,256))throw Error("inverse-native-delete-cold-handle");return value;}
public void ControlNativeDeleteCold(string phase,System.Collections.IDictionary fields){try{
 AssertNativeDeleteColdReadonly();if(fields==null||nativeDeleteColdGetReady)throw Error("inverse-native-delete-cold-control");
 if(phase=="bind"){
  if(nativeDeleteColdBound||fields.Count!=7||!fields.Contains("sessionId")||!fields.Contains("uniqueContextId")||!fields.Contains("project")||!fields.Contains("projectUuid")||!fields.Contains("branchUuid")||!fields.Contains("documentUuid")||!fields.Contains("ticket")||
   fields["sessionId"] as string!=footprintCopyWorkerSession||fields["projectUuid"] as string!=heldProject||fields["branchUuid"] as string!=heldBranch)throw Error("inverse-native-delete-cold-bind");
  nativeDeleteColdContext=NativeDeleteColdHandle(fields["uniqueContextId"]);nativeDeleteColdProject=NativeDeleteColdHandle(fields["project"]);nativeDeleteColdDocument=fields["documentUuid"] as string;
  if(nativeDeleteColdDocument==null||!System.Text.RegularExpressions.Regex.IsMatch(nativeDeleteColdDocument,@"\A(?:[a-f0-9]{16}|[a-f0-9]{32})\z")||!(fields["ticket"] is int||fields["ticket"] is long))throw Error("inverse-native-delete-cold-target");
  nativeDeleteColdTicket=Convert.ToInt64(fields["ticket"],CultureInfo.InvariantCulture);if(nativeDeleteColdTicket<1||nativeDeleteColdTicket>9007199254740991L)throw Error("inverse-native-delete-cold-ticket");nativeDeleteColdBound=true;return;
 }
 if(phase=="own-ready"){if(fields.Count!=0||!nativeDeleteColdBound||nativeDeleteColdOwnReady||nativeDeleteColdHelperPending||nativeDeleteColdOwnStep!=20||nativeDeleteColdOwnHelpers!=5||nativeDeleteColdReflection==null)throw Error("inverse-native-delete-cold-own-incomplete");nativeDeleteColdOwnReady=true;return;}
 if(phase!="get-complete"||fields.Count!=0||!nativeDeleteColdOwnReady||nativeDeleteColdHelperPending||nativeDeleteColdGetStep!=19||nativeDeleteColdGetHelpers!=9)throw Error("inverse-native-delete-cold-get-incomplete");
 nativeDeleteColdGetReady=true;
}catch{nativeDeleteColdFailed=true;heldFailed=true;throw;}}
public void SendNativeDeleteCold(int id,string family,string phase,object rawRole,string method,System.Collections.IDictionary fields){try{
 AssertNativeDeleteColdReadonly();if(!nativeDeleteColdBound||nativeDeleteColdGetReady||fields==null||rawRole!=null&&!(rawRole is string)||id<1||id>${String(PROFILE.requestLimit)})throw Error("inverse-native-delete-cold-send");
 string role=rawRole as string;bool own=family=="own-data";if(!own&&family!="get")throw Error("inverse-native-delete-cold-family");
 bool helper=phase==(own?"inverse-native-delete-cold-own-data-helper":"inverse-native-delete-cold-get-helper");
 if(own?nativeDeleteColdOwnReady||nativeDeleteColdOwnStep>20:!nativeDeleteColdOwnReady)throw Error("inverse-native-delete-cold-phase");
 if(helper){if(!nativeDeleteColdHelperPending||role!=null||(own?nativeDeleteColdOwnHelpers>=5:nativeDeleteColdGetHelpers>=9))throw Error("inverse-native-delete-cold-helper");}
 else{
  string key=phase+(role==null?"":":"+role);
  if(nativeDeleteColdHelperPending||(own?nativeDeleteColdOwnStep>=20||key!=NativeDeleteColdOwnOrder[nativeDeleteColdOwnStep]:nativeDeleteColdGetStep>=19||key!=NativeDeleteColdGetOrder[nativeDeleteColdGetStep]))throw Error("inverse-native-delete-cold-order");
  if(own){
   if(phase=="inverse-native-delete-cold-own-data-literal"&&fields["uniqueContextId"] as string!=nativeDeleteColdContext)throw Error("inverse-native-delete-cold-context");
   if(phase=="inverse-native-delete-cold-own-data-reprove")nativeDeleteColdReflection=NativeDeleteColdHandle(fields["objectId"]);
   if(phase=="inverse-native-delete-cold-own-data-rootJoin"&&(fields["objectId"] as string!=nativeDeleteColdReflection||fields["reference0"] as string!=nativeDeleteColdProject))throw Error("inverse-native-delete-cold-original-project");
  }else{
   if(method=="Runtime.callFunctionOn"&&fields["objectId"] as string!=nativeDeleteColdReflection)throw Error("inverse-native-delete-cold-reflection");
   if(role=="project"&&fields["reference0"] as string!=nativeDeleteColdProject)throw Error("inverse-native-delete-cold-project");
   if(role=="footprint")nativeDeleteColdManager=NativeDeleteColdHandle(fields["reference0"]);
   if(role=="methods"&&method=="Runtime.callFunctionOn"){nativeDeleteColdParent=NativeDeleteColdHandle(fields["reference2"]);nativeDeleteColdRows=NativeDeleteColdHandle(fields["reference3"]);}
   if((role=="methods"||role=="snapshot")&&method=="Runtime.callFunctionOn"){
    if(fields["reference0"] as string!=nativeDeleteColdProject||fields["reference1"] as string!=nativeDeleteColdManager||fields["reference2"] as string!=nativeDeleteColdParent||fields["reference3"] as string!=nativeDeleteColdRows||
     fields["projectUuid"] as string!=heldProject||fields["branchUuid"] as string!=heldBranch||fields["documentUuid"] as string!=nativeDeleteColdDocument||
     !(fields["ticket"] is int||fields["ticket"] is long)||Convert.ToInt64(fields["ticket"],CultureInfo.InvariantCulture)!=nativeDeleteColdTicket)throw Error("inverse-native-delete-cold-original-target");
   }
   if(role=="proof"&&method=="Runtime.getProperties")nativeDeleteColdProof=NativeDeleteColdHandle(fields["objectId"]);
   if(role=="read"&&method=="Runtime.getProperties")nativeDeleteColdRead=NativeDeleteColdHandle(fields["objectId"]);
   if((role=="read"||role=="result"||role=="reprove")&&method=="Runtime.callFunctionOn"&&fields["reference0"] as string!=nativeDeleteColdProof)throw Error("inverse-native-delete-cold-original-proof");
   if(role=="result"&&method=="Runtime.callFunctionOn"&&fields["reference1"] as string!=nativeDeleteColdRead)throw Error("inverse-native-delete-cold-original-return");
  }
 }
 string message=NativeDeleteColdMessage(id,footprintCopyWorkerSession,phase,role,method,fields);
 if(helper){nativeDeleteColdHelperPending=false;if(own)nativeDeleteColdOwnHelpers++;else nativeDeleteColdGetHelpers++;}
 else{if(own)nativeDeleteColdOwnStep++;else nativeDeleteColdGetStep++;if(method=="Runtime.callFunctionOn")nativeDeleteColdHelperPending=true;}
 SendMessage(id,message);
}catch{nativeDeleteColdFailed=true;heldFailed=true;throw;}}
}
`;
}
const dispatch=String.raw`        'footprint-inverse-native-delete-cold-control' {
          if(-not $FootprintInverseNativeDeleteCold209 -or -not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -ne 0 -or $request.method -cne 'control' -or $request.phase -isnot [string]){throw 'inverse-native-delete-cold-control'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-native-delete-cold-field'}}
          foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.ControlNativeDeleteCold($request.phase,$fields);$result=@{written=$true}
        }
        'footprint-inverse-native-delete-cold-own-data' {
          if(-not $FootprintInverseNativeDeleteCold209 -or -not $launched){throw 'inverse-native-delete-cold-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-native-delete-cold-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'inverse-native-delete-cold-send'}
          foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendNativeDeleteCold([int]$request.requestId,'own-data',$request.phase,$null,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-inverse-native-delete-cold-get' {
          if(-not $FootprintInverseNativeDeleteCold209 -or -not $launched){throw 'inverse-native-delete-cold-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null
          foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-native-delete-cold-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'inverse-native-delete-cold-send'}
          foreach($property in $request.PSObject.Properties){if($property.Name -ceq 'role'){$role=$property.Value;if($role -isnot [string]){throw 'inverse-native-delete-cold-role'}}elseif($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendNativeDeleteCold([int]$request.requestId,'get',$request.phase,$role,$request.method,$fields);$result=@{written=$true}
        }
`;
/** Assemble this profile from the verified shared build predecessor. */
export function applyCurrentFootprintInverseNativeDeleteColdNativeFragment(input:string):string{
 let source=input;
 const header=source.slice(0,source.indexOf("\n"));
 if(!header.startsWith("param([switch]$CompileOnly,")||!header.endsWith(",[string]$CombinedReadyChallenge)")){
  throw new Error("INVERSE_NATIVE_DELETE_COLD_NATIVE_HEADER");
 }
 const inherited=[...header.matchAll(/\[switch\]\$(\w+)/gu)].flatMap(match=>{
  const name=match[1];return name===undefined||name==="CompileOnly"?[]:[name];
 });
 if(inherited.length!==25||!inherited.includes("WorkerStartupFootprintHeldSaved209")||new Set(inherited).size!==inherited.length){
  throw new Error("INVERSE_NATIVE_DELETE_COLD_NATIVE_SWITCHES");
 }
 const switches=inherited.map(name=>`$${name}=[System.Management.Automation.SwitchParameter]$${name==="WorkerStartupFootprintHeldSaved209"?"true":"false"}`).join("\n");
 source=one(source,header,`param([switch]$FootprintInverseNativeDeleteCold209,[switch]$CompileOnly)
$ErrorActionPreference = 'Stop'
if(-not $FootprintInverseNativeDeleteCold209 -or $args.Count -ne 0){throw 'inverse-native-delete-cold-exact-qualifier'}
$CombinedReadyChallenge=''
${switches}`);
 const ownerLine=source.split("\n").find(line=>line.startsWith("$owner=if "));
 const limitsLine=source.split("\n").find(line=>line.startsWith("$startupRequestLimit=if "));
 if(ownerLine===undefined||limitsLine===undefined){throw new Error("INVERSE_NATIVE_DELETE_COLD_OWNER_LINE");}
 source=one(source,ownerLine,String.raw`$owner=[EasyedaDiagnosticOwner]::CreateFootprintInverseNativeDeleteCold209()
$owner.RequireNativeDeleteColdBirth()
if($CompileOnly){
  [EasyedaDiagnosticOwner]::VerifyNativeDeleteColdSmoke()
  [EasyedaDiagnosticOwner]::VerifyNativeDeleteColdBirthSmoke()
  @{schema='easyeda-pro-control.footprint-inverse-native-delete-cold-compile.v1';compiled=$true;birthAndBudgetsChecked=$true;codecChecked=$true;noNativeAllocation=$true} | ConvertTo-Json -Compress
  return
}`);
 source=one(source,limitsLine,"$startupRequestLimit=[EasyedaDiagnosticOwner]::NativeDeleteColdRequests");
 // The owned smoke runs before any native initialization.
 const compileStart=source.indexOf("  if ($CompileOnly) {\n");
 const compileEnd=source.indexOf("  $launched=$false",compileStart);
 if(compileStart===-1||compileEnd<=compileStart){throw new Error("INVERSE_NATIVE_DELETE_COLD_NATIVE_COMPILE");}
 source=source.slice(0,compileStart)+source.slice(compileEnd);
 source=one(source,'purpose!="footprint-held-cache209")throw Error("footprint-purpose");','purpose!="footprint-held-cache209"&&purpose!="footprint-inverse-native-delete-cold209")throw Error("footprint-purpose");');
 source=one(source,'workerStartupFootprintHeldSaved209=purpose=="worker-startup-footprint-held-saved209"||footprintHeldCache209;',
  'nativeDeleteColdReadonly=purpose=="footprint-inverse-native-delete-cold209";workerStartupFootprintHeldSaved209=purpose=="worker-startup-footprint-held-saved209"||footprintHeldCache209||nativeDeleteColdReadonly;');
 for(const property of ["FootprintRequestLimit","FootprintNormalRequestLimit"]as const){
  const prefix=`long ${property} { get { return `;
  source=one(source,prefix,`${prefix}nativeDeleteColdReadonly?NativeDeleteColdRequests:`);
 }
 for(const member of ["Requests","Cleanup","Normal"]as const){
  const original=`(footprintHeldCache209?HeldCache${member}:HeldSaved${member})`;
  const replacement=`(nativeDeleteColdReadonly?NativeDeleteCold${member}:${original.slice(1)}`;
  const expected=member==="Requests"?2:1;
  if(source.split(original).length!==expected+1){throw new Error("INVERSE_NATIVE_DELETE_COLD_NATIVE_BUDGET");}
  source=source.replaceAll(original,replacement);
 }
 source=one(source,'if(action=="send"||action=="worker-startup-send"||action=="worker-startup-parent"||action=="footprint-held-saved-worker"||action=="saved-cache-held"||action=="poll")return;',
  'if(action=="footprint-inverse-native-delete-cold-own-data"||action=="footprint-inverse-native-delete-cold-get"){if(!nativeDeleteColdReadonly)throw Error("inverse-native-delete-cold-purpose");return;}if(action=="send"||action=="worker-startup-send"||action=="worker-startup-parent"||action=="footprint-held-saved-worker"||action=="saved-cache-held"||action=="poll")return;');
 source=one(source,'if(action=="launch"||action=="held-saved-bind")cleanup=false;',
  'if(action=="launch"||action=="held-saved-bind"||action=="footprint-inverse-native-delete-cold-control"&&nativeDeleteColdReadonly)cleanup=false;');
 source=installOwnedNativeDispatch(source,dispatch,"        'saved-cache-held' {");
 const value=`${begin}\n${native()}\n${end}`;
 if(source.includes(begin)||source.includes(end)){throw new Error("INVERSE_NATIVE_DELETE_COLD_MARKERS");}
 const anchor="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(anchor).length!==2){throw new Error("INVERSE_NATIVE_DELETE_COLD_BODY_ANCHOR");}return source.replace(anchor,`${value}\n${anchor}`);
}
