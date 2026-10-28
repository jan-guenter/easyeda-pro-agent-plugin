/** Exact C# encoder for the transaction collector. Inclusion in a helper does
 * not grant a route: only a distinct original copy execution owner may call it. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_RELATION as RELATION,
  CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES as SITES } from "./current-footprint-copy-transaction-clock.ts";
import type { CurrentFootprintCopyTransactionClockCommand } from "./current-footprint-copy-transaction-clock.ts";
import { currentFootprintCopyTransactionClockWire } from "./current-footprint-copy-transaction-clock-wire.ts";

const marker = (field: string): string => `__copyclock_${field}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintCopyTransactionClockNativeCases(): readonly CurrentFootprintCopyTransactionClockCommand[] {
  return Object.freeze([
    ...SITES.map(site => ({ method: "Debugger.setBreakpoint" as const,
      params: { location: { scriptId: marker("scriptId"), lineNumber: site.lineNumber, columnNumber: site.columnNumber } } })),
    ...SITES.map(site => ({ method: "Debugger.evaluateOnCallFrame" as const, params: { callFrameId: marker("callFrameId"),
      expression: site.expression, objectGroup: GROUP, returnByValue: false as const, silent: true as const, throwOnSideEffect: true as const,
      generatePreview: false as const, includeCommandLineAPI: false as const } } as const)),
    { method: "Runtime.callFunctionOn", params: { objectId: marker("objectId"), functionDeclaration: RELATION,
      arguments: [{ objectId: marker("sampleObjectId") }, { objectId: marker("lexicalBundleObjectId") }], objectGroup: GROUP,
      returnByValue: true, silent: true, throwOnSideEffect: true, generatePreview: false, awaitPromise: false, userGesture: false } },
    { method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } },
    { method: "Debugger.resume", params: {} },
    { method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ]);
}
export function currentFootprintCopyTransactionClockNativeSource(): string {
  const rows = currentFootprintCopyTransactionClockNativeCases().map(sample => {
    const wire = currentFootprintCopyTransactionClockWire(sample, 1, marker("sessionId"));
    const { id: _id, ...command } = wire.command;
    const fields = Object.keys(wire.request).filter(key => !["action", "requestId", "method", "clockPhase"].includes(key));
    const template = JSON.stringify(command);
    for (const field of fields) {
      if (wire.request[field] !== marker(field) || !template.includes(JSON.stringify(marker(field)))) {
        throw new Error("FOOTPRINT_COPY_CLOCK_NATIVE_FIELD");
      }
    }
    if (Buffer.byteLength(template) > 8192 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_COPY_CLOCK_NATIVE_BOUND"); }
    return [wire.request["clockPhase"], command.method, fields.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  if (bytes.length > 65_536) { throw new Error("FOOTPRINT_COPY_CLOCK_NATIVE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory compression of eight fixed command templates during generation.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintCopyTransactionClockProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-clock-protocol");}
static string[][] Load(){byte[] packed=System.Convert.FromBase64String(${literal(packed.toString("base64"))});byte[] bytes=new byte[${String(bytes.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(bytes).digest("hex"))});
string[] rows=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');Need(rows.Length==8);string[][] result=new string[rows.Length][];for(int i=0;i<rows.Length;i++){result[i]=rows[i].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);Need(System.Text.RegularExpressions.Regex.IsMatch(value,name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string session=Field("sessionId",originalWorkerSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__copyclock_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=8192);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\\0";}
}`;
}
