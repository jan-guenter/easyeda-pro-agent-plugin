/** Exact full source replies for the original fresh readonly qualification. */
import { types } from "node:util";
import { qualifyCurrentFootprintInverseInitializedGetSource } from "./current-footprint-inverse-initialized-get-source.ts";
import { qualifyCurrentFootprintInverseDeleteManagerSource } from "./current-footprint-inverse-delete-manager-source.ts";
/** Read only one own data source field, then require the complete pinned bundle
 * before any selected function metadata or lexical projection is accepted. */
export function qualifyCurrentFootprintInverseNativeDeleteQualificationSource(input: unknown, role: "ui" | "manager"): void {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null || Reflect.ownKeys(input).length !== 1) { throw new Error("INVERSE_NATIVE_QUALIFICATION_SOURCE"); }
  const field = Object.getOwnPropertyDescriptor(input, "scriptSource"); if (field === undefined || !Object.hasOwn(field, "value") || typeof field.value !== "string") { throw new Error("INVERSE_NATIVE_QUALIFICATION_SOURCE_FIELD"); }
  qualifyCurrentFootprintInverseInitializedGetSource(field.value, role); if (role === "manager") { qualifyCurrentFootprintInverseDeleteManagerSource(field.value); }
}
