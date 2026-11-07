/** A new readonly native birth. No Via/writer flag or preparation is reused. */
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_CACHE_DISPATCH, currentSchematicRelevanceSavedCacheNative } from "./current-schematic-relevance-saved-cache-native.ts";
import { createHash } from "node:crypto";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "./current-schematic-relevance-saved-readback-profile.ts";
import { currentSchematicRelevanceSavedEarlyWire } from "./current-schematic-relevance-saved-wire.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN SCHEMATIC RELEVANCE SAVED READBACK BIRTH", end = "// END SCHEMATIC RELEVANCE SAVED READBACK BIRTH";
const quote = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_SAVED_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`SCHEMATIC_SAVED_NATIVE_ANCHOR:${before.slice(0, 80)}`); } return source.replace(before, after);
}
/** Install before other fragments collect their switch-conflict rosters. */
export function prepareCurrentSchematicRelevanceSavedReadbackNativeSwitch(input: string): string {
  const count = input.slice(0, input.indexOf("\n")).split("[switch]$SchematicRelevanceSavedReadback209").length - 1;
  if (count > 1) { throw new Error("SCHEMATIC_SAVED_SWITCH_DUPLICATE"); } if (count === 1) { return input; }
  return one(input, "param([switch]$CompileOnly,", "param([switch]$CompileOnly,[switch]$SchematicRelevanceSavedReadback209,");
}
function native(): string {
  const early = (["before", "arm", "after"] as const).map((stage, index) => {
    const { schematicSavedEarlyActors: _marker, ...wire } = currentSchematicRelevanceSavedEarlyWire(index + 1, stage);
    const text = `${JSON.stringify(wire)}\0`; const sha = createHash("sha256").update(text).digest("hex");
    return { stage, text, sha };
  });
  return `${begin}
internal enum EasyedaSchematicSavedReadbackBirth { Original }
internal sealed partial class EasyedaOriginalMainTransport {
internal EasyedaOriginalMainTransport(EasyedaSchematicSavedReadbackBirth birth):this(){Need(birth==EasyedaSchematicSavedReadbackBirth.Original,"schematic-saved-purpose");normalLimit=${String(PROFILE.main.normal)};cleanupLimit=${String(PROFILE.main.cleanup)};}
}
public sealed partial class EasyedaDiagnosticOwner {
bool schematicSavedReadback209,schematicSavedMainComplete,schematicSavedMainRemoved;int schematicSavedEarlyStep,schematicSavedDiscovery;string schematicSavedSession;
EasyedaDiagnosticOwner(EasyedaSchematicSavedReadbackBirth birth):this(){if(birth!=EasyedaSchematicSavedReadbackBirth.Original)throw Error("schematic-saved-birth");schematicSavedReadback209=true;workerStartupFootprintMain209=true;originalMain=new EasyedaOriginalMainTransport(birth);}
public static EasyedaDiagnosticOwner CreateSchematicRelevanceSavedReadback209(){return new EasyedaDiagnosticOwner(EasyedaSchematicSavedReadbackBirth.Original);}
public void AdmitSchematicSavedReadbackAction(string action){if(!schematicSavedReadback209)throw Error("schematic-saved-purpose");switch(action){case "identity":case "launch":case "send":case "poll":case "window":case "normal-close":case "termination":case "release":case "release-unlaunched":case "no-process-proof":case "release-no-process":case "main-attach":case "main-reprove":case "main-send":case "main-poll":case "schematic-saved-early-actors":case "schematic-saved-parent":case "schematic-saved-preflight":case "schematic-saved-cache":case "schematic-saved-metadata":return;default:throw Error("schematic-saved-action");}}
void SendSchematicSavedMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(!schematicSavedReadback209||id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("schematic-saved-main-id");if(phase.StartsWith("sql-fence-",StringComparison.Ordinal)){if(phase.StartsWith("sql-fence-registration-",StringComparison.Ordinal))throw Error("schematic-saved-registration-unissued");string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(text,false);AssertLive();return;}if(schematicSavedMainComplete)throw Error("schematic-saved-main-consumed");string message=EasyedaFootprintCopyMainBackendProtocol.Encode(id,phase,method,fields);mainRequest=id;if(phase=="remove")schematicSavedMainRemoved=true;if(phase=="resume"&&schematicSavedMainRemoved)schematicSavedMainComplete=true;originalMain.SendFixed(message,phase=="release"||phase=="remove"||phase=="resume");AssertLive();}
void SchematicSavedDiscovery(string method,string session){if(!schematicSavedReadback209||!schematicSavedMainComplete||schematicSavedEarlyStep!=3||schematicSavedDiscovery>=${String(PROFILE.renderer.discovery)}+(schematicSavedCacheParent?9:0))throw Error("schematic-saved-discovery-stage");bool known=false;foreach(string name in new[]{"Browser.getVersion","Target.getTargets","Target.attachToTarget","Page.enable","Page.getFrameTree","Runtime.enable","Debugger.enable","Debugger.getScriptSource","DOM.getFrameOwner","DOM.describeNode"})if(name==method)known=true;if(!known)throw Error("schematic-saved-discovery-only");if(session!=null){if(schematicSavedSession==null)schematicSavedSession=session;else if(schematicSavedSession!=session)throw Error("schematic-saved-original-session");}schematicSavedDiscovery++;}
public static string SchematicSavedEarlyMessage(int id,string stage){if(id!=Array.IndexOf(new[]{"before","arm","after"},stage)+1)throw Error("schematic-saved-early-order");switch(stage){${early.map(row => `case ${quote(row.stage)}:return ${quote(row.text.slice(0, -1))}+"\\0";`).join("")}default:throw Error("schematic-saved-early-stage");}}
public void SendSchematicSavedEarly(int id,string stage){if(!schematicSavedReadback209||schematicSavedMainComplete||id!=schematicSavedEarlyStep+1||id>3)throw Error("schematic-saved-early-once");string text=SchematicSavedEarlyMessage(id,stage);schematicSavedEarlyStep++;SendMessage(id,text);}
void NormalCloseSchematicSaved(string hwnd){if(!schematicSavedReadback209||closeAttempted)throw Error("schematic-saved-close-once");closeAttempted=true;long number;if(!long.TryParse(hwnd,NumberStyles.None,CultureInfo.InvariantCulture,out number)||number<=0||Window()!=hwnd)throw Error("window-mismatch");AssertCleanupLive();Native(PostMessage(new IntPtr(number),16,IntPtr.Zero,IntPtr.Zero));}
public static void VerifySchematicSavedReadbackSmoke(){VerifySchematicSavedCacheSmoke();${early.map((row, i) => `using(var sha=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(SchematicSavedEarlyMessage(${String(i + 1)},${quote(row.stage)})))).Replace("-","").ToLowerInvariant()!=${quote(row.sha)})throw Error("schematic-saved-early-wire");`).join("")}var fresh=CreateSchematicRelevanceSavedReadback209();if(!fresh.schematicSavedReadback209||fresh.schematicDisplayWrite209||fresh.schematicRelevanceDisplayWrite209||fresh.pcbViaWrite209||fresh.layers209||fresh.spatial209||fresh.generatedFixture209||fresh.originalMain==null||fresh.root!=IntPtr.Zero||fresh.job!=IntPtr.Zero||fresh.RequestLimit!=${String(PROFILE.renderer.total)})throw Error("schematic-saved-distinct-birth");foreach(string action in new[]{"pcb-via-sdk","schematic-display-native","schematic-relevance-display-native","saved-readback-cache","saved-readback-worker","main-request-send","main-completion-send"}){bool refused=false;try{fresh.AdmitSchematicSavedReadbackAction(action);}catch(InvalidOperationException){refused=true;}if(!refused)throw Error("schematic-saved-foreign-action");}bool denied=false;try{fresh.SchematicSavedDiscovery("Target.getTargets",null);}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("schematic-saved-discovery-before-main");fresh.originalMain.Release();}
}
${currentSchematicRelevanceSavedCacheNative()}
${end}`;
}
const dispatch = `        'schematic-saved-early-actors' {
          if (-not $SchematicRelevanceSavedReadback209 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,earlyStage,helperInstance,id,jobId,requestId,rootCreated,rootPid' -or $request.earlyStage -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'schematic-saved-early-fields'}
          $owner.SendSchematicSavedEarly([int]$request.requestId,$request.earlyStage);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceSavedReadbackNative(input: string): string {
  let source = prepareCurrentSchematicRelevanceSavedReadbackNativeSwitch(input);
  const others = [...source.slice(0, source.indexOf("\n")).matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "SchematicRelevanceSavedReadback209");
  const conflict = `if ($SchematicRelevanceSavedReadback209 -and (${others.map(name => `$${name}`).join(" -or ")})) {throw 'schematic-saved-conflicting-purpose'}\n`;
  const prior = source.split("\n").filter(line => line.startsWith("if ($SchematicRelevanceSavedReadback209 -and ("));
  if (prior.length > 1) { throw new Error("SCHEMATIC_SAVED_CONFLICT_DUPLICATE"); }
  source = prior[0] === undefined ? one(source, "$ErrorActionPreference = 'Stop'\n", `$ErrorActionPreference = 'Stop'\n${conflict}`) : source.replace(`${prior[0]}\n`, conflict);
  source = one(source, "$footprintMainPurpose=", "$footprintMainPurpose=$SchematicRelevanceSavedReadback209 -or ");
  source = one(source, "elseif ($SchematicWireEdit209)", "elseif ($SchematicRelevanceSavedReadback209) {[EasyedaDiagnosticOwner]::CreateSchematicRelevanceSavedReadback209()} elseif ($SchematicWireEdit209)");
  source = one(source, "int RequestLimit { get {", `int RequestLimit { get { if(schematicSavedReadback209)return schematicSavedCacheParent?${String(PROFILE.renderer.activeCache)}:${String(PROFILE.renderer.total)};`);
  source = one(source, 'if(pcbViaWrite209)throw Error("via-retain-main-until-exit");', 'if(pcbViaWrite209)throw Error("via-retain-main-until-exit");\n    if(schematicSavedReadback209)throw Error("schematic-saved-retain-main-until-exit");');
  source = one(source, 'if(pcbViaWrite209){SendViaMain(id,phase,method,fields);return;}', 'if(pcbViaWrite209){SendViaMain(id,phase,method,fields);return;}\n    if(schematicSavedReadback209){SendSchematicSavedMain(id,phase,method,fields);return;}');
  source = one(source, 'if(pcbViaWrite209){ViaDiscovery(method,OptionalText(sessionId));message=ViaOriginalId(id,message);}', 'if(pcbViaWrite209){ViaDiscovery(method,OptionalText(sessionId));message=ViaOriginalId(id,message);}\n    if(schematicSavedReadback209){SchematicSavedDiscovery(method,OptionalText(sessionId));}');
  source = one(source, "  public void NormalClose(string hwnd) {", "  public void NormalClose(string hwnd) {\n    if(schematicSavedReadback209){NormalCloseSchematicSaved(hwnd);return;}");
  source = one(source, "      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}", "      if ($SchematicRelevanceSavedReadback209) {$owner.AdmitSchematicSavedReadbackAction($request.action)}\n      if ($SchematicDisplayWrite209) {$owner.AdmitSchematicDisplayAction($request.action)}");
  source = one(source, "          if ($SchematicDisplayWrite209) {$requestLimit=", `          if ($SchematicRelevanceSavedReadback209) {$requestLimit=$owner.SchematicSavedCurrentRequestLimit()}\n          if ($SchematicDisplayWrite209) {$requestLimit=`);
  source = installOwnedNativeDispatch(source, CURRENT_SCHEMATIC_RELEVANCE_SAVED_CACHE_DISPATCH, "        'schematic-display-native' {");
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-display-native' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicSavedReadbackSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicRelevanceDisplaySmoke()");
  const a = source.indexOf(begin), b = source.indexOf(end), value = native();
  if (a !== -1 || b !== -1) { if (a === -1 || b < a || source.includes(begin, a + begin.length) || source.includes(end, b + end.length)) { throw new Error("SCHEMATIC_SAVED_NATIVE_MARKERS"); } return source.slice(0, a) + value + source.slice(b + end.length); }
  return one(source, "\n'@\n", `\n${value}\n'@\n`);
}
/** Restore only this unpublished fragment before older family normalizers
 * regenerate their exact method/limit anchors. Unknown partial edits refuse. */
export function normalizeCurrentSchematicRelevanceSavedReadbackNative(input: string): string {
  let source = input; const a = source.indexOf(begin), b = source.indexOf(end);
  if (a === -1 && b === -1) { return source; }
  if (a === -1 || b < a || source.includes(begin, a + begin.length) || source.includes(end, b + end.length) || source.slice(a, b + end.length) !== native()) { throw new Error("SCHEMATIC_SAVED_NORMALIZE_BLOCK"); }
  source = source.slice(0, a) + source.slice(b + end.length);
  // The fragment is always appended with one extra separator after an existing newline.
  source = source.replace("\n\n'@\n", "\n'@\n");
  if (source.split(CURRENT_SCHEMATIC_RELEVANCE_SAVED_CACHE_DISPATCH).length !== 2) { throw new Error("SCHEMATIC_SAVED_NORMALIZE_CACHE_DISPATCH"); } source = source.replace(CURRENT_SCHEMATIC_RELEVANCE_SAVED_CACHE_DISPATCH, "");
  if (source.split(dispatch).length !== 2) { throw new Error("SCHEMATIC_SAVED_NORMALIZE_DISPATCH"); } source = source.replace(dispatch, "");
  const removals = [
    '    if(schematicSavedReadback209)throw Error("schematic-saved-retain-main-until-exit");\n',
    '    if(schematicSavedReadback209){SendSchematicSavedMain(id,phase,method,fields);return;}\n',
    '    if(schematicSavedReadback209){SchematicSavedDiscovery(method,OptionalText(sessionId));}\n',
    '    if(schematicSavedReadback209){NormalCloseSchematicSaved(hwnd);return;}\n',
    '      if ($SchematicRelevanceSavedReadback209) {$owner.AdmitSchematicSavedReadbackAction($request.action)}\n',
    `          if ($SchematicRelevanceSavedReadback209) {$requestLimit=$owner.SchematicSavedCurrentRequestLimit()}\n`,
    '    [EasyedaDiagnosticOwner]::VerifySchematicSavedReadbackSmoke()\n',
  ];
  for (const line of removals) { if (source.split(line).length !== 2) { throw new Error(`SCHEMATIC_SAVED_NORMALIZE_LINE:${line.slice(0, 70)}`); } source = source.replace(line, ""); }
  const limit = `if(schematicSavedReadback209)return schematicSavedCacheParent?${String(PROFILE.renderer.activeCache)}:${String(PROFILE.renderer.total)}; `;
  if (source.split(limit).length !== 2) { throw new Error("SCHEMATIC_SAVED_NORMALIZE_LIMIT"); } source = source.replace(limit, "");
  const purpose = source.split("\n").filter(line => line.startsWith("$footprintMainPurpose="));
  if (purpose.length !== 1 || purpose[0] === undefined || purpose[0].split("$SchematicRelevanceSavedReadback209 -or ").length !== 2) { throw new Error("SCHEMATIC_SAVED_NORMALIZE_MAIN"); }
  source = source.replace(purpose[0], purpose[0].replace("$SchematicRelevanceSavedReadback209 -or ", ""));
  const owner = 'elseif ($SchematicRelevanceSavedReadback209) {[EasyedaDiagnosticOwner]::CreateSchematicRelevanceSavedReadback209()} ';
  if (source.split(owner).length !== 2) { throw new Error("SCHEMATIC_SAVED_NORMALIZE_OWNER"); } source = source.replace(owner, "");
  const conflicts = source.split("\n").filter(line => line.startsWith("if ($SchematicRelevanceSavedReadback209 -and ("));
  if (conflicts.length !== 1 || conflicts[0] === undefined) { throw new Error("SCHEMATIC_SAVED_NORMALIZE_CONFLICT"); } return source.replace(`${conflicts[0]}\n`, "");
}
