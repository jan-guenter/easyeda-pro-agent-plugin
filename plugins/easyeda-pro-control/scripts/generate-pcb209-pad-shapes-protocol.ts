import { CURRENT_PCB_209_PAD_SHAPES_FUNCTION } from "../server/src/current-pcb-209-pad-shapes.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("PAD SHAPES", "PadShapes209Function", CURRENT_PCB_209_PAD_SHAPES_FUNCTION);
