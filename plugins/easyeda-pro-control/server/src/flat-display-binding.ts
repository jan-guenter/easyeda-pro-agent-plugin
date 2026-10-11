import { z } from "zod";
import { normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import type { ExpectedContext } from "./engine.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { designTopologySchema } from "./design-topology.ts";
import { schematicLayoutBatchSchema } from "./schematic-layout-schema.ts";
import type { SchematicLayoutBatch } from "./schematic-layout-schema.ts";
import { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE, flatDisplayLibrarySealSchema } from "./flat-display-library-peers.ts";

export const FLAT_DISPLAY_TRANSACTION_PROFILE = "easyeda-pro-control.flat-display-transaction.v1";
const identity = z.string().regex(/^[a-zA-Z0-9_-]{1,128}$/u);
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const projectBindingSchema = z.strictObject({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),
  ownerUuid: z.string().regex(/^[a-f0-9]{32}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u) });
export type FlatDisplayProjectBinding = z.infer<typeof projectBindingSchema>;
const member = z.strictObject({ uuid: identity, docType: z.string().min(1).max(128), semanticSha256: hash });
const sourceBinding = z.strictObject({ sourceSha256: hash, nativeSha256: hash });
export const flatCommonBindingSchema = z.strictObject({ project: projectBindingSchema,
  projectPath: z.string().min(1).max(4096), schematicUuid: identity, pageUuid: identity, tabId: z.string().min(1).max(512),
  operationSha256: hash, inverseSha256: hash, checkpoint: z.strictObject({ receiptPath: z.string().min(1).max(4096), receiptSha256: hash,
    checkpointSha256: hash, sourceSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash, historySemanticSha256: hash }),
  members: z.array(member).min(2).max(100_000), before: sourceBinding, after: sourceBinding,
  topology: designTopologySchema, beforeObservationSha256: hash, baselineProofSha256: hash,
});
export const flatDisplayBindingSchema = z.discriminatedUnion("profile", [
  z.strictObject({ profile: z.literal(FLAT_DISPLAY_TRANSACTION_PROFILE), ...flatCommonBindingSchema.shape }),
  z.strictObject({ profile: z.literal(FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE), ...flatCommonBindingSchema.shape, libraryHeaders: flatDisplayLibrarySealSchema }),
]).superRefine((value, context) => {
  if (new Set(value.members.map((entry) => entry.uuid)).size !== value.members.length ||
      value.members.filter((entry) => entry.uuid === value.pageUuid && entry.docType === "SCH_PAGE").length !== 1 ||
      value.members.filter((entry) => entry.uuid === value.schematicUuid && entry.docType === "SCH").length !== 1 ||
      value.tabId !== `${value.pageUuid}@${value.project.projectUuid}` || value.projectPath !== normalizeEasyedaProjectPath(value.projectPath)) {
    context.addIssue({ code: "custom", message: "Flat display binding has inconsistent membership, path or tab identity." });
  }
  const typesByUuid = new Map(value.members.map((entry) => [entry.uuid, entry.docType]));
  if (value.profile === FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE && value.libraryHeaders.documents.some((entry) =>
    typesByUuid.get(entry.documentUuid) !== entry.docType)) {
    context.addIssue({ code: "custom", message: "Imported library header seal is outside the exact saved peer membership." });
  }
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 2_097_152) {
    context.addIssue({ code: "custom", message: "Flat display binding exceeds its bounded retained-plan size." });
  }
});
export type FlatDisplayBinding = z.infer<typeof flatDisplayBindingSchema>;
/** Internal data validators are not execution authority. The caller must obtain
 * history from a maintained hash-verified checkpoint, and retain this binding
 * inside its sealed original plan before dispatch. No MCP field accepts it.
 */
export function flatDisplayProjectBindingFromHistory(history: NativeHistorySnapshot): FlatDisplayProjectBinding {
  return projectBindingSchema.parse({ projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid, branchUuid: history.branchUuid });
}

/** Fixed project-qualified local read. Recheck the original native host, bus and
 * current-project object after the await; a replacement with equal IDs is not
 * the captured ownership boundary. This expression performs no write or Save.
 */
export function buildFlatDisplayProjectGuardExpression(input: FlatDisplayProjectBinding): string {
  const binding = projectBindingSchema.parse(input);
  return `(()=>{
const binding=${JSON.stringify(binding)};
${DEVICE_NATIVE_HOST_GUARD}
const project=host.currentProject;
const check=()=>{const local=globalThis.gVars,outer=globalThis.top?.gVars;
if((local!=null&&outer!=null&&local!==outer)||(local??outer)!==host||host.messageBus!==bus||host.currentProject!==project||project?.projectId!==binding.projectUuid||project.branchUuid!==binding.branchUuid||project.isV2Format!==false||host.isHistoryMode!==false)throw new Error('FLAT_DISPLAY_PROJECT_DRIFT');};
return{check,read:async()=>{check();const metadata=(await bus.rpcCall('/PrjDB/project/getData',[binding.projectUuid])).message;check();
if(metadata?.uuid!==binding.projectUuid||metadata.owner?.uuid!==binding.ownerUuid||metadata.currentBranch!==binding.branchUuid||metadata.isV2Format!==false||metadata.archive||metadata.store||metadata.cbb_project)throw new Error('FLAT_DISPLAY_PROJECT_METADATA');
return binding;}};
})()`;
}

export function flatDisplayOperation(input: unknown): SchematicLayoutBatch {
  const operation = schematicLayoutBatchSchema.parse(input);
  if (operation.operations.some((step) => !["sch.attribute.display", "sch.text.display"].includes(step.action) ||
      !("target" in step) || !("primitiveId" in step.target))) {
    throw new Error("Flat display admits only existing stored attribute/text display steps.");
  }
  return operation;
}

export function flatDisplayContextScope(context: ExpectedContext): { projectPath: string; projectUuid: string; pageUuid: string; tabId: string } {
  const pageUuid = context.document.uuid ?? context.document.documentUuid, projectUuid = context.project.uuid ?? context.project.projectUuid;
  if (typeof projectUuid !== "string" || typeof pageUuid !== "string" ||
      (context.project.uuid !== undefined && context.project.projectUuid !== undefined && context.project.uuid !== context.project.projectUuid) ||
      (context.document.uuid !== undefined && context.document.documentUuid !== undefined && context.document.uuid !== context.document.documentUuid) ||
      context.document.documentType !== 1 || context.document.tabId !== `${pageUuid}@${projectUuid}` ||
      context.document["parentProjectUuid"] !== projectUuid || context.document["parentLibraryUuid"] !== undefined) {
    throw new Error("Flat display requires one exact project-owned ordinary page context.");
  }
  return { projectUuid, pageUuid, tabId: context.document.tabId, projectPath: normalizeEasyedaProjectPath(context.project.path) };
}

/** Validate immutable profile provenance before any runtime, upload or journal
 * change. Bare historical topology arrays never satisfy this discriminator.
 */
export function assertFlatDisplayBinding(input: unknown, operationInput: unknown, context: ExpectedContext): FlatDisplayBinding {
  const binding = flatDisplayBindingSchema.parse(input), operation = flatDisplayOperation(operationInput), scope = flatDisplayContextScope(context);
  if (sha256Json(operation) !== binding.operationSha256 || scope.projectUuid !== binding.project.projectUuid ||
      scope.projectPath !== binding.projectPath || scope.pageUuid !== binding.pageUuid || scope.tabId !== binding.tabId ||
      (context.schematic?.uuid !== undefined && context.schematic.uuid !== binding.schematicUuid) ||
      (context.schematic?.documentUuid !== undefined && context.schematic.documentUuid !== binding.schematicUuid)) {
    throw new Error("Flat display operation or context differs from its sealed binding.");
  }
  return binding;
}

export function assertFlatDisplayInverse(bindingInput: unknown, inverseInput: unknown): SchematicLayoutBatch {
  const binding = flatDisplayBindingSchema.parse(bindingInput), inverse = flatDisplayOperation(inverseInput);
  if (sha256Json(inverse) !== binding.inverseSha256) { throw new Error("Flat display inverse differs from the prepared complete inverse."); }
  return inverse;
}
