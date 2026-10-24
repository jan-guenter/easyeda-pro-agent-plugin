import { CURRENT_PCB_209_IMAGE_SHAPES_FUNCTION } from "../server/src/current-pcb-209-image-shapes.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("IMAGE SHAPES", "ImageShapes209Function", CURRENT_PCB_209_IMAGE_SHAPES_FUNCTION);
