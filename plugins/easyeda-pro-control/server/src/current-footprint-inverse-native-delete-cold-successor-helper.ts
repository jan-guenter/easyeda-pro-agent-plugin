/** Descriptor custody for the distinct readonly cold successor. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE as PROFILE } from "./current-footprint-inverse-native-delete-cold-profile.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_SUCCESSOR_IDENTITY as IDENTITY } from "./current-footprint-inverse-native-delete-cold-successor-identity.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "./current-pcb-diagnostic-helper-source-profile.ts";
import { powershellSingleQuotedBody } from "./powershell-single-quoted-body.ts";

function need(value: boolean): asserts value {
  if (!value) { throw new Error("INVERSE_NATIVE_DELETE_COLD_HELPER_SOURCE"); }
}

function same(first: BigIntStats, last: BigIntStats): boolean {
  return first.dev === last.dev && first.ino === last.ino && first.size === last.size &&
    first.mode === last.mode && first.mtimeNs === last.mtimeNs && first.ctimeNs === last.ctimeNs && last.nlink === 1n;
}

async function readPinnedSource(path: string, original?: BigIntStats): Promise<BigIntStats> {
  const pin = IDENTITY.helper;
  const named = await lstat(path, { bigint: true });
  need(named.isFile() && !named.isSymbolicLink() && named.nlink === 1n && named.size === BigInt(pin.bytes) && pin.bytes > 0 && pin.bytes <= MAXIMUM);
  // oxlint-disable-next-line no-bitwise -- A substituted symlink or FIFO cannot enter a complete descriptor read.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat({ bigint: true });
    need(before.isFile() && same(named, before) && (original === undefined || same(original, before)) && await realpath(path) === path);
    const bytes = Buffer.alloc(pin.bytes + 1);
    let offset = 0;
    while (offset < bytes.length) {
      const result = await file.read(bytes, offset, bytes.length - offset, null);
      if (result.bytesRead === 0) { break; }
      offset += result.bytesRead;
    }
    const after = await file.stat({ bigint: true });
    const final = await lstat(path, { bigint: true });
    need(offset === pin.bytes && same(before, after) && same(before, final) && !final.isSymbolicLink());
    const source = bytes.subarray(0, offset);
    need(!source.some(value => value > 127 || value === 0) && createHash("sha256").update(source).digest("hex") === pin.sha256);
    return before;
  } finally {
    await file.close();
  }
}

export interface CurrentFootprintInverseNativeDeleteColdSuccessorCapture {
  readonly verify: () => Promise<void>;
  readonly bootstrap: string;
}

/** Windows checks the same closed script bytes through a retained file handle. */
export async function captureCurrentFootprintInverseNativeDeleteColdSuccessor(
  distribution: string | undefined,
): Promise<CurrentFootprintInverseNativeDeleteColdSuccessorCapture> {
  need(IDENTITY.layout === PROFILE.helperLayout);
  const pin = IDENTITY.helper;
  const path = fileURLToPath(new URL(`../../${pin.relativePath}`, import.meta.url));
  const original = await readPinnedSource(path);
  let windowsPath: string;
  if (/^\/mnt\/[a-z]\//u.test(path)) {
    windowsPath = `${path[5]?.toUpperCase()}:\\${path.slice(7).replaceAll("/", "\\")}`;
  } else {
    need(distribution !== undefined && /^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(distribution));
    windowsPath = `\\\\wsl.localhost\\${distribution}${path.replaceAll("/", "\\")}`;
  }
  const bootstrap = "$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';" +
    `$file=[IO.File]::Open('${powershellSingleQuotedBody(windowsPath)}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);` +
    `try{if($file.Length -ne ${String(pin.bytes)} -or $file.Length -gt ${String(MAXIMUM)}){throw 'inverse-cold-helper-size'};` +
    "$bytes=New-Object byte[] ([int]$file.Length);$offset=0;while($offset -lt $bytes.Length){$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if($count -le 0){throw 'inverse-cold-helper-eof'};$offset+=$count};" +
    "if($file.ReadByte() -ne -1){throw 'inverse-cold-helper-grew'};" +
    "$hash=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()};" +
    `if($digest -cne '${pin.sha256}'){throw 'inverse-cold-helper-hash'};` +
    `$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes))) ${PROFILE.nativeSwitch}}finally{$file.Dispose()}`;
  need(Buffer.byteLength(bootstrap, "utf16le") <= 12_000);
  return Object.freeze({ verify: async (): Promise<void> => { await readPinnedSource(path, original); }, bootstrap });
}
