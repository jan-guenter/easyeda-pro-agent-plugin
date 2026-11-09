/** Fixed native-task dependency codec and independent readonly ledger.
 * The original RPC stays held; body, worker Job and DEL remain unissued. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_PROGRAMS as P } from "./current-footprint-inverse-native-get-task-dependencies-programs.ts";
import { currentFootprintInverseNativeGetTaskDependenciesCases as cases, currentFootprintInverseNativeGetTaskDependenciesTemplate as template } from "./current-footprint-inverse-native-get-task-dependencies-protocol.ts";

const order: string[] = ["call:module", "helper"];
for (let index = 0; index < 14; index += 1) { order.push("properties"); }
order.push("call:handler", "helper", "properties", "properties", "properties", "properties", "call:body", "helper", "properties", "properties", "properties", "properties", "call:manager", "helper");
for (let index = 0; index < 5; index += 1) { order.push("properties"); }
order.push("call:before", "helper", "frame", "helper", "properties", "call:join", "helper");
if (order.length !== 42) { throw new Error("INVERSE_NATIVE_GET_TASK_DEPENDENCIES_ORDER"); } Object.freeze(order);
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Pack fixed programs and all command cases under the existing bounded table
 * decoder. Each native result has its own exact source-derived hash. */
export function currentFootprintInverseNativeGetTaskDependenciesNativeSource(): string { const commands = cases(), rows = [...Object.entries(P).map(([role, program]) => ["program", role, "", JSON.stringify(program)]), ...commands.map(command => { const row = template(command); return [row.key, row.method, row.names.join(","), row.template]; })]; const groups: string[][][] = []; let group: string[][] = [], size = 0; for (const row of rows) { if (row.some(field => field.includes("\0") || field.includes("\t"))) { throw new Error("INVERSE_NATIVE_GET_TASK_DEPENDENCIES_CODEC_FIELD"); } const length = Buffer.byteLength(row.join("\t")); if (length > 60_000) { throw new Error("INVERSE_NATIVE_GET_TASK_DEPENDENCIES_CODEC_ROW"); } if (size + Number(group.length > 0) + length > 60_000) { groups.push(group); group = []; size = 0; } size += Number(group.length > 0) + length; group.push(row); } if (group.length > 0) { groups.push(group); } if (groups.length > 4) { throw new Error("INVERSE_NATIVE_GET_TASK_DEPENDENCIES_CODEC_TABLE"); }
  const tables = groups.map((part, index) => { const raw = Buffer.from(part.map(row => row.join("\t")).join("\0"));
    // oxlint-disable-next-line node/no-sync -- Only immutable build-time source data reaches this bounded table compressor.
    const packed = gzipSync(raw, { level: 9 }); return `static readonly string[][] InverseNativeGetTaskDependenciesRows${String(index)}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},${String(part.length)},4);`; }).join("\n"); const all = `InverseFixedRows(new string[][][]{${groups.map((_part, index) => `InverseNativeGetTaskDependenciesRows${String(index)}`).join(",")}})`; const hashes = commands.map(c => sha(Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original_ui" })}\0`)));
  return `public sealed partial class EasyedaDiagnosticOwner{
${tables}

bool nativeGetTaskDependenciesBound,nativeGetTaskDependenciesComplete,nativeGetTaskDependenciesFailed;int nativeGetTaskDependencyStep;
static readonly string[] NativeGetTaskDependencyOrder={${order.map(value=>quote(value)).join(",")}};
void AssertNativeGetTaskDependencies(){AssertNativeGetTaskOriginal();if(!nativeGetTaskHeld||!nativeGetTaskIntrinsicsComplete||nativeGetTaskIntrinsicsFailed||nativeGetTaskDependenciesFailed||inverseGetIntrinsicsBound)throw Error("inverse-native-get-task-dependencies-original");}
public void ControlFootprintInverseNativeGetTaskDependencies(string phase,System.Collections.IDictionary fields){try{AssertNativeGetTaskDependencies();if(fields==null||fields.Count!=0)throw Error("inverse-native-get-task-dependencies-fields");if(phase=="bind"){if(nativeGetTaskDependenciesBound)throw Error("inverse-native-get-task-dependencies-once");nativeGetTaskDependenciesBound=true;}else if(phase=="complete"){if(!nativeGetTaskDependenciesBound||nativeGetTaskDependenciesComplete||nativeGetTaskDependencyStep!=42)throw Error("inverse-native-get-task-dependencies-incomplete");nativeGetTaskDependenciesComplete=true;}else throw Error("inverse-native-get-task-dependencies-control");}catch{nativeGetTaskDependenciesFailed=true;throw;}}
public void SendFootprintInverseNativeGetTaskDependencies(int id,string phase,string role,string method,System.Collections.IDictionary fields){try{AssertNativeGetTaskDependencies();if(id<1||id>RequestLimit||fields==null||!nativeGetTaskDependenciesBound||nativeGetTaskDependenciesComplete||nativeGetTaskDependencyStep>=42||phase+(role==null?"":":"+role)!="inverse-native-get-task-dependencies-"+NativeGetTaskDependencyOrder[nativeGetTaskDependencyStep])throw Error("inverse-native-get-task-dependencies-state");nativeGetTaskDependencyStep++;SendMessage(id,FootprintInverseNativeGetTaskDependenciesMessage(id,footprintInverseUiSession,phase,role,method,fields));}catch{nativeGetTaskDependenciesFailed=true;throw;}}
public static void VerifyFootprintInverseNativeGetTaskDependenciesSmoke(){VerifyFootprintInverseNativeGetTaskDependenciesCodec();var owner=CreateFootprintInverse209();bool refused=false;try{owner.ControlFootprintInverseNativeGetTaskDependencies("bind",new System.Collections.Hashtable());}catch(System.InvalidOperationException){refused=true;}if(!refused)throw Error("inverse-native-get-task-dependencies-unissued");owner.originalMain.Release();}
public static string FootprintInverseNativeGetTaskDependenciesMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"inverse-native-get-task-dependencies-","native_get_task_dependencies_",${all});}
public static void VerifyFootprintInverseNativeGetTaskDependenciesCodec(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in ${all}){if(row[0]=="program")continue;int split=row[0].IndexOf(':');string phase="inverse-native-get-task-dependencies-"+(split<0?row[0]:row[0].Substring(0,split)),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="documentUuid"?new string('c',16):"original_ref");string text=FootprintInverseNativeGetTaskDependenciesMessage(79,"original_ui",phase,role,row[1],fields);using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=hashes[index])throw Error("inverse-native-get-task-dependencies-codec-parity");index++;}if(index!=${String(commands.length)})throw Error("inverse-native-get-task-dependencies-codec-roster");}
}`;
}

/** Decode only this fixed action; original owner/Job routing remains in the
 * existing authenticated helper envelope before this branch is reached. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_DISPATCH = String.raw`        'footprint-inverse-native-get-task-dependencies' {
          if(-not $FootprintInverse209 -or -not $launched){throw 'inverse-native-get-task-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-native-get-task-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-get-task-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;foreach($property in $request.PSObject.Properties){if($property.Name -ceq 'role'){$role=$property.Value;if($role -isnot [string]){throw 'inverse-native-get-task-role'}}elseif($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $null -ne $role){throw 'inverse-native-get-task-control'};$owner.ControlFootprintInverseNativeGetTaskDependencies($request.phase,$fields)}else{$owner.SendFootprintInverseNativeGetTaskDependencies([int]$request.requestId,$request.phase,$role,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
