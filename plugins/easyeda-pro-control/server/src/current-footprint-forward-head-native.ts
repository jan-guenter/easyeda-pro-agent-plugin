/** Closed native head codebook. It shares the existing v2 Main counters and
 * never serializes SQL, programs, flags or ownership chosen by a caller. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentFootprintForwardWriterSelectedFileMainSqlFenceNativeCases, currentSelectedFileMainSqlFenceWire } from "./current-selected-file-main-sql-fence-native.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_CALLS as CALLS, CURRENT_FOOTPRINT_FORWARD_HEAD_GROUP as GROUP } from "./current-footprint-forward-head-programs.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_OPEN_POINT as POINT } from "./current-footprint-forward-head-source.ts";
import { validateCurrentFootprintForwardHeadMainCommand } from "./current-footprint-forward-head-protocol.ts";
import type { CurrentFootprintForwardHeadMainCommand as Command } from "./current-footprint-forward-head-protocol.ts";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as EARLY } from "./current-selected-file-main-sql-fence-protocol.ts";

const marker = (name: string): string => `__forwardhead_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function smokeValue(name: string, row: string): string {
  if (name === "path") { return String.raw`C:\Synthetic\fixture.eprj2`; }
  if (row.includes("forward-head-read:read") && name === "argument0") { return "a".repeat(64); }
  if (row.includes("forward-head-read:read") && name === "argument1") { return "b".repeat(32); }
  return "head_handle";
}
export function currentFootprintForwardHeadNativeWire(input: unknown, id: number): Readonly<{ command: Command;
  request: Readonly<Record<string, string | number>>; cleanup: boolean }> {
  if (!Number.isSafeInteger(id) || id < 1 || Object.is(id, -0)) { throw new Error("FORWARD_HEAD_NATIVE_ID"); }
  const command = validateCurrentFootprintForwardHeadMainCommand(input), inner = command.command;
  const request: Record<string, string | number> = { action: "footprint-forward-head-main", requestId: id, phase: `${command.phase}:${inner.phase}`, method: inner.method };
  if (command.phase === "forward-head-sql") {
    const wire = currentSelectedFileMainSqlFenceWire(command.command, id);
    for (const [name, value] of Object.entries(wire.request)) { if (!["action", "requestId", "phase", "method"].includes(name)) { request[name] = value; } }
  } else if (inner.method === "Runtime.callFunctionOn") {
    request["objectId"] = inner.params.objectId;
    for (const [index, argument] of inner.params.arguments.entries()) {
      request[`argument${String(index)}`] = "objectId" in argument ? argument.objectId : argument.value;
    }
  } else if (inner.method === "Runtime.awaitPromise") { request["promiseObjectId"] = inner.params.promiseObjectId; }
  else if (inner.method === "Debugger.setBreakpoint") { request["scriptId"] = inner.params.location.scriptId; }
  else if (inner.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = inner.params.callFrameId; }
  else if (inner.method === "Debugger.removeBreakpoint") { request["breakpointId"] = inner.params.breakpointId; }
  return Object.freeze({ command, request: Object.freeze(request), cleanup: inner.method === "Debugger.removeBreakpoint" || inner.method === "Debugger.resume" || inner.method === "Runtime.releaseObjectGroup" });
}
/** Synthetic placeholders enumerate the entire reviewed native vocabulary. */
export function currentFootprintForwardHeadNativeCases(): readonly Command[] {
  const selected: Command[] = [];
  for (const command of currentFootprintForwardWriterSelectedFileMainSqlFenceNativeCases()) {
    try { selected.push(validateCurrentFootprintForwardHeadMainCommand({ phase: "forward-head-sql", command })); }
    catch {
      // Every other selected-file lifecycle remains outside this codebook.
    }
  }
  const flags = { objectGroup: GROUP, silent: true, generatePreview: false, awaitPromise: false, userGesture: false } as const;
  const argument0 = { objectId: marker("argument0") }, argument1 = { objectId: marker("argument1") }, objectId = marker("objectId");
  selected.push(
    { phase: "forward-head-read", command: { phase: "capture", method: "Runtime.callFunctionOn", params: { ...flags, objectId, functionDeclaration: CALLS.capture, arguments: [argument0, argument1], returnByValue: false, throwOnSideEffect: false } } },
    { phase: "forward-head-read", command: { phase: "require", method: "Runtime.callFunctionOn", params: { ...flags, objectId, functionDeclaration: CALLS.require, arguments: [], returnByValue: true, throwOnSideEffect: true } } },
    { phase: "forward-head-read", command: { phase: "read", method: "Runtime.callFunctionOn", params: { ...flags, objectId, functionDeclaration: CALLS.read, arguments: [{ value: "a".repeat(64) }, { value: "b".repeat(32) }], returnByValue: false, throwOnSideEffect: false } } },
    { phase: "forward-head-read", command: { phase: "await", method: "Runtime.awaitPromise", params: { promiseObjectId: marker("promiseObjectId"), returnByValue: false, generatePreview: false } } },
    { phase: "forward-head-read", command: { phase: "completed", method: "Runtime.callFunctionOn", params: { ...flags, objectId, functionDeclaration: CALLS.completed, arguments: [argument0, argument1], returnByValue: true, throwOnSideEffect: false } } },
    { phase: "forward-head-read", command: { phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } } },
    { phase: "forward-head-open", command: { phase: "arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: marker("scriptId"), lineNumber: POINT.lineNumber, columnNumber: POINT.columnNumber } } } },
    { phase: "forward-head-open", command: { phase: "frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: marker("callFrameId"), expression: "[this,this.ctx,e,r]", objectGroup: GROUP,
      silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } } },
    { phase: "forward-head-open", command: { phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } } },
    { phase: "forward-head-open", command: { phase: "resume", method: "Debugger.resume", params: {} } },
    { phase: "forward-head-open", command: { phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: "easyeda-selected-file-main-sql-fence-v1" } } },
  );
  return Object.freeze(selected);
}
/** Emit only fixed JSON templates with bounded scalar holes. Native state and
 * original-process ownership are additionally enforced by the phase owner. */
export function currentFootprintForwardHeadNativeSource(): string {
  const rows = currentFootprintForwardHeadNativeCases().map(command => {
    const wire = currentFootprintForwardHeadNativeWire(command, 1);
    const fields = Object.entries(wire.request).filter(([name]) => !["action", "requestId", "phase", "method"].includes(name));
    const { phase: _phase, ...inner } = command.command; let template = JSON.stringify(inner);
    for (const [name, value] of fields) { template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(name))); }
    return [wire.request["phase"], command.command.method, fields.map(([name]) => name).join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  if (bytes.length > 65_536 || rows.length !== 19) { throw new Error("FORWARD_HEAD_NATIVE_TABLE_BOUND"); }
  const hashes = rows.map(row => {
    const template = row.split("\t")[3]; if (template === undefined) { throw new Error("FORWARD_HEAD_NATIVE_ROW"); }
    const restored = template.replaceAll(/"__forwardhead_([A-Za-z\d]+)__"/gu, (_whole, name: string) => JSON.stringify(smokeValue(name, row)));
    return createHash("sha256").update(`{"id":73,${restored.slice(1)}`).digest("hex");
  });
  // oxlint-disable-next-line node/no-sync -- Compress one bounded in-memory immutable codebook during deterministic generation.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintForwardHeadProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("forward-head-protocol");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},4);
static string Quote(string name,object input,string phase){string value=input as string;Need(value!=null&&value.Length>0&&value.Length<=(name=="path"?4096:256));if(name!="path"&&!(name=="breakpointId"&&value==${literal(EARLY)})){string pattern=phase=="forward-head-read:read"&&name=="argument0"?@"\\A(?:[a-f0-9]{32}|[a-f0-9]{64})\\z":phase=="forward-head-read:read"&&name=="argument1"?@"\\A[a-f0-9]{32}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(System.Text.RegularExpressions.Regex.IsMatch(value,pattern));}var result=new System.Text.StringBuilder();result.Append('"');for(int i=0;i<value.Length;i++){char c=value[i];Need(c>=32&&!char.IsLowSurrogate(c));if(char.IsHighSurrogate(c)){Need(i+1<value.Length&&char.IsLowSurrogate(value[i+1]));result.Append(c);result.Append(value[++i]);}else{if(c=='"'||c=='\\\\')result.Append('\\\\');result.Append(c);}}result.Append('"');return result.ToString();}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string text=selected[3];var result=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(text,"\\"__forwardhead_([A-Za-z0-9]+)__\\"")){result.Append(text,previous,match.Index-previous);result.Append(Quote(match.Groups[1].Value,fields[match.Groups[1].Value],phase));previous=match.Index+match.Length;}result.Append(text,previous,text.Length-previous);string output="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+result.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(output)<=16384);return output;}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,name=="path"?@"C:\\Synthetic\\fixture.eprj2":row[0]=="forward-head-read:read"&&name=="argument0"?new string('a',64):row[0]=="forward-head-read:read"&&name=="argument1"?new string('b',32):"head_handle");string output=Encode(73,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(output))).Replace("-","").ToLowerInvariant()==hashes[i]);bool refused=false;try{Encode(73,row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
int forwardHeadNormal,forwardHeadCleanup,forwardHeadProperties;bool forwardHeadSqlCaptured,forwardHeadReadAttempted,forwardHeadCompleted,forwardHeadReadReleased,forwardHeadSqlReleased;
public void SendForwardHeadMain(int id,string phase,string method,System.Collections.IDictionary fields){
if(!forwardExecution||originalMain==null||!originalMain.ForwardExecutionProfile||footprintCreateClockActive||footprintClockRpcActive||mainCompletionBegun||id!=mainRequest+1||id>EasyedaFootprintForwardExecutionLimits.MainRequests)throw Error("forward-head-owner");
bool cleanup=method=="Debugger.removeBreakpoint"||method=="Debugger.resume"||method=="Runtime.releaseObjectGroup";
if(cleanup?forwardHeadCleanup>=8:forwardHeadNormal>=20||forwardHeadCompleted)throw Error("forward-head-budget");
if(phase=="forward-head-sql:sql-fence-capture"&&forwardHeadSqlCaptured||phase=="forward-head-read:read"&&(!forwardHeadSqlCaptured||forwardHeadReadAttempted)||phase=="forward-head-read:completed"&&(!forwardHeadReadAttempted||forwardHeadCompleted)||phase=="forward-head-read:release"&&forwardHeadReadReleased||phase=="forward-head-open:release"&&forwardHeadSqlReleased||phase=="forward-head-sql:sql-fence-properties"&&forwardHeadProperties>=7)throw Error("forward-head-once");
string message=EasyedaFootprintForwardHeadProtocol.Encode(id,phase,method,fields);MainPurpose();AssertLive();mainRequest=id;if(cleanup)forwardHeadCleanup++;else forwardHeadNormal++;if(phase=="forward-head-sql:sql-fence-capture")forwardHeadSqlCaptured=true;if(phase=="forward-head-read:read")forwardHeadReadAttempted=true;if(phase=="forward-head-read:completed")forwardHeadCompleted=true;if(phase=="forward-head-read:release")forwardHeadReadReleased=true;if(phase=="forward-head-open:release")forwardHeadSqlReleased=true;if(phase=="forward-head-sql:sql-fence-properties")forwardHeadProperties++;originalMain.SendFixed(message,cleanup);AssertLive();
}
}
`;
}
