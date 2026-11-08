/** Purpose-local original readonly worker ledger. Immutable source/loading
 * templates are shared; every flag, session, counter and continuation is new. */
import { currentPcbViaSavedLoadWorkerNativeSource } from "./current-pcb-via-saved-load-worker-native.ts";
import { currentPcbViaSavedLoadBootstrapCases } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_OBSERVATION_REQUESTS as OBSERVE, currentPcbViaSavedLoadObservationCases } from "./current-pcb-via-saved-load-observation-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "./current-pcb-via-saved-load-source.ts";
import { currentPcbViaSavedLoadWorkerWire } from "./current-pcb-via-saved-load-worker-wire.ts";

export function currentSchematicRelevanceSavedColdNative(): string {
  const order = currentPcbViaSavedLoadBootstrapCases().map(command => "role" in command ? `${command.phase}-${command.role}` : command.phase);
  let total = 0;
  const slots = currentPcbViaSavedLoadObservationCases().map(command => {
    const phase = currentPcbViaSavedLoadWorkerWire(command, 1).request["phase"]; let maximum = 1;
    if (command.phase === "saved-observe-helper") { maximum = OBSERVE.helperSources; }
    else if (command.phase === "saved-observe-frame" || command.phase === "saved-observe-value" || command.phase === "saved-observe-resume") { maximum = SITES[command.role].count; }
    else if (command.phase === "saved-observe-flow-method" || command.phase === "saved-observe-flow-functions" || command.phase === "saved-observe-array" && (command.role === "flowEntry" || command.role === "flowFunctions")) { maximum = 2; }
    total += maximum; return `case ${JSON.stringify(phase)}:return ${String(maximum)};`;
  }).join(""); if (total !== OBSERVE.total) { throw new Error("SCHEMATIC_SAVED_COLD_SLOT_DERIVATION"); }
  return `${currentPcbViaSavedLoadWorkerNativeSource()}
${String.raw`
public sealed partial class EasyedaDiagnosticOwner {
bool schematicSavedColdArmed,schematicSavedColdBound,schematicSavedColdSourceBound,schematicSavedColdObservationArmed,schematicSavedColdStarted,schematicSavedColdComplete;
string schematicSavedColdBrowser,schematicSavedColdPage,schematicSavedColdScript,schematicSavedColdContext;int schematicSavedColdStep,schematicSavedColdCount;
readonly Dictionary<string,int> schematicSavedColdSlots=new Dictionary<string,int>(StringComparer.Ordinal);
public void ArmSchematicSavedCold(){if(!schematicSavedReadback209||!schematicSavedMainComplete||!schematicSavedBackupEnrolled||!schematicSavedCacheGuards[2]||!schematicSavedCacheUntracked||!schematicSavedCacheSlots.Contains("saved-cache-names/loading")||schematicSavedColdArmed)throw Error("schematic-saved-cold-arm");schematicSavedColdArmed=true;}
public void BindSchematicSavedCold(string target,string browser,string page,string project,string window){if(!schematicSavedReadback209||!schematicSavedColdArmed||schematicSavedColdBound||!schematicSavedOpeningDispatched||!schematicSavedRegistrationAwaited||project!=schematicSavedCacheProject||browser==page)throw Error("schematic-saved-cold-bind");foreach(string value in new[]{target,browser,page,window})if(value==null||!System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("schematic-saved-cold-bind-fields");schematicSavedColdBound=true;schematicSavedColdBrowser=browser;schematicSavedColdPage=page;}
public void BindSchematicSavedColdSource(string script,string context){if(!schematicSavedReadback209||!schematicSavedColdBound||schematicSavedColdSourceBound||schematicSavedColdStep!=${String(order.length)}||script!=schematicSavedColdScript||!System.Text.RegularExpressions.Regex.IsMatch(context??"",@"\A[A-Za-z0-9_.:-]{1,256}\z"))throw Error("schematic-saved-cold-source-bind");schematicSavedColdSourceBound=true;schematicSavedColdContext=context;}
public void ArmSchematicSavedColdObservation(){if(!schematicSavedColdSourceBound||schematicSavedColdObservationArmed||schematicSavedColdStarted||!EasyedaPcbViaSavedLoadWorkerProtocol.CompleteArm(schematicSavedColdSlots))throw Error("schematic-saved-cold-observation-arm");schematicSavedColdObservationArmed=true;}
public void CompleteSchematicSavedCold(){if(!schematicSavedColdStarted||schematicSavedColdComplete||schematicSavedColdCount!=${String(OBSERVE.total)})throw Error("schematic-saved-cold-complete");schematicSavedColdComplete=true;}
static int SchematicSavedColdMaximum(string phase){switch(phase){${slots}default:throw Error("schematic-saved-cold-phase");}}
public void SendSchematicSavedCold(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicSavedReadback209||!schematicSavedMainComplete||!schematicSavedColdBound||schematicSavedColdComplete)throw Error("schematic-saved-cold-original");
if(phase.StartsWith("saved-observe-",StringComparison.Ordinal)){if(!schematicSavedColdSourceBound)throw Error("schematic-saved-cold-source-required");int maximum=SchematicSavedColdMaximum(phase),used=0;schematicSavedColdSlots.TryGetValue(phase,out used);if(used>=maximum||schematicSavedColdCount>=${String(OBSERVE.total)})throw Error("schematic-saved-cold-capacity");bool late=phase.StartsWith("saved-observe-frame-",StringComparison.Ordinal)||phase.StartsWith("saved-observe-value-",StringComparison.Ordinal)||phase.StartsWith("saved-observe-resume-",StringComparison.Ordinal)||phase.StartsWith("saved-observe-flow-",StringComparison.Ordinal)||phase=="saved-observe-array-project"||phase=="saved-observe-array-flowEntry"||phase=="saved-observe-array-flowFunctions";if(late&&!schematicSavedColdStarted||schematicSavedColdStarted&&!late&&phase!="saved-observe-helper")throw Error("schematic-saved-cold-order");if(phase=="saved-observe-start-project"&&!schematicSavedColdObservationArmed)throw Error("schematic-saved-cold-start-before-arms");if(phase.StartsWith("saved-observe-arm-",StringComparison.Ordinal)&&(!fields.Contains("scriptId")||(string)fields["scriptId"]!=schematicSavedColdScript))throw Error("schematic-saved-cold-source-script");if(phase=="saved-observe-intrinsic-cacheConstructors"||phase=="saved-observe-intrinsic-bytesConstructors"){if(fields.Count!=0)throw Error("schematic-saved-cold-original-context");fields.Add("uniqueContextId",schematicSavedColdContext);}string text=EasyedaPcbViaSavedLoadWorkerProtocol.Encode(id,schematicSavedColdPage,phase,method,fields);schematicSavedColdSlots[phase]=used+1;schematicSavedColdCount++;if(phase=="saved-observe-start-project")schematicSavedColdStarted=true;SendMessage(id,text);return;}
string[] order=new[]{${order.map(value => JSON.stringify(value)).join(",")}};if(schematicSavedColdSourceBound||schematicSavedColdStep>=order.Length||order[schematicSavedColdStep]!=phase)throw Error("schematic-saved-cold-bootstrap-order");string encoded=EasyedaPcbViaSavedLoadWorkerProtocol.Encode(id,phase=="saved-load-run-browser"?schematicSavedColdBrowser:schematicSavedColdPage,phase,method,fields);if(phase=="saved-load-source-project")schematicSavedColdScript=(string)fields["scriptId"];schematicSavedColdStep++;SendMessage(id,encoded);}
public static void VerifySchematicSavedColdSmoke(){EasyedaPcbViaSavedLoadWorkerProtocol.VerifySmoke();var fresh=CreateSchematicRelevanceSavedReadback209();bool refused=false;try{fresh.ArmSchematicSavedCold();}catch(InvalidOperationException){refused=true;}if(!refused||fresh.schematicSavedColdArmed)throw Error("schematic-saved-cold-before-loading");refused=false;try{fresh.BindSchematicSavedCold("target","browser","page",new string('a',64),"window");}catch(InvalidOperationException){refused=true;}if(!refused||fresh.schematicSavedColdBound)throw Error("schematic-saved-cold-before-opening");fresh.originalMain.Release();}
}
`}`;
}
export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_COLD_DISPATCH = String.raw`        'schematic-saved-cold-control' {
          if (-not $SchematicRelevanceSavedReadback209 -or $request.coldStage -isnot [string]) {throw 'schematic-saved-cold-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','coldStage');$extra=@()
          switch -CaseSensitive ($request.coldStage) {
            'arm' {$extra=@()}
            'bind' {$extra=@('targetId','browserSessionId','pageSessionId','projectUuid','windowTabId')}
            'source' {$extra=@('scriptId','uniqueContextId')}
            'armed' {$extra=@()}
            'complete' {$extra=@()}
            default {throw 'schematic-saved-cold-stage'}
          }
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@(($base+$extra) | Sort-Object) -join ',')) {throw 'schematic-saved-cold-fields'}
          foreach ($name in $extra) {if ($request.$name -isnot [string]) {throw 'schematic-saved-cold-types'}}
          switch -CaseSensitive ($request.coldStage) {
            'arm' {$owner.ArmSchematicSavedCold()}
            'bind' {$owner.BindSchematicSavedCold($request.targetId,$request.browserSessionId,$request.pageSessionId,$request.projectUuid,$request.windowTabId)}
            'source' {$owner.BindSchematicSavedColdSource($request.scriptId,$request.uniqueContextId)}
            'armed' {$owner.ArmSchematicSavedColdObservation()}
            'complete' {$owner.CompleteSchematicSavedCold()}
          };$result=@{acknowledged=$true}
        }
        'schematic-saved-cold-worker' {
          if (-not $SchematicRelevanceSavedReadback209) {throw 'schematic-saved-cold-purpose'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($name in $base) {if (@($request.PSObject.Properties.Name) -cnotcontains $name) {throw 'schematic-saved-cold-worker-fields'}}
          if ($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'schematic-saved-cold-worker-types'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach ($property in $request.PSObject.Properties) {if ($base -cnotcontains $property.Name) {$fields[$property.Name]=$property.Value}}
          $owner.SendSchematicSavedCold([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
