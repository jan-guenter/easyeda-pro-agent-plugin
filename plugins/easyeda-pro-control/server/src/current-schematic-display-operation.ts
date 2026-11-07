/** Closed data-family dispatch. Each branch invokes its original private
 * checkpoint/argument registry; a matching structural shape is insufficient. */
import { requireOriginalGeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import type { z } from "zod";
import type { generatedSchematicWireEditStageResultSchema } from "./generated-schematic-wire-edit-program.ts";
import { types } from "node:util";
import { requireOriginalGeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicDisplayStageResult } from "./generated-schematic-display.ts";
import type { GeneratedSchematicRelevanceDisplayStageResult } from "./generated-schematic-relevance-display.ts";
import { assertOriginalGeneratedSchematicFixtureOpenCheckpoint, verifyGeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint, verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";

export type CurrentSchematicDisplayOperationPrepared = GeneratedSchematicFixtureOpenCheckpoint | GeneratedSchematicRelevanceFixtureOpenCheckpoint;
export type CurrentSchematicDisplayOperationArguments = GeneratedSchematicDisplayNativeArguments | GeneratedSchematicRelevanceDisplayNativeArguments | GeneratedSchematicWireEditNativeArguments;
export type CurrentSchematicDisplayOperationStageResult = GeneratedSchematicDisplayStageResult | GeneratedSchematicRelevanceDisplayStageResult | z.infer<typeof generatedSchematicWireEditStageResultSchema>;
export function isSchematicWireEditArguments(args: CurrentSchematicDisplayOperationArguments): args is GeneratedSchematicWireEditNativeArguments {
  if (args === null || typeof args !== "object" || types.isProxy(args)) { throw new Error("SCHEMATIC_ORIGINAL_ARGUMENTS_DATA"); }
  const descriptor = Object.getOwnPropertyDescriptor(args, "schema");
  if (descriptor !== undefined && !Object.hasOwn(descriptor, "value")) { throw new Error("SCHEMATIC_ORIGINAL_ARGUMENTS_DATA"); }
  return descriptor?.value === "private.generated-schematic-wire-edit-args.v1";
}
export function isSchematicRelevanceDisplayArguments(args: CurrentSchematicDisplayOperationArguments): args is GeneratedSchematicRelevanceDisplayNativeArguments {
  if (args === null || typeof args !== "object" || types.isProxy(args)) { throw new Error("SCHEMATIC_ORIGINAL_ARGUMENTS_DATA"); }
  const descriptor = Object.getOwnPropertyDescriptor(args, "schema");
  if (descriptor !== undefined && !Object.hasOwn(descriptor, "value")) { throw new Error("SCHEMATIC_ORIGINAL_ARGUMENTS_DATA"); }
  return descriptor?.value === "private.generated-schematic-relevance-display-args.v1";
}
export function assertCurrentSchematicDisplayOperationPrepared(prepared: CurrentSchematicDisplayOperationPrepared): void {
  if (prepared === null || typeof prepared !== "object" || types.isProxy(prepared)) { throw new Error("SCHEMATIC_ORIGINAL_PREPARATION_DATA"); }
  const descriptor = Object.getOwnPropertyDescriptor(prepared, "profile");
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("SCHEMATIC_ORIGINAL_PREPARATION_DATA"); }
  if (prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1") { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); }
  else { assertOriginalGeneratedSchematicFixtureOpenCheckpoint(prepared); }
}
export function requireCurrentSchematicDisplayOperationArguments(prepared: CurrentSchematicDisplayOperationPrepared, args: CurrentSchematicDisplayOperationArguments): void {
  assertCurrentSchematicDisplayOperationPrepared(prepared);
  if (prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1") {
    if (isSchematicWireEditArguments(args)) { requireOriginalGeneratedSchematicWireEditNativeArguments(args, prepared); }
    else { if (!isSchematicRelevanceDisplayArguments(args)) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_ARGUMENTS"); }
      requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(args, prepared); }
  } else {
    if (isSchematicRelevanceDisplayArguments(args) || isSchematicWireEditArguments(args)) { throw new Error("SCHEMATIC_SIX_ORIGINAL_ARGUMENTS"); }
    requireOriginalGeneratedSchematicDisplayNativeArguments(args, prepared);
  }
}
export async function verifyCurrentSchematicDisplayOperationPrepared(prepared: CurrentSchematicDisplayOperationPrepared): Promise<void> {
  assertCurrentSchematicDisplayOperationPrepared(prepared);
  await (prepared.profile === "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1" ? verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared) : verifyGeneratedSchematicFixtureOpenCheckpoint(prepared));
  assertCurrentSchematicDisplayOperationPrepared(prepared);
}
