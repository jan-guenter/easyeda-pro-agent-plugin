import { applyCurrentSchematicRelevanceDisplayLibraryRefreshNativeFragment } from "../server/src/current-schematic-relevance-display-library-refresh-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplaySaveUploadNativeFragment } from "../server/src/current-schematic-relevance-display-save-upload-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplaySyncQuiesceNativeFragment } from "../server/src/current-schematic-relevance-display-sync-quiesce-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplayStructureNativeFragment } from "../server/src/current-schematic-relevance-display-structure-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplaySaveNativeFragment } from "../server/src/current-schematic-relevance-display-save-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplayMainNativeFragment } from "../server/src/current-schematic-relevance-display-main-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplayClockNativeFragment } from "../server/src/current-schematic-relevance-display-clock-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplayModifyEntryNativeFragment } from "../server/src/current-schematic-relevance-display-modify-entry-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplayActionNativeFragment } from "../server/src/current-schematic-relevance-display-action-native-fragment.ts";
import { applyCurrentSchematicWireEditNativeFragment, normalizeCurrentSchematicWireEditNativeFamily, prepareCurrentSchematicWireEditNativeSwitch } from "../server/src/current-schematic-wire-edit-native-fragment.ts";
import { applyCurrentSchematicRelevanceDisplayWriteNativeFragment, normalizeCurrentSchematicRelevanceDisplayNativeFamily, prepareCurrentSchematicRelevanceDisplayNativeSwitch } from "../server/src/current-schematic-relevance-display-write-native-fragment.ts";
/* oxlint-disable import/max-dependencies -- This sole generator assembles independently bounded native protocol families and their exact purpose limits. */
import { currentPcbDiagnosticCSharpReviewSource, expandCurrentPcbDiagnosticCSharpReviewSource, packCurrentPcbDiagnosticCSharpReviewStorage } from "../server/src/current-pcb-diagnostic-csharp-review-storage.ts";
import { applyCurrentPcbViaObservedSourceNativeFragment } from "../server/src/current-pcb-via-observed-source-native-fragment.ts";
import { applyCurrentPcbViaSaveDrainNativeFragment } from "../server/src/current-pcb-via-save-drain-native-fragment.ts";
import { applyCurrentPcbViaPostHistorySyncNativeFragment } from "../server/src/current-pcb-via-post-history-sync-native-fragment.ts";
import { applyCurrentPcbViaSaveTailObservationNativeFragment } from "../server/src/current-pcb-via-save-tail-observation-native-fragment.ts";
import { applyCurrentPcbViaUploadRequestNativeFragment } from "../server/src/current-pcb-via-upload-request-native-fragment.ts";
import { applyCurrentProjectSyncQuiesceNativeFragment } from "../server/src/current-project-sync-quiesce-native-fragment.ts";
import { applyCurrentPcbViaLocalUploadNativeFragment } from "../server/src/current-pcb-via-local-upload-native-fragment.ts";
import { applyCurrentPcbViaSaveGenerationNativeFragment } from "../server/src/current-pcb-via-save-generation-native-fragment.ts";
import { applyCurrentGeneratedPeriodicSyncNativeFragment } from "../server/src/current-generated-periodic-sync-native-fragment.ts";
import { applyCurrentGeneratedInitialSyncNativeFragment } from "../server/src/current-generated-initial-sync-native-fragment.ts";
import { applyCurrentGeneratedInitialCacheNativeFragment } from "../server/src/current-generated-initial-cache-native-fragment.ts";
import { applyCurrentFootprintInverseNativeFragment, prepareCurrentFootprintInverseNativeSwitch } from "../server/src/current-footprint-inverse-native-fragment.ts";
import { applyCurrentProjectSaveProducerNativeFragment } from "../server/src/current-project-save-producer-native-fragment.ts";
import { applyCurrentProjectSaveProducerGuardNativeFragment } from "../server/src/current-project-save-producer-guard-native-fragment.ts";
import { applyCurrentPcbViaSavedReadbackNativeFragment, prepareCurrentPcbViaSavedReadbackNativeSwitch } from "../server/src/current-pcb-via-saved-readback-native-fragment.ts";
import { applyCurrentPcbComponentSpatialNativeFragment, prepareCurrentPcbComponentSpatialNativeSwitch } from "../server/src/current-pcb-component-spatial-native-fragment.ts";
import { applyCurrentProjectStructureTransportNativeFragment } from "../server/src/current-project-structure-transport-native-fragment.ts";
import { readFile, writeFile } from "node:fs/promises";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES } from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";
import { currentPcbDiagnosticFixedTableNativeSource } from "../server/src/current-pcb-diagnostic-fixed-table-native.ts";
import { applyCurrentProjectStructureNativeFragment } from "../server/src/current-project-structure-native-fragment.ts";
import { applyCurrentSchematicDisplayWriteNativeFragment } from "../server/src/current-schematic-display-write-native-fragment.ts";
import { applyCurrentPcbViaWriteNativeFragment } from "../server/src/current-pcb-via-write-native-fragment.ts";
import { applyManagedFixtureRegistrationNativeFragment } from "../server/src/managed-fixture-registration-native-fragment.ts";
import { compactGeneratedCSharpIndentation } from "./csharp-generated-indentation.ts";
import { currentFootprintCopyManagerRouteNativeSource } from "../server/src/current-footprint-copy-manager-route-native.ts";
import { currentFootprintCopyUiNativeSource } from "../server/src/current-footprint-copy-ui-native.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE as footprint } from "../server/src/current-footprint-copy-preparation-profile.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as execution } from "../server/src/current-footprint-copy-execution-profile.ts";
import { currentFootprintCopyParentNativeSource } from "../server/src/current-footprint-copy-parent-native.ts";
import { currentFootprintCacheConstructionNativeSource } from "../server/src/current-footprint-copy-cache-construction-native.ts";
import { currentFootprintCopySavedNativeSource } from "../server/src/current-footprint-copy-saved-native.ts";
import { currentFootprintCopyClockRegistrationNativeSource } from "../server/src/current-footprint-copy-clock-registration-native.ts";
import { currentFootprintCopyClockRpcNativeSource } from "../server/src/current-footprint-copy-clock-rpc-native.ts";
import { currentFootprintCopyAllocationNativeSource } from "../server/src/current-footprint-copy-allocation-native.ts";
import { currentFootprintCopyAllocatedCreateClockNativeSource, currentFootprintCopyCreateClockNativeSource, currentFootprintCopyNativeCreateNativeSource } from "../server/src/current-footprint-copy-native-create-native.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS as clockRpcRequests } from "../server/src/current-footprint-copy-clock-rpc-protocol.ts";
import { currentFootprintHeadAgeNativeSource } from "../server/src/current-footprint-head-age-native.ts";
import { currentFootprintCopyMainTransportNativeSource } from "../server/src/current-footprint-copy-main-transport-native.ts";
import { currentFootprintCopyMainBackendNativeSource } from "../server/src/current-footprint-copy-main-backend-native.ts";
import { currentFootprintCopyMainRequestNativeSource } from "../server/src/current-footprint-copy-main-request-native.ts";
import { currentFootprintCopyMainCompletionNativeSource } from "../server/src/current-footprint-copy-main-completion-native.ts";
import { currentFootprintCombinedNativeLimits } from "../server/src/current-footprint-copy-combined-profile.ts";
import { assertCurrentFootprintCopyForwardNativeRequestIds, currentFootprintCopyForwardNativeLimits } from "../server/src/current-footprint-copy-forward-profile.ts";
import { currentFootprintCombinedReadyNativeSource } from "../server/src/current-footprint-combined-ready.ts";
import { currentFootprintSavedCacheNativeSource } from "../server/src/current-footprint-saved-cache-native.ts";
import { currentFootprintSavedCacheAccessorNativeSource } from "../server/src/current-footprint-saved-cache-accessor-native.ts";
import { currentFootprintSavedCacheHeldNativeSource } from "../server/src/current-footprint-saved-cache-held-native.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS as clockRegistration } from "../server/src/current-footprint-copy-clock-registration-runner.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE as saved } from "../server/src/current-footprint-copy-saved-profile.ts";
import { currentFootprintCopyTransactionClockNativeSource } from "../server/src/current-footprint-copy-transaction-clock-native.ts";
import { assertCurrentFootprintCopyExecutionWorkerNativeFields, currentFootprintCopyExecutionWorkerNativeSource } from "../server/src/current-footprint-copy-execution-worker-native.ts";
import { currentPcbWorkerStartupNativeSource } from "../server/src/current-pcb-worker-startup-native.ts";
import { currentPcb209EmptyNativeSource } from "../server/src/current-pcb-209-empty-native.ts";
import { currentPcb209RatlineNativeSource } from "../server/src/current-pcb-209-ratline-native.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as ratline } from "../server/src/current-pcb-209-ratline-budget.ts";
import { CURRENT_PCB_209_RATLINE_INSTALLATION_PROFILE as installation } from "../server/src/current-pcb-209-ratline-installation-profile.ts";
import { currentPcb209RatlineContinuationNativeSource } from "../server/src/current-pcb-209-ratline-continuation-native.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE as continuation } from "../server/src/current-pcb-209-ratline-continuation-budget.ts";

const quote = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
function installationSource(): string {
  const files = installation.installedFiles;
  return `public static class EasyedaRatline209Installation {
  public const int FileCount=${String(files.length + 1)};
  static readonly string[] RelativePaths={${files.map(pin => quote(pin.relativePath.replaceAll("/", "\\"))).join(",")}};
  static readonly long[] Sizes={${files.map(pin => `${String(pin.bytes)}L`).join(",")}};
  static readonly string[] Hashes={${files.map(pin => quote(pin.sha256)).join(",")}};
  static void Need(bool value) {if(!value)throw new System.InvalidOperationException("pcb-diagnostic-ratline-installation-plan");}
  public static void Validate(string[] paths,long[] sizes,string[] hashes) {
    Need(paths!=null && sizes!=null && hashes!=null && paths.Length==FileCount && sizes.Length==FileCount && hashes.Length==FileCount);
    foreach(string path in paths)EasyedaDiagnosticInstallation.ValidatePath(path);
    string assets=System.IO.Path.Combine(System.IO.Path.GetDirectoryName(paths[0]),@"resources\\app\\assets");
    for(int index=0;index<RelativePaths.Length;index++) {
      int slot=index<4?index:index+1;
      Need(paths[slot]==System.IO.Path.GetFullPath(System.IO.Path.Combine(assets,RelativePaths[index])) && sizes[slot]==Sizes[index] && hashes[slot]==Hashes[index]);
    }
    Need(paths[4]==@"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe");
  }
  public static void VerifySmoke() {
    string[] paths=new string[FileCount],hashes=new string[FileCount];long[] sizes=new long[FileCount];
    for(int index=0;index<RelativePaths.Length;index++) {
      int slot=index<4?index:index+1;paths[slot]=System.IO.Path.GetFullPath(System.IO.Path.Combine(@"C:\\Synthetic\\Easyeda\\resources\\app\\assets",RelativePaths[index]));sizes[slot]=Sizes[index];hashes[slot]=Hashes[index];
    }
    paths[4]=@"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";sizes[4]=1;hashes[4]=new string('a',64);Validate(paths,sizes,hashes);
    for(int index=5;index<FileCount;index++) {
      sizes[index]++;bool refused=false;try{Validate(paths,sizes,hashes);}catch(System.InvalidOperationException){refused=true;}
      Need(refused);sizes[index]--;
    }
  }
}`;
}

function ratlineSource(): string {
  const limits = { RequestLimit: ratline.requestLimit, NormalRequestLimit: ratline.normalRequestLimit, CleanupRequestLimit: ratline.cleanupRequests,
    NormalByteLimit: ratline.bytes.normal, TotalByteLimit: ratline.bytes.total, NormalPollLimit: ratline.polling.normalLimit, PollLimit: ratline.polling.limit,
    HelperControlLimit: ratline.helperControlMessages, HelperStdoutByteLimit: ratline.bytes.helperStdout,
    NormalMilliseconds: ratline.elapsed.normalMilliseconds, TotalMilliseconds: ratline.elapsed.totalMilliseconds };
  return `// BEGIN GENERATED WORKER STARTUP RATLINE209 PROTOCOL\n${currentPcb209RatlineNativeSource()}\n` +
    `public static class EasyedaRatline209Limits {\n${Object.entries(limits).map(([key, value]) => `  public const long ${key}=${String(value)}L;`).join("\n")}\n}\n${installationSource()}\n` +
    "// END GENERATED WORKER STARTUP RATLINE209 PROTOCOL";
}

/** Regenerate or verify each uniquely delimited native protocol block using only
 * fixed builders. Refuse duplicate markers, changed worker fields or a helper over
 * the fixed first-party helper-source ceiling before writing; check mode never changes the helper.
 */
async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
  const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
  const source = await readFile(path, "utf8");
  const next = generateWorkerStartupProtocol(source);
  const reviewPath = new URL("pcb-diagnostic-native.cs", import.meta.url); const compilerInput = currentPcbDiagnosticCSharpReviewSource(next);
  if (action === "--write") { await writeFile(path, next); await writeFile(reviewPath, compilerInput); }
  else if (next !== source || await readFile(reviewPath, "utf8") !== compilerInput) { throw new Error("Generated native startup protocol or review copy differs"); }
}
/** Pure complete composition, used by repeated-generation regressions without writing a helper. */
export function generateWorkerStartupProtocol(source: string): string {
  const original = normalizeCurrentSchematicWireEditNativeFamily(expandCurrentPcbDiagnosticCSharpReviewSource(source));
  const normalized = normalizeCurrentSchematicRelevanceDisplayNativeFamily(original);
  const literal = prepareCurrentSchematicWireEditNativeSwitch(prepareCurrentSchematicRelevanceDisplayNativeSwitch(normalized));
  let next = prepareCurrentPcbViaSavedReadbackNativeSwitch(prepareCurrentPcbComponentSpatialNativeSwitch(prepareCurrentFootprintInverseNativeSwitch(literal)));
  for (const [name, generated] of [["WORKER STARTUP", currentPcbWorkerStartupNativeSource()],
    ["WORKER STARTUP EMPTY209", currentPcb209EmptyNativeSource()],
    ["WORKER STARTUP RATLINE209", ratlineSource()],
    ["WORKER STARTUP RATLINE CONTINUATION209", continuationSource()],
    ["FOOTPRINT COPY PREPARATION", footprintSource()], ["FOOTPRINT COPY EXECUTION", footprintExecutionSource()],
    ["FOOTPRINT COPY SAVED", footprintSavedSource()], ["FOOTPRINT MAIN TRANSPORT", footprintMainSource()]] as const) {
    const begin = `// BEGIN GENERATED ${name} PROTOCOL`, end = `// END GENERATED ${name} PROTOCOL`;
    const start = next.indexOf(begin), stop = next.indexOf(end);
    if (start === -1 || stop < start || next.includes(begin, start + begin.length) || next.includes(end, stop + end.length)) {
      throw new Error("Native startup protocol markers must occur once");
    }
    next = next.slice(0, start) + compactGeneratedCSharpIndentation(generated) + next.slice(stop + end.length);
  }
  const readyBegin = "  # BEGIN GENERATED FOOTPRINT COMBINED READY", readyEnd = "  # END GENERATED FOOTPRINT COMBINED READY";
  const readyStart = next.indexOf(readyBegin), readyStop = next.indexOf(readyEnd);
  if (readyStart === -1 || readyStop < readyStart || next.includes(readyBegin, readyStart + readyBegin.length) || next.includes(readyEnd, readyStop + readyEnd.length)) {
    throw new Error("Native combined readiness markers must occur once");
  }
  next = next.slice(0, readyStart) + currentFootprintCombinedReadyNativeSource() + next.slice(readyStop + readyEnd.length);
  next = applyCurrentProjectStructureNativeFragment(next);
  next = applyManagedFixtureRegistrationNativeFragment(next);
  next = applyCurrentProjectStructureTransportNativeFragment(applyCurrentSchematicDisplayWriteNativeFragment(applyCurrentPcbViaWriteNativeFragment(next)));
  next = applyCurrentGeneratedInitialCacheNativeFragment(applyCurrentProjectSaveProducerNativeFragment(applyCurrentProjectSaveProducerGuardNativeFragment(next)));
  next = applyCurrentGeneratedInitialSyncNativeFragment(next);
  next = applyCurrentGeneratedPeriodicSyncNativeFragment(next);
  next = applyCurrentPcbViaSaveGenerationNativeFragment(next);
  next = applyCurrentPcbViaLocalUploadNativeFragment(next);
  next = applyCurrentProjectSyncQuiesceNativeFragment(next);
  next = applyCurrentPcbViaUploadRequestNativeFragment(next);
  next = applyCurrentPcbViaSaveTailObservationNativeFragment(next);
  next = applyCurrentPcbViaPostHistorySyncNativeFragment(next);
  next = applyCurrentPcbViaSaveDrainNativeFragment(next);
  next = applyCurrentPcbViaObservedSourceNativeFragment(next);
  next = applyCurrentPcbComponentSpatialNativeFragment(next);
  next = applyCurrentPcbViaSavedReadbackNativeFragment(next);
  next = applyCurrentFootprintInverseNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplayWriteNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplayActionNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplayModifyEntryNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplayClockNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplaySyncQuiesceNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplayLibraryRefreshNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplayMainNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplayStructureNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplaySaveNativeFragment(next);
  next = applyCurrentSchematicRelevanceDisplaySaveUploadNativeFragment(next);
  next = applyCurrentSchematicWireEditNativeFragment(next);
  assertCurrentFootprintCopyExecutionWorkerNativeFields(next);
  assertCurrentFootprintCopyForwardNativeRequestIds(next);
  next = packCurrentPcbDiagnosticCSharpReviewStorage(next);
  if (Buffer.byteLength(next) > CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES) {
    throw new Error(`Native startup helper exceeds its fixed byte bound: ${String(Buffer.byteLength(next))} >${String(CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES)}`);
  }
  return next;
}
function continuationSource(): string {
  const limits = { RequestLimit: continuation.requestLimit, NormalRequestLimit: continuation.normalRequestLimit, CleanupRequestLimit: continuation.cleanupRequests,
    NormalByteLimit: continuation.bytes.normal, TotalByteLimit: continuation.bytes.total, NormalPollLimit: continuation.polling.normalLimit, PollLimit: continuation.polling.limit,
    HelperControlLimit: continuation.helperControlMessages, HelperStdoutByteLimit: continuation.bytes.helperStdout,
    NormalMilliseconds: continuation.elapsed.normalMilliseconds, TotalMilliseconds: continuation.elapsed.totalMilliseconds };
  return `// BEGIN GENERATED WORKER STARTUP RATLINE CONTINUATION209 PROTOCOL\n${currentPcb209RatlineContinuationNativeSource()}\n` +
    `public static class EasyedaRatlineContinuation209Limits {\n${Object.entries(limits).map(([key, value]) => `  public const long ${key}=${String(value)}L;`).join("\n")}\n}\n` +
    "// END GENERATED WORKER STARTUP RATLINE CONTINUATION209 PROTOCOL";
}
function footprintSource(): string {
  return `// BEGIN GENERATED FOOTPRINT COPY PREPARATION PROTOCOL\n${currentFootprintCopyUiNativeSource()}\n${currentFootprintCopyManagerRouteNativeSource()}\n` +
    `public static class EasyedaFootprintPreparationLimits { public const int Requests=${String(footprint.requestLimit)}; public const int NormalRequests=${String(footprint.normalRequestLimit)}; public const long NormalMilliseconds=${String(footprint.normalMilliseconds)}L; public const long TotalMilliseconds=${String(footprint.normalMilliseconds + footprint.cleanupMilliseconds)}L; }\n` +
    "// END GENERATED FOOTPRINT COPY PREPARATION PROTOCOL";
}
function footprintExecutionSource(): string {
  return `// BEGIN GENERATED FOOTPRINT COPY EXECUTION PROTOCOL\n${currentFootprintCopyTransactionClockNativeSource()}\n${currentFootprintCopyExecutionWorkerNativeSource()}\n${currentFootprintCopyParentNativeSource()}\n${currentFootprintCacheConstructionNativeSource()}\n${currentFootprintCopyClockRegistrationNativeSource()}\n${currentFootprintCopyClockRpcNativeSource()}\n${currentFootprintCopyNativeCreateNativeSource()}\n${currentFootprintCopyCreateClockNativeSource()}\n${currentFootprintCopyAllocatedCreateClockNativeSource()}\n${currentFootprintCopyAllocationNativeSource()}\n` +
    `public static class EasyedaFootprintExecutionLimits { public const int Requests=${String(execution.requestLimit)}; public const int NormalRequests=${String(execution.normalRequestLimit)}; public const int ClockRequests=11; public const int RpcNormal=${String(clockRpcRequests.normal)}; public const int RpcCleanup=${String(clockRpcRequests.cleanup)}; public const int RpcRequests=${String(clockRpcRequests.total)}; public const int ParentRequests=${String(execution.requests.parentNative)}; public const int CacheRequests=${String(execution.requests.cacheConstructionNative)}; public const int RegistrationRequests=${String(clockRegistration.total)}; public const long NormalMilliseconds=${String(execution.normalMilliseconds)}L; public const long TotalMilliseconds=${String(execution.normalMilliseconds + execution.cleanupMilliseconds)}L; }\n` +
    "// END GENERATED FOOTPRINT COPY EXECUTION PROTOCOL";
}
function footprintSavedSource(): string {
  return `// BEGIN GENERATED FOOTPRINT COPY SAVED PROTOCOL\n${currentFootprintCopySavedNativeSource()}\n` +
    `public static class EasyedaFootprintSavedLimits { public const int Requests=${String(saved.requestLimit)}; public const int NormalRequests=${String(saved.normalRequestLimit)}; public const long NormalMilliseconds=${String(saved.normalMilliseconds)}L; public const long TotalMilliseconds=${String(saved.normalMilliseconds + saved.cleanupMilliseconds)}L; }\n` +
    "// END GENERATED FOOTPRINT COPY SAVED PROTOCOL";
}
/** Assemble the main-transport block with its separate combined/forward limits,
 * fixed codecs and cache diagnostics. Generation adds no launch, request or writer
 * authority and does not merge their runtime grammars.
 */
function footprintMainSource(): string {
  return `// BEGIN GENERATED FOOTPRINT MAIN TRANSPORT PROTOCOL\n${currentPcbDiagnosticFixedTableNativeSource()}\n${currentFootprintCombinedNativeLimits()}\n// BEGIN GENERATED FOOTPRINT FORWARD LIMITS\n${currentFootprintCopyForwardNativeLimits()}\n// END GENERATED FOOTPRINT FORWARD LIMITS\n${currentFootprintCopyMainTransportNativeSource()}\n${currentFootprintCopyMainBackendNativeSource()}\n${currentFootprintHeadAgeNativeSource()}\n${currentFootprintCopyMainRequestNativeSource()}\n${currentFootprintCopyMainCompletionNativeSource()}\n${currentFootprintSavedCacheNativeSource()}\n${currentFootprintSavedCacheAccessorNativeSource()}\n${currentFootprintSavedCacheHeldNativeSource()}\n` +
    "// END GENERATED FOOTPRINT MAIN TRANSPORT PROTOCOL";
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only build command; never loaded by require().
if (import.meta.main) { await main(); }
