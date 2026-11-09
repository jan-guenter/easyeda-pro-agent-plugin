/** Original Via history slots only. Native clocks bracket each original SQL
 * call and matched callback; no caller can supply a clock or grant boolean. */
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentPcbViaMainHistoryTemplates } from "./current-pcb-via-main-history-wire.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as LIMITS, CURRENT_PCB_VIA_MAIN_HISTORY_STEPS as STEPS } from "./current-pcb-via-main-history-protocol.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as PROFILE } from "./current-pcb-via-write-native-profile.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentPcbViaMainHistoryNativeSource(): string {
  const cases = currentPcbViaMainHistoryTemplates(), rows = cases.map(row => [row.phase, row.method, row.fields.join(","), row.template].join("\t"));
  if (new Set(cases.map(row => row.phase)).size !== cases.length) { throw new Error("PCB_VIA_HISTORY_NATIVE_DUPLICATE"); }
  const groups: string[][] = [[]];
  for (const row of rows) { let group = groups.at(-1); if (group === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("PCB_VIA_HISTORY_NATIVE_ROW_BOUND"); } if (Buffer.byteLength([...group, row].join("\0")) > 60_000) { group = []; groups.push(group); } group.push(row); }
  const loaders = groups.map(group => { const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- In-memory deterministic fixed rows, below the unchanged64KiB decoder ceiling.
    const packed = gzipSync(bytes, { level: 9 });
    return `rows.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  const hashes = cases.map(row => { let value = row.template; for (const name of row.fields) { value = value.replaceAll(`__via_history_${name}__`, "via_handle"); } return createHash("sha256").update(`{"id":79,${value.slice(1, -1)}}\0`).digest("hex"); });
  return `public static class EasyedaPcbViaMainHistoryProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-via-history-protocol");}
static string[][] Load(){var rows=new System.Collections.Generic.List<string[]>();${loaders}return rows.ToArray();}static readonly string[][] Cases=Load();
static string Handle(object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);string text=row[3];foreach(string name in names){Need(fields.Contains(name));text=text.Replace("__via_history_"+name+"__",Handle(fields[name]));}Need(!text.Contains("__via_history_"));string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536);return result;}
static void Refuse(System.Action call){bool refused=false;try{call();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){var row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"via_handle");string encoded=Encode(79,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);Refuse(()=>Encode(79,row[0],"Runtime.evaluate",fields));fields.Add("clock","caller");Refuse(()=>Encode(79,row[0],row[1],fields));}}
}
public sealed partial class EasyedaDiagnosticOwner {
int viaHistoryNormal,viaHistoryCleanup,viaHistoryStep;bool viaHistoryCallbackArmed;readonly System.Collections.Generic.HashSet<string> viaHistoryArms=new System.Collections.Generic.HashSet<string>();readonly long[] viaHistoryBefore=new long[5],viaHistoryAfter=new long[5];
static long ViaHistoryUtcMilliseconds(){return (System.DateTime.UtcNow.Ticks-621355968000000000L)/10000L;}
public long[] SendViaMainHistory(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||!viaConstructionComplete||originalMain==null)throw Error("via-history-owner");MainPurpose();AssertLive();if(id!=mainRequest+1||id-stockMainRequests>${String(PROFILE.main.total)})throw Error("via-history-id");string encoded=EasyedaPcbViaMainHistoryProtocol.Encode(id,phase,method,fields);bool arm=phase.StartsWith("via-main-history-arm-",StringComparison.Ordinal),cleanup=phase.StartsWith("via-main-history-remove-",StringComparison.Ordinal);if(cleanup?viaHistoryCleanup>=${String(LIMITS.cleanup)}:viaHistoryNormal>=${String(LIMITS.normal)})throw Error("via-history-budget");if(arm){if(viaSdkStages[4]||!viaHistoryArms.Add(phase))throw Error("via-history-arm-once");}else if(!viaSdkStages[4]||viaHistoryArms.Count!=9||viaBeginStep!=5||viaMainStep!=3)throw Error("via-history-original-save");if(phase=="via-main-history-callback-arm"){if(viaHistoryCallbackArmed||viaHistoryStep!=0)throw Error("via-history-callback-once");viaHistoryCallbackArmed=true;}
int slot=-1;bool callback=false;if(method=="Debugger.resume"){string[] steps={${STEPS.map(step => `"via-main-history-step-${step}"`).join(",")}};if(!viaHistoryCallbackArmed||viaHistoryStep>=steps.Length||phase!=steps[viaHistoryStep])throw Error("via-history-step-order");string[] names={"data","head","branch","commit","project"};for(int i=0;i<names.Length;i++){if(phase=="via-main-history-step-sql-"+names[i])slot=i;if(phase=="via-main-history-step-callback-"+names[i]){slot=i;callback=true;}}if(slot>=0){long now=ViaHistoryUtcMilliseconds();if(callback){if(viaHistoryBefore[slot]<=0||viaHistoryAfter[slot]!=0||now<viaHistoryBefore[slot]||now-viaHistoryBefore[slot]>120000)throw Error("via-history-callback-clock");viaHistoryAfter[slot]=now;}else{if(viaHistoryBefore[slot]!=0||viaHistoryAfter[slot]!=0)throw Error("via-history-sql-once");viaHistoryBefore[slot]=now;}}viaHistoryStep++;}
if(cleanup)viaHistoryCleanup++;else viaHistoryNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();if(phase=="via-main-history-step-controllerReturned"){for(int i=0;i<5;i++)if(viaHistoryBefore[i]<=0||viaHistoryAfter[i]<viaHistoryBefore[i])throw Error("via-history-callbacks-incomplete");viaStructureHistoryGranted=true;}return slot<0?new long[0]:new long[]{slot,viaHistoryBefore[slot],viaHistoryAfter[slot]};}
public static void VerifyPcbViaMainHistorySmoke(){EasyedaPcbViaMainHistoryProtocol.VerifySmoke();foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){bool refused=false;try{owner.SendViaMainHistory(1,"via-main-history-step-begin","Debugger.resume",new System.Collections.Hashtable());}catch(InvalidOperationException){refused=true;}if(!refused||owner.viaHistoryStep!=0||owner.viaHistoryNormal!=0||owner.viaStructureHistoryGranted)throw Error("via-history-unissued-owner-smoke");}}
}
`;
}
function one(source: string, before: string, after: string): string { if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_HISTORY_NATIVE_DUPLICATE_ANCHOR"); } return source; } if (source.split(before).length !== 2) { throw new Error("PCB_VIA_HISTORY_NATIVE_ANCHOR"); } return source.replace(before, after); }
const dispatch = String.raw`        'pcb-via-main-history' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-via-history-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-via-history-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $clock=$owner.SendViaMainHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
          if ($clock.Length -eq 3) {$result.slot=@('data','head','branch','commit','project')[[int]$clock[0]];$result.beforeEpochMs=$clock[1];$result.afterEpochMs=$clock[2]}
        }
`;
export function applyCurrentPcbViaMainHistoryNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-main-begin":', 'case "pcb-via-main-begin":case "pcb-via-main-history":');
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-main-begin' {");
  source = one(source, "@('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin')", "@('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin','pcb-via-main-history')");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyPcbViaMainHistorySmoke()", "    [EasyedaDiagnosticOwner]::VerifyPcbViaMainBeginSmoke()");
  const begin = "// BEGIN GENERATED VIA ORIGINAL MAIN HISTORY", end = "// END GENERATED VIA ORIGINAL MAIN HISTORY", value = `${begin}\n${currentPcbViaMainHistoryNativeSource()}\n${end}`;
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PCB_VIA_HISTORY_NATIVE_MARKERS"); } source = source.slice(0, start) + value + source.slice(stop + end.length); }
  else { source = one(source, "internal enum EasyedaPcbViaWriteBirth { Original }", `${value}\ninternal enum EasyedaPcbViaWriteBirth { Original }`); } return source;
}
