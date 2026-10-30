/** Fixed native command table for original cache construction observations. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_GROUP as GROUP,
  CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_SITES as SITES } from "./current-footprint-copy-cache-construction-contract.ts";
import type { CurrentFootprintCacheConstructionCommand } from "./current-footprint-copy-cache-construction-contract.ts";
import { currentFootprintCacheConstructionWire } from "./current-footprint-copy-cache-construction-wire.ts";
import type { CurrentFootprintCacheConstructionChannelCommand } from "./current-footprint-copy-cache-construction-wire.ts";

const marker = (name: string): string => name === "projectUuid" ? "a".repeat(64) : `__cacheconstruction_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintCacheConstructionNativeCases(): readonly CurrentFootprintCacheConstructionChannelCommand[] {
  const call = (role: keyof typeof CALLS, args: readonly Readonly<{ objectId: string } | { value: string | number | null }>[]): CurrentFootprintCacheConstructionCommand => ({
    method: "Runtime.callFunctionOn", params: { objectId: marker("objectId"), functionDeclaration: CALLS[role].program,
      arguments: args, objectGroup: GROUP, returnByValue: CALLS[role].returnByValue, silent: true, generatePreview: false,
      throwOnSideEffect: true, awaitPromise: false, userGesture: false } });
  const object = (index: number): Readonly<{ objectId: string }> => ({ objectId: marker(`arg${String(index)}ObjectId`) });
  const path = { value: marker("projectUuid") };
  const commands: CurrentFootprintCacheConstructionCommand[] = [
    ...SITES.map(site => ({ method: "Debugger.setBreakpoint" as const, params: { location: {
      scriptId: marker("scriptId"), lineNumber: site.lineNumber, columnNumber: site.columnNumber } } })),
    { method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } },
    { method: "Debugger.resume", params: {} },
    { method: "Debugger.evaluateOnCallFrame", params: { callFrameId: marker("callFrameId"), expression: "this", objectGroup: GROUP,
      returnByValue: false, silent: true, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } },
    { method: "Runtime.getProperties", params: { objectId: marker("objectId"), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    call("before", [path, { value: 0 }, { value: null }]), call("before", [path, { value: 1 }, object(2)]),
    call("bind", [path, { value: 0 }]), call("bind", [path, { value: 1 }]),
    call("after", [object(0), path, { value: 0 }]), call("after", [object(0), path, { value: 1 }]),
    call("join", [object(0), object(1), path]), { method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ];
  const result: CurrentFootprintCacheConstructionChannelCommand[] = [];
  for (const command of commands) { result.push(Object.freeze({ ...command, phase: "cache-construction", sessionId: marker("sessionId") })); }
  return Object.freeze(result);
}
export function currentFootprintCacheConstructionNativeSource(): string {
  const rows = currentFootprintCacheConstructionNativeCases().map(sample => {
    const wire = currentFootprintCacheConstructionWire(sample, 1);
    const { id: _id, phase: _phase, ...command } = wire.command;
    const fields = Object.keys(wire.request).filter(key => !["action", "requestId", "method", "cachePhase"].includes(key));
    let template = JSON.stringify(command);
    for (const field of fields) {
      if (wire.request[field] !== marker(field) || !template.includes(JSON.stringify(marker(field)))) { throw new Error("FOOTPRINT_CACHE_NATIVE_FIELD"); }
    }
    template = template.replaceAll(JSON.stringify(marker("projectUuid")), JSON.stringify("__cacheconstruction_projectUuid__"));
    if (Buffer.byteLength(template) > 16_384 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_CACHE_NATIVE_BOUND"); }
    return [wire.request["cachePhase"], command.method, fields.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  if (bytes.length > 65_536) { throw new Error("FOOTPRINT_CACHE_NATIVE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing of fourteen fixed native command templates during source generation.
  const packed = gzipSync(bytes, { level: 9 });
  const smokeHashes = currentFootprintCacheConstructionNativeCases().map(sample => {
    const { id: _id, phase: _phase, ...command } = currentFootprintCacheConstructionWire(sample, 1).command;
    return createHash("sha256").update(`${JSON.stringify({ id: 1, ...command })}\0`).digest("hex");
  });
  return `public static class EasyedaFootprintCacheConstructionProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-cache-construction-protocol");}
static string[][] Load(){return EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},14,4);}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);Need(System.Text.RegularExpressions.Regex.IsMatch(value,name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":name=="projectUuid"?@"\\A[a-f0-9]{64}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string session=Field("sessionId",originalWorkerSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;
foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__cacheconstruction_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\\0";}
static void Reject(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${literal(smokeHashes.join(","))}.Split(',');Need(hashes.Length==Cases.Length);for(int i=0;i<Cases.Length;i++){string[] row=Cases[i],names=row[2].Length==0?new string[0]:row[2].Split(',');var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);foreach(string name in names)fields.Add(name,name=="projectUuid"?new string('a',64):"__cacheconstruction_"+name+"__");string session="__cacheconstruction_sessionId__";
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(Encode(1,row[0],row[1],session,fields)))).Replace("-","").ToLowerInvariant()==hashes[i]);
Reject(()=>Encode(0,row[0],row[1],session,fields));Reject(()=>Encode(1,"unknown",row[1],session,fields));Reject(()=>Encode(1,row[0],"Runtime.evaluate",session,fields));Reject(()=>Encode(1,row[0],row[1],session+"\\n",fields));fields.Add("sessionId","foreign");Reject(()=>Encode(1,row[0],row[1],session,fields));fields.Remove("sessionId");foreach(string name in names){object original=fields[name];fields[name]=(string)original+"\\n";Reject(()=>Encode(1,row[0],row[1],session,fields));fields[name]=original;}}}
}`;
}
