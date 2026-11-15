/** Separate native-only readonly service preparation. Its ledger never calls
 * a clock, resumes an original frame, or adopts a public/v2 owner registry. */
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_ORDER as ORDER,
  currentFootprintInverseNativeDeleteClockRegistrationCases as cases, currentFootprintInverseNativeDeleteClockRegistrationKey as key } from "./current-footprint-inverse-native-delete-clock-registration-protocol.ts";

const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sha256 = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const prefix = "inverse-native-delete-clock-registration-";
export function currentFootprintInverseNativeDeleteClockRegistrationNativeSource(): string {
  const commands = cases();
  const orderIndices = ORDER.map(name => { const index = commands.findIndex(command => key(command) === name); if (index === -1) { throw new Error("INVERSE_NATIVE_CLOCK_REGISTRATION_ROSTER"); } return index + 4; });
  const smokeSha256 = sha256(Buffer.from(commands.map(command => `${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })  }\0`).join("")));
  return `public sealed partial class EasyedaDiagnosticOwner{
static System.Exception DncrE(string part){return Error("inverse-native-delete-clock-registration-"+part);}
static readonly string[][] DncrRows=NativeClockRows("r");
static readonly string[] DncrOrder=DncrOrderValues();
static string[] DncrOrderValues(){int[] indices={${orderIndices.join(",")}};var result=new string[18];for(int i=0;i<18;i++)result[i]=DncrRows[indices[i]][0];return result;}
bool dncrBound,dncrComplete,dncrFailed;int dncrStep,dncrHelpers;string dncrTab;
void AssertDncr(){AssertDae();if(!daeComplete||!dpfComplete||dpfFailed||dncrFailed||footprintInversePublicCallAttempted||footprintInversePublicCallBound)throw DncrE("original");}
public void ControlNativeDeleteClockRegistration(string phase,System.Collections.IDictionary fields){try{AssertDncr();if(fields==null)throw DncrE("fields");if(phase=="bind"){if(dncrBound||fields.Count!=1||!(fields["windowTabId"] is string)||!System.Text.RegularExpressions.Regex.IsMatch((string)fields["windowTabId"],@"\\A[A-Za-z0-9_-]{1,128}\\z"))throw DncrE("once");dncrTab=(string)fields["windowTabId"];dncrBound=true;}else if(phase=="complete"){if(fields.Count!=0||!dncrBound||dncrComplete||dncrStep!=18||dncrHelpers!=4)throw DncrE("incomplete");dncrComplete=true;}else throw DncrE("control");}catch{dncrFailed=true;throw;}}
static string DncrScalar(string name,object raw){if(name!="windowTabId")return null;string value=raw as string;if(!System.Text.RegularExpressions.Regex.IsMatch(value??"", @"\\A[A-Za-z0-9_-]{1,128}\\z"))throw DncrE("tab");return JsonString(value);}
public static string NativeDeleteClockRegistrationMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"${prefix}","inverse_native_delete_clock_registration_",DncrRows,false,"program_",DncrScalar);}
public void SendNativeDeleteClockRegistration(int id,string phase,string role,string method,System.Collections.IDictionary fields){try{AssertDncr();if(!dncrBound||dncrComplete||fields==null||phase==null||!phase.StartsWith("${prefix}",StringComparison.Ordinal))throw DncrE("purpose");
string part=phase.Substring(${prefix.length}),key=part+(role==null?"":":"+role);int required=dncrStep>=18?4:dncrStep>=10?3:dncrStep>=6?2:dncrStep>=1?1:0;bool helper=part=="helper";if(helper){string expected=dncrStep==1?"initial":dncrStep==6?"callback":dncrStep==10?"bindings":dncrStep==18?"sample":null;if(expected==null||role!=expected||dncrHelpers+1!=required)throw DncrE("helper");dncrHelpers++;}else{if(dncrStep>=18||dncrHelpers!=required||key!=DncrOrder[dncrStep])throw DncrE("order");}
if(part=="initial"||part=="bindings"||part=="sample"){if(fields["projectUuid"] as string!=footprintInverseProject||fields["branchUuid"] as string!=footprintInverseBranch||fields["windowTabId"] as string!=dncrTab)throw DncrE("target");}
string text=NativeDeleteClockRegistrationMessage(id,footprintInverseUiSession,phase,role,method,fields);if(!helper)dncrStep++;SendMessage(id,text);}catch{dncrFailed=true;throw;}}
public static void VerifyNativeDeleteClockRegistrationSmoke(){var all=new System.Text.StringBuilder();int index=0;foreach(string[] row in DncrRows){if(row[0]=="program")continue;int split=row[0].IndexOf(':');string phase="${prefix}"+(split<0?row[0]:row[0].Substring(0,split)),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="windowTabId"?"original_tab":"original_ref");string text=NativeDeleteClockRegistrationMessage(79,"original_ui",phase,role,row[1],fields);all.Append(text);index++;}if(index!=22)throw DncrE("codec-roster");using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(all.ToString()))).Replace("-","").ToLowerInvariant()!=${quote(smokeSha256)})throw DncrE("codec-parity");}
}
`;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_DISPATCH = String.raw`        'footprint-inverse-native-delete-clock-registration' {
          if(-not $FootprintInverseNativeLifecycle209 -or -not $FootprintInverse209 -or -not $launched){throw 'inverse-native-delete-clock-registration-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($n in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $n){throw 'inverse-native-delete-clock-registration-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-delete-clock-registration-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;foreach($p in $request.PSObject.Properties){if($p.Name -ceq 'role'){$role=$p.Value;if($role -isnot [string]){throw 'inverse-native-delete-clock-registration-role'}}elseif($base -cnotcontains $p.Name){$fields.Add($p.Name,$p.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $null -ne $role){throw 'inverse-native-delete-clock-registration-control'};$owner.ControlNativeDeleteClockRegistration($request.phase,$fields)}else{$nativeRole=if($null -eq $role){[System.Management.Automation.Language.NullString]::Value}else{$role};$owner.SendNativeDeleteClockRegistration([int]$request.requestId,$request.phase,$nativeRole,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
