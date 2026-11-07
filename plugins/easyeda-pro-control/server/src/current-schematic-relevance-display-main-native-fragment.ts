/** Own seven-record native admission, sharing only fixed stateless encoders.
 * No Via sender, state, callback grant or writer purpose is called here. */
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-relevance-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SIX } from "./current-schematic-display-write-native-profile.ts";
import { CURRENT_PCB_VIA_MAIN_REQUESTS as OBSERVE } from "./current-pcb-via-main-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_REQUESTS as BEGIN, CURRENT_PCB_VIA_MAIN_BEGIN_STEPS as BEGIN_STEPS } from "./current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_REQUESTS as HISTORY, CURRENT_PCB_VIA_MAIN_HISTORY_STEPS as HISTORY_STEPS } from "./current-pcb-via-main-history-protocol.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const end = "// END GENERATED SCHEMATIC RELEVANCE ORIGINAL MAIN5", start = "// BEGIN GENERATED SCHEMATIC RELEVANCE ORIGINAL MAIN5";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("RELEVANCE_MAIN_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`RELEVANCE_MAIN_NATIVE_ANCHOR:${before.slice(0, 60)}`); } return source.replace(before, after);
}
export function currentSchematicRelevanceDisplayMainNativeSource(): string { return String.raw`${start}
public sealed partial class EasyedaDiagnosticOwner {
int relevanceMainNormal,relevanceMainCleanup,relevanceMainStep,relevanceBeginNormal,relevanceBeginCleanup,relevanceBeginStep,relevanceHistoryNormal,relevanceHistoryCleanup,relevanceHistoryStep;
bool relevanceMainConstruction,relevanceHistoryCallback;
readonly System.Collections.Generic.HashSet<string> relevanceMainSites=new System.Collections.Generic.HashSet<string>(),relevanceBeginArms=new System.Collections.Generic.HashSet<string>(),relevanceHistoryArms=new System.Collections.Generic.HashSet<string>();
readonly long[] relevanceHistoryBefore=new long[5],relevanceHistoryAfter=new long[5];
void RelevanceMainOwner(int id){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicDisplayConstructionComplete||originalMain==null)throw Error("relevance-main-owner");MainPurpose();AssertLive();if(id!=mainRequest+1||id>${String(PROFILE.main.total)})throw Error("relevance-main-id");}
void RelevanceMainBody(){if(!relevanceSaveGenerated||!relevanceSaveBodyEnrolled||!schematicDisplayStages[6]||!relevanceMainConstruction)throw Error("relevance-main-original-save-body");}
public void AssertRelevanceSaveMainPrepared(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!schematicDisplayConstructionComplete||originalMain==null||!relevanceMainConstruction||relevanceMainSites.Count!=2||!relevanceMainSites.Contains("request-site-controller")||!relevanceMainSites.Contains("request-site-editHead")||relevanceBeginArms.Count!=4||relevanceHistoryArms.Count!=9||relevanceMainStep!=0||relevanceBeginStep!=0||relevanceHistoryStep!=0||relevanceHistoryCallback||relevanceSaveBodyEnrolled)throw Error("relevance-main-prepared-original");MainPurpose();AssertLive();}
public void SendRelevanceMainObservation(int id,string phase,string method,System.Collections.IDictionary fields){RelevanceMainOwner(id);if(phase==null||!phase.StartsWith("via-main-",StringComparison.Ordinal)||method=="Debugger.resume")throw Error("relevance-main-observe-only");string selected=phase.Substring(9);bool cleanup=selected=="request-remove"||selected=="request-release";if(cleanup?relevanceMainCleanup>=${String(OBSERVE.cleanup)}:relevanceMainNormal>=${String(OBSERVE.normal)})throw Error("relevance-main-observation-budget");if(selected=="request-driver-arm")throw Error("relevance-main-persistent-driver-only");
string encoded=selected=="construction-require"?EasyedaFootprintCopyMainBackendProtocol.Encode(id,"require",method,fields):EasyedaFootprintCopyMainRequestProtocol.Encode(id,selected,method,fields);
if(selected=="construction-require"){if(relevanceMainConstruction||relevanceSaveGenerated)throw Error("relevance-main-construction-once");relevanceMainConstruction=true;}else if(selected=="request-site-controller"||selected=="request-site-editHead"){if(!relevanceMainConstruction||relevanceSaveGenerated||!relevanceMainSites.Add(selected))throw Error("relevance-main-pre-save-source");}else{RelevanceMainBody();if(selected=="request-site-context"&&!relevanceMainSites.Add(selected))throw Error("relevance-main-context-once");}
if(cleanup)relevanceMainCleanup++;else relevanceMainNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();}
public void SendRelevanceMainStep(int id,string phase){RelevanceMainOwner(id);RelevanceMainBody();string[] sequence={"via-main-driver-step","via-main-context-step","via-main-controller-step"};if(relevanceMainStep>=sequence.Length||phase!=sequence[relevanceMainStep]||!relevanceMainSites.Contains("request-site-context"))throw Error("relevance-main-step-order");string text="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\"Debugger.resume\",\"params\":{}}\0";relevanceMainStep++;mainRequest=id;originalMain.SendFixed(text,false);AssertLive();}
public void SendRelevanceMainBegin(int id,string phase,string method,System.Collections.IDictionary fields){RelevanceMainOwner(id);string encoded=EasyedaPcbViaMainBeginProtocol.Encode(id,phase,method,fields);bool arm=phase.StartsWith("via-main-begin-arm-",StringComparison.Ordinal),cleanup=phase.StartsWith("via-main-begin-remove-",StringComparison.Ordinal);if(cleanup?relevanceBeginCleanup>=${String(BEGIN.cleanup)}:relevanceBeginNormal>=${String(BEGIN.normal)})throw Error("relevance-main-begin-budget");if(arm){if(!relevanceMainConstruction||relevanceSaveGenerated||!relevanceBeginArms.Add(phase))throw Error("relevance-main-begin-arm-once");}else{RelevanceMainBody();if(relevanceBeginArms.Count!=4)throw Error("relevance-main-begin-source-required");}if(method=="Debugger.resume"){string[] sequence={${BEGIN_STEPS.map(role => `"via-main-begin-step-${role}"`).join(",")}};if(relevanceMainStep!=3||relevanceBeginStep>=sequence.Length||phase!=sequence[relevanceBeginStep])throw Error("relevance-main-begin-step-order");relevanceBeginStep++;}if(cleanup)relevanceBeginCleanup++;else relevanceBeginNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();}
public long[] SendRelevanceMainHistory(int id,string phase,string method,System.Collections.IDictionary fields){RelevanceMainOwner(id);string encoded=EasyedaPcbViaMainHistoryProtocol.Encode(id,phase,method,fields);bool arm=phase.StartsWith("via-main-history-arm-",StringComparison.Ordinal),cleanup=phase.StartsWith("via-main-history-remove-",StringComparison.Ordinal);if(cleanup?relevanceHistoryCleanup>=${String(HISTORY.cleanup)}:relevanceHistoryNormal>=${String(HISTORY.normal)})throw Error("relevance-main-history-budget");if(arm){if(!relevanceMainConstruction||relevanceSaveGenerated||!relevanceHistoryArms.Add(phase))throw Error("relevance-main-history-arm-once");}else{RelevanceMainBody();if(relevanceHistoryArms.Count!=9||relevanceBeginStep!=5||relevanceMainStep!=3)throw Error("relevance-main-history-original-begin");}if(phase=="via-main-history-callback-arm"){if(relevanceHistoryCallback||relevanceHistoryStep!=0)throw Error("relevance-main-callback-once");relevanceHistoryCallback=true;}
int slot=-1;bool callback=false;if(method=="Debugger.resume"){string[] sequence={${HISTORY_STEPS.map(role => `"via-main-history-step-${role}"`).join(",")}};if(!relevanceHistoryCallback||relevanceHistoryStep>=sequence.Length||phase!=sequence[relevanceHistoryStep])throw Error("relevance-main-history-step-order");string[] slots={"data","head","branch","commit","project"};for(int i=0;i<slots.Length;i++){if(phase=="via-main-history-step-sql-"+slots[i])slot=i;if(phase=="via-main-history-step-callback-"+slots[i]){slot=i;callback=true;}}if(slot>=0){long now=(System.DateTime.UtcNow.Ticks-621355968000000000L)/10000L;if(callback){if(relevanceHistoryBefore[slot]<=0||relevanceHistoryAfter[slot]!=0||now<relevanceHistoryBefore[slot]||now-relevanceHistoryBefore[slot]>120000)throw Error("relevance-main-callback-clock");relevanceHistoryAfter[slot]=now;}else{if(relevanceHistoryBefore[slot]!=0||relevanceHistoryAfter[slot]!=0)throw Error("relevance-main-sql-once");relevanceHistoryBefore[slot]=now;}}relevanceHistoryStep++;}
if(cleanup)relevanceHistoryCleanup++;else relevanceHistoryNormal++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();if(phase=="via-main-history-step-controllerReturned")for(int i=0;i<5;i++)if(relevanceHistoryBefore[i]<=0||relevanceHistoryAfter[i]<relevanceHistoryBefore[i])throw Error("relevance-main-five-callbacks-required");return slot<0?new long[0]:new long[]{slot,relevanceHistoryBefore[slot],relevanceHistoryAfter[slot]};}
}
${end}`; }
const actions = ["observe", "step", "begin", "history"] as const;
function dispatchCall(role: typeof actions[number]): string {
  if (role === "step") { return "if ($request.method -cne 'Debugger.resume' -or $fields.Count -ne 0) {throw 'pcb-diagnostic-relevance-main-step-fields'};$owner.SendRelevanceMainStep([int]$request.requestId,$request.phase);$result=@{written=$true}"; }
  if (role === "history") { return "$clock=$owner.SendRelevanceMainHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true};if ($clock.Length -eq 3) {$result.slot=@('data','head','branch','commit','project')[[int]$clock[0]];$result.beforeEpochMs=$clock[1];$result.afterEpochMs=$clock[2]}"; }
  return `$owner.SendRelevanceMain${role === "observe" ? "Observation" : "Begin"}([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}`;
}
const dispatch = actions.map(role => `        'schematic-relevance-display-main-${role}' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-relevance-main-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-relevance-main-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          ${dispatchCall(role)}
        }
`).join("");
export function applyCurrentSchematicRelevanceDisplayMainNativeFragment(input: string): string {
  if (!input.includes("public static class EasyedaPcbViaMainHistoryProtocol") || !input.includes("public static class EasyedaPcbViaMainBeginProtocol")) { throw new Error("RELEVANCE_MAIN_FIXED_ENCODERS_REQUIRED"); }
  let source = input;
  const admission = "public void AdmitSchematicRelevanceDisplayAction(string action)", stop = "public static string SchematicRelevanceDisplayProtocolMessage(";
  if (source.split(admission).length !== 2 || source.split(stop).length !== 2) { throw new Error("RELEVANCE_MAIN_ORIGINAL_BIRTH_REQUIRED"); }
  const from = source.indexOf(admission), to = source.indexOf(stop, from); if (to < from) { throw new Error("RELEVANCE_MAIN_ADMISSION_ORDER"); }
  const body = source.slice(from, to), cases = actions.map(role => `case "schematic-relevance-display-main-${role}":`).join("");
  if (!body.includes(cases)) { if (body.includes('case "schematic-relevance-display-main-') || body.split('case "identity":').length !== 2) { throw new Error("RELEVANCE_MAIN_PARTIAL_ADMISSION"); } source = source.slice(0, from) + body.replace('case "identity":', `${cases}case "identity":`) + source.slice(to); }
  else if (body.split(cases).length !== 2) { throw new Error("RELEVANCE_MAIN_DUPLICATE_ADMISSION"); }
  // Original GETs can use the shared readonly fence after history starts.
  // Existing six-record and Wire owners keep their readonly numeric limits.
  const mainEnd = "static int SchematicDisplayIndex(", mainStart = "void SendSchematicDisplayMain(";
  if (source.split(mainStart).length !== 2 || source.split(mainEnd).length !== 2) { throw new Error("RELEVANCE_MAIN_SHARED_FENCE_REQUIRED"); }
  const mainFrom = source.indexOf(mainStart), mainTo = source.indexOf(mainEnd, mainFrom);
  const main = source.slice(mainFrom, mainTo);
  source = source.slice(0, mainFrom) + one(main, `id>${String(SIX.main.total)}`, `id>(schematicRelevanceDisplayWrite209?${String(PROFILE.main.total)}:${String(SIX.main.total)})`) + source.slice(mainTo);
  const large = " -or $SchematicRelevanceDisplayWrite209 -and @('schematic-relevance-display-main-observe','schematic-relevance-display-main-step','schematic-relevance-display-main-begin','schematic-relevance-display-main-history') -ccontains $request.action";
  if (source.includes(large)) { if (source.split(large).length !== 2) { throw new Error("RELEVANCE_MAIN_LARGE_REQUEST_DUPLICATE"); } }
  else { const lines = [...source.matchAll(/^ +\$largeMainRequest=.*$/gmu)]; if (lines.length !== 1 || lines[0] === undefined) { throw new Error("RELEVANCE_MAIN_LARGE_REQUEST_ANCHOR"); } source = source.replace(lines[0][0], `${lines[0][0]}${large}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  const beginAt = source.indexOf(start), endAt = source.indexOf(end);
  if (beginAt !== -1 || endAt !== -1) { if (beginAt === -1 || endAt < beginAt || source.includes(start, beginAt + start.length) || source.includes(end, endAt + end.length)) { throw new Error("RELEVANCE_MAIN_NATIVE_MARKERS"); } return source.slice(0, beginAt) + currentSchematicRelevanceDisplayMainNativeSource() + source.slice(endAt + end.length); }
  return one(source, "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209", `${currentSchematicRelevanceDisplayMainNativeSource()}\n// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209`);
}
