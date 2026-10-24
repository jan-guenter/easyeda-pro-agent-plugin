import { CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION } from "../server/src/current-pcb-209-extended-primitives.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("EXTENDED PRIMITIVES", "ExtendedPrimitives209Function", CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION);
