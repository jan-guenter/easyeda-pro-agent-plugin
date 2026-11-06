/** Separate startup-only cache continuations on the two original writer
 * births. No SDK stage, SQL, timer, retry or post-action producer is allowed. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentGeneratedInitialCacheTemplates } from "./current-generated-initial-cache-wire.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_REQUESTS as REQUESTS } from "./current-generated-initial-cache-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL GENERATED INITIAL CACHE", end = "// END ORIGINAL GENERATED INITIAL CACHE";
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const quote = String.raw`static string Quote(string value){var b=new System.Text.StringBuilder();b.Append('"');for(int i=0;i<value.Length;i++){char c=value[i];if(char.IsHighSurrogate(c)){Need(i+1<value.Length&&char.IsLowSurrogate(value[i+1]));b.Append(c);b.Append(value[++i]);}else{Need(!char.IsLowSurrogate(c));if(c=='"'||c=='\\'){b.Append('\\');b.Append(c);}else if(c=='\b')b.Append("\\b");else if(c=='\t')b.Append("\\t");else if(c=='\n')b.Append("\\n");else if(c=='\f')b.Append("\\f");else if(c=='\r')b.Append("\\r");else if(c<32){b.Append("\\u");b.Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));}else b.Append(c);}}b.Append('"');return b.ToString();}`;
function protocol(): string {
  const cases = currentGeneratedInitialCacheTemplates();
  const hashes = cases.map(row => { const template = row.template.replaceAll(/"__initial_cache_([A-Za-z\d]+)__"/gu, (_match, name: string) => { if (name === "key") { return JSON.stringify(`https://client/index/v1/${"a".repeat(32)}`); } return JSON.stringify(name === "body" ? "original\n\"body" : "original_handle"); }); return createHash("sha256").update(`{"id":79,${template.slice(1, -1)},"sessionId":"original_worker"}\0`).digest("hex"); });
  const rows = cases.map(row => `new string[]{${[row.phase, row.method, row.fields.join(","), row.template].map(value => literal(value)).join(",")}}`).join(",\n");
  return `public static class EasyedaGeneratedInitialCacheProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("generated-initial-cache-protocol");}
${quote}
static readonly string[][] Rows=new string[][]{${rows}};
static string Handle(object value){string s=value as string;Need(s!=null&&System.Text.RegularExpressions.Regex.IsMatch(s,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return s;}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Handle(session);string[] row=null;foreach(var r in Rows)if(r[0]==phase){Need(row==null);row=r;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var data=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));string v=fields[name] as string;Need(v!=null);if(name=="key")Need(System.Text.RegularExpressions.Regex.IsMatch(v,@"\\Ahttps://client/(?:dataStr/[a-f0-9]{32}-[a-f0-9]{32}|index/v1/[a-f0-9]{32})\\z"));else if(name=="body")Need(v.Length>0&&v.Length<=16384&&System.Text.Encoding.UTF8.GetByteCount(v)<=16384);else Handle(v);data.Add(name,v);}string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__initial_cache_([A-Za-z0-9]+)__\\"",m=>{string v;Need(data.TryGetValue(m.Groups[1].Value,out v));return Quote(v);});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Quote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="key"?"https://client/index/v1/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa":name=="body"?"original\\n\\"body":"original_handle");string encoded=Encode(79,"original_worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"original_worker",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
function owner(purpose: "via" | "schematic"): string {
  const jobs = purpose === "via" ? 2 : 3, name = purpose === "via" ? "Via" : "SchematicDisplay";
  const born = purpose === "via" ? "pcbViaWrite209&&!viaAbortAttempted&&!viaSdkStages[2]&&!viaSdkStages[4]" : "schematicDisplayWrite209&&!schematicDisplayAbort&&!schematicDisplayStages[4]&&!schematicDisplayStages[6]";
  return `bool ${purpose}InitialCacheCompleted;int ${purpose}InitialCacheRequests;readonly int[] ${purpose}InitialCacheStages=new int[${String(jobs)}],${purpose}InitialCacheProperties=new int[${String(jobs)}];
public void Send${name}InitialCache(int id,string phase,string method,System.Collections.IDictionary fields){if(!(${born})||${purpose}InitialCacheCompleted||${purpose}ProducerPrefixEnrolled||${purpose}WorkerSession==null||${purpose}WorkerStage!=7||!${purpose}StructureBootstrapResumed||!${purpose}ProducerModeRequested||!${purpose}ProducerIntrinsicsReproved||${purpose}ProducerObserveArms.Count!=23||${purpose}InitialCacheRequests>=${String(REQUESTS.cdpRequests)})throw Error("initial-cache-original-startup");
string encoded=EasyedaGeneratedInitialCacheProtocol.Encode(id,${purpose}WorkerSession,phase,method,fields);int slot=phase[phase.Length-1]-'0';if(slot<0||slot>=${String(jobs)})throw Error("initial-cache-original-slot");string role=phase.Substring(0,phase.Length-2);int stage=${purpose}InitialCacheStages[slot],next=-1;
if(role=="initial-cache-entry-document"&&slot<${String(jobs - 1)}||role=="initial-cache-entry-head"&&slot==${String(jobs - 1)}){if(stage!=0)throw Error("initial-cache-entry-once");next=1;}
else if(role=="initial-cache-resume-headEntry"){if(stage!=1)throw Error("initial-cache-entry-resume-once");next=2;}
else if(role=="initial-cache-promise"){if(stage!=2)throw Error("initial-cache-promise-once");next=3;}
else if(role=="initial-cache-resume-headPromise"){if(stage!=3)throw Error("initial-cache-promise-resume-once");next=4;}
else if(role=="initial-cache-success"){if(stage!=4)throw Error("initial-cache-success-once");next=5;}
else if(role=="initial-cache-resume-headSuccess"){if(stage!=5)throw Error("initial-cache-success-resume-once");next=6;}
else if(role=="initial-cache-settled-properties"){if(stage!=6||${purpose}InitialCacheProperties[slot]>=2)throw Error("initial-cache-original-settlement");${purpose}InitialCacheProperties[slot]++;}
else throw Error("initial-cache-fixed-role");AssertLive();if(next>=0)${purpose}InitialCacheStages[slot]=next;${purpose}InitialCacheRequests++;SendMessage(id,encoded);}
public void Complete${name}InitialCache(){if(!(${born})||${purpose}InitialCacheCompleted||${purpose}ProducerPrefixEnrolled)throw Error("initial-cache-complete-once");for(int i=0;i<${String(jobs)};i++)if(${purpose}InitialCacheStages[i]!=6||${purpose}InitialCacheProperties[i]==0)throw Error("initial-cache-complete-original-jobs");AssertLive();${purpose}InitialCacheCompleted=true;}
`;
}
function ownerSmoke(): string {
  return (["via", "schematic"] as const).map(purpose => { const factory = purpose === "via" ? "CreatePcbViaWrite209" : "CreateSchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay"; return `{var o=${factory}();try{bool refused=false;try{o.Send${name}InitialCache(1,"initial-cache-resume-headEntry-0","Debugger.resume",new System.Collections.Hashtable());}catch(InvalidOperationException){refused=true;}if(!refused||o.${purpose}InitialCacheRequests!=0)throw Error("initial-cache-original-owner-smoke");refused=false;try{o.Complete${name}InitialCache();}catch(InvalidOperationException){refused=true;}if(!refused||o.${purpose}InitialCacheCompleted)throw Error("initial-cache-original-complete-smoke");}finally{o.originalMain.Release();}}`; }).join("\n");
}
function dispatch(purpose: "via" | "schematic"): string {
  const action = purpose === "via" ? "pcb-via" : "schematic-display", flag = purpose === "via" ? "$PcbViaWrite209" : "$SchematicDisplayWrite209", name = purpose === "via" ? "Via" : "SchematicDisplay";
  return `        '${action}-initial-cache' {
          if (-not ${flag} -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'initial-cache-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'initial-cache-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.Send${name}InitialCache([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        '${action}-initial-cache-complete' {
          if (-not ${flag} -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'initial-cache-complete-fields'}
          $owner.Complete${name}InitialCache();$result=@{completed=$true}
        }
`;
}
export function applyCurrentGeneratedInitialCacheNativeFragment(input: string): string {
  let source = input;
  for (const purpose of ["via", "schematic"] as const) {
    const action = purpose === "via" ? "pcb-via" : "schematic-display"; const before = `case "${action}-producer-bind":`; const after = `case "${action}-initial-cache":case "${action}-initial-cache-complete":${before}`;
    if (!source.includes(after)) { if (source.split(before).length !== 2) { throw new Error("INITIAL_CACHE_NATIVE_ACTION_ANCHOR"); } source = source.replace(before, after); }
    const name = purpose === "via" ? "Via" : "SchematicDisplay", start = source.indexOf(`public void Enroll${name}ProducerPrefix(){`);
    if (start === -1) { throw new Error("INITIAL_CACHE_NATIVE_PREFIX_ANCHOR"); } const stop = source.indexOf("\n", start);
    const beforePrefix = source.slice(start, stop), guard = `||${purpose}ProducerPrefixEnrolled||${purpose}WorkerSession==null`, qualified = `||${purpose}ProducerPrefixEnrolled||!${purpose}InitialCacheCompleted||${purpose}WorkerSession==null`;
    if (!beforePrefix.includes(qualified)) { if (beforePrefix.split(guard).length !== 2) { throw new Error("INITIAL_CACHE_NATIVE_PREFIX_ANCHOR"); } source = source.slice(0, start) + beforePrefix.replace(guard, qualified) + source.slice(stop); }
  }
  const sizeAnchor = "      $largeOpening=$request.action -ceq 'worker-startup-parent'"; const sizeAfter = `      $initialCacheOpening=($PcbViaWrite209 -and $request.action -ceq 'pcb-via-initial-cache' -or $SchematicDisplayWrite209 -and $request.action -ceq 'schematic-display-initial-cache') -and $request.method -ceq 'Runtime.callFunctionOn' -and $request.phase -cmatch '^initial-cache-entry-(?:document|head)-[012]$'\n${  sizeAnchor}`;
  if (!source.includes(sizeAfter)) { if (source.split(sizeAnchor).length !== 2) { throw new Error("INITIAL_CACHE_NATIVE_SIZE_ANCHOR"); } source = source.replace(sizeAnchor, () => sizeAfter); }
  const sizeGuard = "(-not $largeMainRequest -and -not $largeClockRpcRequest -and -not $largeOpening -and", sizeQualified = "(-not $initialCacheOpening -and -not $largeMainRequest -and -not $largeClockRpcRequest -and -not $largeOpening -and";
  const sizeStart = source.indexOf(sizeAfter), sizeStop = source.indexOf("      if ($request.id", sizeStart);
  if (sizeStart === -1 || sizeStop <= sizeStart) { throw new Error("INITIAL_CACHE_NATIVE_SIZE_SCOPE"); } const sizeScope = source.slice(sizeStart, sizeStop);
  if (!sizeScope.includes(sizeQualified)) { if (sizeScope.split(sizeGuard).length !== 2) { throw new Error("INITIAL_CACHE_NATIVE_SIZE_GUARD"); } source = source.slice(0, sizeStart) + sizeScope.replace(sizeGuard, sizeQualified) + source.slice(sizeStop); }
  source = installOwnedNativeDispatch(source, dispatch("via") + dispatch("schematic"), "        'pcb-via-producer-bind' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaGeneratedInitialCacheProtocol]::VerifySmoke()", "    [EasyedaProjectSaveProducerProtocol]::VerifySmoke()");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyOriginalInitialCacheSmoke()", "    [EasyedaGeneratedInitialCacheProtocol]::VerifySmoke()");
  const body = `${begin}\n${protocol()}\npublic sealed partial class EasyedaDiagnosticOwner {\n${owner("via")}${owner("schematic")}\npublic static void VerifyOriginalInitialCacheSmoke(){${ownerSmoke()}}\n}\n${end}`;
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + 1) || source.includes(end, stop + 1)) { throw new Error("INITIAL_CACHE_NATIVE_MARKERS"); } return source.slice(0, start) + body + source.slice(stop + end.length); }
  const anchor = "// END ORIGINAL SHARED PRODUCER OBSERVATION"; if (source.split(anchor).length !== 2) { throw new Error("INITIAL_CACHE_NATIVE_BODY_ANCHOR"); } return source.replace(anchor, `${anchor}\n${body}`);
}
