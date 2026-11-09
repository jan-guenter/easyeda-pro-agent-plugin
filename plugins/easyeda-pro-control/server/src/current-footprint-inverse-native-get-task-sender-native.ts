/** Fixed native-task GET sender codec and independent once ledger. It holds
 * the original RPC entry; body, worker Job and DEL remain unissued. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_PROGRAMS as P } from "./current-footprint-inverse-native-get-task-sender-programs.ts";
import { currentFootprintInverseNativeGetTaskSenderCases as cases, currentFootprintInverseNativeGetTaskSenderTemplate as template } from "./current-footprint-inverse-native-get-task-sender-protocol.ts";

const prep = [["roots", 3], ["context", 3], ["bus", 5], ["methods", 10], ["queue", 2], ["task", 2], ["members", 3], ["taskMethods", 5], ["prepare", 6], ["before", 0]] as const;
const order: string[] = ["source:ui", "source:manager"];
for (const [role, properties] of prep) { order.push(`call:${role}`, "helper"); for (let index = 0; index < properties; index += 1) { order.push("properties"); } }
order.push("arm", "invoke", "helper", "helper", "frame", "helper");
for (let index = 0; index < 15; index += 1) { order.push("properties"); }
order.push("call:entry", "helper"); Object.freeze(order);
if (order.length !== 84 || order[61] !== "arm") { throw new Error("INVERSE_NATIVE_GET_TASK_ORDER"); }
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Pack fixed programs and all command cases under the existing bounded table
 * decoder. Each native result has its own exact source-derived hash. */
export function currentFootprintInverseNativeGetTaskSenderNativeSource(): string { const commands = cases(), rows = [...Object.entries(P).map(([role, program]) => ["program", role, "", JSON.stringify(program)]), ...commands.map(command => { const row = template(command); return [row.key, row.method, row.names.join(","), row.template]; })]; const groups: string[][][] = []; let group: string[][] = [], size = 0; for (const row of rows) { if (row.some(field => field.includes("\0") || field.includes("\t"))) { throw new Error("INVERSE_NATIVE_GET_TASK_SENDER_CODEC_FIELD"); } const length = Buffer.byteLength(row.join("\t")); if (length > 60_000) { throw new Error("INVERSE_NATIVE_GET_TASK_SENDER_CODEC_ROW"); } if (size + Number(group.length > 0) + length > 60_000) { groups.push(group); group = []; size = 0; } size += Number(group.length > 0) + length; group.push(row); } if (group.length > 0) { groups.push(group); } if (groups.length > 4) { throw new Error("INVERSE_NATIVE_GET_TASK_SENDER_CODEC_TABLE"); }
  const tables = groups.map((part, index) => { const raw = Buffer.from(part.map(row => row.join("\t")).join("\0"));
    // oxlint-disable-next-line node/no-sync -- Only immutable build-time source data reaches this bounded table compressor.
    const packed = gzipSync(raw, { level: 9 }); return `static readonly string[][] InverseNativeGetTaskSenderRows${String(index)}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},${String(part.length)},4);`; }).join("\n"); const all = `InverseFixedRows(new string[][][]{${groups.map((_part, index) => `InverseNativeGetTaskSenderRows${String(index)}`).join(",")}})`; const hashes = commands.map(c => sha(Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original_ui" })}\0`)));
  return `public sealed partial class EasyedaDiagnosticOwner{
${tables}

bool nativeGetTaskBound,nativeGetTaskPrepared,nativeGetTaskHeld,nativeGetTaskFailed;int nativeGetTaskStep;
static readonly string[] NativeGetTaskOrder={${order.map(value=>quote(value)).join(",")}};
void AssertNativeGetTaskOriginal(){AssertInverseNativeQualification();if(!nqsComplete||!nqrComplete||!nativeGetWorkerCompleted||nativeGetWorkerFailed||inverseGetWorkerBound||footprintInverseDeleteAdmissionConsumed||nativeGetLookupBound||nativeGetTaskFailed)throw Error("inverse-native-get-task-original");}
public void ControlFootprintInverseNativeGetTaskSender(string phase,System.Collections.IDictionary fields){try{AssertNativeGetTaskOriginal();if(fields==null||fields.Count!=0)throw Error("inverse-native-get-task-fields");if(phase=="bind"){if(nativeGetTaskBound)throw Error("inverse-native-get-task-once");nativeGetTaskBound=true;}else if(phase=="prepared"){if(!nativeGetTaskBound||nativeGetTaskPrepared||nativeGetTaskStep!=61)throw Error("inverse-native-get-task-preparation");nativeGetTaskPrepared=true;}else if(phase=="held"){if(!nativeGetTaskPrepared||nativeGetTaskHeld||nativeGetTaskStep!=84)throw Error("inverse-native-get-task-entry");nativeGetTaskHeld=true;}else throw Error("inverse-native-get-task-control");}catch{nativeGetTaskFailed=true;throw;}}
public void SendFootprintInverseNativeGetTaskSender(int id,string phase,string role,string method,System.Collections.IDictionary fields){try{AssertNativeGetTaskOriginal();if(id<1||id>RequestLimit||fields==null||!nativeGetTaskBound||nativeGetTaskHeld||nativeGetTaskStep>=NativeGetTaskOrder.Length||nativeGetTaskStep>=61&&!nativeGetTaskPrepared)throw Error("inverse-native-get-task-state");if(fields.Contains("projectUuid")&&fields["projectUuid"] as string!=footprintInverseProject||fields.Contains("branchUuid")&&fields["branchUuid"] as string!=footprintInverseBranch||fields.Contains("documentUuid")&&fields["documentUuid"] as string!=footprintInverseDocument)throw Error("inverse-native-get-task-target");string key=phase+ (role==null?"":":"+role);if(key!="inverse-native-get-task-sender-"+NativeGetTaskOrder[nativeGetTaskStep])throw Error("inverse-native-get-task-order");if(nativeGetTaskStep<2&&fields["scriptId"] as string!=(nativeGetTaskStep==0?nqsUi:nqsManager))throw Error("inverse-native-get-task-source");nativeGetTaskStep++;SendMessage(id,FootprintInverseNativeGetTaskSenderMessage(id,footprintInverseUiSession,phase,role,method,fields));}catch{nativeGetTaskFailed=true;throw;}}
public static void VerifyFootprintInverseNativeGetTaskSenderSmoke(){VerifyFootprintInverseNativeGetTaskSenderCodec();var owner=CreateFootprintInverse209();bool refused=false;try{owner.ControlFootprintInverseNativeGetTaskSender("bind",new System.Collections.Hashtable());}catch(System.InvalidOperationException){refused=true;}if(!refused)throw Error("inverse-native-get-task-unissued");owner.originalMain.Release();}

public static string FootprintInverseNativeGetTaskSenderMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"inverse-native-get-task-sender-","native_get_task_sender_",${all});}
public static void VerifyFootprintInverseNativeGetTaskSenderCodec(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in ${all}){if(row[0]=="program")continue;int split=row[0].IndexOf(':');string phase="inverse-native-get-task-sender-"+(split<0?row[0]:row[0].Substring(0,split)),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="documentUuid"?new string('c',16):"original_ref");string text=FootprintInverseNativeGetTaskSenderMessage(79,"original_ui",phase,role,row[1],fields);using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=hashes[index])throw Error("inverse-native-get-task-sender-codec-parity");index++;}if(index!=${String(commands.length)})throw Error("inverse-native-get-task-sender-codec-roster");}
}`;
}

/** Decode only this fixed action; original owner/Job routing remains in the
 * existing authenticated helper envelope before this branch is reached. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_DISPATCH = String.raw`        'footprint-inverse-native-get-task-sender' {
          if(-not $FootprintInverse209 -or -not $launched){throw 'inverse-native-get-task-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-native-get-task-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-get-task-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;foreach($property in $request.PSObject.Properties){if($property.Name -ceq 'role'){$role=$property.Value;if($role -isnot [string]){throw 'inverse-native-get-task-role'}}elseif($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $null -ne $role){throw 'inverse-native-get-task-control'};$owner.ControlFootprintInverseNativeGetTaskSender($request.phase,$fields)}else{$owner.SendFootprintInverseNativeGetTaskSender([int]$request.requestId,$request.phase,$role,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
