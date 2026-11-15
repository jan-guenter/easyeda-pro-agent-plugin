/** One natural native DEL clock ledger. Old GET/public ledgers are never
 * consulted for authority. Data tables restore exact fixed renderer bytes. */
import { createHash } from "node:crypto";
import { currentFootprintInverseNativeClockBookNativeSource } from "./current-footprint-inverse-native-clock-book-storage.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_ORDER as ORDER, currentFootprintInverseNativeDeleteClockCases as cases, currentFootprintInverseNativeDeleteClockCondition as condition,
  currentFootprintInverseNativeDeleteClockKey as key } from "./current-footprint-inverse-native-delete-clock-protocol.ts";

const quote = (value: string): string => `@"${  value.replaceAll('"', '""')  }"`;
const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
const prefix = "inverse-native-delete-clock-";
export function currentFootprintInverseNativeDeleteClockNativeSource(): string {
  const byKey = new Map(cases().map(command => [key(command), command]));
  const commands = ORDER.map(name => { const command = byKey.get(name); if (command === undefined) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_CODEC_ROSTER"); } return command; });
  const smokeSha256 = sha(Buffer.from(commands.map(command => `${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_session" })  }\0`).join("")));
  const conditionRows = (["push", "dispatch", "result", "reply"] as const).map(role => {
    const sample = "11111111-2222-3333-4444-555555555555"; const parts = condition(role, sample).split(sample);
    if (parts.length !== (role === "reply" ? 3 : 2) || parts.some(part => part.length === 0)) { throw new Error("INVERSE_NATIVE_DELETE_CLOCK_CONDITION_PARTS"); }
    return `if(name=="condition_${  role  }")return JsonString(${  parts.map(part => quote(part)).join("+value+")  });`;
  }).join("");
  return `${currentFootprintInverseNativeClockBookNativeSource()}public sealed partial class EasyedaDiagnosticOwner{
static System.Exception DncE(string part){return Error("inverse-native-delete-clock-"+part);}
static System.Collections.Generic.IEnumerable<string[]> DncRows(){return NativeClockRows("c");}
static readonly string[] DncOrder=DncOrderValues();
static string[] DncOrderValues(){var order=new System.Collections.Generic.List<string>();foreach(string[] row in DncRows())if(row[0]!="program")order.Add(row[0].Replace(':','/'));if(order.Count!=90)throw DncE("codebook-order");return order.ToArray();}
static readonly string[] DncHolds={"push","qeReturned","dispatch","result","reply","producer"};
static readonly string[] DncResumes={"initial-ui","initial-worker","push","qeReturned","dispatch","result","reply"};
bool dncBound,dncArmed,dncComplete,dncFailed;int dncStep,dncHeld,dncResumed;string dncPendingResume,dncUiScript;
readonly System.Collections.Generic.Dictionary<string,string> dncPoints=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);
readonly System.Collections.Generic.HashSet<string> dncRemoved=new System.Collections.Generic.HashSet<string>(System.StringComparer.Ordinal);
void AssertDnc(){AssertDncr();if(!dncrComplete||!daeComplete||!dpfComplete||dncFailed||footprintInversePublicCallAttempted||footprintInversePublicCallBound)throw DncE("original");}
public void ControlNativeDeleteClock(string phase,System.Collections.IDictionary fields){try{AssertDnc();if(fields==null||dncComplete)throw DncE("fields");
if(phase=="bind"){if(dncBound||fields.Count!=1)throw DncE("once");dncUiScript=InverseDeleteBindingHandle(fields["uiScript"]);dncBound=true;return;}
if(!dncBound)throw DncE("unbound");
if(phase=="armed"){if(dncArmed||dncStep!=24||fields.Count!=6)throw DncE("arm");foreach(string role in DncHolds){string point=InverseDeleteBindingHandle(fields[role]);if(dncPoints.ContainsValue(point)||point==daePoint||dpfPoints.ContainsValue(point))throw DncE("point");dncPoints.Add(role,point);}dncArmed=true;return;}
if(phase=="resumed"){if(fields.Count!=1||dncResumed>=7||fields["role"] as string!=DncResumes[dncResumed]||dncPendingResume!=DncResumes[dncResumed])throw DncE("resumed");dncPendingResume=null;dncResumed++;return;}
if(phase=="held"){if(fields.Count!=1||!dncArmed||dncHeld>=6||dncPendingResume!=null||dncResumed!=dncHeld+2||fields["role"] as string!=DncHolds[dncHeld])throw DncE("held");dncHeld++;return;}
if(phase!="complete"||fields.Count!=0||!dncArmed||dncStep!=90||dncHeld!=6||dncResumed!=7||dncPendingResume!=null||dncRemoved.Count!=9)throw DncE("incomplete");dncComplete=true;
}catch{dncFailed=true;throw;}}
static string DncScalar(string name,object raw){if(name=="maximumTicket"||name=="requestIdValue"||name=="updateTime"){if(!(raw is int)&&!(raw is long))throw DncE("number");long n=Convert.ToInt64(raw,System.Globalization.CultureInfo.InvariantCulture);if(n<0||n>9007199254740989L||name=="updateTime"&&(n<1||n>8640000000000000L))throw DncE("number-bound");return n.ToString(System.Globalization.CultureInfo.InvariantCulture);}
string value=raw as string;if(name=="client"){if(!System.Text.RegularExpressions.Regex.IsMatch(value??"", @"\\A[a-f0-9]{16}\\z"))throw DncE("client");return JsonString(value);}
if(name=="replyTopic"){if(!System.Text.RegularExpressions.Regex.IsMatch(value??"", @"\\A_MSG_BUS_RPC_-/pro-mgr/serverTime/now-[a-f0-9-]{36}-[0-9]+\\z"))throw DncE("topic");return JsonString(value);}
if(name=="workerUuid"||name=="uiUuid"||name.StartsWith("condition_",StringComparison.Ordinal)){if(!System.Text.RegularExpressions.Regex.IsMatch(value??"", @"\\A[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\\z"))throw DncE("uuid");${conditionRows}return JsonString(value);}return null;}
public static string NativeDeleteClockMessage(int id,string session,string realm,string phase,string role,string method,System.Collections.IDictionary fields){if(realm!="worker"&&realm!="ui"||phase==null||!phase.StartsWith("${prefix}",StringComparison.Ordinal))throw DncE("realm");return InverseFixedMessage(id,session,"${prefix}"+realm+"/"+phase.Substring(${prefix.length}),role,method,fields,"${prefix}","inverse_native_delete_clock_",DncRows(),false,"program_",DncScalar);}
public void SendNativeDeleteClock(int id,string realm,string phase,string role,string method,System.Collections.IDictionary fields){try{AssertDnc();if(!dncBound||dncComplete||fields==null||phase==null||!phase.StartsWith("${prefix}",StringComparison.Ordinal)||dncStep>=90||dncPendingResume!=null)throw DncE("state");
string part=phase.Substring(${prefix.length}),key=realm+"/"+part+(role==null?"":"/"+role);if(key!=DncOrder[dncStep])throw DncE("order");
if(part=="arm"&&fields["scriptId"] as string!=(realm=="worker"?footprintInverseWorkerScript:dncUiScript))throw DncE("script");
if(part=="call"&&role=="entry"&&(fields["projectUuid"] as string!=footprintInverseProject||fields["branchUuid"] as string!=footprintInverseBranch||fields["documentUuid"] as string!=footprintInverseDocument))throw DncE("target");
if((part=="frame"&&role!="entry"&&role!="caller"||part=="condition")&&(dncHeld<1||role!=DncHolds[dncHeld-1]))throw DncE("frame-held");
if(part=="remove"){string point=fields["breakpointId"] as string,expected=role=="entry"?daePoint:role=="onMessage"||role=="postReturned"?dpfPoints[role]:dncPoints[role];if(point!=expected||!dncRemoved.Add(point))throw DncE("remove");}
if(part=="resume"){if(!dncArmed||dncResumed>=7||role!=DncResumes[dncResumed])throw DncE("resume");dncPendingResume=role;}
string text=NativeDeleteClockMessage(id,realm=="worker"?footprintInversePageSession:footprintInverseUiSession,realm,phase,role,method,fields);dncStep++;SendMessage(id,text);
}catch{dncFailed=true;throw;}}
public static void VerifyNativeDeleteClockSmoke(){var all=new System.Text.StringBuilder();int index=0;foreach(string[] row in DncRows()){if(row[0]=="program")continue;int slash=row[0].IndexOf('/'),colon=row[0].IndexOf(':');string realm=row[0].Substring(0,slash),part=colon<0?row[0].Substring(slash+1):row[0].Substring(slash+1,colon-slash-1),role=colon<0?null:row[0].Substring(colon+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(',')){object value=name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="documentUuid"?new string('c',16):name=="client"?new string('d',16):name=="workerUuid"||name=="uiUuid"||name.StartsWith("condition_",StringComparison.Ordinal)?"11111111-2222-3333-4444-555555555555":name=="replyTopic"?"_MSG_BUS_RPC_-/pro-mgr/serverTime/now-11111111-2222-3333-4444-555555555555-7":"original_ref";if(name=="maximumTicket"||name=="requestIdValue"||name=="updateTime")value=7;fields.Add(name,value);}string text=NativeDeleteClockMessage(79,"original_session",realm,"${prefix}"+part,role,row[1],fields);all.Append(text);index++;}if(index!=90)throw DncE("codec-roster");using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(all.ToString()))).Replace("-","").ToLowerInvariant()!=${quote(smokeSha256)})throw DncE("codec-parity");}
}
`;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_DISPATCH = String.raw`        'footprint-inverse-native-delete-clock' {
          if(-not $FootprintInverseNativeLifecycle209 -or -not $FootprintInverse209 -or -not $launched){throw 'inverse-native-delete-clock-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($n in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $n){throw 'inverse-native-delete-clock-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-delete-clock-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;$realm=$null;foreach($p in $request.PSObject.Properties){if($p.Name -ceq 'role'){$role=$p.Value;if($role -isnot [string]){throw 'inverse-native-delete-clock-role'}}elseif($p.Name -ceq 'realm'){$realm=$p.Value;if($realm -isnot [string]){throw 'inverse-native-delete-clock-realm'}}elseif($base -cnotcontains $p.Name){$fields.Add($p.Name,$p.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $null -ne $role -or $null -ne $realm){throw 'inverse-native-delete-clock-control'};$owner.ControlNativeDeleteClock($request.phase,$fields)}else{$nativeRole=if($null -eq $role){[System.Management.Automation.Language.NullString]::Value}else{$role};$owner.SendNativeDeleteClock([int]$request.requestId,$realm,$request.phase,$nativeRole,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
