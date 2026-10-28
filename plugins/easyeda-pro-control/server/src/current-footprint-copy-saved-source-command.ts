/** Fixed saved-copy cache program. Its exact actor alternatives are checked
 * against the original closed SQL projection by the enclosing saved reader. */
import { z } from "zod";
import { currentFootprintCopySourceCommandParamsSchema } from "./current-footprint-copy-source-command.ts";
import { CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION } from "./current-footprint-copy-v2-saved-cache-read.ts";
import type { CurrentFootprintCopySourceReadRequest } from "./current-footprint-copy-source-read.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentFootprintCopySavedSourceCommandParamsSchema = currentFootprintCopySourceCommandParamsSchema.extend({
  functionDeclaration: z.literal(CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION),
}).strict();
export type CurrentFootprintCopySavedSourceCommand = Readonly<{ method: "Runtime.callFunctionOn";
  params: Readonly<z.infer<typeof currentFootprintCopySavedSourceCommandParamsSchema>> }>;
export function currentFootprintCopySavedSourceCommand(bindings: Readonly<{
  manager: string; project: string; bus: string; consistency: string; constructors: string; methods: string;
}>, selected: CurrentFootprintCopySourceReadRequest): CurrentFootprintCopySavedSourceCommand {
  return freezeDeep({ method: "Runtime.callFunctionOn", params: currentFootprintCopySavedSourceCommandParamsSchema.parse({
    objectId: bindings.manager, functionDeclaration: CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION,
    arguments: [{ objectId: bindings.project }, { objectId: bindings.bus }, { objectId: bindings.consistency },
      { value: selected }, { objectId: bindings.constructors }, { objectId: bindings.methods }],
    objectGroup: "easyeda-pro-control-worker-construction-v1", silent: true, returnByValue: true, generatePreview: false,
    throwOnSideEffect: false, awaitPromise: true, userGesture: false,
  }) });
}
