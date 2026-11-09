/** Finite native encoder for the future inverse owner's separate single-clock phase.
 * No public writer or complete lifecycle reservation is supplied by this codec. */
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_SITES as SITES } from "./current-footprint-delete-clock-source.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_CALLS as CALLS, CURRENT_FOOTPRINT_DELETE_CLOCK_GROUP as GROUP } from "./current-footprint-delete-clock-programs.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_DELETE_CALLER as DELETE_CALLER, CURRENT_FOOTPRINT_DELETE_CLOCK_FLAGS as FLAGS, CURRENT_FOOTPRINT_DELETE_CLOCK_UI_CALLER as UI_CALLER, currentFootprintDeleteClockCondition } from "./current-footprint-delete-clock-protocol.ts";
import type { CurrentFootprintDeleteClockCommand as Command } from "./current-footprint-delete-clock-protocol.ts";
import { currentFootprintDeleteClockWire } from "./current-footprint-delete-clock-wire.ts";

const marker = (name: string): string => `__deleteclock_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const workerSession = "deleteclock_worker"; const uiSession = "deleteclock_ui";
const sample = (name: string): string | number => {
  if (name === "workerUuid" || name === "busUuid") { return "11111111-1111-1111-1111-111111111111"; }
  if (name === "uiUuid") { return "22222222-2222-2222-2222-222222222222"; }
  if (name === "targetUuid") { return "a".repeat(16); }
  if (name === "client") { return "b".repeat(16); }
  if (name === "projectUuid") { return "c".repeat(64); }
  if (name === "branchUuid") { return "d".repeat(32); }
  if (name === "maximumTicket") { return 4099; }
  if (name === "replyTopic") { return "_MSG_BUS_RPC_-/pro-mgr/serverTime/now-11111111-1111-1111-1111-111111111111-41"; }
  if (name === "ordinal") { return 1; } if (name === "clockRequestId") { return 41; } if (name === "observedValue") { return 1_700_000_000_123; }
  return `deleteclock_${name}`;
};
const object = (index: number): Readonly<{ objectId: string }> => ({ objectId: `deleteclock_argument${String(index)}` });
export function currentFootprintDeleteClockNativeCases(): readonly Command[] {
  const commands: Command[] = [];
  const args = {
    worker: [object(0), object(1), object(2)], ui: [object(0)], push: [object(0), object(1), { value: 1 }], dispatch: [object(0), { value: sample("uiUuid") }],
    result: [object(0), object(1), object(2), object(3), { value: { replyTopic: sample("replyTopic"), workerUuid: sample("workerUuid"), uiUuid: sample("uiUuid"), requestId: 41, ordinal: 1 } }],
    reply: [object(0), { value: { uiUuid: sample("uiUuid"), value: sample("observedValue") } }],
    entry: [object(0), object(1), { value: { projectUuid: sample("projectUuid"), branchUuid: sample("branchUuid"), targetUuid: sample("targetUuid"), client: sample("client"), maximumTicket: sample("maximumTicket") } }],
    producer: [object(0), object(1), { value: { value: sample("observedValue") } }],
  };
  for (const role of ["worker", "ui", "push", "dispatch", "result", "reply", "entry", "producer"] as const) {
    commands.push({ phase: `delete-clock-${role}`, method: "Runtime.callFunctionOn", sessionId: role === "ui" || role === "result" ? uiSession : workerSession,
      params: { ...FLAGS, objectId: "deleteclock_objectId", functionDeclaration: CALLS[role].program, arguments: args[role], returnByValue: false } });
  }
  for (const role of ["push", "dispatch", "result", "reply", "entry", "producer"] as const) {
    const site = SITES[role]; const sessionId = site.realm === "worker" ? workerSession : uiSession;
    commands.push({ phase: "delete-clock-arm", role, method: "Debugger.setBreakpoint", sessionId, params: {
      location: { scriptId: "deleteclock_scriptId", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
      condition: currentFootprintDeleteClockCondition(role, "11111111-1111-1111-1111-111111111111"),
    } });
  }
  for (const [expression, realm] of [...Object.values(SITES).map(site => [site.expression, site.realm] as const), [UI_CALLER, "ui"] as const, [DELETE_CALLER, "worker"] as const]) {
    commands.push({ phase: "delete-clock-frame", method: "Debugger.evaluateOnCallFrame", sessionId: realm === "worker" ? workerSession : uiSession,
      params: { callFrameId: "deleteclock_callFrameId", expression, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } });
  }
  commands.push({ phase: "delete-clock-properties", method: "Runtime.getProperties", sessionId: workerSession, params: { objectId: "deleteclock_objectId", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "delete-clock-remove", method: "Debugger.removeBreakpoint", sessionId: workerSession, params: { breakpointId: "deleteclock_breakpointId" } },
    { phase: "delete-clock-resume", method: "Debugger.resume", sessionId: workerSession, params: {} },
    { phase: "delete-clock-release", method: "Runtime.releaseObjectGroup", sessionId: workerSession, params: { objectGroup: GROUP } });
  return Object.freeze(commands);
}
function templateValue(value: unknown, fields: Readonly<Record<string, string | number>>, condition?: string): unknown {
  if (typeof value === "string" && value === condition && typeof fields["busUuid"] === "string") { return value.replaceAll(fields["busUuid"], marker("inlineBus")); }
  for (const [name, field] of Object.entries(fields)) { if (value === field) { return marker(name); } }
  if (Array.isArray(value)) { return value.map((item: unknown) => templateValue(item, fields, condition)); }
  if (value !== null && typeof value === "object") { return Object.fromEntries(Object.entries(value).map(([name, item]: [string, unknown]) => [name, templateValue(item, fields, condition)])); }
  return value;
}
/** Generate the closed clock-RPC codec, preserving worker/UI realms and fixed
 * per-phase templates. Enforce template bounds and embed independent smoke hashes;
 * creating this source proves no responder identity or native clock completion.
 */
export function currentFootprintDeleteClockNativeSource(): string {
  const cases = currentFootprintDeleteClockNativeCases();
  const rows = cases.map(command => {
    const wire = currentFootprintDeleteClockWire(command, 1, workerSession, uiSession);
    const fields = Object.fromEntries(Object.entries(wire.request).filter(([name]) => !["action", "requestId", "phase", "method", "realm"].includes(name)));
    const body = { method: command.method, sessionId: marker("sessionId"), params: command.params };
    const template = JSON.stringify(templateValue(body, fields, command.method === "Debugger.setBreakpoint" ? String(command.params["condition"]) : undefined));
    if (Buffer.byteLength(template) > 65_536 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_DELETE_CLOCK_NATIVE_TEMPLATE"); }
    const realm = ["delete-clock-properties", "delete-clock-remove", "delete-clock-resume", "delete-clock-release"].includes(command.phase) ? "*" : wire.request["realm"];
    return [wire.request["phase"], command.method, realm, Object.keys(fields).join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing of the finite native command table.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = cases.map(command => createHash("sha256").update(`${JSON.stringify({ id: 73, method: command.method, sessionId: command.sessionId, params: command.params })}\0`).digest("hex"));
  return `public static class EasyedaFootprintDeleteClockProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-delete-clock-protocol");}
static string[][] Load(){return EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},26,5);}
static readonly string[][] Cases=Load();
static string Text(string name,object input){string value=input as string;Need(value!=null);string pattern=name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":name=="busUuid"||name=="uiUuid"||name=="workerUuid"?@"\\A[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\\z":name=="targetUuid"?@"\\A(?:[a-f0-9]{16}|[a-f0-9]{32})\\z":name=="client"?@"\\A[a-f0-9]{16}\\z":name=="projectUuid"?@"\\A(?:[a-f0-9]{32}|[a-f0-9]{64})\\z":name=="branchUuid"?@"\\A[a-f0-9]{32}\\z":name=="replyTopic"?@"\\A_MSG_BUS_RPC_-/pro-mgr/serverTime/now-[a-f0-9-]{36}-[0-9]+\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(value.Length<=256&&System.Text.RegularExpressions.Regex.IsMatch(value,pattern));return value;}
static string Field(string name,object input){if(name=="ordinal"||name=="clockRequestId"||name=="observedValue"||name=="maximumTicket"){Need(input is int||input is long);long value=System.Convert.ToInt64(input,System.Globalization.CultureInfo.InvariantCulture);Need(value>=0&&value<=9007199254740990L);if(name=="ordinal")Need(value==1);if(name=="observedValue")Need(value>0&&value<=8640000000000000L);return value.ToString(System.Globalization.CultureInfo.InvariantCulture);}return "\\""+Text(name,input)+"\\"";}
public static string Encode(int id,string phase,string method,string realm,string originalWorkerSession,string originalUiSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null&&(realm=="worker"||realm=="ui"));string worker=Text("sessionId",originalWorkerSession),ui=Text("sessionId",originalUiSession);Need(worker!=ui);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method&&(selected[2]=="*"||selected[2]==realm));string[] names=selected[3].Length==0?new string[0]:selected[3].Split(',');Need(fields.Count==names.Length);foreach(string name in names){Need(fields.Contains(name));Field(name,fields[name]);}foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[4];if(template.Contains("__deleteclock_inlineBus__"))template=template.Replace("__deleteclock_inlineBus__",Text("busUuid",fields["busUuid"]));var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__deleteclock_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append(name=="sessionId"?"\\""+(realm=="worker"?worker:ui)+"\\"":Field(name,fields[name]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text+"\\0";}
static object Smoke(string name){if(name=="ordinal")return 1L;if(name=="clockRequestId")return 41L;if(name=="observedValue")return 1700000000123L;if(name=="busUuid"||name=="workerUuid")return "11111111-1111-1111-1111-111111111111";if(name=="uiUuid")return "22222222-2222-2222-2222-222222222222";if(name=="targetUuid")return new string('a',16);if(name=="client")return new string('b',16);if(name=="projectUuid")return new string('c',64);if(name=="branchUuid")return new string('d',32);if(name=="maximumTicket")return 4099L;if(name=="replyTopic")return "_MSG_BUS_RPC_-/pro-mgr/serverTime/now-11111111-1111-1111-1111-111111111111-41";return "deleteclock_"+name;}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);if(row[3].Length>0)foreach(string name in row[3].Split(','))fields.Add(name,Smoke(name));string realm=row[2]=="*"?"worker":row[2];System.Func<string> encode=()=>Encode(73,row[0],row[1],realm,"deleteclock_worker","deleteclock_ui",fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encode()))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(0,row[0],row[1],realm,"deleteclock_worker","deleteclock_ui",fields));Refused(()=>Encode(73,"unknown",row[1],realm,"deleteclock_worker","deleteclock_ui",fields));Refused(()=>Encode(73,row[0],"Runtime.evaluate",realm,"deleteclock_worker","deleteclock_ui",fields));Refused(()=>Encode(73,row[0],row[1],realm,"same","same",fields));Refused(()=>Encode(73,row[0],row[1],"foreign","deleteclock_worker","deleteclock_ui",fields));if(row[2]!="*")Refused(()=>Encode(73,row[0],row[1],realm=="worker"?"ui":"worker","deleteclock_worker","deleteclock_ui",fields));foreach(string extra in new string[]{"sessionId","functionDeclaration","expression","condition","url","ordinalExtra"}){fields.Add(extra,"copied");Refused(()=>{encode();});fields.Remove(extra);}if(row[3].Length>0){string name=row[3].Split(',')[0];object original=fields[name];fields.Remove(name);Refused(()=>{encode();});fields.Add(name,original);}foreach(string name in row[3].Split(',')){if(name.Length==0)continue;object original=fields[name];fields[name]=name=="ordinal"||name=="clockRequestId"||name=="observedValue"||name=="maximumTicket"?(object)"1":(object)1L;Refused(()=>{encode();});fields[name]=original;if(name=="ordinal"||name=="clockRequestId"||name=="observedValue"||name=="maximumTicket"){fields[name]=-1L;Refused(()=>{encode();});fields[name]=9007199254740991L;Refused(()=>{encode();});fields[name]=1.0;Refused(()=>{encode();});fields[name]=original;}else{fields[name]=(string)original+"\\n";Refused(()=>{encode();});fields[name]=original;}}}}
}`;
}
