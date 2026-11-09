/** Readonly original yB result only. The fixed thirteen-stage native grammar
 * neither admits SQL mutation nor accepts a caller row, target or timestamp. */
import { CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS as PRODUCER } from "./current-footprint-inverse-producer-protocol.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentFootprintInverseMainHistoryTemplates } from "./current-footprint-inverse-main-history-wire.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_REQUESTS as LIMITS } from "./current-footprint-inverse-main-history-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "./current-footprint-inverse-native-profile.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintInverseMainHistoryNativeSource(): string {
  const cases = currentFootprintInverseMainHistoryTemplates(), rows = cases.map(row => [row.phase, row.method, row.fields.join(","), row.template].join("\t"));
  if (new Set(cases.map(row => row.phase)).size !== cases.length) { throw new Error("FOOTPRINT_INVERSE_HISTORY_NATIVE_DUPLICATE"); }
  const groups: string[][] = [[]];
  for (const row of rows) { let group = groups.at(-1); if (group === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("FOOTPRINT_INVERSE_HISTORY_NATIVE_ROW_BOUND"); } if (Buffer.byteLength([...group, row].join("\0")) > 60_000) { group = []; groups.push(group); } group.push(row); }
  const loaders = groups.map(group => { const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- In-memory deterministic fixed rows, below the unchanged64KiB decoder ceiling.
    const packed = gzipSync(bytes, { level: 9 });
    return `rows.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  const hashes = cases.map(row => { let value = row.template; for (const name of row.fields) { value = value.replaceAll(`__inverse_history_${name}__`, "inverse_handle"); } return createHash("sha256").update(`{"id":79,${value.slice(1, -1)}}\0`).digest("hex"); });
  return `public static class EasyedaFootprintInverseMainHistoryProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-inverse-main-history-protocol");}
static string[][] Load(){var rows=new System.Collections.Generic.List<string[]>();${loaders}return rows.ToArray();}static readonly string[][] Cases=Load();
static string Handle(object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);string text=row[3];foreach(string name in names){Need(fields.Contains(name));text=text.Replace("__inverse_history_"+name+"__",Handle(fields[name]));}Need(!text.Contains("__inverse_history_"));string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536);return result;}
static void Refuse(System.Action call){bool refused=false;try{call();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){var row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"inverse_handle");string encoded=Encode(79,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);Refuse(()=>Encode(79,row[0],"Runtime.evaluate",fields));fields.Add("clock","caller");Refuse(()=>Encode(79,row[0],row[1],fields));}}
}
public sealed partial class EasyedaDiagnosticOwner {
int inverseInitialHistoryStep,inverseInitialHistoryNormal,inverseInitialHistoryCleanup;
public void SendFootprintInverseMainHistory(int id,string phase,string method,System.Collections.IDictionary fields){if(!footprintInverse209||footprintInverseAborted||!footprintInverseConstructionComplete||!footprintInverseSourceBound||footprintInverseProducerStep!=${String(PRODUCER.normal)}||originalMain==null)throw Error("inverse-main-history-owner");MainPurpose();AssertLive();string[] steps={"inverse-main-history-arm","inverse-main-history-frame","inverse-main-history-join-capture","inverse-main-history-properties-packet","inverse-main-history-properties-promise","inverse-main-history-join-resolved","inverse-main-history-properties-projectSql","inverse-main-history-properties-table","inverse-main-history-properties-branches","inverse-main-history-join-value","inverse-main-history-remove","inverse-main-history-step","inverse-main-history-release"};if(id!=mainRequest+1||id-stockMainRequests>${String(PROFILE.main.total)}||inverseInitialHistoryStep>=4*steps.Length||phase!=steps[inverseInitialHistoryStep%steps.Length])throw Error("inverse-main-history-order");string encoded=EasyedaFootprintInverseMainHistoryProtocol.Encode(id,phase,method,fields);bool cleanup=phase=="inverse-main-history-remove"||phase=="inverse-main-history-release";if(cleanup?inverseInitialHistoryCleanup>=${String(LIMITS.repetitions * LIMITS.cleanup)}:inverseInitialHistoryNormal>=${String(LIMITS.repetitions * LIMITS.normal)})throw Error("inverse-main-history-budget");inverseInitialHistoryStep++;if(cleanup)inverseInitialHistoryCleanup++;else inverseInitialHistoryNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();}
public static void VerifyFootprintInverseMainHistorySmoke(){EasyedaFootprintInverseMainHistoryProtocol.VerifySmoke();}
}
`;
}
export const CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_DISPATCH = String.raw`        'footprint-inverse-main-history' {
          if (-not $FootprintInverse209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'footprint-inverse-main-history-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'footprint-inverse-main-history-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendFootprintInverseMainHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
