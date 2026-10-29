/** Generated exact UI grammar for a separately sealed copy-purpose owner.
 * Session/process/source lifetime and request reservations remain its duties. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_UI_CALLS as CALLS } from "./current-footprint-copy-ui-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_UI_GROUP, CURRENT_FOOTPRINT_COPY_UI_FLAGS as FLAGS } from "./current-footprint-copy-ui-command.ts";
import type { CurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import { currentFootprintCopyUiWire } from "./current-footprint-copy-ui-wire.ts";

const sessionId = "__copyui_sessionId__";
const target = [{ value: "a".repeat(64) }, { value: "b".repeat(32) }, { value: "copyui_tab" }];
const object = (index: number): Readonly<{ objectId: string }> => ({ objectId: `__copyui_argument${String(index)}__` });
const templateValues: Readonly<Record<string, string>> = Object.freeze({ projectUuid: target[0]?.value ?? "",
  branchUuid: target[1]?.value ?? "", windowTabId: target[2]?.value ?? "" });
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintCopyUiNativeCases(): readonly CurrentFootprintCopyUiCommand[] {
  const commands: CurrentFootprintCopyUiCommand[] = [{ phase: "initial", method: "Runtime.callFunctionOn", sessionId,
    params: { ...FLAGS, uniqueContextId: "__copyui_uniqueContextId__", functionDeclaration: CALLS.initial.program, arguments: target, returnByValue: false } }];
  const args = { notificationRecheck: [object(0), ...target], responder: [object(0)], responderRecheck: [object(0), object(1)],
    route: [object(0), ...target], registry: [object(0), ...target], registryContextProducer: [object(0), object(1), object(2), ...target],
    registryRecheck: [object(0), object(1), object(2), object(3), ...target], membership: [object(0), ...target, object(4), object(5)], routeRecheck: [object(0), ...target, object(4), object(5)] };
  for (const phase of ["notificationRecheck", "responder", "responderRecheck", "route", "registry", "registryContextProducer", "registryRecheck", "membership", "routeRecheck"] as const) {
    commands.push({ phase, method: "Runtime.callFunctionOn", sessionId, params: { ...FLAGS, objectId: "__copyui_objectId__",
      functionDeclaration: CALLS[phase].program, arguments: args[phase], returnByValue: CALLS[phase].returnByValue } });
  }
  commands.push({ phase: "registrySource", method: "Debugger.getScriptSource", sessionId, params: { scriptId: "__copyui_scriptId__" } },
  { phase: "properties", method: "Runtime.getProperties", sessionId,
    params: { objectId: "__copyui_objectId__", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: CURRENT_FOOTPRINT_COPY_UI_GROUP } });
  return Object.freeze(commands);
}
export function currentFootprintCopyUiNativeSource(): string {
  const rows: string[] = [];
  for (const original of currentFootprintCopyUiNativeCases()) {
    const wire = currentFootprintCopyUiWire(original, 1);
    const fields = Object.entries(wire.request).filter(([key]) => !["action", "requestId", "method", "parentPhase"].includes(key));
    const { phase, ...native } = original;
    let template = JSON.stringify(native);
    for (const [key, value] of fields) {
      const marker = `__copyui_${key}__`;
      if (value !== marker) {
        if (templateValues[key] !== value) { throw new Error("FOOTPRINT_COPY_UI_NATIVE_VALUE"); }
        template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker));
      }
      if (!template.includes(JSON.stringify(marker))) { throw new Error("FOOTPRINT_COPY_UI_NATIVE_FIELD"); }
    }
    if (Buffer.byteLength(template) > 16_384 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_COPY_UI_NATIVE_BOUND"); }
    rows.push([phase, original.method, fields.map(([key]) => key).join(","), template].join("\t"));
  }
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory compression of thirteen fixed grammar entries during generation.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintCopyUiProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-ui-protocol");}
static string[][] Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(bytes.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(bytes).digest("hex"))});
string[] rows=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');Need(rows.Length==13);string[][] result=new string[rows.Length][];for(int i=0;i<rows.Length;i++){result[i]=rows[i].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);string pattern=name=="projectUuid"?@"\\A[a-f0-9]{64}\\z":name=="branchUuid"?@"\\A[a-f0-9]{32}\\z":name=="windowTabId"?@"\\A[A-Za-z0-9_-]{1,128}\\z":name=="sessionId"||name=="uniqueContextId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(System.Text.RegularExpressions.Regex.IsMatch(value,pattern));return value;}
public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string session=Field("sessionId",originalParentSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__copyui_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\\0";}
}`;
}
