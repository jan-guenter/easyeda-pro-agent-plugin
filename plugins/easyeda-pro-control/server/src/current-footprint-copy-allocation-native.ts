/** Closed pre-await allocation codec. Existing native purposes refuse its
 * use; exact encoding and accounting grant no dispatch authority. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_ALLOCATION_FRAMES as FRAMES, CURRENT_FOOTPRINT_COPY_ALLOCATION_GROUP as GROUP,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_RELATION as RELATION, CURRENT_FOOTPRINT_COPY_ALLOCATION_SITE as SITE } from "./current-footprint-copy-allocation-contract.ts";
import type { CurrentFootprintCopyAllocationCommand } from "./current-footprint-copy-allocation-contract.ts";
import { currentFootprintCopyAllocationWire } from "./current-footprint-copy-allocation-wire.ts";

const marker = (name: string): string => `__copyallocation_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintCopyAllocationNativeCases(): readonly CurrentFootprintCopyAllocationCommand[] {
  const sessionId = marker("sessionId");
  const flags = { objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true } as const;
  return Object.freeze([
    { phase: "allocation-arm", method: "Debugger.setBreakpoint", sessionId, params: { location: { scriptId: marker("scriptId"), lineNumber: SITE.lineNumber, columnNumber: SITE.columnNumber }, condition: "true" } },
    ...Object.values(FRAMES).map(expression => ({ phase: "allocation-frame" as const, method: "Debugger.evaluateOnCallFrame" as const, sessionId,
      params: { ...flags, callFrameId: marker("callFrameId"), expression, includeCommandLineAPI: false as const } })),
    { phase: "allocation-source", method: "Debugger.getScriptSource", sessionId, params: { scriptId: marker("scriptId") } },
    { phase: "allocation-join", method: "Runtime.callFunctionOn", sessionId, params: { ...flags, objectId: marker("objectId"), functionDeclaration: RELATION,
      arguments: Array.from({ length: 8 }, (_, index) => ({ objectId: marker(`arg${String(index)}ObjectId`) })), awaitPromise: false, userGesture: false } },
    { phase: "allocation-properties", method: "Runtime.getProperties", sessionId, params: { objectId: marker("objectId"), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "allocation-remove", method: "Debugger.removeBreakpoint", sessionId, params: { breakpointId: marker("breakpointId") } },
    { phase: "allocation-resume", method: "Debugger.resume", sessionId, params: {} },
    { phase: "allocation-release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: GROUP } },
  ]);
}
export function currentFootprintCopyAllocationNativeSource(): string {
  const cases = currentFootprintCopyAllocationNativeCases();
  const rows: string[] = [];
  const hashes: string[] = [];
  for (const original of cases) {
    const wire = currentFootprintCopyAllocationWire(original, 73, original.sessionId);
    const fields = Object.keys(wire.request).filter(key => !["action", "requestId", "phase", "method"].includes(key));
    const { phase: _phase, ...native } = original; const text = JSON.stringify(native);
    if (Buffer.byteLength(text) > 16_384 || text.includes("\0") || text.includes("\t")) { throw new Error("FOOTPRINT_ALLOCATION_NATIVE_BOUND"); }
    rows.push([wire.request["phase"], original.method, fields.join(","), text].join("\t"));
    const sample = JSON.stringify({ id: 73, ...native }).replaceAll(/__copyallocation_([A-Za-z0-9]+)__/gu, (_match, name: string) => `allocation_${name}`);
    hashes.push(createHash("sha256").update(`${sample}\0`).digest("hex"));
  }
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic bounded packing of ten immutable native cases during source generation.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintCopyAllocationProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-allocation-protocol");}
static string[][] Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(bytes.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(bytes).digest("hex"))});
string[] rows=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');Need(rows.Length==10);string[][] result=new string[rows.Length][];for(int i=0;i<rows.Length;i++){result[i]=rows[i].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string session=Field("sessionId",originalWorkerSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names){Need(fields.Contains(name));Field(name,fields[name]);}foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
var output=new System.Text.StringBuilder();string template=selected[3];int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__copyallocation_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return text+"\\0";}
public static void VerifySmoke(){string[] hashes={${hashes.map(value => literal(value)).join(",")}};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"allocation_"+name);string text=Encode(73,row[0],row[1],"allocation_sessionId",fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[i]);
System.Action<System.Action> refuse=action=>{bool failed=false;try{action();}catch(System.InvalidOperationException){failed=true;}Need(failed);};refuse(()=>Encode(0,row[0],row[1],"allocation_sessionId",fields));refuse(()=>Encode(73,row[0],"Runtime.evaluate","allocation_sessionId",fields));refuse(()=>Encode(73,"unknown",row[1],"allocation_sessionId",fields));refuse(()=>Encode(73,row[0],row[1],"bad\\n",fields));foreach(string extra in new string[]{"sessionId","functionDeclaration","expression","condition","url"}){fields.Add(extra,"forged");refuse(()=>Encode(73,row[0],row[1],"allocation_sessionId",fields));fields.Remove(extra);}}}
}`;
}
