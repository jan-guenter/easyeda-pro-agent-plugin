import { readFile, writeFile } from "node:fs/promises";
import { currentPcbWorkerStartupNativeSource } from "../server/src/current-pcb-worker-startup-native.ts";
import { currentPcb209EmptyNativeSource } from "../server/src/current-pcb-209-empty-native.ts";
import { currentPcb209RatlineNativeSource } from "../server/src/current-pcb-209-ratline-native.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as ratline } from "../server/src/current-pcb-209-ratline-budget.ts";
import { CURRENT_PCB_209_RATLINE_INSTALLATION_PROFILE as installation } from "../server/src/current-pcb-209-ratline-installation-profile.ts";

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
    ["WORKER STARTUP RATLINE209", ratlineSource()]] as const) {
    const begin = `// BEGIN GENERATED ${name} PROTOCOL`, end = `// END GENERATED ${name} PROTOCOL`;
    const start = next.indexOf(begin), stop = next.indexOf(end);
    if (start === -1 || stop < start || next.includes(begin, start + begin.length) || next.includes(end, stop + end.length)) {
      throw new Error("Native startup protocol markers must occur once");
    }
    next = next.slice(0, start) + generated + next.slice(stop + end.length);
  }
  if (Buffer.byteLength(next) > 1_048_576) { throw new Error("Native startup helper exceeds its fixed byte bound"); }
  if (action === "--write") { await writeFile(path, next); }
  else if (next !== source) { throw new Error("Generated native startup protocol differs"); }
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only build command; never loaded by require().
await main();
