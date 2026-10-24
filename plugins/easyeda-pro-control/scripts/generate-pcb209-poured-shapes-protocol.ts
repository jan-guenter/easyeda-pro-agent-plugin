import { CURRENT_PCB_209_POURED_SHAPES_FUNCTION } from "../server/src/current-pcb-209-poured-shapes.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("POURED SHAPES", "PouredShapes209Function", CURRENT_PCB_209_POURED_SHAPES_FUNCTION);
