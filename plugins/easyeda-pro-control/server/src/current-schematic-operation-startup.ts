/** Pre-navigation data qualification; no opening, lifecycle or writer authority. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { prepareCurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import type { CurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import { CURRENT_SCHEMATIC_CHILD_MAX_COUNT, currentSchematicChildAstSchema, currentSchematicChildKvSchema } from "./current-schematic-child-roster-contract.ts";
import { prepareCurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { currentSchematicOperationIntentSchema } from "./current-schematic-operation.ts";
import { currentSchematicRenamePeerSchema } from "./current-schematic-rename-preflight.ts";
import { currentSymbolStartupExpectationSchema } from "./current-symbol-startup.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

export const currentSchematicOpeningExpectationSchema = z.object({
  intent: currentSchematicOperationIntentSchema,
  startup: currentSymbolStartupExpectationSchema,
  peers: z.array(currentSchematicRenamePeerSchema).min(1).max(4096),
  childKv: z.record(z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), currentSchematicChildKvSchema)
    .refine(value => Object.keys(value).length <= CURRENT_SCHEMATIC_CHILD_MAX_COUNT, "child projection bound exceeded"),
  targetAst: currentSchematicChildAstSchema,
}).strict();
export type CurrentSchematicOpeningExpectation = Readonly<z.infer<typeof currentSchematicOpeningExpectationSchema>>;
function projection(metadata: CurrentSchematicNativeMetadata, children: CurrentSchematicChildRoster): CurrentSchematicOpeningExpectation {
  return freezeDeep(currentSchematicOpeningExpectationSchema.parse({ intent: { target: metadata.request.target, desiredTitle: metadata.request.desiredTitle },
    startup: children.startupInput, peers: metadata.peers, childKv: children.childKv, targetAst: children.targetAst }));
}
export async function prepareCurrentSchematicOpeningExpectation(before: Awaited<ReturnType<typeof readExactSqlInventory>>,
  input: unknown): Promise<CurrentSchematicOpeningExpectation> {
  const intent = currentSchematicOperationIntentSchema.parse(input);
  const metadata = await prepareCurrentSchematicNativeMetadata({ before, ...intent });
  const children = await prepareCurrentSchematicChildRoster(metadata, before);
  return projection(metadata, children);
}
export function assertCurrentSchematicOpeningExpectation(expected: unknown, metadata: CurrentSchematicNativeMetadata,
  children: CurrentSchematicChildRoster): void {
  if (canonicalJson(currentSchematicOpeningExpectationSchema.parse(expected)) !== canonicalJson(projection(metadata, children))) {
    throw new Error("Ordinary SCH baseline differs from its sealed pre-navigation startup, target, peers or child roster.");
  }
}
