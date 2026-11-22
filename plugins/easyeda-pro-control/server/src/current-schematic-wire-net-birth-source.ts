/** Source positions immediately before the selected page registers baseWatch. */
import { createHash } from "node:crypto";
import { captureQualifiedCurrentSchematicWireCompletionSource } from "./current-schematic-wire-completion-source.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE as WATCH } from "./current-schematic-wire-net-watch-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const pageSha = "159a2aaf20d8bc1010e3b81c83f9e484f7684e6dad21a23054ed5d6732fcfbba";
const callbackSha = "c328b762fc59ea3884e65a9241cfcd181be5ffb74fb10ee4da2be045de12038a";
export const CURRENT_SCHEMATIC_WIRE_NET_BIRTH_SOURCE = freezeDeep([
  {
    relativePath: WATCH[0].relativePath,
    page: { start: 5_373_094, end: 5_373_402, bytes: 308, sha256: pageSha, lineNumber: 3673, columnNumber: 60_922, held: 61_156 },
    caller: { start: 4_462_941, end: 4_463_078, bytes: 137, sha256: callbackSha, lineNumber: 3614, columnNumber: 27_813, held: 27_888 },
  },
  {
    relativePath: WATCH[1].relativePath,
    page: { start: 5_672_100, end: 5_672_408, bytes: 308, sha256: pageSha, lineNumber: 4191, columnNumber: 66_022, held: 66_256 },
    caller: { start: 4_685_710, end: 4_685_847, bytes: 137, sha256: callbackSha, lineNumber: 4113, columnNumber: 27_813, held: 27_888 },
  },
] as const);
/** Both exact module URLs are pinned by the installed generation-209 editor.ini. */
export function currentSchematicWireNetBirthSite(variant: 0 | 1): Readonly<{
  url: string; lineNumber: number; columnNumber: number; breakpointId: string;
}> {
  const { relativePath, page } = CURRENT_SCHEMATIC_WIRE_NET_BIRTH_SOURCE[variant];
  const url = new URL(relativePath, "https://modules.lceda.cn/").href;
  return Object.freeze({ url, lineNumber: page.lineNumber, columnNumber: page.held,
    breakpointId: [1, page.lineNumber, page.held, url].join(":") });
}

export function qualifyCurrentSchematicWireNetBirthSource(input: unknown): 0 | 1 {
  const { variant, scriptSource } = captureQualifiedCurrentSchematicWireCompletionSource(input);
  const profile = CURRENT_SCHEMATIC_WIRE_NET_BIRTH_SOURCE[variant];
  for (const pin of [profile.page, profile.caller]) {
    const functionSource = scriptSource.slice(pin.start, pin.end);
    if (Buffer.byteLength(functionSource) !== pin.bytes || createHash("sha256").update(functionSource).digest("hex") !== pin.sha256) {
      throw new Error("WIRE_NET_BIRTH_SOURCE");
    }
  }
  return variant;
}
