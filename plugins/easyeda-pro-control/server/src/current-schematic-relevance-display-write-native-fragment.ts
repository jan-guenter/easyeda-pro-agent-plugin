/** Build-only distinct Relevance birth. Shared fixed worker/SQL codecs retain
 * their bytes; no existing six-record owner is upgraded or retargeted. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentSchematicRelevanceDisplayNativeCommand } from "./current-schematic-relevance-display-native-command.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_NAVIGATION_FUNCTION as NAVIGATION, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as STAGE,
  CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_START_FUNCTION as START } from "./current-schematic-relevance-display-write-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-relevance-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SIX_PROFILE } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVE_STRUCTURE_REQUESTS as SEVEN_STRUCTURE, CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS as SIX_STRUCTURE } from "./current-project-save-structure-protocol.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209", end = "// END GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209";
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function once(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`SCHEMATIC_RELEVANCE_NATIVE_ANCHOR:${before.slice(0, 60)}`); } return source.replace(before, after);
}
function method(source: string, start: string, stop: string): string {
  if (source.split(start).length !== 2 || source.split(stop).length !== 2) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_METHOD"); }
  const from = source.indexOf(start), to = source.indexOf(stop, from); if (to < from) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_METHOD_ORDER"); } return source.slice(from, to);
}
function packed(text: string): string {
  const bytes = Buffer.from(text); if (bytes.length === 0 || bytes.length > 65_536) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_PROGRAM_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Fixed build-only strings use the existing bounded native decoder.
  const compressed = gzipSync(bytes, { level: 9 });
  return `UnpackFixedProgram(${quote(compressed.toString("base64"))},${String(bytes.length)},${quote(createHash("sha256").update(bytes).digest("hex"))},${quote(createHash("sha256").update(compressed).digest("hex"))})`;
}
/** Restore only this unpublished adapter's deterministic family predicates
 * before the maintained fragments replace their original marker blocks. */
export function normalizeCurrentSchematicRelevanceDisplayNativeFamily(input: string): string {
  let source = input; const from = source.indexOf(begin), to = source.indexOf(end);
  if (from !== -1 || to !== -1) {
    if (from === -1 || to < from || source.includes(begin, from + begin.length) || source.includes(end, to + end.length)) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_MARKERS"); }
    if (source[from - 1] !== "\n" || source[to + end.length] !== "\n") { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_MARKER_LINES"); }
    source = source.slice(0, from - 1) + source.slice(to + end.length);
  }
  return source.replaceAll("SchematicDisplayFamily", "schematicDisplayWrite209")
    .replaceAll("-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209)", "-not $SchematicDisplayWrite209")
    .replace(`schematicStructureNormal>=(schematicRelevanceDisplayWrite209?${String(SEVEN_STRUCTURE.normal)}:${String(SIX_STRUCTURE.normal)})`, `schematicStructureNormal>=${String(SIX_STRUCTURE.normal)}`)
    .replace("schematicStartupCalls>=(schematicRelevanceDisplayWrite209?8:7)", "schematicStartupCalls>=7")
    .replace(` if(schematicRelevanceDisplayWrite209)return ${String(PROFILE.renderer.total)};`, "")
    .replace("elseif ($SchematicRelevanceDisplayWrite209) {[EasyedaDiagnosticOwner]::CreateSchematicRelevanceDisplayWrite209()} ", "")
    .replace("      if ($SchematicRelevanceDisplayWrite209) {$owner.AdmitSchematicRelevanceDisplayAction($request.action)}\n", "")
    .replace(`          if ($SchematicRelevanceDisplayWrite209) {$requestLimit=${String(PROFILE.renderer.total)}}\n`, "")
    .replace("$footprintMainPurpose=$SchematicRelevanceDisplayWrite209 -or ", "$footprintMainPurpose=");
}
export function prepareCurrentSchematicRelevanceDisplayNativeSwitch(input: string): string {
  return once(input, "[switch]$SchematicDisplayWrite209,", "[switch]$SchematicRelevanceDisplayWrite209,[switch]$SchematicDisplayWrite209,");
}
function native(source: string): string {
  const admission = method(source, "public void AdmitSchematicDisplayAction(string action)", "void SchematicDisplayDiscovery(")
    .replace("AdmitSchematicDisplayAction", "AdmitSchematicRelevanceDisplayAction").replaceAll("schematicDisplayWrite209", "schematicRelevanceDisplayWrite209")
    .replaceAll('"schematic-display-native"', '"schematic-relevance-display-native"')
    .replace("(string action){", '(string action){foreach(string denied in new[]{"schematic-display-native","schematic-display-action","schematic-display-action-guard","schematic-display-action-guard-bind","schematic-display-accessor","schematic-display-clock","schematic-display-clock-bind","schematic-display-producer-prefix-enroll"})if(action==denied)throw Error("schematic-relevance-own-mutation-origin-required");');
  let encoder = method(source, "public static string SchematicDisplayProtocolMessage(", "public void SendSchematicDisplayNative(")
    .replaceAll("SchematicDisplayProtocolMessage", "SchematicRelevanceDisplayProtocolMessage").replaceAll("SchematicDisplayStart", "SchematicRelevanceDisplayStart")
    .replaceAll("SchematicDisplayNavigation", "SchematicRelevanceDisplayNavigation").replaceAll("SchematicDisplayStage", "SchematicRelevanceDisplayStage")
    .replaceAll("easyeda-pro-control-schematic-display-native-v1", "easyeda-pro-control-schematic-relevance-display-native-v1");
  encoder = once(encoder, `id>${String(SIX_PROFILE.renderer.total)}`, `id>${String(PROFILE.renderer.total)}`);
  const send = method(source, "public void SendSchematicDisplayNative(", "public void AbortSchematicDisplayWrite()")
    .replaceAll("SendSchematicDisplayNative", "SendSchematicRelevanceDisplayNative").replaceAll("SchematicDisplayProtocolMessage", "SchematicRelevanceDisplayProtocolMessage")
    .replaceAll("schematicDisplayWrite209", "schematicRelevanceDisplayWrite209");
  return `${begin}
internal enum EasyedaSchematicRelevanceDisplayBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(EasyedaSchematicRelevanceDisplayBirth birth):this(){Need(birth==EasyedaSchematicRelevanceDisplayBirth.Original,"schematic-relevance-purpose");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}
}
public sealed partial class EasyedaDiagnosticOwner {
bool schematicRelevanceDisplayWrite209;
bool SchematicDisplayFamily {get{return schematicDisplayWrite209||schematicRelevanceDisplayWrite209;}}
static readonly string SchematicRelevanceDisplayStart=${packed(START)};
static readonly string SchematicRelevanceDisplayNavigation=${packed(NAVIGATION)};
static readonly string SchematicRelevanceDisplayStage=${packed(STAGE)};
EasyedaDiagnosticOwner(EasyedaSchematicRelevanceDisplayBirth birth):this(){if(birth!=EasyedaSchematicRelevanceDisplayBirth.Original)throw Error("schematic-relevance-birth");schematicRelevanceDisplayWrite209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(EasyedaSchematicRelevanceDisplayBirth.Original);}
public static EasyedaDiagnosticOwner CreateSchematicRelevanceDisplayWrite209(){return new EasyedaDiagnosticOwner(EasyedaSchematicRelevanceDisplayBirth.Original);}
${admission}
${encoder}
${send}
${smoke()}
}
${end}`;
}
function smoke(): string {
  const target = { rawWindowsPath: String.raw`C:\Synthetic\Codex_schematic_relevance_1111111111111111.eprj2`, projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), schematicUuid: "e".repeat(32), pageUuid: "f".repeat(32), expectedSourceSha256: "1".repeat(64) };
  const operation = { operationId: "sch209-relevance-display-native-smoke", textId: "text-1", beforeBody: {}, afterBody: {}, rootIds: ["text-1", "wire-1", "bus-1"],
    peers: Array.from({ length: 6 }, (_, index) => ({ id: `peer${String(index)}`, type: "ATTR", body: {} })) };
  const captured = currentSchematicRelevanceDisplayNativeCommand("capture", "original_binding", target, operation);
  if (captured.schematicRelevanceDisplayPhase !== "capture") { throw new Error("SCHEMATIC_RELEVANCE_SMOKE_PHASE"); }
  const smokeOperation = captured.params.arguments[2].value, smokeTarget = captured.params.arguments[0].value;
  const fieldLiteral = (key: string, value: string): string => { if (key === "targetJson") { return "smokeTarget"; } if (key === "operationJson") { return "smokeOperation"; } return quote(value); };
  const checks = (["start", "navigate", "capture", "preflight", "modify", "observe", "save"] as const).flatMap(phase => [63, PROFILE.renderer.total].map(id => {
    const command = currentSchematicRelevanceDisplayNativeCommand(phase, "original_binding", target, operation), fields: Record<string, string> = {};
    if ("uniqueContextId" in command.params) { fields["uniqueContextId"] = command.params.uniqueContextId; } else { fields["objectId"] = command.params.objectId; }
    if (command.schematicRelevanceDisplayPhase !== "start") { fields["targetJson"] = command.params.arguments[0].value;
      if (command.schematicRelevanceDisplayPhase !== "navigate") { fields["operationJson"] = command.params.arguments[2].value; } }
    const bytes = Buffer.from(`${JSON.stringify({ id, method: command.method, params: command.params, sessionId: "original_session" })}\0`);
    return `{var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);${Object.entries(fields).map(([key, value]) => `fields.Add(${quote(key)},${fieldLiteral(key, value)});`).join("")}string text=SchematicRelevanceDisplayProtocolMessage(${String(id)},"original_session",${quote(phase)},fields);using(var sha=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=${quote(createHash("sha256").update(bytes).digest("hex"))})throw Error("schematic-relevance-wire-smoke");}`;
  }));
  return `public static void VerifySchematicRelevanceDisplaySmoke(){string smokeTarget=${quote(smokeTarget)},smokeOperation=${quote(smokeOperation)};${checks.join("")}var owner=CreateSchematicRelevanceDisplayWrite209();if(!owner.schematicRelevanceDisplayWrite209||owner.schematicDisplayWrite209||owner.pcbViaWrite209||owner.root!=IntPtr.Zero||owner.job!=IntPtr.Zero||owner.originalMain==null)throw Error("schematic-relevance-own-birth");foreach(string action in new[]{"schematic-display-native","pcb-via-sdk","footprint-copy-native-create"}){bool refused=false;try{owner.AdmitSchematicRelevanceDisplayAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-relevance-foreign-action");}owner.originalMain.Release();}`;
}
const dispatch = String.raw`        'schematic-relevance-display-native' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.sessionId -isnot [string] -or $request.phase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-relevance-native-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','sessionId','phase');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-relevance-native-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendSchematicRelevanceDisplayNative([int]$request.requestId,$request.sessionId,$request.phase,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplayWriteNativeFragment(input: string): string {
  let source = normalizeCurrentSchematicRelevanceDisplayNativeFamily(input);
  if (!source.includes("public static string SchematicDisplayProtocolMessage(")) { throw new Error("SCHEMATIC_RELEVANCE_SHARED_PROTOCOL_REQUIRED"); }
  const extra = native(source);
  const sixAdmission = method(source, "public void AdmitSchematicDisplayAction(string action)", "void SchematicDisplayDiscovery("),
    sixStage = method(source, "public void SendSchematicDisplayNative(", "public void AbortSchematicDisplayWrite()");
  const admissionMarker = "// FIXED SIX-RECORD ADMISSION RETAINED", stageMarker = "// FIXED SIX-RECORD STAGE RETAINED";
  if (source.includes(admissionMarker) || source.includes(stageMarker)) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_FAMILY_MARKER"); }
  source = once(source, sixAdmission, admissionMarker); source = once(source, sixStage, stageMarker);
  // These are reads of the unpublished family flag, never declarations,
  // Assignments or instance-qualified checks of the distinct original birth.
  source = source.replaceAll(/\bschematicDisplayWrite209\b(?!\s*=)/gu, (word, offset: number) => {
    const before = source.slice(Math.max(0, offset - 6), offset); return /(?:bool\s|\.)$/u.test(before) ? word : "SchematicDisplayFamily";
  });
  source = source.replaceAll("-not $SchematicDisplayWrite209", "-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209)");
  source = once(source, admissionMarker, sixAdmission); source = once(source, stageMarker, sixStage);
  source = once(source, `schematicStructureNormal>=${String(SIX_STRUCTURE.normal)}`, `schematicStructureNormal>=(schematicRelevanceDisplayWrite209?${String(SEVEN_STRUCTURE.normal)}:${String(SIX_STRUCTURE.normal)})`);
  source = once(source, "schematicStartupCalls>=7", "schematicStartupCalls>=(schematicRelevanceDisplayWrite209?8:7)");
  source = once(source, "[switch]$SchematicDisplayWrite209,", "[switch]$SchematicRelevanceDisplayWrite209,[switch]$SchematicDisplayWrite209,");
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "SchematicRelevanceDisplayWrite209");
  const conflict = `if ($SchematicRelevanceDisplayWrite209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-schematic-relevance-purpose'}\n`;
  const prior = source.split("\n").filter(line => line.startsWith("if ($SchematicRelevanceDisplayWrite209 -and ("));
  if (prior.length > 1) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_CONFLICT_DUPLICATE"); }
  source = prior[0] === undefined ? once(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`) : source.replace(`${prior[0]}\n`, conflict);
  source = once(source, "$footprintMainPurpose=$ProjectStructure209 -or ", "$footprintMainPurpose=$SchematicRelevanceDisplayWrite209 -or $ProjectStructure209 -or ");
  source = once(source, "elseif ($SchematicDisplayWrite209)", "elseif ($SchematicRelevanceDisplayWrite209) {[EasyedaDiagnosticOwner]::CreateSchematicRelevanceDisplayWrite209()} elseif ($SchematicDisplayWrite209)");
  source = once(source, "int RequestLimit { get {", `int RequestLimit { get { if(schematicRelevanceDisplayWrite209)return ${String(PROFILE.renderer.total)};`);
  source = once(source, "      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}", "      if ($SchematicRelevanceDisplayWrite209) {$owner.AdmitSchematicRelevanceDisplayAction($request.action)}\n      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}");
  source = once(source, "          if ($SchematicDisplayWrite209) {$requestLimit=", `          if ($SchematicRelevanceDisplayWrite209) {$requestLimit=${String(PROFILE.renderer.total)}}\n          if ($SchematicDisplayWrite209) {$requestLimit=`);
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-display-native' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplaySmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()");
  return once(source, "\n'@\n", `\n${extra}\n'@\n`);
}
