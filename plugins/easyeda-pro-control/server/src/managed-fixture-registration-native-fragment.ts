/** Deterministic finite native extension. It grants registration only to a
 * newly constructed generated-fixture209 owner, never an existing birth. */
/* oxlint-disable no-useless-escape -- Nested C# JSON string literals retain explicit quote escaping; the emitted source is compiled and native-parity checked. */
import { GENERATED_FIXTURE_REGISTRATION_FUNCTION } from "./managed-fixture-registration-program.ts";

const begin = "// BEGIN GENERATED FIXTURE PATH REGISTRATION";
const end = "// END GENERATED FIXTURE PATH REGISTRATION";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("GENERATED_FIXTURE_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("GENERATED_FIXTURE_NATIVE_ANCHOR"); }
  return source.replace(before, after);
}
function native(): string {
  const functionLiteral = GENERATED_FIXTURE_REGISTRATION_FUNCTION.replaceAll('"', '""');
  return `${begin}
public sealed partial class EasyedaDiagnosticOwner {
bool generatedFixture209,generatedFixtureRegistrationConsumed;string generatedFixtureTuple;
static readonly string GeneratedFixtureRegistrationFunction=@"${functionLiteral}";
public static EasyedaDiagnosticOwner CreateGeneratedFixture209(){var owner=CreateLayers209();owner.generatedFixture209=true;return owner;}
public static EasyedaDiagnosticOwner CreateGeneratedFixtureSpatial209(){var owner=CreateSpatial209();owner.generatedFixture209=true;return owner;}
static string GeneratedFixtureTuple(string session,string context,string path,string project,string branch,string document,string source){return String.Join("\\n",new[]{session,context,path,project,branch,document,source});}
public static string GeneratedFixtureRegistrationProtocolMessage(int id,string session,string context,string phase,string path,string project,string branch,string document,string source){
if(phase!="register-generated-fixture"||path==null||!System.Text.RegularExpressions.Regex.IsMatch(path,@"\\\\Codex_(?:via_only|line_and_via|arc_line_and_via)_[a-f0-9]{16}\\.eprj2\\z"))throw Error("generated-registration-fields");
string message=OpeningProtocolMessageCore(false,id,session,context,"preflight",path,project,branch,document,source,false);
string original=JsonString(OpeningFunction),replacement=JsonString(GeneratedFixtureRegistrationFunction),argument="{\\\"value\\\":\\\"preflight\\\"}",selected="{\\\"value\\\":\\\"register-generated-fixture\\\"}";
if(message.Split(new[]{original},StringSplitOptions.None).Length!=2||message.Split(new[]{argument},StringSplitOptions.None).Length!=2)throw Error("generated-registration-template");
message=message.Replace(original,replacement).Replace(argument,selected);if(Encoding.UTF8.GetByteCount(message)>65536)throw Error("generated-registration-bound");return message;
}
public void SendGeneratedFixtureRegistration(int id,string session,string context,string phase,string path,string project,string branch,string document,string source){
if(!generatedFixture209||generatedFixtureRegistrationConsumed||layers209==spatial209||stringPrecreate||workerStartup||visual209)throw Error("generated-registration-purpose");
generatedFixtureRegistrationConsumed=true;string message=GeneratedFixtureRegistrationProtocolMessage(spatial209?1:id,session,context,phase,path,project,branch,document,source);
if(spatial209){SpatialSession(session);if(spatialStage>0)throw Error("spatial209-navigation-consumed");message=SpatialOriginalId(id,message);}
generatedFixtureTuple=GeneratedFixtureTuple(session,context,path,project,branch,document,source);SendMessage(id,message);
}
void RequireGeneratedFixtureOpening(string session,string context,string path,string project,string branch,string document,string source){
if(generatedFixture209&&(!generatedFixtureRegistrationConsumed||generatedFixtureTuple!=GeneratedFixtureTuple(session,context,path,project,branch,document,source)))throw Error("generated-registration-original-opening");
}
public static void VerifyGeneratedFixtureRegistrationSmoke(){
string path=@"C:\\SyntheticTemp\\CodexEasyedaFixture_11111111111111111111111111111111\\Codex_line_and_via_2222222222222222.eprj2",project;
using(SHA256 hash=SHA256.Create()){project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();}
string message=GeneratedFixtureRegistrationProtocolMessage(103,"parent","original","register-generated-fixture",path,project,new string('a',32),new string('b',32),new string('c',64));
if(message.IndexOf("register-generated-fixture",StringComparison.Ordinal)<0||message.IndexOf(JsonString(GeneratedFixtureRegistrationFunction),StringComparison.Ordinal)<0)throw Error("generated-registration-smoke");
foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateVisual209(),CreateWorkerStartup209()}){bool refused=false;try{owner.SendGeneratedFixtureRegistration(1,"s","c","register-generated-fixture",path,project,new string('a',32),new string('b',32),new string('c',64));}catch(InvalidOperationException failure){refused=failure.Message=="pcb-diagnostic-generated-registration-purpose";}if(!refused||owner.generatedFixtureRegistrationConsumed)throw Error("generated-registration-old-birth-smoke");}
var fresh=CreateGeneratedFixture209();if(!fresh.generatedFixture209||fresh.generatedFixtureRegistrationConsumed||fresh.generatedFixtureTuple!=null||fresh.root!=IntPtr.Zero||fresh.job!=IntPtr.Zero)throw Error("generated-registration-birth-smoke");
var spatial=CreateGeneratedFixtureSpatial209();if(!spatial.generatedFixture209||!spatial.spatial209||spatial.layers209||spatial.generatedFixtureRegistrationConsumed||spatial.root!=IntPtr.Zero||spatial.job!=IntPtr.Zero)throw Error("generated-spatial-registration-birth-smoke");
}
}
${end}`;
}
/** Root owns actual regeneration/pin changes. This function mutates only the
 * supplied source string; tests compile a synthetic copy without native calls. */
export function applyManagedFixtureRegistrationNativeFragment(input: string): string {
  const oldParameters = "param([switch]$CompileOnly,[switch]$GeneratedFixture209,";
  const parameters = "param([switch]$CompileOnly,[switch]$GeneratedFixture209,[switch]$GeneratedFixtureSpatial209,";
  let source = input.includes(oldParameters) && !input.includes(parameters) ? one(input, oldParameters, parameters) : input;
  source = one(source, "param([switch]$CompileOnly,", parameters);
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)]
    .map(match => match[1]).filter(name => name !== undefined && name !== "GeneratedFixture209" && name !== "CompileOnly" && name !== "SchematicDisplayWrite209");
  const conflict = `if ($GeneratedFixture209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-generated-fixture-purpose'}\n`;
  const previousConflict = source.split("\n").filter(line => line.startsWith("if ($GeneratedFixture209 -and (") && line.endsWith("pcb-diagnostic-conflicting-generated-fixture-purpose'}"));
  if (previousConflict.length > 1) { throw new Error("GENERATED_FIXTURE_NATIVE_CONFLICT_DUPLICATE"); }
  source = previousConflict[0] === undefined ? one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`) : source.replace(previousConflict[0], conflict.trimEnd());
  const spatialSwitches = [...switches.filter(name => name !== "GeneratedFixtureSpatial209"), "GeneratedFixture209"];
  const spatialConflict = `if ($GeneratedFixtureSpatial209 -and (${spatialSwitches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-generated-spatial-purpose'}\n`;
  if (!source.includes("pcb-diagnostic-conflicting-generated-spatial-purpose")) { source = one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${spatialConflict}`); }
  const oldMode = "if ($GeneratedFixture209) {$Layers209=$true}\n$footprintMainPurpose=";
  const mode = "if ($GeneratedFixture209) {$Layers209=$true}\nif ($GeneratedFixtureSpatial209) {$Spatial209=$true}\n$footprintMainPurpose=";
  if (source.includes(oldMode)) { source = source.replace(oldMode, mode); }
  source = one(source, "$footprintMainPurpose=", mode);
  const spatialFactory = "elseif ($Spatial209) {[EasyedaDiagnosticOwner]::CreateSpatial209()}";
  const oldFactory = `elseif ($GeneratedFixture209) {[EasyedaDiagnosticOwner]::CreateGeneratedFixture209()} ${spatialFactory}`;
  const factory = `elseif ($GeneratedFixture209) {[EasyedaDiagnosticOwner]::CreateGeneratedFixture209()} elseif ($GeneratedFixtureSpatial209) {[EasyedaDiagnosticOwner]::CreateGeneratedFixtureSpatial209()} ${spatialFactory}`;
  if (source.includes(oldFactory)) { source = source.replace(oldFactory, factory); }
  source = one(source, spatialFactory, factory);
  source = one(source, "  public void SendOpening(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {",
    "  public void SendOpening(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {\n    RequireGeneratedFixtureOpening(sessionId,uniqueContextId,path,project,branch,document,source);");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) {
    if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("GENERATED_FIXTURE_NATIVE_MARKERS"); }
    source = source.slice(0, start) + native() + source.slice(stop + end.length);
  } else { source = one(source, "\n'@\n", `\n${native()}\n'@\n`); }
  source = one(source, "    [EasyedaDiagnosticOwner]::VerifyLayers209Smoke()", "    [EasyedaDiagnosticOwner]::VerifyGeneratedFixtureRegistrationSmoke()\n    [EasyedaDiagnosticOwner]::VerifyLayers209Smoke()");
  const oldFieldGuard = "if (-not $GeneratedFixture209 -or $request.generatedFixtureRegistrationPhase -isnot [string]";
  const fieldGuard = "if ((-not $GeneratedFixture209 -and -not $GeneratedFixtureSpatial209) -or $request.generatedFixtureRegistrationPhase -isnot [string]";
  if (source.includes(oldFieldGuard)) { source = source.replace(oldFieldGuard, fieldGuard); }
  source = one(source, "              if ($null -ne $request.pcbVisual209Phase)", `              if ($null -ne $request.generatedFixtureRegistrationPhase) {${fieldGuard} -or $request.generatedFixtureRegistrationPhase -cne 'register-generated-fixture') {throw 'pcb-diagnostic-generated-registration-purpose'};$fields+=@('generatedFixtureRegistrationPhase')} elseif ($null -ne $request.pcbVisual209Phase)`);
  source = one(source, "($null -ne $request.openingPhase -or $null -ne $request.pcbOpeningPhase)", "($null -ne $request.openingPhase -or $null -ne $request.pcbOpeningPhase -or $null -ne $request.generatedFixtureRegistrationPhase)");
  source = one(source, "            } elseif ($null -ne $request.pcbOpeningPhase) {\n              $owner.SendPcbOpening", "            } elseif ($null -ne $request.generatedFixtureRegistrationPhase) {\n              $owner.SendGeneratedFixtureRegistration([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.generatedFixtureRegistrationPhase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)\n            } elseif ($null -ne $request.pcbOpeningPhase) {\n              $owner.SendPcbOpening");
  return source;
}
