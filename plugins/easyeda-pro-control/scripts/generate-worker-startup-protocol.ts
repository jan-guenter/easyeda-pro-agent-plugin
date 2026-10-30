/* oxlint-disable import/max-dependencies -- This sole generator assembles independently bounded native protocol families and their exact purpose limits. */
import { readFile, writeFile } from "node:fs/promises";
import { currentPcbDiagnosticFixedTableNativeSource } from "../server/src/current-pcb-diagnostic-fixed-table-native.ts";
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
import { currentFootprintCopyMainTransportNativeSource } from "../server/src/current-footprint-copy-main-transport-native.ts";
import { currentFootprintCopyMainBackendNativeSource } from "../server/src/current-footprint-copy-main-backend-native.ts";
import { currentFootprintCopyMainRequestNativeSource } from "../server/src/current-footprint-copy-main-request-native.ts";
import { currentFootprintCopyMainCompletionNativeSource } from "../server/src/current-footprint-copy-main-completion-native.ts";
import { currentFootprintCombinedNativeLimits } from "../server/src/current-footprint-copy-combined-profile.ts";
import { currentFootprintCopyForwardNativeLimits } from "../server/src/current-footprint-copy-forward-profile.ts";
import { currentFootprintCombinedReadyNativeSource } from "../server/src/current-footprint-combined-ready.ts";
import { currentFootprintSavedCacheNativeSource } from "../server/src/current-footprint-saved-cache-native.ts";
import { currentFootprintSavedCacheAccessorNativeSource } from "../server/src/current-footprint-saved-cache-accessor-native.ts";
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

async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
  const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
  const source = await readFile(path, "utf8");
  let next = source;
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
  assertCurrentFootprintCopyExecutionWorkerNativeFields(next);
  if (Buffer.byteLength(next) > 1_048_576) { throw new Error(`Native startup helper exceeds its fixed byte bound: ${String(Buffer.byteLength(next))} >1048576`); }
  if (action === "--write") { await writeFile(path, next); }
  else if (next !== source) { throw new Error("Generated native startup protocol differs"); }
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
function footprintMainSource(): string {
  return `// BEGIN GENERATED FOOTPRINT MAIN TRANSPORT PROTOCOL\n${currentPcbDiagnosticFixedTableNativeSource()}\n${currentFootprintCombinedNativeLimits()}\n// BEGIN GENERATED FOOTPRINT FORWARD LIMITS\n${currentFootprintCopyForwardNativeLimits()}\n// END GENERATED FOOTPRINT FORWARD LIMITS\n${currentFootprintCopyMainTransportNativeSource()}\n${currentFootprintCopyMainBackendNativeSource()}\n${currentFootprintCopyMainRequestNativeSource()}\n${currentFootprintCopyMainCompletionNativeSource()}\n${currentFootprintSavedCacheNativeSource()}\n${currentFootprintSavedCacheAccessorNativeSource()}\n` +
    "// END GENERATED FOOTPRINT MAIN TRANSPORT PROTOCOL";
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only build command; never loaded by require().
await main();
