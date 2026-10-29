import { CURRENT_PCB_209_VISUAL_FUNCTION } from "../server/src/current-pcb-209-visual-actions.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("VISUAL", "Visual209Function", CURRENT_PCB_209_VISUAL_FUNCTION);
