/** Source-only research profile for EasyEDA application3.2.209.8a704eab.
 * These hashes do not admit a runtime or replace the reviewed compatibility
 * profile. No application code is executed by this module. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_209_RATLINE_SOURCE_PROFILE = freezeDeep({
  application: "3.2.209.8a704eab",
  pcb: { relativePath: "pro-pcb/3.2.195.6b67774e/js/pcb.js", bytes: 10_991_441,
    sha256: "a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b",
    spans: {
      startupFlags: { start: 3_224_476, end: 3_224_597, bytes: 121,
        sha256: "93b46e567b8bedf2b3ee3b00b3f51f4fdd851a29cf20ac70fdb1a966ed13cf83" },
      bridge: { start: 13_743, end: 14_205, bytes: 462,
        sha256: "f2ef150511961d5e5a60554fbc78371f4cbde7bd24ce9893b235c7272ff3eaf2" },
      workerFactory: { start: 6_443_331, end: 6_444_552, bytes: 1221,
        sha256: "17a12aa9d8a9556e9404c9b8e5642553a9cf7f05c64ed358696374fd4bcf80ea" },
      waitForModel: { start: 6_447_160, end: 6_447_294, bytes: 134,
        sha256: "d94a7d7d2468ea5054dea2b8f12bb361982c11910035d9698c83e7b903a3f67c" },
      resultHandler: { start: 6_447_294, end: 6_448_115, bytes: 821,
        sha256: "d909615d69b77519d72af2eb49bd00cde3c5073326ece582090aac2caa1f77cc" },
      resultSubscription: { start: 6_992_856, end: 6_992_906, bytes: 50,
        sha256: "68e67dece501bec0d3b8f8b537f21bb6ee14d237064e9ba0e3629473c1528047" },
      initializer: { start: 10_861_543, end: 10_866_599, bytes: 5056,
        sha256: "b1f7989dee9f10c77ed452fe945be5b4b536b930e42b561c9520a1e74923269e" },
    } },
  worker: { relativePath: "pro-pcb/3.2.195.6b67774e/js/ratlineworker.js", bytes: 4_058_748,
    sha256: "011f5a8e2b9f4ce4bb4ffd9ea5eb288ec4a2f292473bf7fd023bbc8cf14901d3",
    spans: {
      bridge: { start: 4822, end: 5281, bytes: 459,
        sha256: "50e3aab4d2294d5ce9729749f82cb85062c794b978b2243e98b6d8e34f3db56c" },
      workerFactory: { start: 3_969_183, end: 3_970_058, bytes: 875,
        sha256: "0f66a970fa064c0693a637cf70b6fd7473056412d73909a4d840c2209e46b26b" },
      workerNameSubscription: { start: 4_051_743, end: 4_051_792, bytes: 49,
        sha256: "59214c8ea2930c0c64693b15f5f7436c1684c06862d9632c427aba044ecdc8ae" },
      startupService: { start: 4_052_103, end: 4_053_758, bytes: 1655,
        sha256: "4af767b831bc3b477582fb171cfd35e3c115916cb1c32310f6752b7c398a3113" },
      resultPublication: { start: 4_053_736, end: 4_053_751, bytes: 15,
        sha256: "e79298668affd7f558ed9c18669c20d67cf2555bcd407251f87b7a8e84fea029" },
    } },
} as const);

function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }

/** Complete source and independently retained UTF-16 slices must match. The
 * report is reproducible source evidence, never a native ownership token. */
export function inspectCurrentPcb209RatlineSource(kind: "pcb" | "worker", input: unknown): Readonly<{
  schema: "easyeda-pro-control.pcb209-ratline-source.v1";
  kind: "pcb" | "worker";
  completeSourceMatches: boolean;
  spans: readonly Readonly<{ name: string; matches: boolean }>[];
  sourceProfileMatches: boolean;
  compatibilityAdmitted: false;
  executionAuthorized: false;
}> {
  if (kind !== "pcb" && kind !== "worker" || typeof input !== "string" || !input.isWellFormed() ||
      input.length > 12 * 1024 * 1024) { throw new Error("PCB209_RATLINE_SOURCE_INPUT"); }
  const profile = CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[kind];
  const completeSourceMatches = Buffer.byteLength(input) === profile.bytes && digest(input) === profile.sha256;
  const sourceSpans: Readonly<Record<string, Readonly<{ start: number; end: number; bytes: number; sha256: string }>>> = profile.spans;
  const spans = Object.entries(sourceSpans).map(([name, span]) => {
    const source = input.slice(span.start, span.end);
    return { name, matches: Buffer.byteLength(source) === span.bytes && digest(source) === span.sha256 };
  });
  return freezeDeep({ schema: "easyeda-pro-control.pcb209-ratline-source.v1", kind, completeSourceMatches, spans,
    sourceProfileMatches: completeSourceMatches && spans.every(span => span.matches),
    compatibilityAdmitted: false, executionAuthorized: false });
}
