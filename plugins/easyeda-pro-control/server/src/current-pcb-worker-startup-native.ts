/** Generates the independent native fixed-command encoder from literal command
 * cases. Values supplied at runtime are identifiers, never programs or params. */
/* oxlint-disable import/max-dependencies -- This generator compares both fixed source profiles and every literal command family at one native protocol boundary. */
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTORS_EXPRESSION, CURRENT_FOOTPRINT_COPY_STATE_CALLS } from "./current-footprint-copy-state.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS } from "./current-pcb-worker-construction-assignment.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT, CURRENT_PCB_WORKER_CONSTRUCTION_SAME,
  CURRENT_PCB_WORKER_CONSTRUCTION_SITES, CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "./current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupParentCommand, CurrentPcbWorkerStartupWorkerCommand } from "./current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "./current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "./current-pcb-diagnostic-pcb-opening.ts";
import { sha256Text } from "./core.ts";
import { CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT, currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "./current-pcb-worker-startup-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION, CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION,
  currentPcbWorkerStartupUiActorCommand } from "./current-pcb-worker-startup-actor.ts";
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS } from "./current-pcb-worker-startup-channel-observation.ts";
import { CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES } from "./current-pcb-209-worker-startup-profile.ts";

const group = CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group;
const placeholder = (name: string): string => `__startup_${name}__`;
const effects = { objectGroup: group, silent: true, generatePreview: false, throwOnSideEffect: true,
  awaitPromise: false, userGesture: false } as const;
function nativeCases(sites: Readonly<Record<string, Readonly<{ lineNumber: number; columnNumber: number }>>>): readonly CurrentPcbWorkerStartupWorkerCommand[] {
  const sessionId = "original-session";
  const commands: CurrentPcbWorkerStartupWorkerCommand[] = [
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
  for (const site of Object.values(sites)) {
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
    { program: CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, arguments: 1, returnByValue: true },
    { program: CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION, arguments: 1, returnByValue: true },
    ...Object.values(CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS),
    ...Object.values(CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS),
    ...(sites === CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES ? Object.values(CURRENT_FOOTPRINT_COPY_STATE_CALLS) : [])]) {
    commands.push({ method: "Runtime.callFunctionOn", params: { ...effects, objectId: placeholder("objectId"),
      functionDeclaration: entry.program, returnByValue: entry.returnByValue,
      arguments: Array.from({ length: entry.arguments }, (_, index) => ({ objectId: placeholder(`argument${index}`) })) }, sessionId });
  }
  if (sites === CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES) {
    commands.push({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId: placeholder("callFrameId"),
      expression: CURRENT_FOOTPRINT_COPY_CONSTRUCTORS_EXPRESSION, objectGroup: group, silent: true, returnByValue: false,
      generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false }, sessionId });
  }
  return freezeDeep(commands);
}
export function currentPcbWorkerStartupNativeCases(): readonly CurrentPcbWorkerStartupWorkerCommand[] {
  return nativeCases(CURRENT_PCB_WORKER_CONSTRUCTION_SITES);
}
export function currentPcb209WorkerStartupNativeCases(): readonly CurrentPcbWorkerStartupWorkerCommand[] {
  return nativeCases(CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES);
}
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
/** Synthetic, path-hash-consistent protocol fixtures; never project authority. */
export function currentPcbWorkerStartupNativeParentCases(): readonly CurrentPcbWorkerStartupParentCommand[] {
  const rawWindowsPath = String.raw`C:\Synthetic\worker-startup.eprj2`, sessionId = "original-session";
  const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "d".repeat(16),
    expectedSourceSha256: "e".repeat(64), branchUuid: "b".repeat(32) };
  return freezeDeep([
    { method: "Target.getTargets", params: {} },
    { method: "Page.getFrameTree", params: {}, sessionId },
    { method: "DOM.getFrameOwner", params: { frameId: "original-frame" }, sessionId },
    { method: "DOM.describeNode", params: { backendNodeId: 42, depth: 0, pierce: false }, sessionId },
    { method: "Debugger.getScriptSource", pcbPhase: "source", params: { scriptId: "original-pcb-script" }, sessionId },
    currentPcbWorkerStartupUiActorCommand(sessionId, "original-context"),
    ...(["preflight", "open-project"] as const).map(phase => ({ method: "Runtime.callFunctionOn" as const, params: {
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, uniqueContextId: "original-context",
      arguments: [{ value: target }, { value: phase }] as const, returnByValue: true as const, awaitPromise: true as const,
      silent: true as const, generatePreview: false as const, userGesture: false as const, throwOnSideEffect: false as const,
    }, sessionId })),
    ...(["preflight", "open-document", "observe"] as const).map(phase => ({ method: "Runtime.callFunctionOn" as const, params: {
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, uniqueContextId: "original-context",
      arguments: [{ value: target }, { value: phase }] as const, returnByValue: true as const, awaitPromise: true as const,
      silent: true as const, generatePreview: false as const, userGesture: false as const, throwOnSideEffect: false as const,
    }, sessionId })),
  ]);
}

export function currentPcbWorkerStartupNativeSource(): string {
  const currentCases = currentPcb209WorkerStartupNativeCases(), legacyCases = currentPcbWorkerStartupNativeCases();
  let changedCases = 0;
  function variant(index: number, sample: CurrentPcbWorkerStartupWorkerCommand): CurrentPcbWorkerStartupWorkerCommand {
    const current = currentCases[index];
    if (current === undefined || JSON.stringify(currentPcb209WorkerStartupWire(current, 1).request) !==
      JSON.stringify(currentPcbWorkerStartupWire(sample, 1).request)) { throw new Error("WORKER_STARTUP_NATIVE_GENERATION_WIRE"); }
    if (JSON.stringify(current) !== JSON.stringify(sample) &&
      (sample.method !== "Debugger.setBreakpoint" || current.method !== "Debugger.setBreakpoint" ||
        sample.params.location.lineNumber !== 108 || sample.params.location.columnNumber !== 145_558 ||
        current.params.location.lineNumber !== 108 || current.params.location.columnNumber !== 145_582)) {
      throw new Error("WORKER_STARTUP_NATIVE_GENERATION_DIFFERENCE");
    }
    return current;
  }
  const entries = [...legacyCases.map((sample, index) => ({ sample, current: variant(index, sample), currentOnly: false })),
    ...currentCases.slice(legacyCases.length).map(sample => ({ sample, current: sample, currentOnly: true }))];
  const rows = entries.map(({ sample, current, currentOnly }) => {
    const request = (currentOnly ? currentPcb209WorkerStartupWire : currentPcbWorkerStartupWire)(sample, 1).request;
    const fields = Object.entries(request).filter(([key]) => !["action", "requestId", "method", "sessionId", "startupPhase"].includes(key));
    const fixed = fields.filter(([key]) => key === "site" || key === "selector");
    const dynamic = fields.filter(([key]) => key !== "site" && key !== "selector");
    const condition = [...(currentOnly ? ["workerStartup209"] : []), `phase==${literal(String(request["startupPhase"]))}`, ...fixed.map(([key, value]) => `Field(fields,${literal(key)})==${literal(String(value))}`)].join(" && ");
    // Concatenate original literal segments once. Repeated Replace would let
    // An identifier equal to another placeholder redirect that later field.
    function expression(parameters: CurrentPcbWorkerStartupWorkerCommand["params"]): string {
      const template = JSON.stringify(parameters);
      for (const [key, value] of dynamic) {
        if (value !== placeholder(key) || !template.includes(JSON.stringify(value))) { throw new Error("WORKER_STARTUP_NATIVE_TEMPLATE"); }
      }
      const segments: string[] = []; let previous = 0;
      for (const match of template.matchAll(/"__startup_([A-Za-z\d]+)__"/gu)) {
        const key = match[1];
        if (key === undefined || !dynamic.some(([name]) => name === key)) { throw new Error("WORKER_STARTUP_NATIVE_PLACEHOLDER"); }
        segments.push(literal(template.slice(previous, match.index)), literal('"'), `Handle(Field(fields,${literal(key)}),256)`, literal('"'));
        previous = match.index + match[0].length;
      }
      segments.push(literal(template.slice(previous))); return segments.join("+");
    }
    const currentExpression = expression(current.params), legacy = expression(sample.params);
    let parameters = legacy;
    if (currentExpression !== legacy) { changedCases += 1; parameters = `workerStartup209?${currentExpression}:${legacy}`; }
    return `    if(${condition}) {\n      Need(method==${literal(sample.method)},"method");\n      Keys(fields,new string[]{${fields.map(([key]) => literal(key)).join(",")}});\n      parameters=${parameters};\n    }`;
  });
  if (changedCases !== 1 || legacyCases.length + Object.keys(CURRENT_FOOTPRINT_COPY_STATE_CALLS).length + 1 !== currentCases.length) { throw new Error("WORKER_STARTUP_NATIVE_GENERATION_COUNT"); }
  const smokeExpected: string[] = [];
  function expectedReference(value: string): string {
    if (value.includes("\0")) { throw new Error("WORKER_STARTUP_NATIVE_SMOKE_DELIMITER"); }
    const index = smokeExpected.indexOf(value);
    if (index !== -1) { return `expected[${String(index)}]`; }
    smokeExpected.push(value); return `expected[${String(smokeExpected.length - 1)}]`;
  }
  const smoke = legacyCases.map((sample, index) => {
    const current = variant(index, sample);
    const request = currentPcbWorkerStartupWire(sample, 1).request;
    const fields = Object.entries(request).filter(([key]) => !["action", "requestId", "method", "sessionId", "startupPhase"].includes(key));
    const expected = JSON.stringify({ id: 1, method: sample.method, params: sample.params, sessionId: sample.sessionId });
    const currentExpected = JSON.stringify({ id: 1, method: current.method, params: current.params, sessionId: current.sessionId });
    const expectedExpression = expected === currentExpected ? expectedReference(expected) : `(workerStartup209?${expectedReference(currentExpected)}:${expectedReference(expected)})`;
    return `    fields.Clear();\n${fields.map(([key, value]) => `    fields.Add(${literal(key)},${literal(String(value))});`).join("\n")}\n` +
      `    Need(EncodeCore(1,${literal(sample.method)},${literal(sample.sessionId)},${literal(String(request["startupPhase"]))},fields,workerStartup209)==${expectedExpression}+"\\0","smoke-parity");`;
  }).join("\n");
  const footprintSmoke = currentCases.slice(legacyCases.length).map(sample => {
    const request = currentPcb209WorkerStartupWire(sample, 1).request;
    const fields = Object.entries(request).filter(([key]) => !["action", "requestId", "method", "sessionId", "startupPhase"].includes(key));
    const expected = JSON.stringify({ id: 1, method: sample.method, params: sample.params, sessionId: sample.sessionId });
    return `    fields.Clear();\n${fields.map(([key, value]) => `    fields.Add(${literal(key)},${literal(String(value))});`).join("\n")}\n` +
      `    if(workerStartup209)Need(EncodeCore(1,${literal(sample.method)},${literal(sample.sessionId)},${literal(String(request["startupPhase"]))},fields,true)==${expectedReference(expected)}+"\\0","smoke-footprint-parity");\n` +
      `    else {bool refused=false;try{EncodeCore(1,${literal(sample.method)},${literal(sample.sessionId)},${literal(String(request["startupPhase"]))},fields,false);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-footprint-legacy");}`;
  }).join("\n");
  const parentSmoke = currentPcbWorkerStartupNativeParentCases().map(sample => {
    const request = currentPcbWorkerStartupWire(sample, 256).request;
    const fields = Object.entries(request).filter(([key]) => !["action", "requestId", "method", "parentPhase"].includes(key));
    const expected = JSON.stringify({ id: 256, method: sample.method, params: sample.params,
      ...(sample.sessionId === undefined ? {} : { sessionId: sample.sessionId }) });
    return `    fields.Clear();\n${fields.map(([key, value]) => `    fields.Add(${literal(key)},${typeof value === "number" ? String(value) : literal(value)});`).join("\n")}\n` +
      `    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,${literal(sample.method)},${literal(String(request["parentPhase"]))},fields)==${expectedReference(expected)}+"\\0","smoke-parent-parity");`;
  }).join("\n");
  const smokeText = smokeExpected.join("\0");
  const smokeBytes = Buffer.byteLength(smokeText);
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory compression of fixed compile-only expected vectors.
  const smokePacked = gzipSync(smokeText, { level: 9 });
  return `// BEGIN GENERATED WORKER STARTUP PROTOCOL
// Generated from current-pcb-worker-startup-native.ts. Do not edit this block.
public static class EasyedaWorkerStartupProtocol {
  public const string UiActorClockFunction=${literal(CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION)};
  public const string PcbOpeningFunction=${literal(CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION)};
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
    return EncodeCore(id,method,sessionId,phase,fields,false);
  }
  public static string Encode209(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    return EncodeCore(id,method,sessionId,phase,fields,true);
  }
  static string EncodeCore(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields,bool workerStartup209) {
    Need(id>=1 && id<=${CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT},"id");Handle(sessionId,128);
    string parameters=null;
${rows.join(" else\n")}
    Need(parameters!=null,"phase");
    string result="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\\"method\\":\\""+method+"\\",\\"params\\":"+parameters+",\\"sessionId\\":\\""+sessionId+"\\"}\\0";
    Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536,"size");return result;
  }
  public static void VerifySmoke() { VerifySmokeCore(false); }
  public static void Verify209Smoke() { VerifySmokeCore(true); }
  static string[] SmokeExpected() {
    // Test vectors are decoded only by CompileOnly, never normal encoding.
    const string encoded=${literal(smokePacked.toString("base64"))};
    byte[] packed=System.Convert.FromBase64String(encoded),bytes=new byte[${String(smokeBytes)}];int count=0;
    Need(packed.Length==${String(smokePacked.length)} && System.Convert.ToBase64String(packed)==encoded,"smoke-base64");
    using(var input=new System.IO.MemoryStream(packed,false))
    using(var stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress)) {
      while(count<bytes.Length) { int read=stream.Read(bytes,count,bytes.Length-count);if(read==0)break;count+=read; }
      Need(count==bytes.Length && stream.ReadByte()==-1,"smoke-bytes");
    }
    using(var hash=System.Security.Cryptography.SHA256.Create()) {
      Need(System.BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()==${literal(sha256Text(smokeText))},"smoke-hash");
    }
    string[] result=new System.Text.UTF8Encoding(false,true).GetString(bytes).Split('\\0');
    Need(result.Length==${String(smokeExpected.length)},"smoke-count");return result;
  }
  static void VerifySmokeCore(bool workerStartup209) {
    string[] expected=SmokeExpected();
    System.Collections.Hashtable fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);
${smoke}
${footprintSmoke}
${parentSmoke}
    fields.Clear();fields.Add("objectId","__startup_argument0__");fields.Add("argument0","other");
    string collision=EncodeCore(256,"Runtime.callFunctionOn","s","same",fields,workerStartup209);
    Need(collision.Contains(@"""objectId"":""__startup_argument0__""") && collision.Contains(@"""objectId"":""other"""),"smoke-placeholder");
    foreach(int id in new int[]{0,257}) {bool refused=false;try{EncodeCore(id,"Runtime.callFunctionOn","s","same",fields,workerStartup209);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-budget");}
    foreach(object bad in new object[]{null,"",7,"bad\\nhandle"}) {fields["argument0"]=bad;bool refused=false;try{EncodeCore(1,"Runtime.callFunctionOn","s","same",fields,workerStartup209);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-handle");}
    fields["argument0"]="other";fields.Add("expression","arbitrary");
    bool extra=false;try{EncodeCore(1,"Runtime.callFunctionOn","s","same",fields,workerStartup209);}catch(System.InvalidOperationException){extra=true;}Need(extra,"smoke-extra");
  }
}
// END GENERATED WORKER STARTUP PROTOCOL`;
}
