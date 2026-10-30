/** Closed original-main protocol, packed with decoded length/hash verification.
 * Only the original native transport can send the resulting inspector JSON. */
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL_PATTERN } from "./current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_EXPRESSION as EXPRESSION,
  CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP as GROUP } from "./current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "./current-footprint-copy-main-backend-source.ts";
import { currentFootprintCopyMainBackendWire } from "./current-footprint-copy-main-backend-wire.ts";

const marker = (name: string): string => `__mainbackend_${name}__`;
const literal = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
export function currentFootprintCopyMainBackendNativeCases(): readonly Command[] {
  const objectId = marker("objectId"), scriptId = marker("scriptId");
  return Object.freeze([
    { phase: "runtime-enable", method: "Runtime.enable", params: {} },
    { phase: "debugger-enable", method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 } },
    { phase: "run-waiting", method: "Runtime.runIfWaitingForDebugger", params: {} },
    { phase: "resume", method: "Debugger.resume", params: {} },
    { phase: "registration-arm", method: "Debugger.setBreakpointByUrl", params: { urlRegex: URL_PATTERN,
      lineNumber: SOURCE.registration.https.lineNumber, columnNumber: SOURCE.registration.https.breakpointColumnNumber } },
    { phase: "source", method: "Debugger.getScriptSource", params: { scriptId } },
    { phase: "breakpoint", method: "Debugger.setBreakpoint", params: { location: { scriptId,
      lineNumber: SOURCE.registration.https.lineNumber, columnNumber: SOURCE.registration.https.breakpointColumnNumber } } },
    { phase: "breakpoint", method: "Debugger.setBreakpoint", params: { location: { scriptId,
      lineNumber: SOURCE.registration.http.lineNumber, columnNumber: SOURCE.registration.http.breakpointColumnNumber } } },
    { phase: "frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: marker("callFrameId"), expression: EXPRESSION,
      objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } },
    { phase: "capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS.capture.program, arguments: [], returnByValue: false } },
    { phase: "require", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS.require.program,
      arguments: [{ objectId: marker("argument0") }], returnByValue: true } },
    { phase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } },
    { phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ] satisfies Command[]);
}
/** Generate the original-main backend codec from fixed registration/capture cases.
 * Validate scalar slots and bounded rows before packing with hashes; emission
 * performs no HTTP request and supplies no backend-owner admission.
 */
export function currentFootprintCopyMainBackendNativeSource(): string {
  const rows = currentFootprintCopyMainBackendNativeCases().map(command => {
    const wire = currentFootprintCopyMainBackendWire(command, 1);
    const names = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    const { phase: _phase, ...native } = command; const template = JSON.stringify(native);
    if (names.some(name => wire.request[name] !== marker(name) || !template.includes(JSON.stringify(marker(name)))) ||
      Buffer.byteLength(template) > 16_384 || template.includes("\0") || template.includes("\t")) { throw new Error("MAIN_BACKEND_NATIVE_TEMPLATE"); }
    return [wire.request["phase"], command.method, names.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing of fixed protocol templates during generation.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = rows.map(row => {
    const template = row.split("\t")[3]; if (template === undefined) { throw new Error("MAIN_BACKEND_NATIVE_SMOKE"); }
    const restored = template.replaceAll(/"__mainbackend_([A-Za-z\d]+)__"/gu, '"main_handle"');
    return createHash("sha256").update(`{"id":73,${restored.slice(1)}`).digest("hex");
  });
  return `public static class EasyedaFootprintCopyMainBackendProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-main-backend-protocol");}
static string[][] Load(){return EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},14,4);}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);if(name=="breakpointId"&&value==${literal(REGISTRATION_ID)})return ${literal(JSON.stringify(REGISTRATION_ID))};Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return "\\""+value+"\\"";}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__mainbackend_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append(Field(name,fields[name]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1);}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,"main_handle");string output=Encode(73,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(output))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(73,"unknown",row[1],fields));Refused(()=>Encode(73,row[0],"Runtime.evaluate",fields));fields.Add("sessionId","copied");Refused(()=>Encode(73,row[0],row[1],fields));fields.Remove("sessionId");fields.Add("functionDeclaration","function(){}");Refused(()=>Encode(73,row[0],row[1],fields));fields.Remove("functionDeclaration");Refused(()=>Encode(0,row[0],row[1],fields));if(fields.Contains("breakpointId")){fields["breakpointId"]=${literal(REGISTRATION_ID)};Need(Encode(73,row[0],row[1],fields)==${literal(JSON.stringify({id:73,method:"Debugger.removeBreakpoint",params:{breakpointId:REGISTRATION_ID}}))});fields["breakpointId"]="copied?regex";Refused(()=>Encode(73,row[0],row[1],fields));}if(fields.Contains("objectId")){fields["objectId"]="bad\\n";Refused(()=>Encode(73,row[0],row[1],fields));}}}
}`;
}
