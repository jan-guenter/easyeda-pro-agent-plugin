/** Build-only exact shared helper pins. Runtime accepts no supplied source,
 * digest or length; the separate static checker never updates these files. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";

export function sharedNativeIdentitySource(helper: string): string {
  const bytes = Buffer.from(helper); if (bytes.length === 0 || bytes.length > MAXIMUM || bytes.some(value => value > 127)) { throw new Error("NATIVE_SHARED_IDENTITY_SOURCE"); }
  const length = String(bytes.length).replaceAll(/\B(?=(?:\d{3})+(?!\d))/gu, "_"), sha256 = createHash("sha256").update(bytes).digest("hex");
  return `/** Generated complete fixed shared helper identity. Rebuild through\n * startup:protocol:update. Windows synthetic-launch pins repeat both values. */\nexport const CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 = "${sha256}";\nexport const CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES = ${length};\n`;
}
export function sharedNativeSmokeSource(source: string, helper: string): string {
  const bytes = Buffer.from(helper), sha256 = createHash("sha256").update(bytes).digest("hex");
  sharedNativeIdentitySource(helper);
  const lengthPattern = /^if \(\$bytes\.Length -ne [0-9]+\) \{throw 'synthetic-launch-helper-size'\}$/gmu;
  const hashPattern = /^if \(\$helperHash -cne '[a-f0-9]{64}'\) \{$/gmu;
  if ([...source.matchAll(lengthPattern)].length !== 1 || [...source.matchAll(hashPattern)].length !== 1) { throw new Error("NATIVE_SHARED_SMOKE_PIN_ANCHORS"); }
  return source.replace(lengthPattern, `if ($bytes.Length -ne ${String(bytes.length)}) {throw 'synthetic-launch-helper-size'}`).replace(hashPattern, `if ($helperHash -cne '${sha256}') {`);
}
