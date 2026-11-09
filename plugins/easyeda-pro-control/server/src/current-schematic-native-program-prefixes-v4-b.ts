/** Immutable V4 build catalogue. Each program/signature/cut/hash is fixed;
 * no caller supplies a prefix, selects a decoder or receives a runtime grant. */
import { CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_CM_BEFORE } from "./current-schematic-relevance-upload-cm-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_BBOX } from "./current-schematic-relevance-monitor-batch-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_FILE_SAVE_UI_DELTAS, CURRENT_SCHEMATIC_RELEVANCE_FILE_SAVE_UI_MAP_SAME, CURRENT_SCHEMATIC_RELEVANCE_FILE_SAVE_UI_PROGRAMS } from "./current-schematic-relevance-file-save-ui-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_ATTRIBUTE } from "./current-schematic-relevance-history-command-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_STATUS_TAB_LOOKUP_BIND } from "./current-schematic-relevance-status-tab-lookup-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_FUNCTIONS_PROGRAM } from "./current-schematic-relevance-display-ui-publication-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_FIBER_PROOF } from "./current-schematic-relevance-render-delegate-programs.ts";

type Prefix = readonly [program: string, signature: string, length: number, sha256: string];
export const CURRENT_SCHEMATIC_NATIVE_PROGRAM_PREFIXES_V4_B: readonly Prefix[] = Object.freeze([
  [CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_CM_BEFORE, "function(native,qualified,state,entry,namespace,intrinsic,objects,members,extensible,ctor,extra){", 512, "5eba2969b94f0c2a074737a06a161b3dc3d39ba6f0cabf0d73433af81e285a99"],
  [CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_BBOX, "function(native,entry,roots,event,map){", 512, "3c312380acba5baaff3c768fea3656f21d4e7e0fd2f2b0be8f79659be21dc7d5"],
  [(CURRENT_SCHEMATIC_RELEVANCE_FILE_SAVE_UI_DELTAS[0] ?? ""), "function(native,objects,stores){", 1024, "931e9cc77c06206fd52093a9d43b5ad311bb0747e46802ed95db46a2be953f5e"],
  [CURRENT_SCHEMATIC_RELEVANCE_FILE_SAVE_UI_PROGRAMS.mapProof, "function(native,qualified,stores){", 768, "43427807fbba6952e847be746c8ee4a7a889666c7ad022cf6a96a04be4a319c8"],
  [CURRENT_SCHEMATIC_RELEVANCE_FILE_SAVE_UI_MAP_SAME, "function(native,maps){", 768, "a5347164d6494663406f6cc756f388ec13bad4a3a4df2ca5562933b856381eb3"],
  [CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_ATTRIBUTE, "function(native,entry,roots,functions,module,intrinsic,objects,qualified,primitive){", 256, "5b3e58df39cc6630892b6f4734cbb6005523ccdaf853dcc6f2c3938181624e0b"],
  [CURRENT_SCHEMATIC_RELEVANCE_STATUS_TAB_LOOKUP_BIND, "function(native,original,target){", 128, "70c7edacc95c9c2a4781d49fbc1341653a9da72bdb4cd39ab2e01d2e0ed23af5"],
  [CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_FUNCTIONS_PROGRAM, "function(native,links,qualified){", 768, "6e2218b6bf8a3d7afba75637d92a4b3924efac8c8cc02214ca5f233f84d8cb8d"],
  [CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_FIBER_PROOF, "function(native,rootInfo){", 256, "f1160ebd19243aa732c0ffe8e98b2d43f3be3697667e698be0ceb7a2e2d13637"],
]);
