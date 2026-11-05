/** Fixed NEW-purpose artifact custody. Each complete read follows the same
 * original descriptor/path tuple; this source graph grants no native owner. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH as GRAPH } from "./current-footprint-forward-native-graph-pins.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH_LIMITS as LIMITS } from "./current-footprint-forward-native-limits.ts";

const hash = (input: Uint8Array): string => createHash("sha256").update(input).digest("hex");
type Identity = Stats;
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_NATIVE_GRAPH_SOURCE"); } }
function same(first: Identity, current: Identity): boolean {
  return first.dev === current.dev && first.ino === current.ino && first.size === current.size && first.mtimeMs === current.mtimeMs && first.ctimeMs === current.ctimeMs && first.mode === current.mode && current.nlink === 1;
}
async function readRole(relativePath: string, bytes: number, sha256: string, maximumBytes: number, original?: Identity): Promise<Identity> {
  const path = fileURLToPath(new URL(`../../${relativePath}`, import.meta.url));
  const named = await lstat(path);
  need(named.isFile() && !named.isSymbolicLink() && named.nlink === 1 && named.size === bytes && bytes > 0 && bytes <= maximumBytes && bytes <= LIMITS.file);
  // oxlint-disable-next-line eslint/no-bitwise -- Nonblocking open prevents a lstat-to-open FIFO replacement from hanging before descriptor admission.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat(); need(before.isFile() && named.isFile() && !named.isSymbolicLink() && named.nlink === 1 && same(named, before) &&
      (original === undefined || same(original, before)) && before.size === bytes && bytes > 0 && bytes <= maximumBytes && bytes <= LIMITS.file && await realpath(path) === path);
    const buffer = Buffer.alloc(bytes + 1); let offset = 0;
    while (offset < buffer.length) { const read = await file.read(buffer, offset, buffer.length - offset, null); if (read.bytesRead === 0) { break; } offset += read.bytesRead; }
    const after = await file.stat(), final = await lstat(path);
    need(offset === bytes && same(before, after) && same(before, final) && !final.isSymbolicLink() && hash(buffer.subarray(0, offset)) === sha256 && !buffer.subarray(0, offset).some(byte => byte > 127)); return before;
  } finally { await file.close(); }
}
export interface CurrentFootprintForwardNativeGraphCapture { readonly verify: () => Promise<void>; readonly bootstrap: string }
/** Reprove all exact roles and generate a short fixed Windows loader. Open
 * FileShare.Read handles remain retained until the captured driver exits. */
export async function captureCurrentFootprintForwardNativeGraph(distribution: string | undefined, challenge: string): Promise<CurrentFootprintForwardNativeGraphCapture> {
  need(/^[a-f\d]{32}$/u.test(challenge) && GRAPH.files.length === 3 && GRAPH.files.map(file => file.role).join(",") === "driver,core,phase" &&
    GRAPH.aggregateBytes === GRAPH.files.reduce((sum, file) => sum + file.bytes, 0) && GRAPH.aggregateBytes <= LIMITS.aggregate);
  const identities: Identity[] = [], windowsPaths: string[] = [];
  for (const file of GRAPH.files) {
    identities.push(await readRole(file.relativePath, file.bytes, file.sha256, file.maximumBytes));
    const path = fileURLToPath(new URL(`../../${file.relativePath}`, import.meta.url));
    if (/^\/mnt\/[a-z]\//u.test(path)) { windowsPaths.push(`${path[5]?.toUpperCase()}:\\${path.slice(7).replaceAll("/", "\\")}`); }
    else { need(distribution !== undefined && /^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(distribution)); windowsPaths.push(`\\\\wsl.localhost\\${distribution}${path.replaceAll("/", "\\")}`); }
  }
  const verify = async (): Promise<void> => {
    for (const [index, file] of GRAPH.files.entries()) { const identity = identities[index]; need(identity !== undefined); await readRole(file.relativePath, file.bytes, file.sha256, file.maximumBytes, identity); }
  };
  let bootstrap = "$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';$graphFiles=New-Object 'System.Collections.Generic.List[System.IO.FileStream]';try{";
  for (const [index, file] of GRAPH.files.entries()) {
    const path = windowsPaths[index]; need(path !== undefined);
    bootstrap += `$f=[IO.File]::Open('${path.replaceAll("'", "''")}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);$graphFiles.Add($f);if($f.Length -ne ${String(file.bytes)} -or $f.Length -gt ${String(file.maximumBytes)}){throw 'forward-graph-size'};$b${String(index)}=New-Object byte[] ([int]$f.Length);$o=0;while($o -lt $f.Length){$n=$f.Read($b${String(index)},$o,$b${String(index)}.Length-$o);if($n -le 0){throw 'forward-graph-eof'};$o+=$n};if($f.ReadByte() -ne -1){throw 'forward-graph-grew'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($b${String(index)}))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne '${file.sha256}'){throw 'forward-graph-hash'};`;
  }
  bootstrap += `$forwardExecutionCoreBytes=$b1;$forwardExecutionPhaseBytes=$b2;$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($b0))) -WorkerStartupFootprintForwardExecution209 -CombinedReadyChallenge '${challenge}'}finally{foreach($f in $graphFiles){$f.Dispose()}}`;
  need(Buffer.from(bootstrap, "utf16le").toString("base64").length <= LIMITS.bootstrapEncoded);
  return Object.freeze({ verify, bootstrap });
}
