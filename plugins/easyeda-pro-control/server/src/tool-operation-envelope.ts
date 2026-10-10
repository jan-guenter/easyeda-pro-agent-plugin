import { z } from "zod";
import { designActionSchema } from "./design-action.ts";
import { libraryOperationSchema } from "./library-operations.ts";

/** Publish the operation as an opaque JSON value, but run the unchanged strict
 * operation parser before the MCP handler. Codex rejects these generated
 * catalogs while constructing its tool specs. An unknown input pipe preserves
 * the original input (including forbidden keys) for validation; a permissive
 * object parser could strip keys before the strict parser sees them.
 */
export const designToolOperationSchema = z.unknown().pipe(designActionSchema);
export const libraryToolOperationSchema = z.unknown().pipe(libraryOperationSchema);
