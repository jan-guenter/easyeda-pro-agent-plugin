/** Fixed native codebook for the original structure observer. It is deliberately
 * separate from the old main/request encoders and cannot admit their purposes. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_FLAGS as FLAGS } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainCommand as Command } from "./current-project-structure-main-protocol.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_ORDER as ORDER, CURRENT_PROJECT_STRUCTURE_MAIN_SITES as SITES } from "./current-project-structure-main-source.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_SHARED_PROGRAM_TEXT as COMMON, CURRENT_PROJECT_STRUCTURE_MAIN_EXPRESSIONS as EXPRESSIONS,
  CURRENT_PROJECT_STRUCTURE_MAIN_GROUP as GROUP, CURRENT_PROJECT_STRUCTURE_MAIN_PROGRAMS as PROGRAMS } from "./current-project-structure-main-programs.ts";
import { currentProjectStructureMainWire } from "./current-project-structure-main-wire.ts";

const marker = (name: string): string => `__structure_${name}__`;
const shared = "__structure_shared_program_text__";
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const frameStages = [...ORDER, "driverCaller", "selectCaller"] as const;
const joinStages = [...ORDER, "context-join", "connection", "value"] as const;
const arg = (index: number): Readonly<{ objectId: string }> => ({ objectId: `structure_argument${String(index)}` });
const quote = String.raw`static string Quote(string value){var b=new System.Text.StringBuilder();b.Append('"');for(int i=0;i<value.Length;i++){char c=value[i];if(char.IsHighSurrogate(c)){Need(i+1<value.Length&&char.IsLowSurrogate(value[i+1]));b.Append(c);b.Append(value[++i]);}else{Need(!char.IsLowSurrogate(c));if(c=='"'||c=='\\'){b.Append('\\');b.Append(c);}else if(c=='\b')b.Append("\\b");else if(c=='\t')b.Append("\\t");else if(c=='\n')b.Append("\\n");else if(c=='\f')b.Append("\\f");else if(c=='\r')b.Append("\\r");else if(c<32){b.Append("\\u");b.Append(((int)c).ToString("x4",System.Globalization.CultureInfo.InvariantCulture));}else b.Append(c);}}b.Append('"');return b.ToString();}`;
/** Fixed inert scalar samples used only to derive the codebook and smoke hashes. */
function sample(name: string): string | number {
  if (name === "projectUuid") { return "a".repeat(64); } if (name === "branchUuid") { return "b".repeat(32); }
  if (name === "ticket") { return 101; } if (name === "structureText") { return "inert structure tree"; }
  return `structure_${name}`;
}
/** Enumerate every admitted command shape with no caller-supplied source. */
export function currentProjectStructureMainNativeCases(): readonly Command[] {
  const objectId = "structure_objectId";
  const plan = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), structureText: "inert structure tree", ticket: 101 };
  return Object.freeze([
    ...ORDER.map(stage => ({ phase: "structure-main-arm", stage, method: "Debugger.setBreakpoint", params: {
      location: { scriptId: "structure_scriptId", lineNumber: SITES[stage].lineNumber, columnNumber: SITES[stage].columnNumber } } }) as const),
    ...frameStages.map(stage => ({ phase: "structure-main-frame", stage,
      method: "Debugger.evaluateOnCallFrame", params: { callFrameId: "structure_callFrameId", expression: EXPRESSIONS[stage], objectGroup: GROUP,
        silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }) as const),
    ...joinStages.map(stage => {
      const argumentsList: ({ objectId: string } | { value: typeof plan })[] = stage === "value" ? [] : [arg(0)];
      if (stage === "driver" || stage === "query-one" || stage === "controller") { argumentsList.push(arg(1)); }
      if (stage === "controller") { argumentsList.push({ value: plan }); }
      return { phase: "structure-main-join", stage, method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId, functionDeclaration: PROGRAMS[stage], arguments: argumentsList, returnByValue: ["context-join", "connection", "value"].includes(stage) } } as const;
    }),
    { phase: "structure-main-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "structure-main-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "structure_breakpointId" } },
    { phase: "structure-main-resume", method: "Debugger.resume", params: {} },
    { phase: "structure-main-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ] satisfies Command[]);
}
/** Exact inspector payload for one admitted shape, without facade-only labels. */
function native(command: Command): string {
  return JSON.stringify({ method: command.method, params: command.params });
}
/** Pack the repeated descriptor guards once, preserving each reconstructed
 * program byte for byte. No remote helper/global state is installed. */
export function currentProjectStructureMainNativeSource(): string {
  const cases = currentProjectStructureMainNativeCases();
  const rows = cases.map(command => {
    const wire = currentProjectStructureMainWire(command, 1);
    const names = Object.keys(wire.request).filter(name => !["action", "requestId", "phase", "method"].includes(name));
    let template = native(command);
    const common = JSON.stringify(COMMON).slice(1, -1);
    if (template.includes(common)) { template = template.replace(common, shared); }
    for (const name of names) {
      const value = wire.request[name]; if (value === undefined || !template.includes(JSON.stringify(value))) { throw new Error("PROJECT_STRUCTURE_MAIN_NATIVE_FIELD"); }
      template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(name)));
    }
    if (template.includes("\0") || template.includes("\t")) { throw new Error("PROJECT_STRUCTURE_MAIN_NATIVE_TEMPLATE"); }
    return [wire.request["phase"], command.method, names.join(","), template].join("\t");
  });
  const common = JSON.stringify(COMMON).slice(1, -1);
  const bytes = Buffer.from([common, ...rows].join("\0"));
  if (bytes.length > 65_536) { throw new Error("PROJECT_STRUCTURE_MAIN_NATIVE_CODEBOOK_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Deterministic packing of fixed build-time source, without filesystem or application work.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = cases.map(command => createHash("sha256").update(`{"id":73,${native(command).slice(1)}`).digest("hex"));
  const samples = Object.fromEntries(["projectUuid", "branchUuid", "ticket", "structureText"].map(name => [name, sample(name)]));
  return `public static class EasyedaProjectStructureMainProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("pcb-diagnostic-structure-main-protocol");}
static readonly string[] Text=EasyedaDiagnosticOwner.UnpackFixedProgram(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))}).Split('\\0');
static string[][] Load(){Need(Text.Length==${String(rows.length + 1)});var result=new string[${String(rows.length)}][];for(int i=0;i<result.Length;i++){result[i]=Text[i+1].Split('\\t');Need(result[i].Length==4);}return result;}
static readonly string[][] Cases=Load();
${quote}
static string Field(string name,object input){if(name=="ticket"){Need(input is int||input is long);long n=System.Convert.ToInt64(input,System.Globalization.CultureInfo.InvariantCulture);Need(n>0&&n<=9007199254740991L);return n.ToString(System.Globalization.CultureInfo.InvariantCulture);}string value=input as string;Need(value!=null);if(name=="structureText"){Need(value.Length>0&&value.Length<=32768&&System.Text.Encoding.UTF8.GetByteCount(value)<=32768);return Quote(value);}Need(System.Text.RegularExpressions.Regex.IsMatch(value,name=="projectUuid"?@"\\A(?:[a-f0-9]{32}|[a-f0-9]{64})\\z":name=="branchUuid"?@"\\A[a-f0-9]{32}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return Quote(value);}
public static string Encode(int id,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==phase){Need(selected==null);selected=row;}Need(selected!=null&&selected[1]==method);string[] names=selected[2].Length==0?new string[0]:selected[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));foreach(System.Collections.DictionaryEntry entry in fields){bool found=false;foreach(string name in names)if(entry.Key as string==name)found=true;Need(found);}string template=selected[3].Replace("${shared}",Text[0]);var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__structure_([A-Za-z0-9]+)__\\"")){output.Append(template,previous,match.Index-previous);output.Append(Field(match.Groups[1].Value,fields[match.Groups[1].Value]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
static object Smoke(string name){if(name=="projectUuid")return new string('a',64);if(name=="branchUuid")return new string('b',32);if(name=="ticket")return ${String(samples["ticket"])};if(name=="structureText")return "${String(samples["structureText"])}";return "structure_"+name;}
static void Refused(System.Action action){bool refused=false;try{action();}catch(System.InvalidOperationException){refused=true;}Need(refused);}
public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Cases.Length;i++){string[] row=Cases[i];var fields=new System.Collections.Hashtable();if(row[2].Length>0)foreach(string name in row[2].Split(','))fields.Add(name,Smoke(name));string output=Encode(73,row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(output))).Replace("-","").ToLowerInvariant()==hashes[i]);Refused(()=>Encode(73,"unknown",row[1],fields));Refused(()=>Encode(73,row[0],"Runtime.evaluate",fields));fields.Add("functionDeclaration","function(){}");Refused(()=>Encode(73,row[0],row[1],fields));fields.Remove("functionDeclaration");Refused(()=>Encode(0,row[0],row[1],fields));if(fields.Contains("ticket")){fields["ticket"]="101";Refused(()=>Encode(73,row[0],row[1],fields));fields["ticket"]=101;}if(fields.Contains("structureText")){fields["structureText"]=new string((char)0xd800,1);Refused(()=>Encode(73,row[0],row[1],fields));}}}
}`;
}
