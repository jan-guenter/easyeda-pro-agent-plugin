/** Bounded inert publication values. No value object creates original custody. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";

const text = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
export const currentSchematicWirePublicationExpectedSchema = z.tuple([z.strictObject({ id: text, type: z.literal("WIRE"), body: text }).readonly(), z.strictObject({ id: text, type: z.literal("LINE"), body: text }).readonly(), z.strictObject({ id: text, type: z.literal("ATTR"), body: text }).readonly()]).readonly();
export type CurrentSchematicWirePublicationExpected = z.infer<typeof currentSchematicWirePublicationExpectedSchema>;
export const currentSchematicWirePublicationValueSchema = z.tuple([text, z.number().int().positive().max(Number.MAX_SAFE_INTEGER - 1), z.enum(["WIRE", "LINE", "ATTR"]), text]).readonly();
export type CurrentSchematicWirePublicationValue = z.infer<typeof currentSchematicWirePublicationValueSchema>;
export function sameCurrentSchematicWirePublicationBody(actual: string, expected: string): boolean { const a: unknown = JSON.parse(actual); const b: unknown = JSON.parse(expected); return canonicalJson(a) === canonicalJson(b); }

export const CURRENT_SCHEMATIC_WIRE_PUBLICATION_OBJECT_GROUP = "easyeda-pro-control-schematic-wire-publication-v1";
