/** Fixed C#5 completion encoder for a future original-main purpose. This
 * source is not a native dispatch action, origin issuer or writer reservation. */
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-completion-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER as ORDER } from "./current-footprint-copy-main-completion-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS as REQUESTS, currentFootprintCopyMainCompletionSourceArm } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand as Command } from "./current-footprint-copy-main-completion-protocol.ts";
import { currentFootprintCopyMainCompletionWire } from "./current-footprint-copy-main-completion-wire.ts";

const marker = (name: string): string => `__maincompletion_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const sample = (name: string): string => `completion_${name}`;
export function currentFootprintCopyMainCompletionNativeCases(): readonly Command[] {
  const commands: Command[] = [];
  for (const stage of ORDER) {
    if (stage !== "callback-enter") { commands.push(currentFootprintCopyMainCompletionSourceArm(stage, sample("scriptId"))); }
  }
  commands.push({ phase: "completion-callback-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: sample("objectId") } });
  for (const role of [...ORDER, "project-sql-caller"] as const) {
    commands.push({ phase: "completion-frame", role, method: "Debugger.evaluateOnCallFrame", params: {
      callFrameId: sample("callFrameId"), expression: EXPRESSIONS[role], objectGroup: GROUP, silent: true,
      returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false,
    } });
  }
  for (const stage of ORDER) {
    const program = PROGRAMS[stage];
    commands.push({ phase: "completion-join", stage, method: "Runtime.callFunctionOn", params: { ...FLAGS,
      objectId: sample("objectId"), functionDeclaration: program.program,
      arguments: Array.from({ length: program.arguments }, (_unused, index) => ({ objectId: sample(`argument${String(index)}`) })),
      returnByValue: program.returnByValue,
    } });
  }
  commands.push({ phase: "completion-properties", method: "Runtime.getProperties", params: {
    objectId: sample("objectId"), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false,
  } }, { phase: "completion-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: sample("breakpointId") } },
  { phase: "completion-resume", method: "Debugger.resume", params: {} },
  { phase: "completion-resume-final-pb", method: "Debugger.resume", params: {} },
  { phase: "completion-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } });
  return Object.freeze(commands);
}
/** Emit the fixed native completion codec used by the retained original main.
 * The returned source encodes reviewed completion roles only; generation does not
 * observe callback return, detached cleanup or a saved copy.
 */
export function currentFootprintCopyMainCompletionNativeSource(): string {
  const cases = currentFootprintCopyMainCompletionNativeCases();
  const rows = cases.map(command => {
    const wire = currentFootprintCopyMainCompletionWire(command, 1);
    const names = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    let template = JSON.stringify({ method: command.method, params: command.params });
    for (const name of names) {
      const value = wire.request[name];
      if (typeof value !== "string" || !template.includes(JSON.stringify(value))) { throw new Error("FOOTPRINT_MAIN_COMPLETION_NATIVE_FIELD"); }
      template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(name)));
    }
    if (Buffer.byteLength(template) > 65_536 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_MAIN_COMPLETION_NATIVE_TEMPLATE"); }
    return [wire.request["phase"], command.method, names.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministically pack only the finite facade-generated table in memory.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = cases.map(command => createHash("sha256").update(JSON.stringify({ id: 73, method: command.method, params: command.params })).digest("hex"));
  return `public static class EasyedaFootprintCopyMainCompletionProtocol {
public const int NormalRequests=${String(REQUESTS.normal)},CleanupRequests=${String(REQUESTS.cleanup)},Requests=${String(REQUESTS.total)};
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-main-completion-protocol");}
static string[][] Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(bytes.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int n=stream.Read(bytes,count,bytes.Length-count);if(n==0)break;count+=n;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(bytes).digest("hex"))});
string[] rows=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');Need(rows.Length==48);var result=new string[rows.Length][];for(int i=0;i<rows.Length;i++){result[i]=rows[i].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
static string Field(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return "\\""+value+"\\"";}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names){Need(fields.Contains(name));Field(fields[name]);}foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__maincompletion_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append(Field(fields[name]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
static string Smoke(string name){return "completion_"+name;}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,Smoke(name));System.Func<string> encode=()=>Encode(73,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encode()))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(0,row[0],row[1],fields));Refused(()=>Encode(-1,row[0],row[1],fields));Refused(()=>Encode(73,"unknown",row[1],fields));Refused(()=>Encode(73,row[0],"Runtime.evaluate",fields));foreach(string extra in new string[]{"sessionId","url","functionDeclaration","expression","condition","lineNumber","columnNumber","argument2"}){fields.Add(extra,"copied");Refused(()=>{encode();});fields.Remove(extra);}foreach(string name in row[2].Split(',')){if(name.Length==0)continue;object original=fields[name];fields.Remove(name);Refused(()=>{encode();});fields.Add(name,original);foreach(object invalid in new object[]{null,1L,"",new string('x',257),(string)original+"\\n",(string)original+"\\"",(string)original+"\\\\"}){fields[name]=invalid;Refused(()=>{encode();});}fields[name]=original;}}}
}`;
}
