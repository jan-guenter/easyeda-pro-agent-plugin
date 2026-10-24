import { CURRENT_PCB_209_PRIMITIVES_FUNCTION } from "../server/src/current-pcb-209-primitives.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("PRIMITIVES", "Primitives209Function", CURRENT_PCB_209_PRIMITIVES_FUNCTION);
