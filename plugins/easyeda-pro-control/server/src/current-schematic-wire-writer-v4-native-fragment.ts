/* oxlint-disable import/max-dependencies -- Own v4 birth derives each fixed reader bound separately and shares only inert source encoders. */
/** Separate v4 native source birth. Fixed codecs share only inert encoding;
 * old purposes, native counters, stage parsers and programs stay unchanged. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PROFILE as PROFILE } from "./current-schematic-wire-writer-v4-native-profile.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_GROUP as GROUP, CURRENT_SCHEMATIC_WIRE_WRITER_V4_NAVIGATION as NAVIGATION, CURRENT_SCHEMATIC_WIRE_WRITER_V4_STAGE as STAGE, CURRENT_SCHEMATIC_WIRE_WRITER_V4_START as START } from "./current-schematic-wire-writer-v4-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as BASE } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS as ACCESSOR } from "./current-schematic-wire-accessor-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS as LEXICAL } from "./current-schematic-wire-lexical-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_INTENT_REQUESTS as INTENT } from "./current-schematic-wire-intent-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_DEPENDENCY_REQUESTS as DEPENDENCY } from "./current-schematic-wire-dependencies-protocol.ts";
import { currentSchematicWireWriterV4RunGuardCommand } from "./current-schematic-wire-writer-v4-run-guard.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN GENERATED SCHEMATIC WIRE WRITER V4 BIRTH", end = "// END GENERATED SCHEMATIC WIRE WRITER V4 BIRTH";
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
function once(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_NATIVE_ANCHOR"); } return source.replace(before, after);
}
function method(source: string, start: string, stop: string): string {
  if (source.split(start).length !== 2 || source.split(stop).length !== 2) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_NATIVE_METHOD"); }
  const from = source.indexOf(start), to = source.indexOf(stop, from); if (to <= from) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_NATIVE_METHOD_ORDER"); } return source.slice(from, to);
}
function packed(source: string): string {
  const raw = Buffer.from(source); if (raw.length === 0 || raw.length > 65_536) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_STAGE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Build-only fixed stage bytes retain the existing raw/packed hashes and64KiB decoder.
  const gzip = gzipSync(raw, { level: 9 });
  return `UnpackFixedProgram(${quote(gzip.toString("base64"))},${String(raw.length)},${quote(createHash("sha256").update(raw).digest("hex"))},${quote(createHash("sha256").update(gzip).digest("hex"))})`;
}
const smokeOperation = "{}";
const smokeTarget = JSON.stringify({ path: String.raw`C:\Synthetic`, value: "雪" });
const smokePhases = ["start", "navigate", "capture", "preflight", "modify", "observe", "save"] as const;
const smokeHashes = Buffer.concat(smokePhases.map((phase, index) => {
  const selector = index <= 2 ? "uniqueContextId" : "objectId";
  const args = []; let program = STAGE;
  if (index > 0) { args.push({ value: smokeTarget }); } if (index > 1) { args.push({ value: phase }, { value: smokeOperation }); }
  if (index === 0) { program = START; } else if (index === 1) { program = NAVIGATION; }
  const encoded = `${JSON.stringify({ id: 79, method: "Runtime.callFunctionOn", params: { throwOnSideEffect: false, silent: true, awaitPromise: true,
    generatePreview: false, userGesture: false, objectGroup: GROUP, functionDeclaration: program,
    [selector]: index <= 2 ? "original_context" : "original_holder", arguments: args, returnByValue: index !== 2 }, sessionId: "original_ui" })}\0`;
  return createHash("sha256").update(encoded).digest();
})).toString("base64");
const runHashes = Buffer.concat(([0, 1] as const).map(variant => {
  const command = currentSchematicWireWriterV4RunGuardCommand(variant, "original_script");
  return createHash("sha256").update(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`).digest();
})).toString("base64");
/** Exact common readonly startup/worker vocabulary used by the original
 * shared opening pipeline. Each sender still checks its own held stage. */
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_SHARED_ACTIONS = Object.freeze([
  "schematic-display-structure-transport-bind", "schematic-display-structure-transport",
  "schematic-display-worker-prepare", "schematic-display-worker-bind", "schematic-display-worker-parent", "schematic-display-worker",
  "schematic-display-periodic-sync", "schematic-display-periodic-sync-complete",
  "schematic-display-initial-sync", "schematic-display-initial-sync-complete",
  "schematic-display-initial-cache", "schematic-display-initial-cache-complete",
  "schematic-display-producer-bind", "schematic-display-producer-observe", "schematic-display-producer-guard",
] as const);
const readerRows = Object.freeze([
  ["Accessor", "accessor", "EasyedaSchematicWireAccessorProtocol", ACCESSOR],
  ["Lexical", "lexical", "EasyedaSchematicWireLexicalProtocol", LEXICAL],
  ["Intent", "intent", "EasyedaSchematicWireIntentProtocol", INTENT],
  ["Dependency", "dependencies", "EasyedaSchematicWireDependencyProtocol", DEPENDENCY],
] as const);
/** Independently pinned v4 owner region. Shared legacy field references are
 * separately counted here and cannot alter any released field catalogue. */
export function currentSchematicWireWriterV4OwnerSource(source: string): string {
  let encoder = method(source, "public static string SchematicDisplayProtocolMessage(", "public void SendSchematicDisplayNative(")
    .replaceAll("SchematicDisplayProtocolMessage", "WireWriterV4ProtocolMessage").replaceAll("SchematicDisplayIndex", "WireWriterV4Index")
    .replaceAll("SchematicDisplayStart", "WireWriterV4Start").replaceAll("SchematicDisplayNavigation", "WireWriterV4Navigation").replaceAll("SchematicDisplayStage", "WireWriterV4Stage")
    .replaceAll("easyeda-pro-control-schematic-display-native-v1", "easyeda-pro-control-schematic-wire-writer-native-v4");
  encoder = once(encoder, `id>${String(BASE.renderer.total)}`, `id>${String(PROFILE.renderer.total)}`);
  const send = method(source, "public void SendSchematicDisplayNative(", "public void AbortSchematicDisplayWrite()")
    .replaceAll("SendSchematicDisplayNative", "SendWireWriterV4Native").replaceAll("SchematicDisplayProtocolMessage", "WireWriterV4ProtocolMessage")
    .replaceAll("SchematicDisplayIndex", "WireWriterV4Index").replaceAll("!schematicDisplayWrite209", "!wireWriterV4");
  const readers = readerRows.map(([name, role, codec, requests]) => {
    const phase = role === "dependencies" ? "dependency" : role;
    return `int wireV4${name}Normal,wireV4${name}Cleanup;
public void SendWireWriterV4${name}(int id,string phase,string method,System.Collections.IDictionary fields){if(!wireWriterV4||schematicDisplayAbort||schematicDisplayTuple==null||schematicDisplayTarget==null||schematicDisplayOperation==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[5])throw Error("wire-v4-original-holder");bool cleanup=phase=="wire-${phase}-release";if(cleanup?wireV4${name}Cleanup>=${String(requests.cleanup)}:wireV4${name}Normal>=${String(requests.normal)})throw Error("wire-v4-reader-bound");string encoded=${codec}.Encode(id,schematicDisplaySession,schematicDisplayTuple,schematicDisplayTarget,schematicDisplayOperation,phase,method,fields);if(cleanup)wireV4${name}Cleanup++;else wireV4${name}Normal++;SendMessage(id,encoded);}`;
  }).join("\n");
  return `public sealed partial class EasyedaDiagnosticOwner {
// BEGIN GENERATED SCHEMATIC WIRE WRITER V4 FIELDS
bool wireWriterV4;int wireWriterV4Controls;
static string WireWriterV4Start {get{return SchematicWireEditStart;}}
static string WireWriterV4Navigation {get{return SchematicWireEditNavigation;}}
static readonly string WireWriterV4Stage=${packed(STAGE)};
EasyedaDiagnosticOwner(EasyedaSchematicWireWriterV4Birth birth):this(){if(birth!=EasyedaSchematicWireWriterV4Birth.Original)throw Error("wire-v4-birth");wireWriterV4=true;stockMainEligible=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(EasyedaSchematicWireWriterV4Birth.Original);}
public static EasyedaDiagnosticOwner CreateSchematicWireWriterV4(){return new EasyedaDiagnosticOwner(EasyedaSchematicWireWriterV4Birth.Original);}
public void AdmitWireWriterV4Action(string action){if(!wireWriterV4||++wireWriterV4Controls>30000)throw Error("wire-v4-purpose");if(schematicDisplayAbort&&action!="identity"&&action!="termination"&&action!="release")throw Error("wire-v4-cleanup-only");switch(action){case "identity":case "launch":case "send":case "poll":case "window":case "termination":case "normal-close":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "schematic-display-abort":${CURRENT_SCHEMATIC_WIRE_WRITER_V4_SHARED_ACTIONS.map(action => `case "${action}":`).join("")}case "schematic-wire-writer-v4-run-bind":case "schematic-wire-writer-v4-run-guard":case "schematic-wire-writer-v4-native":case "schematic-wire-writer-v4-accessor":case "schematic-wire-writer-v4-lexical":case "schematic-wire-writer-v4-intent":case "schematic-wire-writer-v4-dependencies":break;default:throw Error("wire-v4-action");}}
static int WireWriterV4Index(string phase){return Array.IndexOf(new[]{"start","navigate","capture","preflight","modify","observe","save"},phase);}
${encoder}
${send}
${readers}
string wireV4RunScript;int wireV4RunVariant;bool wireV4RunArmed;
public void BindWireWriterV4RunGuard(string script,int variant){if(!wireWriterV4||schematicDisplayAbort||schematicDisplaySession==null||schematicDisplayTuple==null||!schematicDisplayStages[3]||schematicDisplayStages[4]||schematicDisplayStages[6]||wireV4DependencyNormal==0||wireV4RunScript!=null||script==null||!System.Text.RegularExpressions.Regex.IsMatch(script,@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||(variant!=0&&variant!=1))throw Error("wire-v4-run-bind");AssertLive();wireV4RunScript=script;wireV4RunVariant=variant;}
public void ArmWireWriterV4RunGuard(int id){if(!wireWriterV4||schematicDisplayAbort||wireV4RunScript==null||wireV4RunArmed||id<1||id>${String(PROFILE.renderer.total)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("wire-v4-run-arm");string message=SchematicActionGuardMessage(id,schematicDisplaySession,wireV4RunScript,wireV4RunVariant,"run");AssertLive();wireV4RunArmed=true;SendMessage(id,message);}
public void AbortWireWriterV4(){if(!wireWriterV4||schematicDisplayAbort||originalMain==null)throw Error("wire-v4-abort-once");schematicDisplayAbort=true;originalMain.RequestOriginalJobTermination();}
public static void VerifySchematicWireWriterV4Smoke(){var owner=CreateSchematicWireWriterV4();if(!owner.wireWriterV4||owner.schematicWireEdit209||owner.schematicRelevanceDisplayWrite209||owner.schematicDisplayWrite209||owner.root!=IntPtr.Zero||owner.job!=IntPtr.Zero||owner.originalMain==null||WireWriterV4Index("save")!=6)throw Error("wire-v4-birth-smoke");foreach(string action in new[]{"schematic-wire-edit-native","schematic-wire-edit-accessor","schematic-relevance-display-native","schematic-relevance-display-modify-generate","pcb-via-sdk","footprint-copy-native-create"}){bool refused=false;try{owner.AdmitWireWriterV4Action(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("wire-v4-foreign-action");}foreach(string action in new[]{"schematic-display-worker-prepare","schematic-display-worker-bind","schematic-display-worker-parent","schematic-display-worker","schematic-display-initial-cache","schematic-display-initial-cache-complete","schematic-display-initial-sync","schematic-display-initial-sync-complete","schematic-display-periodic-sync","schematic-display-periodic-sync-complete","schematic-display-producer-bind","schematic-display-producer-observe","schematic-display-producer-guard","schematic-display-structure-transport-bind","schematic-display-structure-transport"})owner.AdmitWireWriterV4Action(action);owner.originalMain.Release();
bool runBindRefused=false;try{owner.BindWireWriterV4RunGuard("original_script",0);}catch(InvalidOperationException){runBindRefused=true;}if(!runBindRefused||owner.wireV4RunScript!=null)throw Error("wire-v4-run-bind-smoke");bool runArmRefused=false;try{owner.ArmWireWriterV4RunGuard(79);}catch(InvalidOperationException){runArmRefused=true;}if(!runArmRefused||owner.wireV4RunArmed)throw Error("wire-v4-run-arm-smoke");
string[] runHashes=EasyedaDiagnosticFixedTable.Hashes(${quote(runHashes)},2);for(int variant=0;variant<2;variant++){string message=SchematicActionGuardMessage(79,"original_ui","original_script",variant,"run");using(var sha=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()!=runHashes[variant])throw Error("wire-v4-run-codec-smoke");}
string target=Encoding.UTF8.GetString(Convert.FromBase64String(${quote(Buffer.from(smokeTarget).toString("base64"))})),operation=${quote(smokeOperation)};string[] phases={"start","navigate","capture","preflight","modify","observe","save"},hashes=EasyedaDiagnosticFixedTable.Hashes(${quote(smokeHashes)},7);
for(int i=0;i<phases.Length;i++){var fields=new System.Collections.Hashtable(StringComparer.Ordinal);fields.Add(i<=2?"uniqueContextId":"objectId",i<=2?"original_context":"original_holder");if(i>0)fields.Add("targetJson",target);if(i>1)fields.Add("operationJson",operation);string message=WireWriterV4ProtocolMessage(79,"original_ui",phases[i],fields);using(var sha=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()!=hashes[i])throw Error("wire-v4-codec-smoke");foreach(int id in new[]{0,${String(PROFILE.renderer.total + 1)}}){bool refused=false;try{WireWriterV4ProtocolMessage(id,"original_ui",phases[i],fields);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("wire-v4-id-smoke");}}
}
// END GENERATED SCHEMATIC WIRE WRITER V4 FIELDS
}`;
}
function normalize(source: string): string {
  const from = source.indexOf(begin), to = source.indexOf(end);
  if (from === -1 && to === -1) { return source; }
  if (from === -1 || to <= from || source.split(begin).length !== 2 || source.split(end).length !== 2 || source[from - 1] !== "\n" || source[to + end.length] !== "\n") { throw new Error("SCHEMATIC_WIRE_WRITER_V4_NATIVE_MARKERS"); }
  return source.slice(0, from - 1) + source.slice(to + end.length);
}
/** Restore only this exact generated family before earlier fragments run.
 * Duplicate/partial markers or changed owned blocks remain refused. */
export function normalizeCurrentSchematicWireWriterV4NativeFamily(input: string): string {
  if (!input.includes(begin) && !input.includes(end)) { return input; }
  let source = normalize(input);
  source = source.replaceAll("schematicDisplayWrite209||schematicRelevanceDisplayWrite209||schematicWireEdit209||wireWriterV4", "schematicDisplayWrite209||schematicRelevanceDisplayWrite209||schematicWireEdit209")
    .replace(` if(wireWriterV4)return ${String(PROFILE.renderer.total)};`, "")
    .replace("public void AbortSchematicDisplayWrite(){if(wireWriterV4){AbortWireWriterV4();return;}", "public void AbortSchematicDisplayWrite(){")
    .replace("$footprintMainPurpose=$SchematicWireWriterV4 -or ", "$footprintMainPurpose=")
    .replace("elseif ($SchematicWireWriterV4) {[EasyedaDiagnosticOwner]::CreateSchematicWireWriterV4()} ", "")
    .replace("      if ($SchematicWireWriterV4) {$owner.AdmitWireWriterV4Action($request.action)}\n", "")
    .replace(`          if ($SchematicWireWriterV4) {$requestLimit=${String(PROFILE.renderer.total)}}\n`, "")
    .replaceAll("-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209 -or $SchematicWireWriterV4)", "-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209)")
    .replace("[switch]$SchematicWireWriterV4,", "");
  const own = source.split("\n").filter(line => line.startsWith("if ($SchematicWireWriterV4 -and ("));
  if (own.length > 1) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_NATIVE_CONFLICT"); } if (own[0] !== undefined) { source = source.replace(`${own[0]}\n`, ""); }
  return source;
}
/** Install only a separately born v4 source checkpoint. Its native sender
 * retains the explicit original-tail-required refusal for Modify and Save. */
export function applyCurrentSchematicWireWriterV4NativeFragment(input: string): string {
  let source = normalizeCurrentSchematicWireWriterV4NativeFamily(input);
  if (!source.slice(0, source.indexOf("\n")).includes("[switch]$SchematicWireWriterV4,")) { source = once(source, "[switch]$SchematicWireEdit209,", "[switch]$SchematicWireWriterV4,[switch]$SchematicWireEdit209,"); }
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "SchematicWireWriterV4");
  const conflict = `if ($SchematicWireWriterV4 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'wire-v4-conflicting-purpose'}\n`;
  source = once(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`);
  const owner = currentSchematicWireWriterV4OwnerSource(source);
  const extra = `${begin}
internal enum EasyedaSchematicWireWriterV4Birth { Original }
internal sealed partial class EasyedaOriginalMainTransport {internal EasyedaOriginalMainTransport(EasyedaSchematicWireWriterV4Birth birth):this(){Need(birth==EasyedaSchematicWireWriterV4Birth.Original,"wire-v4-purpose");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}}
${owner}
${end}`;
  if (source.split("schematicDisplayWrite209||schematicRelevanceDisplayWrite209||schematicWireEdit209").length !== 3) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_NATIVE_FAMILY"); }
  source = source.replaceAll("schematicDisplayWrite209||schematicRelevanceDisplayWrite209||schematicWireEdit209", "schematicDisplayWrite209||schematicRelevanceDisplayWrite209||schematicWireEdit209||wireWriterV4");
  source = once(source, "int RequestLimit { get {", `int RequestLimit { get { if(wireWriterV4)return ${String(PROFILE.renderer.total)};`);
  source = once(source, "public void AbortSchematicDisplayWrite(){", "public void AbortSchematicDisplayWrite(){if(wireWriterV4){AbortWireWriterV4();return;}");
  source = once(source, "$footprintMainPurpose=$SchematicWireEdit209 -or ", "$footprintMainPurpose=$SchematicWireWriterV4 -or $SchematicWireEdit209 -or ");
  source = once(source, "elseif ($SchematicWireEdit209)", "elseif ($SchematicWireWriterV4) {[EasyedaDiagnosticOwner]::CreateSchematicWireWriterV4()} elseif ($SchematicWireEdit209)");
  source = once(source, "      if ($SchematicWireEdit209) {$owner.AdmitSchematicWireEditAction($request.action)}", "      if ($SchematicWireWriterV4) {$owner.AdmitWireWriterV4Action($request.action)}\n      if ($SchematicWireEdit209) {$owner.AdmitSchematicWireEditAction($request.action)}");
  source = once(source, "          if ($SchematicWireEdit209) {$requestLimit=", `          if ($SchematicWireWriterV4) {$requestLimit=${String(PROFILE.renderer.total)}}\n          if ($SchematicWireEdit209) {$requestLimit=`);
  source = source.replaceAll("-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209)", "-not ($SchematicDisplayWrite209 -or $SchematicRelevanceDisplayWrite209 -or $SchematicWireEdit209 -or $SchematicWireWriterV4)");
  const stage = `        'schematic-wire-writer-v4-native' {
          if (-not $SchematicWireWriterV4 -or -not $launched -or $request.sessionId -isnot [string] -or $request.phase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'wire-v4-native-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','sessionId','phase');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'wire-v4-native-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendWireWriterV4Native([int]$request.requestId,$request.sessionId,$request.phase,$fields);$result=@{written=$true}
        }
`;
  source = installOwnedNativeDispatch(source, stage, "        'schematic-wire-edit-native' {");
  for (const [name, role] of readerRows) {
    const dispatch = `        'schematic-wire-writer-v4-${role}' {
          if (-not $SchematicWireWriterV4 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'wire-v4-reader-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'wire-v4-reader-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendWireWriterV4${name}([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
    source = installOwnedNativeDispatch(source, dispatch, "        'schematic-wire-writer-v4-native' {");
  }
  const runBind = `        'schematic-wire-writer-v4-run-bind' {
          if (-not $SchematicWireWriterV4 -or -not $launched -or $request.scriptId -isnot [string] -or ($request.variant -isnot [int] -and $request.variant -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,scriptId,variant') {throw 'wire-v4-run-bind-fields'}
          $owner.BindWireWriterV4RunGuard($request.scriptId,[int]$request.variant);$result=@{bound=$true}
        }
`;
  const runArm = `        'schematic-wire-writer-v4-run-guard' {
          if (-not $SchematicWireWriterV4 -or -not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid') {throw 'wire-v4-run-guard-fields'}
          $owner.ArmWireWriterV4RunGuard([int]$request.requestId);$result=@{written=$true}
        }
`;
  source = installOwnedNativeDispatch(source, runBind, "        'schematic-wire-writer-v4-native' {");
  source = installOwnedNativeDispatch(source, runArm, "        'schematic-wire-writer-v4-native' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicWireWriterV4Smoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicWireEditSmoke()");
  return once(source, "\n'@\n", `\n${extra}\n'@\n`);
}
