/** Exact fixed worker observer codebook. It reconstructs source in the helper;
 * wire input supplies only handles and cannot select a program or location. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_SITES as SITES } from "./current-project-structure-worker-profile.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_CALLS as CALLS } from "./current-project-structure-worker-programs.ts";
import { currentProjectStructureWorkerWire } from "./current-project-structure-worker-wire.ts";
import { CURRENT_FOOTPRINT_COLD_PRODUCER_CALLS as COLD } from "./current-footprint-cold-producer-roster.ts";
import { CURRENT_FOOTPRINT_HEAD_CACHE_CONDITION as CONDITION, CURRENT_FOOTPRINT_DETACHED_CACHE_SITES,
  CURRENT_FOOTPRINT_DETACHED_CACHE_CALLS as DETACHED, CURRENT_FOOTPRINT_DETACHED_CACHE_GROUP as DETACHED_GROUP,
  CURRENT_FOOTPRINT_DETACHED_CACHE_EXPRESSION as EXPRESSION, CURRENT_FOOTPRINT_HEAD_CACHE_CALLS as HEAD,
  CURRENT_FOOTPRINT_HEAD_CACHE_EXPRESSION as HEAD_EXPRESSION } from "./current-footprint-detached-cache-profile.ts";
import type { CurrentPcbWorkerStartupCommand as Command } from "./current-pcb-worker-startup-contract.ts";

const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const calls = Object.freeze({ ...CALLS, "cold-project": COLD.project, "cold-stream": COLD.stream, "cold-cooperation": COLD.cooperation,
  "detached-admit": DETACHED.admit, "detached-matches": DETACHED.matches, "head-admit": HEAD.admit, "head-matches": HEAD.matches,
  "head-retain": HEAD.retain, "head-barrier": HEAD.barrier });
const programs = ["retain", "pristine", "serial", "debounce", "callbackKind", "packet", "taskSet", "data", "taskRemoved", "same", "packetText", "success", "cold-project", "cold-stream", "cold-cooperation", "detached-admit", "detached-matches", "head-admit", "head-matches", "head-retain", "head-barrier"] as const;
/** Complete independent sample roster for native encoding and refusal smoke. */
export function currentProjectStructureWorkerNativeCases(): readonly Command[] {
  return Object.freeze([
    ...Object.values(SITES).map(site => ({ method: "Debugger.setBreakpoint", sessionId: "structure_sessionId", params: {
      location: { scriptId: "structure_scriptId", lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }) as const),
    ...Object.entries(CURRENT_FOOTPRINT_DETACHED_CACHE_SITES).map(([name, site]) => ({ method: "Debugger.setBreakpoint", sessionId: "structure_sessionId", params: {
      location: { scriptId: "structure_scriptId", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(name.startsWith("head") ? { condition: CONDITION } : {}) } }) as const),
    ...programs.map(name => {
      let count = 0;
      if (name === "pristine") { count = 7; }
      else if (name === "detached-admit" || name === "head-admit") { count = 1; }
      else if (name === "detached-matches" || name === "head-matches") { count = 2; }
      else if (name === "cold-stream" || name === "cold-cooperation") { count = 3; }
      else if (["debounce", "callbackKind", "packet", "taskRemoved"].includes(name)) { count = 2; }
      else if (["same", "serial"].includes(name)) { count = 1; }
      return { method: "Runtime.callFunctionOn", sessionId: "structure_sessionId", params: { objectId: "structure_objectId", functionDeclaration: calls[name],
        arguments: Array.from({ length: count }, (_, index) => ({ objectId: `structure_argument${String(index)}` })),
        objectGroup: name.startsWith("detached-") || name.startsWith("head-") ? DETACHED_GROUP : CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group, returnByValue: ["pristine", "callbackKind", "taskRemoved", "same", "packetText", "success", "cold-project", "cold-stream", "cold-cooperation", "detached-admit", "detached-matches", "head-admit", "head-matches", "head-barrier"].includes(name),
        silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } } as const;
    }),
    { method: "Debugger.evaluateOnCallFrame", sessionId: "structure_sessionId", params: { callFrameId: "structure_callFrameId", expression: EXPRESSION,
      objectGroup: DETACHED_GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } },
    { method: "Debugger.evaluateOnCallFrame", sessionId: "structure_sessionId", params: { callFrameId: "structure_callFrameId", expression: HEAD_EXPRESSION,
      objectGroup: DETACHED_GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } },
    { method: "Runtime.releaseObjectGroup", sessionId: "structure_sessionId", params: { objectGroup: DETACHED_GROUP } },
  ] satisfies Command[]);
}
/** Build the finite table once. The native decoder rechecks packed and decoded
 * identities before making any template available to the original purpose. */
export function currentProjectStructureWorkerNativeSource(): string {
  const cases = currentProjectStructureWorkerNativeCases();
  const rows = cases.map(command => {
    const wire = currentProjectStructureWorkerWire(command, 1);
    const names = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    let template = JSON.stringify(command);
    for (const name of names) { const value = wire.request[name];
      if (typeof value !== "string" || !template.includes(JSON.stringify(value))) { throw new Error("PROJECT_STRUCTURE_WORKER_NATIVE_FIELD"); }
      template = template.replaceAll(JSON.stringify(value), JSON.stringify(`__structureworker_${name}__`)); }
    return [wire.request["phase"], command.method, names.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0")); if (bytes.length > 65_536) { throw new Error("PROJECT_STRUCTURE_WORKER_NATIVE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- At most64KiB of immutable build-time source is packed in memory.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = cases.map(command => createHash("sha256").update(JSON.stringify({ id: 73, ...command })).digest("hex"));
  return `public static class EasyedaProjectStructureWorkerProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-structure-worker-protocol");}
static readonly string[][] Cases=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},4);
static string Field(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return "\\""+value+"\\"";}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}var output=new System.Text.StringBuilder();string template=selected[3];int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__structureworker_([A-Za-z0-9]+)__\\"")){output.Append(template,previous,match.Index-previous);output.Append(Field(fields[match.Groups[1].Value]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();foreach(string name in row[2].Split(','))fields.Add(name,"structure_"+name);string output=Encode(73,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(output))).Replace("-","").ToLowerInvariant()==hashes[i]);bool refused=false;fields.Add("functionDeclaration","function(){}");try{Encode(73,row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}`;
}
