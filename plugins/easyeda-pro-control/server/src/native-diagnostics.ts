import { deviceFailureCategory } from "./device-runtime-guard.ts";
import { libraryRuntimeFailureCategory } from "./library-runtime-guard.ts";
import { projectUploadBarrierFailureCategory } from "./project-upload-barrier.ts";

/** Fixed literal errors emitted by reviewed code builders. Never echo unknown
 * native exception text, dynamic suffixes, stack traces or caller values.
 */
const codes = new Set([
  "NATIVE_LIFECYCLE_OBSERVER_UNAVAILABLE",
  "NATIVE_LIFECYCLE_PROJECT_DRIFT",
  "NATIVE_LIFECYCLE_CLOSE_CONTEXT",
  "NATIVE_LIFECYCLE_SHARED_MODEL",
  "NATIVE_LIFECYCLE_OLD_FRAME",
  "NATIVE_LIFECYCLE_SUBSCRIPTION",
  "NATIVE_LIFECYCLE_CLOSE_TIMEOUT",
  "NATIVE_LIFECYCLE_CLOSE_ACK",
  "NATIVE_LIFECYCLE_CLOSE_REMOVAL",
  "NATIVE_LIFECYCLE_OPEN_TARGET_PRESENT",
  "NATIVE_LIFECYCLE_OPEN_TIMEOUT",
  "NATIVE_LIFECYCLE_OPEN_ACK",
  "NATIVE_LIFECYCLE_NEW_FRAME",
  "NATIVE_LIFECYCLE_ACTIVATE_CONTEXT",
  "DESIGN_POLYGON_INVALID",
  "FOOTPRINT_LINE_OBJECT_INVALID",
  "FOOTPRINT_LINE_BASELINE_DRIFT",
  "FOOTPRINT_HISTORY_FRAME",
  "FOOTPRINT_HISTORY_IDENTITY",
  "FOOTPRINT_HISTORY_BASELINE",
  "FOOTPRINT_HISTORY_RESULT",
  "LIBRARY_EXPORT_FILE_CHANGED",
  "LIBRARY_EXPORT_FILE_INVALID",
  "LIBRARY_METADATA_MISSING",
  "LIBRARY_NATIVE_METHOD_MISSING",
  "LIBRARY_OPEN_ACTIVATION_FAILED",
  "LIBRARY_OPEN_TAB_MISSING",
  "LIBRARY_OUTPUT_TOO_LARGE",
  "LIBRARY_WRITE_ACK_INVALID",
  "PCB_DRC_CONTEXT_DRIFT",
  "PCB_DRC_POLICY_MISSING",
  "PCB_DRC_REPORT_LIMIT",
  "PCB_DRC_SOURCE_IDENTITY_MISMATCH",
  "PCB_DRC_SOURCE_OR_POLICY_DRIFT",
  "RULE_SNAPSHOT_LIMIT",
  "RULE_SOURCE_DUPLICATE",
  "RULE_SOURCE_INCOMPLETE",
  "RULE_SOURCE_INVALID",
  "SCH_CREATE_ACTION_REJECTED",
  "SCH_CREATE_BASELINE_CHANGED",
  "SCH_CREATE_HEADER_INVALID",
  "SCH_CREATE_SOURCE_API_MISSING",
  "SCH_CREATE_SOURCE_REJECTED",
  "SCH_DELETE_TARGET_CHANGED",
  "SCH_ELECTRICAL_BASELINE_CHANGED",
  "SCH_ELECTRICAL_RUNNER_MISSING",
  "SCH_ERC_ACTION_ALREADY_RUNNING",
  "SCH_ERC_ACTION_LISTENER_INVALID",
  "SCH_ERC_CONTEXT_DRIFT",
  "SCH_ERC_COUNTERS_MISSING",
  "SCH_ERC_COUNTER_INVALID",
  "SCH_ERC_DOCUMENT_SCOPE_INVALID",
  "SCH_ERC_LISTENER_CLEANUP_FAILED",
  "SCH_ERC_LISTENER_HANDLE_INVALID",
  "SCH_ERC_NATIVE_PROFILE_MISSING",
  "SCH_ERC_POLICY_MISSING",
  "SCH_ERC_REPORT_LIMIT",
  "SCH_ERC_SOURCE_MISSING",
  "SCH_ERC_SOURCE_OR_POLICY_DRIFT",
  "SCH_LABEL_CREATE_FAILED",
  "SCH_LABEL_CREATE_UNAVAILABLE",
  "SCH_LAYOUT_BASELINE_CHANGED",
  "SCH_LAYOUT_SOURCE_API_MISSING",
  "SCH_LAYOUT_HEADER_INVALID",
  "SCH_LAYOUT_SOURCE_REJECTED",
  "SCH_LAYOUT_ACTION_REJECTED",
  "SCH_LAYOUT_TEMPLATE_BOUND",
  "SCH_LAYOUT_PAYLOAD_BOUND",
  "SCH_LAYOUT_PAYLOAD_COMPRESSION_UNAVAILABLE",
  "SCH_LAYOUT_PAYLOAD_CRYPTO_UNAVAILABLE",
  "SCH_LAYOUT_PAYLOAD_INVALID",
  "SCH_LAYOUT_PAYLOAD_HASH",
  "SCH_LAYOUT_PAYLOAD_CLEANUP",
  "SCH_LAYOUT_WIRE_REMOVE_GUARD",
  "SCH_LAYOUT_WIRE_REMOVE_FAILED",
  "SCH_LAYOUT_WIRE_GROUP_REPAIR_ACK",
  "SCH_LAYOUT_LABEL_REMOVE_GUARD",
  "SCH_LAYOUT_LABEL_REMOVE_FAILED",
  "SCH_LAYOUT_REPAIR_ACK_INVALID",
  "SCH_LAYOUT_PAGE_LOAD_SCOPE",
  "SCH_NETFLAG_TEMPLATE_MANAGER",
  "SCH_NETFLAG_TEMPLATE_SCOPE",
  "SCH_NETFLAG_TEMPLATE_UNSTABLE",
  "SCH_NATIVE_ATTRIBUTES_INVALID",
  "SCH_NATIVE_ATTRIBUTES_MISSING",
  "SCH_NATIVE_ATTRIBUTE_INVALID",
  "SCH_NATIVE_ATTRIBUTE_REJECTED",
  "SCH_NATIVE_BASELINE_CHANGED",
  "SCH_NATIVE_BODY_INVALID",
  "SCH_NATIVE_BODY_MISSING",
  "SCH_NATIVE_COMPONENTS_INVALID",
  "SCH_NATIVE_COMPONENT_INVALID",
  "SCH_NATIVE_SNAPSHOT_BOUND",
  "SCH_NATIVE_COMPRESSION_UNAVAILABLE",
  "SCH_NATIVE_COMPRESSION_INVALID",
  "SCH_NATIVE_COMPRESSED_BOUND",
  "SCH_NATIVE_COMPRESSION_CLEANUP",
  "SCH_NATIVE_CONTEXT_MISMATCH",
  "SCH_NATIVE_FRAME_TIMESTAMP_INVALID",
  "SCH_NATIVE_LOCK_INVALID",
  "SCH_NATIVE_MANAGER_MISSING",
  "SCH_NATIVE_PIN_INVALID",
  "SCH_NATIVE_PIN_NET_INVALID",
  "SCH_NATIVE_PIN_NET_MISSING",
  "SCH_NATIVE_RUNNER_MISSING",
  "SCH_NATIVE_SCALAR_INVALID",
  "SCH_NATIVE_SOURCE_CONTEXT_MISMATCH",
  "SCH_NATIVE_SOURCE_INVALID",
  "SCH_NATIVE_SOURCE_MISSING",
  "SCH_NATIVE_TARGET_INVALID",
  "SCH_NOCONNECT_CREATE_FAILED",
  "SCH_NOCONNECT_ID_COLLISION",
  "SCH_PIN_MISSING",
  "SYMBOL_ACTION_REJECTED",
  "SYMBOL_CLOSE_FAILED",
  "SYMBOL_COMPILER_SAVE_FAILED",
  "SYMBOL_COMPILER_SAVE_MISSING",
  "SYMBOL_CONTEXT_DRIFT",
  "SYMBOL_EXPORT_HEADER",
  "SYMBOL_LIFECYCLE_API_MISSING",
  "SYMBOL_MANAGER_SCOPE_DRIFT",
  "SYMBOL_METADATA_DRIFT",
  "SYMBOL_REOPEN_FAILED",
  "SYMBOL_REOPEN_SCOPE_DRIFT",
  "SYMBOL_SOURCE_BOUND",
  "SYMBOL_SOURCE_CHANGED",
  "SYMBOL_SOURCE_HEADER",
  "SYMBOL_SOURCE_ID",
  "SYMBOL_SOURCE_RECORD",
  "SYMBOL_SOURCE_REJECTED",
]);
const recoveryStages = new Set([
  "api-unavailable", "identity-shape", "identity-alias", "identity-missing",
  "registry-path", "registry-response", "registry-chunk", "registry-bound",
  "registry-json", "registry-membership", "registry-target-mismatch",
  "other-project-active", "other-document-active", "document-without-project",
  "active-project-path", "open-project-result", "open-project-readback",
  "project-changed-before-document", "open-document-result", "activate-result",
  "activate-readback", "target-readback",
  "library-api-unavailable", "library-identity-drift", "library-context-owner",
  "tab-tree-api", "tab-tree-shape", "tab-tree-branch", "tab-tree-leaf", "tab-record", "tab-data", "tab-type-alias", "unrelated-editor-tab",
]);
const tabCodes = new Set(["EDITOR_TABS_API_MISSING", "EDITOR_TABS_FIELD_BOUND", "EDITOR_TABS_PROJECT_DRIFT", "EDITOR_TABS_TREE_BOUND", "EDITOR_TABS_CONTEXT_DRIFT", "EDITOR_TABS_OUTPUT_BOUND"]);
const padCodes = new Map([
  ["Pad frame bound exceeded", "PAD_FRAME_BOUND"], ["Pad frame scope unavailable", "PAD_FRAME_SCOPE"], ["Duplicate pad frame", "PAD_FRAME_DUPLICATE"],
  ["Pad property dispatcher unavailable", "PAD_DISPATCHER_MISSING"], ["Pad property handler profile changed", "PAD_HANDLER_DRIFT"],
  ["Pad source changed before history", "PAD_SOURCE_BEFORE_DRIFT"], ["Pad source changed between property steps", "PAD_SOURCE_STEP_DRIFT"],
  ["Pad completion subscription unavailable", "PAD_COMPLETION_MISSING"], ["Pad history changed unrelated records", "PAD_HISTORY_COLLATERAL"],
]);
const footprintLifecycleCodes = new Map([
  ["Footprint lifecycle scope drift", "FOOTPRINT_LIFECYCLE_SCOPE"],
  ["Footprint lifecycle metadata drift", "FOOTPRINT_LIFECYCLE_METADATA"],
  ["Footprint lifecycle source unavailable", "FOOTPRINT_LIFECYCLE_SOURCE"],
  ["Invalid footprint source record", "FOOTPRINT_LIFECYCLE_RECORD"],
  ["Missing footprint source header", "FOOTPRINT_LIFECYCLE_HEADER"],
  ["Invalid footprint export header", "FOOTPRINT_LIFECYCLE_EXPORT_HEADER"],
  ["Invalid footprint source identity", "FOOTPRINT_LIFECYCLE_RECORD_ID"],
  ["Footprint changed before lifecycle action", "FOOTPRINT_LIFECYCLE_BASELINE"],
  ["Footprint lifecycle editor API unavailable", "FOOTPRINT_LIFECYCLE_API"],
  ["Footprint close did not acknowledge", "FOOTPRINT_LIFECYCLE_CLOSE"],
  ["Footprint reopen identity failed", "FOOTPRINT_LIFECYCLE_REOPEN"],
  ["Footprint activation acknowledgment malformed", "FOOTPRINT_LIFECYCLE_ACTIVATION"],
]);
// Each builder discards its caught native exception and emits only these fixed
// Stages. Exact whole-message matching must not admit suffixes, paths or stacks.
const operationStages = [
  { prefix: "Document activation refused: ", category: "native-document-activation", stages: ["api", "before-context", "before-tabs", "loaded-frames", "preferences", "dispatch-context", "activate", "target-readiness"] },
  { prefix: "Closed page rename refused at ", category: "native-page-rename", stages: ["host", "before-read", "closed-target", "rename", "after-read"] },
  { prefix: "Symbol metadata operation refused at ", category: "native-symbol-metadata", stages: ["host", "permission", "before-read", "target-closed", "modify", "after-read"] },
];
const operationStageCategories = new Map(operationStages.flatMap(({ prefix, category, stages }) => stages.map((stage) => [`${prefix}${stage}`, `${category}:${stage}`] as const)));

export function nativeFailureCategory(message: unknown): string | null {
  if (typeof message !== "string") { return null; }
  const operationStageCategory = message.length <= 128 ? operationStageCategories.get(message) : undefined;
  if (operationStageCategory !== undefined) { return operationStageCategory; }
  const uploadBarrierCategory = projectUploadBarrierFailureCategory(message);
  if (uploadBarrierCategory !== null) { return uploadBarrierCategory; }
  if (tabCodes.has(message)) { return `native-preflight:${message}`; }
  const padCode = padCodes.get(message);
  if (padCode !== undefined) { return `native-preflight:${padCode}`; }
  const footprintCode = footprintLifecycleCodes.get(message);
  if (footprintCode !== undefined) { return `native-lifecycle:${footprintCode}`; }
  const nativeMerge = /^Native source merge refused: footprint:(setup|frame|context|baseline|encode|dispatch|acknowledgment|readback)$/u.exec(message);
  if (nativeMerge?.[1] !== undefined) { return `native-source-merge:footprint:${nativeMerge[1]}`; }
  const libraryCategory = libraryRuntimeFailureCategory(message);
  if (libraryCategory !== null) { return libraryCategory; }
  const deviceCategory = deviceFailureCategory(message);
  if (deviceCategory !== null) { return deviceCategory; }
  if (codes.has(message)) { return `native-preflight:${message}`; }
  const prefix = "Recovery navigation refused: ";
  const stage = message.startsWith(prefix) ? message.slice(prefix.length) : "";
  return recoveryStages.has(stage) ? `native-preflight:RECOVERY_${stage.toUpperCase().replaceAll("-", "_")}` : null;
}
