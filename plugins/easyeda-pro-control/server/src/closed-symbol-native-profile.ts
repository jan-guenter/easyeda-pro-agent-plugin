import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { sha256Json } from "./core.ts";

/** Fixed program files only. Never an arbitrary file reader or runtime override. */
export const WITNESS_NATIVE_PINS = Object.freeze([
  Object.freeze({ root: "app", relativePath: "app.js", sha256: "10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb" }),
  Object.freeze({ root: "assets", relativePath: "pro-ui/3.2.149.43637efe/js/ui.js", sha256: "12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a" }),
  Object.freeze({ root: "assets", relativePath: "pro-api/0.2.53.aee2f57a/api.js", sha256: "5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc" }),
  Object.freeze({ root: "assets", relativePath: "pro-mgr/3.2.148.154949d9/js/pro-mgr.js", sha256: "23089ec50bf701191c52af4a214b0d19b14e3233ead1bb5ccd50cf443e9e8742" }),
  Object.freeze({ root: "assets", relativePath: "pro-mgr/3.2.148.154949d9/js/project-worker.js", sha256: "2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949" }),
  Object.freeze({ root: "assets", relativePath: "pro-mgr/3.2.148.154949d9/js/ws-service.js", sha256: "dc6feee1873ddf4790187983df70b36dea95f1cb793f1cc05a274e65b37be0bd" }),
]);
export const WITNESS_NATIVE_PINS_SHA256 = sha256Json(WITNESS_NATIVE_PINS);
function need(value: boolean): asserts value { if (!value) { throw new Error("Witness native program profile changed or is unavailable."); } }

export async function verifyWitnessNativeProfile(assetsRoot: string): Promise<void> {
  need(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  for (const pin of WITNESS_NATIVE_PINS) {
    const path = join(pin.root === "app" ? dirname(assetsRoot) : assetsRoot, pin.relativePath);
    const before = await lstat(path, { bigint: true });
    need(before.isFile() && !before.isSymbolicLink() && before.size > 0n && before.size <= 128n * 1024n * 1024n && await realpath(path) === path);
    // oxlint-disable-next-line no-bitwise -- Retain the exact reviewed regular program file without following a substituted symlink.
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const hash = createHash("sha256");
      let consumed = 0n;
      for await (const chunk of file.createReadStream({ autoClose: false })) {
        need(Buffer.isBuffer(chunk)); consumed += BigInt(chunk.length);
        need(consumed <= before.size && consumed <= 128n * 1024n * 1024n); hash.update(chunk);
      }
      const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
      need(consumed === before.size && before.dev === after.dev && before.ino === after.ino && before.size === after.size && before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs &&
        after.dev === named.dev && after.ino === named.ino && after.size === named.size && after.mtimeNs === named.mtimeNs && after.ctimeNs === named.ctimeNs &&
        named.isFile() && !named.isSymbolicLink() && await realpath(path) === path && hash.digest("hex") === pin.sha256);
    } finally { await file.close(); }
  }
}
