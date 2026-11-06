/** Startup-only same-head sync lane on the two original writer births.
 * Each native stage burns before dispatch. Unknown replies never refund it. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentGeneratedInitialSyncTemplates } from "./current-generated-initial-sync-wire.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_REQUESTS as REQUESTS } from "./current-generated-initial-sync-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL GENERATED INITIAL SYNC", end = "// END ORIGINAL GENERATED INITIAL SYNC";
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const quote = String.raw`static string Quote(string value){var b=new System.Text.StringBuilder();b.Append('"');for(int i=0;i<value.Length;i++){char c=value[i];if(char.IsHighSurrogate(c)){Need(i+1<value.Length&&char.IsLowSurrogate(value[i+1]));b.Append(c);b.Append(value[++i]);}else{Need(!char.IsLowSurrogate(c));if(c=='"'||c=='\\'){b.Append('\\');b.Append(c);}else if(c=='\b')b.Append("\\b");else if(c=='\t')b.Append("\\t");else if(c=='\n')b.Append("\\n");else if(c=='\f')b.Append("\\f");else if(c=='\r')b.Append("\\r");else if(c<32){b.Append("\\u");b.Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));}else b.Append(c);}}b.Append('"');return b.ToString();}`;
function protocol(): string {
  const cases = currentGeneratedInitialSyncTemplates();
  const hashes = cases.map(row => { const template = row.template.replaceAll(/"__initial_sync_([A-Za-z\d]+)__"/gu, (_match, name: string) => { if (name === "key") { return JSON.stringify(`https://client/index/v1/${"a".repeat(32)}`); } return JSON.stringify(name === "body" ? "original\n\"body" : "original_handle"); }); return createHash("sha256").update(`{"id":79,${template.slice(1, -1)},"sessionId":"original_worker"}\0`).digest("hex"); });
  const groups: string[][] = [[]];
  for (const row of cases) {
    const text = [row.phase, row.method, row.fields.join(","), row.template].join("\t"); let group = groups.at(-1);
    if (group === undefined || Buffer.byteLength(text) > 60_000) { throw new Error("INITIAL_SYNC_TABLE_BOUND"); }
    if (Buffer.byteLength([...group, text].join("\0")) > 60_000) { group = []; groups.push(group); } group.push(text);
  }
  const loaders = groups.map(group => {
    const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- Build-only deterministic compression of fixed source tables; the native 64KiB decoder bound stays unchanged.
    const packed = gzipSync(bytes, { level: 9 });
    return `result.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  return `public static class EasyedaGeneratedInitialSyncProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("generated-initial-sync-protocol");}
${quote}
static string[][] Load(){var result=new System.Collections.Generic.List<string[]>();${loaders}return result.ToArray();}
static readonly string[][] Rows=Load();
static string Handle(object value){string s=value as string;Need(s!=null&&System.Text.RegularExpressions.Regex.IsMatch(s,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return s;}
public static int Index(string phase){for(int i=0;i<Rows.Length;i++)if(Rows[i][0]==phase)return i;throw new System.InvalidOperationException("initial-sync-phase");}\npublic static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Handle(session);string[] row=null;foreach(var r in Rows)if(r[0]==phase){Need(row==null);row=r;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var data=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));string v=fields[name] as string;Need(v!=null);if(name=="key")Need(System.Text.RegularExpressions.Regex.IsMatch(v,@"\\Ahttps://client/index/v1/[a-f0-9]{32}\\z"));else if(name=="body")Need(v.Length>0&&v.Length<=8192&&System.Text.Encoding.UTF8.GetByteCount(v)<=8192);else Handle(v);data.Add(name,v);}string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__initial_sync_([A-Za-z0-9]+)__\\"",m=>{string v;Need(data.TryGetValue(m.Groups[1].Value,out v));return Quote(v);});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Quote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="key"?"https://client/index/v1/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":name=="body"?"original\\n\\"body":"original_handle");string encoded=Encode(79,"original_worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"original_worker",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
function owner(purpose: "via" | "schematic"): string {
  const name = purpose === "via" ? "Via" : "SchematicDisplay";
  const born = purpose === "via" ? "pcbViaWrite209&&!viaAbortAttempted&&!viaSdkStages[2]&&!viaSdkStages[4]" : "schematicDisplayWrite209&&!schematicDisplayAbort&&!schematicDisplayStages[4]&&!schematicDisplayStages[6]";
  return `bool ${purpose}InitialSyncCompleted;int ${purpose}InitialSyncStage;
public void Send${name}InitialSync(int id,string phase,string method,System.Collections.IDictionary fields){if(!(${born})||${purpose}InitialSyncCompleted||${purpose}ProducerPrefixEnrolled||${purpose}WorkerSession==null||${purpose}WorkerStage!=7||!${purpose}StructureBootstrapResumed||!${purpose}ProducerModeRequested||!${purpose}ProducerIntrinsicsReproved||${purpose}ProducerObserveArms.Count!=26||${purpose}InitialSyncStage>=${String(REQUESTS.cdpRequests)})throw Error("initial-sync-original-startup");
string encoded=EasyedaGeneratedInitialSyncProtocol.Encode(id,${purpose}WorkerSession,phase,method,fields);int index=EasyedaGeneratedInitialSyncProtocol.Index(phase),expected=${purpose}InitialSyncStage<35?${purpose}InitialSyncStage:${purpose}InitialSyncStage-2;if(index!=expected)throw Error("initial-sync-original-order");AssertLive();${purpose}InitialSyncStage++;SendMessage(id,encoded);}
public void Complete${name}InitialSync(){if(!(${born})||${purpose}InitialSyncCompleted||${purpose}ProducerPrefixEnrolled||(${purpose}InitialSyncStage!=35&&${purpose}InitialSyncStage!=37))throw Error("initial-sync-complete-original");AssertLive();${purpose}InitialSyncCompleted=true;}
`;
}
function dispatch(purpose: "via" | "schematic"): string {
  const action = purpose === "via" ? "pcb-via" : "schematic-display", flag = purpose === "via" ? "$PcbViaWrite209" : "$SchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `        '${action}-initial-sync' {
          if (-not ${flag} -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'initial-sync-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'initial-sync-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.Send${name}InitialSync([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        '${action}-initial-sync-complete' {
          if (-not ${flag} -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'initial-sync-complete-fields'}
          $owner.Complete${name}InitialSync();$result=@{completed=$true}
        }
`;
}
export function applyCurrentGeneratedInitialSyncNativeFragment(input: string): string {
  let source = input;
  for (const purpose of ["via", "schematic"] as const) {
    const action = purpose === "via" ? "pcb-via" : "schematic-display", name = purpose === "via" ? "Via" : "SchematicDisplay";
    const anchor=`case "${action}-initial-cache":`; const after=`case "${action}-initial-sync":case "${action}-initial-sync-complete":${anchor}`;
    if (!source.includes(after)) { if (source.split(anchor).length !== 2) { throw new Error("INITIAL_SYNC_ACTION_ANCHOR"); } source=source.replace(anchor,after); }
    const start=source.indexOf(`public void Enroll${name}ProducerPrefix(){`); const stop=source.indexOf("\n",start); const guard=`||!${purpose}InitialCacheCompleted||`; const qualified=`||!${purpose}InitialCacheCompleted||!${purpose}InitialSyncCompleted||`;
    if(start===-1||stop<=start){throw new Error("INITIAL_SYNC_PREFIX_ANCHOR");}const line=source.slice(start,stop);
    if(!line.includes(qualified)){if(line.split(guard).length!==2){throw new Error("INITIAL_SYNC_PREFIX_GUARD");}source=source.slice(0,start)+line.replace(guard,qualified)+source.slice(stop);}
  }
  const sizeAnchor="      $largeOpening=$request.action -ceq 'worker-startup-parent'"; const sizeAfter=`      $initialSyncOpening=($PcbViaWrite209 -and $request.action -ceq 'pcb-via-initial-sync' -or $SchematicDisplayWrite209 -and $request.action -ceq 'schematic-display-initial-sync') -and $request.method -ceq 'Runtime.callFunctionOn' -and $request.phase -ceq 'initial-sync-capture'\n${sizeAnchor}`;
  if(!source.includes(sizeAfter)){if(source.split(sizeAnchor).length!==2){throw new Error("INITIAL_SYNC_SIZE_ANCHOR");}source=source.replace(sizeAnchor,()=>sizeAfter);}
  const sizeStart=source.indexOf(sizeAfter); const sizeStop=source.indexOf("      if ($request.id",sizeStart); const after="(-not $initialSyncOpening -and -not $initialCacheOpening -and",before="(-not $initialCacheOpening -and";
  const scope=source.slice(sizeStart,sizeStop);if(sizeStart===-1||sizeStop<=sizeStart){throw new Error("INITIAL_SYNC_SIZE_SCOPE");}
  if(!scope.includes(after)){if(scope.split(before).length!==2){throw new Error("INITIAL_SYNC_SIZE_GUARD");}source=source.slice(0,sizeStart)+scope.replace(before,after)+source.slice(sizeStop);}
  source=installOwnedNativeDispatch(source,dispatch("via")+dispatch("schematic"),"        'pcb-via-initial-cache' {");
  source=installNativeCompileOnlyHook(source,"    [EasyedaGeneratedInitialSyncProtocol]::VerifySmoke()","    [EasyedaGeneratedInitialCacheProtocol]::VerifySmoke()");
  const body=`${begin}\n${protocol()}\npublic sealed partial class EasyedaDiagnosticOwner {\n${owner("via")}${owner("schematic")}\n}\n${end}`;
  const start=source.indexOf(begin); const stop=source.indexOf(end);
  if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("INITIAL_SYNC_MARKERS");}return source.slice(0,start)+body+source.slice(stop+end.length);}
  const anchor="// END ORIGINAL GENERATED INITIAL CACHE";if(source.split(anchor).length!==2){throw new Error("INITIAL_SYNC_BODY_ANCHOR");}return source.replace(anchor,`${anchor}\n${body}`);
}
