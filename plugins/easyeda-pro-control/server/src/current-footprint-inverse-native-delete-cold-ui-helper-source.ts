/** Exact fixed-purpose helper custody only. Capturing source grants no native
 * owner, app launch, journal recovery or continuation of another generation. */
import { powershellSingleQuotedBody } from "./powershell-single-quoted-body.ts";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_HELPER_IDENTITY as IDENTITY } from "./current-footprint-inverse-native-delete-cold-ui-helper-identity.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_HELPER_PROFILE as PROFILE} from "./current-footprint-inverse-native-delete-cold-ui-helper-profile.ts";
import {currentPcbDiagnosticCSharpReviewSource,currentPcbDiagnosticCSharpRuntimeCompilerInput} from "./current-pcb-diagnostic-csharp-review-storage.ts";

const MAXIMUM=PROFILE.helperMaxBytes;

function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_HELPER_SOURCE"); } }
function same(first: Stats, last: Stats): boolean {
  return first.dev === last.dev && first.ino === last.ino && first.size === last.size && first.mode === last.mode && first.mtimeMs === last.mtimeMs && first.ctimeMs === last.ctimeMs && last.nlink === 1;
}
async function read(original?: Stats): Promise<Stats> {
  need(IDENTITY.schema==="private.current-footprint-inverse-native-delete-cold-ui-helper-identity.v1"&&IDENTITY.layout===PROFILE.layout);
  const pin = {relativePath:PROFILE.helperRelativePath,bytes:IDENTITY.sourceBytes,sha256:IDENTITY.sourceSha256}; const path = fileURLToPath(new URL(`../../${pin.relativePath}`, import.meta.url));
  const named = await lstat(path); need(named.isFile() && !named.isSymbolicLink() && named.nlink === 1 && named.size === pin.bytes && pin.bytes > 0 && pin.bytes <= MAXIMUM);
  // oxlint-disable-next-line no-bitwise -- A substituted symlink or FIFO cannot enter the bounded immutable helper read.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat(); need(before.isFile() && same(named, before) && (original === undefined || same(original, before)) && await realpath(path) === path);
    const bytes = Buffer.alloc(pin.bytes + 1); let offset = 0;
    while (offset < bytes.length) { const result = await file.read(bytes, offset, bytes.length - offset, null); if (result.bytesRead === 0) { break; } offset += result.bytesRead; }
    const after = await file.stat(), final = await lstat(path);
    need(offset === pin.bytes && same(before, after) && same(before, final) && !final.isSymbolicLink() && !bytes.subarray(0, offset).some(value => value > 127) && createHash("sha256").update(bytes.subarray(0, offset)).digest("hex") === pin.sha256);
    requireCurrentFootprintInverseNativeDeleteColdUiHelperSource(bytes.subarray(0,offset).toString("utf8"));return before;
  } finally { await file.close(); }
}
export interface CurrentFootprintInverseNativeDeleteColdUiHelperCapture { readonly verify: () => Promise<void>; readonly bootstrap: string }
/** Both the Linux source read and Windows loader check complete exact bytes.
 * Windows FileShare.Read remains retained until its original helper exits. */
export async function captureCurrentFootprintInverseNativeDeleteColdUiHelper(distribution: string | undefined): Promise<CurrentFootprintInverseNativeDeleteColdUiHelperCapture> {
  const original = await read(), path = fileURLToPath(new URL(`../../${PROFILE.helperRelativePath}`, import.meta.url)); let windowsPath: string;
  if (/^\/mnt\/[a-z]\//u.test(path)) { windowsPath = `${path[5]?.toUpperCase()}:\\${path.slice(7).replaceAll("/", "\\")}`; }
  else { need(typeof distribution === "string" && /^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(distribution)); windowsPath = `\\\\wsl.localhost\\${distribution}${path.replaceAll("/", "\\")}`; }
  const flag = "-FootprintInverseNativeDeleteColdUi209";
  const pin = {relativePath:PROFILE.helperRelativePath,bytes:IDENTITY.sourceBytes,sha256:IDENTITY.sourceSha256};
  const bootstrap = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';$file=[IO.File]::Open('${powershellSingleQuotedBody(windowsPath)}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);try{if($file.Length -ne ${String(pin.bytes)} -or $file.Length -gt ${String(MAXIMUM)}){throw 'inverse-helper-size'};$bytes=New-Object byte[] ([int]$file.Length);$offset=0;while($offset -lt $file.Length){$read=$file.Read($bytes,$offset,$bytes.Length-$offset);if($read -le 0){throw 'inverse-helper-eof'};$offset+=$read};if($file.ReadByte() -ne -1){throw 'inverse-helper-grew'};$hasher=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hasher.Dispose()};if($digest -cne '${pin.sha256}'){throw 'inverse-helper-hash'};$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes))) ${flag}}finally{$file.Dispose()}`;
  need(Buffer.from(bootstrap, "utf16le").toString("base64").length <= 16_000);
  return Object.freeze({ verify: async (): Promise<void> => { await read(original); }, bootstrap });
}

/** Exact version/layout/codebook bytes only. This validates no workflow result
 * and transfers neither an old cold owner nor a native receiver lease. */
export function requireCurrentFootprintInverseNativeDeleteColdUiHelperSource(source:string):void{
 need(IDENTITY.schema==="private.current-footprint-inverse-native-delete-cold-ui-helper-identity.v1"&&IDENTITY.layout===PROFILE.layout);
 need(Buffer.byteLength(source)===IDENTITY.sourceBytes&&IDENTITY.sourceBytes<=PROFILE.helperMaxBytes&&createHash("sha256").update(source).digest("hex")===IDENTITY.sourceSha256);
 need(source.startsWith("param([switch]$FootprintInverseNativeDeleteColdUi209,")&&source.split("$owner=[EasyedaDiagnosticOwner]::CreateFootprintInverseNativeDeleteColdUi209()").length===2&&source.split("$owner.RequireNativeDeleteColdUiBirth()").length===2);
 const compiler=currentPcbDiagnosticCSharpRuntimeCompilerInput(source);const review=currentPcbDiagnosticCSharpReviewSource(source);
 need(Buffer.byteLength(compiler)===IDENTITY.compilerBytes&&IDENTITY.compilerBytes<=PROFILE.compilerMaxBytes&&createHash("sha256").update(compiler).digest("hex")===IDENTITY.compilerSha256&&Buffer.byteLength(review)===IDENTITY.reviewBytes&&IDENTITY.reviewBytes<=PROFILE.reviewMaxBytes&&createHash("sha256").update(review).digest("hex")===IDENTITY.reviewSha256);
}
