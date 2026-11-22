/** Exact seven-role custody for the distinct writer birth. No caller path or
 * program may select a role or replace its generated source/hash tuple. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { powershellSingleQuotedBody } from "./powershell-single-quoted-body.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_NATIVE_GRAPH as GRAPH } from "./current-footprint-forward-writer-complete-native-pins.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_NATIVE_GRAPH_LIMITS as LIMITS } from "./current-footprint-forward-writer-complete-native-limits.ts";

const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
/** Keep failures fixed; caller paths and arbitrary native exceptions stay out. */
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_WRITER_NATIVE_GRAPH_SOURCE"); } }
/** Compare the complete original descriptor tuple after every bounded read. */
function same(first: Stats, second: Stats): boolean {
  return first.dev === second.dev && first.ino === second.ino && first.size === second.size && first.mtimeMs === second.mtimeMs && first.ctimeMs === second.ctimeMs && first.mode === second.mode && second.nlink === 1;
}
/** Read the generated role through its own admitted descriptor to exact EOF. */
async function readRole(index: number, original?: Stats): Promise<Stats> {
  const role = GRAPH.files[index]; need(role !== undefined);
  const path = fileURLToPath(new URL(`../../${role.relativePath}`, import.meta.url));
  const named = await lstat(path);
  need(named.isFile() && !named.isSymbolicLink() && named.nlink === 1 && named.size === role.bytes && role.bytes > 0 && role.bytes <= role.maximumBytes && role.bytes <= LIMITS.file);
  // oxlint-disable-next-line eslint/no-bitwise -- A replaced FIFO must not block before descriptor admission.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat(); need(before.isFile() && same(named, before) && (original === undefined || same(original, before)) && await realpath(path) === path);
    const bytes = Buffer.alloc(role.bytes + 1); let offset = 0;
    while (offset < bytes.length) { const next = await file.read(bytes, offset, bytes.length - offset, null); if (next.bytesRead === 0) { break; } offset += next.bytesRead; }
    const after = await file.stat(), final = await lstat(path);
    need(offset === role.bytes && same(before, after) && same(before, final) && !final.isSymbolicLink() && hash(bytes.subarray(0, offset)) === role.sha256 && !bytes.subarray(0, offset).some(byte => byte > 127));
    return before;
  } finally { await file.close(); }
}
/** Retain all fixed role identities and prepare the challenge-bound loader. */
export async function captureCurrentFootprintForwardWriterCompleteNativeGraph(distribution: string | undefined, challenge: string): Promise<Readonly<{ verify: () => Promise<void>; bootstrap: string }>> {
  need(/^[a-f0-9]{32}$(?![\s\S])/u.test(challenge) && GRAPH.files.map(role => role.role).join(",") === "driver,core,phase,producer,startup,sync,tail" && GRAPH.aggregateBytes === GRAPH.files.reduce((sum, role) => sum + role.bytes, 0) && GRAPH.aggregateBytes <= LIMITS.aggregate);
  const identities: Stats[] = [], paths: string[] = [];
  for (const [index, role] of GRAPH.files.entries()) {
    identities.push(await readRole(index));
    const path = fileURLToPath(new URL(`../../${role.relativePath}`, import.meta.url));
    if (/^\/mnt\/[a-z]\//u.test(path)) { paths.push(`${path[5]?.toUpperCase()}:\\${path.slice(7).replaceAll("/", "\\")}`); }
    else { need(distribution !== undefined && /^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$(?![\s\S])/u.test(distribution)); paths.push(`\\\\wsl.localhost\\${distribution}${path.replaceAll("/", "\\")}`); }
  }
  const verify = async (): Promise<void> => { for (const [index] of GRAPH.files.entries()) { const original = identities[index]; need(original !== undefined); await readRole(index, original); } };
  let bootstrap = "$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';" +
    "$writerGraphFiles=New-Object 'System.Collections.Generic.List[System.IO.FileStream]';" +
    "function Read-WriterGraphRole([string]$path,[int]$length,[int]$maximum,[string]$expectedHash){" +
    "$f=[IO.File]::Open($path,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);$writerGraphFiles.Add($f);" +
    "if($f.Length -ne $length -or $f.Length -gt $maximum){throw 'forward-writer-graph-size'};" +
    "$bytes=New-Object byte[] $length;$offset=0;while($offset -lt $length){" +
    "$count=$f.Read($bytes,$offset,$length-$offset);if($count -le 0){throw 'forward-writer-graph-eof'};$offset+=$count};" +
    "if($f.ReadByte() -ne -1){throw 'forward-writer-graph-grew'};" +
    "$hash=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()};" +
    "if($digest -cne $expectedHash){throw 'forward-writer-graph-hash'};return ,$bytes};try{";
  for (const [index, role] of GRAPH.files.entries()) {
    const path = paths[index]; need(path !== undefined);
    bootstrap += `$b${String(index)}=Read-WriterGraphRole '${powershellSingleQuotedBody(path)}' ${String(role.bytes)} ${String(role.maximumBytes)} '${role.sha256}';`;
  }
  bootstrap += `$forwardWriterCoreBytes=$b1;$forwardWriterPhaseBytes=$b2;$forwardWriterProducerBytes=$b3;$forwardWriterStartupBytes=$b4;$forwardWriterSyncBytes=$b5;$forwardWriterTailBytes=$b6;$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($b0))) -WorkerStartupFootprintForwardWriterComplete209 -CombinedReadyChallenge '${challenge}'}finally{foreach($f in $writerGraphFiles){$f.Dispose()}}`;
  const encodedCharacters=Buffer.from(bootstrap,"utf16le").toString("base64").length;
  if(encodedCharacters>LIMITS.bootstrapEncoded){throw new Error(`FORWARD_COMPLETE_BOOTSTRAP_ENCODED_${String(encodedCharacters)}_GT_${String(LIMITS.bootstrapEncoded)}`);}
  return Object.freeze({verify,bootstrap});
}
