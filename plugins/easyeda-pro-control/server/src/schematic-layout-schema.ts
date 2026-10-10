import { z } from "zod";
import { netFlagCloneStepSchema } from "./schematic-layout-netflag.ts";

const stepIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/u);
const target = z.union([z.object({ primitiveId: z.string().min(1).max(256) }).strict(), z.object({ resultOf: stepIdSchema }).strict()]);
const finite = z.number();
const coordinates = z.array(finite).min(4).max(4096).refine((values) => values.length % 2 === 0, "Wire vertices need complete coordinate pairs.");
const line = z.union([coordinates, z.array(coordinates).min(1).max(256)]);
const displayObject = z.object({ x: finite.nullable(), y: finite.nullable(), rotation: finite.nullable(),
  fontName: z.string().min(1).max(512).nullable(), fontSize: finite.positive().nullable(), bold: z.boolean().nullable(),
  italic: z.boolean().nullable(), underLine: z.boolean().nullable(), alignMode: z.number().int().min(1).max(9).nullable(),
  keyVisible: z.boolean().nullable(), valueVisible: z.boolean().nullable(),
}).strict().partial();
const displayPatch = displayObject.refine((patch) => Object.keys(patch).length > 0, "Empty display patch.");
const textDisplayPatch = displayObject.omit({ keyVisible: true, valueVisible: true }).refine((patch) => Object.keys(patch).length > 0, "Empty text display patch.");
const wireCreateProperties = z.object({ line, color: z.string().max(128).nullable(), lineWidth: finite.min(1).max(10).nullable(),
  lineType: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).nullable() }).strict();
const labelCreateProperties = z.object({ x: finite, y: finite, net: z.string().min(1).max(512) }).strict();
export const schematicLayoutStepSchema = z.discriminatedUnion("action", [
  netFlagCloneStepSchema,
  z.object({ id: stepIdSchema, action: z.literal("sch.component.translate"), target, x: finite, y: finite }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.attribute.display"), target, patch: displayPatch }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.text.display"), target, patch: textDisplayPatch }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.text.delete"), target }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.wire.create"), properties: wireCreateProperties }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.wire.replace"), target, line }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.wire.delete"), target }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.net-label.create"), properties: labelCreateProperties }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.net-label.display"), target, patch: displayPatch }).strict(),
  z.object({ id: stepIdSchema, action: z.literal("sch.net-label.delete"), target }).strict(),
]);
export const schematicLayoutBatchSchema = z.object({ id: stepIdSchema, action: z.literal("sch.layout.batch"), documentType: z.literal(1).default(1),
  operations: z.array(schematicLayoutStepSchema).min(1).max(256),
}).strict().superRefine((batch, context) => {
  const prior = new Map<string, string>();
  for (const [index, step] of batch.operations.entries()) {
    if (prior.has(step.id)) { context.addIssue({ code: "custom", path: ["operations", index, "id"], message: "Duplicate layout step ID." }); }
    if ("target" in step && "resultOf" in step.target) {
      const creator = prior.get(step.target.resultOf);
      const family = step.action.startsWith("sch.wire.") ? "sch.wire.create" : "sch.net-label.create";
      if (creator !== family || (!step.action.startsWith("sch.wire.") && !step.action.startsWith("sch.net-label."))) {
        context.addIssue({ code: "custom", path: ["operations", index, "target"], message: "A layout reference must identify a prior matching wire or label creation." });
      }
    }
    prior.set(step.id, step.action);
  }
});
export type SchematicLayoutBatch = z.infer<typeof schematicLayoutBatchSchema>;
export type SchematicLayoutStep = z.infer<typeof schematicLayoutStepSchema>;
