/** The shared readonly helper receives this exact new constructor qualifier.
 * Historical layouts and their fixed bounds are not changed. */
import {currentFootprintInverseNativeDeleteColdNativeSource} from "./current-footprint-inverse-native-delete-cold-native.ts";
import {currentFootprintInverseNativeDeleteColdOwnDataCases} from "./current-footprint-inverse-native-delete-cold-own-data-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE as PROFILE} from "./current-footprint-inverse-native-delete-cold-profile.ts";
import {installOwnedNativeDispatch} from "./native-owned-dispatch.ts";
import {installNativeCompileOnlyHook} from "./native-compile-only-hook.ts";

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
bool nativeDeleteColdBound,nativeDeleteColdOwnReady,nativeDeleteColdGetReady,nativeDeleteColdFailed,nativeDeleteColdHelperPending;
int nativeDeleteColdOwnStep,nativeDeleteColdOwnHelpers,nativeDeleteColdGetStep,nativeDeleteColdGetHelpers;
string nativeDeleteColdContext,nativeDeleteColdProject,nativeDeleteColdDocument,nativeDeleteColdReflection,nativeDeleteColdManager,nativeDeleteColdParent,nativeDeleteColdRows,nativeDeleteColdProof,nativeDeleteColdRead;
long nativeDeleteColdTicket;
static readonly string[] NativeDeleteColdOwnOrder={${own}},NativeDeleteColdGetOrder={${get}};
public static EasyedaDiagnosticOwner CreateFootprintInverseNativeDeleteCold209(){return new EasyedaDiagnosticOwner("footprint-inverse-native-delete-cold209",true);}
public void RequireNativeDeleteColdBirth(){if(!nativeDeleteColdReadonly||!workerStartupFootprintHeldSaved209||!workerStartupFootprintSaved209||workerStartupFootprintCopy209||footprintHeldCache209||launchCompleted||heldBound)throw Error("inverse-native-delete-cold-original-birth");}
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
          if(-not $FootprintInverseNativeDeleteCold209 -or -not $launched -or $request.requestId -ne 0 -or $request.method -cne 'control' -or $request.phase -isnot [string]){throw 'inverse-native-delete-cold-control'}
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
/** Exact shared-layout extension only. Other historical generators never call
 * this function; changed or partial source anchors refuse. */
export function applyCurrentFootprintInverseNativeDeleteColdNativeFragment(input:string):string{
 let source=input;
 const parameter='[switch]$FootprintInverseNativeDeleteCold209,';
 source=one(source,'param([switch]$CompileOnly,',`param(${parameter}[switch]$CompileOnly,`);
 const preference="$ErrorActionPreference = 'Stop'\n";
 const gate=String.raw`if($FootprintInverseNativeDeleteCold209){if(@($PSBoundParameters.Keys|Where-Object{$_ -cnotin @('CompileOnly','FootprintInverseNativeDeleteCold209')}).Count -ne 0){throw 'inverse-native-delete-cold-exact-qualifier'};$WorkerStartupFootprintHeldSaved209=[System.Management.Automation.SwitchParameter]$true}
`;
 source=one(source,preference,preference+gate);
 source=one(source,'$owner=if (','$owner=if ($FootprintInverseNativeDeleteCold209) {[EasyedaDiagnosticOwner]::CreateFootprintInverseNativeDeleteCold209()} elseif (');
 const ownerLine=source.split("\n").find(line=>line.startsWith("$owner=if "));if(ownerLine===undefined){throw new Error("INVERSE_NATIVE_DELETE_COLD_OWNER_LINE");}
 source=one(source,ownerLine,`${ownerLine}\nif($FootprintInverseNativeDeleteCold209){$owner.RequireNativeDeleteColdBirth()}`);
 source=one(source,'purpose!="footprint-held-cache209")throw Error("footprint-purpose");','purpose!="footprint-held-cache209"&&purpose!="footprint-inverse-native-delete-cold209")throw Error("footprint-purpose");');
 source=one(source,'workerStartupFootprintHeldSaved209=purpose=="worker-startup-footprint-held-saved209"||footprintHeldCache209;',
  'nativeDeleteColdReadonly=purpose=="footprint-inverse-native-delete-cold209";workerStartupFootprintHeldSaved209=purpose=="worker-startup-footprint-held-saved209"||footprintHeldCache209||nativeDeleteColdReadonly;');
 source=one(source,'if(id<1||id>(footprintHeldCache209?HeldCacheRequests:HeldSavedRequests)',
  `if(nativeDeleteColdReadonly&&(id>${String(PROFILE.requestLimit)}||!cleanup&&heldNormalRequests>=${String(PROFILE.normalRequestLimit)}))throw Error("inverse-native-delete-cold-request-bound");if(id<1||id>(footprintHeldCache209?HeldCacheRequests:HeldSavedRequests)`);
 source=one(source,'if(action=="send"||action=="worker-startup-send"||action=="worker-startup-parent"||action=="footprint-held-saved-worker"||action=="saved-cache-held"||action=="poll")return;',
  'if(action=="footprint-inverse-native-delete-cold-own-data"||action=="footprint-inverse-native-delete-cold-get"){if(!nativeDeleteColdReadonly)throw Error("inverse-native-delete-cold-purpose");return;}if(action=="send"||action=="worker-startup-send"||action=="worker-startup-parent"||action=="footprint-held-saved-worker"||action=="saved-cache-held"||action=="poll")return;');
 source=one(source,'if(action=="launch"||action=="held-saved-bind")cleanup=false;',
  'if(action=="launch"||action=="held-saved-bind"||action=="footprint-inverse-native-delete-cold-control"&&nativeDeleteColdReadonly)cleanup=false;');
 source=installOwnedNativeDispatch(source,dispatch,"        'saved-cache-held' {");
 source=installNativeCompileOnlyHook(source,"    [EasyedaDiagnosticOwner]::VerifyNativeDeleteColdSmoke()","    [EasyedaPcbViaUploadRequestProtocol]::VerifySmoke()");
 const value=`${begin}\n${native()}\n${end}`;
 const start=source.indexOf(begin),stop=source.indexOf(end);
 if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("INVERSE_NATIVE_DELETE_COLD_MARKERS");}return source.slice(0,start)+value+source.slice(stop+end.length);}
 const anchor="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(anchor).length!==2){throw new Error("INVERSE_NATIVE_DELETE_COLD_BODY_ANCHOR");}return source.replace(anchor,`${value}\n${anchor}`);
}
