import { CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION } from "../server/src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION } from "../server/src/current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION } from "../server/src/current-pcb-diagnostic-root-inventory.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

for (const [marker, name, source] of [
  ["MODEL STATE", "ModelStateFunction", CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION],
  ["MODEL STATE V TWO", "ModelStateV2Function", CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION],
  ["MODEL PENDING", "ModelPendingFunction", CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION],
  ["MODEL PENDING V TWO", "ModelPendingV2Function", CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION],
  ["MODEL ROOT INVENTORY", "ModelRootInventoryFunction", CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION],
] as const) {
  // oxlint-disable-next-line node/no-top-level-await -- ESM-only deterministic generation command; each bounded program retains its exact existing bytes.
  await generatePackedNativeProgram(marker, name, source);
}
