/** Fixed generic selected-file main codebook. A native birth, never a caller
 * string, selects this codec and its original inspector connection. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "./current-selected-file-main-sql-fence-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS as CONDITIONS, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONFIGURATION_PROGRAM as CONFIGURATION,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SELECT_PROGRAM as SELECT } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FRAME,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_EXPRESSION as NATIVE_EXPRESSION, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES as SITES,
  validateCurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import type { CurrentSelectedFileMainSqlFenceCommand as Command } from "./current-selected-file-main-sql-fence-protocol.ts";

import { CURRENT_MAIN_STARTUP_CONFIG_CALLS as STARTUP } from "./current-main-startup-config-programs.ts";

import { CURRENT_SELECTED_FILE_MAIN_REQUEST_CALLS as REQUEST, CURRENT_SELECTED_FILE_MAIN_REQUEST_FRAME as REQUEST_FRAME } from "./current-selected-file-main-request-programs.ts";

const smoke = (name: string): string => name === "path" ? String.raw`C:\Synthetic\fixture.eprj2` : "main_handle";
const marker = (name: string): string => `__selectedsql_${name}__`;
export function currentSelectedFileMainSqlFenceWire(input: unknown, id: number): Readonly<{ command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_WIRE_ID"); }
  const command = validateCurrentSelectedFileMainSqlFenceCommand(input);
  const request: Record<string, string | number> = { action: "main-send", requestId: id, phase: command.phase, method: command.method };
  if ("site" in command) { request["phase"] = `${command.phase}-${command.site}`; }
  if (command.method === "Debugger.getScriptSource") { request["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.setBreakpoint") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Runtime.getProperties" || command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId;
    if (command.phase === "sql-fence-capture") { request["path"] = command.params.arguments[0].value; }
    else if (command.phase === "sql-fence-request-capture" || command.phase === "sql-fence-request-bind" || command.phase === "sql-fence-request-rebind") {
      for (const [index, argument] of command.params.arguments.entries()) { request[`argument${String(index)}`] = argument.objectId; }
    }
    else if (command.phase === "sql-fence-select" || command.phase === "sql-fence-configure" || command.phase === "sql-fence-startup-version" || command.phase === "sql-fence-startup-jb" || command.phase === "sql-fence-startup-dc" || command.phase === "sql-fence-startup-select") { request["argument0"] = command.params.arguments[0].objectId; }
  }
  return freezeDeep({ command: { ...command, id }, request });
}
export function currentSelectedFileMainSqlFenceNativeCases(): readonly Command[] {
  const callFrameId = marker("callFrameId"), objectId = marker("objectId"), scriptId = marker("scriptId");
  const rows: Command[] = [
    { phase: "sql-fence-early-arm", method: "Debugger.setBreakpointByUrl", params: { urlRegex: URL,
      lineNumber: SOURCE.sites.import.lineNumber, columnNumber: SOURCE.sites.import.breakpointColumnNumber } },
    { phase: "sql-fence-after-imports-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId,
      lineNumber: SOURCE.sites.afterImports.lineNumber, columnNumber: SOURCE.sites.afterImports.breakpointColumnNumber } } },
    { phase: "sql-fence-frame", site: "afterImports", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: SOURCE.sites.afterImports.expression } },
    { phase: "sql-fence-native-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: NATIVE_EXPRESSION } },
    { phase: "sql-fence-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "sql-fence-capture", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: CAPTURE, arguments: [{ value: marker("path") }], returnByValue: false } },
    { phase: "sql-fence-require", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: REQUIRE, arguments: [], returnByValue: true } },
    { phase: "sql-fence-select", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: SELECT, arguments: [{ objectId: marker("argument0") }], returnByValue: false } },
    { phase: "sql-fence-driver-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: REQUEST_FRAME } },
    { phase: "sql-fence-request-capture", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: REQUEST.capture, arguments: [{ objectId: marker("argument0") }], returnByValue: false } },
    { phase: "sql-fence-request-bind", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: REQUEST.bind, arguments: [{ objectId: marker("argument0") }, { objectId: marker("argument1") }, { objectId: marker("argument2") }, { objectId: marker("argument3") }], returnByValue: false } },
    { phase: "sql-fence-request-rebind", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: REQUEST.rebind, arguments: [{ objectId: marker("argument0") }], returnByValue: false } },
    { phase: "sql-fence-request-read", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: REQUEST.read, arguments: [], returnByValue: true } },
    { phase: "sql-fence-fetch-source", method: "Debugger.getScriptSource", params: { scriptId } },
    { phase: "sql-fence-resume", method: "Debugger.resume", params: {} },
  ];
  for (const [site, stage] of [["initializerSerialize", "serialize"], ["initializerPragma", "pragma"]] as const) {
    rows.push({ phase: "sql-fence-configure", site, method: "Runtime.callFunctionOn", params: { ...CALL, throwOnSideEffect: false, objectId, functionDeclaration: CONFIGURATION, arguments: [{ objectId: marker("argument0") }, { value: stage }], returnByValue: true } });
  }
  rows.push({ phase: "sql-fence-startup-version", method: "Runtime.callFunctionOn", params: { ...CALL, throwOnSideEffect: false, objectId, functionDeclaration: STARTUP.version, arguments: [{ objectId: marker("argument0") }], returnByValue: false } },
    { phase: "sql-fence-startup-jb", method: "Runtime.callFunctionOn", params: { ...CALL, throwOnSideEffect: false, objectId, functionDeclaration: STARTUP.bindJB, arguments: [{ objectId: marker("argument0") }], returnByValue: true } },
    { phase: "sql-fence-startup-dc", method: "Runtime.callFunctionOn", params: { ...CALL, throwOnSideEffect: false, objectId, functionDeclaration: STARTUP.bindDC, arguments: [{ objectId: marker("argument0") }], returnByValue: true } });
  for (const site of ["run", "prepare", "prepared", "statementRun", "finalize"] as const) {
    rows.push({ phase: "sql-fence-startup-select", site, method: "Runtime.callFunctionOn", params: { ...CALL, throwOnSideEffect: false, objectId, functionDeclaration: STARTUP.select, arguments: [{ objectId: marker("argument0") }, { value: site }], returnByValue: true } });
  }
  for (const site of SITES) {
    rows.push({ phase: "sql-fence-arm", site, method: "Debugger.setBreakpoint", params: { location: { scriptId,
      lineNumber: SOURCE.sites[site].lineNumber, columnNumber: SOURCE.sites[site].breakpointColumnNumber }, condition: CONDITIONS[site] } }, { phase: "sql-fence-frame", site, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: SOURCE.sites[site].expression } });
  }
  return freezeDeep(rows);
}
const literal = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
const nativeQuote = String.raw`static string Quote(string value){var b=new System.Text.StringBuilder();b.Append('"');for(int i=0;i<value.Length;i++){char c=value[i];if(char.IsHighSurrogate(c)){Need(i+1<value.Length&&char.IsLowSurrogate(value[i+1]));b.Append(c);b.Append(value[++i]);}else{Need(!char.IsLowSurrogate(c));if(c=='"'||c=='\\'){b.Append('\\');b.Append(c);}else if(c=='\b')b.Append("\\b");else if(c=='\t')b.Append("\\t");else if(c=='\n')b.Append("\\n");else if(c=='\f')b.Append("\\f");else if(c=='\r')b.Append("\\r");else if(c<32){b.Append("\\u");b.Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));}else b.Append(c);}}b.Append('"');return b.ToString();}`;
/** Emit finite packed templates. Unknown phases, SQL/program fields, renderer
 * sessions and arbitrary breakpoint conditions have no native representation. */
export function currentSelectedFileMainSqlFenceNativeSource(): string {
  const rows = currentSelectedFileMainSqlFenceNativeCases().map(command => {
    const wire = currentSelectedFileMainSqlFenceWire(command, 1); const fields = Object.keys(wire.request).filter(key => !["action", "requestId", "phase", "method"].includes(key));
    const { phase: _phase, ...rest } = command; const native = "site" in rest ? { method: rest.method, params: rest.params } : rest;
    const template = JSON.stringify(native);
    if (fields.some(name => wire.request[name] !== marker(name) || !template.includes(JSON.stringify(marker(name)))) || Buffer.byteLength(template) > 16_384) {
      throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_TEMPLATE");
    }
    return [wire.request["phase"], command.method, fields.join(","), template].join("\t");
  });
  const groups: string[][] = [[]];
  for (const row of rows) {
    let selected = groups.at(-1); if (selected === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("SELECTED_SQL_TABLE_BOUND"); }
    if (Buffer.byteLength([...selected, row].join("\0")) > 60_000) { selected = []; groups.push(selected); } selected.push(row);
  }
  const loaders = groups.map(group => {
    const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing; each immutable table retains the existing64KiB decoder bound.
    const packed = gzipSync(bytes, { level: 9 });
    return `result.AddRange(EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(group.length)},4));`;
  }).join("\n");
  const hashes = rows.map(row => {
    const template = row.split("\t")[3]; if (template === undefined) { throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_ROW"); }
    const restored = template.replaceAll(/"__selectedsql_([A-Za-z\d]+)__"/gu, (_match: string, name: string) => JSON.stringify(smoke(name)));
    return createHash("sha256").update(`{"id":73,${restored.slice(1)}`).digest("hex");
  });
  return `public static class EasyedaSelectedFileMainSqlFenceProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-selected-sql-protocol");}
static readonly string[][] Cases=Load();
static string[][] Load(){var result=new System.Collections.Generic.List<string[]>();${loaders}return result.ToArray();}
${nativeQuote}
static string Field(string name,object input){string value=input as string;Need(value!=null);if(name=="path"){Need(value.Length>0&&value.Length<=4096&&value.IndexOf((char)0)<0);return Quote(value);}Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return Quote(value);}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(string[] candidate in Cases)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string template=row[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__selectedsql_([A-Za-z0-9]+)__\\"")){output.Append(template,previous,match.Index-previous);output.Append(Field(match.Groups[1].Value,fields[match.Groups[1].Value]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,name=="path"?@"C:\\Synthetic\\fixture.eprj2":"main_handle");string text=Encode(73,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(73,row[0],"Runtime.evaluate",fields));Refused(()=>Encode(73,"sql-fence-caller-code",row[1],fields));fields.Add("condition","false");Refused(()=>Encode(73,row[0],row[1],fields));fields.Remove("condition");fields.Add("sessionId","copied");Refused(()=>Encode(73,row[0],row[1],fields));}}
}`;
}
