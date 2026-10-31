/** Fixed unmounted C#5 codec for one held-cache leaf. These templates invoke
 * the reviewed getter/match programs only in a separately qualified future
 * purpose; generating or compiling this source grants no invocation authority. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_CALLS as CALLS } from "./current-footprint-saved-cache-held-programs.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_GROUP as GROUP, CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as LIMITS } from "./current-footprint-saved-cache-held-profile.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "./current-footprint-saved-cache-held-protocol.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_REQUEST_COUNT as REQUESTS, currentFootprintSavedCacheHeldWire } from "./current-footprint-saved-cache-held-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Build-only substitution tokens are never received native object handles. */
const marker = (name: string): string => `__heldcache_${name}__`;
/** Preserve fixed metadata bytes inside a generated C# verbatim literal. */
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
/** Canonical inert UUIDs let templates pass the real command validator before
 * replacement; arbitrary marker strings would fail the UUID schemas. */
const sample = (name: string): string => {
  if (name === "projectUuid") { return "a".repeat(64); }
  if (name === "branchUuid") { return "b".repeat(32); }
  return marker(name);
};

/** Enumerate all twelve phases using inert identifiers. The two queue cases
 * already read both fixed namespaces; the later case is a freshness sample. */
export function currentFootprintSavedCacheHeldNativeCases(): readonly CurrentFootprintSavedCacheHeldCommand[] {
  const objectId = sample("objectId"), sessionId = sample("sessionId");
  const flags = { objectGroup: GROUP, silent: true, generatePreview: false, userGesture: false } as const;
  const recheck = (heldCachePhase: "recheck-before-getter" | "recheck-first" | "recheck-fresh", functionDeclaration: string): CurrentFootprintSavedCacheHeldCommand =>
    ({ heldCachePhase, method: "Runtime.callFunctionOn", sessionId, params: { ...flags, objectId, functionDeclaration,
      arguments: [], throwOnSideEffect: true, awaitPromise: false, returnByValue: true } });
  return freezeDeep([
    { heldCachePhase: "capture", method: "Runtime.callFunctionOn", sessionId, params: { ...flags,
      uniqueContextId: sample("uniqueContextId"), functionDeclaration: CALLS.capture, arguments: [], throwOnSideEffect: true,
      awaitPromise: false, returnByValue: false } },
    ...(["array-properties", "constructor-properties", "match-properties", "getter-properties"] as const).map(heldCachePhase =>
      ({ heldCachePhase, method: "Runtime.getProperties", sessionId, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } } as const)),
    recheck("recheck-before-getter", CALLS.recheckBeforeGetter),
    { heldCachePhase: "retain-receiver", method: "Runtime.callFunctionOn", sessionId, params: { ...flags, objectId,
      functionDeclaration: CALLS.retainReceiver, arguments: [], throwOnSideEffect: false, awaitPromise: false, returnByValue: true } },
    { heldCachePhase: "queue-first", method: "Runtime.callFunctionOn", sessionId, params: { ...flags, objectId,
      functionDeclaration: CALLS.first, arguments: [{ value: sample("projectUuid") }, { value: sample("branchUuid") }],
      throwOnSideEffect: false, awaitPromise: true, returnByValue: true } },
    recheck("recheck-first", CALLS.recheckFirst),
    { heldCachePhase: "queue-fresh", method: "Runtime.callFunctionOn", sessionId, params: { ...flags, objectId,
      functionDeclaration: CALLS.fresh, arguments: [{ value: sample("projectUuid") }, { value: sample("branchUuid") }],
      throwOnSideEffect: false, awaitPromise: true, returnByValue: true } },
    recheck("recheck-fresh", CALLS.recheckFresh),
    { heldCachePhase: "release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: GROUP } },
  ]);
}

/** Pack only validated fixed templates under the shared64KiB decoder, binding
 * canonical storage, compressed/decoded hashes, all row/column counts and exact
 * encoded smoke bytes. No existing native switch mounts this separate codec. */
export function currentFootprintSavedCacheHeldNativeSource(): string {
  const cases = currentFootprintSavedCacheHeldNativeCases();
  if (cases.length !== REQUESTS) { throw new Error("SAVED_CACHE_HELD_NATIVE_ROSTER"); }
  const rows = cases.map(command => {
    const wire = currentFootprintSavedCacheHeldWire(command, 1);
    const names = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    const { heldCachePhase, ...native } = command;
    let template = JSON.stringify(native);
    for (const name of names) {
      const value = wire.request[name];
      if (typeof value !== "string" || !template.includes(JSON.stringify(value))) { throw new Error("SAVED_CACHE_HELD_NATIVE_FIELD"); }
      template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(name)));
    }
    if (template.includes("\0") || template.includes("\t")) { throw new Error("SAVED_CACHE_HELD_NATIVE_TEMPLATE"); }
    return [heldCachePhase, command.method, names.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  if (bytes.length === 0 || bytes.length > 65_536) { throw new Error("SAVED_CACHE_HELD_NATIVE_TABLE_BYTES"); }
  // oxlint-disable-next-line node/no-sync -- One bounded fixed table is compressed during source generation, outside every runtime request path.
  const compressed = gzipSync(bytes, { level: 9 });
  if (compressed.length > 65_536) { throw new Error("SAVED_CACHE_HELD_NATIVE_PACKED_BYTES"); }
  const hashes = cases.map(({ heldCachePhase: _phase, ...command }) => createHash("sha256").update(`{"id":73,${JSON.stringify(command).slice(1)}\0`).digest("hex"));
  return `public static class EasyedaFootprintSavedCacheHeldProtocol {
public const int NormalRequests=${String(LIMITS.normal)},CleanupRequests=${String(LIMITS.cleanup)},Requests=${String(REQUESTS)};
// Unit counts only. The original owner must allocate and charge physical CDP IDs.
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-saved-cache-held-protocol");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${literal(compressed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(compressed).digest("hex"))},${String(cases.length)},4);
static string Field(string name,object input){string value=input as string;Need(value!=null);string pattern;
switch(name){case "projectUuid":pattern=@"\\A[a-f0-9]{64}\\z";break;case "branchUuid":pattern=@"\\A[a-f0-9]{32}\\z";break;case "objectId":pattern=@"\\A[A-Za-z0-9_.:-]{1,256}\\z";break;case "sessionId":case "uniqueContextId":pattern=@"\\A[A-Za-z0-9_.:-]{1,128}\\z";break;default:throw new System.InvalidOperationException("pcb-diagnostic-saved-cache-held-field");}Need(System.Text.RegularExpressions.Regex.IsMatch(value,pattern));return value;}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){string name=entry.Key as string;bool found=false;foreach(string expected in names)if(name==expected)found=true;Need(found);Field(name,entry.Value);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__heldcache_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text+"\\0";}
static string Smoke(string name){if(name=="projectUuid")return new string('a',64);if(name=="branchUuid")return new string('b',32);return "__heldcache_"+name+"__";}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i],names=row[2].Split(',');var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);foreach(string name in names)fields.Add(name,Smoke(name));System.Func<int,string,string,string> encode=(id,phase,method)=>Encode(id,phase,method,fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encode(73,row[0],row[1])))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>encode(0,row[0],row[1]));Refused(()=>encode(int.MinValue,row[0],row[1]));Need(encode(1,row[0],row[1]).StartsWith("{\\"id\\":1,",System.StringComparison.Ordinal));Need(encode(int.MaxValue,row[0],row[1]).StartsWith("{\\"id\\":2147483647,",System.StringComparison.Ordinal));Refused(()=>encode(1,"unknown",row[1]));Refused(()=>encode(1,row[0],"Runtime.evaluate"));foreach(string extra in new string[]{"program","functionDeclaration","params","objectGroup","heldCachePhase","requestId","budget"}){fields.Add(extra,"copied");Refused(()=>encode(1,row[0],row[1]));fields.Remove(extra);}foreach(string name in names){object original=fields[name];fields.Remove(name);Refused(()=>encode(1,row[0],row[1]));fields.Add(name,original);foreach(object invalid in new object[]{null,1L,"",new string('x',257),(string)original+"\\n",(string)original+"\\"",(string)original+"\\\\"}){fields[name]=invalid;Refused(()=>encode(1,row[0],row[1]));}fields[name]=original;}}}
}`;
}
