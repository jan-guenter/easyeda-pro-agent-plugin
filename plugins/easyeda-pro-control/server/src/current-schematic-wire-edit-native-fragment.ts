/** Build-only original existing-LINE birth. Shared encoders are fixed data;
 * the Wire owner cannot dispatch old display or Via mutation vocabulary. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentSchematicWireEditNativeCommand } from "./current-schematic-wire-edit-native-command.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "./current-schematic-wire-edit-native-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SIX_PROFILE } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS as SIX_STRUCTURE, CURRENT_SCHEMATIC_RELEVANCE_SAVE_STRUCTURE_REQUESTS as STRUCTURE } from "./current-project-save-structure-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NAVIGATION_FUNCTION as NAVIGATION, CURRENT_SCHEMATIC_WIRE_EDIT_STAGE_FUNCTION as STAGE, CURRENT_SCHEMATIC_WIRE_EDIT_START_FUNCTION as START } from "./current-schematic-wire-edit-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_NAVIGATION_FUNCTION as SHARED_NAVIGATION, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_START_FUNCTION as SHARED_START } from "./current-schematic-relevance-display-write-programs.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN GENERATED SCHEMATIC WIRE EDIT BIRTH209", end = "// END GENERATED SCHEMATIC WIRE EDIT BIRTH209";
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function once(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_WIRE_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`SCHEMATIC_WIRE_NATIVE_ANCHOR:${before.slice(0, 64)}`); } return source.replace(before, after);
}
function method(source: string, start: string, stop: string): string {
  if (source.split(start).length !== 2 || source.split(stop).length !== 2) { throw new Error("SCHEMATIC_WIRE_NATIVE_METHOD"); }
  const from = source.indexOf(start), to = source.indexOf(stop, from); if (to < from) { throw new Error("SCHEMATIC_WIRE_NATIVE_METHOD_ORDER"); } return source.slice(from, to);
}
function packed(text: string): string {
  const raw = Buffer.from(text); if (raw.length === 0 || raw.length > 65_536) { throw new Error("SCHEMATIC_WIRE_NATIVE_PROGRAM_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Build-only fixed programs use the unchanged bounded decoder.
  const gzip = gzipSync(raw, { level: 9 });
  return `UnpackFixedProgram(${quote(gzip.toString("base64"))},${String(raw.length)},${quote(createHash("sha256").update(raw).digest("hex"))},${quote(createHash("sha256").update(gzip).digest("hex"))})`;
}
/** Only deterministic Wire-owned additions are restored before the earlier
 * fragments replace their marker blocks. No unknown source is normalized. */
export function normalizeCurrentSchematicWireEditNativeFamily(input: string): string {
  let source = input; const from = source.indexOf(begin), to = source.indexOf(end);
  if (from !== -1 || to !== -1) {
    if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length) || source[from - 1] !== "\n" || source[to + end.length] !== "\n") { throw new Error("SCHEMATIC_WIRE_NATIVE_MARKERS"); }
    source = source.slice(0, from - 1) + source.slice(to + end.length);
  }
  return source.replace("schematicDisplayWrite209||schematicRelevanceDisplayWrite209||schematicWireEdit209", "schematicDisplayWrite209||schematicRelevanceDisplayWrite209")
    .replaceAll("-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209)", "-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209)")
    .replace(`schematicStructureNormal>=((schematicRelevanceDisplayWrite209||schematicWireEdit209)?${String(STRUCTURE.normal)}:${String(SIX_STRUCTURE.normal)})`, `schematicStructureNormal>=(schematicRelevanceDisplayWrite209?${String(STRUCTURE.normal)}:${String(SIX_STRUCTURE.normal)})`)
    .replace("schematicStartupCalls>=((schematicRelevanceDisplayWrite209||schematicWireEdit209)?8:7)", "schematicStartupCalls>=(schematicRelevanceDisplayWrite209?8:7)")
    .replace(` if(schematicWireEdit209)return ${String(PROFILE.renderer.total)};`, "")
    .replace("elseif ($SchematicWireEdit209) {[EasyedaDiagnosticOwner]::CreateSchematicWireEdit209()} ", "")
    .replace("      if ($SchematicWireEdit209) {$owner.AdmitSchematicWireEditAction($request.action)}\n", "")
    .replace(`          if ($SchematicWireEdit209) {$requestLimit=${String(PROFILE.renderer.total)}}\n`, "")
    .replace("$footprintMainPurpose=$SchematicWireEdit209 -or ", "$footprintMainPurpose=");
}
export function prepareCurrentSchematicWireEditNativeSwitch(input: string): string {
  const count = input.slice(0, input.indexOf("\n")).split("[switch]$SchematicWireEdit209,").length - 1;
  if (count > 1) { throw new Error("SCHEMATIC_WIRE_NATIVE_SWITCH_DUPLICATE"); } if (count === 1) { return input; }
  return once(input, "[switch]$SchematicDisplayWrite209,", "[switch]$SchematicWireEdit209,[switch]$SchematicDisplayWrite209,");
}
function native(source: string): string {
  if (START !== SHARED_START || NAVIGATION !== SHARED_NAVIGATION) { throw new Error("SCHEMATIC_WIRE_SHARED_PROGRAM_DRIFT"); }
  const admission = method(source, "public void AdmitSchematicDisplayAction(string action)", "void SchematicDisplayDiscovery(")
    .replaceAll("AdmitSchematicDisplayAction", "AdmitSchematicWireEditAction").replaceAll("schematicDisplayWrite209", "schematicWireEdit209").replaceAll('"schematic-display-native"', '"schematic-wire-edit-native"')
    .replace("(string action){", '(string action){foreach(string denied in new[]{"schematic-relevance-display-modify-bind","schematic-relevance-display-modify-generate","schematic-relevance-display-modify-entry","schematic-relevance-display-accessor","schematic-relevance-display-action","schematic-relevance-display-action-guard","schematic-relevance-display-action-guard-bind","schematic-relevance-display-producer-prefix-enroll","schematic-display-native","schematic-relevance-display-native","schematic-display-action","schematic-display-action-guard","schematic-display-action-guard-bind","schematic-display-accessor","schematic-display-clock","schematic-display-clock-bind","schematic-display-producer-prefix-enroll"})if(action==denied)throw Error("schematic-wire-own-mutation-required");');
  let encoder = method(source, "public static string SchematicDisplayProtocolMessage(", "public void SendSchematicDisplayNative(")
    .replaceAll("SchematicDisplayProtocolMessage", "SchematicWireEditProtocolMessage").replaceAll("SchematicDisplayIndex", "SchematicWireEditIndex")
    .replaceAll("SchematicDisplayStart", "SchematicWireEditStart").replaceAll("SchematicDisplayNavigation", "SchematicWireEditNavigation").replaceAll("SchematicDisplayStage", "SchematicWireEditStage")
    .replaceAll("easyeda-pro-control-schematic-display-native-v1", "easyeda-pro-control-schematic-wire-edit-native-v1");
  encoder = once(encoder, `id>${String(SIX_PROFILE.renderer.total)}`, `id>${String(PROFILE.renderer.total)}`);
  const send = method(source, "public void SendSchematicDisplayNative(", "public void AbortSchematicDisplayWrite()")
    .replaceAll("SendSchematicDisplayNative", "SendSchematicWireEditNative").replaceAll("SchematicDisplayProtocolMessage", "SchematicWireEditProtocolMessage")
    .replaceAll("SchematicDisplayIndex", "SchematicWireEditIndex").replaceAll("schematicDisplayWrite209", "schematicWireEdit209");
  return `${begin}
internal enum EasyedaSchematicWireEditBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {internal EasyedaOriginalMainTransport(EasyedaSchematicWireEditBirth birth):this(){Need(birth==EasyedaSchematicWireEditBirth.Original,"schematic-wire-purpose");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}}
public sealed partial class EasyedaDiagnosticOwner {
bool schematicWireEdit209;
static string SchematicWireEditStart {get{return SchematicRelevanceDisplayStart;}}
static string SchematicWireEditNavigation {get{return SchematicRelevanceDisplayNavigation;}}
static readonly string SchematicWireEditStage=${packed(STAGE)};
EasyedaDiagnosticOwner(EasyedaSchematicWireEditBirth birth):this(){if(birth!=EasyedaSchematicWireEditBirth.Original)throw Error("schematic-wire-birth");schematicWireEdit209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(EasyedaSchematicWireEditBirth.Original);}
public static EasyedaDiagnosticOwner CreateSchematicWireEdit209(){return new EasyedaDiagnosticOwner(EasyedaSchematicWireEditBirth.Original);}
static int SchematicWireEditIndex(string phase){return Array.IndexOf(new[]{"start","navigate","capture","preflight","modify","observe"},phase);}
${admission}
${encoder}
${send}
${smoke()}
}
${end}`;
}
function smoke(): string {
  const target = { rawWindowsPath: String.raw`C:\Synthetic\Codex_schematic_relevance_1111111111111111.eprj2`, projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), schematicUuid: "e".repeat(32), pageUuid: "f".repeat(32), expectedSourceSha256: "1".repeat(64) };
  const operation = { operationId: "sch209-wire-edit-native-smoke", wireId: "wire-1", lineId: "line-1", beforeBody: {}, afterBody: {}, rootIds: ["text-1", "wire-1", "bus-1"], peers: Array.from({ length: 6 }, (_, index) => ({ id: `peer${String(index)}`, type: "ATTR", body: {} })) };
  const capture = currentSchematicWireEditNativeCommand("capture", "original_binding", target, operation);
  if (capture.schematicWireEditPhase !== "capture") { throw new Error("SCHEMATIC_WIRE_NATIVE_SMOKE"); }
  const checks = (["start", "navigate", "capture", "preflight", "modify", "observe"] as const).flatMap(phase => [63, PROFILE.renderer.total].map(id => {
    const command = currentSchematicWireEditNativeCommand(phase, "original_binding", target, operation), fields: Record<string, string> = {};
    if ("uniqueContextId" in command.params) { fields["uniqueContextId"] = command.params.uniqueContextId; } else { fields["objectId"] = command.params.objectId; }
    if (command.schematicWireEditPhase !== "start") { fields["targetJson"] = "smokeTarget"; if (command.schematicWireEditPhase !== "navigate") { fields["operationJson"] = "smokeOperation"; } }
    const bytes = Buffer.from(`${JSON.stringify({ id, method: command.method, params: command.params, sessionId: "original_session" })}\0`);
    return `{var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);${Object.entries(fields).map(([key, value]) => `fields.Add(${quote(key)},${key === "targetJson" || key === "operationJson" ? value : quote(value)});`).join("")}string text=SchematicWireEditProtocolMessage(${String(id)},"original_session",${quote(phase)},fields);using(var sha=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=${quote(createHash("sha256").update(bytes).digest("hex"))})throw Error("schematic-wire-message-smoke");}`;
  }));
  return `public static void VerifySchematicWireEditSmoke(){string smokeTarget=${quote(capture.params.arguments[0].value)},smokeOperation=${quote(capture.params.arguments[2].value)};${checks.join("")}var owner=CreateSchematicWireEdit209();if(!owner.schematicWireEdit209||owner.schematicDisplayWrite209||owner.schematicRelevanceDisplayWrite209||owner.pcbViaWrite209||owner.root!=IntPtr.Zero||owner.job!=IntPtr.Zero||owner.originalMain==null||SchematicWireEditIndex("save")!=-1)throw Error("schematic-wire-birth-smoke");foreach(string action in new[]{"schematic-relevance-display-modify-bind","schematic-relevance-display-modify-generate","schematic-relevance-display-modify-entry","schematic-display-native","schematic-relevance-display-native","pcb-via-sdk","footprint-copy-native-create"}){bool refused=false;try{owner.AdmitSchematicWireEditAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-wire-foreign-action");}owner.originalMain.Release();}`;
}
const dispatch = String.raw`        'schematic-wire-edit-native' {
          if (-not $SchematicWireEdit209 -or -not $launched -or $request.sessionId -isnot [string] -or $request.phase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-wire-native-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','sessionId','phase');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-wire-native-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendSchematicWireEditNative([int]$request.requestId,$request.sessionId,$request.phase,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicWireEditNativeFragment(input: string): string {
  let source = normalizeCurrentSchematicWireEditNativeFamily(input);
  const extra = native(source);
  source = once(source, "schematicDisplayWrite209||schematicRelevanceDisplayWrite209", "schematicDisplayWrite209||schematicRelevanceDisplayWrite209||schematicWireEdit209");
  source = source.replaceAll("-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209)", "-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209)");
  source = once(source, `schematicStructureNormal>=(schematicRelevanceDisplayWrite209?${String(STRUCTURE.normal)}:${String(SIX_STRUCTURE.normal)})`, `schematicStructureNormal>=((schematicRelevanceDisplayWrite209||schematicWireEdit209)?${String(STRUCTURE.normal)}:${String(SIX_STRUCTURE.normal)})`);
  source = once(source, "schematicStartupCalls>=(schematicRelevanceDisplayWrite209?8:7)", "schematicStartupCalls>=((schematicRelevanceDisplayWrite209||schematicWireEdit209)?8:7)");
  source = prepareCurrentSchematicWireEditNativeSwitch(source);
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "SchematicWireEdit209");
  const conflict = `if ($SchematicWireEdit209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-schematic-wire-purpose'}\n`;
  const prior = source.split("\n").filter(line => line.startsWith("if ($SchematicWireEdit209 -and ("));
  if (prior.length > 1) { throw new Error("SCHEMATIC_WIRE_NATIVE_CONFLICT_DUPLICATE"); }
  source = prior[0] === undefined ? once(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`) : source.replace(`${prior[0]}\n`, conflict);
  source = once(source, "$footprintMainPurpose=", "$footprintMainPurpose=$SchematicWireEdit209 -or ");
  source = once(source, "elseif ($SchematicRelevanceDisplayWrite209)", "elseif ($SchematicWireEdit209) {[EasyedaDiagnosticOwner]::CreateSchematicWireEdit209()} elseif ($SchematicRelevanceDisplayWrite209)");
  source = once(source, "int RequestLimit { get {", `int RequestLimit { get { if(schematicWireEdit209)return ${String(PROFILE.renderer.total)};`);
  source = once(source, "      if ($SchematicRelevanceDisplayWrite209) {$owner.AdmitSchematicRelevanceDisplayAction($request.action)}", "      if ($SchematicWireEdit209) {$owner.AdmitSchematicWireEditAction($request.action)}\n      if ($SchematicRelevanceDisplayWrite209) {$owner.AdmitSchematicRelevanceDisplayAction($request.action)}");
  source = once(source, "          if ($SchematicRelevanceDisplayWrite209) {$requestLimit=", `          if ($SchematicWireEdit209) {$requestLimit=${String(PROFILE.renderer.total)}}\n          if ($SchematicRelevanceDisplayWrite209) {$requestLimit=`);
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicWireEditSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplaySmoke()");
  return once(source, "\n'@\n", `\n${extra}\n'@\n`);
}
