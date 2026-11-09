/** Readonly original yB result only. The fixed thirteen-stage native grammar
 * neither admits SQL mutation nor accepts a caller row, target or timestamp. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentPcbViaMainLiveHistoryTemplates } from "./current-pcb-via-main-live-history-wire.ts";
import { CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_REQUESTS as LIMITS } from "./current-pcb-via-main-live-history-protocol.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as PROFILE } from "./current-pcb-via-write-native-profile.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentPcbViaMainLiveHistoryNativeSource(): string {
  const cases = currentPcbViaMainLiveHistoryTemplates(), rows = cases.map(row => [row.phase, row.method, row.fields.join(","), row.template].join("\t"));
  if (new Set(cases.map(row => row.phase)).size !== cases.length) { throw new Error("PCB_VIA_HISTORY_NATIVE_DUPLICATE"); }
  const groups: string[][] = [[]];
  for (const row of rows) { let group = groups.at(-1); if (group === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("PCB_VIA_HISTORY_NATIVE_ROW_BOUND"); } if (Buffer.byteLength([...group, row].join("\0")) > 60_000) { group = []; groups.push(group); } group.push(row); }
  const loaders = groups.map(group => { const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- In-memory deterministic fixed rows, below the unchanged64KiB decoder ceiling.
    const packed = gzipSync(bytes, { level: 9 });
    return `rows.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  const hashes = cases.map(row => { let value = row.template; for (const name of row.fields) { value = value.replaceAll(`__via_live_${name}__`, "via_handle"); } return createHash("sha256").update(`{"id":79,${value.slice(1, -1)}}\0`).digest("hex"); });
  return `public static class EasyedaPcbViaMainLiveHistoryProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-via-history-protocol");}
static string[][] Load(){var rows=new System.Collections.Generic.List<string[]>();${loaders}return rows.ToArray();}static readonly string[][] Cases=Load();
static string Handle(object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);string text=row[3];foreach(string name in names){Need(fields.Contains(name));text=text.Replace("__via_live_"+name+"__",Handle(fields[name]));}Need(!text.Contains("__via_live_"));string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536);return result;}
static void Refuse(System.Action call){bool refused=false;try{call();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){var row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"via_handle");string encoded=Encode(79,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);Refuse(()=>Encode(79,row[0],"Runtime.evaluate",fields));fields.Add("clock","caller");Refuse(()=>Encode(79,row[0],row[1],fields));}}
}
public sealed partial class EasyedaDiagnosticOwner {
int viaLiveHistoryStep,viaLiveHistoryNormal,viaLiveHistoryCleanup;
public void SendViaMainLiveHistory(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||!viaConstructionComplete||originalMain==null||!viaSdkStages[4]||viaHistoryStep!=20)throw Error("via-live-history-owner");MainPurpose();AssertLive();string[] steps={"via-main-live-arm","via-main-live-frame","via-main-live-join-capture","via-main-live-properties-packet","via-main-live-properties-promise","via-main-live-join-resolved","via-main-live-properties-projectSql","via-main-live-properties-table","via-main-live-properties-branches","via-main-live-join-value","via-main-live-remove","via-main-live-step","via-main-live-release"};if(id!=mainRequest+1||id-stockMainRequests>${String(PROFILE.main.total)}||viaLiveHistoryStep>=steps.Length||phase!=steps[viaLiveHistoryStep])throw Error("via-live-history-order");string encoded=EasyedaPcbViaMainLiveHistoryProtocol.Encode(id,phase,method,fields);bool cleanup=phase=="via-main-live-remove"||phase=="via-main-live-release";if(cleanup?viaLiveHistoryCleanup>=${String(LIMITS.cleanup)}:viaLiveHistoryNormal>=${String(LIMITS.normal)})throw Error("via-live-history-budget");viaLiveHistoryStep++;if(cleanup)viaLiveHistoryCleanup++;else viaLiveHistoryNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();}
public static void VerifyPcbViaMainLiveHistorySmoke(){EasyedaPcbViaMainLiveHistoryProtocol.VerifySmoke();foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){bool refused=false;try{owner.SendViaMainLiveHistory(1,"via-main-live-arm","Debugger.setBreakpoint",new System.Collections.Hashtable());}catch(InvalidOperationException){refused=true;}if(!refused||owner.viaLiveHistoryStep!=0||owner.viaLiveHistoryNormal!=0)throw Error("via-live-history-unissued-smoke");}}
}
`;
}
function one(source: string, before: string, after: string): string { if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_LIVE_HISTORY_NATIVE_DUPLICATE"); } return source; } if (source.split(before).length !== 2) { throw new Error("PCB_VIA_LIVE_HISTORY_NATIVE_ANCHOR"); } return source.replace(before, after); }
const dispatch = String.raw`        'pcb-via-main-live-history' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-via-live-history-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-via-live-history-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendViaMainLiveHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaMainLiveHistoryNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-structure-body-enroll":', 'case "pcb-via-structure-body-enroll":case "pcb-via-main-live-history":');
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-main-history' {");
  source = one(source, "@('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin','pcb-via-main-history','pcb-via-main-structure')", "@('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin','pcb-via-main-history','pcb-via-main-structure','pcb-via-main-live-history')");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyPcbViaMainLiveHistorySmoke()", "    [EasyedaDiagnosticOwner]::VerifyPcbViaMainHistorySmoke()");
  const begin = "// BEGIN GENERATED VIA ORIGINAL MAIN LIVE HISTORY", end = "// END GENERATED VIA ORIGINAL MAIN LIVE HISTORY", value = `${begin}\n${currentPcbViaMainLiveHistoryNativeSource()}\n${end}`;
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PCB_VIA_LIVE_HISTORY_NATIVE_MARKERS"); } source = source.slice(0, start) + value + source.slice(stop + end.length); }
  else { source = one(source, "internal enum EasyedaPcbViaWriteBirth { Original }", `${value}\ninternal enum EasyedaPcbViaWriteBirth { Original }`); } return source;
}
