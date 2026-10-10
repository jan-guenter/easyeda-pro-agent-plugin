import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { nativeRuleCheckRequestSchema } from "./native-rule-report.ts";

const schematic = Object.freeze({ relativePath: "pro-sch/3.2.149.35ae2987/js/sch.js", sha256: "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f" });
const pcb = Object.freeze({ relativePath: "pro-pcb/3.2.149.5378b690/js/pcb.js", sha256: "65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54" });
const ui = Object.freeze({ relativePath: "pro-ui/3.2.149.43637efe/js/ui.js", sha256: "12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a" });
const api = Object.freeze({ relativePath: "pro-api/0.2.53.aee2f57a/api.js", sha256: "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc" });

export const NATIVE_RULE_IMPLEMENTATIONS = Object.freeze({
  "pcb-drc": Object.freeze([pcb, ui, api]),
  "schematic-erc": Object.freeze([schematic]),
});

export interface NativeRuleImplementationProof {
  profile: "easyeda-pro-control.native-rule-implementation.v1";
  kind: "pcb-drc" | "schematic-erc";
  implementations: readonly { readonly relativePath: string; readonly sha256: string }[];
}

/** The SCH profile covers R9/ay, the local log bus and actionRunner in sch.js.
 * PCB includes the API wrapper, UI dispatch and native verbose worker mapper.
 * Call before dispatch and after readback, in addition to the authenticated tuple.
 */
export async function verifyNativeRuleReportProfile(assetsRoot: string, kindInput: "pcb-drc" | "schematic-erc"): Promise<NativeRuleImplementationProof> {
  const { kind } = nativeRuleCheckRequestSchema.parse({ kind: kindInput });
  if (!isAbsolute(assetsRoot) || await realpath(assetsRoot) !== assetsRoot) { throw new Error("Rule-check implementation root is not canonical."); }
  const implementations = NATIVE_RULE_IMPLEMENTATIONS[kind];
  for (const implementation of implementations) {
    const path = join(assetsRoot, implementation.relativePath);
    const before = await lstat(path, { bigint: true });
    if (!before.isFile() || before.isSymbolicLink() || before.size <= 0n || before.size > 128n * 1024n * 1024n || await realpath(path) !== path) { throw new Error("Rule-check implementation is not a bounded regular file."); }
    // oxlint-disable-next-line eslint/no-bitwise -- Never follow a substituted native implementation symlink.
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const hash = createHash("sha256");
      for await (const chunk of file.createReadStream({ autoClose: false })) {
        if (!Buffer.isBuffer(chunk)) { throw new TypeError("Rule-check implementation stream is not binary."); }
        hash.update(chunk);
      }
      const after = await file.stat({ bigint: true }), current = await lstat(path, { bigint: true });
      if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs || after.dev !== current.dev || after.ino !== current.ino || after.size !== current.size || after.mtimeNs !== current.mtimeNs || after.ctimeNs !== current.ctimeNs || hash.digest("hex") !== implementation.sha256) { throw new Error("Rule-check implementation differs from its reviewed profile."); }
    } finally { await file.close(); }
  }
  return { profile: "easyeda-pro-control.native-rule-implementation.v1", kind, implementations };
}
