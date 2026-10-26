/** Fixed asynchronous source request. Only an original construction owner may
 * supply its remote object bindings; the data request selects a checkpoint
 * member and never supplies executable text. This command is not a writer. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS,
  currentFootprintCopySourceReadRequestSchema } from "./current-footprint-copy-source-read.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION } from "./current-footprint-copy-cache-source-read.ts";
import type { CurrentFootprintCopySourceReadRequest } from "./current-footprint-copy-source-read.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const group = "easyeda-pro-control-worker-construction-v1";
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const object = z.object({ objectId: handle }).strict();
export const currentFootprintCopySourceCommandParamsSchema = z.object({
  objectId: handle, functionDeclaration: z.literal(CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION),
  arguments: z.tuple([object, object, object,
    z.object({ value: currentFootprintCopySourceReadRequestSchema }).strict(), object, object]),
  objectGroup: z.literal(group), silent: z.literal(true), returnByValue: z.literal(true),
  generatePreview: z.literal(false), throwOnSideEffect: z.literal(false),
  awaitPromise: z.literal(true), userGesture: z.literal(false),
}).strict();
export type CurrentFootprintCopySourceCommand = Readonly<{
  method: "Runtime.callFunctionOn";
  params: Readonly<z.infer<typeof currentFootprintCopySourceCommandParamsSchema>>;
}>;

/** Native code caps the inner JSON.stringify observation at4MiB+4096 bytes.
 * That serialized JSON has no literal control characters, so its CDP string
 * encoding needs at most twice as many bytes plus the fixed reply envelope.
 * Some2MiB source strings exceed the inner bound and are explicitly refused.
 * This does not grant the allowance to arbitrary control-character strings. */
export const CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES =
  (CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes * 2 + 4096) * 2 + 4096;

export function currentFootprintCopySourceCommand(bindings: Readonly<{
  manager: string; project: string; bus: string; consistency: string; constructors: string; methods: string;
}>, selected: CurrentFootprintCopySourceReadRequest): CurrentFootprintCopySourceCommand {
  return freezeDeep({ method: "Runtime.callFunctionOn", params: currentFootprintCopySourceCommandParamsSchema.parse({
    objectId: bindings.manager, functionDeclaration: CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION,
    arguments: [{ objectId: bindings.project }, { objectId: bindings.bus }, { objectId: bindings.consistency },
      { value: selected }, { objectId: bindings.constructors }, { objectId: bindings.methods }],
    objectGroup: group, silent: true, returnByValue: true, generatePreview: false,
    throwOnSideEffect: false, awaitPromise: true, userGesture: false,
  }) });
}
