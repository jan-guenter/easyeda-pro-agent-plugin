import { designOperationSchema } from "./design-operations.ts";
import { schematicOperationSchema } from "./schematic-operations.ts";
import { footprintOperationSchema } from "./footprint-action.ts";
import { modelTransformOperationSchema } from "./model-transform-action.ts";
import { getOperationValidationRegistry } from "./validation-registry.ts";

/** Schema availability is not a claim that every source shape passes its
 * operation-specific native preflight or has completed a live test.
 */
export function listDesignActionCapabilities(): Record<string, unknown> {
  const actions = [
    ...designOperationSchema.options.map((entry) => entry.shape.action.value),
    ...schematicOperationSchema.options.map((entry) => entry.shape.action.value),
    ...footprintOperationSchema.options.map((entry) => entry.shape.action.value),
    ...modelTransformOperationSchema.options.map((entry) => entry.shape.action.value),
    "pcb.batch", "pcb.stack.replace", "sch.layout.batch",
  ].toSorted();
  return {
    actions,
    execution: "typed-operation-specific-native-preflight",
    requiredRuntime: "retained-windows-job-and-authenticated-bridge",
    units: "pcb-native-mil;schematic-layout-native-10mil;explicit-mm-fields-are-mm",
    persistence: "execute-or-explicit-commit-with-complete-project-record-delta",
    inverse: "operation-dependent-no-automatic-database-restore",
    limits: { pcbBatchSteps: 256, schematicLayoutSteps: 256, exactSourceReadEscapedJsonBytes: 4_194_304, initiallyLockedBatchRecords: "preserved" },
    specialCases: {
      schematicLayout: "type-1-translation-stored-display-text-explicit-wire-label-and-loaded-checkpoint-bound-netflag-clone;preserves-bom-bindings-and-entire-compiled-topology",
      schematicComponentCreate: "existing-project-single-part-device-unrotated-unmirrored-then-typed-pose-edit",
      schematicWireModify: "type-1-unlocked-existing-wire;explicit-cardinal-line-color-lineWidth-lineType;net-omitted;awaited-native-exact-segments-and-attributes;no-inverse;validation-registry:sch.wire.modify;historical-profile-validation;not-this-facade-generation",
      footprint: "exact-project-library-owner-and-collection-required",
      copper: "clear-derived-before-source-edit-then-explicit-rebuild",
      symbolGeometry: "existing-project-single-part-circle-rectangle-text-pin-attribute-with-exact-library-save-reopen",
      modelTransform: "exact-existing-stored-attribute-only-legacy-mil-or-affine-v2-preserving-model-binding",
      netFlagsAndPorts: "existing-kind-translation;netflag-clone-needs-loaded-template-and-checkpoint-asset-proof;other-creation-not-admitted-by-catalog-alone",
    },
    operationValidation: getOperationValidationRegistry(),
    liveCoverage: "Per-operation historical evidence is in operationValidation; listed schemas and historical profile coverage do not validate this facade generation or unlisted actions.",
  };
}
