/** Generated exact UI grammar for a separately sealed copy-purpose owner.
 * Session/process/source lifetime and request reservations remain its duties. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_CALLS as CALLS } from "./current-footprint-copy-manager-route-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP, CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_FLAGS as FLAGS } from "./current-footprint-copy-manager-route-command.ts";
import type { CurrentFootprintCopyManagerRouteCommand } from "./current-footprint-copy-manager-route-command.ts";
import { currentFootprintCopyManagerRouteWire } from "./current-footprint-copy-manager-route-wire.ts";

const sessionId = "__copymanager_sessionId__";
const target = [{ value: "a".repeat(64) }, { value: "b".repeat(32) }, { value: "copymanager_tab" }];
const object = (index: number): Readonly<{ objectId: string }> => ({ objectId: `__copymanager_argument${String(index)}__` });
const templateValues: Readonly<Record<string, string>> = Object.freeze({ projectUuid: target[0]?.value ?? "",
  branchUuid: target[1]?.value ?? "", windowTabId: target[2]?.value ?? "" });
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
export function currentFootprintCopyManagerRouteNativeCases(): readonly CurrentFootprintCopyManagerRouteCommand[] {
  const commands: CurrentFootprintCopyManagerRouteCommand[] = [];
  const args = { initial: target, serviceUi: [], serviceManager: [], handler: [],
    registry: [object(0), ...target], project: [object(0), object(1), ...target],
    recheckUi: [...Array.from({ length: 7 }, (_, index) => object(index)), ...target],
    recheckManager: [...Array.from({ length: 7 }, (_, index) => object(index)), ...target] };
  for (const phase of ["initial", "serviceUi", "serviceManager", "handler", "registry", "project", "recheckUi", "recheckManager"] as const) {
    commands.push({ phase, method: "Runtime.callFunctionOn", sessionId, params: { ...FLAGS, objectId: "__copymanager_objectId__",
      functionDeclaration: CALLS[phase].program, arguments: args[phase], returnByValue: CALLS[phase].returnByValue } });
  }
  commands.push({ phase: "properties", method: "Runtime.getProperties", sessionId,
    params: { objectId: "__copymanager_objectId__", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
  { phase: "source", method: "Debugger.getScriptSource", sessionId, params: { scriptId: "__copymanager_scriptId__" } },
  { phase: "release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP } });
  return Object.freeze(commands);
}
export function currentFootprintCopyManagerRouteNativeSource(): string {
  const rows: string[] = [];
  for (const original of currentFootprintCopyManagerRouteNativeCases()) {
    const wire = currentFootprintCopyManagerRouteWire(original, 1);
    const fields = Object.entries(wire.request).filter(([key]) => !["action", "requestId", "method", "parentPhase"].includes(key));
    const { phase, ...native } = original;
    let template = JSON.stringify(native);
    for (const [key, value] of fields) {
      const marker = `__copymanager_${key}__`;
      if (value !== marker) {
        if (templateValues[key] !== value) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_NATIVE_VALUE"); }
        template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker));
      }
      if (!template.includes(JSON.stringify(marker))) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_NATIVE_FIELD"); }
    }
    if (Buffer.byteLength(template) > 16_384 || template.includes("\0") || template.includes("\t")) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_NATIVE_BOUND"); }
    rows.push([phase, original.method, fields.map(([key]) => key).join(","), template].join("\t"));
  }
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory compression of eleven fixed grammar entries during generation.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintCopyManagerRouteProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-copy-manager-route-protocol");}
static string[][] Load(){return EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},11,4);}
static readonly string[][] Cases=Load();
static string Field(string name,object input){string value=input as string;Need(value!=null);string pattern=name=="projectUuid"?@"\\A[a-f0-9]{64}\\z":name=="branchUuid"?@"\\A[a-f0-9]{32}\\z":name=="windowTabId"?@"\\A[A-Za-z0-9_-]{1,128}\\z":name=="sessionId"||name=="uniqueContextId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(System.Text.RegularExpressions.Regex.IsMatch(value,pattern));return value;}
public static string Encode(int id,string phase,string method,string originalParentSession,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string session=Field("sessionId",originalParentSession);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}
string template=selected[3];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__copymanager_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append('"');output.Append(name=="sessionId"?session:Field(name,fields[name]));output.Append('"');previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text=output.ToString();Need(text.Length>1&&text[0]=='{'&&System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return "{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1)+"\\0";}
}`;
}
