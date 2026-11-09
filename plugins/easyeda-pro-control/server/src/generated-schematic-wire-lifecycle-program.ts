/** Separate fixed Wire lifecycle syntax. The v1 four-stage program and its
 * false Save fields stay immutable. No transport mounts this v2 program. */
import { z } from "zod";
import { GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION, GENERATED_SCHEMATIC_WIRE_EDIT_STAGES, generatedSchematicWireEditStageResultSchema } from "./generated-schematic-wire-edit-program.ts";

export const GENERATED_SCHEMATIC_WIRE_LIFECYCLE_STAGES = [...GENERATED_SCHEMATIC_WIRE_EDIT_STAGES, "save"] as const;
function replace(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("SCH209_WIRE_LIFECYCLE_PROGRAM_ANCHOR"); } return source.replace(before, after);
}
function build(): string {
  let source = replace(GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION, `${JSON.stringify(GENERATED_SCHEMATIC_WIRE_EDIT_STAGES)}.includes(stage)`, `${JSON.stringify(GENERATED_SCHEMATIC_WIRE_LIFECYCLE_STAGES)}.includes(stage)`);
  source = replace(source, 'schema:"easyeda-pro-control.generated-schematic-wire-edit-stage.v1"', 'schema:"easyeda-pro-control.generated-schematic-wire-lifecycle-stage.v2"');
  source = replace(source, ' bad("STAGE");', ` if(stage==="save"){
  if(!state.modifyAcknowledged||!state.observed||state.saveAttempted)bad("ORDER");state.saveAttempted=true;
  const before=capture(operation.afterBody);same(state.after,before);dispatchAttempted=true;
  const original=apply(b.save.fn,b.docApi,[]);if(Object.getPrototypeOf(original)!==Promise.prototype)bad("SAVE_PROMISE");
  const saved=await original;originalPromiseSettled=true;state.savePromiseSettled=true;check();if(saved!==true)bad("SAVE_REJECTED");
  const after=capture(operation.afterBody);same(before,after);state.saveAcknowledged=true;return receipt(true,after);
 }
 bad("STAGE");`);
  return source;
}
export const GENERATED_SCHEMATIC_WIRE_LIFECYCLE_FUNCTION = build();
export const generatedSchematicWireLifecycleStageResultSchema = z.strictObject({
  ...generatedSchematicWireEditStageResultSchema.shape,
  schema: z.literal("easyeda-pro-control.generated-schematic-wire-lifecycle-stage.v2"), stage: z.enum(GENERATED_SCHEMATIC_WIRE_LIFECYCLE_STAGES),
  saveAttempted: z.boolean(), saveAcknowledged: z.boolean(), savePromiseSettled: z.boolean(),
}).refine(value => (!value.modifyAcknowledged || value.modifyAttempted) && (!value.originalPromiseSettled || value.dispatchAttempted) &&
  (!value.ok || value.originalContextIntact) && (!value.saveAttempted || value.modifyAcknowledged) &&
  (!value.saveAcknowledged || value.saveAttempted && value.savePromiseSettled) && (!value.savePromiseSettled || value.saveAttempted) &&
  (value.stage === "save" || !value.saveAttempted) && (!value.ok || (
    (value.stage !== "preflight" || !value.dispatchAttempted && !value.originalPromiseSettled && !value.modifyAttempted && !value.modifyAcknowledged) &&
    (value.stage !== "observe" || !value.dispatchAttempted && !value.originalPromiseSettled && value.modifyAttempted && value.modifyAcknowledged) &&
    (value.stage !== "modify" || value.dispatchAttempted && value.originalPromiseSettled && value.modifyAttempted && value.modifyAcknowledged) &&
    (value.stage !== "save" || value.dispatchAttempted && value.originalPromiseSettled && value.saveAttempted && value.saveAcknowledged && value.savePromiseSettled))));
export type GeneratedSchematicWireLifecycleStageResult = z.infer<typeof generatedSchematicWireLifecycleStageResultSchema>;
