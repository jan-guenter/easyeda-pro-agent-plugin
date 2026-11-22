/** V5 owns the packet brand; the immutable V4 programs are encoding data. */
import {currentSchematicWireWriterV4NativeCommand,validateCurrentSchematicWireWriterV4NativeCommand} from "./current-schematic-wire-writer-v4-native-command.ts";
import type {CurrentSchematicWireWriterV4NativeCommand,CurrentSchematicWireWriterV4NativePhase} from "./current-schematic-wire-writer-v4-native-command.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export type CurrentSchematicWireWriterV5NativePhase=CurrentSchematicWireWriterV4NativePhase;
export type CurrentSchematicWireWriterV5NativeCommand=Omit<CurrentSchematicWireWriterV4NativeCommand,"schematicWireWriterV4Phase">&Readonly<{schematicWireWriterV5Phase:CurrentSchematicWireWriterV5NativePhase}>;
export function currentSchematicWireWriterV5NativeCommand(phase:CurrentSchematicWireWriterV5NativePhase,binding:string,target?:unknown,value?:unknown):CurrentSchematicWireWriterV5NativeCommand{
 const {schematicWireWriterV4Phase,...data}=currentSchematicWireWriterV4NativeCommand(phase,binding,target,value);return freezeDeep({schematicWireWriterV5Phase:schematicWireWriterV4Phase,...data});
}
export function validateCurrentSchematicWireWriterV5NativeCommand(input:CurrentSchematicWireWriterV5NativeCommand):CurrentSchematicWireWriterV5NativeCommand{
  if (Object.hasOwn(input, "schematicWireWriterV4Phase")) { throw new Error("SCHEMATIC_WIRE_WRITER_V5_NATIVE_RESERVED_PHASE"); }
  const { schematicWireWriterV5Phase, ...data } = input;
  const { schematicWireWriterV4Phase, ...validated } = validateCurrentSchematicWireWriterV4NativeCommand({
    schematicWireWriterV4Phase: schematicWireWriterV5Phase, ...data,
  });
  return freezeDeep({ schematicWireWriterV5Phase: schematicWireWriterV4Phase, ...validated });
}
