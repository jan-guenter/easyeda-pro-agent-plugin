/** Fixed C# table for original parser registration and async readback. This
 * encoder cannot manufacture an execution owner or choose its worker session. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_EXECUTION_WORKER_SITES as SITES,
  currentFootprintCopyExecutionWorkerWire } from "./current-footprint-copy-execution-worker-wire.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "./current-pcb-worker-construction-contract.ts";
import type { CurrentPcbWorkerStartupCommand } from "./current-pcb-worker-startup-contract.ts";

const marker = (name: string): string => `__copyworker_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintCopyExecutionWorkerNativeCases(): readonly CurrentPcbWorkerStartupCommand[] {
  return Object.freeze([
    ...Object.values(SITES).map(site => ({ method: "Debugger.setBreakpoint" as const, sessionId: marker("sessionId"),
      params: { location: { scriptId: marker("scriptId"), lineNumber: site.lineNumber, columnNumber: site.columnNumber } } })),
    ...Object.values(CALLS).map(call => ({ method: "Runtime.callFunctionOn" as const, sessionId: marker("sessionId"), params: {
      objectId: marker("objectId"), functionDeclaration: call.program,
      arguments: Array.from({ length: call.arguments }, (_, index) => ({ objectId: marker(`arg${String(index)}ObjectId`) })),
      objectGroup: CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group, silent: true as const, returnByValue: call.returnByValue,
      generatePreview: false as const, throwOnSideEffect: true as const, awaitPromise: false as const, userGesture: false as const,
    } })),
  ]);
}
export function currentFootprintCopyExecutionWorkerNativeSource(): string {
  const rows = currentFootprintCopyExecutionWorkerNativeCases().map(sample => {
    const wire = currentFootprintCopyExecutionWorkerWire(sample, 1);
    if (wire === null) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_CASE"); }
    const { id: _id, ...command } = wire.command;
    const fields = Object.keys(wire.request).filter(key => !["action", "requestId", "method", "executionPhase"].includes(key));
    const template = JSON.stringify(command);
    for (const field of fields) {
      if (wire.request[field] !== marker(field) || !template.includes(JSON.stringify(marker(field)))) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_FIELD"); }
    }
    if (Buffer.byteLength(template) > 16_384 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_BOUND"); }
    return [wire.request["executionPhase"], command.method, fields.join(","), template].join("\t");
  });
  const bytes = Buffer.from(rows.join("\0"));
  if (bytes.length > 65_536) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory compression of eleven fixed command templates during generation.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintCopyExecutionWorkerProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-worker-protocol");}
static string[][] Load(){return EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},11,4);}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);Need(System.Text.RegularExpressions.Regex.IsMatch(value,name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return value;}
public static string Encode(int id,string phase,string method,string originalWorkerSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string session=Field("sessionId",originalWorkerSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__copyworker_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\\0";}
}`;
}

/** The outer PowerShell envelope has an independent field allowlist. Derive
 * its complete union from real command cases so an added argument cannot pass
 * TypeScript/C# generation yet be refused before native reconstruction. */
export function assertCurrentFootprintCopyExecutionWorkerNativeFields(source: string): void {
  const begin = source.indexOf("'footprint-copy-worker' {"), end = source.indexOf("'footprint-saved-worker' {", begin);
  if (begin === -1 || end <= begin) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_FIELD_BOUNDARY"); }
  const body = source.slice(begin, end);
  const matched = /^\$footprintCopyWorkerHandleFields=@\(([^\n]+)\)$/mu.exec(source);
  if (!body.includes("if ($footprintCopyWorkerHandleFields -cnotcontains $property.Name -or")) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_FIELD_BOUNDARY"); }
  if (matched?.[1] === undefined) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_FIELD_BOUNDARY"); }
  const fields = [...matched[1].matchAll(/'([A-Za-z\d]+)'/gu)].map(match => match[1]);
  const expected = new Set<string>();
  for (const sample of currentFootprintCopyExecutionWorkerNativeCases()) {
    const wire = currentFootprintCopyExecutionWorkerWire(sample, 1);
    if (wire === null) { throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_CASE"); }
    for (const key of Object.keys(wire.request)) {
      if (!["action", "requestId", "method", "executionPhase"].includes(key)) { expected.add(key); }
    }
  }
  if (fields.length !== expected.size || fields.some(field => field === undefined || !expected.has(field)) || new Set(fields).size !== fields.length) {
    throw new Error("FOOTPRINT_COPY_EXECUTION_NATIVE_FIELD_BOUNDARY");
  }
}
