import { designOperationSchema } from "./design-operations.ts";
import { schematicOperationSchema } from "./schematic-operations.ts";
import { footprintOperationSchema } from "./footprint-action.ts";
import { modelTransformOperationSchema } from "./model-transform-action.ts";
import { getOperationValidationRegistry } from "./validation-registry.ts";
import { PCB_TEXT_LIMITATIONS } from "./pcb-text-action.ts";
import { PCB_TEXT_LIFECYCLE_LIMITATIONS } from "./pcb-text-lifecycle.ts";

/** Schema availability is not a claim that every source shape passes its
 * operation-specific native preflight or has completed a live test.
 */
export function listDesignActionCapabilities(): Record<string, unknown> {
  const actions = [
    ...designOperationSchema.options.map((entry) => entry.shape.action.value),
    ...schematicOperationSchema.options.map((entry) => entry.shape.action.value),
    ...footprintOperationSchema.options.map((entry) => entry.shape.action.value),
    ...modelTransformOperationSchema.options.map((entry) => entry.shape.action.value),
    "pcb.batch", "pcb.stack.replace", "pcb.text.create", "pcb.text.modify", "pcb.text.delete", "sch.layout.batch",
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
      schematicLayout: "type-1-only-existing-stored-attribute-and-text-display;single-ordinary-page-sealed-flat-profile;complete-native-and-durable-proof;compiled-topology-electrical-layouts-blocked",
      schematicComponentCreate: "historical-existing-project-single-part-device-unrotated-unmirrored-then-typed-pose-edit;compiled-topology-type-1-execution-blocked",
      schematicWireModify: "type-1-unlocked-existing-wire;explicit-cardinal-line-color-lineWidth-lineType;net-omitted;awaited-native-exact-segments-and-attributes;no-inverse;validation-registry:sch.wire.modify;historical-profile-validation;not-this-facade-generation;compiled-topology-type-1-execution-blocked",
      footprint: "exact-project-library-owner-and-collection-required",
      copper: "clear-derived-before-source-edit-then-explicit-rebuild",
      symbolGeometry: "existing-project-single-part-circle-rectangle-text-pin-attribute-with-exact-library-save-reopen",
      modelTransform: "exact-existing-stored-attribute-only-legacy-mil-or-affine-v2-preserving-model-binding",
      pcbText: "native-equivalent-source-merge;type-3-project-owned-existing-unlocked-standalone-STRING;top-silkscreen-default-font-left-bottom-zero-angle-nonreverse;exact-x-y-text-only;no-ATTR-or-inherited-text;synthetic-tests-not-connected-lifecycle-validation",
      pcbTextLifecycle: "one-standalone-STRING-create-or-delete;same-complete-source-profile;facade-reserved-creation-ID-sealed-before-dispatch;original-ID-only-create-inverse;delete-has-no-inverse;no-creation-regeneration-during-recovery;connected-validation-pending",
      pcbTextLimits: [...PCB_TEXT_LIMITATIONS, ...PCB_TEXT_LIFECYCLE_LIMITATIONS],
      netFlagsAndPorts: "historical-existing-kind-translation;netflag-clone-needs-loaded-template-and-checkpoint-asset-proof;other-creation-not-admitted-by-catalog-alone;compiled-topology-type-1-execution-blocked",
    },
    operationValidation: getOperationValidationRegistry(),
    liveCoverage: "Per-operation historical evidence is in operationValidation; listed schemas and historical profile coverage do not validate this facade generation or unlisted actions.",
  };
}
