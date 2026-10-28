/** Seven fixed native entries, packed with exact decoded length and hash.
 * Inclusion alone mounts no route and authorizes no document-clock or writer. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_FLAGS as FLAGS,
  CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_GROUP as GROUP } from "./current-footprint-copy-clock-registration-contract.ts";
import type { CurrentFootprintCopyClockRegistrationCommand as Command } from "./current-footprint-copy-clock-registration-contract.ts";
import { currentFootprintCopyClockRegistrationWire } from "./current-footprint-copy-clock-registration-wire.ts";

const marker = (field: string): string => `__copyregistration_${field}__`;
const literal = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
const target = [{ value: "a".repeat(64) }, { value: "b".repeat(32) }, { value: "copyregistration_tab" }];
const object = (index: number): Readonly<{ objectId: string }> => ({ objectId: marker(`argument${String(index)}`) });
const templateValues: Readonly<Record<string, string>> = Object.freeze({ projectUuid: target[0]?.value ?? "", branchUuid: target[1]?.value ?? "", windowTabId: target[2]?.value ?? "" });
const smokeValue = (name: string): string => ({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "clock_tab", sessionId: "clock_parent" }[name] ?? "clock_handle");
export function currentFootprintCopyClockRegistrationNativeCases(): readonly Command[] {
  const commands: Command[] = [];
  const args = { initial: target, callback: [], bindings: [object(0), object(1), object(2), ...target], sample: [object(0), object(1), object(2), object(3), ...target] };
  for (const phase of ["initial", "callback", "bindings", "sample"] as const) { commands.push({ phase, method: "Runtime.callFunctionOn", sessionId: marker("sessionId"), params: { ...FLAGS, objectId: marker("objectId"),
    functionDeclaration: CALLS[phase].program, arguments: args[phase], returnByValue: CALLS[phase].returnByValue } }); }
  commands.push({ phase: "properties", method: "Runtime.getProperties", sessionId: marker("sessionId"), params: { objectId: marker("objectId"), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "source", method: "Debugger.getScriptSource", sessionId: marker("sessionId"), params: { scriptId: marker("scriptId") } },
    { phase: "release", method: "Runtime.releaseObjectGroup", sessionId: marker("sessionId"), params: { objectGroup: GROUP } });
  return Object.freeze(commands);
}
export function currentFootprintCopyClockRegistrationNativeSource(): string {
  const rows = currentFootprintCopyClockRegistrationNativeCases().map(original => {
    const wire = currentFootprintCopyClockRegistrationWire(original, 1, marker("sessionId"));
    const fields = Object.entries(wire.request).filter(([name]) => !["action", "requestId", "method", "parentPhase"].includes(name));
    const { phase, ...native } = original; let template = JSON.stringify(native);
    for (const [name, value] of fields) {
      if (value !== marker(name)) { if (templateValues[name] !== value) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_NATIVE_VALUE"); } template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(name))); }
      if (!template.includes(JSON.stringify(marker(name)))) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_NATIVE_FIELD"); }
    }
    if (Buffer.byteLength(template) > 16_384 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_NATIVE_BOUND"); }
    return [phase, original.method, fields.map(([name]) => name).join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  const smokeHashes = rows.map(row => {
    const template = row.split("\t")[3]; if (template === undefined) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_NATIVE_SMOKE"); }
    const restored = template.replaceAll(/"__copyregistration_([A-Za-z\d]+)__"/gu, (_whole, name: string) => JSON.stringify(smokeValue(name)));
    return createHash("sha256").update(`{"id":73,${restored.slice(1)}\0`).digest("hex");
  });
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory compression of seven fixed protocol entries during generation.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintCopyClockRegistrationProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-clock-registration-protocol");}
static string[][] Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(bytes.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(bytes).digest("hex"))});
string[] rows=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');Need(rows.Length==7);string[][] result=new string[rows.Length][];for(int i=0;i<rows.Length;i++){result[i]=rows[i].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);string pattern=name=="projectUuid"?@"\\A[a-f0-9]{64}\\z":name=="branchUuid"?@"\\A[a-f0-9]{32}\\z":name=="windowTabId"?@"\\A[A-Za-z0-9_-]{1,128}\\z":name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(System.Text.RegularExpressions.Regex.IsMatch(value,pattern));return value;}
public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string session=Field("sessionId",originalParentSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__copyregistration_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\\0";}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
static string SmokeValue(string name){return name=="projectUuid"?new string('a',64):name=="branchUuid"?new string('b',32):name=="windowTabId"?"clock_tab":"clock_handle";}
public static void VerifySmoke(){string[] hashes=new string[]{${smokeHashes.map(value => literal(value)).join(",")}};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,SmokeValue(name));string output=Encode(73,row[0],row[1],"clock_parent",fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(output))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(73,"unknown",row[1],"clock_parent",fields));Refused(()=>Encode(73,row[0],"Runtime.evaluate","clock_parent",fields));fields.Add("sessionId","replacement");Refused(()=>Encode(73,row[0],row[1],"clock_parent",fields));fields.Remove("sessionId");fields.Add("functionDeclaration","function(){}");Refused(()=>Encode(73,row[0],row[1],"clock_parent",fields));fields.Remove("functionDeclaration");Refused(()=>Encode(0,row[0],row[1],"clock_parent",fields));if(fields.Contains("objectId")){fields["objectId"]="bad\\n";Refused(()=>Encode(73,row[0],row[1],"clock_parent",fields));}}}
}`;
}
