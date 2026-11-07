/** Pinned ordinary209 reopen branches. A fresh process still uses persistent
 * CacheStorage; these source facts do not issue a fresh loading owner. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_VIA_SAVE_SOURCE } from "./current-pcb-via-save-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_PROJECT_REOPEN_CACHE_SOURCE = freezeDeep({ ...CURRENT_PCB_VIA_SAVE_SOURCE,
  spans: {
    projectNamespace: { start: 1_708_800, end: 1_708_842, bytes: 42, sha256: "10726ca404d4685fc29a103bdf44e95642725409407f8bfb054fd14eb9624650" },
    pendingNamespace: { start: 1_708_842, end: 1_708_889, bytes: 47, sha256: "be28b23e514948512d40076170f8ed424016b805cb49012d604497d1eb612d69" },
    cachedIndex: { start: 1_709_123, end: 1_709_217, bytes: 94, sha256: "4e552fe6b9d4a79807101226e55795e9b37bb36f95f807c68828d07af5aa6e3c" },
    mergeCachedMetadata: { start: 1_710_234, end: 1_710_968, bytes: 734, sha256: "3e05a08be3ba94d5563853cd2fe235929b7abe8d44cf914c8ab492505715fb8a" },
    nativeFetch: { start: 1_850_334, end: 1_851_314, bytes: 980, sha256: "5856d83c813dbfd56885d3d35d0a74d6c9732bd0e158069c72418d9c24b9ce74" },
    cachedChunk: { start: 1_851_787, end: 1_852_152, bytes: 365, sha256: "e4a9bbe0f65de04ca4bbab3c7728a69ba751585de1e07f703177e998d22e5f1b" },
    nativeChunks: { start: 1_852_674, end: 1_852_979, bytes: 305, sha256: "52d4edbe1deeb3f0ed5e733a1347d381797954e0a38fce453a0b294490ff6354" },
    initCache: { start: 2_020_085, end: 2_020_230, bytes: 145, sha256: "261f0c28585acb5bceba658a664a31e08073ea73fdc5131c2459c70f2cd5545e" },
    pendingReplay: { start: 2_021_757, end: 2_022_380, bytes: 623, sha256: "624d97b03cbcb2747b400ab24d603ddd6ae3760ea41b0233b8dd61c857973159" },
    open: { start: 2_108_622, end: 2_111_587, bytes: 2965, sha256: "5d8b63a8d1c5bbb92f288ea04b25bcb23934bfc82012e7224ae32f51ad543299" },
    openInLocal: { start: 2_128_299, end: 2_129_074, bytes: 775, sha256: "042eabeb79e0fe37d42d6d0f459704bb6230961c2741ef833f05b2fb29a85ec2" },
    openInCloud: { start: 2_129_074, end: 2_129_915, bytes: 841, sha256: "1898634b3531809b386fbca3e3d73c54483014ebb302c9334223055c36496573" },
    getLocalIndex: { start: 2_130_287, end: 2_130_357, bytes: 70, sha256: "a5acfbe39f6604f6ba492fdd94586ec6b404e7e06e4ca8b316cc37a2effb625a" },
    flowGetLocalHistory: { start: 2_131_277, end: 2_131_689, bytes: 412, sha256: "c20dcd52c896c8d177e8be303ada7792f5af5d304ea8008bdbf5b20b9327d057" },
  },
});
export function qualifyCurrentGeneratedProjectReopenCacheSource(input: unknown): void {
  const source = CURRENT_GENERATED_PROJECT_REOPEN_CACHE_SOURCE;
  if (typeof input !== "string" || !input.isWellFormed() || Buffer.byteLength(input) !== source.bytes || createHash("sha256").update(input).digest("hex") !== source.sha256) { throw new Error("GENERATED_REOPEN_CACHE_SOURCE"); }
  for (const span of Object.values(source.spans)) { const text = input.slice(span.start, span.end); if (Buffer.byteLength(text) !== span.bytes || createHash("sha256").update(text).digest("hex") !== span.sha256) { throw new Error("GENERATED_REOPEN_CACHE_SOURCE_SPAN"); } }
}
