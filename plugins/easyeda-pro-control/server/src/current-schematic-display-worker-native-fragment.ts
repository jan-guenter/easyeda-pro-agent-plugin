/** Original schematic-only worker binding/observation. This adds no Save or SQL grant
 * and never upgrades a released worker-startup purpose. */
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { currentProjectSaveStructureNativeGuard } from "./current-project-save-structure-native-guard.ts";
import { currentSchematicDisplayWorkerNativeSource } from "./current-schematic-display-worker-native.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_ROLES as ROLES } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WORKER_BOOTSTRAP_REQUESTS as BOOTSTRAP } from "./current-schematic-display-worker-bootstrap-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS as SAVE } from "./current-schematic-display-save-protocol.ts";

const begin = "// BEGIN GENERATED SCHEMATIC ORIGINAL WORKER OBSERVER";
const end = "// END GENERATED SCHEMATIC ORIGINAL WORKER OBSERVER";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("SCHEMATIC_DISPLAY_WORKER_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`SCHEMATIC_DISPLAY_WORKER_NATIVE_ANCHOR:${before.slice(0, 60)}`); } return source.replace(before, after);
}
function native(): string {
  return `${begin}
${currentSchematicDisplayWorkerNativeSource()}
public sealed partial class EasyedaDiagnosticOwner {
string schematicWorkerSession,schematicWorkerTarget,schematicWorkerProjectScript,schematicWorkerProjectUuid,schematicWorkerPageUuid,schematicWorkerWindow;bool schematicWorkerParentArmed,schematicWorkerParentRunning;int schematicWorkerSetup,schematicWorkerStage,schematicWorkerNormal,schematicWorkerCleanup,schematicSaveNormal,schematicSaveCleanup;bool schematicWorkerSourceRead,schematicWorkerInstrumentRemoved;
readonly System.Collections.Generic.HashSet<string> schematicSavePoints=new System.Collections.Generic.HashSet<string>();
static readonly string[] SchematicDisplayWorkerRoles=new[]{${ROLES.map(role => `"${role}"`).join(",")}};
public void PrepareSchematicDisplayWorker(string project,string page,string window){if(!schematicDisplayWrite209||schematicDisplayAbort||!schematicDisplayStages[0]||schematicDisplayStages[1]||schematicWorkerProjectUuid!=null||!System.Text.RegularExpressions.Regex.IsMatch(project??"",@"\\A[a-f0-9]{64}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(page??"",@"\\A[a-f0-9]{32}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(window??"",@"\\A[A-Za-z0-9_-]{1,128}\\z"))throw Error("schematic-worker-prepare-once");AssertLive();schematicWorkerProjectUuid=project;schematicWorkerPageUuid=page;schematicWorkerWindow=window;}
public void BindSchematicDisplayWorker(string session,string target,string project,string window){
if(!schematicDisplayWrite209||!schematicWorkerParentArmed||schematicWorkerSession!=null||schematicWorkerParentRunning||schematicWorkerProjectUuid==null||session==schematicDisplaySession||!System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\\A[A-Za-z0-9_.:-]{1,128}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(target??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(window??"",@"\\A[A-Za-z0-9_-]{1,128}\\z")||project!=schematicWorkerProjectUuid||window!=schematicWorkerWindow)throw Error("schematic-worker-original-binding");AssertLive();schematicWorkerSession=session;schematicWorkerTarget=target;
}
public void SendSchematicDisplayWorkerParent(int id,string session,string phase){
if(!schematicDisplayWrite209||schematicDisplayAbort||session!=schematicDisplaySession||schematicWorkerProjectUuid==null)throw Error("schematic-worker-parent-purpose");bool wait;
if(phase=="arm"){if(schematicWorkerParentArmed)throw Error("schematic-worker-parent-once");schematicWorkerParentArmed=true;wait=true;}
else if(phase=="running"){if(!schematicWorkerParentArmed||schematicWorkerParentRunning||schematicWorkerSession==null||schematicWorkerStage!=6||!schematicWorkerSourceRead||schematicSavePoints.Count!=6||schematicStructurePoints.Count!=0&&schematicStructurePoints.Count!=14)throw Error("schematic-worker-parent-original-source");schematicWorkerParentRunning=true;wait=false;}else throw Error("schematic-worker-parent-phase");
string message="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Target.setAutoAttach\\",\\"params\\":{\\"autoAttach\\":true,\\"waitForDebuggerOnStart\\":"+(wait?"true":"false")+",\\"flatten\\":true,\\"filter\\":[{\\"type\\":\\"worker\\",\\"exclude\\":false},{\\"exclude\\":true}]},\\"sessionId\\":"+JsonString(session)+"}\\0";SendMessage(id,message);
}
void AdmitSchematicDisplayWorkerBootstrap(string phase,System.Collections.IDictionary fields){
string[] setup={"schematic-worker-runtime","schematic-worker-debugger","schematic-worker-async","schematic-worker-instrument","schematic-worker-run-waiting"};
if(schematicWorkerSetup<setup.Length){if(phase!=setup[schematicWorkerSetup])throw Error("schematic-worker-bootstrap-setup");schematicWorkerSetup++;return;}
if(phase=="schematic-worker-remove"){if(schematicWorkerInstrumentRemoved||schematicWorkerStage!=6||!schematicWorkerSourceRead||schematicSavePoints.Count!=6||schematicStructurePoints.Count!=0&&schematicStructurePoints.Count!=14)throw Error("schematic-worker-instrument-original");schematicWorkerInstrumentRemoved=true;return;}
if(schematicWorkerStage>=SchematicDisplayWorkerRoles.Length)throw Error("schematic-worker-bootstrap-consumed");string role=SchematicDisplayWorkerRoles[schematicWorkerStage];
if(phase=="schematic-worker-source-"+role){if(schematicWorkerSourceRead)throw Error("schematic-worker-source-once");schematicWorkerSourceRead=true;if(role=="project")schematicWorkerProjectScript=fields["scriptId"] as string;}
else if(phase=="schematic-worker-resume-"+role){if(!schematicWorkerSourceRead||role=="project"&&(!schematicWorkerInstrumentRemoved||!schematicWorkerParentRunning||schematicSavePoints.Count!=6||schematicStructurePoints.Count!=0&&schematicStructurePoints.Count!=14))throw Error("schematic-worker-source-before-resume");schematicWorkerStage++;schematicWorkerSourceRead=false;}else throw Error("schematic-worker-bootstrap-phase");
}
void AdmitSchematicDisplaySaveObserver(string phase,System.Collections.IDictionary fields){
if(schematicWorkerStage==6&&schematicWorkerSourceRead){if(phase=="schematic-save-source"){if(fields["scriptId"] as string!=schematicWorkerProjectScript)throw Error("schematic-save-source-original");return;}if(!phase.StartsWith("schematic-save-arm-",StringComparison.Ordinal)||fields["scriptId"] as string!=schematicWorkerProjectScript)throw Error("schematic-save-arm-original-source");string role=phase.Substring("schematic-save-arm-".Length);if(Array.IndexOf(new[]{"noData","entry","clock","compress","body","result"},role)<0||!schematicSavePoints.Add(role))throw Error("schematic-save-arm-once");return;}
if(schematicWorkerStage!=7||schematicSavePoints.Count!=6||schematicStructurePoints.Count!=0&&schematicStructurePoints.Count!=14)throw Error("schematic-save-bootstrap-required");
if(phase=="schematic-save-source"&&fields["scriptId"] as string!=schematicWorkerProjectScript)throw Error("schematic-save-source-original");
if(phase=="schematic-save-entry"&&(fields["pageUuid"] as string!=schematicWorkerPageUuid||fields["projectUuid"] as string!=schematicWorkerProjectUuid))throw Error("schematic-save-original-target");
if(phase!="schematic-save-source"&&!schematicDisplayStages[6])throw Error("schematic-save-original-attempt");
}
${currentProjectSaveStructureNativeGuard("schematic")}
public void SendSchematicDisplayWorker(int id,string phase,string method,System.Collections.IDictionary fields){
if(!schematicDisplayWrite209||schematicDisplayAbort||schematicWorkerSession==null)throw Error("schematic-worker-purpose");string encoded=EasyedaSchematicDisplayWorkerProtocol.Encode(id,schematicWorkerSession,phase,method,fields);
if(phase.StartsWith("project-save-structure-",StringComparison.Ordinal)){AdmitSchematicDisplaySaveStructureObserver(phase,fields);SendMessage(id,encoded);return;}
bool bootstrap=phase.StartsWith("schematic-worker-",StringComparison.Ordinal),cleanup=phase.StartsWith("schematic-worker-resume-",StringComparison.Ordinal)||phase=="schematic-worker-remove"||phase=="schematic-save-resume"||phase=="schematic-save-remove"||phase=="schematic-save-release";
if(bootstrap){if(cleanup?schematicWorkerCleanup>=${String(BOOTSTRAP.workerCleanup)}:schematicWorkerNormal>=${String(BOOTSTRAP.workerNormal)})throw Error("schematic-worker-bootstrap-budget");AdmitSchematicDisplayWorkerBootstrap(phase,fields);if(cleanup)schematicWorkerCleanup++;else schematicWorkerNormal++;}
else{if(cleanup?schematicSaveCleanup>=${String(SAVE.cleanup)}:schematicSaveNormal>=${String(SAVE.normal)})throw Error("schematic-save-observer-budget");AdmitSchematicDisplaySaveObserver(phase,fields);if(cleanup)schematicSaveCleanup++;else schematicSaveNormal++;}
SendMessage(id,encoded);
}
public static void VerifySchematicDisplayWorkerSmoke(){VerifySchematicDisplaySaveStructureGuardSmoke();EasyedaSchematicDisplayWorkerProtocol.VerifySmoke();foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209()}){bool refused=false;try{owner.BindSchematicDisplayWorker("w","t",new string('a',64),"window_1");}catch(InvalidOperationException){refused=true;}if(!refused||owner.schematicWorkerSession!=null)throw Error("schematic-worker-old-birth-smoke");}}
}
${end}`;
}
const dispatch = String.raw`        'schematic-display-worker-prepare' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.projectUuid -isnot [string] -or $request.pageUuid -isnot [string] -or $request.windowTabId -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,pageUuid,projectUuid,rootCreated,rootPid,windowTabId') {throw 'pcb-diagnostic-schematic-worker-prepare-fields'}
          $owner.PrepareSchematicDisplayWorker($request.projectUuid,$request.pageUuid,$request.windowTabId);$result=@{prepared=$true}
        }
        'schematic-display-worker-bind' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.sessionId -isnot [string] -or $request.targetId -isnot [string] -or $request.projectUuid -isnot [string] -or $request.windowTabId -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,projectUuid,rootCreated,rootPid,sessionId,targetId,windowTabId') {throw 'pcb-diagnostic-schematic-worker-bind-fields'}
          $owner.BindSchematicDisplayWorker($request.sessionId,$request.targetId,$request.projectUuid,$request.windowTabId);$result=@{bound=$true}
        }
        'schematic-display-worker-parent' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.sessionId -isnot [string] -or $request.phase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,phase,requestId,rootCreated,rootPid,sessionId') {throw 'pcb-diagnostic-schematic-worker-parent-fields'}
          $owner.SendSchematicDisplayWorkerParent([int]$request.requestId,$request.sessionId,$request.phase);$result=@{written=$true}
        }
        'schematic-display-worker' {
          if (-not $SchematicDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-schematic-worker-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-schematic-worker-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendSchematicDisplayWorker([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentSchematicDisplayWorkerNativeFragment(input: string): string {
  let source = one(input, 'case "schematic-display-native":break;', 'case "schematic-display-worker-prepare":case "schematic-display-worker-bind":case "schematic-display-worker-parent":case "schematic-display-worker":case "schematic-display-native":break;');
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-display-native' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifySchematicDisplayWorkerSmoke()", "    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_DISPLAY_WORKER_NATIVE_MARKERS"); } source = source.slice(0, start) + native() + source.slice(stop + end.length); }
  else { source = one(source, "// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", `${native()}\n// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH`); }
  return source;
}
