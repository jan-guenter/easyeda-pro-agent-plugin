import { CURRENT_PCB_209_LAYERS_FUNCTION } from "../server/src/current-pcb-209-layers.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("LAYERS", "Layers209Function", CURRENT_PCB_209_LAYERS_FUNCTION);
