/** Distinct native serialization ledger in the same original inverse purpose. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_HELPERS as HELPERS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_PROGRAMS as PROGRAMS} from "./current-footprint-inverse-native-delete-serialization-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER as ORDER,currentFootprintInverseNativeDeleteSerializationCases as cases,currentFootprintInverseNativeDeleteSerializationKey as key,currentFootprintInverseNativeDeleteSerializationTemplate as template} from "./current-footprint-inverse-native-delete-serialization-protocol.ts";

const sha=(v:Uint8Array):string=>createHash("sha256").update(v).digest("hex");const quote=(v:string):string=>`@"${v.replaceAll('"','""')}"`;
const prefix="inverse-native-delete-serialization-";
export function currentFootprintInverseNativeDeleteSerializationNativeSource():string{
 const byKey=new Map(cases().map(c=>[key(c),c]));const commands=ORDER.map(k=>{const c=byKey.get(k);if(c===undefined){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER");}return c;});
 const marker="__native_serialization_helper_v1__";const helper=JSON.stringify(HELPERS).slice(1,-1);
 const rows=[["dictionary","","",helper],...Object.entries(PROGRAMS).map(([role,p])=>{if(p.includes(marker)||p.split(HELPERS).length!==(role==="retainReturn"?1:2)){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_HELPER");}return["program",role,"",JSON.stringify(p.replace(HELPERS,marker))];}),...commands.map(c=>{const r=template(c);return[r.key,r.method,r.names.join(","),r.template];})];
 const raw=Buffer.from(rows.map(row=>{if(row.some(v=>v.includes("\0")||v.includes("\t"))){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_TABLE");}return row.join("\t");}).join("\0"));
 if(raw.length>60_000||rows.length!==79){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_TABLE_BOUND");}
 // oxlint-disable-next-line node/no-sync -- Fixed bounded build data; every restored program and packet is compared independently.
 const packed=gzipSync(raw,{level:9});
 const smoke=sha(Buffer.from(commands.map(c=>`${JSON.stringify({id:79,method:c.method,params:c.params,sessionId:"original_session"})}\0`).join("")));
 return `public sealed partial class EasyedaDiagnosticOwner{
static Exception DsrE(string part){return Error("inverse-native-delete-serialization-"+part);}
static class DsrBook{internal static readonly string[][] Rows=Load();static string[][] Load(){string[][] a=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},79,4);string h=a[0][3];foreach(string[] r in a)if(r[0]=="program")r[3]=r[3].Replace("__native_serialization_helper_v1__",h);return a;}}
static readonly string[] DsrHolds={"headReady","setterEntry","setterReturned","stringReturned","callerReady","uploadEntry"};
static readonly string[] DsrResumes={"begin","headReady","setterEntry","setterReturned","stringReturned","callerReady"};
static string DsrOrder(int step){int i=0;foreach(string[] r in DsrBook.Rows)if(r[0]!="program"&&r[0]!="dictionary"){if(i++==step)return r[0].Replace(':','/');}throw DsrE("order-bound");}
bool dsrBound,dsrArmed,dsrComplete,dsrFailed;int dsrStep,dsrHeld,dsrResumed;string dsrPending;
readonly System.Collections.Generic.Dictionary<string,string> dsrPoints=new System.Collections.Generic.Dictionary<string,string>(StringComparer.Ordinal);
readonly System.Collections.Generic.HashSet<string> dsrRemoved=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
void AssertDsr(){AssertDnc();if(!dncComplete||dsrFailed)throw DsrE("original");}
public void ControlNativeDeleteTombstone(string phase,System.Collections.IDictionary fields){try{AssertDsr();if(fields==null||dsrComplete)throw DsrE("fields");
if(phase=="bind"){if(dsrBound||fields.Count!=0)throw DsrE("once");dsrBound=true;return;}if(!dsrBound)throw DsrE("unbound");
if(phase=="armed"){if(dsrArmed||dsrStep!=21||fields.Count!=6)throw DsrE("armed");foreach(string role in DsrHolds){string p=InverseDeleteBindingHandle(fields[role]);if(dsrPoints.ContainsValue(p)||dncPoints.ContainsValue(p))throw DsrE("point");dsrPoints.Add(role,p);}dsrArmed=true;return;}
if(phase=="resumed"){if(fields.Count!=1||dsrResumed>=6||fields["role"] as string!=DsrResumes[dsrResumed]||dsrPending!=DsrResumes[dsrResumed])throw DsrE("resumed");dsrPending=null;dsrResumed++;return;}
if(phase=="held"){if(fields.Count!=1||!dsrArmed||dsrHeld>=6||dsrPending!=null||dsrResumed!=dsrHeld+1||fields["role"] as string!=DsrHolds[dsrHeld])throw DsrE("held");dsrHeld++;return;}
if(phase!="complete"||fields.Count!=0||!dsrArmed||dsrStep!=69||dsrHeld!=6||dsrResumed!=6||dsrPending!=null||dsrRemoved.Count!=5)throw DsrE("incomplete");dsrComplete=true;
}catch{dsrFailed=true;throw;}}
static string DsrScalar(string name,object raw){if(name=="maximumTicket"||name=="documentClock"){if(!(raw is int)&&!(raw is long))throw DsrE("number");long n=Convert.ToInt64(raw,System.Globalization.CultureInfo.InvariantCulture);if(n<0||n>9007199254740989L||name=="documentClock"&&(n<1||n>8640000000000000L))throw DsrE("number-bound");return n.ToString(System.Globalization.CultureInfo.InvariantCulture);}
string v=raw as string;if(name=="client"||name=="targetUuid"){if(!System.Text.RegularExpressions.Regex.IsMatch(v??"",name=="client"?@"\\A[a-f0-9]{16}\\z":@"\\A(?:[a-f0-9]{16}|[a-f0-9]{32})\\z"))throw DsrE("domain");return JsonString(v);}
if(name=="head"||name=="deletion"||name=="body"){int bound=name=="head"?1024:name=="deletion"?256:1280;if(v==null||v.Length<1||v.Length>bound||v.IndexOf('\\0')>=0)throw DsrE("text");return JsonString(v);}return null;}
public static string NativeDeleteTombstoneMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"${prefix}","inverse_native_delete_serialization_",DsrBook.Rows,false,"program_",DsrScalar);}
public void SendNativeDeleteTombstone(int id,string phase,string role,string method,System.Collections.IDictionary fields){try{AssertDsr();if(!dsrBound||dsrComplete||fields==null||phase==null||!phase.StartsWith("${prefix}",StringComparison.Ordinal)||dsrStep>=69||dsrPending!=null)throw DsrE("state");string part=phase.Substring(${String(prefix.length)});if(part+"/"+role!=DsrOrder(dsrStep))throw DsrE("order");
if((part=="arm"||part=="original-point")&&fields["scriptId"] as string!=footprintInverseWorkerScript)throw DsrE("script");if(part=="call"&&role=="begin"&&(fields["projectUuid"] as string!=footprintInverseProject||fields["branchUuid"] as string!=footprintInverseBranch||fields["targetUuid"] as string!=footprintInverseDocument))throw DsrE("target");
if(part=="frame"&&role!="begin"&&(dsrHeld<1||role!=DsrHolds[dsrHeld-1]))throw DsrE("frame-held");
if(part=="remove"){string p=fields["breakpointId"] as string;if(p!=dsrPoints[role]||!dsrRemoved.Add(p))throw DsrE("remove");}
if(part=="resume"){if(!dsrArmed||dsrResumed>=6||role!=DsrResumes[dsrResumed])throw DsrE("resume");dsrPending=role;}
string text=NativeDeleteTombstoneMessage(id,footprintInversePageSession,phase,role,method,fields);dsrStep++;SendMessage(id,text);
}catch{dsrFailed=true;throw;}}
public static void VerifyNativeDeleteTombstoneSmoke(){var all=new System.Text.StringBuilder();int count=0;foreach(string[] r in DsrBook.Rows){if(r[0]=="program"||r[0]=="dictionary")continue;int colon=r[0].IndexOf(':');string part=r[0].Substring(0,colon),role=r[0].Substring(colon+1);var f=new System.Collections.Hashtable();foreach(string n in r[2].Length==0?new string[0]:r[2].Split(',')){object v=n=="projectUuid"?new string('a',64):n=="branchUuid"?new string('b',32):n=="targetUuid"?new string('c',16):n=="client"?new string('d',16):n=="head"?"head":n=="deletion"?"delete":n=="body"?"head|\\ndelete":"original_ref";if(n=="maximumTicket")v=7;if(n=="documentClock")v=9;f.Add(n,v);}all.Append(NativeDeleteTombstoneMessage(79,"original_session","${prefix}"+part,role,r[1],f));count++;}if(count!=69)throw DsrE("smoke-count");using(var h=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(h.ComputeHash(System.Text.Encoding.UTF8.GetBytes(all.ToString()))).Replace("-","").ToLowerInvariant()!=${quote(smoke)})throw DsrE("smoke-parity");}
}
`;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_DISPATCH=String.raw`        'footprint-inverse-native-delete-serialization' {
 if(-not $FootprintInverseNativeLifecycle209 -or -not $FootprintInverse209 -or -not $launched){throw 'inverse-native-delete-serialization-purpose'}
 $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($n in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $n){throw 'inverse-native-delete-serialization-field'}}
 if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-delete-serialization-type'}
 $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;foreach($p in $request.PSObject.Properties){if($p.Name -ceq 'role'){$role=$p.Value;if($role -isnot [string]){throw 'inverse-native-delete-serialization-role'}}elseif($base -cnotcontains $p.Name){$fields.Add($p.Name,$p.Value)}}
 if($request.method -ceq 'control'){if($request.requestId -ne 0){throw 'inverse-native-delete-serialization-control'};if($request.phase -ceq 'resumed' -or $request.phase -ceq 'held'){if($null -eq $role){throw 'inverse-native-delete-serialization-control'};$fields.Add('role',$role)}elseif($null -ne $role){throw 'inverse-native-delete-serialization-control'};$owner.ControlNativeDeleteTombstone($request.phase,$fields)}else{$owner.SendNativeDeleteTombstone([int]$request.requestId,$request.phase,$role,$request.method,$fields)}
 $result=@{written=$true}
        }
`;
