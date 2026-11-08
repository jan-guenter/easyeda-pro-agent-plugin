/** Immutable build-only catalogue additions. Signatures, cut points and full
 * prefix hashes are pinned; no runtime input selects or supplies these bytes. */
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT as SNAPSHOT, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT_SAME as SNAPSHOT_SAME } from "./current-schematic-relevance-publication-snapshot-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_HISTORY_NOVEL as NOVEL } from "./current-schematic-relevance-active-history-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_NOECHO_INTRINSICS as NOECHO_INTRINSICS, CURRENT_SCHEMATIC_RELEVANCE_NOECHO_MAPS_SAME as NOECHO_MAPS } from "./current-schematic-relevance-noecho-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_DESCRIPTOR_HOOKS as HOOKS } from "./current-schematic-relevance-publication-globals-programs.ts";

type Prefix = readonly [program: string, signature: string, length: number, sha256: string];
export const CURRENT_SCHEMATIC_NATIVE_PROGRAM_PREFIXES_V3: readonly Prefix[] = Object.freeze([
  [SNAPSHOT_SAME, "function(native,qualified){", 1024, "35363e19068e97e299945d838ad6dd8d8fdc800bf0bfacaf7e233d200f20e73a"],
  [NOVEL, "function(native,qualified){", 3072, "0a53bcd193c024fc3377fb67f9fa77e3f154e62b05d10bc217378bc7189e11ee"],
  [NOECHO_MAPS, "function(native){", 512, "f69ea7e75a7ed67acae917bed7cb01b7af5232a694c0bdab812295ffbfd632d1"],
  [NOECHO_INTRINSICS, "function(native,intrinsic,active,members){", 512, "9007fea104a55d7959c0b97e76a559fe0f607bacb213f455a82f998e2c6d1e0a"],
  [HOOKS, "function(){", 256, "34ea7a41325ef85c5be0ce502460981f290ab85a2d22bd83ed532ffce720a76e"],
  [SNAPSHOT, "function(native){", 3072, "fd6cd5611bf9e3a80b9ba9d31b90eda5eadeb6f4af624630aa34df29720172df"],
]);
