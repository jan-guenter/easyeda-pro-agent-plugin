/** V4-only poststate ledger. Reuse fixed collateral syntax, never its closed
 * after-round issuer or a historical/public preference authority. */
import { createHash } from "node:crypto";
import { currentFootprintInverseNativeDeleteCollateralCases } from "./current-footprint-inverse-native-delete-collateral-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteCollateralCommand } from "./current-footprint-inverse-native-delete-collateral-protocol.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_POSTSTATE_NATIVE_ROSTER"); } }
function physicalOrder(): readonly CurrentFootprintInverseNativeDeleteCollateralCommand[] {
  const after = currentFootprintInverseNativeDeleteCollateralCases().filter(command => command.round === "after");
  const tab = after.find(command => command.method === "Runtime.callFunctionOn" && command.role === "tabReprove");
  const storage = after.find(command => command.method === "Runtime.callFunctionOn" && command.role === "storageReprove");
  const helper = after.find(command => command.method === "Debugger.getScriptSource");
  const properties = after.find(command => command.method === "Runtime.getProperties" && command.role === "storage");
  need(after.length === 4 && tab !== undefined && storage !== undefined && helper !== undefined && properties !== undefined);
  return Object.freeze([tab, helper, storage, helper, properties]);
}
/** Pure emission only. The original Core caller/drain and retained before
 * closures, not JSON or these fixed packet bytes, grant poststate custody. */
export function currentFootprintInverseNativeDeletePoststateNativeSource(): string {
  const commands = physicalOrder();
  const phases = commands.map(command => JSON.stringify(command.phase)).join(",");
  const roles = commands.map(command => "role" in command ? JSON.stringify(command.role) : "null").join(",");
  const methods = commands.map(command => JSON.stringify(command.method)).join(",");
  const packets = commands.map(command => `${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`).join("");
  const smoke = createHash("sha256").update(packets).digest("hex");
  return `public sealed partial class EasyedaDiagnosticOwner{
bool dnpsBound,dnpsComplete,dnpsFailed;int dnpsStep,dnpsCalls,dnpsHelpers,dnpsProperties;string dnpsReflection,dnpsStorage;
static readonly string[] DnpsPhases={${phases}},DnpsRoles={${roles}},DnpsMethods={${methods}};
static Exception DnpsError(string part){return Error("inverse-native-delete-poststate-"+part);}
void AssertNativeDeletePoststate(){AssertDncl();AssertDnd();AssertNativeDeleteExecution();if(!dnclComplete||!dndComplete||!ndcPrepared||!ndxRegistrationComplete||dnclFailed||dndFailed||ndcFailed||dnpsFailed)throw DnpsError("original");}
static string DnpsRole(object rawRole){if(rawRole!=null&&!(rawRole is string))throw DnpsError("role");return rawRole as string;}
public void ControlNativeDeletePoststate(string phase,System.Collections.IDictionary fields){try{
 AssertNativeDeletePoststate();if(fields==null||dnpsComplete)throw DnpsError("control");
 if(phase=="bind"){if(dnpsBound||dnpsStep!=0||fields.Count!=2)throw DnpsError("bind");string boundReflection=InverseDeleteBindingHandle(fields["reflection"]),boundStorage=InverseDeleteBindingHandle(fields["storage"]);if(boundReflection==boundStorage)throw DnpsError("alias");dnpsReflection=boundReflection;dnpsStorage=boundStorage;dnpsBound=true;return;}
 if(phase!="complete"||!dnpsBound||fields.Count!=0||dnpsStep!=5||dnpsCalls!=2||dnpsHelpers!=2||dnpsProperties!=1)throw DnpsError("incomplete");dnpsComplete=true;
}catch{dnpsFailed=true;throw;}}
public void SendNativeDeletePoststate(int id,string phase,object rawRole,string method,System.Collections.IDictionary fields){try{
 AssertNativeDeletePoststate();if(id<1||id>RequestLimit||!dnpsBound||dnpsComplete||fields==null||dnpsStep>=5)throw DnpsError("send");string role=DnpsRole(rawRole);
 if(phase!=DnpsPhases[dnpsStep]||role!=DnpsRoles[dnpsStep]||method!=DnpsMethods[dnpsStep])throw DnpsError("order");
 string text=NativeDeletePoststateMessage(id,footprintInverseUiSession,phase,role,method,fields);
 if(dnpsStep==0||dnpsStep==2){if(fields["objectId"] as string!=dnpsReflection||fields["argument0"] as string!=(dnpsStep==0?ndcTabProof:ndcStorageProof))throw DnpsError("original-proof");dnpsCalls++;}
 else if(dnpsStep==1||dnpsStep==3)dnpsHelpers++;
 else{if(fields["objectId"] as string!=dnpsStorage)throw DnpsError("original-storage");dnpsProperties++;}
 dnpsStep++;SendMessage(id,text);
}catch{dnpsFailed=true;throw;}}
public static string NativeDeletePoststateMessage(int id,string session,string phase,object rawRole,string method,System.Collections.IDictionary fields){
 if(id<1||fields==null||fields["round"] as string!="after")throw DnpsError("codec");string role=DnpsRole(rawRole);
 if(phase=="inverse-native-delete-collateral-call"){if((role!="tabReprove"&&role!="storageReprove")||method!="Runtime.callFunctionOn")throw DnpsError("codec-call");}
 else if(phase=="inverse-native-delete-collateral-helper"){if(role!=null||method!="Debugger.getScriptSource")throw DnpsError("codec-helper");}
 else if(phase=="inverse-native-delete-collateral-properties"){if(role!="storage"||method!="Runtime.getProperties")throw DnpsError("codec-properties");}
 else throw DnpsError("codec-phase");
 var copy=new System.Collections.Hashtable(fields);copy.Remove("round");return FootprintInverseNativeDeleteCollateralMessage(id,session,phase,role,method,copy);
}
public static void VerifyNativeDeletePoststateSmoke(){var all=new System.Text.StringBuilder();for(int at=0;at<5;at++){var fields=new System.Collections.Hashtable();fields.Add("round","after");if(at==1||at==3)fields.Add("scriptId","original_ref");else{fields.Add("objectId","original_ref");if(at==0||at==2)fields.Add("argument0","original_ref");}all.Append(NativeDeletePoststateMessage(79,"original_ui",DnpsPhases[at],DnpsRoles[at],DnpsMethods[at],fields));}using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(all.ToString()))).Replace("-","").ToLowerInvariant()!="${smoke}")throw DnpsError("smoke");}
}
`;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_POSTSTATE_DISPATCH = String.raw`        'footprint-inverse-native-delete-poststate' {
          if(-not $FootprintInverseNativeContinuationV4 -or -not $FootprintInverseNativeLifecycle209 -or -not $FootprintInverse209 -or -not $launched){throw 'inverse-native-delete-poststate-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-native-delete-poststate-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-delete-poststate-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;foreach($property in $request.PSObject.Properties){if($property.Name -ceq 'role'){$role=$property.Value;if($role -isnot [string]){throw 'inverse-native-delete-poststate-role'}}elseif($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $null -ne $role){throw 'inverse-native-delete-poststate-control'};$owner.ControlNativeDeletePoststate($request.phase,$fields)}else{if($request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'inverse-native-delete-poststate-id'};$owner.SendNativeDeletePoststate([int]$request.requestId,$request.phase,$role,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
