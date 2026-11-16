/** Fixed native-task GET sender codec and independent once ledger. It holds
 * the original RPC entry; body, worker Job and DEL remain unissued. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_SENDER_PROGRAMS as P } from "./current-footprint-inverse-native-reference-pcb-sender-programs.ts";
import { currentFootprintInverseNativeReferencePcbSenderCases as cases, currentFootprintInverseNativeReferencePcbSenderTemplate as template } from "./current-footprint-inverse-native-reference-pcb-sender-protocol.ts";

const prep = [["roots", 3], ["context", 3], ["bus", 5], ["methods", 10], ["queue", 2], ["task", 2], ["members", 3], ["taskMethods", 5], ["prepare", 6], ["before", 0]] as const;
const order: string[] = ["source:ui", "source:manager"];
for (const [role, properties] of prep) { order.push(`call:${role}`, "helper"); for (let index = 0; index < properties; index += 1) { order.push("properties"); } }
order.push("arm", "invoke", "helper", "helper", "frame", "helper");
for (let index = 0; index < 15; index += 1) { order.push("properties"); }
order.push("call:entry", "helper"); Object.freeze(order);
if (order.length !== 84 || order[61] !== "arm") { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_ORDER"); }
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Pack fixed programs and all command cases under the existing bounded table
 * decoder. Each native result has its own exact source-derived hash. */
export function currentFootprintInverseNativeReferencePcbSenderNativeSource(): string { const commands = cases(), rows = [...Object.entries(P).map(([role, program]) => ["program", role, "", JSON.stringify(program)]), ...commands.map(command => { const row = template(command); return [row.key, row.method, row.names.join(","), row.template]; })]; const groups: string[][][] = []; let group: string[][] = [], size = 0; for (const row of rows) { if (row.some(field => field.includes("\0") || field.includes("\t"))) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_SENDER_CODEC_FIELD"); } const length = Buffer.byteLength(row.join("\t")); if (length > 60_000) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_SENDER_CODEC_ROW"); } if (size + Number(group.length > 0) + length > 60_000) { groups.push(group); group = []; size = 0; } size += Number(group.length > 0) + length; group.push(row); } if (group.length > 0) { groups.push(group); } if (groups.length > 4) { throw new Error("INVERSE_NATIVE_REFERENCE_PCB_SENDER_CODEC_TABLE"); }
  const tables = groups.map((part, index) => { const raw = Buffer.from(part.map(row => row.join("\t")).join("\0"));
    // oxlint-disable-next-line node/no-sync -- Only immutable build-time source data reaches this bounded table compressor.
    const packed = gzipSync(raw, { level: 9 }); return `static readonly string[][] InverseNativeReferencePcbSenderRows${String(index)}=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},${String(part.length)},4);`; }).join("\n"); const all = `InverseFixedRows(new string[][][]{${groups.map((_part, index) => `InverseNativeReferencePcbSenderRows${String(index)}`).join(",")}})`; const hashes = commands.map(c => sha(Buffer.from(`${JSON.stringify({ id: 79, method: c.method, params: c.params, sessionId: "original_ui" })}\0`)));
  return `public sealed partial class EasyedaDiagnosticOwner{
${tables}

bool nativeReferencePcbBound,nativeReferencePcbPrepared,nativeReferencePcbHeld,nativeReferencePcbFailed;int nativeReferencePcbStep;
static readonly string[] NativeReferencePcbOrder={${order.map(value=>quote(value)).join(",")}};
void AssertNativeReferencePcbOriginal(){if(!footprintInverse209||footprintInverseAborted||!ntrComplete||ntrFailed||nativeReferencePcbFailed||footprintInverseDeleteAdmissionConsumed)throw Error("inverse-native-reference-pcb-original");AssertLive();}
public void ControlFootprintInverseNativeReferencePcbSender(string phase,System.Collections.IDictionary fields){try{AssertNativeReferencePcbOriginal();if(fields==null||fields.Count!=0)throw Error("inverse-native-reference-pcb-fields");if(phase=="bind"){if(nativeReferencePcbBound)throw Error("inverse-native-reference-pcb-once");nativeReferencePcbBound=true;}else if(phase=="prepared"){if(!nativeReferencePcbBound||nativeReferencePcbPrepared||nativeReferencePcbStep!=61)throw Error("inverse-native-reference-pcb-preparation");nativeReferencePcbPrepared=true;}else if(phase=="held"){if(!nativeReferencePcbPrepared||nativeReferencePcbHeld||nativeReferencePcbStep!=84)throw Error("inverse-native-reference-pcb-entry");nativeReferencePcbHeld=true;}else throw Error("inverse-native-reference-pcb-control");}catch{nativeReferencePcbFailed=true;throw;}}
public void SendFootprintInverseNativeReferencePcbSender(int id,string phase,string role,string method,System.Collections.IDictionary fields){try{AssertNativeReferencePcbOriginal();if(id<1||id>RequestLimit||fields==null||!nativeReferencePcbBound||nativeReferencePcbHeld||nativeReferencePcbStep>=NativeReferencePcbOrder.Length||nativeReferencePcbStep>=61&&!nativeReferencePcbPrepared)throw Error("inverse-native-reference-pcb-state");if(fields.Contains("projectUuid")&&fields["projectUuid"] as string!=footprintInverseProject||fields.Contains("branchUuid")&&fields["branchUuid"] as string!=footprintInverseBranch||fields.Contains("documentUuid")&&fields["documentUuid"] as string!=footprintInverseDocument)throw Error("inverse-native-reference-pcb-target");string key=phase+ (role==null?"":":"+role);if(key!="inverse-native-reference-pcb-sender-"+NativeReferencePcbOrder[nativeReferencePcbStep])throw Error("inverse-native-reference-pcb-order");if(nativeReferencePcbStep<2&&fields["scriptId"] as string!=(nativeReferencePcbStep==0?nqsUi:nqsManager))throw Error("inverse-native-reference-pcb-source");nativeReferencePcbStep++;SendMessage(id,FootprintInverseNativeReferencePcbSenderMessage(id,footprintInverseUiSession,phase,role,method,fields));}catch{nativeReferencePcbFailed=true;throw;}}
public static void VerifyFootprintInverseNativeReferencePcbSenderSmoke(){VerifyFootprintInverseNativeReferencePcbSenderCodec();var owner=CreateFootprintInverse209();bool refused=false;try{owner.ControlFootprintInverseNativeReferencePcbSender("bind",new System.Collections.Hashtable());}catch(System.InvalidOperationException){refused=true;}if(!refused)throw Error("inverse-native-reference-pcb-unissued");owner.originalMain.Release();}

public static string FootprintInverseNativeReferencePcbSenderMessage(int id,string session,string phase,string role,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,phase,role,method,fields,"inverse-native-reference-pcb-sender-","native_reference_pcb_sender_",${all});}
public static void VerifyFootprintInverseNativeReferencePcbSenderCodec(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(string[] row in ${all}){if(row[0]=="program")continue;int split=row[0].IndexOf(':');string phase="inverse-native-reference-pcb-sender-"+(split<0?row[0]:row[0].Substring(0,split)),role=split<0?null:row[0].Substring(split+1);var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="documentUuid"?new string('c',16):"original_ref");string text=FootprintInverseNativeReferencePcbSenderMessage(79,"original_ui",phase,role,row[1],fields);using(var hash=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=hashes[index])throw Error("inverse-native-reference-pcb-sender-codec-parity");index++;}if(index!=${String(commands.length)})throw Error("inverse-native-reference-pcb-sender-codec-roster");}
}`;
}

/** Decode only this fixed action; original owner/Job routing remains in the
 * existing authenticated helper envelope before this branch is reached. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_PCB_SENDER_DISPATCH = String.raw`        'footprint-inverse-native-reference-pcb-sender' {
          if(-not $FootprintInverse209 -or -not $launched){throw 'inverse-native-reference-pcb-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($name in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $name){throw 'inverse-native-reference-pcb-field'}}
          if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-reference-pcb-type'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$role=$null;foreach($property in $request.PSObject.Properties){if($property.Name -ceq 'role'){$role=$property.Value;if($role -isnot [string]){throw 'inverse-native-reference-pcb-role'}}elseif($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $null -ne $role){throw 'inverse-native-reference-pcb-control'};$owner.ControlFootprintInverseNativeReferencePcbSender($request.phase,$fields)}else{$owner.SendFootprintInverseNativeReferencePcbSender([int]$request.requestId,$request.phase,$role,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
