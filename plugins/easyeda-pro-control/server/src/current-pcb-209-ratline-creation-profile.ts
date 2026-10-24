/** Fixed constructor boundaries for the two generation209 ratline factories.
 * The second pause is before the first registry insertion, after new Worker.
 * These coordinates do not establish native Worker/CDP target identity. */
import { createHash } from "node:crypto";
import { inspectCurrentPcb209RatlineSource } from "./current-pcb-209-ratline-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_RATLINE_CREATION_GROUP = "easyeda-pro-control-pcb209-ratline-creation-v1";
export const CURRENT_PCB_209_RATLINE_CREATION_PROFILES = freezeDeep({
  pcb: {
    before: { offset: 6_443_948, lineNumber: 4401, columnNumber: 167_801,
      contextSha256: "97a3e01ccd40072cfc68085e7bf97a5096d83659ec149f0b5ef95758f3a9eee2" },
    after: { offset: 6_443_976, lineNumber: 4401, columnNumber: 167_829,
      contextSha256: "ba05069997047c1999ba1fb33b4e31ec5409f489f4805f80f4b81189f726615a" },
    url: "s", name: "i", worker: "a",
  },
  worker: {
    before: { offset: 3_969_427, lineNumber: 3609, columnNumber: 299_664,
      contextSha256: "86b5a4ce1507c557ae3fb71ab241127bce03223e91c05c264a787e3136e2556a" },
    after: { offset: 3_969_455, lineNumber: 3609, columnNumber: 299_692,
      contextSha256: "988a235d4b1af36274c42d9dd9c108f83aabc58fdab62bac58e1f47d40a9c1bc" },
    url: "a", name: "n", worker: "o",
  },
} as const);
export type CurrentPcb209RatlineCreationRole = keyof typeof CURRENT_PCB_209_RATLINE_CREATION_PROFILES;

export function inspectCurrentPcb209RatlineCreationSource(role: CurrentPcb209RatlineCreationRole, input: unknown): Readonly<Record<string, unknown>> {
  const source = inspectCurrentPcb209RatlineSource(role, input);
  if (typeof input !== "string") { throw new TypeError("PCB209_RATLINE_CREATION_SOURCE_INPUT"); }
  const profile = CURRENT_PCB_209_RATLINE_CREATION_PROFILES[role];
  const sites = (["before", "after"] as const).map(name => {
    const point = profile[name], prefix = input.slice(0, point.offset);
    return { name, matches: prefix.split("\n").length - 1 === point.lineNumber &&
      point.offset - prefix.lastIndexOf("\n") - 1 === point.columnNumber &&
      createHash("sha256").update(input.slice(point.offset - 20, point.offset + 20)).digest("hex") === point.contextSha256 };
  });
  return freezeDeep({ schema: "easyeda-pro-control.pcb209-ratline-creation-source.v1", role,
    completeSourceMatches: source.completeSourceMatches, sourceProfileMatches: source.sourceProfileMatches && sites.every(site => site.matches), sites,
    originalNativeOwnershipVerified: false, executionAuthorized: false });
}
