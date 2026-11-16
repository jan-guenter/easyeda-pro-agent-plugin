import { installCurrentFootprintForwardWriterPipeNativeSource } from "./current-footprint-forward-writer-pipe-native.ts";
import { installCurrentFootprintForwardWriterRequestGuard } from "./current-footprint-forward-writer-request-native.ts";
import { currentFootprintForwardHeadNativeSource } from "./current-footprint-forward-head-native.ts";
import { currentFootprintForwardHeadAgeNativeSource } from "./current-footprint-forward-head-age-native.ts";
/** New fixed native graph. The old three-role graph is unchanged. Separate
 * producer, startup and sync roles hold their fixed codebooks; the full writer's
 * startup reservation is derived independently from its exact emitted units. */
/* oxlint-disable import/max-dependencies -- Assemble the six original roles and fixed shared protocols with the full-only native classifier; their separate ledgers and program tables are not duplicated. */
import { createHash } from "node:crypto";
import { currentFootprintForwardColdNativeOutputs } from "./current-footprint-forward-cold-native-graph-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_NATIVE_GRAPH_LIMITS as LIMITS } from "./current-footprint-forward-writer-native-limits.ts";
import { currentFootprintForwardWriterProfile } from "./current-footprint-forward-writer-profile.ts";
import { currentFootprintForwardWriterProducerNativeSource } from "./current-footprint-forward-writer-producer-native.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_DISPATCH, currentFootprintForwardWriterStartupNativeSource } from "./current-footprint-forward-writer-startup-native.ts";
import { currentFootprintForwardWriterHistoryNativeSource } from "./current-footprint-forward-writer-history-native.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS as COMPLETION } from "./current-footprint-copy-main-completion-protocol.ts";
import { currentFootprintForwardWriterFrontierNativeSource } from "./current-footprint-forward-writer-frontier-native.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_RENDERER_CLASS_NATIVE } from "./current-footprint-forward-writer-renderer-class.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_NATIVE } from "./current-footprint-forward-writer-clock-native.ts";
import { currentFootprintForwardWriterSyncNativeSource } from "./current-footprint-forward-writer-sync-native.ts";

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
const PROFILE = currentFootprintForwardWriterProfile();
/** Refuse source drift or aliases at every reviewed mechanical replacement. */
function one(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error(`FORWARD_WRITER_NATIVE_ANCHOR:${before.slice(0, 64)}`); }
  return source.replace(before, after);
}
function plannedNormalSenders(source: string, expected: number): string {
  const call = "SendMessage(id,encoded);";
  if (source.split(call).length !== expected + 1) { throw new Error("FORWARD_WRITER_NATIVE_NORMAL_SENDERS"); }
  return source.replaceAll(call, "SendForwardWriterNormalMessage(id,encoded);");
}
const producerActions = ["footprint-forward-producer-bind", "footprint-forward-producer-guard", "footprint-forward-producer-observe", "footprint-forward-producer-enroll", "footprint-forward-initial-cache-control", "footprint-forward-initial-cache-send", "footprint-forward-initial-history", "footprint-forward-initial-sync-control", "footprint-forward-initial-sync-send", "footprint-forward-startup-frontier-control", "footprint-forward-startup-frontier-send", "footprint-forward-writer-clock-begin", "footprint-forward-writer-clock-retire"] as const;
const actions = Object.freeze(["footprint-forward-head-main", "identity", "release", "release-unlaunched", "no-process-proof", "release-no-process", "launch",
  "main-attach", "main-reprove", "main-close-detach", "main-poll", "main-send", "main-request-send", "main-completion-begin", "main-completion-send", "main-completion-retire",
  "worker-startup-reprove", "worker-startup-parent", "footprint-copy-parent", "footprint-copy-worker", "footprint-cache-construction", "worker-startup-send", "send", "poll",
  "footprint-copy-windows-clock", "window", "normal-close", "termination", "combined-abort", "saved-cache-native", "saved-cache-accessor", "footprint-copy-allocation-send", "footprint-copy-native-create",
  "footprint-copy-create-clock-retire", "footprint-copy-clock-registration-v2", "footprint-clock-rpc-v2-send", "footprint-forward-cold-send", "footprint-forward-cold-begin", "footprint-forward-allocated-clock-begin"]);

/** Keep native input scalar-only and bind every action to this typed birth. */
function dispatch(): string {
  return `        'footprint-forward-writer-clock-retire' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-writer-clock-retire-fields'}
          $disposition=$owner.RetireForwardWriterAllocatedClock();$result=@{retired=$true;disposition=$disposition}
        }
        'footprint-forward-writer-clock-begin' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or ($request.firstRequestId -isnot [int] -and $request.firstRequestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,firstRequestId,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-writer-clock-begin-fields'}
          $owner.BeginForwardWriterAllocatedClock([int]$request.firstRequestId);$result=@{begun=$true}
        }
        'footprint-forward-producer-bind' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.workerContext -isnot [string] -or $request.scriptId -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,scriptId,workerContext') {throw 'forward-writer-producer-bind-fields'}
          $owner.BindForwardWriterProducer($request.workerContext,$request.scriptId);$result=@{bound=$true}
        }
        'footprint-forward-producer-enroll' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-writer-producer-enroll-fields'}
          $owner.EnrollForwardWriterProducer();$result=@{enrolled=$true}
        }
        'footprint-forward-producer-guard' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -cne 'Debugger.setBreakpoint' -or $request.scriptId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,method,phase,requestId,rootCreated,rootPid,scriptId') {throw 'forward-writer-producer-guard-fields'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$fields.Add('scriptId',$request.scriptId)
          $owner.SendForwardWriterProducerGuard([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-producer-observe' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-producer-observe-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-producer-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','callFrameId','scriptId','argument0','argument1','argument2','argument3','argument4','argument5','argument6','argument7') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-writer-producer-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterProducerObserve([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-startup-frontier-control' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.operation -isnot [string]) {throw 'forward-writer-frontier-control'}
          $expected='action,helperInstance,id,jobId,operation,rootCreated,rootPid'
          if ($request.operation -ceq 'bind') {
            if (($request.records -isnot [int] -and $request.records -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,records,rootCreated,rootPid') {throw 'forward-writer-frontier-bind-fields'}
            $owner.BindForwardWriterFrontier([int]$request.records)
          } else {
            $role=[System.Management.Automation.Language.NullString]::Value
            if (@('callback-held','timer-held') -ccontains $request.operation) {
              if ($request.role -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,role,rootCreated,rootPid') {throw 'forward-writer-frontier-held-fields'}
              $role=$request.role
            } elseif (@('timer-complete','queue-open','complete') -cnotcontains $request.operation -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne $expected) {throw 'forward-writer-frontier-control-fields'}
            $owner.ControlForwardWriterFrontier($request.operation,$role)
          }
          $result=@{written=$true}
        }
        'footprint-forward-startup-frontier-send' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or @('callback','timer','queue') -cnotcontains $request.lane -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-frontier-fields'}
          $baseFields=@('id','action','requestId','phase','method','lane','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-frontier-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','callFrameId','scriptId','breakpointId','argument0','argument1','argument2','argument3') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-writer-frontier-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterFrontier([int]$request.requestId,$request.lane,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-initial-cache-control' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.operation -isnot [string]) {throw 'forward-writer-cache-control'}
          $expected='action,helperInstance,id,jobId,operation,rootCreated,rootPid'
          if ($request.operation -ceq 'bind') {
            if (($request.jobs -isnot [int] -and $request.jobs -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,jobs,operation,rootCreated,rootPid') {throw 'forward-writer-cache-bind-fields'}
            $owner.BindForwardWriterInitialCache([int]$request.jobs)
          } elseif ($request.operation -ceq 'hold') {
            if ($request.role -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,role,rootCreated,rootPid') {throw 'forward-writer-cache-hold-fields'}
            $owner.HoldForwardWriterInitialCache($request.role)
          } elseif ($request.operation -ceq 'complete') {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne $expected) {throw 'forward-writer-cache-complete-fields'}
            $owner.CompleteForwardWriterInitialCache()
          } else {throw 'forward-writer-cache-control-operation'}
          $result=@{written=$true}
        }
        'footprint-forward-initial-cache-send' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-cache-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-cache-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','argument0','argument1','key','body','nodes','depth','array','keys','string') -cnotcontains $property.Name) {throw 'forward-writer-cache-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterInitialCache([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-initial-history' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-history-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-history-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterMainHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-initial-sync-control' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.operation -isnot [string]) {throw 'forward-writer-sync-control'}
          if ($request.operation -ceq 'hold') {
            if ($request.role -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,role,rootCreated,rootPid') {throw 'forward-writer-sync-hold-fields'}
            $owner.HoldForwardWriterInitialSync($request.role)
          } elseif ($request.operation -ceq 'complete') {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,rootCreated,rootPid') {throw 'forward-writer-sync-complete-fields'}
            $owner.CompleteForwardWriterInitialSync()
          } else {throw 'forward-writer-sync-control-operation'}
          $result=@{written=$true}
        }
        'footprint-forward-initial-sync-send' {
          if (-not $WorkerStartupFootprintForwardWriter209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-sync-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-sync-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','callFrameId','argument0','argument1','argument2','argument3','key','body','nodes','depth','array','keys','string','rows') -cnotcontains $property.Name) {throw 'forward-writer-sync-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterInitialSync([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
}
function headDispatch(): string { return `        'footprint-forward-head-age-main' {
          if (-not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt [EasyedaFootprintForwardExecutionLimits]::MainRequests) {throw 'forward-head-age-main-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-head-age-main-fields'}}
          $fields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {
            if (@('objectId','scriptId','argument0','argument1','argument2','argument3','nativeRootPid','createdAtLiteral','wallEpochMs') -cnotcontains $property.Name) {throw 'forward-head-age-main-field'}
            if (@('nativeRootPid','wallEpochMs') -ccontains $property.Name) {if ($property.Value -isnot [int] -and $property.Value -isnot [long]) {throw 'forward-head-age-main-number'}} elseif ($property.Value -isnot [string]) {throw 'forward-head-age-main-text'}
            $fields.Add($property.Name,$property.Value)
          }}
          $result=$owner.SendForwardHeadAgeMain([int]$request.requestId,$request.phase,$request.method,$fields)
        }
        'footprint-forward-head-main' {
          if (-not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt [EasyedaFootprintForwardExecutionLimits]::MainRequests) {throw 'forward-head-main-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-head-main-fields'}}
          $fields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','promiseObjectId','scriptId','callFrameId','breakpointId','path','argument0','argument1') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-head-main-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardHeadMain([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`; }

/** Preserve the exact supported action roster and original terminal controls. */
function prune(driver: string, headAge: boolean): string {
  const cases = [...driver.matchAll(/^ {8}'([^']+)' \{/gmu)];
  const defaults = [...driver.matchAll(/^ {8}default \{/gmu)], fallback = defaults[0]?.index ?? -1;
  if (cases.length < 50 || defaults.length !== 1 || fallback < (cases.at(-1)?.index ?? Infinity)) { throw new Error("FORWARD_WRITER_NATIVE_SWITCH"); }
  const result: string[] = [driver.slice(0, cases[0]?.index)];
  const admitted = headAge ? [...actions, "footprint-forward-head-age-main"] : actions;
  const seen = new Set<string>();
  for (const [index, row] of cases.entries()) {
    const action = row[1], start = row.index, stop = cases[index + 1]?.index ?? fallback;
    if (action === undefined || start === undefined || stop <= start || seen.has(action)) { throw new Error("FORWARD_WRITER_NATIVE_CASE"); }
    seen.add(action); if (admitted.some(value => value === action)) { result.push(driver.slice(start, stop)); }
  }
  if (admitted.some(action => !seen.has(action))) { throw new Error(`FORWARD_WRITER_NATIVE_ACTION_MISSING:${admitted.filter(action => !seen.has(action)).join(",")}`); }
  result.push(dispatch(), driver.slice(fallback)); return result.join("");
}
/** Pin the exact retained byte array before Windows compiles any native role. */
function check(variable: string, role: string, source: string): string {
  return `if ($${variable} -isnot [byte[]] -or $${variable}.Length -ne ${String(Buffer.byteLength(source))}) {throw 'forward-writer-${role}-size'}
$graphHasher=[Security.Cryptography.SHA256]::Create();try {$graphDigest=([BitConverter]::ToString($graphHasher.ComputeHash($${variable}))).Replace('-','').ToLowerInvariant()} finally {$graphHasher.Dispose()}
if ($graphDigest -cne '${hash(source)}') {throw 'forward-writer-${role}-hash'}
`;
}
export interface CurrentFootprintForwardWriterNativeOutput { readonly role: "driver" | "core" | "phase" | "producer" | "startup" | "sync"; readonly relativePath: string; readonly source: string; readonly bytes: number; readonly sha256: string; readonly maximumBytes: number }
/** Derive the separate six-role graph while preserving old source outputs. */
export function currentFootprintForwardWriterNativeOutputs(shared: string): readonly CurrentFootprintForwardWriterNativeOutput[] {
  const previous = currentFootprintForwardColdNativeOutputs(shared);
  const oldCore = previous[1], oldDriver = previous[0], oldPhase = previous[2];
  if (oldDriver?.role !== "driver" || oldCore?.role !== "core" || oldPhase?.role !== "phase") { throw new Error("FORWARD_WRITER_NATIVE_ROLES"); }
  let core = installCurrentFootprintForwardWriterPipeNativeSource(oldCore.source.replaceAll("CreateFootprintForwardExecution209", "CreateFootprintForwardWriter209"));
  core = one(core, "public void SendMain(int id,string phase,string method,System.Collections.IDictionary fields){", `public void SendMain(int id,string phase,string method,System.Collections.IDictionary fields){${CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_DISPATCH}`);
  core = one(core, "originalMain.RequireCompletionCapacity(mainRequest);", "originalMain.RequireCompletionCapacity(mainRequest-(forwardWriterBirth?stockMainRequests:0));");
  core = one(core, "    if(cleanup?forwardCleanupRequests>=", "    cleanup=ForwardWriterRendererCleanup(id,cleanup);\n    if(cleanup?forwardCleanupRequests>=");
  core = one(core, "enum RendererWriteRole { Existing, ClockRpc, NativeCreate, ForwardCold }", "enum RendererWriteRole { Existing, ClockRpc, NativeCreate, ForwardCold, ForwardWriterProducer }");
  core = one(core, "    if(mainCompletionActive&&role!=RendererWriteRole.ForwardCold)", "    bool fullProducer=forwardWriterBirth&&role==RendererWriteRole.ForwardWriterProducer;\n    if(mainCompletionActive&&role!=RendererWriteRole.ForwardCold&&!fullProducer)");
  core = one(core, "bool scoped=!coldTail&&role!=RendererWriteRole.Existing;", "bool scoped=!coldTail&&!fullProducer&&role!=RendererWriteRole.Existing;");
  core = one(core, "if((footprintClockRpcActive||footprintCreateClockActive)!=scoped ||", "if(!fullProducer&&(footprintClockRpcActive||footprintCreateClockActive)!=scoped ||");
  core = one(core, "!(footprintCreateClockLedger is EasyedaFootprintCopyAllocatedCreateClockLedger)", "!(footprintCreateClockLedger is EasyedaFootprintCopyAllocatedCreateClockLedger||forwardWriterBirth&&footprintCreateClockLedger is EasyedaForwardWriterAllocatedClockLedger)");
  const withHead = one(oldPhase.source, "public static class EasyedaFootprintForwardExecutionLimits {", `${currentFootprintForwardHeadNativeSource()}
${currentFootprintForwardHeadAgeNativeSource()}
public static class EasyedaFootprintForwardExecutionLimits {`);
  const withHeadAdmission = one(withHead, 'switch(action){', 'switch(action){\ncase "footprint-forward-head-main":case "footprint-forward-head-age-main":return;');
  let phase = withHeadAdmission.replaceAll("CreateFootprintForwardExecution209", "CreateFootprintForwardWriter209").replaceAll("ForwardExecutionMainBirth.V2", "ForwardExecutionMainBirth.WriterV1").replaceAll("ForwardExecutionBirth.V2", "ForwardExecutionBirth.WriterV1");
  phase = one(phase, "ForwardExecutionMainBirth { V2 }", "ForwardExecutionMainBirth { WriterV1 }");
  phase = one(phase, "ForwardExecutionBirth { V2 }", "ForwardExecutionBirth { WriterV1 }");
  phase = one(phase, "if(!forwardExecution||coldNormal<0", "if(forwardWriterBirth||!forwardExecution||coldNormal<0");
  phase = one(phase, "forwardExecution=true;footprintCreateClockPurpose=true;", "forwardWriterBirth=true;stockMainEligible=true;forwardExecution=true;footprintCreateClockPurpose=true;");
  const oldLimits = /public const int Requests=\d+,NormalRequests=\d+,NormalClass=\d+,CleanupClass=\d+;\npublic const int MainNormal=\d+,MainCleanup=\d+,MainRequests=\d+;/u;
  if ((phase.match(new RegExp(oldLimits, "gu")) ?? []).length !== 1) { throw new Error("FORWARD_WRITER_NATIVE_LIMITS"); }
  phase = phase.replace(oldLimits, `public const int Requests=${String(PROFILE.renderer.requestLimit)},NormalRequests=${String(PROFILE.renderer.requestLimit)},NormalClass=${String(PROFILE.renderer.normalClassLimit)},CleanupClass=${String(PROFILE.renderer.cleanupClassLimit)};\npublic const int MainNormal=${String(PROFILE.main.normalRequestLimit)},MainCleanup=${String(PROFILE.main.cleanupRequestLimit)},MainRequests=${String(PROFILE.main.requestLimit)};`);
  const headAgeAdmission = 'case "footprint-forward-head-main":case "footprint-forward-head-age-main":return;';
  const hasHeadAge = phase.includes(headAgeAdmission);
  const admission = hasHeadAge ? headAgeAdmission : 'case "footprint-forward-head-main":return;';
  phase = one(phase, admission, `${producerActions.map(action => `case "${action}":`).join("")}${admission}`);
  // This graph's typed constructor owns the larger limits. The old graph's
  // Profile smoke and actual45-request codec remain byte-identical.
  phase = one(phase, "normalLimit=EasyedaFootprintForwardExecutionLimits.MainNormal;", `normalLimit=${String(PROFILE.main.ordinaryNormalRequestLimit)};`);
  phase = one(phase, "value.normalLimit==87&&value.cleanupLimit==41&&value.normalLimit+value.cleanupLimit==128", `value.normalLimit==${String(PROFILE.main.ordinaryNormalRequestLimit)}&&value.cleanupLimit==${String(PROFILE.main.cleanupRequestLimit)}&&value.normalLimit+value.cleanupLimit==${String(PROFILE.main.ordinaryNormalRequestLimit + PROFILE.main.cleanupRequestLimit)}`);
  const cleanup = PROFILE.main.cleanupRequestLimit - COMPLETION.cleanup - 1, normal = PROFILE.main.ordinaryNormalRequestLimit - COMPLETION.normal;
  const consumed = normal + cleanup;
  phase = one(phase, "value.requests=52;value.normalRequests=42;value.cleanupRequests=10;value.RequireCompletionCapacity(52);\nNeed(value.requests==52&&value.normalRequests==42&&value.cleanupRequests==10,\"forward-execution-capacity-no-consume\");\nvalue.requests=53;value.cleanupRequests=11;bool refused=false;try{value.RequireCompletionCapacity(53);}", `value.requests=${String(consumed)};value.normalRequests=${String(normal)};value.cleanupRequests=${String(cleanup)};value.RequireCompletionCapacity(${String(consumed)});\nNeed(value.requests==${String(consumed)}&&value.normalRequests==${String(normal)}&&value.cleanupRequests==${String(cleanup)},"forward-execution-capacity-no-consume");\nvalue.requests=${String(consumed + 1)};value.cleanupRequests=${String(cleanup + 1)};bool refused=false;try{value.RequireCompletionCapacity(${String(consumed + 1)});}`);
  const producer = plannedNormalSenders(currentFootprintForwardWriterProducerNativeSource(), 3);
  const startup = currentFootprintForwardWriterStartupNativeSource();
  const sync = plannedNormalSenders(`${currentFootprintForwardWriterHistoryNativeSource()}\n${currentFootprintForwardWriterSyncNativeSource()}\n${currentFootprintForwardWriterFrontierNativeSource()}\n${CURRENT_FOOTPRINT_FORWARD_WRITER_RENDERER_CLASS_NATIVE}\n${CURRENT_FOOTPRINT_FORWARD_WRITER_CLOCK_NATIVE}`, 2);
  let driver = prune(one(oldDriver.source, "\n        default {throw 'pcb-diagnostic-action'}", `\n${headDispatch()}        default {throw 'pcb-diagnostic-action'}`), hasHeadAge).replaceAll("WorkerStartupFootprintForwardExecution209", "WorkerStartupFootprintForwardWriter209").replaceAll("CreateFootprintForwardExecution209", "CreateFootprintForwardWriter209");
  driver = installCurrentFootprintForwardWriterRequestGuard(driver);
  const visualStart = driver.indexOf("      # BEGIN GENERATED WINDOW FAILURE\n");
  const visualEnd = driver.indexOf("      # END GENERATED WINDOW FAILURE\n", visualStart);
  if (visualStart === -1 || visualEnd <= visualStart || driver.includes("      # BEGIN GENERATED WINDOW FAILURE\n", visualStart + 1)) { throw new Error("FORWARD_WRITER_NATIVE_VISUAL_SECTION"); }
  // The closed action roster has no visual allocation or capture action. Its
  // Unreachable visual failure projection need not occupy native source room.
  driver = `${driver.slice(0, visualStart)}      $windowFailure=$null\n${driver.slice(visualEnd + "      # END GENERATED WINDOW FAILURE\n".length)}`;
  const compileStart = driver.indexOf("if ($forwardExecutionCoreBytes -isnot");
  const compileEnd = driver.indexOf("Add-Type -TypeDefinition $graphNative\n", compileStart);
  if (compileStart === -1 || compileEnd <= compileStart) { throw new Error("FORWARD_WRITER_NATIVE_COMPILE"); }
  const compiledBytes = Buffer.byteLength(core) + Buffer.byteLength(phase) + Buffer.byteLength(producer) + Buffer.byteLength(startup) + Buffer.byteLength(sync) + 4;
  const compile = `${check("forwardWriterCoreBytes", "core", core)}${check("forwardWriterPhaseBytes", "phase", phase)}${check("forwardWriterProducerBytes", "producer", producer)}${check("forwardWriterStartupBytes", "startup", startup)}${check("forwardWriterSyncBytes", "sync", sync)}$graphDecoder=[Text.Encoding]::GetEncoding(20127,[Text.EncoderFallback]::ExceptionFallback,[Text.DecoderFallback]::ExceptionFallback)
$graphNative=$graphDecoder.GetString($forwardWriterCoreBytes)+"\`n"+$graphDecoder.GetString($forwardWriterPhaseBytes)+"\`n"+$graphDecoder.GetString($forwardWriterProducerBytes)+"\`n"+$graphDecoder.GetString($forwardWriterStartupBytes)+"\`n"+$graphDecoder.GetString($forwardWriterSyncBytes)
if ([Text.Encoding]::UTF8.GetByteCount($graphNative) -ne ${String(compiledBytes)} -or [Text.Encoding]::UTF8.GetByteCount($graphNative) -gt ${String(LIMITS.compiled)}) {throw 'forward-writer-compiled-size'}
Add-Type -TypeDefinition $graphNative
`;
  driver = driver.slice(0, compileStart) + compile + driver.slice(compileEnd + "Add-Type -TypeDefinition $graphNative\n".length);
  driver = one(driver, "    [EasyedaDiagnosticOwner]::VerifyFootprintForwardExecutionGraphSmoke()", "    [EasyedaDiagnosticOwner]::VerifyForwardWriterProducerSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterStartupSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterCacheSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterHistorySmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterSyncSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterFrontierSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterRendererClassSmoke()");
  driver = driver.replaceAll("easyeda-pro-control.footprint-forward-cold-execution-compile.v1", "easyeda-pro-control.footprint-forward-writer-compile.v1");
  driver = one(driver, "    [EasyedaDiagnosticOwner]::VerifyForwardWriterRendererClassSmoke()", "    [EasyedaDiagnosticOwner]::VerifyForwardWriterRendererClassSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterClockSmoke()");
  driver = one(driver, "    [EasyedaDiagnosticOwner]::VerifyForwardWriterClockSmoke()", "    [EasyedaDiagnosticOwner]::VerifyForwardWriterClockSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterPipeSmoke()");
  const rows = [["driver", "owner.ps1", driver, LIMITS.driver], ["core", "native-core.cs", core, LIMITS.core], ["phase", "native-phase.cs", phase, LIMITS.phase], ["producer", "native-producer.cs", producer, LIMITS.phase], ["startup", "native-startup.cs", startup, LIMITS.startup], ["sync", "native-sync.cs", sync, LIMITS.sync]] as const;
  const outputs = rows.map(([role, name, source, maximumBytes]) => {
    const bytes = Buffer.byteLength(source);
    if (bytes < 1 || bytes > maximumBytes || bytes > LIMITS.file || Buffer.from(source).some(value => value > 127)) { throw new Error(`FORWARD_WRITER_NATIVE_${role}`); }
    return Object.freeze({ role, source, bytes, maximumBytes, sha256: hash(source), relativePath: `scripts/footprint-forward-writer/${name}` });
  });
  if (compiledBytes > LIMITS.compiled || outputs.reduce((sum, row) => sum + row.bytes, 0) > LIMITS.aggregate) { throw new Error("FORWARD_WRITER_NATIVE_AGGREGATE"); }
  return Object.freeze(outputs);
}

/** Emit immutable runtime pins separately from the captured native programs. */
export function currentFootprintForwardWriterNativePins(outputs: readonly CurrentFootprintForwardWriterNativeOutput[]): string {
  const rows = outputs.map(({ source: _source, ...pin }) => pin);
  return `/** Generated by generate-footprint-forward-writer-native.ts. */\n/* oxlint-disable unicorn/numeric-separators-style -- Exact generated byte pins use canonical JSON. */\nexport const CURRENT_FOOTPRINT_FORWARD_WRITER_NATIVE_GRAPH = Object.freeze({\n  schema: "private.footprint-forward-writer-native-graph.v1",\n  aggregateBytes: ${String(outputs.reduce((sum, output) => sum + output.bytes, 0))},\n  files: Object.freeze(${JSON.stringify(rows, null, 2)}.map(value => Object.freeze(value))),\n});\n`;
}
