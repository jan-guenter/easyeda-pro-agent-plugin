/** Compact fixed native grammar for the retained parent pause and one diagnostic
 * message. This encoder never selects a session from caller-supplied fields. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_GROUP as GROUP, CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-parent-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES as SITES } from "./current-footprint-copy-parent-worker-source.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_GROUP as PEER_GROUP, CURRENT_FOOTPRINT_COPY_PARENT_WORKER_PROGRAMS as PEER_PROGRAMS } from "./current-footprint-copy-parent-worker-programs.ts";
import { currentFootprintCopyParentWire } from "./current-footprint-copy-parent-wire.ts";
import type { CurrentFootprintParentCommand, CurrentFootprintParentCommandKind } from "./current-footprint-copy-parent-wire.ts";

const marker = (name: string): string => `__footparent_${name}__`;
const literal = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
const child = marker("childSession"), parent = marker("parentSession");
type Sample = Readonly<{ kind: CurrentFootprintParentCommandKind; command: CurrentFootprintParentCommand }>;
export function currentFootprintCopyParentNativeCases(): readonly Sample[] {
  const flags = { objectGroup: GROUP, silent: true, generatePreview: false, returnByValue: true,
    awaitPromise: false, throwOnSideEffect: true, userGesture: false } as const;
  const construction: CurrentFootprintParentCommand[] = [
    { phase: "source", method: "Debugger.getScriptSource", sessionId: parent, params: { scriptId: marker("scriptId") } },
    ...(["before", "after"] as const).map(side => ({ phase: `breakpoint-${side}` as const, method: "Debugger.setBreakpoint" as const, sessionId: parent,
      params: { location: { scriptId: marker("scriptId"), lineNumber: SITES[side].lineNumber, columnNumber: SITES[side].columnNumber } } })),
    { phase: "remove", method: "Debugger.removeBreakpoint", sessionId: parent, params: { breakpointId: marker("breakpointId") } },
    { phase: "resume", method: "Debugger.resume", sessionId: parent, params: {} },
    { phase: "receiver", method: "Debugger.evaluateOnCallFrame", sessionId: parent,
      params: { callFrameId: marker("callFrameId"), expression: "this", objectGroup: GROUP, returnByValue: false,
        silent: true, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } },
    { phase: "before", method: "Runtime.callFunctionOn", sessionId: parent, params: { ...flags, objectId: marker("objectId"),
      functionDeclaration: PROGRAMS.before, arguments: [{ value: "b".repeat(64) }, { value: marker("arg1Value") }] } },
    { phase: "after", method: "Runtime.callFunctionOn", sessionId: parent, params: { ...flags, objectId: marker("objectId"),
      functionDeclaration: PROGRAMS.after, arguments: [{ objectId: marker("arg0ObjectId") }, { value: "b".repeat(64) }, { value: marker("arg2Value") }] } },
    { phase: "release", method: "Runtime.releaseObjectGroup", sessionId: parent, params: { objectGroup: GROUP } },
  ];
  const peer: CurrentFootprintParentCommand[] = Object.entries(PEER_PROGRAMS).map(([name, program]) => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.entries enumerates this frozen, own-data-only fixed program table; no caller object participates.
    const phase = name as keyof typeof PEER_PROGRAMS;
    const select = phase === "parentSelect" || phase === "childSelect";
    const readonly = select || phase === "parentRecheck" || phase === "childRecheck" || phase === "managerJoin";
    const args = select ? [] : [{ value: "a".repeat(64) }];
    return { phase, method: "Runtime.callFunctionOn", sessionId: phase.startsWith("child") ? child : parent,
      params: { ...(phase === "childSelect" ? { uniqueContextId: marker("uniqueContextId") } : { objectId: marker("objectId") }),
        functionDeclaration: program, arguments: phase === "managerJoin" ? [{ objectId: marker("arg0ObjectId") }, ...args] : args,
        objectGroup: PEER_GROUP, returnByValue: !select, awaitPromise: phase === "childReceipt", silent: true,
        generatePreview: false, userGesture: false, throwOnSideEffect: readonly } };
  });
  peer.push({ phase: "properties", method: "Runtime.getProperties", sessionId: parent,
    params: { objectId: marker("objectId"), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "release", method: "Runtime.releaseObjectGroup", sessionId: parent, params: { objectGroup: PEER_GROUP } });
  return Object.freeze([...construction.map(command => Object.freeze({ kind: "construction" as const, command })),
    ...peer.map(command => Object.freeze({ kind: "peer" as const, command }))]);
}
/** Generate separate construction and parent/child-peer command cases with their
 * reviewed realms and argument slots. Packing preserves the native wire; generating
 * a codec does not bind a live worker, channel peer or manager.
 */
export function currentFootprintCopyParentNativeSource(): string {
  const rows = currentFootprintCopyParentNativeCases().map(sample => {
    const wire = currentFootprintCopyParentWire(sample.command, 1, sample.kind, parent, child);
    const { id: _id, phase: _phase, ...command } = wire.command;
    const fields = Object.keys(wire.request).filter(name => !["action", "requestId", "method", "parentStage", "realm"].includes(name));
    let template = JSON.stringify(command).replace(JSON.stringify(command.sessionId), JSON.stringify(marker("sessionId")));
    for (const field of fields) {
      const value = wire.request[field];
      if (typeof value !== "string") { throw new TypeError("FOOTPRINT_PARENT_NATIVE_FIELD"); }
      template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(field)));
    }
    if (Buffer.byteLength(template) > 16_384 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_PARENT_NATIVE_BOUND"); }
    return [wire.request["parentStage"], command.method, fields.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0")); if (bytes.length > 65_536 || rows.length !== 20) { throw new Error("FOOTPRINT_PARENT_NATIVE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory build compression for the fixed command table.
  const packed = gzipSync(bytes, { level: 9 });
  const smokeRows = currentFootprintCopyParentNativeCases().map(sample => {
    const wire = currentFootprintCopyParentWire(sample.command, 1, sample.kind, parent, child);
    const { id: _id, phase: _phase, ...command } = wire.command;
    const fields = Object.entries(wire.request).filter(([name]) => !["action", "requestId", "method", "parentStage", "realm"].includes(name));
    return [wire.request["parentStage"], command.method, wire.request["realm"], fields.map(([name]) => name).join(","),
      fields.map(([, value]) => value).join(","), JSON.stringify({ id: 1, ...command })].join("\t");
  });
  const smokeBytes = Buffer.from(smokeRows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Exact TypeScript wire cases are compressed as independent native compile-only parity vectors.
  const smokePacked = gzipSync(smokeBytes, { level: 9 });
  return `public static class EasyedaFootprintCopyParentProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-parent-protocol");}
static string[][] Load(){return EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},20,4);}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Encode(int id,string phase,string method,string realm,string originalParentSession,string originalChildSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null&&(realm=="parent"||realm=="child"));
Need(!phase.StartsWith("construction-",System.StringComparison.Ordinal)||realm=="parent");Need(!phase.StartsWith("peer-child",System.StringComparison.Ordinal)||realm=="child");Need(!(phase.StartsWith("peer-parent",System.StringComparison.Ordinal)||phase=="peer-managerJoin")||realm=="parent");
string session=Field("sessionId",realm=="parent"?originalParentSession:originalChildSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
foreach(string name in names){if(!name.EndsWith("Value",System.StringComparison.Ordinal))continue;string pattern=(phase=="construction-before"&&name=="arg1Value"||phase=="construction-after"&&name=="arg2Value")?@"\\A[A-Za-z0-9_-]{1,128}\\z":@"\\A[a-f0-9]{64}\\z";Need(fields[name] is string&&System.Text.RegularExpressions.Regex.IsMatch((string)fields[name],pattern));}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__footparent_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\\0";}
public static void VerifySmoke(){byte[] packed=System.Convert.FromBase64String(${literal(smokePacked.toString("base64"))});byte[] bytes=new byte[${String(smokeBytes.length)}];int count=0;
using(var input=new System.IO.MemoryStream(packed,false))using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)){while(count<bytes.Length){int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read;}Need(count==bytes.Length&&stream.ReadByte()==-1);}
using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(createHash("sha256").update(smokeBytes).digest("hex"))});
string[] rows=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');Need(rows.Length==20);foreach(string row in rows){string[] parts=row.Split('\\t');Need(parts.Length==6);var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);string[] names=parts[3].Length==0?new string[0]:parts[3].Split(','),values=parts[4].Length==0?new string[0]:parts[4].Split(',');Need(names.Length==values.Length);for(int i=0;i<names.Length;i++)fields.Add(names[i],values[i]);
Need(Encode(1,parts[0],parts[1],parts[2],${literal(parent)},${literal(child)},fields)==parts[5]+"\\0");
fields.Add("sessionId","foreign");bool refused=false;try{Encode(1,parts[0],parts[1],parts[2],${literal(parent)},${literal(child)},fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);fields.Remove("sessionId");
foreach(string name in names){if(!name.EndsWith("Value",System.StringComparison.Ordinal))continue;object original=fields[name];fields[name]="bad value";refused=false;try{Encode(1,parts[0],parts[1],parts[2],${literal(parent)},${literal(child)},fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);fields[name]=original;}
if(parts[0].StartsWith("construction-",System.StringComparison.Ordinal)||parts[0].StartsWith("peer-child",System.StringComparison.Ordinal)||parts[0].StartsWith("peer-parent",System.StringComparison.Ordinal)||parts[0]=="peer-managerJoin"){refused=false;try{Encode(1,parts[0],parts[1],parts[2]=="parent"?"child":"parent",${literal(parent)},${literal(child)},fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
}`;
}
