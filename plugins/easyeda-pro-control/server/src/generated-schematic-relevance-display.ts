/** Separate transport result contract; old six-row stage packets stay invalid. */
import { z } from "zod";
import { GENERATED_SCHEMATIC_DISPLAY_STAGES, generatedSchematicDisplayStageResultSchema } from "./generated-schematic-display.ts";

export const GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_PROFILE = "generated-schematic-relevance-display209-v1";
export const generatedSchematicRelevanceDisplayStageResultSchema = z.strictObject({
  ...generatedSchematicDisplayStageResultSchema.shape,
  schema: z.literal("easyeda-pro-control.generated-schematic-relevance-display-stage.v1"), stage: z.enum(GENERATED_SCHEMATIC_DISPLAY_STAGES),
}).superRefine((value, context) => {
  const parsed = generatedSchematicDisplayStageResultSchema.safeParse({ ...value, schema: "easyeda-pro-control.generated-schematic-display-stage.v1" });
  if (!parsed.success) { for (const issue of parsed.error.issues) { context.addIssue({ code: "custom", path: [...issue.path], message: issue.message }); } }
});
export type GeneratedSchematicRelevanceDisplayStageResult = z.infer<typeof generatedSchematicRelevanceDisplayStageResultSchema>;
