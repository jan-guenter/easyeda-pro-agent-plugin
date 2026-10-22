/** Generates the independent native fixed-command encoder from literal command
 * cases. Values supplied at runtime are identifiers, never programs or params. */
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS } from "./current-pcb-worker-construction-assignment.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT, CURRENT_PCB_WORKER_CONSTRUCTION_SAME,
  CURRENT_PCB_WORKER_CONSTRUCTION_SITES, CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupCommand } from "./current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT, currentPcbWorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const group = CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group;
const placeholder = (name: string): string => `__startup_${name}__`;
const effects = { objectGroup: group, silent: true, generatePreview: false, throwOnSideEffect: true,
  awaitPromise: false, userGesture: false } as const;
export function currentPcbWorkerStartupNativeCases(): readonly CurrentPcbWorkerStartupCommand[] {
  const sessionId = "original-session";
  const commands: CurrentPcbWorkerStartupCommand[] = [
    { method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId },
    { method: "Runtime.enable", params: {}, sessionId },
    { method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 }, sessionId },
    { method: "Debugger.setInstrumentationBreakpoint", params: { instrumentation: "beforeScriptExecution" }, sessionId },
    { method: "Runtime.runIfWaitingForDebugger", params: {}, sessionId },
    { method: "Debugger.getScriptSource", params: { scriptId: placeholder("scriptId") }, sessionId },
    { method: "Debugger.removeBreakpoint", params: { breakpointId: placeholder("breakpointId") }, sessionId },
    { method: "Debugger.resume", params: {}, sessionId },
    { method: "Runtime.getProperties", params: { objectId: placeholder("objectId"), ownProperties: true, generatePreview: false }, sessionId },
    { method: "Runtime.releaseObjectGroup", params: { objectGroup: group }, sessionId },
  ];
  for (const site of Object.values(CURRENT_PCB_WORKER_CONSTRUCTION_SITES)) {
    commands.push({ method: "Debugger.setBreakpoint", params: { location: { scriptId: placeholder("scriptId"),
      lineNumber: site.lineNumber, columnNumber: site.columnNumber } }, sessionId });
  }
  for (const expression of ["this", "e", "t", "this.bc", "this.bc.onmessage"] as const) {
    commands.push({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId: placeholder("callFrameId"), expression,
      objectGroup: group, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true,
      includeCommandLineAPI: false }, sessionId });
  }
  for (const entry of [{ program: CURRENT_PCB_WORKER_CONSTRUCTION_SAME, arguments: 1, returnByValue: true },
    { program: CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT, arguments: 1, returnByValue: true },
    ...Object.values(CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS)]) {
    commands.push({ method: "Runtime.callFunctionOn", params: { ...effects, objectId: placeholder("objectId"),
      functionDeclaration: entry.program, returnByValue: entry.returnByValue,
      arguments: Array.from({ length: entry.arguments }, (_, index) => ({ objectId: placeholder(`argument${index}`) })) }, sessionId });
  }
  return freezeDeep(commands);
}
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;

export function currentPcbWorkerStartupNativeSource(): string {
  const rows = currentPcbWorkerStartupNativeCases().map(sample => {
    const request = currentPcbWorkerStartupWire(sample, 1).request;
    const fields = Object.entries(request).filter(([key]) => !["action", "requestId", "method", "sessionId", "startupPhase"].includes(key));
    const fixed = fields.filter(([key]) => key === "site" || key === "selector");
    const dynamic = fields.filter(([key]) => key !== "site" && key !== "selector");
    const template = JSON.stringify(sample.params);
    for (const [key, value] of dynamic) {
      if (value !== placeholder(key) || !template.includes(JSON.stringify(value))) { throw new Error("WORKER_STARTUP_NATIVE_TEMPLATE"); }
    }
    const condition = [`phase==${literal(String(request["startupPhase"]))}`, ...fixed.map(([key, value]) => `Field(fields,${literal(key)})==${literal(String(value))}`)].join(" && ");
    // Concatenate original literal segments once. Repeated Replace would let
    // An identifier equal to another placeholder redirect that later field.
    const segments: string[] = []; let previous = 0;
    for (const match of template.matchAll(/"__startup_([A-Za-z\d]+)__"/gu)) {
      const key = match[1];
      if (key === undefined || !dynamic.some(([name]) => name === key)) { throw new Error("WORKER_STARTUP_NATIVE_PLACEHOLDER"); }
      segments.push(literal(template.slice(previous, match.index)), literal('"'), `Handle(Field(fields,${literal(key)}),256)`, literal('"'));
      previous = match.index + match[0].length;
    }
    segments.push(literal(template.slice(previous)));
    return `    if(${condition}) {\n      Need(method==${literal(sample.method)},"method");\n      Keys(fields,new string[]{${fields.map(([key]) => literal(key)).join(",")}});\n      parameters=${segments.join("+")};\n    }`;
  });
  const smoke = currentPcbWorkerStartupNativeCases().map(sample => {
    const request = currentPcbWorkerStartupWire(sample, 1).request;
    const fields = Object.entries(request).filter(([key]) => !["action", "requestId", "method", "sessionId", "startupPhase"].includes(key));
    const expected = JSON.stringify({ id: 1, method: sample.method, params: sample.params, sessionId: sample.sessionId });
    return `    fields.Clear();\n${fields.map(([key, value]) => `    fields.Add(${literal(key)},${literal(String(value))});`).join("\n")}\n` +
      `    Need(Encode(1,${literal(sample.method)},${literal(sample.sessionId)},${literal(String(request["startupPhase"]))},fields)==${literal(expected)}+"\\0","smoke-parity");`;
  }).join("\n");
  return `// BEGIN GENERATED WORKER STARTUP PROTOCOL
// Generated from current-pcb-worker-startup-native.ts. Do not edit this block.
public static class EasyedaWorkerStartupProtocol {
  static void Need(bool condition,string code) { if(!condition)throw new System.InvalidOperationException("pcb-diagnostic-startup-"+code); }
  static string Field(System.Collections.IDictionary fields,string key) {
    Need(fields!=null && fields.Contains(key),"field");
    string result=fields[key] as string;Need(result!=null,"field-type");return result;
  }
  static void Keys(System.Collections.IDictionary fields,string[] expected) {
    Need(fields!=null && fields.Count==expected.Length,"fields");
    foreach(string key in expected)Need(fields.Contains(key),"fields");
  }
  static string Handle(string value,int limit) {
    Need(value!=null && value.Length<=limit && System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]+\\z"),"handle");return value;
  }
  public static string Encode(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    Need(id>=1 && id<=${CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT},"id");Handle(sessionId,128);
    string parameters=null;
${rows.join(" else\n")}
    Need(parameters!=null,"phase");
    string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\""+method+"\\",\\"params\\":"+parameters+",\\"sessionId\\":\\""+sessionId+"\\"}\\0";
    Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536,"size");return result;
  }
  public static void VerifySmoke() {
    System.Collections.Hashtable fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);
${smoke}
    fields.Clear();fields.Add("objectId","__startup_argument0__");fields.Add("argument0","other");
    string collision=Encode(256,"Runtime.callFunctionOn","s","same",fields);
    Need(collision.Contains(@"""objectId"":""__startup_argument0__""") && collision.Contains(@"""objectId"":""other"""),"smoke-placeholder");
    foreach(int id in new int[]{0,257}) {bool refused=false;try{Encode(id,"Runtime.callFunctionOn","s","same",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-budget");}
    foreach(object bad in new object[]{null,"",7,"bad\\nhandle"}) {fields["argument0"]=bad;bool refused=false;try{Encode(1,"Runtime.callFunctionOn","s","same",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-handle");}
    fields["argument0"]="other";fields.Add("expression","arbitrary");
    bool extra=false;try{Encode(1,"Runtime.callFunctionOn","s","same",fields);}catch(System.InvalidOperationException){extra=true;}Need(extra,"smoke-extra");
  }
}
// END GENERATED WORKER STARTUP PROTOCOL`;
}
