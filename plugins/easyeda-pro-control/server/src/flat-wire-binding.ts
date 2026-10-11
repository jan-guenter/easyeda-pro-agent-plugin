import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import type { ExpectedContext } from "./engine.ts";
import { flatCommonBindingSchema, flatDisplayContextScope } from "./flat-display-binding.ts";
import { flatDisplayLibrarySealSchema } from "./flat-display-library-peers.ts";
import { schematicOperationSchema } from "./schematic-operations.ts";

export const FLAT_WIRE_TRANSACTION_PROFILE = "easyeda-pro-control.flat-wire-reroute.v1";
const identity = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
/** A different discriminator and plan field from display edits. A historical
 * wire journal or a caller-provided pin-net array cannot acquire this authority.
 */
export const flatWireBindingSchema = z.strictObject({ profile: z.literal(FLAT_WIRE_TRANSACTION_PROFILE),
  ...flatCommonBindingSchema.shape, libraryHeaders: flatDisplayLibrarySealSchema.optional(),
  wireId: identity, lineIds: z.array(identity).min(1).max(4096), contactIncidenceSha256: hash,
}).superRefine((value, context) => {
  const members = new Map(value.members.map((entry) => [entry.uuid, entry.docType]));
  if (members.size !== value.members.length || members.get(value.pageUuid) !== "SCH_PAGE" || members.get(value.schematicUuid) !== "SCH" ||
      value.tabId !== `${value.pageUuid}@${value.project.projectUuid}` || new Set(value.lineIds).size !== value.lineIds.length ||
      canonicalJson(value.lineIds) !== canonicalJson(value.lineIds.toSorted()) ||
      value.libraryHeaders?.documents.some((entry) => members.get(entry.documentUuid) !== entry.docType) === true ||
      Buffer.byteLength(JSON.stringify(value), "utf8") > 2_097_152) {
    context.addIssue({ code: "custom", message: "Flat wire binding has inconsistent membership, identities or bounds." });
  }
});
export type FlatWireBinding = z.infer<typeof flatWireBindingSchema>;

export function flatWireOperation(input: unknown): Extract<z.infer<typeof schematicOperationSchema>, { action: "sch.wire.modify" }> {
  const operation = schematicOperationSchema.parse(input);
  if (operation.action !== "sch.wire.modify" || operation.documentType !== 1 || !("primitiveId" in operation.target) ||
      canonicalJson(Object.keys(operation.patch).toSorted()) !== canonicalJson(["color", "line", "lineType", "lineWidth"])) {
    throw new Error("Flat wire reroute requires one existing WIRE with explicit geometry/style and omitted net.");
  }
  return operation;
}

export function assertFlatWireBinding(input: unknown, operationInput: unknown, context: ExpectedContext): FlatWireBinding {
  const binding = flatWireBindingSchema.parse(input), operation = flatWireOperation(operationInput), scope = flatDisplayContextScope(context);
  if (!("primitiveId" in operation.target) || operation.target.primitiveId !== binding.wireId || sha256Json(operation) !== binding.operationSha256 ||
      scope.projectUuid !== binding.project.projectUuid || scope.projectPath !== binding.projectPath || scope.pageUuid !== binding.pageUuid ||
      scope.tabId !== binding.tabId || (context.schematic?.uuid !== undefined && context.schematic.uuid !== binding.schematicUuid) ||
      (context.schematic?.documentUuid !== undefined && context.schematic.documentUuid !== binding.schematicUuid)) {
    throw new Error("Flat wire operation or context differs from its sealed original binding.");
  }
  return binding;
}

export function assertFlatWireInverse(bindingInput: unknown, inverseInput: unknown): ReturnType<typeof flatWireOperation> {
  const binding = flatWireBindingSchema.parse(bindingInput), inverse = flatWireOperation(inverseInput);
  if (sha256Json(inverse) !== binding.inverseSha256) { throw new Error("Flat wire inverse differs from its sealed complete geometry inverse."); }
  return inverse;
}
