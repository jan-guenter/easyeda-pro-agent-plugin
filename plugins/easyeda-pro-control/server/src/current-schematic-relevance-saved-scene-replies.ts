/** Exact readonly scene replies. Data equality cannot recreate a native origin. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const tuple = z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal("Array(2)"), objectId: handle });
const captured = z.strictObject({ result: tuple });
const scene = z.strictObject({ schema: z.literal("private.generated-schematic-relevance-saved-reader-scene.v1"),
  source: z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384), windowTabId: handle,
  stableSelectedContext: z.literal(true), persistentModels: z.literal(6), endpointMarkers: z.literal(2), readerNativeOriginVerified: z.literal(false),
  coldLoadVerified: z.literal(false), persistenceVerified: z.literal(false), reopenedVerified: z.literal(false), executionAuthorized: z.literal(false) });
const observedValue = z.strictObject({ type: z.literal("object"), value: scene });
const observed = z.strictObject({ result: observedValue });
const empty = z.strictObject({});
export type CurrentSchematicRelevanceSavedSceneReply = z.infer<typeof scene>;
export function decodeCurrentSchematicRelevanceSavedSceneCapture(input: unknown): string {
  return captured.parse(captureCurrentPcbStringClockReply(input).value).result.objectId;
}
export function decodeCurrentSchematicRelevanceSavedSceneReply(input: unknown, windowTabId: string): Readonly<CurrentSchematicRelevanceSavedSceneReply> {
  handle.parse(windowTabId); const reply = observed.parse(captureCurrentPcbStringClockReply(input).value).result.value;
  if (reply.windowTabId !== windowTabId) { throw new Error("SCHEMATIC_SAVED_SCENE_ORIGINAL_WINDOW"); } return freezeDeep(reply);
}
export function requireCurrentSchematicRelevanceSavedSceneRelease(input: unknown): void {
  empty.parse(captureCurrentPcbStringClockReply(input).value);
}
