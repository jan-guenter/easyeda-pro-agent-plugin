/** Fixed future-purpose native request table. Not mounted in ordinary/main
 * diagnostic owners; reconstruction cannot select arbitrary inspector code. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentFootprintCopyMainRequestSourceArm } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand as Command } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_FLAGS as FLAGS } from "./current-footprint-copy-main-request-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_EXPRESSIONS as EXPRESSIONS,
  CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_EXPRESSIONS as INVOCATION, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-request-collect-programs.ts";
import { currentFootprintCopyMainRequestWire } from "./current-footprint-copy-main-request-wire.ts";

const marker = (name: string): string => `__mainrequest_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sample = (name: string): string => {
  if (name === "projectUuid") { return "a".repeat(64); } if (name === "projectKey") { return "c".repeat(64); }
  if (name === "branchUuid") { return "b".repeat(32); } if (name === "path") { return "inert_request_path"; }
  if (name === "dataStr") { return "inert_request_body"; } return `request_${name}`;
};
export function currentFootprintCopyMainRequestNativeCases(): readonly Command[] {
  const objectId = sample("objectId"); const handle = (name: string): Readonly<{ objectId: string }> => ({ objectId: sample(name) });
  const plan = { projectUuid: sample("projectUuid"), branchUuid: sample("branchUuid"), projectKey: sample("projectKey"), path: sample("path"), dataStr: sample("dataStr") };
  return Object.freeze([
    { phase: "request-driver-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId } },
    ...(["context", "controller", "editHead"] as const).map(role => currentFootprintCopyMainRequestSourceArm(role, sample("scriptId"))),
    ...Object.values(INVOCATION).map(expression => ({ phase: "request-invocation-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: sample("callFrameId"), expression,
      objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }) as const),
    ...Object.values(EXPRESSIONS).map(expression => ({ phase: "request-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: sample("callFrameId"), expression,
      objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }) as const),
    { phase: "request-invocation", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: PROGRAMS.invocation, arguments: [handle("argument0"), handle("argument1")], returnByValue: false } },
    { phase: "request-context-join", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: PROGRAMS.contextJoin, arguments: [handle("argument0")], returnByValue: true } },
    { phase: "request-context", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS.context.program, arguments: [handle("argument0")], returnByValue: false } },
    { phase: "request-controller", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS.controller.program, arguments: [handle("argument0"), { value: plan }], returnByValue: false } },
    { phase: "request-actor", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS.actor.program, arguments: [handle("argument0"), handle("argument1")], returnByValue: false } },
    { phase: "request-sql", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS.sql.program, arguments: [handle("argument0")], returnByValue: false } },
    { phase: "request-value", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS.value.program, arguments: [], returnByValue: true } },
    { phase: "request-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "request-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: sample("breakpointId") } },
    { phase: "request-resume", method: "Debugger.resume", params: {} },
    { phase: "request-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ] satisfies Command[]);
}
const nativeQuote = String.raw`static string Quote(string value){var b=new System.Text.StringBuilder();b.Append('"');for(int i=0;i<value.Length;i++){char c=value[i];if(char.IsHighSurrogate(c)){Need(i+1<value.Length&&char.IsLowSurrogate(value[i+1]));b.Append(c);b.Append(value[++i]);}else{Need(!char.IsLowSurrogate(c));if(c=='"'||c=='\\'){b.Append('\\');b.Append(c);}else if(c=='\b')b.Append("\\b");else if(c=='\t')b.Append("\\t");else if(c=='\n')b.Append("\\n");else if(c=='\f')b.Append("\\f");else if(c=='\r')b.Append("\\r");else if(c<32){b.Append("\\u");b.Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));}else b.Append(c);}}b.Append('"');return b.ToString();}`;
export function currentFootprintCopyMainRequestNativeSource(): string {
  const cases = currentFootprintCopyMainRequestNativeCases();
  const rows = cases.map(command => {
    const wire = currentFootprintCopyMainRequestWire(command, 1); const names = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    const { phase: _phase, ...native } = command; let template = JSON.stringify(native);
    for (const name of names) { const value = wire.request[name]; if (typeof value !== "string" || !template.includes(JSON.stringify(value))) { throw new Error("MAIN_REQUEST_NATIVE_FIELD"); }
      template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(name))); }
    if (Buffer.byteLength(template) > 65_536 || template.includes("\0") || template.includes("\t")) { throw new Error("MAIN_REQUEST_NATIVE_TEMPLATE"); }
    return [wire.request["phase"], command.method, names.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing of the finite fixed native table.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = cases.map(command => { const { phase: _phase, ...native } = command; return createHash("sha256").update(JSON.stringify({ id: 73, ...native })).digest("hex"); });
  return `public static class EasyedaFootprintCopyMainRequestProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-main-request-protocol");}
static string[][] Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(bytes.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int n=stream.Read(bytes,count,bytes.Length-count);if(n==0)break;count+=n;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(bytes).digest("hex"))});
string[] rows=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');Need(rows.Length==21);var result=new string[rows.Length][];for(int i=0;i<rows.Length;i++){result[i]=rows[i].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
${nativeQuote}
static string Field(string name,object input){string value=input as string;Need(value!=null);if(name=="dataStr"||name=="path"){Need(value.Length>0&&value.Length<=(name=="path"?4096:16384));if(name=="dataStr")Need(System.Text.Encoding.UTF8.GetByteCount(value)<=16384);return Quote(value);}if(name=="projectUuid"||name=="projectKey"||name=="branchUuid")Need(System.Text.RegularExpressions.Regex.IsMatch(value,name=="branchUuid"?@"\\A[a-f0-9]{32}\\z":@"\\A[a-f0-9]{64}\\z"));else Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return Quote(value);}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__mainrequest_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append(Field(name,fields[name]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
static string Smoke(string name){if(name=="projectUuid")return new string('a',64);if(name=="projectKey")return new string('c',64);if(name=="branchUuid")return new string('b',32);if(name=="path")return "inert_request_path";if(name=="dataStr")return "inert_request_body";return "request_"+name;}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=new string[]{${hashes.map(value => literal(value)).join(",")}};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,Smoke(name));string output=Encode(73,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(output))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(73,"unknown",row[1],fields));Refused(()=>Encode(73,row[0],"Runtime.evaluate",fields));fields.Add("sessionId","copied");Refused(()=>Encode(73,row[0],row[1],fields));fields.Remove("sessionId");fields.Add("functionDeclaration","function(){}");Refused(()=>Encode(73,row[0],row[1],fields));fields.Remove("functionDeclaration");Refused(()=>Encode(0,row[0],row[1],fields));if(fields.Contains("dataStr")){fields["dataStr"]=new string('x',65536);Refused(()=>Encode(73,row[0],row[1],fields));fields["dataStr"]=new string((char)0xd800,1);Refused(()=>Encode(73,row[0],row[1],fields));}}}
}`;
}
