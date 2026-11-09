/** Immutable V4 build catalogue. Each program/signature/cut/hash is fixed;
 * no caller supplies a prefix, selects a decoder or receives a runtime grant. */
import { CURRENT_SCHEMATIC_RELEVANCE_PENDING_CACHE_DELTA } from "./current-schematic-relevance-pending-cache-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_STATUS_TAB_MUTATION_DELTA, CURRENT_SCHEMATIC_RELEVANCE_STATUS_TAB_MUTATION_STATUS_DELTA } from "./current-schematic-relevance-status-tab-mutation-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_SERIALIZE_ARRAY_PROOF } from "./current-schematic-relevance-upload-serialize-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_BEFORE } from "./current-schematic-relevance-render-delegate-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MONITOR_AST_UI_DELTA, CURRENT_SCHEMATIC_RELEVANCE_MONITOR_VIEW_UI_DELTA } from "./current-schematic-relevance-monitor-batch-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_RAW_DELTA } from "./current-schematic-relevance-history-command-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_GLOBALS_SAME } from "./current-schematic-relevance-publication-globals-programs.ts";

type Prefix = readonly [program: string, signature: string, length: number, sha256: string];
export const CURRENT_SCHEMATIC_NATIVE_PROGRAM_PREFIXES_V4_A: readonly Prefix[] = Object.freeze([
  [CURRENT_SCHEMATIC_RELEVANCE_PENDING_CACHE_DELTA, "function(native,original,actual,objects,members){", 2048, "3f5bb014037b579ba03f9c079534ae0153ac3fe0bb6c165cfd5804771d01bd83"],
  [CURRENT_SCHEMATIC_RELEVANCE_STATUS_TAB_MUTATION_STATUS_DELTA, "function(native,roots,details,objects,state){", 2048, "e5b1324d1c6aaaa9ab91e193b19f7001f682e9648561dbde21c927dd9091b387"],
  [CURRENT_SCHEMATIC_RELEVANCE_STATUS_TAB_MUTATION_DELTA, "function(native,qualified,state){", 1536, "0b76ac02f76b18f509653c7a7bedee93b5f6c386307c43d9162c2f2eaf7425a3"],
  [CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_SERIALIZE_ARRAY_PROOF, "function(native,intrinsic,objects,methods){", 1024, "efc8bae55395e53cfe5a5a89d5a6d66c6de238658db9fe88e9b2eed9dcd6302f"],
  [CURRENT_SCHEMATIC_RELEVANCE_RENDER_DELEGATE_BEFORE, "function(native,qualified,modules,fields,objects,candidates,jsx,state,roots){", 1536, "32693540a7a3a34268856dafe68be2ec2f12eb072550d941cbe76267c785a20d"],
  [CURRENT_SCHEMATIC_RELEVANCE_MONITOR_AST_UI_DELTA, "function(native,qualified,entry,primitive){", 1024, "886e99db6feea38b420307d4d7063a3bd0b8362c152e2070f0527dcc1b1ecb45"],
  [CURRENT_SCHEMATIC_RELEVANCE_MONITOR_VIEW_UI_DELTA, "function(native,qualified,entry,primitive,view){", 1536, "387a599eaf281132579e19203659cf3d477797852b07388a957f7c84a0809f76"],
  [CURRENT_SCHEMATIC_RELEVANCE_HISTORY_COMMAND_RAW_DELTA, "function(native,refs,active,busSet,entry,primitive,view,commandState){", 512, "1627a08cce3482fe37b43bc357ac84405dfda57dbfcfb5ce197cd99e1475f0e3"],
  [CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_GLOBALS_SAME, "function(native,qualified,globals,members){", 1024, "d7a04eb405423b0a6e71b3252a35ce5f4ee61287bf9a775459f633670f02fb0e"],
]);
