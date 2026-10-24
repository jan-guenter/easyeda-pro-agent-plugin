import { CURRENT_PCB_209_ARC_SHAPES_FUNCTION } from "../server/src/current-pcb-209-arc-shapes.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("ARC SHAPES", "ArcShapes209Function", CURRENT_PCB_209_ARC_SHAPES_FUNCTION);
