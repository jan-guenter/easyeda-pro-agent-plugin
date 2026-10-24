/** Fixed209 pause coordinates. Complete source qualification remains a separate
 * original-owner requirement. Return sites observe a pause before return, not
 * completion of async copper work or native message delivery. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE, inspectCurrentPcb209RatlineSource } from "./current-pcb-209-ratline-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_RATLINE_CAPTURE_GROUP = "easyeda-pro-control-pcb209-ratline-capture-v1";
export const CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES = freezeDeep({
  "pcb": {
    "sites": {
      "bridge": {
        "offset": 13_862,
        "name": "Let",
        "lineNumber": 30,
        "columnNumber": 12_460,
        "contextStart": 13_842,
        "contextEnd": 13_882,
        "contextSha256": "2c6105cb006df461770b509770daee207fbc22d2a4d2e3c609098d42af1be2fa"
      },
      "factory": {
        "offset": 6_444_118,
        "name": "addWorker",
        "lineNumber": 4401,
        "columnNumber": 167_971,
        "contextStart": 6_444_098,
        "contextEnd": 6_444_138,
        "contextSha256": "e04f5a590db70f87e02567c44aae1ce8dfb05ec8b3b1204690fee750f307066e"
      },
      "received": {
        "offset": 6_992_898,
        "name": "",
        "lineNumber": 4595,
        "columnNumber": 83_126,
        "contextStart": 6_992_878,
        "contextEnd": 6_992_918,
        "contextSha256": "c6f699d0d6d0e72b8fe6dc0b72dcafff9fbde1db69462eebe957adf6a607b8e4"
      },
      "entered": {
        "offset": 6_447_310,
        "name": "kRt",
        "lineNumber": 4401,
        "columnNumber": 171_163,
        "contextStart": 6_447_290,
        "contextEnd": 6_447_330,
        "contextSha256": "053f2394ba9a9cfd5b14d2fe59ca876329d53d454541cf3991449601a168b86b"
      },
      "returned": {
        "offset": 6_448_114,
        "name": "kRt",
        "lineNumber": 4401,
        "columnNumber": 171_967,
        "contextStart": 6_448_094,
        "contextEnd": 6_448_134,
        "contextSha256": "58191b137e84c5169e47784218462dc90678f24fd40be030d78b31d1cd16a82d"
      }
    },
    "sequence": [
      "bridge",
      "factory",
      "received",
      "entered",
      "returned"
    ],
    "factoryStart": 6_443_873,
    "factoryEnd": 6_444_119
  },
  "worker": {
    "sites": {
      "bridge": {
        "offset": 4939,
        "name": "EY",
        "lineNumber": 0,
        "columnNumber": 4939,
        "contextStart": 4919,
        "contextEnd": 4959,
        "contextSha256": "cfda7bc45b752f53b7f58daabdb32fb84771a3390c4622541382e8a96885c210"
      },
      "named": {
        "offset": 4_051_790,
        "name": "",
        "lineNumber": 3610,
        "columnNumber": 57_766,
        "contextStart": 4_051_770,
        "contextEnd": 4_051_810,
        "contextSha256": "9e7f00a017358ad08640703ffcf617efb74428434f987d48f16490cb448fd819"
      },
      "entered": {
        "offset": 4_052_139,
        "name": "",
        "lineNumber": 3610,
        "columnNumber": 58_115,
        "contextStart": 4_052_119,
        "contextEnd": 4_052_159,
        "contextSha256": "51ff0211477c2da9b742942e9dfe6de484a6a4fb9786a2c5806fa913a276bdac"
      },
      "canvas": {
        "offset": 4_052_699,
        "name": "i",
        "lineNumber": 3610,
        "columnNumber": 58_675,
        "contextStart": 4_052_679,
        "contextEnd": 4_052_719,
        "contextSha256": "d68b69c9e02e35d2af15c11ed8abd0642b1e04857e27bb0f871a1a7c8eb21365"
      },
      "factory": {
        "offset": 3_969_624,
        "name": "addWorker",
        "lineNumber": 3609,
        "columnNumber": 299_861,
        "contextStart": 3_969_604,
        "contextEnd": 3_969_644,
        "contextSha256": "36bdd5e3fa8e435ac9e75ed37e75b1e496186ea45dad505ff2141cbaeca353ff"
      },
      "initialized": {
        "offset": 4_053_526,
        "name": "",
        "lineNumber": 3610,
        "columnNumber": 59_502,
        "contextStart": 4_053_506,
        "contextEnd": 4_053_546,
        "contextSha256": "e3e55d18a03b0f2c4aed034677ba04ff6a148d1890b474fb792367ac7eb441ab"
      },
      "publication": {
        "offset": 4_053_736,
        "name": "",
        "lineNumber": 3610,
        "columnNumber": 59_712,
        "contextStart": 4_053_716,
        "contextEnd": 4_053_756,
        "contextSha256": "c6e2f16e438e7f499bbacfe6e8bd631d7a571e4e47502cb68e56c397412ac736"
      },
      "returned": {
        "offset": 4_053_751,
        "name": "",
        "lineNumber": 3610,
        "columnNumber": 59_727,
        "contextStart": 4_053_731,
        "contextEnd": 4_053_771,
        "contextSha256": "0bb8fc5d86d557d86b8f13a3ea76ac5f41a2740f71ca51aee3f2d633ea09a85b"
      }
    },
    "sequence": [
      "bridge",
      "named",
      "entered",
      "canvas",
      "bridge",
      "factory",
      "initialized",
      "publication",
      "returned"
    ],
    "factoryStart": 3_969_352,
    "factoryEnd": 3_969_625
  }
} as const);
export type CurrentPcb209RatlineCaptureRole = keyof typeof CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES;
export type CurrentPcb209RatlineCaptureSite = "bridge" | "factory" | "received" | "entered" | "returned" | "named" | "canvas" | "initialized" | "publication";

export function inspectCurrentPcb209RatlineCaptureSource(role: CurrentPcb209RatlineCaptureRole, input: unknown): Readonly<Record<string, unknown>> {
  const source = inspectCurrentPcb209RatlineSource(role, input);
  if (typeof input !== "string") { throw new TypeError("PCB209_RATLINE_CAPTURE_SOURCE_INPUT"); }
  const profile = CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[role];
  const coordinates: Readonly<Record<string, Readonly<{ offset: number; lineNumber: number; columnNumber: number; contextStart: number; contextEnd: number; contextSha256: string }>>> = profile.sites;
  const sites = Object.entries(coordinates).map(([name, site]) => {
    const prefix = input.slice(0, site.offset);
    return { name, matches: prefix.split("\n").length - 1 === site.lineNumber &&
      site.offset - prefix.lastIndexOf("\n") - 1 === site.columnNumber &&
      createHash("sha256").update(input.slice(site.contextStart, site.contextEnd)).digest("hex") === site.contextSha256 };
  });
  return freezeDeep({ schema: "easyeda-pro-control.pcb209-ratline-capture-source.v1", role,
    completeSourceMatches: source.completeSourceMatches, spansMatch: source.sourceProfileMatches, sites,
    sourceProfileMatches: source.sourceProfileMatches && sites.every(site => site.matches),
    relativePath: CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[role].relativePath,
    originalNativeOwnershipVerified: false, executionAuthorized: false });
}
