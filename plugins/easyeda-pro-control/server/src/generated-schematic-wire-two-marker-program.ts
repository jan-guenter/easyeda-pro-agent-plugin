/** A separate unmounted successor for the source-proven two-marker branch.
 * The released parser and its old generated stage bytes remain unchanged. */
import { GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION } from "./generated-schematic-wire-edit-program.ts";

const old = "const next=operation.afterBody;if(!(Math.max(next.startX,next.endX)<-20";
const replacement = 'const next=operation.afterBody;if(Math.max(Math.abs(next.endX-next.startX),Math.abs(next.endY-next.startY))<=.25)bad("TWO_MARKER_BRANCH");if(!(Math.max(next.startX,next.endX)<-20';
const oldSchema = 'schema:"easyeda-pro-control.generated-schematic-wire-edit-stage.v1"';
if (GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION.split(old).length !== 2 || GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION.split(oldSchema).length !== 2) { throw new Error("SCHEMATIC_WIRE_TWO_MARKER_ANCHOR"); }
/** Admission runs before original context discovery, Reflect.construct or
 * Modify dispatch. It adds no branch to the released parser or old purpose. */
export const GENERATED_SCHEMATIC_WIRE_TWO_MARKER_EDIT_FUNCTION = GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION.replace(old, replacement).replace(oldSchema, 'schema:"easyeda-pro-control.generated-schematic-wire-two-marker-stage.v1"');
