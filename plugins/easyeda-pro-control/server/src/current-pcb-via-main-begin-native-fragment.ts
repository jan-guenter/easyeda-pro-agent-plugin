/** Fixed original Via BEGIN codebook and per-slot native admission. */
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentPcbViaMainBeginTemplates } from "./current-pcb-via-main-begin-wire.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as LIMITS, CURRENT_PCB_VIA_MAIN_BEGIN_STEPS as STEPS } from "./current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as PROFILE } from "./current-pcb-via-write-native-profile.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentPcbViaMainBeginNativeSource(): string {
  const cases = currentPcbViaMainBeginTemplates(), rows = cases.map(row => [row.phase, row.method, row.fields.join(","), row.template].join("\t"));
  if (new Set(cases.map(row => row.phase)).size !== cases.length) { throw new Error("PCB_VIA_BEGIN_NATIVE_DUPLICATE"); }
  const groups: string[][] = [[]];
  for (const row of rows) { let group = groups.at(-1); if (group === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("PCB_VIA_BEGIN_NATIVE_ROW_BOUND"); } if (Buffer.byteLength([...group, row].join("\0")) > 60_000) { group = []; groups.push(group); } group.push(row); }
  const loaders = groups.map(group => { const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- Deterministic in-memory fixed templates, each below the existing64KiB decoder ceiling.
    const packed = gzipSync(bytes, { level: 9 });
    return `rows.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  const hashes = cases.map(row => { let value = row.template; for (const name of row.fields) { value = value.replaceAll(`__via_begin_${name}__`, "via_handle"); } return createHash("sha256").update(`{"id":79,${value.slice(1, -1)}}\0`).digest("hex"); });
  return `public static class EasyedaPcbViaMainBeginProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-via-begin-protocol");}
static string[][] Load(){var rows=new System.Collections.Generic.List<string[]>();${loaders}return rows.ToArray();}static readonly string[][] Cases=Load();
static string Handle(object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(var item in Cases)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);string text=row[3];foreach(string name in names){Need(fields.Contains(name));text=text.Replace("__via_begin_"+name+"__",Handle(fields[name]));}Need(!text.Contains("__via_begin_"));string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536);return result;}
static void Refuse(System.Action call){bool refused=false;try{call();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){var row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"via_handle");string encoded=Encode(79,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);Refuse(()=>Encode(79,row[0],"Runtime.evaluate",fields));fields.Add("sql","caller");Refuse(()=>Encode(79,row[0],row[1],fields));}}
}
public sealed partial class EasyedaDiagnosticOwner {
int viaBeginNormal,viaBeginCleanup,viaBeginStep;readonly System.Collections.Generic.HashSet<string> viaBeginArms=new System.Collections.Generic.HashSet<string>();
public void SendViaMainBegin(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||!viaConstructionComplete||originalMain==null)throw Error("via-begin-owner");MainPurpose();AssertLive();if(id!=mainRequest+1||id-stockMainRequests>${String(PROFILE.main.total)})throw Error("via-begin-id");string encoded=EasyedaPcbViaMainBeginProtocol.Encode(id,phase,method,fields);bool arm=phase.StartsWith("via-main-begin-arm-",StringComparison.Ordinal),cleanup=phase.StartsWith("via-main-begin-remove-",StringComparison.Ordinal);if(cleanup?viaBeginCleanup>=${String(LIMITS.cleanup)}:viaBeginNormal>=${String(LIMITS.normal)})throw Error("via-begin-budget");if(arm){if(viaSdkStages[4]||!viaBeginArms.Add(phase))throw Error("via-begin-arm-once");}else if(!viaSdkStages[4]||viaBeginArms.Count!=4)throw Error("via-begin-original-save");if(method=="Debugger.resume"){string[] steps={${STEPS.map(step => `"via-main-begin-step-${step}"`).join(",")}};if(viaMainStep!=3||viaBeginStep>=steps.Length||phase!=steps[viaBeginStep])throw Error("via-begin-step-order");viaBeginStep++;}if(cleanup)viaBeginCleanup++;else viaBeginNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();}
public static void VerifyPcbViaMainBeginSmoke(){EasyedaPcbViaMainBeginProtocol.VerifySmoke();foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){bool refused=false;try{owner.SendViaMainBegin(1,"via-main-begin-step-actor","Debugger.resume",new System.Collections.Hashtable());}catch(InvalidOperationException){refused=true;}if(!refused||owner.viaBeginStep!=0||owner.viaBeginNormal!=0)throw Error("via-begin-unissued-owner-smoke");}}
}
`;
}
function one(source: string, before: string, after: string): string { if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_BEGIN_NATIVE_DUPLICATE_ANCHOR"); } return source; } if (source.split(before).length !== 2) { throw new Error("PCB_VIA_BEGIN_NATIVE_ANCHOR"); } return source.replace(before, after); }
const dispatch = String.raw`        'pcb-via-main-begin' {
          if (-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-via-begin-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-via-begin-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendViaMainBegin([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaMainBeginNativeFragment(input: string): string {
  let source = one(input, 'case "pcb-via-main-step":', 'case "pcb-via-main-step":case "pcb-via-main-begin":');
  source = installOwnedNativeDispatch(source, dispatch, "        'pcb-via-main-step' {");
  source = one(source, "@('pcb-via-main-observe','pcb-via-main-step')", "@('pcb-via-main-observe','pcb-via-main-step','pcb-via-main-begin')");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyPcbViaMainBeginSmoke()", "    [EasyedaDiagnosticOwner]::VerifyPcbViaClockSmoke()");
  const begin = "// BEGIN GENERATED VIA ORIGINAL MAIN BEGIN", end = "// END GENERATED VIA ORIGINAL MAIN BEGIN", value = `${begin}\n${currentPcbViaMainBeginNativeSource()}\n${end}`;
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PCB_VIA_BEGIN_NATIVE_MARKERS"); } source = source.slice(0, start) + value + source.slice(stop + end.length); }
  else { source = one(source, "internal enum EasyedaPcbViaWriteBirth { Original }", `${value}\ninternal enum EasyedaPcbViaWriteBirth { Original }`); } return source;
}
