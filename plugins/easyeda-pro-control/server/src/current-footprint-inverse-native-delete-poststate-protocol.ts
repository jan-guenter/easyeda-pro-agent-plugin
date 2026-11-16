/** Fixed syntax only. Actual poststate authority belongs to the original V4
 * caller/result and retained before-collateral closures in Core. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import {
  currentFootprintInverseNativeDeleteCollateralNativeFrame,
  currentFootprintInverseNativeDeleteCollateralWire,
  validateCurrentFootprintInverseNativeDeleteCollateralCommand,
} from "./current-footprint-inverse-native-delete-collateral-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteCollateralCommand } from "./current-footprint-inverse-native-delete-collateral-protocol.ts";

export type CurrentFootprintInverseNativeDeletePoststateCommand = CurrentFootprintInverseNativeDeleteCollateralCommand;
const idSchema = z.number().int().positive().max(2_147_483_647);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(value: boolean): asserts value {
  if (!value) { throw new Error("INVERSE_NATIVE_DELETE_POSTSTATE_COMMAND"); }
}
export function validateCurrentFootprintInverseNativeDeletePoststateCommand(input: unknown): CurrentFootprintInverseNativeDeletePoststateCommand {
  const command = validateCurrentFootprintInverseNativeDeleteCollateralCommand(input);
  need(command.round === "after");
  if (command.phase === "inverse-native-delete-collateral-call") {
    need(command.role === "tabReprove" || command.role === "storageReprove");
  } else if (command.phase === "inverse-native-delete-collateral-properties") {
    need(command.role === "storage");
  }
  return command;
}
export function currentFootprintInverseNativeDeletePoststateWire(input: CurrentFootprintInverseNativeDeletePoststateCommand, id: number, sessionId: string): CurrentFootprintInverseNativeDeletePoststateCommand & Readonly<{ id: number; sessionId: string; inverseNativeDeletePoststate: true }> {
  idSchema.parse(id); handle.parse(sessionId);
  return freezeDeep({ ...validateCurrentFootprintInverseNativeDeletePoststateCommand(input), id, sessionId, inverseNativeDeletePoststate: true });
}
export function currentFootprintInverseNativeDeletePoststateNativeFrame(bytes: Buffer, input: CurrentFootprintInverseNativeDeletePoststateCommand, sessionId: string): Readonly<Record<string, string | number>> {
  const command = validateCurrentFootprintInverseNativeDeletePoststateCommand(input);
  need(bytes.length <= 65_536 && bytes.at(-1) === 0);
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, -1)));
  const id = z.looseObject({ id: idSchema }).parse(raw).id;
  need(bytes.toString("utf8") === JSON.stringify(currentFootprintInverseNativeDeletePoststateWire(command, id, sessionId)) + String.fromCodePoint(0));
  const syntax = Buffer.from(JSON.stringify(currentFootprintInverseNativeDeleteCollateralWire(command, id, sessionId)) + String.fromCodePoint(0));
  return freezeDeep({ ...currentFootprintInverseNativeDeleteCollateralNativeFrame(syntax, command, sessionId), action: "footprint-inverse-native-delete-poststate" });
}
