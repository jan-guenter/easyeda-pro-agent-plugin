/** Fixed seven-command metadata codec, stored as a bounded exact-hash table.
 * No supplied code, getter invocation or CacheStorage method is encoded. */
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_CALLS as CALLS, CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_GROUP as GROUP } from "./current-footprint-saved-cache-accessor-probe.ts";
import { currentFootprintSavedCacheAccessorWire } from "./current-footprint-saved-cache-accessor-protocol.ts";
import type { CurrentFootprintSavedCacheAccessorCommand } from "./current-footprint-saved-cache-accessor-protocol.ts";

const marker = (name: string): string => `__savedaccessor_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintSavedCacheAccessorNativeCases(): readonly CurrentFootprintSavedCacheAccessorCommand[] {
  const objectId = marker("objectId"), sessionId = marker("sessionId");
  const flags = { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, arguments: [] } as const;
  return [
    { cacheAccessorPhase: "capture", method: "Runtime.callFunctionOn", sessionId,
      params: { ...flags, arguments: [], uniqueContextId: marker("uniqueContextId"), functionDeclaration: CALLS.capture, returnByValue: false } },
    ...(["array-properties", "constructor-properties", "match-properties", "getter-properties"] as const).map(cacheAccessorPhase =>
      ({ cacheAccessorPhase, method: "Runtime.getProperties", sessionId, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } } as const)),
    { cacheAccessorPhase: "recheck", method: "Runtime.callFunctionOn", sessionId,
      params: { ...flags, arguments: [], objectId, functionDeclaration: CALLS.recheck, returnByValue: true } },
    { cacheAccessorPhase: "release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: GROUP } },
  ];
}
export function currentFootprintSavedCacheAccessorNativeSource(): string {
  const rows = currentFootprintSavedCacheAccessorNativeCases().map(command => {
    const wire = currentFootprintSavedCacheAccessorWire(command, 1);
    const names = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    const { cacheAccessorPhase, ...native } = command;
    const template = JSON.stringify(native);
    if (names.some(name => !template.includes(JSON.stringify(marker(name)))) || template.includes("\t") || template.includes("\0")) { throw new Error("SAVED_CACHE_ACCESSOR_NATIVE_TABLE"); }
    return [cacheAccessorPhase, command.method, names.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  if (bytes.length > 16_384) { throw new Error("SAVED_CACHE_ACCESSOR_NATIVE_TABLE_BYTES"); }
  // oxlint-disable-next-line node/no-sync -- Generation compresses one fixed bounded metadata table, outside every runtime request path.
  const compressed = gzipSync(bytes, { level: 9 });
  const hashes = rows.map(row => {
    const template = row.split("\t")[3]; if (template === undefined) { throw new Error("SAVED_CACHE_ACCESSOR_NATIVE_SMOKE"); }
    return createHash("sha256").update(`{"id":73,${template.slice(1)}\0`).digest("hex");
  });
  return `public static class EasyedaFootprintSavedCacheAccessorProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-saved-cache-protocol");}
static string[][] Load(){string[] rows=EasyedaDiagnosticOwner.UnpackFixedProgram(${literal(compressed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(compressed).digest("hex"))}).Split('\\0');Need(rows.Length==7);string[][] result=new string[7][];for(int i=0;i<7;i++){result[i]=rows[i].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
public static string Field(string name,object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,name=="objectId"?@"\\A[A-Za-z0-9_.:-]{1,256}\\z":@"\\A[A-Za-z0-9_.:-]{1,128}\\z"));return value;}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&id<=103&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase)selected=row;Need(selected!=null&&selected[1]==method);string[] names=selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__savedaccessor_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1)+"\\0";}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<7;i++){var fields=new System.Collections.Hashtable();foreach(string name in Cases[i][2].Split(','))fields.Add(name,"__savedaccessor_"+name+"__");string value=Encode(73,Cases[i][0],Cases[i][1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(value))).Replace("-","").ToLowerInvariant()==hashes[i]);fields.Add("program","function(){}");bool refused=false;try{Encode(73,Cases[i][0],Cases[i][1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
