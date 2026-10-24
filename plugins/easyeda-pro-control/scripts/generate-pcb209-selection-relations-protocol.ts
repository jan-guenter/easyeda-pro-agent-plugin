import { CURRENT_PCB_209_SELECTION_RELATIONS_FUNCTION } from "../server/src/current-pcb-209-selection-relations.ts";
import { generatePackedNativeProgram } from "./native-program-packing.ts";

// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await generatePackedNativeProgram("SELECTION RELATIONS", "SelectionRelations209Function", CURRENT_PCB_209_SELECTION_RELATIONS_FUNCTION);
