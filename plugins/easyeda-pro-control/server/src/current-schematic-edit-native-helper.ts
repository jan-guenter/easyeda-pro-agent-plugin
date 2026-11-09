/** Exact fixed-purpose helper custody only. Capturing source grants no native
 * owner, app launch, journal recovery or continuation of another generation. */
import { powershellSingleQuotedBody } from "./powershell-single-quoted-body.ts";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_NATIVE_IDENTITY as SAVED_IDENTITY } from "./current-schematic-relevance-saved-native-identity.ts";
import { CURRENT_SCHEMATIC_EDIT_NATIVE_IDENTITY as IDENTITY } from "./current-schematic-edit-native-identity.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-helper-source-profile.ts";

type Purpose = "schematic-relevance-saved-readback209" | "schematic-relevance-display-write209" | "schematic-wire-edit209";
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_NATIVE_HELPER_SOURCE"); } }
function same(first: Stats, last: Stats): boolean {
  return first.dev === last.dev && first.ino === last.ino && first.size === last.size && first.mode === last.mode && first.mtimeMs === last.mtimeMs && first.ctimeMs === last.ctimeMs && last.nlink === 1;
}
type HelperPin = Readonly<{ relativePath: string; bytes: number; sha256: string }>;
async function read(pin: HelperPin, original?: Stats): Promise<Stats> {
  const path = fileURLToPath(new URL(`../../${pin.relativePath}`, import.meta.url));
  const named = await lstat(path); need(named.isFile() && !named.isSymbolicLink() && named.nlink === 1 && named.size === pin.bytes && pin.bytes > 0 && pin.bytes <= MAXIMUM);
  // oxlint-disable-next-line no-bitwise -- A substituted symlink or FIFO cannot enter the bounded immutable helper read.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat(); need(before.isFile() && same(named, before) && (original === undefined || same(original, before)) && await realpath(path) === path);
    const bytes = Buffer.alloc(pin.bytes + 1); let offset = 0;
    while (offset < bytes.length) { const result = await file.read(bytes, offset, bytes.length - offset, null); if (result.bytesRead === 0) { break; } offset += result.bytesRead; }
    const after = await file.stat(), final = await lstat(path);
    need(offset === pin.bytes && same(before, after) && same(before, final) && !final.isSymbolicLink() && !bytes.subarray(0, offset).some(value => value > 127) && createHash("sha256").update(bytes.subarray(0, offset)).digest("hex") === pin.sha256);
    return before;
  } finally { await file.close(); }
}
export interface CurrentSchematicEditNativeHelperCapture { readonly verify: () => Promise<void>; readonly bootstrap: string }
/** Both the Linux source read and Windows loader check complete exact bytes.
 * Windows FileShare.Read remains retained until its original helper exits. */
export async function captureCurrentSchematicEditNativeHelper(distribution: string | undefined, purpose: Purpose): Promise<CurrentSchematicEditNativeHelperCapture> {
  need(purpose === "schematic-relevance-saved-readback209" || purpose === "schematic-relevance-display-write209" || purpose === "schematic-wire-edit209");
  const pin = purpose === "schematic-relevance-saved-readback209" ? SAVED_IDENTITY.helper : IDENTITY.helper;
  const original = await read(pin), path = fileURLToPath(new URL(`../../${pin.relativePath}`, import.meta.url)); let windowsPath: string;
  if (/^\/mnt\/[a-z]\//u.test(path)) { windowsPath = `${path[5]?.toUpperCase()}:\\${path.slice(7).replaceAll("/", "\\")}`; }
  else { need(typeof distribution === "string" && /^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(distribution)); windowsPath = `\\\\wsl.localhost\\${distribution}${path.replaceAll("/", "\\")}`; }
  let flag = "-SchematicWireEdit209";
  if (purpose === "schematic-relevance-saved-readback209") { flag = "-SchematicRelevanceSavedReadback209"; }
  else if (purpose === "schematic-relevance-display-write209") { flag = "-SchematicRelevanceDisplayWrite209"; }
  const bootstrap = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';$file=[IO.File]::Open('${powershellSingleQuotedBody(windowsPath)}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);try{if($file.Length -ne ${String(pin.bytes)} -or $file.Length -gt ${String(MAXIMUM)}){throw 'schematic-helper-size'};$bytes=New-Object byte[] ([int]$file.Length);$offset=0;while($offset -lt $file.Length){$read=$file.Read($bytes,$offset,$bytes.Length-$offset);if($read -le 0){throw 'schematic-helper-eof'};$offset+=$read};if($file.ReadByte() -ne -1){throw 'schematic-helper-grew'};$hasher=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hasher.Dispose()};if($digest -cne '${pin.sha256}'){throw 'schematic-helper-hash'};$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes))) ${flag}}finally{$file.Dispose()}`;
  need(Buffer.from(bootstrap, "utf16le").toString("base64").length <= 16_000);
  return Object.freeze({ verify: async (): Promise<void> => { await read(pin, original); }, bootstrap });
}
