/** New schematic birth after shared fixed SQL data and prior fragments. This
 * fragment never upgrades an ordinary runtime or enables a PCB purpose. */
import { CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS as METHODS, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-display-write-native-profile.ts";

const begin = "// BEGIN GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", end = "// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`SCHEMATIC_DISPLAY_NATIVE_ANCHOR:${before.slice(0, 64)}`); } return source.replace(before, after);
}
function native(): string { return `${begin}
internal enum EasyedaSchematicDisplayBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(EasyedaSchematicDisplayBirth birth):this(){Need(birth==EasyedaSchematicDisplayBirth.Original,"schematic-display-purpose");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}
}
public sealed partial class EasyedaDiagnosticOwner {
bool schematicDisplayWrite209,schematicDisplayAbort,schematicDisplayRegistrationRemoved,schematicDisplayConstructionComplete;int schematicDisplayControls;string schematicDisplaySession;
EasyedaDiagnosticOwner(EasyedaSchematicDisplayBirth birth):this(){if(birth!=EasyedaSchematicDisplayBirth.Original)throw Error("schematic-display-birth");schematicDisplayWrite209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(EasyedaSchematicDisplayBirth.Original);}
public static EasyedaDiagnosticOwner CreateSchematicDisplayWrite209(){return new EasyedaDiagnosticOwner(EasyedaSchematicDisplayBirth.Original);}
public void AdmitSchematicDisplayAction(string action){if(!schematicDisplayWrite209||++schematicDisplayControls>30000)throw Error("schematic-display-purpose");if(schematicDisplayAbort&&action!="identity"&&action!="termination"&&action!="release")throw Error("schematic-display-cleanup-only");switch(action){case "identity":case "launch":case "send":case "poll":case "window":case "termination":case "normal-close":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "schematic-display-abort":break;default:throw Error("schematic-display-action");}}
void SchematicDisplayDiscovery(string method,string session){bool allowed=false;foreach(string candidate in new[]{${METHODS.map(method => `"${method}"`).join(",")}})if(method==candidate)allowed=true;if(!allowed)throw Error("schematic-display-discovery-only");if(session!=null){if(!System.Text.RegularExpressions.Regex.IsMatch(session,@"\\A[A-Za-z0-9_.:-]{1,128}\\z"))throw Error("schematic-display-session");if(schematicDisplaySession==null)schematicDisplaySession=session;else if(schematicDisplaySession!=session)throw Error("schematic-display-session");}}
void SendSchematicDisplayMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("schematic-display-main-id");if(phase.StartsWith("sql-fence-",StringComparison.Ordinal)){string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(text,false);AssertLive();return;}if(schematicDisplayConstructionComplete)throw Error("schematic-display-main-construction-consumed");string encoded=EasyedaFootprintCopyMainBackendProtocol.Encode(id,phase,method,fields);mainRequest=id;if(phase=="remove")schematicDisplayRegistrationRemoved=true;if(phase=="resume"&&schematicDisplayRegistrationRemoved)schematicDisplayConstructionComplete=true;originalMain.SendFixed(encoded,phase=="release"||phase=="remove"||phase=="resume");AssertLive();}
public void AbortSchematicDisplayWrite(){if(!schematicDisplayWrite209||schematicDisplayAbort||originalMain==null)throw Error("schematic-display-abort-once");schematicDisplayAbort=true;originalMain.RequestOriginalJobTermination();}
public static void VerifySchematicDisplaySmoke(){var fresh=CreateSchematicDisplayWrite209();if(!fresh.schematicDisplayWrite209||fresh.pcbViaWrite209||fresh.layers209||fresh.spatial209||fresh.generatedFixture209||fresh.originalMain==null||fresh.root!=IntPtr.Zero||fresh.job!=IntPtr.Zero)throw Error("schematic-display-separate-birth-smoke");foreach(var old in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){bool refused=false;try{old.AdmitSchematicDisplayAction("identity");}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-display-old-purpose-smoke");if(old.originalMain!=null)old.originalMain.Release();}foreach(string action in new[]{"pcb-via-sdk","pcb-via-clock","pcb-via-worker","structure-worker-send","footprint-copy-native-create","main-request-send","main-completion-send"}){bool refused=false;try{fresh.AdmitSchematicDisplayAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-display-foreign-refusal-smoke");}fresh.originalMain.Release();}
}
${end}`; }
const dispatch = String.raw`        'schematic-display-abort' {
          if (-not $SchematicDisplayWrite209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-schematic-display-abort-fields'}
          $owner.AbortSchematicDisplayWrite();$result=@{terminationDispatched=$true}
        }
`;
export function applyCurrentSchematicDisplayWriteNativeFragment(input: string): string {
  if (!input.includes("public static class EasyedaSelectedFileMainSqlFenceProtocol")) { throw new Error("SCHEMATIC_DISPLAY_SHARED_READONLY_SQL_DATA_REQUIRED"); }
  let source = one(input, "[switch]$PcbViaWrite209,[switch]$StringPrecreate,", "[switch]$SchematicDisplayWrite209,[switch]$PcbViaWrite209,[switch]$StringPrecreate,");
  const switches = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "SchematicDisplayWrite209");
  const conflict = `if ($SchematicDisplayWrite209 -and (${switches.map(name => `$${name}`).join(" -or ")})) {throw 'pcb-diagnostic-conflicting-schematic-display-purpose'}\n`;
  source = one(source, "$footprintMainPurpose=$ProjectStructure209 -or $PcbViaWrite209 -or ", "$footprintMainPurpose=$ProjectStructure209 -or $PcbViaWrite209 -or $SchematicDisplayWrite209 -or ");
  source = one(source, "$ErrorActionPreference = 'Stop'\n", `${conflict}$ErrorActionPreference = 'Stop'\n`);
  source = one(source, "elseif ($PcbViaWrite209)", "elseif ($SchematicDisplayWrite209) {[EasyedaDiagnosticOwner]::CreateSchematicDisplayWrite209()} elseif ($PcbViaWrite209)");
  source = one(source, "int RequestLimit { get {", `int RequestLimit { get { if(schematicDisplayWrite209)return ${String(PROFILE.renderer.total)};`);
  source = one(source, "if(pcbViaWrite209)throw Error(\"via-retain-main-until-exit\");", "if(pcbViaWrite209)throw Error(\"via-retain-main-until-exit\");\n    if(schematicDisplayWrite209)throw Error(\"schematic-display-retain-main-until-exit\");");
  source = one(source, "if(pcbViaWrite209){SendViaMain(id,phase,method,fields);return;}", "if(pcbViaWrite209){SendViaMain(id,phase,method,fields);return;}\n    if(schematicDisplayWrite209){SendSchematicDisplayMain(id,phase,method,fields);return;}");
  source = one(source, "if(pcbViaWrite209){ViaDiscovery(method,OptionalText(sessionId));message=ViaOriginalId(id,message);}", "if(pcbViaWrite209){ViaDiscovery(method,OptionalText(sessionId));message=ViaOriginalId(id,message);}\n    if(schematicDisplayWrite209){SchematicDisplayDiscovery(method,OptionalText(sessionId));}");
  source = one(source, "          if (-not $launched -or ($request.requestId -isnot [int]", `          if ($SchematicDisplayWrite209) {$requestLimit=${String(PROFILE.renderer.total)}}\n          if (-not $launched -or ($request.requestId -isnot [int]`);
  source = one(source, "      if ($PcbViaWrite209) {$owner.AdmitPcbViaAction($request.action)}", "      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}\n      if ($PcbViaWrite209) {$owner.AdmitPcbViaAction($request.action)}");
  const dispatchAnchor = source.includes("        'pcb-via-main-observe' {") ? "        'pcb-via-main-observe' {" : "        'pcb-via-clock-bind' {";
  if (dispatchAnchor.includes("main-observe") && source.includes(`${dispatch}        'pcb-via-clock-bind' {`)) { source = source.replace(dispatch, ""); }
  source = one(source, dispatchAnchor, `${dispatch}${dispatchAnchor}`);
  source = one(source, "    [EasyedaDiagnosticOwner]::VerifyPcbViaClockSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()\n    [EasyedaDiagnosticOwner]::VerifyPcbViaClockSmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_DISPLAY_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "\n'@\n", `\n${native()}\n'@\n`); } return source;
}
